const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const composer = require("../lib/recommendations/private-location-composition");
const accessFoundation = require("../_data/sfAccessFoundationV0");
const compositionFoundation = require("../_data/sfOfficeCompositionFoundation");

function criterion(dimension, raw, status = "PREFERRED") {
  return { id: dimension, dimension, status, value: { text: Array.isArray(raw) ? "" : String(raw), number: null, boolean: null, list: Array.isArray(raw) ? raw : [] } };
}
function requirement(criteria, preference = {}) {
  return { id: "composition-calibration", propertyTypes: ["office"], locationLogic: { marketAnchor: { marketId: "san-francisco", geographyId: "san-francisco", displayName: "San Francisco, CA" }, specificPreference: { candidateDistrictIds: [], candidateDistrictNames: [], informalText: "", ...preference } }, businessContext: { summary: "SF Office private composition calibration" }, criteria };
}

const scenarios = {
  marin: requirement([
    criterion("universal.location.employee_origins", ["Marin / North Bay", "San Francisco"]),
    criterion("universal.access.transit_importance", "Public transit is not important", "FLEXIBLE"),
    criterion("universal.access.parking_importance", "Convenient parking is very important", "REQUIRED"),
    criterion("universal.location.customer_origins", ["San Francisco"]),
    criterion("office.access.client_visits", "Clients rarely or never visit", "FLEXIBLE"),
  ]),
  eastBay: requirement([
    criterion("universal.location.employee_origins", ["San Francisco", "East Bay"]),
    criterion("universal.location.customer_origins", ["San Francisco", "East Bay"]),
    criterion("office.access.client_visits", "Clients visit frequently", "REQUIRED"),
    criterion("universal.access.transit_importance", "Public transit is very important", "REQUIRED"),
    criterion("universal.access.parking_importance", "Parking is not important", "FLEXIBLE"),
  ]),
  mixed: requirement([
    criterion("universal.location.employee_origins", ["San Francisco", "East Bay", "Marin / North Bay"]),
    criterion("universal.location.customer_origins", ["San Francisco", "Peninsula"]),
    criterion("office.access.client_visits", "Clients visit frequently", "REQUIRED"),
    criterion("universal.access.transit_importance", "Public transit is very important", "REQUIRED"),
    criterion("universal.access.parking_importance", "Convenient parking is helpful"),
  ]),
  peninsula: requirement([
    criterion("universal.location.employee_origins", ["San Francisco", "Peninsula", "South Bay"]),
    criterion("universal.location.customer_origins", ["Peninsula", "South Bay"]),
    criterion("office.access.client_visits", "Clients visit frequently", "REQUIRED"),
    criterion("universal.access.transit_importance", "Public transit is very important", "REQUIRED"),
    criterion("universal.access.parking_importance", "Parking is not important", "FLEXIBLE"),
  ]),
};
scenarios.candidates = requirement(scenarios.eastBay.criteria, { candidateDistrictIds: ["soma", "south-beach"], candidateDistrictNames: ["SoMa", "South Beach"] });
scenarios.parkingHelpful = requirement(scenarios.marin.criteria.map((item) => item.dimension === "universal.access.parking_importance" ? criterion(item.dimension, "Convenient parking is helpful") : item));
scenarios.operatorMarin = requirement([
  criterion("universal.location.employee_origins", ["San Francisco", "Marin / North Bay"]),
  criterion("office.access.client_visits", "Clients rarely or never visit", "FLEXIBLE"),
  criterion("universal.access.transit_importance", "Public transit is helpful"),
  criterion("universal.access.parking_importance", "Convenient parking is very important", "REQUIRED"),
  criterion("office.occupancy.peak_attendance", "35"),
], { candidateDistrictIds: ["jackson-square"], candidateDistrictNames: ["Jackson Square"] });

const results = Object.fromEntries(Object.entries(scenarios).map(([id, item]) => [id, composer.composeLocationRecommendations(item, accessFoundation, compositionFoundation)]));

