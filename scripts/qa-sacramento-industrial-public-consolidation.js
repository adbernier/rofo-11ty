"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.join(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(ROOT, file), "utf8");
const pages = require(path.join(ROOT, "_data/spaceTypePages.js"));
const neighborhoods = require(path.join(ROOT, "_data/neighborhoodPages.js"));
const buildingPages = require(path.join(ROOT, "_data/buildingPages.js"));
const experiments = require(path.join(ROOT, "_data/growthExperiments.js"));

const route = "/commercial-real-estate/CA/sacramento/industrial-space/";
const sacramento = pages.find((item) => item.city.slug === "sacramento" && item.spaceType.slug === "industrial-space");
assert(sacramento?.localDecisionGuide, "Sacramento Industrial must use the canonical local-decision-guide projection");
const guide = sacramento.localDecisionGuide;

assert.equal(guide.experimentId, "growth-sacramento-industrial-v1");
assert.equal(guide.suppressInventoryModule, true, "The generic building inventory must yield to the curated representative set");
assert.match(guide.seoTitle, /Sacramento Industrial and Warehouse Location Guide/);
assert.match(guide.seoDescription, /Power Inn, Natomas/);
assert.match(guide.h1, /Industrial and Warehouse Space in Sacramento/);

const powerInn = guide.entries.find((item) => item.id === "power-inn-industrial");
const natomas = guide.entries.find((item) => item.id === "natomas");
for (const entry of [powerInn, natomas]) {
  assert(entry?.path, "Each in-city context must have a canonical public owner");
  assert(entry.strengths.length >= 2 && entry.tradeoffs.length >= 2, `${entry.name} must present decision value and tradeoffs`);
  const owner = neighborhoods.find((item) => item.canonical_neighborhood_path === entry.path);
  assert(owner && owner.noindex !== true, `${entry.path} must resolve to an indexable canonical geography`);
}

assert.equal(guide.contexts.length, 2);
assert(guide.contexts.some((item) => item.path === "/commercial-real-estate/CA/west-sacramento/west-sacramento-industrial/" && /separate municipal market/i.test(item.explanation)));
assert(guide.contexts.some((item) => item.path === "/commercial-real-estate/CA/rancho-cordova/rancho-cordova-commercial-core/" && /separate eastern metro context/i.test(item.explanation)));
for (const context of guide.contexts) {
  const owner = neighborhoods.find((item) => item.canonical_neighborhood_path === context.path);
  assert(owner && owner.noindex !== true, `${context.path} must preserve its separate canonical identity`);
}

assert.equal(guide.operatingPatterns.length, 6);
for (const label of ["Warehouse and distribution", "Small-bay contractor and service", "Light manufacturing and technical production", "Last-mile and north-city service", "Showroom and Flex", "Larger-format logistics"]) {
  assert(guide.operatingPatterns.some((item) => item.name === label), `${label} must be explained`);
}

const expectedRepresentatives = new Map([
  ["/commercial-real-estate/building/CA/sacramento/8583-elder-creek-rd/", "power-inn-industrial"],
  ["/commercial-real-estate/building/CA/sacramento/5711-florin-perkins-rd/", "power-inn-industrial"],
  ["/commercial-real-estate/building/CA/sacramento/1329-n-market-blvd/", "natomas"],
  ["/commercial-real-estate/building/CA/west-sacramento/3100-ramco-st/", "west-sacramento-industrial"],
]);
assert.equal(guide.representativeEnvironments.length, 4);
assert.equal(new Set(guide.representativeEnvironments.map((item) => item.path)).size, 4, "Representative records must not be duplicated");
for (const example of guide.representativeEnvironments) {
  assert.equal(example.contextPath, guide.entries.find((item) => item.name === example.contextName)?.path || guide.contexts.find((item) => item.name === example.contextName)?.path);
  const building = buildingPages.find((item) => item.building_path === example.path);
  assert(building, `${example.path} must reuse an existing canonical building page`);
  assert.equal(building.commercial_area?.id, expectedRepresentatives.get(example.path), `${example.name} must retain reviewed geography ownership`);
  assert.equal(building.building_brief?.status, "published", `${example.name} must have a reviewed Building Brief`);
}
assert.match(guide.representativeDisclaimer, /may not be currently available/i);
assert.match(guide.representativeDisclaimer, /property-level investigation/i);

const entryUrl = new URL(guide.recommendation.path, "https://www.rofo.com");
assert.equal(entryUrl.pathname, "/best-fit-locations/");
assert.equal(entryUrl.searchParams.get("city"), "Sacramento");
assert.equal(entryUrl.searchParams.get("state"), "CA");
assert.equal(entryUrl.searchParams.get("marketId"), "sacramento");
assert.equal(entryUrl.searchParams.get("spaceType"), "Industrial / Warehouse / Flex");
assert.equal(entryUrl.searchParams.get("source"), "space_type");
assert.equal(entryUrl.searchParams.get("sourcePath"), route);
assert.equal(entryUrl.searchParams.get("journey"), "new");

const experiment = experiments.byId[guide.experimentId];
assert(experiment && experiment.landingPath === route);
assert.equal(experiment.baseline.propertyTypeImpressions, 31);
assert.equal(experiment.baseline.averagePosition, 21.1);
assert.match(experiment.hypothesis, /qualified Business Profile starts/);
assert.equal(experiment.startVersion, "market-development-sprint-a");
assert.equal(experiments.cityProjection["CA/sacramento"].featuredSpaceType.path, route);
assert.equal(experiments.cityProjection["CA/sacramento"].intelligenceState, "universal_with_local_context");

const guideText = JSON.stringify(guide);
assert(!/ranked #|district score|recommendation ready|best industrial district/i.test(guideText), "Public guidance must not claim Sacramento Recommendation Intelligence");
assert.match(guideText, /without automatically ranking|not an automatically ranked alternative/i, "The non-ranked intelligence boundary must be explicit");
assert.match(guideText, /property-level|property review|property-specific/);
const template = read("_includes/partials/space-type/local-decision-guide.njk");
assert(template.includes("representativeEnvironments") && template.includes("operatingPatterns"));
assert(read("city.njk").includes("featuredSpaceType"), "The city must expose the bounded Industrial decision path");

console.log("Sacramento Industrial Public Consolidation QA passed: canonical guide, reviewed contexts, four representative environments, controlled entry, growth evidence, and intelligence boundary verified.");
