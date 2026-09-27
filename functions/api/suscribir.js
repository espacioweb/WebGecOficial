// POST /api/suscribir — captura el correo de "Suscribirme" en la sección
// Comunidad de Inside Your Brand (IYB-06) y avisa a Telegram. Mismo patrón
// que /api/brief: sin base de datos propia, el worker de Telegram ya
// existente hace de bandeja de entrada.

const NOTIFY_URL = 'https://palabras-gec.operaciones-659.workers.dev/notify';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const json = (datos, status = 200) =>
  new Response(JSON.stringify(datos), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });

export async function onRequestPost({ request }) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'json' }, 400);
  }

  const correo = String(body?.correo || '').trim().slice(0, 160);
  if (!EMAIL_RE.test(correo)) {
    return json({ error: 'correo' }, 400);
  }

  const mensaje = `📬 *NUEVA SUSCRIPCIÓN* — Inside Your Brand

📧 ${correo}

_Grupo Espacio Creativo · comunidad Inside Your Brand_`;

  try {
    await fetch(NOTIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'custom', message: mensaje }),
    });
  } catch (e) {
    console.error('Aviso a Telegram falló', e);
  }

  return json({ ok: true });
}
