const graph = require("./locationKnowledgeGraph");
const accessFoundation = require("./sfAccessFoundationV0");
const geography = require("./sfIndustrialFlexDecisionGeographies");

const industrialFacts = Object.freeze({
  "bayview-industrial": { fit: "STRONG", traits: ["WAREHOUSE", "DISTRIBUTION", "LAST_MILE", "CONTRACTOR", "FLEET", "FOOD_PRODUCTION", "LIGHT_MANUFACTURING", "LOADING", "VEHICLE_ACCESS"], strengths: ["San Francisco's deepest city-serving warehouse, contractor, fleet, food, service, and production geography.", "Strong structural freeway and last-mile orientation."], tradeoffs: ["Regional-scale yards and trailer operations may require markets outside San Francisco.", "Environmental, use, loading, and truck conditions remain property-specific."] },
  "central-waterfront": { fit: "STRONG", traits: ["PRODUCTION", "FABRICATION", "MAKER", "LIGHT_MANUFACTURING", "SERVICE_INDUSTRIAL", "LOADING"], strengths: ["Protected PDR context supports urban production, fabrication, makers, and service-industrial users.", "More production-oriented than mixed-use Dogpatch."], tradeoffs: ["Less warehouse and logistics depth than Bayview Industrial.", "Building utility and permitted use require validation."] },
  dogpatch: { fit: "GOOD", traits: ["MAKER", "CREATIVE_PRODUCTION", "ADAPTIVE_REUSE", "CUSTOMER_FACING"], strengths: ["Adaptive industrial character supports selective maker and production-adjacent operations."], tradeoffs: ["Mixed-use adjacency and building-specific utility limit conventional Industrial suitability."] },
  "showplace-square": { fit: "GOOD", traits: ["SHOWROOM", "DESIGN_TRADE", "CREATIVE_PRODUCTION", "CUSTOMER_FACING"], strengths: ["Design-trade, showroom, studio, and production-adjacent context supports selective customer-facing industrial users."], tradeoffs: ["It lacks the operational depth of Bayview Industrial and Central Waterfront."] },
  "potrero-hill": { fit: "GOOD", traits: ["MAKER", "SERVICE_INDUSTRIAL", "LIGHT_PRODUCTION"], strengths: ["The eastern/base edge offers selective maker and service-industrial context near major PDR areas."], tradeoffs: ["The residential hill is excluded; loading and operational fit vary by site."] },
  soma: { fit: "LIMITED", traits: [], strengths: [], tradeoffs: ["SoMa is not a defensible ordinary warehouse, logistics, or production alternative."] },
});

const flexFacts = Object.freeze({
  "bayview-industrial": { fit: "GOOD", traits: ["OPERATIONAL_FLEX", "OFFICE_WAREHOUSE", "SERVICE", "STORAGE", "VEHICLE_ACCESS"], strengths: ["Operational flex can combine office, storage, dispatch, production, and service functions."], tradeoffs: ["The environment should not be treated as uniformly polished or modern Flex inventory."] },
  "central-waterfront": { fit: "STRONG", traits: ["OFFICE_PRODUCTION", "PROTOTYPING", "R_AND_D_SUPPORT", "MAKER", "TECHNICAL", "CREATIVE_PRODUCTION"], strengths: ["Strong practical Flex context for prototyping, product development, office/production, and maker users."], tradeoffs: ["Power, loading, technical infrastructure, and use remain property-specific."] },
  dogpatch: { fit: "STRONG", traits: ["ADAPTIVE_REUSE", "CREATIVE_PRODUCTION", "OFFICE_PRODUCTION", "R_AND_D_SUPPORT", "EMPLOYEE_ENVIRONMENT", "MAKER"], strengths: ["Adaptive reuse and Mission Bay adjacency support creative production and innovation-oriented Flex users."], tradeoffs: ["Operational capability varies substantially by building."] },
  "showplace-square": { fit: "STRONG", traits: ["SHOWROOM", "DESIGN_TRADE", "CUSTOMER_FACING", "OFFICE_PRODUCTION", "CREATIVE_PRODUCTION"], strengths: ["San Francisco's clearest showroom, design-trade, and customer-facing Flex environment."], tradeoffs: ["Loading and production utility vary and should not be inferred from district identity."] },
  "potrero-hill": { fit: "GOOD", traits: ["MAKER", "OFFICE_PRODUCTION", "CREATIVE_PRODUCTION", "EMPLOYEE_ENVIRONMENT"], strengths: ["Selective eastern/base buildings support neighborhood-scale maker and office/production uses."], tradeoffs: ["Flex relevance does not extend uniformly across the residential hill."] },
  soma: { fit: "GOOD", traits: ["ADAPTIVE_REUSE", "SHOWROOM", "CUSTOMER_FACING", "EMPLOYEE_ENVIRONMENT"], strengths: ["Adaptive commercial buildings can support office-led, showroom, and light creative Flex uses."], tradeoffs: ["Loading and operational utility are inconsistent; conventional Industrial use is not implied."] },
});

function build(model, facts) {
  return geography.geographies.map((entry) => {
    const node = graph.find((item) => item.slug === entry.districtId && item.operationalMarketId === "san-francisco") || {};
    const access = accessFoundation.districtProfiles.find((item) => item.districtId === entry.evidenceOwner);
    const item = facts[entry.districtId];
    return { ...entry, districtName: node.label || entry.districtId, path: node.path || "", classification: entry[model], ...item, summary: item.strengths[0] || item.tradeoffs[0], accessProfileId: access?.districtId || "", industrialAttributes: { ...(node.industrialAttributes || {}) }, evidenceSources: ["_data/locationKnowledgeGraph.js", "_data/commercialLocationModel.js", "_data/sfAccessFoundationV0.js", "docs/product/rofo-sf-retail-industrial-flex-decision-geography-audit.md"], reviewStatus: "APPROVED" };
  });
}

module.exports = {
  schemaVersion: "sf-industrial-flex-composition-foundation:v1", marketId: "san-francisco", customerEntryPropertyType: "industrial_flex",
  industrial: { modelId: "san-francisco:industrial", districts: build("industrial", industrialFacts) },
  flex: { modelId: "san-francisco:flex", districts: build("flex", flexFacts) },
  presentationGroups: geography.presentationGroups, contextualGeographies: geography.contextual,
  policy: "Industrial and Flex share reviewed geography, Access, and evidence ownership but retain separate fit, eligibility, calibration, ordering, and abstention.",
};
