const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const gate = require("../lib/recommendations/private-recommendation-readiness");
const accessFoundation = require("../_data/sfAccessFoundationV0");
const compositionFoundation = require("../_data/sfOfficeCompositionFoundation");
const sfOfficeModel = require("../_data/sfOfficeRecommendationModel");
const districtGeography = require("../_data/requirementPrototypeDistrictGeography");

const dependencies = { accessFoundation, compositionFoundation, sfOfficeModel, districtGeography };
const criterion = (dimension, raw, status = "PREFERRED") => ({ dimension, status, value: { text: Array.isArray(raw) ? "" : String(raw), number: null, boolean: null, list: Array.isArray(raw) ? raw : [] } });
function requirement(id, business, origins, clients, transit, parking, propertyType = "office", market = "san-francisco", candidateDistrictIds = []) {
  return { id, propertyTypes: [propertyType], locationLogic: { marketAnchor: { marketId: market, geographyId: market, displayName: market }, specificPreference: { candidateDistrictIds, candidateDistrictNames: candidateDistrictIds, informalText: "" } }, businessContext: { summary: business }, criteria: [criterion("universal.location.employee_origins", origins), criterion("office.access.client_visits", clients), criterion("universal.access.transit_importance", transit), criterion("universal.access.parking_importance", parking)] };
}

const fixtures = {
  conventional: requirement("readiness-conventional", "Accounting / professional services", ["San Francisco", "East Bay"], "Clients visit frequently", "Public transit is very important", "Convenient parking is helpful"),
  marin: requirement("readiness-marin", "Ordinary Office", ["San Francisco", "Marin / North Bay"], "Clients rarely or never visit", "Public transit is helpful", "Convenient parking is very important"),
  architecture: requirement("readiness-architecture", "Architecture / design firm", ["San Francisco"], "Clients rarely or never visit", "Public transit is helpful", "Convenient parking is helpful"),
  medical: requirement("readiness-medical", "medical private practice", ["Marin / North Bay"], "Patients visit regularly", "Public transit is not important", "Convenient parking is very important", "medical"),
  unsupported: requirement("readiness-unsupported", "Accounting firm", ["Local"], "Clients visit regularly", "Public transit is helpful", "Convenient parking is helpful", "office", "fort-wayne"),
};
const results = Object.fromEntries(Object.entries(fixtures).map(([id, value]) => [id, gate.evaluateRecommendationReadiness(value, dependencies)]));

assert.equal(results.conventional.readiness, gate.READINESS.FULL);
assert.equal(results.conventional.candidateComposition.shortlistDeferred, true, "Plausible-universe evaluation must precede shortlist materialization.");
assert.deepEqual(results.conventional.candidateComposition.shortlist, []);
assert(results.conventional.evaluated.length >= 3);
assert.equal(results.conventional.blockedByIntelligenceGap.length, 0);
assert.equal(results.marin.readiness, gate.READINESS.FULL);
assert(results.marin.plausibleCandidateUniverse.some((item) => item.districtId === "presidio"));
assert.equal(results.marin.blockedByIntelligenceGap.length, 0);
assert(results.marin.shortlist.length > 0);
assert(results.marin.shortlist.every((item) => !results.marin.blockedByIntelligenceGap.some((blocked) => blocked.districtId === item.districtId)), "A blocked district must not survive into a shortlist.");
assert.equal(results.architecture.readiness, gate.READINESS.FULL);
for (const id of ["showplace-square", "potrero-hill"]) assert(results.architecture.plausibleCandidateUniverse.some((item) => item.districtId === id));
assert.equal(results.medical.readiness, gate.READINESS.INVESTIGATE);
assert.equal(results.medical.shortlist.length, 0);
assert.equal(results.medical.productResponse.showShortlist, false);
assert(results.medical.blockedByIntelligenceGap.length > 0);
assert(results.medical.plausibleCandidateUniverse.every((item) => item.dimensions.propertyTypeFit.status === "UNKNOWN"));
assert(results.medical.plausibleCandidateUniverse.every((item) => item.dimensions.businessEnvironment.status === "NOT_APPLICABLE"));
assert.equal(results.unsupported.readiness, gate.READINESS.INVESTIGATE);
assert.equal(results.unsupported.shortlist.length, 0);

for (const result of Object.values(results)) {
  assert.equal(result.diagnostics.rule.includes("percentage"), true);
  assert.equal(result.plausibleCandidateUniverse.length, result.evaluated.length + result.partiallyEvaluated.length + result.blockedByIntelligenceGap.length + result.ineligible.length);
  result.intelligenceGaps.forEach((gap) => ["market", "propertyType", "district", "intelligenceDimension", "requirementSignal", "materiality", "blockStatus", "reason", "observedAt"].forEach((field) => assert(Object.hasOwn(gap, field), `Gap missing ${field}`)));
}

const requested = requirement("candidate-neutrality", "Accounting / professional services", ["San Francisco", "East Bay"], "Clients visit frequently", "Public transit is very important", "Convenient parking is helpful", "office", "san-francisco", ["potrero-hill"]);
const requestedResult = gate.evaluateRecommendationReadiness(requested, dependencies);
assert.equal(requestedResult.composition.considered.find((item) => item.districtId === "potrero-hill").candidatePreference, true);
assert.equal(requestedResult.composition.rawConsidered.find((item) => item.districtId === "potrero-hill").eligibilitySource, "NOT_ELIGIBLE", "Candidate preference must not create recommendation eligibility.");

