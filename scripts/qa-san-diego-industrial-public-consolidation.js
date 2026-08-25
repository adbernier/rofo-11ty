"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const ROOT = path.join(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(ROOT, file), "utf8");
const pages = require(path.join(ROOT, "_data/spaceTypePages.js"));
const neighborhoods = require(path.join(ROOT, "_data/neighborhoodPages.js"));
const buildingPages = require(path.join(ROOT, "_data/buildingPages.js"));
const experiments = require(path.join(ROOT, "_data/growthExperiments.js"));

const route = "/commercial-real-estate/CA/san-diego/industrial-space/";
const page = pages.find((item) => item.city.slug === "san-diego" && item.spaceType.slug === "industrial-space");
assert(page?.localDecisionGuide, "San Diego Industrial must use the canonical local-decision-guide projection");
const guide = page.localDecisionGuide;

assert.equal(guide.experimentId, "growth-san-diego-industrial-v1");
assert.equal(guide.suppressInventoryModule, true, "The generic inventory must yield to curated representative environments");
assert.match(guide.seoTitle, /San Diego Industrial and Warehouse Location Guide/);
assert.match(guide.seoDescription, /Miramar, Otay Mesa, Kearny Mesa, and Sorrento Mesa/);
assert.match(guide.h1, /Industrial and Warehouse Space in San Diego/);

const expectedEntries = new Map([
  ["miramar", "/commercial-real-estate/CA/san-diego/miramar/"],
  ["otay-mesa", "/commercial-real-estate/CA/san-diego/otay-mesa/"],
  ["kearny-mesa", "/commercial-real-estate/CA/san-diego/kearny-mesa/"],
  ["sorrento-mesa", "/commercial-real-estate/CA/san-diego/sorrento-mesa/"],
]);
assert.equal(guide.entries.length, 4);
for (const [id, expectedPath] of expectedEntries) {
  const entry = guide.entries.find((item) => item.id === id);
  assert.equal(entry?.path, expectedPath);
  assert(entry.strengths.length >= 2 && entry.tradeoffs.length >= 2, `${entry.name} must present strengths and tradeoffs`);
  const owner = neighborhoods.find((item) => item.canonical_neighborhood_path === expectedPath);
  assert(owner && owner.noindex !== true, `${expectedPath} must resolve to an indexable public identity`);
  assert.equal(owner.commercial_location_model?.review_status, "researched", `${entry.name} must use reviewed local evidence`);
}

assert.equal(guide.operatingPatterns.length, 4);
for (const token of ["Conventional warehouse", "Border logistics", "Customer-facing service", "R&D, technical"]) {
  assert(guide.operatingPatterns.some((item) => item.name.includes(token)), `${token} distinction must be visible`);
}

const sorrentoValleyPath = "/commercial-real-estate/CA/san-diego/sorrento-valley/";
assert.equal(guide.contexts.length, 1);
assert.equal(guide.contexts[0].path, sorrentoValleyPath);
assert.match(guide.contexts[0].explanation, /supporting page and building-location identity/i);
assert.match(guide.contexts[0].explanation, /Sorrento Mesa remains the primary reviewed R&D\/Flex decision identity/i);
assert(!guide.entries.some((item) => item.path === sorrentoValleyPath), "Sorrento Valley must not become a duplicate decision peer");
const sorrentoValley = neighborhoods.find((item) => item.canonical_neighborhood_path === sorrentoValleyPath);
assert(sorrentoValley && sorrentoValley.noindex !== true, "The useful supporting Sorrento Valley route must remain available");
assert.equal(sorrentoValley.commercial_location_model, null, "Sorrento Valley must remain supporting context rather than a competing reviewed decision owner");

