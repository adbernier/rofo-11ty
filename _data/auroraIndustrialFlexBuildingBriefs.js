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

function buildingPath(address) {
  return `/commercial-real-estate/building/CO/aurora/${slugify(address)}/`;
}

const auroraI70AirportIndustrial = {
  id: "co-aurora-i-70-airport-industrial",
  name: "Aurora I-70 / Airport Industrial",
  slug: "aurora-i-70-airport-industrial",
  city: "Aurora",
  state_abbr: "CO",
  area_type: "industrial_area",
  path: "/commercial-real-estate/CO/aurora/aurora-i-70-airport-industrial/",
};

const relatedDistricts = [
  {
    label: "Northeast Denver Industrial",
    url: "/commercial-real-estate/CO/denver/northeast-denver-industrial/",
    reason: "Compare when Denver-side I-70 access and a deeper warehouse corridor matter more than Aurora-specific geography.",
  },
  {
    label: "Commerce City",
    url: "/commercial-real-estate/CO/commerce-city/commerce-city/",
    reason: "Compare when heavier industrial, yard, manufacturing, or north/east freight context is central to the search.",
  },
  {
    label: "Denver Airport / Pena Boulevard Corridor",
    url: "/commercial-real-estate/CO/denver/denver-airport-pena-boulevard-corridor/",
    reason: "Compare when airport proximity and Pena Boulevard movement are stronger requirements than local Aurora coverage.",
  },
];

const handbookTopics = [
  {
    title: "Choosing the Right Commercial Location",
    url: "/commercial-real-estate/lease-guide/choosing-the-right-commercial-location/",
    summary: "Use access, customers, employees, operations, and validation needs before narrowing the building list.",
  },
  {
    title: "How to Compare Commercial Spaces",
    url: "/commercial-real-estate/lease-guide/how-to-compare-commercial-spaces/",
    summary: "Compare options by operating needs, total occupancy cost, access, buildout, and future flexibility.",
  },
  {
    title: "Tenant Improvements",
    url: "/commercial-real-estate/lease-guide/tenant-improvements/",
    summary: "Pressure-test buildout scope, timing, landlord approvals, and improvement responsibility.",
  },
];

function industrialBrief(fields) {
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
      relatedDistricts,
    },
    evidence: {
      confidence: fields.confidence || "editorially_supported",
      provenance: {
        ecosystem: "commercial-market-evidence",
        operationalCharacteristics: "district-and-building-profile",
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
    nearbyDistricts: relatedDistricts,
    nearbyAlternatives: fields.nearbyAlternatives || [],
    relatedInsights: handbookTopics,
    representativeCompanies: fields.representativeCompanies || [],
    ecosystemSubtypes: fields.ecosystemSubtypes,
    representativeRole: fields.representativeRole,
    businessActivities: fields.businessActivities,
    businessArchetypes: fields.businessArchetypes,
    operationalCharacteristics: fields.operationalCharacteristics || [],
    fitSummary: fields.fitSummary,
    confidence: fields.confidence || "editorially_supported",
    sourceNotes: fields.sourceNotes || [],
  };
}

function record(fields) {
  const path = buildingPath(fields.address);
  const brief = industrialBrief(fields.brief);

  return {
    id: `co-aurora-${slugify(fields.address)}`,
    building_path: path,
    identity: {
      name: fields.name,
      address: fields.address,
      city: "Aurora",
      state_abbr: "CO",
      district: auroraI70AirportIndustrial.name,
      canonicalDistrict: auroraI70AirportIndustrial,
      secondaryDistricts: fields.secondaryDistricts || [],
      buildingType: fields.buildingType || "Industrial / flex",
      primarySpaceType: "industrial",
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
      companySizes: fields.companySizes || ["small and mid-sized businesses", "operations teams", "warehouse and service users"],
    },
    experience: {
      workplaceCharacter: "East-metro industrial and service-commercial setting where Aurora access, storage, dispatch, and airport-side movement shape fit.",
      neighborhoodCharacter: "Foundation-stage industrial geography where operating requirements matter more than polished office identity.",
      executivePresence: "low",
      innovationScore: "moderate",
    },
    operations: {
      transit: "Aurora and east Denver metro access are the main location story; employee, vendor, and delivery routes should be checked against the actual operating territory.",
      parking: "Employee parking, service-vehicle parking, loading, and trailer movement are property-specific validation items.",
      amenities: "Nearby amenities are secondary to operating access and should be evaluated by shift pattern, customer visits, and employee commute needs.",
      foodEnvironment: "Food and services are practical considerations rather than the primary reason to choose this environment.",
    },
    tradeoffs: {
      strengths: brief.advantages,
      limitations: brief.tradeoffs,
      businessesThatShouldCompare: brief.mayNotFit,
      nearbyAlternatives: relatedDistricts.map((item) => item.url),
    },
    validation: {
      questionsToValidate: brief.validationNotes,
      tourObservations: brief.validationNotes.slice(0, 3),
    },
    relationships: {
      nearbyBuildings: (fields.nearbyBuildingPaths || []).slice(0, 5),
      comparisonBuildings: (fields.comparisonBuildingPaths || []).slice(0, 5),
      relatedDistricts: relatedDistricts.map((item) => item.url),
    },
    quality: {
      sourceConfidence: fields.sourceConfidence || "medium",
      publicationStatus: "published",
      sourceBasis: "Aurora I-70 / Airport Industrial Commercial Market Evidence catch-up",
    },
    buildingBrief: brief,
  };
}

