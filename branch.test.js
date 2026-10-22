import test from 'node:test';
import assert from 'node:assert/strict';
import { branchName } from './git.js';

test('branch carries the Feishu bug number first, plus an ASCII slug when present', () => {
  assert.equal(branchName({remoteId: 7142958749, title: '【daily7】personal plan封面名称'}), 'fix/feishu-7142958749-daily7-personal-plan');
  assert.equal(branchName({remoteId: 42, title: 'Player crash on exit'}), 'fix/feishu-42-player-crash-on-exit');
  assert.equal(branchName({remoteId: 7, title: 'A/B test: (v2) 修复'}), 'fix/feishu-7-a-b-test-v2');
  assert.throws(() => branchName({title: 'no number'}), /number is required/);
  assert.throws(() => branchName({remoteId: 'abc', title: 'x'}), /number is required/);
});
