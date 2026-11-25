import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import https from 'node:https';
import net from 'node:net';
import {once} from 'node:events';
import {execFileSync,spawn} from 'node:child_process';
import {mkdtempSync,readFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHmac,randomBytes} from 'node:crypto';
import {sender,verify} from '../lib/network.js';
import {runtimeSpec} from '../lib/index.js';

// Local fixture only. Reserved URL characters must reach the proxy decoded.
const proxyUser='fixture-user', proxyPass='p@ss:/%';
const authedProxy=port=>`http://${encodeURIComponent(proxyUser)}:${encodeURIComponent(proxyPass)}@127.0.0.1:${port}`;
const expectedAuth='Basic '+Buffer.from(`${proxyUser}:${proxyPass}`).toString('base64');
const listen=async s=>{s.listen(0,'127.0.0.1');await once(s,'listening');return s.address().port;};
test('签名验证和事件经同一真实 CONNECT 代理，绑定目标 IP、SNI 和原始字节；拒绝后不直连',async t=>{
  const dir=mkdtempSync(join(tmpdir(),'work-tls-'));const cert=join(dir,'cert'),key=join(dir,'key');
  execFileSync('openssl',['req','-x509','-newkey','rsa:2048','-nodes','-days','1','-subj','/CN=callback.example','-addext','subjectAltName=DNS:callback.example','-keyout',key,'-out',cert],{stdio:'ignore'});
  let redirect=false;const seen=[],connections=[];const secret=randomBytes(32);const sub={id:'test',url:'https://callback.example/return',secret:'whsec_'+secret.toString('base64')};
  const tls=https.createServer({key:readFileSync(key),cert:readFileSync(cert)},async(q,r)=>{
    let body='';for await(const b of q)body+=b;const h=q.headers;
    seen.push({host:h.host,sni:q.socket.servername,valid:h['webhook-signature']==='v1,'+createHmac('sha256',secret).update(`${h['webhook-id']}.${h['webhook-timestamp']}.${body}`).digest('base64')});
    if(h['proxy-authorization']!==undefined){r.writeHead(400);r.end();return;}
    if(redirect){r.writeHead(307,{location:'/other'});r.end();return;}
    const data=JSON.parse(body);r.end(JSON.stringify({challenge:data.challenge}));
  });const dest=await listen(tls);t.after(()=>tls.close());
  const proxy=http.createServer();let refuse=false;proxy.on('connect',(req,socket)=>{connections.push(req.url);if(req.headers['proxy-authorization']!==expectedAuth)return socket.end('HTTP/1.1 407 Proxy Authentication Required\r\nContent-Length: 0\r\n\r\n');if(refuse)return socket.end('HTTP/1.1 502 Bad Gateway\r\nContent-Length: 0\r\n\r\n');const upstream=net.connect(dest,'127.0.0.1',()=>{socket.write('HTTP/1.1 200 OK\r\n\r\n');socket.pipe(upstream).pipe(socket);});socket.on('error',()=>upstream.destroy());upstream.on('error',()=>socket.destroy());});
  const port=await listen(proxy);t.after(()=>proxy.close());
  const cfg={proxy:authedProxy(port)};const io={resolve:async()=>[{address:'93.184.216.34'}],request:(o,cb)=>https.request({...o,ca:readFileSync(cert)},cb)};
  const send=sender(cfg,io);await verify(send,sub);assert.equal((await send(sub,'evt',{eventId:'evt'})).status,200);assert.equal((await sender({...cfg,proxy:`http://fixture-user:wrong@127.0.0.1:${port}`},io)(sub,'bad',{})).status,407);refuse=true;assert.equal((await send(sub,'evt',{eventId:'evt'})).status,502);
  assert.deepEqual(connections,Array(4).fill('93.184.216.34:443'));assert.deepEqual(seen,Array(2).fill({host:'callback.example',sni:'callback.example',valid:true}));
  refuse=false;redirect=true;
  await assert.rejects(verify(send,sub),/challenge failed/i);
  assert.equal(seen.length,3); // No second POST to Location.
  const mixed=sender(cfg,{...io,resolve:async()=>[{address:'93.184.216.34'},{address:'10.0.0.1'}]});
  await assert.rejects(mixed(sub,'evt',{}),/address rejected/i);
  for(const url of ['http://callback.example', 'https://callback.example:444', 'https://u:p@callback.example','https://127.0.0.1', 'https://[::1]']) {
    await assert.rejects(send({...sub,url},'evt',{}), /callback HTTPS URL/);
  }
  assert.equal(connections.length,5);assert.throws(()=>sender({}));
});
test('内置 Go 运行时向配置的代理建立控制面 CONNECT', {timeout:12000},async t=>{
  const proxy=http.createServer();const contacted=once(proxy,'connect',{signal:AbortSignal.timeout(8000)});proxy.on('connect',(_q,s)=>{s.on('error',()=>{});s.end('HTTP/1.1 503 Service Unavailable\r\nContent-Length: 0\r\n\r\n');});const port=await listen(proxy);t.after(()=>proxy.close());
  const local=http.createServer((_q,r)=>{r.writeHead(404);r.end();});const mport=await listen(local);t.after(()=>local.close());
  const dir=mkdtempSync(join(tmpdir(),'work-run-'));const spec=runtimeSpec({tunnelId:'tunnel_0123456789abcdef0123456789abcdef'},{proxy:authedProxy(port),key:'test-only'},`http://127.0.0.1:${mport}/mcp`,'test-hop',join(dir,'health.sock'));
  const child=spawn(fileURLToPath(new URL('../vendor/tunnel-client-runtime',import.meta.url)),[...spec.args,'--control-plane.base-url','https://tunnel.invalid'],{env:spec.env,stdio:'ignore'});t.after(async()=>{if(child.exitCode===null&&!child.signalCode){const end=once(child,'close');child.kill();await end;}});
  const [request]=await contacted;assert.equal(request.url,'tunnel.invalid:443');assert.equal(request.headers['proxy-authorization'],expectedAuth);
});
