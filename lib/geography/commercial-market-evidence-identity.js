const geography = require("./commercial-geography");

const slug = (value) => String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const parse = (value) => /^\/commercial-real-estate\/([A-Z]{2})\/([a-z0-9]+(?:-[a-z0-9]+)*)\/([a-z0-9]+(?:-[a-z0-9]+)*)\/$/.exec(value || "");

// Source paths retain collection lineage. Compatibility paths resolve to their
// canonical owner's collection, never merge or overwrite that collection.
function createEvidenceIdentity({ collections, districts, marketForCity = geography.marketForCity, marketForId = geography.marketForId }) {
  const diagnostics = [];
  const nodes = new Map();
  const sources = new Map();
  const invalid = new Set();
  const owners = new Map();
  const report = (path, reason) => {
    invalid.add(path);
    diagnostics.push({ path, reason });
  };
  for (const node of districts.filter((item) => item.type === "district")) {
    if (nodes.has(node.path)) report(node.path, "duplicate district path");
    nodes.set(node.path, node);
  }
  const market = (node) => {
    const route = parse(node.path);
    if (!route || route[1] !== node.state || route[2] !== slug(node.city) || route[3] !== node.slug) return null;
    const cityMarket = marketForCity(node.state, node.city);
    const ids = [node.operationalMarketId, node.marketId].filter(Boolean);
    const explicit = ids.length ? marketForId(ids[0]) : null;
    if (!explicit || explicit.state !== node.state || !explicit.cities.some((city) => slug(city) === route[2]) || ids.some((id) => id !== explicit.id) || (cityMarket && cityMarket.id !== explicit.id)) return null;
    return explicit.id;
  };
  for (const [path, node] of nodes) {
    const alias = node.industrialGeography?.overlapRelationship;
    if (alias?.relationship !== "compatibility_alias") continue;
    const matches = [...nodes.values()].filter((owner) => owner.slug === alias.canonicalKnowledgeOwner && market(owner) && market(owner) === market(node));
    const owner = matches.length === 1 ? matches[0] : null;
    if (!owner || owner.state !== node.state || owner.city !== node.city || !owner.industrialGeography?.compatibilityPaths?.includes(path)) {
      report(path, "missing, ambiguous or cross-market compatibility owner");
    } else owners.set(path, owner.path);
  }
  const canonical = (path) => {
    const seen = new Set();
    while (owners.has(path)) {
      if (invalid.has(path) || seen.has(path)) return null;
      seen.add(path);
      path = owners.get(path);
    }
    return invalid.has(path) ? null : path;
  };
  for (const path of owners.keys()) {
    if (!canonical(path)) report(path, "invalid or cyclic compatibility identity");
  }
  for (const collection of collections) {
    const district = collection.district || {};
    const path = district.districtPath;
    const route = parse(path);
    const node = nodes.get(path);
    const ids = [district.marketId, district.operationalMarketId, district.metroId].filter(Boolean);
    if (!route || !node || !canonical(path) || district.cityId !== route[2] || district.districtId !== route[3] || !ids.length || ids.some((id) => !marketForId(id) || id !== market(node))) {
      report(path, `unresolved or conflicting collection identity: ${collection.collectionId}`);
    }
    if (sources.has(path)) report(path, "duplicate collection identity");
    sources.set(path, collection);
  }
  function resolve(page) {
    const path = page.canonical_neighborhood_path;
    const route = parse(path);
    if (!route || route[1] !== page.state_abbr || route[2] !== page.city_slug || route[2] !== slug(page.city) || route[3] !== page.slug) return { collection: null, reason: "invalid page identity" };
    const ownerPath = canonical(path);
    if (!ownerPath) return { collection: null, reason: "invalid or ambiguous district identity" };
    const collection = sources.get(ownerPath);
    if (!collection) return { collection: null, reason: "no canonical collection" };
    const node = nodes.get(ownerPath);
    const pageMarket = marketForCity(page.state_abbr, page.city);
    const declared = [page.marketId, page.operationalMarketId].filter(Boolean);
    if (!pageMarket || pageMarket.id !== market(node) || declared.some((id) => id !== pageMarket.id)) return { collection: null, reason: "unresolved or conflicting page market" };
    return { collection, reason: path === ownerPath ? "exact canonical identity" : "explicit compatibility alias", canonicalPath: ownerPath, sourcePath: collection.district.districtPath };
  }
  // Identity-only navigation must not depend on evidence-collection coverage.
  // Public route existence and affirmative subject membership remain callers' gates.
  function resolveDistrictIdentity(page) {
    const route = parse(page.canonical_neighborhood_path);
    if (!route || route[1] !== page.state_abbr || route[2] !== page.city_slug || route[2] !== slug(page.city) || route[3] !== page.slug) return null;
    const ownerPath = canonical(page.canonical_neighborhood_path);
    const ownerRoute = parse(ownerPath);
    const cityMarket = marketForCity(page.state_abbr, page.city);
    if (!ownerRoute || !cityMarket || ownerRoute[1] !== route[1] || ownerRoute[2] !== route[2]) return null;
    const node = nodes.get(ownerPath);
    const declared = [page.marketId, page.operationalMarketId].filter(Boolean);
    if ((node && market(node) !== cityMarket.id) || declared.some(id => id !== cityMarket.id)) return null;
    return { canonicalPath: ownerPath, marketId: cityMarket.id };
  }
  return { resolve, resolveDistrictIdentity, diagnostics };
}

module.exports = { createEvidenceIdentity };
