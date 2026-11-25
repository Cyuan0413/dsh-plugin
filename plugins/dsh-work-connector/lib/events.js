import { digest, signingKey, verify, callbackURL } from './network.js';
import { eventName } from './tasks.js';

const DAY=86400000;
export class Events {
  constructor(db,tasks,send,owner){Object.assign(this,{db,tasks,send,owner});}
  async subscription(owner,p,remove=false){
    const idTask=p.arguments?.taskId;
    if(p.name!==eventName||!idTask||Object.keys(p.arguments).length!==1||p.delivery?.mode!=='webhook')throw Error('Invalid subscription');
    this.tasks.own(owner,idTask);
    const url=callbackURL(p.delivery.url).href;
    const id=digest(JSON.stringify([owner,idTask,url,eventName]));
    if(remove){this.db.remove('sub',id);return {};}
    signingKey(p.delivery.secret);const ttl=p.ttlMs??DAY;if(!Number.isSafeInteger(ttl)||ttl<=0)throw Error('Invalid subscription lifetime');
    const expiry=Date.now()+Math.min(ttl,7*DAY);
    const sub={id,owner,taskId:idTask,url,secret:p.delivery.secret,expiry};
    try{await verify(this.send,sub);}catch{throw Object.assign(Error('Callback verification failed'),{rpcCode:-32015});}
    const old=this.db.get('sub',id);
    const cursor=p.cursor==null?old?.cursor??0:Number(p.cursor);
    if(!Number.isSafeInteger(cursor)||cursor<0||cursor>(old?.cursor??0))throw Error('Unknown subscription cursor');
    Object.assign(sub,{cursor,next:0,attempts:0});
    if(old?.secret && old.secret!==sub.secret){sub.previous=old.secret;sub.previousUntil=Date.now()+60000;}
    this.db.put('sub',sub);
    return {id,refreshBefore:new Date(expiry).toISOString(),cursor:String(cursor),truncated:false};
  }
  async drain(){
    for(const s of this.db.all('sub')){
      if(s.owner!==this.owner||s.expiry<=Date.now()||s.next>Date.now()||s.halted)continue;
      try{this.tasks.own(s.owner,s.taskId);}catch{continue;}
      const e=this.db.all('event').find(e=>e.taskId===s.taskId && e.n>s.cursor);if(!e)continue;
      let code=0;try{code=(await this.send(s,e.id,{eventId:e.id,name:e.name,timestamp:e.timestamp,data:e.data,cursor:String(e.n)})).status;}catch{/* Retry the same event, never switch network routes. */}
      const live=this.db.get('sub',s.id);if(!live||JSON.stringify(live)!==JSON.stringify(s))continue;
      if(code>=200 && code<300){s.cursor=e.n;s.attempts=0;s.next=0;s.last='accepted';}
      else{s.last=code||'network';s.attempts++;s.halted=code===410||code===413||s.attempts>=12;s.next=Date.now()+Math.min(600000,1000*2**s.attempts);}
      this.db.put('sub',s);
    }
  }
}
