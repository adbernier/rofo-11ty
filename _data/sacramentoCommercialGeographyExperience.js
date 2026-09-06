"use strict";
const evidence=require("./sacramentoIndustrialFlexEvidenceFoundation");
const durable=require("../data/internal/durable-property-entity-pilot-v1/sacramento.json");
const editorial=Object.fromEntries(["office","retail","industrial","flex"].map(type=>[type,require(`../data/internal/sacramento-commercial-district-intelligence-v1/${type}.json`).districts]));
const labels={office:"Office",retail:"Retail",industrial:"Industrial",flex:"Flex"};
const slugs={office:"office-space",retail:"retail-space",industrial:"industrial-space",flex:"flex-space"};
const titles={office:"Explore Office Districts",retail:"Explore Retail Districts & Corridors",industrial:"Explore Industrial Districts",flex:"Explore Flex Districts"};
const intros={office:"Compare Sacramento’s civic core, mixed-use central grid, emerging River District and planned northern commercial centers.",retail:"Compare central-city dining, neighborhood storefronts and Sacramento’s distinct commercial corridors.",industrial:"Compare Sacramento’s reviewed operating districts with the River District’s transitional industrial context.",flex:"Compare industrial-led, multi-tenant and adaptive-reuse settings without assuming any building’s exact configuration."};
const typeLabels={OFFICE_DISTRICT:"Office district",INDUSTRIAL_DISTRICT:"Industrial district",RETAIL_CORRIDOR:"Retail corridor",MIXED_COMMERCIAL_DISTRICT:"Mixed commercial district",FLEX_BUSINESS_PARK_ENVIRONMENT:"Flex / business-park area"};
const entities=new Map(durable.entities.map(entity=>[entity.durablePropertyId,entity]));
function repsFor(geography,type){
  const candidate=evidence.candidates[geography.id];
  return (candidate?.representatives||[]).slice(0,3).map(rep=>{
    const entity=[...entities.values()].find(item=>item.currentCanonicalUrl===rep.path||item.representativeRelationships?.some(r=>r.geographyId===geography.id)&&item.canonicalAddress?.toLowerCase()===rep.label.toLowerCase());
    return {id:rep.id,kind:rep.kind==="COMMERCIAL_ENVIRONMENT"?"ENVIRONMENT":"PROPERTY",name:rep.label,address:rep.kind==="COMMERCIAL_ENVIRONMENT"?"":(entity?.canonicalAddress||rep.label),propertyType:labels[type],geography:geography.label,municipality:"Sacramento",canonicalUrl:rep.path||"",image:"",areaPatterns:geography.commonHere,propertyVerified:"",investigate:"",availabilityBoundary:rep.availabilitySemantics};
  });
}
const bySpaceType=Object.fromEntries(Object.keys(labels).map(type=>{
  const base=editorial[type].filter(g=>["PUBLIC_REVIEWED","PUBLIC_CONTEXTUAL"].includes(g.publicEvidenceTier)).sort((a,b)=>a.gridOrder-b.gridOrder).map(g=>({id:g.id,label:g.label,geographyType:g.geographyType,geographyTypeLabel:typeLabels[g.geographyType]||"Commercial district",evidenceTier:g.publicEvidenceTier,applicability:g.applicability,routeState:g.route?"ROUTE_READY":"COMPONENT_ONLY",canonicalPath:g.route,grid:{group:"commercial-core",order:g.gridOrder},oneLineDistinction:g.oneLineDistinction,description:g.shortDescription,commercialCharacter:g.whatStandsOut,areaPatterns:g.commonHere,whatStandsOut:g.whatStandsOut,worthKnowing:g.worthKnowing,compareWith:g.compareWith,sourceIds:g.sourceIds,orientation:[],access:g.accessReadiness==="OBJECTIVE_ACCESS_READY"?g.accessObservations:[],representatives:repsFor(g,type),investigationBoundaries:g.worthKnowing}));
  const geographies=base.map(g=>({...g,related:g.compareWith.map(id=>base.find(x=>x.id===id)).filter(Boolean).slice(0,4).map(x=>({id:x.id,label:x.label,path:x.canonicalPath}))}));
  return [type,{id:type,label:labels[type],slug:slugs[type],path:`/commercial-real-estate/CA/sacramento/${slugs[type]}/`,explorationTitle:titles[type],introduction:intros[type],geographies}];
}));
const byGeographyId={};
for(const [type,view] of Object.entries(bySpaceType)) for(const geography of view.geographies){if(!byGeographyId[geography.id])byGeographyId[geography.id]=[];byGeographyId[geography.id].push({spaceType:type,spaceTypeLabel:labels[type],spaceTypePath:view.path,...geography});}
module.exports=Object.freeze({schemaVersion:"sacramento-public-commercial-geography-experience:v1",city:{id:"sacramento",label:"Sacramento",state:"CA",path:"/commercial-real-estate/CA/sacramento/"},sourceSurfacePrefix:"sacramento",spaceTypes:Object.values(bySpaceType),bySpaceType,byGeographyId,availabilityFirewall:"Confirm current availability and the exact condition, configuration, access, and permitted use of any specific space."});
