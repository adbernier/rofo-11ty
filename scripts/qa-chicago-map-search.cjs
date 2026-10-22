/* Run with: node --experimental-vm-modules scripts/qa-chicago-map-search.cjs */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),os=require('node:os');
const {webcrypto}=require('node:crypto');
const root=path.resolve(__dirname,'..');
function moduleLoader(){
 const cache=new Map(),context=vm.createContext({console,crypto:webcrypto,URL,URLSearchParams,Request,Response,Headers,TextEncoder,TextDecoder,structuredClone,setTimeout,clearTimeout,fetch:()=>{throw Error('Outbound requests prohibited in local QA');}});
 function get(file){
  file=path.resolve(file);if(cache.has(file))return cache.get(file);
  const source=fs.readFileSync(file,'utf8');let result;
  if(file.endsWith('.json')||(!/^import |^export /m.test(source)&&/module\.exports/.test(source))){
   const data=file.endsWith('.json')?JSON.parse(source):require(file),keys=[...new Set(['default',...Object.keys(data)])];
   result=new vm.SyntheticModule(keys,function(){for(const key of keys)this.setExport(key,key==='default'?data:data[key]);},{context,identifier:file});
  }else result=new vm.SourceTextModule(source,{context,identifier:file});
  cache.set(file,result);return result;
 }
 return async file=>{const m=get(path.join(root,file));if(m.status==='unlinked')await m.link((spec,from)=>get(path.resolve(path.dirname(from.identifier),spec)));if(m.status==='linked')await m.evaluate();return m.namespace;};
}
module.exports={moduleLoader};
async function run(){
 const pilot=require('../_data/chicagoMapSearch'),base=require('../data/maps/generated-manifest.json').byCityPath['/commercial-real-estate/IL/chicago/'];
 assert.equal(pilot.items.length,16);assert.equal(pilot.unmapped.length,17);
 for(let i=0;i<16;i++)for(const key of ['url','lat','lon','lng'])assert.equal(pilot.items[i][key],base.items[i][key]);
 assert.equal(pilot.desktop,base.desktop);assert.equal(pilot.mobile,base.mobile);
 for(const item of [...pilot.items,...pilot.unmapped]){
  const u=new URL(item.searchUrl,'http://localhost');assert.equal(u.pathname,'/best-fit-locations/');assert.equal(u.searchParams.get('districtId'),item.canonicalId);assert.equal(u.searchParams.get('source'),'city');assert.equal(u.searchParams.get('sourcePath'),'/commercial-real-estate/IL/chicago/');assert(!u.searchParams.has('spaceType'));assert(!u.searchParams.has('propertyType'));
 }
 const profileSource=fs.readFileSync(path.join(root,'js/search-profile.js'),'utf8');
 function functionSource(name){const start=profileSource.indexOf('  function '+name+'(');assert(start>=0,name);const end=profileSource.indexOf('\n  }',start)+5;return profileSource.slice(start,end);}
 function browserContext(item){
  const sandbox={URLSearchParams,window:{location:{search:new URL(item.searchUrl,'http://localhost').search}},document:{querySelector:()=>({textContent:JSON.stringify(pilot.locations)})},cleanLocationLabel:v=>String(v||'').trim(),locationKey:v=>String(v||'').trim().toLowerCase(),normalizeQuerySpaceType:v=>v,uniqueLabels:v=>[...new Set(v)],pathConfig:{Retail:{}},locationFromRecommendationEntry:c=>({display:c.locations.map(x=>x.label).join(' / '),city:'Chicago',state:'IL'}),locationItemFromLabel:label=>({label,type:'district',city:'Chicago',state:'IL'})};
  vm.createContext(sandbox);vm.runInContext(functionSource('selectedLocationKey')+'\n'+functionSource('locationItemFromSuggestion')+'\n'+functionSource('normalizeSelectedLocations')+'\n'+functionSource('parseRecommendationEntryContext')+'\n'+functionSource('applyRecommendationEntryContext'),sandbox);
  sandbox.recommendationEntryContext=vm.runInContext('parseRecommendationEntryContext()',sandbox);
  const validQuery=sandbox.window.location.search;sandbox.window.location.search=validQuery.replace(encodeURIComponent(item.canonicalId),'chi-invalid');const invalid=vm.runInContext('parseRecommendationEntryContext()',sandbox);assert.equal(invalid.locations[0].label,'Chicago');assert.equal(invalid.chicagoMapEntry,null);sandbox.window.location.search=validQuery;
  sandbox.initial={sourceContext:{},contact:{},spaceType:'',selectedLocations:[],locationSelections:[]};
  const seeded=vm.runInContext('applyRecommendationEntryContext(initial)',sandbox);
  assert.equal(seeded.selectedLocations[0].commercialAreaId,item.canonicalId);assert.equal(seeded.selectedLocations[0].path,item.url);
  sandbox.window.location.search='';sandbox.item=seeded.selectedLocations[0];assert.equal(vm.runInContext('locationItemFromSuggestion(item)',sandbox).commercialAreaId,item.canonicalId);sandbox.window.location.search=new URL(item.searchUrl,'http://localhost').search;
  sandbox.initial={...seeded,spaceType:'Retail',size:'Under 2,500 SF',selectedLocations:[{label:'River North',type:'district',city:'Chicago',state:'IL',slug:'river-north',path:'/commercial-real-estate/IL/chicago/river-north/',commercialAreaId:'chi-river-north'}],locationSelections:['River North']};
  const restored=vm.runInContext('applyRecommendationEntryContext(initial)',sandbox);assert.equal(restored.selectedLocations[0].label,'River North');assert.equal(restored.spaceType,'Retail');assert.equal(restored.size,'Under 2,500 SF');
  sandbox.profile=seeded;sandbox.URL=URL;sandbox.location={origin:'http://localhost'};sandbox.ACQUISITION_KEY='test';
  sandbox.profileSummaryData=()=>({selectedLocations:seeded.selectedLocations,location:seeded.location,spaceType:'Retail',sizeOrPeople:'Under 2,000 sqft'});
  sandbox.safeSessionGet=()=>JSON.stringify({sourceType:'city',sourcePath:'/commercial-real-estate/IL/chicago/',landingPage:'https://www.rofo.com/commercial-real-estate/IL/chicago/'});
  sandbox.parseStoredJson=(s,f)=>s?JSON.parse(s):f;sandbox.analyticsAttribution=()=>({});sandbox.selectedLocationLabels=()=>[item.name];sandbox.recommendationModelKey=()=>'';sandbox.resolvedMarketName=()=>'Chicago';sandbox.normalizeLocationIntent=()=> 'compare';sandbox.primarySelectedValue=()=>'';sandbox.selectedFeatureValues=()=>['Foot traffic'];
  vm.runInContext(functionSource('recommendationContextData'),sandbox);
  const serialized=vm.runInContext('recommendationContextData()',sandbox);
  const recommendationsSource=fs.readFileSync(path.join(root,'js/recommendation-context.js'),'utf8');
  const extract=name=>{const a=recommendationsSource.indexOf('  function '+name+'(');return recommendationsSource.slice(a,recommendationsSource.indexOf('\n  }',a)+5);};
  const finalSandbox={serialized};vm.createContext(finalSandbox);vm.runInContext(extract('normalizeLocation')+'\n'+extract('normalizeLocationIntent')+'\n'+extract('normalizeContext'),finalSandbox);
  const normalized=vm.runInContext('normalizeContext(serialized)',finalSandbox);assert.equal(normalized.locations[0].commercialAreaId,item.canonicalId);assert.equal(normalized.acquisition.sourcePath,'/commercial-real-estate/IL/chicago/');
  return JSON.parse(JSON.stringify(normalized));
 }
 const load=moduleLoader(),brief=await load('functions/api/location-brief/_shared.js'),entry=await load('functions/best-fit-locations.js');
 const render=await load('functions/location-brief/[publicId].js');
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'rofo-chicago-brief-'));
 const kv=()=>({put:async(k,v)=>fs.writeFileSync(path.join(dir,encodeURIComponent(k)),v),get:async(k,format)=>{const p=path.join(dir,encodeURIComponent(k));if(!fs.existsSync(p))return null;const v=fs.readFileSync(p,'utf8');return format==='json'?JSON.parse(v):v;}});
 const results=[];
 for(const slug of ['west-loop','river-north','the-loop','fulton-market']){
  const item=[...pilot.items,...pilot.unmapped].find(i=>i.slug===slug),request=new Request(new URL(item.searchUrl,'http://localhost'));
  const redirect=await entry.onRequestGet({request,env:{}}),u=new URL(redirect.headers.get('location'));
  assert.equal(u.pathname,'/find-locations/');for(const key of ['city','state','district','districtId','source','sourcePath'])assert.equal(u.searchParams.get(key),new URL(request.url).searchParams.get(key));
  const selectedContext=browserContext(item);
  const input={publicId:'LB-QA'+String(results.length+1).padStart(6,'0'),id:'local-'+slug,searchProfile:selectedContext,acquisition:selectedContext.acquisition};
  const canonical=brief.canonicalizeBrief(input,request);await brief.saveLocationBrief({LOCATION_BRIEFS_KV:kv()},canonical);
  // Reopen through a new adapter instance reading persisted bytes.
  const reopened=await brief.getLocationBrief({LOCATION_BRIEFS_KV:kv()},canonical.publicId);
  assert.equal(JSON.stringify(reopened.searchProfile.locations[0]),JSON.stringify(canonical.searchProfile.locations[0]));assert.equal(reopened.searchProfile.locations[0].commercialAreaId,item.canonicalId);assert.equal(reopened.searchProfile.spaceType,'Retail');assert.equal(reopened.acquisition.sourcePath,input.acquisition.sourcePath);
  const page=await render.onRequestGet({request:new Request('http://localhost/location-brief/'+canonical.publicId),params:{publicId:canonical.publicId},env:{LOCATION_BRIEFS_KV:kv()}});assert.equal(page.status,200);assert((await page.text()).includes(item.name));
  results.push({district:item.name,canonicalId:item.canonicalId,redirect:u.pathname,fallback:u.searchParams.get('v2Fallback'),savedAndReopened:true});
 }
 const html=fs.readFileSync(path.join(root,'_site/commercial-real-estate/IL/chicago/index.html'),'utf8');
 assert(html.includes('<noscript><picture>'));assert(html.includes('Other area guides (17)'));
 assert.equal((html.match(/Explore Chicago&#39;s business areas|Explore Chicago's business areas/g)||[]).length,1);
 assert.equal((html.match(/data-map-select=/g)||[]).length,16);
 assert(html.includes('data-map-current-list'));
 assert(!html.includes('<h2>Explore Chicago areas</h2>'));
 for(const item of [...pilot.items,...pilot.unmapped])assert(html.includes(item.searchUrl.replaceAll('&','&amp;')),'Missing no-JS search link: '+item.name);
 assert(html.includes('Not shown on this map. Read the area guide.'));assert(html.includes('Geographic source records and review gaps'));
 const legacy=brief.canonicalizeBrief({publicId:'LB-QA999999',searchProfile:{locations:[{label:'SoMa',type:'district',city:'San Francisco',state:'CA',slug:'soma'}]}},new Request('http://localhost'));
 assert(!('commercialAreaId' in legacy.searchProfile.locations[0]));
 console.log(JSON.stringify({cases:results,persistentStorage:dir,otherMarketIdentityUnchanged:true,leadsSubmitted:0,outboundRequests:0},null,2));
}
if(require.main===module)run().catch(e=>{console.error(e);process.exit(1);});
