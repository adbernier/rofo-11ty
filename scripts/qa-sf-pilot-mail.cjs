const assert=require('node:assert/strict');const {loadRuntime,environment,mailFixture}=require('./sf-pilot/test-runtime.cjs');const {email}=loadRuntime();const env=environment();let calls=0;const request=new Request('https://pilot.example.test/sf-pilot/staff');
(async()=>{try{
 assert.throws(()=>email.resendTransport(env,request,async()=>{calls++;}),e=>e.status===403);
 const configured={...env,SF_PILOT_EMAIL_SEND_ENABLED:'true',SF_PILOT_MAIL_MODE:'resend',SF_PILOT_ORIGIN:'https://pilot.example.test',RESEND_API_KEY:'synthetic-not-a-real-key',RESEND_FROM_EMAIL:'Rofo <no-reply@example.invalid>'};
 assert.throws(()=>email.resendTransport(configured,new Request('https://other.example.test')),e=>e.status===403);
 const {job,message}=await mailFixture(env);const meta={idempotencyKey:job.operation_key,jobId:job.id};
 const send=email.resendTransport(configured,request,async(url,options)=>{calls++;assert.equal(url,'https://api.resend.com/emails');assert.equal(options.headers['Idempotency-Key'],job.operation_key);const body=JSON.parse(options.body);assert.equal(body.to[0],message.to);assert.equal(body.text,message.text);return new Response(JSON.stringify({id:'mock-resend-id'}),{status:200});});assert.equal((await send(message,meta)).id,'mock-resend-id');
 const fail=email.resendTransport(configured,request,async()=>new Response('{}',{status:400}));await assert.rejects(()=>fail(message,meta),e=>e.definitelyNotSent===true);
 const uncertain=email.resendTransport(configured,request,async()=>new Response('{}',{status:500}));await assert.rejects(()=>uncertain(message,meta),e=>e.definitelyNotSent===false);
 console.log(JSON.stringify({suite:'sf-pilot-resend-mock',passed:5,mockProviderCalls:calls,realNetworkCalls:0}));
 }finally{env.LEADS_DB.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
