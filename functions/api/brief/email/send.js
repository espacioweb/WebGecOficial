import { nuevoCodigo } from '../../../../shared/otp.js';
import { validarContactoBrief } from '../../../../src/data/brief-contact.js';
import { DAY, json, readBody, sanitizeAnswers, creatorHash, signToken, configured } from '../../../../shared/brief-recovery.js';
import { codeHash, CODE_TTL, COOLDOWN, OTP_SCOPE } from '../../../../shared/brief-contact.js';
export async function onRequestPost({ request, env }) {
  if (!configured(env) || !env.RESEND_API_KEY) return json({error:'config',mensaje:'La verificación aún no está disponible. Inténtalo más tarde.'},503);
  let body;
  try { body = await readBody(request); } catch { return json({error:'json'},400); }
  const answers = sanitizeAnswers({...body,persona:{...body?.persona,correo:body?.correo}});
  const validation = validarContactoBrief(answers,{requireProof:false});
  if (!validation.ok || answers.contacto.tipo !== 'personal') return json({error:'contacto',mensaje:validation.motivo || 'Selecciona la opción sin correo corporativo.'},400);
  const email = answers.persona.correo, now = Date.now(), id = crypto.randomUUID(), expires = now + CODE_TTL;
  const code = nuevoCodigo();
  try {
    // Keep verified rows while their 14-day proof is usable; retain failures
    // for the complete rate-limit window, then remove their email addresses.
    await env.BRIEF_DB.prepare('DELETE FROM brief_email_challenges WHERE created_at < ? AND expires_at < ? AND (verified_until IS NULL OR verified_until < ?)').bind(now-DAY,now,now).run();
    const hash = await creatorHash(request, env.BRIEF_RECOVERY_SECRET);
    // One SQL statement reserves the slot AND checks limits, even under concurrency.
    const inserted = await env.BRIEF_DB.prepare(`INSERT INTO brief_email_challenges (id,email,code_hash,creator_hash,created_at,expires_at)
      SELECT ?,?,?,?,?,? WHERE
      (SELECT COUNT(*) FROM brief_email_challenges WHERE email = ? AND created_at >= ?) < 5
      AND (SELECT COUNT(*) FROM brief_email_challenges WHERE creator_hash = ? AND created_at >= ?) < 20
      AND NOT EXISTS (SELECT 1 FROM brief_email_challenges WHERE email = ? AND created_at > ?)`)
      .bind(id,email,await codeHash(id,code,env.BRIEF_RECOVERY_SECRET),hash,now,expires,email,now-DAY,hash,now-DAY,email,now-COOLDOWN).run();
    if (!inserted.meta.changes) return json({error:'rate_limit',mensaje:'Espera un minuto antes de pedir otro código. Si alcanzaste el límite diario, vuelve mañana.',reenviarEn:60},429);
    const envio = await fetch('https://api.resend.com/emails', {
      method:'POST', headers:{Authorization:`Bearer ${env.RESEND_API_KEY}`,'Content-Type':'application/json','Idempotency-Key':`brief-verification/${id}`},
      body:JSON.stringify({from:'Grupo Espacio Creativo <no-reply@updates.grupoespaciocreativo.com>',to:[email],subject:'Verifica tu correo para contarnos tu reto',
        text:`Tu código es ${code}. Escríbelo en el formulario de Grupo Espacio Creativo. Caduca en 10 minutos. Si no lo solicitaste, ignora este correo.`,
        html:`<div style="background:#f3f0ea;padding:32px;font-family:Arial,sans-serif;color:#101720"><div style="max-width:480px;margin:auto;background:white;padding:32px;border-radius:18px;border-top:5px solid #F5B301"><p>Grupo Espacio Creativo</p><h1 style="font-size:24px">Verifica tu correo</h1><p>Escribe este código para continuar contándonos tu reto.</p><p style="font-size:34px;font-weight:bold;letter-spacing:8px">${code}</p><p>Caduca en 10 minutos. Si no lo solicitaste, ignora este correo.</p></div></div>`}),
    });
    if (!envio.ok) return json({error:'envio',mensaje:'No pudimos enviar el código. Inténtalo de nuevo en un minuto.',reenviarEn:60},502);
    await env.BRIEF_DB.prepare('UPDATE brief_email_challenges SET delivered = 1 WHERE id = ?').bind(id).run();
    return json({ok:true,token:await signToken(id,expires,env.BRIEF_RECOVERY_SECRET + OTP_SCOPE),segundos:600,reenviarEn:60});
  } catch { return json({error:'verificacion',mensaje:'No pudimos enviar el código. Inténtalo de nuevo en un minuto.',reenviarEn:60},503); }
}
