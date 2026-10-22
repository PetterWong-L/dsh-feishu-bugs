// JSON-safe value for tool output: drop undefined members instead of leaving keys the
// serializer cannot represent (a deleted workspace id used to break the status tool).
export function scrub(value){
  if(Array.isArray(value))return value.map(scrub).filter(v=>v!==undefined);
  if(value&&typeof value==='object'){
    const out={};
    for(const [key,item] of Object.entries(value)){const clean=scrub(item);if(clean!==undefined)out[key]=clean;}
    return out;
  }
  return value;
}
