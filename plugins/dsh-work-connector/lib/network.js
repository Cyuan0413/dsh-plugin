import https from 'node:https';
import { lookup } from 'node:dns/promises';
import { isIP } from 'node:net';
import { createHmac, randomUUID, timingSafeEqual, createHash } from 'node:crypto';
import ipaddr from 'ipaddr.js';
import { HttpsProxyAgent } from 'https-proxy-agent';

export const digest = s => createHash('sha256').update(s).digest('hex');
export const equal = (a,b) => typeof a==='string' && typeof b==='string' && timingSafeEqual(Buffer.from(digest(a),'hex'),Buffer.from(digest(b),'hex'));
export function proxyURL(raw) {
  if (!raw) return undefined;
  const u = new URL(raw);
  if (!['http:','https:'].includes(u.protocol) || u.pathname!=='/' || u.search || u.hash) throw Error('Invalid HTTP(S) proxy');
  return u.href;
}
export function callbackURL(raw) {
  const u = new URL(raw);
  const labels = u.hostname.split('.');
  if (u.protocol!=='https:' || u.port || u.username || u.password || u.hash || isIP(u.hostname) ||
      u.hostname.length>253 || labels.length<2 || !labels.every(label=>/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(label))) {
    throw Error('Expected a callback HTTPS URL with a DNS hostname');
  }
  return u;
}
export function signingKey(secret) {
  if (typeof secret!=='string' || !/^whsec_[A-Za-z0-9+/]+={0,2}$/.test(secret)) throw Error('Invalid webhook key');
  const key = Buffer.from(secret.slice(6),'base64');
  if (key.length<24 || key.length>64 || key.toString('base64').replace(/=+$/,'')!==secret.slice(6).replace(/=+$/,'')) throw Error('Invalid webhook key');
  return key;
}
export function signedHeaders(sub, id, body, now=Date.now()) {
  const ts = String(Math.floor(now/1000));
  const secrets = [sub.secret];
  if (sub.previousUntil>now && sub.previous) secrets.push(sub.previous);
  return {'content-type':'application/json','webhook-id':id,'webhook-timestamp':ts,'x-mcp-subscription-id':sub.id,'webhook-signature':secrets.map(secret=>'v1,'+createHmac('sha256',signingKey(secret)).update(`${id}.${ts}.${body}`).digest('base64')).join(' ')};
}
// Connect to the vetted IPv4 address even inside CONNECT. Preserve the public
// hostname separately for TLS certificate verification, SNI and the Host header.
export function sender({proxy}, {resolve=lookup,request=https.request}={}) {
  if (!proxy) throw Error('A proxy is required for signed callbacks');
  const agent = new HttpsProxyAgent(proxy,{keepAlive:false,timeout:10000});
  return async (sub, id, data) => {
    const u = callbackURL(sub.url);
    const addresses = await resolve(u.hostname,{all:true,family:4});
    if (!addresses.length || addresses.some(a=>!ipaddr.IPv4.isValid(a.address) || ipaddr.parse(a.address).range()!=='unicast')) throw Error('Callback address rejected');
    const body = JSON.stringify(data);
    const headers = {...signedHeaders(sub,id,body),host:u.host,'content-length':Buffer.byteLength(body)};
    return new Promise((ok,fail)=>{
      const req=request({agent,hostname:addresses[0].address,port:443,servername:u.hostname,path:u.pathname+u.search,method:'POST',headers,signal:AbortSignal.timeout(10000)},res=>{
        let size=0; const chunks=[];
        res.on('error',fail).on('data',chunk=>{size+=chunk.length;if(size>8192)res.destroy(Error('Callback response too large'));else chunks.push(chunk);}).on('end',()=>ok({status:res.statusCode,text:Buffer.concat(chunks).toString()}));
      });req.on('error',fail).end(body);
    });
  };
}
export async function verify(send, sub) {
  const challenge=randomUUID(); const r=await send(sub,randomUUID(),{type:'verification',challenge});
  if (r.status<200 || r.status>=300 || !equal(JSON.parse(r.text).challenge,challenge)) throw Error('Callback challenge failed');
}
