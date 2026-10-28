import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';

async function panel(snapshot){
 const source=await readFile(new URL('./client.js',import.meta.url),'utf8');
 const cells=[],calls=[];let cursor=0,render,dict={},next=snapshot,confirm=true;
 const React={createElement:(type,props,...children)=>({type,props:props??{},children:children.flat(Infinity).filter(v=>v!==false&&v!=null)}),Fragment:'fragment',useSyncExternalStore:()=>{},useEffect:()=>{},useRef:initial=>{const i=cursor++;return cells[i]??=( {current:i===7?true:initial});},useState:initial=>{const i=cursor++;if(!(i in cells))cells[i]=i===0?snapshot:i===6?{...initial,...snapshot.selection}:initial;return [cells[i],value=>{cells[i]=typeof value==='function'?value(cells[i]):value;}];}};
 const ctx={effect:fn=>fn(),locale:{register:(ns,lang,d)=>{if(lang==='zh')dict=d;},bind:()=>key=>dict[key]??key,subscribe:()=>()=>{},getSnapshot:()=>0},slots:{inject:(name,fn)=>fn(),register:entry=>{if(entry.key==='feishu-bugs')render=entry;}}};
 // register() receives the Panel as its second argument in the real slot API.
 ctx.slots.register=(entry,component)=>{if(entry.key==='feishu-bugs')render=component;};
 const sandbox={URL,document:{baseURI:'http://localhost/'},window:{confirm:()=>confirm,__ModuleLoader__:{load:module=>module.factory(()=>React).apply(ctx)}},fetch:async(url,options)=>{calls.push(JSON.parse(options.body));return {ok:true,json:async()=>next};}};
 vm.runInNewContext(source,sandbox);
 return {render:()=>{cursor=0;return render();},calls,respond:value=>{next=value;},confirm:value=>{confirm=value;}};
}
test('requirement selection is restored, submitted with statuses, and cleared by all requirements',async()=>{
 const base={auth:{state:'authenticated'},bugs:[],selection:{projectKey:'p',typeKey:'issue',repo:'/repo',statuses:['BUG'],requirementId:'123'},catalog:{projectKey:'p',projects:[{key:'p',name:'项目'}],types:[{key:'issue',name:'缺陷'}],requirements:{projectKey:'p',typeKey:'issue',options:[{id:'123',name:'OOG101 新版本'}]}}};
 const p=await panel(base);let tree=p.render();
 const select=nodes(tree).find(n=>n.type==='select'&&n.props['aria-label']==='所属需求（缺陷）');assert.ok(select);assert.equal(select.props.value,'123');
 await button(tree,'读取分配给我的 Bug').props.onClick();assert.equal(p.calls[0].selection.requirementId,'123');assert.deepEqual(p.calls[0].selection.statuses,['BUG']);
 select.props.onChange({target:{value:''}});tree=p.render();await button(tree,'读取分配给我的 Bug').props.onClick();assert.equal(p.calls[1].selection.requirementId,'');
});
test('changing a work item type clears requirement selection and hides stale options',async()=>{
 const p=await panel({auth:{state:'authenticated'},bugs:[],selection:{projectKey:'p',typeKey:'issue',requirementId:'123'},catalog:{projectKey:'p',projects:[{key:'p',name:'项目'}],types:[{key:'issue',name:'缺陷'},{key:'other',name:'其他'}],requirements:{projectKey:'p',typeKey:'issue',options:[{id:'123',name:'过期需求'}]}}});
 let tree=p.render();nodes(tree).find(n=>n.type==='input'&&n.props.type==='search').props.onChange({target:{value:'过期'}});tree=p.render();const typeSelect=nodes(tree).find(n=>n.type==='select'&&n.props.value==='issue');await typeSelect.props.onChange({target:{value:'other'}});tree=p.render();
 assert.equal(nodes(tree).find(n=>n.type==='input'&&n.props.type==='search').props.value,'');
 const select=nodes(tree).find(n=>n.type==='select'&&n.props['aria-label']==='所属需求（缺陷）');assert.equal(select.props.value,'');assert.equal(text(select).includes('过期需求'),false);
});

const nodes=tree=>typeof tree==='object'&&tree?[tree,...tree.children.flatMap(nodes)]:[];
const text=tree=>typeof tree==='string'?tree:tree?.children?.map(text).join('')??'';
const button=(tree,label)=>nodes(tree).find(n=>n.type==='button'&&text(n)===label);

