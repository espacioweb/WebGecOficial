export const DAY = 86400000;
export const TTL = 14 * DAY;
const encoder = new TextEncoder();
export const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer' },
});
export const clean = (value, max = 1000) => typeof value === 'string' ? value.trim().slice(0, max) : '';
export const emailOf = (answers) => clean(answers?.persona?.correo, 254).toLowerCase();
export const validEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
export function sanitizeAnswers(raw) {
  const result = {};
  for (const key of ['orientacionTexto','prioridad','necesidad','necesidadOtra','logro','logroOtro','etapa','tiempo','inversion']) result[key] = clean(raw?.[key]);
  result.areas = Array.isArray(raw?.areas) ? raw.areas.filter((v) => ['marketing','studio','educa','soluciona','experience','orientacion'].includes(v)).slice(0,6) : [];
  result.empresa = {};
  for (const key of ['nombre','sector','ubicacion','tamano','web']) result.empresa[key] = clean(raw?.empresa?.[key]);
  result.persona = {};
  for (const key of ['nombre','cargo','rol','correo','pais','telefono','canal']) result.persona[key] = clean(raw?.persona?.[key], key === 'correo' ? 254 : 200);
  result.persona.correo = emailOf(raw);
  result.consentimiento = raw?.consentimiento === true;
  return result;
}
export function sanitizeSource(raw) {
  const utm = {};
  for (const key of ['utm_source','utm_medium','utm_campaign','utm_term','utm_content']) if (raw?.utm?.[key]) utm[key] = clean(raw.utm[key],200);
  // Never persist a recovery token in a URL, query string or fragment.
  const url = clean(raw?.url,1000).split(/[?#]/)[0];
  return { pilar: clean(raw?.pilar,60), tema: clean(raw?.tema,160), utm, url };
}
async function key(secret) {
  return crypto.subtle.importKey('raw',encoder.encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign','verify']);
}
const toHex = (buffer) => Array.from(new Uint8Array(buffer),(v) => v.toString(16).padStart(2,'0')).join('');
export async function signToken(id, expires, secret) {
  const payload = `${id}.${expires}`;
  return `${payload}.${toHex(await crypto.subtle.sign('HMAC',await key(secret),encoder.encode(payload)))}`;
}
export async function tokenData(token, secret) {
  if (typeof token !== 'string' || !secret || !/^[a-f0-9-]{36}\.\d{13}\.[a-f0-9]{64}$/.test(token)) return null;
  const [id,expires,sig] = token.split('.');
  const bytes = Uint8Array.from(sig.match(/../g),(v) => parseInt(v,16));
  if (!await crypto.subtle.verify('HMAC',await key(secret),bytes,encoder.encode(`${id}.${expires}`))) return null;
  return { id, expires: Number(expires) };
}
export async function secretMatches(value, secret) {
  if (!value || !secret) return false;
  const signature = await crypto.subtle.sign('HMAC',await key(secret),encoder.encode(secret));
  return crypto.subtle.verify('HMAC',await key(secret),signature,encoder.encode(value));
}
export async function creatorHash(request, secret) {
  return toHex(await crypto.subtle.sign('HMAC',await key(secret),encoder.encode(request.headers.get('CF-Connecting-IP') || 'unknown')));
}
export async function readBody(request) {
  const reader = request.body?.getReader();
  if (!reader) throw new Error('body');
  let size = 0;
  const chunks = [];
  while (true) {
    const {done,value} = await reader.read();
    if (done) break;
    size += value.length;
    if (size > 24000) { await reader.cancel(); throw new Error('large'); }
    chunks.push(value);
  }
  const buffer = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { buffer.set(chunk,offset); offset += chunk.length; }
  return JSON.parse(new TextDecoder().decode(buffer));
}
export async function findDraft(token, env) {
  const data = await tokenData(token, env.BRIEF_RECOVERY_SECRET);
  if (!data) return { error: 'token', status: 401 };
  const row = await env.BRIEF_DB.prepare('SELECT * FROM brief_drafts WHERE id = ?').bind(data.id).first();
  if (!row || row.expires_at !== data.expires || data.expires <= Date.now()) return {error:'expired',status:410};
  return {row};
}
export const configured = (env) => Boolean(env.BRIEF_DB && env.BRIEF_RECOVERY_SECRET);
export async function completeDraft(token, email, env) {
  if (!configured(env)) return {error:'config',status:503};
  const found = await findDraft(token,env);
  if (found.error) return found;
  if (found.row.email !== clean(email,254).toLowerCase()) return {error:'correo',status:409};
  if (found.row.state === 'cancelled') return {error:'cancelled',status:410};
  // Retain the lead until TTL even when the notification provider fails.
  // Completion stops reminders immediately; the browser may retry delivery.
  await env.BRIEF_DB.prepare("UPDATE brief_drafts SET state = 'completed', consent = 0, claim = NULL, claim_at = NULL WHERE id = ? AND state != 'cancelled'").bind(found.row.id).run();
  const confirmed = await env.BRIEF_DB.prepare('SELECT state FROM brief_drafts WHERE id = ?').bind(found.row.id).first();
  return confirmed?.state === 'completed' ? {} : {error:'persist',status:503};
}
