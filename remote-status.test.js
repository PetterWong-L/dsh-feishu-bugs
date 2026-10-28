import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,writeFile,readFile,rm} from 'node:fs/promises';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {Readable} from 'node:stream';
import {apply} from './index.js';
import {MeegleAPI} from './meegle.js';
import {DeviceAuth} from './auth.js';

test('only verified owner records may change Feishu state; failures preserve acceptance',async t=>{
 const dir=await mkdtemp(join(tmpdir(),'feishu-state-')),routes=new Map(),disposers=[];
 let authorized=true,fail=false,writes=0,reads=0;
 const initial={current:{key:'RESOLVED',name:'APPROVED'},options:[{id:'7',key:'CLOSED',name:'CLOSED',requiresForm:false}]};
 t.mock.method(DeviceAuth.prototype,'check',async()=>authorized);
 t.mock.method(MeegleAPI.prototype,'stateTransitions',async(p,type,id)=>{reads++;assert.equal(p,'p');assert.equal(type,'bug');assert.equal(id,1);return initial;});
 t.mock.method(MeegleAPI.prototype,'transitionState',async(p,type,id,transitionId,stateKey)=>{writes++;assert.equal(p,'p');assert.equal(type,'bug');assert.equal(id,1);assert.equal(transitionId,'7');assert.equal(stateKey,'CLOSED');if(fail)throw Error('remote refused');return {current:{key:'CLOSED',name:'CLOSED'},options:[]};});
 const ctx={get:()=>undefined,connection:{admit:()=>({peer:{id:'owner'}}),browserPeer:{id:'owner'}},webServer:{register:r=>{routes.set(r.path,r.handler);return()=>{};}},tools:{register:()=>()=>{}},effect(fn){const d=fn();if(d)disposers.push(d);}};
 const post=async args=>{const req=Readable.from([Buffer.from(JSON.stringify(args))]);req.method='POST';req.headers={'content-type':'application/json','x-dsh-feishu-bugs':'1'};let status,body='';await routes.get('/feishu-bugs/api')(req,{writeHead:s=>{status=s;},end:s=>{body+=s??'';}});return {status,body:JSON.parse(body)};};
 const saved=async()=>JSON.parse(await readFile(join(dir,'state.json'),'utf8'));
 try{
  await writeFile(join(dir,'state.json'),JSON.stringify({version:1,selection:{},bugs:[{id:'accepted',remoteId:1,projectKey:'p',typeKey:'bug',status:'verified',title:'Fixed'},{id:'pending',status:'awaiting-verification',title:'Pending'}],audit:[]}));
  await apply(ctx,{storageDir:dir});
  assert.notEqual((await post({action:'remote-statuses',id:'pending'})).status,200);assert.equal(reads,0);
  assert.notEqual((await post({action:'remote-status',id:'pending',transitionId:'7',stateKey:'CLOSED'})).status,200);assert.equal(writes,0);
  authorized=false;assert.notEqual((await post({action:'remote-statuses',id:'accepted'})).status,200);assert.equal(reads,0);
  authorized=true;
  assert.equal((await post({action:'remote-statuses',id:'accepted'})).status,200);
  assert.deepEqual((await saved()).bugs[0].remoteWorkflow.current,initial.current);
  fail=true;assert.notEqual((await post({action:'remote-status',id:'accepted',transitionId:'7',stateKey:'CLOSED'})).status,200);
  assert.equal((await saved()).bugs[0].status,'verified');assert.equal((await saved()).bugs[0].remoteWorkflow,undefined);
  fail=false;const result=await post({action:'remote-status',id:'accepted',transitionId:'7',stateKey:'CLOSED'});assert.equal(result.status,200);
  const s=await saved();assert.equal(s.bugs[0].status,'verified');assert.equal(s.bugs[0].remoteWorkflow.current.name,'CLOSED');assert.ok(s.bugs[0].remoteWorkflow.updatedAt);
  assert.ok(s.audit.some(a=>a.action==='feishu-status-updated'&&a.id==='accepted'&&a.to==='CLOSED'));
 }finally{disposers.reverse().forEach(f=>f());await rm(dir,{recursive:true,force:true});}
});
