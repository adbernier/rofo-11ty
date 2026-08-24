const knowledgeGraph = require("./locationKnowledgeGraph");
const accessFoundation = require("./sfAccessFoundationV0");
const presentationGroups = require("./sfOfficeRecommendationPresentationGroups");
const retailGeographies = require("./sfRetailDecisionGeographies");

const CLASSIFICATION = Object.freeze({ CORE: "CORE_RETAIL", SITUATIONAL: "SITUATIONAL_RETAIL", NOT_RETAIL: "GENERALLY_NOT_RETAIL", PARENT: "PARENT_PRESENTATION" });

// Reviewed, ordinal market facts. These describe retail environments; they are
// not Requirement→district bonuses and contain no scenario-specific ordering.
const reviewed = Object.freeze({
  "union-square": { classification: CLASSIFICATION.CORE, fit: "STRONG", customerDemand: "VISITOR_DESTINATION", traits: ["PREMIUM", "VISITOR", "DESTINATION", "VISIBILITY", "SHOPPING_ADJACENCY"], strengths: ["San Francisco's clearest visitor-facing and destination-shopping environment.", "Strong central transit, hotel, and shopping adjacency."], tradeoffs: ["Parking and curb access are constrained.", "The environment is less suited to ordinary neighborhood-convenience demand."] },
  "mission-district": { classification: CLASSIFICATION.PARENT, fit: "UNKNOWN", customerDemand: "PARENT_UMBRELLA", traits: [], strengths: [], tradeoffs: ["Retail conditions vary materially among Mission corridors."] },
  "marina-district": { classification: CLASSIFICATION.PARENT, fit: "UNKNOWN", customerDemand: "PARENT_UMBRELLA", traits: [], strengths: [], tradeoffs: ["Chestnut Street and Union Street / Cow Hollow represent distinct Retail decisions."] },
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

const corridorFacts = Object.freeze({
  "sacramento-street": { classification: CLASSIFICATION.SITUATIONAL, fit: "STRONG", customerDemand: "PREMIUM_DESIGN_DESTINATION", traits: ["PREMIUM", "DESIGN", "SHOWROOM", "DESTINATION", "SHOPPING_ADJACENCY", "NEIGHBORHOOD"], strengths: ["A small-scale premium and design-oriented corridor supports destination shopping, home/design, and selective services.", "Its neighborhood setting differs from Union Square's visitor-heavy downtown environment."], tradeoffs: ["The corridor is narrow and inventory is small-scale.", "Regional transit and parking are less straightforward than downtown."] },
  "fillmore-street": { classification: CLASSIFICATION.CORE, fit: "STRONG", customerDemand: "AFFLUENT_LIFESTYLE_NEIGHBORHOOD", traits: ["PREMIUM", "NEIGHBORHOOD", "WELLNESS", "FOOD", "VISIBILITY", "EVENING_WEEKEND", "SHOPPING_ADJACENCY"], strengths: ["Lifestyle shopping, dining, wellness, and neighborhood demand support premium and service concepts.", "Its customer environment is neighborhood-led rather than downtown visitor-led."], tradeoffs: ["Storefront scale and curb access are constrained.", "Customer access depends more on local travel than regional rail."] },
  "union-street-cow-hollow": { classification: CLASSIFICATION.CORE, fit: "STRONG", customerDemand: "SPECIALTY_LIFESTYLE_DESTINATION", traits: ["PREMIUM", "WELLNESS", "FOOD", "DESTINATION", "EVENING_WEEKEND", "SHOPPING_ADJACENCY"], strengths: ["Specialty shops, wellness, dining, and a wider trade area support boutique and destination concepts.", "Evening and weekend activity adds a different demand pattern from daily-needs corridors."], tradeoffs: ["Traffic and parking friction remain material.", "The corridor is less suited to high-volume convenience retail than Chestnut Street."] },
  "chestnut-street": { classification: CLASSIFICATION.CORE, fit: "STRONG", customerDemand: "NEIGHBORHOOD_DAILY_LIFESTYLE", traits: ["NEIGHBORHOOD", "SERVICE", "RESIDENTIAL", "WELLNESS", "FOOD", "VISIBILITY", "EVENING_WEEKEND"], strengths: ["Dense storefronts, services, food, wellness, and resident demand support neighborhood and daily-use concepts.", "It provides a broader convenience and service environment than Union Street."], tradeoffs: ["Parking and curb competition require property-level validation.", "The corridor remains neighborhood-scale rather than a regional retail center."] },
  "valencia-street": { classification: CLASSIFICATION.CORE, fit: "STRONG", customerDemand: "EXPERIENTIAL_FOOD_DESTINATION", traits: ["FOOD", "WELLNESS", "EXPERIENTIAL", "DESTINATION", "VISIBILITY", "EVENING_WEEKEND", "NEIGHBORHOOD"], strengths: ["A pedestrian-oriented commercial corridor supports food, experiential, wellness, furnishings, and visible storefront concepts.", "Evening activity and destination behavior distinguish it within the Mission."], tradeoffs: ["Parking and loading are constrained.", "Exact block and storefront conditions remain important."] },
  "upper-market-castro": { classification: CLASSIFICATION.CORE, fit: "GOOD", customerDemand: "COMMUNITY_NEIGHBORHOOD_DESTINATION", traits: ["NEIGHBORHOOD", "SERVICE", "FOOD", "EXPERIENTIAL", "DESTINATION", "TRANSIT", "VISIBILITY", "EVENING_WEEKEND"], strengths: ["Neighborhood services, dining, nightlife, community identity, and transit support local and destination concepts.", "The district serves a different customer context from Valencia or Hayes Valley."], tradeoffs: ["Fit varies between Upper Market and side-street storefronts.", "Parking and curb access are constrained."] },
  "north-beach": { classification: CLASSIFICATION.CORE, fit: "STRONG", customerDemand: "VISITOR_NEIGHBORHOOD_FOOD", traits: ["VISITOR", "FOOD", "DESTINATION", "NEIGHBORHOOD", "EVENING_WEEKEND", "EXPERIENTIAL"], strengths: ["Visitor traffic, neighborhood demand, restaurants, cafes, and specialty retail create a distinctive day-to-evening environment.", "Fine-grained storefront character differs from Jackson Square and Union Square."], tradeoffs: ["Parking and loading are constrained.", "Small-scale storefronts and visitor dependence do not suit every concept."] },
  chinatown: { classification: CLASSIFICATION.CORE, fit: "STRONG", customerDemand: "VISITOR_SPECIALTY_COMMUNITY", traits: ["VISITOR", "DESTINATION", "FOOD", "NEIGHBORHOOD", "VISIBILITY", "SHOPPING_ADJACENCY"], strengths: ["Grant Avenue visitor retail and broader community-serving commerce support specialty, food, and culturally specific concepts.", "Its resident and Bay Area customer role is distinct from Union Square's general destination-shopping environment."], tradeoffs: ["Small-scale buildings, loading, and parking constrain some formats.", "Visitor-oriented and neighborhood-serving blocks have materially different demand patterns."] },
});

const districts = Object.entries({ ...reviewed, ...corridorFacts }).map(([districtId, facts]) => {
  const node = knowledgeGraph.find((item) => item.slug === districtId && item.operationalMarketId === "san-francisco") || {};
  const geography = retailGeographies.approved.find((item) => item.districtId === districtId) || retailGeographies.parents.find((item) => item.districtId === districtId) || {};
  const accessProfileId = geography.accessKnowledgeOwnerDistrictId || districtId;
  const access = accessFoundation.districtProfiles.find((item) => item.districtId === accessProfileId) || null;
  const graphRetail = node.spaceTypeFit?.retail || {};
  return {
    districtId,
    districtName: node.label || districtId,
    path: node.path || "",
    ...facts,
    summary: graphRetail.summary || facts.strengths[0] || facts.tradeoffs[0] || "",
    retailAttributes: { ...(node.retailAttributes || {}) },
    businessAttributes: { ...(node.attributes || {}) },
    path: node.path || geography.futurePublicPath || "",
    parentDistrictId: geography.parentDistrictId || "",
    geographyRole: geography.role || "RECOMMENDATION_ELIGIBLE",
    futurePublicPath: geography.futurePublicPath || node.path || "",
    accessProfileId: access?.districtId || "",
    accessKnowledgeTreatment: accessProfileId === districtId ? "DIRECT_DISTRICT_PROFILE" : "INHERITED_STRUCTURAL_CONTEXT",
    accessLimitations: accessProfileId === districtId ? [] : ["Corridor-level travel time and block access are not modeled; reviewed structural Access is inherited from the owning or adjacent district context."],
    reviewStatus: "APPROVED",
    evidenceSources: [...new Set(["_data/locationKnowledgeGraph.js", "_data/neighborhoodPages.js", "_data/commercialLocationModel.js", "_data/sfAccessFoundationV0.js", ...(geography.evidence || [])])],
  };
});

module.exports = {
  schemaVersion: "sf-retail-composition-foundation:v1",
  marketId: "san-francisco",
  propertyType: "retail_service",
  classification: CLASSIFICATION,
  componentPolicy: "Retail Fit, customer/business context, and Access remain separate ordinal evidence. Candidate identity is comparison context only.",
  presentationGroups: presentationGroups.groups.map((group) => ({ ...group, presentationGroupId: group.presentationGroupId.replace("sf-office:", "sf-retail:") })),
  competitionFamilies: retailGeographies.competitionFamilies,
  parentPresentationIdentities: retailGeographies.parents,
  deferredCandidates: retailGeographies.deferred,
  districts,
};
