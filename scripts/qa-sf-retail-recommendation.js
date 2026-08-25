const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const readiness = require("../lib/recommendations/private-recommendation-readiness");
const retailComposer = require("../lib/recommendations/sf-retail-location-composition");
const retailFoundation = require("../_data/sfRetailCompositionFoundation");
const coverage = require("../_data/sfRetailMarketCoverage");
const accessFoundation = require("../_data/sfAccessFoundationV0");
const compositionFoundation = require("../_data/sfOfficeCompositionFoundation");
const sfOfficeModel = require("../_data/sfOfficeRecommendationModel");
const districtGeography = require("../_data/requirementPrototypeDistrictGeography");
const retailGeographies = require("../_data/sfRetailDecisionGeographies");
const publicBacklog = require("../_data/sfRetailPublicExperienceBacklog");

const dependencies = { accessFoundation, compositionFoundation, sfOfficeModel, sfRetailFoundation: retailFoundation, districtGeography };
const criterion = (dimension, value, status = "PREFERRED") => ({ dimension, value: Array.isArray(value) ? { list: value, text: "" } : { text: value, list: [] }, status });
function fixture({ identity = "", destination = "", customers = [], transit = "", parking = "", activities = [], candidate = [] } = {}) {
  const criteria = [];
  if (identity) criteria.push(criterion("universal.business.type", [identity, identity.replaceAll("_", " ")]));
  if (destination) criteria.push(criterion("retail.customer.destination_visibility", destination));
  if (customers.length) criteria.push(criterion("universal.location.customer_origins", customers));
  if (transit) criteria.push(criterion("universal.access.transit_importance", transit));
  if (parking) criteria.push(criterion("universal.access.parking_importance", parking));
  return { schemaVersion: "requirement:v1", propertyTypes: ["retail_service"], activities: ["host_visitors", "sell_serve", ...activities], locationLogic: { marketAnchor: { marketId: "san-francisco", displayName: "San Francisco" }, specificPreference: { candidateDistrictIds: candidate, candidateDistrictNames: candidate } }, criteria };
}
function evaluate(input) { return readiness.evaluateRecommendationReadiness(fixture(input), dependencies); }
function ids(result) { return result.shortlist.map((item) => item.districtId); }

assert.equal(coverage.blockingGaps.length, 0, "Every meaningful SF Retail decision geography must clear hard-gate foundation coverage.");
const meaningful = coverage.decisionGeographies.filter((item) => /^CORE_|^SITUATIONAL_/.test(item.classification));
assert(meaningful.length >= 10, "The Retail universe must extend beyond the Office starting shortlist.");
for (const district of meaningful) for (const dimension of ["retailFit", "businessEnvironment", "access", "transit", "parking"]) assert.equal(district.coverage[dimension], "REVIEWED", `${district.districtId} ${dimension}`);
assert.equal(new Set(meaningful.map((item) => item.knowledgeOwnerDistrictId)).size, meaningful.length, "Meaningful Retail identities must not double-count a knowledge owner.");
assert(coverage.compatibilityIdentities.some((item) => item.districtId === "mission" && item.canonicalDistrictId === "mission-district"));
assert(coverage.compatibilityIdentities.some((item) => item.districtId === "south-park" && item.canonicalDistrictId === "soma"));
assert.equal(coverage.universeReview.status, "READY");
assert.equal(retailGeographies.approved.length, 8, "All eight primary candidates require an explicit reviewed resolution.");
assert.equal(retailGeographies.deferred.length, 5, "Secondary candidates must remain explicit rather than disappearing from the audit trail.");
for (const item of [...retailGeographies.approved, ...retailGeographies.deferred]) assert(item.reviewReason || item.reason, `${item.districtId} requires a review reason.`);
for (const family of coverage.competitionFamilies) {
  const parent = retailFoundation.districts.find((item) => item.districtId === family.parentDistrictId);
  assert.equal(parent?.classification, retailFoundation.classification.PARENT, `${family.parentDistrictId} must be presentation-only for Retail.`);
  assert(family.eligibleDistrictIds.every((id) => meaningful.some((item) => item.districtId === id)), `${family.familyId} children must be reviewed decisions.`);
}
assert.equal(publicBacklog.status, "BUILDING");
assert.deepEqual(publicBacklog.items.map((item) => item.districtId).sort(), retailGeographies.approved.map((item) => item.districtId).sort());

