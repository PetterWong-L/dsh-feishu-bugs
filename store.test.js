import test from 'node:test';
import assert from 'node:assert/strict';
import {resolveStorageDir} from './store.js';

const none = () => false;
const home = '/home/u';

test('explicit storageDir wins over every default', () => {
 assert.equal(resolveStorageDir({storageDir:'/data/x'}, home, none), '/data/x');
});

test('defaults to the .dsh data directory', () => {
 assert.equal(resolveStorageDir({}, home, none), '/home/u/.dsh/feishu-bugs-data');
});

test('adopts pre-1.0 state once instead of showing an empty queue', () => {
 const exists = p => p === '/home/u/dsh/feishu-bugs-data/state.json';
 assert.equal(resolveStorageDir({}, home, exists), '/home/u/dsh/feishu-bugs-data');
});

test('never overrides real data in the new location', () => {
 const exists = p => p.endsWith('state.json');
 assert.equal(resolveStorageDir({}, home, exists), '/home/u/.dsh/feishu-bugs-data');
});
