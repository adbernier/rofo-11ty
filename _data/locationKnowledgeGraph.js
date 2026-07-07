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
    questionsToValidate: [],
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

function businessAttrs(values = {}) {
  return { ...schema.unknownBusinessAttributes(), ...values };
}

function retailAttrs(values = {}) {
  return { ...schema.unknownRetailAttributes(), ...values };
}

function industrialAttrs(values = {}) {
  return { ...schema.unknownIndustrialAttributes(), ...values };
}

function fit(fitValue, summary, bestFor = [], tradeoffs = []) {
  return { fit: fitValue, summary, bestFor, tradeoffs };
}

function mergeKnowledgeCard(graph, card) {
  const index = graph.findIndex((node) => node.slug === card.slug);
  if (index === -1) {
    graph.push({
      attributes: businessAttrs(),
      retailAttributes: retailAttrs(),
      industrialAttributes: industrialAttrs(),
      spaceTypeFit: {},
      bestFor: [],
      tradeoffs: [],
      strengths: [],
      questionsToValidate: [],
      relationships: { compareWith: [] },
      ...card,
    });
    return;
  }
  graph[index] = {
    ...graph[index],
    ...card,
    spaceTypeFit: { ...(graph[index].spaceTypeFit || {}), ...(card.spaceTypeFit || {}) },
    attributes: businessAttrs({ ...(graph[index].attributes || {}), ...(card.attributes || {}) }),
    retailAttributes: retailAttrs({ ...(graph[index].retailAttributes || {}), ...(card.retailAttributes || {}) }),
    industrialAttributes: industrialAttrs({ ...(graph[index].industrialAttributes || {}), ...(card.industrialAttributes || {}) }),
    questionsToValidate: card.questionsToValidate || graph[index].questionsToValidate || [],
    relationships: card.relationships || graph[index].relationships || { compareWith: [] },
  };
}

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
  northSanJose.questionsToValidate = ["Is parking important for employees?", "Do you need flex, R&D, or light production capability?", "How important are South Bay commute patterns?", "Would lower-cost I-880 industrial districts fit the operation better?"];
}

const industrialQuestionPrompts = {
  "hayward-industrial": ["What truck access and loading requirements are non-negotiable?", "Do you need yard, trailer parking, or outdoor storage?", "Is I-880 midpoint access more important than Silicon Valley adjacency?", "Are power or production requirements part of the search?"],
  "union-city-industrial": ["Do you need warehouse, manufacturing, or both?", "How important are trailer parking and clear height?", "Should the search favor East Bay reach or South Bay adjacency?", "Are specialized power, loading, or yard needs required?"],
  "warm-springs-innovation-district": ["Do you need advanced manufacturing or R&D production capability?", "Is Silicon Valley hardware talent access important?", "Do you need higher power or technical buildout potential?", "Would a general warehouse district be more cost-efficient?"],
};
Object.entries(industrialQuestionPrompts).forEach(([slug, questionsToValidate]) => {
  const node = graph.find((item) => item.slug === slug);
  if (node) node.questionsToValidate = questionsToValidate;
});

[
  {
    slug: "san-francisco",
    label: "San Francisco",
    type: "city",
    city: "San Francisco",
    state: "CA",
    path: "/commercial-real-estate/CA/san-francisco/",
    confidence: "high",
    marketPath: ["mission-bay", "soma", "financial-district"],
    questionsToValidate: ["Which San Francisco district best matches your commute pattern?", "Do you need a client-facing CBD address or a technology/life-science setting?", "How sensitive is the search to parking and occupancy cost?", "Would Peninsula or East Bay alternatives be worth comparing?"],
    relationships: { compareWith: [
      { slug: "mission-bay", label: "Mission Bay", reason: "Modern technology and life-science-oriented district path.", relationshipType: "more_growth_oriented" },
      { slug: "soma", label: "SoMa", reason: "Creative/adaptive central-city office alternative.", relationshipType: "more_creative" },
      { slug: "financial-district", label: "Financial District", reason: "Traditional office-core and client-facing business address.", relationshipType: "more_executive" },
    ] },
  },
  {
    slug: "palo-alto",
    label: "Palo Alto",
    type: "city",
    city: "Palo Alto",
    state: "CA",
    path: "/commercial-real-estate/CA/palo-alto/",
    confidence: "high",
    marketPath: ["downtown-palo-alto", "stanford-research-park"],
    questionsToValidate: ["Is Palo Alto's executive and talent signal worth the premium?", "Do you prefer downtown walkability or a campus setting?", "How important is Stanford adjacency?", "Would North Bayshore or North San Jose provide more expansion flexibility?"],
    relationships: { compareWith: [
      { slug: "downtown-palo-alto", label: "Downtown Palo Alto", reason: "Walkable executive and venture-oriented downtown path.", relationshipType: "more_executive" },
      { slug: "stanford-research-park", label: "Stanford Research Park", reason: "Campus-oriented technology and R&D setting.", relationshipType: "more_growth_oriented" },
      { slug: "north-bayshore", label: "North Bayshore", reason: "Larger technology campus ecosystem with Mountain View access.", relationshipType: "more_growth_oriented" },
    ] },
  },
  {
    slug: "financial-district-bunker-hill",
    questionsToValidate: ["Do clients expect a Downtown LA office-core address?", "Is transit access or parking more important?", "Do you need traditional tower inventory?", "Would Arts District or South Park better fit company culture?"],
  },
  {
    slug: "arts-district",
    questionsToValidate: ["Do you need creative/adaptive building character?", "Will clients or customers visit regularly?", "Are showroom, production-adjacent, or creative uses part of the requirement?", "Would Bunker Hill provide a stronger executive address?"],
  },
  {
    slug: "south-park",
    questionsToValidate: ["Do you want Downtown LA access with a mixed-use environment?", "Is entertainment/residential adjacency useful for recruiting?", "Will parking or transit drive the decision?", "Would Bunker Hill or Arts District better fit the brand?"],
  },
  {
    slug: "san-bruno",
    questionsToValidate: ["Is SFO or Peninsula access the main driver?", "Do you need a local-serving office or broader regional alternatives?", "How important is freeway access and parking?", "Should nearby stronger graph markets be reviewed with a local expert?"],
  },
].forEach((card) => mergeKnowledgeCard(graph, card));

