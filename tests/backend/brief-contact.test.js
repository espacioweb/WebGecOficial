import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import { onRequestPost as send } from '../../functions/api/brief/email/send.js';
import { onRequestPost as verify } from '../../functions/api/brief/email/verify.js';
import { onRequestPost as save, onRequestGet as restore } from '../../functions/api/brief/draft.js';
import { onRequestPost as finish } from '../../functions/api/brief.js';
import { signToken, DAY } from '../../shared/brief-recovery.js';
import { validarContactoBrief, enlaceComercialValido } from '../../src/data/brief-contact.js';
const personal = {persona:{correo:'owner@gmail.com',vinculo:'Propietario'},empresa:{nombre:'Mi negocio',web:'mine.example.com'},contacto:{tipo:'personal',presencia:'enlace',necesidadDigital:'Quiero orientación'}};
function setup() {
  const sqlite = new DatabaseSync(':memory:');
  for (const name of ['0001_brief_recovery.sql','0002_brief_email.sql']) sqlite.exec(readFileSync(new URL(`../../migrations/${name}`,import.meta.url),'utf8'));
  const db = {prepare(sql) {let values=[]; return {bind(...v){values=v;return this;},async first(){return sqlite.prepare(sql).get(...values)||null;},async run(){return {meta:sqlite.prepare(sql).run(...values)};},async all(){return {results:sqlite.prepare(sql).all(...values)};}};}};
  return {sqlite,env:{BRIEF_DB:db,BRIEF_RECOVERY_SECRET:'contact-test-secret',RESEND_API_KEY:'fake'}};
}
function req(body,path='email/send',ip='192.0.2.10') {return new Request(`https://example.com/api/brief/${path}`,{method:'POST',headers:{'Content-Type':'application/json','CF-Connecting-IP':ip},body:JSON.stringify(body)});}
const sendingBody = (answers=personal) => ({...answers,correo:answers.persona.correo});
async function issue(env) {
  let code;
  const original=globalThis.fetch;
  globalThis.fetch=async (_url,init) => {code=JSON.parse(init.body).text.match(/\d{6}/)[0];return Response.json({id:'mock'});};
  try {const response=await send({request:req(sendingBody()),env});assert.equal(response.status,200);return {...await response.json(),code};} finally {globalThis.fetch=original;}
}
async function trusted(env) {
  const challenge=await issue(env);
  const response=await verify({request:req({token:challenge.token,codigo:challenge.code},'email/verify'),env});
  assert.equal(response.status,200);
  const {verificationProof}=await response.json();
  return {...personal,contacto:{...personal.contacto,verificationProof}};
}

test('business declaration requires name, relationship, presence, digital needs; public links only',()=>{
  assert.equal(validarContactoBrief(personal,{requireProof:false}).ok,true);
  assert.equal(validarContactoBrief(personal).ok,false);
  for (const missing of [{empresa:{...personal.empresa,nombre:''}},{persona:{...personal.persona,vinculo:''}},{contacto:{...personal.contacto,presencia:''}},{contacto:{...personal.contacto,necesidadDigital:''}},{empresa:{...personal.empresa,web:'javascript:alert(1)'}}]) assert.equal(validarContactoBrief({...personal,...missing},{requireProof:false}).ok,false);
  assert.equal(validarContactoBrief({...personal,empresa:{nombre:'Mi negocio'},contacto:{...personal.contacto,presencia:'ninguna'}},{requireProof:false}).ok,true);
  assert.equal(validarContactoBrief({persona:personal.persona}).ok,false);
  for(const link of ['https://facebook.com/mybusiness','mine.example.com']) assert.equal(enlaceComercialValido(link),true);
  for(const link of ['https://user:password@example.com','http://localhost','http://127.0.0.1','https://..com','no enlace','javascript:alert(1)']) assert.equal(enlaceComercialValido(link),false);
});

test('email challenge has opaque token, atomic concurrent cooldown and no provider without context',async()=>{
  const {env,sqlite}=setup();let calls=0;const original=globalThis.fetch;
  globalThis.fetch=async ()=>{calls++;return Response.json({id:'mock'});};
  try {
    const invalid=await send({request:req(sendingBody({...personal,empresa:{nombre:''}})),env});assert.equal(invalid.status,400);assert.equal(calls,0);
    const results=await Promise.all([send({request:req(sendingBody()),env}),send({request:req(sendingBody()),env})]);
    assert.deepEqual(results.map(r=>r.status).sort(),[200,429]);assert.equal(calls,1);
    const response=await results.find(r=>r.status===200).json();assert.match(response.token,/^[a-f0-9-]{36}\.\d{13}\.[a-f0-9]{64}$/);assert.equal(response.segundos,600);
    assert.equal(sqlite.prepare('SELECT COUNT(*) AS n FROM brief_email_challenges').get().n,1);
  }finally{globalThis.fetch=original;}
});