// Components remain explicit and bounded; no user-facing master percentage exists.
Object.values(results).forEach((result) => {
  assert.equal(result.supported, true);
  assert(result.shortlist.length > 0 && result.shortlist.length <= 3);
  result.considered.forEach((item) => {
    assert(item.office && item.environment && item.access, "Composition components must remain separate.");
    assert(!Object.hasOwn(item, "score") && !Object.hasOwn(item, "percentage") && !Object.hasOwn(item, "compatibility"));
    assert(["STRONG_FIT", "GOOD_FIT", "WORTH_CONSIDERING", "INELIGIBLE"].includes(item.compositionBand));
    item.access.explanationTrace.forEach((trace) => assert(trace.evidenceIds.length, "Access explanation must retain evidence IDs."));
  });
  assert(!/objectively perfect|perfect location has been found/i.test(result.philosophy));
});

// Access cannot override Office incompatibility.
const incompatibleFoundation = JSON.parse(JSON.stringify(compositionFoundation));
incompatibleFoundation.districts.find((item) => item.districtId === "presidio").officeFit = "limited";
const incompatible = composer.composeLocationRecommendations(scenarios.marin, accessFoundation, incompatibleFoundation);
assert.equal(incompatible.considered.find((item) => item.districtId === "presidio").compositionBand, "INELIGIBLE");
assert(!incompatible.shortlist.some((item) => item.districtId === "presidio"));

// Activated candidates require generic Access eligibility.
results.marin.considered.filter((item) => item.eligibilitySource === "SHADOW_ACCESS_ACTIVATION").forEach((item) => assert.equal(item.access.accessEligibility.accessActivated, true));
assert.equal(results.marin.considered.find((item) => item.districtId === "presidio").eligibilitySource, "SHADOW_ACCESS_ACTIVATION");
assert(results.marin.shortlist.some((item) => item.districtId === "presidio"), "Reviewed Presidio alternative should participate in the Marin composition.");
assert(results.marin.considered.find((item) => item.districtId === "presidio").unknowns.some((item) => /availability.*unverified/i.test(item)), "Presidio availability boundary must be explicit.");

// Candidate preferences are context only.
const signature = (result) => result.considered.map((item) => [item.districtId, item.compositionBand, item.tieKey, item.eligibilitySource]);
assert.deepEqual(signature(results.candidates), signature(results.eastBay));
assert.deepEqual(results.candidates.shortlist.map((item) => item.districtId), results.eastBay.shortlist.map((item) => item.districtId));
assert(results.candidates.candidateContext.every((item) => ["soma", "south-beach"].includes(item.districtId)));

// Ties are preserved; stable production order is only a private tie-break.
assert(results.eastBay.tieGroups.length > 0 || results.mixed.tieGroups.length > 0);
assert.match(results.eastBay.orderingPolicy, /production order as stable tie-break/i);

// Requirement-relevant comparison dimensions only.
assert(results.eastBay.comparison.dimensions.some((item) => item.id === "client"));
assert(results.eastBay.comparison.dimensions.some((item) => item.id === "transit"));
assert(!results.eastBay.comparison.dimensions.some((item) => item.id === "parking"), "Low-importance parking should not clutter comparison.");
assert(results.marin.comparison.dimensions.some((item) => item.id === "parking"));

// Parking sensitivity changes explanation, not necessarily shortlist.
const marinPresidio = results.marin.considered.find((item) => item.districtId === "presidio");
const helpfulPresidio = results.parkingHelpful.considered.find((item) => item.districtId === "presidio");
assert.notDeepEqual(marinPresidio.strengths, helpfulPresidio.strengths, "Parking importance should change supported explanation copy.");
assert(marinPresidio.strengths.some((item) => /very important parking priority/i.test(item)));
assert(helpfulPresidio.strengths.some((item) => /preference for convenient parking/i.test(item)));

