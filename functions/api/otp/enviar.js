import { crearToken, nuevoCodigo, VIDA_MS } from '../../../shared/otp.js';
import { validarCorreoEmpresarial } from '../../../src/data/paises.js';

const json = (datos, status = 200) =>
  new Response(JSON.stringify(datos), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });

const REMITENTE = 'GEC IA <no-reply@updates.grupoespaciocreativo.com>';

const plantilla = (codigo, nombre) => `
<!doctype html>
<html lang="es"><body style="margin:0;padding:0;background:#F3F0EA;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F3F0EA;padding:32px 16px">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#fff;border-radius:18px;overflow:hidden;box-shadow:0 12px 32px rgba(16,23,32,.08)">
        <tr><td style="height:5px;background:#12B0A0"></td></tr>
        <tr><td style="padding:34px 34px 8px">
          <p style="margin:0 0 6px;font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:#0F6F63;font-weight:700">Grupo Espacio Creativo</p>
          <h1 style="margin:0 0 14px;font-size:23px;line-height:1.2;color:#101720;letter-spacing:-.02em">Tu código de acceso</h1>
          <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:rgba(20,24,31,.66)">
            ${nombre ? `Hola ${nombre}, e` : 'E'}scribe este código para abrir el catálogo del módulo GEC IA.
          </p>
        </td></tr>
        <tr><td align="center" style="padding:0 34px 26px">
          <div style="display:inline-block;padding:16px 26px;background:#F3F0EA;border-radius:14px">
            <span style="font-size:34px;font-weight:800;letter-spacing:.24em;color:#101720">${codigo}</span>
          </div>
        </td></tr>
        <tr><td style="padding:0 34px 34px">
          <p style="margin:0;font-size:13px;line-height:1.6;color:rgba(20,24,31,.5)">
            Caduca en 90 segundos, así que úsalo enseguida. Si no lo pediste, ignora este correo.
          </p>
        </td></tr>
      </table>
      <p style="margin:18px 0 0;font-size:11.5px;color:rgba(20,24,31,.4)">Grupo Espacio Creativo · Tegucigalpa, Honduras</p>
    </td></tr>
  </table>
</body></html>`;

export async function onRequestPost({ request, env }) {
  if (!env.RESEND_API_KEY || !env.OTP_SECRET) {
    return json({ error: 'config', mensaje: 'El verificador aún no está configurado.' }, 500);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'json' }, 400);
  }

  // El correo se vuelve a validar aquí: la comprobación del navegador es
  // comodidad para quien rellena, no una barrera — se salta con dos clics.
  const correo = String(body?.correo || '').trim();
  const revision = validarCorreoEmpresarial(correo);
  if (!revision.ok) return json({ error: 'correo', mensaje: revision.motivo }, 400);

  const codigo = nuevoCodigo();
  const nombre = String(body?.nombre || '').trim().split(' ')[0].slice(0, 40);

  const envio = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: REMITENTE,
      to: [correo],
      subject: `${codigo} es tu código para el catálogo GEC IA`,
      html: plantilla(codigo, nombre),
    }),
  });

  if (!envio.ok) {
    const detalle = await envio.text();
    // El detalle va al log de Cloudflare, no al navegador: puede traer datos
    // de la cuenta de Resend.
    console.error('Resend falló', envio.status, detalle);
    return json(
      { error: 'envio', mensaje: 'No pudimos enviar el código. Revisa el correo e inténtalo otra vez.' },
      502,
    );
  }

  return json({
    ok: true,
    token: await crearToken(correo, codigo, env.OTP_SECRET),
    // La cuenta atrás del formulario sale de aquí: así el plazo vive en un
    // único sitio y no hay dos números que se puedan desincronizar.
    segundos: Math.floor(VIDA_MS / 1000),
  });
}
