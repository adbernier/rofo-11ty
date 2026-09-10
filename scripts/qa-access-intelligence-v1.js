const assert = require("assert");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const root = path.join(process.cwd(), "data/internal/access-intelligence-v1");
const index = require(path.join(root, "index.json"));
const contract = require(path.join(root, "contract.json"));
const sources = require(path.join(root, "source-registry.json"));
const sourceIds = new Set(sources.map(s => s.id));
assert.deepStrictEqual(index.markets.map(m=>m.id), ["san-francisco","sacramento","indianapolis","phoenix","seattle"]);
assert.strictEqual(index.totals.markets, 5);
assert(contract.prohibited.includes("access scores"));
const prohibited = /\b(best|better|excellent|great|easy commute|access score|[1-5]-star)\b/i;
let facts = 0;
for (const item of index.markets) {
  const market = require(path.join(root,item.file));
  assert(market.excludedMunicipalities.length > 0);
  for (const relationship of market.relationships) {
    assert(relationship.municipalityVerified);
    if (!relationship.referencePoint.methodAvailable) assert.strictEqual(relationship.referencePoint.method, "DESCRIPTIVE_RELATIONSHIP_ONLY");
    if (!relationship.referencePoint.coordinates) assert.strictEqual(relationship.referencePoint.distanceEligible, false);
    assert(relationship.facts.length >= 2 && relationship.facts.length <= contract.publicFactMaximum);
    for (const fact of relationship.facts) {
      facts++;
      assert.strictEqual(fact.level, "OBJECTIVE_ACCESS_FACT");
      assert(contract.categories.includes(fact.category));
      assert(contract.measurementTypes.includes(fact.measurementType));
      assert(fact.sourceIds.length && fact.sourceIds.every(id => sourceIds.has(id)));
      assert(!prohibited.test(fact.publicDisplayValue), `${fact.id} contains interpretive language`);
      assert.strictEqual(fact.rawMeasurement, null);
      assert(!fact.propertyId, `${fact.id} conflates property and geography`);
      assert(fact.propertyTypeApplicability.every(x => x.relevance !== "PRIMARY" && x.relevance !== "SECONDARY"));
    }
  }
}
assert.strictEqual(facts, index.totals.candidateFacts);
assert.strictEqual(index.totals.CONFLICTED, 0);
const manifest = require(path.join(root,"artifact-manifest.json"));
for (const entry of manifest.files) assert.strictEqual(crypto.createHash("sha256").update(fs.readFileSync(path.join(root,entry.file))).digest("hex"), entry.sha256);
const publicFiles = ["_data","pages","src","public"].filter(p => fs.existsSync(p));
for (const folder of publicFiles) {
  const result = require("child_process").spawnSync("rg", ["-l","access-intelligence:v1",folder], { encoding:"utf8" });
  const matches = (result.stdout || "").trim();
  assert.strictEqual(matches, "", `public adapter leak: ${matches}`);
}
console.log(`Access Intelligence v1 QA passed: ${facts} facts, 5 markets, no scores/personalized claims/public adapter.`);
