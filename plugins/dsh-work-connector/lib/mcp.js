import http from 'node:http';
import {equal} from './network.js';
import {eventName,InvalidAgentPreset,InvalidModelSelection,modelIdMaxLength,publicTask,WorkspaceSelectionError} from './tasks.js';
const str={type:'string',minLength:1};
const object=(properties,required)=>({type:'object',properties,required,additionalProperties:false});
const modelId={...str,maxLength:modelIdMaxLength,pattern:'\\S'};
const agentPreset={...str,pattern:'\\S',description:'Optional exact preset ID from presets for the new session. Omit to use the current DSH default.'};
const modelSelection={...object({provider:{...modelId,description:'Exact DSH provider ID.'},model:{...modelId,description:'Exact model ID within that provider.'}},['provider','model']),description:'Optional model for the new session, including its first instruction. Omit to use the profile default.'};
const notify={type:'boolean',default:true,description:'Set false to suppress webhook notifications for this task without changing its execution or status.'};
const tools=[
  {name:'dispatch',description:'Create a DSH task in a permitted workspace. Provide exactly one of workspaceId or workspacePath (the exact absolute root directory on the DSH host; see workspaces). Reuse idempotencyKey on retry. An active connection-wide dsh.task.updated subscription covers new tasks automatically.',inputSchema:{
    ...object({workspaceId:str,workspacePath:str,goal:str,context:str,acceptance:str,idempotencyKey:str,agentPreset,model:modelSelection,notify},['goal','acceptance','idempotencyKey']),
    oneOf:[{required:['workspaceId']},{required:['workspacePath']}],
  }},
  {name:'status',description:'Read one of your dispatched tasks.',inputSchema:object({taskId:str},['taskId'])},
  {name:'continue_task',description:'Queue a follow-up in the same DSH session. Returns a new taskId for this dispatch, covered by an active connection-wide subscription by default.',inputSchema:object({taskId:str,instruction:str,idempotencyKey:str,notify},['taskId','instruction','idempotencyKey'])},
  {name:'mute_task_notifications',description:'Stop future webhook delivery for one task without stopping the task itself. Does not mute subsequent dispatches or follow-ups.',inputSchema:object({taskId:str},['taskId']),annotations:{idempotentHint:true}},
  {name:'workspaces',description:'List permitted registered workspaces with their workspaceId, title and absolute workspacePath.',inputSchema:object({},[])},
  {name:'presets',description:'List available DSH agent presets, their names and the current default.',inputSchema:object({},[]),annotations:{readOnlyHint:true}}];
const filter=object({taskId:{...str,description:'Filter to one task by ID. Omit to cover new tasks dispatched through this Work connection after subscription.'}},[]);
const event={name:eventName,description:'A dispatched task returned, stopped, failed or needs attention. Subscribe once with empty arguments to monitor new tasks from this Work connection in its authorized workspaces, or provide taskId to watch only that task.',delivery:['webhook'],inputSchema:filter,payloadSchema:{type:'object',properties:{taskId:str,sessionId:str,workspaceId:str,agentPreset:str,status:str,summary:{type:'string'},pendingInput:{type:'array',items:str}},required:['taskId','sessionId','status']}};
export function endpoint({hop,owner,tasks,events}){
  return http.createServer({requestTimeout:15000,headersTimeout:10000},async(req,res)=>{
    const json=(code,data)=>{res.writeHead(code,{'content-type':'application/json','cache-control':'no-store'});res.end(data===undefined?'':JSON.stringify(data));};
    if(req.headers.origin || !equal(req.headers['x-dsh-tunnel'],hop))return json(403);
    if(req.url!=='/mcp')return json(404);
    if(req.method!=='POST')return json(405);
    let id=null;
    try{
      let bytes=0;const parts=[];for await(const b of req){bytes+=b.length;if(bytes>65536)return json(413);parts.push(b);}
      const m=JSON.parse(Buffer.concat(parts));id=m.id??null;
      if(m.jsonrpc!=='2.0'||typeof m.method!=='string')return json(400);
      const p=m.params||{};const cap={tools:{},events:{}};const info={name:'dsh-work-connector',version:'0.2.0'};
      let result;
      if(m.method==='initialize')result={protocolVersion:['2025-03-26','2025-06-18','2025-11-25'].includes(p.protocolVersion)?p.protocolVersion:'2025-03-26',capabilities:cap,serverInfo:info};
      else if(m.method==='server/discover')result={resultType:'complete',supportedVersions:['2026-07-28'],capabilities:cap,serverInfo:info};
      else if(m.method.startsWith('notifications/')&&id===null)return json(202);
      else if(m.method==='ping')result={};
      else if(m.method==='tools/list')result={tools};
      else if(m.method==='events/list')result={events:[event]};
      else{
        if(m.method==='events/subscribe'||m.method==='events/unsubscribe')result=await events.subscription(owner,p,m.method==='events/unsubscribe');
        else if(m.method==='tools/call'){
          const a=p.arguments||{};const spec=tools.find(x=>x.name===p.name)?.inputSchema;
          if(!spec||spec.required.some(k=>typeof a[k]!=='string')||Object.keys(a).some(k=>!Object.hasOwn(spec.properties,k)))throw Error('Invalid tool arguments');
          let value;
          switch(p.name){case 'workspaces':value=tasks.workspaces();break;
            case 'presets':value=await tasks.presets();break;
            case 'dispatch':value=await tasks.submit(owner,a);break;
            case 'continue_task':value=await tasks.submit(owner,a,tasks.own(owner,a.taskId));break;
            case 'mute_task_notifications':value=tasks.muteNotifications(owner,a.taskId);break;
            case 'status':value=publicTask(tasks.own(owner,a.taskId));break;}
          result={content:[{type:'text',text:JSON.stringify(value)}]};
        }else return json(200,{jsonrpc:'2.0',id,error:{code:-32601,message:'Unknown method'}});
      }
      json(200,{jsonrpc:'2.0',id,result});
    }catch(e){
      const challengeFailed=e.rpcCode===-32015;
      const selectionError=e instanceof InvalidAgentPreset||e instanceof InvalidModelSelection||e instanceof WorkspaceSelectionError;
      const message=challengeFailed?'Callback verification failed':selectionError?e.message:'Request rejected; check arguments, access and configuration';
      json(200,{jsonrpc:'2.0',id,error:{code:e.rpcCode??-32602,message,...(challengeFailed?{data:{reason:'challenge_failed'}}:{})}});
    }
  });
}
