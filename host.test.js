import test from 'node:test';import assert from 'node:assert/strict';import {mkdtemp,writeFile,readFile,rm} from 'node:fs/promises';import {join} from 'node:path';import {tmpdir} from 'node:os';import {apply} from './index.js';import {DeviceAuth} from './auth.js';import {Readable} from 'node:stream';
test('owner cancel bypasses stalled auth-start and never restarts login afterward',async t=>{
 const dir=await mkdtemp(join(tmpdir(),'feishu-cancel-test-')),disposers=[],routes=new Map();let release,begins=0;
 t.mock.method(DeviceAuth.prototype,'check',()=>new Promise(resolve=>{release=resolve;}));
 t.mock.method(DeviceAuth.prototype,'begin',async()=>{begins++;});
 const board={snapshot:()=>({tasks:[]}),subscribe:()=>()=>{}};
 const ctx={get:()=>board,workspaceRegistry:{},connection:{admit:()=>({peer:{id:'owner'}}),browserPeer:{id:'owner'}},webServer:{register:r=>{routes.set(r.path,r.handler);return()=>routes.delete(r.path);}},tools:{register:()=>()=>{}},effect(fn){const d=fn();if(d)disposers.push(d);}};
 const post=async action=>{const req=Readable.from([Buffer.from(JSON.stringify({action}))]);req.method='POST';req.headers={'content-type':'application/json','x-dsh-feishu-bugs':'1'};let status;await routes.get('/feishu-bugs/api')(req,{writeHead:s=>{status=s;},end:()=>{}});return status;};
 try{await apply(ctx,{storageDir:dir});const start=post('auth-start');await new Promise(resolve=>setImmediate(resolve));assert.equal(typeof release,'function');const cancelled=await Promise.race([post('auth-cancel'),new Promise(resolve=>setTimeout(()=>resolve('timeout'),250))]);assert.equal(cancelled,200);release(false);await start;assert.equal(begins,0);}
 finally{release?.(false);disposers.reverse().forEach(f=>f());await rm(dir,{recursive:true,force:true});}
});
test('a live session keeps its row running and blocks a second start',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'feishu-host-test-'));const disposers=[];const routes=new Map();let tool;
 const sessions={create:async()=>({sessionId:'s2'}),prompt:async()=>({accepted:true}),list:async()=>({items:[{sessionId:'s1',running:true}]}),inspect:async()=>({events:[]})};
 try{
  await writeFile(join(dir,'state.json'),JSON.stringify({version:1,selection:{},bugs:[{id:'p:bug:1',title:'Crash',status:'running',sessionId:'s1',cwd:'/unused',branch:'fix/bug',repo:'/unused'},{id:'p:bug:2',title:'Other',status:'queued',repo:'/unused'}],audit:[]}));
  const ctx={get:n=>n==='sessionController'?sessions:undefined,connection:{admit:()=>({peer:{id:'owner'}}),browserPeer:{id:'owner'}},webServer:{register:r=>{routes.set(r.path,r.handler);return()=>routes.delete(r.path);}},tools:{register:t=>{tool=t;return()=>{};}},effect(fn){const d=fn();if(d)disposers.push(d);}};
  await apply(ctx,{storageDir:dir});
  const s=await tool.execute();
  assert.equal(s.bugs[0].status,'running');assert.equal(s.sessions,true);assert.equal(s.sessionMissing,null);assert.equal(s.credentials,undefined);
  let body='';const req=Readable.from([Buffer.from(JSON.stringify({action:'start',id:'p:bug:2'}))]);req.method='POST';req.headers={'content-type':'application/json','x-dsh-feishu-bugs':'1'};
  await routes.get('/feishu-bugs/api')(req,{writeHead:()=>{},end:chunk=>{body+=chunk??'';}});
  assert.match(body,/already running/);
  assert.equal(JSON.parse(await readFile(join(dir,'state.json'),'utf8')).bugs[1].status,'queued');
 }finally{disposers.reverse().forEach(f=>f());await rm(dir,{recursive:true,force:true});}
});
test('the panel still serves listings when no repair session can be started',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'feishu-nosession-test-'));const disposers=[];const routes=new Map();let tool;
 try{
  await writeFile(join(dir,'state.json'),JSON.stringify({version:1,selection:{},bugs:[{id:'p:bug:1',title:'Crash',status:'queued',repo:'/unused'}],audit:[]}));
  const ctx={get:()=>undefined,connection:{admit:()=>({peer:{id:'owner'}}),browserPeer:{id:'owner'}},webServer:{register:r=>{routes.set(r.path,r.handler);return()=>routes.delete(r.path);}},tools:{register:t=>{tool=t;return()=>{};}},effect(fn){const d=fn();if(d)disposers.push(d);}};
  await apply(ctx,{storageDir:dir});
  const s=await tool.execute();
  assert.equal(s.sessions,false);assert.match(s.sessionMissing,/session service is unavailable/);assert.equal(s.bugs.length,1);
  let body='';const req=Readable.from([Buffer.from(JSON.stringify({action:'start',id:'p:bug:1'}))]);req.method='POST';req.headers={'content-type':'application/json','x-dsh-feishu-bugs':'1'};
  await routes.get('/feishu-bugs/api')(req,{writeHead:()=>{},end:chunk=>{body+=chunk??'';}});
  assert.match(body,/session service is unavailable/);
  assert.equal(JSON.parse(await readFile(join(dir,'state.json'),'utf8')).bugs[0].status,'queued');
 }finally{disposers.reverse().forEach(f=>f());await rm(dir,{recursive:true,force:true});}
});
test('a settled failure is not revived on every reload',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'feishu-revive-test-'));const disposers=[];const routes=new Map();let tool;
 const board={snapshot:()=>({tasks:[{id:'task1',status:'failed',executions:[{id:'e1',startedAt:1,endedAt:2,result:'failed',error:'boom'}]}]}),subscribe:()=>()=>{}};
 try{
  await writeFile(join(dir,'state.json'),JSON.stringify({version:1,selection:{},bugs:[{id:'p:bug:1',title:'Crash',status:'failed',taskId:'task1',cwd:'/unused',branch:'fix/bug',repo:'/unused',error:'boom'}],audit:[]}));
  const ctx={get:()=>board,connection:{admit:()=>({peer:{id:'owner'}}),browserPeer:{id:'owner'}},webServer:{register:r=>{routes.set(r.path,r.handler);return()=>routes.delete(r.path);}},tools:{register:t=>{tool=t;return()=>{};}},effect(fn){const d=fn();if(d)disposers.push(d);}};
  await apply(ctx,{storageDir:dir});
  const s=await tool.execute();
  assert.equal(s.bugs[0].status,'failed');assert.equal(s.bugs[0].error,'boom');
  const saved=JSON.parse(await readFile(join(dir,'state.json'),'utf8'));
  assert.equal(saved.bugs[0].status,'failed');
  assert.equal(saved.audit.filter(a=>a.action==='failed').length,0);
 }finally{disposers.reverse().forEach(f=>f());await rm(dir,{recursive:true,force:true});}
});
test('the repair-model catalog survives a late session controller registration',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'feishu-model-catalog-test-'));const disposers=[];const routes=new Map();let tool;
 const board={snapshot:()=>({tasks:[]}),subscribe:()=>()=>{}};
 const services=new Map([['taskBoard',board],['connection',{admit:()=>({peer:{id:'owner'}}),browserPeer:{id:'owner'}}],['webServer',{register:r=>{routes.set(r.path,r.handler);return()=>routes.delete(r.path);}}],['tools',{register:t=>{tool=t;return()=>{};}}]]);
 const ctx={get:n=>services.get(n),connection:services.get('connection'),webServer:services.get('webServer'),tools:services.get('tools'),effect(fn){const d=fn();if(d)disposers.push(d);}};
 try{
  await apply(ctx,{storageDir:dir});
  // No session controller yet: the panel must still serve a snapshot instead of throwing.
  assert.equal((await tool.execute()).models,null);
  services.set('sessionController',{modelCatalog:async()=>({default:{provider:'laien',model:'gpt-6.1-sol'},groups:[{id:'laien',name:'Laien',models:[{id:'gpt-6.1-sol',name:'GPT-6.1 Sol',reasoning:{defaultEffort:'high'}}]}]})});
  let late=await tool.execute();
  for(let i=0;i<50&&!late.models;i++){await new Promise(r=>setTimeout(r,10));late=await tool.execute();}
  assert.equal(late.models.groups[0].id,'laien');
  assert.equal(late.models.groups[0].models[0].id,'gpt-6.1-sol');
  assert.equal(late.models.groups[0].models[0].reasoningEffort,'high');
  assert.equal(late.models.default.model,'gpt-6.1-sol');
 }finally{disposers.reverse().forEach(f=>f());await rm(dir,{recursive:true,force:true});}
});
test('a run that settled while no event arrived stops reporting as running',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'feishu-settle-test-'));const disposers=[];let tool;
 let items=[{sessionId:'s1',running:true}];
 const events=[{type:'turn/start',seq:1,data:{turn:1}},{type:'assistant/message',seq:2,data:{message:{role:'assistant',content:[{type:'text',text:'fixed'}]}}},{type:'turn/end',seq:3,data:{reason:{kind:'completed'}}}];
 const sessions={create:async()=>({sessionId:'s1'}),prompt:async()=>({accepted:true}),list:async()=>({items}),inspect:async()=>({events})};
 try{
  await writeFile(join(dir,'state.json'),JSON.stringify({version:1,selection:{},bugs:[{id:'p:bug:1',title:'Crash',status:'running',sessionId:'s1',cwd:'/unused',branch:'fix/bug',repo:'/unused'}],audit:[]}));
  const ctx={get:n=>n==='sessionController'?sessions:undefined,connection:{admit:()=>({peer:{id:'owner'}}),browserPeer:{id:'owner'}},webServer:{register:()=>()=>{}},tools:{register:t=>{tool=t;return()=>{};}},effect(fn){const d=fn();if(d)disposers.push(d);}};
  await apply(ctx,{storageDir:dir});
  // The turn ends, but no event reaches the plugin: only the next read can notice it.
  items=[];
  const s=await tool.execute();
  assert.equal(s.bugs[0].status,'awaiting-verification');
  assert.equal(s.bugs[0].summary,'fixed');
  const saved=JSON.parse(await readFile(join(dir,'state.json'),'utf8'));
  assert.equal(saved.bugs[0].status,'awaiting-verification');
  assert.ok(saved.audit.some(a=>a.action==='succeeded'&&a.id==='p:bug:1'));
 }finally{disposers.reverse().forEach(f=>f());await rm(dir,{recursive:true,force:true});}
});
test('a running row is never silently marked failed when the session service disappears',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'feishu-nosession-run-'));const disposers=[];let tool;
 try{
  await writeFile(join(dir,'state.json'),JSON.stringify({version:1,selection:{},bugs:[{id:'p:bug:1',title:'Crash',status:'running',sessionId:'s1',cwd:'/unused',branch:'fix/bug',repo:'/unused'}],audit:[]}));
  const ctx={get:()=>undefined,connection:{admit:()=>({peer:{id:'owner'}}),browserPeer:{id:'owner'}},webServer:{register:()=>()=>{}},tools:{register:t=>{tool=t;return()=>{};}},effect(fn){const d=fn();if(d)disposers.push(d);}};
  await apply(ctx,{storageDir:dir});
  const s=await tool.execute();
  assert.equal(s.bugs[0].status,'running');
  assert.match(s.sessionMissing,/session service is unavailable/);
 }finally{disposers.reverse().forEach(f=>f());await rm(dir,{recursive:true,force:true});}
});

test('a row interrupted before its session existed fails with a next step',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'feishu-preparing-test-'));const disposers=[];let tool;
 try{
  await writeFile(join(dir,'state.json'),JSON.stringify({version:1,selection:{},bugs:[{id:'p:bug:1',title:'Crash',status:'preparing',cwd:'/unused',branch:'fix/bug',repo:'/unused'}],audit:[]}));
  const ctx={get:()=>undefined,connection:{admit:()=>({peer:{id:'owner'}}),browserPeer:{id:'owner'}},webServer:{register:()=>()=>{}},tools:{register:t=>{tool=t;return()=>{};}},effect(fn){const d=fn();if(d)disposers.push(d);}};
  await apply(ctx,{storageDir:dir});
  const s=await tool.execute();
  assert.equal(s.bugs[0].status,'failed');
  assert.match(s.bugs[0].error,/Interrupted during preparation/);
 }finally{disposers.reverse().forEach(f=>f());await rm(dir,{recursive:true,force:true});}
});
