import http from 'node:http';
export function tunnelReady(socketPath){return new Promise(resolve=>{const req=http.get({socketPath,path:'/readyz',signal:AbortSignal.timeout(1200)},r=>{r.resume();resolve(r.statusCode===200);});req.on('error',()=>resolve(false));});}
export function healthRoute(ctx,read){ctx.effect(()=>ctx.webServer.register({kind:'exact',path:'/work-connector/health',resource:async(_req,peer)=>{
  if(peer?.principal?.kind!=='owner')return new Response(null,{status:403});
  return Response.json(await read(),{headers:{'cache-control':'no-store'}});
}}),'work connector health');}