[
  {
    slug: "mission-bay",
    label: "Mission Bay",
    type: "district",
    city: "San Francisco",
    state: "CA",
    path: "/commercial-real-estate/CA/san-francisco/mission-bay/",
    confidence: "high",
    spaceTypeFit: {
      office: fit("strong", "Strong fit for growth-stage office users that value newer inventory, transit, and access to San Francisco's technology and life-science ecosystem.", ["AI and technology teams", "life science-adjacent office users", "growth companies"], ["premium pricing versus older central-city alternatives", "less traditional client-facing CBD identity than the Financial District"]),
      life_science: fit("excellent", "Excellent fit for life science and research-adjacent users that benefit from UCSF proximity and a modern innovation district context.", ["life science companies", "research support teams", "healthcare-adjacent technology users"], ["lab-specific requirements must be validated building by building", "not every office building supports technical life-science use"]),
      retail: fit("limited", "Selective retail can work when it serves office, residential, healthcare, or event-driven demand, but Mission Bay is not a classic high-street retail district.", ["daily-needs retail", "food and beverage users"], ["foot traffic is more node-specific than corridor-wide"]),
    },
    attributes: businessAttrs({ transit: "high", parking: "medium", walkability: "medium", freewayAccess: "medium", executiveImage: "high", customerAccess: "medium", expansionFlexibility: "high", talentAccess: "high", amenities: "high", costPosition: "low", corporateEnvironment: "high" }),
    retailAttributes: retailAttrs({ footTraffic: "medium", customerParking: "medium", coTenancy: "medium", streetPresence: "medium", daytimePopulation: "high", eveningWeekendActivity: "medium", signageVisibility: "medium" }),
    bestFor: ["technology companies", "life science-adjacent users", "growth-stage office teams"],
    tradeoffs: ["premium occupancy cost", "not as traditional or client-facing as the CBD", "retail demand depends heavily on exact node"],
    strengths: ["newer office inventory", "UCSF and life-science adjacency", "Caltrain and waterfront access", "modern innovation district context"],
    questionsToValidate: ["Is proximity to UCSF or life-science partners important?", "How sensitive is the search to premium rents?", "Will employees rely on transit or regional commute routes?", "Do you need room to expand in the same district?"],
    relationships: { compareWith: [
      { slug: "soma", label: "SoMa", reason: "More varied creative office inventory and broader central-city building types.", relationshipType: "more_creative" },
      { slug: "financial-district", label: "Financial District", reason: "More traditional CBD office environment with stronger client-facing identity.", relationshipType: "more_executive" },
      { slug: "north-bayshore", label: "North Bayshore", reason: "Larger technology campus context for AI and research-oriented companies.", relationshipType: "more_growth_oriented" },
    ] },
  },
  {
    slug: "soma",
    label: "SoMa",
    type: "district",
    city: "San Francisco",
    state: "CA",
    path: "/commercial-real-estate/CA/san-francisco/soma/",
    confidence: "high",
    spaceTypeFit: {
      office: fit("strong", "Strong fit for teams that want central San Francisco access with more creative, adaptive, and flexible office character than a traditional tower core.", ["software teams", "creative agencies", "growth companies"], ["building quality and street context vary by block", "parking can be difficult for auto-oriented teams"]),
      showroom: fit("good", "Good selective fit for design, showroom, and client-facing creative users that benefit from SoMa's adaptive commercial texture.", ["design showrooms", "creative studios"], ["visibility and loading vary by building"]),
      retail: fit("good", "Retail can work selectively where office density, residential growth, and destination uses overlap.", ["food and beverage", "fitness and wellness", "daily-needs retail"], ["foot traffic is uneven", "customer parking can be limited"]),
    },
    attributes: businessAttrs({ transit: "high", parking: "low", walkability: "high", freewayAccess: "medium", executiveImage: "medium", customerAccess: "high", expansionFlexibility: "medium", talentAccess: "high", visibility: "medium", amenities: "high", costPosition: "medium", creativeEnvironment: "high" }),
    retailAttributes: retailAttrs({ footTraffic: "medium", customerParking: "low", coTenancy: "medium", streetPresence: "medium", daytimePopulation: "high", eveningWeekendActivity: "medium", signageVisibility: "medium" }),
    bestFor: ["technology teams", "creative office users", "companies comparing Mission Bay and downtown"],
    tradeoffs: ["block-by-block variation matters", "less polished than newer Mission Bay buildings", "less formal than the Financial District"],
    strengths: ["creative office inventory", "central access", "adaptive buildings", "proximity to downtown and Mission Bay"],
    questionsToValidate: ["Do you want adaptive character or polished Class A office?", "How important is parking for employees?", "Will clients visit frequently?", "Are you comfortable evaluating block-by-block differences?"],
    relationships: { compareWith: [
      { slug: "mission-bay", label: "Mission Bay", reason: "Newer buildings and stronger life-science/technology campus context.", relationshipType: "more_growth_oriented" },
      { slug: "financial-district", label: "Financial District", reason: "More traditional office-core inventory and client access.", relationshipType: "more_executive" },
      { slug: "jackson-square", label: "Jackson Square", reason: "Smaller-scale boutique office character near downtown.", relationshipType: "more_executive" },
    ] },
  },
  {
    slug: "financial-district",
    label: "Financial District",
    type: "district",
    city: "San Francisco",
    state: "CA",
    path: "/commercial-real-estate/CA/san-francisco/financial-district/",
    confidence: "high",
    spaceTypeFit: {
      office: fit("strong", "Strong fit for client-facing office users that value transit, a recognized business address, and traditional Class A office inventory.", ["finance firms", "legal and consulting teams", "headquarters and professional services"], ["less creative warehouse character than SoMa", "less life-science adjacency than Mission Bay"]),
      retail: fit("good", "Good fit for service retail and food uses that depend on weekday office population, transit access, and client-facing business traffic.", ["quick-service food", "professional-service retail", "fitness and wellness"], ["evening and weekend patterns can be weaker than mixed-use districts"]),
    },
    attributes: businessAttrs({ transit: "high", parking: "low", walkability: "high", freewayAccess: "medium", executiveImage: "high", customerAccess: "high", expansionFlexibility: "medium", talentAccess: "high", visibility: "high", amenities: "high", costPosition: "medium", corporateEnvironment: "high" }),
    retailAttributes: retailAttrs({ footTraffic: "high", customerParking: "low", coTenancy: "high", streetPresence: "high", daytimePopulation: "high", eveningWeekendActivity: "low", signageVisibility: "medium" }),
    bestFor: ["financial services", "legal firms", "consulting and professional-service firms"],
    tradeoffs: ["not the strongest fit for creative industrial character", "parking-sensitive teams may prefer other districts", "retail relies heavily on weekday office demand"],
    strengths: ["traditional office core", "BART and ferry access", "client-facing business environment", "established Class A inventory"],
    questionsToValidate: ["Do clients visit your office regularly?", "Is a traditional CBD address important?", "Will employees rely on BART, ferry, or regional transit?", "Is parking a major constraint?"],
    relationships: { compareWith: [
      { slug: "soma", label: "SoMa", reason: "More creative office variety and adaptive building formats.", relationshipType: "more_creative" },
      { slug: "jackson-square", label: "Jackson Square", reason: "More intimate boutique office setting near the CBD.", relationshipType: "similar" },
      { slug: "mission-bay", label: "Mission Bay", reason: "Newer buildings and stronger technology/life-science ecosystem.", relationshipType: "more_growth_oriented" },
    ] },
  },
  {
    slug: "jackson-square",
    label: "Jackson Square",
    type: "district",
    city: "San Francisco",
    state: "CA",
    path: "/commercial-real-estate/CA/san-francisco/jackson-square/",
    confidence: "high",
    spaceTypeFit: {
      office: fit("strong", "Strong fit for smaller office users that want a polished, walkable, downtown-adjacent setting with more character than a tower core.", ["venture firms", "boutique professional services", "creative executives"], ["smaller floorplates can limit expansion", "large contiguous requirements may need nearby alternatives"]),
      retail: fit("good", "Good selective retail and restaurant fit where historic character, nearby office users, and destination foot traffic overlap.", ["restaurants", "boutique service retail"], ["customer parking is limited", "visibility depends on the exact street"]),
    },
    attributes: businessAttrs({ transit: "high", parking: "low", walkability: "high", freewayAccess: "medium", executiveImage: "high", customerAccess: "high", expansionFlexibility: "low", talentAccess: "high", visibility: "medium", amenities: "high", costPosition: "low", creativeEnvironment: "high", corporateEnvironment: "medium" }),
    retailAttributes: retailAttrs({ footTraffic: "medium", customerParking: "low", coTenancy: "high", streetPresence: "high", daytimePopulation: "high", eveningWeekendActivity: "medium", signageVisibility: "medium" }),
    bestFor: ["boutique office users", "venture and investor teams", "client-facing creative firms"],
    tradeoffs: ["less suited for large headcount growth", "parking is constrained", "inventory can be limited"],
    strengths: ["historic boutique buildings", "walkable downtown adjacency", "executive/client-facing atmosphere", "creative and investor ecosystem"],
    questionsToValidate: ["Do you need smaller floorplates or room to expand?", "Is executive image more important than cost efficiency?", "Will clients visit the office?", "How important is parking versus walkability?"],
    relationships: { compareWith: [
      { slug: "financial-district", label: "Financial District", reason: "More traditional CBD inventory and larger office buildings.", relationshipType: "more_executive" },
      { slug: "soma", label: "SoMa", reason: "More adaptive creative inventory and larger range of building formats.", relationshipType: "more_creative" },
      { slug: "mission-bay", label: "Mission Bay", reason: "Newer buildings and stronger growth-company campus context.", relationshipType: "more_growth_oriented" },
    ] },
  },
].forEach((card) => mergeKnowledgeCard(graph, card));

