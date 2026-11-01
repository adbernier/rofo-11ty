const assert=require('node:assert/strict');
const {loadRuntime,environment,requirement,invitedIntake}=require('./sf-pilot/test-runtime.cjs');
const rt=loadRuntime(),env=environment(),{email,service:svc,foundation,invitations}=rt;
const request=new Request('https://pilot.example.test/sf-pilot/staff');
const configured={...env,SF_PILOT_EMAIL_SEND_ENABLED:'true',SF_PILOT_MAIL_MODE:'resend',SF_PILOT_ORIGIN:'https://pilot.example.test',RESEND_API_KEY:'synthetic-never-used',RESEND_FROM_EMAIL:'Rofo <fixture@example.invalid>'};
let networkCalls=0,checks=0;const results=[];
const check=(name,fn)=>{fn();checks++;results.push(name);};
const message={to:'alan@rofo.com',subject:'Synthetic shortlist',html:'<p>Synthetic</p>',text:'Synthetic'};
const transport=email.resendTransport(configured,request,async(url,options)=>{
 networkCalls++;const payload=JSON.parse(options.body);
 assert.deepEqual(payload.to,['alan@rofo.com']);assert.equal(payload.from,configured.RESEND_FROM_EMAIL);
 assert.equal(payload.cc,undefined);assert.equal(payload.bcc,undefined);assert.equal(payload.reply_to,undefined);
 return new Response(JSON.stringify({id:'mock-'+networkCalls}));
});
async function fixture(address,key){const created=await foundation.createBrief(env,requirement(8),{marketId:'san-francisco',propertyType:'office',sourceType:'city'});const bundle=await foundation.getBriefBundle(env,created.brief.publicId);return invitedIntake(env,bundle,{requestId:key,briefRevision:bundle.currentRevision.id,researchConsent:'yes',name:'Synthetic only',email:address,people:'8',peak:'8',privacy:'private',commitment:'compare',days:'12',timing:'Within 3 months',budget:'5000',budgetBasis:'team-month'},svc);}
(async()=>{try{
 for(const [label,value] of Object.entries({missing:undefined,null:null,empty:'',other:'other@example.invalid',list:'alan@rofo.com,other@example.invalid',semicolon:'alan@rofo.com;other@example.invalid',array:['alan@rofo.com'],multiple:['alan@rofo.com','other@example.invalid'],object:{email:'alan@rofo.com'},display:'Alan <alan@rofo.com>',leading:' alan@rofo.com',trailing:'alan@rofo.com ',newline:'alan@rofo.com\n',header:'alan@rofo.com\r\nBcc:other@example.invalid',upper:'ALAN@ROFO.COM'})){
  const before=networkCalls;await assert.rejects(()=>transport({...message,to:value},{idempotencyKey:'reject-'+label}),e=>e.status===403&&e.definitelyNotSent===true);check('reject '+label+' before provider',()=>assert.equal(networkCalls,before));
 }
 for(const extra of [{cc:'other@example.invalid'},{bcc:['other@example.invalid']},{cc:undefined},{bcc:[]},Object.assign(Object.create({cc:'other@example.invalid'}),message)]){
  const before=networkCalls;await assert.rejects(()=>transport({...message,...extra,...('cc' in extra&&!Object.hasOwn(extra,'cc')?{cc:extra.cc}:{})},{idempotencyKey:'reject-copy'}),e=>e.definitelyNotSent===true);check('reject CC/BCC before provider',()=>assert.equal(networkCalls,before));
 }
 const before=networkCalls;await transport({...message,from:'other@example.invalid',reply_to:'other@example.invalid',headers:{to:'other@example.invalid'}},{idempotencyKey:'ignored-overrides'});check('untrusted override fields never reach provider',()=>assert.equal(networkCalls,before+1));
 let reads=0;await transport({...message,get to(){return ++reads===1?'alan@rofo.com':'other@example.invalid';}},{idempotencyKey:'snapshot'});check('recipient snapshot prevents mutable second read',()=>assert.equal(reads,1));
 const allowed=await fixture('alan@rofo.com','allowed_fixture_0001');const job=await svc.one(env,"select * from sf_pilot_delivery where search_id=? and kind='receipt'",allowed.search.id);
 let result=await email.dispatch(configured,request,job.id,transport);check('eligible allowed mailbox accepted',()=>assert.equal(result.status,'accepted'));
 const acceptedCalls=networkCalls;result=await email.dispatch(configured,request,job.id,transport);check('accepted job retry does not send again',()=>{assert.equal(result.status,'accepted');assert.equal(networkCalls,acceptedCalls);});
 const recovery=await svc.queueEmail(env,allowed.search,'recovery',0,'guard-recovery-1');result=await email.dispatch(configured,request,recovery.id,transport);check('eligible recovery uses same restricted transport',()=>assert.equal(result.status,'accepted'));
 const other=await fixture('other@example.invalid','other_fixture_00001');const otherJob=await svc.one(env,"select * from sf_pilot_delivery where search_id=? and kind='receipt'",other.search.id);const blockedCalls=networkCalls;result=await email.dispatch(configured,request,otherJob.id,transport);check('staff-selected other invited mailbox fails without send',()=>{assert.equal(result.status,'failed');assert.equal(networkCalls,blockedCalls);});
 const tampered=await svc.queueEmail(env,allowed.search,'recovery',0,'guard-tampered-1');await svc.run(env,'update sf_pilot_delivery set recipient=? where id=?','other@example.invalid',tampered.id);result=await email.dispatch(configured,request,tampered.id,transport);check('tampered job recipient blocked at final boundary',()=>{assert.equal(result.status,'failed');assert.equal(networkCalls,blockedCalls);});
 const expired=await svc.queueEmail(env,allowed.search,'recovery',0,'guard-expired-1');await svc.run(env,'update sf_pilot_access set expires_at=0 where id=?',expired.grant_id);await assert.rejects(()=>email.dispatch(configured,request,expired.id,transport),e=>e.status===409);check('expired recovery link not sent',()=>assert.equal(networkCalls,blockedCalls));
 const revoked=await svc.queueEmail(env,allowed.search,'recovery',0,'guard-revoked-1');await invitations.revokeInvitation(env,allowed.search.invitation_id);await assert.rejects(()=>email.dispatch(configured,request,revoked.id,transport),e=>e.status===409);check('revoked invitation suppresses pending delivery',()=>assert.equal(networkCalls,blockedCalls));
 console.log(JSON.stringify({suite:'sf-pilot-final-recipient-boundary',passed:checks,mockedProviderCalls:networkCalls,realNetworkCalls:0,results},null,2));
 }finally{env.LEADS_DB.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
