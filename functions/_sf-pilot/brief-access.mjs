import { enabled,session } from './security.mjs';
// Scoped bridge only for an enrolled Brief; no new global owner capability.
export async function pilotBriefEditAccess(request,env,brief){if(!enabled(env))return null;const search=await env.LEADS_DB.prepare("select * from sf_pilot_searches where brief_id=? and status<>'archived'").bind(brief.id).first();if(!search)return null;const access=await session(env,request,search);return access?.role==='tenant'?{searchId:search.id,accessId:access.id,tokenHash:access.token_hash,generation:search.generation}:null;}
export async function pilotOwnsBrief(request,env,brief){return Boolean(await pilotBriefEditAccess(request,env,brief));}
export async function pilotContinuation(request,env,brief){if(!enabled(env))return '';const search=await env.LEADS_DB.prepare('select public_id from sf_pilot_searches where brief_id=?').bind(brief.id).first();return search?`/sf-pilot/${search.public_id}`:`/sf-pilot/start/${brief.publicId}`;}
