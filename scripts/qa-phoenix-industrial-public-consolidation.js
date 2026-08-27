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

const route = "/commercial-real-estate/AZ/phoenix/industrial-space/";
const phoenix = pages.find((item) => item.city.slug === "phoenix" && item.state_abbr === "AZ" && item.spaceType.slug === "industrial-space");
assert(phoenix?.localDecisionGuide, "Phoenix Industrial must use the canonical local-decision-guide projection");
const guide = phoenix.localDecisionGuide;

assert.equal(guide.entries.length, 3);
assert.deepEqual(guide.entries.map((item) => item.id), ["southwest-phoenix-industrial", "airport-south-central-industrial", "north-phoenix-advanced-operations"]);
for (const entry of guide.entries) assert(entry.strengths.length >= 2 && entry.tradeoffs.length >= 2);

const southwest = guide.entries[0];
assert(southwest.subareas.some((item) => item.name === "West Phoenix Industrial" && /not a separately ranked peer/i.test(item.explanation)));
const airport = guide.entries[1];
assert.deepEqual(airport.subareas.map((item) => item.name), ["Phoenix Airport / Sky Harbor Area", "Cotton Center / South Airport", "South Central / I-17"]);
const north = guide.entries[2];
assert.deepEqual(north.subareas.map((item) => item.name), ["Deer Valley", "North Phoenix / TSMC Corridor"]);

for (const subarea of [southwest.subareas[0], airport.subareas[0], ...north.subareas]) {
  const owner = neighborhoods.find((item) => item.canonical_neighborhood_path === subarea.path);
  assert(owner && owner.noindex !== true, `${subarea.path} must preserve an indexable canonical owner`);
}

assert.equal(guide.representativeEnvironments.length, 5);
const representativePaths = guide.representativeEnvironments.map((item) => item.path);
for (const buildingPath of [
  "/commercial-real-estate/building/AZ/phoenix/1002-s-56th-ave/",
  "/commercial-real-estate/building/AZ/phoenix/3241-e-washington-st/",
  "/commercial-real-estate/building/AZ/phoenix/4625-e-cotton-center-blvd/",
]) assert(buildingPages.some((item) => item.building_path === buildingPath) && representativePaths.includes(buildingPath));
for (const excluded of ["/commercial-real-estate/building/AZ/phoenix/2130-s-7th-st/", "/commercial-real-estate/building/AZ/phoenix/2325-s-7th-st/"]) assert(!representativePaths.includes(excluded));
assert(guide.representativeEnvironments.some((item) => /Deer Valley Industrial\/Flex employment environment/.test(item.name)));
assert(guide.representativeEnvironments.some((item) => /semiconductor manufacturing ecosystem/.test(item.name) && /not an available-space card/i.test(item.summary)));
assert.equal(new Set(representativePaths).size, representativePaths.length);
assert.equal(guide.suppressInventoryModule, true);
assert.match(guide.representativeDisclaimer, /may not be currently available/i);

assert.equal(guide.evidenceResolution.deerValley.status, "environment_representative");
assert.equal(guide.evidenceResolution.northPhoenix.status, "environment_representative");
assert.equal(guide.evidenceResolution.south7th.status, "excluded");
assert.match(guide.evidenceResolution.westSouthwest.note, /not projected as evidence of two equivalent/i);

assert(guide.contexts.some((item) => item.path === "/commercial-real-estate/AZ/tempe/tempe-i-10-industrial/" && /separately owned Tempe context/i.test(item.explanation)));
const entryUrl = new URL(guide.recommendation.path, "https://www.rofo.com");
assert.equal(entryUrl.pathname, "/best-fit-locations/");
assert.equal(entryUrl.searchParams.get("city"), "Phoenix");
assert.equal(entryUrl.searchParams.get("state"), "AZ");
assert.equal(entryUrl.searchParams.get("marketId"), "phoenix");
assert.equal(entryUrl.searchParams.get("spaceType"), "Industrial / Warehouse / Flex");
assert.equal(entryUrl.searchParams.get("source"), "space_type");
assert.equal(entryUrl.searchParams.get("sourcePath"), route);
assert.equal(entryUrl.searchParams.get("journey"), "new");

const experiment = experiments.byId[guide.experimentId];
assert.equal(experiment.baseline.window, "2026-07-30/2026-08-26");
assert.equal(experiment.baseline.propertyTypeImpressions, 72);
assert.equal(experiment.baseline.averagePosition, 24.75);
assert.equal(experiment.baseline.dominantQueryImpressions, 55);
assert.equal(experiment.baseline.dominantQueryAveragePosition, 21.13);
assert.equal(experiment.deploymentDate, null);
assert.equal(experiment.reviewStatus, "implementation_complete_pending_deployment");
assert.equal(experiments.cityProjection["AZ/phoenix"].featuredSpaceType.path, route);
assert.equal(experiments.byId["growth-antioch-retail-v1"].deploymentDate, "2026-08-26");
assert.equal(experiments.byId["growth-antioch-retail-v1"].reviewStatus, "deployed_pending_observation");

const text = JSON.stringify(guide);
assert.doesNotMatch(text, /ranked #|best phoenix industrial|recommendation ready|cargo speed|guaranteed loading|available semiconductor-ready/i);
assert.match(text, /without automatically ranking|not an automatically ranked alternative/i);
assert(read("_includes/partials/space-type/local-decision-guide.njk").includes("subareas"));
assert(read("city.njk").includes("featuredSpaceType"));

console.log("Phoenix Industrial Public Consolidation QA passed.");