[
  {
    slug: "downtown-palo-alto",
    label: "Downtown Palo Alto",
    type: "district",
    city: "Palo Alto",
    state: "CA",
    path: "/commercial-real-estate/CA/palo-alto/downtown-palo-alto/",
    confidence: "high",
    spaceTypeFit: {
      office: fit("strong", "Strong fit for office users that want walkability, executive access, Caltrain, and Silicon Valley credibility in a downtown setting.", ["startup teams", "investors", "professional-service firms"], ["larger contiguous spaces can be harder to find", "cost can be higher than nearby suburban alternatives"]),
      retail: fit("strong", "Strong retail and restaurant fit for concepts that benefit from downtown foot traffic, executive visitors, and surrounding residential and campus demand.", ["restaurants", "boutique retail", "service retail"], ["rents and competition can be high", "parking constraints must be tested"]),
    },
    attributes: businessAttrs({ transit: "high", parking: "medium", walkability: "high", freewayAccess: "medium", executiveImage: "high", customerAccess: "high", expansionFlexibility: "low", talentAccess: "high", visibility: "high", amenities: "high", costPosition: "low", corporateEnvironment: "high" }),
    retailAttributes: retailAttrs({ footTraffic: "high", customerParking: "medium", coTenancy: "high", streetPresence: "high", daytimePopulation: "high", eveningWeekendActivity: "high", signageVisibility: "high" }),
    questionsToValidate: ["Is Palo Alto's executive and recruiting signal worth the cost premium?", "Do you need Caltrain access?", "How much expansion room will you need?", "Is customer parking important?"],
    relationships: { compareWith: [
      { slug: "stanford-research-park", label: "Stanford Research Park", reason: "More campus-oriented office and R&D environment.", relationshipType: "more_growth_oriented" },
      { slug: "downtown-redwood-city", label: "Downtown Redwood City", reason: "Another walkable Peninsula downtown with different cost and access dynamics.", relationshipType: "lower_cost_alternative" },
      { slug: "north-bayshore", label: "North Bayshore", reason: "Larger technology campus context for engineering and research teams.", relationshipType: "more_growth_oriented" },
    ] },
  },
  {
    slug: "stanford-research-park",
    label: "Stanford Research Park",
    type: "district",
    city: "Palo Alto",
    state: "CA",
    path: "/commercial-real-estate/CA/palo-alto/stanford-research-park/",
    confidence: "high",
    spaceTypeFit: {
      office: fit("strong", "Strong fit for companies that want a mature technology campus environment with Stanford adjacency.", ["technology companies", "research-oriented teams", "executive office users"], ["less walkable downtown energy than Downtown Palo Alto", "less urban transit orientation than downtown districts"]),
      r_and_d: fit("strong", "Strong R&D fit for teams that value campus settings, research identity, and Stanford-adjacent talent context.", ["research teams", "technology R&D", "life science-adjacent users"], ["technical buildout needs must be verified", "less suitable for traditional retail visibility"]),
    },
    attributes: businessAttrs({ transit: "medium", parking: "high", walkability: "medium", freewayAccess: "medium", executiveImage: "high", customerAccess: "medium", expansionFlexibility: "medium", talentAccess: "high", amenities: "medium", costPosition: "low", corporateEnvironment: "high" }),
    industrialAttributes: industrialAttrs({ truckAccess: "low", highwayAccess: "medium", loading: "low", power: "medium", zoningFlexibility: "medium", laborAccess: "high" }),
    questionsToValidate: ["Do you need a campus setting rather than downtown walkability?", "How important is Stanford adjacency?", "Are technical R&D requirements part of the search?", "Will visitors expect executive image or easier parking?"],
    relationships: { compareWith: [
      { slug: "downtown-palo-alto", label: "Downtown Palo Alto", reason: "More walkable executive-meeting context.", relationshipType: "more_executive" },
      { slug: "north-bayshore", label: "North Bayshore", reason: "Larger technology campus environment in Mountain View.", relationshipType: "more_growth_oriented" },
      { slug: "north-san-jose", label: "North San Jose", reason: "More cost-flexible office/R&D and hardware-oriented options.", relationshipType: "lower_cost_alternative" },
    ] },
  },
  {
    slug: "downtown-redwood-city",
    label: "Downtown Redwood City",
    type: "district",
    city: "Redwood City",
    state: "CA",
    path: "/commercial-real-estate/CA/redwood-city/downtown-redwood-city/",
    confidence: "high",
    spaceTypeFit: {
      office: fit("good", "Good fit for office users that want a walkable Peninsula downtown with Caltrain access and a balanced regional position.", ["professional-service firms", "technology teams", "Peninsula-serving businesses"], ["less venture-centered than Palo Alto", "less large-campus identity than North Bayshore or Stanford Research Park"]),
      retail: fit("good", "Good fit for restaurants and service retail that benefit from downtown activity, civic uses, and surrounding office/residential demand.", ["restaurants", "service retail", "fitness and wellness"], ["customer parking and storefront visibility should be checked by block"]),
    },
    attributes: businessAttrs({ transit: "high", parking: "medium", walkability: "high", freewayAccess: "medium", executiveImage: "medium", customerAccess: "high", expansionFlexibility: "medium", talentAccess: "high", visibility: "high", amenities: "high", costPosition: "medium", corporateEnvironment: "medium" }),
    retailAttributes: retailAttrs({ footTraffic: "high", customerParking: "medium", coTenancy: "high", streetPresence: "high", daytimePopulation: "high", eveningWeekendActivity: "high", signageVisibility: "medium" }),
    questionsToValidate: ["Is a Peninsula midpoint more useful than Palo Alto prestige?", "Do employees need Caltrain access?", "Is walkability part of recruiting?", "Would a campus market fit better than downtown?"],
    relationships: { compareWith: [
      { slug: "downtown-palo-alto", label: "Downtown Palo Alto", reason: "Stronger executive and venture ecosystem.", relationshipType: "more_executive" },
      { slug: "downtown-san-mateo", label: "Downtown San Mateo", reason: "Another walkable Peninsula downtown with different commute geography.", relationshipType: "similar" },
      { slug: "north-bayshore", label: "North Bayshore", reason: "More technology campus and large floorplate context.", relationshipType: "more_growth_oriented" },
    ] },
  },
  {
    slug: "north-bayshore",
    label: "North Bayshore",
    type: "district",
    city: "Mountain View",
    state: "CA",
    path: "/commercial-real-estate/CA/mountain-view/north-bayshore/",
    confidence: "high",
    spaceTypeFit: {
      office: fit("strong", "Strong fit for technology and research-oriented office users that value campus scale and Mountain View talent access.", ["technology companies", "AI and research teams", "larger engineering groups"], ["less walkable urban environment", "may be less natural for small client-facing professional firms"]),
      r_and_d: fit("strong", "Strong fit for R&D and engineering users that need large technology campus context and Highway 101 access.", ["AI teams", "research groups", "engineering organizations"], ["less flexible for small tenant footprints", "auto-oriented commute pattern"]),
    },
    attributes: businessAttrs({ transit: "medium", parking: "high", walkability: "low", freewayAccess: "high", executiveImage: "high", customerAccess: "medium", expansionFlexibility: "high", talentAccess: "high", amenities: "medium", costPosition: "low", corporateEnvironment: "high" }),
    industrialAttributes: industrialAttrs({ truckAccess: "medium", highwayAccess: "high", loading: "medium", power: "medium", laborAccess: "high" }),
    questionsToValidate: ["Do you need campus scale or smaller flexible office?", "Are Highway 101 commute patterns workable?", "Is Mountain View technology ecosystem central to recruiting?", "Would North San Jose or Moffett Park offer better flexibility?"],
    relationships: { compareWith: [
      { slug: "moffett-park", label: "Moffett Park", reason: "Similar engineering/R&D business park context with a different Sunnyvale access pattern.", relationshipType: "similar" },
      { slug: "stanford-research-park", label: "Stanford Research Park", reason: "More Stanford-adjacent mature technology campus identity.", relationshipType: "more_executive" },
      { slug: "north-san-jose", label: "North San Jose", reason: "More cost-flexible South Bay office/R&D inventory.", relationshipType: "lower_cost_alternative" },
    ] },
  },
  {
    slug: "moffett-park",
    label: "Moffett Park",
    type: "district",
    city: "Sunnyvale",
    state: "CA",
    path: "/commercial-real-estate/CA/sunnyvale/moffett-park/",
    confidence: "high",
    spaceTypeFit: {
      office: fit("good", "Good fit for engineering and R&D-oriented office users that want campus-style buildings and practical Highway 101 access.", ["engineering teams", "R&D users", "technology operations groups"], ["less walkable and mixed-use than downtown settings", "less executive-facing than Palo Alto"]),
      r_and_d: fit("strong", "Strong fit for R&D and engineering teams needing business-park scale, parking, and Sunnyvale/Mountain View access.", ["hardware teams", "R&D groups", "technology operations"], ["not ideal for client-facing downtown uses"]),
      flex: fit("good", "Good fit for office/flex users that need engineering support space and practical access.", ["office/flex users", "testing and support teams"], ["loading and technical requirements vary by building"]),
    },
    attributes: businessAttrs({ transit: "medium", parking: "high", walkability: "low", freewayAccess: "high", executiveImage: "medium", customerAccess: "medium", expansionFlexibility: "high", talentAccess: "high", amenities: "medium", costPosition: "medium", corporateEnvironment: "medium" }),
    industrialAttributes: industrialAttrs({ truckAccess: "medium", highwayAccess: "high", loading: "medium", power: "medium", zoningFlexibility: "medium", laborAccess: "high", parkingTrailer: "low" }),
    questionsToValidate: ["Do you need campus-style buildings and parking?", "Is Highway 101 access more important than walkability?", "Are R&D/flex functions part of the requirement?", "Would North Bayshore's ecosystem justify a higher-cost search?"],
    relationships: { compareWith: [
      { slug: "north-bayshore", label: "North Bayshore", reason: "More prominent large technology campus ecosystem.", relationshipType: "more_growth_oriented" },
      { slug: "north-san-jose", label: "North San Jose", reason: "Larger South Bay office/R&D corridor with more freeway-oriented options.", relationshipType: "lower_cost_alternative" },
    ] },
  },
  {
    slug: "downtown-san-mateo",
    label: "Downtown San Mateo",
    type: "district",
    city: "San Mateo",
    state: "CA",
    path: "/commercial-real-estate/CA/san-mateo/downtown-san-mateo/",
    confidence: "medium",
    spaceTypeFit: {
      office: fit("good", "Good fit for Peninsula-serving office users that want a walkable downtown, Caltrain access, and a less Palo Alto-centric location.", ["professional services", "regional office users", "customer-facing teams"], ["less venture identity than Palo Alto", "less campus scale than North Bayshore"]),
      retail: fit("strong", "Strong fit for restaurants and local-serving retail that benefit from downtown street activity and surrounding office and residential demand.", ["restaurants", "boutique retail", "service retail"], ["parking and storefront visibility vary by block"]),
    },
    attributes: businessAttrs({ transit: "high", parking: "medium", walkability: "high", freewayAccess: "medium", executiveImage: "medium", customerAccess: "high", expansionFlexibility: "medium", talentAccess: "medium", visibility: "high", amenities: "high", costPosition: "medium", corporateEnvironment: "medium" }),
    retailAttributes: retailAttrs({ footTraffic: "high", customerParking: "medium", coTenancy: "high", streetPresence: "high", daytimePopulation: "high", eveningWeekendActivity: "high", signageVisibility: "medium" }),
    bestFor: ["Peninsula-serving office users", "restaurants and service retail", "professional services"],
    tradeoffs: ["less technology-campus identity", "larger expansion needs may require nearby alternatives"],
    strengths: ["walkable downtown", "Caltrain access", "central Peninsula position", "retail and restaurant environment"],
    questionsToValidate: ["Is San Mateo's central Peninsula commute pattern the best fit?", "Do you need downtown walkability?", "How important is customer parking?", "Would Redwood City or Palo Alto carry a stronger client signal?"],
    relationships: { compareWith: [
      { slug: "downtown-redwood-city", label: "Downtown Redwood City", reason: "Another walkable Peninsula downtown with stronger south Peninsula access.", relationshipType: "similar" },
      { slug: "downtown-palo-alto", label: "Downtown Palo Alto", reason: "More executive and venture-oriented downtown environment.", relationshipType: "more_executive" },
    ] },
  },
].forEach((card) => mergeKnowledgeCard(graph, card));

