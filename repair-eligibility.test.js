import test from 'node:test';
import assert from 'node:assert/strict';
import {Workflow,pruneUnstarted} from './workflow.js';
import {MeegleAPI} from './meegle.js';
import {runner,row,selection} from './mql.test.js';

function setup(bugs=[]){
 const state={bugs,audit:[]},started=[];
 const w=new Workflow(state,{save:async()=>{},prepare:async b=>{started.push(b.id);return {cwd:'/tmp/fix',branch:'fix/bug'};},launch:async()=>({sessionId:'s1'})});
 return {w,state,started};
}
test('mixed remote states remain readable but only BUG and reopened items enter repair review',async()=>{
 const result=await new MeegleAPI(runner({BUG:{rows:[row(1)]},REOPENED:{rows:[row(2)]},APPROVED:{rows:[row(3)]},CLOSED:{rows:[row(4)]}})).bugs({...selection,statuses:['BUG','REOPENED','APPROVED','CLOSED']});
 assert.deepEqual(result.items.map(b=>b.remoteStatus),['BUG','REOPENED','APPROVED','CLOSED']);
 const {w,state,started}=setup();await w.sync(result.items);
 assert.deepEqual(state.bugs.map(b=>b.status),['queued','queued','imported','imported']);
 await assert.rejects(w.start('oog:issue:3'),/not queued|not eligible/);assert.deepEqual(started,[]);
});
test('only explicit bug or reopen labels are eligible, including case variants',async()=>{
 const statuses=['Bug','reopen','Reopened','APPROVED','DEBUG','REOPENING','',undefined];
 const {w,state}=setup();
 await w.sync(statuses.map((remoteStatus,i)=>({id:String(i),title:['crash','blank screen','network timeout','layout','memory','scroll','keyboard','touch'][i],remoteStatus})));
 assert.deepEqual(state.bugs.map(b=>b.status),['queued','queued','queued','imported','imported','imported','imported','imported']);
});
test('ineligible lookalikes do not enter duplicate review; reopening still requires review',async()=>{
 const {w}=setup();await w.sync([{id:'a',title:'Same crash',remoteStatus:'APPROVED'},{id:'b',title:'Same crash',remoteStatus:'CLOSED'}]);
 assert.equal(w.bug('b').status,'imported');assert.deepEqual(w.bug('b').candidates,[]);
 await assert.rejects(w.decide('b','distinct',true),/review/);
 await w.sync([{id:'b',title:'Same crash',remoteStatus:'REOPENED'}]);assert.equal(w.bug('b').status,'duplicate-review');
});
test('refresh corrects untouched legacy queues and preserves execution and human decisions',async()=>{
 const bugs=[{id:'queued',status:'queued'},{id:'review',status:'duplicate-review',candidates:[{id:'x'}]},{id:'approved',status:'queued',duplicateDecision:'distinct'},{id:'running',status:'running',sessionId:'s1'},{id:'verified',status:'verified'},{id:'skipped',status:'skipped',duplicateDecision:'duplicate'}].map(b=>({...b,title:b.id,repo:'/repo'}));
 const {w}=setup(bugs);await w.sync(bugs.map(b=>({id:b.id,repo:b.repo,title:b.title,remoteStatus:'APPROVED'})));
 assert.deepEqual(bugs.map(b=>b.status),['imported','imported','imported','running','verified','skipped']);
 assert.deepEqual(bugs[1].candidates,[]);assert.ok(bugs.every(b=>b.remoteStatus==='APPROVED'));
 await w.sync([{id:'approved',repo:'/repo',title:'approved',remoteStatus:'BUG'}]);assert.equal(w.bug('approved').status,'queued');assert.equal(w.bug('approved').duplicateDecision,'distinct');
});
test('persisted ineligible queues cannot launch until refreshed with an eligible state',async()=>{
 for(const remoteStatus of ['APPROVED',undefined]){
  const {w,started}=setup([{id:'old',title:'Legacy',status:'queued',remoteStatus}]);
  await assert.rejects(w.start('old'),/not eligible/);assert.deepEqual(started,[]);
 }
});
test('neutral imports outside the next complete filter are pruned like untouched queues',()=>{
 assert.deepEqual(pruneUnstarted([{id:'keep',status:'imported'},{id:'drop',status:'imported'},{id:'work',status:'imported',cwd:'/tmp/work'}],['keep']).map(b=>b.id),['keep','work']);
});