// Exercise the browser UMD branch without CommonJS's eagerly loaded optional composers.
const browserSource = fs.readFileSync(require.resolve("../lib/recommendations/private-recommendation-readiness"), "utf8");
function browserGate(optionalGlobals = {}) {
  const context = vm.createContext({ RofoPrivateLocationComposition: require("../lib/recommendations/private-location-composition"), ...optionalGlobals });
  vm.runInContext(browserSource, context);
  return context.RofoPrivateRecommendationReadiness;
}
const regionalCases = [
  ["northOrangeCounty", "NorthOrangeCounty", "north-orange-county", "orange-county", "Anaheim", "CA"],
  ["phoenix", "Phoenix", "phoenix", "phoenix", "Phoenix", "AZ"],
  ["indianapolis", "Indianapolis", "indianapolis", "indianapolis", "Indianapolis", "IN"],
  ["sacramento", "Sacramento", "sacramento", "sacramento", "Sacramento", "CA"],
].map(([key, globalName, slug, market, city, state]) => {
  const input = requirement(`browser-${slug}`, "Warehouse and distribution business", [], "", "", "", "industrial_flex", market);
  input.activities = ["store", "receive", "ship_distribute"];
  Object.assign(input.locationLogic.marketAnchor, { city, state });
  return { key, globalName: `Rofo${globalName}IndustrialFlexLocationComposition`, slug, input };
});
const noOptionalComposers = browserGate();
const disabledFlags = Object.fromEntries(regionalCases.map(({ key }) => [`${key}IndustrialFlexEnabled`, false]));
const plain = value => JSON.parse(JSON.stringify(value));
for (const flags of [{}, disabledFlags]) {
  for (const input of [fixtures.conventional, ...regionalCases.map(item => item.input)]) {
    const deps = { ...dependencies, ...flags };
    const actual = noOptionalComposers.evaluateRecommendationReadiness(input, deps);
    assert.deepEqual(plain(actual), plain(gate.evaluateRecommendationReadiness(input, deps)), `${input.id}: omitted/disabled optional composers must not change readiness`);
  }
}
for (const { key, globalName, slug, input } of regionalCases) {
  const enabledDependencies = {
    ...dependencies, ...disabledFlags,
    [`${key}IndustrialFlexEnabled`]: true,
    [`${key}IndustrialFlexFoundation`]: require(`../_data/${key}IndustrialFlexEvidenceFoundation`),
  };
  // Only this market's optional global exists; disabled neighbors must never be read.
  const enabledBrowser = browserGate({ [globalName]: require(`../lib/recommendations/${slug}-industrial-flex-location-composition`) });
  const actual = enabledBrowser.evaluateRecommendationReadiness(input, enabledDependencies);
  assert.notEqual(actual.readiness, gate.READINESS.INVESTIGATE, `${slug}: enabled market unexpectedly abstained`);
  assert(actual.shortlist.length > 0, `${slug}: enabled market lost its shortlist`);
  assert.deepEqual(plain(actual), plain(gate.evaluateRecommendationReadiness(input, enabledDependencies)), `${slug}: browser/server recommendation parity changed`);
}

// Run the real interview debug functions: the public interview also renders this hidden panel.
const interviewSource = fs.readFileSync(require.resolve("../js/requirement-prototype.js"), "utf8");
const debugStart = interviewSource.indexOf("  function renderCompositionDebug() {");
const debugEnd = interviewSource.indexOf("  function renderScenarios() {", debugStart);
assert(debugStart >= 0 && debugEnd > debugStart, "Interview debug functions must be covered");
function debugNode(tag, className, textContent) {
  return { textContent, children: [], append(...items) { this.children.push(...items); }, replaceChildren() { this.children = []; } };
}
for (const input of [fixtures.conventional, regionalCases.find(item => item.key === "phoenix").input]) {
  const elements = { "composition-debug": debugNode(), "debug-meta": debugNode(), "debug-json": debugNode() };
  const context = vm.createContext({
    elements, node: debugNode, state: { interview: { requirement: input } },
    interviewDebug: interview => interview, renderCoverage() {}, renderAccessShadow() {},
    recommendationReadiness: () => noOptionalComposers.evaluateRecommendationReadiness(input, dependencies),
  });
  assert.doesNotThrow(() => vm.runInContext(`${interviewSource.slice(debugStart, debugEnd)}\nrenderDebug();`, context), `${input.id}: public interview debug rendering must not throw`);
  assert(elements["composition-debug"].children.some(item => item.textContent.startsWith("Recommendation readiness:")), `${input.id}: composition debug did not render`);
}

console.log("Private Recommendation Readiness QA passed, including browser optional globals, enabled-market parity, and SF/Phoenix interview debug rendering.");
for (const [id, result] of Object.entries(results)) console.log(`${id}: ${result.readiness}; plausible=${result.diagnostics.counts.plausible}; evaluated=${result.diagnostics.counts.evaluated}; partial=${result.diagnostics.counts.partial}; blocked=${result.diagnostics.counts.blocked}; ineligible=${result.diagnostics.counts.ineligible}`);

module.exports = { fixtures, results };
