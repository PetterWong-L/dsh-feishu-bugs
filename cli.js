import {execFile} from 'node:child_process';
import {createRequire} from 'node:module';
import {dirname,join} from 'node:path';
import {promisify} from 'node:util';
const exec=promisify(execFile),require=createRequire(import.meta.url);
export const PROFILE='dsh-feishu-bugs';
export function cliEnvironment(source=process.env){
 const env={...source};for(const k of Object.keys(env))if(k.startsWith('MEEGLE_'))delete env[k];
 return {...env,MEEGLE_HOST:'project.feishu.cn',MEEGLE_TELEMETRY:'disabled',MEEGLE_NO_UPDATE_CHECK:'1',MEEGLE_AI_HANDOFF:'disabled'};
}
export async function runCli(args,{signal,json=true,allowStatus=false}={}){
 const root=dirname(require.resolve('@lark-project/meegle/package.json'));
 const binary=join(root,'bin',`meegle-${process.platform}-${process.arch}${process.platform==='win32'?'.exe':''}`);
 let stdout,exitCode=0;
 try{({stdout}=await exec(binary,[...args,'--profile',PROFILE,'--format','json'],{env:cliEnvironment(),signal,timeout:30000,maxBuffer:4*1024*1024,windowsHide:true}));}
 catch(e){exitCode=typeof e.code==='number'?e.code:2;if(!allowStatus||!e.stdout)throw Object.assign(Error('Official Meegle CLI request failed. Check account permissions, network or authorization status.'),{exitCode});stdout=e.stdout;}
 if(!json)return stdout;
 let result;try{result=JSON.parse(stdout);}catch{throw Error('Official CLI returned an unsupported response; no data imported');}
 if(!result||typeof result!=='object')throw Error('Official CLI returned an unsupported response');
 if(exitCode===2)throw Object.assign(Error('Meegle service unavailable; keep existing authorization and retry later'),{exitCode});
 return result;
}
