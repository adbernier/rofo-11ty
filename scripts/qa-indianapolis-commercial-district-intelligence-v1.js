"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),crypto=require("node:crypto");
const root=path.resolve(__dirname,"..");
const source=require("./indianapolis-commercial-district-intelligence/indianapolis-commercial-district-intelligence-v1-source");
const experience=require("../_data/indianapolisCommercialGeographyExperience");
assert.equal(source.totalNewRelationships,8);
assert.equal(Object.values(source.spaceTypes).flat().length,12);
assert.deepEqual(Object.fromEntries(Object.entries(source.spaceTypes).map(([k,v])=>[k,v.length])),{office:2,retail:5,industrial:3,flex:2});
const allowedTiers=new Set(["PUBLIC_REVIEWED","PUBLIC_CONTEXTUAL"]),allowedApps=new Set(["PRIMARY","SECONDARY","CONTEXTUAL"]);
const sourceIds=new Set(source.sources.map(item=>item.id)),distinctions=[];
for(const [type,districts] of Object.entries(source.spaceTypes)) for(const d of districts){
  assert.equal(d.municipality,"Indianapolis"); assert.equal(d.state,"IN"); assert(allowedTiers.has(d.publicEvidenceTier)); assert(allowedApps.has(d.applicability));
  assert(d.oneLineDistinction.split(/\s+/).length>=5&&d.oneLineDistinction.split(/\s+/).length<=12,`${type}/${d.id} distinction`);
  const words=d.shortDescription.split(/\s+/).length; assert(words>=48&&words<=95,`${type}/${d.id} description ${words}`);
  assert(d.commonHere.length>=2&&d.commonHere.length<=5); assert(d.whatStandsOut.length>=2&&d.whatStandsOut.length<=4); assert(d.worthKnowing.length>=1&&d.worthKnowing.length<=3); assert(d.compareWith.length>=1&&d.compareWith.length<=4); assert(d.sourceIds.length);
  d.sourceIds.forEach(id=>assert(sourceIds.has(id),`${type}/${d.id} unknown source ${id}`)); distinctions.push(d.oneLineDistinction);
  assert(!/best commute|great freeway access|excellent logistics access|lower rent|available now|current vacancy|broker|tenant information/i.test(`${d.oneLineDistinction} ${d.shortDescription} ${d.whatStandsOut.join(" ")}`));
}
assert.equal(new Set(distinctions).size,distinctions.length,"one-line distinctions must not repeat");
assert.deepEqual(source.coverage.office.add,["downtown-indianapolis","north-meridian-keystone-office"]);
assert.deepEqual(source.coverage.retail.add,["mass-ave","fountain-square","broad-ripple","downtown-indianapolis","keystone-at-the-crossing"]);
assert.deepEqual(source.coverage.industrial.add,["park-fletcher-stout-field"]); assert.deepEqual(source.coverage.flex.add,[]);
for(const excluded of ["plainfield","carmel","fishers","greenwood","brownsburg","whitestown","lebanon","avon","zionsville"]) assert(!experience.byGeographyId[excluded]);
assert(!JSON.stringify(experience).includes("558 Airtech"));
assert.equal(experience.bySpaceType.office.geographies.length,2); assert.equal(experience.bySpaceType.retail.geographies.length,5); assert.equal(experience.bySpaceType.industrial.geographies.length,3); assert.equal(experience.bySpaceType.flex.geographies.length,2);
assert.equal(experience.bySpaceType.industrial.geographies.find(g=>g.id==="park-fletcher-stout-field").evidenceTier,"PUBLIC_CONTEXTUAL");
assert.equal(experience.bySpaceType.industrial.geographies.find(g=>g.id==="park-fletcher-stout-field").canonicalPath,null);
assert.equal(experience.bySpaceType.office.geographies.flatMap(g=>g.representatives).length,0); assert.equal(experience.bySpaceType.retail.geographies.flatMap(g=>g.representatives).length,0);
assert.deepEqual(experience.bySpaceType.industrial.geographies.flatMap(g=>g.representatives).map(r=>r.name).sort(),["4557 W Bradbury Avenue","7601 Winton Drive","Park 100 Multi-Tenant Industrial/Flex Environment","Park Fletcher / Stout Field Industrial Environment"].sort());
assert.equal(experience.bySpaceType.industrial.geographies.find(g=>g.id==="park-fletcher-stout-field").representatives.length,0);
for(const type of Object.keys(source.spaceTypes)){const artifact=JSON.parse(fs.readFileSync(path.join(root,`data/internal/indianapolis-commercial-district-intelligence-v1/${type}.json`)));assert.deepEqual(artifact.districts,source.spaceTypes[type]);}
const manifest=JSON.parse(fs.readFileSync(path.join(root,"data/internal/indianapolis-commercial-district-intelligence-v1/artifact-manifest.json")));
for(const item of manifest.artifacts){const b=fs.readFileSync(path.join(root,"data/internal/indianapolis-commercial-district-intelligence-v1",item.file));assert.equal(b.length,item.bytes);assert.equal(crypto.createHash("sha256").update(b).digest("hex"),item.sha256);}
const templates=["city.njk","pages/space-type.njk","pages/commercial-real-estate/neighborhood.njk","_includes/partials/space-type/sf-commercial-geography-experience.njk"].map(file=>fs.readFileSync(path.join(root,file),"utf8")).join("\n");
for(const term of ["Common here","What stands out","Worth knowing","Example buildings","location_intelligence_cta_clicked"]) assert(templates.includes(term));
assert(fs.readFileSync(path.join(root,"_data/spaceTypePages.js"),"utf8").includes("indianapolisCommercialGeographyExperience"));
const indyPages=require("../_data/spaceTypePages").filter(page=>page.city_slug==="indianapolis"&&page.publicCommercialGeography);
assert.deepEqual(indyPages.map(page=>page.page_slug).sort(),["flex-space","industrial-space","office-space","retail-space"]);
assert(!indyPages.flatMap(page=>page.representativeBuildings).some(building=>building.building_slug==="558-airtech-parkway"));
assert(fs.readFileSync(path.join(root,"pages/space-type.njk"),"utf8").includes('city.slug == "indianapolis"'));
assert(!/indianapolisCommercialGeographyExperience[\s\S]{0,500}(candidate universe|recommendation ordering|activationEligible)/i.test(fs.readFileSync(path.join(root,"_data/spaceTypePages.js"),"utf8")));
console.log("Indianapolis Commercial District Intelligence v1 QA passed: 12 sourced relationships, 8 bounded additions, City ownership, Plainfield exclusion, RI separation, routes, representatives, and availability firewall verified.");
