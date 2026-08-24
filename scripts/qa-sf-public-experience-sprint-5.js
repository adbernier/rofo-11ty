const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const office = require("../_data/sfOfficeMarketCoverage");
const retail = require("../_data/sfRetailMarketCoverage");
const industrialFlex = require("../_data/sfIndustrialFlexMarketCoverage");
const pages = require("../_data/neighborhoodPages");
const samples = require("../_data/sfPublicSampleBriefs");
const discovery = require("../_data/sfPublicDiscovery");
const certification = require("../_data/sfPublicExperienceCertification");
const redirects = require("../_data/districtCompatibilityRedirects");
const readiness = require("../lib/eos/market-readiness").buildMarketReadiness();

const root = path.join(__dirname, "..");
const site = path.join(root, "_site");
const eligible = new Set([office, retail, industrialFlex.industrial, industrialFlex.flex]
  .flatMap((coverage) => coverage.decisionGeographies)
  .filter((item) => /^(CORE|SITUATIONAL)_/.test(item.classification || ""))
  .map((item) => item.districtId));
const pageBySlug = new Map(pages.filter((item) => item.city === "San Francisco").map((item) => [item.slug, item]));
const read = (target) => fs.readFileSync(target, "utf8");
const output = (url) => path.join(site, url.replace(/^\//, ""), "index.html");
const internalLinks = (html) => [...html.matchAll(/href="(\/[^"?#]*)/g)].map((match) => match[1]);

assert.equal(certification.status, "READY");
assert.equal(certification.hardGates.length, 9);
assert(certification.hardGates.every((gate) => gate.status === "PASS"));
assert.equal(eligible.size, 24);
for (const id of eligible) {
  const page = pageBySlug.get(id);
  assert(page?.canonical_neighborhood_path && !page.noindex, `${id} lacks an indexable canonical surface`);
  assert(page.public_decision_surface || page.commercial_location_model, `${id} lacks useful decision content`);
}
assert.equal(discovery.status, "READY");
for (const key of ["office", "retail", "industrial", "flex"]) {
  const ids = discovery.guides[key].groups.flatMap((group) => group.entries.map((entry) => entry.id));
  assert.equal(ids.length, new Set(ids).size, `${key} discovery duplicates geography`);
}

const dispositions = Object.fromEntries(certification.compatibilityDispositions.map((item) => [item.identity, item]));
assert.equal(dispositions["Design District"].disposition, "REDIRECT");
assert(redirects.some((item) => item.from.endsWith("/design-district/") && item.to.endsWith("/showplace-square/") && item.status === 301));
assert.equal(dispositions.Mission.disposition, "KEEP_CONTEXT");
assert.equal(dispositions["South Park"].disposition, "KEEP_CONTEXT");
assert.equal(dispositions.Bayview.owner, "Bayview Industrial owns the operational decision");
assert.equal(dispositions["Potrero Hill"].disposition, "KEEP_BOUNDED");

for (const rollout of Object.values(certification.rollout)) assert.equal(rollout.default, false, `${rollout.flag} repository default changed`);
assert.equal(certification.photography.blocking, false);
assert.equal(certification.photography.total, 24);
assert.equal(certification.photography.missingDistrictIds.length, 17);
const docs = read(path.join(root, "docs/product/rofo-sf-public-experience-certification.md"));
for (const phrase of ["controlled rollout and rollback", "existing private v2 briefs", "photography backlog", "human selects"]) assert(docs.toLowerCase().includes(phrase));

const sf = readiness.markets.find((market) => market.marketId === "san-francisco");
assert.equal(sf.workloads.publicExperience.status, "Ready");
assert.equal(sf.workloads.publicExperience.gaps.length, 0);
assert.equal(sf.workloads.publicExperience.details.photographyBlocking, false);
assert.equal(readiness.currentPriority.selection.label, "SF Public Experience");

if (fs.existsSync(site)) {
  const urls = [
    "/commercial-real-estate/CA/san-francisco/",
    "/commercial-real-estate/CA/san-francisco/office-space/",
    "/commercial-real-estate/CA/san-francisco/retail-space/",
    "/commercial-real-estate/CA/san-francisco/industrial-space/",
    "/commercial-real-estate/CA/san-francisco/flex-space/",
    "/example-location-brief/",
    ...[...eligible].map((id) => pageBySlug.get(id).canonical_neighborhood_path),
    ...samples.briefs.map((sample) => sample.url),
  ];
  const sitemap = read(path.join(site, "sitemap.xml"));
  const redirectMap = new Map(redirects.map((item) => [item.from, item]));
  for (const url of new Set(urls)) {
    const file = output(url);
    assert(fs.existsSync(file), `${url} is a public dead end`);
    const html = read(file);
    assert(html.includes(`<link rel="canonical" href="https://www.rofo.com${url}">`), `${url} canonical mismatch`);
    assert(!/<meta name="robots" content="[^"]*noindex/i.test(html), `${url} is accidentally noindex`);
    assert(sitemap.includes(`https://www.rofo.com${url}`), `${url} missing from sitemap`);
    assert(!/>\s*(undefined|null)\s*</i.test(html), `${url} renders missing values`);
    assert(/<main\b|role="main"/.test(html), `${url} lacks main landmark`);
    assert(/<h1\b/.test(html), `${url} lacks h1`);
    if (url.includes("/commercial-real-estate/CA/san-francisco/") && !/\/(office|retail|industrial|flex)-space\/$/.test(url) && url !== "/commercial-real-estate/CA/san-francisco/") {
      assert(html.includes("See My Best-Fit Locations") && html.includes("marketId=san-francisco") && html.includes("journey=new") && html.includes("sourcePath="), `${url} lacks complete Best-Fit EntryContext`);
    }
    for (const href of internalLinks(html)) {
      if (href.startsWith("/api/") || href.startsWith("/assets/") || href.startsWith("/location-requirement/") || href.startsWith("/find-locations/") || href.startsWith("/location-brief/")) continue;
      const target = output(href);
      const redirect = redirectMap.get(href);
      assert(fs.existsSync(target) || (redirect && fs.existsSync(output(redirect.to))) || fs.existsSync(path.join(site, href.replace(/^\//, ""))), `${url} has broken link ${href}`);
    }
  }
  for (const slug of ["office-space", "retail-space", "industrial-space", "flex-space"]) {
    const html = read(output(`/commercial-real-estate/CA/san-francisco/${slug}/`));
    assert(html.includes("Example business decisions") && html.includes("See My Best-Fit Locations") && html.includes("marketId=san-francisco") && html.includes("sourcePath="), `${slug} lacks examples or personalized EntryContext`);
  }
  for (const sample of samples.briefs) {
    const html = read(output(sample.url));
    assert(html.includes('type="application/ld+json"') && html.includes("BreadcrumbList"), `${sample.id} structured breadcrumb missing`);
    assert.equal((html.match(/<main\b/g) || []).length, 1, `${sample.id} must have one main landmark`);
    assert(!/LB2-|owner|OfficeFinder|contact capture|Recommended Starting Point/.test(html), `${sample.id} leaks private or legacy state`);
    assert(sample.locations.every((location) => html.includes(`href="${location.path}"`)), `${sample.id} lacks canonical result links`);
  }
}

const serializedClaims = JSON.stringify({ surfaces: require("../_data/sfPublicDecisionSurfaces"), samples: samples.briefs }).toLowerCase();
for (const prohibited of ["available now", "currently for lease", "vacancy rate", "guaranteed savings", "guaranteed business"]) assert(!serializedClaims.includes(prohibited), `unsupported claim found: ${prohibited}`);
const css = read(path.join(root, "assets/css/system.css"));
assert(css.includes("@media (max-width: 760px)") && css.includes("grid-template-columns: 1fr"));
assert(css.includes(":focus") || css.includes(":focus-visible"), "focus styling missing");
console.log(`SF Public Experience Sprint 5 certification passed: ${eligible.size} geographies, ${samples.briefs.length} examples, ${certification.hardGates.length} hard gates; photography ${certification.photography.covered}/${certification.photography.total} nonblocking.`);
