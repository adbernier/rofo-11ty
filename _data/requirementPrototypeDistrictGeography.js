const locationKnowledgeGraph = require("./locationKnowledgeGraph");
const sfOfficeRecommendationModel = require("./sfOfficeRecommendationModel");

const sfInitial = new Set(sfOfficeRecommendationModel.initialConsiderationSet || []);
const markets = {};

for (const district of locationKnowledgeGraph) {
  if (!district || district.type !== "district" || district.recommendationEligible === false) continue;
  if (!district.commercialGeography || district.commercialGeography.canonicalDistrict !== true) continue;
  const marketId = district.operationalMarketId || district.marketId || "";
  const districtId = district.slug || district.districtId || "";
  const name = district.label || district.districtName || "";
  if (!marketId || !districtId || !name) continue;
  if (!markets[marketId]) markets[marketId] = [];
  markets[marketId].push({
    districtId,
    name,
    marketId,
    city: district.city || "",
    state: district.state || "",
    path: district.path || "",
    initiallyVisible: marketId === "san-francisco" ? sfInitial.has(districtId) : false,
  });
}

for (const [marketId, districts] of Object.entries(markets)) {
  const hasExplicitInitialSet = districts.some((district) => district.initiallyVisible);
  markets[marketId] = districts
    .map((district, index) => ({ ...district, initiallyVisible: hasExplicitInitialSet ? district.initiallyVisible : index < 6 }))
    .sort((a, b) => Number(b.initiallyVisible) - Number(a.initiallyVisible) || a.name.localeCompare(b.name));
}

module.exports = Object.freeze({
  schemaVersion: "requirement-prototype-district-geography:v1",
  source: "_data/locationKnowledgeGraph.js canonical district ownership; SF initial display from _data/sfOfficeRecommendationModel.js initialConsiderationSet",
  markets,
});
