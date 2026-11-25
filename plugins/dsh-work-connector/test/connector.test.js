import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdirSync,mkdtempSync,realpathSync,rmSync,symlinkSync,writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {Store} from '../lib/store.js';
import {Tasks} from '../lib/tasks.js';
import {Events} from '../lib/events.js';
import {endpoint} from '../lib/mcp.js';
import {once} from 'node:events';
const fresh=()=>mkdtempSync(join(tmpdir(),'work-state-'));
const dispatchArgs={goal:'test',acceptance:'done',idempotencyKey:'one'};
const args={workspaceId:'w',...dispatchArgs};
const defaultModel={provider:'default',model:'default/model'};
const selectedModel={provider:'alternate',model:'shared/model'};
const host=(records=new Map([['w',{title:'Workspace',path:process.cwd()}]]))=>{
  const history=new Map(),prompts=[],selections=[],runningModels=[],created=[],agents=new Map();
  return {history,prompts,selections,runningModels,created,get made(){return created.length;},
    workspaceRegistry:{get(id){
      const workspace=records.get(id);return workspace&&{...workspace,sessionIds:[...history.keys()]};
    }},
    llm:{async listModels(provider){return provider==='alternate'?[{id:'shared/model'},{id:'unavailable'}]:[];},
      async resolveCallConfig(selection){if(selection.model==='unavailable')throw Error('provider configuration failed');return selection;}},
    sessions:{async flush(session){session.durableModel=session.currentModel;return true;}},
    sessionController:{
      async create({workspaceId,sessionId}){
        created.push({workspaceId,sessionId});history.set(sessionId,[]);
        const session={currentModel:defaultModel,durableModel:defaultModel};
        agents.set(sessionId,{session,model:{select(model){session.currentModel=model;selections.push({sessionId,model});}}});
        return {sessionId};
      },
      async resolveAgent(sessionId){return {agent:agents.get(sessionId)};},
      async prompt(r){
        const {session}=agents.get(r.sessionId);
        assert.deepEqual(session.durableModel,session.currentModel);
        runningModels.push(session.currentModel);prompts.push(r);return {accepted:true};
      },
      async state({sessionId}){return {cursor:history.get(sessionId).length-1,pendingInput:[],queue:[],active:true,running:false};},
      async events({address,throughSeq,beforeSeq}){const log=history.get(address.sessionId).slice(0,beforeSeq??throughSeq+1);return {records:log.slice(-2).map(event=>({type:'event',event})),hasMore:log.length>2};},
    },
  };
};
async function client(t,tasks){
  const server=endpoint({hop:'local-secret',owner:'tunnel:personal',tasks});
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
  const sub=await events().subscription('u',p);await events().drain();db.close();db=new Store(dir);tasks=new Tasks(h,db,['w']);const s=db.get('sub',sub.id);s.next=0;db.put('sub',s);deny=false;await events().drain();await events().drain();assert.equal(attempts.length,2);assert.deepEqual(attempts[0],attempts[1]);assert.equal(attempts[1].data.data.summary,'result');
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

test('恢复时先完成选模；不确定的入队重试只重用原请求 ID',async t=>{
  const db=new Store(fresh()),h=host(),tasks=new Tasks(h,db,['w']);t.after(()=>db.close());
  const sessionId='existing',requestId='first-prompt';
  await h.sessionController.create({sessionId});
  db.put('task',{id:'task',sessionId,requestId,workspaceId:'w',owner:'u',status:'creating',revision:0,cursor:-1,instruction:'本次任务',model:selectedModel});
  const prompt=h.sessionController.prompt;
  h.sessionController.prompt=async request=>{await prompt(request);throw Error('response lost');};
  await tasks.refresh(db.get('task','task'));
  assert.deepEqual(h.runningModels,[selectedModel]);
  const pending=db.get('task','task');assert.equal(pending.status,'submitting');pending.nextAdmission=0;
  h.sessionController.prompt=prompt;
  const restarted=new Tasks(h,db,['w']);
  await restarted.refresh(pending);
  assert.equal(db.get('task','task').status,'queued');
  assert.equal(h.made,1);
  assert.equal(h.selections.length,1);
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

  const byPath=await call('dispatch',{...dispatchArgs,workspacePath:`${src}/../`,model:selectedModel});
  assert.equal(byPath.workspaceId,'w');
  assert.deepEqual(await call('dispatch',{...args,model:selectedModel}),byPath);
  const byId=await call('dispatch',{...args,idempotencyKey:'two'});
  assert.deepEqual(await call('dispatch',{...dispatchArgs,idempotencyKey:'two',workspacePath:alias}),byId);
  assert.deepEqual(h.runningModels,[selectedModel,defaultModel]);
  assert.notEqual(byId.taskId,byPath.taskId);
  assert.deepEqual(h.created,[byPath,byId].map(({workspaceId,sessionId})=>({workspaceId,sessionId})));
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
