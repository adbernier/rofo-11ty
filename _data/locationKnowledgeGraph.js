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

[
  {
    slug: "los-angeles",
    label: "Los Angeles",
    type: "city",
    city: "Los Angeles",
    state: "CA",
    path: "/commercial-real-estate/CA/los-angeles/",
    confidence: "high",
    marketPath: ["financial-district-bunker-hill", "century-city", "culver-city"],
    spaceTypeFit: {
      office: fit("strong", "Strong fit for companies that need a broad Los Angeles office search across downtown, Westside, media, entertainment, and professional-service submarkets.", ["regional headquarters", "professional services", "media and entertainment companies", "technology and creative teams"], ["the right answer depends heavily on commute pattern, client access, and brand context", "Los Angeles should be narrowed into districts before evaluating buildings"]),
      flex: fit("good", "Good fit for teams that need office plus production, studio, aerospace, or R&D adjacency, especially when comparing Westside, South Bay, and media-oriented markets.", ["media production support", "aerospace-adjacent teams", "technology operations"], ["true flex requirements should be validated in district-specific searches"]),
      industrial: fit("good", "Good metro-level starting point for industrial users only after narrowing to port, central LA, South Bay, or San Gabriel Valley logistics corridors.", ["distribution users", "manufacturing users", "service industrial companies"], ["industrial decisions require district-level review of truck access, loading, yard, and port/airport access"]),
    },
    attributes: businessAttrs({ transit: "medium", parking: "medium", walkability: "medium", freewayAccess: "high", executiveImage: "high", customerAccess: "high", expansionFlexibility: "high", talentAccess: "high", visibility: "high", amenities: "high", costPosition: "medium", creativeEnvironment: "high", corporateEnvironment: "high" }),
    retailAttributes: retailAttrs({ footTraffic: "medium", customerParking: "medium", coTenancy: "medium", streetPresence: "medium", daytimePopulation: "high", eveningWeekendActivity: "high", signageVisibility: "medium" }),
    industrialAttributes: industrialAttrs({ truckAccess: "medium", highwayAccess: "high", lastMileAccess: "high", portAirportAccess: "high", loading: "medium", yard: "medium", zoningFlexibility: "medium", laborAccess: "high", parkingTrailer: "medium" }),
    bestFor: ["companies comparing LA districts", "regional headquarters", "media and entertainment users", "industrial users needing corridor selection"],
    tradeoffs: ["too broad to treat as one market", "commute patterns can change the recommendation", "industrial and office searches should branch into different district paths"],
    strengths: ["large office and creative market", "media and entertainment ecosystem", "executive and professional-service districts", "major port, airport, and freeway access"],
    questionsToValidate: ["Which side of Los Angeles best matches employee commute patterns?", "Do clients need a downtown, Westside, or media-industry address?", "Is parking or transit more important?", "Should the search prioritize office image, creative culture, or industrial operations?"],
    relationships: { compareWith: [
      { slug: "financial-district-bunker-hill", label: "Financial District / Bunker Hill", reason: "Traditional Downtown LA office-core path with stronger transit and civic/client access.", relationshipType: "more_executive" },
      { slug: "century-city", label: "Century City", reason: "More executive Westside professional-services alternative.", relationshipType: "more_executive" },
      { slug: "culver-city", label: "Culver City", reason: "More creative, technology, and media-oriented Westside alternative.", relationshipType: "more_creative" },
    ] },
  },
  {
    slug: "financial-district-bunker-hill",
    label: "Financial District / Bunker Hill",
    type: "district",
    city: "Los Angeles",
    state: "CA",
    path: "/commercial-real-estate/CA/los-angeles/financial-district-bunker-hill/",
    confidence: "high",
    spaceTypeFit: {
      office: fit("strong", "Strong fit for Downtown LA office users that value traditional towers, regional transit, civic access, and a recognizable client-facing address.", ["law firms", "financial services", "consulting firms", "downtown headquarters"], ["less creative/adaptive character than the Arts District", "parking and commute patterns should be compared with Westside or suburban alternatives"]),
      retail: fit("good", "Good selective fit for service retail and food uses tied to downtown office, civic, and hotel demand.", ["weekday service retail", "food and beverage users", "fitness and wellness"], ["evening and weekend patterns vary by node"]),
    },
    attributes: businessAttrs({ transit: "high", parking: "medium", walkability: "high", freewayAccess: "high", executiveImage: "high", customerAccess: "high", expansionFlexibility: "medium", talentAccess: "high", visibility: "high", amenities: "high", costPosition: "medium", creativeEnvironment: "medium", corporateEnvironment: "high" }),
    retailAttributes: retailAttrs({ footTraffic: "high", customerParking: "medium", coTenancy: "high", streetPresence: "high", daytimePopulation: "high", eveningWeekendActivity: "medium", signageVisibility: "medium" }),
    bestFor: ["professional services", "law and finance", "client-facing office users", "downtown headquarters"],
    tradeoffs: ["less media/creative identity than Arts District or Culver City", "parking can matter more than the address for some teams", "not ideal for industrial or production users"],
    strengths: ["Downtown LA office core", "Metro and regional transit access", "traditional tower inventory", "civic and client access"],
    questionsToValidate: ["Do clients expect a Downtown LA office-core address?", "Is transit access or parking more important?", "Do you need traditional tower inventory?", "Would Arts District or South Park better fit company culture?"],
    relationships: { compareWith: [
      { slug: "south-park", label: "South Park", reason: "Newer mixed-use downtown environment with more residential and entertainment adjacency.", relationshipType: "more_growth_oriented" },
      { slug: "arts-district", label: "Arts District", reason: "More creative and adaptive-reuse downtown alternative.", relationshipType: "more_creative" },
      { slug: "century-city", label: "Century City", reason: "More executive Westside professional-services alternative.", relationshipType: "more_executive" },
    ] },
  },
  {
    slug: "south-park",
    label: "South Park",
    type: "district",
    city: "Los Angeles",
    state: "CA",
    path: "/commercial-real-estate/CA/los-angeles/south-park/",
    confidence: "high",
    spaceTypeFit: {
      office: fit("good", "Good fit for office users that want Downtown LA access with a more mixed-use, residential, hospitality, and entertainment-oriented context than Bunker Hill.", ["growth companies", "entertainment-adjacent users", "professional-service teams"], ["less traditional business-core identity than Bunker Hill", "office inventory should be compared building by building"]),
      retail: fit("good", "Good selective fit for restaurants, service retail, and experience-oriented concepts serving residential, events, hotels, and office demand.", ["restaurants", "fitness and wellness", "service retail"], ["performance depends on exact event, hotel, and residential nodes"]),
    },
    attributes: businessAttrs({ transit: "high", parking: "medium", walkability: "high", freewayAccess: "high", executiveImage: "medium", customerAccess: "high", expansionFlexibility: "medium", talentAccess: "high", visibility: "high", amenities: "high", costPosition: "medium", creativeEnvironment: "medium", corporateEnvironment: "medium" }),
    retailAttributes: retailAttrs({ footTraffic: "high", customerParking: "medium", coTenancy: "high", streetPresence: "high", daytimePopulation: "high", eveningWeekendActivity: "high", signageVisibility: "medium" }),
    bestFor: ["downtown growth companies", "entertainment-adjacent office users", "restaurants and service retail"],
    tradeoffs: ["less formal than Bunker Hill", "office building quality and parking need property-level review", "not as creative-industrial as the Arts District"],
    strengths: ["mixed-use downtown setting", "entertainment and hospitality adjacency", "transit access", "residential and amenity growth"],
    questionsToValidate: ["Do you want Downtown LA access with a mixed-use environment?", "Is entertainment or residential adjacency useful for recruiting?", "Will parking or transit drive the decision?", "Would Bunker Hill or Arts District better fit the brand?"],
    relationships: { compareWith: [
      { slug: "financial-district-bunker-hill", label: "Financial District / Bunker Hill", reason: "More traditional Downtown LA office-core and client-facing identity.", relationshipType: "more_executive" },
      { slug: "arts-district", label: "Arts District", reason: "More creative and adaptive-reuse office character.", relationshipType: "more_creative" },
      { slug: "hollywood", label: "Hollywood", reason: "More entertainment-industry identity with different commute and talent patterns.", relationshipType: "more_creative" },
    ] },
  },
  {
    slug: "arts-district",
    label: "Arts District",
    type: "district",
    city: "Los Angeles",
    state: "CA",
    path: "/commercial-real-estate/CA/los-angeles/arts-district/",
    confidence: "high",
    spaceTypeFit: {
      office: fit("strong", "Strong fit for creative office users that want adaptive-reuse character, brand identity, and proximity to Downtown LA without a traditional tower feel.", ["creative agencies", "design and media firms", "technology teams"], ["less formal client-facing image than Bunker Hill", "parking, loading, and building condition vary by property"]),
      showroom: fit("good", "Good fit for showroom and production-adjacent users that benefit from creative district identity and flexible building formats.", ["showrooms", "creative production", "design users"], ["visibility and loading must be validated by building"]),
      retail: fit("good", "Good selective restaurant and retail fit where destination traffic, creative tenants, and residential growth overlap.", ["restaurants", "boutique retail", "experience-oriented concepts"], ["foot traffic is more destination-driven than traditional high-street retail"]),
    },
    attributes: businessAttrs({ transit: "medium", parking: "medium", walkability: "medium", freewayAccess: "high", executiveImage: "medium", customerAccess: "medium", expansionFlexibility: "medium", talentAccess: "high", visibility: "medium", amenities: "high", costPosition: "medium", creativeEnvironment: "high", corporateEnvironment: "low" }),
    retailAttributes: retailAttrs({ footTraffic: "medium", customerParking: "medium", coTenancy: "medium", streetPresence: "high", daytimePopulation: "medium", eveningWeekendActivity: "high", signageVisibility: "medium" }),
    industrialAttributes: industrialAttrs({ truckAccess: "medium", highwayAccess: "high", loading: "medium", yard: "low", zoningFlexibility: "medium", laborAccess: "high" }),
    bestFor: ["creative office users", "design and media firms", "showroom users", "destination restaurants"],
    tradeoffs: ["less traditional executive image", "building conditions vary", "parking and access need careful review"],
    strengths: ["adaptive-reuse buildings", "creative identity", "Downtown LA adjacency", "restaurant and amenity energy"],
    questionsToValidate: ["Do you need creative/adaptive building character?", "Will clients or customers visit regularly?", "Are showroom, production-adjacent, or creative uses part of the requirement?", "Would Bunker Hill provide a stronger executive address?"],
    relationships: { compareWith: [
      { slug: "financial-district-bunker-hill", label: "Financial District / Bunker Hill", reason: "More traditional CBD office environment and stronger client-facing address.", relationshipType: "more_executive" },
      { slug: "culver-city", label: "Culver City", reason: "Westside creative/media alternative with stronger studio and technology adjacency.", relationshipType: "more_creative" },
      { slug: "vernon", label: "Vernon", reason: "More operational industrial alternative for production, warehouse, or manufacturing needs.", relationshipType: "better_truck_access" },
    ] },
  },
  {
    slug: "culver-city",
    label: "Culver City",
    type: "district",
    city: "Culver City",
    state: "CA",
    path: "/commercial-real-estate/CA/culver-city/culver-city/",
    confidence: "high",
    spaceTypeFit: {
      office: fit("strong", "Strong fit for creative, technology, media, and professional office users that want a Westside address with studio, content, and talent adjacency.", ["media companies", "technology teams", "creative agencies", "growth companies"], ["often costlier than more utilitarian LA alternatives", "parking and commute patterns should be validated carefully"]),
      flex: fit("good", "Good fit for office/flex and production-adjacent teams that need creative office plus operational support.", ["production support users", "content teams", "creative operations"], ["loading and technical needs vary by building"]),
      retail: fit("good", "Good selective fit for restaurants and service retail serving office, residential, and studio demand.", ["restaurants", "wellness users", "service retail"], ["street visibility and customer parking matter by location"]),
    },
    attributes: businessAttrs({ transit: "medium", parking: "medium", walkability: "medium", freewayAccess: "high", executiveImage: "high", customerAccess: "high", expansionFlexibility: "medium", talentAccess: "high", visibility: "medium", amenities: "high", costPosition: "low", creativeEnvironment: "high", corporateEnvironment: "medium" }),
    retailAttributes: retailAttrs({ footTraffic: "medium", customerParking: "medium", coTenancy: "high", streetPresence: "medium", daytimePopulation: "high", eveningWeekendActivity: "high", signageVisibility: "medium" }),
    industrialAttributes: industrialAttrs({ truckAccess: "medium", highwayAccess: "high", loading: "medium", power: "medium", zoningFlexibility: "medium", laborAccess: "high" }),
    bestFor: ["media and entertainment firms", "technology companies", "creative office users", "production-adjacent teams"],
    tradeoffs: ["premium Westside cost", "traffic and parking need careful review", "not ideal for pure warehouse or low-cost back-office users"],
    strengths: ["Westside creative/media ecosystem", "studio adjacency", "technology and content companies", "strong amenity environment"],
    questionsToValidate: ["Is Westside talent access a priority?", "Do you need studio or media adjacency?", "How important is parking versus creative identity?", "Would Santa Monica, Hollywood, or El Segundo better match the team and budget?"],
    relationships: { compareWith: [
      { slug: "santa-monica", label: "Santa Monica", reason: "Stronger coastal tech and creative environment, often with a higher-cost profile.", relationshipType: "more_executive" },
      { slug: "hollywood", label: "Hollywood", reason: "More entertainment-oriented alternative with a different commute and talent pattern.", relationshipType: "more_creative" },
      { slug: "el-segundo", label: "El Segundo", reason: "More corporate, campus, aerospace, and airport-oriented alternative.", relationshipType: "better_parking" },
      { slug: "century-city", label: "Century City", reason: "More executive professional-services Westside office alternative.", relationshipType: "more_executive" },
    ] },
  },
  {
    slug: "santa-monica",
    label: "Santa Monica",
    type: "district",
    city: "Santa Monica",
    state: "CA",
    path: "/commercial-real-estate/CA/santa-monica/santa-monica/",
    confidence: "high",
    spaceTypeFit: {
      office: fit("strong", "Strong fit for technology, creative, and client-facing office users that value coastal image, Westside talent, and a walkable amenity environment.", ["technology companies", "creative firms", "executive teams", "professional services"], ["cost and parking can be more challenging than inland alternatives", "larger expansion paths may require nearby markets"]),
      medical: fit("good", "Good fit for selective medical and wellness users serving Westside customers.", ["wellness practices", "medical office users", "specialty clinics"], ["customer parking and access must be validated by building"]),
      retail: fit("strong", "Strong fit for customer-facing retail, restaurant, and service concepts that benefit from coastal draw, office users, residents, and visitor demand.", ["restaurants", "wellness and fitness", "boutique retail"], ["competition and occupancy cost can be high"]),
    },
    attributes: businessAttrs({ transit: "medium", parking: "low", walkability: "high", freewayAccess: "medium", executiveImage: "high", customerAccess: "high", expansionFlexibility: "low", talentAccess: "high", visibility: "high", amenities: "high", costPosition: "low", creativeEnvironment: "high", corporateEnvironment: "medium" }),
    retailAttributes: retailAttrs({ footTraffic: "high", customerParking: "medium", coTenancy: "high", streetPresence: "high", daytimePopulation: "high", eveningWeekendActivity: "high", signageVisibility: "high" }),
    bestFor: ["Westside technology teams", "creative office users", "customer-facing brands", "executive office users"],
    tradeoffs: ["premium cost", "parking constraints", "expansion flexibility can be limited"],
    strengths: ["coastal executive image", "Westside talent access", "walkable amenities", "technology and creative ecosystem"],
    questionsToValidate: ["Is coastal Westside image worth the cost premium?", "How important is employee parking?", "Will clients or customers visit often?", "Would Culver City or West LA offer better flexibility?"],
    relationships: { compareWith: [
      { slug: "culver-city", label: "Culver City", reason: "More studio/creative and potentially more flexible Westside alternative.", relationshipType: "more_creative" },
      { slug: "west-la", label: "West LA / Brentwood", reason: "Broader professional and medical office access with a less coastal identity.", relationshipType: "similar" },
      { slug: "century-city", label: "Century City", reason: "More executive professional-services office core.", relationshipType: "more_executive" },
    ] },
  },
  {
    slug: "hollywood",
    label: "Hollywood",
    type: "district",
    city: "Los Angeles",
    state: "CA",
    path: "/commercial-real-estate/CA/los-angeles/hollywood/",
    confidence: "high",
    spaceTypeFit: {
      office: fit("good", "Good fit for entertainment, media, and creative office users that benefit from Hollywood identity and central LA access.", ["entertainment companies", "creative agencies", "production-adjacent teams"], ["less polished corporate image than Century City or Bunker Hill", "parking and block-by-block conditions matter"]),
      retail: fit("good", "Good selective fit for restaurants, entertainment-serving retail, and customer-facing uses tied to visitor, nightlife, and office demand.", ["restaurants", "fitness and wellness", "entertainment-serving retail"], ["tourism and nightlife patterns may not fit every concept"]),
    },
    attributes: businessAttrs({ transit: "medium", parking: "medium", walkability: "high", freewayAccess: "high", executiveImage: "medium", customerAccess: "high", expansionFlexibility: "medium", talentAccess: "high", visibility: "high", amenities: "high", costPosition: "medium", creativeEnvironment: "high", corporateEnvironment: "low" }),
    retailAttributes: retailAttrs({ footTraffic: "high", customerParking: "medium", coTenancy: "high", streetPresence: "high", daytimePopulation: "medium", eveningWeekendActivity: "high", signageVisibility: "high" }),
    bestFor: ["entertainment companies", "media and production-adjacent users", "creative office teams"],
    tradeoffs: ["less formal corporate image", "traffic and parking require careful review", "block-by-block environment varies"],
    strengths: ["entertainment identity", "central LA access", "creative workforce", "transit and freeway connectivity"],
    questionsToValidate: ["Is entertainment-industry identity important?", "Do clients or talent need Hollywood access?", "How parking-sensitive is the team?", "Would Burbank or Culver City better fit production adjacency?"],
    relationships: { compareWith: [
      { slug: "burbank-media-district", label: "Burbank Media District", reason: "More studio-adjacent media office environment.", relationshipType: "more_creative" },
      { slug: "culver-city", label: "Culver City", reason: "Westside creative/media alternative with stronger technology adjacency.", relationshipType: "more_creative" },
      { slug: "south-park", label: "South Park", reason: "Downtown mixed-use alternative with different event, residential, and transit context.", relationshipType: "better_transit" },
    ] },
  },
  {
    slug: "burbank",
    label: "Burbank",
    type: "district",
    city: "Burbank",
    state: "CA",
    path: "/commercial-real-estate/CA/burbank/burbank/",
    confidence: "high",
    spaceTypeFit: {
      office: fit("strong", "Strong fit for media, entertainment, and professional office users that want a Valley-side business environment with studio adjacency and practical parking.", ["media companies", "entertainment support firms", "regional offices", "professional services"], ["less Westside technology identity than Culver City or Santa Monica", "less traditional CBD image than Downtown LA"]),
      retail: fit("good", "Good fit for local-serving retail and restaurants tied to Burbank's office, studio, and residential base.", ["restaurants", "service retail", "wellness users"], ["site visibility and customer parking remain property-specific"]),
    },
    attributes: businessAttrs({ transit: "medium", parking: "high", walkability: "medium", freewayAccess: "high", executiveImage: "medium", customerAccess: "medium", expansionFlexibility: "medium", talentAccess: "high", visibility: "medium", amenities: "high", costPosition: "medium", creativeEnvironment: "high", corporateEnvironment: "medium" }),
    retailAttributes: retailAttrs({ footTraffic: "medium", customerParking: "high", coTenancy: "medium", streetPresence: "medium", daytimePopulation: "high", eveningWeekendActivity: "medium", signageVisibility: "medium" }),
    bestFor: ["media companies", "studio support users", "Valley-serving professional services", "parking-sensitive office teams"],
    tradeoffs: ["less central for Westside employees", "less urban walkability than Hollywood or Downtown LA", "not a pure logistics market"],
    strengths: ["studio and media ecosystem", "airport and freeway access", "parking-friendly office settings", "Valley workforce access"],
    questionsToValidate: ["Is studio adjacency important?", "Do employees need Valley commute access?", "Is parking more important than urban walkability?", "Would Hollywood or Glendale fit the brand better?"],
    relationships: { compareWith: [
      { slug: "burbank-media-district", label: "Burbank Media District", reason: "More focused studio and media-office path within Burbank.", relationshipType: "more_creative" },
      { slug: "glendale", label: "Glendale", reason: "More traditional regional office and professional-service alternative.", relationshipType: "more_executive" },
      { slug: "hollywood", label: "Hollywood", reason: "More entertainment-branded central LA alternative.", relationshipType: "more_creative" },
    ] },
  },
  {
    slug: "burbank-media-district",
    label: "Burbank Media District",
    type: "district",
    city: "Burbank",
    state: "CA",
    path: "/commercial-real-estate/CA/burbank/burbank-media-district/",
    confidence: "high",
    spaceTypeFit: {
      office: fit("strong", "Strong fit for media, studio, production-adjacent, and entertainment office users that need close industry adjacency with practical office formats.", ["content companies", "production support users", "media agencies", "entertainment firms"], ["less general corporate environment than Glendale or Pasadena", "specialized production needs must be validated by building"]),
      flex: fit("good", "Good fit for media support users that need office plus light production or operational support.", ["post-production teams", "studio vendors", "creative operations"], ["loading, acoustics, and technical buildouts vary by property"]),
    },
    attributes: businessAttrs({ transit: "medium", parking: "high", walkability: "medium", freewayAccess: "high", executiveImage: "medium", customerAccess: "medium", expansionFlexibility: "medium", talentAccess: "high", visibility: "medium", amenities: "medium", costPosition: "medium", creativeEnvironment: "high", corporateEnvironment: "medium" }),
    industrialAttributes: industrialAttrs({ truckAccess: "medium", highwayAccess: "high", loading: "medium", power: "medium", zoningFlexibility: "medium", laborAccess: "high" }),
    bestFor: ["studio-adjacent office users", "media companies", "post-production and creative operations"],
    tradeoffs: ["not ideal for traditional professional-service image", "technical production requirements need property-level review", "less coastal/Westside talent signal than Santa Monica or Culver City"],
    strengths: ["studio adjacency", "media and entertainment ecosystem", "parking and freeway access", "production-support context"],
    questionsToValidate: ["Do you need studio proximity or production support?", "Are technical, acoustic, or loading needs part of the search?", "Would general Burbank office inventory be sufficient?", "Should Hollywood or Culver City be compared for talent and brand fit?"],
    relationships: { compareWith: [
      { slug: "burbank", label: "Burbank", reason: "Broader Burbank office and professional-service alternative.", relationshipType: "similar" },
      { slug: "hollywood", label: "Hollywood", reason: "More entertainment-branded central LA alternative.", relationshipType: "more_creative" },
      { slug: "glendale", label: "Glendale", reason: "More traditional regional office and professional-service market.", relationshipType: "more_executive" },
    ] },
  },
  {
    slug: "glendale",
    label: "Glendale",
    type: "district",
    city: "Glendale",
    state: "CA",
    path: "/commercial-real-estate/CA/glendale/glendale/",
    confidence: "high",
    spaceTypeFit: {
      office: fit("strong", "Strong fit for regional office, professional services, finance, insurance, and medical office users that want an established business district outside Downtown LA.", ["professional services", "regional offices", "medical office users", "financial services"], ["less creative/media identity than Burbank or Hollywood", "less Westside executive image than Century City"]),
      medical: fit("good", "Good fit for medical office users serving Glendale, Pasadena, and northeast LA patients.", ["medical practices", "specialty clinics", "wellness users"], ["patient parking and building access should be reviewed carefully"]),
      retail: fit("good", "Good fit for restaurants and service retail serving office, residential, and regional shopping demand.", ["restaurants", "service retail", "wellness users"], ["retail fit depends on corridor and co-tenancy"]),
    },
    attributes: businessAttrs({ transit: "medium", parking: "high", walkability: "medium", freewayAccess: "high", executiveImage: "high", customerAccess: "high", expansionFlexibility: "medium", talentAccess: "medium", visibility: "high", amenities: "high", costPosition: "medium", creativeEnvironment: "medium", corporateEnvironment: "high" }),
    retailAttributes: retailAttrs({ footTraffic: "medium", customerParking: "high", coTenancy: "high", streetPresence: "high", daytimePopulation: "high", eveningWeekendActivity: "medium", signageVisibility: "high" }),
    bestFor: ["regional office users", "professional services", "medical office", "parking-sensitive teams"],
    tradeoffs: ["less creative identity than media districts", "less central than Downtown LA for civic/legal users", "transit is less defining than parking and freeway access"],
    strengths: ["established office district", "parking and freeway access", "regional customer access", "professional-service environment"],
    questionsToValidate: ["Are clients or patients concentrated in Glendale/northeast LA?", "Is parking important for visitors?", "Would Pasadena provide a stronger institutional image?", "Would Burbank better fit media adjacency?"],
    relationships: { compareWith: [
      { slug: "pasadena", label: "Pasadena", reason: "More institutional and executive northeast LA office alternative.", relationshipType: "more_executive" },
      { slug: "burbank", label: "Burbank", reason: "More media and studio-adjacent office alternative.", relationshipType: "more_creative" },
      { slug: "financial-district-bunker-hill", label: "Financial District / Bunker Hill", reason: "More central Downtown LA client and transit access.", relationshipType: "better_transit" },
    ] },
  },
  {
    slug: "el-segundo",
    label: "El Segundo",
    type: "district",
    city: "El Segundo",
    state: "CA",
    path: "/commercial-real-estate/CA/el-segundo/el-segundo/",
    confidence: "high",
    spaceTypeFit: {
      office: fit("strong", "Strong fit for office users that want South Bay, airport-adjacent, aerospace, technology, and corporate campus context with practical parking.", ["aerospace firms", "technology teams", "corporate offices", "airport-access users"], ["less walkable coastal identity than Santa Monica", "less creative/media identity than Culver City"]),
      flex: fit("strong", "Strong fit for flex, R&D, aerospace support, and operations users that need office plus technical or practical building functionality.", ["aerospace support", "R&D teams", "technology operations", "office/flex users"], ["building specs should be validated for loading, power, and lab/R&D needs"]),
      r_and_d: fit("strong", "Strong fit for R&D and technical office users that benefit from aerospace, airport, and South Bay engineering ecosystem adjacency.", ["engineering teams", "aerospace R&D", "hardware and technical users"], ["not the strongest retail or pure downtown environment"]),
    },
    attributes: businessAttrs({ transit: "medium", parking: "high", walkability: "medium", freewayAccess: "high", executiveImage: "high", customerAccess: "medium", expansionFlexibility: "high", talentAccess: "high", visibility: "medium", amenities: "high", costPosition: "medium", creativeEnvironment: "medium", corporateEnvironment: "high" }),
    retailAttributes: retailAttrs({ footTraffic: "medium", customerParking: "high", coTenancy: "medium", streetPresence: "medium", daytimePopulation: "high", eveningWeekendActivity: "medium", signageVisibility: "medium" }),
    industrialAttributes: industrialAttrs({ truckAccess: "medium", highwayAccess: "high", lastMileAccess: "high", portAirportAccess: "high", loading: "medium", yard: "low", power: "medium", zoningFlexibility: "medium", laborAccess: "high", parkingTrailer: "low" }),
    bestFor: ["aerospace and engineering users", "corporate campus offices", "R&D/flex teams", "airport-access users"],
    tradeoffs: ["less urban walkability than Santa Monica or Downtown LA", "not a low-cost industrial corridor", "creative users may prefer Culver City or Arts District"],
    strengths: ["LAX adjacency", "South Bay aerospace ecosystem", "parking-friendly office campuses", "R&D and flex compatibility"],
    questionsToValidate: ["Is airport access important?", "Do you need R&D, flex, or aerospace-adjacent functionality?", "How important is parking and campus-style office?", "Would Culver City or Santa Monica better fit brand and talent needs?"],
    relationships: { compareWith: [
      { slug: "culver-city", label: "Culver City", reason: "More creative/media and Westside technology-oriented alternative.", relationshipType: "more_creative" },
      { slug: "south-bay-lax-industrial", label: "South Bay / LAX Industrial", reason: "More operational airport-adjacent industrial/flex alternative.", relationshipType: "better_truck_access" },
      { slug: "santa-monica", label: "Santa Monica", reason: "More coastal and client-facing Westside office environment.", relationshipType: "more_executive" },
    ] },
  },
  {
    slug: "pasadena",
    label: "Pasadena",
    type: "district",
    city: "Pasadena",
    state: "CA",
    path: "/commercial-real-estate/CA/pasadena/pasadena/",
    confidence: "high",
    spaceTypeFit: {
      office: fit("strong", "Strong fit for professional services, institutional, technology-adjacent, medical, and regional office users that want a polished northeast LA business setting.", ["professional services", "institutional users", "medical office", "regional headquarters"], ["less central to Westside media/technology talent", "less industrial/flex utility than South Bay or San Gabriel Valley markets"]),
      medical: fit("strong", "Strong fit for medical office and specialty practices serving Pasadena, San Gabriel Valley, and northeast LA.", ["specialty clinics", "medical practices", "wellness users"], ["patient parking and building access should be validated"]),
      retail: fit("good", "Good fit for restaurants, service retail, and boutique concepts in the right walkable or co-tenanted nodes.", ["restaurants", "service retail", "boutique retail"], ["visibility and parking are corridor-specific"]),
    },
    attributes: businessAttrs({ transit: "medium", parking: "medium", walkability: "high", freewayAccess: "high", executiveImage: "high", customerAccess: "high", expansionFlexibility: "medium", talentAccess: "medium", visibility: "high", amenities: "high", costPosition: "medium", creativeEnvironment: "medium", corporateEnvironment: "high" }),
    retailAttributes: retailAttrs({ footTraffic: "high", customerParking: "medium", coTenancy: "high", streetPresence: "high", daytimePopulation: "high", eveningWeekendActivity: "high", signageVisibility: "high" }),
    bestFor: ["professional services", "medical office users", "institutional and regional offices", "client-facing firms"],
    tradeoffs: ["less connected to Westside media/technology ecosystem", "not a logistics market", "larger expansion needs may require multiple buildings or nearby alternatives"],
    strengths: ["executive northeast LA image", "walkable business and retail environment", "institutional adjacency", "medical and professional-service base"],
    questionsToValidate: ["Is northeast LA or San Gabriel Valley access important?", "Do clients or patients visit regularly?", "Is walkability part of the value proposition?", "Would Glendale or Downtown LA provide a better commute/client pattern?"],
    relationships: { compareWith: [
      { slug: "glendale", label: "Glendale", reason: "More parking-friendly regional office and professional-service alternative.", relationshipType: "better_parking" },
      { slug: "financial-district-bunker-hill", label: "Financial District / Bunker Hill", reason: "More central Downtown LA office-core and transit-oriented alternative.", relationshipType: "better_transit" },
      { slug: "burbank", label: "Burbank", reason: "More media and studio-adjacent Valley alternative.", relationshipType: "more_creative" },
    ] },
  },
  {
    slug: "west-la",
    label: "West LA / Brentwood",
    type: "district",
    city: "Los Angeles",
    state: "CA",
    path: "/commercial-real-estate/CA/los-angeles/west-la/",
    confidence: "high",
    spaceTypeFit: {
      office: fit("strong", "Strong fit for Westside professional services, medical office, technology, and client-facing users that want access to Brentwood, Santa Monica, Century City, and UCLA-adjacent talent.", ["professional services", "medical office", "technology teams", "client-facing firms"], ["less distinct brand identity than Santa Monica or Century City", "traffic and parking patterns need close review"]),
      medical: fit("strong", "Strong fit for medical office and wellness users serving Westside households and professionals.", ["medical practices", "wellness users", "specialty clinics"], ["patient parking and access drive fit"]),
      retail: fit("good", "Good fit for service retail and restaurants in visible Westside corridors with strong household and office demand.", ["service retail", "restaurants", "fitness and wellness"], ["corridor-level visibility and parking are critical"]),
    },
    attributes: businessAttrs({ transit: "medium", parking: "medium", walkability: "medium", freewayAccess: "high", executiveImage: "high", customerAccess: "high", expansionFlexibility: "medium", talentAccess: "high", visibility: "high", amenities: "high", costPosition: "low", creativeEnvironment: "medium", corporateEnvironment: "high" }),
    retailAttributes: retailAttrs({ footTraffic: "medium", customerParking: "medium", coTenancy: "high", streetPresence: "high", daytimePopulation: "high", eveningWeekendActivity: "medium", signageVisibility: "high" }),
    bestFor: ["Westside professional services", "medical office users", "client-facing firms", "technology teams needing Westside access"],
    tradeoffs: ["less singular identity than nearby premium districts", "traffic and parking can shape the decision", "not the first choice for industrial or production users"],
    strengths: ["Westside customer and talent access", "professional and medical office base", "proximity to Santa Monica and Century City", "freeway and corridor visibility"],
    questionsToValidate: ["Are customers or employees concentrated on the Westside?", "Do you need medical, professional, or technology office context?", "Is parking important for visitors?", "Would Santa Monica or Century City provide a clearer brand signal?"],
    relationships: { compareWith: [
      { slug: "santa-monica", label: "Santa Monica", reason: "More coastal, walkable, and brand-forward Westside office environment.", relationshipType: "more_executive" },
      { slug: "century-city", label: "Century City", reason: "More formal executive and professional-services office core.", relationshipType: "more_executive" },
      { slug: "culver-city", label: "Culver City", reason: "More creative/media and technology-oriented Westside alternative.", relationshipType: "more_creative" },
    ] },
  },
  {
    slug: "century-city",
    label: "Century City",
    type: "district",
    city: "Los Angeles",
    state: "CA",
    path: "/commercial-real-estate/CA/los-angeles/century-city/",
    confidence: "high",
    spaceTypeFit: {
      office: fit("excellent", "Excellent fit for executive office, law, finance, entertainment business affairs, and professional-service users that value a premier Westside business address.", ["law firms", "finance and investment firms", "entertainment business teams", "executive headquarters"], ["premium cost profile", "less creative/adaptive character than Culver City or Arts District"]),
      retail: fit("good", "Good fit for high-end service retail and restaurant uses tied to office, hotel, retail, and affluent Westside demand.", ["restaurants", "wellness users", "executive service retail"], ["customer access and positioning should match the premium environment"]),
    },
    attributes: businessAttrs({ transit: "medium", parking: "high", walkability: "medium", freewayAccess: "medium", executiveImage: "high", customerAccess: "high", expansionFlexibility: "medium", talentAccess: "high", visibility: "high", amenities: "high", costPosition: "low", creativeEnvironment: "medium", corporateEnvironment: "high" }),
    retailAttributes: retailAttrs({ footTraffic: "medium", customerParking: "high", coTenancy: "high", streetPresence: "high", daytimePopulation: "high", eveningWeekendActivity: "medium", signageVisibility: "high" }),
    bestFor: ["law firms", "finance and investment firms", "executive headquarters", "client-facing professional services"],
    tradeoffs: ["premium occupancy cost", "less creative identity than Culver City", "less regional transit orientation than Downtown LA"],
    strengths: ["premier Westside office image", "Class A professional-services environment", "client-facing address", "executive amenities"],
    questionsToValidate: ["Is a premier Westside executive address important?", "Do clients visit frequently?", "Is premium cost justified by image and access?", "Would Downtown LA or Culver City better match budget and culture?"],
    relationships: { compareWith: [
      { slug: "financial-district-bunker-hill", label: "Financial District / Bunker Hill", reason: "Downtown LA executive and transit-oriented alternative.", relationshipType: "better_transit" },
      { slug: "west-la", label: "West LA / Brentwood", reason: "Broader Westside professional and medical office alternative.", relationshipType: "similar" },
      { slug: "santa-monica", label: "Santa Monica", reason: "More coastal, technology, and creative Westside alternative.", relationshipType: "more_creative" },
      { slug: "culver-city", label: "Culver City", reason: "More media, technology, and creative office alternative.", relationshipType: "more_creative" },
    ] },
  },
  {
    slug: "vernon",
    label: "Vernon",
    type: "district",
    city: "Vernon",
    state: "CA",
    path: "/commercial-real-estate/CA/vernon/vernon/",
    confidence: "high",
    spaceTypeFit: {
      industrial: fit("excellent", "Excellent fit for central LA industrial, manufacturing, warehouse, and service operations that need dense industrial zoning and truck-oriented access.", ["manufacturing users", "warehouse users", "food and apparel production", "service industrial companies"], ["not appropriate for image-driven office users", "building age, loading, power, and yard must be validated carefully"]),
      warehouse: fit("strong", "Strong warehouse fit for companies needing central LA reach and practical industrial buildings.", ["regional warehouse users", "last-mile operations", "service distribution"], ["clear height and trailer parking vary significantly"]),
      manufacturing: fit("strong", "Strong manufacturing fit where zoning, power, and industrial labor access matter more than office image.", ["food production", "apparel and product manufacturers", "industrial production users"], ["specialized power, ventilation, and compliance requirements need building review"]),
    },
    attributes: businessAttrs({ transit: "low", parking: "medium", walkability: "low", freewayAccess: "high", executiveImage: "low", customerAccess: "medium", expansionFlexibility: "medium", talentAccess: "high", visibility: "medium", amenities: "low", costPosition: "medium", creativeEnvironment: "low", corporateEnvironment: "low" }),
    retailAttributes: retailAttrs(),
    industrialAttributes: industrialAttrs({ truckAccess: "high", highwayAccess: "high", lastMileAccess: "high", portAirportAccess: "medium", clearHeight: "medium", loading: "high", yard: "medium", power: "high", zoningFlexibility: "high", laborAccess: "high", parkingTrailer: "medium", outdoorStorage: "medium" }),
    bestFor: ["manufacturing users", "warehouse users", "central LA logistics", "service industrial companies"],
    tradeoffs: ["not a polished office environment", "building specs vary widely", "site-specific truck circulation and loading are critical"],
    strengths: ["central LA industrial zoning", "manufacturing and warehouse base", "truck access", "labor access"],
    questionsToValidate: ["What truck access and loading requirements are non-negotiable?", "Do you need heavy power, yard, or outdoor storage?", "Is central LA last-mile access more important than port adjacency?", "Would Commerce or City of Industry offer better building scale?"],
    relationships: { compareWith: [
      { slug: "commerce", label: "Commerce", reason: "Similar industrial/logistics orientation with strong freeway access.", relationshipType: "similar" },
      { slug: "city-of-industry", label: "City of Industry", reason: "Larger-format industrial and distribution alternative.", relationshipType: "better_loading" },
      { slug: "carson", label: "Carson", reason: "More port-adjacent logistics alternative.", relationshipType: "better_truck_access" },
    ] },
  },
  {
    slug: "commerce",
    label: "Commerce",
    type: "district",
    city: "Commerce",
    state: "CA",
    path: "/commercial-real-estate/CA/commerce/commerce/",
    confidence: "high",
    spaceTypeFit: {
      industrial: fit("strong", "Strong fit for warehouse, distribution, logistics, and light manufacturing users that need central LA freeway access.", ["distribution users", "logistics companies", "service industrial users", "light manufacturing"], ["not suitable for client-facing office image", "yard, trailer parking, and clear height vary by building"]),
      warehouse: fit("strong", "Strong warehouse fit for users serving central LA, southeast LA, and regional freeway corridors.", ["warehouse users", "regional distribution", "last-mile operations"], ["modern logistics specs need property-level review"]),
      distribution: fit("strong", "Strong distribution fit for companies that value central LA freeway connectivity and regional reach.", ["regional distributors", "e-commerce support", "wholesale users"], ["larger-format needs may also compare City of Industry or Inland Empire alternatives"]),
    },
    attributes: businessAttrs({ transit: "low", parking: "medium", walkability: "low", freewayAccess: "high", executiveImage: "low", customerAccess: "medium", expansionFlexibility: "medium", talentAccess: "high", visibility: "medium", amenities: "low", costPosition: "medium", creativeEnvironment: "low", corporateEnvironment: "low" }),
    industrialAttributes: industrialAttrs({ truckAccess: "high", highwayAccess: "high", lastMileAccess: "high", portAirportAccess: "medium", clearHeight: "medium", loading: "high", yard: "medium", power: "medium", zoningFlexibility: "high", laborAccess: "high", parkingTrailer: "medium", outdoorStorage: "medium" }),
    bestFor: ["warehouse users", "regional distributors", "light manufacturing", "service industrial companies"],
    tradeoffs: ["less polished business image", "modern distribution specs vary", "larger users should compare farther-east industrial markets"],
    strengths: ["freeway access", "central LA logistics position", "industrial zoning", "labor access"],
    questionsToValidate: ["How important is central LA freeway access?", "Do you need trailer parking or yard?", "Are clear height and loading requirements fixed?", "Would Vernon, Santa Fe Springs, or City of Industry provide better building options?"],
    relationships: { compareWith: [
      { slug: "vernon", label: "Vernon", reason: "Similar central LA industrial and manufacturing-oriented alternative.", relationshipType: "similar" },
      { slug: "city-of-industry", label: "City of Industry", reason: "Larger-format warehouse and distribution alternative.", relationshipType: "better_loading" },
      { slug: "santa-fe-springs", label: "Santa Fe Springs", reason: "More southeast industrial/service-commercial alternative.", relationshipType: "similar" },
    ] },
  },
  {
    slug: "city-of-industry",
    label: "City of Industry",
    type: "district",
    city: "City of Industry",
    state: "CA",
    path: "/commercial-real-estate/CA/city-of-industry/city-of-industry/",
    confidence: "high",
    spaceTypeFit: {
      industrial: fit("excellent", "Excellent fit for larger industrial, warehouse, distribution, and manufacturing users that need scale, truck access, and San Gabriel Valley freeway connectivity.", ["large warehouse users", "regional distribution", "manufacturing", "wholesale and import/export users"], ["farther from central LA customers than Vernon or Commerce", "employee commute and truck routes must be tested"]),
      warehouse: fit("excellent", "Excellent warehouse fit for larger-format users comparing LA County industrial scale and freeway reach.", ["large warehouse users", "distribution companies", "wholesale operations"], ["availability and modern specs must be validated property by property"]),
      distribution: fit("strong", "Strong distribution fit for regional users needing freeway access and larger building formats.", ["regional distributors", "import/export users", "e-commerce support"], ["may be less efficient for tight urban last-mile routes"]),
    },
    attributes: businessAttrs({ transit: "low", parking: "high", walkability: "low", freewayAccess: "high", executiveImage: "low", customerAccess: "medium", expansionFlexibility: "high", talentAccess: "medium", visibility: "medium", amenities: "low", costPosition: "medium", creativeEnvironment: "low", corporateEnvironment: "low" }),
    industrialAttributes: industrialAttrs({ truckAccess: "high", highwayAccess: "high", lastMileAccess: "medium", portAirportAccess: "medium", clearHeight: "high", loading: "high", yard: "high", power: "high", zoningFlexibility: "high", laborAccess: "medium", parkingTrailer: "high", outdoorStorage: "high" }),
    bestFor: ["large warehouse users", "regional distributors", "manufacturers", "wholesale and import/export companies"],
    tradeoffs: ["less central for urban customers", "not a client-facing office environment", "commute and truck-route patterns require validation"],
    strengths: ["industrial scale", "freeway connectivity", "loading and yard potential", "manufacturing and distribution base"],
    questionsToValidate: ["Do you need larger building formats or trailer parking?", "Is San Gabriel Valley freeway access useful?", "Are clear height, loading, yard, or power requirements fixed?", "Would Commerce or Vernon provide better central LA access?"],
    relationships: { compareWith: [
      { slug: "commerce", label: "Commerce", reason: "More central LA warehouse and logistics alternative.", relationshipType: "better_last_mile" },
      { slug: "santa-fe-springs", label: "Santa Fe Springs", reason: "Similar southeast LA industrial alternative with service-commercial depth.", relationshipType: "similar" },
      { slug: "vernon", label: "Vernon", reason: "More central manufacturing and industrial alternative.", relationshipType: "better_last_mile" },
    ] },
  },
  {
    slug: "carson",
    label: "Carson",
    type: "district",
    city: "Carson",
    state: "CA",
    path: "/commercial-real-estate/CA/carson/carson/",
    confidence: "high",
    spaceTypeFit: {
      industrial: fit("strong", "Strong fit for port-adjacent logistics, warehouse, service industrial, and flex users comparing the South Bay and Long Beach/LA port corridor.", ["port-adjacent logistics", "warehouse users", "service industrial companies", "flex operations"], ["truck routes, yard, and trailer parking need site-specific review", "less office image than Torrance or El Segundo"]),
      warehouse: fit("strong", "Strong warehouse fit for users that value port, South Bay, and freeway access.", ["warehouse users", "import/export support", "regional logistics"], ["modern clear height and loading vary by property"]),
      flex: fit("good", "Good fit for operational flex users needing South Bay access and practical building formats.", ["service operations", "light production", "office/flex users"], ["less polished than office-first South Bay markets"]),
    },
    attributes: businessAttrs({ transit: "low", parking: "high", walkability: "low", freewayAccess: "high", executiveImage: "medium", customerAccess: "medium", expansionFlexibility: "medium", talentAccess: "medium", visibility: "medium", amenities: "medium", costPosition: "medium", creativeEnvironment: "low", corporateEnvironment: "medium" }),
    industrialAttributes: industrialAttrs({ truckAccess: "high", highwayAccess: "high", lastMileAccess: "high", portAirportAccess: "high", clearHeight: "medium", loading: "high", yard: "medium", power: "medium", zoningFlexibility: "high", laborAccess: "high", parkingTrailer: "medium", outdoorStorage: "medium" }),
    bestFor: ["port-adjacent logistics", "warehouse users", "South Bay service industrial", "flex operations"],
    tradeoffs: ["less executive office image", "site-specific truck and yard conditions matter", "not as airport-oriented as El Segundo/LAX industrial"],
    strengths: ["port adjacency", "South Bay freeway access", "industrial and flex inventory", "labor access"],
    questionsToValidate: ["How important is port access?", "Do you need yard, trailer parking, or outdoor storage?", "Should the search favor South Bay labor access or central LA proximity?", "Would Long Beach or Torrance better fit operations?"],
    relationships: { compareWith: [
      { slug: "long-beach", label: "Long Beach Industrial / Port-adjacent", reason: "More port-adjacent logistics and waterfront industrial alternative.", relationshipType: "better_truck_access" },
      { slug: "torrance", label: "Torrance / South Bay Industrial", reason: "More office/flex and aerospace-adjacent South Bay alternative.", relationshipType: "similar" },
      { slug: "commerce", label: "Commerce", reason: "More central LA logistics and freeway-oriented alternative.", relationshipType: "better_last_mile" },
    ] },
  },
  {
    slug: "torrance",
    label: "Torrance / South Bay Industrial",
    type: "district",
    city: "Torrance",
    state: "CA",
    path: "/commercial-real-estate/CA/torrance/torrance/",
    confidence: "high",
    spaceTypeFit: {
      office: fit("good", "Good fit for South Bay office, medical, aerospace, and professional-service users that want practical access and parking.", ["aerospace-adjacent offices", "medical users", "professional services", "regional offices"], ["less executive coastal image than Santa Monica or Century City", "less pure office campus identity than El Segundo"]),
      industrial: fit("strong", "Strong fit for aerospace, light industrial, manufacturing, and flex users needing South Bay access.", ["aerospace suppliers", "light manufacturers", "industrial/flex users", "service operations"], ["truck and loading requirements vary by property"]),
      flex: fit("strong", "Strong fit for users combining office, production, service, and technical functions.", ["office/flex users", "R&D support", "advanced manufacturing"], ["building specs should be checked carefully"]),
    },
    attributes: businessAttrs({ transit: "low", parking: "high", walkability: "medium", freewayAccess: "high", executiveImage: "medium", customerAccess: "medium", expansionFlexibility: "medium", talentAccess: "medium", visibility: "medium", amenities: "high", costPosition: "medium", creativeEnvironment: "low", corporateEnvironment: "medium" }),
    retailAttributes: retailAttrs({ footTraffic: "medium", customerParking: "high", coTenancy: "medium", streetPresence: "medium", daytimePopulation: "medium", eveningWeekendActivity: "medium", signageVisibility: "medium" }),
    industrialAttributes: industrialAttrs({ truckAccess: "high", highwayAccess: "high", lastMileAccess: "medium", portAirportAccess: "high", clearHeight: "medium", loading: "medium", yard: "medium", power: "medium", zoningFlexibility: "high", laborAccess: "high", parkingTrailer: "medium", outdoorStorage: "medium" }),
    bestFor: ["aerospace suppliers", "industrial/flex users", "South Bay office teams", "medical and professional services"],
    tradeoffs: ["less transit-oriented", "less brand-forward than Westside office districts", "building-level specs drive industrial fit"],
    strengths: ["South Bay industrial/flex base", "aerospace adjacency", "parking", "regional customer and labor access"],
    questionsToValidate: ["Do you need aerospace, flex, or light industrial functionality?", "Is South Bay employee access important?", "Do you need truck access, loading, or yard?", "Would El Segundo or Carson better match office image or port logistics?"],
    relationships: { compareWith: [
      { slug: "el-segundo", label: "El Segundo", reason: "More corporate, airport-adjacent office and R&D alternative.", relationshipType: "more_executive" },
      { slug: "carson", label: "Carson", reason: "More port-adjacent logistics and industrial alternative.", relationshipType: "better_truck_access" },
      { slug: "south-bay-lax-industrial", label: "South Bay / LAX Industrial", reason: "More airport-oriented industrial and flex alternative.", relationshipType: "better_last_mile" },
    ] },
  },
  {
    slug: "south-bay-lax-industrial",
    label: "LAX / El Segundo Industrial",
    type: "district",
    city: "Los Angeles",
    state: "CA",
    path: "/commercial-real-estate/CA/los-angeles/south-bay-lax-industrial/",
    confidence: "high",
    spaceTypeFit: {
      industrial: fit("strong", "Strong fit for airport-adjacent industrial, flex, aerospace, logistics, and service users that need LAX and South Bay access.", ["airport logistics", "aerospace support", "service industrial", "office/flex operations"], ["not every property supports heavy warehouse requirements", "traffic and truck circulation should be validated"]),
      warehouse: fit("good", "Good warehouse fit for users that value LAX, South Bay, and last-mile access over large-format distribution scale.", ["last-mile users", "airport support", "service distribution"], ["larger-format needs may need Carson, Commerce, or City of Industry"]),
      flex: fit("strong", "Strong flex/R&D-support fit for aerospace, technical, and airport-serving operations.", ["aerospace support", "technical operations", "office/flex users"], ["technical specs vary by building"]),
    },
    attributes: businessAttrs({ transit: "medium", parking: "high", walkability: "low", freewayAccess: "high", executiveImage: "medium", customerAccess: "medium", expansionFlexibility: "medium", talentAccess: "high", visibility: "medium", amenities: "medium", costPosition: "medium", creativeEnvironment: "low", corporateEnvironment: "medium" }),
    industrialAttributes: industrialAttrs({ truckAccess: "high", highwayAccess: "high", lastMileAccess: "high", portAirportAccess: "high", clearHeight: "medium", loading: "medium", yard: "medium", power: "medium", zoningFlexibility: "medium", laborAccess: "high", parkingTrailer: "medium", outdoorStorage: "medium" }),
    bestFor: ["airport logistics", "aerospace support", "South Bay industrial/flex users", "last-mile operations"],
    tradeoffs: ["larger warehouse requirements may need other LA industrial corridors", "traffic and airport-area circulation matter", "not as polished as office-first El Segundo"],
    strengths: ["LAX adjacency", "South Bay access", "aerospace and technical ecosystem", "last-mile utility"],
    questionsToValidate: ["Is LAX or airport access a core requirement?", "Do you need flex/R&D, warehouse, or service industrial functionality?", "Are truck circulation and loading constraints acceptable?", "Would Carson or Commerce provide better industrial scale?"],
    relationships: { compareWith: [
      { slug: "el-segundo", label: "El Segundo", reason: "More office/R&D and corporate campus-oriented airport alternative.", relationshipType: "more_executive" },
      { slug: "torrance", label: "Torrance / South Bay Industrial", reason: "More South Bay aerospace and flex-industrial alternative.", relationshipType: "similar" },
      { slug: "carson", label: "Carson", reason: "More port-adjacent warehouse and logistics alternative.", relationshipType: "better_truck_access" },
    ] },
  },
  {
    slug: "santa-fe-springs",
    label: "Santa Fe Springs",
    type: "district",
    city: "Santa Fe Springs",
    state: "CA",
    path: "/commercial-real-estate/CA/santa-fe-springs/santa-fe-springs/",
    confidence: "high",
    spaceTypeFit: {
      industrial: fit("strong", "Strong fit for southeast LA industrial, warehouse, manufacturing, and service-commercial users that need practical freeway access.", ["service industrial users", "warehouse users", "manufacturers", "contractor operations"], ["less central than Vernon or Commerce", "less large-format than some City of Industry options"]),
      warehouse: fit("strong", "Strong warehouse fit for users comparing southeast LA industrial corridors.", ["warehouse users", "regional distribution", "service distribution"], ["clear height, yard, and trailer parking vary by property"]),
      manufacturing: fit("good", "Good fit for manufacturing and production users that need industrial zoning and regional labor access.", ["light manufacturing", "production users", "contractor operations"], ["specialized power and compliance requirements need property review"]),
    },
    attributes: businessAttrs({ transit: "low", parking: "high", walkability: "low", freewayAccess: "high", executiveImage: "low", customerAccess: "medium", expansionFlexibility: "medium", talentAccess: "medium", visibility: "medium", amenities: "low", costPosition: "medium", creativeEnvironment: "low", corporateEnvironment: "low" }),
    industrialAttributes: industrialAttrs({ truckAccess: "high", highwayAccess: "high", lastMileAccess: "medium", portAirportAccess: "medium", clearHeight: "medium", loading: "high", yard: "medium", power: "medium", zoningFlexibility: "high", laborAccess: "high", parkingTrailer: "medium", outdoorStorage: "medium" }),
    bestFor: ["service industrial users", "warehouse users", "light manufacturers", "contractor operations"],
    tradeoffs: ["less central than Vernon or Commerce", "not a customer-facing office market", "modern logistics specs require building-level review"],
    strengths: ["industrial zoning", "freeway access", "warehouse and manufacturing utility", "labor access"],
    questionsToValidate: ["Do you need warehouse, manufacturing, or service-commercial functionality?", "How important are loading, yard, and trailer parking?", "Is southeast LA access more useful than central LA access?", "Would Commerce or City of Industry provide a better building fit?"],
    relationships: { compareWith: [
      { slug: "commerce", label: "Commerce", reason: "More central LA logistics and freeway-oriented alternative.", relationshipType: "better_last_mile" },
      { slug: "city-of-industry", label: "City of Industry", reason: "Larger-format industrial and distribution alternative.", relationshipType: "better_loading" },
      { slug: "carson", label: "Carson", reason: "More port-adjacent industrial/logistics alternative.", relationshipType: "better_truck_access" },
    ] },
  },
  {
    slug: "long-beach",
    label: "Long Beach Industrial / Port-adjacent",
    type: "district",
    city: "Long Beach",
    state: "CA",
    path: "/commercial-real-estate/CA/long-beach/long-beach/",
    confidence: "high",
    spaceTypeFit: {
      industrial: fit("strong", "Strong fit for port-adjacent industrial, warehouse, logistics, and service users that need Long Beach/South Bay access.", ["port logistics", "warehouse users", "service industrial", "import/export support"], ["office image and customer-facing fit vary by submarket", "truck routing and drayage requirements should be reviewed carefully"]),
      warehouse: fit("strong", "Strong warehouse fit for users tied to port, South Bay, and regional logistics flows.", ["warehouse users", "import/export operations", "last-mile and regional distribution"], ["clear height, trailer parking, and loading vary by building"]),
      office: fit("good", "Good selective fit for office users that need Long Beach access, port-related business context, or waterfront/civic office settings.", ["port-related businesses", "professional services", "regional offices"], ["not comparable to premium Westside office districts"]),
    },
    attributes: businessAttrs({ transit: "medium", parking: "medium", walkability: "medium", freewayAccess: "high", executiveImage: "medium", customerAccess: "medium", expansionFlexibility: "medium", talentAccess: "medium", visibility: "medium", amenities: "medium", costPosition: "medium", creativeEnvironment: "medium", corporateEnvironment: "medium" }),
    retailAttributes: retailAttrs({ footTraffic: "medium", customerParking: "medium", coTenancy: "medium", streetPresence: "medium", daytimePopulation: "medium", eveningWeekendActivity: "medium", signageVisibility: "medium" }),
    industrialAttributes: industrialAttrs({ truckAccess: "high", highwayAccess: "high", lastMileAccess: "high", portAirportAccess: "high", clearHeight: "medium", loading: "high", yard: "medium", power: "medium", zoningFlexibility: "high", laborAccess: "high", parkingTrailer: "medium", outdoorStorage: "medium" }),
    bestFor: ["port-related logistics", "warehouse users", "Long Beach-serving offices", "service industrial companies"],
    tradeoffs: ["submarket selection matters significantly", "truck routing and port requirements need careful validation", "not a single uniform office or industrial market"],
    strengths: ["port adjacency", "regional freeway access", "warehouse and logistics utility", "Long Beach business base"],
    questionsToValidate: ["Is port adjacency essential?", "Do you need warehouse, distribution, or office near port-related customers?", "Are truck routes and loading requirements fixed?", "Would Carson or Torrance better match South Bay operations?"],
    relationships: { compareWith: [
      { slug: "carson", label: "Carson", reason: "More South Bay port-adjacent industrial and flex alternative.", relationshipType: "better_truck_access" },
      { slug: "torrance", label: "Torrance / South Bay Industrial", reason: "More aerospace, office/flex, and South Bay industrial alternative.", relationshipType: "similar" },
      { slug: "vernon", label: "Vernon", reason: "More central LA manufacturing and industrial alternative.", relationshipType: "better_last_mile" },
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
