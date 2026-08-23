const knowledgeGraph = require("./locationKnowledgeGraph");
const accessFoundation = require("./sfAccessFoundationV0");
const presentationGroups = require("./sfOfficeRecommendationPresentationGroups");

const CLASSIFICATION = Object.freeze({ CORE: "CORE_RETAIL", SITUATIONAL: "SITUATIONAL_RETAIL", NOT_RETAIL: "GENERALLY_NOT_RETAIL" });

// Reviewed, ordinal market facts. These describe retail environments; they are
// not Requirement→district bonuses and contain no scenario-specific ordering.
const reviewed = Object.freeze({
  "union-square": { classification: CLASSIFICATION.CORE, fit: "STRONG", customerDemand: "VISITOR_DESTINATION", traits: ["PREMIUM", "VISITOR", "DESTINATION", "VISIBILITY", "SHOPPING_ADJACENCY"], strengths: ["San Francisco's clearest visitor-facing and destination-shopping environment.", "Strong central transit, hotel, and shopping adjacency."], tradeoffs: ["Parking and curb access are constrained.", "The environment is less suited to ordinary neighborhood-convenience demand."] },
  "mission-district": { classification: CLASSIFICATION.CORE, fit: "STRONG", customerDemand: "NEIGHBORHOOD_MIXED", traits: ["NEIGHBORHOOD", "FOOD", "WELLNESS", "VISIBILITY", "EVENING_WEEKEND", "EXPERIENTIAL"], strengths: ["Dense neighborhood demand and visible retail corridors support food, wellness, service, and consumer concepts.", "Strong evening and weekend activity broadens the customer window."], tradeoffs: ["Parking and loading vary materially by corridor.", "Storefront and block conditions require property-level diligence."] },
  "marina-district": { classification: CLASSIFICATION.CORE, fit: "STRONG", customerDemand: "AFFLUENT_NEIGHBORHOOD", traits: ["NEIGHBORHOOD", "PREMIUM", "WELLNESS", "FOOD", "EVENING_WEEKEND", "VISIBILITY"], strengths: ["Walkable neighborhood commerce and an affluent local catchment support premium, wellness, food, and service concepts.", "Northern geography can help customer access from Marin and nearby neighborhoods."], tradeoffs: ["No direct regional rail connection.", "Inventory is neighborhood-scale and cross-city access can be a tradeoff."] },
  "hayes-valley": { classification: CLASSIFICATION.CORE, fit: "STRONG", customerDemand: "LIFESTYLE_DESTINATION", traits: ["PREMIUM", "DESIGN", "DESTINATION", "EXPERIENTIAL", "SHOPPING_ADJACENCY", "VISIBILITY"], strengths: ["A design-forward, walkable lifestyle environment supports boutiques, consumer brands, and destination concepts.", "Central-city access and complementary shops create useful co-tenancy."], tradeoffs: ["Parking, loading, and curb access are constrained.", "Smaller storefront formats may limit inventory-heavy concepts."] },
  "jackson-square": { classification: CLASSIFICATION.CORE, fit: "GOOD", customerDemand: "DESIGN_DESTINATION", traits: ["PREMIUM", "DESIGN", "SHOWROOM", "DESTINATION", "FOOD"], strengths: ["Historic character, design adjacency, restaurants, and nearby office demand support selective destination concepts.", "A distinctive setting can reinforce premium and design-led brands."], tradeoffs: ["Foot traffic is more destination-oriented than broad high-street shopping.", "Parking and expansion options are constrained."] },
  "soma": { classification: CLASSIFICATION.CORE, fit: "GOOD", customerDemand: "MIXED_URBAN", traits: ["SHOWROOM", "EXPERIENTIAL", "DAYTIME", "DESTINATION", "FOOD"], strengths: ["Office density, residential growth, events, and adaptive buildings support selective food, showroom, and experiential uses.", "Central and regional access can support destination concepts."], tradeoffs: ["Retail conditions vary substantially by block.", "It is not a single continuous high-street environment."] },
  "financial-district": { classification: CLASSIFICATION.CORE, fit: "GOOD", customerDemand: "WEEKDAY_DAYTIME", traits: ["DAYTIME", "SERVICE", "FOOD", "TRANSIT", "VISIBILITY"], strengths: ["Large weekday office population and regional transit support service retail and food uses.", "Client-facing business traffic creates dependable daytime demand where occupancy is concentrated."], tradeoffs: ["Evening and weekend activity is comparatively limited.", "Parking is constrained and demand is sensitive to weekday office patterns."] },
  "south-beach": { classification: CLASSIFICATION.CORE, fit: "GOOD", customerDemand: "MIXED_WATERFRONT", traits: ["FOOD", "SERVICE", "RESIDENTIAL", "VISITOR", "EXPERIENTIAL"], strengths: ["Residential, office, waterfront, hotel, and event demand support selective food and service concepts.", "Strong walkability and regional connections broaden access."], tradeoffs: ["Demand patterns can vary with events and specific blocks.", "Customer parking is constrained."] },
  "showplace-square": { classification: CLASSIFICATION.SITUATIONAL, fit: "STRONG", customerDemand: "DESIGN_TRADE", traits: ["SHOWROOM", "DESIGN", "DESTINATION", "PARKING"], strengths: ["The reviewed design-trade cluster strongly supports showroom and home-furnishings concepts.", "Destination behavior reduces dependence on incidental foot traffic."], tradeoffs: ["Limited evening and weekend activity weakens ordinary neighborhood retail.", "It should not be generalized beyond design, showroom, food, and related service demand."] },
  dogpatch: { classification: CLASSIFICATION.SITUATIONAL, fit: "GOOD", customerDemand: "EMERGING_NEIGHBORHOOD", traits: ["NEIGHBORHOOD", "FOOD", "DESIGN", "EXPERIENTIAL", "DESTINATION"], strengths: ["Neighborhood growth, creative-commercial character, and Mission Bay adjacency support selective food, service, and destination concepts."], tradeoffs: ["Foot traffic and co-tenancy are less established than the core retail districts.", "Fit varies by corridor and storefront context."] },
  "mission-bay": { classification: CLASSIFICATION.SITUATIONAL, fit: "LIMITED", customerDemand: "INSTITUTIONAL_MIXED", traits: ["DAYTIME", "SERVICE", "FOOD", "EVENT"], strengths: ["Office, healthcare, residential, and event demand can support targeted food and service concepts."], tradeoffs: ["It is not a classic high-street retail environment.", "Demand depends heavily on the immediate institutional, residential, or event context."] },
  "civic-center": { classification: CLASSIFICATION.SITUATIONAL, fit: "LIMITED", customerDemand: "CIVIC_INSTITUTIONAL", traits: ["CIVIC", "SERVICE", "EVENT", "TRANSIT"], strengths: ["Government, cultural institutions, events, and regional transit can support narrow service and visitor uses."], tradeoffs: ["Block context and customer experience require careful diligence.", "It is not a broad ordinary retail alternative."] },
  "potrero-hill": { classification: CLASSIFICATION.SITUATIONAL, fit: "GOOD", customerDemand: "NEIGHBORHOOD_DESIGN", traits: ["NEIGHBORHOOD", "DESIGN", "FOOD", "SERVICE", "PARKING"], strengths: ["Neighborhood demand and the design/production edge support selective service, food, and destination uses."], tradeoffs: ["Retail activity is dispersed rather than a single strong shopping district.", "Topography and block context matter."] },
  presidio: { classification: CLASSIFICATION.NOT_RETAIL, fit: "LIMITED", customerDemand: "VISITOR_DESTINATION", traits: ["VISITOR", "DESTINATION"], strengths: [], tradeoffs: ["Retail is limited and destination-oriented rather than a normal citywide storefront alternative."] },
  "bayview-industrial": { classification: CLASSIFICATION.NOT_RETAIL, fit: "UNKNOWN", customerDemand: "UNKNOWN", traits: [], strengths: [], tradeoffs: ["The reviewed identity is industrial/flex, not ordinary Retail."] },
  "central-waterfront": { classification: CLASSIFICATION.NOT_RETAIL, fit: "UNKNOWN", customerDemand: "UNKNOWN", traits: [], strengths: [], tradeoffs: ["The reviewed identity is industrial/flex, not ordinary Retail."] },
});

