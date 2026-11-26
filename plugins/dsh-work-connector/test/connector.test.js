import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdirSync,mkdtempSync,realpathSync,rmSync,symlinkSync,writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {Store} from '../lib/store.js';
import {Tasks} from '../lib/tasks.js';
import {Events} from '../lib/events.js';
import {endpoint} from '../lib/mcp.js';
import {digest} from '../lib/network.js';
import {once} from 'node:events';
const fresh=()=>mkdtempSync(join(tmpdir(),'work-state-'));
const dispatchArgs={goal:'test',acceptance:'done',idempotencyKey:'one'};
const args={workspaceId:'w',...dispatchArgs};
const defaultModel={provider:'default',model:'default/model'};
const selectedModel={provider:'alternate',model:'shared/model'};
const host=(records=new Map([['w',{title:'Workspace',path:process.cwd()}]]))=>{
  const history=new Map(),prompts=[],selections=[],runningModels=[],runningPresets=[],agents=new Map(),creates=[],steps=[];let made=0;
  const rows=[{id:'standard'},{id:'cordis'},{id:'ptc'},{id:'minimal'},{id:'custom',name:'My custom preset'},{id:'broken',broken:'private diagnostic'}];
  const agentPresets={defaultId:'standard',async list(){return rows;},
    presetForSession(session){steps.push('read saved preset');return session.savedPreset;},
    composedPreset(ctx){return ctx.boundPreset;}};
  return {history,prompts,selections,runningModels,runningPresets,agents,creates,steps,rows,agentPresets,get made(){return made;},
    workspaceRegistry:{get(id){steps.push('workspace');const workspace=records.get(id);return workspace&&{...workspace,sessionIds:[...history.keys()]};}},
    llm:{async listModels(provider){steps.push('list models');return provider==='alternate'?[{id:'shared/model'},{id:'unavailable'}]:[];},
      async resolveCallConfig(selection){
        if(selection.model==='unavailable')throw Error('provider configuration failed');
        const supported=selection.provider==='alternate'?['balanced','deep']:['balanced'];
        if(selection.reasoningEffort!==undefined&&!supported.includes(selection.reasoningEffort))throw Object.assign(Error('private diagnostic'),{code:'UNSUPPORTED_REASONING_EFFORT'});
        return selection;
      }},
    sessions:{async flush(session){steps.push('flush');session.durableModel=session.currentModel;return true;}},
    sessionController:{
      async create(request){
        creates.push(request);steps.push('create');
        const {sessionId,agentPreset=agentPresets.defaultId}=request;
        const preset=rows.find(row=>row.id===agentPreset);
        if(!preset||preset.broken)throw Object.assign(Error('private diagnostic'),{code:preset?'agent-preset/invalid':'agent-preset/not-found'});
        made++;history.set(sessionId,[]);
        const session={currentModel:defaultModel,durableModel:defaultModel,savedPreset:agentPreset};
        agents.set(sessionId,{ctx:{boundPreset:agentPreset},session,model:{current:()=>session.currentModel,select(model){steps.push('select model');session.currentModel=model;selections.push({sessionId,model});}}});
        return {sessionId,get agentPreset(){steps.push('confirm create');return agentPreset;}};
      },
      async resolveAgent(sessionId){return {agent:agents.get(sessionId)};},
      async prompt(r){
        steps.push('prompt');const {session,ctx}=agents.get(r.sessionId);
        assert.deepEqual(session.durableModel,session.currentModel);
        runningModels.push(session.currentModel);runningPresets.push(ctx.boundPreset);prompts.push(r);return {accepted:true};
      },
      async state({sessionId}){return {cursor:history.get(sessionId).length-1,pendingInput:[],queue:[],active:true,running:false};},
      async events({address,throughSeq,beforeSeq}){const log=history.get(address.sessionId).slice(0,beforeSeq??throughSeq+1);return {records:log.slice(-2).map(event=>({type:'event',event})),hasMore:log.length>2};},
    },
  };
};
const personal='tunnel:personal';
async function client(t,tasks,events){
  const server=endpoint({hop:'local-secret',owner:personal,tasks,events});
  server.listen(0,'127.0.0.1');await once(server,'listening');t.after(()=>server.close());
  const url=`http://127.0.0.1:${server.address().port}/mcp`;
  const headers={'X-DSH-Tunnel':'local-secret'};
  const rpc=(method,params,hdr=headers)=>fetch(url,{method:'POST',headers:hdr,body:JSON.stringify({jsonrpc:'2.0',id:1,method,params})});
  const post=(name,args={},hdr=headers)=>rpc('tools/call',{name,arguments:args},hdr);
  const rawCall=async(name,args)=>(await post(name,args)).json();
  const call=async(name,args)=>{const {result,error}=await rawCall(name,args);assert.equal(error,undefined);return JSON.parse(result.content[0].text);};
  return {headers,rpc,post,rawCall,call};
}

