import test from 'node:test';
import assert from 'node:assert/strict';
import {MeegleAPI} from './meegle.js';
import {fields,selection,runner} from './mql.test.js';
const relation={field_key:'_field_linked_story',field_name:'所属需求（缺陷）',field_type:'workitem_related_select',related_work_item_info:[{project_key:'oog',work_item_type:'story'}]};
const option=id=>({moql_field_list:[{key:'work_item_id',value_type:'long_value',value:{long_value:id}},{key:'name',value_type:'string_value',value:{string_value:'需求 '+id}}]});
test('requirement options use related type metadata and read every query page',async()=>{
 const calls=[];const api=new MeegleAPI(async args=>{
  calls.push(args);if(args.includes('--help'))return '--project-key string --work-item-type string --mql string --session-id string --group-pagination-list string';
  if(args[1]==='meta-fields')return {list:[relation]};
  if(args[1]==='meta-types')return {list:[{type_key:'story',name:'新需求开发'}]};
  if(args.includes('--session-id'))return {data:{'1':[option(51)]}};
  return {session_id:'s1',list:[{count:51,group_infos:[{group_id:'1'}]}],data:{'1':Array.from({length:50},(_,i)=>option(i+1))}};
 });
 const result=await api.requirements(selection);
 assert.equal(result.fieldKey,relation.field_key);assert.equal(result.options.length,51);
 assert.deepEqual(result.options.at(-1),{id:'51',name:'需求 51'});
 const query=calls.find(a=>a.includes('--mql'));assert.match(query[query.indexOf('--mql')+1],/FROM `oog`.`新需求开发`/);
 assert.ok(calls.some(a=>a.includes('--session-id')));
});
test('requirement filter is combined with every selected status before pagination',async()=>{
 const calls=[];await new MeegleAPI(runner({},calls,[...fields,relation])).bugs({...selection,requirementId:'123'});
 const queries=calls.filter(a=>a.includes('--mql'));
 assert.equal(queries.length,2);
 for(const args of queries)assert.match(args[args.indexOf('--mql')+1],/`所属需求（缺陷）` = '<id:123>' AND `状态` =/);
});
test('unfiltered imports stay compatible; invalid IDs and unsupported relation fields fail closed',async()=>{
 await new MeegleAPI(runner({})).bugs({...selection,requirementId:''});
 for(const requirementId of ["123' OR 1=1",123,[], '0'])await assert.rejects(new MeegleAPI(runner({})).bugs({...selection,requirementId}),/requirement/i);
 await assert.rejects(new MeegleAPI(runner({})).bugs({...selection,requirementId:'123'}),/所属需求/);
 await assert.rejects(new MeegleAPI(async args=>args.includes('--help')?'--project-key string --work-item-type string':{list:[]}).requirements(selection),/所属需求/);
});
