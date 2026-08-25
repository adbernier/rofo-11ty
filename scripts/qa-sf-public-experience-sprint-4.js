const fs = require("node:fs");
const path = require("node:path");
const samples = require("../_data/sfPublicSampleBriefs");
const readiness = require("../lib/recommendations/private-recommendation-readiness");
const accessFoundation = require("../_data/sfAccessFoundationV0");
const compositionFoundation = require("../_data/sfOfficeCompositionFoundation");
const sfOfficeModel = require("../_data/sfOfficeRecommendationModel");
const sfRetailFoundation = require("../_data/sfRetailCompositionFoundation");
const sfIndustrialFlexFoundation = require("../_data/sfIndustrialFlexCompositionFoundation");
const districtGeography = require("../_data/requirementPrototypeDistrictGeography");
const representativeContent = require("../_data/sfRepresentativeContent");
const marketReadiness = require("../lib/eos/market-readiness");

const dependencies = { accessFoundation, compositionFoundation, sfOfficeModel, sfRetailFoundation, sfIndustrialFlexFoundation, districtGeography };
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const read = (file) => fs.readFileSync(path.join(__dirname, "..", file), "utf8");

assert(samples.schemaVersion === "sf-public-sample-briefs:v1" && samples.status === "CERTIFIED", "sample registry must be versioned and certified");
assert(samples.briefs.length === 9, "approved sample library must contain nine briefs");
for (const [group, count] of Object.entries({ Office: 3, Retail: 3, Industrial: 1, Flex: 2 })) assert(samples.briefs.filter((item) => item.group === group).length === count, `${group} sample count drifted`);

const signatures = new Set();
const resultSignatures = new Map();
for (const sample of samples.briefs) {
  assert(sample.requirement.locationLogic.marketAnchor.marketId === "san-francisco", `${sample.id} must anchor SF`);
  assert(!sample.requirement.locationLogic.specificPreference.candidateDistrictIds.length, `${sample.id} fixture must be candidate-neutral`);
  const rerun = readiness.evaluateRecommendationReadiness(sample.requirement, dependencies);
  assert(["FULL", "BOUNDED"].includes(rerun.readiness), `${sample.id} must produce supported guidance`);
  assert(rerun.shortlist.map((item) => item.districtId).join("|") === sample.locations.map((item) => item.districtId).join("|"), `${sample.id} output is not reproducible`);
  const candidateRequirement = JSON.parse(JSON.stringify(sample.requirement));
  candidateRequirement.locationLogic.specificPreference = { candidateDistrictIds: [sample.locations[2].districtId], candidateDistrictNames: [sample.locations[2].name] };
  const candidateResult = readiness.evaluateRecommendationReadiness(candidateRequirement, dependencies);
  assert(candidateResult.shortlist.map((item) => item.districtId).join("|") === sample.locations.map((item) => item.districtId).join("|"), `${sample.id} candidate changed ranking`);
  assert(!signatures.has(sample.signature), `${sample.id} duplicated a fixture snapshot`); signatures.add(sample.signature);
  const resultKey = sample.locations.map((item) => item.districtId).join("|");
  if (resultSignatures.has(resultKey)) assert(resultSignatures.get(resultKey) !== sample.resolvedApplicability, `${sample.id} duplicates a decision path`);
  resultSignatures.set(resultKey, sample.resolvedApplicability);
  assert(sample.cta.startsWith("/best-fit-locations/") && sample.cta.includes("source=example") && !sample.cta.includes("business="), `${sample.id} CTA must enter the controlled fresh-search router`);
  for (const location of sample.locations) {
    assert(location.path.startsWith("/commercial-real-estate/CA/san-francisco/"), `${location.districtId} lacks canonical SF path`);
    assert((representativeContent.byDistrictId[location.districtId] || []).length && location.representativeContent.length, `${location.districtId} lacks canonical representative reuse`);
  }
}

const hub = read("pages/example-location-brief.njk");
const detail = read("pages/example-location-brief-detail.njk");
const partial = read("_includes/partials/neighborhood/example-location-briefs.njk");
assert(hub.includes("sfPublicSampleBriefs.briefs") && !hub.includes("Pacific Analytics") && !hub.includes("Recommended Starting Point"), "legacy sample semantics remain");
assert(detail.includes("Example Location Brief") && detail.includes("Locations worth investigating"), "public detail semantics missing");
for (const forbidden of ["owner cookie", "OfficeFinder", "contact capture", "edit/resume", "private Brief ID"]) assert(!detail.includes(forbidden), `private artifact leaked: ${forbidden}`);
assert(partial.includes("location.districtId == neighborhood.slug"), "location/sample links must be exact results");
assert(read("pages/sitemap.njk").includes("sfPublicSampleBriefs.briefs"), "samples absent from sitemap");
assert(read("assets/css/system.css").includes("@media (max-width: 760px)"), "mobile contract missing");
const readinessProjection = marketReadiness.buildMarketReadiness();
const sf = readinessProjection.markets.find((market) => market.marketId === "san-francisco");
assert(["Building", "Ready"].includes(sf.workloads.publicExperience.status), "SF Public Experience evidence regressed");
assert(sf.workloads.publicExperience.details.certifiedSampleBriefs === 9, "Mission Control sample evidence missing");
assert(readinessProjection.currentPriority.selection.label === "SF Public Experience", "current priority changed");
console.log(`SF Public Experience Sprint 4 QA passed (${samples.briefs.length} certified samples; Public Experience is ${sf.workloads.publicExperience.status}).`);