const districts = Object.entries(reviewed).map(([districtId, facts]) => {
  const node = knowledgeGraph.find((item) => item.slug === districtId && item.operationalMarketId === "san-francisco") || {};
  const access = accessFoundation.districtProfiles.find((item) => item.districtId === districtId) || null;
  const graphRetail = node.spaceTypeFit?.retail || {};
  return {
    districtId,
    districtName: node.label || districtId,
    path: node.path || "",
    ...facts,
    summary: graphRetail.summary || facts.strengths[0] || facts.tradeoffs[0] || "",
    retailAttributes: { ...(node.retailAttributes || {}) },
    businessAttributes: { ...(node.attributes || {}) },
    accessProfileId: access?.districtId || "",
    reviewStatus: "APPROVED",
    evidenceSources: ["_data/locationKnowledgeGraph.js", "_data/neighborhoodPages.js", "_data/commercialLocationModel.js", "_data/sfAccessFoundationV0.js"],
  };
});

module.exports = {
  schemaVersion: "sf-retail-composition-foundation:v1",
  marketId: "san-francisco",
  propertyType: "retail_service",
  classification: CLASSIFICATION,
  componentPolicy: "Retail Fit, customer/business context, and Access remain separate ordinal evidence. Candidate identity is comparison context only.",
  presentationGroups: presentationGroups.groups.map((group) => ({ ...group, presentationGroupId: group.presentationGroupId.replace("sf-office:", "sf-retail:") })),
  districts,
};
