const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const discovery = require("../_data/sfPublicDiscovery");
const pages = require("../_data/neighborhoodPages");
const spaceTypePages = require("../_data/spaceTypePages");
const officeCoverage = require("../_data/sfOfficeMarketCoverage");
const retailCoverage = require("../_data/sfRetailMarketCoverage");
const industrialFlexCoverage = require("../_data/sfIndustrialFlexMarketCoverage");
const retailGeographies = require("../_data/sfRetailDecisionGeographies");
const readiness = require("../lib/eos/market-readiness").buildMarketReadiness();

const sfBase = "/commercial-real-estate/CA/san-francisco/";
const publicPaths = new Set(pages.filter((item) => item.city_slug === "san-francisco" && item.state_abbr === "CA" && !item.noindex).map((item) => item.canonical_neighborhood_path));
const flatten = (guide) => guide.groups.flatMap((group) => group.entries);
const meaningful = (coverage) => coverage.decisionGeographies
  .filter((item) => /^(CORE|SITUATIONAL)_/.test(item.classification || ""))
  .map((item) => item.districtId)
  .sort();

assert.equal(discovery.city.paths.length, 4, "SF city discovery must expose four bounded paths, not a flat geography dump.");
assert.deepEqual(discovery.city.paths.map((item) => item.id), ["office", "retail", "industrial", "flex"]);
for (const decisionPath of discovery.city.paths) {
  assert(decisionPath.locations.length <= 3, `${decisionPath.id} city orientation must remain compact.`);
  assert(decisionPath.path.startsWith(sfBase) && /-space\/$/.test(decisionPath.path), `${decisionPath.id} must target its canonical space-type page.`);
  for (const item of decisionPath.locations) assert(publicPaths.has(item.path), `${item.id} city discovery link must resolve canonically.`);
}

const expected = {
  office: meaningful(officeCoverage),
  retail: meaningful(retailCoverage),
  industrial: meaningful(industrialFlexCoverage.industrial),
  flex: meaningful(industrialFlexCoverage.flex),
};
for (const [model, guide] of Object.entries(discovery.guides)) {
  const entries = flatten(guide);
  assert.deepEqual(entries.map((item) => item.id).sort(), expected[model], `${model} guide must expose its exact certified universe once.`);
  assert.equal(new Set(entries.map((item) => item.id)).size, entries.length, `${model} guide cannot duplicate geography across groups.`);
  for (const item of entries) assert(publicPaths.has(item.path), `${model}:${item.id} must link to its Sprint 1 canonical surface.`);
  assert(guide.recommendation.path.startsWith("/best-fit-locations/?city=San%20Francisco&state=CA&marketId=san-francisco"));
  assert(guide.recommendation.path.includes("source=space_type") && guide.recommendation.path.includes("sourcePath="));
}

for (const parent of retailGeographies.parents) {
  assert(!flatten(discovery.guides.retail).some((item) => item.id === parent.districtId), `${parent.districtId} must present as context, not a peer Retail decision.`);
  assert(discovery.guides.retail.parentContexts.some((item) => item.name === parent.districtName));
}
assert(flatten(discovery.guides.retail).some((item) => item.id === "valencia-street"));
assert(flatten(discovery.guides.retail).some((item) => item.id === "chestnut-street"));
assert(flatten(discovery.guides.retail).some((item) => item.id === "union-street-cow-hollow"));

const industrialIds = new Set(flatten(discovery.guides.industrial).map((item) => item.id));
assert(industrialIds.has("potrero-hill") && !industrialIds.has("soma") && !industrialIds.has("northeast-mission-pdr"));
assert(discovery.guides.industrial.contexts.some((item) => item.name === "SoMa" && /not conventional Industrial/.test(item.explanation)));
assert(discovery.guides.industrial.contexts.some((item) => item.name.includes("Piers 80")));
assert(discovery.guides.industrial.contexts.some((item) => item.name === "Broader Bayview"));

const flexIds = new Set(flatten(discovery.guides.flex).map((item) => item.id));
assert(flexIds.has("soma") && flexIds.has("potrero-hill"));
assert(/not weaker Industrial/i.test(discovery.guides.flex.title));

const sfSpacePages = new Map(spaceTypePages.filter((item) => item.city_slug === "san-francisco").map((item) => [item.page_slug, item]));
for (const slug of ["office-space", "retail-space", "industrial-space", "flex-space"]) assert(sfSpacePages.get(slug)?.localDecisionGuide, `${slug} must receive a certified local guide.`);

const serialized = JSON.stringify(discovery);
for (const prohibited of ["#1", "top 10", "most popular", "best neighborhood"]) assert(!serialized.toLowerCase().includes(prohibited), `Discovery cannot imply a false ranking with ${prohibited}.`);

const cityTemplate = fs.readFileSync(path.join(root, "city.njk"), "utf8");
assert(cityTemplate.includes("sf-space-type-discovery.njk"));
assert(cityTemplate.includes("not isSanFranciscoDecisionJourney"), "The old flat SF neighborhood list must be demoted.");
const guideTemplate = fs.readFileSync(path.join(root, "_includes/partials/space-type/local-decision-guide.njk"), "utf8");
assert(guideTemplate.includes("space-type-decision-group") && guideTemplate.includes("parentContexts") && guideTemplate.includes("contexts"));
const css = fs.readFileSync(path.join(root, "assets/css/system.css"), "utf8");
assert(css.includes("@media (max-width: 680px)") && css.includes(".sf-space-type-discovery__grid") && css.includes("grid-template-columns: 1fr"));

const siteRoot = path.join(root, "_site", "commercial-real-estate", "CA", "san-francisco");
const rendered = ["index", "office-space", "retail-space", "industrial-space", "flex-space"].map((slug) => slug === "index" ? path.join(siteRoot, "index.html") : path.join(siteRoot, slug, "index.html"));
if (rendered.every((file) => fs.existsSync(file))) {
  const cityHtml = fs.readFileSync(rendered[0], "utf8");
  for (const label of ["Office", "Retail", "Industrial / Warehouse", "Flex"]) assert(cityHtml.includes(label));
  assert((cityHtml.match(/sf-space-type-discovery__card/g) || []).length === 4);
  assert(!cityHtml.includes("city-neighborhoods-all"), "SF city must not render the generic flat neighborhood directory.");
  assert(cityHtml.includes("See My Best-Fit Locations") && cityHtml.includes("marketId=san-francisco") && cityHtml.includes("source=city"), "SF city Best-Fit entry must preserve canonical market context.");
  for (const [index, model] of ["office", "retail", "industrial", "flex"].entries()) {
    const html = fs.readFileSync(rendered[index + 1], "utf8");
    for (const item of flatten(discovery.guides[model])) assert(html.includes(`href="${item.path}"`), `${model}:${item.id} missing from rendered guide.`);
    assert(html.includes("See My Best-Fit Locations"));
    assert(!/#1|Top 10|Most popular/i.test(html));
  }
}

const sf = readiness.markets.find((market) => market.marketId === "san-francisco");
assert(["Building", "Ready"].includes(sf.workloads.publicExperience.status));
assert.equal(readiness.currentPriority.selection.label, "SF Public Experience");

console.log(`SF Public Experience Sprint 2 QA passed: city has ${discovery.city.paths.length} decision paths; Office ${expected.office.length}, Retail ${expected.retail.length}, Industrial ${expected.industrial.length}, Flex ${expected.flex.length}.`);
