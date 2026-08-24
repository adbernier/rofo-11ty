const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const content = require("../_data/sfRepresentativeContent");
const office = require("../_data/sfOfficeMarketCoverage");
const retail = require("../_data/sfRetailMarketCoverage");
const industrialFlex = require("../_data/sfIndustrialFlexMarketCoverage");
const presentation = require("../data/generated/location-brief-district-presentation.json");
const neighborhoodPages = require("../_data/neighborhoodPages");
const readiness = require("../lib/eos/market-readiness").buildMarketReadiness();

const eligible = new Set([office, retail, industrialFlex.industrial, industrialFlex.flex]
  .flatMap((coverage) => coverage.decisionGeographies)
  .filter((item) => /^(CORE|SITUATIONAL)_/.test(item.classification || ""))
  .map((item) => item.districtId));
assert.equal(eligible.size, 24, "Certified SF public universe changed; review representative coverage intentionally.");
assert.deepEqual(Object.keys(content.byDistrictId).sort(), Array.from(eligible).sort(), "Representative content must cover the exact certified SF universe.");

const allIds = [];
for (const districtId of eligible) {
  const items = content.byDistrictId[districtId];
  assert(items.length >= 2, `${districtId} needs at least two reviewed examples under the current practical contract.`);
  assert(presentation.districts[districtId]?.representativeBuildings?.length >= 2, `${districtId} must reach generated Location Brief presentation.`);
  const page = neighborhoodPages.find((item) => item.slug === districtId && item.city === "San Francisco");
  assert(page?.representative_content?.length >= 2, `${districtId} public page must receive representative content.`);
  for (const item of items) {
    allIds.push(item.id);
    assert(["named_building", "commercial_environment", "specialized_operating_environment"].includes(item.kind), `${item.id} has invalid content kind.`);
    assert(item.name && item.descriptor && item.representativeReason && item.caveat, `${item.id} lacks decision content or caveat.`);
    assert(item.provenance?.length >= 2, `${item.id} lacks provenance.`);
    if (item.kind === "named_building") assert(item.canonicalUrl?.startsWith("/commercial-real-estate/building/CA/san-francisco/"), `${item.id} must use a canonical building route.`);
    else assert.equal(item.canonicalUrl, "", `${item.id} cannot masquerade as a building page.`);
  }
}
assert.equal(new Set(allIds).size, allIds.length, "Underlying representative records must not be duplicated.");

for (const id of ["financial-district", "soma", "mission-bay", "jackson-square", "showplace-square", "dogpatch"]) {
  assert(content.byDistrictId[id].every((item) => item.kind === "named_building"), `${id} reviewed named-building projection must remain intact.`);
}
for (const id of ["south-beach", "mission-district", "union-square", "civic-center", "hayes-valley", "marina-district", "potrero-hill"]) {
  assert(content.byDistrictId[id].some((item) => item.kind === "named_building"), `${id} must promote useful existing raw building evidence.`);
}
for (const id of ["sacramento-street", "fillmore-street", "union-street-cow-hollow", "chestnut-street", "valencia-street", "upper-market-castro", "north-beach", "chinatown"]) {
  assert(content.byDistrictId[id].every((item) => item.kind === "commercial_environment" && item.relevantSpaceTypes.includes("retail")), `${id} must use Retail-appropriate environment records.`);
}
for (const id of ["bayview-industrial", "central-waterfront"]) {
  assert(content.byDistrictId[id].every((item) => item.kind === "specialized_operating_environment"), `${id} needs operating-environment treatment.`);
}
assert(content.byDistrictId["presidio"].every((item) => item.kind === "commercial_environment" && item.relevantSpaceTypes.includes("office")));
assert(content.byDistrictId["potrero-hill"].some((item) => /eastern\/base edge/i.test(item.representativeReason)));
assert.notDeepEqual(content.byDistrictId["chestnut-street"].map((item) => item.id), content.byDistrictId["union-street-cow-hollow"].map((item) => item.id));

const serialized = JSON.stringify(content).toLowerCase();
for (const phrase of ["available now", "currently for lease", "asking rent", "vacancy rate", "available square feet"]) assert(!serialized.includes(phrase), `Representative content contains prohibited availability claim: ${phrase}`);
assert.match(content.availabilityDisclaimer, /may not be currently available/i);

const partial = fs.readFileSync(path.join(root, "_includes/partials/neighborhood/representative-building-cards.njk"), "utf8");
assert(partial.includes("representative_content") && partial.includes("data-representative-content-kind") && partial.includes("representative_content_disclaimer"));
const generator = fs.readFileSync(path.join(root, "scripts/build-location-brief-district-presentation.js"), "utf8");
assert(generator.includes("sfRepresentativeContent") && !generator.includes("manually"));

const siteBase = path.join(root, "_site/commercial-real-estate/CA/san-francisco");
if (fs.existsSync(siteBase)) {
  for (const districtId of eligible) {
    const target = path.join(siteBase, districtId, "index.html");
    if (!fs.existsSync(target)) continue;
    const html = fs.readFileSync(target, "utf8");
    assert(html.includes("What commercial space here can feel like"), `${districtId} missing public representative module.`);
    assert(html.includes("may not be currently available"), `${districtId} missing availability disclaimer.`);
  }
}

const sf = readiness.markets.find((market) => market.marketId === "san-francisco");
assert.equal(sf.workloads.publicExperience.status, "Building");
assert.equal(readiness.currentPriority.selection.label, "SF Public Experience");
assert(sf.workloads.publicExperience.details.representativeBuildingDistricts >= 24, "Mission Control projection must see the improved representative-content coverage.");

console.log(`SF Public Experience Sprint 3 QA passed: ${eligible.size} certified geographies, ${allIds.length} canonical representative examples, no unresolved coverage gaps.`);
