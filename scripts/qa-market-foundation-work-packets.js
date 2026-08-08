const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const EOS_MISSIONS = path.join(ROOT, "functions", "admin", "eos-missions.js");
const EOS_ADMIN = path.join(ROOT, "functions", "admin", "eos.js");
const EOS_DOC = path.join(ROOT, "docs", "product", "eos-v3-commercial-knowledge-intelligence.md");
const RUNTIME = path.join(ROOT, "data", "generated", "eos-admin-runtime.json");

const errors = [];

function assert(condition, message) {
  if (!condition) errors.push(message);
}

function read(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function includesAll(source, values, context) {
  values.forEach((value) => {
    assert(source.includes(value), `${context} should include "${value}".`);
  });
}

const missionSource = read(EOS_MISSIONS);
const adminSource = read(EOS_ADMIN);
const docSource = read(EOS_DOC);
const runtime = JSON.parse(read(RUNTIME));
const missions = (((runtime.commercialKnowledgeIntelligence || {}).searchMissions) || []);
const warehouseMission = missions.find((mission) => mission.id === "expand-warehouse-industrial-knowledge");

assert(warehouseMission, "Warehouse / Industrial Search Mission should remain present.");
assert(!read(RUNTIME).includes("evidence-acquisition\""), "Generated runtime should not auto-persist expanded work packets.");

includesAll(missionSource, [
  "EVIDENCE_READINESS",
  "FOUNDATION_STATES",
  "assessMarketFoundation",
  "marketFoundation",
  "Acquire bounded",
  "Ready, Researchable, or Blocked",
  "Do not fabricate districts or properties to satisfy a quota.",
  "gaps deferred with researchable or blocked classification",
  "recommended next opportunity (advisory only; do not continue without a new approved packet)",
], "Search Mission work-packet generator");

includesAll(missionSource, [
  "market-overview",
  "market-snapshot",
  "district-coverage",
  "representative-buildings",
  "business-guides",
  "industrial-warehouse-depth",
], "Evidence readiness classification");

includesAll(missionSource, [
  "districts, corridors, industrial areas, business parks, submarkets, municipalities, or commercial centers",
  "Tier 1: official government",
  "Tier 2: established brokerage research",
  "Tier 3: discovery sources",
], "Market foundation source standard");

includesAll(adminSource, [
  "Foundation Assessment",
  "Evidence Standard",
  "Market Foundation",
  "Completed means scoped work delivered",
], "Mission Control presentation");

includesAll(docSource, [
  "EOS v3.4 Market Foundation and Evidence Acquisition",
  "**Ready:**",
  "**Researchable:**",
  "**Blocked:**",
  "**Unmapped:**",
  "**Foundation:**",
  "**Developed:**",
  "Candidate",
  "Source-supported",
  "Canonical",
  "`Recommended Next Opportunity` is input back to EOS. It is not authorization for Codex to continue working.",
  "Fort Wayne + Warehouse",
  "Aurora + Warehouse",
  "A truly blocked case",
], "EOS v3.4 documentation");

const supportingMarketIds = new Set((warehouseMission.supportingMarkets || []).map((market) => market.marketId));
assert(supportingMarketIds.has("aurora"), "Aurora Warehouse should remain a Search Mission supporting market fixture.");
assert(warehouseMission.knowledgeGaps.includes("industrial-warehouse-depth"), "Warehouse mission should retain industrial/warehouse-depth gap evidence.");

assert(/business-guides[\s\S]*EVIDENCE_READINESS\.blocked/.test(missionSource), "Business guides should be blocked until foundation is developed.");
assert(/gap === "district-coverage"[\s\S]*EVIDENCE_READINESS\.researchable/.test(missionSource), "District coverage should become researchable when canonical geography is immature.");
assert(/gap === "representative-buildings"[\s\S]*EVIDENCE_READINESS\.researchable/.test(missionSource), "Representative building gaps should become researchable before dependent build work.");
assert(/foundationStateForCoverage[\s\S]*FOUNDATION_STATES\.unmapped/.test(missionSource), "Immature markets should classify as unmapped.");
assert(/foundationStateForCoverage[\s\S]*FOUNDATION_STATES\.foundation/.test(missionSource), "Partially prepared markets should classify as foundation.");
assert(/foundationStateForCoverage[\s\S]*FOUNDATION_STATES\.developed/.test(missionSource), "Mature markets should classify as developed.");

assert(!missionSource.includes("data/generated/search-console-opportunity.json"), "Work-packet generation must not import raw Search Intelligence.");
assert(!missionSource.includes("data/generated/search-intelligence-history.json"), "Work-packet generation must not import Search Intelligence history.");
assert(!missionSource.includes("../../data/generated/eos-analysis.json"), "Work-packet generation must not import full EOS analysis.");

if (errors.length) {
  console.error("Market Foundation Work Packet QA failed:");
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log("Market Foundation Work Packet QA passed.");
console.log("Validated Ready / Researchable / Blocked model, foundation states, source standard, and scoped packet safeguards.");
