import { comprobarToken } from '../../../shared/otp.js';

const json = (datos, status = 200) =>
  new Response(JSON.stringify(datos), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });

const NOTIFY_URL = 'https://palabras-gec.operaciones-659.workers.dev/notify';

const MOTIVOS = {
  'codigo-incorrecto': 'Ese código no es correcto.',
  'sin-intentos': 'Se acabaron los intentos. Pide un código nuevo.',
  caducado: 'El código caducó. Pide uno nuevo.',
  'token-invalido': 'Algo se perdió por el camino. Pide un código nuevo.',
};

const limpio = (v, max = 120) => String(v || '').trim().slice(0, max);

export async function onRequestPost({ request, env }) {
  if (!env.OTP_SECRET) {
    return json({ error: 'config', mensaje: 'El verificador aún no está configurado.' }, 500);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'json' }, 400);
  }

  const revision = await comprobarToken(body?.token, body?.codigo, env.OTP_SECRET);
  if (!revision.ok) {
    const base = MOTIVOS[revision.motivo] || 'No pudimos verificar el código.';
    return json(
      {
        error: revision.motivo,
        mensaje:
          revision.restantes > 0 ? `${base} Te queda ${revision.restantes} intento.` : base,
        // Token con el contador subido: el cliente tiene que usar este para el
        // siguiente intento, o se le agotarán igualmente.
        token: revision.token,
        restantes: revision.restantes ?? 0,
      },
      400,
    );
  }

  // Aviso a Telegram solo DESPUÉS de verificar: antes llegaba un aviso por cada
  // formulario enviado, con correos que podían no existir.
  const d = body?.datos || {};
  const mensaje = `🔓 *ACCESO GEC IA* — correo verificado ✅

👤 ${limpio(d.nombre)}
🏢 ${limpio(d.empresa)} — ${limpio(d.cargo)}
📧 ${revision.correo}
📱 ${limpio(d.telefono, 40)}

🗂️ Área: *${limpio(d.areaLabel, 60)}*
🚪 Punto de partida: *${limpio(d.puertaLabel, 60)}*

_Grupo Espacio Creativo · módulo interno_`;

  try {
    await fetch(NOTIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'custom', message: mensaje }),
    });
  } catch (e) {
    // Que falle el aviso no puede dejar fuera a quien ya verificó su correo.
    console.error('Aviso a Telegram falló', e);
  }

  return json({ ok: true, correo: revision.correo });
}
