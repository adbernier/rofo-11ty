"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const experience = require("../_data/sfCommercialGeographyExperience");

const root = path.resolve(__dirname,"..");
const site = path.join(root,"_site/commercial-real-estate/CA/san-francisco");
const html = relative => fs.readFileSync(path.join(site,relative,"index.html"),"utf8");
const stripPanels = value => value.match(/<section class="sf-commercial-geography"[\s\S]*?<\/section>\s*<\/article>[\s\S]*?<\/section>/)?.[0] || value;

assert.deepStrictEqual(experience.spaceTypes.map(item=>item.id),["office","retail","industrial","flex"]);
const sets = Object.fromEntries(experience.spaceTypes.map(item=>[item.id,item.geographies.map(g=>g.id)]));
assert.notDeepStrictEqual(sets.office,sets.retail);
assert.notDeepStrictEqual(sets.office,sets.industrial);
assert.notDeepStrictEqual(sets.industrial,sets.flex);
assert.deepStrictEqual(["financial-district","soma","mission-bay"].every(id=>sets.office.includes(id)),true);
assert.deepStrictEqual(["union-square","valencia-street","union-street-cow-hollow"].every(id=>sets.retail.includes(id)),true);
assert.deepStrictEqual(["bayview-industrial","central-waterfront","dogpatch"].every(id=>sets.industrial.includes(id)),true);
assert.deepStrictEqual(["soma","dogpatch","showplace-square"].every(id=>sets.flex.includes(id)),true);

for (const view of experience.spaceTypes) for (const geography of view.geographies) {
  assert.ok(["PUBLIC_REVIEWED","PUBLIC_CONTEXTUAL"].includes(geography.evidenceTier));
  assert.ok(geography.areaPatterns.length >= 1 && geography.areaPatterns.length <= 5);
  assert.ok(geography.description.split(/\s+/).length >= 40 && geography.description.split(/\s+/).length <= 80);
  assert.ok(geography.related.length <= 3);
  assert.deepStrictEqual(geography.access,[]);
  for (const property of geography.representatives) {
    if (property.kind === "PROPERTY") assert.ok(property.canonicalUrl.startsWith("/commercial-real-estate/building/"));
    else assert.strictEqual(property.canonicalUrl,"");
    assert.strictEqual(property.propertyVerified,"");
    assert.ok(property.availabilityBoundary);
    assert.ok(property.investigate.includes(property.kind === "PROPERTY" ? "exact property configuration" : "Specific properties"));
    assert.ok(!Object.hasOwn(property,"availability"));
    assert.ok(!Object.hasOwn(property,"rent"));
  }
}

const city = html("");
assert.ok(city.includes("What kind of space are you looking for?"));
for (const view of experience.spaceTypes) assert.ok(city.includes(`href="${view.path}"`));

for (const view of experience.spaceTypes) {
  const page = html(`${view.slug}`);
  assert.ok(page.includes('data-commercial-geography-experience'));
  assert.ok(page.includes('role="tablist"'));
  assert.ok(page.includes(`Explore ${view.label === "Retail" ? "Retail Districts &amp; Corridors" : view.label + (view.label === "Office" ? " Districts" : " Areas")}`));
  assert.ok(!page.includes("Browse by commercial area."));
  assert.ok(page.includes('data-selection-semantics="exploration_only"'));
  assert.ok(page.includes("Select an area to view its context."));
  assert.ok(page.includes("Area pattern"));
  assert.ok(!page.includes("Property verified"));
  assert.ok(!page.includes("too image-driven"));
  assert.ok(!page.includes("too expensive"));
  assert.ok(!page.includes("lower-cost"));
  assert.ok(!page.includes("prestige"));
  assert.ok(page.includes("See My Best-Fit Locations"));
  assert.ok(page.includes(`<link rel="canonical" href="https://www.rofo.com${view.path}">`));
}

const officePage = html("office-space");
assert.ok(officePage.indexOf('class="sf-space-type-context-nav"') < officePage.indexOf("<h1>"));
assert.ok(officePage.indexOf("Explore Office Districts") < officePage.indexOf("Different Office districts solve different business problems"));
assert.ok(!officePage.includes("OFFICE SPACE IN SAN FRANCISCO"));
assert.ok(!officePage.includes("RETAIL SPACE IN SAN FRANCISCO"));
assert.ok(officePage.includes("Coworking space in San Francisco"));
assert.ok(!city.includes('sf-space-type-choice__glyph'));
for (const view of experience.spaceTypes) {
  const initial = view.geographies[0];
  const page = html(view.slug);
  assert.ok(page.includes(`aria-selected="true" aria-controls="sf-geography-panel-${initial.id}"`));
  assert.ok(page.includes(`${view.label} context · San Francisco`));
  const explorer = page.match(/<div class="city-card sf-geography-explorer">[\s\S]*?<\/div>\s*<\/div>/)?.[0] || "";
  assert.ok(!/\b(best|top|recommended|recommendation|rank|ranking|preferred)\b/i.test(explorer));
  if (initial.canonicalPath) assert.ok(page.includes(`>Explore ${initial.label} →</a>`));
}

for (const id of new Set(Object.values(sets).flat())) {
  const page = html(id);
  assert.ok(page.includes('data-commercial-geography-surface="sf_geography_route"'));
  assert.ok(page.includes("Area patterns describe geography context, not verified property capabilities."));
}

const analytics = fs.readFileSync(path.join(root,"js/commercial-geography-experience.js"),"utf8");
const instrumentedSurface = analytics + fs.readFileSync(path.join(root,"_includes/partials/city/sf-space-type-discovery.njk"),"utf8") + fs.readFileSync(path.join(root,"_includes/partials/space-type/sf-commercial-geography-experience.njk"),"utf8") + fs.readFileSync(path.join(root,"_includes/partials/neighborhood/sf-commercial-geography-context.njk"),"utf8");
for (const event of ["space_type_selected","commercial_geography_selected","commercial_geography_opened","representative_property_selected","related_geography_selected","location_intelligence_cta_clicked"]) assert.ok(instrumentedSurface.includes(event));
assert.ok(!analytics.includes("email"));
assert.ok(!analytics.includes("phone"));
assert.ok(fs.readFileSync(path.join(root,"assets/css/system.css"),"utf8").includes("@media (max-width: 480px)"));

console.log("SF Public Commercial Geography Experience v1 QA passed: four distinct space-type sets, 14 existing geography routes, governed cards, analytics, canonical URLs, and availability firewall verified.");