function workspaceFixture(t,records,allowed){
  const dir=realpathSync(fresh());
  const db=new Store(join(dir,'state'));
  t.after(()=>{db.close();rmSync(dir,{recursive:true,force:true});});
  const h=host(records);
  return {dir,db,h,tasks:new Tasks(h,db,allowed)};
}
function append(log,type,data){log.push({seq:log.length,type,data,time:Date.now()});}
const webhook=(filter={},url='https://cb.example/connection')=>({
  name:'dsh.task.updated',arguments:filter,delivery:{mode:'webhook',url,secret:'whsec_'+Buffer.alloc(32,7).toString('base64')},
});
const verified=data=>({status:200,text:JSON.stringify({challenge:data.challenge})});
async function complete(tasks,h,task,owner=personal){
  const log=h.history.get(task.sessionId),row=tasks.own(owner,task.taskId);
  const turn=1+log.filter(e=>e.type==='turn/start').length;
  append(log,'turn/start',{turn});
  append(log,'user/message',{source:{kind:'user',rpcId:row.requestId}});
  append(log,'assistant/message',{turn,message:{content:[{type:'text',text:'result\nDSH_WORK_STATUS=completed'}]}});
  append(log,'turn/end',{turn,reason:{kind:'completed'}});
  await tasks.refresh(row);
}

test('连接级订阅验证后覆盖新派发和续办，跨任务游标在重启、重试及刷新后保持',async t=>{
  const dir=fresh(),h=host();let db=new Store(dir),tasks=new Tasks(h,db,['w']);t.after(()=>db.close());
  const deliveries=[];let deny=true,verifyOK=false;
  const send=async(s,id,data)=>{
    if(data.type==='verification')return verifyOK?verified(data):{status:200,text:'{"challenge":"wrong"}'};
    deliveries.push({subscription:s.id,id,data});return {status:deny?503:204};
  };
  let events=new Events(db,tasks,send,personal);
  const {rpc,call,rawCall}=await client(t,tasks,events);
  const rpcResult=async(method,params)=>(await rpc(method,params)).json();
  const {result:catalog}=await rpcResult('events/list');
  assert.deepEqual(catalog.events[0].inputSchema.required,[]);
  for(const invalid of [null,[],{taskId:null},{workspaceId:'w'}]){
    assert.equal((await rpcResult('events/subscribe',{...webhook(),arguments:invalid})).error.code,-32602);
  }
  const oldDone=await call('dispatch',{...args,idempotencyKey:'old-done'});
  const oldQueued=await call('dispatch',{...args,idempotencyKey:'old-queued'});
  await complete(tasks,h,oldDone);
  assert.equal((await rpcResult('events/subscribe',webhook())).error.code,-32015);
  assert.equal(db.all('sub').length,0);
  verifyOK=true;
  const {result:sub}=await rpcResult('events/subscribe',webhook());
  await complete(tasks,h,oldQueued);
  const first=await call('dispatch',args);
  assert.deepEqual(await call('dispatch',{...args,notify:true}),first);
  assert.ok((await rawCall('dispatch',{...args,notify:false})).error);
  await complete(tasks,h,first);
  const next=await call('continue_task',{taskId:first.taskId,instruction:'follow-up',idempotencyKey:'next'});
  assert.equal(next.sessionId,first.sessionId);assert.notEqual(next.taskId,first.taskId);
  await complete(tasks,h,next);
  assert.deepEqual(events.deliveryHealth(),{pending:1,retrying:0,halted:0});
  await events.drain();
  assert.equal(deliveries.length,1);assert.equal(deliveries[0].data.data.taskId,first.taskId);
  assert.deepEqual(events.deliveryHealth(),{pending:1,retrying:1,halted:0});
  db.close();db=new Store(dir);tasks=new Tasks(h,db,['w']);events=new Events(db,tasks,send,personal);
  await events.drain();assert.equal(deliveries.length,1);
  const {result:renewed}=await (await (await client(t,tasks,events)).rpc('events/subscribe',{...webhook(),cursor:sub.cursor})).json();
  assert.equal(renewed.id,sub.id);
  deny=false;
  await events.drain();await events.drain();await events.drain();
  assert.equal(deliveries.length,3);assert.deepEqual(deliveries[0],deliveries[1]);
  assert.ok(Number(deliveries[2].data.cursor)>Number(deliveries[1].data.cursor));
  assert.deepEqual(deliveries.slice(1).map(e=>[e.subscription,e.data.data.taskId,e.data.data.status,e.data.data.summary]),[
    [sub.id,first.taskId,'completed','result'],[sub.id,next.taskId,'completed','result'],
  ]);
  assert.deepEqual(events.deliveryHealth(),{pending:0,retrying:0,halted:0});
});

