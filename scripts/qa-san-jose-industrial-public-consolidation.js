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
const classifications = require(path.join(ROOT, "_data/sanJoseBuildingClassificationOverrides.js"));
const experiments = require(path.join(ROOT, "_data/growthExperiments.js"));

const route = "/commercial-real-estate/CA/san-jose/industrial-space/";
const page = pages.find((item) => item.city.slug === "san-jose" && item.spaceType.slug === "industrial-space");
assert(page?.localDecisionGuide, "San Jose Industrial must project onto the existing canonical Industrial route");
const guide = page.localDecisionGuide;

assert.equal(guide.experimentId, "growth-san-jose-industrial-v1");
assert.equal(guide.suppressInventoryModule, true, "Curated representative context must replace generic building inventory on this guide");
assert.match(guide.seoTitle, /San Jose Industrial, Warehouse and Flex Location Guide/);
assert.match(guide.h1, /Industrial, Warehouse and Flex Space in San Jose/);
assert.match(guide.heroLead, /R&D and technical Flex, advanced manufacturing, hardware and office-production/i);

const north = guide.entries.find((item) => item.id === "north-san-jose");
const monterey = guide.entries.find((item) => item.id === "monterey-business-corridor");
const berryessa = guide.entries.find((item) => item.id === "berryessa-international-business-park");
assert.equal(guide.entries.length, 3, "The bounded guide must contain exactly three operating contexts");
assert.equal(north.path, "/commercial-real-estate/CA/san-jose/north-san-jose/");
const northOwner = neighborhoods.find((item) => item.canonical_neighborhood_path === north.path);
assert(northOwner && northOwner.noindex !== true, "North San Jose must retain its canonical public identity");
assert.equal(northOwner.commercial_location_model?.review_status, "researched");
assert.match(north.summary, /Montague Expressway is a subarea/i);
assert.match(north.tradeoffs.join(" "), /not.*conventional logistics|conventional logistics/i);

for (const section of [monterey, berryessa]) {
  assert.equal(section.path, undefined, `${section.name} must remain a section rather than creating a public route`);
  assert(section.strengths.length >= 2 && section.tradeoffs.length >= 2);
}
assert.match(monterey.summary, /service-industrial|contractor|fabrication/i);
assert.match(berryessa.summary, /office\/warehouse|light-manufacturing|distribution/i);
assert(!guide.entries.some((item) => /montague/i.test(item.id) || /airport/i.test(item.id)), "Montague and Airport must not become Industrial peers");
assert.equal(guide.contexts.length, 1);
assert.equal(guide.contexts[0].path, "/commercial-real-estate/CA/san-jose/airport-golden-triangle/");
assert.match(guide.contexts[0].explanation, /not an equivalent Industrial decision geography/i);

const expectedRepresentatives = new Map([
  ["/commercial-real-estate/building/CA/san-jose/1510-montague-expy/", "North San Jose"],
  ["/commercial-real-estate/building/CA/san-jose/350-w-trimble-rd/", "North San Jose"],
  ["/commercial-real-estate/building/CA/san-jose/1650-las-plumas-ave/", "Berryessa / International Business Park"],
  ["/commercial-real-estate/building/CA/san-jose/1580-1630-old-oakland-road/", "Berryessa / International Business Park"],
  ["/commercial-real-estate/building/CA/san-jose/1801-smith-ave/", "Monterey Business Corridor"],
]);
assert.equal(guide.representativeEnvironments.length, 5);
assert.equal(new Set(guide.representativeEnvironments.map((item) => item.path)).size, 5);
for (const example of guide.representativeEnvironments) {
  assert.equal(example.contextName, expectedRepresentatives.get(example.path), `${example.path} must have reviewed representative ownership`);
  assert(buildingPages.some((item) => item.building_path === example.path), `${example.path} must reuse a canonical building page`);
}
assert.match(guide.representativeDisclaimer, /may not be currently available/i);
assert.match(guide.representativeDisclaimer, /property-level investigation/i);
assert(guide.provenance.length >= 3, "Public decision evidence must retain reviewed provenance");

const berryessaPaths = guide.evidenceResolution.berryessa.representativePaths;
assert.equal(guide.evidenceResolution.berryessa.status, "validated");
assert.equal(berryessaPaths.length, 2, "Berryessa requires at least two validated representatives");
assert(berryessaPaths.every((item) => expectedRepresentatives.get(item) === "Berryessa / International Business Park"));
assert.equal(guide.evidenceResolution.trimble.status, "classification_reconciled");
assert.equal(guide.evidenceResolution.monterey1706.status, "excluded");
assert(!expectedRepresentatives.has(guide.evidenceResolution.monterey1706.path), "1706 Monterey must never be representative Industrial evidence");
assert.equal(guide.evidenceResolution.smith1801.context, "Monterey Business Corridor / Fairgrounds edge");

