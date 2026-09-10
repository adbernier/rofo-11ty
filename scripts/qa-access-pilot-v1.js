const assert = require("assert");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const root = path.join(process.cwd(), "data/internal/access-intelligence-v1");
const refs = require(path.join(root,"pilot-reference-points.json"));
const review = require(path.join(root,"pilot-fact-review.json"));
const selection = require(path.join(root,"pilot-public-selection.json"));
const readiness = require(path.join(root,"pilot-readiness.json"));
const sources = require(path.join(root,"pilot-source-registry.json"));
const hashes = require(path.join(root,"pilot-artifact-hashes.json"));
assert.strictEqual(refs.pilots.length, 7);
assert.strictEqual(refs.coordinatesIntroduced, 0);
assert.strictEqual(refs.numericDistanceFactsReady, 0);
const allowedMethods = new Set(refs.allowedMethods);
refs.pilots.forEach(p=>{ assert(allowedMethods.has(p.referencePoint.method)); assert.strictEqual(p.referencePoint.coordinates,null); assert.strictEqual(p.referencePoint.publicDistanceEligible,false); });
const sourceIds = new Set(sources.map(s=>s.id));
const forbidden = /\b(strong access|easy access|convenient|excellent|strategic|ideal|well connected|superior|OBJECTIVE_ACCESS_READY|SOURCE_AVAILABLE_NEEDS_REVIEW)\b/i;
for (const item of selection.selections) {
  assert(item.facts.length >= 2 && item.facts.length <= 3);
  item.facts.forEach(f=>{ assert.strictEqual(f.level,"OBJECTIVE_ACCESS_FACT"); assert.strictEqual(f.publicDistanceEligible,false); assert.strictEqual(f.personalizedConclusionEligible,false); assert(f.sourceIds.length && f.sourceIds.every(id=>sourceIds.has(id))); assert(!forbidden.test(`${f.customerLabel} ${f.customerRelationship}`)); });
}
assert(readiness.pilots.every(p=>p.classification === "READY_WITH_NON_DISTANCE_FACTS_ONLY"));
assert.deepStrictEqual(readiness.heldGeographies, []);
assert.strictEqual(review.facts.filter(f=>f.priorState === "SOURCE_AVAILABLE_NEEDS_REVIEW").length, 3);
assert.strictEqual(review.facts.filter(f=>f.disposition === "PROMOTE_TO_OBJECTIVE_ACCESS_READY").length, 1);
assert(review.facts.every(f=>!f.propertyId));
for (const entry of hashes.files) assert.strictEqual(crypto.createHash("sha256").update(fs.readFileSync(path.join(root,entry.file))).digest("hex"),entry.sha256);
const publicRoots = ["pages","_includes","assets"].filter(fs.existsSync);
for (const folder of publicRoots) {
  const result = require("child_process").spawnSync("rg",["-l","access-intelligence-pilot-review:v1",folder],{encoding:"utf8"});
  assert.strictEqual((result.stdout||"").trim(),"",`public pilot leak: ${result.stdout}`);
}
console.log("Access pilot QA passed: 7 geographies, non-distance facts only, no public adapter or personalized language.");
