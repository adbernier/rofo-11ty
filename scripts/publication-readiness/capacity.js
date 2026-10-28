"use strict";
const fs=require('fs'),path=require('path'),crypto=require('crypto');
const a=process.argv.slice(2),get=n=>a[a.indexOf(n)+1];
if(!a.includes('--baseline')||!a.includes('--staged')||!a.includes('--out'))throw Error('Explicit baseline, staged directory and report destination required');
const baselineDir=path.resolve(get('--baseline')),stagedDir=path.resolve(get('--staged'));
function files(dir){const list=[];function walk(p){for(const e of fs.readdirSync(p,{withFileTypes:true}).sort((a,b)=>a.name.localeCompare(b.name))){const f=path.join(p,e.name);if(e.isDirectory())walk(f);else{const bytes=fs.readFileSync(f);list.push({path:path.relative(dir,f),bytes:bytes.length,sha256:crypto.createHash('sha256').update(bytes).digest('hex')});}}}walk(dir);return list;}
const baseline=files(baselineDir),staged=files(stagedDir),subjects=JSON.parse(fs.readFileSync(path.join(stagedDir,'subject-manifest.json')));
const contract=a.includes('--capacity')?JSON.parse(fs.readFileSync(get('--capacity'))):{};
const conservative=contract.capacity?.conservativeHardFileCap||contract.conservativeFileCap||null;
const reserve=contract.capacity?conservative-contract.capacity.operatingFileCeiling:contract.reserveFiles||0;
const higher=contract.capacity?.verifiedHigherFileCap||null;
const publicDir=a.includes('--public-stage')?path.resolve(get('--public-stage')):baselineDir;
const publicFiles=files(publicDir),upload=new Map(publicFiles.map(f=>[f.path,f])),base=new Map(baseline.map(f=>[f.path,f]));
const wave=a.includes('--wave')?JSON.parse(fs.readFileSync(get('--wave'))):null;
const selected=subjects.filter(s=>wave?wave.selectedRecordIds.includes(s.recordId):s.disposition!=='held-ambiguity'),pending=subjects.filter(s=>s.disposition==='held-ambiguity').length;
for(const s of selected){const f=staged.find(f=>f.path===s.outputPath);if(!f||f.path.startsWith('review/'))throw Error('Invalid held/missing deployment proposal');if(a.includes('--public-stage')){if(!upload.has(f.path))throw Error('Selected profile missing from actual public stage');}else upload.set(f.path,f);}
const uploaded=[...upload.values()].sort((a,b)=>a.path.localeCompare(b.path));
const added=uploaded.filter(f=>!base.has(f.path)),changed=uploaded.filter(f=>base.has(f.path)&&base.get(f.path).sha256!==f.sha256),removed=baseline.filter(f=>!upload.has(f.path));
const assetHard=contract.assetBytes?.hardMax||null,assetWarning=contract.assetBytes?.warningAt||null;
const sitemapAudit=JSON.parse(require('child_process').execFileSync('python3',[path.join(__dirname,'sitemap-audit.py'),publicDir],{encoding:'utf8',maxBuffer:16*1024*1024}));
const selectedUrls=new Set(selected.map(s=>'https://www.rofo.com'+s.canonicalPath));
const previewMode=a.includes('--mode')&&get('--mode')==='preview';
const previewSafetyTargets=previewMode?sitemapAudit.flatMap(s=>(s.noindex||[]).filter(url=>selectedUrls.has(url))):[];
const sitemapViolations=sitemapAudit.filter(s=>!s.validXML||s.duplicateUrls||s.missing?.length||s.noindex?.some(url=>!previewMode||!selectedUrls.has(url))||s.foreign?.length||(contract.sitemap&&((s.urls>contract.sitemap.maxUrlsPerShard)||(s.bytes>contract.sitemap.maxBytesPerHostedShard))));
const heldPreservationFailures=(wave?.heldExistingUpdateRecordIds||[]).filter(id=>{const s=subjects.find(s=>s.recordId===id),p=s?.outputPath;return !p||!base.has(p)||!upload.has(p)||base.get(p).sha256!==upload.get(p).sha256;});
const oversize=assetHard?uploaded.filter(f=>f.bytes>assetHard):[];
const html=staged.filter(f=>f.path.endsWith('.html')),sizes=html.map(f=>f.bytes);
const category=f=>f.path.endsWith('.html')?'HTML':/sitemap/.test(f.path)?'sitemap/index':f.path.endsWith('.svg')?'separate SVG maps':/\.(?:png|jpe?g|webp|avif)$/.test(f.path)?'optional media':/\.(?:css|js|mjs)$/.test(f.path)?'shared CSS/JS':'other assets';
const categories={};for(const f of added){const c=category(f);categories[c]=(categories[c]||0)+1;}
const growthSharedFiles=added.filter(f=>!f.path.endsWith('.html')).length;
const growthBase=baseline.length+growthSharedFiles;
const metrics=a.includes('--build-metrics')?JSON.parse(fs.readFileSync(get('--build-metrics'))):null;
const constraints=[];
if(!conservative)constraints.push('Conservative file bound not supplied');
if(conservative&&uploaded.length+reserve>conservative&&(!higher||uploaded.length+reserve>higher))constraints.push('File capacity/reserve exceeded or required higher entitlement unverified');
if(oversize.length)constraints.push('Asset byte cap exceeded');
if(sitemapViolations.length)constraints.push('Sitemap validation failures');
if(removed.length)constraints.push('Unapproved baseline route removals');
if(heldPreservationFailures.length)constraints.push('Held existing body output changed');
if(metrics&&contract.build&&metrics.wallSeconds>contract.build.proposedSafetyTargetSeconds)constraints.push('Build safety time exceeded');
const report={baselineFiles:baseline.length,baselineBytes:baseline.reduce((a,f)=>a+f.bytes,0),isolatedRehearsalFiles:staged.length,isolatedRehearsalHTML:html.length,baselineFilesManifest:baseline,stagedFilesManifest:staged,proposedUploadManifest:uploaded,
 waveDelta:{newHTML:selected.filter(s=>s.disposition==='proposed-new').length,existingURLReplacements:selected.filter(s=>s.disposition==='supported-existing').length,heldExistingUpdates:wave?.heldExistingUpdateRecordIds.length||0,heldExistingPreservationFailures:heldPreservationFailures,heldPreviewHTML:pending,inlineMaps:html.filter(f=>/<svg\b/.test(fs.readFileSync(path.join(stagedDir,f.path),'utf8'))).length,separateMapAssets:staged.filter(f=>f.path.endsWith('.svg')).length,newSeparateMapAssets:added.filter(f=>f.path.endsWith('.svg')).length,optionalMedia:added.filter(f=>category(f)==='optional media').length,sharedAssetsAdded:added.filter(f=>category(f)==='shared CSS/JS').length,sitemapShardsAdded:added.filter(f=>category(f)==='sitemap/index').length},
 actualUploadPlanning:{files:uploaded.length,bytes:uploaded.reduce((a,f)=>a+f.bytes,0),newPaths:added,changedPaths:changed,removedPaths:removed,unchanged:uploaded.length-added.length-changed.length,categories,privateReviewFilesExcluded:true,heldReviewFilesExcluded:true,baselineUnchanged:!added.length&&!changed.length&&!removed.length},
 assetByteChecks:{hardMax:assetHard,warningAt:assetWarning,oversize,warnings:assetWarning?uploaded.filter(f=>f.bytes>assetWarning):[]},sitemapAudit,sitemapChecks:{contract:contract.sitemap||null,changedShards:changed.filter(f=>category(f)==='sitemap/index').length,newCanonicalEntries:0,intendedPublicNewCanonicalEntries:selected.filter(s=>s.disposition==='proposed-new').length,previewSafetyNoindexTargets:previewSafetyTargets,previewSafetyPolicy:'Explicit preview noindex on selected replacement pages is separate from intended public index/follow metadata. No public sitemap or live indexing change is performed.',lastmodAssertionsAdded:0,violations:sitemapViolations},buildContract:contract.build||null,buildMetrics:metrics,buildSafetyMarginSeconds:metrics&&contract.build?contract.build.proposedSafetyTargetSeconds-metrics.wallSeconds:null,
 measuredHTMLBytes:{min:Math.min(...sizes),max:Math.max(...sizes),average:Math.round(sizes.reduce((a,b)=>a+b,0)/sizes.length)},verifiedHigherFileCap:higher,conservativeFileCap:conservative,reserveFiles:reserve,reservePolicy:'Explicit engineering reserve; not a platform limit',conservativeHardHeadroom:conservative===null?null:conservative-uploaded.length,conservativeReserveHeadroom:conservative===null?null:conservative-reserve-uploaded.length,capacityGate:constraints.length?'held: '+constraints.join('; '):'within conservative planning bound and engineering reserve; higher entitlement not required',constraints,
 scenarios:[1000,5000,20000,50000,100000].map(n=>({newProfilesFromPinnedBaseline:n,baseFiles:growthBase,assumption:'Pinned baseline plus measured shared-entry overhead, then one new HTML/profile with existing shared maps. No optional media/new sitemap shards measured; not a universal future cost.',projectedFiles:growthBase+n,richFiveFilesPerProfileScenario:growthBase+5*n,richScenarioIsCurrentGeneratorFact:false,conservativeHardCap:conservative===null?'unknown':growthBase+n<=conservative,conservativeReserve:conservative===null?'unknown':growthBase+n+reserve<=conservative,higherEntitlementRequired:conservative===null||growthBase+n>conservative})),publicationAuthorized:false};
fs.writeFileSync(path.resolve(get('--out')),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({baselineFiles:report.baselineFiles,waveDelta:report.waveDelta,capacityGate:report.capacityGate}));
