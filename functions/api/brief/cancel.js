import {json,readBody,findDraft,configured} from '../../../shared/brief-recovery.js';
export async function onRequestPost({request,env}) {
  if (!configured(env)) return json({error:'config'},503);
  let body;
  try { body = await readBody(request); } catch { return json({error:'json'},400); }
  try {
    const found = await findDraft(body?.token,env);
    if (found.error) return json({error:found.error},found.status);
    await env.BRIEF_DB.prepare("UPDATE brief_drafts SET state = CASE WHEN state = 'completed' THEN state ELSE 'cancelled' END, consent = 0, answers = '{}', source = '{}' WHERE id = ?").bind(found.row.id).run();
    const row = await env.BRIEF_DB.prepare('SELECT consent FROM brief_drafts WHERE id = ?').bind(found.row.id).first();
    return row?.consent === 0 ? json({ok:true}) : json({error:'persist'},503);
  } catch { return json({error:'storage'},503); }
}