test('默认通知受 Tunnel、授权工作区、单任务静音和整条订阅取消约束',async t=>{
  const rows=new Map(['w','removed','added'].map(id=>[id,{title:id,path:process.cwd()}]));
  const {db,h,tasks}=workspaceFixture(t,rows,['w','removed']);
  const deliveries=[];
  const events=new Events(db,tasks,async(s,id,data)=>{
    if(data.type==='verification')return verified(data);
    deliveries.push({url:s.url,taskId:data.data.taskId});return {status:204};
  },personal);
  const {rpc,call,rawCall}=await client(t,tasks,events);
  const eventRpc=async(method,p)=>(await rpc(method,p)).json();
  const existing=await call('dispatch',{...args,idempotencyKey:'existing'});
  const legacy=webhook({taskId:existing.taskId},'https://cb.example/legacy');
  await eventRpc('events/subscribe',legacy);
  await eventRpc('events/subscribe',webhook());
  await complete(tasks,h,existing);
  const removed=await call('dispatch',{...args,workspaceId:'removed',idempotencyKey:'removed'});
  await complete(tasks,h,removed);
  tasks.allowed=['w','added'];
  const added=await call('dispatch',{...args,workspaceId:'added',idempotencyKey:'added'});
  await complete(tasks,h,added);
  const foreign=await tasks.submit('tunnel:other',{...args,idempotencyKey:'foreign'});
  await complete(tasks,h,foreign,'tunnel:other');
  assert.equal((await eventRpc('events/subscribe',webhook({taskId:foreign.taskId}))).error.code,-32602);
  assert.ok((await rawCall('mute_task_notifications',{taskId:foreign.taskId})).error);
  assert.ok((await rawCall('dispatch',{...args,notify:'false'})).error);
  const optedOut=await call('dispatch',{...args,idempotencyKey:'no-notify',notify:false});
  await complete(tasks,h,optedOut);
  const muted=await call('dispatch',{...args,idempotencyKey:'mute-later'});
  await complete(tasks,h,muted);
  await call('mute_task_notifications',{taskId:muted.taskId});
  assert.deepEqual(await call('mute_task_notifications',{taskId:muted.taskId}),{taskId:muted.taskId,muted:true});
  assert.equal((await call('status',{taskId:muted.taskId})).status,'completed');
  const followUp=await call('continue_task',{taskId:muted.taskId,instruction:'follow-up',idempotencyKey:'follow-up'});
  await complete(tasks,h,followUp);
  await events.drain();await events.drain();
  assert.deepEqual(deliveries,[
    {url:legacy.delivery.url,taskId:existing.taskId},{url:webhook().delivery.url,taskId:followUp.taskId},
  ]);
  const pending=await call('dispatch',{...args,idempotencyKey:'pending'});
  await complete(tasks,h,pending);
  assert.deepEqual((await eventRpc('events/unsubscribe',webhook())).result,{});
  await events.drain();
  assert.equal(deliveries.length,2);
  assert.equal(db.all('sub').length,1);
  await eventRpc('events/subscribe',webhook());
  await events.drain();
  assert.equal(deliveries.length,2);
});

test('取消连接级订阅不会被尚未返回的回调验证重新启用',async t=>{
  const {db,tasks}=workspaceFixture(t,new Map([['w',{title:'w',path:process.cwd()}]]),['w']);
  const entered=Promise.withResolvers(),resume=Promise.withResolvers();
  let hold=false;
  const events=new Events(db,tasks,async(s,id,data)=>{
    if(hold){entered.resolve();await resume.promise;}
    return verified(data);
  },personal);
  await events.subscription(personal,webhook());
  hold=true;
  const refreshing=events.subscription(personal,webhook());
  const rejected=assert.rejects(refreshing,/changed while verifying/);
  await entered.promise;
  await events.subscription(personal,webhook(),true);
  resume.resolve();
  await rejected;
  assert.deepEqual(db.all('sub'),[]);
});

