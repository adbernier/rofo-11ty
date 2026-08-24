const recommendationBuildings = require("./recommendationRepresentativeBuildings");

const BASE = "/commercial-real-estate/CA/san-francisco/";
const reviewedBuildingDistrictIds = new Set(["financial-district", "soma", "mission-bay", "jackson-square", "showplace-square", "dogpatch"]);
const provenance = (districtId) => Object.freeze([
  `_data/sfPublicDecisionSurfaces.js#${districtId}`,
  `_data/locationKnowledgeGraph.js#${districtId}`,
]);

function environment(districtId, id, name, type, descriptor, illustrates, spaceTypes, caveat = "Verify the specific property, block, and current operating conditions during a live market investigation.") {
  return Object.freeze({
    id: `sf:${districtId}:${id}`,
    kind: type === "Specialized operating environment" ? "specialized_operating_environment" : "commercial_environment",
    name,
    address: "",
    buildingType: type,
    descriptor,
    representativeReason: illustrates,
    relevantSpaceTypes: Object.freeze(spaceTypes),
    canonicalUrl: "",
    provenance: provenance(districtId),
    caveat,
  });
}

function building(districtId, id, name, address, descriptor, illustrates, spaceTypes, canonicalUrl) {
  return Object.freeze({
    id: `sf:${districtId}:${id}`,
    kind: "named_building",
    name,
    address,
    buildingType: "Representative commercial building",
    descriptor,
    representativeReason: illustrates,
    relevantSpaceTypes: Object.freeze(spaceTypes),
    canonicalUrl,
    provenance: Object.freeze([`_data/buildingPages.js#${canonicalUrl}`, ...provenance(districtId)]),
    caveat: "Representative example only; current availability, suite condition, and fit require live verification.",
  });
}

