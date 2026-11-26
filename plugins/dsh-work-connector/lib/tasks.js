import { randomUUID } from 'node:crypto';
import { realpath, stat } from 'node:fs/promises';
import { isAbsolute, relative, sep } from 'node:path';
import { digest } from './network.js';

export const eventName='dsh.task.updated';
export function text(value,max=16000) { if(typeof value!=='string'||!value.trim()||value.length>max) throw Error('Invalid text argument');return value; }
export const modelIdMaxLength=256;
export class InvalidModelSelection extends Error {
  constructor(){super(`model must be an object with non-blank provider and model IDs (up to ${modelIdMaxLength} characters each)`);}
}
function parseModelSelection(value) {
  if(value===undefined)return undefined;
  if(!value||typeof value!=='object'||Array.isArray(value)||Object.keys(value).some(k=>k!=='provider'&&k!=='model'))throw new InvalidModelSelection();
  const {provider,model}=value;
  try{return {provider:text(provider,modelIdMaxLength),model:text(model,modelIdMaxLength)};}catch{throw new InvalidModelSelection();}
}
export class InvalidReasoningEffort extends Error {
  constructor(){super(`reasoningEffort must be a non-blank DSH effort ID (up to ${modelIdMaxLength} characters)`);}
}
function parseReasoningEffort(value) {
  if(value===undefined)return undefined;
  try{return text(value,modelIdMaxLength);}catch{throw new InvalidReasoningEffort();}
}
export class InvalidAgentPreset extends Error {
  constructor(){super('agentPreset must be a non-blank DSH preset ID');}
}
function parseAgentPreset(value) {
  if(value===undefined)return undefined;
  if(typeof value!=='string'||!value.trim())throw new InvalidAgentPreset();
  return value;
}
const builtInPresetNames=new Map([['standard','Standard'],['cordis','Creator'],['ptc','PTC'],['minimal','Minimal']]);
export function publicTask(t) {return {taskId:t.id,sessionId:t.sessionId,workspaceId:t.workspaceId,...(t.agentPreset?{agentPreset:t.agentPreset}:{}),status:t.status,summary:t.summary||'',...(t.pending?.length?{pendingInput:t.pending}:{})};}
export function change(db,t,status,summary,time=Date.now(),terminal=false) {
  Object.assign(t,{status,summary,terminal});
  const e={id:randomUUID(),taskId:t.id,n:++t.revision,order:db.nextOrder(),name:eventName,timestamp:new Date(time).toISOString(),data:publicTask(t)};
  db.put('event',e);db.put('task',t);
}
export function fold(db,t,e) {
  if(t.terminal || e.seq<=t.cursor)return;
  t.cursor=e.seq;const d=e.data;
  if(e.type==='agent/inbox/spliced'){
    t.inboxes??={'next-turn':[],'next-step':[]};const queue=t.inboxes[d.target];
    if(queue){const removed=queue.splice(d.start,d.removedCount??0,...d.inserted.map(m=>m.source?.rpcId===t.requestId));
      if(removed.includes(true)&&!d.inserted.some(m=>m.source?.rpcId===t.requestId)){
        if(d.outcome==='canceled'){change(db,t,'stopped','待执行指令已被移除。',e.time,true);return;}
        t.leftInbox=true; // Reordering alone is not proof of admission into a specific turn.
      }
    }
  }
  if(e.type==='turn/start'){t.current=d.turn;t.foreign=false;}
  if(e.type==='user/message'){
    if(d.source?.rpcId===t.requestId){t.turn=t.current;t.status='running';}
    else if(['user','retry'].includes(d.source?.kind))t.foreign=true;
  }
  if(t.turn!==undefined && d.turn===t.turn){
    if(e.type==='assistant/message' && !d.interrupted){const body=(d.message?.content||[]).filter(x=>x.type==='text').map(x=>x.text).join('\n');const marker=body.match(/(?:^|\n)DSH_WORK_STATUS=(completed|needs_input|failed)\s*$/);t.latest=body.slice(0,marker?.index??body.length).trim().slice(0,2000);t.report=marker?.[1];}
    if(e.type==='turn/end'){
      const k=d.reason.kind;t.pending=[];
      const status=t.foreign?'review_required':({completed:({completed:'completed',needs_input:'input_required',failed:'failed'})[t.report]||'turn_returned',aborted:'stopped',interrupted:'interrupted',error:'failed',blocked:'blocked','max-tokens':'limited'})[k]||'review_required';
      change(db,t,status,t.foreign?'同一轮含其他人工指令，请到面板核对。':(t.latest||k),e.time,true);return;
    }
  }
}
export class WorkspaceSelectionError extends Error {}
const workspacePathNotFound='No permitted registered workspace matches workspacePath; use its exact directory from workspaces';

