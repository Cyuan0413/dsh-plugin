import { randomUUID } from 'node:crypto';
import { digest } from './network.js';

export const eventName='dsh.task.updated';
export function text(value,max=16000) { if(typeof value!=='string'||!value.trim()||value.length>max) throw Error('Invalid text argument');return value; }
export function publicTask(t) {return {taskId:t.id,sessionId:t.sessionId,workspaceId:t.workspaceId,status:t.status,summary:t.summary||'',...(t.pending?.length?{pendingInput:t.pending}:{})};}
export function change(db,t,status,summary,time=Date.now(),terminal=false) {
  Object.assign(t,{status,summary,terminal});
  const e={id:randomUUID(),taskId:t.id,n:++t.revision,name:eventName,timestamp:new Date(time).toISOString(),data:publicTask(t)};
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
export class Tasks {
  constructor(ctx,db,allowed){this.api=ctx.sessionController;this.registry=ctx.workspaceRegistry;this.db=db;this.allowed=allowed;this.locks=new Map();}
  own(owner,id){const t=this.db.get('task',text(id,128));if(!t||t.owner!==owner||!this.allowed.includes(t.workspaceId))throw Error('Task unavailable');return t;}
  async submit(owner,a,parent){
    const workspaceId=parent?.workspaceId??text(a.workspaceId,256);
    if(!this.allowed.includes(workspaceId)||!this.registry.get(workspaceId))throw Error('Workspace not permitted');
    const instruction=parent?text(a.instruction):[text(a.goal),`上下文：${a.context===undefined?'无':text(a.context)}`,`验收标准：${text(a.acceptance)}`].join('\n\n');
    const id=digest(JSON.stringify([owner,text(a.idempotencyKey,128)]));const fingerprint=digest(JSON.stringify([workspaceId,parent?.id,instruction]));
    let t=this.db.get('task',id);
    if(t&&t.fingerprint!==fingerprint)throw Error('Idempotency key already used for different input');
    if(this.locks.has(id))return this.locks.get(id);
    if(t && !['creating','submitting'].includes(t.status))return publicTask(t);
    const promise=this.admit(t??{id,fingerprint,owner,workspaceId,sessionId:parent?.sessionId??randomUUID(),requestId:randomUUID(),revision:0,status:parent?'submitting':'creating',cursor:-1},instruction);
    this.locks.set(id,promise);try{return await promise;}finally{this.locks.delete(id);}
  }
  async admit(t,instruction){
    const db=this.db;t.instruction=instruction;db.put('task',t);
    if(t.status==='creating'){
      try{const result=await this.api.create({workspaceId:t.workspaceId,sessionId:t.sessionId});t.sessionId=result.sessionId;}
      catch(e){if(e.details?.sessionId)t.sessionId=e.details.sessionId;db.transaction(()=>change(db,t,'failed','创建或挂接失败，请核对面板。',Date.now(),true));return publicTask(t);}
      t.status='submitting';db.put('task',t);
    }
    // Persist the actual session and request id before prompt. Ambiguous network
    // failures retry ONLY prompt with the same rpcId, never session.create.
    await this.api.prompt({sessionId:t.sessionId,requestId:t.requestId,mode:'queue',content:[{type:'text',text:instruction+'\n\n请简述本次委托的结果；只有确已满足验收条件时，末行写 DSH_WORK_STATUS=completed；需要补充信息写 DSH_WORK_STATUS=needs_input，明确失败写 DSH_WORK_STATUS=failed。'}]},AbortSignal.timeout(30000));
    delete t.instruction;t.status='queued';db.put('task',t);return publicTask(t);
  }
  async refresh(task){
    if(task.terminal||this.locks.has(task.id))return;
    if(task.status==='creating'){
      // After a process crash, NEVER create again on ambiguous placement.
      if(!this.registry.get(task.workspaceId)?.sessionIds.includes(task.sessionId)){this.db.transaction(()=>change(this.db,task,'review_required','创建中断，请核对面板。不会重新建会话。',Date.now(),true));return;}
      task.status='submitting';this.db.put('task',task);
    }
    if(task.status==='submitting' && task.instruction){
      if((task.nextAdmission??0)>Date.now())return;
      const action=this.admit(task,task.instruction);this.locks.set(task.id,action);
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
