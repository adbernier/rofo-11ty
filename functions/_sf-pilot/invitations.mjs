import {getBriefBundle,isSfOfficeRequirement} from '../api/location-brief-v2/_shared.js';
import {now,token,hash,mac,fail,cookie,invitationCookie,loopback} from './security.mjs';
const one=(env,sql,...args)=>env.LEADS_DB.prepare(sql).bind(...args).first();
export async function issueInvitation(env,briefPublicId,email){
 email=String(email||'').trim().toLowerCase();
 if(!/^\S+@\S+\.\S+$/.test(email)||email.length>254)fail('Add the intended participant’s email.');
 const bundle=await getBriefBundle(env,briefPublicId,false);
 if(!bundle||!isSfOfficeRequirement(bundle.currentRevision.requirement))fail('Choose an existing San Francisco office Location Brief.',404);
 let invitation=await one(env,'select * from sf_pilot_invitations where brief_id=? and revoked_at is null',bundle.brief.id);
 const search=await one(env,'select invitation_id,email from sf_pilot_searches where brief_id=?',bundle.brief.id);
 if(search&&(!invitation||search.invitation_id!==invitation.id||search.email!==email))fail('This Brief already has a separate search. Use a new Brief for a different participant.',409);
 if(invitation&&invitation.email!==email)fail('This Brief is already invited to another mailbox. Do not transfer its private search.',409);
 if(!invitation){const id=crypto.randomUUID();await env.LEADS_DB.prepare('insert into sf_pilot_invitations(id,brief_id,email,created_at) values(?,?,?,?) on conflict do nothing').bind(id,bundle.brief.id,email,now()).run();invitation=await one(env,'select * from sf_pilot_invitations where brief_id=? and revoked_at is null',bundle.brief.id);}
 if(!invitation||invitation.email!==email)fail('The invitation changed. Reload before continuing.',409);
 const id=crypto.randomUUID(),raw=await mac(env,`invitation:${id}`),t=now();
 await env.LEADS_DB.batch([
  env.LEADS_DB.prepare("update sf_pilot_access set revoked_at=? where invitation_id=? and search_id is null and role='claim' and used_at is null").bind(t,invitation.id),
  env.LEADS_DB.prepare("insert into sf_pilot_access(id,search_id,token_hash,role,generation,expires_at,created_at,invitation_id) select ?,null,?,'claim',0,?,?,? where exists(select 1 from sf_pilot_invitations where id=? and revoked_at is null)").bind(id,await hash(raw),t+86400000,t,invitation.id,invitation.id)
 ]);
 const grant=await one(env,'select id from sf_pilot_access where id=?',id);if(!grant)fail('The invitation was revoked.',409);
 return {...invitation,brief_public_id:bundle.brief.publicId,grant_id:id};
}
export async function invitationPreview(env,id,origin){
 if(!loopback(new Request(origin))&&(new URL(origin).protocol!=='https:'||env.SF_PILOT_ORIGIN!==origin))fail('Open the invitation preview on the configured Rofo pilot origin.',403);
 const row=await one(env,"select i.*,b.public_id as brief_public_id,a.id as grant_id from sf_pilot_invitations i join location_briefs_v2 b on b.id=i.brief_id join sf_pilot_access a on a.invitation_id=i.id where i.id=? and i.revoked_at is null and a.search_id is null and a.role='claim' and a.used_at is null and a.revoked_at is null and a.expires_at>? order by a.created_at desc limit 1",id,now());
 if(!row)fail('This invitation link is no longer usable. Prepare a fresh invitation.',410);
 return {...row,url:new URL('/sf-pilot/access#token='+await mac(env,`invitation:${row.grant_id}`),origin).toString()};
}
export async function acceptInvitation(env,claim){
 const row=await one(env,'select i.*,b.public_id as brief_public_id from sf_pilot_invitations i join location_briefs_v2 b on b.id=i.brief_id where i.id=? and i.revoked_at is null',claim.invitation_id);
 if(!row)fail('This pilot invitation is no longer active.',410);
 const id=crypto.randomUUID(),raw=token(),t=now();
 const guard="exists(select 1 from sf_pilot_access a join sf_pilot_invitations i on i.id=a.invitation_id where a.id=? and a.search_id is null and a.role='claim' and a.used_at is null and a.revoked_at is null and a.expires_at>? and i.id=? and i.revoked_at is null)";
 const result=await env.LEADS_DB.batch([
  env.LEADS_DB.prepare(`insert into sf_pilot_access(id,search_id,token_hash,role,generation,expires_at,created_at,invitation_id) select ?,null,?,'tenant',0,?,?,? where ${guard}`).bind(id,await hash(raw),t+30*86400000,t,row.id,claim.id,t,row.id),
  env.LEADS_DB.prepare('update sf_pilot_invitations set verified_at=coalesce(verified_at,?) where id=? and exists(select 1 from sf_pilot_access where id=?)').bind(t,row.id,id),
  env.LEADS_DB.prepare('update sf_pilot_access set used_at=? where id=? and exists(select 1 from sf_pilot_access where id=?)').bind(t,claim.id,id)
 ]);
 if(!result[0].meta.changes)fail('This invitation expired or has already been used.',410);
 return {invitation:row,access:{id,raw},setCookie:cookie(invitationCookie(row.brief_public_id),raw),path:'/sf-pilot/start/'+row.brief_public_id};
}
export async function revokeInvitation(env,id){
 const t=now();await env.LEADS_DB.batch([
  env.LEADS_DB.prepare('update sf_pilot_invitations set revoked_at=? where id=? and revoked_at is null').bind(t,id),
  env.LEADS_DB.prepare('update sf_pilot_access set revoked_at=? where invitation_id=?').bind(t,id),
  env.LEADS_DB.prepare("update sf_pilot_inquiries set status='held',updated_at=? where search_id in(select id from sf_pilot_searches where invitation_id=?) and status in('awaiting-recipient','awaiting-consent','permitted')").bind(t,id),
  env.LEADS_DB.prepare("update sf_pilot_delivery set status='suppressed',updated_at=? where search_id in(select id from sf_pilot_searches where invitation_id=?) and status in('pending','failed')").bind(t,id),
  env.LEADS_DB.prepare('update sf_pilot_searches set generation=generation+1,updated_at=? where invitation_id=?').bind(t,id)
 ]);
}