const buildingByPath = new Map(buildingPages.map((item) => [item.building_path, item]));
assert.equal(buildingByPath.get("/commercial-real-estate/building/CA/san-jose/350-w-trimble-rd/").primary_space_type, "flex");
assert.equal(buildingByPath.get("/commercial-real-estate/building/CA/san-jose/1650-las-plumas-ave/").primary_space_type, "flex");
assert.equal(buildingByPath.get("/commercial-real-estate/building/CA/san-jose/1580-1630-old-oakland-road/").primary_space_type, "flex");
assert.equal(buildingByPath.get("/commercial-real-estate/building/CA/san-jose/1706-monterey-hwy/").primary_space_type, "commercial");
for (const key of ["CA|san-jose|350-w-trimble-rd", "CA|san-jose|1650-las-plumas-ave", "CA|san-jose|1580-1630-old-oakland-road", "CA|san-jose|1706-monterey-hwy"]) {
  assert.equal(classifications.overrides[key].classification_review.status.startsWith("reviewed"), true);
  assert(classifications.overrides[key].classification_review.provenance.length > 0);
}

const entryUrl = new URL(guide.recommendation.path, "https://www.rofo.com");
assert.equal(entryUrl.pathname, "/best-fit-locations/");
assert.equal(entryUrl.searchParams.get("city"), "San Jose");
assert.equal(entryUrl.searchParams.get("state"), "CA");
assert.equal(entryUrl.searchParams.get("marketId"), "san-jose");
assert.equal(entryUrl.searchParams.get("spaceType"), "Industrial / Warehouse / Flex");
assert.equal(entryUrl.searchParams.get("source"), "space_type");
assert.equal(entryUrl.searchParams.get("sourcePath"), route);
assert.equal(entryUrl.searchParams.get("journey"), "new");

const experiment = experiments.byId[guide.experimentId];
assert(experiment && experiment.landingPath === route);
assert.deepEqual({ market: experiment.baseline.marketImpressions, industrial: experiment.baseline.propertyTypeImpressions, position: experiment.baseline.averagePosition, clicks: experiment.baseline.clicks }, { market: 317, industrial: 43, position: 24.3, clicks: 0 });
assert.equal(experiment.deploymentDate, null);
assert.equal(experiments.cityProjection["CA/san-jose"].featuredSpaceType.path, route);
assert.equal(experiments.cityProjection["CA/san-jose"].intelligenceState, "universal_with_local_context");
assert(read("city.njk").includes("featuredSpaceType"), "San Jose city discovery must expose the Industrial guide");

const guideText = JSON.stringify(guide);
assert(!/ranked #|district score|recommendation ready|best industrial district|live inventory|currently available spaces/i.test(guideText));
assert.match(guideText, /without automatically ranking/i);

const temp = fs.mkdtempSync(path.join(os.tmpdir(), "rofo-san-jose-industrial-"));
execFileSync(path.join(ROOT, "node_modules/esbuild/bin/esbuild"), [path.join(ROOT, "functions/api/location-brief-v2/_shared.js"), "--bundle", "--platform=node", "--format=cjs", `--outfile=${path.join(temp, "shared.cjs")}`], { stdio: "pipe" });
const shared = require(path.join(temp, "shared.cjs"));
const requirement = (candidateDistrictIds = []) => ({
  schemaVersion: "requirement:v1",
  propertyTypes: ["industrial_flex"],
  activities: ["work", "prototype", "light_production", "receive"],
  businessContext: { summary: "San Jose Industrial public consolidation QA" },
  locationLogic: { marketAnchor: { marketId: "san-jose", geographyId: "san-jose", displayName: "San Jose" }, specificPreference: { candidateDistrictIds, candidateDistrictNames: candidateDistrictIds } },
  criteria: [],
});
const neutralSnapshot = shared.calculateSnapshot(requirement());
const candidateSnapshot = shared.calculateSnapshot(requirement(["north-san-jose"]));
assert.equal(neutralSnapshot.readiness, "INVESTIGATE", "San Jose must remain Universal/INVESTIGATE");
assert.deepEqual(neutralSnapshot.shortlist, [], "San Jose must not emit a local shortlist");
assert.deepEqual(candidateSnapshot.shortlist, neutralSnapshot.shortlist, "Entry geography must remain candidate-neutral");
fs.rmSync(temp, { recursive: true, force: true });

const builtPath = path.join(ROOT, "_site/commercial-real-estate/CA/san-jose/industrial-space/index.html");
if (fs.existsSync(builtPath)) {
  const html = fs.readFileSync(builtPath, "utf8");
  assert(html.includes('<link rel="canonical" href="https://www.rofo.com/commercial-real-estate/CA/san-jose/industrial-space/">'));
  assert(!/<meta[^>]+robots[^>]+noindex/i.test(html), "The canonical guide must remain indexable");
  assert(html.includes('type="application/ld+json"'), "Existing structured data must render");
  assert(!html.includes("Example industrial spaces in San Jose"), "The generic inventory module must stay suppressed");
  for (const representativePath of expectedRepresentatives.keys()) assert(html.includes(`href="${representativePath}"`));
  assert(html.includes("marketId=san-jose") && html.includes("journey=new"), "Rendered Best-Fit entries must retain controlled context");
  assert(read("_site/sitemap.xml").includes(`<loc>https://www.rofo.com${route}</loc>`), "The canonical guide must remain in the sitemap");
}

const briefHandler = read("functions/operator/location-brief-v2/[publicId].js");
assert.match(briefHandler, /Find Spaces That Fit/);
assert.match(briefHandler, /existing Business Profile and Location Brief/);
assert.match(briefHandler, /Actual availability and property-specific details require investigation/);

console.log("San Jose Industrial Public Consolidation QA passed: reviewed evidence cleanup, three bounded contexts, five representative environments, controlled entry, and Universal/INVESTIGATE neutrality verified.");