test('attempt limit survives old-token replay and concurrent wrong attempts',async()=>{
  const {env,sqlite}=setup();const challenge=await issue(env);const wrong=challenge.code==='000000'?'111111':'000000';
  const results=await Promise.all(Array.from({length:8},()=>verify({request:req({token:challenge.token,codigo:wrong},'email/verify'),env})));
  assert.ok(results.every(r=>r.status!==200));assert.equal(sqlite.prepare('SELECT attempts FROM brief_email_challenges').get().attempts,5);
  assert.equal((await verify({request:req({token:challenge.token,codigo:challenge.code},'email/verify'),env})).status,429);
});

test('expired and forged challenge fails; correct code consumed once under concurrency',async()=>{
  const {env,sqlite}=setup();const challenge=await issue(env);
  assert.equal((await verify({request:req({token:challenge.token+'0',codigo:challenge.code},'email/verify'),env})).status,401);
  const results=await Promise.all([verify({request:req({token:challenge.token,codigo:challenge.code},'email/verify'),env}),verify({request:req({token:challenge.token,codigo:challenge.code},'email/verify'),env})]);
  assert.equal(results.filter(r=>r.status===200).length,1);assert.equal(sqlite.prepare('SELECT attempts FROM brief_email_challenges').get().attempts,1);
  const expiredId=crypto.randomUUID(), expiry=Date.now()-1000;
  sqlite.prepare('INSERT INTO brief_email_challenges(id,email,code_hash,creator_hash,created_at,expires_at,delivered) VALUES(?,?,?,?,?,?,1)').run(expiredId,'x@gmail.com','fake','ip',expiry-1000,expiry);
  const token=await signToken(expiredId,expiry,env.BRIEF_RECOVERY_SECRET+':brief-otp');
  assert.equal((await verify({request:req({token,codigo:'123456'},'email/verify'),env})).status,410);
});

test('proof verified against database: forged proof, changed email and missing context cannot draft or submit',async()=>{
  const {env,sqlite}=setup();const verified=await trusted(env);const original=globalThis.fetch;let calls=0;
  globalThis.fetch=async()=>{calls++;return Response.json({ok:true});};
  try{
    const forged=verified.contacto.verificationProof.slice(0,-1)+(verified.contacto.verificationProof.endsWith('a')?'b':'a');
    const variants=[personal,{...verified,persona:{...verified.persona,correo:'different@gmail.com'}},{...verified,empresa:{nombre:''}},{...verified,contacto:{...verified.contacto,verificationProof:forged}},{...verified,contacto:{tipo:'corporativo'}}];
    for (const answers of variants) {
      assert.notEqual((await save({request:req({clientId:crypto.randomUUID(),answers,step:'correo',reminderConsent:true},'draft'),env})).status,200);
      assert.notEqual((await finish({request:req(answers,''),env})).status,200);
    }
    assert.equal(calls,0);assert.equal(sqlite.prepare('SELECT COUNT(*) AS n FROM brief_drafts').get().n,0);
    const result=await finish({request:req(verified,''),env});assert.equal(result.status,200);assert.equal(calls,1);
  }finally{globalThis.fetch=original;}
});

test('verified draft restores declaration/proof and withdrawal still works with cleared email; no opt-in does not save',async()=>{
  const {env,sqlite}=setup();const answers=await trusted(env);
  const no=await save({request:req({answers,reminderConsent:false},'draft'),env});assert.deepEqual(await no.json(),{saved:false});
  const response=await save({request:req({clientId:crypto.randomUUID(),answers,step:'etapa',reminderConsent:true},'draft'),env});assert.equal(response.status,200);const {token,expiresAt}=await response.json();
  assert.equal(expiresAt,Number(answers.contacto.verificationProof.split('.')[1]));
  const recovered=await restore({request:new Request('https://example.com/api/brief/draft',{headers:{Authorization:`Bearer ${token}`}}),env});
  const data=await recovered.json();assert.equal(data.answers.contacto.verificationProof,answers.contacto.verificationProof);assert.equal(data.answers.persona.vinculo,'Propietario');
  const withdrawn=await save({request:req({token,answers:{persona:{correo:''}},reminderConsent:false},'draft'),env});assert.equal(withdrawn.status,200);assert.equal(sqlite.prepare('SELECT state FROM brief_drafts').get().state,'cancelled');
});

