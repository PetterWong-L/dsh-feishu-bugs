export function cleanNote(note) {
  if(typeof note!=='string')return '';
  return note.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g,'').trim().slice(0,2000);
}
const normalize = s => String(s).toLowerCase().replace(/[\s\p{P}\p{S}]/gu,'');
export function similarity(a,b) {
  a=normalize(a); b=normalize(b); if(!a||!b)return 0;if(a===b)return 1;
  const grams=s=>new Set(Array.from({length:Math.max(0,s.length-1)},(_,i)=>s.slice(i,i+2)));
  const x=grams(a),y=grams(b);return 2*[...x].filter(g=>y.has(g)).length/(x.size+y.size||1);
}
export class Workflow {
  constructor(state,deps) { this.state=state;this.deps=deps;this.tail=Promise.resolve(); }
  locked(fn) { const p=this.tail.then(fn);this.tail=p.catch(()=>{});return p; }
  bug(id) { const b=this.state.bugs.find(b=>b.id===id);if(!b)throw Error('unknown bug');return b; }
  async record(action,b) { this.state.audit.push({time:new Date().toISOString(),action,id:b.id});this.state.audit=this.state.audit.slice(-1000);await this.deps.save(); }
  sync(items) { return this.locked(async()=>{
    for(const item of items){const old=this.state.bugs.find(b=>b.id===item.id);if(old&&old.repo!==item.repo)throw Error('Bug repository binding differs; finish existing workflow before selecting another repository');}
    for(const item of items) {
      const old=this.state.bugs.find(b=>b.id===item.id);
      if(old) { old.title=item.title;old.description=item.description;continue; }
      const candidates=this.state.bugs.filter(b=>similarity(b.title,item.title)>=0.72).map(b=>({id:b.id,title:b.title,score:similarity(b.title,item.title)}));
      const b={...item,candidates,status:candidates.length?'duplicate-review':'queued'};this.state.bugs.push(b);
    }
    await this.deps.save();return this.state;
  }); }
  decide(id,decision,owner) { return this.locked(async()=>{
    if(!owner)throw Error('owner confirmation required');const b=this.bug(id);
    if(b.status!=='duplicate-review')throw Error('not awaiting duplicate review');
    if(!['duplicate','distinct'].includes(decision))throw Error('invalid decision');
    b.status=decision==='duplicate'?'skipped':'queued';b.duplicateDecision=decision;await this.record(decision,b);return b;
  }); }
  start(id,note) { return this.locked(async()=>{
    if(this.state.bugs.some(b=>['preparing','running'].includes(b.status)))throw Error('One bug is already running');
    const b=this.bug(id);if(b.status!=='queued')throw Error('bug not queued: duplicate review or existing execution');
    b.note=cleanNote(note);
    b.status='preparing';await this.record('start',b);
    try { Object.assign(b,await this.deps.prepare(b));await this.deps.save();Object.assign(b,await this.deps.launch(b));b.status='running';await this.record('launched',b); }
    catch(e) { b.status='failed';b.error=String(e.message);await this.record('failed',b);throw e; }
    return b;
  }); }
  retry(id,feedback,launch) { return this.locked(async()=>{
    if(this.state.bugs.some(b=>['preparing','running'].includes(b.status)))throw Error('One bug is already running');
    const b=this.bug(id);if(!['changes-requested','failed'].includes(b.status))throw Error('Retry requires a failed or rejected result');
    const note=typeof feedback==='string'?feedback.trim().slice(0,4000):'';
    // A run that died before the branch existed (dirty repository, missing develop, killed process)
    // has nothing to continue in, so retrying rebuilds the branch from the current develop.
    const restart=!b.cwd||!b.branch;
    if(!restart&&!note)throw Error('Verification feedback required');
    b.status='preparing';b.error=undefined;await this.record('retry-start',b);
    try{
     if(restart){Object.assign(b,await this.deps.prepare(b));await this.deps.save();}
     Object.assign(b,await launch(b,note,restart?'restart':undefined));b.status='running';await this.record('retry-launched',b);
    }catch(e){b.status='failed';b.error=String(e.message);await this.record('retry-failed',b);throw e;}
    return b;
  }); }
  outcome(taskId,result,summary) { return this.locked(async()=>{
    const b=this.state.bugs.find(b=>b.taskId===taskId&&b.status==='running');if(!b)return;
    b.status=result==='succeeded'?'awaiting-verification':'failed';b.summary=summary;
    if(result!=='succeeded')b.error=String(summary||'').slice(0,400)||'The execution failed without a summary; open the execution task for details.';
    if(this.deps.inspect){try{Object.assign(b,await this.deps.inspect(b));}catch{}}
    await this.record(result,b);return b;
  }); }
  verify(id,passed,owner) { return this.locked(async()=>{
    if(!owner)throw Error('owner confirmation required');const b=this.bug(id);if(b.status!=='awaiting-verification')throw Error('not awaiting verification');
    b.status=passed?'verified':'changes-requested';await this.record(passed?'verified':'changes-requested',b);
    if(passed&&this.deps.afterClose)await this.deps.afterClose(b);
    return b;
  }); }
}
export function pruneUnstarted(bugs,keepIds) {
  const keep=new Set(keepIds);
  return bugs.filter(b=>keep.has(b.id)||!['queued','duplicate-review'].includes(b.status)||b.cwd||b.taskId);
}
// Items that survived pruning but left the current Feishu filter keep their work,
// yet are flagged so the list can hide them until the user removes them.
export function markGone(bugs,keepIds,now=()=>new Date().toISOString()) {
  const keep=new Set(keepIds);
  for(const b of bugs) {
    if(keep.has(b.id)) delete b.gone;
    else if(!b.gone) b.gone=now();
  }
  return bugs;
}
