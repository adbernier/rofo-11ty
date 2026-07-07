const schema = require("./locationKnowledgeSchema");
const recommendationProfiles = require("./recommendationProfiles");

const businessAttributeMap = {
  transit: "transit",
  parking: "parking",
  walkability: "walkability",
  freewayAccess: "freewayAccess",
  executiveImage: "executiveImage",
  customerAccess: "customerAccess",
  expansionFlexibility: "expansionFlexibility",
  costSensitivity: "costPosition",
};

const relationshipTypeByReason = {
  transit: "better_transit",
  parking: "better_parking",
  executive: "more_executive",
  creative: "more_creative",
  growth: "more_growth_oriented",
  cost: "lower_cost_alternative",
  truck: "better_truck_access",
  loading: "better_loading",
  visibility: "better_retail_visibility",
};

function fitValue(value) {
  if (value === "strong") return "strong";
  if (value === "good") return "good";
  if (value === "limited") return "limited";
  if (value === "excellent") return "excellent";
  return "unknown";
}

function migrateBusinessFit(businessFit = {}) {
  const output = {};
  Object.entries(businessFit).forEach(([spaceType, fit]) => {
    output[spaceType] = {
      fit: fitValue(fit.fit),
      summary: fit.summary || "",
      bestFor: Array.isArray(fit.bestFor) ? fit.bestFor : [],
      tradeoffs: Array.isArray(fit.tradeoffs) ? fit.tradeoffs : [],
    };
  });
  return output;
}

function migrateAttributes(locationAttributes = {}) {
  const output = schema.unknownBusinessAttributes();
  Object.entries(businessAttributeMap).forEach(([oldKey, newKey]) => {
    if (locationAttributes[oldKey]) output[newKey] = locationAttributes[oldKey];
  });
  return output;
}

function relationshipType(reason = "") {
  const text = String(reason).toLowerCase();
  const match = Object.entries(relationshipTypeByReason).find(([key]) => text.includes(key));
  return match ? match[1] : "similar";
}

function migrateRelationships(compareWith = []) {
  return {
    compareWith: compareWith.map((item) => ({
      slug: item.slug,
      label: item.label,
      reason: item.reason || "",
      relationshipType: relationshipType(item.reason),
    })),
  };
}

function migrateProfile(profile) {
  return {
    slug: profile.slug,
    label: profile.label,
    type: profile.type,
    city: profile.city,
    state: profile.state,
    path: profile.path || "",
    confidence: profile.confidence || "medium",
    spaceTypeFit: migrateBusinessFit(profile.businessFit),
    attributes: migrateAttributes(profile.locationAttributes),
    retailAttributes: schema.unknownRetailAttributes(),
    industrialAttributes: schema.unknownIndustrialAttributes(),
    bestFor: Array.isArray(profile.recommendedFor) ? profile.recommendedFor : [],
    tradeoffs: [],
    strengths: Array.isArray(profile.strengths) ? profile.strengths : [],
    marketPath: Array.isArray(profile.marketPath) ? profile.marketPath : [],
    relationships: migrateRelationships(profile.compareWith),
  };
}

const migratedProfiles = recommendationProfiles.map(migrateProfile);

