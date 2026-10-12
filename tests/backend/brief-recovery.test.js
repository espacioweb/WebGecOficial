import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import { onRequestGet, onRequestPost as save } from '../../functions/api/brief/draft.js';
import { onRequestPost as cancel } from '../../functions/api/brief/cancel.js';
import { onRequestPost as remind } from '../../functions/api/brief/reminders.js';
import { onRequestPost as finish } from '../../functions/api/brief.js';
import { DAY } from '../../shared/brief-recovery.js';

function setup() {
  const sqlite = new DatabaseSync(':memory:');
  sqlite.exec(readFileSync(new URL('../../migrations/0001_brief_recovery.sql',import.meta.url),'utf8'));
  const db = { prepare(sql) {
    let params = [];
    return {bind(...values) { params=values; return this; },
      async first() { return sqlite.prepare(sql).get(...params) || null; },
      async all() { return {results:sqlite.prepare(sql).all(...params)}; },
      async run() { return {meta:sqlite.prepare(sql).run(...params)}; },
    };
  } };
  const env = {BRIEF_DB:db,BRIEF_RECOVERY_SECRET:'test-secret-with-enough-entropy',RESEND_API_KEY:'fake'};
  return {env,sqlite};
}
function request(body,path='draft',extra={}) {
  return new Request(`https://example.com/api/brief/${path}`,{method:'POST',headers:{'Content-Type':'application/json','CF-Connecting-IP':'192.0.2.1',...extra},body:JSON.stringify(body)});
}
const answers = {persona:{correo:'test@example.com',nombre:'Test'},areas:['studio'],necesidad:'Video',empresa:{sector:'Servicios'}};
async function create(env,extra={}) {
  const response = await save({request:request({clientId:crypto.randomUUID(),answers,source:{pilar:'studio',url:'https://example.com/#continuar=secret'},step:'necesidad',reminderConsent:true,...extra}),env});
  assert.equal(response.status,200);
  return response.json();
}
const reminderRequest = (env) => request({},'reminders',{Authorization:`Bearer ${env.BRIEF_RECOVERY_SECRET}`});

test('opt-in only; sanitize and restore exact step; tamper and expiry denied',async () => {
  const {env,sqlite}=setup();
  const no = await save({request:request({answers,step:'correo',reminderConsent:false}),env});
  assert.deepEqual(await no.json(),{saved:false});
  assert.equal(sqlite.prepare('SELECT count(*) AS n FROM brief_drafts').get().n,0);
  const created = await create(env,{answers:{...answers,secret:'discard',persona:{...answers.persona,correo:'TEST@EXAMPLE.COM'}}});
  const get = await onRequestGet({request:new Request(`https://example.com/api/brief/draft?token=${created.token}`),env});
  assert.equal(get.headers.get('Cache-Control'),'no-store');
  const restored=await get.json();
  assert.equal(restored.step,'necesidad'); assert.equal(restored.answers.persona.correo,'test@example.com');
  assert.equal(restored.source.url,'https://example.com/'); assert.equal(restored.answers.secret,undefined);
  const tamper=await onRequestGet({request:new Request(`https://example.com/api/brief/draft?token=${created.token}0`),env});
  assert.equal(tamper.status,401);
  sqlite.prepare('UPDATE brief_drafts SET expires_at = 0').run();
  assert.equal((await onRequestGet({request:new Request(`https://example.com/api/brief/draft?token=${created.token}`),env})).status,410);
});

test('cancel is idempotent; withdrawal erases stored answers and prevents restore',async () => {
  const {env,sqlite}=setup();
  const {token}=await create(env);
  for (let i=0;i<2;i++) assert.equal((await cancel({request:request({token},'cancel'),env})).status,200);
  const row=sqlite.prepare('SELECT * FROM brief_drafts').get();
  assert.equal(row.consent,0); assert.equal(row.answers,'{}'); assert.equal(row.state,'cancelled');
  assert.equal((await onRequestGet({request:new Request(`https://example.com/api/brief/draft?token=${token}`),env})).status,410);
});

