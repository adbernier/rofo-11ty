const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { createEvidenceIdentity } = require("../lib/geography/commercial-market-evidence-identity");
const collections = require("../_data/commercialMarketEvidence").collections;
const districts = require("../_data/locationKnowledgeGraph");
const pages = require("../_data/neighborhoodPages");
const clone = (value) => JSON.parse(JSON.stringify(value));
let checks = 0;
function check(name, test) { test(); checks++; console.log(`PASS ${name}`); }
const registry = createEvidenceIdentity({ collections, districts });
const sf = "/commercial-real-estate/CA/san-francisco/";
const pageFor = (route) => {
  const [, , state, city, district] = route.split("/");
  return { canonical_neighborhood_path: route, state_abbr: state, city_slug: city, city: city.split("-").map((word) => word[0].toUpperCase() + word.slice(1)).join(" "), slug: district };
};
const negative = ["/commercial-real-estate/FL/miami/design-district/", "/commercial-real-estate/TX/dallas/design-district/", "/commercial-real-estate/MA/boston/financial-district/", "/commercial-real-estate/NY/new-york/financial-district/"];
check("all source identities resolve without diagnostics", () => assert.deepEqual(registry.diagnostics, []));
for (const route of negative) check(`negative ${route}`, () => assert.equal(pages.find((page) => page.canonical_neighborhood_path === route).commercial_market_evidence, null));
check("27 exact legitimate sections; all attached identities match", () => {
  const attached = pages.filter((page) => page.commercial_market_evidence);
  assert.equal(attached.length, 27);
  for (const page of attached) assert.equal(page.commercial_market_evidence.district.districtPath, page.canonical_neighborhood_path);
  assert.equal(attached.reduce((sum, page) => sum + page.commercial_market_evidence.records.length, 0), 166);
  assert.equal(attached.reduce((sum, page) => sum + page.commercial_market_evidence.records.filter((record) => record.buildingProfileReference).length, 0), 147);
});
check("SF positives and alias choose canonical owner without merging", () => {
  assert.equal(registry.resolve(pageFor(sf + "financial-district/")).collection.records.length, 10);
  const owner = registry.resolve(pageFor(sf + "showplace-square/"));
  const alias = registry.resolve(pageFor(sf + "design-district/"));
  assert.equal(owner.collection.records.length, 9);
  assert.equal(alias.collection, owner.collection);
  assert.equal(alias.reason, "explicit compatibility alias");
  assert.equal(collections.find((item) => item.district.districtPath === sf + "design-district/").records.length, 10);
  assert(!pages.some((page) => page.canonical_neighborhood_path === sf + "design-district/"));
});
check("collection and graph insertion order independent; source lineage unchanged", () => {
  const before = JSON.stringify(collections);
  const reverse = createEvidenceIdentity({ collections: [...collections].reverse(), districts: [...districts].reverse() });
  for (const page of pages) assert.equal(reverse.resolve(page).collection?.collectionId, registry.resolve(page).collection?.collectionId);
  assert.equal(reverse.resolve(pageFor(sf + "design-district/")).collection, registry.resolve(pageFor(sf + "showplace-square/")).collection);
  assert.equal(JSON.stringify(collections), before);
});
check("regional ownership and Antioch allowlist preserved", () => {
  for (const city of ["aurora", "broomfield", "englewood", "berkeley", "emeryville", "fremont", "hayward", "oakland", "union-city"]) assert(pages.some((page) => page.city_slug === city && page.commercial_market_evidence));
  assert.deepEqual(pages.find((page) => page.slug === "antioch-east-18th-industrial").commercial_market_evidence.records.map((record) => record.id), ["antioch-east-18th-industrial-foundation"]);
});
const financial = collections.find((item) => item.district.districtPath === sf + "financial-district/");
check("same slug in two real markets cannot overwrite", () => {
  const denverPath = "/commercial-real-estate/CO/denver/financial-district/";
  const denver = clone(financial);
  denver.collectionId = "test-denver";
  Object.assign(denver.district, { districtPath: denverPath, cityId: "denver", cityName: "Denver", metroId: "denver" });
  const node = { type: "district", path: denverPath, slug: "financial-district", city: "Denver", state: "CO", marketId: "denver", operationalMarketId: "denver" };
  for (const list of [[financial, denver], [denver, financial]]) {
    const identity = createEvidenceIdentity({ collections: list, districts: [...districts, node] });
    assert.deepEqual(identity.diagnostics, []);
    assert.equal(identity.resolve(pageFor(denverPath)).collection, denver);
    assert.equal(identity.resolve(pageFor(sf + "financial-district/")).collection, financial);
  }
});
for (const [name, mutate] of [
  ["missing collection path", (c) => delete c.district.districtPath],
  ["malformed collection path", (c) => c.district.districtPath += "?guess=1"],
  ["conflicting collection market", (c) => c.district.metroId = "boston"],
  ["missing collection market", (c) => delete c.district.metroId],
  ["conflicting source city", (c) => c.district.cityId = "boston"],
]) check(name + " fails closed with diagnostics", () => {
  const item = clone(financial); mutate(item);
  const identity = createEvidenceIdentity({ collections: [item], districts });
  assert(identity.diagnostics.length);
  assert.equal(identity.resolve(pageFor(sf + "financial-district/")).collection, null);
});
check("duplicate collection and graph paths fail closed", () => {
  for (const options of [{ collections: [financial, clone(financial)], districts }, { collections: [financial], districts: [...districts, clone(districts.find((node) => node.path === financial.district.districtPath))] }]) {
    const identity = createEvidenceIdentity(options);
    assert(identity.diagnostics.length);
    assert.equal(identity.resolve(pageFor(financial.district.districtPath)).collection, null);
  }
});
for (const [name, mutate] of [
  ["missing alias owner", (nodes, alias) => alias.industrialGeography.overlapRelationship.canonicalKnowledgeOwner = "missing"],
  ["cross-market alias owner", (nodes, alias) => alias.industrialGeography.overlapRelationship.canonicalKnowledgeOwner = "downtown-denver"],
  ["contradictory reverse alias", (nodes) => nodes.find((node) => node.path === sf + "showplace-square/").industrialGeography.compatibilityPaths = []],
  ["cyclic alias", (nodes) => { const owner = nodes.find((node) => node.path === sf + "showplace-square/"); owner.industrialGeography.overlapRelationship = { relationship: "compatibility_alias", canonicalKnowledgeOwner: "design-district" }; nodes.find((node) => node.path === sf + "design-district/").industrialGeography.compatibilityPaths = [owner.path]; }],
]) check(name + " fails closed", () => {
  const nodes = clone(districts); mutate(nodes, nodes.find((node) => node.path === sf + "design-district/"));
  const identity = createEvidenceIdentity({ collections, districts: nodes });
  assert(identity.diagnostics.length);
  assert.equal(identity.resolve(pageFor(sf + "design-district/")).collection, null);
});
check("conflicting graph market fails closed", () => {
  const nodes = clone(districts);
  nodes.find((node) => node.path === financial.district.districtPath).marketId = "denver";
  const identity = createEvidenceIdentity({ collections, districts: nodes });
  assert(identity.diagnostics.length);
  assert.equal(identity.resolve(pageFor(financial.district.districtPath)).collection, null);
});
check("ambiguous alias owner fails closed", () => {
  const owner = districts.find((node) => node.path === sf + "showplace-square/");
  const identity = createEvidenceIdentity({ collections, districts: [...districts, clone(owner)] });
  assert(identity.diagnostics.length);
  assert.equal(identity.resolve(pageFor(sf + "design-district/")).collection, null);
});
check("malformed and conflicting page identity fails closed", () => {
  for (const patch of [{ city: "Boston" }, { state_abbr: "MA" }, { marketId: "boston" }, { canonical_neighborhood_path: "financial-district" }]) assert.equal(registry.resolve({ ...pageFor(sf + "financial-district/"), ...patch }).collection, null);
});
check("existing supported redirect remains exact", () => assert(require("../_data/districtCompatibilityRedirects").some((redirect) => redirect.from === sf + "design-district/" && redirect.to === sf + "showplace-square/" && redirect.status === 301)));
if (fs.existsSync(path.join(process.cwd(), "_site", "_redirects"))) check("generated sections and four negatives", () => {
  for (const page of pages) {
    const html = fs.readFileSync(path.join(process.cwd(), "_site", page.canonical_neighborhood_path, "index.html"), "utf8");
    const section = html.match(/<section[^>]*neighborhood-market-evidence[\s\S]*?<\/section>/)?.[0];
    assert.equal(Boolean(section), Boolean(page.commercial_market_evidence), page.canonical_neighborhood_path);
    if (section) assert.equal([...section.matchAll(/href="([^"]+)"/g)].length, page.commercial_market_evidence.records.filter((record) => record.buildingProfileReference).length);
  }
});
console.log(`${checks} Commercial Market Evidence identity checks passed`);