[
  {
    slug: "emeryville-commercial-core",
    label: "Emeryville Commercial Core",
    type: "district",
    city: "Emeryville",
    state: "CA",
    path: "/commercial-real-estate/CA/emeryville/emeryville-commercial-core/",
    confidence: "high",
    spaceTypeFit: {
      office: fit("strong", "Strong fit for East Bay office and life-science support users that want Berkeley/Oakland adjacency with more campus-oriented buildings.", ["technology support teams", "life science-adjacent office users", "professional services"], ["less downtown walkability than Oakland or Berkeley", "retail and amenity access is more node-specific"]),
      flex: fit("good", "Good fit for flex and R&D-support users that want East Bay access without a pure industrial setting.", ["R&D support users", "product teams", "office/flex users"], ["technical specifications vary by building"]),
    },
    attributes: businessAttrs({ transit: "medium", parking: "medium", walkability: "medium", freewayAccess: "high", executiveImage: "medium", customerAccess: "medium", expansionFlexibility: "high", talentAccess: "high", amenities: "medium", costPosition: "medium", creativeEnvironment: "medium", corporateEnvironment: "medium" }),
    industrialAttributes: industrialAttrs({ truckAccess: "medium", highwayAccess: "high", loading: "medium", power: "medium", zoningFlexibility: "medium", laborAccess: "high" }),
    bestFor: ["East Bay office users", "life science support companies", "R&D/flex teams"],
    tradeoffs: ["less urban downtown identity", "building-by-building specs matter for technical users"],
    strengths: ["Berkeley/Oakland adjacency", "Bay Bridge access", "office and research support buildings", "business-park structure"],
    questionsToValidate: ["Do you want Berkeley/Oakland access without a downtown setting?", "Is parking or freeway access important?", "Do you need office/flex capability?", "Would West Berkeley's industrial character fit better?"],
    relationships: { compareWith: [
      { slug: "west-berkeley", label: "West Berkeley", reason: "More industrial, maker, and research-support character.", relationshipType: "more_creative" },
      { slug: "downtown-berkeley", label: "Downtown Berkeley", reason: "More transit-oriented and university-adjacent downtown setting.", relationshipType: "better_transit" },
      { slug: "jack-london-square", label: "Jack London Square", reason: "More waterfront and downtown Oakland customer/client context.", relationshipType: "more_creative" },
    ] },
  },
  {
    slug: "downtown-berkeley",
    label: "Downtown Berkeley",
    type: "district",
    city: "Berkeley",
    state: "CA",
    path: "/commercial-real-estate/CA/berkeley/downtown-berkeley/",
    confidence: "high",
    spaceTypeFit: {
      office: fit("good", "Good fit for office users that value BART access, UC Berkeley adjacency, and a walkable downtown environment.", ["education-adjacent companies", "professional services", "nonprofits and civic users"], ["less parking and campus-style expansion than Emeryville", "larger modern office options can be limited"]),
      retail: fit("strong", "Strong fit for restaurants and retail that benefit from student, resident, visitor, and transit-oriented foot traffic.", ["restaurants", "student-serving retail", "service retail"], ["parking-sensitive concepts need careful validation"]),
    },
    attributes: businessAttrs({ transit: "high", parking: "low", walkability: "high", freewayAccess: "medium", executiveImage: "medium", customerAccess: "high", expansionFlexibility: "low", talentAccess: "high", visibility: "high", amenities: "high", costPosition: "medium", creativeEnvironment: "high" }),
    retailAttributes: retailAttrs({ footTraffic: "high", customerParking: "low", coTenancy: "high", streetPresence: "high", daytimePopulation: "high", eveningWeekendActivity: "high", signageVisibility: "high" }),
    bestFor: ["university-adjacent office users", "restaurants", "professional services"],
    tradeoffs: ["limited parking", "less modern office scale than Emeryville", "student/visitor activity may not fit every brand"],
    strengths: ["BART access", "UC Berkeley adjacency", "walkability", "retail and restaurant energy"],
    questionsToValidate: ["Is BART access more important than parking?", "Do you benefit from UC Berkeley adjacency?", "Do clients need easy driving access?", "Is a downtown street environment right for your team?"],
    relationships: { compareWith: [
      { slug: "emeryville-commercial-core", label: "Emeryville Commercial Core", reason: "More campus-oriented office and parking-friendly East Bay setting.", relationshipType: "better_parking" },
      { slug: "west-berkeley", label: "West Berkeley", reason: "More industrial, maker, and research-support space.", relationshipType: "more_creative" },
    ] },
  },
  {
    slug: "west-berkeley",
    label: "West Berkeley",
    type: "district",
    city: "Berkeley",
    state: "CA",
    path: "/commercial-real-estate/CA/berkeley/west-berkeley/",
    confidence: "high",
    spaceTypeFit: {
      industrial: fit("good", "Good fit for light industrial, production, maker, and service users that need Berkeley identity with practical building formats.", ["maker businesses", "service industrial users", "production users"], ["loading, power, and zoning must be verified carefully"]),
      flex: fit("strong", "Strong fit for flex, research-support, and creative production users that need a mix of office and practical space.", ["R&D support users", "creative production teams", "product companies"], ["not as polished as office-first districts"]),
      office: fit("good", "Good fit for creative and research-adjacent office users that prefer industrial character over a traditional downtown.", ["creative office users", "research-adjacent teams", "local professional services"], ["less transit-oriented than Downtown Berkeley"]),
    },
    attributes: businessAttrs({ transit: "medium", parking: "medium", walkability: "medium", freewayAccess: "high", executiveImage: "medium", customerAccess: "medium", expansionFlexibility: "medium", talentAccess: "high", visibility: "medium", amenities: "medium", costPosition: "medium", creativeEnvironment: "high" }),
    industrialAttributes: industrialAttrs({ truckAccess: "medium", highwayAccess: "high", loading: "medium", yard: "low", power: "medium", zoningFlexibility: "medium", laborAccess: "high", outdoorStorage: "low" }),
    bestFor: ["maker and production users", "flex/R&D support", "creative office teams"],
    tradeoffs: ["building conditions vary", "less formal client-facing identity", "technical needs must be verified property by property"],
    strengths: ["industrial character", "Berkeley talent access", "I-80 access", "maker and research-support environment"],
    questionsToValidate: ["Do you need loading, power, or production capability?", "Is Berkeley identity important?", "Would a more campus-style Emeryville building fit better?", "Are clients comfortable visiting an industrial-edge district?"],
    relationships: { compareWith: [
      { slug: "emeryville-commercial-core", label: "Emeryville Commercial Core", reason: "More business-park structure and office/life-science support buildings.", relationshipType: "better_parking" },
      { slug: "downtown-berkeley", label: "Downtown Berkeley", reason: "More transit-oriented university downtown setting.", relationshipType: "better_transit" },
      { slug: "jack-london-square", label: "Jack London Square", reason: "More waterfront creative office and Oakland access.", relationshipType: "more_creative" },
    ] },
  },
  {
    slug: "jack-london-square",
    label: "Jack London Square",
    type: "district",
    city: "Oakland",
    state: "CA",
    path: "/commercial-real-estate/CA/oakland/jack-london-square/",
    confidence: "high",
    spaceTypeFit: {
      office: fit("good", "Good fit for office users that want Oakland access, waterfront character, and a less formal environment than the downtown core.", ["creative office users", "professional services", "waterfront-oriented teams"], ["less traditional tower-core identity than Downtown Oakland", "transit access depends on exact location"]),
      retail: fit("good", "Good selective fit for restaurants and customer-facing uses that benefit from waterfront identity and destination activity.", ["restaurants", "fitness/wellness", "destination service retail"], ["demand is more destination-driven than pure foot-traffic retail"]),
    },
    attributes: businessAttrs({ transit: "medium", parking: "medium", walkability: "medium", freewayAccess: "high", executiveImage: "medium", customerAccess: "high", expansionFlexibility: "medium", talentAccess: "medium", visibility: "medium", amenities: "high", costPosition: "medium", creativeEnvironment: "high" }),
    retailAttributes: retailAttrs({ footTraffic: "medium", customerParking: "medium", coTenancy: "medium", streetPresence: "high", daytimePopulation: "medium", eveningWeekendActivity: "high", signageVisibility: "medium" }),
    bestFor: ["creative office users", "waterfront professional services", "destination restaurant concepts"],
    tradeoffs: ["not as transit-central as Downtown Oakland", "waterfront identity may matter more than pure efficiency"],
    strengths: ["waterfront character", "Oakland access", "creative office texture", "restaurant and destination activity"],
    questionsToValidate: ["Is waterfront identity useful for clients or employees?", "Do you need BART-first access?", "How important is parking?", "Would Emeryville or Downtown Oakland be a better operational fit?"],
    relationships: { compareWith: [
      { slug: "emeryville-commercial-core", label: "Emeryville Commercial Core", reason: "More business-park structure and East Bay office/life-science support context.", relationshipType: "better_parking" },
      { slug: "west-berkeley", label: "West Berkeley", reason: "More industrial and maker-oriented Berkeley setting.", relationshipType: "more_creative" },
    ] },
  },
].forEach((card) => mergeKnowledgeCard(graph, card));

