import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { realpath,mkdir,readFile,appendFile,copyFile,symlink,stat,readdir,rm } from 'node:fs/promises';
import { isAbsolute,join,sep } from 'node:path';
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
  return {repo,cwd,branch,base,...await provisionWorktree(repo,cwd)};
}

// Work directly in the repository: create the fix branch from the current develop commit and
// check it out, so the agent, Xcode and the user all work in one tree that already has Pods and
// the generated workspace. Refuses to touch a dirty repository or an existing branch.
export async function prepareBranchInRepo(repo,bug) {
  if(!isAbsolute(repo))throw Error('Choose an absolute repository path');
  repo=await realpath(repo);
  if(await git(repo,['rev-parse','--show-toplevel'])!==repo)throw Error('Select repository root, not a subdirectory');
  const dirty=(await git(repo,['status','--porcelain'])).trim();
  if(dirty)throw Error('The repository has uncommitted changes; commit or stash them before starting a fix');
  const base=await git(repo,['rev-parse','--verify','refs/heads/develop^{commit}']);
  const branch=branchName(bug);
  if(await git(repo,['branch','--list',branch]))throw Error('Bug branch already exists; inspect it before retrying');
  await git(repo,['checkout','-b',branch,base]);
  return {repo,cwd:repo,branch,base,inRepo:true};
}

// Pick the isolation that matches the current state of the repository: a clean tree gets the fix
// branch checked out in place, while a tree with your own uncommitted work stays untouched and the
// fix runs in an isolated worktree that shares the repository's objects, workspace and Pods.
export async function prepareFix(repo,runs,bug) {
  if(!isAbsolute(repo))throw Error('Choose an absolute repository path');
  const root=await realpath(repo);
  if(await git(root,['rev-parse','--show-toplevel'])!==root)throw Error('Select repository root, not a subdirectory');
  const dirty=(await git(root,['status','--porcelain'])).trim();
  if(!dirty)return prepareBranchInRepo(root,bug);
  return {...await prepareBranch(root,runs,bug),inRepo:false,isolated:true};
}

export async function headCommit(cwd){return git(cwd,['rev-parse','HEAD']);}
export async function currentBranch(cwd){return git(cwd,['branch','--show-current']);}
export async function changedPaths(cwd){const out=await git(cwd,['status','--porcelain']);return out?out.split('\n'):[];}
export async function detachWorktree(cwd){const current=await git(cwd,['branch','--show-current']);if(current)await git(cwd,['checkout','--detach']);}

// An accepted fix lives in its branch commit; the worktree is only a checked-out copy plus
// screenshots and build products, and one worktree per finished bug fills the disk. Removing the
// worktree keeps the branch and its objects, so acceptance and merging stay possible afterwards.
// The guard against uncommitted work belongs to the caller: this function deletes what it finds.
export async function removeWorktree(repo,cwd){
 if(!isAbsolute(repo)||!isAbsolute(cwd))throw Error('Absolute worktree and repository paths are required');
 const root=await realpath(repo);
 const target=await realpath(cwd).catch(()=>null);
 // A symlink, a missing path or the repository itself is never a worktree to delete.
 if(!target)return {removed:false,registered:false};
 if(target===root||root.startsWith(target+sep))throw Error('Refusing to remove the main repository');
 // Registered worktrees are deleted through git so the administrative entry goes with the
 // directory; leftovers from an interrupted prepare are plain files and only need pruning.
 let gitRemoved=false;
 try{await git(root,['worktree','remove','--force',target]);gitRemoved=true;}catch{}
 // rm never follows the Pods symlink, so the main repository's Pods survive this path too.
 if(!gitRemoved)await rm(target,{recursive:true,force:true});
 await git(root,['worktree','prune']).catch(()=>{});
 return {removed:true,registered:gitRemoved};
}

// Bytes a directory occupies, without following symlinks: a linked Pods tree belongs to the main
// repository and must not be counted, let alone walked.
export async function directorySize(path){
 let total=0;
 for(const entry of await readdir(path,{withFileTypes:true}).catch(()=>[])){
  const child=join(path,entry.name);
  try{
   if(entry.isSymbolicLink())continue;
   if(entry.isDirectory())total+=await directorySize(child);
   else if(entry.isFile())total+=(await stat(child)).size;
  }catch{}
 }
 return total;
}
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
  // A worktree Pods entry is a symlink to the main repository, so the trailing-slash ignore
  // rule does not match it; left alone `git add -A` would commit it and every later merge
  // would replace the main repository's real Pods directory.
  await git(cwd,['add','-A']);
  // info/exclude already hides the worktree Pods symlink; this is the belt-and-braces pass for a
  // repository whose ignore rules predate that, so the link can never reach the commit.
  if(await git(cwd,['diff','--cached','--name-only','--','Pods']))await git(cwd,['rm','--cached','-q','--','Pods']);
  const staged=await git(cwd,['diff','--cached','--name-only']);
  if(!staged)throw Error('Nothing to commit in this worktree');
  await git(cwd,['commit','-m',message.slice(0,200)]);
  return git(cwd,['rev-parse','HEAD']);
}

async function exists(path){try{await stat(path);return true;}catch{return false;}}

// A worktree only carries tracked files, so CocoaPods output and the generated workspace are
// missing and every agent would otherwise re-copy 400+ MB of Pods (or build the wrong tree).
// Seed the worktree once: copy the small .xcworkspace, and symlink Pods only when the lock
// files agree, so a build inside the worktree compiles the worktree's own sources.
export async function provisionWorktree(repo,cwd){
 const notes=[];
 for(const entry of await readdir(repo,{withFileTypes:true}).catch(()=>[])){
  if(!entry.isDirectory()||!entry.name.endsWith('.xcworkspace'))continue;
  const target=join(cwd,entry.name);
  if(await exists(target))continue;
  try{await copyWorkspace(join(repo,entry.name),target);notes.push(`copied ${entry.name}`);}catch{notes.push(`could not copy ${entry.name}`);}
 }
 const pods=join(repo,'Pods');
 if(await exists(pods)&&!await exists(join(cwd,'Pods'))){
  const [worktreeLock,installed]=await Promise.all([readFile(join(cwd,'Podfile.lock'),'utf8').catch(()=>null),readFile(join(pods,'Manifest.lock'),'utf8').catch(()=>null)]);
  if(worktreeLock&&installed&&worktreeLock===installed){
   try{await symlink(pods,join(cwd,'Pods'),'dir');await excludePath(cwd,'/Pods');notes.push('linked Pods');}catch{notes.push('could not link Pods');}
  }else notes.push('Pods not linked: Podfile.lock differs from the main repository');
 }
 return notes.length?{provision:notes.join('; ')}:{};
}

async function copyWorkspace(from,to){
 await mkdir(to,{recursive:true});
 for(const entry of await readdir(from,{withFileTypes:true})){
  if(entry.name==='xcuserdata')continue;
  const src=join(from,entry.name),dst=join(to,entry.name);
  if(entry.isDirectory())await copyWorkspace(src,dst);
  else if(entry.isFile())await copyFile(src,dst);
 }
}
