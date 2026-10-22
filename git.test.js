import test from 'node:test';import assert from 'node:assert/strict';import {mkdtemp,rm,writeFile} from 'node:fs/promises';import {tmpdir} from 'node:os';import {join} from 'node:path';import {execFileSync} from 'node:child_process';import {prepareBranch,validateWorktree,detachWorktree,checkoutBranch,changedPaths,headCommit} from './git.js';
test('separate worktree leaves develop and working directory unchanged',async()=>{const root=await mkdtemp(join(tmpdir(),'feishu-git-test-'));const repo=join(root,'repo');const git=(...args)=>execFileSync('git',args,{cwd:repo,encoding:'utf8'}).trim();try{execFileSync('git',['init','-b','develop',repo]);git('config','user.email','test@example.test');git('config','user.name','Test');await writeFile(join(repo,'a'),'a');git('add','.');git('commit','-m','init');const base=git('rev-parse','develop');const a=await prepareBranch(repo,join(root,'runs'),{id:'project:bug:123',remoteId:123,title:'Crash on start'});assert.match(a.branch,/^fix\/feishu-123($|-)/);assert.equal(git('branch','--show-current'),'develop');assert.equal(git('rev-parse','develop'),base);assert.equal(execFileSync('git',['branch','--show-current'],{cwd:a.cwd,encoding:'utf8'}).trim(),a.branch);await assert.rejects(prepareBranch(repo,join(root,'runs'),{id:'project:bug:123',remoteId:123,title:'Crash on start'}),/exists/);await validateWorktree(a);execFileSync('git',['checkout','-b','wrong-branch'],{cwd:a.cwd,stdio:'ignore'});await assert.rejects(validateWorktree(a),/branch changed/);}finally{await rm(root,{recursive:true,force:true});}});

test('acceptance moves the fix branch into the main repo without losing the worktree',async()=>{const root=await mkdtemp(join(tmpdir(),'feishu-git-accept-'));const repo=join(root,'repo');const git=(...args)=>execFileSync('git',args,{cwd:repo,encoding:'utf8'}).trim();try{
 execFileSync('git',['init','-b','develop',repo]);git('config','user.email','test@example.test');git('config','user.name','Test');await writeFile(join(repo,'a'),'a');git('add','.');git('commit','-m','init');
 const base=git('rev-parse','develop');const run=await prepareBranch(repo,join(root,'runs'),{id:'p:bug:7',remoteId:7,title:'Ring count'});
 await writeFile(join(run.cwd,'fix.txt'),'fixed');
 execFileSync('git',['add','-A'],{cwd:run.cwd});execFileSync('git',['commit','-m','fix'],{cwd:run.cwd});
 assert.notEqual(await headCommit(run.cwd),base);
 assert.equal(git('branch','--show-current'),'develop');
 await detachWorktree(run.cwd);
 assert.equal(execFileSync('git',['branch','--show-current'],{cwd:run.cwd,encoding:'utf8'}).trim(),'');
 await checkoutBranch(repo,run.branch);
 assert.equal(git('branch','--show-current'),run.branch);
 assert.equal(git('show',`${run.branch}:fix.txt`),'fixed');
 await checkoutBranch(repo,'develop');
 assert.equal(git('rev-parse','develop'),base);
 await writeFile(join(repo,'dirty.txt'),'x');
 await assert.rejects(checkoutBranch(repo,run.branch),/uncommitted/);
 await rm(join(repo,'dirty.txt'));
 await assert.rejects(checkoutBranch(repo,'feature/evil'),/Unexpected branch/);
}finally{await rm(root,{recursive:true,force:true});}});

test('changedPaths reports worktree edits the branch does not carry',async()=>{const root=await mkdtemp(join(tmpdir(),'feishu-git-dirty-'));const repo=join(root,'repo');try{
 execFileSync('git',['init','-b','develop',repo]);execFileSync('git',['config','user.email','t@e.test'],{cwd:repo});execFileSync('git',['config','user.name','T'],{cwd:repo});await writeFile(join(repo,'a'),'a');execFileSync('git',['add','.'],{cwd:repo});execFileSync('git',['commit','-m','init'],{cwd:repo});
 const run=await prepareBranch(repo,join(root,'runs'),{id:'p:bug:8',remoteId:8,title:'Icon'});
 assert.deepEqual(await changedPaths(run.cwd),[]);
 await writeFile(join(run.cwd,'b.txt'),'b');
 assert.equal((await changedPaths(run.cwd)).length,1);
}finally{await rm(root,{recursive:true,force:true});}});
