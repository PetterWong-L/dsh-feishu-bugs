import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,writeFile,readFile,rm} from 'node:fs/promises';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {Readable} from 'node:stream';
import {apply} from './index.js';
import {MeegleAPI} from './meegle.js';
import {DeviceAuth} from './auth.js';
test('requirement catalog is scoped and selection survives sync and restart',async t=>{
 const dir=await mkdtemp(join(tmpdir(),'feishu-requirements-')),routes=new Map(),disposers=[];
 let authorized=true,imports=0;
 t.mock.method(DeviceAuth.prototype,'check',async()=>authorized);
 t.mock.method(MeegleAPI.prototype,'requirements',async()=>({fieldKey:'_field_linked_story',fieldName:'所属需求（缺陷）',options:[{id:'123',name:'OOG101'}]}));
 t.mock.method(MeegleAPI.prototype,'bugs',async s=>{imports++;assert.equal(s.requirementId,'123');assert.deepEqual(s.statuses,['BUG']);return {items:[],total:0,truncated:false};});
 const ctx={get:()=>undefined,connection:{admit:()=>({peer:{id:'owner'}}),browserPeer:{id:'owner'}},webServer:{register:r=>{routes.set(r.path,r.handler);return()=>{};}},tools:{register:()=>()=>{}},effect(fn){const d=fn();if(d)disposers.push(d);}};
 const post=async args=>{const req=Readable.from([Buffer.from(JSON.stringify(args))]);req.method='POST';req.headers={'content-type':'application/json','x-dsh-feishu-bugs':'1'};let status,body='';await routes.get('/feishu-bugs/api')(req,{writeHead:s=>{status=s;},end:s=>{body+=s??'';}});return {status,body:JSON.parse(body)};};
 const saved=async()=>JSON.parse(await readFile(join(dir,'state.json'),'utf8'));
 try{
  await writeFile(join(dir,'state.json'),JSON.stringify({version:1,selection:{},bugs:[],audit:[],catalog:{projectKey:'p',projects:[{key:'p',name:'项目',simpleName:'p'}],types:[{key:'issue',name:'缺陷'}]}}));
  await apply(ctx,{storageDir:dir});
  authorized=false;assert.notEqual((await post({action:'requirements',projectKey:'p',typeKey:'issue'})).status,200);
  authorized=true;const loaded=await post({action:'requirements',projectKey:'p',typeKey:'issue'});assert.equal(loaded.status,200);assert.equal(loaded.body.catalog.requirements.options[0].id,'123');
  const selection={repo:'/repo',projectKey:'p',typeKey:'issue',statuses:['BUG'],requirementId:'123'};
  assert.notEqual((await post({action:'sync',selection:{...selection,requirementId:'999'}})).status,200);assert.equal(imports,0);
  assert.equal((await post({action:'sync',selection})).status,200);assert.equal((await saved()).selection.requirementName,'OOG101');
  disposers.splice(0).reverse().forEach(f=>f());await apply(ctx,{storageDir:dir});
  assert.equal((await saved()).selection.requirementId,'123');
 }finally{disposers.reverse().forEach(f=>f());await rm(dir,{recursive:true,force:true});}
});
