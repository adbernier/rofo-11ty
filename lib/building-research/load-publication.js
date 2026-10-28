'use strict';
const fs=require('fs'),path=require('path'),crypto=require('crypto');
const {render}=require('./presentation');let cached,cacheKey;
const {readScope,policy}=require('./release-policy');
module.exports=()=>{
 const input=process.env.BUILDING_RESEARCH_PUBLICATION_MANIFEST;
 if(!input)return {profiles:[]};
 const scope=readScope(input),wave=scope.wave,release=policy(scope);
 if(release.publicMetadata&&(!process.env.BUILDING_RESEARCH_ENTRY_MANIFEST||path.resolve(process.env.BUILDING_RESEARCH_ENTRY_MANIFEST)!==scope.projectionFile))throw Error('Public metadata mode requires the exact scoped entry integration');
 const currentKey=scope.waveSha256+':'+release.mode;
 if(cached&&cacheKey===currentKey)return cached;
 const rows=scope.rows,selected=new Set(wave.selectedRecordIds),paths=new Set(),profiles=[];
 if(selected.size!==wave.selectedRecordIds.length)throw Error('Duplicate wave subjects');
 for(const row of rows){
  if(!selected.has(row.recordId))continue;
  if(!['supported-existing','proposed-new'].includes(row.disposition)||!new RegExp('^/commercial-real-estate/building/CA/'+row.market+'/[a-z0-9-]+/$').test(row.canonicalPath)||paths.has(row.canonicalPath)||row.canonicalPath.includes('/601-townsend-st/')||row.canonicalPath.includes('/100-montgomery-st/'))throw Error('Invalid public canonical projection');
  if(row.claims.some(c=>c.scope!=='building'||c.evidence.some(e=>!/^https:\/\//.test(e))))throw Error('Private or unqualified claim locator in public projection');
  if(/\/Users\/|\/tmp\/|file:\/\//.test(JSON.stringify(row)))throw Error('Private local path in public projection');
  paths.add(row.canonicalPath);
  const html=render(row,row,{...row.presentation,publicMetadata:release.publicMetadata,previewPath:row.canonicalPath,cityPath:'/commercial-real-estate/CA/'+row.market+'/',publicRoutes:new Set(wave.publicRoutes)});
  profiles.push({recordId:row.recordId,canonicalPath:row.canonicalPath,html});
 }
 if(profiles.length!==selected.size)throw Error('Wave subject missing from frozen projection');
 cacheKey=currentKey;return cached={profiles,publicMetadata:release.publicMetadata,newSitemapProfiles:profiles.filter(p=>rows.find(r=>r.recordId===p.recordId).disposition==='proposed-new')};
};