const industrialNodes = [
  {
    slug: "hayward-industrial",
    label: "Hayward Industrial",
    type: "district",
    city: "Hayward",
    state: "CA",
    path: "/commercial-real-estate/CA/hayward/hayward-industrial/",
    confidence: "high",
    spaceTypeFit: {
      industrial: {
        fit: "strong",
        summary: "Strong fit for industrial, service, distribution, and production users that need mid-Bay freeway access and practical building formats.",
        bestFor: ["regional distribution", "service industrial", "light manufacturing", "contractor and operations users"],
        tradeoffs: ["less executive-facing than Silicon Valley office/R&D markets", "building quality and loading conditions should be checked carefully"],
      },
      warehouse: {
        fit: "strong",
        summary: "Good warehouse starting point for East Bay and Peninsula-serving operations that need I-880 access.",
        bestFor: ["warehouse users", "last-mile operations", "food and service distribution"],
        tradeoffs: ["not every building will support modern logistics requirements", "yard and trailer parking vary by property"],
      },
      flex: {
        fit: "good",
        summary: "Useful for flex users that need a practical mix of office, production, and warehouse functions.",
        bestFor: ["flex/R&D support users", "hardware support operations", "small manufacturers"],
        tradeoffs: ["less campus-oriented than Fremont or North San Jose"],
      },
    },
    attributes: { ...schema.unknownBusinessAttributes(), freewayAccess: "high", parking: "medium", expansionFlexibility: "medium", costPosition: "medium", talentAccess: "medium" },
    retailAttributes: schema.unknownRetailAttributes(),
    industrialAttributes: { ...schema.unknownIndustrialAttributes(), truckAccess: "high", highwayAccess: "high", lastMileAccess: "high", portAirportAccess: "medium", loading: "medium", yard: "medium", zoningFlexibility: "high", laborAccess: "high", parkingTrailer: "medium", outdoorStorage: "medium" },
    bestFor: ["industrial users", "warehouse users", "regional operations", "service businesses"],
    tradeoffs: ["less polished office image", "verify loading, yard, and power by building"],
    strengths: ["I-880 corridor access", "regional labor access", "industrial building base", "service and distribution utility"],
    relationships: {
      compareWith: [
        { slug: "union-city-industrial", label: "Union City Industrial", reason: "Compare for a more Tri-City warehouse and manufacturing path.", relationshipType: "similar" },
        { slug: "north-san-jose", label: "North San Jose", reason: "Compare if R&D and hardware ecosystem matter more.", relationshipType: "more_growth_oriented" },
      ],
    },
  },
  {
    slug: "union-city-industrial",
    label: "Union City Industrial",
    type: "district",
    city: "Union City",
    state: "CA",
    path: "/commercial-real-estate/CA/union-city/union-city-industrial/",
    confidence: "high",
    spaceTypeFit: {
      industrial: {
        fit: "strong",
        summary: "Strong fit for warehouse, distribution, and manufacturing users comparing the I-880 corridor between Hayward and Fremont.",
        bestFor: ["warehouse users", "manufacturing users", "regional logistics", "service industrial companies"],
        tradeoffs: ["less executive and customer-facing than office/R&D markets", "availability must be checked by building size and loading needs"],
      },
      warehouse: {
        fit: "strong",
        summary: "Useful warehouse starting point for companies needing East Bay and South Bay reach.",
        bestFor: ["regional warehouse users", "last-mile operations", "distribution companies"],
        tradeoffs: ["modern clear height and trailer parking vary by property"],
      },
      manufacturing: {
        fit: "good",
        summary: "Good fit for practical manufacturing and production users that need freeway access and industrial zoning context.",
        bestFor: ["light manufacturing", "production users", "contractor operations"],
        tradeoffs: ["specialized power or yard needs require property-level review"],
      },
    },
    attributes: { ...schema.unknownBusinessAttributes(), freewayAccess: "high", parking: "medium", expansionFlexibility: "medium", costPosition: "medium", talentAccess: "medium" },
    retailAttributes: schema.unknownRetailAttributes(),
    industrialAttributes: { ...schema.unknownIndustrialAttributes(), truckAccess: "high", highwayAccess: "high", lastMileAccess: "high", portAirportAccess: "medium", clearHeight: "medium", loading: "medium", yard: "medium", zoningFlexibility: "high", laborAccess: "high", parkingTrailer: "medium" },
    bestFor: ["warehouse users", "manufacturing users", "regional logistics"],
    tradeoffs: ["confirm loading, trailer parking, and clear height by building", "less suitable for image-driven office users"],
    strengths: ["I-880 access", "Tri-City industrial position", "warehouse and manufacturing utility", "regional labor access"],
    relationships: {
      compareWith: [
        { slug: "hayward-industrial", label: "Hayward Industrial", reason: "Compare for a more mid-Bay service and distribution location.", relationshipType: "similar" },
        { slug: "warm-springs-innovation-district", label: "Warm Springs Innovation District", reason: "Compare if advanced manufacturing and R&D adjacency matter more.", relationshipType: "more_growth_oriented" },
      ],
    },
  },
  {
    slug: "warm-springs-innovation-district",
    label: "Warm Springs Innovation District",
    type: "district",
    city: "Fremont",
    state: "CA",
    path: "/commercial-real-estate/CA/fremont/warm-springs-innovation-district/",
    confidence: "high",
    spaceTypeFit: {
      industrial: {
        fit: "strong",
        summary: "Strong fit for advanced manufacturing, hardware, robotics, EV supply chain, and R&D-adjacent industrial users.",
        bestFor: ["advanced manufacturing", "hardware companies", "robotics and EV suppliers", "R&D/production users"],
        tradeoffs: ["may be more specialized than general warehouse markets", "cost and buildout requirements need close review"],
      },
      flex: {
        fit: "strong",
        summary: "Strong flex/R&D fit for companies that combine engineering, testing, production, and operations.",
        bestFor: ["hardware engineering", "R&D support", "pilot production teams"],
        tradeoffs: ["not the right first choice for simple commodity storage"],
      },
      r_and_d: {
        fit: "strong",
        summary: "Strong R&D fit for teams needing Silicon Valley manufacturing adjacency and freeway access.",
        bestFor: ["hardware R&D", "advanced manufacturing", "clean-tech and robotics teams"],
        tradeoffs: ["less walkable and amenity-rich than office-first districts"],
      },
    },
    attributes: { ...schema.unknownBusinessAttributes(), freewayAccess: "high", parking: "high", expansionFlexibility: "high", talentAccess: "high", corporateEnvironment: "medium", costPosition: "medium" },
    retailAttributes: schema.unknownRetailAttributes(),
    industrialAttributes: { ...schema.unknownIndustrialAttributes(), truckAccess: "high", highwayAccess: "high", lastMileAccess: "medium", portAirportAccess: "medium", loading: "medium", yard: "medium", power: "high", zoningFlexibility: "high", laborAccess: "high", parkingTrailer: "medium" },
    bestFor: ["advanced manufacturing", "R&D/flex users", "hardware and robotics teams"],
    tradeoffs: ["less suited to purely client-facing office users", "building-level technical specs matter more than headline location"],
    strengths: ["Fremont innovation corridor", "manufacturing and R&D adjacency", "I-880 and Silicon Valley access", "hardware ecosystem fit"],
    relationships: {
      compareWith: [
        { slug: "north-san-jose", label: "North San Jose", reason: "Compare if broader office/R&D ecosystem and larger business parks matter more.", relationshipType: "more_growth_oriented" },
        { slug: "union-city-industrial", label: "Union City Industrial", reason: "Compare for more general warehouse and manufacturing utility.", relationshipType: "similar" },
      ],
    },
  },
];