test('one reminder after inactivity, protected auth, concurrent claims and retry idempotency',async () => {
  const {env,sqlite}=setup();
  await create(env);
  const original=globalThis.fetch; let calls=0; let first=true; const keys=[];
  globalThis.fetch=async (_url,init) => { calls++; keys.push(init.headers['Idempotency-Key']); return first ? new Response('{}',{status:503}) : Response.json({id:'mock-email'}); };
  try {
    assert.equal((await remind({request:request({},'reminders'),env})).status,401);
    assert.equal((await remind({request:reminderRequest(env),env})).status,200); assert.equal(calls,0);
    sqlite.prepare('UPDATE brief_drafts SET updated_at = ?').run(Date.now()-DAY-1000);
    assert.equal((await remind({request:reminderRequest(env),env})).status,502);
    assert.equal(sqlite.prepare('SELECT reminder_sent_at FROM brief_drafts').get().reminder_sent_at,null);
    first=false;
    const results=await Promise.all([remind({request:reminderRequest(env),env}),remind({request:reminderRequest(env),env})]);
    assert.ok(results.every((r) => r.status===200)); assert.equal(calls,2); assert.equal(keys[0],keys[1]);
    await remind({request:reminderRequest(env),env}); assert.equal(calls,2);
  } finally { globalThis.fetch=original; }
});

test('final completion matches email and persists before success; DB failure prevents notification',async () => {
  const {env,sqlite}=setup(); const {token}=await create(env);
  const original=globalThis.fetch; let calls=0;
  globalThis.fetch=async () => { calls++; assert.equal(sqlite.prepare('SELECT state FROM brief_drafts').get().state,'completed'); return Response.json({ok:true}); };
  try {
    assert.equal((await finish({request:request({persona:{correo:'other@example.com'},draftToken:token},''),env})).status,409); assert.equal(calls,0);
    assert.equal((await finish({request:request({persona:answers.persona,draftToken:token},''),env})).status,200); assert.equal(calls,1);
    sqlite.prepare('UPDATE brief_drafts SET updated_at = ?').run(Date.now()-DAY-1000);
    await remind({request:reminderRequest(env),env}); assert.equal(calls,1);
    const broken={...env,BRIEF_DB:{prepare(){throw new Error('db');}}};
    assert.equal((await finish({request:request({persona:answers.persona,draftToken:token},''),env:broken})).status,503); assert.equal(calls,1);
  } finally {globalThis.fetch=original;}
});

test('revalidate completion between claim and send and preview recipient filter',async () => {
  const {env,sqlite}=setup(); const {token}=await create(env);
  sqlite.prepare('UPDATE brief_drafts SET updated_at = ?').run(Date.now()-DAY-1000);
  const basePrepare=env.BRIEF_DB.prepare;
  env.BRIEF_DB.prepare=(sql) => {
    const statement=basePrepare(sql);
    if (sql.startsWith('SELECT * FROM brief_drafts WHERE id = ? AND claim')) {
      const first=statement.first;
      statement.first=async () => {await cancel({request:request({token},'cancel'),env}); return first();};
    }
    return statement;
  };
  const original=globalThis.fetch; let calls=0;
  globalThis.fetch=async () => {calls++; return Response.json({id:'mock'});};
  try {assert.equal((await remind({request:reminderRequest(env),env})).status,200); assert.equal(calls,0);} finally {globalThis.fetch=original;}
  env.BRIEF_DB.prepare=basePrepare;
  await create(env,{answers:{...answers,persona:{correo:'second@example.com'}}});
  env.BRIEF_TEST_RECIPIENT='different@example.com';
  sqlite.prepare('UPDATE brief_drafts SET updated_at = ?').run(Date.now()-DAY-1000);
  globalThis.fetch=async () => {calls++; return Response.json({id:'mock'});};
  try {await remind({request:reminderRequest(env),env}); assert.equal(calls,0);} finally {globalThis.fetch=original;}
});

test('production always waits 24h; isolated preview accepts 60s; uncertain sends stop after 23h',async () => {
  const {env,sqlite}=setup(); await create(env);
  env.BRIEF_REMINDER_DELAY_MS='60000';
  env.BRIEF_SITE_URL='https://grupoespaciocreativo.com';
  sqlite.prepare('UPDATE brief_drafts SET updated_at = ?').run(Date.now()-61000);
  const original=globalThis.fetch; let calls=0;
  globalThis.fetch=async () => {calls++; return Response.json({id:'mock'});};
  try {
    await remind({request:reminderRequest(env),env}); assert.equal(calls,0);
    env.BRIEF_SITE_URL='https://brief-recovery.webgecoficial.pages.dev';
    await remind({request:reminderRequest(env),env}); assert.equal(calls,1);
    sqlite.prepare('UPDATE brief_drafts SET reminder_sent_at = NULL, reminder_started_at = ?, updated_at = ?').run(Date.now()-24*3600000,Date.now()-DAY-1000);
    await remind({request:reminderRequest(env),env}); assert.equal(calls,1);
  } finally {globalThis.fetch=original;}
});