test('并发重试只创建一次，快任务先于订阅、重启后重发同一事件，手工续办不重复回报',async()=>{
  const dir=fresh(),h=host();let db=new Store(dir),tasks=new Tasks(h,db,['w']);
  const [task,retry]=await Promise.all([tasks.submit('u',args),tasks.submit('u',args)]);assert.deepEqual(task,retry);assert.equal(h.made,1);assert.equal(h.prompts.length,1);
  assert.throws(()=>tasks.own('other',task.taskId));await assert.rejects(tasks.submit('u',{...args,goal:'different'}));await assert.rejects(tasks.submit('u',{...args,workspaceId:'unknown'}));
  const log=h.history.get(task.sessionId);append(log,'turn/start',{turn:1});append(log,'user/message',{source:{kind:'user',rpcId:h.prompts[0].requestId}});append(log,'assistant/message',{turn:1,message:{content:[{type:'text',text:'result\nDSH_WORK_STATUS=completed'}]}});append(log,'turn/end',{turn:1,reason:{kind:'completed'}});
  await tasks.refresh(tasks.own('u',task.taskId));assert.equal(tasks.own('u',task.taskId).status,'completed');
  const attempts=[];let deny=true;const send=async(s,id,data)=>{if(data.type==='verification')return {status:200,text:JSON.stringify({challenge:data.challenge})};attempts.push({id,data});return {status:deny?503:204,text:''};};
  const events=()=>new Events(db,tasks,send,'u');const p={name:'dsh.task.updated',arguments:{taskId:task.taskId},delivery:{mode:'webhook',url:'https://cb.example/job',secret:'whsec_'+Buffer.alloc(32,7).toString('base64')}};
  const rejected=new Events(db,tasks,async()=>({status:200,text:'{"challenge":"wrong"}'}),'u');
  await assert.rejects(rejected.subscription('u',p),{rpcCode:-32015});assert.equal(db.all('sub').length,0);
  const sub=await events().subscription('u',p);await events().drain();db.close();db=new Store(dir);tasks=new Tasks(h,db,['w']);const s=db.get('sub',sub.id);s.next=0;db.put('sub',s);deny=false;await events().drain();await events().drain();assert.equal(attempts.length,2);assert.deepEqual(attempts[0],attempts[1]);assert.equal(attempts[1].data.data.summary,'result');assert.equal(attempts[1].data.data.agentPreset,'standard');
  append(log,'turn/end',{turn:2,reason:{kind:'completed'}});await tasks.refresh(tasks.own('u',task.taskId));assert.equal(db.all('event').length,1);
  const next=await tasks.submit('u',{instruction:'continue',idempotencyKey:'two'},tasks.own('u',task.taskId));assert.equal(next.sessionId,task.sessionId);assert.notEqual(next.taskId,task.taskId);assert.equal(h.made,1);await events().subscription('u',p,true);assert.equal(db.all('sub').length,0);db.close();
});
test('交叉人工输入不会报告独占成功，审批不会误报完成',async()=>{
  const db=new Store(fresh()),h=host(),tasks=new Tasks(h,db,['w']);const t=await tasks.submit('u',args);const l=h.history.get(t.sessionId);append(l,'turn/start',{turn:1});append(l,'user/message',{source:{kind:'user',rpcId:h.prompts[0].requestId}});h.sessionController.state=async()=>({cursor:l.length-1,pendingInput:['approval'],queue:[],running:true});await tasks.refresh(tasks.own('u',t.taskId));assert.equal(tasks.own('u',t.taskId).status,'input_required');append(l,'user/message',{source:{kind:'user',rpcId:'manual'}});append(l,'turn/end',{turn:1,reason:{kind:'completed'}});await tasks.refresh(tasks.own('u',t.taskId));assert.equal(tasks.own('u',t.taskId).status,'review_required');db.close();
});
test('个人 Tunnel 无需用户令牌；本地跳凭据、工作区与任务归属仍受限',async t=>{
  const db=new Store(fresh()),h=host(),tasks=new Tasks(h,db,['w']);t.after(()=>db.close());
  const {headers,post,call}=await client(t,tasks);
  assert.equal((await post('dispatch',args,{})).status,403);
  assert.equal((await post('dispatch',args,{'X-DSH-Tunnel':'wrong'})).status,403);
  assert.equal((await post('dispatch',args,{...headers,Origin:'https://example.org'})).status,403);
  assert.ok((await (await post('dispatch',{...args,workspaceId:'other'})).json()).error);
  const old=await tasks.submit('different-owner',args);
  assert.ok((await (await post('status',{taskId:old.taskId})).json()).error);
  const task=await call('dispatch',args);
  assert.deepEqual(await call('status',{taskId:task.taskId}),task);
  const next=await call('continue_task',{taskId:task.taskId,idempotencyKey:'two',instruction:'continue'});
  assert.equal(task.sessionId,next.sessionId);assert.notEqual(task.taskId,next.taskId);
});

test('MCP 指定模型用于首条指令，省略模型不改变既有流程或 profile 默认模型',async t=>{
  const db=new Store(fresh()),h=host(),tasks=new Tasks(h,db,['w']);t.after(()=>db.close());
  const {rpc,rawCall,call}=await client(t,tasks);
  const {result}=await (await rpc('tools/list')).json();const schema=result.tools.find(tool=>tool.name==='dispatch').inputSchema;
  assert.ok(!schema.required.includes('model'));
  assert.deepEqual(schema.properties.model.required,['provider','model']);
  assert.ok(new RegExp(schema.properties.model.properties.model.pattern).test(selectedModel.model));
  assert.match((await rawCall('dispatch',{...args,model:{model:selectedModel.model}})).error.message,/provider and model IDs/);
  assert.equal(h.made,0);
  const task=await call('dispatch',{...args,model:selectedModel});
  assert.equal(task.status,'queued');
  assert.equal(h.prompts[0].sessionId,task.sessionId);
  assert.deepEqual(h.runningModels,[selectedModel]);
  assert.deepEqual(await call('dispatch',{...args,model:{model:selectedModel.model,provider:selectedModel.provider}}),task);
  assert.ok((await rawCall('dispatch',{...args,model:defaultModel})).error);
  assert.deepEqual(h.runningModels,[selectedModel]);
  const defaultTask=await call('dispatch',{...args,idempotencyKey:'default'});
  assert.equal(defaultTask.status,'queued');
  assert.notEqual(defaultTask.sessionId,task.sessionId);
  const next=await call('continue_task',{taskId:task.taskId,idempotencyKey:'next',instruction:'continue'});
  assert.equal(next.sessionId,task.sessionId);
  assert.deepEqual(h.runningModels,[selectedModel,defaultModel,selectedModel]);
  assert.deepEqual(h.selections,[{sessionId:task.sessionId,model:selectedModel}]);
});

