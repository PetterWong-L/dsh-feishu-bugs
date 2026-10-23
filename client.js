window.__ModuleLoader__.load({id:'@local/feishu-bugs',factory(require){
 const React=require('react'),h=React.createElement;
 const dictionaries={
  zh:{title:'飞书缺陷工作流',subtitle:'一条缺陷，一个分支；验证和合并，始终由你决定。',refresh:'刷新状态',config:'飞书项目扫码授权',intro:'使用飞书扫描官方 Meegle 授权二维码，并在官方页面确认授权。无需填写访问令牌或 User Key。',generate:'生成授权二维码',checkAuth:'检查授权状态',cancelAuth:'取消授权',openAuth:'打开官方授权页面',qrAlt:'飞书项目官方授权二维码',userCode:'授权确认码',expires:'有效期至',authIdle:'尚未授权',authInitializing:'正在生成二维码',authPending:'等待扫码确认',authAuthenticated:'已授权',authExpired:'授权已过期，请重新扫码',authUnreachable:'授权服务暂时无法连接',authError:'授权失败，请重试',authHint:'授权由官方流程及本机原生钥匙串管理，无需手填令牌。状态由服务端推送；首次扫码后才能验证实际项目字段配置。',readProjects:'读取项目列表',projectPlaceholder:'请选择项目',typePlaceholder:'请选择缺陷类型',readTypes:'读取工作项类型',statuses:'状态',statusHint:'点选要读取的工作流状态，默认 BUG、REOPENED。',readStatuses:'读取可选状态',statusPending:'正在读取状态…',statusEmpty:'先从工作项类型读取可选状态',synced:'已读取 {total} 条待处理缺陷，导入 {imported} 条。',pruned:'已清理 {n} 条筛选外的未开始项。',truncated:'超出单次导入上限，仅导入最近的缺陷。',scope:'选择本轮任务范围',project:'项目',type:'缺陷工作项类型',repo:'代码仓库根目录',pick:'选择目录',sync:'读取分配给我的 Bug',note:'以本地 develop 当前提交为基线，不会自动 fetch、push 或 merge。请先手动更新 develop。',queued:'待修复',running:'修复中',preparing:'准备分支','duplicate-review':'疑似重复 · 待确认',skipped:'已确认重复 · 跳过','awaiting-verification':'待你验证',verified:'验证通过 · 待手动合并','changes-requested':'需继续修改',failed:'执行失败',all:'全部',start:'修复这条',startNote:'补充说明（可选）',startNoteHint:'描述不清或修复思路不确定时写在这里，会随任务交给 agent。',startGo:'开始修复',queue:'依次修复队列',pause:'暂停后续任务',duplicate:'确认重复，跳过',distinct:'不是重复，继续',pass:'验证通过',reject:'验证未通过',retry:'反馈并重试',fbSubmit:'提交重试',fbCancel:'取消',task:'查看执行任务',empty:'先授权并选择项目与仓库，再读取缺陷',hint:'未读取任何真实缺陷。不会创建分支或启动修复。',candidates:'可能重复的缺陷',history:'最近操作',waiting:'请求处理中…',confirm:'确认执行此操作？',qconfirm:'依次为待修复 Bug 创建独立分支并启动修复？会消耗模型额度；不会自动合并。',feedback:'填写复现现象、验证结果和需要调整的内容',notice:'执行结束只代表进入人工验收，不等于修复正确。重复检测为文本相似候选，仍需你确认。',commit:'提交',commitWork:'提交 worktree 改动',fixLog:'修复日志',dirtyShort:'未提交 {n} 项',dirtyHint:'工作区还有未提交改动，分支拿不到这些修改；请用“反馈并重试”让 agent 先提交。',checkoutBranch:'在主仓检出该分支',backToDevelop:'主仓切回 develop',checkoutHint:'把主仓切到这个修复分支，用主仓现成的 Pods 和 workspace 构建验收；主仓有未提交改动时会拒绝。',backToDevelopHint:'验收结束把主仓切回 develop 基线；不合并、不拉取、不删分支。主仓有未提交改动时会拒绝。',checkedOut:'已把主仓切到该分支，构建运行验收后再由你合并。',error:'请求未完成；请刷新确认实际状态后再重试。',source:'来源',emptyfilter:'此状态暂无缺陷',gone:'已离开筛选',goneNote:'飞书里已不在当前筛选范围；保留记录便于回看，确认后可移除。',remove:'移除',refreshList:'刷新列表',syncing:'同步中…',lastSync:'上次同步',syncedCount:'共 {total} 条 · 导入 {imported}'},
  en:{title:'Feishu Bug Workflow',subtitle:'One bug, one branch. Verification and merging stay in your hands.',refresh:'Refresh',config:'Feishu Project QR authorization',intro:'Scan the official Meegle authorization QR code with Feishu and confirm on the official page. No access token or User Key entry is needed.',generate:'Generate authorization QR',checkAuth:'Check authorization',cancelAuth:'Cancel authorization',openAuth:'Open official authorization page',qrAlt:'Official Feishu Project authorization QR code',userCode:'Confirmation code',expires:'Expires at',authIdle:'Not authorized',authInitializing:'Generating QR code',authPending:'Waiting for scan and confirmation',authAuthenticated:'Authorized',authExpired:'Authorization expired. Scan again.',authUnreachable:'Authorization service is unreachable',authError:'Authorization failed. Please retry.',authHint:'Official authorization uses the native local keychain, with no manual token entry. Status is pushed by the server. The first scan is required to verify your actual project schema.',readProjects:'Read projects',projectPlaceholder:'Choose a project',typePlaceholder:'Choose a defect type',readTypes:'Read work item types',statuses:'Status',statusHint:'Pick the workflow states to read; defaults to BUG and REOPENED.',readStatuses:'Load statuses',statusPending:'Loading statuses…',statusEmpty:'Load statuses from the work item type first',synced:'Read {total} open bugs; imported {imported}.',pruned:'Removed {n} untouched items outside the filter.',truncated:'Imported only the most recent bugs above the per-run limit.',scope:'Select this task scope',project:'Project',type:'Defect work item type',repo:'Repository root',pick:'Choose directory',sync:'Read bugs assigned to me',note:'Uses the current local develop commit. No automatic fetch, push or merge. Update develop manually first.',queued:'Queued',running:'Running',preparing:'Preparing branch','duplicate-review':'Possible duplicate · review needed',skipped:'Confirmed duplicate · skipped','awaiting-verification':'Awaiting your verification',verified:'Verified · merge manually','changes-requested':'Changes requested',failed:'Failed',all:'All',start:'Fix this bug',startNote:'Extra instructions (optional)',startNoteHint:'Use this when the report is unclear or the fix approach is open; it is passed to the agent with the task.',startGo:'Start repair',queue:'Run repair queue',pause:'Pause next tasks',duplicate:'Confirm duplicate and skip',distinct:'Not a duplicate; continue',pass:'Verification passed',reject:'Verification failed',retry:'Give feedback and retry',fbSubmit:'Send and retry',fbCancel:'Cancel',task:'View execution tasks',empty:'Authorize and select a project and repository first',hint:'No real bugs imported. No branches or repair tasks will be created yet.',candidates:'Potential duplicates',history:'Recent activity',waiting:'Request in progress…',confirm:'Confirm this action?',qconfirm:'Create a separate branch and start repairs for queued bugs? This consumes model quota and never merges automatically.',feedback:'Describe reproduction steps, verification results and required changes',notice:'Execution completion only means human acceptance is required, not that the fix is correct. Text similarity only suggests duplicates; you decide.',commit:'Commit',commitWork:'Commit worktree changes',fixLog:'Fix log',dirtyShort:'{n} uncommitted',dirtyHint:'The worktree still has uncommitted changes, so this branch does not carry them yet; use "Give feedback and retry" to have the agent commit first.',checkoutBranch:'Check out this branch in the main repo',backToDevelop:'Switch main repo back to develop',checkoutHint:'Switches the main repo to this fix branch so you can build with its existing Pods and workspace; refuses when the main repo has uncommitted changes.',backToDevelopHint:'Switches the main repo back to the develop baseline; never merges, pulls or deletes branches; refuses when the main repo has uncommitted changes.',checkedOut:'The main repository is now on that branch; build and run it, then merge yourself.',error:'Request did not complete. Refresh to confirm the actual state before retrying.',source:'Source',emptyfilter:'No bugs in this status',gone:'Left the filter',goneNote:'No longer in the current Feishu filter; kept for reference until you remove it.',remove:'Remove',refreshList:'Refresh list',syncing:'Syncing…',lastSync:'Last sync',syncedCount:'{total} total · {imported} imported'}
 };
 function Icon({size=20}){return h('svg',{width:size,height:size,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:1.7,'aria-hidden':true},h('path',{d:'M7 4v5m10-5v5M4 12h3m10 0h3M7 18l-3 3m13-3 3 3M9 3l3 2 3-2'}),h('rect',{x:7,y:7,width:10,height:14,rx:5}),h('path',{d:'M12 9v9m-4-5h8'}));}
 function officialAuthUrl(value){
  if(typeof value!=='string')return null;
  try{const url=new URL(value);return url.protocol==='https:'&&!url.username&&!url.password&&(!url.port||url.port==='443')&&(url.hostname==='feishu.cn'||url.hostname.endsWith('.feishu.cn'))?url.href:null;}catch{return null;}
 }
 const css=`
 .fb-panel{height:100%;overflow:auto;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);font:inherit}
 .fb-panel *{box-sizing:border-box}.fb-inner{max-width:1000px;margin:auto;padding:18px 18px 44px}
 .fb-kicker{font:11px ui-monospace,monospace;letter-spacing:.16em;color:var(--dsw-alias-label-secondary)}
 .fb-head,.fb-row{display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap}
 .fb-head h1{font-size:21px;font-weight:650;letter-spacing:-.03em;margin:4px 0}
 .fb-muted{color:var(--dsw-alias-label-secondary);font-size:12px;line-height:1.7}
 .fb-statbar{display:grid;grid-template-columns:repeat(4,1fr);border-block:1px solid var(--dsw-alias-border-l1);margin:12px 0 14px}
 .fb-stat{padding:8px 10px;border-right:1px solid var(--dsw-alias-border-l1)}.fb-stat:first-child{padding-left:0}.fb-stat:last-child{border:0}
 .fb-stat strong{display:block;font:18px ui-monospace,monospace;margin-top:2px}
 .fb-panel button,.fb-panel input,.fb-panel select{font:inherit;font-size:12px;padding:6px 10px;border:1px solid var(--dsw-alias-border-l1);border-radius:6px;background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary)}
 .fb-panel button{cursor:pointer}.fb-panel button:hover{border-color:var(--dsw-alias-brand-primary)}.fb-panel button:disabled{opacity:.5;cursor:not-allowed}
 .fb-panel :focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:3px}
 .fb-panel .fb-accent{background:var(--dsw-alias-brand-primary);color:var(--dsw-alias-bg-base);border-color:var(--dsw-alias-brand-primary)}
 .fb-box{border:1px solid var(--dsw-alias-border-l1);border-radius:8px;padding:10px 12px;margin-bottom:8px;background:var(--dsw-alias-bg-layer-1)}
 .fb-box>summary{font-size:12px;font-weight:600;color:var(--dsw-alias-label-primary);display:flex;align-items:center;gap:8px;list-style:none}
 .fb-box>summary::-webkit-details-marker{display:none}.fb-box>summary:before{content:'▸';font-size:10px;color:var(--dsw-alias-label-secondary)}
 .fb-box[open]>summary:before{content:'▾'}.fb-box[open]>summary{margin-bottom:8px}
 .fb-auth-pill{font:10px ui-monospace,monospace;padding:1px 6px;border-radius:999px;border:1px solid var(--dsw-alias-border-l1);color:var(--dsw-alias-label-secondary);font-weight:400}
 .fb-auth-pill[data-state=authenticated]{color:var(--dsw-alias-state-success-primary);border-color:currentColor}
 .fb-auth-pill[data-state=expired],.fb-auth-pill[data-state=error],.fb-auth-pill[data-state=unreachable]{color:var(--dsw-alias-state-warn-primary);border-color:currentColor}
 .fb-status{margin:8px 0 10px}.fb-field-label{display:block;font-size:12px;color:var(--dsw-alias-label-secondary);margin-bottom:6px}
 .fb-chips{display:flex;flex-wrap:wrap;gap:6px}
 .fb-chip{font:11px ui-monospace,monospace!important;padding:3px 9px!important;border-radius:999px!important;border:1px solid var(--dsw-alias-border-l1)!important;background:transparent!important;color:var(--dsw-alias-label-secondary)!important;cursor:pointer}
 .fb-chip.is-on{background:var(--dsw-alias-brand-primary)!important;border-color:var(--dsw-alias-brand-primary)!important;color:var(--dsw-alias-bg-base)!important}
 .fb-box summary{cursor:pointer;font-weight:600;font-size:13px}.fb-fields{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin:10px 0}
 .fb-field{display:grid;gap:7px;font-size:12px;color:var(--dsw-alias-label-secondary);min-width:0}.fb-field input,.fb-field select{width:100%;min-width:0}.fb-repo{grid-column:1/-1}
 .fb-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}.fb-auth{border-top:3px solid var(--dsw-alias-brand-primary)}
 .fb-auth-body{display:flex;align-items:flex-start;gap:16px;margin-top:10px}.fb-auth-copy{flex:1;min-width:0}
 .fb-qr{display:block;width:132px;height:132px;max-width:100%;padding:12px;background:#fff;border-radius:8px;object-fit:contain;flex-shrink:0}
 .fb-auth h2{font-size:17px;margin:0}.fb-auth a{display:inline-block;color:var(--dsw-alias-brand-primary);font-size:13px;overflow-wrap:anywhere;margin:12px 0}
 .fb-auth-code{font:18px ui-monospace,monospace;letter-spacing:.1em;overflow-wrap:anywhere}.fb-auth-status{font-size:13px;margin:12px 0}
 .fb-auth-status[data-state=authenticated]{color:var(--dsw-alias-state-success-primary)}
 .fb-auth-status[data-state=expired],.fb-auth-status[data-state=error],.fb-auth-status[data-state=unreachable]{color:var(--dsw-alias-state-warn-primary)}
 .fb-note{border-left:2px solid var(--dsw-alias-brand-primary);padding-left:10px;margin:10px 0}
 .fb-error{color:var(--dsw-alias-state-error-primary);font-size:12px;overflow-wrap:anywhere}.fb-toolbar{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;margin:10px 0;flex-wrap:wrap}
 .fb-tabs{display:flex;gap:4px;flex-wrap:wrap;margin:0}
 .fb-sync{display:flex;align-items:center;gap:8px;font-size:11px;flex-shrink:0}
 .fb-sync button{font-size:11px!important;padding:4px 9px!important}.fb-tabs button[aria-pressed=true]{border-color:var(--dsw-alias-brand-primary);color:var(--dsw-alias-brand-primary)}
 .fb-bug{border-top:1px solid var(--dsw-alias-border-l1);padding:9px 0}.fb-bugline{display:grid;grid-template-columns:auto auto minmax(0,1fr) auto;align-items:center;gap:8px}.fb-bugline h2{font-size:13px;font-weight:500;margin:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.fb-bugactions{display:flex;gap:5px;flex-wrap:wrap;justify-content:flex-end}.fb-bugactions button{font-size:11px;padding:4px 8px}.fb-meta{display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-top:3px;font-size:11px;color:var(--dsw-alias-label-secondary)}.fb-meta code{font-size:11px;opacity:.9}.fb-path{max-width:46ch;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.fb-dirty{color:var(--dsw-alias-state-warn-primary)}.fb-log{margin-top:4px}.fb-log summary{cursor:pointer;font-size:11px;color:var(--dsw-alias-label-secondary)}.fb-warn{color:var(--dsw-alias-state-warn-primary);font-size:11px;margin:4px 0}.fb-id{font:12px ui-monospace,monospace;color:var(--dsw-alias-label-secondary)}
 .fb-badge{font-size:10px;padding:2px 6px;border:1px solid var(--dsw-alias-border-l1);border-radius:4px}.fb-badge[data-state=duplicate-review],.fb-badge[data-state=awaiting-verification]{color:var(--dsw-alias-state-warn-primary)}
 .fb-badge[data-state=failed]{color:var(--dsw-alias-state-error-primary)}.fb-badge[data-state=verified]{color:var(--dsw-alias-state-success-primary)}
 .fb-feedback{margin-top:10px}.fb-feedback textarea{box-sizing:border-box;width:100%;min-height:82px;padding:10px 12px;border:1px solid var(--dsw-alias-border-l1);border-radius:6px;background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary);font:13px/1.6 inherit;resize:vertical}
 .fb-bug code{overflow-wrap:anywhere}.fb-bug pre{white-space:pre-wrap;overflow-wrap:anywhere;font:11px/1.6 ui-monospace,monospace;background:var(--dsw-alias-bg-layer-2);padding:10px 12px;border-radius:6px;max-height:340px;overflow:auto;margin:6px 0 0}
 .fb-hint{font-size:11px;color:var(--dsw-alias-label-secondary);margin:4px 0 0}
 .fb-gone{display:flex;align-items:center;gap:8px;font-size:11px;color:var(--dsw-alias-label-secondary);margin:6px 0}
 .fb-gone button{font-size:10px!important;padding:2px 7px!important}
 .fb-empty{text-align:center;padding:28px 18px;color:var(--dsw-alias-label-secondary)}.fb-empty h2{font-size:17px}
 @media(max-width:640px){.fb-inner{padding:22px 16px 40px}.fb-head h1{font-size:25px}.fb-fields{grid-template-columns:1fr}.fb-statbar{grid-template-columns:repeat(2,1fr)}.fb-stat:nth-child(2){border-right:0}.fb-auth-body{flex-direction:column}.fb-qr{align-self:center}.fb-actions button{max-width:100%}}
 `;
 return {inject:['slots','locale','uiWorkspace','layout','taskBoard'],apply(ctx){
  for(const [lang,dict]of Object.entries(dictionaries))ctx.effect(()=>ctx.locale.register('feishu-bugs',lang,dict));
  const t=ctx.locale.bind('feishu-bugs');
  function Panel(){
   React.useSyncExternalStore(fn=>ctx.locale.subscribe(fn),()=>ctx.locale.getSnapshot());
   const [data,setData]=React.useState(null),[busy,setBusy]=React.useState(false),[error,setError]=React.useState(''),[filter,setFilter]=React.useState('all');
   const [feedbackFor,setFeedbackFor]=React.useState(''),[feedbackText,setFeedbackText]=React.useState('');
   const [selection,setSelection]=React.useState({projectKey:'',projectName:'',typeKey:'',typeName:'',statuses:'BUG,REOPENED',repo:''});
   const alive=React.useRef(false),lock=React.useRef(false),loaded=React.useRef(false),loadSequence=React.useRef(0),autoChecked=React.useRef(false);
   const endpoint=()=>new URL('feishu-bugs/api',document.baseURI);
   async function load(){
    const sequence=++loadSequence.current;
    try{const r=await fetch(endpoint(),{credentials:'same-origin',cache:'no-store'});if(!r.ok)throw Error();const d=await r.json();if(alive.current&&sequence===loadSequence.current){setData(d);if(!loaded.current){setSelection(s=>({...s,...d.selection}));loaded.current=true;}}}catch{if(alive.current&&sequence===loadSequence.current)setError(t('error'));}
   }
   React.useEffect(()=>{alive.current=true;load();const events=new EventSource(new URL('feishu-bugs/events',document.baseURI));events.onmessage=()=>load();events.onerror=()=>{if(alive.current)setError(t('error'));};return()=>{alive.current=false;loadSequence.current++;events.close();};},[]);
   async function request(args){
    const cancelling=args.action==='auth-cancel';
     if(lock.current&&!cancelling)return false;if(!cancelling){lock.current=true;setBusy(true);}setError('');
    // Invalidate older GETs; SSE-triggered reads still deliver server-owned updates.
    ++loadSequence.current;
    try{const r=await fetch(endpoint(),{method:'POST',credentials:'same-origin',cache:'no-store',headers:{'Content-Type':'application/json','X-DSH-Feishu-Bugs':'1'},body:JSON.stringify(args)});const d=await r.json();if(!r.ok)throw Error(d.error||t('error'));if(alive.current){++loadSequence.current;setData(d);}return true;}catch(e){if(alive.current)setError(e.message);return false;}finally{if(!cancelling){lock.current=false;if(alive.current)setBusy(false);}}
   }
   // Re-verify a keychain-backed login once per page, so a fresh panel is not stuck at "not authorized".
   React.useEffect(()=>{if(data?.auth?.state==='idle'&&!autoChecked.current){autoChecked.current=true;request({action:'auth-check'});}},[data?.auth?.state]);
   const auth=data?.auth??{state:'idle'},authenticated=auth.state==='authenticated',catalog=data?.catalog??{};
   const projects=catalog.projects??[],types=catalog.projectKey===selection.projectKey?(catalog.types??[]):[];
   const authLabels={idle:'authIdle',initializing:'authInitializing',pending:'authPending',authenticated:'authAuthenticated',expired:'authExpired',unreachable:'authUnreachable',error:'authError'};
   const authUrl=officialAuthUrl(auth.url),qr=typeof auth.qr==='string'&&/^data:image\/png;base64,[A-Za-z0-9+/=\r\n]+$/.test(auth.qr)?auth.qr:null;
   const expiry=auth.expiresAt?new Date(auth.expiresAt):null;
   const [noteFor,setNoteFor]=React.useState(''),[noteText,setNoteText]=React.useState('');
   const act=(args,message)=>{if(window.confirm(message||t('confirm')))request(args);};
   const button=(label,onClick,accent=false,authAction=true,disabled=false,interrupt=false,title)=>h('button',{type:'button',disabled:(busy&&!interrupt)||(!authAction&&!authenticated)||disabled,onClick,className:accent?'fb-accent':undefined,title},label);
   const field=(key,label)=>h('label',{className:'fb-field',key},label,h('input',{value:selection[key]??'',disabled:busy||!authenticated,onChange:e=>setSelection(s=>({...s,[key]:e.target.value})),autoComplete:'off',spellCheck:false}));
   function selectProject(event){
    if(lock.current)return;const key=event.target.value,project=projects.find(p=>p.key===key);
    setSelection(s=>({...s,projectKey:key,projectName:project?.name??'',typeKey:'',typeName:''}));
    if(key)request({action:'types',projectKey:key});
   }
   function selectType(event){
    if(lock.current)return;const key=event.target.value,type=types.find(item=>item.key===key);
    setSelection(s=>({...s,typeKey:type?.key??'',typeName:type?.name??''}));
    if(key)request({action:'statuses',projectKey:selection.projectKey,typeKey:key});
   }
   const parseStatuses=value=>String(value??'').split(',').map(v=>v.trim()).filter(Boolean);
   const selectedStatuses=parseStatuses(selection.statuses);
   const statusOptions=catalog.statusesFor?.typeKey===selection.typeKey?(catalog.statuses??[]):[];
   function toggleStatus(name){setSelection(s=>{const next=parseStatuses(s.statuses);const at=next.indexOf(name);at<0?next.push(name):next.splice(at,1);return {...s,statuses:next.join(',')};});}
   const syncAt=data?.sync?.at?new Date(data.sync.at):null;
   const syncNow=()=>request({action:'sync',selection:{...selection,statuses:selectedStatuses,projectName:projects.find(p=>p.key===selection.projectKey)?.name||selection.projectName,typeName:types.find(i=>i.key===selection.typeKey)?.name||selection.typeName}});
   const bugs=data?.bugs??[],visible=bugs.filter(b=>filter==='gone'?!!b.gone:(!b.gone&&(filter==='all'||b.status===filter)));
   return h('section',{className:'fb-panel','aria-label':t('title')},h('style',null,css),h('div',{className:'fb-inner'},
    h('div',{className:'fb-kicker'},'FEISHU / HUMAN-IN-THE-LOOP'),
    h('header',{className:'fb-head'},h('div',null,h('h1',null,t('title')),h('p',{className:'fb-muted'},t('subtitle'))),button(t('refresh'),load)),
    h('div',{className:'fb-statbar'},['queued','duplicate-review','running','awaiting-verification'].map(s=>h('div',{className:'fb-stat',key:s},h('span',{className:'fb-muted'},t(s)),h('strong',null,data?bugs.filter(b=>!b.gone&&b.status===s).length:'—')))),
    h('details',{className:'fb-box fb-auth',open:auth.state!=='authenticated','aria-label':t('config')},
     h('summary',null,t('config'),h('span',{className:'fb-auth-pill','data-state':auth.state},t(authLabels[auth.state]??'authError'))),h('p',{className:'fb-muted'},t('intro')),
     h('div',{className:'fb-auth-body'},qr&&['pending','initializing'].includes(auth.state)&&h('img',{className:'fb-qr',src:qr,alt:t('qrAlt'),width:212,height:212}),
      h('div',{className:'fb-auth-copy'},
       h('p',{className:'fb-auth-status',role:'status','aria-live':'polite','data-state':auth.state},t(authLabels[auth.state]??'authError')),
       auth.message&&h('p',{className:'fb-muted'},auth.message),
       ['pending','initializing'].includes(auth.state)&&h(React.Fragment,null,
        authUrl&&h('a',{href:authUrl,target:'_blank',rel:'noreferrer noopener'},t('openAuth')),
        auth.userCode&&h('div',null,h('span',{className:'fb-muted'},t('userCode')),h('p',{className:'fb-auth-code'},auth.userCode)),
        expiry&&!Number.isNaN(expiry.getTime())&&h('p',{className:'fb-muted'},t('expires'),' · ',h('time',{dateTime:expiry.toISOString()},expiry.toLocaleString()))),
       h('div',{className:'fb-actions'},
        button(t('generate'),()=>request({action:'auth-start'}),true,true,['initializing','pending'].includes(auth.state)),
        button(t('checkAuth'),()=>request({action:'auth-check'}),false,true,auth.state==='initializing'),
        button(t('cancelAuth'),()=>request({action:'auth-cancel'}),false,true,!busy&&!['initializing','pending','unreachable','expired','error'].includes(auth.state),true)),
       h('p',{className:'fb-muted'},t('authHint'))))),
    h('details',{className:'fb-box',open:!bugs.length},h('summary',null,t('scope'),' · ',selection.projectName||t('projectPlaceholder')),
     h('div',{className:'fb-actions'},button(t('readProjects'),()=>request({action:'projects'}),false,false)),
     catalog.error&&h('p',{className:'fb-error',role:'alert'},catalog.error),
     h('div',{className:'fb-fields'},
      h('label',{className:'fb-field'},t('project'),h('select',{value:selection.projectKey,disabled:busy||!authenticated||!projects.length,onChange:selectProject},
       h('option',{value:''},t('projectPlaceholder')),
       selection.projectKey&&!projects.some(p=>p.key===selection.projectKey)&&h('option',{value:selection.projectKey},selection.projectName||selection.projectKey),
       projects.map(project=>h('option',{key:project.key,value:project.key},project.name)))),
      h('label',{className:'fb-field'},t('type'),h('select',{value:selection.typeKey,disabled:busy||!authenticated||!types.length,onChange:selectType},
       h('option',{value:''},t('typePlaceholder')),
       selection.typeKey&&!types.some(type=>type.key===selection.typeKey)&&h('option',{value:selection.typeKey},selection.typeName||selection.typeKey),
       types.map(type=>h('option',{key:type.key,value:type.key},type.name)))),
      h('div',{className:'fb-repo'},button(t('readTypes'),()=>request({action:'types',projectKey:selection.projectKey}),false,false,!selection.projectKey)),
      h('div',{className:'fb-status'},h('span',{className:'fb-field-label'},t('statuses')),
      statusOptions.length?h('div',{className:'fb-chips'},statusOptions.map(o=>h('button',{type:'button',key:o.key,className:'fb-chip'+(selectedStatuses.includes(o.name)?' is-on':''),'aria-pressed':selectedStatuses.includes(o.name),disabled:busy||!authenticated,onClick:()=>toggleStatus(o.name)},o.name)))
       :h('span',{className:'fb-muted'},!authenticated?t('statusHint'):statusOptions.length?'':t('statusEmpty')),
      !statusOptions.length&&authenticated&&selection.typeKey&&h('button',{type:'button',className:'fb-chip',disabled:busy,onClick:()=>request({action:'statuses',projectKey:selection.projectKey,typeKey:selection.typeKey})},busy?t('statusPending'):t('readStatuses'))),
       h('div',{className:'fb-repo'},field('repo',t('repo')),h('div',{className:'fb-actions'},button(t('pick'),async()=>{try{const path=await ctx.uiWorkspace.pickDirectory();if(path)setSelection(s=>({...s,repo:path}));}catch{setError(t('error'));}})))),
     h('div',{className:'fb-actions'},button(t('sync'),syncNow,true,false,!selection.projectKey||!selection.typeKey||!selection.repo)),
     h('p',{className:'fb-muted'},t('note')),data?.sync&&h('p',{className:'fb-muted'},t('synced').replace('{total}',data.sync.total).replace('{imported}',data.sync.imported)+(data.sync.breakdown?' · '+Object.entries(data.sync.breakdown).map(([k,v])=>k+' '+v).join(' · '):'')+(data.sync.pruned?' · '+t('pruned').replace('{n}',data.sync.pruned):'')+(data.sync.truncated?' · '+t('truncated'):''))),
    h('p',{className:'fb-note fb-muted'},t('notice')),error&&h('div',{className:'fb-error',role:'alert'},error),busy&&h('p',{role:'status',className:'fb-muted'},t('waiting')),
    h('div',{className:'fb-row'},h('div',{className:'fb-actions'},button(t(data?.queue?'pause':'queue'),()=>data?.queue?request({action:'queue',enabled:false}):act({action:'queue',enabled:true},t('qconfirm')),!data?.queue)),button(t('task'),()=>ctx.layout.selectPanel('task-board'))),
    h('div',{className:'fb-toolbar'},
     h('nav',{className:'fb-tabs','aria-label':t('title')},['all','queued','duplicate-review','running','awaiting-verification','verified','failed','skipped','changes-requested','gone'].map(s=>h('button',{type:'button',key:s,disabled:busy,'aria-pressed':filter===s,onClick:()=>setFilter(s)},t(s)))),
     h('div',{className:'fb-sync'},
      syncAt&&h('span',{className:'fb-muted'},t('lastSync'),' ',syncAt.toLocaleTimeString(),data?.sync?' · '+t('syncedCount').replace('{total}',data.sync.total).replace('{imported}',data.sync.imported):''),
      h('button',{type:'button',disabled:busy||!authenticated||!selection.projectKey||!selection.typeKey||!selection.repo,onClick:syncNow},busy?t('syncing'):t('refreshList')))),
    visible.length?visible.map(b=>h('article',{className:'fb-bug',key:b.id},
     h('div',{className:'fb-bugline'},
      h('span',{className:'fb-id'},'#'+b.remoteId),
      h('span',{className:'fb-badge','data-state':b.status},t(b.status)),
      h('h2',{title:b.title},b.title),
      h('div',{className:'fb-bugactions'},
       b.status==='queued'&&h(React.Fragment,null,button(t('start'),()=>{setNoteFor(b.id);setNoteText(b.note||'');}),noteFor===b.id&&h('div',{className:'fb-feedback'},h('textarea',{value:noteText,rows:3,placeholder:t('startNote'),'aria-label':t('startNote'),maxLength:2000,onChange:e=>setNoteText(e.target.value)}),h('p',{className:'fb-hint'},t('startNoteHint')),h('div',{className:'fb-actions'},h('button',{type:'button',className:'fb-accent',disabled:busy,onClick:async()=>{const ok=await request({action:'start',id:b.id,note:noteText.trim()});if(ok){setNoteFor('');setNoteText('');}}},t('startGo')),h('button',{type:'button',disabled:busy,onClick:()=>{setNoteFor('');setNoteText('');}},t('fbCancel'))))),
       b.status==='duplicate-review'&&h(React.Fragment,null,button(t('duplicate'),()=>act({action:'decide',id:b.id,decision:'duplicate'})),button(t('distinct'),()=>act({action:'decide',id:b.id,decision:'distinct'}))),
       b.status==='awaiting-verification'&&h(React.Fragment,null,button(t('checkoutBranch'),()=>act({action:'checkout',id:b.id},t('checkoutBranch')+'?'),false,true,!(b.commit&&!b.dirty),false,t('checkoutHint')),button(t('pass'),()=>act({action:'verify',id:b.id,passed:true})),button(t('reject'),()=>act({action:'verify',id:b.id,passed:false}))),
       b.status==='awaiting-verification'&&h('p',{className:'fb-hint'},t('checkoutHint')),
      b.status==='verified'&&h('p',{className:'fb-hint'},t('backToDevelopHint')),
      b.dirty>0&&['awaiting-verification','changes-requested','failed','verified'].includes(b.status)&&button(t('commitWork'),()=>act({action:'commit',id:b.id},t('commitWork')+'?')),
       b.status==='verified'&&button(t('backToDevelop'),()=>act({action:'checkout',id:b.id,target:'develop'},t('backToDevelop')+'?'),false,true,false,false,t('backToDevelopHint')),
       ['failed','changes-requested'].includes(b.status)&&b.cwd&&button(t('retry'),()=>{setFeedbackFor(b.id);setFeedbackText('');}))),
     b.gone&&h('p',{className:'fb-gone'},h('span',{className:'fb-badge','data-state':'gone'},t('gone')),' ',t('goneNote'),h('button',{type:'button',onClick:()=>act({action:'remove',id:b.id},t('remove')+'?')},t('remove'))),
     h('div',{className:'fb-meta'},
      b.branch&&h('code',null,b.branch),
      b.commit&&h('span',null,t('commit'),' ',h('code',null,String(b.commit).slice(0,8))),
      b.dirty>0&&h('span',{className:'fb-dirty'},t('dirtyShort').replace('{n}',b.dirty)),
      h('code',{className:'fb-path'},b.repo)),
     b.dirty>0&&h('p',{className:'fb-warn'},t('dirtyHint')),
     b.error&&h('p',{className:'fb-error'},b.error),
     b.candidates?.length>0&&h('details',{className:'fb-log'},h('summary',null,t('candidates')),h('ul',null,b.candidates.map(c=>h('li',{key:c.id,className:'fb-muted'},c.id,' · ',c.title)))),
     b.summary&&h('details',{className:'fb-log'},h('summary',null,t('fixLog'),h('span',{className:'fb-muted'},' · '+b.summary.length+' chars')),h('pre',null,b.summary)),
     feedbackFor===b.id&&h('div',{className:'fb-feedback'},h('textarea',{value:feedbackText,rows:3,placeholder:t('feedback'),'aria-label':t('feedback'),onChange:e=>setFeedbackText(e.target.value)}),h('div',{className:'fb-actions'},h('button',{type:'button',className:'fb-accent',disabled:!feedbackText.trim(),onClick:async()=>{const ok=await request({action:'retry',id:b.id,feedback:feedbackText.trim()});if(ok){setFeedbackFor('');setFeedbackText('');}}},t('fbSubmit')),h('button',{type:'button',onClick:()=>{setFeedbackFor('');setFeedbackText('');}},t('fbCancel')))))):
     h('div',{className:'fb-empty'},h(Icon,{size:36}),h('h2',null,t(bugs.length?'emptyfilter':'empty')),!bugs.length&&h('p',{className:'fb-muted'},t('hint'))),
    h('details',{className:'fb-box'},h('summary',null,t('history')),h('ul',null,(data?.audit??[]).slice().reverse().map((a,i)=>h('li',{key:i,className:'fb-muted'},new Date(a.time).toLocaleString(),' · ',a.action,' · ',a.id))))));
  }
  ctx.slots.inject('sidebar.panellist',()=>ctx.slots.register({name:'sidebar.panellist',id:'feishu-bugs',order:66,label:()=>t('title')},Icon));
  ctx.slots.inject('main',()=>ctx.slots.register({name:'main',key:'feishu-bugs'},Panel));
 }};
}});
