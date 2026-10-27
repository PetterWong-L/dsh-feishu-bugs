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
test('restart reconciles accepted running tasks instead of allowing duplicate retry',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'feishu-host-test-'));const disposers=[];const routes=new Map();let tool;
 const board={snapshot:()=>({tasks:[{id:'task1',status:'running',executions:[{id:'e1',startedAt:1}]}]}),subscribe:()=>()=>{}};
 try{
  await writeFile(join(dir,'state.json'),JSON.stringify({version:1,selection:{},bugs:[{id:'p:bug:1',title:'Crash',status:'preparing',taskId:'task1',cwd:'/unused',branch:'fix/bug',repo:'/unused'}],audit:[]}));
  const ctx={get:()=>board,workspaceRegistry:{},connection:{},webServer:{register:r=>{routes.set(r.path,r.handler);return()=>routes.delete(r.path);}},tools:{register:t=>{tool=t;return()=>{};}},effect(fn){const d=fn();if(d)disposers.push(d);}};
  await apply(ctx,{storageDir:dir});const s=await tool.execute();assert.equal(s.bugs[0].status,'running');assert.equal(s.configured,false);assert.equal(s.credentials,undefined);assert.equal(JSON.parse(await readFile(join(dir,'state.json'),'utf8')).bugs[0].status,'running');assert.ok(routes.has('/feishu-bugs/api'));
 }finally{disposers.reverse().forEach(f=>f());await rm(dir,{recursive:true,force:true});}
});
test('panel still serves listings when the task board plugin is absent',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'feishu-noboard-test-'));const disposers=[];const routes=new Map();let tool;
 try{
  await writeFile(join(dir,'state.json'),JSON.stringify({version:1,selection:{},bugs:[{id:'p:bug:1',title:'Crash',status:'queued',repo:'/unused'}],audit:[]}));
  const ctx={get:()=>undefined,connection:{admit:()=>({peer:{id:'owner'}}),browserPeer:{id:'owner'}},webServer:{register:r=>{routes.set(r.path,r.handler);return()=>routes.delete(r.path);}},tools:{register:t=>{tool=t;return()=>{};}},effect(fn){const d=fn();if(d)disposers.push(d);}};
  await apply(ctx,{storageDir:dir});
  const s=await tool.execute();
  assert.equal(s.taskBoard,false);assert.equal(s.boardMissing.includes('task board plugin is not enabled'),true);assert.equal(s.bugs.length,1);
  const req=Readable.from([Buffer.from(JSON.stringify({action:'start',id:'p:bug:1'}))]);req.method='POST';req.headers={'content-type':'application/json','x-dsh-feishu-bugs':'1'};
  let body='';await routes.get('/feishu-bugs/api')(req,{writeHead:()=>{},end:chunk=>{body+=chunk??'';}});
  assert.match(body,/task board plugin is not enabled/);
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
