const commercialGeography = require("../../_data/commercialGeography");

const regions = commercialGeography.regions || [];
const markets = commercialGeography.markets || [];
const marketById = new Map(markets.map((market) => [market.marketId, market]));
const regionById = new Map(regions.map((region) => [region.regionId, region]));
const marketByCity = new Map();

for (const market of markets) {
  for (const city of market.cities || []) {
    marketByCity.set(`${market.state}|${String(city).toLowerCase()}`, market);
  }
}

function marketIdentity(market) {
  if (!market) return null;
  return {
    id: market.marketId,
    name: market.marketName,
    marketId: market.marketId,
    marketName: market.marketName,
    regionId: market.regionId,
    regionName: market.regionName,
    state: market.state,
    status: market.status,
    cities: market.cities || [],
    publisherMetroId: market.publisherCompatibility ? market.publisherCompatibility.metroId || "" : "",
    publisherMetroName: market.publisherCompatibility ? market.publisherCompatibility.metroName || "" : "",
    publicRoute: market.publicRoute || "",
    implementationNote: market.implementationNote || "",
  };
}

function regionIdentity(region) {
  if (!region) return null;
  return {
    regionId: region.regionId,
    regionName: region.regionName,
    state: region.state,
    status: region.status,
    purpose: region.purpose || "",
  };
}

function marketForId(marketId) {
  return marketIdentity(marketById.get(marketId));
}

function marketForCity(state, city) {
  return marketIdentity(marketByCity.get(`${state || ""}|${String(city || "").toLowerCase()}`));
}

function explicitMarketForDistrict(district) {
  return marketForId(district && (district.operationalMarketId || district.marketId));
}

function canonicalMarketForDistrict(district) {
  return explicitMarketForDistrict(district) || marketForCity(district && district.state, district && district.city);
}

function enrichDistrict(district) {
  const market = canonicalMarketForDistrict(district);
  if (!market) return district;
  district.marketId = market.marketId;
  district.marketName = market.marketName;
  district.operationalMarketId = market.marketId;
  district.operationalMarketName = market.marketName;
  district.regionId = market.regionId;
  district.regionName = market.regionName;
  if (district.recommendationEligible !== false) district.recommendationEligible = true;
  district.commercialGeography = {
    canonicalDistrict: true,
    eligibility: district.recommendationEligible ? "first_class" : "not_eligible",
    regionId: market.regionId,
    regionName: market.regionName,
    marketId: market.marketId,
    marketName: market.marketName,
    operationalOwnership: "canonical_market",
    maturityMeasuredBy: ["Knowledge Graph", "Commercial Market Evidence", "Building Profiles", "Photography", "Recommendation QA"],
    ...(district.commercialGeography || {}),
  };
  return district;
}

function geographySummary(locationKnowledgeGraph = []) {
  const districtNodes = (locationKnowledgeGraph || []).filter((node) => node && node.type === "district");
  const ownershipByDistrict = [];
  const ownershipCounts = new Map(markets.map((market) => [market.marketId, 0]));
  const unresolvedDistricts = [];
  const duplicateAssignments = [];
  const seenDistricts = new Set();

  for (const district of districtNodes) {
    const districtId = district.slug || district.districtId || "";
    if (seenDistricts.has(districtId)) {
      duplicateAssignments.push({
        districtId,
        districtName: district.label || district.districtName || "",
      });
    }
    seenDistricts.add(districtId);

    const market = canonicalMarketForDistrict(district);
    if (!market) {
      unresolvedDistricts.push({
        districtId,
        districtName: district.label || district.districtName || "",
        city: district.city || "",
        state: district.state || "",
      });
      continue;
    }

    ownershipCounts.set(market.marketId, (ownershipCounts.get(market.marketId) || 0) + 1);
    ownershipByDistrict.push({
      districtId,
      districtName: district.label || district.districtName || "",
      city: district.city || "",
      state: district.state || "",
      regionId: market.regionId,
      regionName: market.regionName,
      marketId: market.marketId,
      marketName: market.marketName,
      recommendationEligible: district.recommendationEligible !== false,
      publicRoute: district.path || "",
    });
  }

  return {
    schemaVersion: "commercial-geography-summary-v1",
    hierarchy: commercialGeography.hierarchy,
    regions: regions.map(regionIdentity),
    markets: markets.map((market) => ({
      ...marketIdentity(market),
      districtCount: ownershipCounts.get(market.marketId) || 0,
      publisherCompatibility: market.publisherCompatibility || { metroId: "", metroName: "" },
    })),
    districtOwnershipSummary: {
      districtCount: districtNodes.length,
      resolvedDistricts: ownershipByDistrict.length,
      unresolvedDistricts: unresolvedDistricts.length,
      duplicateAssignments: duplicateAssignments.length,
      recommendationEligibleDistricts: ownershipByDistrict.filter((district) => district.recommendationEligible).length,
    },
    ownershipByDistrict,
    unresolvedDistricts,
    ambiguousDistricts: [],
    duplicateAssignments,
    compatibilityFallbackAssignments: [],
  };
}

module.exports = {
  schemaVersion: commercialGeography.schemaVersion,
  hierarchy: commercialGeography.hierarchy,
  regions: regions.map(regionIdentity),
  markets: markets.map(marketIdentity),
  marketForId,
  marketForCity,
  canonicalMarketForDistrict,
  enrichDistrict,
  geographySummary,
};
