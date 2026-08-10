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

function buildingPath(state, citySlug, address) {
  return `/commercial-real-estate/building/${state}/${citySlug}/${slugify(address)}/`;
}

const districts = {
  indianapolisAirportLogistics: {
    id: "in-indianapolis-airport-logistics",
    name: "Indianapolis Airport Logistics",
    slug: "indianapolis-airport-logistics",
    city: "Indianapolis",
    citySlug: "indianapolis",
    state_abbr: "IN",
    area_type: "industrial_area",
    path: "/commercial-real-estate/IN/indianapolis/indianapolis-airport-logistics/",
    workplaceCharacter: "Airport and highway-oriented industrial foundation where warehouse, distribution, storage, and service-operational users should validate loading, circulation, and regional access property by property.",
    neighborhoodCharacter: "Operational Indianapolis logistics geography where building function, access, and movement matter more than customer-facing district character.",
    transit: "Airport and highway access are stronger decision drivers than pedestrian access; employee, truck, supplier, and customer routes should be tested against the actual operating territory.",
    parking: "Parking, truck access, trailer movement, and yard needs are property-specific and should be validated before shortlisting.",
    amenities: "Amenities are secondary to operational fit; evaluate employee convenience by shift pattern, commute geography, and service routes.",
  },
  tempeI10Industrial: {
    id: "az-tempe-i-10-industrial",
    name: "Tempe I-10 Industrial",
    slug: "tempe-i-10-industrial",
    city: "Tempe",
    citySlug: "tempe",
    state_abbr: "AZ",
    area_type: "industrial_area",
    path: "/commercial-real-estate/AZ/tempe/tempe-i-10-industrial/",
    workplaceCharacter: "Central Phoenix metro industrial foundation where Tempe access, I-10 movement, office/warehouse utility, and broader Valley alternatives shape fit.",
    neighborhoodCharacter: "Operational Tempe commercial setting where warehouse, service, maker, and office/warehouse uses should be validated against the exact building rather than assumed from citywide demand.",
    transit: "I-10 and central metro access are the primary location story; compare employee, customer, vendor, and delivery routes against Phoenix, Mesa, and Chandler alternatives.",
    parking: "Parking, truck movement, loading, and yard suitability vary by property and should be verified before a user treats Tempe as the right industrial geography.",
    amenities: "Tempe amenities may help employees, but operational access and property functionality remain the main validation points for industrial users.",
  },
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
    summary: "Compare options by operating needs, total occupancy cost, access, buildout, and future flexibility.",
  },
  {
    title: "Tenant Improvements",
    url: "/commercial-real-estate/lease-guide/tenant-improvements/",
    summary: "Pressure-test buildout scope, utility requirements, timing, landlord approvals, and improvement responsibility.",
  },
];