[
  {
    slug: "downtown-sacramento",
    label: "Downtown Sacramento",
    type: "district",
    city: "Sacramento",
    state: "CA",
    path: "/commercial-real-estate/CA/sacramento/downtown-sacramento/",
    confidence: "high",
    spaceTypeFit: {
      office: fit("strong", "Strong fit for office users that need civic, legal, government, and central Sacramento business access.", ["legal firms", "government-adjacent users", "professional services"], ["parking and commute patterns should be compared with suburban alternatives", "less campus-style expansion than Rancho Cordova or Folsom"]),
      retail: fit("good", "Good fit for restaurants and service retail that benefit from daytime office, civic, event, and visitor demand.", ["restaurants", "service retail", "hospitality-adjacent uses"], ["evening/weekend activity varies by corridor"]),
    },
    attributes: businessAttrs({ transit: "high", parking: "medium", walkability: "high", freewayAccess: "high", executiveImage: "high", customerAccess: "high", expansionFlexibility: "medium", talentAccess: "high", visibility: "high", amenities: "high", costPosition: "medium", corporateEnvironment: "high" }),
    retailAttributes: retailAttrs({ footTraffic: "high", customerParking: "medium", coTenancy: "high", streetPresence: "high", daytimePopulation: "high", eveningWeekendActivity: "medium", signageVisibility: "high" }),
    bestFor: ["government-adjacent office users", "legal firms", "downtown professional services"],
    tradeoffs: ["parking and commute pattern can favor suburban alternatives", "not ideal for warehouse or production needs"],
    strengths: ["civic core", "regional transit", "downtown client access", "legal and professional-service environment"],
    questionsToValidate: ["Do clients or agencies need downtown access?", "Is transit or parking more important?", "Would suburban office parks reduce commute friction?", "Is a civic/professional identity useful?"],
    relationships: { compareWith: [
      { slug: "midtown-sacramento", label: "Midtown Sacramento", reason: "More creative, mixed-use, and neighborhood-oriented office context.", relationshipType: "more_creative" },
      { slug: "natomas", label: "Natomas", reason: "More parking-friendly and airport/freeway-oriented office setting.", relationshipType: "better_parking" },
      { slug: "rancho-cordova-commercial-core", label: "Rancho Cordova Commercial Core", reason: "More suburban campus and cost-efficient office/flex alternatives.", relationshipType: "lower_cost_alternative" },
    ] },
  },
  {
    slug: "midtown-sacramento",
    label: "Midtown Sacramento",
    type: "district",
    city: "Sacramento",
    state: "CA",
    path: "/commercial-real-estate/CA/sacramento/midtown-sacramento/",
    confidence: "high",
    spaceTypeFit: {
      office: fit("good", "Good fit for smaller office users that want walkability, local retail, and a more creative Sacramento environment.", ["creative firms", "nonprofits", "boutique professional services"], ["larger modern office blocks may be limited", "parking must be validated"]),
      retail: fit("strong", "Strong fit for restaurant, wellness, and local-serving retail that benefits from neighborhood energy and evening/weekend activity.", ["restaurants", "wellness users", "boutique retail"], ["customer parking and visibility vary by corridor"]),
    },
    attributes: businessAttrs({ transit: "medium", parking: "medium", walkability: "high", freewayAccess: "medium", executiveImage: "medium", customerAccess: "high", expansionFlexibility: "low", talentAccess: "high", visibility: "high", amenities: "high", costPosition: "medium", creativeEnvironment: "high" }),
    retailAttributes: retailAttrs({ footTraffic: "high", customerParking: "medium", coTenancy: "high", streetPresence: "high", daytimePopulation: "medium", eveningWeekendActivity: "high", signageVisibility: "high" }),
    bestFor: ["creative office users", "restaurants", "small professional-service teams"],
    tradeoffs: ["less formal than downtown", "parking can shape fit", "large expansion paths may be limited"],
    strengths: ["walkability", "creative/local character", "restaurant and retail environment", "central Sacramento access"],
    questionsToValidate: ["Do employees value walkability and amenities?", "Is parking a constraint?", "Do you need a formal downtown address?", "Could Downtown Sacramento or Natomas fit operations better?"],
    relationships: { compareWith: [
      { slug: "downtown-sacramento", label: "Downtown Sacramento", reason: "More formal civic and professional office core.", relationshipType: "more_executive" },
      { slug: "natomas", label: "Natomas", reason: "More parking-friendly and freeway-oriented office setting.", relationshipType: "better_parking" },
    ] },
  },
  {
    slug: "natomas",
    label: "Natomas",
    type: "district",
    city: "Sacramento",
    state: "CA",
    path: "/commercial-real-estate/CA/sacramento/natomas/",
    confidence: "high",
    spaceTypeFit: {
      office: fit("good", "Good fit for office users that value parking, airport access, freeway access, and practical suburban business settings.", ["regional offices", "professional services", "airport-adjacent users"], ["less walkable than Downtown or Midtown", "less civic/client-facing identity than Downtown Sacramento"]),
      flex: fit("good", "Good fit for office/flex users that need practical access and lower-friction operations than central Sacramento.", ["operations teams", "service businesses", "office/flex users"], ["technical building specs vary"]),
    },
    attributes: businessAttrs({ transit: "medium", parking: "high", walkability: "low", freewayAccess: "high", executiveImage: "medium", customerAccess: "medium", expansionFlexibility: "high", talentAccess: "medium", visibility: "medium", amenities: "medium", costPosition: "medium", corporateEnvironment: "medium" }),
    industrialAttributes: industrialAttrs({ truckAccess: "medium", highwayAccess: "high", lastMileAccess: "medium", portAirportAccess: "high", loading: "medium", zoningFlexibility: "medium", laborAccess: "medium", parkingTrailer: "medium" }),
    bestFor: ["regional offices", "airport-access users", "parking-sensitive teams"],
    tradeoffs: ["auto-oriented", "less walkable amenity environment", "less formal than downtown"],
    strengths: ["airport access", "freeway access", "parking", "suburban business environment"],
    questionsToValidate: ["Is airport access important?", "Do employees need easy parking?", "Would downtown client access matter more?", "Do you need office/flex capability?"],
    relationships: { compareWith: [
      { slug: "downtown-sacramento", label: "Downtown Sacramento", reason: "More civic and client-facing central office core.", relationshipType: "more_executive" },
      { slug: "rancho-cordova-commercial-core", label: "Rancho Cordova Commercial Core", reason: "More Highway 50 office/flex and suburban business park context.", relationshipType: "similar" },
      { slug: "roseville-commercial-core", label: "Roseville Commercial Core", reason: "More Placer County-oriented suburban office environment.", relationshipType: "better_parking" },
    ] },
  },
  {
    slug: "rancho-cordova-commercial-core",
    label: "Rancho Cordova Commercial Core",
    type: "district",
    city: "Rancho Cordova",
    state: "CA",
    path: "/commercial-real-estate/CA/rancho-cordova/rancho-cordova-commercial-core/",
    confidence: "high",
    spaceTypeFit: {
      office: fit("good", "Good fit for cost-conscious office users that want Highway 50 access, parking, and suburban business-park functionality.", ["back-office teams", "regional service offices", "insurance and professional-service users"], ["less walkable and image-driven than downtown", "client-facing firms may prefer central Sacramento"]),
      flex: fit("strong", "Strong fit for flex and operations users that need office plus practical service or production support.", ["service operations", "office/flex users", "regional business units"], ["building specs vary by property"]),
    },
    attributes: businessAttrs({ transit: "medium", parking: "high", walkability: "low", freewayAccess: "high", executiveImage: "medium", customerAccess: "medium", expansionFlexibility: "high", talentAccess: "medium", visibility: "medium", amenities: "medium", costPosition: "high", corporateEnvironment: "medium" }),
    industrialAttributes: industrialAttrs({ truckAccess: "medium", highwayAccess: "high", loading: "medium", power: "medium", zoningFlexibility: "medium", laborAccess: "medium", parkingTrailer: "medium" }),
    bestFor: ["suburban office users", "cost-sensitive teams", "office/flex operations"],
    tradeoffs: ["auto-oriented", "less downtown client-facing identity", "amenities are more dispersed"],
    strengths: ["Highway 50 access", "parking", "cost efficiency", "office/flex business parks"],
    questionsToValidate: ["Is lower occupancy cost a priority?", "Do employees prefer suburban parking?", "Do clients expect a central Sacramento address?", "Will office/flex functionality matter?"],
    relationships: { compareWith: [
      { slug: "folsom-commercial-core", label: "Folsom Commercial Core", reason: "More eastern Sacramento technology and professional office context.", relationshipType: "more_executive" },
      { slug: "roseville-commercial-core", label: "Roseville Commercial Core", reason: "North/east suburban alternative with Placer County access.", relationshipType: "similar" },
      { slug: "downtown-sacramento", label: "Downtown Sacramento", reason: "More civic and client-facing office core.", relationshipType: "more_executive" },
    ] },
  },
  {
    slug: "folsom-commercial-core",
    label: "Folsom Commercial Core",
    type: "district",
    city: "Folsom",
    state: "CA",
    path: "/commercial-real-estate/CA/folsom/folsom-commercial-core/",
    confidence: "high",
    spaceTypeFit: {
      office: fit("good", "Good fit for suburban office users that want eastern Sacramento access, executive image, and a technology/professional-service environment.", ["technology users", "professional services", "regional headquarters"], ["less central than Downtown Sacramento", "less cost-efficient than some Rancho Cordova options"]),
      retail: fit("good", "Good fit for customer-facing uses that benefit from Folsom's suburban household base and retail corridors.", ["service retail", "medical/wellness", "restaurant users"], ["site visibility and parking drive performance"]),
    },
    attributes: businessAttrs({ transit: "low", parking: "high", walkability: "medium", freewayAccess: "high", executiveImage: "high", customerAccess: "medium", expansionFlexibility: "medium", talentAccess: "medium", visibility: "medium", amenities: "high", costPosition: "medium", corporateEnvironment: "high" }),
    retailAttributes: retailAttrs({ footTraffic: "medium", customerParking: "high", coTenancy: "high", streetPresence: "medium", daytimePopulation: "medium", eveningWeekendActivity: "medium", signageVisibility: "medium" }),
    bestFor: ["suburban professional services", "technology office users", "customer-facing local businesses"],
    tradeoffs: ["less regional transit", "farther from downtown government/client core", "cost can exceed more utilitarian suburbs"],
    strengths: ["executive suburban image", "Highway 50 access", "amenities", "professional-service environment"],
    questionsToValidate: ["Is eastern Sacramento commute access important?", "Do you need executive suburban image?", "Would Rancho Cordova provide better cost efficiency?", "Is public transit a factor?"],
    relationships: { compareWith: [
      { slug: "rancho-cordova-commercial-core", label: "Rancho Cordova Commercial Core", reason: "More cost-efficient Highway 50 office/flex alternative.", relationshipType: "lower_cost_alternative" },
      { slug: "roseville-commercial-core", label: "Roseville Commercial Core", reason: "Alternative suburban executive/professional-service market.", relationshipType: "similar" },
      { slug: "rocklin-commercial-core", label: "Rocklin Commercial Core", reason: "More Placer County-oriented suburban office and service market.", relationshipType: "similar" },
    ] },
  },
  {
    slug: "roseville-commercial-core",
    label: "Roseville Commercial Core",
    type: "district",
    city: "Roseville",
    state: "CA",
    path: "/commercial-real-estate/CA/roseville/roseville-commercial-core/",
    confidence: "high",
    spaceTypeFit: {
      office: fit("good", "Good fit for suburban office users serving Placer County and northeast Sacramento with strong parking and regional retail amenities.", ["medical and professional services", "regional offices", "customer-facing firms"], ["less central to Sacramento civic users", "auto-oriented commute pattern"]),
      retail: fit("strong", "Strong fit for retail and restaurant users that benefit from Roseville's regional shopping base and suburban customer access.", ["restaurants", "medical/wellness", "service retail"], ["co-tenancy and parking are site-specific"]),
    },
    attributes: businessAttrs({ transit: "low", parking: "high", walkability: "medium", freewayAccess: "high", executiveImage: "medium", customerAccess: "high", expansionFlexibility: "high", talentAccess: "medium", visibility: "high", amenities: "high", costPosition: "medium", corporateEnvironment: "medium" }),
    retailAttributes: retailAttrs({ footTraffic: "high", customerParking: "high", coTenancy: "high", streetPresence: "high", daytimePopulation: "medium", eveningWeekendActivity: "high", signageVisibility: "high" }),
    bestFor: ["Placer County-serving offices", "medical/professional services", "regional retail users"],
    tradeoffs: ["less transit-oriented", "less central to Sacramento government/core clients", "site selection matters for visibility"],
    strengths: ["regional retail base", "parking", "I-80 access", "suburban professional-service demand"],
    questionsToValidate: ["Are your customers or employees concentrated in Placer County?", "Is parking a top priority?", "Do you need regional visibility?", "Would Rocklin or Folsom better match commute patterns?"],
    relationships: { compareWith: [
      { slug: "rocklin-commercial-core", label: "Rocklin Commercial Core", reason: "Nearby Placer County alternative with more local-serving business park character.", relationshipType: "similar" },
      { slug: "folsom-commercial-core", label: "Folsom Commercial Core", reason: "Eastern Sacramento alternative with stronger executive suburban office identity.", relationshipType: "more_executive" },
      { slug: "rancho-cordova-commercial-core", label: "Rancho Cordova Commercial Core", reason: "More cost-oriented Highway 50 office/flex alternative.", relationshipType: "lower_cost_alternative" },
    ] },
  },
  {
    slug: "rocklin-commercial-core",
    label: "Rocklin Commercial Core",
    type: "district",
    city: "Rocklin",
    state: "CA",
    path: "/commercial-real-estate/CA/rocklin/rocklin-commercial-core/",
    confidence: "medium",
    spaceTypeFit: {
      office: fit("good", "Good fit for Placer County-serving office users that want suburban access, parking, and a practical business environment.", ["local professional services", "regional offices", "service businesses"], ["less regional visibility than Roseville", "less central than Sacramento"]),
      flex: fit("good", "Good fit for smaller flex and service-commercial users that need suburban operations access.", ["service companies", "light operations", "local business units"], ["building specs vary"]),
    },
    attributes: businessAttrs({ transit: "low", parking: "high", walkability: "low", freewayAccess: "high", executiveImage: "medium", customerAccess: "medium", expansionFlexibility: "medium", talentAccess: "medium", visibility: "medium", amenities: "medium", costPosition: "medium", corporateEnvironment: "medium" }),
    industrialAttributes: industrialAttrs({ truckAccess: "medium", highwayAccess: "high", loading: "medium", zoningFlexibility: "medium", laborAccess: "medium" }),
    bestFor: ["Placer County-serving offices", "service businesses", "small flex users"],
    tradeoffs: ["less visible regional retail environment than Roseville", "less executive image than Folsom"],
    strengths: ["I-80 access", "suburban parking", "local business environment", "Placer County coverage"],
    questionsToValidate: ["Is Placer County coverage the main driver?", "Do you need high visibility or a quieter business setting?", "Would Roseville provide stronger customer access?", "Do you need flex or service-commercial features?"],
    relationships: { compareWith: [
      { slug: "roseville-commercial-core", label: "Roseville Commercial Core", reason: "More regional retail and customer-facing commercial context.", relationshipType: "better_retail_visibility" },
      { slug: "folsom-commercial-core", label: "Folsom Commercial Core", reason: "More executive suburban office positioning.", relationshipType: "more_executive" },
    ] },
  },
  {
    slug: "elk-grove-commercial-core",
    label: "Elk Grove Commercial Core",
    type: "district",
    city: "Elk Grove",
    state: "CA",
    path: "/commercial-real-estate/CA/elk-grove/elk-grove-commercial-core/",
    confidence: "medium",
    spaceTypeFit: {
      office: fit("good", "Good fit for local-serving office, medical, and professional-service users that want south Sacramento access and customer parking.", ["medical office", "professional services", "local business services"], ["less regional office depth than Sacramento core or Roseville", "larger corporate requirements may need broader search"]),
      retail: fit("strong", "Strong fit for local and regional retail uses serving Elk Grove's household and commuter base.", ["service retail", "medical/wellness", "restaurants"], ["site visibility and co-tenancy drive performance"]),
    },
    attributes: businessAttrs({ transit: "low", parking: "high", walkability: "medium", freewayAccess: "high", executiveImage: "medium", customerAccess: "high", expansionFlexibility: "medium", talentAccess: "medium", visibility: "high", amenities: "high", costPosition: "medium", corporateEnvironment: "medium" }),
    retailAttributes: retailAttrs({ footTraffic: "medium", customerParking: "high", coTenancy: "high", streetPresence: "high", daytimePopulation: "medium", eveningWeekendActivity: "medium", signageVisibility: "high" }),
    bestFor: ["south Sacramento-serving businesses", "medical office users", "local retail and service users"],
    tradeoffs: ["less central for regional clients", "less office depth than larger Sacramento districts"],
    strengths: ["customer parking", "south Sacramento access", "retail corridors", "local-serving demand"],
    questionsToValidate: ["Are customers or employees concentrated south of Sacramento?", "Is customer parking important?", "Do you need regional visibility or local convenience?", "Would Rancho Cordova or Downtown Sacramento better fit the business model?"],
    relationships: { compareWith: [
      { slug: "rancho-cordova-commercial-core", label: "Rancho Cordova Commercial Core", reason: "More office/flex and Highway 50 business park context.", relationshipType: "similar" },
      { slug: "downtown-sacramento", label: "Downtown Sacramento", reason: "More central civic and professional-service office environment.", relationshipType: "more_executive" },
    ] },
  },
].forEach((card) => mergeKnowledgeCard(graph, card));

graph.forEach((node) => {
  if (!Array.isArray(node.questionsToValidate)) node.questionsToValidate = [];
});

const warnings = schema.validateLocationKnowledgeGraph(graph);
if (warnings.length && process.env.ROFO_KNOWLEDGE_GRAPH_WARNINGS === "1") {
  console.warn(`[locationKnowledgeGraph] ${warnings.length} warning(s)`);
  warnings.forEach((warning) => console.warn(`- ${warning}`));
}

module.exports = graph;