const authored = {
  "south-beach": [
    building("south-beach", "121-spear", "121 Spear St", "121 Spear St", "A downtown-edge commercial building near the Embarcadero and Transbay area.", "Makes South Beach's combination of conventional office access and waterfront-edge context tangible.", ["office"], "/commercial-real-estate/building/CA/san-francisco/121-spear-st/"),
    building("south-beach", "185-berry", "185 Berry St", "185 Berry St", "A larger-block commercial example near the ballpark and Mission Bay transition.", "Shows the mixed office, event, residential, and waterfront environment that differentiates South Beach from the Financial District.", ["office", "retail"], "/commercial-real-estate/building/CA/san-francisco/185-berry-st/"),
  ],
  "mission-district": [
    building("mission-district", "1800-mission", "1800 Mission St", "1800 Mission St", "A mixed-use commercial building on the Mission Street transit spine.", "Illustrates neighborhood-scale office, service, and storefront activity rather than an office-core setting.", ["office", "retail"], "/commercial-real-estate/building/CA/san-francisco/1800-mission-st/"),
    environment("mission-district", "neighborhood-commercial-blocks", "Mission neighborhood commercial blocks", "Commercial environment", "Mixed-use blocks combine small offices, services, food, and neighborhood retail beyond any single corridor.", "Keeps the broader Mission visible as context while Valencia Street remains the distinct ranked Retail corridor.", ["office", "retail"]),
  ],
  "union-square": [
    building("union-square", "155-post", "155 Post St", "155 Post St", "A smaller commercial building within Union Square's retail, hotel, and client-facing core.", "Shows the district's overlap between visitor-oriented commerce and smaller professional office use.", ["office", "retail"], "/commercial-real-estate/building/CA/san-francisco/155-post-st/"),
    building("union-square", "50-maiden", "50 Maiden Ln", "50 Maiden Ln", "A small-scale commercial address within a destination-shopping pedestrian setting.", "Illustrates the finer-grained storefront environment that distinguishes Union Square from conventional downtown office blocks.", ["retail"], "/commercial-real-estate/building/CA/san-francisco/50-maiden-ln/"),
  ],
  "civic-center": [
    building("civic-center", "1133-market", "1133 Market St", "1133 Market St", "A Market Street commercial building in the civic and cultural-institution district.", "Makes the area's transit-served institutional, nonprofit, service, and weekday context concrete.", ["office", "retail"], "/commercial-real-estate/building/CA/san-francisco/1133-market-st/"),
    building("civic-center", "1390-market", "1390 Market St", "1390 Market St", "A larger mixed-use commercial building near Civic Center transit and institutions.", "Shows the scale and block-specific diligence that distinguish Civic Center from nearby Hayes Valley.", ["office", "retail"], "/commercial-real-estate/building/CA/san-francisco/1390-market-st/"),
  ],
  "hayes-valley": [
    building("hayes-valley", "555-fulton", "555 Fulton St", "555 Fulton St", "A neighborhood-scale mixed-use commercial building near Hayes Street activity.", "Illustrates the smaller, design-conscious office and customer-facing environment.", ["office", "retail"], "/commercial-real-estate/building/CA/san-francisco/555-fulton-st/"),
    environment("hayes-valley", "hayes-storefront-fabric", "Hayes Street storefront fabric", "Commercial environment", "Compact mixed-use blocks support design, dining, wellness, specialty retail, and neighborhood services.", "Shows why Hayes Valley is a lifestyle destination without implying large or uniform storefront inventory.", ["retail"]),
  ],
  "marina-district": [
    building("marina-district", "1839-lombard", "1839 Lombard St", "1839 Lombard St", "A neighborhood-scale commercial building on the Marina's Lombard Street edge.", "Illustrates the smaller professional and service-commercial stock that supports the Marina umbrella identity.", ["office", "retail"], "/commercial-real-estate/building/CA/san-francisco/1839-lombard-st/"),
    environment("marina-district", "umbrella-context", "Marina neighborhood commercial context", "Commercial environment", "Northern neighborhood blocks connect smaller offices and services to the distinct Chestnut and Union Street retail corridors.", "Makes the parent geography useful without treating it as a third competing Retail corridor.", ["office", "retail"]),
  ],
  "potrero-hill": [
    building("potrero-hill", "1501-mariposa", "1501 Mariposa St", "1501 Mariposa St", "A production-adjacent commercial building at Potrero's eastern/base edge.", "Supports the reviewed transition between neighborhood-scale commercial use and the industrial/flex edge.", ["office", "industrial", "flex"], "/commercial-real-estate/building/CA/san-francisco/1501-mariposa-st/"),
    building("potrero-hill", "150-hooper", "150 Hooper St", "150 Hooper St", "A maker and production-oriented commercial example near Showplace Square and Mission Bay.", "Clarifies that Potrero's Industrial/Flex relevance is concentrated at the eastern/base edge, not across the residential hill.", ["industrial", "flex"], "/commercial-real-estate/building/CA/san-francisco/150-hooper-st/"),
  ],
  "presidio": [
    environment("presidio", "historic-campus", "Historic campus workplaces", "Commercial environment", "Reused historic buildings sit within a landscaped campus rather than a conventional street-grid office district.", "Makes the Presidio's campus character, northern orientation, and specialized inventory pattern tangible.", ["office"], "Confirm tenant eligibility, access, parking, building systems, and current space options directly for each Presidio building."),
    environment("presidio", "letterman-context", "Letterman-area office campus context", "Commercial environment", "Larger campus-style office settings illustrate a quieter alternative to downtown and neighborhood commercial blocks.", "Shows why creative, nonprofit, and mission-driven users may consider the Presidio without asserting current availability.", ["office"], "Building access and occupancy conditions are specialized and require current Presidio-specific verification."),
  ],
  "bayview-industrial": [
    environment("bayview-industrial", "warehouse-service", "Warehouse and service-industrial blocks", "Specialized operating environment", "Working blocks combine warehouse, contractor, food, fleet, distribution, and service-commercial building forms.", "Illustrates the operational depth that separates Bayview Industrial from broader Bayview and from adaptive Flex districts.", ["industrial", "flex"]),
    environment("bayview-industrial", "city-serving-yards", "City-serving operational compounds", "Specialized operating environment", "Vehicle-oriented sites and practical operating buildings support dispatch, service territories, production, and fleet needs.", "Makes clear why loading, circulation, neighbors, shoreline conditions, and site-specific utility matter here.", ["industrial", "flex"]),
  ],
  "central-waterfront": [
    environment("central-waterfront", "production-fabrication", "Production and fabrication buildings", "Specialized operating environment", "Practical PDR buildings support fabrication, maker, prototyping, service, and small production uses.", "Shows the production-led character that distinguishes Central Waterfront from Dogpatch's mixed-use environment.", ["industrial", "flex"]),
    environment("central-waterfront", "office-production", "Office-production hybrid environments", "Specialized operating environment", "Adaptive operational buildings combine workspace, product development, assembly, and light production.", "Illustrates a Flex pattern that is more production-oriented than Showplace Square's showroom focus.", ["flex", "industrial"]),
  ],
  "sacramento-street": [
    environment("sacramento-street", "design-home-cluster", "Design and home storefront cluster", "Commercial environment", "Small-scale storefronts form a destination-oriented home, design, and specialty-retail environment.", "Makes Sacramento Street's quieter premium/design role distinct from Union Square's visitor core and Showplace Square's trade-showroom scale.", ["retail"]),
    environment("sacramento-street", "boutique-blocks", "Boutique mixed-use blocks", "Commercial environment", "Fine-grained mixed-use buildings support planned visits, specialty shopping, and a neighborhood-scale customer experience.", "Illustrates premium destination behavior without implying continuous high-volume foot traffic.", ["retail"]),
  ],
  "fillmore-street": [
    environment("fillmore-street", "lifestyle-storefronts", "Fillmore lifestyle storefronts", "Commercial environment", "Mixed-use storefront blocks support boutiques, wellness, dining, and customer-facing services.", "Shows the corridor's combination of neighborhood repeat demand and premium lifestyle positioning.", ["retail"]),
    environment("fillmore-street", "dining-service-blocks", "Dining and neighborhood-service blocks", "Commercial environment", "Food, service, and specialty businesses share a walkable neighborhood commercial fabric.", "Makes Fillmore more than a premium-shopping label and highlights recurring local demand.", ["retail"]),
  ],
  "union-street-cow-hollow": [
    environment("union-street-cow-hollow", "boutique-wellness", "Boutique and wellness storefronts", "Commercial environment", "Smaller mixed-use storefronts support boutique, wellness, beauty, and lifestyle businesses.", "Illustrates a planned-visit and lifestyle orientation distinct from Chestnut Street's broader daily-use role.", ["retail"]),
    environment("union-street-cow-hollow", "destination-dining", "Destination dining and specialty blocks", "Commercial environment", "Dining and specialty storefronts serve neighborhood customers while also drawing intentional visits.", "Shows the corridor's destination component without treating it as a downtown visitor district.", ["retail"]),
  ],
  "chestnut-street": [
    environment("chestnut-street", "daily-use", "Daily-use storefront blocks", "Commercial environment", "Continuous neighborhood storefronts support food, fitness, services, convenience, and recurring household needs.", "Makes Chestnut's broad neighborhood-serving function distinct from Union Street's boutique/lifestyle emphasis.", ["retail"]),
    environment("chestnut-street", "dining-services", "Dining and service-commercial mix", "Commercial environment", "Restaurants and service businesses share a visible, walkable corridor serving frequent local visits.", "Illustrates why operational practicality and repeat demand matter alongside brand character.", ["retail"]),
  ],
  "valencia-street": [
    environment("valencia-street", "food-experiential", "Food and experiential storefronts", "Commercial environment", "Visible storefront blocks combine dining, specialty retail, wellness, entertainment, and evening activity.", "Makes Valencia's destination and experiential role distinct from the broader Mission parent geography.", ["retail"]),
    environment("valencia-street", "adaptive-storefronts", "Adaptive mixed-use storefront buildings", "Commercial environment", "Fine-grained commercial buildings support independent concepts and customer-facing uses with strong street identity.", "Illustrates the corridor's character while preserving building-level variation and operating tradeoffs.", ["retail"]),
  ],
  "upper-market-castro": [
    environment("upper-market-castro", "market-transit", "Upper Market transit-facing storefronts", "Commercial environment", "Visible mixed-use buildings combine services, food, neighborhood retail, and transit-oriented customer access.", "Shows the corridor's neighborhood and visitor role without relying on demographic assumptions.", ["retail"]),
    environment("upper-market-castro", "evening-service", "Castro commercial and evening-activity blocks", "Commercial environment", "Restaurants, specialty businesses, services, and evening uses share a strongly identified neighborhood setting.", "Makes the day-to-evening tradeoff tangible for customer-facing concepts.", ["retail"]),
  ],
  "north-beach": [
    environment("north-beach", "dining-cafe", "Dining and cafe storefront fabric", "Commercial environment", "Fine-grained storefronts support restaurants, cafes, specialty retail, and active day-to-evening visits.", "Illustrates North Beach's food and destination character alongside continuing neighborhood demand.", ["retail"]),
    environment("north-beach", "visitor-specialty", "Visitor and specialty commercial blocks", "Commercial environment", "Compact mixed-use blocks connect visitor activity with neighborhood-serving and specialty businesses.", "Distinguishes North Beach's dining-led destination pattern from Chinatown's denser specialty and community-serving commerce.", ["retail"]),
  ],
  "chinatown": [
    environment("chinatown", "dense-storefront", "Dense mixed-use storefront fabric", "Commercial environment", "Closely spaced storefronts support food, specialty commerce, services, and high-intensity pedestrian activity.", "Makes Chinatown's compact commercial form tangible without reducing it to tourism alone.", ["retail"]),
    environment("chinatown", "community-specialty", "Community-serving and visitor-specialty blocks", "Commercial environment", "Neighborhood services and culturally specific specialty businesses coexist with visitor-oriented commerce.", "Shows the dual customer context that distinguishes Chinatown from North Beach and Union Square.", ["retail"]),
  ],
};