function industrialBrief(fields) {
  const snapshot = fields.snapshot || [];
  const bestFit = fields.bestFit || [];
  const locationContext = fields.locationContext || "";

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
    operationalProfile: fields.operationalProfile,
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
    locationContext,
    districtContext: locationContext,
    advantages: fields.advantages || [],
    tradeoffs: fields.tradeoffs || [],
    validationNotes: fields.validationNotes || [],
    validationChecklist: fields.validationNotes || [],
    nearbyDistricts: fields.nearbyDistricts || [],
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
  const path = buildingPath(canonicalDistrict.state_abbr, canonicalDistrict.citySlug, fields.address);
  const brief = industrialBrief(fields.brief);

  return {
    id: `${canonicalDistrict.state_abbr.toLowerCase()}-${canonicalDistrict.citySlug}-${slugify(fields.address)}`,
    building_path: path,
    identity: {
      name: fields.name,
      address: fields.address,
      city: canonicalDistrict.city,
      state_abbr: canonicalDistrict.state_abbr,
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
      companySizes: fields.companySizes || ["small and mid-sized businesses", "operations teams", "warehouse, service, and distribution users"],
    },
    experience: {
      workplaceCharacter: canonicalDistrict.workplaceCharacter,
      neighborhoodCharacter: canonicalDistrict.neighborhoodCharacter,
      executivePresence: "low",
      innovationScore: fields.innovationScore || "moderate",
    },
    operations: {
      transit: canonicalDistrict.transit,
      parking: canonicalDistrict.parking,
      amenities: canonicalDistrict.amenities,
      foodEnvironment: "Food and service amenities are secondary to operational access and should be evaluated by employee schedule.",
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
    quality: {
      sourceConfidence: fields.sourceConfidence || "medium",
      publicationStatus: "published",
      sourceBasis: fields.sourceBasis || "Warehouse / Industrial Search Mission evidence catch-up",
    },
    buildingBrief: brief,
  };
}

const indyPath = (address) => buildingPath("IN", "indianapolis", address);
const tempePath = (address) => buildingPath("AZ", "tempe", address);

const records = [
  record({
    districtKey: "indianapolisAirportLogistics",
    name: "558 Airtech Parkway",
    address: "558 Airtech Parkway",
    buildingType: "Large-format airport logistics industrial",
    editorialRole: "Airport Logistics Industrial Benchmark",
    editorialReason: "Anchors Indianapolis Airport Logistics with a large-format industrial example for warehouse, distribution, storage, and airport-oriented operating comparisons.",
    representativeThemes: ["Airport logistics", "Warehouse", "Distribution", "Indianapolis industrial foundation"],
    businessFit: ["warehouse", "distribution", "storage", "service-industrial operations"],
    nearbyBuildingPaths: [indyPath("4557 W Bradbury Ave"), indyPath("7601 Winton Dr")],
    comparisonBuildingPaths: [indyPath("4557 W Bradbury Ave"), indyPath("7601 Winton Dr")],
    sourceBasis: "Indianapolis Airport Logistics Commercial Market Evidence catch-up",
    brief: {
      ecosystemSubtypes: ["warehouse_distribution_environment", "airport_logistics", "large_format_industrial"],
      representativeRole: "airport_logistics_benchmark",
      businessArchetypes: ["warehouse_user", "distribution_business", "logistics_operator", "service_industrial_business"],
      businessActivities: ["storage", "distribution", "receiving", "shipping", "operations"],
      operationalCharacteristics: ["large_format_space", "airport_area_access", "truck_access_validation", "loading_validation", "parking_validation"],
      fitSummary: "Best for warehouse and distribution users that need an Indianapolis airport-logistics reference point.",
      summary: "558 Airtech Parkway is an Indianapolis Airport Logistics Building Profile for businesses comparing large-format warehouse, distribution, storage, or airport-oriented industrial needs. It is useful as a foundation benchmark, while loading, circulation, yard, clear height, and current suite fit still require property-level validation.",
      rofoTake: "This profile matters because Indianapolis warehouse demand needs a concrete airport-logistics example before Rofo can responsibly move into broader industrial guidance. 558 Airtech Parkway gives operators a large-format reference for testing whether airport and highway context solve the requirement before comparing other west-side industrial buildings.",
      snapshot: [
        { label: "Market", value: "Indianapolis" },
        { label: "District", value: "Indianapolis Airport Logistics" },
        { label: "Building type", value: "Industrial / warehouse" },
        { label: "Size context", value: "Large-format spaces" },
        { label: "Evidence role", value: "Airport logistics benchmark" },
        { label: "Best comparison use", value: "Warehouse and distribution requirements" },
      ],
      bestFit: [
        "Warehouse and distribution users that need Indianapolis airport or highway logistics context.",
        "Storage, receiving, shipping, or service-operational teams comparing larger industrial footprints.",
        "Operators validating whether airport-area geography should lead the search before expanding to other Indianapolis alternatives.",
      ],
      mayNotFit: [
        "Small service users that do not need large-format industrial context.",
        "Office-heavy users whose primary requirement is workplace image or client-facing access.",
        "Users that require confirmed loading, trailer parking, clear height, or live availability before shortlisting.",
      ],
      buildingExperience: "Expect an industrial evaluation centered on operational fit: access, loading, circulation, space format, and the relationship between airport-area geography and the user's service territory.",
      locationContext: "558 Airtech Parkway anchors Indianapolis Airport Logistics as a foundation-stage warehouse and distribution geography. Compare it with 4557 W Bradbury Ave for broader west-side industrial utility and 7601 Winton Dr when larger warehouse context remains important.",
      advantages: [
        "Adds a large-format industrial benchmark to Indianapolis warehouse evidence.",
        "Helps connect airport-oriented geography with warehouse and distribution search intent.",
        "Supports a clearer comparison path before broader Indianapolis industrial districts are built.",
      ],
      tradeoffs: [
        "Representative status does not imply current availability or technical suitability.",
        "Large-format evidence may exceed smaller service-industrial requirements.",
        "Property-level loading, clear height, yard, power, and permitted use still need validation.",
      ],
      validationNotes: [
        "Confirm loading configuration, clear height, truck circulation, and trailer or yard requirements.",
        "Validate whether airport and highway access improve the actual customer, supplier, and labor routes.",
        "Check current suite size, condition, office/warehouse mix, parking, and permitted use.",
        "Compare against 4557 W Bradbury Ave and 7601 Winton Dr before assuming one building format represents the full market.",
      ],
      nearbyAlternatives: [
        { label: "4557 W Bradbury Ave", url: indyPath("4557 W Bradbury Ave"), reason: "Compare when the search needs another Indianapolis industrial reference for practical warehouse or service-operational utility." },
        { label: "7601 Winton Dr", url: indyPath("7601 Winton Dr"), reason: "Compare when larger warehouse, storage, or distribution scale is a stronger question than airport identity." },
        { label: "How to Compare Commercial Spaces", url: "/commercial-real-estate/lease-guide/how-to-compare-commercial-spaces/", reason: "Use operating needs, access, buildout, and future flexibility before treating any representative building as a fit." },
      ],
      representativeCompanies: [
        "Warehouse operators that need airport/logistics context plus property-level loading validation.",
        "Distribution businesses that need to compare building format against route and service-territory requirements.",
      ],
      sourceNotes: [
        "Rofo canonical building data identifies the address, Indianapolis location, industrial type, and large-format size context.",
        "Indianapolis Airport Logistics CME selects the property as an airport-logistics benchmark.",
      ],
    },
  }),
  record({
    districtKey: "indianapolisAirportLogistics",
    name: "4557 W Bradbury Ave",
    address: "4557 W Bradbury Ave",
    buildingType: "Large-format industrial / service-industrial",
    editorialRole: "Indianapolis Warehouse / Industrial Depth",
    editorialReason: "Broadens Indianapolis Airport Logistics beyond the airport-named Airtech example with another source-selected industrial reference.",
    representativeThemes: ["Warehouse", "Service industrial", "West-side Indianapolis operations", "Industrial depth"],
    businessFit: ["warehouse", "service-industrial", "distribution", "operations"],
    nearbyBuildingPaths: [indyPath("558 Airtech Parkway"), indyPath("7601 Winton Dr")],
    comparisonBuildingPaths: [indyPath("558 Airtech Parkway"), indyPath("7601 Winton Dr")],
    sourceBasis: "Indianapolis Airport Logistics Commercial Market Evidence catch-up",
    brief: {
      ecosystemSubtypes: ["warehouse", "service_industrial", "large_format_industrial"],
      representativeRole: "warehouse_industrial_depth",
      businessArchetypes: ["warehouse_user", "service_industrial_business", "local_distribution_user", "operations_team"],
      businessActivities: ["storage", "dispatch", "receiving", "local_distribution", "operations"],
      operationalCharacteristics: ["large_format_space", "west_side_industrial_context", "loading_validation", "parking_validation", "service_territory_validation"],
      fitSummary: "Best for warehouse or service-industrial users comparing practical Indianapolis industrial utility.",
      summary: "4557 W Bradbury Ave is an Indianapolis Airport Logistics Building Profile for warehouse, service-industrial, distribution, and operations users. It helps Rofo explain west-side Indianapolis industrial depth while keeping building-specific loading, parking, condition, use approval, and current availability as validation topics.",
      rofoTake: "This profile matters because Indianapolis Airport Logistics should not rely on one airport-named building to explain industrial fit. 4557 W Bradbury Ave gives operators a second large-format reference for comparing warehouse and service-industrial utility before deeper Indianapolis submarket work is ready.",
      snapshot: [
        { label: "Market", value: "Indianapolis" },
        { label: "District", value: "Indianapolis Airport Logistics" },
        { label: "Building type", value: "Industrial / warehouse" },
        { label: "Size context", value: "Large-format spaces" },
        { label: "Evidence role", value: "Warehouse / industrial depth" },
        { label: "Best comparison use", value: "Service-industrial and warehouse fit" },
      ],
      bestFit: [
        "Warehouse and service-industrial users that need practical Indianapolis operating geography.",
        "Distribution or storage teams comparing a west-side industrial location against airport-logistics alternatives.",
        "Businesses that need a concrete property benchmark before requesting current warehouse opportunities.",
      ],
      mayNotFit: [
        "Client-facing office users or retail users whose needs are not operational.",
        "Very small users that may not need large-format industrial context.",
        "Users whose requirements depend on unverified technical features such as loading, power, yard, or clear height.",
      ],
      buildingExperience: "The evaluation should focus on industrial utility rather than image: route fit, loading, truck access, warehouse/service mix, parking, and whether the building format supports the intended operation.",
      locationContext: "4557 W Bradbury Ave adds depth to Indianapolis Airport Logistics by showing another industrial reference beyond 558 Airtech Parkway. Compare it with 7601 Winton Dr for scale and with 558 Airtech Parkway for airport-logistics framing.",
      advantages: [
        "Provides a second Indianapolis industrial benchmark for warehouse and service users.",
        "Helps separate practical industrial utility from broader citywide commercial search demand.",
        "Supports future district comparison work without publishing unsupported business guides.",
      ],
      tradeoffs: [
        "Representative evidence is not a claim about current availability or suite condition.",
        "Building format may not fit users needing specialized power, yard, clear height, or trailer circulation.",
        "Broader Indianapolis industrial submarkets still require separate source-supported research.",
      ],
      validationNotes: [
        "Confirm loading, parking, truck movement, clear height, office/warehouse mix, and permitted use.",
        "Validate whether the location supports customer, supplier, labor, and service-territory routes.",
        "Compare the building against 558 Airtech Parkway and 7601 Winton Dr for scale and operating fit.",
        "Check whether the requirement is local service, storage, distribution, or a different industrial use.",
      ],
      nearbyAlternatives: [
        { label: "558 Airtech Parkway", url: indyPath("558 Airtech Parkway"), reason: "Compare when airport-logistics identity and larger-format distribution context matter more than general west-side industrial utility." },
        { label: "7601 Winton Dr", url: indyPath("7601 Winton Dr"), reason: "Compare when larger warehouse, storage, or distribution scale is the central requirement." },
        { label: "Choosing the Right Commercial Location", url: "/commercial-real-estate/lease-guide/choosing-the-right-commercial-location/", reason: "Use access, operations, employees, customers, and validation needs before narrowing the building list." },
      ],
      representativeCompanies: [
        "Service-industrial businesses that need storage, dispatch, receiving, and practical route validation.",
        "Local distribution users that need to test west-side Indianapolis utility against airport logistics access.",
      ],
      sourceNotes: [
        "Rofo canonical building data identifies the address, Indianapolis location, industrial type, and large-format size context.",
        "Indianapolis Airport Logistics CME selects the property as warehouse / industrial depth.",
      ],
    },
  }),
  record({
    districtKey: "indianapolisAirportLogistics",
    name: "7601 Winton Dr",
    address: "7601 Winton Dr",
    buildingType: "Large-format warehouse / industrial",
    editorialRole: "Large-Format Indianapolis Warehouse Depth",
    editorialReason: "Adds a larger warehouse-oriented Indianapolis reference for distribution, storage, and scale-sensitive industrial users.",
    representativeThemes: ["Large-format warehouse", "Distribution", "Storage", "Indianapolis industrial depth"],
    businessFit: ["warehouse", "distribution", "storage", "regional operations"],
    nearbyBuildingPaths: [indyPath("558 Airtech Parkway"), indyPath("4557 W Bradbury Ave")],
    comparisonBuildingPaths: [indyPath("558 Airtech Parkway"), indyPath("4557 W Bradbury Ave")],
    sourceBasis: "Indianapolis Airport Logistics Commercial Market Evidence catch-up",
    brief: {
      ecosystemSubtypes: ["warehouse_distribution_environment", "large_format_industrial", "storage"],
      representativeRole: "large_format_warehouse_depth",
      businessArchetypes: ["warehouse_user", "distribution_business", "storage_user", "regional_operations_team"],
      businessActivities: ["storage", "distribution", "receiving", "shipping", "regional_operations"],
      operationalCharacteristics: ["large_format_space", "warehouse_scale_context", "loading_validation", "trailer_movement_validation", "regional_access_validation"],
      fitSummary: "Best for warehouse, storage, and distribution users comparing larger Indianapolis industrial needs.",
      summary: "7601 Winton Dr is an Indianapolis Airport Logistics Building Profile for larger warehouse, storage, and distribution-oriented requirements. It helps a business test whether Indianapolis can support scale-sensitive industrial needs while still validating loading, clear height, trailer movement, parking, condition, and current availability.",
      rofoTake: "This profile matters because larger industrial search demand should not be collapsed into one generic warehouse category. 7601 Winton Dr gives Rofo a scale-oriented Indianapolis benchmark that can be compared against 558 Airtech Parkway and 4557 W Bradbury Ave before broader submarket guidance is published.",
      snapshot: [
        { label: "Market", value: "Indianapolis" },
        { label: "District", value: "Indianapolis Airport Logistics" },
        { label: "Building type", value: "Industrial / warehouse" },
        { label: "Size context", value: "Large-format spaces" },
        { label: "Evidence role", value: "Large-format warehouse depth" },
        { label: "Best comparison use", value: "Distribution and storage scale" },
      ],
      bestFit: [
        "Warehouse, storage, and distribution users evaluating larger-format Indianapolis industrial options.",
        "Operations teams that need to test scale before comparing other airport or west-side alternatives.",
        "Users whose requirements depend on route fit, building format, and technical validation rather than office image.",
      ],
      mayNotFit: [
        "Small service users that do not need larger warehouse context.",
        "Office-heavy or customer-facing users whose fit depends on image, walkability, or polished reception.",
        "Users that need confirmed technical infrastructure before treating the building as viable.",
      ],
      buildingExperience: "The building should be evaluated as a scale and operations question: warehouse format, loading, truck movement, parking, distribution routes, and how the requirement compares with smaller industrial alternatives.",
      locationContext: "7601 Winton Dr gives Indianapolis Airport Logistics a scale-sensitive warehouse benchmark. Use it alongside 558 Airtech Parkway for airport-logistics context and 4557 W Bradbury Ave for broader industrial utility.",
      advantages: [
        "Adds larger-format warehouse depth to the Indianapolis industrial foundation.",
        "Helps distinguish storage and distribution needs from smaller service-industrial requirements.",
        "Creates a stronger evidence base before broader Indianapolis industrial guidance is attempted.",
      ],
      tradeoffs: [
        "A large-format benchmark may not fit smaller operational users.",
        "Representative evidence does not establish loading, clear height, trailer parking, or current availability.",
        "The airport-logistics foundation does not yet replace full Indianapolis industrial submarket coverage.",
      ],
      validationNotes: [
        "Confirm current suite size, loading, clear height, truck circulation, trailer movement, and parking.",
        "Validate whether the user's operation is storage, distribution, local service, or another industrial use.",
        "Compare against 558 Airtech Parkway and 4557 W Bradbury Ave before assuming scale is the main requirement.",
        "Check permitted use, building condition, timing, and operational constraints before touring.",
      ],
      nearbyAlternatives: [
        { label: "558 Airtech Parkway", url: indyPath("558 Airtech Parkway"), reason: "Compare when airport-logistics identity and route context are more important than the larger warehouse benchmark." },
        { label: "4557 W Bradbury Ave", url: indyPath("4557 W Bradbury Ave"), reason: "Compare when practical west-side industrial utility matters more than larger storage or distribution scale." },
        { label: "How to Compare Commercial Spaces", url: "/commercial-real-estate/lease-guide/how-to-compare-commercial-spaces/", reason: "Use operating needs, total occupancy cost, access, buildout, and flexibility before selecting a building." },
      ],
      representativeCompanies: [
        "Storage users that need scale and building-format validation before shortlisting.",
        "Distribution businesses that need route, loading, trailer, and regional access validation.",
      ],
      sourceNotes: [
        "Rofo canonical building data identifies the address, Indianapolis location, industrial type, and large-format size context.",
        "Indianapolis Airport Logistics CME selects the property as large-format warehouse depth.",
      ],
    },
  }),
  record({
    districtKey: "tempeI10Industrial",
    name: "6840 S Harl Ave",
    address: "6840 S Harl Ave",
    buildingType: "Large-format Tempe industrial / office-warehouse",
    editorialRole: "Initial Tempe Industrial Building Anchor",
    editorialReason: "Provides the first migrated Tempe industrial Building Profile for warehouse, office/warehouse, and service-operational comparison.",
    representativeThemes: ["Tempe industrial foundation", "Warehouse", "Office/warehouse", "Central Phoenix metro access"],
    businessFit: ["warehouse", "office/warehouse", "service-industrial", "local operations"],
    sourceBasis: "Tempe I-10 Industrial Commercial Market Evidence catch-up",
    brief: {
      ecosystemSubtypes: ["warehouse", "office_warehouse_mix", "service_industrial", "large_format_industrial"],
      representativeRole: "initial_industrial_building_anchor",
      businessArchetypes: ["warehouse_user", "office_warehouse_user", "service_industrial_business", "local_operations_team"],
      businessActivities: ["storage", "dispatch", "receiving", "service_operations", "office_warehouse_operations"],
      operationalCharacteristics: ["large_format_space", "tempe_access", "i10_context", "loading_validation", "broader_valley_comparison"],
      fitSummary: "Best for users validating Tempe-specific industrial or office/warehouse fit before widening to Phoenix-area alternatives.",
      summary: "6840 S Harl Ave is a Tempe I-10 Industrial Building Profile for warehouse, office/warehouse, service-industrial, and local operations users. It anchors a cautious Tempe foundation while leaving loading, truck access, parking, yard, permitted use, and broader Phoenix metro comparisons as required validation steps.",
      rofoTake: "This profile matters because Tempe has visible industrial search demand but thin representative-property depth. 6840 S Harl Ave gives Rofo one concrete industrial benchmark, enough to orient early Tempe warehouse work without implying complete market coverage or current availability.",
      snapshot: [
        { label: "Market", value: "Tempe" },
        { label: "District", value: "Tempe I-10 Industrial" },
        { label: "Building type", value: "Industrial / office-warehouse" },
        { label: "Size context", value: "Large-format spaces" },
        { label: "Evidence role", value: "Initial industrial building anchor" },
        { label: "Best comparison use", value: "Tempe-specific industrial validation" },
      ],
      bestFit: [
        "Warehouse, office/warehouse, and service-industrial users that specifically need Tempe or central Phoenix metro access.",
        "Operators validating whether Tempe can work before comparing Phoenix, Mesa, or Chandler industrial alternatives.",
        "Teams that need one concrete Tempe benchmark while recognizing the local evidence set is still thin.",
      ],
      mayNotFit: [
        "Users that need a broad multi-building Tempe industrial shortlist today.",
        "Large logistics users that may need deeper Phoenix-area industrial corridors.",
        "Office-only users whose requirement is better evaluated through Tempe's office or tech-oriented nodes.",
      ],
      buildingExperience: "The evaluation should focus on whether Tempe location utility and building functionality fit the operation: loading, access, office/warehouse mix, parking, service territory, and comparison against other Valley industrial geographies.",
      locationContext: "6840 S Harl Ave anchors Tempe I-10 Industrial as a foundation-stage industrial geography. It should be compared against broader Phoenix, Mesa, and Chandler industrial alternatives when the user needs more warehouse depth or a larger set of representative options.",
      advantages: [
        "Creates a concrete Building Profile for Tempe warehouse and office/warehouse searches.",
        "Connects Tempe industrial demand to a bounded I-10-oriented foundation.",
        "Keeps broader Phoenix metro industrial alternatives visible instead of overstating Tempe coverage.",
      ],
      tradeoffs: [
        "One Building Profile is not enough for broad Tempe industrial guidance.",
        "Representative status does not imply live availability or technical suitability.",
        "Larger logistics or yard-heavy users may need broader Phoenix-area alternatives.",
      ],
      validationNotes: [
        "Confirm loading, truck access, parking, yard, clear height, office/warehouse mix, and permitted use.",
        "Validate whether Tempe specifically solves customer, labor, vendor, and service-territory needs.",
        "Compare Phoenix, Mesa, and Chandler industrial alternatives if the requirement needs more depth.",
        "Check current suite condition, timing, and operational constraints before treating the building as a fit.",
      ],
      nearbyAlternatives: [
        { label: "Choosing the Right Commercial Location", url: "/commercial-real-estate/lease-guide/choosing-the-right-commercial-location/", reason: "Use operating fit and validation needs before narrowing the search." },
        { label: "How to Compare Commercial Spaces", url: "/commercial-real-estate/lease-guide/how-to-compare-commercial-spaces/", reason: "Compare candidate spaces by operations, cost, access, buildout, and flexibility." },
        { label: "Tenant Improvements", url: "/commercial-real-estate/lease-guide/tenant-improvements/", reason: "Validate buildout scope, utility requirements, timing, landlord approvals, and improvement responsibility before committing." },
      ],
      representativeCompanies: [
        "Office/warehouse users that need Tempe access plus building-level function validation.",
        "Service-industrial businesses that need dispatch, storage, route, and customer geography fit.",
      ],
      sourceNotes: [
        "Rofo canonical building data identifies the address, Tempe location, industrial type, and large-format size context.",
        "Tempe I-10 Industrial CME selects the property as the initial industrial building anchor.",
      ],
    },
  }),
];

module.exports = {
  canonicalBuildings: records,
};
