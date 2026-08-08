const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const EOS_ADMIN = path.join(ROOT, "functions", "admin", "eos.js");
const EOS_MISSIONS = path.join(ROOT, "functions", "admin", "eos-missions.js");
const RUNTIME = path.join(ROOT, "data", "generated", "eos-admin-runtime.json");

const errors = [];

function assert(condition, message) {
  if (!condition) errors.push(message);
}

function read(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

const adminSource = read(EOS_ADMIN);
const missionSource = read(EOS_MISSIONS);
const runtime = JSON.parse(read(RUNTIME));
const intelligence = runtime.commercialKnowledgeIntelligence || {};
const markets = ((intelligence.googleOpportunity || {}).markets) || [];
const missions = intelligence.searchMissions || [];
const warehouseMission = missions.find((mission) => mission.id === "expand-warehouse-industrial-knowledge");

assert(warehouseMission, "Warehouse / Industrial parent Search Mission should exist.");
assert(/across\s+15\s+markets/i.test((warehouseMission.evidence || []).join(" ")), "Warehouse parent mission should preserve 15-market opportunity evidence.");
assert((warehouseMission.supportingMarkets || []).length < 15, "Warehouse parent mission should expose a bounded supporting-market sample, not all opportunity markets.");

assert(adminSource.includes("searchMissionOpportunityState"), "EOS admin should compute Search Mission opportunity state separately from execution mission state.");
assert(adminSource.includes("totalMarketCountForSearchMission"), "Parent opportunity state should use total market evidence.");
assert(adminSource.includes("addressedMarkets"), "Parent opportunity state should track addressed supporting markets.");
assert(adminSource.includes("active_opportunity"), "Parent Search Missions should remain active opportunities when meaningful work remains.");
assert(!adminSource.includes("completedMissionSourceIds"), "Completed durable mission source IDs should not globally complete parent Search Missions.");
assert(adminSource.includes("remainingMarkets"), "Parent opportunity presentation should expose remaining-market logic.");
assert(adminSource.includes("Active Opportunity"), "Intelligence UI should label partially addressed parent missions as Active Opportunity.");
assert(adminSource.includes("Addressed"), "Intelligence UI should retain a fully addressed terminal state.");

assert(missionSource.includes("marketFoundationMissionId"), "Market-specific mission source IDs are missing.");
assert(missionSource.includes("parseMarketFoundationMissionId"), "Market-specific mission ID parsing is missing.");
assert(missionSource.includes("createMarketFoundationMission"), "Market-specific foundation mission factory is missing.");
assert(missionSource.includes("parentMissionId"), "Market-specific missions should preserve parent opportunity relationship.");
assert(missionSource.includes("sourceContext"), "Market-specific missions should snapshot source context into the work packet.");

assert(adminSource.includes("marketOpportunityAction"), "Google Opportunity cards should derive a recommended action.");
assert(adminSource.includes("Establish Foundation"), "Market action taxonomy should include Establish Foundation.");
assert(adminSource.includes("Continue Foundation"), "Market action taxonomy should include Continue Foundation.");
assert(adminSource.includes("Deepen Knowledge"), "Market action taxonomy should include Deepen Knowledge.");
assert(adminSource.includes("Continue Strategic Market"), "Market action taxonomy should include Continue Strategic Market.");
assert(adminSource.includes("Observe"), "Market action taxonomy should include Observe.");
assert(adminSource.includes("renderMarketMissionReview"), "Market opportunity action should open a reviewable mission proposal.");
assert(adminSource.includes("marketMission"), "Market opportunity route parameter should be supported.");
assert(adminSource.includes("activeMissionBySourceId(missionState).get(sourceId)"), "Active market-specific missions should show Continue instead of duplicate Commence.");

const fortWayne = markets.find((market) => market.marketId === "fort-wayne");
const antioch = markets.find((market) => market.marketId === "antioch");
const alisoViejo = markets.find((market) => market.marketId === "aliso-viejo");
const tampa = markets.find((market) => market.marketId === "tampa");

assert(fortWayne && (fortWayne.knowledgeGaps || []).includes("industrial-warehouse-depth"), "Fort Wayne should remain an immature industrial/warehouse opportunity fixture.");
assert(fortWayne && fortWayne.knowledgeCoverage && fortWayne.knowledgeCoverage.hasMarketSnapshot === false, "Fort Wayne should remain foundation-establishment eligible.");
assert(antioch && antioch.knowledgeCoverage && antioch.knowledgeCoverage.hasMarketSnapshot === true, "Antioch should remain a partial-foundation fixture.");
assert(antioch && (antioch.knowledgeGaps || []).includes("industrial-warehouse-depth"), "Antioch should still need continued industrial foundation work.");
assert(alisoViejo && alisoViejo.strategicParent && alisoViejo.strategicParent.marketName === "Orange County", "Aliso Viejo should retain Orange County strategic-parent support.");
assert(tampa && Number(tampa.averagePosition) > 35, "Tampa should remain a weaker discovery/observe fixture.");

assert(!missionSource.includes("data/generated/search-console-opportunity.json"), "Market action generation must not import raw Search Intelligence.");
assert(!missionSource.includes("data/generated/search-intelligence-history.json"), "Market action generation must not import Search Intelligence history.");
assert(!adminSource.includes("../../data/generated/eos-analysis.json"), "EOS admin Function must continue using compact runtime data only.");

if (errors.length) {
  console.error("Search Mission continuity/action QA failed:");
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log("Search Mission continuity/action QA passed.");
console.log("Validated parent opportunity continuity, market actions, strategic quarantine, Observe state, and duplicate prevention.");