test('新会话的首条指令使用指定思考强度，可保留原本的模型，续办不重新设置',async t=>{
  const {h,tasks}=workspaceFixture(t,new Map([['w',{title:'Workspace',path:process.cwd()}]]),['w']);
  const {rpc,rawCall,call}=await client(t,tasks);
  const {result}=await (await rpc('tools/list')).json();
  const {inputSchema}=result.tools.find(tool=>tool.name==='dispatch');
  assert.equal(inputSchema.properties.reasoningEffort.type,'string');
  assert.ok(!inputSchema.required.includes('reasoningEffort'));
  assert.ok(!Object.hasOwn(result.tools.find(tool=>tool.name==='continue_task').inputSchema.properties,'reasoningEffort'));
  for(const reasoningEffort of [null,42,'  ','x'.repeat(257)]){
    assert.match((await rawCall('dispatch',{...args,reasoningEffort})).error.message,/reasoningEffort must be a non-blank/);
  }
  assert.equal(h.made,0);
  const input={...args,model:selectedModel,reasoningEffort:'deep'};
  const task=await call('dispatch',input);
  assert.equal(task.status,'queued');
  assert.deepEqual(await call('dispatch',input),task);
  for(const reasoningEffort of ['balanced',undefined])assert.ok((await rawCall('dispatch',{...input,reasoningEffort})).error);
  const followUp={taskId:task.taskId,idempotencyKey:'next',instruction:'continue'};
  assert.ok((await rawCall('continue_task',{...followUp,reasoningEffort:'balanced'})).error);
  assert.equal((await call('continue_task',followUp)).sessionId,task.sessionId);
  const defaultRoute=await call('dispatch',{...args,idempotencyKey:'effort-only',reasoningEffort:'balanced'});
  assert.equal(defaultRoute.status,'queued');
  await call('dispatch',{...args,idempotencyKey:'unchanged-default'});
  assert.deepEqual(h.runningModels,[
    {...selectedModel,reasoningEffort:'deep'},{...selectedModel,reasoningEffort:'deep'},
    {...defaultModel,reasoningEffort:'balanced'},defaultModel,
  ]);
  assert.deepEqual(h.selections.map(x=>x.sessionId),[task.sessionId,defaultRoute.sessionId]);
});

test('会话模型不支持指定档位时失败，不应用设置或提交指令',async t=>{
  const {db,h,tasks}=workspaceFixture(t,new Map([['w',{title:'Workspace',path:process.cwd()}]]),['w']);
  const {call}=await client(t,tasks);
  const failed=await call('dispatch',{...args,reasoningEffort:'deep'});
  assert.equal(failed.status,'failed');
  assert.match(failed.summary,/default\/model.*不支持思考强度 "deep".*未提交指令/);
  assert.deepEqual(await call('status',{taskId:failed.taskId}),failed);
  assert.deepEqual(db.all('event').find(e=>e.taskId===failed.taskId).data,failed);
  assert.deepEqual(h.selections,[]);
  assert.deepEqual(h.prompts,[]);
});

test('恢复仅指定思考强度的派发时沿用中断前已确定的模型',async t=>{
  const {db,h,tasks}=workspaceFixture(t,new Map([['w',{title:'Workspace',path:process.cwd()}]]),['w']);
  const sessionId='existing-effort',requestId='original-request';
  await h.sessionController.create({workspaceId:'w',sessionId});
  // State after the route was pinned but before DSH flushed the selection.
  db.put('task',{id:'task',sessionId,requestId,workspaceId:'w',owner:'u',status:'submitting',revision:0,cursor:-1,instruction:'本次任务',reasoningEffort:'balanced',resolvedModel:defaultModel});
  h.agents.get(sessionId).session.currentModel=selectedModel;
  await tasks.refresh(db.get('task','task'));
  assert.equal(db.get('task','task').status,'queued');
  assert.deepEqual(h.runningModels,[{...defaultModel,reasoningEffort:'balanced'}]);
  assert.equal(h.prompts[0].requestId,requestId);
  assert.equal(h.made,1);
});

test('不可用或未持久化的选模失败沿用任务事件，不入队也不回退',async t=>{
  const db=new Store(fresh()),h=host(),tasks=new Tasks(h,db,['w']);t.after(()=>db.close());
  for(const model of [{provider:'missing',model:selectedModel.model},{provider:'alternate',model:'unavailable'}]){
    const input={...args,idempotencyKey:Object.values(model).join(':'),model};
    const failed=await tasks.submit('u',input);
    assert.equal(failed.status,'failed');assert.match(failed.summary,/指定模型.*不可用.*未提交指令/);
    assert.deepEqual(await tasks.submit('u',input),failed);
    assert.deepEqual(db.all('event').find(e=>e.taskId===failed.taskId).data,failed);
  }
  assert.deepEqual(h.selections,[]);
  h.sessions.flush=async()=>false;
  const failed=await tasks.submit('u',{...args,model:selectedModel});
  assert.equal(failed.status,'failed');assert.match(failed.summary,/无法为目标会话设置指定模型/);
  assert.deepEqual(h.prompts,[]);
});

