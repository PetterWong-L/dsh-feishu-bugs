// Repair sessions are started straight through the Host Session domain, so the panel depends on
// no optional plugin: one session per bug in the repository directory, one prompt, and the turn
// outcome read back from the session log.
export const SESSION_MISSING='The session service is unavailable, so no fix session can be started. Reload the page or restart DSH, then reopen this panel.';
const textOf=message=>(message?.content??[]).filter(b=>b?.type==='text').map(b=>b.text).join('\n').trim();
export class SessionRunner {
  constructor(get) { this.get=get; }
  ctrl() {
    let c=null;
    try { c=this.get('sessionController'); } catch { c=null; }
    if (!c?.create||!c?.prompt) throw Error(SESSION_MISSING);
    return c;
  }
  available() {
    try { this.ctrl(); return true; } catch { return false; }
  }
  // Create the session, name it so the sidebar is readable, apply the chosen model and hand over
  // the repair prompt. Only the session id is persisted; nothing else about it is our state.
  async launch({cwd,workspaceId,title,prompt,model,requestId}) {
    const c=this.ctrl();
    // A registered workspace is the most reliable target; a bare cwd lets the Host adopt the
    // directory on its own, which keeps isolated worktrees free of sidebar entries.
    const created=await c.create(workspaceId?{workspaceId}:{cwd});
    const sessionId=created?.sessionId;
    if (!sessionId) throw Error('The session service did not return a session id');
    if (title&&typeof c.rename==='function') { try { await c.rename({sessionId,title}); } catch {} }
    if (model?.provider&&model?.model&&typeof c.selectModel==='function') {
      try {
        await c.selectModel({sessionId,provider:model.provider,model:model.model,...(model.reasoningEffort?{reasoningEffort:model.reasoningEffort}:{})});
      } catch {}
    }
    await c.prompt({requestId:requestId??`feishu-${sessionId}`,sessionId,mode:'queue',content:[{type:'text',text:prompt}]});
    return {sessionId};
  }
  // One cheap read answers "is anything still running" for every row, so polling never needs a
  // per-row session read. Returns null when the listing is unavailable, and callers fall back.
  async liveIds() {
    const c=this.ctrl();
    if (typeof c.list!=='function') return null;
    try {
      const rows=await c.list({});
      const items=rows?.items??rows??[];
      if (!Array.isArray(items)) return null;
      return new Set(items.filter(x=>x?.running).map(x=>x.sessionId));
    } catch { return null; }
  }
  // A turn is still running while the newest turn/start is not followed by a turn/end. Once it is,
  // the end reason decides the outcome and the last assistant text becomes the card summary.
  async state(sessionId) {
    const c=this.ctrl();
    let info;
    try { info=await c.inspect(sessionId); }
    catch (e) { return {running:false,missing:true,ok:false,summary:`This fix session could not be read (${e?.message??e}); check the session list before verifying.`}; }
    const events=info?.events??[];
    let lastStart=-1,lastEnd=null;
    for (const e of events) {
      if (e.type==='turn/start'&&e.seq>lastStart) lastStart=e.seq;
      if (e.type==='turn/end'&&(!lastEnd||e.seq>lastEnd.seq)) lastEnd=e;
    }
    if (!lastEnd||lastStart>lastEnd.seq) return {running:true};
    const reason=lastEnd.data?.reason??{kind:'completed'};
    const ok=reason.kind==='completed';
    let summary='';
    for (let i=events.length-1;i>=0;i--) {
      if (events[i].type!=='assistant/message') continue;
      summary=textOf(events[i].data?.message);
      if (summary) break;
    }
    if (!summary) summary=ok
      ? 'The session finished without writing a summary; read the branch diff before verifying.'
      : `The session ended with ${reason.kind}${reason.reason?.kind?` (${reason.reason.kind})`:''}.`;
    return {running:false,ok,summary};
  }
}
