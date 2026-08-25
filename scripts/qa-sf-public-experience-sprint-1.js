const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const pages = require("../_data/neighborhoodPages");
const surfaces = require("../_data/sfPublicDecisionSurfaces");
const office = require("../_data/sfOfficeMarketCoverage");
const retail = require("../_data/sfRetailMarketCoverage");
const industrialFlex = require("../_data/sfIndustrialFlexMarketCoverage");
const retailGeographies = require("../_data/sfRetailDecisionGeographies");
const readiness = require("../lib/eos/market-readiness").buildMarketReadiness();

const sfBase = "/commercial-real-estate/CA/san-francisco/";
const byPath = new Map(pages.map((page) => [page.canonical_neighborhood_path, page]));
const newRetailIds = ["sacramento-street", "fillmore-street", "union-street-cow-hollow", "chestnut-street", "valencia-street", "upper-market-castro", "north-beach"];
const upgradedIds = ["chinatown", "south-beach", "mission-district", "civic-center", "bayview-industrial", "central-waterfront"];

for (const id of [...newRetailIds, ...upgradedIds]) {
  const route = `${sfBase}${id}/`;
  const page = byPath.get(route);
  assert(page, `${id} must resolve to a public page.`);
  assert.equal(page.noindex, false, `${id} must be indexable.`);
  assert.equal(page.prototype, false, `${id} must not use prototype state.`);
  assert(page.public_decision_surface?.identity && page.public_decision_surface?.tradeoffs?.length, `${id} must expose reviewed decision content and tradeoffs.`);
  assert.equal(page.meta_description, page.public_decision_surface.lead);
}

const meaningful = [
  ...office.decisionGeographies.filter((item) => !/GENERALLY_NOT|NEEDS_REVIEW/.test(item.classification)),
  ...retail.decisionGeographies.filter((item) => !/GENERALLY_NOT/.test(item.classification)),
  ...industrialFlex.industrial.decisionGeographies.filter((item) => !/GENERALLY_NOT/.test(item.classification)),
  ...industrialFlex.flex.decisionGeographies.filter((item) => !/GENERALLY_NOT/.test(item.classification)),
];
for (const item of meaningful) {
  const route = item.canonicalPath || `${sfBase}${item.districtId}/`;
  const page = byPath.get(route);
  assert(page && !page.noindex, `${item.districtId} must have an indexable canonical public route.`);
  assert(page.public_decision_surface || page.district_identity || page.commercial_location_model, `${item.districtId} must have a useful decision projection.`);
}

assert.equal(new Set(surfaces.surfaces.map((item) => item.path)).size, surfaces.surfaces.length, "Decision surfaces must have one canonical route each.");
for (const surface of surfaces.surfaces) {
  for (const relation of [...(surface.related || []), ...(surface.children || [])]) {
    assert(byPath.has(relation.path), `${surface.id} relation ${relation.path} must resolve.`);
  }
  if (surface.parent) assert(byPath.has(surface.parent.path), `${surface.id} parent must resolve.`);
}

const marina = surfaces.byPath[`${sfBase}marina-district/`];
assert.deepEqual(marina.children.map((item) => item.name), ["Chestnut Street", "Union Street / Cow Hollow"]);
const mission = surfaces.byPath[`${sfBase}mission-district/`];
assert.deepEqual(mission.children.map((item) => item.name), ["Valencia Street"]);
for (const parent of retailGeographies.parents) {
  assert(!retailGeographies.approved.some((item) => item.districtId === parent.districtId), `${parent.districtId} must remain presentation-only for Retail.`);
}
assert(surfaces.byPath[`${sfBase}bayview-industrial/`].identity.includes("Broader Bayview"));
assert(surfaces.byPath[`${sfBase}potrero-hill/`].identity.includes("residential hill is not"));

const prompt = fs.readFileSync(path.join(root, "_includes/partials/shared/recommendation-prompt-card.njk"), "utf8");
for (const token of ["See My Best-Fit Locations", "districtId=", "sourcePath=", "retail", "industrial", "/best-fit-locations/"]) assert(prompt.includes(token), `Recommendation prompt must preserve ${token}.`);
const template = fs.readFileSync(path.join(root, "pages/commercial-real-estate/neighborhood.njk"), "utf8");
assert(template.includes("public-decision-surface.njk"));
assert(template.includes('"default_space_type": neighborhood.public_decision_surface.defaultSpaceType'));
const mobilePrompt = fs.readFileSync(path.join(root, "_includes/partials/shared/search-profile-mobile-entry.njk"), "utf8");
for (const token of ["mobileUsesVnext", "marketId=san-francisco", "mobilePromptDistrictId", "/best-fit-locations/"]) assert(mobilePrompt.includes(token), `Mobile recommendation entry must preserve ${token}.`);

const sf = readiness.markets.find((market) => market.marketId === "san-francisco");
assert(["Building", "Ready"].includes(sf.workloads.publicExperience.status));
assert.equal(readiness.currentPriority.selection.label, "SF Public Experience");

const siteRoot = path.join(root, "_site", "commercial-real-estate", "CA", "san-francisco");
const renderedRoutes = [...newRetailIds, ...upgradedIds].map((id) => path.join(siteRoot, id, "index.html"));
if (renderedRoutes.every((route) => fs.existsSync(route))) {
  for (const id of [...newRetailIds, ...upgradedIds]) {
    const html = fs.readFileSync(path.join(siteRoot, id, "index.html"), "utf8");
    assert(html.includes(`<link rel="canonical" href="https://www.rofo.com${sfBase}${id}/">`));
    assert(!html.includes('name="robots" content="noindex'));
    assert(html.includes("See My Best-Fit Locations"));
    assert(html.includes(`/location-requirement/?city=San%20Francisco`));
    assert(html.includes(`districtId=${id}`));
    assert(html.includes("What kind of space") === false, "Public surface must not leak interview UI.");
    assert(!/being reviewed|possible Rofo neighborhood page|evaluation state/i.test(html), `${id} must not expose evaluation language.`);
  }
  const northBeach = fs.readFileSync(path.join(siteRoot, "north-beach", "index.html"), "utf8");
  assert(northBeach.includes(`${sfBase}chinatown/`));
  const marinaHtml = fs.readFileSync(path.join(siteRoot, "marina-district", "index.html"), "utf8");
  assert(marinaHtml.includes(`${sfBase}chestnut-street/`) && marinaHtml.includes(`${sfBase}union-street-cow-hollow/`));
  const missionHtml = fs.readFileSync(path.join(siteRoot, "mission-district", "index.html"), "utf8");
  assert(missionHtml.includes(`${sfBase}valencia-street/`));
}

console.log(`SF Public Experience Sprint 1 QA passed: ${newRetailIds.length} new Retail routes, ${upgradedIds.length} upgraded surfaces, and ${new Set(meaningful.map((item) => item.districtId)).size} recommendation geographies covered.`);