test('恢复时先确认预设、完成选模；不确定的入队重试只重用原请求 ID',async t=>{
  const db=new Store(fresh()),h=host(),tasks=new Tasks(h,db,['w']);t.after(()=>db.close());
  const sessionId='existing',requestId='first-prompt';
  await h.sessionController.create({sessionId,agentPreset:'cordis'});
  db.put('task',{id:'task',sessionId,requestId,workspaceId:'w',owner:'u',status:'creating',revision:0,cursor:-1,instruction:'本次任务',model:selectedModel,requestedAgentPreset:'cordis'});
  const prompt=h.sessionController.prompt;
  h.sessionController.prompt=async request=>{await prompt(request);throw Error('response lost');};
  await tasks.refresh(db.get('task','task'));
  assert.deepEqual(h.runningModels,[selectedModel]);
  const pending=db.get('task','task');assert.equal(pending.status,'submitting');pending.nextAdmission=0;db.put('task',pending);
  h.sessionController.prompt=prompt;
  const restarted=new Tasks(h,db,['w']);
  await restarted.refresh(pending);
  assert.equal(db.get('task','task').status,'queued');
  assert.equal(h.made,1);
  assert.equal(h.selections.length,1);
  assert.deepEqual(h.runningPresets,['cordis','cordis']);
  assert.deepEqual(h.prompts.map(({requestId})=>requestId),['first-prompt','first-prompt']);
});

test('列出已授权且仍注册的工作区，按目录或 ID 派发并可交叉重试',async t=>{
  const records=new Map();
  const {dir,db,h,tasks}=workspaceFixture(t,records,['w','deleted']);
  const path=join(dir,'repo'),src=join(path,'src'),alias=join(dir,'alias');
  mkdirSync(src,{recursive:true});
  symlinkSync(path,alias,'dir');
  records.set('w',{title:'Project',path});
  records.set('unauthorized',{title:'Hidden',path});
  const {rpc,call}=await client(t,tasks);
  assert.deepEqual(await call('workspaces'),[{workspaceId:'w',title:'Project',workspacePath:path}]);
  const {result}=await (await rpc('tools/list')).json();
  const {inputSchema}=result.tools.find(tool=>tool.name==='dispatch');
  assert.equal(inputSchema.properties.workspacePath.type,'string');
  assert.deepEqual(inputSchema.oneOf,[{required:['workspaceId']},{required:['workspacePath']}]);
  assert.ok(!inputSchema.required.includes('workspaceId'));

  const byPath=await call('dispatch',{...dispatchArgs,workspacePath:`${src}/../`,agentPreset:'cordis',model:selectedModel});
  assert.equal(byPath.workspaceId,'w');
  assert.equal(byPath.agentPreset,'cordis');
  assert.deepEqual(await call('dispatch',{...args,agentPreset:'cordis',model:selectedModel}),byPath);
  const byId=await call('dispatch',{...args,idempotencyKey:'two'});
  assert.deepEqual(await call('dispatch',{...dispatchArgs,idempotencyKey:'two',workspacePath:alias}),byId);
  assert.deepEqual(h.runningModels,[selectedModel,defaultModel]);
  assert.notEqual(byId.taskId,byPath.taskId);
  assert.deepEqual(h.creates,[{workspaceId:'w',sessionId:byPath.sessionId,agentPreset:'cordis'},{workspaceId:'w',sessionId:byId.sessionId}]);
  assert.deepEqual(h.runningPresets,['cordis','standard']);
  assert.equal(h.prompts.length,2);
  assert.equal(db.all('task').length,2);
});

test('无效、越权或歧义的工作区定位不会创建会话或写入任务',async t=>{
  const records=new Map();
  const {dir,db,h,tasks}=workspaceFixture(t,records,['w','duplicate','deleted']);
  const path=join(dir,'repo'),src=join(path,'src'),hidden=join(dir,'repo-other'),file=join(path,'file');
  const deleted=join(dir,'deleted');
  mkdirSync(src,{recursive:true});mkdirSync(hidden);mkdirSync(deleted);writeFileSync(file,'');
  records.set('w',{title:'Project',path});
  records.set('unauthorized',{title:'Hidden',path:hidden});
  const {rawCall}=await client(t,tasks);
  const rejects=async(args,message)=>{
    const {error,result}=await rawCall('dispatch',args);
    assert.equal(result,undefined);assert.equal(error?.code,-32602);assert.match(error.message,message);
  };
  for(const [locator,message] of [
    [{},/exactly one/],
    [{workspaceId:'w',workspacePath:path},/exactly one/],
    [{workspaceId:'w',workspacePath:null},/exactly one/],
    [{workspacePath:'repo'},/absolute directory/],
    [{workspacePath:src,model:selectedModel},/subdirectory/],
    ...[hidden,deleted,file,join(dir,'missing')].map(path=>[{workspacePath:path},/No permitted registered workspace/]),
  ])await rejects({...dispatchArgs,...locator},message);
  await rejects({...dispatchArgs,workspacePath:path,model:{model:selectedModel.model}},/provider and model IDs/);
  records.set('duplicate',{title:'Duplicate',path});
  await rejects({...dispatchArgs,workspacePath:path},/multiple permitted workspaces/);
  assert.equal(h.made,0);assert.equal(h.prompts.length,0);assert.deepEqual(db.all('task'),[]);
});

