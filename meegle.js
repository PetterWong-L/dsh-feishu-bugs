import {runCli} from './cli.js';
import {mkdir,stat,rm} from 'node:fs/promises';
import {basename,join} from 'node:path';
import {identifier,queryPage,decodeRow} from './mql.js';
const key=s=>typeof s==='string'&&/^[\w-]{1,160}$/.test(s);
const unwrap=v=>{if(v?.error||v?.err_code)throw Error('Meegle rejected this read; check account permissions');return v?.data??v;};
const MAX_ITEMS=200;
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
  return list.map(f=>{if(!key(f.field_key)||typeof f.field_name!=='string'||typeof f.field_type!=='string')throw Error('Unsupported field metadata; no bugs imported');return {field_key:f.field_key,field_name:f.field_name,field_type:f.field_type};});
 }
 async bugs(s){
  if(!key(s.projectKey)||!key(s.typeKey)||!key(s.simpleName))throw Error('Select a project and defect type with a valid simple name first');
  const statuses=Array.isArray(s.statuses)&&s.statuses.length?s.statuses:['BUG','REOPENED'];
  if(statuses.length>6)throw Error('Too many status filters; no bugs imported');
  const clean=statuses.map(v=>{if(typeof v!=='string')throw Error('Invalid status filter');const t=v.trim();if(!/^[\w\u4e00-\u9fa5 -]{1,40}$/.test(t))throw Error('Status filter may only contain letters, digits, spaces, hyphens or CJK characters');return t;});
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
    result.push({id:`${s.projectKey}:${s.typeKey}:${row.id}`,remoteId:row.id,projectKey:s.projectKey,typeKey:s.typeKey,repo:s.repo,title:row.name.slice(0,500),description:JSON.stringify({description:row.description}).slice(0,4000)});
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