const graph = [...migratedProfiles, ...industrialNodes];

const northSanJose = graph.find((node) => node.slug === "north-san-jose");
if (northSanJose) {
  northSanJose.spaceTypeFit = {
    ...northSanJose.spaceTypeFit,
    industrial: {
      fit: "good",
      summary: "Good fit for industrial-adjacent users that need Silicon Valley access, business park flexibility, and a stronger engineering ecosystem than traditional warehouse corridors.",
      bestFor: ["hardware companies", "R&D support users", "light manufacturing", "technology operations teams"],
      tradeoffs: ["less pure warehouse-oriented than Hayward or Union City", "truck and loading conditions vary more by building than in dedicated logistics districts"],
    },
    flex: {
      fit: "strong",
      summary: "Strong fit for flex users combining office, engineering, lab support, testing, or light production needs.",
      bestFor: ["hardware engineering teams", "R&D/flex users", "technology operations", "growth companies needing parking and expansion room"],
      tradeoffs: ["less walkable than downtown San Jose or Palo Alto", "not always the lowest-cost I-880 option"],
    },
    r_and_d: {
      fit: "strong",
      summary: "Strong R&D fit for companies that value South Bay talent access, freeway connectivity, and office/R&D business park inventory.",
      bestFor: ["engineering teams", "semiconductor and hardware users", "robotics and advanced technology companies"],
      tradeoffs: ["less executive-facing than Palo Alto", "more auto-oriented than urban innovation districts"],
    },
  };
  northSanJose.attributes = {
    ...northSanJose.attributes,
    freewayAccess: "high",
    parking: "high",
    expansionFlexibility: "high",
    talentAccess: "high",
    corporateEnvironment: "medium",
  };
  northSanJose.industrialAttributes = {
    ...schema.unknownIndustrialAttributes(),
    truckAccess: "medium",
    highwayAccess: "high",
    lastMileAccess: "medium",
    portAirportAccess: "medium",
    loading: "medium",
    yard: "low",
    power: "medium",
    zoningFlexibility: "medium",
    laborAccess: "high",
    parkingTrailer: "low",
  };
}

const warnings = schema.validateLocationKnowledgeGraph(graph);
if (warnings.length && process.env.ROFO_KNOWLEDGE_GRAPH_WARNINGS === "1") {
  console.warn(`[locationKnowledgeGraph] ${warnings.length} warning(s)`);
  warnings.forEach((warning) => console.warn(`- ${warning}`));
}

module.exports = graph;
