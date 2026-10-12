import {DAY,json,secretMatches,signToken,configured} from '../../../shared/brief-recovery.js';
const FROM = 'Grupo Espacio Creativo <no-reply@updates.grupoespaciocreativo.com>';
export async function onRequestPost({request,env}) {
  if (!configured(env) || !env.RESEND_API_KEY) return json({error:'config'},503);
  if (!await secretMatches(request.headers.get('Authorization')?.replace(/^Bearer /,''),env.BRIEF_RECOVERY_SECRET)) return json({error:'auth'},401);
  const now = Date.now();
  // A short delay is accepted only in an explicitly isolated preview deployment.
  const preview = env.BRIEF_SITE_URL?.includes('.pages.dev');
  const delay = preview && env.BRIEF_REMINDER_DELAY_MS ? Math.max(60000,Number(env.BRIEF_REMINDER_DELAY_MS) || DAY) : DAY;
  let sent = 0, failed = 0;
  try {
    await env.BRIEF_DB.prepare('DELETE FROM brief_drafts WHERE expires_at <= ?').bind(now).run();
    const due = await env.BRIEF_DB.prepare("SELECT * FROM brief_drafts WHERE state = 'pending' AND consent = 1 AND updated_at <= ? AND expires_at > ? AND reminder_sent_at IS NULL AND (claim IS NULL OR claim_at < ?) AND (reminder_started_at IS NULL OR reminder_started_at > ?) ORDER BY updated_at LIMIT 20").bind(now-delay,now,now-5*60000,now-23*3600000).all();
    for (const row of due.results) {
      if (env.BRIEF_TEST_RECIPIENT && row.email !== env.BRIEF_TEST_RECIPIENT.trim().toLowerCase()) continue;
      const claim = crypto.randomUUID();
      const claimed = await env.BRIEF_DB.prepare("UPDATE brief_drafts SET claim = ?, claim_at = ?, reminder_started_at = COALESCE(reminder_started_at,?), reminder_email = COALESCE(reminder_email,email) WHERE id = ? AND state = 'pending' AND consent = 1 AND updated_at = ? AND reminder_sent_at IS NULL AND (claim IS NULL OR claim_at < ?)").bind(claim,now,now,row.id,row.updated_at,now-5*60000).run();
      if (!claimed.meta.changes) continue;
      const fresh = await env.BRIEF_DB.prepare("SELECT * FROM brief_drafts WHERE id = ? AND claim = ? AND state = 'pending' AND consent = 1 AND updated_at = ? AND expires_at > ?").bind(row.id,claim,row.updated_at,now).first();
      if (!fresh) {
        await env.BRIEF_DB.prepare('UPDATE brief_drafts SET claim = NULL, claim_at = NULL WHERE id = ? AND claim = ?').bind(row.id,claim).run();
        continue;
      }
      try {
        const token = await signToken(row.id,row.expires_at,env.BRIEF_RECOVERY_SECRET);
        const origin = env.BRIEF_SITE_URL || 'https://grupoespaciocreativo.com';
        const continueUrl = `${origin}/cuentanos-tu-reto/#continuar=${token}`;
        const cancelUrl = `${origin}/cuentanos-tu-reto/#cancelar=${token}`;
        const response = await fetch('https://api.resend.com/emails', {
          method:'POST', headers:{Authorization:`Bearer ${env.RESEND_API_KEY}`,'Content-Type':'application/json','Idempotency-Key':`brief-reminder/${row.id}`},
          body:JSON.stringify({from:FROM,to:[fresh.reminder_email],subject:'Continúa contándonos qué necesita tu empresa',
            text:`Te quedó pendiente contarnos qué necesita tu empresa. Guardamos tus respuestas para que puedas continuar desde donde lo dejaste. Nos ayudarán a proponerte una solución más adecuada.\n\nContinuar mis respuestas: ${continueUrl}\n\nGuardamos tu avance durante 14 días desde que comenzaste. Si ya no deseas continuar, cancela el guardado: ${cancelUrl}`,
            html:`<div style="font-family:Arial,sans-serif;background:#f4f2ed;padding:32px"><div style="max-width:520px;margin:auto;background:white;padding:32px;border-radius:18px"><p style="color:#666">GRUPO ESPACIO CREATIVO</p><h1 style="color:#101720;font-size:26px">Tu reto quedó pendiente</h1><p style="line-height:1.7">Te quedó pendiente contarnos qué necesita tu empresa. Guardamos tus respuestas para que puedas continuar desde donde lo dejaste. Nos ayudarán a proponerte una solución más adecuada.</p><p><a href="${continueUrl}" style="display:inline-block;background:#F5B301;color:#101720;padding:16px 24px;border-radius:30px;text-decoration:none;font-weight:bold">Continuar mis respuestas</a></p><p style="font-size:13px;color:#666">Guardamos tu avance durante 14 días desde que comenzaste. <a href="${cancelUrl}" style="color:#515961">Cancelar guardado y recordatorios</a></p></div></div>`}),
          signal:AbortSignal.timeout(15000),
        });
        if (!response.ok) throw new Error('provider');
        const accepted = await response.json();
        if (!accepted.id) throw new Error('provider');
        await env.BRIEF_DB.prepare('UPDATE brief_drafts SET reminder_sent_at = ?, claim = NULL, claim_at = NULL WHERE id = ? AND claim = ?').bind(Date.now(),row.id,claim).run();
        sent++;
      } catch {
        failed++;
        await env.BRIEF_DB.prepare('UPDATE brief_drafts SET claim = NULL, claim_at = NULL WHERE id = ? AND claim = ?').bind(row.id,claim).run();
      }
    }
    return json({ok:failed===0,sent,failed},failed ? 502 : 200);
  } catch { return json({error:'storage'},503); }
}
