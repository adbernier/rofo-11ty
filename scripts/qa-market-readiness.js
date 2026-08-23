const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { buildMarketReadiness, WORKLOADS } = require("../lib/eos/market-readiness");

const readiness = buildMarketReadiness();
const market = (id) => readiness.markets.find((item) => item.marketId === id);
const property = (marketId, propertyType) => market(marketId).propertyTypes.find((item) => item.propertyType === propertyType);

assert.equal(readiness.schemaVersion, "mission-control-market-readiness:v1");
assert.equal(WORKLOADS.length, 7, "Mission Control must expose exactly the seven approved operational workloads.");
assert.deepEqual(readiness.statusModel, ["Not Started", "Building", "Ready", "Blocked"]);
assert.equal(readiness.markets.length, 14, "Every canonical market registry entry must appear in readiness.");

assert.equal(market("san-francisco").workloads.marketGraph.status, "Ready");
assert.equal(market("san-francisco").workloads.districtIntelligence.status, "Ready");
assert.equal(market("san-francisco").workloads.regionalAccess.status, "Ready");
assert.equal(market("san-francisco").workloads.publicExperience.status, "Building", "Presentation debt must remain independent from recommendation validity.");
assert.equal(property("san-francisco", "office").recommendation, "Ready");
assert.equal(["marketGraph", "districtIntelligence", "regionalAccess"].every((id) => market("san-francisco").workloads[id].status === "Ready"), true, "Recommendation Ready must retain its market-level hard gates.");
assert.equal(property("san-francisco", "retail").recommendation, "Building");
assert.equal(property("san-francisco", "industrial").recommendation, "Building");

for (const id of ["sacramento", "san-diego", "orange-county", "denver", "seattle"]) {
  assert.notEqual(property(id, "office").recommendation, "Ready", `${id} legacy Compass QA must not imply current vNext readiness.`);
}
assert.equal(property("denver", "office").workloads.calibration.status, "Building", "Denver's model and legacy QA should remain visible as progress.");
assert.equal(market("north-bay").workloads.marketGraph.status, "Not Started");
assert.equal(property("north-bay", "office").recommendation, "Not Started");
assert.equal(property("fort-wayne", "industrial").recommendation, "Building");
assert.equal(property("fort-wayne", "office").recommendation, "Not Started", "Space types must be evaluated independently.");

assert.equal(readiness.currentPriority.selection.label, "SF Public Experience");
assert.equal(readiness.currentPriority.selection.marketId, "san-francisco");
assert.equal(readiness.currentPriority.selection.workloadId, "public_experience");
assert.equal(market("denver").currentPriority, null, "Denver must remain Building without being presented as the human-selected priority.");
assert.equal(readiness.currentPriority.selection.note.includes("Human-selected"), true);
assert.equal(JSON.stringify(readiness).includes("priorityScore"), false, "Readiness must not contain algorithmic priority scores.");
assert.equal(JSON.stringify(readiness).includes("percent"), false, "Readiness must not introduce percentage completion.");

const adminSource = fs.readFileSync(path.join(__dirname, "..", "functions", "admin", "eos.js"), "utf8");
for (const text of ["Market Readiness", "Human-selected Current Priority", "Certification + Release", "Legacy Compass QA is evidence"]) {
  assert(adminSource.includes(text), `Mission Control is missing ${text}.`);
}
assert(adminSource.includes("renderMarketReadiness(eos)"));
assert(adminSource.includes("data-readiness-target"), "Market rows must open their workload detail.");
assert(adminSource.includes("renderMarketWorkspaceCard"), "Existing Market Workspace must remain intact.");
assert(adminSource.includes("renderCommercialKnowledgeIntelligence"), "Existing knowledge intelligence must remain intact.");

console.log("Mission Control market readiness QA passed.");
