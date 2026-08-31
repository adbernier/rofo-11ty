const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.join(__dirname, "..");
const experiments = require(path.join(ROOT, "_data/growthExperiments.js"));
const cities = require(path.join(ROOT, "_data/cities.js"))();
const spaceTypePages = require(path.join(ROOT, "_data/spaceTypePages.js"));
const gsc = require(path.join(ROOT, "data/generated/search-console-opportunity.json"));

const cohort = [
  { state: "IL", slug: "deerfield", impressions: 163, queryCount: 3, paths: ["office-space"] },
  { state: "CA", slug: "chula-vista", impressions: 106, queryCount: 4, paths: ["office-space", "retail-space", "industrial-space"] },
  { state: "CA", slug: "costa-mesa", impressions: 94, queryCount: 1, paths: ["office-space", "industrial-space"] },
  { state: "CA", slug: "fullerton", impressions: 84, queryCount: 2, paths: [] },
  { state: "CA", slug: "rancho-cordova", impressions: 37, queryCount: 3, paths: ["office-space", "industrial-space"] },
];

assert.equal(gsc.sourceDateRange, "2026-07-30:2026-08-26");
assert.equal(gsc.status.mode, "live");

for (const item of cohort) {
  const experiment = experiments.experiments.find((entry) => entry.id === `growth-harvest-${item.slug}-city-v1`);
  assert(experiment, `${item.slug} must have a bounded Harvest experiment`);
  assert.equal(experiment.baseline.relevantImpressions, item.impressions);
  assert.equal(experiment.baseline.queryCount, item.queryCount);
  assert.equal(experiment.baseline.clicks, 0);
  assert.equal(experiment.deploymentDate, null);
  assert.equal(experiment.reviewStatus, "implementation_complete_pending_deployment");
  assert.equal(experiment.landingPath, `/commercial-real-estate/${item.state}/${item.slug}/`);

  const projection = experiments.cityProjection[`${item.state}/${item.slug}`];
  assert(projection, `${item.slug} must have a city projection`);
  assert.equal(projection.experimentId, experiment.id);
  assert.match(projection.seoTitle, new RegExp(item.slug.split("-").map((part) => part[0].toUpperCase() + part.slice(1)).join(" "), "i"));
  assert(projection.seoDescription.length >= 90 && projection.seoDescription.length <= 170);
  assert(projection.h1);
  assert(projection.heroLead);
  assert(projection.decisionGuide?.summary);
  assert(projection.decisionGuide.links.length >= 2);
  assert(!/\b(best|ideal|prime|thriving|vibrant)\b/i.test(JSON.stringify(projection)), `${item.slug} must avoid unsupported promotional claims`);
  assert(!/\b(rent|vacancy|available suites?|foot traffic)\b/i.test(JSON.stringify(projection)), `${item.slug} must avoid current market/property claims`);

  const city = cities.find((entry) => entry.slug === item.slug && entry.state_abbr === item.state);
  assert(city, `${item.slug} city must exist`);
  assert.equal(city.seo_title, projection.seoTitle);
  assert.equal(city.seo_description, projection.seoDescription);
  assert.equal(city.h1, projection.h1);

  for (const pageSlug of item.paths) {
    assert(spaceTypePages.some((page) => page.city_slug === item.slug && page.state_abbr === item.state && page.page_slug === pageSlug), `${item.slug}/${pageSlug} must be canonical and buildable`);
    assert(projection.decisionGuide.links.some((link) => link.path === `/commercial-real-estate/${item.state}/${item.slug}/${pageSlug}/`), `${item.slug} must link semantically to ${pageSlug}`);
  }
}

assert.equal(spaceTypePages.some((page) => page.city_slug === "fullerton" && page.state_abbr === "CA"), false, "Fullerton must not link to a currently unbuildable space-type surface");
assert(experiments.cityProjection["CA/fullerton"].decisionGuide.links.every((link) => !/\/(office|retail|industrial|flex)-space\/$/.test(link.path)), "Fullerton must preserve space-type ownership until a canonical surface is buildable");

const cityTemplate = fs.readFileSync(path.join(ROOT, "city.njk"), "utf8");
for (const token of ['"market_id": city.slug', '"journey": "new"', "city.growth_experiment.heroLead", "city.growth_experiment.decisionGuide"]) {
  assert(cityTemplate.includes(token), `city template must include ${token}`);
}
assert(cityTemplate.includes("See My Best-Fit Locations") || fs.readFileSync(path.join(ROOT, "_includes/partials/shared/recommendation-prompt-card.njk"), "utf8").includes("See My Best-Fit Locations"));

const outputRoot = path.join(ROOT, "_site/commercial-real-estate");
if (fs.existsSync(outputRoot)) {
  const sitemap = fs.readFileSync(path.join(ROOT, "_site/sitemap.xml"), "utf8");
  for (const item of cohort) {
    const outputPath = path.join(outputRoot, item.state, item.slug, "index.html");
    if (!fs.existsSync(outputPath)) continue;
    const html = fs.readFileSync(outputPath, "utf8");
    const projection = experiments.cityProjection[`${item.state}/${item.slug}`];
    assert(html.includes(projection.seoTitle));
    assert(html.includes(projection.seoDescription));
    assert(html.includes(projection.h1));
    assert(html.includes(`marketId=${item.slug}`));
    assert(html.includes("journey=new"));
    assert(html.includes("sourcePath="));
    assert(html.includes("rel=\"canonical\""));
    assert(html.includes("application/ld+json"));
    assert(!/noindex/i.test(html.match(/<meta[^>]+robots[^>]*>/i)?.[0] || ""));
    assert(sitemap.includes(`/commercial-real-estate/${item.state}/${item.slug}/`));
  }
}

console.log("SEO Harvest city cohort QA passed.");
