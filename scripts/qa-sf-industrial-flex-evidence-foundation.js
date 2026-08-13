const fs = require("fs");
const path = require("path");
const evidence = require("../_data/commercialMarketEvidence");
const buildingIntelligence = require("../_data/commercialBuildingIntelligence");
const neighborhoodPages = require("../_data/neighborhoodPages");

const errors = [];
const fail = (message) => errors.push(message);
const collection = (districtId) => evidence.collections.find((item) => item.district && item.district.districtId === districtId);
const bayview = collection("bayview-industrial");
const central = collection("central-waterfront");

for (const [districtId, item] of [["bayview-industrial", bayview], ["central-waterfront", central]]) {
  if (!item) fail(`${districtId} CME collection is missing`);
  else if ((item.records || []).length !== 4) fail(`${districtId} must retain the reviewed four-record evidence set`);
  for (const record of (item && item.records) || []) {
    if (!(record.publicSources || []).some((source) => ["government", "official_operator", "official_owner"].includes(source.sourceType))) {
      fail(`${record.id} lacks authoritative external provenance`);
    }
  }
}

const bayviewById = new Map((bayview && bayview.records || []).map((record) => [record.id, record]));
const gateway = bayviewById.get("sf-bayview-industrial-sf-gateway");
if (!gateway || gateway.subjectType !== "environment" || gateway.buildingProfileStatus !== "not_applicable" || !/proposed/i.test(gateway.evidenceType)) {
  fail("SF Gateway must remain proposed development/environment evidence without a Building Profile");
}
const port = bayviewById.get("sf-bayview-industrial-southern-waterfront");
if (!port || port.subjectType !== "environment" || port.buildingProfileReference || port.buildingProfileStatus !== "not_applicable") {
  fail("Piers 80–96 must remain specialized environment evidence without a Building Profile");
}

const centralById = new Map((central && central.records || []).map((record) => [record.id, record]));
const aic = centralById.get("sf-central-waterfront-american-industrial-center");
if (!aic || aic.buildingProfileReference !== "/commercial-real-estate/building/CA/san-francisco/2325-3rd-st/" || !/shared/i.test(aic.buildingProfileStatus)) {
  fail("AIC must be shared contextual evidence using its existing Building Profile");
}
const pier70 = centralById.get("sf-central-waterfront-pier-70-building-12");
if (!pier70 || !/transition/i.test(pier70.buildingProfileStatus) || !/does not prove|does not represent/i.test((pier70.tradeoffs || []).join(" "))) {
  fail("Pier 70 Building 12 must remain bounded transition evidence");
}

const canonical = buildingIntelligence.canonicalBuildings || [];
for (const [address, label] of [["2325 3rd St", "American Industrial Center"], ["70 Pier Bldg 102", "Pier 70 Building 12"]]) {
  const matches = canonical.filter((building) => building.identity && building.identity.address === address);
  if (matches.length !== 1 || matches[0].identity.canonicalDistrict?.slug !== "dogpatch") fail(`${label} must retain one Dogpatch-owned canonical record`);
}

const showplace = require("../data/commercial-market-evidence/san-francisco/showplace-square");
const design = require("../data/commercial-market-evidence/san-francisco/design-district");
if (!showplace.records.length || !design.records.length) fail("Showplace Square and Design District compatibility collections must remain intact");

for (const slug of ["bayview-industrial", "central-waterfront"]) {
  if (neighborhoodPages.some((page) => page.slug === slug || String(page.permalink || "").includes(`/${slug}/`))) fail(`${slug} public page must remain unpublished`);
  const builtPath = path.join(__dirname, "..", "_site", "commercial-real-estate", "CA", "san-francisco", slug, "index.html");
  if (fs.existsSync(builtPath)) fail(`${slug} public build route exists unexpectedly`);
}

if (errors.length) {
  console.error(errors.map((error) => `SF Industrial/Flex Evidence QA error: ${error}`).join("\n"));
  process.exit(1);
}

console.log("SF Industrial/Flex Evidence Foundation QA");
console.log(`- Bayview evidence records: ${bayview.records.length}`);
console.log(`- Central Waterfront evidence records: ${central.records.length}`);
console.log("- new Building Profiles: 0");
console.log("- new public district pages: 0");
console.log("SF Industrial/Flex Evidence Foundation QA passed.");
