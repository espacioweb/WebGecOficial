import { validarContactoBrief } from '../src/data/brief-contact.js';
import { configured, tokenData, clean, emailOf } from './brief-recovery.js';
export const CODE_TTL = 10 * 60000;
export const COOLDOWN = 60000;
export const OTP_SCOPE = ':brief-otp';
export const PROOF_SCOPE = ':brief-email';
export async function codeHash(id, code, secret) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret + OTP_SCOPE), {name:'HMAC',hash:'SHA-256'}, false, ['sign']);
  const hash = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${id}.${code}`));
  return Array.from(new Uint8Array(hash), (v) => v.toString(16).padStart(2,'0')).join('');
}
export async function validarContactoServidor(answers, env) {
  const basic = validarContactoBrief(answers);
  if (!basic.ok) return {error:'contacto',mensaje:basic.motivo,status:400};
  if ((answers?.contacto?.tipo || 'corporativo') === 'corporativo') return {};
  if (!configured(env)) return {error:'config',status:503};
  const data = await tokenData(clean(answers?.contacto?.verificationProof, 200), env.BRIEF_RECOVERY_SECRET + PROOF_SCOPE);
  if (!data || data.expires <= Date.now()) return {error:'verificacion',mensaje:'Verifica de nuevo tu correo para continuar.',status:401};
  const row = await env.BRIEF_DB.prepare('SELECT email,verified_at,verified_until FROM brief_email_challenges WHERE id = ?').bind(data.id).first();
  if (!row?.verified_at || row.verified_until !== data.expires || row.email !== emailOf(answers)) return {error:'verificacion',mensaje:'Verifica de nuevo tu correo para continuar.',status:401};
  return {};
}
