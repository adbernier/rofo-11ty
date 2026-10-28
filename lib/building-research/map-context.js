'use strict';
const fs=require('fs'),path=require('path'),crypto=require('crypto');
const {renderMap}=require('../maps/render-map');
const sfModel=require('../../data/maps/generated-manifest.json').byCityPath['/commercial-real-estate/CA/san-francisco/'];
const sfRoads=require('../../data/maps/road-context/CA-san-francisco.json');
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const home=path.resolve(__dirname,'../..'),data=require('./publication-v3/map-context.json');
const roadFile=path.join(home,'data/maps/road-context/CA-sacramento.json'),roadBytes=fs.readFileSync(roadFile);
if(crypto.createHash('sha256').update(roadBytes).digest('hex')!==data.roadContextSHA256)throw Error('Reviewed map road snapshot hash changed');
const roads=JSON.parse(roadBytes),points=new Map(data.entries.map(e=>[e.recordId,e]));
if(points.size!==763||points.size!==data.entries.length)throw Error('Duplicate or missing reviewed model points');
const blue=svg=>svg.replace(/#17634d/g,'#1346d8').replace(/#285643/g,'#0d3277').replace(/#f0f2ed/g,'#f1f5f9').replace(/#f8f9f5/g,'#ffffff').replace(/#a2b8aa/g,'#d8e0ea').replace(/#d0d8d0/g,'#d8e0ea').replace(/#acb8ae/g,'#94a3b8').replace(/#bed2c2/g,'#e9eefb').replace(/#8fa69b/g,'#94a3b8').replace(/#53665b/g,'#556274').replace(/#102c24/g,'#0d3277').replace(/role="button"/g,'').replace(/tabindex="0"/g,'').replace(/aria-pressed="(?:true|false)"/g,'').replace(/\.rm-marker\[aria-pressed=true\][^{]*\{[^}]*\}/g,'').replace(/\.rm-marker:focus rect\{[^}]*\}/g,'').replace(/cursor:pointer/g,'cursor:default').replace(/aria-label="Select ([^"]+)"/g,'aria-label="Area reference $1"').replace(/ data-rofo-choice="[^"]*"/g,'').replace(/ data-map-group="[^"]*"/g,'').replace(/role="group"/,'role="img"');
function render(record){
 const entry=points.get(record.recordId);
 if(record.market==='san-francisco'){
  const map=mobile=>blue(renderMap(sfModel,sfRoads,mobile,{static:true}));
  const legend='<div class="research-map-key"><p class="meta">Area reference key · comparison links, not building district membership</p><ol>'+sfModel.items.map(item=>'<li><a href="'+esc(item.url)+'">'+esc(item.name)+'</a></li>').join('')+'</ol></div>';
  return {description:'Explore the wider San Francisco commercial area guides. The map shows reviewed area reference points, not this building’s location or district membership.',caption:'Area reference map · No building location shown.',html:`<div class="research-map-desktop">${map(false)}</div><div class="research-map-mobile">${map(true)}</div>${legend}`};
 }
 if(!entry||entry.canonicalPath!==record.canonicalPath||!record.recordId.endsWith(':'+entry.sourceRecordId)||entry.claimSourceHash!==record.claims[0].sourceHash||!Number.isFinite(entry.longitude)||!Number.isFinite(entry.latitude)||entry.longitude< -122||entry.longitude> -121||entry.latitude<38||entry.latitude>39)throw Error('Missing/conflicting approved model-point join');
 const model={title:'Approximate USA Structures model reference point for '+record.address,items:[{kind:'property',name:'Approximate model point',point:{lon:entry.longitude,lat:entry.latitude},source:entry.sourceURL}]};
 const map=mobile=>blue(renderMap(model,roads,mobile)).replace(/Locations: Rofo \/ U.S. Census/g,'Point: USA Structures / ORNL / FEMA');
 return {description:'Approximate source model reference point for this structure; not an entrance, surveyed point, parcel boundary or footprint polygon. District membership is not inferred.',caption:`USA Structures / ORNL / FEMA; distributed by Esri, CC BY 4.0. Imagery ${entry.imageryDate}; production ${entry.productionDate}. Roads: U.S. Census Bureau, reviewed snapshot ${roads.checkedOn}. County address context and source terms below.`,html:`<div class="research-map-desktop">${map(false)}</div><div class="research-map-mobile">${map(true)}</div>`};
}
module.exports={render};
