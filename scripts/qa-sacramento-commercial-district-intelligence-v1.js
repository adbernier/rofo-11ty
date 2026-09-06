"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),crypto=require("node:crypto");
const root=path.resolve(__dirname,"..");
const source=require("./sacramento-commercial-district-intelligence/sacramento-commercial-district-intelligence-v1-source");
const experience=require("../_data/sacramentoCommercialGeographyExperience");
assert.equal(source.totalNewRelationships,8);
assert.equal(Object.values(source.spaceTypes).flat().length,16);
assert.deepEqual(Object.fromEntries(Object.entries(source.spaceTypes).map(([k,v])=>[k,v.length])),{office:4,retail:6,industrial:3,flex:3});
const allowedTiers=new Set(["PUBLIC_REVIEWED","PUBLIC_CONTEXTUAL"]),allowedApps=new Set(["PRIMARY","SECONDARY","CONTEXTUAL"]);
for(const [type,districts] of Object.entries(source.spaceTypes)) for(const d of districts){
  assert.equal(d.municipality,"Sacramento"); assert.equal(d.state,"CA"); assert(allowedTiers.has(d.publicEvidenceTier)); assert(allowedApps.has(d.applicability));
  assert(d.oneLineDistinction.split(/\s+/).length>=5&&d.oneLineDistinction.split(/\s+/).length<=12,`${type}/${d.id} distinction length`);
  const words=d.shortDescription.split(/\s+/).length; assert(words>=48&&words<=95,`${type}/${d.id} description ${words}`);
  assert(d.commonHere.length>=2&&d.commonHere.length<=5); assert(d.whatStandsOut.length>=2&&d.whatStandsOut.length<=4); assert(d.worthKnowing.length>=1&&d.worthKnowing.length<=3); assert(d.compareWith.length>=2&&d.compareWith.length<=4); assert(d.sourceIds.length);
  assert(!/best|great access|lower rent|available now|current vacancy|broker|tenant information/i.test(`${d.oneLineDistinction} ${d.shortDescription} ${d.whatStandsOut.join(" ")}`));
}
assert.deepEqual(source.coverage.office.add,["river-district","north-natomas-office"]);
assert.deepEqual(source.coverage.retail.add,["r-street-district","broadway-corridor","stockton-boulevard","east-sacramento-j-street"]);
assert.deepEqual(source.coverage.industrial.add,["river-district"]); assert.deepEqual(source.coverage.flex.add,["river-district"]);
assert(!experience.byGeographyId["sci-ramona"]); assert(!experience.byGeographyId["west-sacramento"]); assert(!experience.byGeographyId["rancho-cordova"]);
assert.equal(experience.bySpaceType.industrial.geographies.length,3); assert.equal(experience.bySpaceType.flex.geographies.length,3);
assert.equal(experience.bySpaceType.industrial.geographies.find(g=>g.id==="northgate-north-market-industrial").canonicalPath,null);
assert.equal(experience.bySpaceType.office.geographies.flatMap(g=>g.representatives).length,0); assert.equal(experience.bySpaceType.retail.geographies.flatMap(g=>g.representatives).length,0);
assert.equal(experience.bySpaceType.industrial.geographies.flatMap(g=>g.representatives).length,4);
for(const type of Object.keys(source.spaceTypes)){const artifact=JSON.parse(fs.readFileSync(path.join(root,`data/internal/sacramento-commercial-district-intelligence-v1/${type}.json`)));assert.deepEqual(artifact.districts,source.spaceTypes[type]);}
const manifest=JSON.parse(fs.readFileSync(path.join(root,"data/internal/sacramento-commercial-district-intelligence-v1/artifact-manifest.json")));
for(const item of manifest.artifacts){const b=fs.readFileSync(path.join(root,"data/internal/sacramento-commercial-district-intelligence-v1",item.file));assert.equal(b.length,item.bytes);assert.equal(crypto.createHash("sha256").update(b).digest("hex"),item.sha256);}
const templates=["city.njk","pages/space-type.njk","_includes/partials/space-type/sf-commercial-geography-experience.njk","pages/commercial-real-estate/neighborhood.njk"].map(file=>fs.readFileSync(path.join(root,file),"utf8")).join("\n");
for(const term of ["Common here","What stands out","Worth knowing","Example buildings","location_intelligence_cta_clicked"]) assert(templates.includes(term));
assert(!/sacramentoCommercialGeographyExperience[\s\S]{0,400}(recommendation|candidate universe|ordering)/i.test(fs.readFileSync(path.join(root,"_data/spaceTypePages.js"),"utf8")));
assert(fs.readFileSync(path.join(root,"js/commercial-geography-experience.js"),"utf8").includes('[data-commercial-geography-surface$="_geography_route"]'));
console.log("Sacramento Commercial District Intelligence v1 QA passed: 16 sourced relationships, 8 bounded additions, City ownership, RI separation, routes, representatives, and availability firewall verified.");
