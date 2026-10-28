// Render the actual client component with synthetic data; never contact Feishu.
// Usage: PLAYWRIGHT_BROWSERS_PATH=/path/to/browsers PLAYWRIGHT_PATH=/path/to/playwright/index.mjs node scripts/panel-layout-check.mjs
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {pathToFileURL,fileURLToPath} from 'node:url';
const {chromium}=await import(pathToFileURL(process.env.PLAYWRIGHT_PATH).href);
const out=new URL('../.panel-check/',import.meta.url);await mkdir(out,{recursive:true});
const snapshot={auth:{state:'authenticated'},selection:{projectKey:'demo',projectName:'需求管理',typeKey:'issue',typeName:'缺陷',repo:'/Users/demo/project',statuses:'BUG,REOPENED'},catalog:{projectKey:'demo',projects:[{key:'demo',name:'需求管理'}],types:[{key:'issue',name:'缺陷'}],statuses:[{key:'bug',name:'BUG'},{key:'reopened',name:'REOPENED'}]},bugs:[{id:'a',remoteId:1042,title:'登录页面在小屏设备下按钮被键盘遮挡，无法完成登录',status:'queued',remoteStatus:'BUG',repo:'/Users/demo/project'},{id:'b',remoteId:1043,title:'个人资料保存后未及时刷新头像',status:'awaiting-verification',remoteStatus:'REOPENED',repo:'/Users/demo/project',cwd:'/Users/demo/project',branch:'fix/feishu-1043-avatar',commit:'c2b8a14',summary:'已修复资料保存后的视图刷新逻辑，请人工检查。'}]};
let cursor=0,render,dict={};const cells=[];
const React={Fragment:'fragment',createElement:(type,props,...children)=>({type,props:props??{},children:children.flat(Infinity).filter(v=>v!==false&&v!=null)}),useSyncExternalStore:()=>{},useEffect:()=>{},useRef:value=>{const i=cursor++;return cells[i]??={current:value};},useState:value=>{const i=cursor++;if(!(i in cells))cells[i]=i===0?snapshot:i===6?{...value,...snapshot.selection}:value;return [cells[i],()=>{}];}};
const ctx={effect:fn=>fn(),locale:{register:(ns,lang,d)=>{if(lang==='zh')dict=d;},bind:()=>key=>dict[key]??key},slots:{inject:(name,fn)=>fn(),register:(entry,component)=>{if(entry.key==='feishu-bugs')render=component;}}};
vm.runInNewContext(await readFile(new URL('../client.js',import.meta.url),'utf8'),{URL,window:{__ModuleLoader__:{load:module=>module.factory(()=>React).apply(ctx)}}});
const escape=value=>String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
function html(node){
 if(typeof node!=='object')return escape(node);
 if(typeof node.type==='function')return html(node.type(node.props));
 const content=node.children.map(html).join('');if(node.type==='fragment')return content;
 const attrs=Object.entries(node.props).filter(([key,value])=>!['key','children'].includes(key)&&!key.startsWith('on')&&typeof value!=='function'&&value!==false&&value!=null).map(([key,value])=>` ${key==='className'?'class':key}="${escape(value===true?'':value)}"`).join('');
 return `<${node.type}${attrs}>${node.type==='style'?node.children.join(''):content}</${node.type}>`;
}
const tokens=`:root{--dsw-alias-bg-base:#f5f6fa;--dsw-alias-bg-layer-1:#fff;--dsw-alias-bg-layer-2:#f5f7f9;--dsw-alias-label-primary:#1c2934;--dsw-alias-label-secondary:#697b87;--dsw-alias-border-l1:#e1e6e9;--dsw-alias-state-success-primary:#207b70;--dsw-alias-state-warn-primary:#98660a;--dsw-alias-state-error-primary:#c23737}html,body{margin:0;height:100%;font:14px -apple-system,BlinkMacSystemFont,sans-serif}body>section{height:100%}`;
const pageHtml=`<!doctype html><html lang="zh"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${tokens}</style><body>${html(render())}</body></html>`;
await writeFile(new URL('panel.html',out),pageHtml);
const browser=await chromium.launch({headless:true});
try{
 const page=await browser.newPage();await page.goto(new URL('panel.html',out).href);
 for(const width of [1600,1000,390]){
  await page.setViewportSize({width,height:1100});
  const layout=await page.evaluate(()=>{const p=document.querySelector('.fb-panel'),rail=document.querySelector('.fb-sidebar').getBoundingClientRect(),main=document.querySelector('.fb-main').getBoundingClientRect();return {width:p.clientWidth,scroll:p.scrollWidth,rail:{x:rail.x,y:rail.y,right:rail.right},main:{x:main.x,y:main.y}};});
  assert.ok(layout.scroll<=layout.width+1,`horizontal overflow at ${width}: ${JSON.stringify(layout)}`);
  assert.ok(width>760?layout.main.x>=layout.rail.right:layout.main.y>layout.rail.y,`wrong column layout at ${width}`);
  await page.screenshot({path:fileURLToPath(new URL(`panel-${width}.png`,out)),fullPage:true});console.log(width,JSON.stringify(layout));
 }
 await page.setViewportSize({width:1600,height:1100});
 await page.addStyleTag({content:':root{--dsw-alias-bg-base:#171b20;--dsw-alias-bg-layer-1:#22282e;--dsw-alias-bg-layer-2:#2b3239;--dsw-alias-label-primary:#e6edf2;--dsw-alias-label-secondary:#a9b6bf;--dsw-alias-border-l1:#3e4850}'});
 await page.screenshot({path:fileURLToPath(new URL('panel-dark.png',out)),fullPage:true});
}finally{await browser.close();}
console.log('Synthetic component previews:',fileURLToPath(out));
