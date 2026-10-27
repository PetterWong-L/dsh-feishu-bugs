import test from 'node:test';
import assert from 'node:assert/strict';
import {SessionRunner,SESSION_MISSING} from './session.js';
function fake(overrides={}) {
  const calls=[];
  const controller={
    create:async input=>{calls.push(['create',input]);return {sessionId:'s1'};},
    rename:async input=>{calls.push(['rename',input]);return {title:input.title};},
    selectModel:async input=>{calls.push(['selectModel',input]);return {selected:{}};},
    prompt:async input=>{calls.push(['prompt',input]);return {accepted:true};},
    inspect:async id=>({events:[],...overrides.inspect}),
    list:overrides.list??(async()=>({items:[]})),
    modelCatalog:async()=>({default:{provider:'p',model:'m'},groups:[]}),
  };
  return {calls,runner:new SessionRunner(n=>n==='sessionController'?controller:undefined)};
}
test('a repair is one named session prompt, not a task board task',async()=>{
  const {calls,runner}=fake();
  const out=await runner.launch({cwd:'/repo',title:'[Feishu 1] crash',prompt:'fix it',model:{provider:'laien',model:'sol',reasoningEffort:'high'},requestId:'r1'});
  assert.equal(out.sessionId,'s1');
  assert.deepEqual(calls[0],['create',{cwd:'/repo'}]);
  assert.deepEqual(calls[1],['rename',{sessionId:'s1',title:'[Feishu 1] crash'}]);
  assert.deepEqual(calls[2],['selectModel',{sessionId:'s1',provider:'laien',model:'sol',reasoningEffort:'high'}]);
  assert.deepEqual(calls[3],['prompt',{requestId:'r1',sessionId:'s1',mode:'queue',content:[{type:'text',text:'fix it'}]}]);
});
test('a direct Host prompt receives the cancellation signal required for admission',async()=>{
  let admitted=false;
  const runner=new SessionRunner(()=>({
    create:async()=>({sessionId:'s1'}),
    prompt:async(request,signal)=>{
      signal.throwIfAborted();
      assert.ok(signal instanceof AbortSignal);
      assert.equal(request.sessionId,'s1');
      admitted=true;
    },
  }));
  assert.deepEqual(await runner.launch({cwd:'/repo',prompt:'fix it'}),{sessionId:'s1'});
  assert.equal(admitted,true);
});
test('a registered workspace is preferred over a bare directory',async()=>{
  const {calls,runner}=fake();
  await runner.launch({cwd:'/repo',workspaceId:'ws1',prompt:'x'});
  assert.deepEqual(calls[0],['create',{workspaceId:'ws1'}]);
});
test('a missing model selection leaves the session default alone',async()=>{
  const {calls,runner}=fake();
  await runner.launch({cwd:'/repo',prompt:'x'});
  assert.ok(!calls.some(c=>c[0]==='selectModel'));
  assert.ok(!calls.some(c=>c[0]==='rename'));
});
test('an open turn keeps the row running',async()=>{
  const {runner}=fake({inspect:{events:[{type:'turn/start',seq:1},{type:'turn/end',seq:2,data:{reason:{kind:'completed'}}},{type:'turn/start',seq:3}]}});
  assert.equal((await runner.state('s1')).running,true);
});
test('a finished turn reports success with the last assistant text',async()=>{
  const {runner}=fake({inspect:{events:[
    {type:'turn/start',seq:1},
    {type:'assistant/message',seq:2,data:{message:{content:[{type:'reasoning',text:'thinking'},{type:'text',text:'committed 1a2b3c4'}]}}},
    {type:'turn/end',seq:3,data:{reason:{kind:'completed'}}},
  ]}});
  const state=await runner.state('s1');
  assert.equal(state.running,false);assert.equal(state.ok,true);assert.equal(state.summary,'committed 1a2b3c4');
});
test('a failed turn keeps the reason for the card',async()=>{
  const {runner}=fake({inspect:{events:[{type:'turn/start',seq:1},{type:'turn/end',seq:2,data:{reason:{kind:'error',reason:{kind:'model-error'}}}}]}});
  const state=await runner.state('s1');
  assert.equal(state.ok,false);
  assert.match(state.summary,/ended with error \(model-error\)/);
});
test('a session that cannot be read fails with a readable reason',async()=>{
  const {runner}=fake({inspect:undefined});
  const broken=new SessionRunner(n=>({create:async()=>({}),prompt:async()=>({}),inspect:async()=>{throw Error('gone');},list:async()=>({items:[]})}));
  const state=await broken.state('s1');
  assert.equal(state.ok,false);assert.match(state.summary,/could not be read/);
  assert.equal(typeof runner,'object');
});
test('live sessions are read from one listing call',async()=>{
  const {runner}=fake({list:async()=>({items:[{sessionId:'a',running:true},{sessionId:'b',running:false}]})});
  const live=await runner.liveIds();
  assert.equal(live.has('a'),true);assert.equal(live.has('b'),false);
});
test('an absent session service says so instead of throwing something opaque',async()=>{
  const runner=new SessionRunner(()=>undefined);
  assert.equal(runner.available(),false);
  await assert.rejects(runner.launch({cwd:'/repo',prompt:'x'}),e=>e.message===SESSION_MISSING);
});
