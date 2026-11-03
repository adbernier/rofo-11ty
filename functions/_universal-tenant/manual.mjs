// Governed manual fulfillment only. This module never sends email or contacts a recipient.
import {getBriefBundle,sha256} from '../api/location-brief-v2/_shared.js';
import {session} from '../_sf-pilot/security.mjs';
const clean=(v,n=2000)=>String(v??'').trim().slice(0,n);
const fail=(s,n=409)=>{const e=new Error(s);e.status=n;throw e};
const database=env=>env.LOCATION_BRIEFS_DB||env.LEADS_DB;
const parse=(v,f={})=>v?JSON.parse(v):f;
const stablePacket=row=>({revision:row.requirement_revision_id,purpose:row.purpose,payload:parse(row.payload_json),recipient:parse(row.recipient_json,null)});
export async function manualAction(env,request,input){
 const access=await session(env,request,null,true);if(!access)fail('Staff access required.',403);
 const db=database(env),row=await db.prepare('select * from universal_tenant_inquiries where id=?').bind(clean(input.id,80)).first();if(!row)fail('Request not found.',404);
 if(row.version!==Number(input.version))fail('The request changed. Reload the workspace.');
 const brief=await db.prepare('select public_id,current_requirement_revision_id from location_briefs_v2 where id=?').bind(row.brief_id).first();if(!brief)fail('Brief not found.',404);
 const ops=parse(row.operations_json),payload=parse(row.payload_json),recipient=parse(row.recipient_json,null),t=Date.now(),evidence=clean(input.evidence),actor='staff-session:'+access.id;let status=row.status,consent=row.consent_json;
 const current=brief.current_requirement_revision_id===row.requirement_revision_id;
 if(input.action==='staff-withdraw'){
  if(input.confirm!==true||!evidence)fail('Record the tenant withdrawal evidence.',400);
  ops.withdrawal={at:t,evidence,actor};status='withdrawn';consent=null;
 }else{
  if(input.action!=='manual-outcome'&&(!current||['withdrawn','needs-review'].includes(row.status)))fail('This request needs a fresh tenant request.');
  if(input.action==='verify-mailbox'){
   if(input.email!==payload.replyEmail||input.confirm!==true||!evidence)fail('Record an identifiable reply from this exact mailbox; an outbound message is not verification.',400);
   ops.mailbox={email:payload.replyEmail,at:t,evidence,actor};
  }else if(input.action==='manual-consent'){
   if(row.kind!=='interest'||!recipient||row.status!=='awaiting-permission'||ops.mailbox?.email!==payload.replyEmail||input.confirm!==true||!evidence)fail('First verify the mailbox and prepare the exact recipient; record affirmative approval of this complete packet.',400);
   consent=JSON.stringify({at:t,version:row.version,revision:row.requirement_revision_id,recipient,payload,purpose:row.purpose,method:'verified-mailbox-reply',evidence,actor});status='permission-recorded-no-dispatch';
  }else if(input.action==='manual-check'){
   if(!['reply','introduction'].includes(input.channel)||ops.mailbox?.email!==payload.replyEmail||input.confirm!==true)fail('Verify the exact tenant mailbox and choose the manual action.',400);
   const channel=input.channel,previous=ops[channel];if(previous&&['prepared','sent','uncertain'].includes(previous.state))fail('Existing manual outcome needs reconciliation; do not send again.');
   if(channel==='introduction'){
    const c=parse(consent,null);if(row.kind!=='interest'||row.status!=='permission-recorded-no-dispatch'||!c||c.revision!==row.requirement_revision_id||c.purpose!==row.purpose||JSON.stringify(c.payload)!==JSON.stringify(payload)||JSON.stringify(c.recipient)!==JSON.stringify(recipient))fail('Fresh specific tenant permission is required.');
   }
   ops[channel]={state:'prepared',at:t,actor,packetHash:await sha256(JSON.stringify(stablePacket(row))),recipient:channel==='reply'?payload.replyEmail:recipient.email};
  }else if(input.action==='manual-outcome'){
   const channel=input.channel,previous=ops[channel];if(!['reply','introduction'].includes(channel)||!previous||!['prepared','uncertain'].includes(previous.state)||!['sent','not-sent','uncertain'].includes(input.outcome)||!evidence)fail('Record the exact manual outcome and evidence; do not guess.',400);
   if(previous.packetHash!==await sha256(JSON.stringify(stablePacket(row))))fail('The approved packet changed.');
   ops[channel]={...previous,state:input.outcome,recordedAt:t,evidence,actor};
  }else fail('Unknown staff action.',400);
 }
 const result=await db.prepare("update universal_tenant_inquiries set operations_json=?,consent_json=?,status=?,version=version+1,updated_at=? where id=? and version=? and (? in ('staff-withdraw','manual-outcome') or exists(select 1 from location_briefs_v2 where id=universal_tenant_inquiries.brief_id and current_requirement_revision_id=universal_tenant_inquiries.requirement_revision_id))").bind(JSON.stringify(ops),consent,status,t,row.id,row.version,input.action).run();if(!result.meta.changes)fail('The request changed. Reload before acting.');
 return {ok:true,notice:input.action==='manual-check'?'Current packet checked. Send manually only now; recheck if anything changes. This application sent nothing.':'Manual evidence recorded. This application sent nothing.'};
}
export async function currentBrief(env,id){const db=database(env),b=await db.prepare('select public_id from location_briefs_v2 where id=?').bind(id).first();return b?getBriefBundle(env,b.public_id,false):null;}
