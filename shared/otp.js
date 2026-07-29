/**
 * Código de verificación por correo, sin base de datos.
 *
 * La idea: el servidor nunca guarda el código. Genera uno, lo manda por correo
 * y devuelve al navegador un *token* que lleva los datos en claro (correo y
 * caducidad) y una firma HMAC calculada sobre `datos + código`. Para verificar
 * se recalcula la firma con el código que teclea la persona: si coincide, el
 * código es el bueno.
 *
 * Qué protege, y qué no — conviene tenerlo claro:
 * · El código NO se puede leer del token: solo viaja su firma.
 * · Nadie puede fabricar un token válido sin `OTP_SECRET`.
 * · Caduca a los 10 minutos.
 * · **No limita los intentos.** Sin almacén, el servidor no puede llevar la
 *   cuenta: cualquier contador que viajara en el token lo podría reiniciar
 *   quien lo reenvíe. Esto frena el correo inventado, que es el problema real,
 *   pero no es una defensa contra fuerza bruta dedicada. Para eso, una regla
 *   de rate limiting en Cloudflare sobre /api/otp/verificar (está documentado
 *   en el README de despliegue).
 */

const enc = new TextEncoder();
export const VIDA_MS = 10 * 60 * 1000;

const aB64url = (buf) =>
  btoa(String.fromCharCode(...new Uint8Array(buf)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

const deB64url = (s) =>
  atob(s.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(s.length / 4) * 4, '='));

async function firmar(mensaje, secreto) {
  const clave = await crypto.subtle.importKey(
    'raw',
    enc.encode(secreto),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  return aB64url(await crypto.subtle.sign('HMAC', clave, enc.encode(mensaje)));
}

/** Comparación en tiempo constante: no revela por dónde falla. */
function igual(a, b) {
  if (a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i += 1) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}

/** Seis dígitos con el generador criptográfico, no con Math.random. */
export function nuevoCodigo() {
  const n = crypto.getRandomValues(new Uint32Array(1))[0] % 1000000;
  return String(n).padStart(6, '0');
}

export async function crearToken(correo, codigo, secreto) {
  const datos = aB64url(
    enc.encode(JSON.stringify({ correo: correo.toLowerCase(), exp: Date.now() + VIDA_MS })),
  );
  return `${datos}.${await firmar(`${datos}.${codigo}`, secreto)}`;
}

/** @returns {{ok: true, correo: string} | {ok: false, motivo: string}} */
export async function comprobarToken(token, codigo, secreto) {
  if (typeof token !== 'string' || !token.includes('.')) {
    return { ok: false, motivo: 'token-invalido' };
  }
  const [datos, firma] = token.split('.');

  let payload;
  try {
    payload = JSON.parse(deB64url(datos));
  } catch {
    return { ok: false, motivo: 'token-invalido' };
  }

  if (!payload?.correo || typeof payload.exp !== 'number') {
    return { ok: false, motivo: 'token-invalido' };
  }
  if (Date.now() > payload.exp) return { ok: false, motivo: 'caducado' };

  if (igual(firma, await firmar(`${datos}.${String(codigo).trim()}`, secreto))) {
    return { ok: true, correo: payload.correo };
  }
  return { ok: false, motivo: 'codigo-incorrecto' };
}