test('presets 实时返回 Host 的健康预设及默认标记，不公开故障诊断',async t=>{
  const db=new Store(fresh()),h=host(),tasks=new Tasks(h,db,['w']);t.after(()=>db.close());
  const {rpc,post,call,rawCall}=await client(t,tasks);
  const {result}=await (await rpc('tools/list')).json();
  const tool=result.tools.find(tool=>tool.name==='presets');
  assert.equal(tool.annotations.readOnlyHint,true);
  assert.equal((await post('presets',{},{})).status,403);
  assert.ok((await rawCall('presets',{unknown:true})).error);
  assert.deepEqual(await call('presets'),[
    {id:'standard',name:'Standard',isDefault:true},
    {id:'cordis',name:'Creator',isDefault:false},
    {id:'ptc',name:'PTC',isDefault:false},
    {id:'minimal',name:'Minimal',isDefault:false},
    {id:'custom',name:'My custom preset',isDefault:false},
  ]);
  h.rows.push({id:'my-new-preset'});h.agentPresets.defaultId='my-new-preset';
  assert.deepEqual((await call('presets')).filter(row=>row.isDefault),[{id:'my-new-preset',name:'my-new-preset',isDefault:true}]);
  h.agentPresets.defaultId='broken';
  assert.equal((await call('presets')).some(row=>row.isDefault),false);
  assert.equal(h.creates.length,0);assert.equal(db.all('task').length,0);
});

test('显式 Standard、Creator 及 Host 默认预设；确认预设后才选模、提交指令',async t=>{
  const db=new Store(fresh()),h=host(),tasks=new Tasks(h,db,['w']);t.after(()=>db.close());
  const {rpc,rawCall,call}=await client(t,tasks);
  const {result}=await (await rpc('tools/list')).json();
  const dispatch=result.tools.find(tool=>tool.name==='dispatch').inputSchema;
  assert.equal(dispatch.properties.agentPreset.type,'string');assert.ok(!dispatch.required.includes('agentPreset'));
  const {result:events}=await (await rpc('events/list')).json();
  assert.equal(events.events[0].payloadSchema.properties.agentPreset.type,'string');
  assert.ok(!events.events[0].payloadSchema.required.includes('agentPreset'));

  const creator=await call('dispatch',{...args,agentPreset:'cordis',model:selectedModel});
  assert.equal(creator.status,'queued');assert.equal(creator.agentPreset,'cordis');
  assert.deepEqual(h.steps,['workspace','create','confirm create','list models','select model','flush','prompt']);
  assert.deepEqual(h.creates[0],{workspaceId:'w',sessionId:creator.sessionId,agentPreset:'cordis'});
  assert.deepEqual(await call('status',{taskId:creator.taskId}),creator);
  h.agentPresets.defaultId='custom';
  const standard=await call('dispatch',{...args,idempotencyKey:'standard',agentPreset:'standard'});
  assert.equal(standard.status,'queued');assert.equal(standard.agentPreset,'standard');
  const implicit=await call('dispatch',{...args,idempotencyKey:'implicit'});
  assert.equal(implicit.status,'queued');assert.equal(implicit.agentPreset,'custom');assert.ok(!Object.hasOwn(h.creates[2],'agentPreset'));

  const followup={taskId:creator.taskId,idempotencyKey:'followup',instruction:'continue'};
  assert.ok((await rawCall('continue_task',{...followup,agentPreset:'standard'})).error);
  const next=await call('continue_task',followup);
  assert.equal(next.sessionId,creator.sessionId);assert.equal(next.agentPreset,'cordis');
  assert.deepEqual(h.runningPresets,['cordis','standard','custom','cordis']);
  assert.deepEqual(h.runningModels,[selectedModel,defaultModel,defaultModel,selectedModel]);
  assert.equal(h.creates.length,3);assert.equal(h.agentPresets.defaultId,'custom');
});

test('不认识、不可用、未确认或不符的预设不选模、不入队，也不回退',async t=>{
  const db=new Store(fresh()),h=host(),tasks=new Tasks(h,db,['w']);t.after(()=>db.close());
  const {rawCall,call}=await client(t,tasks);
  for(const agentPreset of [' ',null,{}]){
    assert.match((await rawCall('dispatch',{...args,agentPreset})).error.message,/agentPreset must be a non-blank/);
  }
  assert.equal(h.creates.length,0);
  const checkFailure=async (input,message,actual)=>{
    const failed=await call('dispatch',{...args,model:selectedModel,...input});
    assert.equal(failed.status,'failed');assert.match(failed.summary,message);
    assert.equal(failed.agentPreset,actual);
    assert.deepEqual(await call('status',{taskId:failed.taskId}),failed);
    assert.deepEqual(db.all('event').find(e=>e.taskId===failed.taskId).data,failed);
  };
  await checkFailure({agentPreset:'missing',idempotencyKey:'missing'},/missing.*不存在.*未提交指令/);
  await checkFailure({agentPreset:'broken',idempotencyKey:'broken'},/broken.*不可用.*未提交指令/);
  assert.equal(h.made,0);
  const create=h.sessionController.create;
  h.sessionController.create=async req=>({sessionId:(await create(req)).sessionId});
  await checkFailure({agentPreset:'cordis',idempotencyKey:'no-confirmation'},/未确认.*cordis.*未提交指令/);
  h.sessionController.create=async req=>({sessionId:(await create(req)).sessionId,agentPreset:'standard'});
  await checkFailure({agentPreset:'cordis',idempotencyKey:'mismatch'},/standard.*cordis.*不符.*未提交指令/,'standard');
  assert.ok(!h.steps.includes('list models'));assert.deepEqual(h.prompts,[]);
});