const byDistrictId = {};
for (const [districtId, group] of Object.entries(recommendationBuildings.byDistrictSlug)) {
  if (!reviewedBuildingDistrictIds.has(districtId)) continue;
  byDistrictId[districtId] = group.buildings.slice(0, 3).map((item) => Object.freeze({
    id: `building:${item.buildingId}`,
    kind: "named_building",
    name: item.name,
    address: item.address,
    buildingType: item.buildingType || "Representative building",
    descriptor: item.bestFitSummary,
    representativeReason: item.representativeReason,
    relevantSpaceTypes: Object.freeze([]),
    canonicalUrl: item.canonicalUrl,
    image: item.image || "",
    fieldPhotoSubjectId: item.fieldPhotoSubjectId || "",
    provenance: Object.freeze(["_data/recommendationRepresentativeBuildings.js", item.canonicalUrl]),
    caveat: item.primaryTradeoff,
  }));
}
for (const [districtId, items] of Object.entries(authored)) byDistrictId[districtId] = Object.freeze(items);

module.exports = Object.freeze({
  schemaVersion: "sf-representative-content:v1",
  marketId: "san-francisco",
  availabilityDisclaimer: "Representative examples illustrate the location's commercial character and may not be currently available.",
  byDistrictId: Object.freeze(byDistrictId),
});
