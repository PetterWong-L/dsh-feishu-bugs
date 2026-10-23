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
test('downloads image attachments into the worktree with sanitized, non-traversing names',async()=>{
 const {mkdtemp,readdir,rm,writeFile}=await import('node:fs/promises');const {tmpdir}=await import('node:os');const {join}=await import('node:path');
 const dir=await mkdtemp(join(tmpdir(),'fb-att-'));const calls=[];
 const api=new MeegleAPI(async args=>{
  if(args[0]==='workitem'&&args[1]==='get')return {work_item_fields:[{key:'multi_attachment',name:'多个附件',value:[
   {url:'https://project.feishu.cn/goapi/1',name:'shot one.png',type:'image/png'},
   {url:'https://project.feishu.cn/goapi/2',name:'../../evil.png',type:'image/png'},
   {url:'https://project.feishu.cn/goapi/3',name:'report.pdf',type:'application/pdf'}]}]};
  if(args[0]==='attachment'&&args[1]==='+download'){calls.push(args);const i=args.indexOf('--output');await writeFile(args[i+1],Buffer.alloc(8));return {path:args[i+1],size:8};}
  throw Error('unexpected '+args.join(' '));
 });
 const r=await api.attachments('proj','123',dir);
 assert.equal(r.found,3);assert.equal(r.files.length,2);assert.equal(r.skipped.length,1);assert.equal(r.skipped[0].name,'report.pdf');
 assert.match(r.files[0].path,/01-shot-one\.png$/);assert.match(r.files[1].path,/02-evil\.png$/);
 assert.equal(calls[0][2].startsWith('https://project.feishu.cn/goapi/'),true);
 assert.deepEqual((await readdir(join(dir,'.feishu-attachments'))).sort(),['01-shot-one.png','02-evil.png']);
 await rm(dir,{recursive:true,force:true});
});
test('attachment download caps the batch and reports failures without losing the rest',async()=>{
 const {mkdtemp,writeFile}=await import('node:fs/promises');const {tmpdir}=await import('node:os');const {join}=await import('node:path');
 const dir=await mkdtemp(join(tmpdir(),'fb-att-'));const many=Array.from({length:7},(_,i)=>({url:`https://project.feishu.cn/goapi/${i}`,name:`s${i}.jpg`,type:'image/jpeg'}));
 const api=new MeegleAPI(async args=>{
  if(args[0]==='workitem'&&args[1]==='get')return {work_item_fields:[{key:'multi_attachment',value:many}]};
  if(args[0]==='attachment'&&args[1]==='+download'){const i=args.indexOf('--output');if(args[2].endsWith('/1'))throw Error('CLIENT_FILE_SIGN_MISMATCH');await writeFile(args[i+1],Buffer.alloc(4));return {};}
  throw Error('unexpected');
 });
 const r=await api.attachments('proj','9',dir);
 assert.equal(r.found,7);assert.equal(r.files.length,5);assert.equal(r.skipped.length,2);
 assert.equal(r.skipped[0].name,'s1.jpg');assert.match(r.skipped[0].reason,/failed/i);
 assert.equal(r.skipped[1].name,'s6.jpg');assert.match(r.skipped[1].reason,/limit/i);
});
test('no attachment fields means no download calls',async()=>{
 const dir='/tmp/does-not-matter';let downloads=0;
 const api=new MeegleAPI(async args=>{if(args[0]==='workitem')return {work_item_fields:[{key:'description',value:''}]};downloads++;return {};});
 const r=await api.attachments('proj','1',dir);
 assert.deepEqual(r.files,[]);assert.equal(r.found,0);assert.equal(downloads,0);
});
test('status options come from the workflow status field and are deduplicated',async()=>{
 const api=new MeegleAPI(async args=>args.includes('--help')?'--project-key string --work-item-type string':{list:[
  {field_key:'work_item_status',field_name:'状态',field_type:'_work_item_status',option:[
   {option_id:'OPEN',option_name:'BUG'},{option_id:'OPEN',option_name:'BUG'},{option_id:'RESOLVED',option_name:'APPROVED'},{option_id:'X',option_name:'下一轮 测试'},{option_id:'Y',option_name:"bad'quote"},{option_id:'',option_name:''}]},
  {field_key:'owner',field_name:'创建者',field_type:'user'}]});
 assert.deepEqual(await api.statuses('oog','issue'),[{key:'BUG',name:'BUG'},{key:'APPROVED',name:'APPROVED'},{key:'下一轮 测试',name:'下一轮 测试'}]);
});
test('status lookup fails closed when the type exposes no status options',async()=>{
 const api=new MeegleAPI(async args=>args.includes('--help')?'--project-key string --work-item-type string':{list:[{field_key:'owner',field_name:'创建者',field_type:'user'}]});
 await assert.rejects(api.statuses('oog','issue'),/no status options/);
 await assert.rejects(api.statuses('oog',''),/Invalid project or type key/);
});