async function canonicalWorkspacePath(path) {
  if(typeof path!=='string'||!isAbsolute(path)||path.includes('\0'))
    throw new WorkspaceSelectionError('workspacePath must be an absolute directory on the DSH host');
  try {
    // The registry stores canonical (realpath) directory paths. Do not resolve against the process cwd.
    const canonical=await realpath(path);
    if((await stat(canonical)).isDirectory())return canonical;
  } catch {
    // Do not expose host filesystem paths or errors to the caller.
  }
  throw new WorkspaceSelectionError(workspacePathNotFound);
}

export class Tasks {
  constructor(ctx,db,allowed){this.api=ctx.sessionController;this.registry=ctx.workspaceRegistry;this.agentPresets=ctx.agentPresets;this.llm=ctx.llm;this.sessions=ctx.sessions;this.db=db;this.allowed=allowed;this.locks=new Map();}
  async presets(){
    const rows=await this.agentPresets.list();const defaultId=this.agentPresets.defaultId;
    return rows.filter(row=>row.broken===undefined).map(({id,name})=>({id,name:name?.trim()?name:builtInPresetNames.get(id)??id,isDefault:id===defaultId}));
  }
  own(owner,id){const t=this.db.get('task',text(id,128));if(!t||t.owner!==owner||!this.allowed.includes(t.workspaceId))throw Error('Task unavailable');return t;}
  muteNotifications(owner,id){
    const t=this.own(owner,id);
    // A separate record cannot be overwritten by admission resuming after an await.
    this.db.put('mute',{id:t.id});
    return {taskId:t.id,muted:true};
  }
  workspaces(){
    return [...new Set(this.allowed)].flatMap(workspaceId=>{
      const workspace=this.registry.get(workspaceId);
      return workspace?[{workspaceId,title:workspace.title,workspacePath:workspace.path}]:[];
    });
  }
  async resolveWorkspace(a){
    const byId=Object.hasOwn(a,'workspaceId'),byPath=Object.hasOwn(a,'workspacePath');
    if(byId===byPath)throw new WorkspaceSelectionError('Provide exactly one of workspaceId or workspacePath');
    if(byId)return text(a.workspaceId,256);
    const canonical=await canonicalWorkspacePath(a.workspacePath);
    const workspaces=this.workspaces();
    const matches=workspaces.filter(w=>w.workspacePath===canonical);
    if(matches.length===1)return matches[0].workspaceId;
    if(matches.length>1)throw new WorkspaceSelectionError('workspacePath matches multiple permitted workspaces; use workspaceId');
    const isSubdirectory=workspaces.some(w=>{
      const rel=relative(w.workspacePath,canonical);
      return rel && rel!=='..' && !rel.startsWith('..'+sep) && !isAbsolute(rel);
    });
    if(isSubdirectory)throw new WorkspaceSelectionError('workspacePath is a subdirectory, not a permitted workspace root; use workspaces to find the exact directory');
    throw new WorkspaceSelectionError(workspacePathNotFound);
  }
  async submit(owner,a,parent){
    const workspaceId=parent?.workspaceId??await this.resolveWorkspace(a);
    if(!this.allowed.includes(workspaceId)||!this.registry.get(workspaceId))throw Error('Workspace not permitted');
    const instruction=parent?text(a.instruction):[text(a.goal),`上下文：${a.context===undefined?'无':text(a.context)}`,`验收标准：${text(a.acceptance)}`].join('\n\n');
    const requestedAgentPreset=parent?undefined:parseAgentPreset(a.agentPreset);
    const model=parent?undefined:parseModelSelection(a.model);
    const reasoningEffort=parent?undefined:parseReasoningEffort(a.reasoningEffort);
    if(a.notify!==undefined&&typeof a.notify!=='boolean')throw Error('notify must be boolean');
    const muted=a.notify===false;
    const id=digest(JSON.stringify([owner,text(a.idempotencyKey,128)]));
    const fingerprint=digest(JSON.stringify([workspaceId,parent?.id,instruction,...(model?[model]:[]),...(requestedAgentPreset===undefined?[]:[{agentPreset:requestedAgentPreset}]),...(muted?[{notify:false}]:[]),...(reasoningEffort===undefined?[]:[{reasoningEffort}])]));
    const t=this.db.get('task',id);
    if(t&&t.fingerprint!==fingerprint)throw Error('Idempotency key already used for different input');
    if(this.locks.has(id))return this.locks.get(id);
    if(t && !['creating','submitting'].includes(t.status))return publicTask(t);
    const promise=this.admit(t??{id,fingerprint,owner,workspaceId,sessionId:parent?.sessionId??randomUUID(),requestId:randomUUID(),revision:0,status:parent?'submitting':'creating',cursor:-1,...(model?{model}:{}),...(requestedAgentPreset===undefined?{}:{requestedAgentPreset}),...(reasoningEffort===undefined?{}:{reasoningEffort})},instruction,Boolean(t),muted);
    this.locks.set(id,promise);try{return await promise;}finally{this.locks.delete(id);}
  }
  finishAdmission(t,status,summary){
    delete t.instruction;this.db.transaction(()=>change(this.db,t,status,summary,Date.now(),true));return publicTask(t);
  }
  async applyModel(t){
    const resolveAgent=async()=>{
      const {agent,error}=await this.api.resolveAgent(t.sessionId);
      if(error||!agent)throw Error('Session Agent unavailable');
      return agent;
    };
    const {reasoningEffort}=t;
    let agent,route=t.model??t.resolvedModel;
    if(!route){
      try{
        agent=await resolveAgent();
        const current=agent.model.current();
        if(!current?.provider||!current.model)throw Error('No current session model');
        route=t.resolvedModel={provider:current.provider,model:current.model};
      }catch{return '无法确定目标会话原本使用的模型。请在 DSH 面板配置默认模型，或派发时指定模型；未提交指令。';}
      // Pin the implicit route before applying the selection, so recovery does not re-read a changed default.
      this.db.put('task',t);
    }
    const {provider,model}=route;
    const selection={provider,model,...(reasoningEffort===undefined?{}:{reasoningEffort})};
    const target=`${t.model?'指定模型':'会话默认模型'}（provider: ${JSON.stringify(provider)}，model: ${JSON.stringify(model)}）`;
    try{
      if(t.model&&!(await this.llm.listModels(provider)).some(entry=>entry.id===model))throw Error('Model not advertised');
      await this.llm.resolveCallConfig(selection);
    }catch(e){
      if(reasoningEffort!==undefined&&e?.code==='UNSUPPORTED_REASONING_EFFORT'){
        return `${target}不支持思考强度 ${JSON.stringify(reasoningEffort)}。请核对该模型可用的档位；未提交指令。`;
      }
      return `${target}不可用。请核对 DSH 的模型列表与提供方配置；未提交指令。`;
    }
    try{
      // sessionController.selectModel would also save the profile default in DSH 0.2.2-rc.5.
      agent??=await resolveAgent();
      agent.model.select(selection);
      // The DSH event must survive restart before SQLite records selection as applied.
      if(!await this.sessions.flush(agent.session))throw Error('Session persistence unavailable');
    }catch{return `无法为目标会话设置指定${reasoningEffort===undefined?'模型':'思考强度'}，请在 DSH 面板核对会话；未提交指令。`;}
    t.modelApplied=true;this.db.put('task',t);
  }
  async admit(t,instruction,recovering,muted=false){
    const db=this.db;t.instruction=instruction;
    if(recovering)db.put('task',t);
    else db.transaction(()=>{
      t.createdOrder=db.nextOrder();db.put('task',t);
      if(muted)db.put('mute',{id:t.id});
    });
    const wanted=t.requestedAgentPreset;let actual;
    if(t.status==='creating'&&!recovering){
      try{
        const result=await this.api.create({workspaceId:t.workspaceId,sessionId:t.sessionId,...(wanted===undefined?{}:{agentPreset:wanted})});
        t.sessionId=result.sessionId;actual=result.agentPreset;
      }catch(e){
        if(e?.details?.sessionId)t.sessionId=e.details.sessionId;
        const reason=({'agent-preset/not-found':'不存在','agent-preset/invalid':'不可用','agent-preset/conflict':'无法绑定'})[e?.code];
        return this.finishAdmission(t,'failed',reason&&wanted!==undefined
          ?`指定预设 ${JSON.stringify(wanted)} ${reason}；未提交指令。`
          :'创建或挂接失败，请核对面板；未提交指令。');
      }
    }else{
      // Never create again after an ambiguous placement. A resumed Agent may
      // compose the current default if its saved preset is missing.
      if(t.status==='creating'&&!this.registry.get(t.workspaceId)?.sessionIds.includes(t.sessionId)){
        return this.finishAdmission(t,'review_required','创建中断，请核对面板。不会重新建会话。');
      }
      try{
        const {agent}=await this.api.resolveAgent(t.sessionId);
        if(agent){
          const saved=this.agentPresets.presetForSession(agent.session);
          const bound=this.agentPresets.composedPreset(agent.ctx);
          if(saved===bound)actual=saved;
        }
      }catch{/* An explicit selection must still be confirmed below. */}
    }
    if(typeof actual==='string'&&actual.trim())t.agentPreset=actual;else delete t.agentPreset;
    if(wanted!==undefined&&t.agentPreset!==wanted){
      const reason=t.agentPreset===undefined
        ?`DSH 未确认会话已绑定指定预设 ${JSON.stringify(wanted)}`
        :`DSH 实际预设 ${JSON.stringify(t.agentPreset)} 与指定预设 ${JSON.stringify(wanted)} 不符`;
      const admission=t.promptAttempted?'未重试指令，请到原会话核对先前请求是否入队。':'未提交指令。';
      return this.finishAdmission(t,'failed',`${reason}；${admission}`);
    }
    t.status='submitting';db.put('task',t);
    if((t.model||t.reasoningEffort!==undefined)&&!t.modelApplied){
      const failure=await this.applyModel(t);
      if(failure)return this.finishAdmission(t,'failed',failure);
    }
    // Persist the actual session, confirmed preset, model application and request ID before prompt.
    // Ambiguous admission retries ONLY prompt with the same rpcId.
    if(wanted!==undefined&&!t.promptAttempted){t.promptAttempted=true;db.put('task',t);}
    await this.api.prompt({sessionId:t.sessionId,requestId:t.requestId,mode:'queue',content:[{type:'text',text:instruction+'\n\n请简述本次委托的结果；只有确已满足验收条件时，末行写 DSH_WORK_STATUS=completed；需要补充信息写 DSH_WORK_STATUS=needs_input，明确失败写 DSH_WORK_STATUS=failed。'}]},AbortSignal.timeout(30000));
    delete t.instruction;delete t.promptAttempted;t.status='queued';db.put('task',t);return publicTask(t);
  }
  async refresh(task){
    // The background scan may have captured the row before an MCP retry finished.
    task=this.db.get('task',task.id);
    if(!task||task.terminal||this.locks.has(task.id))return;
    if(['creating','submitting'].includes(task.status) && task.instruction){
      if((task.nextAdmission??0)>Date.now())return;
      const action=this.admit(task,task.instruction,true);this.locks.set(task.id,action);
      try{await action;}catch{task.admissions=(task.admissions??0)+1;task.nextAdmission=Date.now()+Math.min(60000,2000*2**task.admissions);if(task.admissions>=6)this.db.transaction(()=>change(this.db,task,'review_required','无法确认指令受理，请检查原会话。',Date.now(),true));else this.db.put('task',task);}finally{this.locks.delete(task.id);}return;
    }
    const address={kind:'session',sessionId:task.sessionId};const signal=AbortSignal.timeout(15000);
    const state=await this.api.state({sessionId:task.sessionId},signal);
    const pages=[];let beforeSeq;
    while(state.cursor>task.cursor){
      const page=await this.api.events({address,throughSeq:state.cursor,...(beforeSeq===undefined?{}:{beforeSeq}),maxMessages:64},signal);
      const events=page.records.map(r=>r.event);pages.unshift(events);
      const first=events[0]?.seq;if(!page.hasMore||first===undefined||first<=task.cursor+1)break;
      if(beforeSeq!==undefined && first>=beforeSeq)throw Error('Invalid page boundary');beforeSeq=first;
    }
    this.db.transaction(()=>{
      const t=this.db.get('task',task.id);if(t.terminal||this.locks.has(t.id))return;
      for(const page of pages)for(const e of page)fold(this.db,t,e);
      if(!t.terminal && t.turn===undefined && t.leftInbox && !state.running && !state.queue?.some(q=>q.rpcId===t.requestId))change(this.db,t,'review_required','指令离开队列，但无法确认所属轮次。请核对面板。',Date.now(),true);
      if(!t.terminal && t.turn!==undefined && t.turn===t.current){
        const pending=[...state.pendingInput].sort();if(JSON.stringify(pending)!==JSON.stringify(t.pending||[])){
          t.pending=pending;if(pending.length)change(this.db,t,'input_required','请在 DSH 面板处理：'+pending.join(', '));else t.status='running';
        }
      }
      this.db.put('task',t);
    });
  }
}
