window.__ModuleLoader__.load({id:'@local/feishu-bugs',factory(require){
 const React=require('react'),h=React.createElement;
 const dictionaries={
  zh:{completeHint:'将本地任务标记为已完成，并禁用后续操作；不会修改飞书状态。',complete:'标记已完成',completed:'已完成',completedHint:'任务已完成，后续操作已禁用。仅标记本地任务，不修改飞书状态。',completeBusy:'请等待修复或编译结束后再标记完成。',connection:'连接与范围',connectionHint:'配置飞书授权、本地仓库与本轮读取范围。',roundBugs:'本轮缺陷',roundHint:'按状态查看缺陷，在卡片中启动修复和人工验收。',repairTitle:'修复与验收',repairHint:'执行完成后检查修复证据；验证和合并始终由你决定。',bugSearch:'搜索编号、标题或修复记录',bugCount:'当前显示 {visible} / {total} 条',imported:'已读取 · 无需修复',requirement:'所属需求（缺陷）',allRequirements:'全部需求',readRequirements:'读取所属需求',requirementHint:'与状态组合筛选；全部需求表示不限。',requirementEmpty:'当前没有可选需求',requirementSearch:'搜索所属需求',requirementSearchPlaceholder:'输入需求名称或编号',requirementMatches:'匹配 {matched} / {total} 个需求',requirementNoMatch:'未找到匹配需求，请更换关键词或清空搜索。',requirementClear:'清空搜索',requirementSelected:'当前已选',changeRemoteStatus:'修改飞书状态',remoteCurrent:'飞书状态',remoteTarget:'目标飞书状态',remoteChoose:'请选择目标状态',remoteSubmit:'确认修改',remoteRefresh:'刷新可选状态',remoteEmpty:'当前没有可切换的状态',remoteForm:'需在飞书填写表单',remoteUpdated:'飞书状态已更新',remoteConfirm:'将飞书 Bug #{id} 的状态修改为“{name}”？',title:'飞书缺陷工作流',subtitle:'一条缺陷，一个分支；验证和合并，始终由你决定。',refresh:'刷新状态',config:'飞书项目扫码授权',intro:'使用飞书扫描官方 Meegle 授权二维码，并在官方页面确认授权。无需填写访问令牌或 User Key。',generate:'生成授权二维码',checkAuth:'检查授权状态',cancelAuth:'取消授权',openAuth:'打开官方授权页面',qrAlt:'飞书项目官方授权二维码',userCode:'授权确认码',expires:'有效期至',authIdle:'尚未授权',authInitializing:'正在生成二维码',authPending:'等待扫码确认',authAuthenticated:'已授权',authExpired:'授权已过期，请重新扫码',authUnreachable:'授权服务暂时无法连接',authError:'授权失败，请重试',authHint:'授权由官方流程及本机原生钥匙串管理，无需手填令牌。状态由服务端推送；首次扫码后才能验证实际项目字段配置。',readProjects:'读取项目列表',projectPlaceholder:'请选择项目',typePlaceholder:'请选择缺陷类型',readTypes:'读取工作项类型',statuses:'状态',statusHint:'点选要读取的工作流状态，默认 BUG、REOPENED；仅 BUG、REOPEN / REOPENED 进入待修复。',model:'修复模型',modelDefault:'跟随 Agent 默认',modelHint:'只影响之后启动的修复任务；已启动的会话不改变。',readStatuses:'读取可选状态',statusPending:'正在读取状态…',statusEmpty:'先从工作项类型读取可选状态',synced:'已读取 {total} 条缺陷，导入 {imported} 条。',pruned:'已清理 {n} 条筛选外的未开始项。',truncated:'超出单次导入上限，仅导入最近的缺陷。',scope:'选择本轮任务范围',project:'项目',type:'缺陷工作项类型',repo:'代码仓库根目录',pick:'选择目录',sync:'读取分配给我的 Bug',note:'以本地 develop 当前提交为基线，不会自动 fetch、push 或 merge。请先手动更新 develop。',queued:'待修复',running:'修复中',preparing:'准备分支','duplicate-review':'疑似重复 · 待确认',skipped:'已确认重复 · 跳过','awaiting-verification':'待你验证',verified:'验证通过 · 待手动合并','changes-requested':'需继续修改',failed:'执行失败',all:'全部',start:'修复这条',startNote:'补充说明（可选）',startNoteHint:'描述不清或修复思路不确定时写在这里，会随任务交给 agent。',startGo:'开始修复',queue:'依次修复队列',pause:'暂停后续任务',duplicate:'确认重复，跳过',distinct:'不是重复，继续',pass:'验证通过',reject:'验证未通过',retry:'反馈并重试',restart:'重新开始',restartGo:'重新开始',restartHint:'这次执行在创建分支前就失败了；重新开始会用当前 develop 重新准备分支并启动。',fbSubmit:'提交重试',fbCancel:'取消',task:'查看执行任务',empty:'先授权并选择项目与仓库，再读取缺陷',hint:'未读取任何真实缺陷。不会创建分支或启动修复。',candidates:'可能重复的缺陷',history:'最近操作',waiting:'请求处理中…',confirm:'确认执行此操作？',qconfirm:'依次为待修复 Bug 创建独立分支并启动修复？会消耗模型额度；不会自动合并。',feedback:'填写复现现象、验证结果和需要调整的内容',notice:'执行结束只代表进入人工验收，不等于修复正确。重复检测为文本相似候选，仍需你确认。',commit:'提交',commitWork:'提交 worktree 改动',fixLog:'修复日志',dirtyShort:'未提交 {n} 项',dirtyHint:'工作区还有未提交改动，分支拿不到这些修改；请用“反馈并重试”让 agent 先提交。',checkoutBranch:'在主仓检出该分支',backToDevelop:'主仓切回 develop',inRepoTip:'修复分支已经检出在这个仓库里，直接编译运行验收；通过后由你合并 develop。',worktreeTip:'主仓保留你未提交的改动，这次修复在隔离目录里：用 Xcode 打开该目录的 .xcworkspace 编译验收，通过后由你合并 develop。',checkoutHint:'把主仓切到这个修复分支，用主仓现成的 Pods 和 workspace 构建验收；主仓有未提交改动时会拒绝。',build:'编译验证',building:'编译中…',openXcode:'在 Xcode 打开',buildPassed:'编译通过',buildFailed:'编译失败',buildLog:'编译日志',buildApp:'产物',provision:'补齐构建前置',provisionHint:'把 .xcworkspace 复制到 worktree，并在锁文件一致时把 Pods 链接进来；之后用 Xcode 打开 worktree 里的 .xcworkspace 构建，读的才是这个分支的源码。',backToDevelopHint:'验收结束把主仓切回 develop 基线；不合并、不拉取、不删分支。主仓有未提交改动时会拒绝。',checkedOut:'已把主仓切到该分支，构建运行验收后再由你合并。',error:'请求未完成；请刷新确认实际状态后再重试。',source:'来源',emptyfilter:'此状态暂无缺陷',gone:'已离开筛选',goneNote:'飞书里已不在当前筛选范围；保留记录便于回看，确认后可移除。',remove:'移除',refreshList:'刷新列表',syncing:'同步中…',lastSync:'上次同步',syncedCount:'共 {total} 条 · 导入 {imported}',noPicker:'当前环境没有目录选择器，请手动输入仓库绝对路径。',noTaskBoardPanel:'任务看板面板不可用（插件未启用或已被移除）。',passHint:'先提交这次的修复代码，再点验证通过。',sessionMissing:'会话服务不可用：列表仍可查看，但“修复这条”“依次修复队列”“反馈并重试”暂时不可用。请刷新页面或重启 DSH 后重新打开面板。',worktreeFreed:'隔离目录已释放（{size}）：{path}。分支和提交都留在仓库里，验收与合并不受影响。',buildFreed:'构建产物已释放（{size}）：这个缺陷的 DerivedData 已删除，需要时重新编译即可。'},
  en:{completeHint:'Mark this local task complete and disable further operations without changing Feishu.',complete:'Mark complete',completed:'Completed',completedHint:'Task completed. Further operations are disabled. This only updates the local task, not Feishu.',completeBusy:'Wait for the repair or build to finish before marking complete.',connection:'Connection & scope',connectionHint:'Configure Feishu authorization, repository and import scope.',roundBugs:'Current defects',roundHint:'Filter defects, start repairs and review the evidence in each card.',repairTitle:'Repair & verification',repairHint:'Inspect repair evidence after execution. Verification and merging stay with you.',bugSearch:'Search ID, title or repair notes',bugCount:'Showing {visible} / {total}',imported:'Read · No repair needed',requirement:'Requirement (defect)',allRequirements:'All requirements',readRequirements:'Load requirements',requirementHint:'Combined with status filters; all requirements means no restriction.',requirementEmpty:'No requirements available',requirementSearch:'Search requirements',requirementSearchPlaceholder:'Enter a requirement name or ID',requirementMatches:'{matched} / {total} requirements match',requirementNoMatch:'No matching requirements. Try another keyword or clear the search.',requirementClear:'Clear search',requirementSelected:'Currently selected',changeRemoteStatus:'Change Feishu status',remoteCurrent:'Feishu status',remoteTarget:'Target Feishu status',remoteChoose:'Choose a target status',remoteSubmit:'Confirm change',remoteRefresh:'Refresh available states',remoteEmpty:'No state transitions are currently available',remoteForm:'Complete the required form in Feishu',remoteUpdated:'Feishu status updated',remoteConfirm:'Change Feishu bug #{id} to “{name}”?',title:'Feishu Bug Workflow',subtitle:'One bug, one branch. Verification and merging stay in your hands.',refresh:'Refresh',config:'Feishu Project QR authorization',intro:'Scan the official Meegle authorization QR code with Feishu and confirm on the official page. No access token or User Key entry is needed.',generate:'Generate authorization QR',checkAuth:'Check authorization',cancelAuth:'Cancel authorization',openAuth:'Open official authorization page',qrAlt:'Official Feishu Project authorization QR code',userCode:'Confirmation code',expires:'Expires at',authIdle:'Not authorized',authInitializing:'Generating QR code',authPending:'Waiting for scan and confirmation',authAuthenticated:'Authorized',authExpired:'Authorization expired. Scan again.',authUnreachable:'Authorization service is unreachable',authError:'Authorization failed. Please retry.',authHint:'Official authorization uses the native local keychain, with no manual token entry. Status is pushed by the server. The first scan is required to verify your actual project schema.',readProjects:'Read projects',projectPlaceholder:'Choose a project',typePlaceholder:'Choose a defect type',readTypes:'Read work item types',statuses:'Status',statusHint:'Pick the states to read; defaults to BUG and REOPENED. Only BUG, REOPEN / REOPENED enter the repair queue.',model:'Repair model',modelDefault:'Follow the agent default',modelHint:'Applies to repair tasks started afterwards; running sessions are unchanged.',readStatuses:'Load statuses',statusPending:'Loading statuses…',statusEmpty:'Load statuses from the work item type first',synced:'Read {total} open bugs; imported {imported}.',pruned:'Removed {n} untouched items outside the filter.',truncated:'Imported only the most recent bugs above the per-run limit.',scope:'Select this task scope',project:'Project',type:'Defect work item type',repo:'Repository root',pick:'Choose directory',sync:'Read bugs assigned to me',note:'Uses the current local develop commit. No automatic fetch, push or merge. Update develop manually first.',queued:'Queued',running:'Running',preparing:'Preparing branch','duplicate-review':'Possible duplicate · review needed',skipped:'Confirmed duplicate · skipped','awaiting-verification':'Awaiting your verification',verified:'Verified · merge manually','changes-requested':'Changes requested',failed:'Failed',all:'All',start:'Fix this bug',startNote:'Extra instructions (optional)',startNoteHint:'Use this when the report is unclear or the fix approach is open; it is passed to the agent with the task.',startGo:'Start repair',queue:'Run repair queue',pause:'Pause next tasks',duplicate:'Confirm duplicate and skip',distinct:'Not a duplicate; continue',pass:'Verification passed',reject:'Verification failed',retry:'Give feedback and retry',restart:'Restart',restartGo:'Restart now',restartHint:'This run failed before its branch existed; restarting prepares the branch from the current develop and launches again.',fbSubmit:'Send and retry',fbCancel:'Cancel',task:'View execution tasks',empty:'Authorize and select a project and repository first',hint:'No real bugs imported. No branches or repair tasks will be created yet.',candidates:'Potential duplicates',history:'Recent activity',waiting:'Request in progress…',confirm:'Confirm this action?',qconfirm:'Create a separate branch and start repairs for queued bugs? This consumes model quota and never merges automatically.',feedback:'Describe reproduction steps, verification results and required changes',notice:'Execution completion only means human acceptance is required, not that the fix is correct. Text similarity only suggests duplicates; you decide.',commit:'Commit',commitWork:'Commit worktree changes',fixLog:'Fix log',dirtyShort:'{n} uncommitted',dirtyHint:'The worktree still has uncommitted changes, so this branch does not carry them yet; use "Give feedback and retry" to have the agent commit first.',checkoutBranch:'Check out this branch in the main repo',backToDevelop:'Switch main repo back to develop',inRepoTip:'The fix branch is already checked out in this repository; build and run it here, then merge develop yourself.',worktreeTip:'Your uncommitted work stays in the main repository; this fix runs in an isolated worktree. Open the .xcworkspace inside that worktree to build and run it, then merge develop yourself.',checkoutHint:'Switches the main repo to this fix branch so you can build with its existing Pods and workspace; refuses when the main repo has uncommitted changes.',build:'Build to verify',building:'Building…',openXcode:'Open in Xcode',buildPassed:'Build passed',buildFailed:'Build failed',buildLog:'Build log',buildApp:'Product',provision:'Provision build prerequisites',provisionHint:'Copies the .xcworkspace into the worktree and links Pods when the lock files agree, so opening that .xcworkspace in Xcode builds this branch instead of the main repository.',backToDevelopHint:'Switches the main repo back to the develop baseline; never merges, pulls or deletes branches; refuses when the main repo has uncommitted changes.',checkedOut:'The main repository is now on that branch; build and run it, then merge yourself.',error:'Request did not complete. Refresh to confirm the actual state before retrying.',source:'Source',emptyfilter:'No bugs in this status',gone:'Left the filter',goneNote:'No longer in the current Feishu filter; kept for reference until you remove it.',remove:'Remove',refreshList:'Refresh list',syncing:'Syncing…',lastSync:'Last sync',syncedCount:'{total} total · {imported} imported',noPicker:'This environment has no directory picker; type the absolute repository path instead.',noTaskBoardPanel:'The task board panel is unavailable (plugin disabled or removed).',passHint:'Commit the fix first, then verify.',sessionMissing:'The session service is unavailable. Bugs stay readable, but starting, queueing and retrying repairs are disabled. Refresh the page or restart DSH, then reopen this panel.',worktreeFreed:'The isolated worktree was released ({size}): {path}. The branch and its commits stay in the repository, so verification and merging are unaffected.',buildFreed:'Build products released ({size}): the DerivedData for this bug is gone; rebuilding recreates it.'}
 };
 // Disk freed is the point of this hint, so show it in the unit a person reads at a glance.
 function formatBytes(n){const size=Number(n)||0;if(size<1024)return size+' B';if(size<1048576)return Math.round(size/1024)+' KB';if(size<1073741824)return Math.round(size/1048576)+' MB';return (size/1073741824).toFixed(1)+' GB';}
 function Icon({size=20}){return h('svg',{width:size,height:size,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:1.7,'aria-hidden':true},h('path',{d:'M7 4v5m10-5v5M4 12h3m10 0h3M7 18l-3 3m13-3 3 3M9 3l3 2 3-2'}),h('rect',{x:7,y:7,width:10,height:14,rx:5}),h('path',{d:'M12 9v9m-4-5h8'}));}
 function officialAuthUrl(value){
  if(typeof value!=='string')return null;
  try{const url=new URL(value);return url.protocol==='https:'&&!url.username&&!url.password&&(!url.port||url.port==='443')&&(url.hostname==='feishu.cn'||url.hostname.endsWith('.feishu.cn'))?url.href:null;}catch{return null;}
 }
 const css=`
 .fb-panel{container-type:inline-size;height:100%;overflow:auto;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);font:inherit}
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
 .fb-ok{color:var(--dsw-alias-state-success-primary);font-size:12px;overflow-wrap:anywhere} .fb-error{color:var(--dsw-alias-state-error-primary);font-size:12px;overflow-wrap:anywhere}.fb-toolbar{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;margin:10px 0;flex-wrap:wrap}
 .fb-tabs{display:flex;gap:4px;flex-wrap:wrap;margin:0}
 .fb-sync{display:flex;align-items:center;gap:8px;font-size:11px;flex-shrink:0}
 .fb-sync button{font-size:11px!important;padding:4px 9px!important}.fb-tabs button[aria-pressed=true]{border-color:var(--dsw-alias-brand-primary);color:var(--dsw-alias-brand-primary)}
 .fb-bug{border:1px solid var(--dsw-alias-border-l1);border-radius:10px;padding:14px;margin:10px 0;background:var(--dsw-alias-bg-layer-1);min-width:0}
 .fb-bugline{display:grid;grid-template-columns:auto auto minmax(0,1fr);align-items:baseline;gap:8px}.fb-bugline h2{font-size:14px;font-weight:600;line-height:1.6;margin:0;overflow-wrap:anywhere;min-width:0}
 .fb-bugfooter{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;flex-wrap:wrap;border-top:1px solid var(--dsw-alias-border-l1);padding-top:12px;margin-top:12px}
 .fb-bugactions{display:flex;align-items:center;gap:8px;flex-wrap:wrap;min-width:0}.fb-bugactions-main{margin-left:auto;justify-content:flex-end}
 .fb-panel .fb-bugactions button{min-height:36px;padding:7px 12px;font-size:12px;font-weight:600;line-height:1.5;white-space:normal;overflow-wrap:anywhere;border-radius:7px;background:var(--dsw-alias-bg-layer-2);border-color:var(--dsw-alias-border-l1)}
 .fb-panel .fb-bugactions button:hover:not(:disabled){border-color:var(--dsw-alias-brand-primary);background:var(--dsw-alias-bg-base)}
 .fb-panel .fb-bugactions .fb-accent{background:var(--dsw-alias-brand-primary);border-color:var(--dsw-alias-brand-primary);color:var(--dsw-alias-bg-base)}
 .fb-panel .fb-bugactions .fb-accent:hover:not(:disabled){background:var(--dsw-alias-brand-primary);filter:brightness(1.12)}
 .fb-panel .fb-bugactions .fb-danger{color:var(--dsw-alias-state-error-primary);border-color:currentColor}
 .fb-meta{display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-top:6px;font-size:11px;color:var(--dsw-alias-label-secondary);min-width:0}.fb-meta code{font-size:11px;opacity:.9}.fb-path{max-width:min(100%,46ch);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.fb-dirty{color:var(--dsw-alias-state-warn-primary)}.fb-log{margin-top:4px}.fb-log summary{cursor:pointer;font-size:11px;color:var(--dsw-alias-label-secondary)}.fb-warn{color:var(--dsw-alias-state-warn-primary);font-size:11px;margin:4px 0}.fb-id{font:12px ui-monospace,monospace;color:var(--dsw-alias-label-secondary)}
 @container(max-width:640px){.fb-bugline{grid-template-columns:auto minmax(0,1fr)}.fb-bugline h2{grid-column:1/-1}.fb-bugline .fb-badge{justify-self:start}.fb-bugfooter{flex-direction:column;align-items:stretch}.fb-bugactions{width:100%}.fb-bugactions-main{margin-left:0;justify-content:flex-start}.fb-panel .fb-bugactions button{min-height:44px;flex:1 1 auto}.fb-bugactions:empty{display:none}}
 .fb-badge{font-size:10px;padding:2px 6px;border:1px solid var(--dsw-alias-border-l1);border-radius:4px}.fb-badge[data-state=duplicate-review],.fb-badge[data-state=awaiting-verification]{color:var(--dsw-alias-state-warn-primary)}
 .fb-badge[data-state=failed]{color:var(--dsw-alias-state-error-primary)}.fb-badge[data-state=verified],.fb-badge[data-state=completed]{color:var(--dsw-alias-state-success-primary)}
 .fb-feedback{margin-top:10px}.fb-feedback textarea{box-sizing:border-box;width:100%;min-height:82px;padding:10px 12px;border:1px solid var(--dsw-alias-border-l1);border-radius:6px;background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary);font:13px/1.6 inherit;resize:vertical}
 .fb-bug code{overflow-wrap:anywhere}.fb-bug pre{white-space:pre-wrap;overflow-wrap:anywhere;font:11px/1.6 ui-monospace,monospace;background:var(--dsw-alias-bg-layer-2);padding:10px 12px;border-radius:6px;max-height:340px;overflow:auto;margin:6px 0 0}
 .fb-hint{font-size:11px;color:var(--dsw-alias-label-secondary);margin:4px 0 0}
 .fb-gone{display:flex;align-items:center;gap:8px;font-size:11px;color:var(--dsw-alias-label-secondary);margin:6px 0}
 .fb-gone button{font-size:10px!important;padding:2px 7px!important}
 .fb-empty{text-align:center;padding:28px 18px;color:var(--dsw-alias-label-secondary)}.fb-empty h2{font-size:17px}
 /* Reference board: configuration rail and task workspace. */
 .fb-panel{--dsw-alias-brand-primary:#207b70;background:color-mix(in srgb,var(--dsw-alias-bg-base) 94%,#8296bf 6%)}
 .fb-inner{max-width:1680px;padding:24px 24px 48px}
 .fb-head{margin-bottom:22px}.fb-head h1{font-size:24px}.fb-head p{margin:6px 0 0}.fb-kicker{font-size:10px;letter-spacing:.14em}
 .fb-layout{display:grid;grid-template-columns:300px minmax(0,1fr);gap:24px;align-items:start}
 .fb-sidebar,.fb-main{min-width:0}.fb-sidebar{padding:22px;border:1px solid var(--dsw-alias-border-l1);border-radius:14px;background:var(--dsw-alias-bg-layer-1)}
 .fb-section-title{font-size:18px;font-weight:650;letter-spacing:-.02em;margin:0 0 10px}.fb-sidebar>.fb-muted{margin:0 0 22px}
 .fb-sidebar .fb-box{padding:16px 0;margin:0;border:0;border-top:1px solid var(--dsw-alias-border-l1);border-radius:0;background:transparent}
 .fb-sidebar .fb-box>summary{line-height:1.6;flex-wrap:wrap}.fb-sidebar .fb-fields{grid-template-columns:minmax(0,1fr);gap:18px;margin:18px 0}
 .fb-sidebar .fb-status{margin:0}.fb-sidebar .fb-auth-body{flex-direction:column}.fb-sidebar .fb-qr{align-self:center}.fb-sidebar .fb-actions{gap:8px}
 .fb-sidebar .fb-actions button{flex:1 1 auto}.fb-sidebar .fb-field>label{display:grid;gap:8px}.fb-sidebar .fb-muted{overflow-wrap:anywhere}
 .fb-panel button,.fb-panel input,.fb-panel select{min-height:36px;border-radius:8px;line-height:1.5;padding:8px 12px}
 .fb-panel .fb-accent,.fb-panel .fb-bugactions .fb-accent{color:#fff}.fb-chip.is-on{color:#fff!important}
 .fb-statbar{gap:14px;margin:0 0 22px;border:0}.fb-stat,.fb-stat:first-child{border:1px solid var(--dsw-alias-border-l1);border-radius:12px;background:var(--dsw-alias-bg-layer-1);padding:20px}
 .fb-stat:last-child{border:1px solid var(--dsw-alias-border-l1)}.fb-stat strong{font:650 30px/1.2 ui-monospace,monospace;margin-top:12px}
 .fb-surface{background:var(--dsw-alias-bg-layer-1);border:1px solid var(--dsw-alias-border-l1);border-radius:14px;padding:24px;margin-bottom:22px;min-width:0}
 .fb-section-head{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:20px}.fb-section-head .fb-muted{margin:0}
 .fb-search{display:flex;gap:12px;align-items:center;margin:0 0 18px;flex-wrap:wrap}.fb-search input{flex:1 1 240px;min-width:0}.fb-search .fb-muted{font-size:11px}
 .fb-toolbar{margin:0 0 18px;gap:16px}.fb-tabs{gap:6px}.fb-tabs button{min-height:30px;padding:5px 9px;font-size:11px;background:transparent}
 .fb-tabs button[aria-pressed=true]{background:color-mix(in srgb,#207b70 10%,var(--dsw-alias-bg-layer-1));border-color:#207b70}
 .fb-sync{flex-wrap:wrap;white-space:normal}.fb-empty{padding:52px 16px}.fb-empty h2{font-size:15px;line-height:1.7}
 .fb-repair .fb-actions{margin-top:20px}.fb-repair .fb-note{margin:18px 0 0}.fb-history{margin-bottom:0}
 @container(max-width:1050px){.fb-inner{padding:18px 16px 36px}.fb-layout{grid-template-columns:260px minmax(0,1fr);gap:16px}.fb-sidebar{padding:18px}.fb-surface{padding:20px}.fb-statbar{grid-template-columns:repeat(2,minmax(0,1fr))}.fb-stat,.fb-stat:first-child{padding:16px}}
 @container(max-width:760px){.fb-layout{grid-template-columns:minmax(0,1fr)}.fb-sidebar{padding:20px}.fb-statbar{margin-bottom:16px}.fb-head h1{font-size:22px}.fb-surface{margin-bottom:16px}.fb-stat strong{font-size:26px}.fb-inner{padding:16px 12px 32px}.fb-actions button{max-width:100%}}
 `;
 // The task board is optional: the panel must render even when no fix session can be started.
// Only slot + locale are required. The directory picker, layout and task board are resolved
 // lazily so a disabled optional plugin can never keep this panel from registering.
 return {inject:['slots','locale'],apply(ctx){
  for(const [lang,dict]of Object.entries(dictionaries))ctx.effect(()=>ctx.locale.register('feishu-bugs',lang,dict));
  const t=ctx.locale.bind('feishu-bugs');
  function Panel(){
   React.useSyncExternalStore(fn=>ctx.locale.subscribe(fn),()=>ctx.locale.getSnapshot());
   const [data,setData]=React.useState(null),[busy,setBusy]=React.useState(false),[error,setError]=React.useState(''),[filter,setFilter]=React.useState('all');
   const [feedbackFor,setFeedbackFor]=React.useState(''),[feedbackText,setFeedbackText]=React.useState('');
   const [selection,setSelection]=React.useState({projectKey:'',projectName:'',typeKey:'',typeName:'',statuses:'BUG,REOPENED',requirementId:'',requirementName:'',repo:''});
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
   const button=(label,onClick,accent=false,authAction=true,disabled=false,interrupt=false,title)=>h('button',{type:'button',disabled:(busy&&!interrupt)||(!authAction&&!authenticated)||disabled,onClick,className:typeof accent==='string'?accent:accent?'fb-accent':undefined,title},label);
   const taskButton=(b,label,onClick,accent=false,authAction=true,disabled=false,interrupt=false,title)=>button(label,onClick,accent,authAction,disabled||b.status==='completed',interrupt,b.status==='completed'?t('completedHint'):title);
   const field=(key,label)=>h('label',{className:'fb-field',key},label,h('input',{value:selection[key]??'',disabled:busy||!authenticated,onChange:e=>setSelection(s=>({...s,[key]:e.target.value})),autoComplete:'off',spellCheck:false}));
   function selectProject(event){
    if(lock.current)return;setRequirementSearch('');const key=event.target.value,project=projects.find(p=>p.key===key);
    setSelection(s=>({...s,projectKey:key,projectName:project?.name??'',typeKey:'',typeName:'',requirementId:'',requirementName:''}));
    if(key)request({action:'types',projectKey:key});
   }
   async function selectType(event){
    if(lock.current)return;setRequirementSearch('');const key=event.target.value,type=types.find(item=>item.key===key);
    setSelection(s=>({...s,typeKey:type?.key??'',typeName:type?.name??'',requirementId:'',requirementName:''}));
    if(key){if(await request({action:'statuses',projectKey:selection.projectKey,typeKey:key}))await request({action:'requirements',projectKey:selection.projectKey,typeKey:key});}
   }
   const parseStatuses=value=>String(value??'').split(',').map(v=>v.trim()).filter(Boolean);
   const selectedStatuses=parseStatuses(selection.statuses);
   // Prefer the statuses read for the selected type; fall back to whatever the server already knows so the
   // chips never vanish just because the two sides briefly disagree on the type key.
   const statusOptions=(catalog.statusesFor?.typeKey===selection.typeKey?catalog.statuses:null)??catalog.statuses??[];
   function toggleStatus(name){setSelection(s=>{const next=parseStatuses(s.statuses);const at=next.indexOf(name);at<0?next.push(name):next.splice(at,1);return {...s,statuses:next.join(',')};});}
   const requirements=catalog.requirements?.projectKey===selection.projectKey&&catalog.requirements?.typeKey===selection.typeKey?catalog.requirements:null;
   const requirementOptions=requirements?.options??[];
   const [requirementSearch,setRequirementSearch]=React.useState('');
   const requirementQuery=requirementSearch.trim().toLowerCase();
   const matchingRequirements=requirementOptions.filter(o=>!requirementQuery||o.name.toLowerCase().includes(requirementQuery)||String(o.id).includes(requirementQuery.replace(/^#/,'')));
   const syncAt=data?.sync?.at?new Date(data.sync.at):null;
   const models=data?.models??null,currentModel=data?.model??null;
   const modelOptions=(models?.groups??[]).flatMap(group=>(group.models??[]).map(item=>({key:`${group.id}/${item.id}`,provider:group.id,id:item.id,label:item.name,group:group.name,reasoningEffort:item.reasoningEffort??null})));
   const modelValue=currentModel?`${currentModel.provider}/${currentModel.model}`:'';
   const defaultLabel=models?.default?modelOptions.find(o=>o.key===`${models.default.provider}/${models.default.model}`)?.label??`${models.default.provider}/${models.default.model}`:'';
   function changeModel(event){
    const value=event.target.value;
    if(!value)return request({action:'model',model:null});
    const picked=modelOptions.find(o=>o.key===value);
    if(picked)request({action:'model',model:{provider:picked.provider,model:picked.id,reasoningEffort:picked.reasoningEffort}});
   }
   const syncNow=()=>request({action:'sync',selection:{...selection,statuses:selectedStatuses,projectName:projects.find(p=>p.key===selection.projectKey)?.name||selection.projectName,typeName:types.find(i=>i.key===selection.typeKey)?.name||selection.typeName}});
   const [bugQuery,setBugQuery]=React.useState('');
    const query=bugQuery.trim().toLowerCase().replace(/^#/,'');
    const bugs=data?.bugs??[],visible=bugs.filter(b=>(filter==='gone'?!!b.gone:(!b.gone&&(filter==='all'||b.status===filter)))&&(!query||[b.remoteId,b.title,b.summary].some(value=>String(value??'').toLowerCase().includes(query))));
   const [remoteFor,setRemoteFor]=React.useState(''),[remoteTarget,setRemoteTarget]=React.useState('');
    async function openRemoteStatus(b){
     setRemoteFor('');setRemoteTarget('');
     if(await request({action:'remote-statuses',id:b.id})){setRemoteFor(b.id);}
    }
    const remoteEditor=b=>remoteFor===b.id&&h('div',{className:'fb-feedback'},
     b.remoteWorkflow?h(React.Fragment,null,
      h('p',{className:'fb-hint'},t('remoteCurrent')+' · '+b.remoteWorkflow.current.name),
      b.remoteWorkflow.options.length?h('label',{className:'fb-field'},t('remoteTarget'),h('select',{
       value:remoteTarget,'aria-label':t('remoteTarget'),disabled:busy||!authenticated,onChange:e=>setRemoteTarget(e.target.value)},
       h('option',{value:''},t('remoteChoose')),
       b.remoteWorkflow.options.map(o=>h('option',{key:o.id,value:o.id,disabled:o.requiresForm},o.name+(o.requiresForm?' · '+t('remoteForm'):'')))))
       :h('p',{className:'fb-hint'},t('remoteEmpty')),
      button(t('remoteSubmit'),async()=>{
       const picked=b.remoteWorkflow.options.find(o=>o.id===remoteTarget&&!o.requiresForm);if(!picked)return;
       if(!window.confirm(t('remoteConfirm').replace('{id}',b.remoteId).replace('{name}',picked.name)))return;
       if(await request({action:'remote-status',id:b.id,transitionId:picked.id,stateKey:picked.key})){setRemoteFor('');setRemoteTarget('');}
      },true,false,!b.remoteWorkflow.options.some(o=>o.id===remoteTarget&&!o.requiresForm))) :null,
     button(t('remoteRefresh'),()=>openRemoteStatus(b),false,false),
     button(t('fbCancel'),()=>{setRemoteFor('');setRemoteTarget('');}));
    const noteEditor=(b,mode)=>noteFor===b.id&&h('div',{className:'fb-feedback'},
   h('textarea',{value:noteText,rows:3,placeholder:t('startNote'),'aria-label':t('startNote'),maxLength:2000,onChange:e=>setNoteText(e.target.value)}),
   h('p',{className:'fb-hint'},mode==='restart'?t('restartHint'):t('startNoteHint')),
   h('div',{className:'fb-actions'},
    h('button',{type:'button',className:'fb-accent',disabled:busy,onClick:async()=>{
      const ok=mode==='restart'?await request({action:'retry',id:b.id,feedback:noteText.trim()}):await request({action:'start',id:b.id,note:noteText.trim()});
      if(ok){setNoteFor('');setNoteText('');}
     }},t(mode==='restart'?'restartGo':'startGo')),
    h('button',{type:'button',disabled:busy,onClick:()=>{setNoteFor('');setNoteText('');}},t('fbCancel'))));
  return h('section',{className:'fb-panel','aria-label':t('title')},h('style',null,css),h('div',{className:'fb-inner'},
    h('div',{className:'fb-kicker'},'FEISHU / HUMAN-IN-THE-LOOP'),
    h('header',{className:'fb-head'},h('div',null,h('h1',null,t('title')),h('p',{className:'fb-muted'},t('subtitle'))),button(t('refresh'),load)),
    h('div',{className:'fb-layout'},
     h('aside',{className:'fb-sidebar','aria-label':t('connection')},
     h('h2',{className:'fb-section-title'},t('connection')),h('p',{className:'fb-muted'},t('connectionHint')),
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
    h('details',{className:'fb-box',open:true},h('summary',null,t('scope'),' · ',selection.projectName||t('projectPlaceholder')),
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
       :h('span',{className:'fb-muted'},t('statusHint')),
      !statusOptions.length&&selection.typeKey&&h('button',{type:'button',className:'fb-chip',disabled:busy,onClick:()=>request({action:'statuses',projectKey:selection.projectKey,typeKey:selection.typeKey})},busy?t('statusPending'):t('readStatuses'))),
       h('div',{className:'fb-field fb-repo'},
         h('label',null,t('requirementSearch'),h('input',{type:'search',value:requirementSearch,'aria-label':t('requirementSearch'),'aria-describedby':'fb-requirement-results',placeholder:t('requirementSearchPlaceholder'),disabled:busy||!authenticated||!requirements,autoComplete:'off',onChange:e=>setRequirementSearch(e.target.value)})),
         requirementSearch&&button(t('requirementClear'),()=>setRequirementSearch(''),false,false),
         h('span',{id:'fb-requirement-results',className:'fb-muted',role:'status','aria-live':'polite'},requirements?t('requirementMatches').replace('{matched}',matchingRequirements.length).replace('{total}',requirementOptions.length):t('readRequirements')),
         requirements&&requirementQuery&&!matchingRequirements.length&&h('span',{className:'fb-warn'},t('requirementNoMatch')),
         h('label',null,t('requirement'),h('select',{value:selection.requirementId??'','aria-label':t('requirement'),size:requirementQuery?6:undefined,disabled:busy||!authenticated||!selection.typeKey,onChange:e=>{const id=e.target.value;setSelection(s=>({...s,requirementId:id,requirementName:requirementOptions.find(o=>o.id===id)?.name??''}));}},
          h('option',{value:''},t('allRequirements')),
          selection.requirementId&&!matchingRequirements.some(o=>o.id===selection.requirementId)&&h('option',{value:selection.requirementId},t('requirementSelected')+' · '+(selection.requirementName||requirementOptions.find(o=>o.id===selection.requirementId)?.name||'#'+selection.requirementId)),
          matchingRequirements.map(o=>h('option',{key:o.id,value:o.id},o.name+' · #'+o.id)))),
         h('span',{className:'fb-muted'},t('requirementSelected')+'：'+(selection.requirementId?(selection.requirementName||requirementOptions.find(o=>o.id===selection.requirementId)?.name||'#'+selection.requirementId):t('allRequirements'))),
         h('span',{className:'fb-muted'},t('requirementHint')),
         requirements&&!requirementOptions.length&&h('span',{className:'fb-muted'},t('requirementEmpty')),
        button(t('readRequirements'),()=>request({action:'requirements',projectKey:selection.projectKey,typeKey:selection.typeKey}),false,false,!selection.projectKey||!selection.typeKey)),
       h('div',{className:'fb-repo'},field('repo',t('repo')),h('div',{className:'fb-actions'},button(t('pick'),async()=>{try{const ws=ctx.get?.('uiWorkspace');if(!ws?.pickDirectory)throw Error('no picker');const path=await ws.pickDirectory();if(path)setSelection(s=>({...s,repo:path}));}catch{setError(t('noPicker'));}})))),
       models&&h('label',{className:'fb-field fb-repo'},t('model'),h('select',{value:modelValue,disabled:busy||!authenticated,onChange:changeModel},
        h('option',{value:''},defaultLabel?`${t('modelDefault')} · ${defaultLabel}`:t('modelDefault')),
        modelValue&&!modelOptions.some(o=>o.key===modelValue)&&h('option',{value:modelValue},modelValue),
        (models.groups??[]).map(group=>h('optgroup',{key:group.id,label:group.name},(group.models??[]).map(item=>h('option',{key:`${group.id}/${item.id}`,value:`${group.id}/${item.id}`},item.name)))),
        ),h('span',{className:'fb-muted'},t('modelHint'))),
     h('div',{className:'fb-actions'},button(t('sync'),syncNow,true,false,!selection.projectKey||!selection.typeKey||!selection.repo)),
     h('p',{className:'fb-muted'},t('note')),data?.sync&&h('p',{className:'fb-muted'},t('synced').replace('{total}',data.sync.total).replace('{imported}',data.sync.imported)+(data.sync.breakdown?' · '+Object.entries(data.sync.breakdown).map(([k,v])=>k+' '+v).join(' · '):'')+(data.sync.pruned?' · '+t('pruned').replace('{n}',data.sync.pruned):'')+(data.sync.truncated?' · '+t('truncated'):''))),
    ),
     h('div',{className:'fb-main'},
     h('div',{className:'fb-statbar'},['queued','duplicate-review','running','awaiting-verification'].map(s=>h('div',{className:'fb-stat',key:s},h('span',{className:'fb-muted'},t(s)),h('strong',null,data?bugs.filter(b=>!b.gone&&b.status===s).length:'—')))),
     data&&data.sessions===false&&h('div',{className:'fb-error',role:'status'},t('sessionMissing')),error&&h('div',{className:'fb-error',role:'alert'},error),busy&&h('p',{role:'status',className:'fb-muted'},t('waiting')),
    h('section',{className:'fb-surface','aria-label':t('roundBugs')},
     h('div',{className:'fb-section-head'},h('div',null,h('h2',{className:'fb-section-title'},t('roundBugs')),h('p',{className:'fb-muted'},t('roundHint')))),
     h('div',{className:'fb-search'},h('input',{type:'search',value:bugQuery,'aria-label':t('bugSearch'),placeholder:t('bugSearch'),onChange:e=>setBugQuery(e.target.value)}),h('span',{className:'fb-muted',role:'status'},t('bugCount').replace('{visible}',visible.length).replace('{total}',bugs.filter(b=>filter==='gone'?b.gone:!b.gone).length))),
    h('div',{className:'fb-toolbar'},
     h('nav',{className:'fb-tabs','aria-label':t('title')},['all','queued','imported','duplicate-review','running','awaiting-verification','verified','completed','failed','skipped','changes-requested','gone'].map(s=>h('button',{type:'button',key:s,disabled:busy,'aria-pressed':filter===s,onClick:()=>setFilter(s)},t(s)))),
     h('div',{className:'fb-sync'},
      syncAt&&h('span',{className:'fb-muted'},t('lastSync'),' ',syncAt.toLocaleTimeString(),data?.sync?' · '+t('syncedCount').replace('{total}',data.sync.total).replace('{imported}',data.sync.imported):''),
      h('button',{type:'button',disabled:busy||!authenticated||!selection.projectKey||!selection.typeKey||!selection.repo,onClick:syncNow},busy?t('syncing'):t('refreshList')))),
    visible.length?visible.map(b=>h('article',{className:'fb-bug',key:b.id},
     h('div',{className:'fb-bugline'},
      h('span',{className:'fb-id'},'#'+b.remoteId),
      h('span',{className:'fb-badge','data-state':b.status},t(b.status)),
       h('h2',{title:b.title},b.title)),
      b.gone&&h('p',{className:'fb-gone'},h('span',{className:'fb-badge','data-state':'gone'},t('gone')),' ',t('goneNote')),
     h('div',{className:'fb-meta'},
      b.remoteStatus&&h('span',null,t('remoteCurrent')+' · '+b.remoteStatus),
       b.branch&&h('code',null,b.branch),
      b.commit&&h('span',null,t('commit'),' ',h('code',null,String(b.commit).slice(0,8))),
      b.dirty>0&&h('span',{className:'fb-dirty'},t('dirtyShort').replace('{n}',b.dirty)),
      h('code',{className:'fb-path'},b.repo)),
     b.dirty>0&&h('p',{className:'fb-warn'},t('dirtyHint')),
     b.error&&h('p',{className:'fb-error'},b.error),
     b.candidates?.length>0&&h('details',{className:'fb-log'},h('summary',null,t('candidates')),h('ul',null,b.candidates.map(c=>h('li',{key:c.id,className:'fb-muted'},c.id,' · ',c.title)))),
     b.status==='verified'&&b.remoteWorkflow&&h('p',{className:'fb-hint'},t('remoteCurrent')+' · '+b.remoteWorkflow.current.name+(b.remoteWorkflow.updatedAt?' · '+t('remoteUpdated'):'')),
      b.summary&&h('details',{className:'fb-log'},h('summary',null,t('fixLog'),h('span',{className:'fb-muted'},' · '+b.summary.length+' chars')),h('pre',null,b.summary)),
      b.status==='awaiting-verification'&&h('p',{className:'fb-hint'},b.cwd===b.repo?t('inRepoTip'):t('worktreeTip')),
      b.status==='verified'&&h('p',{className:'fb-hint'},b.retired?(b.retired.worktree?t('worktreeFreed').replace('{size}',formatBytes(b.retired.bytes)).replace('{path}',b.retired.worktree):t('buildFreed').replace('{size}',formatBytes(b.retired.bytes))):t('backToDevelopHint')),
      b.build&&b.build.state!=='running'&&h('p',{className:b.build.state==='passed'?'fb-ok':'fb-error'},b.build.state==='passed'?`${t('buildPassed')} · ${Math.round((b.build.ms??0)/1000)}s`:`${t('buildFailed')}${b.build.scheme?' · '+b.build.scheme:''}`),
      b.build?.app&&h('p',{className:'fb-hint'},t('buildApp'),' ',h('code',null,b.build.app)),
      b.build?.log&&h('details',{className:'fb-log'},h('summary',null,t('buildLog')),h('pre',null,b.build.log)),
      h('footer',{className:'fb-bugfooter'},
       h('div',{className:'fb-bugactions'},
        b.cwd&&h(React.Fragment,null,taskButton(b,b.build?.state==='running'?t('building'):t('build'),()=>request({action:'build',id:b.id}),false,true,b.build?.state==='running'),taskButton(b,t('openXcode'),()=>request({action:'open-xcode',id:b.id}))),
        b.cwd&&b.cwd!==b.repo&&!b.provision&&taskButton(b,t('provision'),()=>act({action:'provision',id:b.id},t('provision')+'?'),false,true,false,false,t('provisionHint')),
        b.status==='awaiting-verification'&&b.cwd!==b.repo&&button(t('checkoutBranch'),()=>act({action:'checkout',id:b.id},t('checkoutBranch')+'?'),false,true,!(b.commit&&!b.dirty),false,t('checkoutHint')),
        b.dirty>0&&['awaiting-verification','changes-requested','failed','verified'].includes(b.status)&&button(t('commitWork'),()=>act({action:'commit',id:b.id},t('commitWork')+'?')),
        b.status==='verified'&&button(t('backToDevelop'),()=>act({action:'checkout',id:b.id,target:'develop'},t('backToDevelop')+'?'),false,true,false,false,t('backToDevelopHint')),
        b.gone&&button(t('remove'),()=>act({action:'remove',id:b.id},t('remove')+'?'),'fb-danger')),
       h('div',{className:'fb-bugactions fb-bugactions-main'},
        b.status==='queued'&&button(t('start'),()=>{setNoteFor(b.id);setNoteText(b.note||'');},true),
        button(t(b.status==='completed'?'completed':'complete'),()=>request({action:'complete',id:b.id}),false,true,b.status==='completed'||['running','preparing'].includes(b.status)||b.build?.state==='running',false,['running','preparing'].includes(b.status)||b.build?.state==='running'?t('completeBusy'):t(b.status==='completed'?'completedHint':'completeHint')),
        b.status==='duplicate-review'&&h(React.Fragment,null,button(t('duplicate'),()=>act({action:'decide',id:b.id,decision:'duplicate'})),button(t('distinct'),()=>act({action:'decide',id:b.id,decision:'distinct'}),true)),
        b.status==='awaiting-verification'&&h(React.Fragment,null,button(t('reject'),()=>act({action:'verify',id:b.id,passed:false}),'fb-danger'),button(t('pass'),()=>act({action:'verify',id:b.id,passed:true}),true,true,!b.commit,false,t('passHint'))),
        b.status==='verified'&&button(t('changeRemoteStatus'),()=>openRemoteStatus(b),true,false),
        ['failed','changes-requested'].includes(b.status)&&(b.branch?button(t('retry'),()=>{setFeedbackFor(b.id);setFeedbackText('');},true):button(t('restart'),()=>{setNoteFor(b.id);setNoteText('');},true)))),
      b.status==='completed'&&h('p',{className:'fb-ok',role:'status'},t('completedHint')),
      b.status==='queued'&&noteEditor(b,'start'),
      ['failed','changes-requested'].includes(b.status)&&noteEditor(b,'restart'),
      b.status==='verified'&&remoteEditor(b),
     ['failed','changes-requested'].includes(b.status)&&feedbackFor===b.id&&h('div',{className:'fb-feedback'},h('textarea',{value:feedbackText,rows:3,placeholder:t('feedback'),'aria-label':t('feedback'),onChange:e=>setFeedbackText(e.target.value)}),h('div',{className:'fb-actions'},h('button',{type:'button',className:'fb-accent',disabled:!feedbackText.trim(),onClick:async()=>{const ok=await request({action:'retry',id:b.id,feedback:feedbackText.trim()});if(ok){setFeedbackFor('');setFeedbackText('');}}},t('fbSubmit')),h('button',{type:'button',onClick:()=>{setFeedbackFor('');setFeedbackText('');}},t('fbCancel')))))):
     h('div',{className:'fb-empty'},h(Icon,{size:36}),h('h2',null,t(bugs.length?'emptyfilter':'empty')),!bugs.length&&h('p',{className:'fb-muted'},t('hint'))),
    ),
     h('section',{className:'fb-surface fb-repair','aria-label':t('repairTitle')},
      h('h2',{className:'fb-section-title'},t('repairTitle')),h('p',{className:'fb-muted'},t('repairHint')),
      h('div',{className:'fb-actions'},button(t(data?.queue?'pause':'queue'),()=>data?.queue?request({action:'queue',enabled:false}):act({action:'queue',enabled:true},t('qconfirm')),!data?.queue)),
      h('p',{className:'fb-note fb-muted'},t('notice'))),
     h('details',{className:'fb-box fb-surface fb-history'},h('summary',null,t('history')),h('ul',null,(data?.audit??[]).slice().reverse().map((a,i)=>h('li',{key:i,className:'fb-muted'},new Date(a.time).toLocaleString(),' · ',a.action,' · ',a.id))))))));
  }
  ctx.slots.inject('sidebar.panellist',()=>ctx.slots.register({name:'sidebar.panellist',id:'feishu-bugs',order:66,label:()=>t('title')},Icon));
  ctx.slots.inject('main',()=>ctx.slots.register({name:'main',key:'feishu-bugs'},Panel));
 }};
}});
