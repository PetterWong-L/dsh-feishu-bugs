import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,writeFile,readFile,rm} from 'node:fs/promises';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {Readable} from 'node:stream';
import {apply} from './index.js';
import {DeviceAuth} from './auth.js';

test('owner completion is persisted, blocks stale actions and survives reload',async t=>{
 t.mock.method(DeviceAuth.prototype,'check',async()=>false);
 const dir=await mkdtemp(join(tmpdir(),'feishu-completion-')),disposers=[],routes=new Map();
 t.after(async()=>{disposers.reverse().forEach(fn=>fn());await rm(dir,{recursive:true,force:true});});
 const sessions={create:async()=>{},prompt:async()=>{},list:async()=>({items:[{sessionId:'live',running:true}]}),inspect:async id=>({events:id==='live'?[{type:'turn/start',seq:1}]:[{type:'turn/end',seq:2,data:{reason:{kind:'completed'}}}]})};
 const ctx={get:n=>n==='sessionController'?sessions:undefined,connection:{admit:()=>({peer:{id:'owner'}}),browserPeer:{id:'owner'}},webServer:{register:r=>{routes.set(r.path,r.handler);return()=>routes.delete(r.path);}},tools:{register:()=>()=>{}},effect(fn){const off=fn();if(off)disposers.push(off);}};
 await writeFile(join(dir,'state.json'),JSON.stringify({version:1,selection:{},audit:[],bugs:[
  {id:'done',status:'verified',sessionId:'ended',branch:'fix/1',remoteStatus:'BUG'},
  {id:'active',status:'verified',sessionId:'live'},
  {id:'build',status:'verified',build:{state:'running'}}
 ]}));
 await apply(ctx,{storageDir:dir});
 const post=async args=>{
  const req=Readable.from([Buffer.from(JSON.stringify(args))]);req.method='POST';req.headers={'content-type':'application/json','x-dsh-feishu-bugs':'1'};
  let status,body;await routes.get('/feishu-bugs/api')(req,{writeHead:s=>{status=s;},end:chunk=>{body=JSON.parse(chunk);}});return {status,body};
 };
 for(const id of ['active','build']){const result=await post({action:'complete',id});assert.equal(result.status,400);assert.match(result.body.error,/still running/);}
 const result=await post({action:'complete',id:'done'});assert.equal(result.status,200);
 const completed=result.body.bugs.find(b=>b.id==='done');assert.equal(completed.status,'completed');assert.ok(completed.completedAt);
 for(const action of ['start','retry','decide','verify','commit','provision','build','checkout','open-xcode','remote-statuses','remote-status']){
  const denied=await post({action,id:'done',passed:true});assert.equal(denied.status,400,action);assert.match(denied.body.error,/completed/,action);
 }
 const again=await post({action:'complete',id:'done'});assert.equal(again.status,200);
 const saved=JSON.parse(await readFile(join(dir,'state.json'),'utf8'));assert.equal(saved.bugs[0].completedAt,completed.completedAt);assert.equal(saved.audit.filter(a=>a.action==='completed').length,1);
 disposers.splice(0).reverse().forEach(fn=>fn());await apply(ctx,{storageDir:dir});
 const reloaded=await post({action:'complete',id:'done'});assert.equal(reloaded.body.bugs[0].status,'completed');assert.equal(reloaded.body.bugs[0].completedAt,completed.completedAt);
});
