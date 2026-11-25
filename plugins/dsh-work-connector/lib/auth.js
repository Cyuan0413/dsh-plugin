import {readFileSync} from 'node:fs';
import {createLocalJWKSet,jwtVerify} from 'jose';

// Pin the authorization server and its public keys locally. Token headers never
// select a network destination; key rotation is a configuration reload.
export function oauth({issuer,resource,jwks,jwksText,subjects}) {
  for(const url of [issuer,resource])if(new URL(url).protocol!=='https:')throw Error('HTTPS OAuth issuer and resource required');
  const keys=createLocalJWKSet(JSON.parse(jwksText||readFileSync(jwks,'utf8')));
  const owners=new Set(subjects);if(!owners.size)throw Error('No permitted OAuth subjects');
  const ownerKey=sub=>JSON.stringify([issuer,sub]);
  return {owners:new Set([...owners].map(ownerKey)),metadata:{resource,authorization_servers:[issuer],scopes_supported:['dsh.work'],bearer_methods_supported:['header']},
    async authenticate(header){try{
      if(typeof header!=='string'||!header.startsWith('Bearer '))return null;
      const {payload}=await jwtVerify(header.slice(7),keys,{issuer,audience:resource,algorithms:['RS256','ES256','EdDSA'],requiredClaims:['exp','sub']});
      return owners.has(payload.sub)&&String(payload.scope??'').split(' ').includes('dsh.work')?ownerKey(payload.sub):null;
    }catch{return null;}}
  };
}
