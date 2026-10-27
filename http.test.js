import test from 'node:test';import assert from 'node:assert/strict';import {Readable} from 'node:stream';import {registerRoute} from './http.js';
function setup(admit={peer:{id:'owner'}}){const routes=new Map();let calls=0;const ctx={connection:{admit:()=>admit,browserPeer:{id:'owner'}},webServer:{register:r=>{routes.set(r.path,r.handler);return()=>{};}}};registerRoute(ctx,async()=>{calls++;},()=>({configured:true}),()=>()=>{});return {handler:routes.get('/feishu-bugs/api'),calls:()=>calls};}
async function request(handler,overrides={}){const req=Object.assign(Readable.from([Buffer.from('{"action":"verify"}')]),{method:'POST',headers:{origin:'http://localhost:56834',host:'localhost:56834','content-type':'application/json'},...overrides});const out={};await handler(req,{writeHead(s){out.status=s;},end(v){out.body=v;}});return out;}
test('authentication, owner identity and CSRF gates prevent mutations',async()=>{for(const admission of [{rejection:401},{peer:{id:'remote'}}]){const s=setup(admission);assert.ok((await request(s.handler)).status>=400);assert.equal(s.calls(),0);}const s=setup();assert.equal((await request(s.handler,{headers:{origin:'http://evil.test',host:'localhost:56834','content-type':'application/json'}})).status,403);assert.equal(s.calls(),0);});
test('desktop forwarded owner POST works without Origin using explicit panel marker',async()=>{const s=setup();const r=await request(s.handler,{headers:{host:'localhost:56834','content-type':'application/json','x-dsh-feishu-bugs':'1'}});assert.equal(r.status,200);assert.equal(s.calls(),1);});
test('missing origin without panel marker and hostile origin variants remain refused',async()=>{for(const headers of [
 {host:'localhost:56834','content-type':'application/json'},
 {host:'localhost:56834','content-type':'application/json','x-dsh-feishu-bugs':'1','sec-fetch-site':'cross-site'},
 {host:'localhost:56834','content-type':'application/json','x-dsh-feishu-bugs':'1','sec-fetch-site':'same-site'},
 {host:'localhost:56834','content-type':'application/json','x-dsh-feishu-bugs':'1',origin:'null'},
 {host:'localhost:56834','content-type':'application/json','x-dsh-feishu-bugs':'1',origin:'http://evil.test'}
 ]){const s=setup();assert.equal((await request(s.handler,{headers})).status,403);assert.equal(s.calls(),0);}});
test('desktop panel marker never bypasses signed identity and owner checks',async()=>{for(const admission of [{rejection:401},{peer:{id:'remote'}}]){const s=setup(admission);assert.ok((await request(s.handler,{headers:{host:'localhost:56834','content-type':'application/json','x-dsh-feishu-bugs':'1'}})).status>=400);assert.equal(s.calls(),0);}});
test('owner JSON action accepted and snapshot returned without credentials',async()=>{const s=setup();const r=await request(s.handler);assert.equal(r.status,200);assert.equal(s.calls(),1);assert.deepEqual(JSON.parse(r.body),{configured:true});});
test('the panel read waits for a fresh snapshot instead of the pre-event one',async()=>{
 const routes=new Map();let settled=false;
 const ctx={connection:{admit:()=>({peer:{id:'owner'}}),browserPeer:{id:'owner'}},webServer:{register:r=>{routes.set(r.path,r.handler);return()=>{};}}};
 registerRoute(ctx,async()=>{},async()=>{await new Promise(r=>setImmediate(r));settled=true;return {stale:!settled};},()=>()=>{});
 const req=Object.assign(Readable.from([]),{method:'GET',headers:{}});let body;
 await routes.get('/feishu-bugs/api')(req,{writeHead:()=>{},end:v=>{body=v;}});
 assert.deepEqual(JSON.parse(body),{stale:false});
});
