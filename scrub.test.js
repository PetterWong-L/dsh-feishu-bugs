import assert from 'node:assert/strict';
import test from 'node:test';
import {scrub} from './scrub.js';

test('drops undefined object members and round-trips through JSON',()=>{
  const clean=scrub({a:1,b:undefined,c:{d:undefined,e:2},f:[1,undefined,{g:undefined,h:3}]});
  assert.deepEqual(clean,{a:1,c:{e:2},f:[1,{h:3}]});
  assert.deepEqual(JSON.parse(JSON.stringify(clean)),clean);
});

test('keeps null and false',()=>{
  assert.deepEqual(scrub({a:null,b:false,c:0}),{a:null,b:false,c:0});
});
