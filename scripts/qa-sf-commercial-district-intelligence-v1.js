"use strict";
const assert=require("assert"),fs=require("fs"),path=require("path");
const root=path.resolve(__dirname,".."),dir=path.join(root,"data/internal/sf-commercial-district-intelligence-v1");
const read=name=>JSON.parse(fs.readFileSync(path.join(dir,name),"utf8"));
const sources=read("sources.json").sources, sourceIds=new Set(sources.map(item=>item.id));
const coverage=read("coverage-review.json");
assert.strictEqual(coverage.totalNewRelationships,8);
assert.deepStrictEqual(coverage.office.add,["south-beach","civic-center","presidio"]);
assert.deepStrictEqual(coverage.retail.add,["fillmore-street","sacramento-street","upper-market-castro","north-beach","chinatown"]);
assert.deepStrictEqual(coverage.industrial.add,[]);
assert.deepStrictEqual(coverage.flex.add,[]);
const all=[];
for(const type of ["office","retail","industrial","flex"]){
  const file=read(`${type}.json`);
  for(const district of file.districts){
    all.push(district);
    assert.ok(["PUBLIC_REVIEWED","PUBLIC_CONTEXTUAL"].includes(district.publicEvidenceTier));
    assert.ok(["PRIMARY","SECONDARY","CONTEXTUAL"].includes(district.applicability));
    assert.ok(district.oneLineDistinction.split(/\s+/).length>=5 && district.oneLineDistinction.split(/\s+/).length<=12);
    assert.ok(district.shortDescription.split(/\s+/).length>=45 && district.shortDescription.split(/\s+/).length<=90,`${type}:${district.id} description length`);
    assert.ok(district.commonHere.length>=2 && district.commonHere.length<=5);
    assert.ok(district.whatStandsOut.length>=2 && district.whatStandsOut.length<=4);
    assert.ok(district.worthKnowing.length>=1 && district.worthKnowing.length<=3);
    assert.ok(district.compareWith.length>=2 && district.compareWith.length<=4);
    assert.ok(district.sourceIds.length>=2 && district.sourceIds.every(id=>sourceIds.has(id)),`${type}:${district.id} provenance`);
    assert.ok(!Object.hasOwn(district,"availability"));
    assert.ok(!Object.hasOwn(district,"rent"));
    assert.ok(!/\b(cheapest|prestigious|excellent access|easy commute)\b/i.test(JSON.stringify(district)));
    assert.strictEqual(district.route,`/commercial-real-estate/CA/san-francisco/${district.id}/`);
  }
}
assert.strictEqual(all.length,38);
const manifest=read("artifact-manifest.json");
assert.ok(manifest.files.every(item=>item.bytes<1_000_000 && /^[a-f0-9]{64}$/.test(item.sha256)));
const runtime=fs.readFileSync(path.join(root,"_data/sfCommercialGeographyExperience.js"),"utf8");
assert.ok(runtime.includes("sf-commercial-district-intelligence-v1"));
assert.ok(!runtime.includes("sfRecommendation"));
console.log("SF Commercial District Intelligence v1 QA passed: 38 sourced relationships, 8 bounded additions, editorial distinction and availability firewall verified.");
