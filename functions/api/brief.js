// POST /api/brief — recibe el brief empresarial (B-01 a B-04) y avisa a
// Telegram. La clasificación (B-05: "nunca mostrar al cliente") se calcula
// aquí, server-side, para que nunca viaje de vuelta al navegador.

const NOTIFY_URL = 'https://palabras-gec.operaciones-659.workers.dev/notify';

const NOMBRE_PILAR = {
  marketing: 'Marketing',
  studio: 'Studio',
  educa: 'Educa',
  soluciona: 'Soluciona',
  experience: 'Experience',
};

const limpio = (v, max = 160) => String(v || '').trim().slice(0, max);

// Compara los textos literales de ETAPAS/TIEMPOS de src/pages/BriefPage.jsx —
// si cambian allá hay que cambiarlos aquí. Las etapas son las de octubre 2026
// (antes: Exploración / Necesidad clara / Evaluación / Listo para iniciar…).
function clasificar(etapa, tiempo) {
  if (etapa === 'Necesito comenzar pronto' && (tiempo === '30 días' || tiempo === '1 a 3 meses')) return 'Prioritaria';
  if (etapa === 'Quiero evaluar una solución') return 'En evaluación';
  return 'Para desarrollar';
}

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

  const empresa = body?.empresa || {};
  const persona = body?.persona || {};
  const fuente = body?.fuente || {};
  const areas = Array.isArray(body?.areas) ? body.areas : [];
  const prioridad = body?.prioridad;
  const clasificacion = clasificar(body?.etapa, body?.tiempo);

  const complementarias = areas
    .filter((a) => a !== prioridad && a !== 'orientacion')
    .map((a) => NOMBRE_PILAR[a] || a)
    .join(', ');

  const utm = fuente.utm && Object.keys(fuente.utm).length ? Object.entries(fuente.utm).map(([k, v]) => `${k}=${v}`).join(' · ') : '—';

  const mensaje = `📋 *NUEVO BRIEF* — ${clasificacion}

👤 ${limpio(persona.nombre)} — ${limpio(persona.cargo)}
🏢 ${limpio(empresa.nombre)} (${limpio(empresa.sector)}, ${limpio(empresa.ubicacion)}, ${limpio(empresa.tamano)})
🌐 ${limpio(empresa.web) || '—'}
📧 ${limpio(persona.correo)}
📱 ${limpio(persona.telefono, 40)}
💬 Prefiere: ${limpio(persona.canal)} · Rol: ${limpio(persona.rol)}

🗂️ Pilar recomendado: *${NOMBRE_PILAR[prioridad] || 'Orientación'}*
📝 Necesidad: ${limpio(body?.necesidad, 300)}
🎯 Quiere lograr: ${limpio(body?.logro) || '—'}
➕ También le sirve: ${complementarias || '—'}

📈 Etapa: ${limpio(body?.etapa)} · Tiempo: ${limpio(body?.tiempo)} · Inversión: ${limpio(body?.inversion)}

🔗 Fuente: pilar=${limpio(fuente.pilar) || '—'} tema=${limpio(fuente.tema) || '—'}
📊 UTM: ${utm}

_Grupo Espacio Creativo · brief empresarial_`;

  try {
    await fetch(NOTIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'custom', message: mensaje }),
    });
  } catch (e) {
    // Igual que en otp/verificar: que falle el aviso no puede bloquear al
    // usuario, que ya completó su parte.
    console.error('Aviso a Telegram falló', e);
  }

  return json({ ok: true });
}
