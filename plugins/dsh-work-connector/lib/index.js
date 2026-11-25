import z from '@deepseek-ai/schemastery';
import {spawn} from 'node:child_process';
import {randomBytes,createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {once} from 'node:events';
import {Store} from './store.js';
import {Tasks} from './tasks.js';
import {Events} from './events.js';
import {proxyURL,sender} from './network.js';
import {endpoint} from './mcp.js';
import {settingsRoute,settingsController,storedSecrets,effectiveSecrets} from './settings.js';
import {healthRoute,tunnelReady} from './health.js';

export const name='work-connector';
export const inject=['sessionController','workspaceRegistry','webServer','connection','credentials','configEditor'];
export const Config=z.object({
  enabled:z.boolean().default(false),tunnelId:z.string(),
  proxy:z.string().description('HTTP(S) 出站代理，或 env:变量名；Tunnel、挑战及签名回报共用。'),
  credentialId:z.string(),
  workspaceIds:z.array(z.string()).default([]),callbackHosts:z.array(z.string()).default([]),
});
export function environment(config,stored={},env=process.env){
  const {key,proxy:raw}=effectiveSecrets(config,stored,env);
  const proxy=proxyURL(raw);if(!proxy)throw Error('Work connector requires an explicit outbound proxy');
  if(!key||!config.tunnelId||!config.workspaceIds?.length||!config.callbackHosts?.length)throw Error('Missing tunnel credential, ID, workspace allowlist or callback host allowlist');
  return {proxy,key};
}
export function runtimeSpec(config,{proxy,key},url,hop,socket){
  // Pass a fresh environment; inherited HTTPS_PROXY, NO_PROXY or a stale
  // CONTROL_PLANE_BASE_URL must never change the selected trust boundary.
  return {args:['run','--control-plane.http-proxy','env:WORK_PROXY','--control-plane.poll-channel','main','--mcp.extra-headers','X-DSH-Tunnel: env:WORK_HOP','--mcp.discovery-extra-headers','X-DSH-Tunnel: env:WORK_HOP','--health.unix-socket',socket],env:{PATH:process.env.PATH,HOME:process.env.HOME,CONTROL_PLANE_API_KEY:key,CONTROL_PLANE_TUNNEL_ID:config.tunnelId,MCP_SERVER_URL:url,WORK_PROXY:proxy,WORK_HOP:hop}};
}
export async function apply(ctx,config){
  let snapshot=async()=>({tunnel:'disabled',pending:0,retrying:0,halted:0});
  settingsRoute(ctx,settingsController(ctx,config,environment));
  healthRoute(ctx,()=>snapshot());
  if(!config.enabled)return;
  try {await start(ctx,config,await storedSecrets(ctx,config),read=>{snapshot=read;});}
  catch {snapshot=async()=>({tunnel:'setup_error',pending:0,retrying:0,halted:0});ctx.logger.warn('Work connector startup failed; review its settings');}
}
async function start(ctx,config,stored,publish){
  const setup=environment(config,stored);const binary=fileURLToPath(new URL('../vendor/tunnel-client-runtime',import.meta.url));
  if(process.platform!=='linux'||process.arch!=='x64'||createHash('sha256').update(readFileSync(binary)).digest('hex')!=='d82fa113e4bc7ab896ff143120b725e588c2f244935e6d315ccea4ee90c03647')throw Error('Unrecognized tunnel runtime/platform');
  const home=process.env.DSH_PROFILE_DIR;if(!home)throw Error('Web profile directory unavailable');
  const tmp=await mkdtemp(join(tmpdir(),'dsh-work-'));const db=new Store(join(home,'work-connector'));
  // Scope persisted tasks to this private tunnel, never to caller-supplied identity.
  const owner='tunnel:'+config.tunnelId;
  const tasks=new Tasks(ctx,db,config.workspaceIds);const events=new Events(db,tasks,sender({proxy:setup.proxy,hosts:config.callbackHosts}),config.callbackHosts,owner);
  const hop=randomBytes(32).toString('hex');const server=endpoint({hop,owner,tasks,events,allowed:config.workspaceIds});
  let stopping=false,child,restart,timer,pump,delay=1000;
  const stop=async()=>{
    stopping=true;clearTimeout(restart);clearInterval(timer);
    const closed=server.listening?new Promise(r=>server.close(r)):Promise.resolve();server.closeIdleConnections();
    const proc=child;if(proc && proc.exitCode===null && !proc.signalCode){const done=once(proc,'close').catch(()=>{});proc.kill();const kill=setTimeout(()=>proc.kill('SIGKILL'),3000);await done;clearTimeout(kill);}
    await closed;await pump;while(tasks.locks.size)await Promise.allSettled([...tasks.locks.values()]);db.close();await rm(tmp,{recursive:true,force:true});
  };
  try{
    server.listen(0,'127.0.0.1');await once(server,'listening');
    const spec=runtimeSpec(config,setup,`http://127.0.0.1:${server.address().port}/mcp`,hop,join(tmp,'health.sock'));
    const launch=()=>{
      if(stopping)return;const started=Date.now();child=spawn(binary,spec.args,{env:spec.env,stdio:'ignore'});
      child.on('error',()=>ctx.logger.warn('Work tunnel failed to start'));
      child.once('close',()=>{child=undefined;if(stopping)return;ctx.logger.warn('Work tunnel stopped; reconnecting');delay=Date.now()-started>60000?1000:Math.min(delay*2,60000);restart=setTimeout(launch,delay);});
    };launch();
    const tick=()=>{if(stopping||pump)return;pump=(async()=>{for(const t of db.all('task')){if(stopping)break;if(!t.terminal&&t.owner===owner&&config.workspaceIds.includes(t.workspaceId)){try{await tasks.refresh(t);}catch{ctx.logger.warn('Work task state temporarily unavailable');}}}if(!stopping)await events.drain();})().catch(()=>ctx.logger.warn('Work connector reconciliation failed')).finally(()=>{pump=undefined;});};
    publish(async()=>{const subs=db.all('sub').filter(s=>s.owner===owner&&s.expiry>Date.now());const pending=subs.filter(s=>(db.get('task',s.taskId)?.revision??0)>s.cursor);return {tunnel:await tunnelReady(join(tmp,'health.sock'))?'ready':'not_ready',pending:pending.length,retrying:pending.filter(s=>s.attempts&&!s.halted).length,halted:pending.filter(s=>s.halted).length};});
    timer=setInterval(tick,2000);tick();ctx.effect(()=>stop,'work connector lifecycle');
  }catch(e){await stop();throw e;}
}
