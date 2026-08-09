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
const topicIntelligence = intelligence.topicIntelligence || intelligence.emergingThemes || [];

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
assert(adminSource.includes("missionMarketThemeSupport"), "Market actions should require market-level theme support before inheriting a parent Search Mission.");
assert(adminSource.includes("topicMarketEvidence"), "Market actions should use compact topic evidence instead of global mission rank alone.");
assert(adminSource.includes("searchMissionThemeIds"), "Market actions should align parent missions to their actual themes.");
assert(adminSource.includes("!parent && (market.googleOpportunity === \"discovery\" || weakPosition)"), "Weak position should affect urgency only after parent theme support is evaluated.");
assert(adminSource.includes("market.propertyTypeDemand"), "Fallback market actions should use market-level property-type demand when available.");
assert(adminSource.includes("Number(count) >= 3"), "Fallback property-type actions should require a material market-level property signal.");
assert(adminSource.includes("index < 3 || Number(theme.count) >= 5"), "Lower-order property themes should not automatically override broad market actions.");
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
const oceanside = markets.find((market) => market.marketId === "oceanside");
const salinas = markets.find((market) => market.marketId === "salinas");
const alisoViejo = markets.find((market) => market.marketId === "aliso-viejo");
const tampa = markets.find((market) => market.marketId === "tampa");
const warehouseTopic = topicIntelligence.find((topic) => topic.id === "warehouse");
const industrialTopic = topicIntelligence.find((topic) => topic.id === "industrial");

assert(fortWayne && (fortWayne.knowledgeGaps || []).includes("industrial-warehouse-depth"), "Fort Wayne should remain an immature industrial/warehouse opportunity fixture.");
assert(fortWayne && fortWayne.knowledgeCoverage && fortWayne.knowledgeCoverage.hasMarketSnapshot === true, "Fort Wayne should retain its completed foundation snapshot and remain eligible for continued industrial depth work.");
assert(warehouseTopic && (warehouseTopic.strongestMarkets || []).some((market) => market.marketId === "fort-wayne"), "Fort Wayne should retain market-level warehouse topic evidence.");
assert(antioch && antioch.knowledgeCoverage && antioch.knowledgeCoverage.hasMarketSnapshot === true, "Antioch should remain a partial-foundation fixture.");
assert(antioch && (antioch.knowledgeGaps || []).includes("industrial-warehouse-depth"), "Antioch should still need continued industrial foundation work.");
assert(industrialTopic && (industrialTopic.strongestMarkets || []).some((market) => market.marketId === "antioch"), "Antioch should retain market-level industrial topic evidence.");
assert(salinas && (salinas.dominantThemes || []).some((theme) => theme.id === "retail"), "Salinas should retain market-level retail evidence for retail action derivation.");
assert(oceanside && (oceanside.dominantThemes || []).some((theme) => theme.id === "district-neighborhood"), "Oceanside should retain district/general market evidence.");
assert(oceanside && !(warehouseTopic.strongestMarkets || []).some((market) => market.marketId === "oceanside"), "Oceanside must not inherit warehouse action from the global warehouse mission without market-level warehouse support.");
assert(oceanside && !(industrialTopic.strongestMarkets || []).some((market) => market.marketId === "oceanside"), "Oceanside must not inherit industrial action from the global industrial mission without material topic support.");
assert(oceanside && !Object.values(oceanside.propertyTypeDemand || {}).some((count) => Number(count) >= 3), "Oceanside should remain below fallback property-type action threshold.");
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