test('autosave renews inactivity; withdraw consent erases data; oversized JSON and creation limit fail safely',async () => {
  const {env,sqlite}=setup(); const {token}=await create(env);
  sqlite.prepare('UPDATE brief_drafts SET updated_at = ?').run(Date.now()-DAY-1000);
  assert.equal((await save({request:request({token,answers,step:'empresa',reminderConsent:true}),env})).status,200);
  assert.ok(sqlite.prepare('SELECT updated_at FROM brief_drafts').get().updated_at>Date.now()-1000);
  const withdrawn=await save({request:request({token,answers,step:'empresa',reminderConsent:false}),env});
  assert.deepEqual(await withdrawn.json(),{cancelled:true});
  assert.equal(sqlite.prepare('SELECT answers FROM brief_drafts').get().answers,'{}');
  assert.equal((await save({request:request({answers,step:'empresa',reminderConsent:true,padding:'x'.repeat(25000)}),env})).status,400);
  await create(env); await create(env);
  assert.equal((await save({request:request({clientId:crypto.randomUUID(),answers,step:'empresa',reminderConsent:true}),env})).status,429);
});

test('lost creation response retries idempotently without overwriting persisted progress',async () => {
  const {env,sqlite}=setup(); const clientId=crypto.randomUUID();
  const [one,two]=await Promise.all([create(env,{clientId}),create(env,{clientId})]);
  assert.equal(one.token,two.token); assert.equal(sqlite.prepare('SELECT count(*) AS n FROM brief_drafts').get().n,1);
  await save({request:request({token:one.token,answers:{...answers,necesidad:'Updated'},step:'empresa',reminderConsent:true}),env});
  const retry=await create(env,{clientId}); assert.equal(retry.token,one.token);
  assert.equal(JSON.parse(sqlite.prepare('SELECT answers FROM brief_drafts').get().answers).necesidad,'Updated');
});

test('notification failure retains completed lead in DB and confirms delivery only on retry',async () => {
  const {env,sqlite}=setup(); const {token}=await create(env);
  const original=globalThis.fetch;
  try {
    globalThis.fetch=async () => new Response('{}',{status:502});
    const failed = await finish({request:request({persona:answers.persona,draftToken:token},''),env});
    assert.equal(failed.status,502); assert.deepEqual(await failed.json(),{error:'notification',saved:true});
    const row=sqlite.prepare('SELECT * FROM brief_drafts').get();
    assert.equal(row.state,'completed'); assert.equal(row.consent,0);
    assert.equal(JSON.parse(row.answers).necesidad,'Video');
    globalThis.fetch=async () => Response.json({ok:true});
    assert.equal((await finish({request:request({persona:answers.persona,draftToken:token},''),env})).status,200);
  } finally {globalThis.fetch=original;}
});

test('withdraw token works with erased email and step; repeated withdrawal remains idempotent',async () => {
  const {env,sqlite}=setup(); const {token}=await create(env);
  for (let i=0;i<2;i++) {
    const response=await save({request:request({token,answers:{persona:{correo:''}},step:'',reminderConsent:false}),env});
    assert.equal(response.status,200); assert.deepEqual(await response.json(),{cancelled:true});
  }
  const row=sqlite.prepare('SELECT * FROM brief_drafts').get();
  assert.equal(row.consent,0); assert.equal(row.answers,'{}'); assert.equal(row.state,'cancelled');
});

test('autosave after a lost final response signals persisted completion and never overwrites',async () => {
  const {env,sqlite}=setup(); const {token}=await create(env);
  const original=globalThis.fetch;
  try {
    globalThis.fetch=async () => Response.json({ok:true});
    await finish({request:request({persona:answers.persona,draftToken:token},''),env});
    const response=await save({request:request({token,answers:{...answers,necesidad:'Overwrite'},step:'empresa',reminderConsent:true}),env});
    assert.equal(response.status,410); assert.deepEqual(await response.json(),{error:'completed',saved:true});
    assert.equal(JSON.parse(sqlite.prepare('SELECT answers FROM brief_drafts').get().answers).necesidad,'Video');
    assert.equal((await finish({request:request({persona:answers.persona,draftToken:token},''),env})).status,200);
  } finally {globalThis.fetch=original;}
});

test('resume uses Authorization header without exposing token in the URL, header takes priority',async () => {
  const {env}=setup(); const {token}=await create(env);
  const cleanRequest=new Request('https://example.com/api/brief/draft',{headers:{Authorization:`Bearer ${token}`}});
  assert.equal(new URL(cleanRequest.url).search,'');
  const response=await onRequestGet({request:cleanRequest,env});
  assert.equal(response.status,200); assert.equal((await response.json()).step,'necesidad');
  const priority=await onRequestGet({request:new Request('https://example.com/api/brief/draft?token=invalid',{headers:{Authorization:`Bearer ${token}`}}),env});
  assert.equal(priority.status,200);
});
