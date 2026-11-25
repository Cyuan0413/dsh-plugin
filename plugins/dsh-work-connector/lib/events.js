import { digest, signingKey, verify, callbackURL } from './network.js';
import { eventName } from './tasks.js';

const DAY=86400000;
const eventCursor=(sub,e)=>sub.taskId===undefined?e.order:e.n;
const isRetry=(sub,e)=>sub.attempts>0&&(sub.retryId===undefined||sub.retryId===e.id);

export class Events {
  constructor(db,tasks,send,owner){Object.assign(this,{db,tasks,send,owner});this.verifying=new Map();}
  async subscription(owner,p,remove=false){
    const args=p.arguments;
    if(owner!==this.owner||p.name!==eventName||!args||typeof args!=='object'||Array.isArray(args)||Object.keys(args).some(k=>k!=='taskId')||p.delivery?.mode!=='webhook')throw Error('Invalid subscription');
    const taskId=args.taskId;
    if(Object.hasOwn(args,'taskId'))this.tasks.own(owner,taskId);
    const url=callbackURL(p.delivery.url).href;
    // Keep the identity of legacy task-specific subscriptions unchanged.
    const id=digest(JSON.stringify([owner,taskId??null,url,eventName]));
    if(remove){this.verifying.delete(id);this.db.remove('sub',id);return {};}
    signingKey(p.delivery.secret);const ttl=p.ttlMs??DAY;if(!Number.isSafeInteger(ttl)||ttl<=0)throw Error('Invalid subscription lifetime');
    const sub={id,owner,taskId,url,secret:p.delivery.secret};
    const attempt=Symbol();this.verifying.set(id,attempt);
    try{
      try{await verify(this.send,sub);}catch{throw Object.assign(Error('Callback verification failed'),{rpcCode:-32015});}
      if(this.verifying.get(id)!==attempt)throw Error('Subscription changed while verifying');
    }finally{if(this.verifying.get(id)===attempt)this.verifying.delete(id);}
    const old=this.db.get('sub',id);
    const now=Date.now();sub.expiry=now+Math.min(ttl,7*DAY);
    if(taskId===undefined){
      // Subscribe to future dispatches, not to previously accepted work that might finish later.
      sub.startOrder=old?.startOrder??this.db.currentOrder();
      sub.workspaceIds=old?.workspaceIds??this.tasks.workspaces().map(w=>w.workspaceId);
    }
    const start=sub.startOrder??0;
    const current=old?.cursor??start;
    const cursor=p.cursor==null?current:Number(p.cursor);
    if(!Number.isSafeInteger(cursor)||cursor<start||cursor>current)throw Error('Unknown subscription cursor');
    Object.assign(sub,{cursor,next:0,attempts:0});
    if(old?.secret && old.secret!==sub.secret){sub.previous=old.secret;sub.previousUntil=now+60000;}
    this.db.put('sub',sub);
    return {id,refreshBefore:new Date(sub.expiry).toISOString(),cursor:String(cursor),truncated:false};
  }
  nextEvent(sub,events){
    if(sub.owner!==this.owner||sub.expiry<=Date.now())return;
    const connection=sub.taskId===undefined;
    return events.find(e=>{
      if(!(eventCursor(sub,e)>sub.cursor)||(!connection&&e.taskId!==sub.taskId))return false;
      let t;try{t=this.tasks.own(sub.owner,e.taskId);}catch{return false;}
      if(connection&&(!(t.createdOrder>sub.startOrder)||!sub.workspaceIds.includes(t.workspaceId)||!this.tasks.registry.get(t.workspaceId)))return false;
      return !this.db.get('mute',t.id);
    });
  }
  deliveryHealth(){
    const events=this.db.all('event');const result={pending:0,retrying:0,halted:0};
    for(const s of this.db.all('sub')){
      const e=this.nextEvent(s,events);if(!e)continue;
      result.pending++;
      if(s.halted)result.halted++;
      else if(isRetry(s,e))result.retrying++;
    }
    return result;
  }
  async drain(){
    const events=this.db.all('event');
    for(const {id} of this.db.all('sub')){
      // A previous send awaited the network; recheck consent before the next one.
      const s=this.db.get('sub',id);if(!s||s.halted)continue;
      const e=this.nextEvent(s,events);if(!e)continue;
      const retry=isRetry(s,e);if(retry&&s.next>Date.now())continue;
      const cursor=eventCursor(s,e);
      let code=0;try{code=(await this.send(s,e.id,{eventId:e.id,name:e.name,timestamp:e.timestamp,data:e.data,cursor:String(cursor)})).status;}catch{/* Retry the same event, never switch network routes. */}
      const live=this.db.get('sub',id);if(!live||JSON.stringify(live)!==JSON.stringify(s))continue;
      if(code>=200 && code<300){s.cursor=cursor;s.attempts=0;s.next=0;s.last='accepted';delete s.retryId;}
      else{s.last=code||'network';s.retryId=e.id;s.attempts=(retry?s.attempts:0)+1;s.halted=code===410||code===413||s.attempts>=12;s.next=Date.now()+Math.min(600000,1000*2**s.attempts);}
      this.db.put('sub',s);
    }
  }
}
