import { timingSafeEqual } from 'node:crypto';
// All pilot access and side effects fail closed. No platform credentials are read.
export const now = () => Date.now();
export const token = (bytes=32) => Array.from(crypto.getRandomValues(new Uint8Array(bytes)),x=>x.toString(16).padStart(2,'0')).join('');
export async function hash(value){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value))),x=>x.toString(16).padStart(2,'0')).join('');}
export async function equal(a,b){return timingSafeEqual(new TextEncoder().encode(await hash(String(a||''))),new TextEncoder().encode(await hash(String(b||''))));}
export async function mac(env,value){const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(env.SF_PILOT_ACCESS_KEY),{name:'HMAC',hash:'SHA-256'},false,['sign']);return Array.from(new Uint8Array(await crypto.subtle.sign('HMAC',key,new TextEncoder().encode(value))),x=>x.toString(16).padStart(2,'0')).join('');}
export function enabled(env){return env.SF_TENANT_PILOT_ENABLED==='true'&&Boolean(env.LEADS_DB)&&String(env.SF_PILOT_ACCESS_KEY||'').length>=32;}
export const publicIntakeEnabled=env=>enabled(env)&&env.SF_PILOT_PUBLIC_RESEARCH_ENABLED==='true';
export const eligibilitySql=(s='s')=>`exists(select 1 from sf_pilot_invitations i where i.id=${s}.invitation_id and i.brief_id=${s}.brief_id and i.email=${s}.email and i.verified_at is not null and i.revoked_at is null)`;
export async function eligibleSearch(env,search){if(!search?.invitation_id)return false;try{return Boolean(await env.LEADS_DB.prepare(`select 1 from sf_pilot_searches s where s.id=? and s.invitation_id=? and ${eligibilitySql()}`).bind(search.id,search.invitation_id).first());}catch{return false;}}
export const invitationCookie=id=>'sf_pilot_invite_'+id.replace(/[^a-zA-Z0-9]/g,'');
export async function invitationSession(env,request,briefId=null){
 if(!enabled(env))return null;
 const jar=cookies(request),names=briefId?[invitationCookie(briefId)]:Object.keys(jar).filter(x=>/^sf_pilot_invite_LB2[A-F0-9]{24}$/.test(x)).slice(0,8);
 for(const name of names){if(!jar[name])continue;try{const row=await env.LEADS_DB.prepare("select i.*,a.id as access_id,a.token_hash,b.public_id as brief_public_id from sf_pilot_access a join sf_pilot_invitations i on i.id=a.invitation_id join location_briefs_v2 b on b.id=i.brief_id where a.token_hash=? and a.search_id is null and a.role='tenant' and a.revoked_at is null and a.expires_at>? and i.verified_at is not null and i.revoked_at is null").bind(await hash(jar[name]),now()).first();if(row&&name===invitationCookie(row.brief_public_id)&&(!briefId||row.brief_public_id===briefId))return row;}catch{return null;}}
 return null;
}
export function loopback(request){return ['localhost','127.0.0.1','[::1]'].includes(new URL(request.url).hostname);}
export function originAllowed(request){const u=new URL(request.url);if(u.protocol!=='https:'&&!loopback(request))return false;const origin=request.headers.get('origin');if(origin===u.origin)return true;return origin==='null'&&request.headers.get('sec-fetch-site')==='same-origin'&&request.headers.get('sec-fetch-mode')==='navigate';}
export function cookies(request){return Object.fromEntries((request.headers.get('cookie')||'').split(';').map(x=>x.trim().split('=')).filter(x=>x.length===2));}
export const cookieName = id => `sf_pilot_${id.replace(/[^a-zA-Z0-9]/g,'')}`;
export function cookie(name,value,maxAge=2592000){return `${name}=${value}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`;}
export const headers = {'cache-control':'no-store, private','x-robots-tag':'noindex, nofollow','referrer-policy':'no-referrer','x-content-type-options':'nosniff','content-security-policy':"default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'"};
export function html(body,status=200,extra={}){return new Response(body,{status,headers:{...headers,'content-type':'text/html; charset=utf-8',...extra}});}
export function json(body,status=200,extra={}){return new Response(JSON.stringify(body),{status,headers:{...headers,'content-type':'application/json',...extra}});}
export function redirect(path,extra={}){return new Response(null,{status:303,headers:{...headers,location:path,...extra}});}
export function fail(message,status=400){const e=new Error(message);e.status=status;throw e;}
export function text(value,max=1000){return String(value??'').trim().slice(0,max);}
export async function formData(request){
 const limit=20000;
 if(Number(request.headers.get('content-length')||0)>limit)fail('This request is too large.',413);
 const type=request.headers.get('content-type')||'';
 if(!type.startsWith('application/x-www-form-urlencoded'))fail('Use the form on this page.',415);
 const reader=request.body?.getReader(),decoder=new TextDecoder('utf-8',{fatal:true});
 let bytes=0,body='';
 if(reader){
  try{
   while(true){
    const {done,value}=await reader.read();if(done)break;
    bytes+=value.byteLength;
    if(bytes>limit){await reader.cancel();fail('This request is too large.',413);}
    body+=decoder.decode(value,{stream:true});
   }
   body+=decoder.decode();
  }catch(error){if(error?.status)throw error;fail('Use a valid form on this page.',400);}
  finally{reader.releaseLock();}
 }
 const fields=new URLSearchParams(body),result=Object.fromEntries(fields);if(fields.has('districtsPresent'))result.districts=fields.getAll('district');return result;
}
export async function grant(env,search,role,days=30){const raw=token(),id=crypto.randomUUID();const result=await env.LEADS_DB.prepare(`insert into sf_pilot_access (id,search_id,token_hash,role,generation,expires_at,created_at,invitation_id) select ?,?,?,?,?,?,?,? ${search?`where exists(select 1 from sf_pilot_searches s where s.id=? and s.generation=? and ${eligibilitySql()})`:''}`).bind(id,search?.id||null,await hash(raw),role,search?.generation||0,now()+days*86400000,now(),search?.invitation_id||null,...(search?[search.id,search.generation]:[])).run();if(!result.meta.changes)fail('Your pilot invitation is no longer active.',403);return {raw,id};}
export async function session(env,request,search=null,staff=false){const raw=cookies(request)[staff?'sf_pilot_staff':cookieName(search.public_id)];if(!raw)return null;const row=await env.LEADS_DB.prepare('select * from sf_pilot_access where token_hash=? and revoked_at is null and expires_at>?').bind(await hash(raw),now()).first();if(!row)return null;if(staff)return row.role==='staff'?row:null;return row.search_id===search.id&&row.invitation_id===search.invitation_id&&row.generation===search.generation&&['tenant','owner'].includes(row.role)&&await eligibleSearch(env,search)?row:null;}
export async function csrf(env,access){return mac(env,`csrf:${access.id}:${access.token_hash}`);}
export async function checkCsrf(env,request,form,access){if(!originAllowed(request)||!await equal(form.csrf,await csrf(env,access)))fail('Please reload this page and try again.',403);}
export async function publicCsrf(env,request){const nonce=cookies(request).sf_pilot_nonce||token(24);return {csrf:await mac(env,`public:${nonce}`),setCookie:cookie('sf_pilot_nonce',nonce,3600)};}
export async function checkPublicCsrf(env,request,form){const nonce=cookies(request).sf_pilot_nonce;if(!originAllowed(request)||!nonce||!await equal(form.csrf,await mac(env,`public:${nonce}`)))fail('Please reopen the form and try again.',403);}
export async function rateLimit(env,request,kind,subject,limit=8){const bucket=await mac(env,`${kind}:${subject}`),start=Math.floor(now()/3600000)*3600000;const r=await env.LEADS_DB.prepare('insert into sf_pilot_rate_limits (bucket_hash,window_start,attempts) values (?,?,1) on conflict(bucket_hash) do update set window_start=excluded.window_start,attempts=case when window_start=excluded.window_start then attempts+1 else 1 end returning attempts').bind(bucket,start).first();if(r.attempts>limit)fail('Please try again later.',429);}
