const safeKey=s=>typeof s==='string'&&/^[\w-]{1,160}$/.test(s);
export function identifier(name){if(typeof name!=='string'||!name.trim()||name.length>300||/[`\r\n\\]/.test(name))throw Error('Invalid MQL source or field name');return '`'+name+'`';}
export function queryPage(value,page){
 if(value?.error||value?.err_code)throw Error('Meegle rejected the query');
 if(page){
  const items=value?.data?.[page.groupId];
  if(!value||value.data===null||typeof value.data!=='object'||Array.isArray(value.data)||Object.keys(value.data).some(k=>k!==page.groupId)||!Array.isArray(items)||items.length>50)throw Error('Incomplete paginated query response; no data imported');
  return {items};
 }
 // A status with no matches returns data {} and list null; that is a real empty result, not a malformed page.
 if(value&&value.list===null&&value.data&&typeof value.data==='object'&&!Array.isArray(value.data)&&Object.keys(value.data).length===0&&!value.error&&!value.err_code)return {items:[],count:0,groupId:null,session:value.session_id};
 // The first page carries the group count; later pages carry rows only.
 if(!value||!Array.isArray(value.list)||value.list.length!==1)throw Error('Unsupported MQL query groups; no data imported');
 const group=value.list[0],info=group.group_infos?.[0],id=info?.group_id;
 if(typeof id!=='string'||!safeKey(id)||group.group_infos.length!==1||!Number.isSafeInteger(group.count)||group.count<0||group.count>10000)throw Error('Unsupported MQL count or group; no data imported');
 const items=value.data?.[id]??(group.count===0?[]:null);
 if(!Array.isArray(items)||items.length>50||items.length>group.count||Object.keys(value.data??{}).some(k=>k!==id))throw Error('Incomplete query page; no data imported');
 return {items,count:group.count,groupId:id,session:value.session_id};
}
export function decodeRow(raw,ownerField){
 if(!Array.isArray(raw?.moql_field_list))throw Error('Unsupported MQL typed row');
 const fields=new Map();for(const f of raw.moql_field_list){if(typeof f?.key!=='string'||fields.has(f.key))throw Error('Duplicate or invalid MQL field');fields.set(f.key,f);}
 function typed(key,type){const f=fields.get(key);if(!f||f.value_type!==type||!f.value||typeof f.value!=='object')throw Error(`Unsupported MQL field ${key}`);return f.value[type];}
 const id=typed('work_item_id','long_value'),name=typed('name','string_value'),description=typed('description','string_value')??'';
 if(!Number.isSafeInteger(id)||id<1||typeof name!=='string'||typeof description!=='string')throw Error('Unsupported MQL item identity or text');
 const owners=typed(ownerField,'user_value_list');
 if(!Array.isArray(owners)||owners.some(u=>!safeKey(u?.user_key)))throw Error('Unsupported owner/assignee representation');
 return {id,name,description,owners:owners.map(u=>u.user_key)};
}
