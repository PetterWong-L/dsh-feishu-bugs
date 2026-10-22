import test from 'node:test';import assert from 'node:assert/strict';import {MeegleAPI} from './meegle.js';
export const fields=[{field_key:'work_item_id',field_name:'工作项id',field_type:'number'},{field_key:'name',field_name:'名称',field_type:'_name'},{field_key:'description',field_name:'描述',field_type:'multi-text'},{field_key:'current_status_operator',field_name:'当前负责人',field_type:'multi-user'},{field_key:'owner',field_name:'创建者',field_type:'user'},{field_key:'archiving_status',field_name:'是否完成',field_type:'bool'},{field_key:'work_item_status',field_name:'状态',field_type:'_work_item_status'},{field_key:'updated_at',field_name:'更新时间',field_type:'date'}];
export const selection={projectKey:'oog',projectName:'需求管理',simpleName:'oog',typeKey:'issue',typeName:'缺陷及优化',statuses:['BUG','REOPENED'],repo:'/repo'};
export function row(id,owners=['me']){return {moql_field_list:[{key:'work_item_id',value_type:'long_value',value:{long_value:id}},{key:'name',value_type:'string_value',value:{string_value:'Bug '+id}},{key:'description',value_type:'string_value',value:{string_value:'details '+id}},{key:'current_status_operator',value_type:'user_value_list',value:{user_value_list:owners.map(user_key=>({user_key}))}}]};}
const chunks=(n,size)=>Array.from({length:Math.ceil(n/size)},(_,i)=>Array.from({length:Math.min(size,n-i*size)},(_,j)=>row(i*size+j+1)));
export function runner(byStatus,calls=[],fieldsOverride=fields){
 const sessions=new Map();
 return async args=>{calls.push(args);
  if(args.includes('--help'))return '--project-key string\n--work-item-type string\n--mql string\n--session-id string\n--group-pagination-list string\n';
  if(args[0]==='user')return {user_key:'me'};
  if(args[1]==='meta-fields')return {list:fieldsOverride};
  if(args[1]!=='query')throw Error('Unexpected read');
  if(args.includes('--session-id')){
   const sid=args[args.indexOf('--session-id')+1],page=Number(JSON.parse(args[args.indexOf('--group-pagination-list')+1])[0].page_num);
   const spec=sessions.get(sid);if(!spec)throw Error('Unknown session');
   return {data:{'1':spec.pages[page-1]??[]}};
  }
  const mql=args[args.indexOf('--mql')+1],status=/`状态` = '([^']+)'/.exec(mql)?.[1];
  if(!status)throw Error('Query lacks status filter');
  if(byStatus[status]===null)return {data:{},extra_info:null,list:null,search_status_info:null,session_id:'S-'+status};
  const spec=byStatus[status]??{total:0,pages:[[]]};
  const pages=spec.pages??[spec.rows??[]],total=spec.total??pages.reduce((n,p)=>n+p.length,0);
  sessions.set('S-'+status,{pages});
  return {session_id:'S-'+status,list:[{count:total,group_infos:[{group_id:'1',group_name:'未知分组'}]}],data:{'1':pages[0]}};
 };
}
const queries=calls=>calls.filter(a=>a[1]==='query'&&!a.includes('--help'));
test('imports only selected workflow statuses with explicit fields and session paging',async()=>{const calls=[];const api=new MeegleAPI(runner({BUG:{total:120,pages:chunks(120,50)}},calls));const r=await api.bugs({...selection,statuses:['BUG']});assert.equal(r.items.length,120);assert.equal(r.total,120);assert.deepEqual(r.breakdown,{BUG:120});assert.equal(r.truncated,false);const q=queries(calls);assert.equal(q.length,3);const mql=q[0][q[0].indexOf('--mql')+1];assert.ok(!mql.includes('SELECT *'));assert.match(mql,/FROM `oog`\.`缺陷及优化`/);assert.match(mql,/array_contains\(`当前负责人`, current_login_user\(\)\)/);assert.match(mql,/`是否完成` = false/);assert.match(mql,/`状态` = 'BUG'/);assert.match(mql,/ORDER BY `更新时间` DESC/);assert.ok(!q[0].includes('--auto-paginate'));assert.equal(r.items[0].id,'oog:issue:1');assert.ok(!JSON.stringify(r.items).includes('"me"'));});
test('splits multiple statuses into separate queries and merges totals',async()=>{const calls=[];const api=new MeegleAPI(runner({BUG:{total:2,rows:[row(1),row(2)]},REOPENED:{total:1,rows:[row(3)]}},calls));const r=await api.bugs(selection);assert.equal(r.items.length,3);assert.equal(r.total,3);assert.deepEqual(r.breakdown,{BUG:2,REOPENED:1});assert.equal(queries(calls).length,2);assert.ok(queries(calls).some(a=>/`状态` = 'REOPENED'/.test(a[a.indexOf('--mql')+1])));});
test('a status with no matches is an empty result, not a failure',async()=>{const r=await new MeegleAPI(runner({BUG:{total:2,rows:[row(1),row(2)]},REOPENED:null})).bugs(selection);assert.equal(r.items.length,2);assert.equal(r.total,2);assert.deepEqual(r.breakdown,{BUG:2,REOPENED:0});});
test('import caps at 200 and reports truncation',async()=>{const calls=[];const r=await new MeegleAPI(runner({BUG:{total:250,pages:chunks(250,50)}},calls)).bugs({...selection,statuses:['BUG']});assert.equal(r.items.length,200);assert.equal(r.total,250);assert.equal(r.truncated,true);assert.equal(queries(calls).length,4);});
test('creator field is never treated as assigned-to-me',async()=>{const without=fields.filter(f=>f.field_key!=='current_status_operator');await assert.rejects(new MeegleAPI(runner({},[],without)).bugs(selection),/Cannot identify|创建者/);});
test('unknown status, owner shape, unassigned rows and incomplete pages fail closed',async()=>{const bad=row(1);bad.moql_field_list.at(-1).value={user_value_list:[{name:'missing key'}]};await assert.rejects(new MeegleAPI(runner({BUG:{total:1,rows:[bad]}})).bugs(selection),/owner|assignee/);await assert.rejects(new MeegleAPI(runner({BUG:{total:1,rows:[row(1,['other'])]}})).bugs(selection),/not assigned/);
 let called=false;await assert.rejects(new MeegleAPI(async()=>{called=true;}).bugs({...selection,statuses:["BUG' OR 1=1"]}),/Status filter/);assert.equal(called,false);
 await assert.rejects(new MeegleAPI(runner({})).bugs({...selection,statuses:['a','b','c','d','e','f','g']}),/Too many status/);
 const empty=new MeegleAPI(async args=>{if(args.includes('--help'))return '--project-key string\n--work-item-type string\n--mql string\n--session-id string\n--group-pagination-list string\n';if(args[0]==='user')return {user_key:'me'};if(args[1]==='meta-fields')return {list:fields};return {session_id:'S-BUG',list:[{count:1,group_infos:[{group_id:'1'}]}],data:{}};});await assert.rejects(empty.bugs(selection),/Incomplete|count|page/);});
test('rejects MQL source injection before any CLI call',async()=>{let called=false;await assert.rejects(new MeegleAPI(async()=>{called=true;}).bugs({...selection,simpleName:'x` DROP'}),/Select a project|Invalid/);assert.equal(called,false);});
