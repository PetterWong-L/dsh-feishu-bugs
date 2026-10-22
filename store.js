import {mkdir,readFile,writeFile,rename,chmod} from 'node:fs/promises';
import {join} from 'node:path';
export async function openStore(dir) {
 await mkdir(dir,{recursive:true,mode:0o700});await chmod(dir,0o700);
 const file=join(dir,'state.json');let state;
 try{state=JSON.parse(await readFile(file,'utf8'));}catch(e){if(e.code!=='ENOENT')throw e;state={version:1,bugs:[],audit:[],selection:{}};}
 if(state.version!==1||!Array.isArray(state.bugs))throw Error('Unsupported workflow state');
 let tail=Promise.resolve();const save=()=>{const text=JSON.stringify(state,null,2);const next=tail.then(async()=>{await writeFile(file+'.tmp',text,{mode:0o600});await rename(file+'.tmp',file);});tail=next.catch(()=>{});return next;};
 return {state,save};
}
