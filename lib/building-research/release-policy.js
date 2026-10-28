'use strict';
const fs=require('fs'),path=require('path'),crypto=require('crypto');
const digest=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
function sibling(file,name){const target=path.resolve(path.dirname(file),name);if(path.dirname(target)!==path.dirname(file))throw Error('Scope dependency must be a sibling file');return target;}
function readScope(input){
 const file=path.resolve(input),bytes=fs.readFileSync(file),wave=JSON.parse(bytes);
 if(wave.schemaVersion!==2||wave.baselineCommit!=='230db52b0b7f59c866e3258afa0446092062985b')throw Error('Invalid exact rehearsal scope');
 const projectionFile=sibling(file,wave.projectionFile),projection=fs.readFileSync(projectionFile);
 if(digest(projection)!==wave.projectionSha256)throw Error('Frozen public projection hash mismatch');
 const capacityBytes=fs.readFileSync(sibling(file,wave.capacityFile));
 if(digest(capacityBytes)!==wave.capacitySha256)throw Error('Frozen resource constraints hash mismatch');
 const rows=JSON.parse(projection),capacity=JSON.parse(capacityBytes);
 for(const key of ['conservativeHardFileCap','operatingFileCeiling','maxAssetBytes'])if(!Number.isSafeInteger(capacity[key])||capacity[key]<=0)throw Error('Invalid measured capacity constraint');
 if(capacity.operatingFileCeiling>capacity.conservativeHardFileCap||!Number.isSafeInteger(wave.resourcePlan?.baselineFiles)||wave.resourcePlan.baselineFiles<0||!Array.isArray(wave.resourcePlan.newSharedAssetPaths)||!wave.resourcePlan.entryHostBaselineBytes||Object.values(wave.resourcePlan.entryHostBaselineBytes).some(n=>!Number.isSafeInteger(n)||n<0))throw Error('Invalid exact resource plan');
 if(!Array.isArray(rows)||rows.length!==wave.subjectCount||new Set(rows.map(r=>r.recordId)).size!==rows.length)throw Error('Exact supplied subject manifest mismatch');
 for(const ids of [wave.selectedRecordIds,wave.entryRecordIds])if(!Array.isArray(ids)||new Set(ids).size!==ids.length||ids.some(id=>!rows.some(r=>r.recordId===id)))throw Error('Exact supplied wave selection mismatch');
 if(!Array.isArray(wave.heldExistingUpdateRecordIds)||wave.heldExistingUpdateRecordIds.some(id=>wave.selectedRecordIds.includes(id))||wave.selectedRecordIds.some(id=>!wave.entryRecordIds.includes(id)))throw Error('Held content or entry selection conflicts with publication scope');
 return {file,wave,rows,projectionFile,capacity,waveSha256:digest(bytes)};
}
function validateAuthorization(authorization,scope){
 if(authorization.authorized!==true||!authorization.approvalReference||authorization.waveSha256!==scope.waveSha256||authorization.projectionSha256!==scope.wave.projectionSha256||!/^[a-f0-9]{64}$/.test(authorization.approvedPublicOutputDigest||''))throw Error('Real publication authorization is absent or does not bind the exact reviewed wave and public output');
 return authorization;
}
function policy(scope,env=process.env){
 const mode=env.BUILDING_RESEARCH_MODE||'preview';
 if(!['preview','public-rehearsal','authorized-publication'].includes(mode))throw Error('Unknown Building Research release mode');
 let authorization=null;
 if(mode==='authorized-publication')authorization=validateAuthorization(JSON.parse(fs.readFileSync(sibling(scope.file,scope.wave.authorizationFile))),scope);
 return {mode,publicMetadata:mode!=='preview',publicationAuthorized:Boolean(authorization),authorization};
}
function outputDigest(dir){
 const files=[];function walk(p){for(const e of fs.readdirSync(p,{withFileTypes:true}).sort((a,b)=>a.name<b.name?-1:a.name>b.name?1:0)){const target=path.join(p,e.name);if(e.isDirectory())walk(target);else files.push({path:path.relative(dir,target),sha256:digest(fs.readFileSync(target))});}}walk(dir);return digest(JSON.stringify(files));
}
function validateEntryBudget(scope,entries,registryJSON){
 const {wave,rows,capacity}=scope;
 if(entries.length!==wave.entryRecordIds.length||new Set(entries.map(r=>r.recordId)).size!==entries.length||entries.some(r=>!wave.entryRecordIds.includes(r.recordId)))throw Error('Entry registry differs from exact supplied entry subject selection');
 const newPaths=rows.filter(r=>wave.selectedRecordIds.includes(r.recordId)&&r.disposition==='proposed-new').length;
 const proposedFiles=wave.resourcePlan.baselineFiles+newPaths+new Set(wave.resourcePlan.newSharedAssetPaths).size;
 if(proposedFiles>capacity.operatingFileCeiling)throw Error('Measured file plan exceeds approved conservative operating budget');
 const bytes=Buffer.byteLength(registryJSON,'utf8');
 if(Object.values(wave.resourcePlan.entryHostBaselineBytes).some(host=>host+bytes>capacity.maxAssetBytes))throw Error('Entry host exceeds approved per-file byte budget');
 return {entries:entries.length,registryBytes:bytes,plannedFiles:proposedFiles};
}
module.exports={readScope,policy,validateAuthorization,validateEntryBudget,outputDigest,digest};
