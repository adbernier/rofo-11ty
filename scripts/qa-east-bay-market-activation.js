const publisherSnapshot = require("../data/generated/publisher-analysis.json");
const eos = require("../data/generated/eos-analysis.json");
const buildingPages = require("../_data/buildingPages.js");
const recommendationQaStatus = require("../_data/recommendationQaStatus.js");

const errors = [];

function fail(message) {
  errors.push(message);
}

function assert(condition, message) {
  if (!condition) fail(message);
}

function publisherMetro(id) {
  return (publisherSnapshot.analysis.metros || []).find((metro) => metro.metroId === id);
}

function eosMetro(id) {
  return (eos.metros || []).find((metro) => metro.metroId === id);
}

function projectedMarket(id) {
  return (((eos.marketProjection || {}).markets) || []).find((market) => market.id === id);
}

function marketProgram(market, id) {
  return ((market && market.programs) || []).find((program) => program.id === id);
}

function normalizePath(path) {
  return String(path || "").replace(/\/+$/, "/");
}

const eastBayPublisher = publisherMetro("east-bay");
const eastBayEos = eosMetro("east-bay");
const eastBayProjection = projectedMarket("east-bay");

assert(Boolean(eastBayPublisher), "East Bay must exist as a real Publisher metro record.");
assert(Boolean(eastBayEos), "East Bay must exist as a real EOS metro record.");
assert(Boolean(eastBayProjection), "East Bay must exist as a Mission Control market projection.");

if (eastBayPublisher) {
  assert(eastBayPublisher.districtCount === 8, `East Bay should measure 8 canonical districts, got ${eastBayPublisher.districtCount}.`);
  assert(eastBayPublisher.representativeBuildingCount >= 48, `East Bay should count existing representative buildings, got ${eastBayPublisher.representativeBuildingCount}.`);
  assert(eastBayPublisher.buildingBriefCount >= 26, `East Bay should count existing Building Profiles, got ${eastBayPublisher.buildingBriefCount}.`);
  assert(eastBayPublisher.overallScore > 0, `East Bay Publisher score should be independently calculated above 0, got ${eastBayPublisher.overallScore}.`);
  assert(eastBayPublisher.compassStatus === "pending-verification", `East Bay Recommendation QA should remain pending, got ${eastBayPublisher.compassStatus}.`);
}

if (eastBayEos) {
  assert(eastBayEos.overallEditorialHealth.score > 0, `East Bay EOS health should not be synthetic 0, got ${eastBayEos.overallEditorialHealth.score}.`);
  assert(eastBayEos.overallEditorialHealth.score < 78, `East Bay EOS health should remain below Denver while QA/photo/CME gaps remain, got ${eastBayEos.overallEditorialHealth.score}.`);
  assert(eastBayEos.counts && eastBayEos.counts.buildingBriefs >= 26, `East Bay EOS should count existing Building Profiles, got ${eastBayEos.counts && eastBayEos.counts.buildingBriefs}.`);
  assert(eastBayEos.counts && eastBayEos.counts.representativeBuildings >= 48, `East Bay EOS should count existing representative buildings, got ${eastBayEos.counts && eastBayEos.counts.representativeBuildings}.`);
  assert(eastBayEos.recommendationCoverage && eastBayEos.recommendationCoverage.score === 0, `East Bay Recommendation QA should remain 0 until scoped QA exists, got ${eastBayEos.recommendationCoverage && eastBayEos.recommendationCoverage.score}.`);
  assert(eastBayEos.photographyCoverage && eastBayEos.photographyCoverage.score === 0, `East Bay Photography should remain 0, got ${eastBayEos.photographyCoverage && eastBayEos.photographyCoverage.score}.`);
  assert(eastBayEos.healthSignals && eastBayEos.healthSignals.districtCoverage && eastBayEos.healthSignals.districtCoverage.score > 0, "East Bay Knowledge Graph district ownership should contribute to measurement.");
}

