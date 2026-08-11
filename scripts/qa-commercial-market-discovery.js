const commercialMarketDiscovery = require("../_data/commercialMarketDiscovery");
const locationKnowledgeGraph = require("../_data/locationKnowledgeGraph");
const recommendationQaStatus = require("../_data/recommendationQaStatus");
const publisherSnapshot = require("../data/generated/publisher-analysis.json");
const eos = require("../data/generated/eos-analysis.json");
const eosAdminRuntime = require("../data/generated/eos-admin-runtime.json");
const {
  VALID_EVIDENCE_STRENGTHS,
  VALID_COMPARISON_STATES,
  validateDiscoveryRegistry,
  buildMarketDiscoveryService,
} = require("../lib/eos/market-discovery");

const errors = [];

function fail(message) {
  errors.push(message);
}

function assert(condition, message) {
  if (!condition) fail(message);
}

function findMarket(id) {
  return (((eos.marketProjection || {}).markets) || []).find((market) => market.id === id);
}

function findProgram(market, id) {
  return ((market && market.programs) || []).find((program) => program.id === id);
}

function publisherMetro(id) {
  return (((publisherSnapshot.analysis || {}).metros) || []).find((metro) => metro.metroId === id);
}

const registryErrors = validateDiscoveryRegistry(commercialMarketDiscovery);
registryErrors.forEach(fail);

const records = commercialMarketDiscovery.records || [];
const eastBayDiscovery = records.find((record) => record.marketId === "east-bay");
assert(Boolean(eastBayDiscovery), "East Bay Market Discovery artifact must load.");

if (eastBayDiscovery) {
  assert(eastBayDiscovery.schemaVersion === "commercial-market-discovery-v1", "East Bay discovery schema must be commercial-market-discovery-v1.");
  assert(eastBayDiscovery.researchStatus === "current", "East Bay discovery must expose current research status.");
  assert(Array.isArray(eastBayDiscovery.sources) && eastBayDiscovery.sources.length >= 10, "East Bay discovery must include concise source provenance.");
  assert(Array.isArray(eastBayDiscovery.findings) && eastBayDiscovery.findings.length >= 12, "East Bay discovery must include broad commercial-market findings.");
  assert(eastBayDiscovery.nonPromotionNotice && /do not create public URLs/i.test(eastBayDiscovery.nonPromotionNotice), "Discovery artifact must state non-promotion behavior.");

  const byState = new Set();
  const byStrength = new Set();
  for (const finding of eastBayDiscovery.findings || []) {
    byStrength.add(finding.evidenceStrength);
    byState.add(finding.canonicalComparison && finding.canonicalComparison.state);
    assert(VALID_EVIDENCE_STRENGTHS.has(finding.evidenceStrength), `${finding.id} has invalid evidence strength.`);
    assert(VALID_COMPARISON_STATES.has(finding.canonicalComparison && finding.canonicalComparison.state), `${finding.id} has invalid canonical comparison state.`);
    assert(Array.isArray(finding.sourceIds) && finding.sourceIds.length > 0, `${finding.id} must include source provenance.`);
    assert(!Object.prototype.hasOwnProperty.call(finding, "publicUrl"), `${finding.id} must not create a public URL.`);
    assert(!Object.prototype.hasOwnProperty.call(finding, "recommendationRanking"), `${finding.id} must not alter recommendation behavior.`);
  }
  ["STRONG", "SUPPORTED"].forEach((strength) => assert(byStrength.has(strength), `East Bay discovery must include ${strength} evidence.`));
  ["COVERED", "PARTIAL", "MISSING", "RESEARCH_MORE"].forEach((state) => assert(byState.has(state), `East Bay discovery must include ${state} canonical comparison.`));
  assert(!byState.has("CONFLICT") || eastBayDiscovery.gapAnalysis.counts.conflict > 0, "Conflict counts must match conflict findings.");

  const gapCounts = (eastBayDiscovery.gapAnalysis || {}).counts || {};
  assert(gapCounts.totalFindings === eastBayDiscovery.findings.length, "Gap-analysis total must equal finding count.");
  assert(gapCounts.missing >= 1, "East Bay discovery should expose missing canonical gaps.");
  assert(gapCounts.partial >= 1, "East Bay discovery should expose partial canonical gaps.");
  assert(Array.isArray((eastBayDiscovery.gapAnalysis || {}).prioritizedCandidateGaps), "East Bay discovery must expose prioritized candidate gaps.");

  const discoveryOnlyPaths = JSON.stringify(eastBayDiscovery);
  [
    "/commercial-real-estate/CA/alameda/",
    "/commercial-real-estate/CA/oakland/downtown-oakland/",
    "/commercial-real-estate/CA/oakland/port-of-oakland/",
  ].forEach((path) => {
    assert(!discoveryOnlyPaths.includes(path), `Discovery must not fabricate public path ${path}.`);
  });
}

