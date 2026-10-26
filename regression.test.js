import test from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';
import {Workflow} from './workflow.js';
const setup=()=>{const state={bugs:[],audit:[]};return new Workflow(state,{save:async()=>{},prepare:async()=>({cwd:'/isolated',branch:'fix/test'}),launch:async()=>({taskId:Math.random().toString()})});};
test('different bug starts cannot violate single running invariant',async()=>{const w=setup();await w.sync([{id:'a',title:'Crash'},{id:'b',title:'Blank page'}]);const r=await Promise.allSettled([w.start('a'),w.start('b')]);assert.equal(r.filter(v=>v.status==='fulfilled').length,1);});
test('sync repository mismatch refuses instead of silently repairing wrong repo',async()=>{const w=setup();await w.sync([{id:'a',title:'Crash',repo:'/A'}]);await assert.rejects(w.sync([{id:'a',title:'Crash',repo:'/B'}]),/repository/);assert.equal(w.bug('a').repo,'/A');});

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