test('显式预设参与幂等校验；兼容旧的无预设请求及状态记录',async t=>{
  const db=new Store(fresh()),h=host(),tasks=new Tasks(h,db,['w']);t.after(()=>db.close());
  const input={...args,agentPreset:'cordis',model:selectedModel};
  const [created,retry]=await Promise.all([tasks.submit('u',input),tasks.submit('u',input)]);
  assert.deepEqual(created,retry);
  for(const agentPreset of ['standard',undefined]){
    await assert.rejects(tasks.submit('u',{...input,agentPreset}),/Idempotency key/);
  }
  for(const [key,model] of [['legacy'],['legacy-model',selectedModel]]){
    const id=digest(JSON.stringify(['u',key]));
    const fingerprint=digest(JSON.stringify(['w',null,'test\n\n上下文：无\n\n验收标准：done',...(model?[model]:[])]));
    db.put('task',{id,workspaceId:'w',owner:'u',sessionId:key,status:'completed',terminal:true,fingerprint});
    const oldInput={...args,idempotencyKey:key,model};
    const old=await tasks.submit('u',oldInput);
    assert.equal(old.sessionId,key);assert.ok(!Object.hasOwn(old,'agentPreset'));
    await assert.rejects(tasks.submit('u',{...oldInput,agentPreset:'standard'}),/Idempotency key/);
  }
  assert.equal(h.creates.length,1);assert.equal(h.prompts.length,1);
});

test('重启恢复时核对已持久化并实际绑定的预设，再选模、提交原请求',async t=>{
  const dir=fresh(),h=host();let db=new Store(dir);
  const sessionId='existing-preset';const requestId='original-request';
  await h.sessionController.create({workspaceId:'w',sessionId,agentPreset:'cordis'});
  db.put('task',{id:'task',sessionId,requestId,workspaceId:'w',owner:'u',status:'creating',revision:0,cursor:-1,instruction:'本次任务',requestedAgentPreset:'cordis',model:selectedModel});
  db.close();db=new Store(dir);t.after(()=>db.close());
  h.steps.length=0;h.agentPresets.defaultId='minimal';
  await new Tasks(h,db,['w']).refresh(db.get('task','task'));
  const queued=db.get('task','task');
  assert.equal(queued.status,'queued');assert.equal(queued.agentPreset,'cordis');
  assert.deepEqual(h.steps,['workspace','read saved preset','list models','select model','flush','prompt']);
  assert.deepEqual(h.runningPresets,['cordis']);assert.deepEqual(h.runningModels,[selectedModel]);
  assert.equal(h.prompts[0].requestId,requestId);assert.equal(h.creates.length,1);
  await new Tasks(h,db,['w']).refresh({...queued,status:'submitting',instruction:'stale scan'});
  assert.equal(h.prompts.length,1);
});

test('恢复提交不能依赖 SQLite 中旧的确认：预设记录缺失、不符或无法恢复时不入队',async t=>{
  const db=new Store(fresh()),h=host();t.after(()=>db.close());
  for(const scenario of ['missing','different','unavailable','after-attempt']){
    const sessionId='resume-'+scenario;
    await h.sessionController.create({workspaceId:'w',sessionId,agentPreset:scenario==='different'?'standard':'cordis'});
    if(scenario==='missing')h.agents.get(sessionId).session.savedPreset=null;
    if(scenario==='unavailable'||scenario==='after-attempt')h.agents.delete(sessionId);
    db.put('task',{id:scenario,sessionId,requestId:scenario,workspaceId:'w',owner:'u',status:'submitting',revision:0,cursor:-1,instruction:'本次任务',requestedAgentPreset:'cordis',agentPreset:'cordis',model:selectedModel,promptAttempted:scenario==='after-attempt'});
    await new Tasks(h,db,['w']).refresh(db.get('task',scenario));
    const failed=db.get('task',scenario);
    assert.equal(failed.status,'failed');assert.match(failed.summary,scenario==='after-attempt'?/cordis.*未重试指令/:/cordis.*未提交指令/);
    assert.equal(failed.agentPreset,scenario==='different'?'standard':undefined);
  }
  assert.ok(!h.steps.includes('list models'));assert.deepEqual(h.prompts,[]);
});
