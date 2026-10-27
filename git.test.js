import test from 'node:test';import assert from 'node:assert/strict';import {mkdtemp,rm,writeFile,mkdir,readFile,realpath,stat,lstat} from 'node:fs/promises';import {tmpdir} from 'node:os';import {join} from 'node:path';import {execFileSync} from 'node:child_process';import {prepareBranch,prepareBranchInRepo,prepareFix,validateWorktree,detachWorktree,checkoutBranch,changedPaths,headCommit,commitAll} from './git.js';
test('in-repo fix branch refuses a dirty tree, then commits only the fix',async()=>{const root=await mkdtemp(join(tmpdir(),'feishu-git-inrepo-'));const repo=join(root,'repo');const git=(...args)=>execFileSync('git',args,{cwd:repo,encoding:'utf8'}).trim();try{
 execFileSync('git',['init','-b','develop',repo]);git('config','user.email','t@e.test');git('config','user.name','T');
 await writeFile(join(repo,'a'),'a');await mkdir(join(repo,'Pods'),{recursive:true});await writeFile(join(repo,'Pods','keep'),'x');
 await writeFile(join(repo,'.gitignore'),'Pods/\n');git('add','.');git('commit','-m','init');
 const base=git('rev-parse','develop');
 await writeFile(join(repo,'dirty'),'x');
 await assert.rejects(prepareBranchInRepo(repo,{id:'p:bug:1',remoteId:1,title:'x'}),/uncommitted changes/);
 await rm(join(repo,'dirty'));
 const run=await prepareBranchInRepo(repo,{id:'p:bug:1',remoteId:1,title:'Crash on start'});
 assert.equal(run.cwd,await realpath(repo));assert.equal(run.inRepo,true);assert.equal(git('branch','--show-current'),run.branch);assert.equal(git('rev-parse','develop'),base);
 await assert.rejects(prepareBranchInRepo(repo,{id:'p:bug:1',remoteId:1,title:'Crash on start'}),/already exists/);
 await writeFile(join(repo,'fix.txt'),'fixed');
 const head=await commitAll(repo,'fix: thing');
 assert.equal(head,git('rev-parse','HEAD'));
 assert.equal(git('show','--stat','--name-only','HEAD').includes('fix.txt'),true);
}finally{await rm(root,{recursive:true,force:true});}});

test('an unclean repository keeps your work and isolates the fix in a worktree',async()=>{const root=await mkdtemp(join(tmpdir(),'feishu-git-auto-'));const repo=join(root,'repo');const git=(...args)=>execFileSync('git',args,{cwd:repo,encoding:'utf8'}).trim();try{
 execFileSync('git',['init','-b','develop',repo]);git('config','user.email','t@e.test');git('config','user.name','T');
 await writeFile(join(repo,'a'),'a');await writeFile(join(repo,'.gitignore'),'Pods/\n');
 await mkdir(join(repo,'SevMinWorkout.xcworkspace'),{recursive:true});await writeFile(join(repo,'SevMinWorkout.xcworkspace','contents.xcworkspacedata'),'<Workspace/>');
 await mkdir(join(repo,'Pods'),{recursive:true});await writeFile(join(repo,'Podfile.lock'),'LOCK');await writeFile(join(repo,'Pods','Manifest.lock'),'LOCK');
 git('add','.');git('commit','-m','init');
 await writeFile(join(repo,'wip.txt'),'my work in progress');
 const runs=join(root,'runs');
 const run=await prepareFix(repo,runs,{id:'p:bug:9',remoteId:9,title:'QA crash'});
 assert.equal(run.inRepo,false);assert.equal(run.isolated,true);assert.notEqual(run.cwd,await realpath(repo));
 assert.equal(git('status','--porcelain'),'?? wip.txt');assert.equal(git('branch','--show-current'),'develop');
 assert.equal((await readFile(join(run.cwd,'wip.txt'),'utf8').catch(()=>null)),null);
 assert.equal((await readFile(join(run.cwd,'SevMinWorkout.xcworkspace','contents.xcworkspacedata'),'utf8')),'<Workspace/>');
 assert.equal((await lstat(join(run.cwd,'Pods'))).isSymbolicLink(),true);
 assert.equal(execFileSync('git',['branch','--show-current'],{cwd:run.cwd,encoding:'utf8'}).trim(),run.branch);
 await writeFile(join(repo,'wip.txt'),'my work in progress, edited');
 assert.equal(await readFile(join(repo,'wip.txt'),'utf8'),'my work in progress, edited');
 const clean=join(root,'clean');execFileSync('git',['clone','-q',repo,clean]);execFileSync('git',['checkout','-q','develop'],{cwd:clean});
 const inRepo=await prepareFix(clean,join(root,'runs2'),{id:'p:bug:10',remoteId:10,title:'QA crash two'});
 assert.equal(inRepo.inRepo,true);assert.equal(inRepo.cwd,await realpath(clean));
}finally{await rm(root,{recursive:true,force:true});}});

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

test('worktree is provisioned with the generated workspace and a Pods link',async()=>{const root=await mkdtemp(join(tmpdir(),'feishu-git-provision-'));const repo=join(root,'repo');const git=(...args)=>execFileSync('git',args,{cwd:repo,encoding:'utf8'}).trim();try{
 execFileSync('git',['init','-b','develop',repo]);git('config','user.email','t@e.test');git('config','user.name','T');
 await writeFile(join(repo,'a'),'a');await writeFile(join(repo,'Podfile.lock'),'LOCK');
 await mkdir(join(repo,'Pods'),{recursive:true});await writeFile(join(repo,'Pods','Manifest.lock'),'LOCK');
 await mkdir(join(repo,'Demo.xcworkspace','xcshareddata'),{recursive:true});await writeFile(join(repo,'Demo.xcworkspace','contents.xcworkspacedata'),'<Workspace/>');
 await writeFile(join(repo,'.gitignore'),'Pods/\nxcuserdata/\n');
 await mkdir(join(repo,'Demo.xcworkspace','xcuserdata'),{recursive:true});await writeFile(join(repo,'Demo.xcworkspace','xcuserdata','me.xcuserdatad'),'skip');
 git('add','.');git('commit','-m','init');
 const run=await prepareBranch(repo,join(root,'runs'),{id:'p:bug:9',remoteId:9,title:'Build'});
 assert.match(run.provision,/linked Pods/);
 assert.equal(await realpath(join(run.cwd,'Pods')),await realpath(join(repo,'Pods')));
 assert.equal(await readFile(join(run.cwd,'Demo.xcworkspace','contents.xcworkspacedata'),'utf8'),'<Workspace/>');
 await assert.rejects(stat(join(run.cwd,'Demo.xcworkspace','xcuserdata')));
 await writeFile(join(repo,'Pods','Manifest.lock'),'DIFFERENT');
 const second=await prepareBranch(repo,join(root,'runs'),{id:'p:bug:10',remoteId:10,title:'Build'});
 assert.match(second.provision,/differs/);
 await assert.rejects(stat(join(second.cwd,'Pods')));
}finally{await rm(root,{recursive:true,force:true});}});
test('currentBranch identifies the checked out branch so shared trees stay attributable',async()=>{const root=await mkdtemp(join(tmpdir(),'feishu-git-branch-'));const repo=join(root,'repo');try{
 execFileSync('git',['init','-b','develop',repo]);
 const {currentBranch}=await import('./git.js');
 assert.equal(await currentBranch(repo),'develop');
}finally{await rm(root,{recursive:true,force:true});}});