const records = [
  record({
    name: "3250 Abilene St",
    address: "3250 Abilene St",
    buildingType: "Large-format industrial",
    editorialRole: "Large-Format Aurora Industrial Benchmark",
    editorialReason: "Anchors Aurora I-70 / Airport Industrial with a larger-format industrial example for warehouse, distribution, and service-operational comparison.",
    representativeThemes: ["Warehouse", "Distribution", "Large-format industrial", "East-metro access"],
    businessFit: ["warehouse", "distribution", "service-industrial", "operations teams"],
    nearbyBuildingPaths: [
      buildingPath("1300-1390 S Potomac St"),
      buildingPath("17100-17210 E Ohio Dr"),
    ],
    comparisonBuildingPaths: [
      buildingPath("1300-1390 S Potomac St"),
      buildingPath("17100-17210 E Ohio Dr"),
      "/commercial-real-estate/building/CO/denver/10500-10600-e-54th-ave/",
    ],
    brief: {
      summary: "3250 Abilene St is an Aurora I-70 / Airport Industrial Building Profile for businesses comparing larger-format industrial space in the east Denver metro. It is useful for warehouse, distribution, service-industrial, or operational users that need Aurora geography while still validating building-specific loading, circulation, and current suite fit.",
      rofoTake: "This profile matters because Aurora's industrial foundation should not be explained only through office, medical, or retail-heavy Aurora examples. 3250 Abilene St gives Rofo a concrete larger-format benchmark for users deciding whether Aurora can support warehouse or distribution needs before they compare stronger Denver-side I-70 alternatives.",
      snapshot: [
        { label: "Primary ecosystem", value: "Industrial & flex" },
        { label: "Business use", value: "Warehouse, distribution, and service-industrial comparison" },
        { label: "District", value: "Aurora I-70 / Airport Industrial" },
        { label: "Recorded size context", value: "Large-format spaces in Rofo source data; confirm current suite size" },
        { label: "Evidence role", value: "Large-format industrial benchmark" },
        { label: "Validation context", value: "Loading, clear height, truck movement, yard, and availability require current verification" },
      ],
      bestFit: [
        "Warehouse and distribution users that need an Aurora or east-metro operating base.",
        "Service-industrial companies comparing storage, dispatch, receiving, and shipping needs.",
        "Operations teams deciding whether Aurora can work before moving the search to Northeast Denver Industrial or Commerce City.",
      ],
      mayNotFit: [
        "Small service users that only need a compact office/warehouse footprint.",
        "Customer-facing retail, showroom, medical, or office users that need a stronger visitor environment.",
        "Heavy industrial users that require validated yard, power, trailer storage, or process-specific infrastructure.",
      ],
      buildingExperience: "Evaluate this environment as an operating platform. A tour should focus on how employees, trucks, inventory, and service vehicles move through the site, and whether the building's current configuration supports the actual warehouse or distribution model.",
      locationContext: "3250 Abilene St sits in Aurora I-70 / Airport Industrial, a foundation-stage east-metro industrial area. It should be compared with 1300-1390 S Potomac St and 17100-17210 E Ohio Dr for Aurora alternatives, then against Northeast Denver Industrial, Commerce City, and the airport corridor when regional access or heavier industrial utility matters more.",
      advantages: [
        "Adds a larger-format industrial benchmark to Aurora's commercial evidence set.",
        "Helps separate warehouse and distribution searches from office-heavy Aurora alternatives.",
        "Supports early comparison between Aurora and Denver-side I-70 industrial geography.",
      ],
      tradeoffs: [
        "Representative evidence does not confirm current availability or suite configuration.",
        "Loading, clear height, truck circulation, and yard requirements must be verified directly.",
        "Users with heavier operational needs may need to compare Northeast Denver Industrial or Commerce City.",
      ],
      operationalProfile: [
        { label: "Warehouse scale", summary: "Use the property as a larger-format comparison point; confirm current suite size, storage layout, clear height, and column spacing before shortlisting." },
        { label: "Regional movement", summary: "Aurora geography may help east-metro users, but routes to customers, suppliers, labor, and airport-area destinations should be validated." },
        { label: "Loading and vehicles", summary: "Dock or grade-level access, truck turning, parking, delivery hours, and trailer needs should be checked at the property level." },
      ],
      environmentExplanation: {
        whyItExists: "Larger-format industrial environments exist for companies that need storage, receiving, shipping, equipment movement, and regional access to work together.",
        whyChooseThisEnvironment: "Choose this environment when Aurora or east-metro access is valuable and the business needs more industrial utility than a small service base.",
        representativeValue: "3250 Abilene St anchors Aurora's larger industrial evidence within the district collection.",
      },
      nearbyAlternatives: [
        { label: "1300-1390 S Potomac St", url: buildingPath("1300-1390 S Potomac St"), reason: "A better Aurora comparison for service-industrial or more local operating needs." },
        { label: "17100-17210 E Ohio Dr", url: buildingPath("17100-17210 E Ohio Dr"), reason: "Useful when a smaller industrial or office/warehouse reference is more appropriate." },
        { label: "Northeast Denver Industrial", url: "/commercial-real-estate/CO/denver/northeast-denver-industrial/", reason: "Compare when Denver-side I-70 access and deeper warehouse geography are stronger requirements." },
        { label: "Commerce City", url: "/commercial-real-estate/CO/commerce-city/commerce-city/", reason: "Compare when heavier industrial, yard, or manufacturing context may fit better." },
      ],
      validationNotes: [
        "What current suite size, clear height, column spacing, and loading configuration are actually available?",
        "Can truck circulation, delivery windows, employee parking, and service-vehicle needs be supported?",
        "Does Aurora geography solve customer, supplier, labor, and airport-area access better than Denver-side I-70 alternatives?",
        "Are yard, outdoor storage, signage, power, ventilation, and permitted-use needs approved for the intended operation?",
      ],
      representativeCompanies: [
        "Warehouse, distribution, service-industrial, and operations users are the most relevant categories.",
        "Named tenant, live availability, and suite-specific suitability should be verified from current sources before relying on them.",
      ],
      ecosystemSubtypes: ["warehouse", "distribution", "last_mile_logistics"],
      representativeRole: "large_format_industrial_benchmark",
      businessActivities: ["storage", "receiving", "shipping", "distribution"],
      businessArchetypes: ["distributor", "warehouse_user", "service_industrial_company"],
      operationalCharacteristics: ["warehouse_validation", "truck_access_validation", "east_metro_access"],
      fitSummary: "Best for warehouse and distribution users that need Aurora or east-metro industrial utility.",
      sourceNotes: [
        "Rofo canonical building data identifies the address, Aurora location, industrial type, and large-format size context.",
        "Aurora I-70 / Airport Industrial CME selects the property as a large-format industrial benchmark.",
      ],
    },
  }),
  record({
    name: "1300-1390 S Potomac St",
    address: "1300-1390 S Potomac St",
    buildingType: "Service-industrial / warehouse",
    editorialRole: "Aurora Service-Industrial Benchmark",
    editorialReason: "Adds a local Aurora industrial reference for service, storage, dispatch, and office/warehouse users.",
    representativeThemes: ["Service industrial", "Warehouse", "Office/warehouse", "Aurora operating geography"],
    businessFit: ["service businesses", "contractor operations", "warehouse users", "local distribution"],
    nearbyBuildingPaths: [
      buildingPath("3250 Abilene St"),
      buildingPath("17100-17210 E Ohio Dr"),
    ],
    comparisonBuildingPaths: [
      buildingPath("3250 Abilene St"),
      buildingPath("17100-17210 E Ohio Dr"),
      "/commercial-real-estate/building/CO/denver/4550-kingston-st/",
    ],
    brief: {
      summary: "1300-1390 S Potomac St is an Aurora I-70 / Airport Industrial Building Profile for service-industrial, warehouse, and office/warehouse users. It helps businesses compare local Aurora operating utility against larger industrial footprints and Denver-side industrial corridors before assuming the broader metro solves the same need.",
      rofoTake: "This profile matters because Aurora's industrial story needs a practical service-industrial benchmark, not only larger warehouse examples. 1300-1390 S Potomac St helps explain how a business may evaluate Aurora for storage, dispatch, receiving, or local operations while keeping suite configuration and permitted use as validation topics.",
      snapshot: [
        { label: "Primary ecosystem", value: "Industrial & flex" },
        { label: "Business use", value: "Service-industrial, warehouse, and office/warehouse comparison" },
        { label: "District", value: "Aurora I-70 / Airport Industrial" },
        { label: "Recorded size context", value: "Large spaces in Rofo source data; confirm current suite size" },
        { label: "Evidence role", value: "Service-industrial benchmark" },
        { label: "Validation context", value: "Suite mix, loading, parking, use approval, and availability require current verification" },
      ],
      bestFit: [
        "Contractors, building-services firms, and local operations teams that need storage plus dispatch utility.",
        "Warehouse users comparing a practical Aurora location against larger Denver industrial corridors.",
        "Businesses that need to validate whether office/warehouse or service-industrial space fits their customer and employee geography.",
      ],
      mayNotFit: [
        "Regional distribution users that need a clearly larger logistics environment.",
        "Client-facing offices, medical practices, or retail users that need stronger visitor presentation.",
        "Industrial users with specialized power, outdoor storage, yard, ventilation, or heavy truck requirements that are not yet validated.",
      ],
      buildingExperience: "Evaluate this property by the everyday operating pattern: where vehicles stage, how materials move, where employees park, and whether customers or vendors need to visit. The profile is a decision guide, not confirmation that any current suite supports a specific operation.",
      locationContext: "1300-1390 S Potomac St broadens Aurora I-70 / Airport Industrial beyond one large-format example. It should be read with 3250 Abilene St for scale comparison, 17100-17210 E Ohio Dr for smaller-format comparison, and Northeast Denver Industrial or Commerce City when the search needs stronger industrial depth.",
      advantages: [
        "Gives Aurora a practical service-industrial and office/warehouse comparison point.",
        "Helps users evaluate local Aurora operations separately from downtown or medical-office fit.",
        "Supports the district's foundation as more than a single large-format warehouse example.",
      ],
      tradeoffs: [
        "Exact office-to-warehouse mix, loading, and suite condition are not implied by the profile.",
        "The property may be too local or modest for larger distribution requirements.",
        "Use permissions, parking, service-vehicle storage, signage, and current availability must be verified.",
      ],
      operationalProfile: [
        { label: "Service operations", summary: "Evaluate whether storage, dispatch, employee parking, and customer or vendor visits can work from the current suite." },
        { label: "Warehouse configuration", summary: "Confirm current loading, clear height, warehouse depth, office percentage, and divisibility before comparing it with larger options." },
        { label: "Aurora geography", summary: "The location can be useful for east-metro service coverage, but route patterns should be compared against Denver-side industrial corridors." },
      ],
      environmentExplanation: {
        whyItExists: "Service-industrial buildings support businesses that combine storage, dispatch, light warehouse function, employees, and occasional customer or vendor access.",
        whyChooseThisEnvironment: "Choose this environment when the business needs practical Aurora operating coverage more than a flagship warehouse or customer-facing office setting.",
        representativeValue: "1300-1390 S Potomac St is the district's practical service-industrial benchmark.",
      },
      nearbyAlternatives: [
        { label: "3250 Abilene St", url: buildingPath("3250 Abilene St"), reason: "A stronger comparison when larger-format industrial scale is the main question." },
        { label: "17100-17210 E Ohio Dr", url: buildingPath("17100-17210 E Ohio Dr"), reason: "Useful when smaller industrial or office/warehouse fit may be more practical." },
        { label: "Northeast Denver Industrial", url: "/commercial-real-estate/CO/denver/northeast-denver-industrial/", reason: "Compare when Denver-side warehouse depth and I-70 access matter more." },
        { label: "Commerce City", url: "/commercial-real-estate/CO/commerce-city/commerce-city/", reason: "Compare when heavier industrial context or yard-oriented operations may be needed." },
      ],
      validationNotes: [
        "What office, warehouse, loading, parking, and service-vehicle configuration is available in the current suite?",
        "Does the property support the intended dispatch, storage, receiving, or customer-visit pattern?",
        "Would a larger Aurora example or a Denver-side industrial district create a better operational fit?",
        "Are permitted use, signage, outdoor storage, delivery hours, and any contractor-service needs approved?",
      ],
      representativeCompanies: [
        "Contractor, building-service, storage, local distribution, and office/warehouse users are the most relevant categories.",
        "Specific tenant names, availability, and suite capabilities require current verification.",
      ],
      ecosystemSubtypes: ["service_industrial", "warehouse", "office_warehouse"],
      representativeRole: "service_industrial_benchmark",
      businessActivities: ["storage", "service_dispatch", "receiving", "shipping"],
      businessArchetypes: ["general_contractor", "building_services_company", "distributor"],
      operationalCharacteristics: ["office_warehouse_validation", "service_vehicle_validation", "local_distribution"],
      fitSummary: "Best for service-industrial and office/warehouse users that need practical Aurora operating geography.",
      sourceNotes: [
        "Rofo canonical building data identifies the address, Aurora location, industrial type, and large-space size context.",
        "Aurora I-70 / Airport Industrial CME selects the property as a service-industrial benchmark.",
      ],
    },
  }),
  record({
    name: "17100-17210 E Ohio Dr",
    address: "17100-17210 E Ohio Dr",
    buildingType: "Small / mid-format industrial",
    editorialRole: "Small / Mid-Format Aurora Industrial Benchmark",
    editorialReason: "Keeps Aurora industrial evidence from relying only on larger warehouse footprints by adding a smaller-format operating example.",
    representativeThemes: ["Small-bay industrial", "Office/warehouse", "Service operations", "Aurora local access"],
    businessFit: ["small warehouse users", "service businesses", "office/warehouse users", "local operations"],
    nearbyBuildingPaths: [
      buildingPath("3250 Abilene St"),
      buildingPath("1300-1390 S Potomac St"),
    ],
    comparisonBuildingPaths: [
      buildingPath("3250 Abilene St"),
      buildingPath("1300-1390 S Potomac St"),
      "/commercial-real-estate/building/CO/denver/10515-10525-e-40th-ave/",
    ],
    brief: {
      summary: "17100-17210 E Ohio Dr is an Aurora I-70 / Airport Industrial Building Profile for smaller industrial, service, and office/warehouse users. It helps a business evaluate Aurora when the requirement is more local and practical than a full regional warehouse or heavier industrial facility.",
      rofoTake: "This profile matters because an industrial foundation should show more than the largest spaces. 17100-17210 E Ohio Dr gives Aurora a smaller-format benchmark for companies that need storage, service access, or modest warehouse utility while validating whether the building can support the actual operation.",
      snapshot: [
        { label: "Primary ecosystem", value: "Industrial & flex" },
        { label: "Business use", value: "Small / mid-format industrial and office/warehouse comparison" },
        { label: "District", value: "Aurora I-70 / Airport Industrial" },
        { label: "Recorded size context", value: "Small to mid-size spaces in Rofo source data; confirm current suite size" },
        { label: "Evidence role", value: "Small / mid-format industrial benchmark" },
        { label: "Validation context", value: "Loading, office percentage, parking, permitted use, and availability require current verification" },
      ],
      bestFit: [
        "Small warehouse users and service businesses that need Aurora access without a larger distribution footprint.",
        "Office/warehouse users comparing storage, employees, customer visits, and dispatch needs in one location.",
        "Local operations teams that want an east-metro base while validating whether the building format is sufficient.",
      ],
      mayNotFit: [
        "Regional logistics users that need larger storage capacity, trailer movement, or dedicated distribution infrastructure.",
        "Customer-facing retail, medical, or office users that need stronger frontage or visitor experience.",
        "Production users with specialized power, ventilation, floor-load, yard, or process requirements that are not validated.",
      ],
      buildingExperience: "Evaluate this as a smaller operating environment. The important questions are whether the suite can handle daily storage, dispatch, employees, vehicles, and occasional customer or vendor activity without needing the scale of a larger industrial building.",
      locationContext: "17100-17210 E Ohio Dr helps explain the smaller end of Aurora I-70 / Airport Industrial. Compare it with 1300-1390 S Potomac St for service-industrial utility, 3250 Abilene St for larger-format needs, and Northeast Denver Industrial when the search requires deeper warehouse alternatives.",
      advantages: [
        "Adds a smaller-format benchmark to Aurora's industrial evidence.",
        "Helps office/warehouse and service users avoid over-indexing on large distribution buildings.",
        "Creates a clearer comparison path within Aurora before expanding to Denver-side industrial districts.",
      ],
      tradeoffs: [
        "Smaller industrial settings may not support heavier loading, yard, power, or trailer requirements.",
        "Current suite configuration and availability are not implied by representative evidence.",
        "Users needing more industrial depth may need Northeast Denver Industrial or Commerce City comparisons.",
      ],
      operationalProfile: [
        { label: "Small-bay fit", summary: "Confirm whether the current suite supports the right mix of storage, office area, dispatch, and service-vehicle use." },
        { label: "Operational limits", summary: "Validate loading, ceiling height, power, ventilation, parking, and outdoor storage before assuming the building can support heavier use." },
        { label: "Comparison path", summary: "Use this property to test smaller Aurora fit before comparing larger Aurora or Denver-side industrial environments." },
      ],
      environmentExplanation: {
        whyItExists: "Small and mid-format industrial environments exist for businesses that need practical storage, dispatch, and service utility without a large warehouse footprint.",
        whyChooseThisEnvironment: "Choose this environment when Aurora access and right-sized operational space matter more than regional distribution scale.",
        representativeValue: "17100-17210 E Ohio Dr balances the district collection with a smaller-format industrial example.",
      },
      nearbyAlternatives: [
        { label: "1300-1390 S Potomac St", url: buildingPath("1300-1390 S Potomac St"), reason: "Useful when service-industrial utility may need a larger or more practical comparison." },
        { label: "3250 Abilene St", url: buildingPath("3250 Abilene St"), reason: "A stronger comparison when larger-format warehouse needs are driving the search." },
        { label: "Northeast Denver Industrial", url: "/commercial-real-estate/CO/denver/northeast-denver-industrial/", reason: "Compare when a broader Denver-side warehouse corridor may provide better depth." },
        { label: "Denver Airport / Pena Boulevard Corridor", url: "/commercial-real-estate/CO/denver/denver-airport-pena-boulevard-corridor/", reason: "Compare when airport-oriented movement matters more than local Aurora coverage." },
      ],
      validationNotes: [
        "What current suite size, office percentage, loading, and parking configuration are available?",
        "Can the property support the intended storage, dispatch, employee, vehicle, and customer-visit pattern?",
        "Would a larger Aurora building or Denver-side industrial district create a better fit?",
        "Are use approval, signage, delivery hours, utilities, ventilation, and outdoor storage needs compatible?",
      ],
      representativeCompanies: [
        "Small warehouse, service, contractor, office/warehouse, and local operations users are the most relevant categories.",
        "Named tenants, current availability, and exact suite capabilities are not implied by this profile.",
      ],
      ecosystemSubtypes: ["small_bay_industrial", "office_warehouse", "service_industrial"],
      representativeRole: "small_mid_format_industrial_benchmark",
      businessActivities: ["storage", "service_dispatch", "receiving", "shipping"],
      businessArchetypes: ["building_services_company", "general_contractor", "small_warehouse_user"],
      operationalCharacteristics: ["small_bay_validation", "office_warehouse_validation", "east_metro_access"],
      fitSummary: "Best for small warehouse, service, and office/warehouse users that need Aurora access without larger distribution scale.",
      sourceNotes: [
        "Rofo canonical building data identifies the address, Aurora location, industrial type, and small to mid-size context.",
        "Aurora I-70 / Airport Industrial CME selects the property as a small / mid-format industrial benchmark.",
      ],
    },
  }),
];

module.exports = {
  district: auroraI70AirportIndustrial,
  canonicalBuildings: records,
  calibrationSet: records.map((item) => item.building_path),
};
