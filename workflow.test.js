import test from 'node:test';
import assert from 'node:assert/strict';
import { Workflow, pruneUnstarted } from './workflow.js';

function setup() { const calls=[]; const state={bugs:[],audit:[]}; return {calls,state,w:new Workflow(state,{save:async()=>{},prepare:async b=>{calls.push(b.id);return {branch:`fix/feishu-${b.id}`,cwd:'/tmp/isolated'};},launch:async()=>({taskId:'task-1'})})}; }
test('idempotent sync retains human decisions and queues duplicate candidates',async()=>{const {w,state}=setup(); await w.sync([{id:'1',remoteStatus:'BUG',title:'按钮无法点击'},{id:'2',remoteStatus:'BUG',title:'按钮无法点击'}]); assert.equal(state.bugs[1].status,'duplicate-review'); await w.decide('2','duplicate',true); await w.sync([{id:'2',remoteStatus:'BUG',title:'按钮无法点击'}]); assert.equal(state.bugs.length,2); assert.equal(state.bugs[1].status,'skipped');});
test('duplicate confirmation is human-only and occurs before any branch',async()=>{const {w,calls}=setup(); await w.sync([{id:'1',remoteStatus:'BUG',title:'same bug'},{id:'2',remoteStatus:'BUG',title:'same bug'}]); await assert.rejects(w.decide('2','distinct',false),/owner/); await assert.rejects(w.start('2'),/duplicate/); assert.deepEqual(calls,[]); await w.decide('2','distinct',true); await w.start('2'); assert.deepEqual(calls,['2']);});
test('parallel starts cannot launch two tasks for one bug',async()=>{const {w,calls}=setup();await w.sync([{id:'1',remoteStatus:'BUG',title:'crash'}]); const out=await Promise.allSettled([w.start('1'),w.start('1')]);assert.equal(out.filter(x=>x.status==='fulfilled').length,1); assert.equal(calls.length,1);});
test('completion does not mean verified or merged and failed task stays failed',async()=>{const {w,state}=setup(); await w.sync([{id:'1',remoteStatus:'BUG',title:'crash'}]); await w.start('1'); await w.outcome('task-1','succeeded','checks passed'); assert.equal(state.bugs[0].status,'awaiting-verification'); await assert.rejects(w.verify('1',true,false),/owner/); await w.verify('1',true,true); assert.equal(state.bugs[0].status,'verified');assert.equal(state.bugs[0].merged,undefined);});
test('cross-project ids and stale duplicate approvals are not conflated',async()=>{const {w,state}=setup(); await w.sync([{id:'p:a:1',remoteStatus:'BUG',title:'bug'},{id:'q:a:1',remoteStatus:'BUG',title:'bug'}]); assert.equal(state.bugs.length,2); await assert.rejects(w.decide('p:a:1','duplicate',true),/review/);});
test('pruneUnstarted removes only untouched imported items outside the filter', () => {
  const bugs = [
    {id:'a', status:'queued'},
    {id:'b', status:'queued', cwd:'/tmp/wt', branch:'fix/x'},
    {id:'c', status:'duplicate-review'},
    {id:'d', status:'skipped', duplicateDecision:'duplicate'},
    {id:'e', status:'verified'},
    {id:'f', status:'running', taskId:'task-1'},
  ];
  const kept = pruneUnstarted(bugs, ['a']);
  assert.deepEqual(kept.map(b => b.id), ['a','b','d','e','f']);
});
test('passing verification hands the closed bug to the workspace cleanup hook',async()=>{
 const closed=[];const state={bugs:[],audit:[]};
 const w=new Workflow(state,{save:async()=>{},prepare:async b=>({branch:`fix/feishu-${b.id}`,cwd:'/tmp/isolated'}),launch:async()=>({taskId:'task-1',workspaceId:'ws-1'}),afterClose:async b=>{closed.push(b.id);b.workspaceId=undefined;}});
 await w.sync([{id:'1',remoteStatus:'BUG',title:'crash'}]);await w.start('1');await w.outcome('task-1','succeeded','ok');
 await w.verify('1',false,true);assert.deepEqual(closed,[]);
 state.bugs[0].status='awaiting-verification';
 await w.verify('1',true,true);assert.deepEqual(closed,['1']);assert.equal(state.bugs[0].workspaceId,undefined);
});
test('markGone flags survivors and clears when they return',async()=>{
 const {markGone}=await import('./workflow.js');
 const bugs=[{id:'a',status:'queued'},{id:'b',status:'verified'},{id:'c',status:'awaiting-verification'}];
 markGone(bugs,['a'],()=>'T1');
 assert.equal(bugs[0].gone,undefined);assert.equal(bugs[1].gone,'T1');assert.equal(bugs[2].gone,'T1');
 markGone(bugs,['a','b'],()=>'T2');
 assert.equal(bugs[1].gone,undefined);assert.equal(bugs[2].gone,'T1');
});
test('cleanNote keeps a bounded plain-text note',async()=>{
 const {cleanNote}=await import('./workflow.js');
 assert.equal(cleanNote(undefined),'');
 assert.equal(cleanNote('  先看埋点\u0007日志  '),'先看埋点日志');
 assert.equal(cleanNote('x'.repeat(5000)).length,2000);
});
test('a run that failed before its branch existed can restart without feedback',async()=>{
 const calls=[];const state={bugs:[{id:'1',status:'failed',repo:'/repo',error:'The repository has uncommitted changes'}],audit:[]};
 let launched=0;
 const w=new Workflow(state,{save:async()=>{},prepare:async b=>{calls.push('prepare');return {branch:'fix/feishu-1',cwd:'/tmp/isolated'};},launch:async(b,note)=>{launched++;calls.push('launch:'+note);return {taskId:'task-9'};}});
 const b=await w.retry('1','',async(b,note)=>{launched++;calls.push('launch:'+note);return {taskId:'task-9'};});
 assert.equal(b.status,'running');assert.equal(b.taskId,'task-9');assert.equal(b.error,undefined);
 assert.deepEqual(calls,['prepare','launch:']);
});
test('a failed execution surfaces its reason on the card',async()=>{
 const state={bugs:[],audit:[]};
 const w=new Workflow(state,{save:async()=>{},prepare:async b=>({branch:'fix/x',cwd:'/tmp/wt'}),launch:async()=>({taskId:'t1'})});
 await w.sync([{id:'1',remoteStatus:'BUG',title:'crash'}]);await w.start('1');
 await w.outcome('t1','failed','xcodebuild: error: no scheme named SevMinWorkout');
 assert.equal(state.bugs[0].status,'failed');
 assert.match(state.bugs[0].error,/no scheme named SevMinWorkout/);
});
