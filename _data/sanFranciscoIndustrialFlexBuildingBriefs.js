function clean(value) {
  return String(value || "").trim();
}

function slugify(value) {
  return clean(value)
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function buildingPath(city, address) {
  return `/commercial-real-estate/building/CA/${slugify(city)}/${slugify(address)}/`;
}

function district(id, name, city, slug, areaType = "industrial_area") {
  return {
    id,
    name,
    slug,
    city,
    state_abbr: "CA",
    area_type: areaType,
    path: `/commercial-real-estate/CA/${slugify(city)}/${slug}/`,
  };
}

const districts = {
  westBerkeley: district("sf-west-berkeley-industrial-flex", "West Berkeley", "Berkeley", "west-berkeley"),
  moffettPark: district("sf-moffett-park-industrial-flex", "Moffett Park", "Sunnyvale", "moffett-park"),
  haywardIndustrial: district("sf-hayward-industrial", "Hayward Industrial", "Hayward", "hayward-industrial"),
  unionCityIndustrial: district("sf-union-city-industrial", "Union City Industrial", "Union City", "union-city-industrial"),
  warmSprings: district("sf-warm-springs-innovation-district", "Warm Springs Innovation District", "Fremont", "warm-springs-innovation-district"),
};

const handbookTopics = [
  {
    title: "Choosing the Right Commercial Location",
    url: "/commercial-real-estate/lease-guide/choosing-the-right-commercial-location/",
    summary: "Use location fit, access, customers, employees, operations, and validation needs before narrowing the building list.",
  },
  {
    title: "How to Compare Commercial Spaces",
    url: "/commercial-real-estate/lease-guide/how-to-compare-commercial-spaces/",
    summary: "Compare buildings by business fit, total occupancy cost, access, buildout, and future flexibility.",
  },
  {
    title: "Tenant Improvements",
    url: "/commercial-real-estate/lease-guide/tenant-improvements/",
    summary: "Pressure-test buildout scope, utility requirements, timing, landlord approvals, and improvement responsibility.",
  },
];

const districtContext = {
  westBerkeley: {
    workplaceCharacter: "Berkeley industrial and flex setting where maker, production, service, and research-support users compare practical buildings with East Bay identity.",
    neighborhoodCharacter: "Lower-rise industrial and creative-production district near I-80, Emeryville, and Berkeley research and customer geography.",
    transit: "I-80 access and East Bay reach matter more than pure transit convenience, though exact commute patterns vary by building.",
    parking: "Parking, service-vehicle access, loading, and production fit should be verified property by property.",
    amenities: "Nearby Berkeley and Emeryville amenities can support employees, but operating utility remains the central reason to compare the district.",
  },
  moffettPark: {
    workplaceCharacter: "Sunnyvale business-park setting for R&D, engineering, and flex users that need Highway 101 access and practical campus-style space.",
    neighborhoodCharacter: "Auto-oriented South Bay environment shaped by technology, research, and support operations more than storefront visibility.",
    transit: "Highway 101 and Sunnyvale/Mountain View access are the durable access story; transit and shuttle fit should be validated.",
    parking: "Parking is a stronger part of the operating model than in urban San Francisco districts, but allocation remains property-specific.",
    amenities: "Amenities are more campus and auto oriented than pedestrian retail oriented.",
  },
  haywardIndustrial: {
    workplaceCharacter: "Mid-Bay industrial corridor where warehouse, service, light-production, and distribution users evaluate I-880 access and operational utility.",
    neighborhoodCharacter: "Practical industrial geography with stronger service and distribution identity than executive office image.",
    transit: "I-880 and regional East Bay movement are more important than walkability for most users.",
    parking: "Loading, truck movement, parking, yard needs, and clear height require direct property validation.",
    amenities: "Amenities are secondary to operations, labor access, and customer or delivery geography.",
  },
  unionCityIndustrial: {
    workplaceCharacter: "Tri-City industrial environment where warehouse, manufacturing, and service users compare East Bay and South Bay reach.",
    neighborhoodCharacter: "Industrial corridor with practical warehouse and production utility rather than customer-facing polish.",
    transit: "I-880 access, regional labor, and customer geography are the main comparison points.",
    parking: "Truck circulation, loading, parking allocation, and trailer or vehicle needs should be validated early.",
    amenities: "Employee convenience should be checked against shift pattern and commute geography.",
  },
  warmSprings: {
    workplaceCharacter: "Fremont innovation-industrial setting where advanced manufacturing, hardware, R&D support, and flex operations overlap.",
    neighborhoodCharacter: "South East Bay industrial and technology corridor with stronger production and technical-use identity than general office districts.",
    transit: "I-880, Fremont, and Silicon Valley access shape fit; commute and customer patterns should be tested against North San Jose and Union City.",
    parking: "Parking, loading, power, production compatibility, and yard needs remain property-specific validation items.",
    amenities: "Business-park and industrial access matter more than walkable street amenities.",
  },
};

function profileBrief(fields) {
  const snapshot = fields.snapshot || [];
  const bestFit = fields.bestFit || [];
  const validationNotes = fields.validationNotes || [];

  return {
    status: "published",
    ecosystemContext: {
      primaryEcosystem: "industrial_flex",
      ecosystemSubtypes: fields.ecosystemSubtypes,
      representativeRole: fields.representativeRole,
    },
    businessFit: {
      archetypes: fields.businessArchetypes,
      activities: fields.businessActivities,
      fitSummary: fields.fitSummary,
    },
    operationalProfile: fields.operationalProfile || [],
    environmentExplanation: fields.environmentExplanation,
    comparisonContext: {
      relatedDistricts: fields.relatedDistricts || [],
    },
    evidence: {
      confidence: fields.confidence || "editorially_supported",
      provenance: {
        ecosystem: "representative-building",
        operationalCharacteristics: "mixed",
        editorialInterpretation: "building-brief",
      },
      sourceNotes: fields.sourceNotes || [],
    },
    summary: fields.summary,
    rofoTake: fields.rofoTake,
    buildingSummary: fields.summary,
    buildingImportance: fields.rofoTake,
    snapshot,
    quickFacts: snapshot,
    bestFit,
    idealFor: bestFit,
    mayNotFit: fields.mayNotFit || [],
    buildingExperience: fields.buildingExperience,
    locationContext: fields.locationContext,
    districtContext: fields.locationContext,
    advantages: fields.advantages || [],
    tradeoffs: fields.tradeoffs || [],
    validationNotes,
    validationChecklist: validationNotes,
    nearbyDistricts: fields.nearbyAlternatives || [],
    nearbyAlternatives: fields.nearbyAlternatives || [],
    relatedInsights: handbookTopics,
    representativeCompanies: fields.representativeCompanies || [],
    ecosystemSubtypes: fields.ecosystemSubtypes,
    representativeRole: fields.representativeRole,
    businessActivities: fields.businessActivities,
    businessArchetypes: fields.businessArchetypes,
    operationalCharacteristics: fields.operationalCharacteristics,
    fitSummary: fields.fitSummary,
    confidence: fields.confidence || "editorially_supported",
    sourceNotes: fields.sourceNotes || [],
  };
}

function record(fields) {
  const canonicalDistrict = districts[fields.districtKey];
  const defaults = districtContext[fields.districtKey];
  const path = buildingPath(fields.city, fields.address);
  const brief = profileBrief(fields.brief);

  return {
    id: `ca-bay-area-industrial-flex-${slugify(fields.city)}-${slugify(fields.address)}`,
    building_path: path,
    identity: {
      name: fields.name,
      address: fields.address,
      city: fields.city,
      state_abbr: "CA",
      district: canonicalDistrict.name,
      canonicalDistrict,
      secondaryDistricts: fields.secondaryDistricts || [],
      buildingType: fields.buildingType || "Industrial / flex",
      primarySpaceType: fields.primarySpaceType || "industrial",
      assetClass: "Representative Industrial & Flex Building",
    },
    editorial: {
      editorialRole: fields.editorialRole,
      editorialReason: fields.editorialReason,
      representativeThemes: fields.representativeThemes,
    },
    business: {
      businessFit: fields.businessFit,
      idealCompanyProfiles: brief.idealFor,
      companySizes: fields.companySizes || ["small and mid-sized businesses", "industrial and flex operators", "service, production, and distribution teams"],
    },
    experience: {
      workplaceCharacter: defaults.workplaceCharacter,
      neighborhoodCharacter: defaults.neighborhoodCharacter,
      executivePresence: fields.executivePresence || "low",
      innovationScore: fields.innovationScore || "moderate",
    },
    operations: {
      transit: defaults.transit,
      parking: defaults.parking,
      amenities: defaults.amenities,
      foodEnvironment: "Food and service amenities should be evaluated by employee schedule and operating geography.",
    },
    tradeoffs: {
      strengths: brief.advantages,
      limitations: brief.tradeoffs,
      businessesThatShouldCompare: brief.mayNotFit,
      nearbyAlternatives: fields.relatedDistrictPaths || [],
    },
    validation: {
      questionsToValidate: brief.validationNotes,
      tourObservations: brief.validationNotes.slice(0, 3),
    },
    relationships: {
      nearbyBuildings: (fields.nearbyBuildingPaths || []).slice(0, 5),
      comparisonBuildings: (fields.comparisonBuildingPaths || []).slice(0, 5),
      relatedDistricts: fields.relatedDistrictPaths || [],
    },
    commercialIntelligence: {
      primaryEcosystem: brief.ecosystemContext.primaryEcosystem,
      ecosystemSubtypes: brief.ecosystemContext.ecosystemSubtypes,
      representativeRole: brief.ecosystemContext.representativeRole,
      businessActivities: brief.businessFit.activities,
      businessArchetypes: brief.businessFit.archetypes,
      operationalCharacteristics: brief.operationalCharacteristics,
      representativeReasons: [
        fields.editorialReason,
        brief.environmentExplanation.representativeValue,
      ],
      tradeoffs: brief.tradeoffs,
      validationFocus: brief.validationChecklist,
      confidence: brief.confidence,
    },
    quality: {
      sourceConfidence: fields.sourceConfidence || "medium",
      publicationStatus: "published",
      sourceBasis: "San Francisco Industrial & Flex Ecosystem Completion",
    },
    buildingBrief: brief,
  };
}

const records = [
  record({
    name: "1608 4th St",
    address: "1608 4th St",
    city: "Berkeley",
    districtKey: "westBerkeley",
    buildingType: "Small-bay flex / light industrial",
    primarySpaceType: "flex",
    editorialRole: "Small-Bay Service Environment",
    editorialReason: "Represents West Berkeley's smaller industrial and flex buildings where maker, production, storage, and service needs shape the location decision.",
    representativeThemes: ["Small-bay industrial", "Maker environment", "Light production", "West Berkeley"],
    businessFit: ["maker businesses", "creative production", "service industrial", "light manufacturing"],
    relatedDistrictPaths: [districts.moffettPark.path, districts.haywardIndustrial.path, districts.warmSprings.path],
    nearbyBuildingPaths: [
      buildingPath("Berkeley", "2501 9th St"),
      buildingPath("Berkeley", "2600 10th St"),
      buildingPath("Berkeley", "950 Gilman St"),
    ],
    comparisonBuildingPaths: [
      buildingPath("Sunnyvale", "1195 Borregas Ave"),
      buildingPath("Hayward", "2340 Industrial Pkwy W"),
      buildingPath("Fremont", "45101-45169 Industrial Dr"),
    ],
    brief: {
      ecosystemSubtypes: ["small_bay_industrial", "flex", "light_manufacturing"],
      representativeRole: "small_bay_service_environment",
      businessActivities: ["service_dispatch", "equipment_storage", "receiving", "shipping", "light_manufacturing"],
      businessArchetypes: ["cabinet_shop", "creative_studio", "food_producer", "general_contractor", "light_manufacturer"],
      operationalCharacteristics: ["grade_level_loading", "small_suite_sizes", "service_vehicle_parking", "office_warehouse_mix", "freeway_access"],
      fitSummary: "Useful for small industrial and maker users comparing practical East Bay flex space against larger warehouse or technology-campus options.",
      summary: "1608 4th St helps explain West Berkeley as a small-bay industrial and flex environment. The building is useful for understanding why maker, production, service, and light-operational users may want Berkeley identity and I-80 access without committing to a large distribution facility.",
      rofoTake: "This profile gives San Francisco industrial/flex coverage a West Berkeley small-bay reference point, which is distinct from South Bay R&D parks and East Bay warehouse corridors.",
      snapshot: [
        { label: "Primary ecosystem", value: "Industrial / flex" },
        { label: "Business use", value: "Small-bay service and maker environment" },
        { label: "District", value: "West Berkeley" },
        { label: "Building form", value: "Flex and light-industrial representative building" },
        { label: "Validation focus", value: "Loading, production fit, parking, and permitted use" },
      ],
      bestFit: [
        "Cabinet shops, creative-production teams, small manufacturers, and service companies that need practical space with Berkeley identity.",
        "Businesses comparing office/warehouse or maker space against larger East Bay industrial corridors.",
        "Teams that need storage, assembly, receiving, or dispatch capability but do not need regional distribution scale.",
      ],
      mayNotFit: [
        "Users that need large truck courts, trailer parking, or modern logistics specifications.",
        "Client-facing office users that need a polished downtown or campus-style setting.",
      ],
      buildingExperience: "A tour should focus on the relationship between office area, work area, loading, parking, delivery access, and whether the district's maker character supports the business.",
      locationContext: "West Berkeley is the Bay Area's Berkeley-oriented maker and light-industrial counterpoint to Moffett Park, Warm Springs, Hayward, and Union City. It should be compared when identity and practical small-bay format matter together.",
      advantages: [
        "Explains small-bay industrial and flex needs without using a large warehouse as the default example.",
        "Connects maker, production, and service businesses to a distinct East Bay district identity.",
        "Creates a useful comparison against South Bay R&D/flex and I-880 warehouse corridors.",
      ],
      tradeoffs: [
        "Smaller industrial buildings may not offer the truck movement or parking control that distribution users need.",
        "Older or varied building formats require direct validation of loading, power, ventilation, and permitted use.",
        "Berkeley identity may matter less for users whose service territory is primarily South Bay or mid-Bay.",
      ],
      operationalProfile: [
        { label: "Loading and deliveries", summary: "Loading is relevant to this operating model, but the exact configuration should be confirmed for the available suite." },
        { label: "Space configuration", summary: "Small-bay flex users should test the balance of office, production, storage, and ground-floor access." },
        { label: "Customer presence", summary: "The district can support some customer or showroom interaction, but suitability depends on frontage, signage, and visitor access." },
      ],
      environmentExplanation: {
        whyItExists: "Small-bay industrial environments exist because many local service, maker, and production businesses need modest operational space without the scale of a regional warehouse.",
        whyChooseThisEnvironment: "Choose West Berkeley over Hayward or Union City when maker identity, Berkeley access, and smaller flex formats matter more than large-format warehouse utility.",
        representativeValue: "1608 4th St provides a compact West Berkeley benchmark for the industrial/flex ecosystem.",
      },
      relatedDistricts: [
        { districtId: "moffett-park", reason: "Compare for a more South Bay R&D and business-park flex setting." },
        { districtId: "hayward-industrial", reason: "Compare for more warehouse and service-industrial utility." },
      ],
      validationNotes: ["Confirm permitted use.", "Verify loading configuration.", "Confirm parking and service-vehicle rules.", "Validate power, ventilation, and production requirements."],
      nearbyAlternatives: [
        { label: "2501 9th St", url: buildingPath("Berkeley", "2501 9th St"), reason: "Useful when comparing another West Berkeley small-bay industrial example with a similar maker-service context." },
        { label: "1195 Borregas Ave", url: buildingPath("Sunnyvale", "1195 Borregas Ave"), reason: "Compare when R&D/flex business-park context matters more than Berkeley industrial character." },
        { label: "2340 Industrial Pkwy W", url: buildingPath("Hayward", "2340 Industrial Pkwy W"), reason: "Compare when the search needs stronger warehouse and I-880 service-industrial utility." },
      ],
      representativeCompanies: ["Maker, service, creative-production, light-manufacturing, and small contractor businesses are the relevant categories; this does not imply current tenancy."],
      sourceNotes: ["Existing Rofo canonical record identifies 1608 4th St as flex space in West Berkeley.", "The West Berkeley graph node supports industrial, flex, light-manufacturing, maker, and service-operational relevance."],
    },
  }),
  record({
    name: "1195 Borregas Ave",
    address: "1195 Borregas Ave",
    city: "Sunnyvale",
    districtKey: "moffettPark",
    buildingType: "R&D / flex business-park building",
    primarySpaceType: "flex",
    editorialRole: "Research and Development Environment",
    editorialReason: "Represents Moffett Park's office/R&D and flex setting where engineering, testing, support operations, and Highway 101 access shape fit.",
    representativeThemes: ["R&D flex", "Business park", "Highway 101", "Sunnyvale"],
    businessFit: ["hardware companies", "R&D teams", "technology operations", "office/flex users"],
    relatedDistrictPaths: [districts.warmSprings.path, districts.westBerkeley.path, districts.haywardIndustrial.path],
    nearbyBuildingPaths: [],
    comparisonBuildingPaths: [
      buildingPath("Fremont", "45101-45169 Industrial Dr"),
      buildingPath("Berkeley", "1608 4th St"),
      buildingPath("Union City", "1550 Pacific St"),
    ],
    brief: {
      ecosystemSubtypes: ["research_development", "flex"],
      representativeRole: "research_development_environment",
      businessActivities: ["product_development", "research", "knowledge_work", "assembly", "light_manufacturing"],
      businessArchetypes: ["research_company", "startup", "light_manufacturer", "distributor"],
      operationalCharacteristics: ["high_office_percentage", "fiber_connectivity", "research_compatible", "flexible_suite_sizes", "surface_parking"],
      fitSummary: "Useful for R&D and office/flex users comparing South Bay business-park utility against heavier industrial districts.",
      summary: "1195 Borregas Ave helps explain Moffett Park as an R&D and flex business-park environment. It is useful for businesses that need engineering, support operations, testing, or mixed office/flex functions and want Highway 101 access without choosing a traditional warehouse district.",
      rofoTake: "This profile gives San Francisco industrial/flex coverage a South Bay R&D/flex benchmark, which is different from West Berkeley maker space and I-880 warehouse corridors.",
      snapshot: [
        { label: "Primary ecosystem", value: "Industrial / flex" },
        { label: "Business use", value: "R&D and flex business park" },
        { label: "District", value: "Moffett Park" },
        { label: "Access context", value: "Highway 101 and Sunnyvale/Mountain View reach" },
        { label: "Validation focus", value: "Office/flex mix, technical requirements, parking, and loading" },
      ],
      bestFit: [
        "Engineering, hardware, R&D, and technology operations groups that need business-park flex space.",
        "Teams comparing testing, support, light assembly, or office/warehouse functions in a South Bay setting.",
        "Companies that want more operational flexibility than a conventional office building but less warehouse emphasis than Hayward or Union City.",
      ],
      mayNotFit: [
        "Commodity warehouse or contractor users whose primary need is truck movement, yard control, or low-cost storage.",
        "Retail or client-facing users that need street visibility and frequent walk-in customer access.",
      ],
      buildingExperience: "A tour should test the office-to-operational balance, technical buildout assumptions, parking, delivery access, and whether Moffett Park's business-park setting supports the team's workforce.",
      locationContext: "Moffett Park should be compared against North Bayshore, North San Jose, Warm Springs, and West Berkeley when a user needs flex or R&D support but is deciding how industrial the environment should feel.",
      advantages: [
        "Defines a South Bay R&D/flex operating model for the San Francisco metro.",
        "Supports users that need office, engineering, testing, and light operational functions in one search.",
        "Creates a clear counterpoint to East Bay small-bay and warehouse-oriented industrial districts.",
      ],
      tradeoffs: [
        "Business-park flex may provide less pure warehouse efficiency than I-880 industrial corridors.",
        "Technical, loading, power, and lab-support requirements remain property-specific and should not be inferred.",
        "The area is less walkable and customer-facing than urban office or retail districts.",
      ],
      operationalProfile: [
        { label: "Space configuration", summary: "The key question is how office, engineering, support, and operational areas divide within the available suite." },
        { label: "Infrastructure", summary: "Power, ventilation, communications, and technical buildout should be verified before assuming R&D suitability." },
        { label: "Regional access", summary: "Highway 101 access and Sunnyvale/Mountain View workforce geography are core reasons to compare this environment." },
      ],
      environmentExplanation: {
        whyItExists: "R&D/flex environments exist because technical companies often need office, engineering, testing, storage, and light operational functions in proportions that standard office or warehouse buildings may not support.",
        whyChooseThisEnvironment: "Choose Moffett Park over West Berkeley when South Bay engineering geography and business-park structure matter more than maker identity or urban industrial character.",
        representativeValue: "1195 Borregas Ave anchors the R&D/flex side of the metro's industrial/flex Building Profile coverage.",
      },
      relatedDistricts: [
        { districtId: "warm-springs-innovation-district", reason: "Compare for more manufacturing and hardware-production adjacency." },
        { districtId: "west-berkeley", reason: "Compare for a more maker-oriented East Bay flex environment." },
      ],
      validationNotes: ["Confirm office and operational area split.", "Verify loading and delivery access.", "Validate power, ventilation, and technical buildout requirements.", "Confirm parking allocation and employee commute fit."],
      nearbyAlternatives: [
        { label: "45101-45169 Industrial Dr", url: buildingPath("Fremont", "45101-45169 Industrial Dr"), reason: "Useful when advanced manufacturing adjacency matters more than Sunnyvale business-park identity." },
        { label: "1608 4th St", url: buildingPath("Berkeley", "1608 4th St"), reason: "Compare when smaller maker or service-industrial space is a better fit than South Bay R&D/flex." },
        { label: "1550 Pacific St", url: buildingPath("Union City", "1550 Pacific St"), reason: "Compare when warehouse and manufacturing utility matter more than R&D campus context." },
      ],
      representativeCompanies: ["R&D, hardware, engineering-support, technology operations, and light-assembly businesses are the relevant categories; this does not imply current tenancy."],
      sourceNotes: ["Existing Rofo canonical record identifies 1195 Borregas Ave as flex space in Moffett Park.", "The Moffett Park graph node supports R&D, flex, office, parking, and Highway 101 access relevance."],
    },
  }),
  record({
    name: "2340 Industrial Pkwy W",
    address: "2340 Industrial Pkwy W",
    city: "Hayward",
    districtKey: "haywardIndustrial",
    buildingType: "Warehouse / service-industrial building",
    primarySpaceType: "industrial",
    editorialRole: "Warehouse and Service-Industrial Environment",
    editorialReason: "Represents Hayward Industrial's practical I-880 warehouse and service-industrial setting for companies that need East Bay and Peninsula reach.",
    representativeThemes: ["Warehouse", "Service industrial", "I-880 corridor", "Hayward"],
    businessFit: ["warehouse users", "service businesses", "distributors", "light production"],
    relatedDistrictPaths: [districts.unionCityIndustrial.path, districts.warmSprings.path, districts.westBerkeley.path],
    nearbyBuildingPaths: [
      buildingPath("Hayward", "25901 Industrial Blvd"),
      buildingPath("Hayward", "31350 Huntwood Ave"),
      buildingPath("Hayward", "3151 Diablo Ave"),
    ],
    comparisonBuildingPaths: [
      buildingPath("Union City", "1550 Pacific St"),
      buildingPath("Fremont", "45101-45169 Industrial Dr"),
      buildingPath("Berkeley", "1608 4th St"),
    ],
    brief: {
      ecosystemSubtypes: ["warehouse", "small_bay_industrial", "flex"],
      representativeRole: "warehouse_distribution_environment",
      businessActivities: ["receiving", "shipping", "storage", "distribution", "service_dispatch"],
      businessArchetypes: ["distributor", "ecommerce_fulfillment_business", "general_contractor", "hvac_company", "light_manufacturer"],
      operationalCharacteristics: ["grade_level_loading", "service_vehicle_parking", "freeway_access", "office_warehouse_mix", "small_suite_sizes"],
      fitSummary: "Useful for warehouse, service, and distribution users evaluating practical I-880 industrial access.",
      summary: "2340 Industrial Pkwy W helps explain Hayward Industrial as a practical warehouse and service-industrial environment. It is useful for businesses that need receiving, storage, dispatch, or distribution access in the middle of the Bay Area rather than a polished office or R&D district.",
      rofoTake: "This profile adds an I-880 warehouse and service-industrial benchmark so San Francisco industrial/flex coverage is not defined only by Berkeley maker space or South Bay R&D parks.",
      snapshot: [
        { label: "Primary ecosystem", value: "Industrial / flex" },
        { label: "Business use", value: "Warehouse and service-industrial environment" },
        { label: "District", value: "Hayward Industrial" },
        { label: "Access context", value: "I-880 corridor and mid-Bay service geography" },
        { label: "Validation focus", value: "Loading, truck circulation, parking, clear height, and permitted use" },
      ],
      bestFit: [
        "Distributors, service businesses, contractors, and warehouse users that need practical East Bay and Peninsula reach.",
        "Companies comparing storage, receiving, dispatch, and light-production needs against office/flex alternatives.",
        "Businesses that value industrial identity and freeway access more than customer-facing presentation.",
      ],
      mayNotFit: [
        "R&D or engineering teams that need a more campus-oriented South Bay flex setting.",
        "Showroom or retail users that need customer visibility and walk-in access.",
      ],
      buildingExperience: "A tour should focus on loading, truck access, parking, clear height, storage efficiency, office support space, and whether Hayward improves delivery or service geography.",
      locationContext: "Hayward Industrial is a mid-Bay industrial option between Oakland, the Peninsula, Union City, and Fremont. Compare it when operational reach matters more than Berkeley identity or South Bay technology adjacency.",
      advantages: [
        "Adds a practical warehouse and service-industrial model to the Building Profile set.",
        "Helps users evaluate I-880 reach, labor access, and regional service geography.",
        "Provides a stronger industrial counterpoint to R&D/flex business parks.",
      ],
      tradeoffs: [
        "Warehouse utility may come with less client-facing image and fewer walkable amenities.",
        "Specific loading, clear height, truck movement, and parking details require direct validation.",
        "Some specialized production or food users may need approvals or infrastructure beyond a standard industrial suite.",
      ],
      operationalProfile: [
        { label: "Loading and deliveries", summary: "Receiving and shipping needs should drive the property tour, with exact dock or grade-level access confirmed directly." },
        { label: "Vehicles and parking", summary: "Service vehicles, employee parking, delivery movement, and any trailer needs should be validated before shortlisting." },
        { label: "Location and distribution", summary: "The main location value is practical I-880 access for East Bay, Peninsula, and regional service geography." },
      ],
      environmentExplanation: {
        whyItExists: "Warehouse and service-industrial environments exist because goods-based and trade businesses need receiving, storage, dispatch, and regional access that office or R&D parks do not prioritize.",
        whyChooseThisEnvironment: "Choose Hayward over Moffett Park when operational utility and I-880 service reach matter more than R&D campus identity.",
        representativeValue: "2340 Industrial Pkwy W gives the metro a mid-Bay industrial benchmark.",
      },
      relatedDistricts: [
        { districtId: "union-city-industrial", reason: "Compare for a Tri-City warehouse and manufacturing alternative." },
        { districtId: "warm-springs-innovation-district", reason: "Compare for a more advanced manufacturing-oriented environment." },
      ],
      validationNotes: ["Verify loading configuration.", "Confirm truck circulation and delivery hours.", "Validate clear height and storage efficiency.", "Confirm parking allocation and permitted use."],
      nearbyAlternatives: [
        { label: "25901 Industrial Blvd", url: buildingPath("Hayward", "25901 Industrial Blvd"), reason: "Useful when comparing another Hayward industrial building in the same operating geography." },
        { label: "1550 Pacific St", url: buildingPath("Union City", "1550 Pacific St"), reason: "Compare when Tri-City warehouse and manufacturing reach may be more useful." },
        { label: "1195 Borregas Ave", url: buildingPath("Sunnyvale", "1195 Borregas Ave"), reason: "Compare when R&D/flex functions matter more than conventional warehouse utility." },
      ],
      representativeCompanies: ["Warehouse, distribution, contractor, service, e-commerce support, and light-production businesses are the relevant categories; this does not imply current tenancy."],
      sourceNotes: ["Existing Rofo canonical record identifies 2340 Industrial Pkwy W as industrial space in Hayward Industrial.", "The Hayward Industrial graph node supports warehouse, service, distribution, production, and I-880 access relevance."],
    },
  }),
  record({
    name: "1550 Pacific St",
    address: "1550 Pacific St",
    city: "Union City",
    districtKey: "unionCityIndustrial",
    buildingType: "Flex / industrial building",
    primarySpaceType: "flex",
    editorialRole: "Manufacturing and Warehouse Flex Environment",
    editorialReason: "Represents Union City Industrial's I-880 warehouse and manufacturing context for users comparing East Bay and South Bay operating reach.",
    representativeThemes: ["Warehouse", "Manufacturing", "Flex", "Tri-City industrial"],
    businessFit: ["manufacturing users", "warehouse users", "regional service companies", "light production"],
    relatedDistrictPaths: [districts.haywardIndustrial.path, districts.warmSprings.path, districts.moffettPark.path],
    nearbyBuildingPaths: [
      buildingPath("Union City", "30100-30150 Ahern St"),
      buildingPath("Union City", "30300 Whipple Rd"),
      buildingPath("Union City", "32900 Alvarado Niles Rd"),
    ],
    comparisonBuildingPaths: [
      buildingPath("Hayward", "2340 Industrial Pkwy W"),
      buildingPath("Fremont", "45101-45169 Industrial Dr"),
      buildingPath("Sunnyvale", "1195 Borregas Ave"),
    ],
    brief: {
      ecosystemSubtypes: ["small_bay_industrial", "warehouse", "manufacturing", "flex"],
      representativeRole: "light_manufacturing_environment",
      businessActivities: ["receiving", "shipping", "storage", "light_manufacturing", "assembly"],
      businessArchetypes: ["light_manufacturer", "distributor", "ecommerce_fulfillment_business", "general_contractor", "cabinet_shop"],
      operationalCharacteristics: ["grade_level_loading", "office_warehouse_mix", "freeway_access", "service_vehicle_parking", "small_suite_sizes"],
      fitSummary: "Useful for businesses comparing warehouse, light manufacturing, and flex needs along the Tri-City I-880 corridor.",
      summary: "1550 Pacific St helps explain Union City Industrial as a warehouse, manufacturing, and flex environment. It is useful for companies that need practical I-880 access and production or storage capability but should validate the exact loading, parking, and infrastructure fit before treating a suite as operationally ready.",
      rofoTake: "This profile gives the industrial/flex migration a Tri-City manufacturing and warehouse reference point between Hayward and Fremont.",
      snapshot: [
        { label: "Primary ecosystem", value: "Industrial / flex" },
        { label: "Business use", value: "Warehouse and light-manufacturing flex" },
        { label: "District", value: "Union City Industrial" },
        { label: "Access context", value: "I-880 Tri-City industrial corridor" },
        { label: "Validation focus", value: "Manufacturing approval, loading, power, parking, and truck access" },
      ],
      bestFit: [
        "Light manufacturers, distributors, and warehouse users comparing East Bay and South Bay reach.",
        "Service and production businesses that need a practical industrial district rather than an office-oriented flex park.",
        "Companies that want to compare Hayward and Fremont options without defaulting to either market.",
      ],
      mayNotFit: [
        "R&D users that need a more campus-like technical environment.",
        "Customer-facing companies whose brand depends on walkability, visibility, or showroom presentation.",
      ],
      buildingExperience: "A tour should test manufacturing compatibility, loading, power, parking, truck movement, storage layout, and whether Union City's position improves the company's service or supplier geography.",
      locationContext: "Union City Industrial provides a Tri-City comparison between Hayward's mid-Bay warehouse utility and Warm Springs' advanced manufacturing identity. It should be evaluated when production, storage, and I-880 access all matter.",
      advantages: [
        "Adds manufacturing and warehouse-flex depth to the San Francisco industrial/flex set.",
        "Explains the Tri-City I-880 operating model between Hayward and Fremont.",
        "Helps users distinguish production-oriented industrial space from R&D/flex business parks.",
      ],
      tradeoffs: [
        "Manufacturing compatibility cannot be inferred from district fit and must be validated for the property and use.",
        "The environment is less customer-facing than retail, showroom, or downtown office settings.",
        "Users with specialized power, ventilation, hazardous-material, or food-production needs need deeper due diligence.",
      ],
      operationalProfile: [
        { label: "Production fit", summary: "Light manufacturing or assembly users should validate permitted use, power, ventilation, and any special approvals." },
        { label: "Warehouse function", summary: "Storage, loading, truck access, and clear height should be checked against the actual suite." },
        { label: "Regional access", summary: "Union City's value is strongest for businesses serving East Bay, South Bay, and Peninsula customer or supplier geography." },
      ],
      environmentExplanation: {
        whyItExists: "Manufacturing and warehouse-flex environments exist for businesses that need production, storage, receiving, shipping, and service access in the same operating geography.",
        whyChooseThisEnvironment: "Choose Union City over Moffett Park when production and warehouse utility matter more than R&D campus identity; compare Warm Springs when advanced manufacturing adjacency is central.",
        representativeValue: "1550 Pacific St gives the migration a Tri-City production and warehouse-flex reference point.",
      },
      relatedDistricts: [
        { districtId: "hayward-industrial", reason: "Compare for a more mid-Bay industrial and service-distribution alternative." },
        { districtId: "warm-springs-innovation-district", reason: "Compare when advanced manufacturing or hardware adjacency matters more." },
      ],
      validationNotes: ["Confirm permitted manufacturing or assembly use.", "Verify loading and truck circulation.", "Validate power and ventilation requirements.", "Confirm parking, storage, and delivery rules."],
      nearbyAlternatives: [
        { label: "30100-30150 Ahern St", url: buildingPath("Union City", "30100-30150 Ahern St"), reason: "Useful when comparing another Union City industrial option in the same warehouse and manufacturing corridor." },
        { label: "2340 Industrial Pkwy W", url: buildingPath("Hayward", "2340 Industrial Pkwy W"), reason: "Compare when mid-Bay service-industrial reach may be more important." },
        { label: "45101-45169 Industrial Dr", url: buildingPath("Fremont", "45101-45169 Industrial Dr"), reason: "Compare when the search leans toward advanced manufacturing or R&D support." },
      ],
      representativeCompanies: ["Light manufacturing, warehouse, contractor, distribution, assembly, and service businesses are the relevant categories; this does not imply current tenancy."],
      sourceNotes: ["Existing Rofo canonical record identifies 1550 Pacific St as flex space in Union City Industrial.", "The Union City Industrial graph node supports warehouse, manufacturing, regional logistics, and I-880 access relevance."],
    },
  }),
  record({
    name: "45101-45169 Industrial Dr",
    address: "45101-45169 Industrial Dr",
    city: "Fremont",
    districtKey: "warmSprings",
    buildingType: "Industrial / advanced manufacturing flex",
    primarySpaceType: "industrial",
    editorialRole: "Advanced Manufacturing Flex Environment",
    editorialReason: "Represents Warm Springs' advanced manufacturing and R&D-adjacent industrial pattern for hardware, production, and technical operations users.",
    representativeThemes: ["Advanced manufacturing", "R&D support", "Fremont", "Industrial flex"],
    businessFit: ["advanced manufacturing", "hardware companies", "R&D support", "pilot production"],
    relatedDistrictPaths: [districts.unionCityIndustrial.path, districts.moffettPark.path, districts.haywardIndustrial.path],
    nearbyBuildingPaths: [
      buildingPath("Fremont", "46723 Lakeview Blvd"),
      buildingPath("Fremont", "47697 Westinghouse Dr"),
      buildingPath("Fremont", "48834 Kato Rd"),
    ],
    comparisonBuildingPaths: [
      buildingPath("Sunnyvale", "1195 Borregas Ave"),
      buildingPath("Union City", "1550 Pacific St"),
      buildingPath("Hayward", "2340 Industrial Pkwy W"),
    ],
    brief: {
      ecosystemSubtypes: ["small_bay_industrial", "flex", "research_development", "light_manufacturing"],
      representativeRole: "flex_business_park",
      businessActivities: ["product_development", "assembly", "light_manufacturing", "receiving", "shipping"],
      businessArchetypes: ["research_company", "light_manufacturer", "startup", "distributor", "ecommerce_fulfillment_business"],
      operationalCharacteristics: ["office_warehouse_mix", "research_compatible", "freeway_access", "surface_parking", "flexible_suite_sizes"],
      fitSummary: "Useful for hardware, R&D support, and advanced manufacturing users comparing Fremont against South Bay R&D/flex and East Bay warehouse districts.",
      summary: "45101-45169 Industrial Dr helps explain Warm Springs as an advanced manufacturing and R&D-adjacent industrial environment. It is useful for businesses that combine engineering, production, assembly, storage, and supplier access, while requiring direct validation of technical infrastructure and use approvals.",
      rofoTake: "This profile gives the metro's industrial/flex coverage a Fremont benchmark where technology, production, and industrial utility overlap.",
      snapshot: [
        { label: "Primary ecosystem", value: "Industrial / flex" },
        { label: "Business use", value: "Advanced manufacturing and R&D support" },
        { label: "District", value: "Warm Springs Innovation District" },
        { label: "Access context", value: "Fremont, I-880, and Silicon Valley manufacturing adjacency" },
        { label: "Validation focus", value: "Power, loading, production approval, parking, and technical buildout" },
      ],
      bestFit: [
        "Hardware, robotics, clean-tech, advanced manufacturing, and R&D support users that need industrial utility near Silicon Valley.",
        "Teams that combine engineering, assembly, storage, and operational support in one location decision.",
        "Companies comparing Fremont against North San Jose, Moffett Park, Union City, and Hayward.",
      ],
      mayNotFit: [
        "Commodity storage users that do not benefit from Warm Springs' technical or manufacturing context.",
        "Small service businesses that need lower-cost local dispatch space more than innovation-corridor identity.",
      ],
      buildingExperience: "A tour should focus on technical infrastructure, loading, production compatibility, parking, office/warehouse mix, and whether Fremont's manufacturing ecosystem justifies the location choice.",
      locationContext: "Warm Springs should be compared when industrial/flex users need more technical and manufacturing adjacency than Hayward or Union City, but more production utility than a conventional R&D office park.",
      advantages: [
        "Adds advanced manufacturing and hardware-oriented depth to the industrial/flex Building Profile set.",
        "Connects industrial utility with Silicon Valley supplier, workforce, and R&D geography.",
        "Creates a meaningful comparison between Moffett Park flex and I-880 warehouse districts.",
      ],
      tradeoffs: [
        "Technical capability cannot be assumed; power, ventilation, loading, and approvals require direct validation.",
        "The environment may be more specialized or costly than general warehouse districts for simple storage users.",
        "Customer-facing identity and walkability are weaker decision drivers than production and access.",
      ],
      operationalProfile: [
        { label: "Infrastructure", summary: "Power, ventilation, communications, and technical buildout should be verified before assuming production or R&D suitability." },
        { label: "Space configuration", summary: "Users should test how office, engineering, assembly, warehouse, and support areas work together." },
        { label: "Location and suppliers", summary: "Fremont's value is tied to hardware, manufacturing, supplier, and Silicon Valley access patterns." },
      ],
      environmentExplanation: {
        whyItExists: "Advanced manufacturing flex environments exist because hardware and production companies often need engineering, assembly, storage, and industrial access in one location.",
        whyChooseThisEnvironment: "Choose Warm Springs over Moffett Park when production and manufacturing adjacency matter more than pure R&D business-park identity.",
        representativeValue: "45101-45169 Industrial Dr gives the San Francisco metro an advanced manufacturing/flex benchmark.",
      },
      relatedDistricts: [
        { districtId: "moffett-park", reason: "Compare for a more R&D and business-park flex setting." },
        { districtId: "union-city-industrial", reason: "Compare for more general warehouse and manufacturing utility." },
      ],
      validationNotes: ["Verify power and technical infrastructure.", "Confirm production or assembly use approval.", "Validate loading, truck access, and parking.", "Review ventilation, hazardous-material, or special-use restrictions if relevant."],
      nearbyAlternatives: [
        { label: "46723 Lakeview Blvd", url: buildingPath("Fremont", "46723 Lakeview Blvd"), reason: "Useful when comparing another Warm Springs flex building with similar technology-industrial geography." },
        { label: "1195 Borregas Ave", url: buildingPath("Sunnyvale", "1195 Borregas Ave"), reason: "Compare when R&D business-park identity matters more than manufacturing utility." },
        { label: "1550 Pacific St", url: buildingPath("Union City", "1550 Pacific St"), reason: "Compare when a more general warehouse and manufacturing corridor may fit better." },
      ],
      representativeCompanies: ["Hardware, advanced manufacturing, robotics, R&D support, production, and technical operations businesses are the relevant categories; this does not imply current tenancy."],
      sourceNotes: ["Existing Rofo canonical record identifies 45101-45169 Industrial Dr as industrial space in Warm Springs Innovation District.", "The Warm Springs graph node supports advanced manufacturing, R&D/flex, highway access, power, and Silicon Valley adjacency relevance."],
    },
  }),
  record({
    name: "46723 Lakeview Blvd",
    address: "46723 Lakeview Blvd",
    city: "Fremont",
    districtKey: "warmSprings",
    buildingType: "Flex / R&D support building",
    primarySpaceType: "flex",
    editorialRole: "Flex Business Park Environment",
    editorialReason: "Represents Warm Springs' flex-business-park side for users that need office, technical, and operational space without a pure warehouse decision.",
    representativeThemes: ["Flex business park", "R&D support", "Warm Springs", "Office/operational mix"],
    businessFit: ["hardware support", "technical operations", "R&D support", "light assembly"],
    relatedDistrictPaths: [districts.moffettPark.path, districts.unionCityIndustrial.path, districts.westBerkeley.path],
    nearbyBuildingPaths: [
      buildingPath("Fremont", "45101-45169 Industrial Dr"),
      buildingPath("Fremont", "47697 Westinghouse Dr"),
      buildingPath("Fremont", "48860 Milmont Dr"),
    ],
    comparisonBuildingPaths: [
      buildingPath("Sunnyvale", "1195 Borregas Ave"),
      buildingPath("Berkeley", "1608 4th St"),
      buildingPath("Union City", "1550 Pacific St"),
    ],
    brief: {
      ecosystemSubtypes: ["flex", "small_bay_industrial", "research_development"],
      representativeRole: "flex_business_park",
      businessActivities: ["knowledge_work", "product_development", "assembly", "receiving", "shipping"],
      businessArchetypes: ["research_company", "startup", "light_manufacturer", "distributor"],
      operationalCharacteristics: ["office_warehouse_mix", "flexible_suite_sizes", "surface_parking", "freeway_access", "research_compatible"],
      fitSummary: "Useful for companies comparing office/flex and R&D support space in Fremont's innovation-industrial corridor.",
      summary: "46723 Lakeview Blvd helps explain the flex-business-park side of Warm Springs. It is useful for companies that need office, technical, assembly, storage, or support functions together, but do not want the search to become only a warehouse or only an office decision.",
      rofoTake: "This profile complements the heavier Warm Springs industrial example with a more flexible office/operational model.",
      snapshot: [
        { label: "Primary ecosystem", value: "Industrial / flex" },
        { label: "Business use", value: "Flex business park and R&D support" },
        { label: "District", value: "Warm Springs Innovation District" },
        { label: "Comparison role", value: "Office/operational flex alternative to heavier industrial space" },
        { label: "Validation focus", value: "Office/warehouse split, parking, technical requirements, and loading" },
      ],
      bestFit: [
        "Technical operations, hardware support, and R&D-adjacent teams needing both office and operational space.",
        "Companies comparing Warm Springs against Moffett Park or North San Jose for flex inventory.",
        "Light assembly or support users that need more practical space than a standard office building provides.",
      ],
      mayNotFit: [
        "Heavy warehouse users whose main need is truck court depth, trailer parking, or bulk storage.",
        "Businesses whose sales model depends on street visibility or high walk-in customer access.",
      ],
      buildingExperience: "A tour should test whether the building's office, support, storage, and operational areas match the team workflow, and whether parking and delivery logistics support daily use.",
      locationContext: "Warm Springs flex should be compared against Moffett Park when R&D identity matters, Union City when warehouse/manufacturing utility matters, and West Berkeley when maker identity matters.",
      advantages: [
        "Adds a flex-business-park example that is not simply a warehouse or office profile.",
        "Helps users evaluate mixed office, technical, and operational requirements.",
        "Supports comparison between Fremont, Sunnyvale, Union City, and Berkeley industrial/flex choices.",
      ],
      tradeoffs: [
        "Flex format may sacrifice warehouse efficiency for office or technical areas.",
        "R&D or assembly compatibility still depends on property systems and permitted use.",
        "The business-park setting may not deliver customer visibility or urban walkability.",
      ],
      operationalProfile: [
        { label: "Office and operational mix", summary: "The main fit question is whether office, technical, support, and storage functions are in the right proportion." },
        { label: "Delivery access", summary: "Receiving and shipping may be relevant, but the exact loading condition should be confirmed before relying on it." },
        { label: "Workforce access", summary: "Fremont's position should be tested against employee geography and supplier/customer movement." },
      ],
      environmentExplanation: {
        whyItExists: "Flex business parks exist because some companies need office, technical, assembly, and storage functions together without occupying a conventional warehouse.",
        whyChooseThisEnvironment: "Choose this Warm Springs flex model over Hayward warehouse space when office/technical balance matters more than pure industrial efficiency.",
        representativeValue: "46723 Lakeview Blvd distinguishes Warm Springs flex from heavier industrial and warehouse examples.",
      },
      relatedDistricts: [
        { districtId: "moffett-park", reason: "Compare for a more South Bay R&D business-park setting." },
        { districtId: "union-city-industrial", reason: "Compare for stronger warehouse and manufacturing utility." },
      ],
      validationNotes: ["Confirm office-to-operational area split.", "Verify loading and delivery access.", "Validate technical infrastructure and permitted use.", "Confirm parking allocation and signage or visitor needs."],
      nearbyAlternatives: [
        { label: "45101-45169 Industrial Dr", url: buildingPath("Fremont", "45101-45169 Industrial Dr"), reason: "Compare when the requirement leans more toward advanced manufacturing or industrial utility." },
        { label: "1195 Borregas Ave", url: buildingPath("Sunnyvale", "1195 Borregas Ave"), reason: "Compare when Sunnyvale R&D and Highway 101 access are more important." },
        { label: "1608 4th St", url: buildingPath("Berkeley", "1608 4th St"), reason: "Compare when smaller maker and service-industrial identity may fit better." },
      ],
      representativeCompanies: ["Technical operations, hardware support, R&D support, assembly, and office/warehouse businesses are the relevant categories; this does not imply current tenancy."],
      sourceNotes: ["Existing Rofo canonical record identifies 46723 Lakeview Blvd as flex space in Warm Springs Innovation District.", "The Warm Springs graph node supports flex, R&D, advanced manufacturing, parking, and freeway access relevance."],
    },
  }),
];

const westBerkeleyComparisonPaths = [
  districts.moffettPark.path,
  districts.haywardIndustrial.path,
  districts.warmSprings.path,
];

const westBerkeleySelectedBuildings = [
  {
    name: "2501 9th St",
    address: "2501 9th St",
    buildingType: "Small-bay industrial / flex",
    primarySpaceType: "industrial",
    role: "Ninth Street Industrial / Flex Benchmark",
    roleId: "ninth_street_industrial_flex_benchmark",
    use: "small-bay industrial and flex",
    themes: ["Small-bay industrial", "Ninth Street", "Maker operations", "Service industrial"],
    bestFor: ["industrial/flex users", "maker and operations businesses", "service-industrial teams"],
    contrast: "larger East Bay warehouse corridors",
    alternatives: ["2550 9th St", "2560 9th St", "950 Gilman St"],
  },
  {
    name: "2550 9th St",
    address: "2550 9th St",
    buildingType: "Flex / service building",
    primarySpaceType: "flex",
    role: "Ninth Street Service / Flex Benchmark",
    roleId: "ninth_street_service_flex_benchmark",
    use: "flex, service, and small production",
    themes: ["Flex", "Service commercial", "Small production", "Ninth Street"],
    bestFor: ["small production businesses", "flex users", "service-commercial operators"],
    contrast: "office-first Emeryville or Downtown Berkeley choices",
    alternatives: ["2501 9th St", "2560 9th St", "829 Heinz Ave"],
  },
  {
    name: "2560 9th St",
    address: "2560 9th St",
    buildingType: "Technical flex / production-adjacent",
    primarySpaceType: "flex",
    role: "Technical Flex Transition Benchmark",
    roleId: "technical_flex_transition_benchmark",
    use: "flex, R&D-support, and production-adjacent",
    themes: ["Technical flex", "R&D support", "Production-adjacent", "Ninth Street"],
    bestFor: ["flex and R&D-support users", "maker businesses", "production-adjacent companies"],
    contrast: "more campus-oriented South Bay R&D parks",
    alternatives: ["2550 9th St", "829 Heinz Ave", "717 Potter St"],
  },
  {
    name: "2600 10th St",
    address: "2600 10th St",
    buildingType: "Creative production / adaptive commercial",
    primarySpaceType: "flex",
    role: "Creative Production Benchmark",
    roleId: "creative_production_benchmark",
    use: "creative production, media, and adaptive commercial",
    themes: ["Creative production", "Media", "Adaptive commercial", "Maker district"],
    bestFor: ["creative production users", "media and studio businesses", "adaptive commercial teams"],
    contrast: "standard warehouse or conventional office environments",
    alternatives: ["829 Heinz Ave", "918 Parker St", "1608 4th St"],
  },
  {
    name: "2929 7th St",
    address: "2929 7th St",
    buildingType: "Waterfront-edge industrial / flex",
    primarySpaceType: "industrial",
    role: "Aquatic Park Industrial / Flex Benchmark",
    roleId: "aquatic_park_industrial_flex_benchmark",
    use: "west-side industrial and flex",
    themes: ["Industrial / flex", "Aquatic Park edge", "I-80 access", "West-side Berkeley"],
    bestFor: ["flex users", "operations-oriented businesses", "west-side industrial users"],
    contrast: "deeper Ninth Street or Heinz Avenue maker context",
    alternatives: ["950 Gilman St", "650 University Ave", "2501 9th St"],
  },
  {
    name: "3100 San Pablo Ave",
    address: "3100 San Pablo Ave",
    buildingType: "Service-commercial / flex corridor",
    primarySpaceType: "flex",
    role: "San Pablo Service-Commercial Benchmark",
    roleId: "san_pablo_service_commercial_benchmark",
    use: "service-commercial, showroom, and flex",
    themes: ["San Pablo corridor", "Service commercial", "Showroom", "Flex"],
    bestFor: ["service-commercial businesses", "showroom and flex users", "companies comparing Berkeley and Emeryville corridors"],
    contrast: "deeper industrial West Berkeley blocks",
    alternatives: ["650 University Ave", "918 Parker St", "1608 4th St"],
  },
  {
    name: "650 University Ave",
    address: "650 University Ave",
    buildingType: "University Avenue service / flex",
    primarySpaceType: "flex",
    role: "West-Side Berkeley Access Benchmark",
    roleId: "west_side_berkeley_access_benchmark",
    use: "west-side service commercial and office/flex",
    themes: ["University Avenue", "Service commercial", "Office/flex", "West-side access"],
    bestFor: ["service-commercial users", "office/flex businesses", "teams needing west-side Berkeley access"],
    contrast: "heavier industrial or downtown Berkeley settings",
    alternatives: ["3100 San Pablo Ave", "2929 7th St", "Downtown Berkeley"],
  },
  {
    name: "717 Potter St",
    address: "717 Potter St",
    buildingType: "Technical production / flex",
    primarySpaceType: "flex",
    role: "Potter Street Technical / Flex Benchmark",
    roleId: "potter_street_technical_flex_benchmark",
    use: "technical production and R&D-support",
    themes: ["Technical flex", "Production support", "Potter Street", "Research-adjacent"],
    bestFor: ["technical production users", "R&D-support teams", "maker businesses"],
    contrast: "generic office/flex buildings without production context",
    alternatives: ["829 Heinz Ave", "2560 9th St", "2600 10th St"],
  },
  {
    name: "829 Heinz Ave",
    address: "829 Heinz Ave",
    buildingType: "Heinz Avenue maker / flex",
    primarySpaceType: "flex",
    role: "Maker and R&D-Support Benchmark",
    roleId: "maker_and_r_and_d_support_benchmark",
    use: "maker, R&D-support, and light-industrial",
    themes: ["Heinz Avenue", "Maker", "Technical flex", "Light industrial"],
    bestFor: ["R&D-support users", "maker and production teams", "businesses needing Berkeley talent adjacency"],
    contrast: "larger warehouse corridors or polished office-first districts",
    alternatives: ["717 Potter St", "2560 9th St", "2600 10th St"],
  },
  {
    name: "918 Parker St",
    address: "918 Parker St",
    buildingType: "Parker Street production / flex",
    primarySpaceType: "flex",
    role: "Production / Service Flex Benchmark",
    roleId: "production_service_flex_benchmark",
    use: "production, flex, and service-commercial",
    themes: ["Parker Street", "Production", "Service flex", "Maker district"],
    bestFor: ["production users", "flex and service-commercial businesses", "teams evaluating West Berkeley practical buildings"],
    contrast: "heavier industrial corridors or customer-facing retail districts",
    alternatives: ["2600 10th St", "3100 San Pablo Ave", "829 Heinz Ave"],
  },
  {
    name: "950 Gilman St",
    address: "950 Gilman St",
    buildingType: "Gilman Street industrial / flex",
    primarySpaceType: "industrial",
    role: "Gilman Corridor Industrial / Flex Benchmark",
    roleId: "gilman_corridor_industrial_flex_benchmark",
    use: "industrial, flex, and service-commercial",
    themes: ["Gilman corridor", "Industrial / flex", "I-80 access", "Service commercial"],
    bestFor: ["industrial and flex users", "maker and production businesses", "teams comparing West Berkeley with Emeryville"],
    contrast: "larger I-880 warehouse corridors",
    alternatives: ["2501 9th St", "2929 7th St", "2600 10th St"],
  },
];

function westBerkeleyBrief(item) {
  const nearby = item.alternatives
    .map((label, index) => {
      if (label === "Downtown Berkeley") {
        return {
          label,
          url: "/commercial-real-estate/CA/berkeley/downtown-berkeley/",
          reason: "Compare when BART access, university adjacency, and walkable office or retail context matter more.",
        };
      }
      return {
        label,
        url: buildingPath("Berkeley", label),
        reason: [
          `Compare when a nearby ${label.split(" ").slice(1).join(" ")} option may better match the required operating layout.`,
          `Use this alternative when the search needs another West Berkeley reference with a different block, corridor, or access pattern.`,
          `Review this option when the business wants to test ${item.use} fit against another district example before widening the search.`,
        ][index % 3],
      };
    })
    .slice(0, 3);
  const useArticle = /^[aeiou]/i.test(item.use) ? "an" : "a";

  return record({
    name: item.name,
    address: item.address,
    city: "Berkeley",
    districtKey: "westBerkeley",
    buildingType: item.buildingType,
    primarySpaceType: item.primarySpaceType,
    editorialRole: item.role,
    editorialReason: `${item.name} represents West Berkeley's ${item.use} building pattern for businesses comparing Berkeley identity with practical operating needs.`,
    representativeThemes: item.themes,
    businessFit: item.bestFor,
    relatedDistrictPaths: westBerkeleyComparisonPaths,
    nearbyBuildingPaths: nearby.map((entry) => entry.url).filter((url) => url.includes("/building/")),
    comparisonBuildingPaths: [
      buildingPath("Berkeley", "1608 4th St"),
      buildingPath("Hayward", "2340 Industrial Pkwy W"),
      buildingPath("Fremont", "45101-45169 Industrial Dr"),
    ],
    brief: {
      ecosystemSubtypes: ["small_bay_industrial", "flex", "light_manufacturing"],
      representativeRole: item.roleId,
      businessActivities: ["service_dispatch", "equipment_storage", "receiving", "shipping", "light_manufacturing"],
      businessArchetypes: ["cabinet_shop", "creative_studio", "food_producer", "general_contractor", "light_manufacturer"],
      operationalCharacteristics: ["grade_level_loading", "small_suite_sizes", "service_vehicle_parking", "office_warehouse_mix", "freeway_access"],
      fitSummary: `Useful for ${item.use} users comparing West Berkeley against Emeryville, Hayward, Fremont, and other Bay Area industrial/flex options.`,
      summary: `${item.name} helps explain West Berkeley as ${useArticle} ${item.use} environment. The profile is useful for businesses that need Berkeley identity, I-80 access, maker or service context, and practical building validation without treating the search as a generic office or warehouse decision.`,
      rofoTake: `${item.name} matters because West Berkeley needs multiple concrete examples to explain its district pattern. This profile gives Rofo a ${item.role.toLowerCase()} for users comparing ${item.contrast} against Berkeley's smaller industrial, maker, and flex fabric.`,
      snapshot: [
        { label: "Primary ecosystem", value: "Industrial / flex" },
        { label: "Business use", value: item.use },
        { label: "District", value: "West Berkeley" },
        { label: "Evidence role", value: item.role },
        { label: "Access context", value: "Berkeley, I-80, Emeryville, and East Bay operating geography" },
        { label: "Validation focus", value: "Loading, parking, permitted use, utility needs, and actual suite condition" },
      ],
      bestFit: [
        `${item.bestFor[0]} that need a practical West Berkeley location with maker or service-operational context.`,
        `${item.bestFor[1]} comparing Berkeley identity against Emeryville, Hayward, Fremont, or South Bay flex alternatives.`,
        `${item.bestFor[2]} that need to validate how office, production, storage, receiving, or customer access fit together.`,
      ],
      mayNotFit: [
        "Users that need large-format logistics, trailer parking, heavy truck courts, or a more warehouse-oriented East Bay corridor.",
        "Client-facing office teams that need a polished downtown address, dense transit, or formal executive image.",
        "Specialized technical, food, production, or regulated users that cannot validate infrastructure and permitted use early.",
      ],
      buildingExperience: `A tour at ${item.name} should focus on the practical operating questions: office-to-work-area balance, loading or delivery access, parking, utility needs, visitor arrival, and whether West Berkeley's maker and service context helps the business.`,
      locationContext: `${item.name} sits within West Berkeley's industrial/flex geography, where users compare Ninth Street, Gilman, Heinz, San Pablo, University Avenue, and west-side Berkeley access. It should be evaluated against Emeryville for business-park structure, Hayward for warehouse utility, and Downtown Berkeley when transit and university adjacency matter more.`,
      advantages: [
        `Adds ${item.use} evidence to the West Berkeley Building Evidence collection.`,
        "Connects Berkeley identity with practical industrial/flex, service, maker, or production-adjacent decision-making.",
        "Creates a concrete comparison point against Emeryville business parks, Hayward industrial space, and South Bay R&D/flex alternatives.",
      ],
      tradeoffs: [
        "The profile does not establish current availability, suite condition, rent, tenant suitability, or final operating fit.",
        "Loading, parking, power, ventilation, signage, and permitted use vary by building and must be verified directly.",
        "West Berkeley's mixed industrial character may be less useful for users that need pure warehouse utility or a conventional office environment.",
      ],
      operationalProfile: [
        { label: "Space configuration", summary: "Test how office, production, storage, receiving, and support areas divide within the actual space." },
        { label: "Access and movement", summary: "Validate I-80 access, deliveries, service vehicles, parking, and visitor arrival against the business workflow." },
        { label: "Use validation", summary: "Confirm permitted use, utilities, ventilation, noise, loading, and any special operational requirements before shortlisting." },
      ],
      environmentExplanation: {
        whyItExists: "West Berkeley industrial/flex environments exist because maker, service, production, food, creative, and technical users often need modest practical buildings near Berkeley customers, talent, and I-80 access.",
        whyChooseThisEnvironment: `Choose this environment when Berkeley identity and practical small-building utility matter more than ${item.contrast}.`,
        representativeValue: `${item.name} gives West Berkeley a ${item.role.toLowerCase()} inside the district evidence set.`,
      },
      relatedDistricts: [
        { districtId: "emeryville-commercial-core", reason: "Compare for more business-park structure and office/life-science support context." },
        { districtId: "hayward-industrial", reason: "Compare for stronger warehouse, distribution, and I-880 service-industrial utility." },
      ],
      validationNotes: [
        "Confirm permitted use for the specific business activity.",
        "Verify loading, delivery access, parking allocation, and service-vehicle rules.",
        "Validate power, ventilation, utility, noise, and any production or food-related requirements.",
        "Confirm current suite condition, layout, signage, visitor arrival, and buildout responsibility.",
      ],
      nearbyAlternatives: nearby,
      representativeCompanies: ["Maker, service, creative-production, food-production, technical-support, and light-manufacturing businesses are the relevant categories; this does not imply current tenancy."],
      sourceNotes: [
        `Existing Rofo representative-building page expansion identifies ${item.name} as a West Berkeley ${item.use} reference.`,
        "The West Berkeley Knowledge Graph node supports industrial, flex, light-manufacturing, maker, service-dispatch, customer-showroom, and knowledge-work relevance.",
      ],
    },
  });
}

records.push(...westBerkeleySelectedBuildings.map(westBerkeleyBrief));

module.exports = {
  canonicalBuildings: records,
};