const scenarios = {
  open: evaluate(),
  neighborhood: evaluate({ identity: "neighborhood_service", destination: "Visibility materially supports customer visits", customers: ["San Francisco"] }),
  premium: evaluate({ identity: "premium_luxury", destination: "A mix of planned and walk-in visits", customers: ["San Francisco"] }),
  destination: evaluate({ identity: "destination_experiential", destination: "Primarily destination-driven", customers: ["Across the Bay Area / mixed"], parking: "Convenient parking is helpful" }),
  convenience: evaluate({ identity: "convenience", destination: "Visibility materially supports customer visits", customers: ["San Francisco"] }),
  food: evaluate({ identity: "food_beverage", destination: "A mix of planned and walk-in visits", customers: ["San Francisco"], activities: ["prepare_produce_food"] }),
  showroom: evaluate({ identity: "showroom_design", destination: "Primarily destination-driven", customers: ["Across the Bay Area / mixed"], parking: "Convenient parking is very important", activities: ["display_present"] }),
  transit: evaluate({ identity: "neighborhood_service", destination: "Visibility materially supports customer visits", customers: ["East Bay"], transit: "Public transit is very important" }),
  parking: evaluate({ identity: "destination_experiential", destination: "Primarily destination-driven", customers: ["Marin / North Bay"], parking: "Convenient parking is very important" }),
  visitor: evaluate({ identity: "premium_luxury", destination: "Primarily destination-driven", customers: ["Across the Bay Area / mixed"] }),
};
for (const [name, result] of Object.entries(scenarios)) {
  assert(["FULL", "BOUNDED"].includes(result.readiness), `${name} should produce supported guidance.`);
  assert(result.shortlist.length > 0 && result.shortlist.length <= 3, `${name} shortlist must be bounded.`);
  assert.equal(new Set(result.shortlist.map((item) => item.presentationGroupId || item.districtId)).size, result.shortlist.length, `${name} must dedupe presentation identities.`);
}
assert.notDeepEqual(ids(scenarios.neighborhood), ids(scenarios.showroom), "Neighborhood and showroom evidence should produce meaningfully different outcomes.");
assert.notDeepEqual(ids(scenarios.premium), ids(scenarios.food), "Premium and food profiles should not collapse to one canned ordering.");

const focused = {
  marinaDaily: evaluate({ identity: "neighborhood_service", destination: "Visibility materially supports customer visits", customers: ["San Francisco"] }),
  marinaDestination: evaluate({ identity: "boutique_brand", destination: "Primarily destination-driven", customers: ["Marin / North Bay"] }),
  valenciaFood: evaluate({ identity: "food_beverage", destination: "A mix of planned and walk-in visits", customers: ["San Francisco"] }),
  premiumDesign: evaluate({ identity: "showroom_design", destination: "Primarily destination-driven", customers: ["Across the Bay Area / mixed"], activities: ["display_present"] }),
  visitorFood: evaluate({ identity: "food_beverage", destination: "Primarily destination-driven", customers: ["Across the Bay Area / mixed"] }),
};
for (const result of Object.values(focused)) {
  assert(!result.shortlist.some((item) => ["marina-district", "mission-district"].includes(item.districtId)), "Retail parents must never compete with eligible children.");
  assert.equal(new Set(result.shortlist.map((item) => item.districtId)).size, result.shortlist.length);
}
assert(focused.marinaDaily.candidateComposition.considered.some((item) => item.districtId === "chestnut-street" && item.matchedTraits.includes("SERVICE")), "Chestnut must expose reviewed neighborhood-service evidence.");
assert(focused.marinaDestination.candidateComposition.considered.some((item) => item.districtId === "union-street-cow-hollow" && item.matchedTraits.includes("DESTINATION")), "Union/Cow Hollow must expose reviewed destination evidence.");
assert(focused.valenciaFood.candidateComposition.considered.some((item) => item.districtId === "valencia-street" && item.matchedTraits.includes("FOOD")), "Valencia must expose reviewed food/experiential evidence.");
assert(focused.premiumDesign.candidateComposition.considered.some((item) => item.districtId === "sacramento-street" && item.matchedTraits.includes("DESIGN")), "Sacramento Street must be distinguishable through reviewed design evidence.");
for (const id of ["north-beach", "chinatown"]) {
  const district = retailFoundation.districts.find((item) => item.districtId === id);
  assert(district?.traits.includes("VISITOR") && district.traits.includes("FOOD"), `${id} must carry supported visitor/food evidence.`);
  assert(focused.visitorFood.candidateComposition.considered.some((item) => item.districtId === id && item.matchedTraits.includes("FOOD")), `${id} evidence must participate in visitor-oriented food composition.`);
}

