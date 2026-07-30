/**
 * Código de verificación por correo, sin base de datos.
 *
 * La idea: el servidor nunca guarda el código. Genera uno, lo manda por correo
 * y devuelve al navegador un *token* que lleva los datos en claro (correo y
 * caducidad) y una firma HMAC calculada sobre `datos + código`. Para verificar
 * se recalcula la firma con el código que teclea la persona: si coincide, el
 * código es el bueno.
 *
 * El token va en dos firmas, y la razón importa:
 *
 *   token = datos . firmaCodigo . intentos . firmaIntentos
 *
 * · `firmaCodigo` = HMAC(datos + código). Es la que valida el código, y el
 *   servidor no puede recalcularla sin el código: por eso nunca cambia.
 * · `firmaIntentos` = HMAC(datos + firmaCodigo + intentos). Esta sí la puede
 *   recalcular el servidor cuando quiera, y es lo que permite **reemitir el
 *   token con el contador subido** después de cada fallo. Sin separarlas, el
 *   contador era imposible: subirlo obligaba a refirmar con el código.
 *
 * Qué protege, y qué no — conviene tenerlo claro:
 * · El código NO se puede leer del token: solo viaja su firma.
 * · Nadie puede fabricar un token válido, ni bajar el contador, sin `OTP_SECRET`.
 * · Caduca a **90 segundos** y admite **2 intentos**.
 * · **Replay:** quien guarde una copia del token anterior puede volver a
 *   presentarlo con el contador a cero. El límite de 2 intentos es real para el
 *   uso normal (frena el dedo torpe), pero un atacante decidido tiene tantos
 *   intentos como quepan en la ventana de 1 minuto. Lo que cierra esa puerta de
 *   verdad es la regla de rate limiting en Cloudflare sobre /api/otp/verificar,
 *   documentada en functions/README.md. Con 90 s de ventana, además, el margen
 *   para intentarlo es minúsculo.
 */

const enc = new TextEncoder();
// 90 segundos. Es una ventana corta a propósito: hay que recibir el correo,
// abrirlo y volver. Si empieza a bloquear a gente legítima —sobre todo en el
// teléfono, al cambiar de app— este es el número que hay que subir.
export const VIDA_MS = 90 * 1000;
export const MAX_INTENTOS = 2;

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

/** Arma el token completo a partir de sus piezas. */
async function ensamblar(datos, firmaCodigo, intentos, secreto) {
  const firmaIntentos = await firmar(`${datos}.${firmaCodigo}.${intentos}`, secreto);
  return `${datos}.${firmaCodigo}.${intentos}.${firmaIntentos}`;
}

export async function crearToken(correo, codigo, secreto) {
  const datos = aB64url(
    enc.encode(JSON.stringify({ correo: correo.toLowerCase(), exp: Date.now() + VIDA_MS })),
  );
  return ensamblar(datos, await firmar(`${datos}.${codigo}`, secreto), 0, secreto);
}

/**
 * @returns {{ok: true, correo: string}
 *         | {ok: false, motivo: string, restantes?: number, token?: string}}
 * Cuando falla por código incorrecto devuelve un token nuevo con el contador
 * subido: el cliente debe usar ESE en el siguiente intento.
 */
export async function comprobarToken(token, codigo, secreto) {
  const partes = typeof token === 'string' ? token.split('.') : [];
  if (partes.length !== 4) return { ok: false, motivo: 'token-invalido' };
  const [datos, firmaCodigo, intentosTxt, firmaIntentos] = partes;

  // El contador va firmado aparte: si no cuadra, alguien lo tocó a mano.
  if (!igual(firmaIntentos, await firmar(`${datos}.${firmaCodigo}.${intentosTxt}`, secreto))) {
    return { ok: false, motivo: 'token-invalido' };
  }

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

  const intentos = Number(intentosTxt);
  if (!Number.isInteger(intentos) || intentos < 0) return { ok: false, motivo: 'token-invalido' };
  if (intentos >= MAX_INTENTOS) return { ok: false, motivo: 'sin-intentos' };

  if (igual(firmaCodigo, await firmar(`${datos}.${String(codigo).trim()}`, secreto))) {
    return { ok: true, correo: payload.correo };
  }

  const usados = intentos + 1;
  return {
    ok: false,
    motivo: usados >= MAX_INTENTOS ? 'sin-intentos' : 'codigo-incorrecto',
    restantes: MAX_INTENTOS - usados,
    token: await ensamblar(datos, firmaCodigo, usados, secreto),
  };
}
