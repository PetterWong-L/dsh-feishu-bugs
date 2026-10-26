import {execFile} from 'node:child_process';
import {readdir,stat} from 'node:fs/promises';
import {join,basename} from 'node:path';

// Simulator build only: no signing, no device, and no merge — the point is to compile the branch
// that is checked out in this directory and hand back its .app.
export const DESTINATION='generic/platform=iOS Simulator';

export async function findWorkspace(cwd){
 const entries=await readdir(cwd,{withFileTypes:true}).catch(()=>[]);
 const names=entries.filter(e=>e.isDirectory()&&e.name.endsWith('.xcworkspace')).map(e=>e.name).sort();
 if(!names.length)return null;
 // A Pods workspace is never the app's entry point.
 const app=names.find(n=>!n.startsWith('Pods'));
 return join(cwd,app??names[0]);
}

export function parseSchemes(output){
 const schemes=[];
 let inSchemes=false;
 for(const raw of String(output??'').split('\n')){
  const line=raw.trimEnd();
  if(/^Schemes:$/.test(line.trim())){inSchemes=true;continue;}
  if(inSchemes){
   if(!line.trim())continue;
   if(/^\S.*:$/.test(line.trim()))break;
   schemes.push(line.trim());
  }
 }
 return schemes;
}

// Xcode lists dozens of Pods schemes; the app's own scheme is the one named like the workspace.
export function pickScheme(schemes,workspace){
 const base=basename(workspace).replace(/\.xcworkspace$/,'');
 if(schemes.includes(base))return base;
 const app=schemes.filter(s=>!s.startsWith('Pods')&&!/^Adapty/.test(s));
 return app.length===1?app[0]:null;
}

export async function listSchemes(cwd,workspace){
 return new Promise((resolve,reject)=>{
  execFile('xcodebuild',['-list','-workspace',workspace],{cwd,timeout:180000,maxBuffer:8*1024*1024},(err,stdout,stderr)=>{
   if(err)return reject(Error(`Could not read schemes: ${String(stderr||err.message).split('\n').slice(-3).join(' ')}`));
   resolve(parseSchemes(stdout));
  });
 });
}

function tail(text,lines=60){const all=String(text??'').trimEnd().split('\n');return all.slice(-lines).join('\n');}

export async function runBuild({cwd,workspace,scheme,derivedData,timeoutMs=900000}){
 const started=Date.now();
 const args=['-workspace',workspace,'-scheme',scheme,'-destination',DESTINATION,'-derivedDataPath',derivedData,'build'];
 const result=await new Promise(resolve=>{
  execFile('xcodebuild',args,{cwd,timeout:timeoutMs,killSignal:'SIGKILL',maxBuffer:64*1024*1024},(err,stdout,stderr)=>{
   resolve({ok:!err,code:err?.code??0,killed:err?.killed===true,log:`${stdout??''}\n${stderr??''}`});
  });
 });
 const products=join(derivedData,'Build','Products','Debug-iphonesimulator');
 const apps=await readdir(products).catch(()=>[]);
 const app=apps.filter(n=>n.endsWith('.app')).map(n=>join(products,n)).sort().at(-1)??null;
 return {ok:result.ok&&!result.killed,code:result.code,killed:result.killed,ms:Date.now()-started,app:result.ok?app:null,log:tail(result.log),products};
}
