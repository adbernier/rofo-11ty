'use strict';
const districtPath=slug=>'/commercial-real-estate/CA/san-francisco/'+slug+'/';
const buildingPath=slug=>'/commercial-real-estate/building/CA/san-francisco/'+slug+'/';
module.exports={
 enabled:process.env.SF_CITY_DISCOVERY_ENABLED==='true',
 path:'/commercial-real-estate/CA/san-francisco/',
 // Alan confirmed reuse of this exact existing asset on 4 November 2026.
 photoRightsConfirmed:true,
 photoRightsEvidence:"User confirmation Sentinel_27890afc96c481918f352bfe409e8de1: Rofo may reuse /assets/images/cities/san-francisco-ca.webp.",
 photo:{approved:true,id:'sf-city-original-street-view',src:'/assets/images/cities/san-francisco-ca.webp',width:1500,height:844,alt:'Street-level commercial buildings, sidewalks and traffic in San Francisco.',focalPosition:'50% 48%',priority:true,srcset:'/assets/images/cities/san-francisco-ca-640.webp 640w, /assets/images/cities/san-francisco-ca-960.webp 960w, /assets/images/cities/san-francisco-ca.webp 1500w',originalSHA256:'bcc5e8446622d76225d6866759b331585bce4d8b54a2fe1ee25c81ec652ffaed'},
 searchHref:'/location-requirement/?city=San%20Francisco&state=CA&source=city&sourcePath=%2Fcommercial-real-estate%2FCA%2Fsan-francisco%2F&marketId=san-francisco',
 types:[
  {name:'Office',slug:'office-space',icon:'office',description:'Compare downtown towers, converted buildings, private offices and coworking.'},
  {name:'Retail',slug:'retail-space',icon:'retail',description:'Explore neighborhood storefronts, customer destinations and practical tradeoffs.'},
  {name:'Industrial',slug:'industrial-space',icon:'industrial',description:'Start with production, storage, distribution and the way your business operates.'},
  {name:'Flex',slug:'flex-space',icon:'flex',description:'Explore space that combines office, showroom, workshop or storage needs.'}
 ],
 districts:[
  {name:'Financial District',slug:'financial-district',description:'A practical starting point for businesses that value regional transit access and a range of office settings, from traditional towers to older commercial buildings.'},
  {name:'Jackson Square',slug:'jackson-square',description:"Smaller historic buildings and quieter streets give Jackson Square a more intimate feel than the Financial District. It's worth exploring if a distinctive workplace or personal setting for client meetings matters to you."},
  {name:'SoMa',slug:'soma',description:'A broad mix of converted and conventional workplaces. Compare the individual building and block rather than assume one uniform setting.'},
  {name:'Mission Bay',slug:'mission-bay',description:'A neighborhood shaped by research, medical campuses and redevelopment. Nearby institutions do not make a particular building lab-ready.'},
  {name:'Showplace Square / Design District',slug:'showplace-square',description:'Former industrial buildings, showrooms and a different street character make Showplace Square worth considering for teams that value flexible workplace settings or nearby design-related businesses.'},
  {name:'Dogpatch',slug:'dogpatch',description:'Industrial heritage and a changing waterfront. Investigate the particular building’s permitted use, access and operating requirements.'}
 ],
 comparisons:[
  {name:'Financial District vs. SoMa',path:districtPath('financial-district-vs-soma'),description:'Compare a concentrated downtown office core with a broader mix of converted and conventional workplaces.'},
  {name:'SoMa vs. Mission Bay',path:districtPath('soma-vs-mission-bay'),description:'Compare varied office settings with a neighborhood shaped by research and medical campuses.'},
  {name:'Financial District vs. Jackson Square',path:districtPath('financial-district-vs-jackson-square'),description:'Compare downtown towers with smaller historic buildings and a different setting for client meetings.'}
 ],
 buildings:[
  {name:'The Mills Building',district:'Financial District',path:buildingPath('220-montgomery-st'),label:'Historic downtown office',description:'An alternative to a conventional tower, with historic architecture and a different workplace feel.',source:'https://themillsbuilding.com/'},
  {name:'140 New Montgomery',district:'SoMa',path:buildingPath('140-new-montgomery-st'),label:'Restored office landmark',description:'Opened in 1925 as the Telephone Building, this restored tower offers another way to compare downtown office character.',source:'https://140nm.com/'},
  {name:'American Industrial Center',district:'Dogpatch',path:buildingPath('2325-3rd-st'),label:'Industrial and creative workspace',description:'A former factory setting illustrates a different kind of commercial building. Confirm the actual space and permitted activity for your business.',source:'https://www.aicproperties.com/the-buildings'}
 ],
 resources:[
  {name:'Choosing a commercial location',slug:'choosing-the-right-commercial-location'},
  {name:'Comparing spaces and lease terms',slug:'how-to-compare-commercial-spaces'},
  {name:'Typical commercial leasing timeline',slug:'commercial-leasing-timeline'},
  {name:'How commercial brokers help',slug:'how-commercial-brokers-help'}
 ]
};
