'use strict';
const fs=require('fs'),path=require('path');
const geography=require('../maps/reviewed-geography');
const pages=require('../../_data/neighborhoodPages');
const {createEvidenceIdentity}=require('../geography/commercial-market-evidence-identity');
const districtNodes=require('../../_data/locationKnowledgeGraph');
const identity=createEvidenceIdentity({collections:require('../../_data/commercialMarketEvidence').collections||[],districts:districtNodes});
const nunjucks=require('nunjucks');
const template=new nunjucks.Environment(new nunjucks.FileSystemLoader(path.join(__dirname,'../../_includes')),{autoescape:true});
template.addFilter('dump',v=>JSON.stringify(v).replace(/</g,'\u003c').replace(/>/g,'\u003e'));
const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function ancestry(subject, decision, options={}) {
 const exists=options.exists||((url)=>{const p=path.join(__dirname,'../../_site',url,'index.html');return fs.existsSync(p)&&![...fs.readFileSync(p,'utf8').matchAll(/<meta\b[^>]*>/gi)].some(m=>/name=["']robots["']/i.test(m[0])&&/content=["'][^"']*noindex/i.test(m[0]));});
 const cities=options.cities||geography.cities;
 const city=cities.find(c=>c.key===`CA/${subject.market}`);
 if(!city||city.url!==`/commercial-real-estate/CA/${subject.market}/`||!exists('/')||!exists(city.url))throw Error('Missing canonical public city/root destination');
 const items=[{name:'Rofo',url:'/'},{name:city.name,url:city.url}];
 const relation=decision.districtRelationship;
 if(relation?.status==='verified'&&relation.recordId===subject.recordId&&relation.evidence?.length){
  const requestedPath='/commercial-real-estate/'+relation.districtKey+'/';
  const node=districtNodes.find(n=>n.path===requestedPath&&n.state==='CA'&&n.city===city.name);
  const page=pages.find(p=>p.canonical_neighborhood_path===requestedPath&&p.state_abbr==='CA'&&p.city_slug===subject.market)||(node?{canonical_neighborhood_path:node.path,state_abbr:node.state,city:node.city,city_slug:subject.market,slug:node.slug,marketId:node.marketId,operationalMarketId:node.operationalMarketId}:null);
  const resolved=page&&identity.resolveDistrictIdentity(page);
  const owner=resolved&&pages.find(p=>p.canonical_neighborhood_path===resolved.canonicalPath&&p.state_abbr==='CA'&&p.city_slug===subject.market);
  if(owner&&resolved.marketId===subject.market&&exists(resolved.canonicalPath))items.push({name:owner.name,url:resolved.canonicalPath});
 }
 const publicBuilding=decision.disposition==='supported-existing'&&new RegExp('^/commercial-real-estate/building/CA/'+subject.market+'/[a-z0-9-]+/$').test(decision.canonicalPath||'')&&exists(decision.canonicalPath);
 items.push({name:subject.address,url:publicBuilding?decision.canonicalPath:null,current:true});
 return items;
}
function breadcrumbView(items) {
 const crumbs=items.map(i=>({label:i.name,url:i.url||''}));
 const html=template.render('partials/breadcrumbs.njk',{crumbs,metadata:{siteUrl:'https://www.rofo.com'}});
 const json=JSON.parse(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/.exec(html)[1]);
 return {html,json};
}
module.exports={ancestry,breadcrumbView};
