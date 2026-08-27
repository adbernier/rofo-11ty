"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.join(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(ROOT, file), "utf8");
const pages = require(path.join(ROOT, "_data/spaceTypePages.js"));
const cities = require(path.join(ROOT, "_data/cities.js"))();
const buildings = require(path.join(ROOT, "_data/buildingPages.js"));
const experiments = require(path.join(ROOT, "_data/growthExperiments.js"));

const route = "/commercial-real-estate/CA/antioch/retail-space/";
const retail = pages.find((item) => item.city.slug === "antioch" && item.state_abbr === "CA" && item.spaceType.slug === "retail-space");
assert(retail?.localDecisionGuide, "Antioch Retail must project through the canonical space-type route");
const guide = retail.localDecisionGuide;

assert.equal(guide.entries.length, 2);
assert.deepEqual(guide.entries.map((item) => item.id), ["somersville-delta-fair", "lone-tree-way"]);
for (const context of guide.entries) {
  assert(context.strengths.length >= 2 && context.tradeoffs.length >= 2);
}
assert.doesNotMatch(JSON.stringify(guide.entries), /East 18th/i, "East 18th must not become a primary Retail peer");
assert.match(JSON.stringify(guide), /redevelopment|changing/i);
assert.match(JSON.stringify(guide), /long, segmented corridor|does not provide one uniform/i);
assert.match(JSON.stringify(guide), /Delta Square/);
assert.match(JSON.stringify(guide), /not Delta Fair Shopping Center/i);
assert.equal(guide.suppressInventoryModule, true);
assert.equal(guide.representativeEnvironments.length, 5);

const selectedPaths = guide.representativeEnvironments.filter((item) => item.path).map((item) => item.path);
for (const expected of [
  "/commercial-real-estate/building/CA/antioch/2520-2550-somersville-rd/",
  "/commercial-real-estate/building/CA/antioch/3600-3648-delta-fair-blvd/",
  "/commercial-real-estate/building/CA/antioch/4194-lone-tree-way/",
]) assert(buildings.some((item) => item.building_path === expected) && selectedPaths.includes(expected));
assert(!selectedPaths.includes("/commercial-real-estate/building/CA/antioch/41-47-18th-st-e/"));

const city = cities.find((item) => item.city === "Antioch" && item.state_abbr === "CA");
assert.equal(city.county, "Contra Costa County");
assert.equal(city.routing_county, "contra-costa-county-ca");
assert.equal(experiments.cityProjection["CA/antioch"].featuredSpaceType.path, route);
assert(pages.some((item) => item.city.slug === "antioch" && item.spaceType.slug === "industrial-space" && item.localDecisionGuide), "Antioch Industrial must remain independent");

const entry = new URL(guide.recommendation.path, "https://www.rofo.com");
assert.equal(entry.pathname, "/best-fit-locations/");
assert.equal(entry.searchParams.get("city"), "Antioch");
assert.equal(entry.searchParams.get("state"), "CA");
assert.equal(entry.searchParams.get("marketId"), "antioch");
assert.equal(entry.searchParams.get("spaceType"), "Retail");
assert.equal(entry.searchParams.get("source"), "space_type");
assert.equal(entry.searchParams.get("sourcePath"), route);
assert.equal(entry.searchParams.get("journey"), "new");

const experiment = experiments.byId[guide.experimentId];
assert.equal(experiment.baseline.window, "2026-07-30/2026-08-26");
assert.equal(experiment.baseline.comparisonWindow, "2026-07-02/2026-07-29");
assert.equal(experiment.baseline.impressions, 19);
assert.equal(experiment.baseline.averagePosition, 11.42);
assert.equal(experiment.deploymentDate, "2026-08-26");
assert.equal(experiment.reviewStatus, "deployed_pending_observation");

const claims = JSON.stringify(guide);
assert.doesNotMatch(claims, /measured foot traffic|proven sales performance|is currently available|best retail (area|district)|ranked #1/i);
assert.match(claims, /not ranked recommendations/i);
assert(read("_includes/partials/space-type/local-decision-guide.njk").includes("representativeHeading"));
assert(read("city.njk").includes("featuredSpaceType"));

console.log("Antioch Retail Public Consolidation QA passed.");