// Exact operator regression: helpful transit is MATERIAL, parking is bounded, and a MATERIAL Marin gap stays visible.
const operator = results.operatorMarin;
const operatorEmployees = operator.requirementAccessProfile.cohorts.filter((item) => item.actorType === "EMPLOYEE");
assert.deepEqual(operatorEmployees.map((item) => item.originRegionId), ["sf-origin:san-francisco", "sf-origin:north-bay"]);
assert(operatorEmployees.every((item) => item.importance === "MATERIAL"));
assert.equal(operator.requirementAccessProfile.modePreferences.regionalTransit, "MATERIAL");
assert.equal(operator.requirementAccessProfile.modePreferences.parking, "CORE");
assert(operator.shortlist.some((item) => item.districtId === "presidio"), "Presidio must receive generic shadow consideration in the operator case.");
["soma", "south-beach"].forEach((districtId) => {
  const item = operator.considered.find((candidate) => candidate.districtId === districtId);
  assert.equal(item.access.employeeCohortResults.find((cohort) => cohort.originRegionId === "sf-origin:north-bay").rating, "UNKNOWN");
  assert.equal(item.accessComponent.treatment, "MATERIAL_COHORT_GAP_CAP");
  assert.equal(item.accessComponent.band, "MODERATE");
  assert.equal(item.employeeAccessSummary.band, "MIXED");
  assert.match(item.employeeAccessSummary.label, /Strong for San Francisco.*Marin \/ North Bay access not established/);
});
assert.match(operator.comparison.rows.find((row) => row.id === "employee").values[operator.shortlist.find((item) => item.districtId !== "presidio" && item.employeeAccessSummary.band === "MIXED").districtId], /^Mixed/);
assert.equal(operator.considered.find((item) => item.districtId === "presidio").access.employeeCohortResults.find((cohort) => cohort.originRegionId === "sf-origin:north-bay").selectedGatewayId, "sf-gateway:golden-gate-bridge");
assert.equal(operator.considered.find((item) => item.districtId === "presidio").candidatePreference, false);
assert.equal(operator.considered.find((item) => item.districtId === "jackson-square").candidatePreference, true);
assert.equal(operator.orderingPolicy.includes("Candidate preferences never participate"), true);

// Normal UX and evaluator boundaries.
const page = fs.readFileSync("pages/prototype/requirement-v1.njk", "utf8");
const browser = fs.readFileSync("js/requirement-prototype.js", "utf8");
assert.match(page, /data-composition-debug/);
assert(page.indexOf("data-composition-debug") > page.indexOf("<details class=\"requirement-debug\""), "Composition diagnostics must remain inside evaluator details.");
assert.match(browser, /Your search/);
assert.match(browser, /How these alternatives differ/);
assert.match(browser, /SESSION_STATE_VERSION/);
assert(!/92%|8\.7\/10|master compatibility/i.test(browser));
assert(!/fetch\s*\(/.test(fs.readFileSync("lib/recommendations/private-location-composition.js", "utf8")));

// Production boundary.
const hashes = {
  "_data/sfOfficeRecommendationModel.js": "e76839ebf3e5be19bcffc412cc1bdd3f8dbd32977b07d1bf2a14dcaa354a1e81",
  "lib/recommendations/sf-office-recommendation-resolver.js": "6f0f4e968915a78beeba5d473bf315723ea073beff8208ac9e7925ea235b4dde",
  "lib/recommendations/normalize-sf-office-profile.js": "6116531e6296d573f3a2dd728cf677b9f9a54ac9fd64753ef3a6609549cc3f95",
};
Object.entries(hashes).forEach(([file, expected]) => assert.equal(crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex"), expected, `${file} changed.`));

console.log("Private Location Recommendation Composition v1 QA passed.");
for (const [id, result] of Object.entries(results)) {
  console.log(`${id}: production=${result.shadow.productionTopThree.join(",")} private=${result.shortlist.map((item) => `${item.districtId}:${item.compositionBand}`).join(",")}`);
  console.log(`  dimensions=${result.comparison.dimensions.map((item) => item.id).join(",")} ties=${JSON.stringify(result.tieGroups)}`);
}

module.exports = { scenarios, results };
