import http from 'node:http';
import {equal} from './network.js';
import {eventName,publicTask} from './tasks.js';
const str={type:'string',minLength:1};
const object=(properties,required)=>({type:'object',properties,required,additionalProperties:false});
const tools=[
  {name:'dispatch',description:'Create a DSH task in an allowed workspace; reuse idempotencyKey on retry. Subscribe to dsh.task.updated using the returned taskId.',inputSchema:object({workspaceId:str,goal:str,context:str,acceptance:str,idempotencyKey:str},['workspaceId','goal','acceptance','idempotencyKey'])},
  {name:'status',description:'Read one of your dispatched tasks.',inputSchema:object({taskId:str},['taskId'])},
  {name:'continue_task',description:'Queue a follow-up in the same DSH session. Returns a new taskId for this dispatch.',inputSchema:object({taskId:str,instruction:str,idempotencyKey:str},['taskId','instruction','idempotencyKey'])},
  {name:'workspaces',description:'List permitted workspace IDs.',inputSchema:object({},[])}];
const filter=object({taskId:str},['taskId']);
const event={name:eventName,description:'A dispatched task returned, stopped, failed or needs attention.',delivery:['webhook'],inputSchema:filter,payloadSchema:{type:'object',properties:{taskId:str,sessionId:str,workspaceId:str,status:str,summary:{type:'string'},pendingInput:{type:'array',items:str}},required:['taskId','sessionId','status']}};
export function endpoint({hop,owner,tasks,events,allowed}){
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
      const p=m.params||{};const cap={tools:{},events:{}};const info={name:'dsh-work-connector',version:'0.1.0'};
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
          switch(p.name){case 'workspaces':value=allowed.map(id=>({workspaceId:id}));break;
            case 'dispatch':value=await tasks.submit(owner,a);break;
            case 'continue_task':value=await tasks.submit(owner,a,tasks.own(owner,a.taskId));break;
            case 'status':value=publicTask(tasks.own(owner,a.taskId));break;}
          result={content:[{type:'text',text:JSON.stringify(value)}]};
        }else return json(200,{jsonrpc:'2.0',id,error:{code:-32601,message:'Unknown method'}});
      }
      json(200,{jsonrpc:'2.0',id,result});
    }catch(e){json(200,{jsonrpc:'2.0',id,error:{code:e.rpcCode??-32602,message:e.rpcCode===-32015?'Callback verification failed':'Request rejected; check arguments, access and configuration',...(e.rpcCode===-32015?{data:{reason:'challenge_failed'}}:{})}});}
  });
}
