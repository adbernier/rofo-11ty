import {manualAction,currentBrief} from './manual.mjs';
import {ASSETS} from './asset-versions.mjs';
import markets from './markets.json';
import {projectInitialSearch} from '../../lib/requirements/universal-entry-v1.mjs';
import {catalog,initialOptions} from '../../lib/recommendations/universal-initial-v1.mjs';
import {createBrief,getBriefBundle,ownsBrief,reviseBrief,privateJson,sha256} from '../api/location-brief-v2/_shared.js';
import {session,rateLimit} from '../_sf-pilot/security.mjs';
export const enabled=env=>env?.UNIVERSAL_TENANT_EXPERIENCE_ENABLED==='true'&&Boolean(env.LEADS_DB)&&String(env.SF_PILOT_ACCESS_KEY||'').length>=32;
export const isUniversal=b=>b?.entryContext?.businessArchetypeId==='universal-tenant:v1';
const text=(v,n=1000)=>String(v??'').trim().slice(0,n);
const fail=(message,status=400)=>{const e=new Error(message);e.status=status;throw e;};
const db=env=>env.LOCATION_BRIEFS_DB||env.LEADS_DB;
export const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function email(v){const s=text(v,254).toLowerCase();if(!/^[^\s<>,;\r\n@]+@[^\s<>,;\r\n@]+\.[^\s<>,;\r\n@]+$/.test(s))fail('Add one valid reply email.');return s;}
function originContext(v={}){return {entry:['home','city','district','building'].includes(v.entry)?v.entry:'home',city:text(v.city,180),type:text(v.type,40),district:text(v.district,100),building:v.building?{id:text(v.building.id,150),name:text(v.building.name,180),address:text(v.building.address,200)}:null};}
export async function owned(env,request,id){const b=await getBriefBundle(env,text(id,40),false);if(!isUniversal(b)||!await ownsBrief(request,b.brief))fail('Open this Brief in the browser that created it.',403);return b;}
function publicBundle(b){return {publicId:b.brief.publicId,revision:b.currentRevision.revisionNumber,requirement:b.currentRevision.requirement,originalEntry:b.currentRevision.requirement.initialOrigin||{},options:initialOptions(b.currentRevision.requirement.initialSearch)}}
export async function api({request,env}){
 if(!enabled(env))return privateJson({error:'Not found.'},404);
 try{
  if(request.method==='GET'){const u=new URL(request.url);if(u.searchParams.get('brief'))return privateJson(await ownView(env,request,u.searchParams.get('brief')));return privateJson({catalog,markets:markets.map(m=>({l:m.label||`${m.city}, ${m.state_abbr}`,city:m.city,state:m.state_abbr,slug:m.slug}))});}
  if(request.method!=='POST')fail('Method not allowed.',405);
  if(request.headers.get('origin')!==new URL(request.url).origin||!/^application\/json\b/.test(request.headers.get('content-type')||''))fail('Reopen the search before trying again.',403);
  if(Number(request.headers.get('content-length'))>20000)fail('Request is too large.',413);
  const reader=request.body?.getReader();if(!reader)fail('Invalid request.');let length=0;const chunks=[];for(;;){const {done,value}=await reader.read();if(done)break;length+=value.byteLength;if(length>20000){await reader.cancel();fail('Request is too large.',413)}chunks.push(value)}const bytes=new Uint8Array(length);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.byteLength}let input;try{input=JSON.parse(new TextDecoder().decode(bytes))}catch{fail('Invalid request.')}if(!input||typeof input!=='object'||Array.isArray(input))fail('Invalid request.');
  await rateLimit(env,request,'universal',request.headers.get('cf-connecting-ip')||'local',60);
  if(['verify-mailbox','manual-consent','manual-check','manual-outcome','staff-withdraw'].includes(input.action))return privateJson(await manualAction(env,request,input));
  if(input.action==='save'){
   const market=markets.find(m=>(m.label||`${m.city}, ${m.state_abbr}`).toLowerCase()===String(input.requirements?.city||'').trim().toLowerCase());
   let requirement;try{requirement=projectInitialSearch(input.requirements,market)}catch{fail('Check your location and the relevant space requirement.')}const origin=originContext(input.originalEntry);requirement.initialOrigin=origin;
   const scopedEnv={...env,__universalInitial:true};
   if(input.publicId){const b=await owned(env,request,input.publicId);requirement.initialOrigin=b.currentRevision.requirement.initialOrigin;const result=await reviseBrief(scopedEnv,b,requirement,input.revision,'anonymous_universal');await db(env).prepare("update universal_tenant_inquiries set status='needs-review',consent_json=null,version=version+1,updated_at=? where brief_id=? and requirement_revision_id<>? and status<>'withdrawn'").bind(Date.now(),b.brief.id,result.revision.id).run();return privateJson(publicBundle(await getBriefBundle(env,b.brief.publicId)));}
   const c=await createBrief(scopedEnv,requirement,{sourceType:origin.entry==='home'?'homepage':origin.entry,marketId:market?.slug||'',propertyType:requirement.propertyTypes[0],businessArchetypeId:'universal-tenant:v1',sourceEntityId:origin.building?.id||''},'anonymous_universal');
   await db(env).prepare('update location_briefs_v2 set owner_capability_hash=? where id=?').bind(`ut1:${Date.now()+2592000000}:${c.brief.ownerCapabilityHash}`,c.brief.id).run();
   return privateJson(publicBundle(await getBriefBundle(env,c.brief.publicId)),201,{'set-cookie':`rofo_ut_${c.brief.publicId}=${c.brief.publicId}.${c.ownerToken}; Path=/; HttpOnly; ${new URL(request.url).protocol==='https:'?'Secure; ':''}SameSite=Strict; Max-Age=2592000`});
  }
  if(input.action==='propose'){
   if(!await session(env,request,null,true))fail('Staff access required.',403);
   const row=await db(env).prepare('select * from universal_tenant_inquiries where id=?').bind(text(input.id,80)).first();if(!row||row.kind!=='interest')fail('Request not found.',404);if(row.status==='withdrawn'||row.status==='needs-review')fail('This request needs a fresh tenant request.',409);const operations=row.operations_json?JSON.parse(row.operations_json):{};if(['reply','introduction'].some(k=>['prepared','uncertain'].includes(operations[k]?.state)))fail('Reconcile the existing manual outcome before changing the recipient.',409);
   const b=await getBriefBundle(env,(await db(env).prepare('select public_id from location_briefs_v2 where id=?').bind(row.brief_id).first()).public_id);
   if(row.requirement_revision_id!==b.currentRevision.id)fail('The search changed; request a fresh inquiry.',409);
   const r=input.recipient||{},recipient={name:text(r.name,180),email:email(r.email),role:['operator','landlord','tenant-representative'].includes(r.role)?r.role:'',verification:text(r.verification,1000)};
   if(!recipient.name||!recipient.role||!recipient.verification)fail('Name the recipient, their role and the verification evidence.');
   const result=await db(env).prepare("update universal_tenant_inquiries set recipient_json=?,consent_json=null,status='awaiting-permission',version=version+1,updated_at=? where id=? and version=? and exists(select 1 from location_briefs_v2 where id=universal_tenant_inquiries.brief_id and current_requirement_revision_id=universal_tenant_inquiries.requirement_revision_id)").bind(JSON.stringify(recipient),Date.now(),row.id,Number(input.version)).run();if(!result.meta.changes)fail('The request changed. Reload.',409);return privateJson({ok:true});
  }
  const b=await owned(env,request,input.publicId);if(Number(input.revision)!==b.currentRevision.revisionNumber)fail('Your Brief changed. Reload before continuing.',409);
  if(input.action==='question'||input.action==='interest'){
   if(input.cc||input.bcc||input.to||input.recipient)fail('A tenant cannot select an outside recipient.');
   const address=email(input.email),message=text(input.message,2000);if(input.action==='question'&&!message)fail('Add your question.');
   const purpose=input.action==='question'?'question':['availability','pricing','tour','professional','research'].includes(input.purpose)?input.purpose:'';if(!purpose)fail('Choose how Rofo can help.');
   const itemId=text(input.itemId,80),item=itemId?initialOptions(b.currentRevision.requirement.initialSearch).find(p=>p.id===itemId):null;if(itemId&&!item)fail('This option is no longer part of your search.',409);
   const payload={replyEmail:address,message,budget:text(input.budget,300),term:text(input.term,160),growth:text(input.growth,160),requirements:b.currentRevision.requirement.initialSearch,option:item?{id:item.id,name:item.name,productName:item.productName}:null,purpose};
   const key=text(input.requestKey,100);if(!/^[A-Za-z0-9_-]{12,100}$/.test(key))fail('Reopen the request.');
   const id=crypto.randomUUID(),t=Date.now();await db(env).prepare("insert into universal_tenant_inquiries(id,brief_id,requirement_revision_id,kind,purpose,item_id,payload_json,status,request_key,created_at,updated_at) values(?,?,?,?,?,?,?,'rofo-only',?,?,?) on conflict(brief_id,request_key) do nothing").bind(id,b.brief.id,b.currentRevision.id,input.action,purpose,itemId,JSON.stringify(payload),key,t,t).run();
   return privateJson({ok:true,notice:'Saved for Rofo only. No email, outside inquiry or referral was sent.'});
  }
  if(input.action==='consent'||input.action==='withdraw'){
   const row=await db(env).prepare('select * from universal_tenant_inquiries where id=? and brief_id=?').bind(text(input.id,80),b.brief.id).first();if(!row||Number(input.version)!==row.version||(input.action==='consent'&&row.requirement_revision_id!==b.currentRevision.id))fail('The request changed. Review it again.',409);
   if(input.action==='consent'&&(!row.recipient_json||row.status!=='awaiting-permission'||input.permission!==true))fail('Review the named recipient and give explicit permission.');
   const consent=input.action==='consent'?JSON.stringify({at:Date.now(),version:row.version,revision:row.requirement_revision_id,recipient:JSON.parse(row.recipient_json),payload:JSON.parse(row.payload_json),purpose:row.purpose}):null;
   const result=await db(env).prepare("update universal_tenant_inquiries set consent_json=?,status=?,version=version+1,updated_at=? where id=? and version=? and (?='withdraw' or exists(select 1 from location_briefs_v2 where id=universal_tenant_inquiries.brief_id and current_requirement_revision_id=universal_tenant_inquiries.requirement_revision_id))").bind(consent,input.action==='consent'?'permission-recorded-no-dispatch':'withdrawn',Date.now(),row.id,row.version,input.action).run();if(!result.meta.changes)fail('The request changed. Reload.',409);return privateJson({ok:true,notice:'Permission updated. Nothing was sent outside Rofo.'});
  }
  fail('Unknown action.');
 }catch(e){return privateJson({ok:false,error:e.status?e.message:'Your request could not be saved. Please try again.'},e.status||503);}
}
async function ownView(env,request,id){const b=await owned(env,request,id);const rows=await db(env).prepare('select id,kind,purpose,payload_json,recipient_json,operations_json,status,version,requirement_revision_id from universal_tenant_inquiries where brief_id=? order by created_at desc').bind(b.brief.id).all();return {...publicBundle(b),inquiries:rows.results.map(r=>({...r,status:(r.operations_json&&JSON.parse(r.operations_json).introduction?.state==='sent')?'manually-shared':(r.operations_json&&['prepared','uncertain'].includes(JSON.parse(r.operations_json).introduction?.state))?'manual-outcome-pending':(r.status==='withdrawn'||r.requirement_revision_id===b.currentRevision.id?r.status:'needs-review'),payload:JSON.parse(r.payload_json),recipient:r.recipient_json?JSON.parse(r.recipient_json):null,payload_json:undefined,recipient_json:undefined,operations_json:undefined}))};}
export async function staffMarkup(env){
 if(!enabled(env))return '';const rows=(await db(env).prepare('select q.*,b.public_id from universal_tenant_inquiries q join location_briefs_v2 b on b.id=q.brief_id order by q.updated_at desc limit 100').all()).results;
 const fields=`<label>Recipient name<input name="name" required></label><label>Recipient email<input name="email" type="email" required></label><label>Role<select name="role"><option value="operator">Workspace operator</option><option value="landlord">Represents landlord</option><option value="tenant-representative">Could represent tenant</option></select></label><label>Verification evidence<textarea name="verification" required></textarea></label>`;
 const parts=[];for(const r of rows){const p=JSON.parse(r.payload_json),b=await currentBrief(env,r.brief_id),current=b?.currentRevision.id===r.requirement_revision_id,stale=!current||r.status==='needs-review',ops=r.operations_json?JSON.parse(r.operations_json):{};
 const form=(action,title,body)=>`<form data-universal-manual><input type="hidden" name="action" value="${action}"><input type="hidden" name="id" value="${esc(r.id)}"><input type="hidden" name="version" value="${r.version}">${body}<button>${title}</button><p role="status"></p></form>`;
 const evidence='<label>Reply / message evidence (date, thread reference and explicit approval; never a password or token)<textarea name="evidence" required></textarea></label>';
 const confirm=label=>`<label><input type="checkbox" name="confirm" required>${label}</label>`;
 parts.push(`<article><h3>${esc(r.public_id)} · ${esc(r.purpose)}</h3><p>${esc(p.replyEmail)} · ${esc(stale&&r.status!=='withdrawn'?'needs-review':r.status)} · ${esc(p.message)}</p><details><summary>Associated canonical Location Brief — current revision ${esc(b?.currentRevision.revisionNumber)}</summary><pre>${esc(JSON.stringify(b?.currentRevision.requirement,null,2))}</pre></details><details><summary>Submitted details and exact proposed information</summary><pre>${esc(JSON.stringify(p,null,2))}</pre></details><details><summary>Recipient, permission and manual history</summary><pre>${esc(JSON.stringify({recipient:r.recipient_json?JSON.parse(r.recipient_json):null,consent:r.consent_json?JSON.parse(r.consent_json):null,operations:ops},null,2))}</pre></details>`);
 if(!stale&&r.status!=='withdrawn'){
 parts.push(form('verify-mailbox','Record verified tenant mailbox',`<input type="hidden" name="email" value="${esc(p.replyEmail)}">${evidence}${confirm('I received an identifiable reply from this exact mailbox. Typing an address or sending to it is not verification.')}`));
 if(r.kind==='interest')parts.push(`<form data-universal-proposal><input type="hidden" name="id" value="${esc(r.id)}"><input type="hidden" name="version" value="${r.version}">${fields}<button>Prepare permission request</button><p role="status"></p></form>`);
 if(r.kind==='interest'&&r.status==='awaiting-permission')parts.push(form('manual-consent','Record specific tenant email approval',`${evidence}${confirm('The verified tenant mailbox affirmatively approved the exact recipient, role, purpose and complete information shown above. This does not restore browser access.')}`));
 parts.push(form('manual-check','Check current packet before manual email',`<label>Action<select name="channel"><option value="reply">Reply only to verified tenant</option>${r.kind==='interest'?'<option value="introduction">Introduction to explicitly approved recipient</option>':''}</select></label>${confirm('I will use only this exact recipient and packet, check for withdrawals immediately before sending, and not retry an uncertain outcome.')}`));

 }
 parts.push(form('manual-outcome','Record manual email outcome',`<label>Action<select name="channel"><option value="reply">Tenant reply</option>${r.kind==='interest'?'<option value="introduction">Introduction</option>':''}</select></label><label>Outcome<select name="outcome"><option value="sent">Sent — message evidence confirmed</option><option value="not-sent">Confirmed not sent</option><option value="uncertain">Uncertain — do not retry</option></select></label>${evidence}`));
 parts.push(form('staff-withdraw','Record tenant withdrawal',`${evidence}${confirm('The tenant requested withdrawal. Stop manual sharing and preserve the record.')}`));parts.push('</article>');}
 return `<section class="panel"><h2>Universal tenant requests · Rofo only</h2><p>No automatic email, referral or introduction is sent. First verify the tenant mailbox using a reply without private search details. Review the current Brief and exact permission, check immediately before sending manually, then record the outcome. A changed or withdrawn request cannot authorize sharing. Staff must reload after each action.</p>${parts.join('')||'<p>No universal requests yet.</p>'}</section><script src="/assets/universal-staff.js?v=${ASSETS.staff}" defer></script>`;
}