if (eastBayProjection) {
  assert(eastBayProjection.status && eastBayProjection.status.id !== "planning", `East Bay should no longer be the synthetic Planning market, got ${eastBayProjection.status && eastBayProjection.status.id}.`);
  assert(!(eastBayProjection.source && /Publisher-backed by San Francisco/i.test(eastBayProjection.source.publisherStatus || "")), "East Bay should no longer render as a synthetic San Francisco-backed projection.");

  const cme = marketProgram(eastBayProjection, "commercial_market_evidence");
  const profiles = marketProgram(eastBayProjection, "building_profiles");
  const qa = marketProgram(eastBayProjection, "recommendation_qa");
  const photography = marketProgram(eastBayProjection, "photography");
  const graph = marketProgram(eastBayProjection, "knowledge_graph");

  assert(cme && cme.progress && cme.progress.completed === 4 && cme.progress.target === 8, `East Bay CME should remain exactly 4 / 8, got ${cme && cme.progress && cme.progress.label}.`);
  assert(profiles && profiles.progress && profiles.progress.completed >= 26, `East Bay Building Profiles should count existing work, got ${profiles && profiles.progress && profiles.progress.completed}.`);
  assert(qa && qa.progress && qa.progress.completed === null && qa.progress.label === "0% Recommendation Coverage", `East Bay Recommendation QA should remain missing, got ${qa && qa.progress && qa.progress.label}.`);
  assert(photography && photography.status === "Missing", `East Bay Photography should remain Missing, got ${photography && photography.status}.`);
  assert(graph && graph.progress && /Knowledge Graph Coverage/.test(graph.progress.label || ""), "East Bay Knowledge Graph progress should be measured from generated state.");
}

const expansion = (((eos.platformServices || {}).commercialMarketEvidence || {}).expansion) || {};
const eastBayExistingCme = (expansion.existingCollections || []).filter((collection) => collection.metroId === "east-bay");
const eastBayMissingCme = (expansion.missingCollections || []).filter((collection) => collection.metroId === "east-bay");
const missingDistricts = eastBayMissingCme.map((collection) => collection.districtId).sort();
assert(eastBayExistingCme.length === 4, `East Bay should have 4 existing CME collections, got ${eastBayExistingCme.length}.`);
assert(eastBayMissingCme.length === 4, `East Bay should have 4 missing CME collections, got ${eastBayMissingCme.length}.`);
assert(JSON.stringify(missingDistricts) === JSON.stringify([
  "hayward-industrial",
  "jack-london-square",
  "union-city-industrial",
  "warm-springs-innovation-district",
]), `East Bay missing CME districts changed unexpectedly: ${missingDistricts.join(", ")}.`);

const haywardMission = (((eos.marketProjection || {}).missions) || []).find((mission) =>
  mission.marketId === "east-bay" &&
  mission.programId === "commercial_market_evidence" &&
  mission.districtId === "hayward-industrial"
);
assert(Boolean(haywardMission), "Hayward Industrial should remain a valid future East Bay evidence mission.");

const sanFrancisco = publisherMetro("san-francisco");
const denver = publisherMetro("denver");
assert(sanFrancisco && sanFrancisco.overallScore === 96 && sanFrancisco.readinessStatus === "Distribution Ready", "San Francisco Publisher readiness should remain stable.");
assert(denver && denver.overallScore >= 96 && denver.readinessStatus === "Distribution Ready", "Denver Publisher readiness should remain stable.");

assert(!Object.prototype.hasOwnProperty.call(recommendationQaStatus, "east-bay"), "East Bay activation must not fabricate Recommendation QA status.");

const seenPaths = new Set();
for (const building of Array.isArray(buildingPages) ? buildingPages : []) {
  const path = normalizePath(building.building_path || building.path);
  if (!path) continue;
  assert(!seenPaths.has(path), `Duplicate Building Profile path detected: ${path}.`);
  seenPaths.add(path);
}

if (errors.length) {
  console.error("East Bay market activation QA failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("East Bay market activation QA passed.");
