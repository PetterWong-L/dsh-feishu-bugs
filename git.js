import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { realpath,mkdir,readFile,appendFile } from 'node:fs/promises';
import { isAbsolute,join } from 'node:path';
import { createHash } from 'node:crypto';
const exec=promisify(execFile);
async function git(cwd,args){const {stdout}=await exec('git',args,{cwd,timeout:30000,maxBuffer:1024*1024,env:{...process.env,GIT_TERMINAL_PROMPT:'0'}});return stdout.trim();}
export async function validateWorktree(b) {
 const cwd=await realpath(b.cwd),repo=await realpath(b.repo);
 // Verification detaches the worktree so the branch can be checked out in the main
 // repository. A retry re-attaches it first; git refuses if it is still checked out there.
 let current=await git(cwd,['branch','--show-current']);
 if(!current){
  const head=await git(cwd,['rev-parse','HEAD']);
  const ref=await git(cwd,['rev-parse','--verify',`refs/heads/${b.branch}^{commit}`]).catch(()=>null);
  if(ref!==head)throw Error('Worktree branch changed; refusing to launch');
  try{await git(cwd,['checkout',b.branch]);current=b.branch;}catch{throw Error('Switch the main repository back to develop before retrying');}
 }
 if(current!==b.branch||b.branch==='develop')throw Error('Worktree branch changed; refusing to launch');
 const a=await git(cwd,['rev-parse','--path-format=absolute','--git-common-dir']);
 const c=await git(repo,['rev-parse','--path-format=absolute','--git-common-dir']);
 if(await realpath(a)!==await realpath(c))throw Error('Worktree belongs to another repository');
 if(await git(cwd,['rev-parse','--show-toplevel'])!==cwd)throw Error('Worktree root mismatch');
}
export function branchName(bug) {
  // The work item number is the stable, human-recognisable handle: a reviewer can map a
  // branch back to the Feishu bug without decoding a hash. An ASCII slug is appended
  // when the title contains one; Chinese-only titles keep just the number.
  const number=String(bug.remoteId??''); if(!/^\d{1,20}$/.test(number))throw Error('Bug number is required for branch naming');
  const slug=String(bug.title??'').normalize('NFKD').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,24).replace(/-+$/g,'');
  return `fix/feishu-${number}${slug?'-'+slug:''}`;
}
export async function prepareBranch(repo,runs,bug) {
  if(!isAbsolute(repo))throw Error('Choose an absolute repository path');
  repo=await realpath(repo);
  if(await git(repo,['rev-parse','--show-toplevel'])!==repo)throw Error('Select repository root, not a subdirectory');
  // Pin the current local develop SHA. No fetch, checkout, reset, merge or push.
  const base=await git(repo,['rev-parse','--verify','refs/heads/develop^{commit}']);
  const key=createHash('sha256').update(repo+'\0'+bug.id).digest('hex').slice(0,16);
  const branch=branchName(bug); const cwd=join(runs,key);
  const exists=await git(repo,['branch','--list',branch]);if(exists)throw Error('Bug branch already exists; inspect it before retrying');
  await mkdir(runs,{recursive:true,mode:0o700});
  await git(repo,['worktree','add','-b',branch,cwd,base]);
  return {repo,cwd,branch,base};
}

export async function headCommit(cwd){return git(cwd,['rev-parse','HEAD']);}
export async function changedPaths(cwd){const out=await git(cwd,['status','--porcelain']);return out?out.split('\n'):[];}
export async function detachWorktree(cwd){const current=await git(cwd,['branch','--show-current']);if(current)await git(cwd,['checkout','--detach']);}
export async function excludePath(cwd,rel){
  const common=await git(cwd,['rev-parse','--path-format=absolute','--git-common-dir']);
  const file=join(common,'info','exclude');
  const current=await readFile(file,'utf8').catch(()=>'');
  if(current.split('\n').includes(rel))return;
  await mkdir(join(common,'info'),{recursive:true});
  await appendFile(file,`${current&&!current.endsWith('\n')?'\n':''}${rel}\n`,'utf8');
}
export async function checkoutBranch(repo,branch){
  if(!/^(fix\/feishu-[^\s]+|develop)$/.test(branch))throw Error('Unexpected branch name');
  const dirty=await git(repo,['status','--porcelain']);
  if(dirty)throw Error('Main repository has uncommitted changes; commit or stash them before switching branches');
  try{await git(repo,['checkout',branch]);}
  catch(e){
    const text=String(e.stderr||e.message);
    throw Error(/already checked out|already used by worktree|is checked out at/i.test(text)?'That branch is still checked out in its worktree':'Could not switch the main repository: '+text.split('\n').filter(Boolean)[0]);
  }
}

export async function commitAll(cwd,message){
  await excludePath(cwd,'.feishu-attachments/');
  await git(cwd,['add','-A']);
  const staged=await git(cwd,['diff','--cached','--name-only']);
  if(!staged)throw Error('Nothing to commit in this worktree');
  await git(cwd,['commit','-m',message.slice(0,200)]);
  return git(cwd,['rev-parse','HEAD']);
}
