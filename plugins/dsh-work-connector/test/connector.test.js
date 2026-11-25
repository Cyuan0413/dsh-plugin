import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {Store} from '../lib/store.js';
import {Tasks} from '../lib/tasks.js';
import {Events} from '../lib/events.js';
import {endpoint} from '../lib/mcp.js';
import {once} from 'node:events';
const fresh=()=>mkdtempSync(join(tmpdir(),'work-state-'));
const args={workspaceId:'w',goal:'test',acceptance:'done',idempotencyKey:'one'};
const host=()=>{const history=new Map(),prompts=[];let made=0;return {history,prompts,get made(){return made;},workspaceRegistry:{get:id=>id==='w'?{sessionIds:[...history.keys()]}:null},sessionController:{async create({sessionId}){made++;history.set(sessionId,[]);return {sessionId};},async prompt(r){prompts.push(r);return {accepted:true};},async state({sessionId}){return {cursor:history.get(sessionId).length-1,pendingInput:[],queue:[],active:true,running:false};},async events({address,throughSeq,beforeSeq}){const log=history.get(address.sessionId).slice(0,beforeSeq??throughSeq+1);return {records:log.slice(-2).map(event=>({type:'event',event})),hasMore:log.length>2};}}};};
function append(log,type,data){log.push({seq:log.length,type,data,time:Date.now()});}
test('并发重试只创建一次，快任务先于订阅、重启后重发同一事件，手工续办不重复回报',async()=>{
  const dir=fresh(),h=host();let db=new Store(dir),tasks=new Tasks(h,db,['w']);
  const [task,retry]=await Promise.all([tasks.submit('u',args),tasks.submit('u',args)]);assert.deepEqual(task,retry);assert.equal(h.made,1);assert.equal(h.prompts.length,1);
  assert.throws(()=>tasks.own('other',task.taskId));await assert.rejects(tasks.submit('u',{...args,goal:'different'}));await assert.rejects(tasks.submit('u',{...args,workspaceId:'unknown'}));
  const log=h.history.get(task.sessionId);append(log,'turn/start',{turn:1});append(log,'user/message',{source:{kind:'user',rpcId:h.prompts[0].requestId}});append(log,'assistant/message',{turn:1,message:{content:[{type:'text',text:'result\nDSH_WORK_STATUS=completed'}]}});append(log,'turn/end',{turn:1,reason:{kind:'completed'}});
  await tasks.refresh(tasks.own('u',task.taskId));assert.equal(tasks.own('u',task.taskId).status,'completed');
  const attempts=[];let deny=true;const send=async(s,id,data)=>{if(data.type==='verification')return {status:200,text:JSON.stringify({challenge:data.challenge})};attempts.push({id,data});return {status:deny?503:204,text:''};};
  const events=()=>new Events(db,tasks,send,['cb.example'],'u');const p={name:'dsh.task.updated',arguments:{taskId:task.taskId},delivery:{mode:'webhook',url:'https://cb.example/job',secret:'whsec_'+Buffer.alloc(32,7).toString('base64')}};
  const sub=await events().subscription('u',p);await events().drain();db.close();db=new Store(dir);tasks=new Tasks(h,db,['w']);const s=db.get('sub',sub.id);s.next=0;db.put('sub',s);deny=false;await events().drain();await events().drain();assert.equal(attempts.length,2);assert.deepEqual(attempts[0],attempts[1]);assert.equal(attempts[1].data.data.summary,'result');
  append(log,'turn/end',{turn:2,reason:{kind:'completed'}});await tasks.refresh(tasks.own('u',task.taskId));assert.equal(db.all('event').length,1);
  const next=await tasks.submit('u',{instruction:'continue',idempotencyKey:'two'},tasks.own('u',task.taskId));assert.equal(next.sessionId,task.sessionId);assert.notEqual(next.taskId,task.taskId);assert.equal(h.made,1);await events().subscription('u',p,true);assert.equal(db.all('sub').length,0);db.close();
});
test('交叉人工输入不会报告独占成功，审批不会误报完成',async()=>{
  const db=new Store(fresh()),h=host(),tasks=new Tasks(h,db,['w']);const t=await tasks.submit('u',args);const l=h.history.get(t.sessionId);append(l,'turn/start',{turn:1});append(l,'user/message',{source:{kind:'user',rpcId:h.prompts[0].requestId}});h.sessionController.state=async()=>({cursor:l.length-1,pendingInput:['approval'],queue:[],running:true});await tasks.refresh(tasks.own('u',t.taskId));assert.equal(tasks.own('u',t.taskId).status,'input_required');append(l,'user/message',{source:{kind:'user',rpcId:'manual'}});append(l,'turn/end',{turn:1,reason:{kind:'completed'}});await tasks.refresh(tasks.own('u',t.taskId));assert.equal(tasks.own('u',t.taskId).status,'review_required');db.close();
});
test('个人 Tunnel 无需用户令牌；本地跳凭据、工作区与任务归属仍受限',async t=>{
  const db=new Store(fresh()),h=host(),tasks=new Tasks(h,db,['w']);t.after(()=>db.close());
  const server=endpoint({hop:'local-secret',owner:'tunnel:personal',tasks,allowed:['w']});
  server.listen(0,'127.0.0.1');await once(server,'listening');t.after(()=>server.close());
  const url=`http://127.0.0.1:${server.address().port}/mcp`;
  const headers={'X-DSH-Tunnel':'local-secret'};
  const post=(name,args={},hdr=headers)=>fetch(url,{method:'POST',headers:hdr,body:JSON.stringify({jsonrpc:'2.0',id:1,method:'tools/call',params:{name,arguments:args}})});
  const call=async(name,args)=>{const {result,error}=await (await post(name,args)).json();assert.equal(error,undefined);return JSON.parse(result.content[0].text);};
  assert.equal((await post('dispatch',args,{})).status,403);
  assert.equal((await post('dispatch',args,{'X-DSH-Tunnel':'wrong'})).status,403);
  assert.equal((await post('dispatch',args,{...headers,Origin:'https://example.org'})).status,403);
  assert.deepEqual(await call('workspaces'),[{workspaceId:'w'}]);
  assert.ok((await (await post('dispatch',{...args,workspaceId:'other'})).json()).error);
  const old=await tasks.submit('different-owner',args);
  assert.ok((await (await post('status',{taskId:old.taskId})).json()).error);
  const task=await call('dispatch',args);
  assert.deepEqual(await call('status',{taskId:task.taskId}),task);
  const next=await call('continue_task',{taskId:task.taskId,idempotencyKey:'two',instruction:'continue'});
  assert.equal(task.sessionId,next.sessionId);assert.notEqual(task.taskId,next.taskId);
});
