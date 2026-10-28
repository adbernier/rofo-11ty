'use strict';
const fs=require('fs'),path=require('path');
const {readScope,validateEntryBudget}=require('../lib/building-research/release-policy');
module.exports=()=>{
 const input=process.env.BUILDING_RESEARCH_ENTRY_MANIFEST;
 if(!input)return {enabled:false};
 const waveInput=process.env.BUILDING_RESEARCH_PUBLICATION_MANIFEST||process.env.BUILDING_RESEARCH_WAVE_MANIFEST;
 if(!waveInput)throw Error('Entry integration requires an exact supplied wave manifest');
 const scope=readScope(waveInput);
 if(path.resolve(input)!==scope.projectionFile)throw Error('Entry projection is not the supplied wave subject manifest');
 const rows=scope.rows.filter(row=>scope.wave.entryRecordIds.includes(row.recordId));
 const seen=new Set(),entries=[];
 for(const row of rows){
  if(row.disposition==='held-ambiguity')continue;
  if(!['supported-existing','proposed-new'].includes(row.disposition)||!row.recordId||seen.has(row.canonicalPath)||!['san-francisco','sacramento'].includes(row.market)||!new RegExp('^/commercial-real-estate/building/CA/'+row.market+'/[a-z0-9-]+/$').test(row.canonicalPath||'')||!row.address||!row.evidence?.length)throw Error('Unvalidated Building Research entry projection');
  if(row.canonicalPath.includes('/601-townsend-st/')||row.canonicalPath.includes('/100-montgomery-st/'))throw Error('Protected Building Research entry');
  seen.add(row.canonicalPath);entries.push({recordId:row.recordId,market:row.market,address:row.presentation?.displayName||row.address,sourcePath:row.canonicalPath});
 }
 const registryJSON=JSON.stringify(entries).replace(/</g,'\\u003c').replace(/>/g,'\\u003e');
 const resourceMeasurement=validateEntryBudget(scope,entries,registryJSON);
 return {enabled:true,registryJSON,resourceMeasurement};
};