const service = buildMarketDiscoveryService({ generatedAt: "test" });
assert(service.validationStatus === "PASS", `Market Discovery service validation must pass, got ${service.validationStatus}.`);
assert(service.summary && service.summary.researchedMarkets >= 1, "Market Discovery service must summarize researched markets.");
assert(service.byMarket && service.byMarket["east-bay"], "Market Discovery service must index East Bay.");

const eastBayMarket = findMarket("east-bay");
const discoveryProgram = findProgram(eastBayMarket, "market_discovery");
assert(Boolean(discoveryProgram), "East Bay Market Workspace must expose Commercial Market Discovery.");
if (discoveryProgram) {
  assert(discoveryProgram.status === "Research Current", `East Bay discovery program should be Research Current, got ${discoveryProgram.status}.`);
  assert(discoveryProgram.progress && discoveryProgram.progress.target >= 12, "Discovery program must expose compact finding count.");
  assert(discoveryProgram.progress && discoveryProgram.progress.summary && discoveryProgram.progress.summary.missing >= 1, "Discovery program must expose compact missing-gap count.");
  assert(!discoveryProgram.nextMissionId, "Discovery program must not generate an executable mission automatically.");
}

const runtimeDiscovery = (((eosAdminRuntime.platformServices || {}).marketDiscovery) || {});
assert(runtimeDiscovery.schemaVersion === "commercial-market-discovery-service-v1", "Admin runtime must include compact Market Discovery service.");
assert(Buffer.byteLength(JSON.stringify(runtimeDiscovery), "utf8") < 50000, "Admin runtime Market Discovery summary must remain compact.");
assert(!JSON.stringify(runtimeDiscovery).includes("candidateImplementationGaps"), "Admin runtime must not include full discovery implementation-gap detail.");

const eastBayDistrictLabels = new Set((locationKnowledgeGraph || []).map((item) => item.slug || item.id).filter(Boolean));
["downtown-oakland", "port-of-oakland", "alameda-point", "walnut-creek-medical"].forEach((candidate) => {
  assert(!eastBayDistrictLabels.has(candidate), `Discovery finding ${candidate} must not be automatically promoted to canonical geography.`);
});

assert(!Object.prototype.hasOwnProperty.call(recommendationQaStatus, "east-bay"), "Discovery must not fabricate East Bay Recommendation QA.");
assert(!(((eos.marketProjection || {}).missions) || []).some((mission) => mission.programId === "market_discovery"), "Discovery must not generate executable missions automatically.");
assert(!(((eos.commercialKnowledgeIntelligence || {}).searchMissions) || []).some((mission) => /market discovery/i.test(JSON.stringify(mission))), "Search Mission output must not be changed by Market Discovery.");

const sanFrancisco = publisherMetro("san-francisco");
const denver = publisherMetro("denver");
assert(sanFrancisco && sanFrancisco.overallScore === 96, "San Francisco Publisher score must remain stable.");
assert(denver && denver.overallScore >= 96, "Denver Publisher score must remain stable.");
assert(!service.byMarket["san-francisco"], "San Francisco must not receive an unintended discovery record.");
assert(!service.byMarket.denver, "Denver must not receive an unintended discovery record.");

console.log("Commercial Market Discovery QA");
console.log(`Records: ${records.length}`);
if (eastBayDiscovery) {
  console.log(`East Bay findings: ${eastBayDiscovery.findings.length}`);
  console.log(`East Bay gap counts: ${JSON.stringify(eastBayDiscovery.gapAnalysis.counts)}`);
}
console.log(`Runtime summary size: ${Buffer.byteLength(JSON.stringify(runtimeDiscovery), "utf8")} bytes`);
console.log(`Errors: ${errors.length ? errors.join("; ") : "none"}`);

if (errors.length) {
  process.exit(1);
}
