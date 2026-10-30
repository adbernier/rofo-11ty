// Synthetic-only isolation checks. All outbound fetches are trapped; no local/remote D1 is opened.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'rofo-pilot-referral-'));
const require = createRequire(import.meta.url);
const esbuild = process.env.ESBUILD_BIN || path.join(root, 'node_modules/esbuild/bin/esbuild');
function bundle(file, name) {
  const target = path.join(temp, name+'.cjs');
  execFileSync(esbuild, [path.join(root,file), '--bundle','--platform=node','--format=cjs',`--outfile=${target}`], {stdio:'pipe'});
  return require(target);
}
let checks = 0;
const check = (value, message) => { assert(value,message); checks++; };
const originalFetch = globalThis.fetch;
let outbound = 0;
globalThis.fetch = async () => { outbound++; throw Error('Outbound fetch forbidden in isolation QA'); };
try {
  const security = await import(new URL('../functions/_sf-pilot/security.mjs', import.meta.url));
  const parsed=await security.formData(new Request('https://www.rofo.com/sf-pilot/access',{method:'POST',headers:{'content-type':'application/x-www-form-urlencoded'},body:'name=Example&note=hello'}));
  check(parsed.name==='Example'&&parsed.note==='hello','bounded form parser retains valid forms');
  let cancelled=false;
  const oversized=new ReadableStream({start(controller){controller.enqueue(new TextEncoder().encode('é'.repeat(10001)));},cancel(){cancelled=true;}});
  await assert.rejects(()=>security.formData(new Request('https://www.rofo.com/sf-pilot/access',{method:'POST',duplex:'half',headers:{'content-type':'application/x-www-form-urlencoded'},body:oversized})),error=>error.status===413);checks++;
  check(cancelled,'oversized actual-byte stream is cancelled without awaiting full body');
  await assert.rejects(()=>security.formData(new Request('https://www.rofo.com/sf-pilot/access',{method:'POST',headers:{'content-type':'text/plain'},body:'a=1'})),error=>error.status===415);checks++;
  const lead = bundle('functions/api/leads/_shared.js','lead');
  const intake = bundle('functions/api/leads/submit.js','intake');
  const referral = bundle('functions/broker-referral/_shared.js','referral');
  const publicId = 'LB2-0123456789ABCDEF01234567';
  const markers = [{sf_pilot_search_id:'synthetic'}, {pilot_kind:'sf-office-research'}, {source:'rofo-sf-pilot'}, {page_type:'sf_pilot_research'}, {location_brief_v2_context:{sf_pilot_search_id:'synthetic'}}];
  for (const marker of markers) {
    check(lead.isSfPilotMarker(marker),'explicit pilot marker recognized');
    check(await lead.legacyReferralBlocked({},marker),'marker blocked even with feature flag absent');
    assert.throws(()=>lead.buildOfficeFinderPayload(marker,{}), /cannot be serialized/);checks++;
    const response = await intake.onRequestPost({env:{},request:new Request('https://www.rofo.com/api/leads/submit',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(marker)})});
    check(response.status===409,'raw marker blocked before payload normalization/storage');
  }
  let statements=[];
  function db({enrolled=false, failure='', record={}}={}) {return {prepare(sql) {
    statements.push(sql);
    return {bind(...args) {return {first:async()=> {
      if (/select \* from leads/.test(sql)) return {id:'synthetic-lead',status:'pending',lead_json:JSON.stringify(record),officefinder_json:'{}'};
      if (failure) throw Error(failure);
      if (/sf_pilot_searches/.test(sql)) return enrolled?{brief_id:'synthetic-brief'}:null;
      throw Error('Unexpected read in isolation test');
    },run:async()=>{throw Error('No DB mutation permitted in blocked referral test');}};}};
  }};}
  check(await lead.legacyReferralBlocked({LEADS_DB:db({enrolled:true})},{location_brief_v2_public_id:publicId}),'enrollment blocked when marker stripped');
  check(await lead.legacyReferralBlocked({LEADS_DB:db({enrolled:true})},{originating_brief_id:'synthetic-brief'}),'internal Brief reference enrollment blocked');
  check(!await lead.legacyReferralBlocked({LEADS_DB:db({enrolled:false})},{location_brief_v2_public_id:publicId}),'unenrolled legacy Brief allowed');
  check(!await lead.legacyReferralBlocked({LEADS_DB:db({failure:'D1_ERROR: no such table: sf_pilot_searches: SQLITE_ERROR'})},{location_brief_v2_public_id:publicId}),'legacy pre-migration allowed');
  await assert.rejects(()=>lead.legacyReferralBlocked({LEADS_DB:db({failure:'database unavailable'})},{location_brief_v2_public_id:publicId}), /could not be verified/);checks++;
  statements=[];
  check(!await lead.legacyReferralBlocked({LEADS_DB:db()},{source:'ordinary',city:'Chicago'}),'ordinary marker-free legacy remains allowed');
  check(statements.length===0,'ordinary marker-free path performs no pilot query');
  const record={lead:{source:'rofo-sf-pilot'},status:'pending',id:'synthetic-lead'};
  const blockedApprove=await lead.approveLead({LEADS_KV:{get:async()=>record}},'synthetic-lead','both',{readinessOverride:true});
  check(!blockedApprove.ok&&blockedApprove.status===409,'staff readiness override cannot approve pilot');
  check(!(await lead.sendBrokerLeadEmail({},record)).sent,'direct broker email blocked');
  check(!(await lead.logLeadToGoogleSheets({},record)).sent,'pilot cannot enter Sheets through legacy helper');
  check(!(await lead.submitToOfficeFinder({},record.lead)).ok,'direct explicitly marked OfficeFinder payload blocked');
  check(!(await referral.sendReferralEmail({},new Request('https://www.rofo.com'),{},record,{},'synthetic')).sent,'direct referral email blocked');
  const env={LEADS_DB:db({record:{location_brief_v2_public_id:publicId},enrolled:true})};
  await assert.rejects(()=>referral.createReferral(env,new Request('https://www.rofo.com'),{leadId:'synthetic',brokerPartnerId:'synthetic'}),/research-only/);checks++;
  await assert.rejects(()=>referral.createAndSendReferral(env,new Request('https://www.rofo.com'),{leadId:'synthetic',brokerPartnerId:'synthetic',readinessOverride:true}),/research-only/);checks++;
  const response=await intake.onRequestPost({env,request:new Request('https://www.rofo.com/api/leads/submit',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({location_brief_v2_public_id:publicId})})});
  check(response.status===409,'enrolled Brief blocked at generic intake without pilot markers');
  const ordinary = lead.buildOfficeFinderPayload({name:'Synthetic Tenant',email:'tenant@example.invalid',phone:'4155550100',city:'Chicago',state:'IL',space_type:'Office',space_needed:'1000',source:'ordinary'},{});
  check(ordinary.Referrer==='MM2'&&ordinary.MarketName==='Chicago'&&ordinary.Email==='tenant@example.invalid','ordinary OfficeFinder serialization preserved');
  check(outbound===0,'all blocked paths perform zero outbound fetches');
  console.log(JSON.stringify({suite:'sf-pilot-referral-isolation',checks,passed:true,outboundRequests:outbound}));
} finally {globalThis.fetch=originalFetch; fs.rmSync(temp,{recursive:true,force:true});}