test('requirement search shows matches, empty feedback and preserves selection until explicitly changed',async()=>{
 const options=[{id:'123',name:'OOG101 新版本'},{id:'456',name:'OOG102 打卡需求'},{id:'789',name:'OOG101 下个版本'}];
 const p=await panel({auth:{state:'authenticated'},bugs:[],selection:{projectKey:'p',typeKey:'issue',repo:'/repo',requirementId:'456',requirementName:'OOG102 打卡需求'},catalog:{projectKey:'p',requirements:{projectKey:'p',typeKey:'issue',options}}});
 const search=tree=>nodes(tree).find(n=>n.type==='input'&&n.props.type==='search');
 const select=tree=>nodes(tree).find(n=>n.type==='select'&&n.props['aria-label']==='所属需求（缺陷）');
 let tree=p.render();assert.match(text(tree),/匹配 3 \/ 3 个需求/);
 search(tree).props.onChange({target:{value:'  oog101  '}});tree=p.render();
 assert.match(text(tree),/匹配 2 \/ 3 个需求/);assert.equal(select(tree).props.size,6);assert.equal(select(tree).props.value,'456');
 assert.match(text(select(tree)),/OOG101 新版本/);assert.match(text(select(tree)),/OOG101 下个版本/);
 search(tree).props.onChange({target:{value:'#123'}});tree=p.render();assert.match(text(tree),/匹配 1 \/ 3 个需求/);assert.doesNotMatch(text(select(tree)),/OOG101 下个版本/);
 search(tree).props.onChange({target:{value:'不存在的需求'}});tree=p.render();assert.match(text(tree),/匹配 0 \/ 3 个需求/);assert.match(text(tree),/未找到匹配需求/);
 assert.match(text(tree),/当前已选：OOG102 打卡需求/);
 await button(tree,'读取分配给我的 Bug').props.onClick();assert.equal(p.calls[0].selection.requirementId,'456');
 button(tree,'清空搜索').props.onClick();tree=p.render();assert.equal(search(tree).props.value,'');assert.match(text(tree),/匹配 3 \/ 3 个需求/);assert.equal(select(tree).props.value,'456');
 search(tree).props.onChange({target:{value:'oog101'}});tree=p.render();select(tree).props.onChange({target:{value:'123'}});tree=p.render();
 assert.match(text(tree),/当前已选：OOG101 新版本/);await button(tree,'读取分配给我的 Bug').props.onClick();assert.equal(p.calls[1].selection.requirementId,'123');
});

test('requirement search cannot run before the catalog is loaded',async()=>{
 const p=await panel({auth:{state:'authenticated'},bugs:[],selection:{projectKey:'p',typeKey:'issue'}});
 const tree=p.render(),search=nodes(tree).find(n=>n.type==='input'&&n.props.type==='search');
 assert.equal(search.props.disabled,true);assert.doesNotMatch(text(tree),/匹配 0 \/ 0 个需求/);assert.doesNotMatch(text(tree),/未找到匹配需求/);
});

test('non-repair imports show their remote state without start or duplicate actions',async()=>{
 const p=await panel({auth:{state:'authenticated'},bugs:[{id:'a',remoteId:1,status:'imported',remoteStatus:'APPROVED',title:'Already approved',repo:'/repo'}]});
 let tree=p.render();assert.match(text(tree),/已读取 · 无需修复/);assert.match(text(tree),/APPROVED/);
 assert.equal(button(tree,'修复这条'),undefined);assert.equal(button(tree,'不是重复，继续'),undefined);
 await button(tree,'已读取 · 无需修复').props.onClick();tree=p.render();assert.match(text(tree),/Already approved/);
});

test('verified card offers an inline Feishu state editor and explicitly submits its selection',async()=>{
 const bug={id:'a',remoteId:1,status:'verified',title:'Fixed',repo:'/repo'},base={auth:{state:'authenticated'},bugs:[bug]};
 const p=await panel(base);let tree=p.render();
 const open=button(tree,'修改飞书状态');assert.ok(open,'accepted bugs expose the state editor');
 p.respond({...base,bugs:[{...bug,remoteWorkflow:{current:{key:'OPEN',name:'BUG'},options:[{id:'7',key:'CLOSED',name:'CLOSED',requiresForm:false}]}}]});
 await open.props.onClick();tree=p.render();assert.equal(p.calls[0].action,'remote-statuses');
 const select=nodes(tree).find(n=>n.type==='select'&&n.props['aria-label']==='目标飞书状态');assert.ok(select);
 assert.equal(button(tree,'确认修改').props.disabled,true,'a target must be chosen first');
 select.props.onChange({target:{value:'7'}});tree=p.render();
 p.confirm(false);await button(tree,'确认修改').props.onClick();assert.equal(p.calls.length,1,'cancelled confirmation never writes');
 p.confirm(true);p.respond({...base,bugs:[{...bug,remoteWorkflow:{current:{key:'CLOSED',name:'CLOSED'},options:[],updatedAt:'2026-10-28'}}]});
 await button(tree,'确认修改').props.onClick();tree=p.render();
 assert.deepEqual(p.calls[1],{action:'remote-status',id:'a',transitionId:'7',stateKey:'CLOSED'});
 assert.match(text(tree),/CLOSED/);assert.equal(button(tree,'确认修改'),undefined,'successful submission closes the editor');
 const pending=await panel({...base,bugs:[{...bug,status:'awaiting-verification'}]});assert.equal(button(pending.render(),'修改飞书状态'),undefined);
});
