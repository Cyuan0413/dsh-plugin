import http from 'node:http';
export function tunnelReady(socketPath){return new Promise(resolve=>{const req=http.get({socketPath,path:'/readyz',signal:AbortSignal.timeout(1200)},r=>{r.resume();resolve(r.statusCode===200);});req.on('error',()=>resolve(false));});}
export function healthRoute(ctx, read) {
  ctx.effect(() => ctx.webServer.register({
    kind: 'exact', path: '/work-connector/health',
    async resource(request, peer) {
      // readResource supplies an admitted peer; the HTTP carrier supplies only Request.
      const admission = peer === undefined ? ctx.connection.admit(request) : { peer };
      const headers = { 'cache-control': 'no-store' };
      if ('rejection' in admission) return new Response(null, { status: admission.rejection, headers });
      if (admission.peer.principal.kind !== 'owner') return new Response(null, { status: 403, headers });
      return Response.json(await read(), { headers });
    },
  }), 'work connector health');
}