test('provider failure reserves slot without returning token; daily email and IP limits atomic',async()=>{
  const {env,sqlite}=setup();const original=globalThis.fetch;let calls=0;
  globalThis.fetch=async()=>{calls++;return new Response('{}',{status:503});};
  try {
    const failed=await send({request:req(sendingBody()),env});assert.equal(failed.status,502);assert.equal((await failed.json()).token,undefined);
    assert.equal((await send({request:req(sendingBody()),env})).status,429);assert.equal(calls,1);
    const row=sqlite.prepare('SELECT creator_hash FROM brief_email_challenges').get();
    for(let i=0;i<4;i++) sqlite.prepare('INSERT INTO brief_email_challenges(id,email,code_hash,creator_hash,created_at,expires_at) VALUES(?,?,?,?,?,?)').run(crypto.randomUUID(),personal.persona.correo,'fake','other',Date.now()-120000,Date.now()+600000);
    sqlite.prepare('UPDATE brief_email_challenges SET created_at = ? WHERE creator_hash = ?').run(Date.now()-120000,row.creator_hash);
    assert.equal((await send({request:req(sendingBody()),env})).status,429);assert.equal(calls,1);
    for(let i=0;i<19;i++) sqlite.prepare('INSERT INTO brief_email_challenges(id,email,code_hash,creator_hash,created_at,expires_at) VALUES(?,?,?,?,?,?)').run(crypto.randomUUID(),`other${i}@gmail.com`,'fake',row.creator_hash,Date.now()-120000,Date.now()+600000);
    assert.equal((await send({request:req(sendingBody({...personal,persona:{...personal.persona,correo:'new@gmail.com'}})),env})).status,429);assert.equal(calls,1);
    sqlite.prepare('UPDATE brief_email_challenges SET created_at = ?').run(Date.now()-DAY-1000);
    assert.equal((await send({request:req(sendingBody()),env})).status,502);assert.equal(calls,2);
  }finally{globalThis.fetch=original;}
});

test('14-day proof expiry, database binding, invalid type and cleanup preserve active proofs',async()=>{
  const {env,sqlite}=setup();const answers=await trusted(env);const id=answers.contacto.verificationProof.split('.')[0];
  const original=globalThis.fetch;let calls=0;
  globalThis.fetch=async (_url,init)=>{calls++;if(_url.includes('/notify')) assert.match(JSON.parse(init.body).message,/personal verificado · negocio declarado/);return Response.json({ok:true});};
  try {
    assert.equal((await finish({request:req({...answers,contacto:{...answers.contacto,tipo:'inventado'}},''),env})).status,400);assert.equal(calls,0);
    const expired=await signToken(id,Date.now()-1000,env.BRIEF_RECOVERY_SECRET+':brief-email');
    assert.notEqual((await finish({request:req({...answers,contacto:{...answers.contacto,verificationProof:expired}},''),env})).status,200);assert.equal(calls,0);
    sqlite.prepare('UPDATE brief_email_challenges SET verified_until = verified_until - 1 WHERE id = ?').run(id);
    assert.equal((await finish({request:req(answers,''),env})).status,401);assert.equal(calls,0);
    sqlite.prepare('UPDATE brief_email_challenges SET verified_until = ? WHERE id = ?').run(Number(answers.contacto.verificationProof.split('.')[1]),id);
    // The code expires well before its proof; cleanup must not invalidate it.
    sqlite.prepare('UPDATE brief_email_challenges SET created_at = ?, expires_at = ? WHERE id = ?').run(Date.now()-2*DAY,Date.now()-DAY,id);
    const stale=crypto.randomUUID();sqlite.prepare('INSERT INTO brief_email_challenges(id,email,code_hash,creator_hash,created_at,expires_at) VALUES(?,?,?,?,?,?)').run(stale,'expired@gmail.com','fake','old',Date.now()-2*DAY,Date.now()-DAY);
    await send({request:req(sendingBody({...personal,persona:{...personal.persona,correo:'fresh@gmail.com'}})),env});
    assert.equal(sqlite.prepare('SELECT id FROM brief_email_challenges WHERE id = ?').get(stale),undefined);
    assert.ok(sqlite.prepare('SELECT id FROM brief_email_challenges WHERE id = ?').get(id));
    assert.equal((await finish({request:req(answers,''),env})).status,200);
  }finally{globalThis.fetch=original;}
});
