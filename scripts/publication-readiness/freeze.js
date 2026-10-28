'use strict';
const fs=require('fs'),path=require('path'),crypto=require('crypto');
const a=process.argv.slice(2),arg=n=>a[a.indexOf(n)+1];
for(const n of ['--manifest','--correspondence','--copy','--out','--content-disposition','--capacity','--publisher-metadata'])if(!a.includes(n))throw Error('Explicit '+n+' required');
const records=JSON.parse(fs.readFileSync(arg('--manifest'))),decisions=new Map(JSON.parse(fs.readFileSync(arg('--correspondence'))).map(r=>[r.recordId,r])),copy=new Map(JSON.parse(fs.readFileSync(arg('--copy'))).map(r=>[r.recordId||r.subjectId,r]));
if(!Array.isArray(records)||new Set(records.map(r=>r.recordId)).size!==records.length||decisions.size!==records.length||records.some(r=>!decisions.has(r.recordId)))throw Error('Freeze requires exact supplied subject/correspondence accounting');
const content=JSON.parse(fs.readFileSync(arg('--content-disposition'))),heldUpdates=new Set(content.filter(r=>r.hold?.update).map(r=>r.recordId));
const publisherBytes=fs.readFileSync(arg('--publisher-metadata'));
const publisherMetadata=JSON.parse(publisherBytes);
const sfPublisher=publisherMetadata.metadata.custom_fields['Department Metrics']['Publishing Department'];
if(sfPublisher!=="GSA - City Administrator's Office")throw Error('Unexpected Tall inventory publishing department');
const projection=[];
for(const r of records.slice().sort((a,b)=>a.recordId.localeCompare(b.recordId))){
 const d=decisions.get(r.recordId),c=copy.get(r.recordId)||{};
 if(d.disposition==='held-ambiguity')continue;
 const claims=r.claims.map(claim=>Object.fromEntries(['id','predicate','value','scope','sourceId','sourceHash','sourceVersion','sourceTimestamp','temporalStatus'].map(k=>[k,claim[k]]).concat([['evidence',claim.evidence.filter(e=>/^https:\/\//.test(e))]]))).sort((a,b)=>a.id.localeCompare(b.id));
 const evidence=[...new Set(claims.flatMap(c=>c.evidence))];
 const presentation={description:c.description||c.metadataProposal?.description||c.summary,yearConflict:Boolean(c.constructionYearConflict),checks:[]};
 if(r.market==='san-francisco')presentation.publishingMetadata={publisher:'City and County of San Francisco / '+sfPublisher,dataset:'Tall Building Inventory',url:'https://data.sf.gov/api/views/5kya-mfst.json',metadataSha256:crypto.createHash('sha256').update(publisherBytes).digest('hex'),sourceOrigins:'DBI permitting plans / BORP source origins remain distinct from publishing-department identification.'};
 if(c.existingProfileIdentity&&d.disposition==='supported-existing'){
  presentation.displayName=c.existingProfileIdentity.publishedDisplayNames?.[0];presentation.publishedAddress=c.existingProfileIdentity.publishedAddress;presentation.identityContext=c.addressAliasExplanation;
  presentation.identityLinks=(c.identityLinks||[]).filter(link=>typeof link.label==='string'&&/^https:\/\//.test(link.url));
 }
 for(const check of c.publicContinuation||[]){const url=check.citations?.[0]?.url;if(check.claimIds?.every(id=>claims.some(c=>c.id===id))&&evidence.includes(url))presentation.checks.push({question:check.question,url});}
 if(r.market==='sacramento'){
  const area=/approximately ([\d,]+) square feet/.exec(String(claims[0].value))?.[1];
  presentation.checks=[{question:`For the recorded ${area} square feet of modeled ground footprint at ${r.address}, what current measured floor-area plans are available? Ground coverage does not answer rentable-area or permitted-use questions.`,url:evidence[0]}];
 }
 const row={recordId:r.recordId,market:r.market,address:r.address,disposition:d.disposition,canonicalPath:d.canonicalPath,evidence,claims,presentation};
 if(/\/Users\/|\/tmp\/|file:\/\//.test(JSON.stringify(row)))throw Error('Private locator escaped projection allowlist');
 projection.push(row);
}
const out=path.resolve(arg('--out'));fs.mkdirSync(out,{recursive:true});
const bytes=JSON.stringify(projection,null,2)+'\n';fs.writeFileSync(path.join(out,'public-profiles.json'),bytes);
const digestFile=n=>crypto.createHash('sha256').update(fs.readFileSync(arg(n))).digest('hex');
const capacityContract=JSON.parse(fs.readFileSync(arg('--capacity')));
const constraints={conservativeHardFileCap:capacityContract.capacity.conservativeHardFileCap,operatingFileCeiling:capacityContract.capacity.operatingFileCeiling,maxAssetBytes:capacityContract.assetBytes.hardMax,sourceContractSha256:digestFile('--capacity')};
const capacityBytes=JSON.stringify(constraints,null,2)+'\n';fs.writeFileSync(path.join(out,'capacity-constraints.json'),capacityBytes);
const selected=projection.filter(p=>!heldUpdates.has(p.recordId));
const hostBytes=Object.fromEntries(['find-locations/index.html','location-requirement/index.html'].map(p=>[p,fs.statSync(path.resolve(__dirname,'../../_site',p)).size]));
const wave={schemaVersion:2,baselineCommit:'230db52b0b7f59c866e3258afa0446092062985b',qualificationManifestSha256:digestFile('--manifest'),canonicalInputSha256:digestFile('--correspondence'),copyInputSha256:digestFile('--copy'),contentDispositionSha256:digestFile('--content-disposition'),projectionFile:'public-profiles.json',projectionSha256:crypto.createHash('sha256').update(bytes).digest('hex'),subjectCount:projection.length,selectedRecordIds:selected.map(p=>p.recordId),entryRecordIds:projection.map(p=>p.recordId),heldExistingUpdateRecordIds:[...heldUpdates],capacityFile:'capacity-constraints.json',capacitySha256:crypto.createHash('sha256').update(capacityBytes).digest('hex'),resourcePlan:{baselineFiles:capacityContract.baseline.files,newSharedAssetPaths:['assets/building-research/entry-runtime.mjs','js/requirements/requirement-entry-context-base.mjs'],entryHostBaselineBytes:hostBytes},authorizationFile:'publication-authorization.json',publicRoutes:['/','/commercial-real-estate/CA/san-francisco/','/commercial-real-estate/CA/sacramento/',...projection.filter(p=>p.disposition==='supported-existing').map(p=>p.canonicalPath)],selectionStatus:'New-page release candidate; existing body updates held with original output preserved',previewRobots:'noindex,nofollow',publicRehearsalRobots:'index,follow',authorizationGate:'separate exact-wave/exact-public-output approval required'};
fs.writeFileSync(path.join(out,'wave-manifest.json'),JSON.stringify(wave,null,2)+'\n');fs.writeFileSync(path.join(out,'publication-authorization.json'),JSON.stringify({authorized:false,approvalReference:null,waveSha256:crypto.createHash('sha256').update(fs.readFileSync(path.join(out,'wave-manifest.json'))).digest('hex'),projectionSha256:wave.projectionSha256,approvedPublicOutputDigest:null},null,2)+'\n');
console.log(JSON.stringify({selectedPages:selected.length,heldExistingUpdates:heldUpdates.size,profiles:projection.length,existing:projection.filter(p=>p.disposition==='supported-existing').length,new:projection.filter(p=>p.disposition==='proposed-new').length,out}));
