import test from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';
import {Workflow} from './workflow.js';
const setup=()=>{const state={bugs:[],audit:[]};return new Workflow(state,{save:async()=>{},prepare:async()=>({cwd:'/isolated',branch:'fix/test'}),launch:async()=>({taskId:Math.random().toString()})});};
test('different bug starts cannot violate single running invariant',async()=>{const w=setup();await w.sync([{id:'a',remoteStatus:'BUG',title:'Crash'},{id:'b',remoteStatus:'BUG',title:'Blank page'}]);const r=await Promise.allSettled([w.start('a'),w.start('b')]);assert.equal(r.filter(v=>v.status==='fulfilled').length,1);});
test('sync repository mismatch refuses instead of silently repairing wrong repo',async()=>{const w=setup();await w.sync([{id:'a',remoteStatus:'BUG',title:'Crash',repo:'/A'}]);await assert.rejects(w.sync([{id:'a',remoteStatus:'BUG',title:'Crash',repo:'/B'}]),/repository/);assert.equal(w.bug('a').repo,'/A');});

test('retry feedback uses inline UI, never window.prompt (unsupported in Electron)', async () => {
  const { readFile } = await import('node:fs/promises');
  const source = await readFile(new URL('./client.js', import.meta.url), 'utf8');
  assert.ok(!source.includes('window.prompt'), 'window.prompt silently returns null in the Harness webview');
  assert.match(source, /className:'fb-feedback'/);
  assert.match(source, /action:'retry',id:b\.id,feedback:feedbackText\.trim\(\)/);
});

test('fix prompt prefers a connected Xcode MCP over xcrun builds', async () => {
  const source = await readFile(new URL('./index.js', import.meta.url), 'utf8');
  const mcp = source.indexOf('mcp__xcode__');
  const cli = source.indexOf('xcodebuild -workspace');
  assert.ok(mcp > 0 && cli > mcp, 'MCP guidance must come before the CLI fallback');
  assert.match(source, /Only when no Xcode MCP tool is connected/);
  assert.match(source, /Never pass '-sdk iphonesimulator'/, 'forcing an SDK breaks the macro plugin');
});

test('restarting a failed run offers the same optional note as starting one', async () => {
  const source = await readFile(new URL('./client.js', import.meta.url), 'utf8');
  assert.match(source, /noteEditor\(b,'restart'\)/);
  assert.match(source, /noteEditor\(b,'start'\)/);
  assert.match(source, /restartGo:'重新开始'/);
  assert.match(source, /restartGo:'Restart now'/);
  const host = await readFile(new URL('./workflow.js', import.meta.url), 'utf8');
  assert.match(host, /launch\(b,note,restart\?'restart':undefined\)/);
});
test('an in-repo row keeps its own commit instead of the newest branch in the shared tree', async () => {
 const source = await readFile(new URL('./index.js', import.meta.url), 'utf8');
 assert.match(source, /b\.inRepo&&await currentBranch\(b\.cwd\)!==b\.branch\)return \{\};/);
});
test('an in-repo row still offers verification buttons', async () => {
  const source = await readFile(new URL('./client.js', import.meta.url), 'utf8');
  const line = source.split('\n').find(l => l.includes("b.status==='awaiting-verification'&&h(React.Fragment,null"));
  assert.ok(line, 'verification row must render');
  assert.match(source, /b\.status==='awaiting-verification'&&b\.cwd!==b\.repo&&button\(t\('checkoutBranch'\)/, 'checkout stays worktree-only');
  assert.match(line, /action:'verify',id:b\.id,passed:true/, 'pass must render for in-repo rows');
  assert.match(line, /action:'verify',id:b\.id,passed:false/, 'reject must render for in-repo rows');
});

test('repairs start through the session domain, never the task board', async () => {
  const source = await readFile(new URL('./index.js', import.meta.url), 'utf8');
  assert.match(source, /if\(\['start','retry','queue'\]\.includes\(args\.action\)\)sessions\.ctrl\(\);/);
  assert.ok(!source.includes("kind:'create'"), 'no task-board task is created for a repair');
  assert.ok(!source.includes('board.apply'), 'the panel never writes to the task board');
  assert.ok(!source.includes('requireBoard'), 'the board is not a gate for any action');
  assert.match(source, /export const inject=\['webServer','connection','tools'\];/, 'board is not an injected dependency');
  const client = await readFile(new URL('./client.js', import.meta.url), 'utf8');
  assert.ok(!client.includes("data?.taskBoard!==false"), 'panel actions must not be gated on the board');
  assert.ok(!client.includes("selectPanel('task-board')"), 'no task-board panel is opened');
});
