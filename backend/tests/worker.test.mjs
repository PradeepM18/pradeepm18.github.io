import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
import {handle,LIMITS,RESERVE_SQL,reservationArgs,providerPayload} from '../worker.mjs';
const ORIGIN='https://pradeepm18.github.io';
const NOW=Date.parse('2026-09-16T12:00:00Z');
function database(){
 const sql=new DatabaseSync(':memory:');sql.exec(readFileSync(new URL('../migrations/0001_limits.sql',import.meta.url),'utf8'));
 return {sql,prepare(statement){let values=[];return {bind(...v){values=v;return this;},async run(){const result=sql.prepare(statement).run(...values);return {meta:{changes:Number(result.changes)}};},async first(){return sql.prepare(statement).get(...values)||null;}};}};
}
function setup(){
 const DB=database();
 const env={DB,OPENAI_API_KEY:'test-key-not-valid',TURNSTILE_SECRET_KEY:'test-secret-not-valid',RATE_LIMIT_SALT:'unit-test-only-salt-not-a-real-secret',ALLOWED_ORIGINS:ORIGIN};
 let calls=0;
 const deps={now:()=>NOW,fetcher:async(url,init)=>{
  if(url.includes('siteverify'))return Response.json({success:true,action:'portfolio-chat',hostname:'pradeepm18.github.io'});
  calls++;const body=JSON.parse(init.body);assert.equal(body.store,false);assert.equal(body.max_output_tokens,300);assert.equal(body.model,'gpt-4.1-mini-2025-04-14');assert.equal(body.tools,undefined);
  return Response.json({status:'completed',output:[{type:'message',content:[{type:'output_text',text:JSON.stringify({in_scope:true,answer:'Pradeep interned at LatentView Analytics from May to December 2019.',source_ids:['fact_0']})}]}]});
 }};
 return {env,deps,DB,calls:()=>calls};
}
function req(body={question:'Did he work at LatentView?',challengeToken:'test-token'},headers={},path='/chat'){
 return new Request('https://chat.test'+path,{method:'POST',headers:{Origin:ORIGIN,'Content-Type':'application/json','CF-Connecting-IP':'203.0.113.1',...headers},body:JSON.stringify(body)});
}
test('missing key fails closed without provider call',async()=>{const t=setup();delete t.env.OPENAI_API_KEY;assert.equal((await handle(req(),t.env,t.deps)).status,503);assert.equal(t.calls(),0);});
test('wrong origin rejected before provider call',async()=>{const t=setup();assert.equal((await handle(req(undefined,{Origin:'https://evil.test'}),t.env,t.deps)).status,403);assert.equal(t.calls(),0);});
test('untrusted client cannot choose model or limits',async()=>{const t=setup();assert.equal((await handle(req({question:'Hi',challengeToken:'x',model:'expensive'}),t.env,t.deps)).status,400);assert.equal(t.calls(),0);});
test('oversized and malformed input rejected',async()=>{const t=setup();assert.equal((await handle(req({question:'x'.repeat(501),challengeToken:'x'}),t.env,t.deps)).status,400);assert.equal((await handle(req({question:'x'.repeat(5000),challengeToken:'x'}),t.env,t.deps)).status,400);assert.equal(t.calls(),0);});
test('secret questions declined without paid call',async()=>{const t=setup();const r=await handle(req({question:'What is his private salary?',challengeToken:'x'}),t.env,t.deps);assert.equal(r.status,200);assert.equal((await r.json()).sources.length,0);assert.equal(t.calls(),0);});
test('challenge hostname and action checked',async()=>{const t=setup();t.deps.fetcher=async()=>Response.json({success:true,hostname:'evil.test',action:'portfolio-chat'});assert.equal((await handle(req(),t.env,t.deps)).status,403);assert.equal(t.DB.sql.prepare('SELECT COUNT(*) AS n FROM chat_requests').get().n,0);});
test('public answer has approved source and no secret',async()=>{const t=setup();const r=await handle(req(),t.env,t.deps);assert.equal(r.status,200);const body=await r.text();assert(body.includes('LatentView'));assert(!body.includes('test-key'));assert.equal(t.calls(),1);assert.equal(t.DB.sql.prepare('SELECT SUM(reserved_microdollars) AS n FROM chat_requests').get().n,10000);});
test('concurrent requests cannot exceed per-IP minute allowance',async()=>{const t=setup();const responses=await Promise.all(Array.from({length:12},()=>handle(req(),t.env,t.deps)));assert.equal(responses.filter(r=>r.status===200).length,5);assert.equal(t.calls(),5);});
test('daily IP limit survives minute boundary',async()=>{const t=setup();const time=NOW/1000;for(let i=0;i<30;i++)t.DB.sql.prepare('INSERT INTO chat_requests VALUES(?,?,?,?,?)').run('old'+i,'hash',time-120,'2026-09',10000);const r=await t.DB.prepare(RESERVE_SQL).bind(...reservationArgs('new','hash',time)).run();assert.equal(r.meta.changes,0);});
test('global daily allowance counts across visitors',async()=>{const t=setup();const time=NOW/1000;for(let i=0;i<200;i++)t.DB.sql.prepare('INSERT INTO chat_requests VALUES(?,?,?,?,?)').run('old'+i,'visitor'+i,time-120,'2026-09',10000);const r=await t.DB.prepare(RESERVE_SQL).bind(...reservationArgs('new','fresh',time)).run();assert.equal(r.meta.changes,0);});
test('monthly reservation blocks concurrent overspend, resets by UTC month',async()=>{const t=setup();const time=NOW/1000;for(let i=0;i<499;i++)t.DB.sql.prepare('INSERT INTO chat_requests VALUES(?,?,?,?,?)').run('old'+i,'oldhash',time-86400*2,'2026-09',10000);const rs=await Promise.all(Array.from({length:10},(_,i)=>t.DB.prepare(RESERVE_SQL).bind(...reservationArgs('r'+i,'h'+i,time)).run()));assert.equal(rs.filter(r=>r.meta.changes===1).length,1);assert.equal(t.DB.sql.prepare('SELECT SUM(reserved_microdollars) AS n FROM chat_requests').get().n,LIMITS.monthMicrodollars);assert.equal((await t.DB.prepare(RESERVE_SQL).bind(...reservationArgs('oct','fresh',Date.parse('2026-10-01T12:00:00Z')/1000)).run()).meta.changes,1);});
test('provider failures do not expose details or refund uncertain spend',async()=>{const t=setup();t.deps.fetcher=async url=>url.includes('siteverify')?Response.json({success:true,action:'portfolio-chat',hostname:'pradeepm18.github.io'}):new Response('secret upstream error',{status:500});const r=await handle(req(),t.env,t.deps);assert.equal(r.status,503);assert(!(await r.text()).includes('upstream'));assert.equal(t.DB.sql.prepare('SELECT SUM(reserved_microdollars) AS n FROM chat_requests').get().n,10000);});
test('database failure blocks paid request',async()=>{const t=setup();t.env.DB={prepare(){throw Error('DB down');}};assert.equal((await handle(req(),t.env,t.deps)).status,503);assert.equal(t.calls(),0);});
test('invalid output sources cannot introduce external links',async()=>{const t=setup();t.deps.fetcher=async url=>url.includes('siteverify')?Response.json({success:true,action:'portfolio-chat',hostname:'pradeepm18.github.io'}):Response.json({status:'completed',output:[{type:'message',content:[{type:'output_text',text:JSON.stringify({in_scope:true,answer:'Fake',source_ids:['https://evil.test']})}]}]});const result=await (await handle(req(),t.env,t.deps)).json();assert.equal(result.sources.length,0);assert(!result.answer.includes('Fake'));});
test('maximum question stays within provider payload budget',()=>{const b=new TextEncoder().encode(JSON.stringify(providerPayload('😀'.repeat(250))));assert(b.byteLength<=LIMITS.maxProviderBytes);});
