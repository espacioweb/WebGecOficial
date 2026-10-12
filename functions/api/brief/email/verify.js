import { json, readBody, tokenData, signToken, TTL, configured } from '../../../../shared/brief-recovery.js';
import { codeHash, OTP_SCOPE, PROOF_SCOPE } from '../../../../shared/brief-contact.js';
export async function onRequestPost({ request, env }) {
  if (!configured(env)) return json({error:'config'},503);
  let body;
  try { body = await readBody(request); } catch { return json({error:'json'},400); }
  try {
    const data = await tokenData(body?.token, env.BRIEF_RECOVERY_SECRET + OTP_SCOPE), now = Date.now();
    if (!data) return json({error:'token',mensaje:'Pide un código nuevo.'},401);
    const row = await env.BRIEF_DB.prepare('SELECT * FROM brief_email_challenges WHERE id = ?').bind(data.id).first();
    if (!row || row.expires_at !== data.expires || !row.delivered) return json({error:'token',mensaje:'Pide un código nuevo.'},401);
    if (row.verified_at) return json({error:'usado',mensaje:'Este código ya se utilizó. Pide uno nuevo.'},409);
    if (data.expires <= now) return json({error:'caducado',mensaje:'El código caducó. Pide uno nuevo.'},410);
    if (row.attempts >= 5) return json({error:'sin_intentos',mensaje:'Se agotaron los intentos. Pide un código nuevo.'},429);
    const code = typeof body?.codigo === 'string' ? body.codigo.trim() : '';
    const candidate = await codeHash(data.id, /^\d{6}$/.test(code) ? code : 'invalid', env.BRIEF_RECOVERY_SECRET);
    const expires = now + TTL;
    // Comparing and advancing the attempt count is atomic; replay cannot reset it.
    const changed = await env.BRIEF_DB.prepare(`UPDATE brief_email_challenges SET attempts = attempts + 1,
      verified_at = CASE WHEN code_hash = ? THEN ? ELSE NULL END,
      verified_until = CASE WHEN code_hash = ? THEN ? ELSE NULL END
      WHERE id = ? AND attempts < 5 AND verified_at IS NULL AND expires_at > ? AND delivered = 1`)
      .bind(candidate,now,candidate,expires,data.id,now).run();
    if (!changed.meta.changes) {
      const latest = await env.BRIEF_DB.prepare('SELECT verified_at FROM brief_email_challenges WHERE id = ?').bind(data.id).first();
      return json({error:latest?.verified_at ? 'usado' : 'sin_intentos',mensaje:'El código ya se utilizó o se agotaron los intentos. Pide uno nuevo.'},latest?.verified_at ? 409 : 429);
    }
    const result = await env.BRIEF_DB.prepare('SELECT attempts,verified_at,verified_until FROM brief_email_challenges WHERE id = ?').bind(data.id).first();
    // Only this request's correct candidate can receive the proof.
    if (candidate !== row.code_hash) return json({error:result.attempts >= 5 ? 'sin_intentos' : 'codigo',mensaje:result.attempts >= 5 ? 'Se agotaron los intentos. Pide un código nuevo.' : 'Ese código no es correcto.',restantes:Math.max(0,5-result.attempts)},result.attempts >= 5 ? 429 : 400);
    return json({ok:true,correo:row.email,verificationProof:await signToken(data.id,result.verified_until,env.BRIEF_RECOVERY_SECRET + PROOF_SCOPE)});
  } catch { return json({error:'verificacion',mensaje:'No pudimos verificar el código. Inténtalo otra vez.'},503); }
}
