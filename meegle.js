import {runCli} from './cli.js';
import {mkdir,stat,rm} from 'node:fs/promises';
import {basename,join} from 'node:path';
import {identifier,queryPage,decodeRow} from './mql.js';
const key=s=>typeof s==='string'&&/^[\w-]{1,160}$/.test(s);
const label=s=>typeof s==='string'&&s.trim().length>0&&s.length<=40&&!/[\u0000-\u001f\\'\"]/.test(s);
const unwrap=v=>{if(v?.error||v?.err_code)throw Error('Meegle rejected this read; check account permissions');return v?.data??v;};
const MAX_ITEMS=200;
const requirementId=value=>typeof value==='string'&&/^[1-9]\d{0,15}$/.test(value)&&Number.isSafeInteger(Number(value));
function requirementField(fields){
 const field=fields.find(f=>f.field_key==='_field_linked_story')??fields.find(f=>f.field_name==='所属需求（缺陷）');
 if(!field||!['workitem_related_select','work_item_related_select'].includes(field.field_type))throw Error('未找到支持的“所属需求（缺陷）”关联字段');
 return field;
}
const IMAGE_TYPES={'image/png':'.png','image/jpeg':'.jpg','image/jpg':'.jpg','image/gif':'.gif','image/webp':'.webp','image/heic':'.heic'};
const MAX_ATTACHMENTS=5,MAX_ATTACHMENT_BYTES=20*1024*1024;
function safeName(name,ext){const base=basename(String(name)).replace(/[^\w.\-]+/g,'-').replace(/^[-._]+/,'').slice(0,60);const stem=base.replace(/\.[A-Za-z0-9]{1,8}$/,'');return `${stem||'attachment'}${ext}`;}
export function rows(value,collection='list'){
 const d=unwrap(value),list=Array.isArray(d)?d:(d?.[collection]??d?.list);
 if(!Array.isArray(list))throw Error('Unsupported official CLI list shape; no data imported');
 for(const layer of [value,d])if(layer?.has_more===true||layer?.pagination?.has_more===true||layer?.next_page_token||Number(layer?.total)>list.length||Number(layer?.pagination?.total)>list.length)throw Error('Incomplete CLI pagination; no data imported');
 return list;
}
function catalog(value,keys,collection='list'){return rows(value,collection).map(v=>{const id=keys.map(k=>v[k]).find(key);if(!id||typeof v.name!=='string')throw Error('Unsupported project/type metadata; account metadata needs adaptation');return {key:id,name:v.name.slice(0,300)};});}
export class MeegleAPI{
 constructor(run=runCli){this.run=run;}
 async flags(command,required){const text=await this.run([...command,'--help'],{json:false});for(const flag of required)if(!new RegExp('(^|\\s)'+flag+'(?=\\s|[=,])','m').test(text))throw Error(`Official CLI metadata does not expose ${flag}; sign in and check command availability`);}
 async projects(){return rows(await this.run(['project','search']),'projects').map(v=>{const id=['project_key','key'].map(k=>v[k]).find(key);if(!id||typeof v.name!=='string'||!key(v.simple_name))throw Error('Unsupported project metadata (project key, name or simple name missing); no projects imported');return {key:id,name:v.name.slice(0,300),simpleName:v.simple_name};});}
 async types(projectKey){if(!key(projectKey))throw Error('Invalid project key');await this.flags(['workitem','meta-types'],['--project-key']);return catalog(await this.run(['workitem','meta-types','--project-key',projectKey,'--auto-paginate']),['work_item_type_key','type_key','key']);}
 async fields(projectKey,typeKey){
  if(!key(projectKey)||!key(typeKey))throw Error('Invalid project or type key');
  await this.flags(['workitem','meta-fields'],['--project-key','--work-item-type']);
  const list=rows(await this.run(['workitem','meta-fields','--project-key',projectKey,'--work-item-type',typeKey]),'list');
  return list.map(f=>{if(!key(f.field_key)||typeof f.field_name!=='string'||typeof f.field_type!=='string')throw Error('Unsupported field metadata; no bugs imported');return {field_key:f.field_key,field_name:f.field_name,field_type:f.field_type,...(Array.isArray(f.related_work_item_info)?{related_work_item_info:f.related_work_item_info}: {})};});
 }
 async requirements(s){
  if(!key(s.projectKey)||!key(s.typeKey)||!key(s.simpleName))throw Error('Select project/type metadata before loading requirements');
  const field=requirementField(await this.fields(s.projectKey,s.typeKey)),targets=field.related_work_item_info;
  if(!Array.isArray(targets)||targets.length!==1||targets[0].project_key!==s.projectKey||!key(targets[0].work_item_type))throw Error('不支持此“所属需求（缺陷）”关联目标，请检查字段配置');
  const type=(await this.types(s.projectKey)).find(t=>t.key===targets[0].work_item_type);
  if(!type)throw Error('无法读取所属需求的工作项类型');
  // These built-in MQL fields remain queryable when meta-fields omits 工作项id.
  const mql=`SELECT ${identifier('工作项id')}, ${identifier('名称')} FROM ${identifier(s.simpleName)}.${identifier(type.name)} ORDER BY ${identifier('更新时间')} DESC`;
  await this.flags(['workitem','query'],['--project-key','--mql','--session-id','--group-pagination-list']);
  const first=queryPage(await this.run(['workitem','query','--project-key',s.projectKey,'--mql',mql])),items=[...first.items];
  if(first.count&&!key(first.session))throw Error('Unsupported requirement query session');
  for(let page=2;items.length<first.count;page++){
   if(page>200)throw Error('Too many requirement pages; no partial options returned');
   const next=queryPage(await this.run(['workitem','query','--project-key',s.projectKey,'--session-id',first.session,'--group-pagination-list',JSON.stringify([{group_id:first.groupId,page_num:page}])]),{groupId:first.groupId});
   if(!next.items.length||items.length+next.items.length>first.count)throw Error('Incomplete requirement pagination');
   items.push(...next.items);
  }
  const seen=new Set(),options=items.map(item=>{
   const list=item?.moql_field_list;
   if(!Array.isArray(list))throw Error('Unsupported requirement row');
   const ids=list.filter(f=>f.key==='work_item_id'),names=list.filter(f=>f.key==='name'),id=ids[0],name=names[0],value=String(id?.value?.long_value);
   if(ids.length!==1||names.length!==1||id.value_type!=='long_value'||!requirementId(value)||name.value_type!=='string_value'||typeof name.value?.string_value!=='string'||!name.value.string_value.trim()||seen.has(value))throw Error('Unsupported requirement identity or title');
   seen.add(value);return {id:value,name:name.value.string_value.slice(0,500)};
  });
  return {fieldKey:field.field_key,fieldName:field.field_name,options};
 }
 async statuses(projectKey,typeKey){
  if(!key(projectKey)||!key(typeKey))throw Error('Invalid project or type key');
  const list=rows(await this.run(['workitem','meta-fields','--project-key',projectKey,'--work-item-type',typeKey]),'list');
  const field=list.find(f=>f&&f.field_key==='work_item_status');
  const options=Array.isArray(field?.option)?field.option:[];
  const names=[...new Set(options.map(o=>o&&o.option_name).filter(n=>label(n)))].slice(0,30);
  if(!names.length)throw Error('This work item type exposes no status options');
  return names.map(n=>({key:n,name:n}));
 }
 async stateTransitions(projectKey,typeKey,remoteId){
  if(!key(projectKey)||!key(typeKey)||!/^\d{1,20}$/.test(String(remoteId)))throw Error('Invalid work item for state transitions');
  const raw=await this.run(['workflow','list-state-transitions','--project-key',projectKey,'--work-item-id',String(remoteId),'--work-item-type',typeKey,'--auto-paginate']);
  const d=unwrap(raw);
  const stateKey=v=>typeof v==='string'&&v.length>0&&v.length<=160&&!/[\u0000-\u001f]/.test(v);
  if(!stateKey(d?.state_key)||!stateKey(d?.state_name)||!Array.isArray(d?.transition))throw Error('Unsupported workflow state metadata');
  // rows() also rejects incomplete pagination rather than offering a partial transition list.
  const options=rows(raw,'transition').map(o=>{
   if(!o||!(typeof o.id==='string'||Number.isSafeInteger(o.id))||!key(String(o.id))||!stateKey(o.state_key)||!stateKey(o.state_name))throw Error('Unsupported workflow transition metadata');
   return {id:String(o.id),key:o.state_key,name:o.state_name,requiresForm:o.confirm_form!=null};
  });
  if(new Set(options.map(o=>o.id)).size!==options.length)throw Error('Unsupported duplicate workflow transition IDs');
  return {current:{key:d.state_key,name:d.state_name},options};
 }
 async transitionState(projectKey,typeKey,remoteId,transitionId,stateKey){
  if(typeof transitionId!=='string'||!key(transitionId)||typeof stateKey!=='string')throw Error('Invalid transition selection');
  const available=await this.stateTransitions(projectKey,typeKey,remoteId);
  const target=available.options.find(o=>o.id===transitionId&&o.key===stateKey);
  if(!target)throw Error('This state transition is no longer available; refresh the available states');
  if(target.requiresForm)throw Error('此状态流转需要填写表单，请在飞书项目中完成');
  await this.flags(['workflow','transition-state'],['--project-key','--work-item-id','--transition-id']);
  unwrap(await this.run(['workflow','transition-state','--project-key',projectKey,'--work-item-id',String(remoteId),'--transition-id',transitionId]));
  let result;
  try{result=await this.stateTransitions(projectKey,typeKey,remoteId);}catch{throw Error('状态修改已提交，但未能回读确认；请先刷新飞书状态再决定是否重试');}
  if(result.current.key!==target.key)throw Error('飞书当前状态与目标状态不一致，请刷新后检查');
  return result;
 }
 async bugs(s){
  if(!key(s.projectKey)||!key(s.typeKey)||!key(s.simpleName))throw Error('Select a project and defect type with a valid simple name first');
  const statuses=Array.isArray(s.statuses)&&s.statuses.length?s.statuses:['BUG','REOPENED'];
  if(statuses.length>6)throw Error('Too many status filters; no bugs imported');
  const clean=statuses.map(v=>{if(typeof v!=='string')throw Error('Invalid status filter');const t=v.trim();if(!/^[\w\u4e00-\u9fa5 -]{1,40}$/.test(t))throw Error('Status filter may only contain letters, digits, spaces, hyphens or CJK characters');return t;});
  if(s.requirementId!=null&&s.requirementId!==''&&!requirementId(s.requirementId))throw Error('Invalid requirement ID');
  const fields=await this.fields(s.projectKey,s.typeKey),byKey=new Map(fields.map(f=>[f.field_key,f]));
  const need=(k,types)=>{const f=byKey.get(k);if(!f||!types.includes(f.field_type))throw Error(`Project schema lacks a supported “${k}” field; no bugs imported`);return f;};
  const idF=need('work_item_id',['number']),nameF=need('name',['_name']);
  const descF=byKey.get('description');
  if(descF&&!['multi-text','text'].includes(descF.field_type))throw Error('Unsupported description field type; no bugs imported');
  // “Assign to me” means the current assignee, never the creator (field key owner).
  const owner=byKey.get('current_status_operator')??fields.find(f=>f.field_name==='当前负责人'&&['multi-user','user'].includes(f.field_type));
  if(!owner)throw Error('Cannot identify the “当前负责人” field; check the project field schema before importing');
  if(owner.field_key==='owner'||owner.field_name==='创建者')throw Error('“owner” is the creator field, not the current assignee (当前负责人)');
  const done=byKey.get('archiving_status')?.field_type==='bool'?byKey.get('archiving_status'):null;
  const order=byKey.get('updated_at')??byKey.get('start_time');
  const select=[idF,nameF,descF,owner,order].filter(Boolean).map(f=>identifier(f.field_name));
  const where=[`array_contains(${identifier(owner.field_name)}, current_login_user())`];
  if(done)where.push(`${identifier(done.field_name)} = false`);
  if(s.requirementId)where.push(`${identifier(requirementField(fields).field_name)} = '<id:${s.requirementId}>'`);
  const statusField=need('work_item_status',['_work_item_status']);
  await this.flags(['workitem','query'],['--project-key','--mql','--session-id','--group-pagination-list']);
  const me=unwrap(await this.run(['user','me'])),userKey=me?.user_key;
  if(!key(userKey))throw Error('Unsupported current-user identity response; no bugs imported');
  const seen=new Set(),result=[],breakdown={};
  let total=0;
  for(const status of clean){
   const whereStatus=[...where,`${identifier(statusField.field_name)} = '${status}'`];
   const mql=`SELECT ${select.join(', ')} FROM ${identifier(s.simpleName)}.${identifier(s.typeName)} WHERE ${whereStatus.join(' AND ')}${order?` ORDER BY ${identifier(order.field_name)} DESC`:''}`;
   const first=await this.run(['workitem','query','--project-key',s.projectKey,'--mql',mql]).catch(()=>{throw Error(`Query failed for status "${status}": status names are case-sensitive workflow labels; check the exact label, permissions or connection`);});
   const page=queryPage(first),limit=Math.min(page.count,MAX_ITEMS-result.length),items=[...page.items];
   breakdown[status]=page.count;total+=page.count;
   if(page.count===0)continue;
   if(typeof page.session!=='string'||!key(page.session))throw Error('Unsupported MQL query session; no bugs imported');
   for(let n=2;items.length<limit;n++){
    if(n>40)throw Error('MQL paging exceeded the safety limit; no bugs imported');
    const next=await this.run(['workitem','query','--project-key',s.projectKey,'--session-id',page.session,'--group-pagination-list',JSON.stringify([{group_id:page.groupId,page_num:n}])]);
    const pg=queryPage(next,{groupId:page.groupId});
    if(!pg.items.length)throw Error('Incomplete MQL page before reaching the expected count; no bugs imported');
    items.push(...pg.items);
   }
   items.length=Math.min(items.length,limit);
   for(const raw of items){
    const row=decodeRow(raw,owner.field_key);
    if(seen.has(row.id))continue;seen.add(row.id);
    if(!row.owners.includes(userKey))throw Error('MQL returned an item not assigned to the signed-in user; no bugs imported');
    result.push({id:`${s.projectKey}:${s.typeKey}:${row.id}`,remoteId:row.id,projectKey:s.projectKey,typeKey:s.typeKey,repo:s.repo,remoteStatus:status,title:row.name.slice(0,500),description:JSON.stringify({description:row.description}).slice(0,4000)});
   }
   if(result.length>=MAX_ITEMS)break;
  }
  return {items:result,total,truncated:total>result.length,breakdown};

 }
 async attachments(projectKey,remoteId,dest){
  if(!key(projectKey)||!key(String(remoteId)))throw Error('Invalid work item for attachments');
  if(typeof dest!=='string'||!dest)throw Error('Invalid attachment destination');
  const raw=await this.run(['workitem','get','--project-key',projectKey,'--work-item-id',String(remoteId),'--fields','_all','--auto-paginate']);
  const d=unwrap(raw),fields=Array.isArray(d?.work_item_fields)?d.work_item_fields:[],entries=[];
  for(const f of fields)if(Array.isArray(f?.value))for(const v of f.value)if(v&&typeof v.url==='string'&&v.url.startsWith('https://project.feishu.cn/')&&typeof v.name==='string')entries.push({url:v.url,name:v.name,type:typeof v.type==='string'?v.type:''});
  const dir=join(dest,'.feishu-attachments');
  if(!entries.length)return {dir,files:[],skipped:[],found:0};
  await mkdir(dir,{recursive:true});
  const files=[],skipped=[];
  for(const e of entries){
   const ext=IMAGE_TYPES[e.type];
   if(!ext){skipped.push({name:e.name,reason:'unsupported attachment type'});continue;}
   if(files.length>=MAX_ATTACHMENTS){skipped.push({name:e.name,reason:'attachment limit reached'});continue;}
   const target=join(dir,`${String(files.length+1).padStart(2,'0')}-${safeName(e.name,ext)}`);
   try{
    await this.run(['attachment','+download',e.url,'--project-key',projectKey,'--work-item-id',String(remoteId),'--output',target,'--overwrite']);
    const info=await stat(target);
    if(info.size>MAX_ATTACHMENT_BYTES){await rm(target,{force:true});skipped.push({name:e.name,reason:'attachment too large'});continue;}
    files.push({path:target,name:e.name,type:e.type,size:info.size});
   }catch{skipped.push({name:e.name,reason:'download failed'});}
  }
  return {dir,files,skipped,found:entries.length};
 }
}
