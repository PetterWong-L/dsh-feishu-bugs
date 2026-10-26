import test from 'node:test';import assert from 'node:assert/strict';import {mkdtemp,rm,mkdir,writeFile} from 'node:fs/promises';import {tmpdir} from 'node:os';import {join} from 'node:path';import {findWorkspace,parseSchemes,pickScheme,runBuild,DESTINATION} from './build.js';

test('schemes are parsed from the workspace listing',()=>{
 const output='Information about workspace "SevMinWorkout":\n    Schemes:\n        Adapty\n        SevMinWorkout\n        Pods-Alamofire\n';
 assert.deepEqual(parseSchemes(output),['Adapty','SevMinWorkout','Pods-Alamofire']);
 assert.deepEqual(parseSchemes(''),[]);
});

test('the app scheme is chosen over Pods and single-candidate fallback works',()=>{
 assert.equal(pickScheme(['Adapty','SevMinWorkout','Pods-Alamofire'],'/r/SevMinWorkout.xcworkspace'),'SevMinWorkout');
 assert.equal(pickScheme(['Pods-A','Adapty','OnlyApp'],'/r/App.xcworkspace'),'OnlyApp');
 assert.equal(pickScheme(['Pods-A','A','B'],'/r/App.xcworkspace'),null);
 assert.equal(pickScheme([],'/r/App.xcworkspace'),null);
});

test('workspace discovery ignores Pods and survives an empty directory',async()=>{const root=await mkdtemp(join(tmpdir(),'feishu-build-'));try{
 await mkdir(join(root,'SevMinWorkout.xcworkspace'));
 await mkdir(join(root,'Pods.xcworkspace'));
 assert.equal(await findWorkspace(root),join(root,'SevMinWorkout.xcworkspace'));
 const empty=join(root,'empty');await mkdir(empty);
 assert.equal(await findWorkspace(empty),null);
}finally{await rm(root,{recursive:true,force:true});}});

test('the simulator destination never forces an SDK',()=>{
 assert.equal(DESTINATION,'generic/platform=iOS Simulator');
});

test('a build reports the newest app product and the log tail',async()=>{const root=await mkdtemp(join(tmpdir(),'feishu-runbuild-'));const bin=join(root,'bin');const cwd=join(root,'repo');const dd=join(root,'dd');try{
 await mkdir(bin,{recursive:true});await mkdir(cwd,{recursive:true});
 await writeFile(join(bin,'xcodebuild'),`#!/bin/sh
dd=""; prev=""
for a in "$@"; do
  if [ "$prev" = "-derivedDataPath" ]; then dd="$a"; fi
  prev="$a"
done
echo "note: Using new build system"
echo "Build settings from command line: $*"
mkdir -p "$dd/Build/Products/Debug-iphonesimulator/SevMinWorkout.app"
echo "** BUILD SUCCEEDED **"
`,{mode:0o755});
 const oldPath=process.env.PATH;process.env.PATH=`${bin}:${oldPath}`;
 try{
  const result=await runBuild({cwd,workspace:join(cwd,'SevMinWorkout.xcworkspace'),scheme:'SevMinWorkout',derivedData:dd});
  assert.equal(result.ok,true);
  assert.equal(result.app,join(dd,'Build','Products','Debug-iphonesimulator','SevMinWorkout.app'));
  assert.equal(result.log.includes('BUILD SUCCEEDED'),true,'log='+result.log);
  assert.ok(result.log.includes(DESTINATION),'log must name the destination: '+JSON.stringify(result.log));
  assert.equal(result.log.includes('-sdk '),false);
 }finally{process.env.PATH=oldPath;}
}finally{await rm(root,{recursive:true,force:true});}});
