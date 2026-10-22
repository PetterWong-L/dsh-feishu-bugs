import test from 'node:test';import assert from 'node:assert/strict';import {MeegleAPI,rows} from './meegle.js';import {cliEnvironment} from './cli.js';
test('CLI environment does not inherit token or alternate-host overrides',()=>{const env=cliEnvironment({PATH:'/bin',MEEGLE_HOST:'evil',MEEGLE_USER_ACCESS_TOKEN:'SECRET',MEEGLE_CONFIG:'x'});assert.equal(env.MEEGLE_HOST,'project.feishu.cn');assert.equal(env.MEEGLE_USER_ACCESS_TOKEN,undefined);assert.equal(env.MEEGLE_CONFIG,undefined);assert.equal(env.MEEGLE_TELEMETRY,'disabled');});
test('reads CLI list envelope, fails closed on truncated pagination or errors',()=>{assert.deepEqual(rows({data:{list:[{id:1}],pagination:{has_more:false}},error:null}),[{id:1}]);assert.throws(()=>rows({list:[],pagination:{has_more:true}}),/pagination/);assert.throws(()=>rows({error:{code:'no'}}));assert.throws(()=>rows({unknown:[]}));});
test('outer pagination is not lost during unwrap',()=>{for(const value of [{data:[{id:1}],pagination:{has_more:true}},{data:{list:[{id:1}]},total:100},{data:[],next_page_token:'next'},{data:[],has_more:true}])assert.throws(()=>rows(value),/pagination/);});
test('project search uses the real named projects collection, carries simple name and enforces pagination',async()=>{
 const projects=[{project_key:'project-a',name:'Example',simple_name:'example'}];
 const api=new MeegleAPI(async()=>({pagination:{has_more:false,page_num:1,page_size:50,total:1},projects}));
 assert.deepEqual(await api.projects(),[{key:'project-a',name:'Example',simpleName:'example'}]);
 const partial=new MeegleAPI(async()=>({pagination:{has_more:true,total:2},projects}));await assert.rejects(partial.projects(),/pagination/);
 const empty=new MeegleAPI(async()=>({pagination:{has_more:false,total:0},projects:[]}));assert.deepEqual(await empty.projects(),[]);
 const noSimple=new MeegleAPI(async()=>({projects:[{project_key:'p',name:'P'}]}));await assert.rejects(noSimple.projects(),/simple name/);
 assert.throws(()=>rows({projects}),/list shape/);
});
test('runtime help must prove command flags, no guessed type-key arguments',async()=>{const calls=[];const api=new MeegleAPI(async(args)=>{calls.push(args);if(args.includes('--help'))return '--unknown string';throw Error('must not invoke business command');});await assert.rejects(api.types('oog'),/project-key/);assert.equal(calls.length,1);});
test('catalog normalizes explicit type keys only',async()=>{const api=new MeegleAPI(async(args)=>args.includes('--help')?'--project-key string':{list:[{work_item_type_key:'bug',name:'缺陷'}]});assert.deepEqual(await api.types('oog'),[{key:'bug',name:'缺陷'}]);});