const unsupported = evaluate({ identity: "heavy_equipment_repair", activities: ["repair_service"] });
assert.equal(unsupported.readiness, "INVESTIGATE", "Unsupported Retail identity/operations must abstain.");
assert.equal(unsupported.shortlist.length, 0);
const base = evaluate({ identity: "boutique_brand", destination: "Visibility materially supports customer visits", customers: ["San Francisco"] });
const candidate = evaluate({ identity: "boutique_brand", destination: "Visibility materially supports customer visits", customers: ["San Francisco"], candidate: ["mission-bay"] });
assert.deepEqual(ids(candidate), ids(base), "Candidate identity must have zero ordering effect.");
assert.deepEqual(candidate.candidateComposition.considered.map((item) => [item.districtId, item.compositionBand]), base.candidateComposition.considered.map((item) => [item.districtId, item.compositionBand]), "Candidate identity must have zero component effect.");
const corridorCandidate = evaluate({ identity: "food_beverage", destination: "A mix of planned and walk-in visits", customers: ["San Francisco"], candidate: ["valencia-street"] });
const corridorBase = evaluate({ identity: "food_beverage", destination: "A mix of planned and walk-in visits", customers: ["San Francisco"] });
assert.deepEqual(ids(corridorCandidate), ids(corridorBase), "A corridor EntryContext candidate must remain ranking-neutral.");

const grouped = retailComposer.composeLocationRecommendations(fixture({ identity: "showroom_design", candidate: ["design-district"] }), accessFoundation, retailFoundation);
assert.equal(grouped.considered.filter((item) => item.memberDistrictIds?.includes("design-district")).length, 1, "Design District compatibility must render once through Showplace Square.");
assert(grouped.candidateContext.some((item) => item.districtId === "showplace-square"), "Candidate provenance must resolve to the canonical presentation owner.");

const office = readiness.evaluateRecommendationReadiness({ propertyTypes: ["office"], locationLogic: { marketAnchor: { marketId: "san-francisco" }, specificPreference: { candidateDistrictIds: [] } }, criteria: [] }, dependencies);
assert.notEqual(office.readiness, undefined, "SF Office readiness must remain operational.");
for (const id of retailGeographies.approved.map((item) => item.districtId)) assert(!office.candidateComposition?.considered?.some((item) => item.districtId === id), `${id} must not enter Office composition.`);

const temp = fs.mkdtempSync(path.join(os.tmpdir(), "rofo-sf-retail-qa-"));
const bundlePath = path.join(temp, "shared.cjs");
execFileSync(path.join(__dirname, "..", "node_modules/esbuild/bin/esbuild"), [path.join(__dirname, "..", "functions/api/location-brief-v2/_shared.js"), "--bundle", "--platform=node", "--format=cjs", `--outfile=${bundlePath}`], { stdio: "pipe" });
const shared = require(bundlePath);
assert.equal(shared.publicV2Enabled({}, "retail_service"), false, "The independent SF Retail public flag must default off.");
assert.equal(shared.publicV2Enabled({ LOCATION_BRIEF_V2_PUBLIC_SF_RETAIL_ENABLED: "true" }, "retail_service"), true);
assert.equal(shared.isSfRetailRequirement(fixture()), true);
assert.equal(shared.isSfRetailEntryContext({ marketId: "san-francisco", propertyType: "retail_service" }), true);
assert.equal(shared.isSfRetailEntryContext({ marketId: "san-francisco", propertyType: "office" }), false);
const snapshot = shared.calculateSnapshot(fixture({ identity: "showroom_design", destination: "Primarily destination-driven", activities: ["display_present"] }));
assert(["FULL", "BOUNDED"].includes(snapshot.readiness));
assert(snapshot.shortlist.length > 0 && snapshot.shortlist.every((item) => item.presentation), "Retail Location Brief snapshots must use the existing district presentation projection.");
assert.equal(snapshot.foundationVersions.retail, retailFoundation.schemaVersion);
const entryRoute = fs.readFileSync(path.join(__dirname, "..", "functions/location-requirement/index.js"), "utf8");
assert(entryRoute.includes("publicEntryContextEligible"), "Retail entry must use the shared controlled-cohort eligibility contract.");
const createRoute = fs.readFileSync(path.join(__dirname, "..", "functions/api/location-brief-v2/create.js"), "utf8");
assert(createRoute.includes("publicRequirementEligible"), "Retail creation must use the same controlled-cohort eligibility contract as entry.");
for (const prohibited of ["saveLead", "OfficeFinder", "resolveLeadRoute"]) assert(!createRoute.includes(prohibited), `Retail Brief creation must not invoke ${prohibited}.`);
fs.rmSync(temp, { recursive: true, force: true });

console.log(`SF Retail recommendation QA passed: ${meaningful.length} meaningful districts; ${Object.keys(scenarios).length} supported calibration profiles; candidate neutrality and abstention verified.`);
