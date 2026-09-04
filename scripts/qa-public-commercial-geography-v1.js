"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const contract = require("../lib/public-commercial-geography/public-commercial-geography-v1");

const root = path.resolve(__dirname,"..");
const dir = path.join(root,"data/internal/public-commercial-geography-v1");
const read = name => JSON.parse(fs.readFileSync(path.join(dir,name),"utf8"));
const index = read("index.json");
const coverage = read("market-coverage.json");
const detailed = ["san-francisco","sacramento","indianapolis","phoenix","denver"].map(id=>read(`${id}.json`));

assert.deepStrictEqual(index.hierarchy,["CITY","SPACE_TYPE","COMMERCIAL_GEOGRAPHY","REPRESENTATIVE_PROPERTY_OR_ENVIRONMENT","LOCATION_INTELLIGENCE"]);
assert.strictEqual(index.primaryCityDecision,"SPACE_TYPE");
assert.strictEqual(coverage.markets.length,50);
assert.strictEqual(coverage.markets.reduce((n,m)=>n+m.coverage.length,0),200);
contract.validateFoundation(detailed);

const sf = detailed.find(m=>m.marketId === "san-francisco");
const sets = Object.fromEntries(contract.SPACE_TYPES.map(type=>[type,sf.geographies.filter(g=>g.spaceTypes.some(r=>r.spaceType===type && r.applicability!=="NOT_APPLICABLE")).map(g=>g.id).sort()]));
assert.notDeepStrictEqual(sets.office,sets.retail);
assert.notDeepStrictEqual(sets.office,sets.industrial);
assert.notDeepStrictEqual(sets.industrial,sets.flex);

for (const market of detailed) for (const geography of market.geographies) {
  assert.strictEqual(geography.parentCityId,market.marketId);
  assert.ok(geography.municipality);
  for (const relationship of geography.spaceTypes) {
    for (const pattern of relationship.areaPatterns) {
      assert.strictEqual(pattern.scope,"AREA_PATTERN");
      assert.ok(!Object.hasOwn(pattern,"propertyVerifiedUse"));
    }
  }
  for (const representative of geography.representatives) {
    assert.strictEqual(representative.availabilityBoundary,"NO_AVAILABILITY_SEMANTICS");
    assert.ok(["PROPERTY","ENVIRONMENT"].includes(representative.kind));
    if (representative.kind === "PROPERTY") assert.ok(representative.durablePropertyId);
  }
}

const sac = detailed.find(m=>m.marketId === "sacramento");
assert.ok(sac.geographies.every(g=>g.municipality === "Sacramento"));
assert.ok(!JSON.stringify(sac).includes("3100 Ramco"));
const indy = detailed.find(m=>m.marketId === "indianapolis");
assert.ok(!JSON.stringify(indy).includes("558 Airtech"));
const phoenix = detailed.find(m=>m.marketId === "phoenix");
assert.ok(phoenix.geographies.every(g=>g.municipality === "Phoenix"));

const internalCells = coverage.markets.filter(m=>!detailed.some(d=>d.marketId===m.marketId)).flatMap(m=>m.coverage);
assert.ok(internalCells.every(c=>c.publicReviewedCount===0 && c.publicContextualCount===0));
assert.strictEqual(read("growth-opportunities.json").opportunities.length,25);
assert.strictEqual(index.scope,"INTERNAL_FOUNDATION_NO_PUBLIC_BEHAVIOR");

const forbidden = ["availability","askingRent","brokerContact","tenantOccupancy","clearHeight","powerCapacity"];
for (const market of detailed) for (const key of forbidden) assert.ok(!Object.hasOwn(market,key));
const trackedPublicRoots = ["pages","_includes","_data"].map(name=>path.join(root,name));
for (const publicRoot of trackedPublicRoots) assert.ok(!fs.existsSync(path.join(publicRoot,"public-commercial-geography-v1.json")));

console.log("Public Commercial Geography Foundation v1 QA passed: 50 markets, 200 cells, five detailed market foundations, no public generation.");
