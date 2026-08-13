#!/usr/bin/env node

const graph = require("../_data/locationKnowledgeGraph.js");
const neighborhoodPages = require("../_data/neighborhoodPages.js");
const commercialMarketEvidence = require("../_data/commercialMarketEvidence.js");
const sfOfficeModel = require("../_data/sfOfficeRecommendationModel.js");

const failures = [];
const bySlug = new Map(graph.filter((node) => node && node.type === "district").map((node) => [node.slug, node]));

function fail(message) {
  failures.push(message);
}

function requireDistrict(slug) {
  const district = bySlug.get(slug);
  if (!district) fail(`Missing canonical district: ${slug}`);
  return district;
}

function hasComparison(district, target) {
  return Boolean((district?.relationships?.compareWith || []).find((item) => item.slug === target));
}

function assertNestedAreas(district, expectedIds) {
  const areas = district?.industrialGeography?.internalAreas || [];
  const ids = areas.map((area) => area.id);
  if (new Set(ids).size !== ids.length) fail(`${district.slug} internal industrial area IDs must be unique`);
  for (const id of expectedIds) {
    const area = areas.find((item) => item.id === id);
    if (!area) {
      fail(`${district.slug} missing internal industrial area ${id}`);
      continue;
    }
    if (area.canonicalDistrict !== false || area.recommendationEligible !== false) {
      fail(`${district.slug} internal area ${id} must remain noncanonical and non-recommendation`);
    }
    if (bySlug.has(id)) fail(`${district.slug} internal area ${id} must not also exist as a peer Knowledge Graph district`);
  }
}

const bayview = requireDistrict("bayview-industrial");
const central = requireDistrict("central-waterfront");
const dogpatch = requireDistrict("dogpatch");
const showplace = requireDistrict("showplace-square");
const design = requireDistrict("design-district");
const potrero = requireDistrict("potrero-hill");
const mission = requireDistrict("mission-district");

for (const district of [bayview, central]) {
  if (!district) continue;
  if (district.operationalMarketId !== "san-francisco") fail(`${district.slug} must belong to the San Francisco operational market`);
  if (district.recommendationEligible !== true) fail(`${district.slug} must remain a first-class canonical district`);
  if (district.commercialEcosystem?.primary !== "industrial_flex") fail(`${district.slug} must have Industrial & Flex as its primary ecosystem`);
  if (!district.path || neighborhoodPages.some((page) => page.canonical_neighborhood_path === district.path)) {
    fail(`${district.slug} must have a reserved canonical path without creating a public page in this sprint`);
  }
}

assertNestedAreas(bayview, ["northern-gateway-industrial-triangle", "india-basin-oakinba-sf-market", "south-basin"]);
assertNestedAreas(central, ["central-waterfront-core-pdr"]);
assertNestedAreas(potrero, ["potrero-eastern-base-pdr-edge"]);
assertNestedAreas(mission, ["northeast-mission-pdr"]);

const southernWaterfront = (bayview?.industrialGeography?.specializedOperatingAreas || []).find((area) => area.id === "southern-waterfront-piers-80-96");
if (!southernWaterfront) fail("Bayview Industrial must expose Southern Waterfront / Piers 80–96 as specialized operating context");
if (southernWaterfront && (southernWaterfront.canonicalDistrict !== false || southernWaterfront.recommendationEligible !== false || southernWaterfront.conventionalLeasingDistrict !== false)) {
  fail("Southern Waterfront / Piers 80–96 must not behave as a peer, recommendation target, or conventional leasing district");
}

if (!hasComparison(bayview, "central-waterfront") || !hasComparison(central, "bayview-industrial")) {
  fail("Bayview Industrial and Central Waterfront must have reciprocal decision relationships");
}
if (!hasComparison(central, "showplace-square")) fail("Central Waterfront must compare with Showplace Square");
if (!hasComparison(central, "dogpatch") || !hasComparison(dogpatch, "central-waterfront")) {
  fail("Central Waterfront and Dogpatch must expose their distinct but related decision roles");
}
if (!hasComparison(bayview, "hayward-industrial") && !hasComparison(bayview, "union-city-industrial")) {
  fail("Bayview Industrial must expose a regional logistics alternative");
}

if (design?.industrialGeography?.overlapRelationship?.canonicalKnowledgeOwner !== "showplace-square") {
  fail("Design District must identify Showplace Square as the future canonical knowledge owner");
}
if (design?.industrialGeography?.overlapRelationship?.preservePublicPath !== true) {
  fail("Design District compatibility must preserve its existing public path");
}
if (!(showplace?.industrialGeography?.aliases || []).includes("Design District")) {
  fail("Showplace Square must recognize Design District as an overlapping alias");
}

if (!/eastern\/base|eastern\/base areas/i.test(potrero?.industrialGeography?.decisionScope || "")) {
  fail("Potrero Hill industrial positioning must be bounded to eastern/base areas");
}
if (!/Northeast Mission PDR/i.test(mission?.industrialGeography?.decisionScope || "")) {
  fail("Mission District industrial positioning must be bounded to Northeast Mission PDR");
}

const officeDistricts = new Set(sfOfficeModel.districtOrder || []);
for (const slug of ["bayview-industrial", "central-waterfront"]) {
  if (officeDistricts.has(slug)) fail(`${slug} must not enter the SF Office recommendation model in this sprint`);
}

const cmeDistrictIds = new Set((commercialMarketEvidence.collections || []).map((collection) => collection?.district?.districtId).filter(Boolean));
for (const slug of ["bayview-industrial", "central-waterfront"]) {
  if (!cmeDistrictIds.has(slug)) fail(`${slug} CME must exist after the follow-on evidence sprint`);
}

console.log("SF Industrial Geography Foundation QA");
console.log(`- canonical districts: ${[bayview, central].filter(Boolean).length}`);
console.log(`- Bayview internal areas: ${bayview?.industrialGeography?.internalAreas?.length || 0}`);
console.log(`- specialized operating areas: ${bayview?.industrialGeography?.specializedOperatingAreas?.length || 0}`);
console.log(`- new public pages: ${[bayview, central].filter((district) => neighborhoodPages.some((page) => page.canonical_neighborhood_path === district?.path)).length}`);
console.log("- SF Office model additions: 0");

if (failures.length) {
  console.error("\nFailures:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log("SF Industrial Geography Foundation QA passed.");
