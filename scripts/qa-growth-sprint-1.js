"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.join(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(ROOT, file), "utf8");
const pages = require(path.join(ROOT, "_data/spaceTypePages.js"));
const neighborhoods = require(path.join(ROOT, "_data/neighborhoodPages.js"));
const cities = require(path.join(ROOT, "_data/cities.js"))();
const experiments = require(path.join(ROOT, "_data/growthExperiments.js"));

const page = (city, type) => pages.find((item) => item.city.slug === city && item.spaceType.slug === type);
const neighborhood = (permalink) => neighborhoods.find((item) => item.canonical_neighborhood_path === permalink);
const assertControlledEntry = (href, city, state) => {
  assert(href.startsWith("/best-fit-locations/?"), `${city} entry must use the controlled router`);
  const url = new URL(href, "https://www.rofo.com");
  assert.equal(url.searchParams.get("city"), city);
  assert.equal(url.searchParams.get("state"), state);
  assert(["city", "space_type"].includes(url.searchParams.get("source")));
  assert.equal(url.searchParams.get("journey"), "new");
  assert(url.searchParams.get("sourcePath")?.startsWith("/commercial-real-estate/"));
};

assert.equal(experiments.schemaVersion, "growth-experiments:v1");
assert.equal(experiments.experiments.length, 8, "The experiment registry must remain bounded to the five Growth Sprint 1 hypotheses plus Sacramento, San Diego, and San Jose Industrial");
assert(experiments.experiments.every((item) => item.deploymentDate === null && item.reviewStatus === "implementation_complete_pending_deployment"));
assert(experiments.observationPolicy.firstMeaningfulReview.includes("14 complete post-deployment days"));

const antioch = page("antioch", "industrial-space");
assert(antioch?.localDecisionGuide, "Antioch Industrial must project without inventory");
assert.equal(antioch.representativeBuildings.length, 0, "Retail buildings must not be substituted as Industrial evidence");
assert.equal(antioch.localDecisionGuide.suppressInventoryModule, true);
assert.equal(antioch.localDecisionGuide.experimentId, "growth-antioch-industrial-v1");
assert(antioch.localDecisionGuide.entries.some((item) => item.path.endsWith("/antioch-east-18th-industrial/")));
assertControlledEntry(antioch.localDecisionGuide.recommendation.path, "Antioch", "CA");

const tempe = page("tempe", "industrial-space");
assert.equal(tempe?.localDecisionGuide?.experimentId, "growth-tempe-industrial-v1");
assert(tempe.localDecisionGuide.entries.some((item) => item.path.endsWith("/tempe-i-10-industrial/")));
assert(tempe.localDecisionGuide.representativeEnvironment);
assert(tempe.localDecisionGuide.relatedGuides.some((item) => item.path.endsWith("/flex-space/")));
assert(tempe.localDecisionGuide.relatedGuides.some((item) => item.path.includes("/phoenix/industrial-space/") && /orientation|not a claim/i.test(item.explanation)));
assertControlledEntry(tempe.localDecisionGuide.recommendation.path, "Tempe", "AZ");

const indy = page("indianapolis", "industrial-space");
assert.equal(indy?.localDecisionGuide?.experimentId, "growth-indianapolis-industrial-v1");
assert(indy.localDecisionGuide.entries.some((item) => item.path.endsWith("/indianapolis-airport-logistics/")));
assert.match(indy.localDecisionGuide.representativeEnvironment.name, /558 Airtech/i);
assertControlledEntry(indy.localDecisionGuide.recommendation.path, "Indianapolis", "IN");

for (const route of [
  "/commercial-real-estate/CA/antioch/antioch-east-18th-industrial/",
  "/commercial-real-estate/AZ/tempe/tempe-i-10-industrial/",
  "/commercial-real-estate/IN/indianapolis/indianapolis-airport-logistics/",
]) {
  const entry = neighborhood(route);
  assert(entry, `${route} must resolve to its existing public geography owner`);
  assert.notEqual(entry.noindex, true, `${route} must remain indexable`);
}

const sfRetail = page("san-francisco", "retail-space");
assert.equal(sfRetail.localDecisionGuide.experimentId, "growth-sf-retail-v1");
assert.match(sfRetail.seoTitle, /Retail Location Guide/);
assert.match(sfRetail.h1, /Retail Districts and Corridors/);
assert.equal(sfRetail.localDecisionGuide.groups.flatMap((group) => group.entries).length, 19, "Certified Retail decision coverage must not change");
assertControlledEntry(sfRetail.localDecisionGuide.recommendation.path, "San Francisco", "CA");
const sfDiscovery = require(path.join(ROOT, "_data/sfPublicDiscovery.js"));
assert(sfDiscovery.city.paths.some((item) => item.path === "/commercial-real-estate/CA/san-francisco/retail-space/"));

const aliso = cities.find((item) => item.slug === "aliso-viejo" && item.state_abbr === "CA");
assert.equal(aliso.growth_experiment.experimentId, "growth-aliso-viejo-office-v1");
assert.match(aliso.seo_title, /Office Market and Location Guide/);
assert.match(aliso.seo_description, /property details to verify/);
const cityTemplate = read("city.njk");
assert(cityTemplate.includes("What does the market context mean for an Aliso Viejo tenant?"));
assert(cityTemplate.includes("Rent ranges, availability, lease terms, building condition, and property-specific facts must be verified for the current search."));
assert(cityTemplate.includes("city=Aliso%20Viejo&amp;state=CA&amp;spaceType=Office&amp;source=city"));

const prompt = read("_includes/partials/shared/recommendation-prompt-card.njk");
assert(prompt.includes("intelligence_state"), "Landing attribution must preserve the intelligence state");
for (const guide of [antioch.localDecisionGuide, tempe.localDecisionGuide, indy.localDecisionGuide]) {
  assert(!guide.recommendation.path.includes("/find-locations/"));
  assert(!/ranked recommendation|best industrial district/i.test(JSON.stringify(guide)), "Partial intelligence must not claim Level 3 conclusions");
}

console.log("Growth Sprint 1 QA passed: original five experiments plus the bounded Sacramento, San Diego, and San Jose extensions, public projections, intelligence boundaries, canonical continuity, controlled entry, and observation contracts verified.");