const expectedRepresentatives = new Map([
  ["/commercial-real-estate/building/CA/san-diego/6906-miramar-rd/", { geography: "miramar", ownership: null }],
  ["/commercial-real-estate/building/CA/san-diego/7310-otay-crossings-ct/", { geography: "otay-mesa", ownership: "sd-otay-mesa" }],
  ["/commercial-real-estate/building/CA/san-diego/7615-siempre-viva-rd/", { geography: "otay-mesa", ownership: "sd-otay-mesa" }],
  ["/commercial-real-estate/building/CA/san-diego/4000-ruffin-rd/", { geography: "kearny-mesa", ownership: "sd-kearny-mesa" }],
  ["/commercial-real-estate/building/CA/san-diego/10130-sorrento-valley-rd/", { geography: "sorrento-mesa", ownership: "sd-sorrento-valley" }],
]);
assert.equal(guide.representativeEnvironments.length, 5);
assert.equal(new Set(guide.representativeEnvironments.map((item) => item.path)).size, 5, "Representative records must not be duplicated");
for (const example of guide.representativeEnvironments) {
  const expected = expectedRepresentatives.get(example.path);
  assert(expected, `${example.path} must be one of the bounded reviewed examples`);
  const building = buildingPages.find((item) => item.building_path === example.path);
  assert(building, `${example.path} must reuse an existing canonical building page`);
  assert.equal(building.commercial_area?.id || null, expected.ownership, `${example.name} must preserve existing building ownership`);
  const geography = neighborhoods.find((item) => item.canonical_neighborhood_path === expectedEntries.get(expected.geography));
  const embeddedPaths = (geography?.representative_buildings || geography?.representativeBuildings || []).map((item) => item.path || item.building_path);
  assert(embeddedPaths.includes(example.path), `${example.name} must be present in reviewed ${expected.geography} representative evidence`);
}
assert.match(guide.representativeDisclaimer, /may not be currently available/i);
assert.match(guide.representativeDisclaimer, /property-level investigation/i);

const entryUrl = new URL(guide.recommendation.path, "https://www.rofo.com");
assert.equal(entryUrl.pathname, "/best-fit-locations/");
assert.equal(entryUrl.searchParams.get("city"), "San Diego");
assert.equal(entryUrl.searchParams.get("state"), "CA");
assert.equal(entryUrl.searchParams.get("marketId"), "san-diego");
assert.equal(entryUrl.searchParams.get("spaceType"), "Industrial / Warehouse / Flex");
assert.equal(entryUrl.searchParams.get("source"), "space_type");
assert.equal(entryUrl.searchParams.get("sourcePath"), route);
assert.equal(entryUrl.searchParams.get("journey"), "new");

const experiment = experiments.byId[guide.experimentId];
assert(experiment && experiment.landingPath === route);
assert.equal(experiment.baseline.propertyTypeImpressions, 28);
assert.equal(experiment.baseline.averagePosition, 27.1);
assert.equal(experiment.baseline.marketImpressions, 185);
assert.equal(experiment.startVersion, "market-development-sprint-b");
assert.equal(experiments.cityProjection["CA/san-diego"].featuredSpaceType.path, route);
assert.equal(experiments.cityProjection["CA/san-diego"].intelligenceState, "universal_with_local_context");

const guideText = JSON.stringify(guide);
assert(!/ranked #|district score|recommendation ready|best industrial district|best location for your/i.test(guideText));
assert.match(guideText, /without automatically ranking/);
assert.match(guideText, /property-level|property-specific/);
assert(read("city.njk").includes("featuredSpaceType"), "San Diego city discovery must use the bounded featured-space-type projection");

const temp = fs.mkdtempSync(path.join(os.tmpdir(), "rofo-san-diego-industrial-"));
execFileSync(path.join(ROOT, "node_modules/esbuild/bin/esbuild"), [path.join(ROOT, "functions/api/location-brief-v2/_shared.js"), "--bundle", "--platform=node", "--format=cjs", `--outfile=${path.join(temp, "shared.cjs")}`], { stdio: "pipe" });
const shared = require(path.join(temp, "shared.cjs"));
const requirement = (candidateDistrictIds = []) => ({
  schemaVersion: "requirement:v1",
  propertyTypes: ["industrial_flex"],
  activities: ["store", "receive", "ship_distribute"],
  businessContext: { summary: "San Diego Industrial public-market QA" },
  locationLogic: { marketAnchor: { marketId: "san-diego", geographyId: "san-diego", displayName: "San Diego" }, specificPreference: { candidateDistrictIds, candidateDistrictNames: candidateDistrictIds } },
  criteria: [],
});
const neutralSnapshot = shared.calculateSnapshot(requirement());
const candidateSnapshot = shared.calculateSnapshot(requirement(["miramar"]));
assert.equal(neutralSnapshot.readiness, "INVESTIGATE", "San Diego must remain non-certified in the public Brief path");
assert.deepEqual(neutralSnapshot.shortlist, [], "The universal Brief must not emit local rankings");
assert.deepEqual(candidateSnapshot.shortlist, neutralSnapshot.shortlist, "Entry geography must remain scoring-neutral");
fs.rmSync(temp, { recursive: true, force: true });

console.log("San Diego Industrial Public Consolidation QA passed: four reviewed decision contexts, coherent Sorrento identity, five representative environments, controlled entry, and non-ranked intelligence boundary verified.");
