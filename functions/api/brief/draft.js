import { DAY, TTL, json, clean, sanitizeAnswers, sanitizeSource, signToken, creatorHash, readBody, findDraft, configured } from '../../../shared/brief-recovery.js';
import { validarContactoServidor } from '../../../shared/brief-contact.js';
export async function onRequestGet({request,env}) {
  if (!configured(env)) return json({error:'config'},503);
  try {
    const bearer = request.headers.get('Authorization');
    const token = bearer?.startsWith('Bearer ') ? bearer.slice(7) : new URL(request.url).searchParams.get('token');
    const found = await findDraft(token,env);
    if (found.error) return json({error:found.error},found.status);
    const row = found.row;
    if (row.state !== 'pending') return json({error:row.state},410);
    return json({answers:JSON.parse(row.answers),source:JSON.parse(row.source),step:row.step,expiresAt:row.expires_at,reminderConsent:Boolean(row.consent),revision:row.revision});
  } catch { return json({error:'storage'},503); }
}
export async function onRequestPost({request,env}) {
  if (!configured(env)) return json({error:'config'},503);
  let body;
  try { body = await readBody(request); } catch { return json({error:'json'},400); }
  const now = Date.now(), answers = sanitizeAnswers(body?.answers), email = answers.persona.correo;
  const consent = body?.reminderConsent === true;
  if (!body?.token && !consent) return json({saved:false});
  // The signed token is sufficient authority to withdraw consent. A cleared
  // email or step must never keep a previously enabled reminder alive.
  if (body?.token && !consent) {
    try {
      const found = await findDraft(body.token,env);
      if (found.error) return json({error:found.error},found.status);
      await env.BRIEF_DB.prepare("UPDATE brief_drafts SET consent = 0, state = CASE WHEN state = 'completed' THEN state ELSE 'cancelled' END, answers = '{}', source = '{}' WHERE id = ?").bind(found.row.id).run();
      const confirmed = await env.BRIEF_DB.prepare('SELECT consent FROM brief_drafts WHERE id = ?').bind(found.row.id).first();
      return confirmed?.consent === 0 ? json({cancelled:true}) : json({error:'persist'},503);
    } catch { return json({error:'storage'},503); }
  }
  try {
    const validation = await validarContactoServidor(answers,env);
    if (validation.error) return json({error:validation.error,mensaje:validation.mensaje},validation.status);
  } catch { return json({error:'storage'},503); }
  const step = clean(body?.step,80);
  if (!step) return json({error:'step'},400);
  try {
    if (body.token) {
      const found = await findDraft(body.token,env);
      if (found.error) return json({error:found.error},found.status);
      const row = found.row;
      if (row.state === 'completed') return json({error:'completed',saved:true},410);
      if (row.state !== 'pending') return json({error:row.state},410);
      if (row.reminder_started_at && row.email !== email) return json({error:'email_locked'},409);
      const changed = await env.BRIEF_DB.prepare("UPDATE brief_drafts SET email = ?, answers = ?, source = ?, step = ?, updated_at = ?, revision = revision + 1 WHERE id = ? AND state = 'pending' AND (claim IS NULL OR claim_at < ?)").bind(email,JSON.stringify(answers),JSON.stringify(sanitizeSource(body.source)),step,now,row.id,now-5*60000).run();
      if (!changed.meta.changes) return json({error:'busy'},409);
      return json({token:body.token,expiresAt:row.expires_at,revision:row.revision+1});
    }
    if (typeof body.clientId !== 'string' || !/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/.test(body.clientId)) return json({error:'client_id'},400);
    const existing = await env.BRIEF_DB.prepare('SELECT id,email,expires_at,state,revision FROM brief_drafts WHERE client_id = ?').bind(body.clientId).first();
    if (existing) {
      if (existing.email !== email) return json({error:'client_id'},409);
      if (existing.state !== 'pending' || existing.expires_at <= now) return json({error:'expired'},410);
      return json({token:await signToken(existing.id,existing.expires_at,env.BRIEF_RECOVERY_SECRET),expiresAt:existing.expires_at,revision:existing.revision});
    }
    const hash = await creatorHash(request,env.BRIEF_RECOVERY_SECRET);
    const count = await env.BRIEF_DB.prepare('SELECT SUM(CASE WHEN email = ? THEN 1 ELSE 0 END) AS emails, SUM(CASE WHEN creator_hash = ? THEN 1 ELSE 0 END) AS ips FROM brief_drafts WHERE created_at >= ? AND (email = ? OR creator_hash = ?)').bind(email,hash,now-DAY,email,hash).first();
    if (count.emails >= 3 || count.ips >= 20) return json({error:'rate_limit'},429);
    const id = crypto.randomUUID();
    const expires = answers.contacto.tipo === 'personal'
      ? Math.min(now+TTL, Number(answers.contacto.verificationProof.split('.')[1])) : now+TTL;
    await env.BRIEF_DB.prepare('INSERT INTO brief_drafts (id,client_id,email,answers,source,step,consent,created_at,updated_at,expires_at,creator_hash) VALUES (?,?,?,?,?,?,1,?,?,?,?) ON CONFLICT(client_id) DO NOTHING').bind(id,body.clientId,email,JSON.stringify(answers),JSON.stringify(sanitizeSource(body.source)),step,now,now,expires,hash).run();
    const created = await env.BRIEF_DB.prepare('SELECT id,email,expires_at,state,revision FROM brief_drafts WHERE client_id = ?').bind(body.clientId).first();
    if (!created || created.email !== email) return json({error:'client_id'},409);
    if (created.state !== 'pending' || created.expires_at <= now) return json({error:'expired'},410);
    return json({token:await signToken(created.id,created.expires_at,env.BRIEF_RECOVERY_SECRET),expiresAt:created.expires_at,revision:created.revision});
  } catch { return json({error:'storage'},503); }
}
