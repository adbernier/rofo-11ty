'use strict';
// Presentation-only registry. Source records and canonical URLs remain owned by existing data.
const neighborhoods = require('../../_data/neighborhoodPages');
const cities = require('../../_data/cities')();
const propertyLocations = require('../../data/maps/property-locations.json');
const review = require('../../data/maps/geographic-review.json');
const batchReview = require('../../data/maps/oakland-review-2026-10-19.json');
const program = require('../../data/maps/review-program.json');
const release = require('../../data/maps/review-program-release.json');
const protectedCities = new Set(['CA/san-francisco','CA/sacramento','CA/oakland']);
const normalizedName = value => String(value).toLowerCase().replace(/[^a-z0-9]/g,'');
const radians = v => v * Math.PI / 180;
function distanceKm(a,b) { const dlat=radians(a.lat-b.lat),dlon=radians(a.lon-b.lon);return 12742*Math.asin(Math.min(1,Math.sqrt(Math.sin(dlat/2)**2+Math.cos(radians(a.lat))*Math.cos(radians(b.lat))*Math.sin(dlon/2)**2))); }
function point(lat,lon) { return lat!==''&&lon!==''&&lat!=null&&lon!=null&&Number.isFinite(+lat)&&Number.isFinite(+lon)&&+lat>=18&&+lat<=72&&+lon>=-180&&+lon<=-60 ? {lat:+lat,lon:+lon}:null; }
const cityByKey = new Map(cities.map(c=>[`${c.state_abbr}/${c.slug}`,c]));
const RELEASE_CITIES = new Set([...protectedCities,...release.cities.filter(k=>program.cities[k]&&program.cities[k].readiness!=='BLOCKED')]);
const districts = neighborhoods.filter(n=>!n.noindex&&!n.prototype&&RELEASE_CITIES.has(`${n.state_abbr}/${n.city_slug}`)).map(n=>{
 const cityKey=`${n.state_abbr}/${n.city_slug}`, c=cityByKey.get(cityKey),p=point(n.centroid_lat,n.centroid_lng);
 const programRecord=protectedCities.has(cityKey)?null:program.districts[`${cityKey}/${n.slug}`];
 const batchRecord=batchReview.districts[`${cityKey}/${n.slug}`];
 const cityWide=normalizedName(n.name)===normalizedName(n.city);const reasons=[];if(cityKey==='CA/oakland'&&batchRecord?.disposition!=='READY')reasons.push(batchRecord?.reason||'No completed Oakland area review');if(review.districts[`${cityKey}/${n.slug}`]?.disposition==='HOLD')reasons.push(review.districts[`${cityKey}/${n.slug}`].reason);if(!p)reasons.push('No geographic coordinate in the published district record');
 if(!n.source_confidence)reasons.push('Coordinate provenance/confidence is not documented');
 if(p&&c&&point(c.lat,c.lng)&&distanceKm(p,{lat:+c.lat,lon:+c.lng})>50)reasons.push('Reference point is more than 50 km from parent-city reference; review ownership');
 if(!protectedCities.has(cityKey)){reasons.splice(0,reasons.length,...(programRecord?.disposition==='READY'?[]:(programRecord?.questions||[{detail:'No completed geographic review'}]).map(q=>q.detail)));}
 if(cityKey==='CA/oakland')reasons.splice(0,reasons.length,...new Set(reasons));
 return {id:n.slug,key:`${cityKey}/${n.slug}`,cityKey,name:n.name,city:n.city,state:n.state_abbr,url:n.canonical_neighborhood_path,cityUrl:c?c.path:null,point:p,source:'_data/neighborhoodPages.js',sourceQuality:n.geometry_quality,sourceConfidence:n.source_confidence||'undocumented',geometryType:programRecord?.geometryType||(cityWide?'CITY_WIDE_REFERENCE_POINT':'APPROXIMATE_REFERENCE_POINT'),locationLabel:programRecord?.locationLabel||(cityWide?'City-wide reference; not a separate district':'Approximate reference location'),status:reasons.length?'NEEDS_GEOGRAPHIC_REVIEW':'APPROXIMATE_LOCATION_READY',reasons,summary:programRecord?.mapSummary||batchRecord?.mapSummary|| (cityWide?`A city-wide reference in Rofo’s existing ${n.city} guide. This does not identify a separate district or establish the city's extent.`:n.neighborhood_intelligence?.headline||n.map_hero?.subtitle||`An existing commercial area in Rofo’s ${n.city} guide. Explore its page for building context and tradeoffs.`),propertyUrls:(n.representative_buildings||[]).map(b=>b.building_path).filter(Boolean)};
});
const districtByUrl = new Map(districts.map(d=>[d.url,d]));
const properties=propertyLocations.filter(p=>RELEASE_CITIES.has(`${p.state}/${p.citySlug}`)).map(p=>{
 const d=districtByUrl.get(p.district),reason=[];if(p.state==='CA'&&p.citySlug==='oakland'&&batchReview.properties[p.path]?.disposition!=='READY')reason.push(batchReview.properties[p.path]?.reason||'No completed independent property association review');if(review.properties[p.path]?.disposition==='HOLD')reason.push(review.properties[p.path].reason);if(!p.point)reason.push(p.reason);if(!d)reason.push('No matching existing district route');
 if(d&&p.point&&d.point&&distanceKm(p.point,d.point)>15)reason.push('Property is more than 15 km from district reference; membership needs review');
 if(p.state==='CA'&&p.citySlug==='oakland'&&reason.length)reason.splice(0,reason.length,batchReview.properties[p.path]?.reason||reason[0]);
 if(!protectedCities.has(`${p.state}/${p.citySlug}`)){const r=program.properties[p.path];reason.splice(0,reason.length,...(r?.disposition==='READY'&&d?.status==='APPROXIMATE_LOCATION_READY'?[]:(r?.questions||[{detail:'Property association has not been cleared'}]).map(q=>q.detail)));}
 return {...p,url:p.path,name:p.address,districtUrl:d?.url||null,cityUrl:cityByKey.get(`${p.state}/${p.citySlug}`)?.path||null,status:reason.length?'NEEDS_GEOGRAPHIC_REVIEW':'ADDRESS_LOCATION_READY',reasons:reason};
});
const groups=[...new Set(districts.map(d=>d.cityKey))].map(key=>{const c=cityByKey.get(key);return {key,id:key.replace('/','-'),name:c?.city||districts.find(d=>d.cityKey===key).city,url:c?.path||null,districts:districts.filter(d=>d.cityKey===key),status:c?'EXISTING_CITY_ROUTE':'PARENT_ROUTE_MISSING'};});
module.exports={districts,properties,cities:groups,point,distanceKm};
