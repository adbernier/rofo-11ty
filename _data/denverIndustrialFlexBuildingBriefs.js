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
  return `/commercial-real-estate/building/CO/denver/${slugify(address)}/`;
}

function district(id, name, slug) {
  return {
    id,
    name,
    slug,
    city: "Denver",
    state_abbr: "CO",
    area_type: "industrial_area",
    path: `/commercial-real-estate/CO/denver/${slug}/`,
  };
}

const districts = {
  northeast: district("den-northeast-denver-industrial", "Northeast Denver Industrial", "northeast-denver-industrial"),
  airportPena: district("den-airport-pena-corridor", "Denver Airport / Pena Boulevard Corridor", "denver-airport-pena-boulevard-corridor"),
};

const districtCopy = {
  northeast: {
    workplaceCharacter: "Denver-side industrial corridor shaped by I-70, warehouse and service-industrial formats, regional labor access, and airport reach.",
    neighborhoodCharacter: "Operational industrial geography where loading, truck movement, storage, and service access matter more than office image.",
    transit: "I-70, I-25, and airport access are stronger decision drivers than pedestrian or transit access.",
    parking: "Parking, truck movement, trailer needs, and service-vehicle access vary by property and should be validated early.",
    amenities: "Amenities are secondary to operational utility; users should evaluate employee convenience by shift pattern and commute pattern.",
  },
  airportPena: {
    workplaceCharacter: "Airport-adjacent industrial and service corridor where Pena Boulevard, DIA access, last-mile reach, and regional east-metro movement shape fit.",
    neighborhoodCharacter: "Logistics-oriented commercial environment with stronger airport and regional access than customer-facing district identity.",
    transit: "Pena Boulevard and airport access are the primary access story; employee commute patterns should be validated carefully.",
    parking: "Parking, trailer circulation, and service-vehicle needs are property-specific and should be validated before shortlisting.",
    amenities: "Amenities are practical and auto-oriented, with operating access usually more important than walkable services.",
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
  const snapshot = fields.snapshot || fields.quickFacts || [];
  const bestFit = fields.bestFit || fields.idealFor || [];
  const locationContext = fields.locationContext || fields.districtContext || "";

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
  const defaults = districtCopy[fields.districtKey];
  const path = buildingPath(fields.address);
  const brief = industrialBrief(fields.brief);

  return {
    id: `co-denver-${slugify(fields.address)}`,
    building_path: path,
    identity: {
      name: fields.name,
      address: fields.address,
      city: "Denver",
      state_abbr: "CO",
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
      companySizes: fields.companySizes || ["small and mid-sized businesses", "operations teams", "service, warehouse, and distribution users"],
    },
    experience: {
      workplaceCharacter: defaults.workplaceCharacter,
      neighborhoodCharacter: defaults.neighborhoodCharacter,
      executivePresence: "low",
      innovationScore: fields.innovationScore || "moderate",
    },
    operations: {
      transit: defaults.transit,
      parking: defaults.parking,
      amenities: defaults.amenities,
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
      sourceBasis: "Denver Industrial & Flex Ecosystem Building Brief Migration",
    },
    buildingBrief: brief,
  };
}

const records = [
  record({
    name: "10445 E 49th Ave",
    address: "10445 E 49th Ave",
    districtKey: "northeast",
    buildingType: "Large-format industrial / logistics",
    primarySpaceType: "industrial",
    editorialRole: "Large-Scale Distribution Environment",
    editorialReason: "Represents the larger industrial and logistics side of Northeast Denver Industrial, where regional access, warehouse scale, and truck-oriented validation drive the search.",
    representativeThemes: ["Distribution", "Warehouse", "I-70 access", "Airport-adjacent industrial"],
    businessFit: ["warehouse", "distribution", "logistics", "regional operations"],
    relatedDistrictPaths: [districts.airportPena.path],
    nearbyBuildingPaths: [
      buildingPath("10500-10600 E. 54th Ave"),
      buildingPath("11551 E 49th Ave"),
      buildingPath("10515-10525 E 40th Ave"),
    ],
    comparisonBuildingPaths: [
      buildingPath("4550 Kingston St"),
      buildingPath("3559 N Himalaya Rd"),
      buildingPath("10515-10525 E 40th Ave"),
    ],
    brief: {
      summary: "10445 E 49th Ave is a Northeast Denver Industrial building that helps explain larger industrial and logistics decisions near I-70 and the airport side of Denver. It is most useful for businesses comparing warehouse, distribution, service-distribution, or regional operations environments rather than office or customer-facing space.",
      rofoTake: "This profile matters because Denver's industrial/flex coverage should not be represented only by office/flex or small service buildings. 10445 E 49th Ave gives the metro a large-format benchmark for users whose decision depends on warehouse scale, regional access, loading validation, and goods movement.",
      snapshot: [
        { label: "Primary ecosystem", value: "Industrial & flex" },
        { label: "Business use", value: "Large-scale distribution environment" },
        { label: "District", value: "Northeast Denver Industrial" },
        { label: "Recorded size context", value: "Large-format space in Rofo building data; confirm current available suite size" },
        { label: "Access context", value: "Northeast Denver district context emphasizes I-70, airport access, and regional movement" },
      ],
      bestFit: [
        "Distributors, wholesalers, importers, and fulfillment users comparing Denver-side warehouse environments.",
        "Operations teams that need to evaluate regional access, loading, truck circulation, and warehouse scale before office presentation.",
        "Service-distribution users that want Northeast Denver Industrial access without relying on a customer-facing district identity.",
      ],
      mayNotFit: [
        "Small contractors that mainly need modest storage, a small office, and service-vehicle dispatch.",
        "Client-facing office, showroom, or retail users that need visible frontage or polished visitor experience.",
        "Specialized production users that cannot validate power, ventilation, permitting, or process-specific requirements.",
      ],
      buildingExperience: "The environment should be evaluated as an operations platform. A tour should focus on how inventory, trucks, employees, and deliveries move through the property, and whether the building's current configuration can support the actual operating model.",
      locationContext: "10445 E 49th Ave sits in Northeast Denver Industrial, one of Denver's clearest industrial corridors for I-70, airport, warehouse, service-industrial, and regional distribution needs. Compare the Airport / Pena corridor when airport-specific logistics matter more, and smaller Northeast Denver examples when service access matters more than warehouse scale.",
      advantages: [
        "Adds a large-format industrial benchmark to Denver's industrial/flex Building Profile coverage.",
        "Helps separate warehouse and distribution requirements from small-bay service or office/flex needs.",
        "Supports comparison of Denver-side I-70 and airport-access industrial geography.",
      ],
      tradeoffs: [
        "Large-format utility may exceed the needs of smaller service businesses.",
        "Customer-facing image, walkability, and amenities are secondary to operational function.",
        "Loading, clear height, truck circulation, parking, and current suite configuration must be verified before relying on the property as a fit.",
      ],
      operationalProfile: [
        { label: "Warehouse scale", summary: "The property is useful as a large-format industrial comparison point. Confirm current suite size, clear height, column spacing, and storage assumptions before shortlisting." },
        { label: "Regional access", summary: "Northeast Denver Industrial supports I-70 and airport-oriented movement, but the right fit depends on the business's route, supplier, labor, and customer geography." },
        { label: "Loading and truck movement", summary: "Distribution users should validate dock or grade-level access, truck circulation, delivery hours, and any trailer or staging needs." },
      ],
      environmentExplanation: {
        whyItExists: "Large-scale distribution environments exist for businesses that move goods through a region and need warehouse scale, access, loading, and building configuration to work together.",
        whyChooseThisEnvironment: "Choose this environment over small-bay service space when inventory movement and warehouse scale matter more than a compact operating base. Choose it over office/flex when the business is solving logistics rather than workplace presentation.",
        representativeValue: "10445 E 49th Ave is Denver's initial benchmark for larger industrial and distribution decision-making.",
      },
      nearbyAlternatives: [
        { label: "4550 Kingston St", url: buildingPath("4550 Kingston St"), reason: "Compare this when a larger Northeast Denver warehouse/distribution example may better frame scale and truck-oriented validation." },
        { label: "3559 N Himalaya Rd", url: buildingPath("3559 N Himalaya Rd"), reason: "Compare this when airport/Pena access is the stronger operating driver." },
        { label: "10515-10525 E 40th Ave", url: buildingPath("10515-10525 E 40th Ave"), reason: "Compare this when a smaller service-industrial format may fit better than a larger warehouse setting." },
      ],
      nearbyDistricts: [
        { label: "Denver Airport / Pena Boulevard Corridor", url: districts.airportPena.path, reason: "Compare for stronger airport-specific logistics and east-metro access." },
      ],
      relatedDistricts: [
        { districtId: "den-airport-pena-corridor", reason: "Compare for airport-specific logistics and east-metro reach." },
      ],
      validationNotes: [
        "Confirm current suite size, loading configuration, and truck circulation.",
        "Verify clear height, storage layout, and any racking or sprinkler requirements.",
        "Confirm parking, trailer staging, delivery hours, and site access rules.",
        "Validate permitted use, power, ventilation, and any specialized operating requirements.",
      ],
      representativeCompanies: [
        "Relevant company categories include distributors, wholesalers, importers, e-commerce fulfillment users, and regional operations teams.",
        "These categories describe operating-model fit and do not identify current tenants.",
      ],
      ecosystemSubtypes: ["distribution", "warehouse", "last_mile_logistics"],
      representativeRole: "large_scale_distribution_environment",
      businessActivities: ["receiving", "shipping", "distribution", "inventory_management", "storage"],
      businessArchetypes: ["distributor", "wholesaler", "importer", "ecommerce_fulfillment_business"],
      operationalCharacteristics: ["large_floorplates", "regional_distribution_access", "freeway_access", "last_mile_access", "industrial_identity"],
      fitSummary: "Large-format distribution fit depends on warehouse scale, loading validation, truck access, and regional movement.",
      sourceNotes: ["Repository building data identifies 10445 E 49th Ave as an industrial Denver building with large-format space context; district graph data supports I-70, airport, warehouse, and service-industrial positioning."],
    },
  }),
  record({
    name: "10515-10525 E 40th Ave",
    address: "10515-10525 E 40th Ave",
    districtKey: "northeast",
    buildingType: "Small-bay industrial / service industrial",
    primarySpaceType: "industrial",
    editorialRole: "Small-Bay Service Environment",
    editorialReason: "Represents the smaller service-industrial side of Northeast Denver Industrial, where modest footprints, dispatch, storage, and practical access can matter more than large-format logistics scale.",
    representativeThemes: ["Small-bay industrial", "Service industrial", "Contractor operations", "I-70 access"],
    businessFit: ["contractor operations", "service dispatch", "equipment service", "small-bay industrial"],
    relatedDistrictPaths: [districts.airportPena.path],
    nearbyBuildingPaths: [
      buildingPath("4550 Kingston St"),
      buildingPath("10445 E 49th Ave"),
      buildingPath("11551 E 49th Ave"),
    ],
    comparisonBuildingPaths: [
      buildingPath("10445 E 49th Ave"),
      buildingPath("4550 Kingston St"),
      buildingPath("3559 N Himalaya Rd"),
    ],
    brief: {
      summary: "10515-10525 E 40th Ave is a small-bay Northeast Denver Industrial example for businesses that need a practical operating base rather than a large distribution facility. It helps explain how contractors, service companies, and smaller industrial users may evaluate storage, dispatch, access, and suite configuration.",
      rofoTake: "This profile matters because industrial/flex readiness depends on more than warehouse count. Smaller service-industrial environments help users understand the everyday operating needs of trades, equipment-service businesses, and local industrial users that may not need a large logistics building.",
      snapshot: [
        { label: "Primary ecosystem", value: "Industrial & flex" },
        { label: "Business use", value: "Small-bay service environment" },
        { label: "District", value: "Northeast Denver Industrial" },
        { label: "Recorded size context", value: "Small to mid-size space in Rofo building data; confirm current suite size" },
        { label: "Operating context", value: "Service-industrial and contractor fit should be validated by suite configuration" },
      ],
      bestFit: [
        "Contractors, electricians, HVAC companies, plumbing companies, and building-services users comparing modest industrial footprints.",
        "Service businesses that need storage, dispatch, receiving, and employee or service-vehicle access without a large warehouse platform.",
        "Small industrial users comparing Northeast Denver for operational utility and regional access.",
      ],
      mayNotFit: [
        "Large distributors that need dock-heavy loading, high-clearance storage, trailer movement, or broader warehouse scale.",
        "Office-heavy users that need a polished workplace or customer-facing district identity.",
        "Manufacturing users whose power, ventilation, permitting, or process needs cannot be confirmed at the suite level.",
      ],
      buildingExperience: "The experience is practical and suite-specific. A user should validate where crews arrive, where materials are stored, how deliveries work, and whether the available space balances office, storage, service vehicles, and access in the right proportions.",
      locationContext: "10515-10525 E 40th Ave sits in Northeast Denver Industrial, where service-industrial and warehouse users compare I-70 access, airport reach, truck movement, and Denver-side labor access. It is a smaller-format contrast to larger industrial examples such as 10445 E 49th Ave and 4550 Kingston St.",
      advantages: [
        "Adds small-bay and service-industrial depth to Denver's industrial/flex Building Profile coverage.",
        "Helps explain contractor and service-company operating needs that are not captured by large warehouse examples.",
        "Gives Northeast Denver Industrial a compact operating-model benchmark alongside larger logistics records.",
      ],
      tradeoffs: [
        "Smaller footprints may limit expansion, truck maneuvering, or storage density.",
        "Loading, office percentage, parking, and service-vehicle rules may vary by suite.",
        "The environment may be less customer-facing than RiNo, Central Park, or other mixed commercial districts.",
      ],
      operationalProfile: [
        { label: "Small-bay fit", summary: "The record is useful for small to mid-size industrial comparison. Confirm suite dimensions, office/warehouse split, loading access, and whether the space supports the business's daily workflow." },
        { label: "Service dispatch", summary: "Trades and field-service users should validate employee arrival, vehicle staging, materials storage, and morning dispatch patterns." },
        { label: "Access and storage", summary: "Northeast Denver Industrial offers practical regional access, but each suite still needs validation for receiving, parking, and equipment storage." },
      ],
      environmentExplanation: {
        whyItExists: "Small-bay service environments exist because many local businesses need modest warehouse or storage space, vehicle access, dispatch capability, and a small office without the scale of a regional distribution facility.",
        whyChooseThisEnvironment: "Choose this environment over a large warehouse when dispatch, storage, and modest office needs matter more than trailer throughput. Choose it over office/flex when operational utility matters more than workplace image.",
        representativeValue: "10515-10525 E 40th Ave is Denver's initial small-bay service-industrial benchmark.",
      },
      nearbyAlternatives: [
        { label: "10445 E 49th Ave", url: buildingPath("10445 E 49th Ave"), reason: "Compare this when larger warehouse scale and regional goods movement matter more than small-bay service utility." },
        { label: "4550 Kingston St", url: buildingPath("4550 Kingston St"), reason: "Compare this when a larger warehouse/distribution environment is needed." },
        { label: "3559 N Himalaya Rd", url: buildingPath("3559 N Himalaya Rd"), reason: "Compare this when airport/Pena access matters more than central Northeast Denver positioning." },
      ],
      nearbyDistricts: [
        { label: "Denver Airport / Pena Boulevard Corridor", url: districts.airportPena.path, reason: "Compare when airport access and east-metro service coverage are stronger operating drivers." },
      ],
      relatedDistricts: [
        { districtId: "den-airport-pena-corridor", reason: "Compare for airport-adjacent service and logistics environments." },
      ],
      validationNotes: [
        "Confirm suite size, office/warehouse split, and divisibility.",
        "Verify grade-level or dock loading access for the available suite.",
        "Confirm employee parking, service-vehicle parking, and delivery rules.",
        "Validate permitted use, storage needs, power, ventilation, and any equipment requirements.",
      ],
      representativeCompanies: [
        "Relevant company categories include general contractors, electricians, HVAC companies, plumbing companies, equipment-service businesses, and building-services companies.",
        "These categories describe environmental fit and do not identify current tenants.",
      ],
      ecosystemSubtypes: ["small_bay_industrial", "contractor_service", "flex"],
      representativeRole: "small_bay_service_environment",
      businessActivities: ["service_dispatch", "equipment_storage", "receiving", "shipping", "storage"],
      businessArchetypes: ["general_contractor", "electrician", "hvac_company", "plumbing_company", "equipment_service_company", "building_services_company"],
      operationalCharacteristics: ["small_suite_sizes", "multi_tenant", "service_vehicle_parking", "office_warehouse_mix", "freeway_access", "industrial_identity"],
      fitSummary: "Small-bay service fit depends on suite configuration, loading, storage, parking, and dispatch needs.",
      sourceNotes: ["Repository building data identifies 10515-10525 E 40th Ave as an industrial Denver building with small to mid-size space context; district graph data supports service-industrial and contractor positioning."],
    },
  }),
  record({
    name: "4550 Kingston St",
    address: "4550 Kingston St",
    districtKey: "northeast",
    buildingType: "Warehouse / distribution",
    primarySpaceType: "warehouse",
    editorialRole: "Warehouse / Distribution Environment",
    editorialReason: "Represents a larger Northeast Denver warehouse/distribution environment that helps users compare inventory movement, regional reach, and operational scale against smaller service-industrial buildings.",
    representativeThemes: ["Warehouse", "Distribution", "Large-format operations", "Northeast Denver"],
    businessFit: ["warehouse", "distribution", "service distribution", "regional operations"],
    relatedDistrictPaths: [districts.airportPena.path],
    nearbyBuildingPaths: [
      buildingPath("10515-10525 E 40th Ave"),
      buildingPath("10445 E 49th Ave"),
      buildingPath("11551 E 49th Ave"),
    ],
    comparisonBuildingPaths: [
      buildingPath("10445 E 49th Ave"),
      buildingPath("3559 N Himalaya Rd"),
      buildingPath("10515-10525 E 40th Ave"),
    ],
    brief: {
      summary: "4550 Kingston St is a Northeast Denver Industrial warehouse/distribution example for businesses comparing larger operational footprints, inventory movement, and regional industrial access. It helps distinguish warehouse and distribution needs from smaller service-industrial or office/flex decisions.",
      rofoTake: "This profile matters because Denver's industrial/flex ecosystem needs examples that show both small-bay service and larger warehouse operating models. 4550 Kingston St helps users test whether their business needs distribution-oriented scale or a smaller, more flexible industrial base.",
      snapshot: [
        { label: "Primary ecosystem", value: "Industrial & flex" },
        { label: "Business use", value: "Warehouse / distribution environment" },
        { label: "District", value: "Northeast Denver Industrial" },
        { label: "Recorded size context", value: "Large-format space in Rofo building data; confirm current available suite size" },
        { label: "Operating context", value: "Warehouse and distribution fit depends on loading, truck access, storage, and current configuration" },
      ],
      bestFit: [
        "Warehouse users, service-distribution companies, distributors, wholesalers, and fulfillment users comparing larger Northeast Denver environments.",
        "Businesses that need to evaluate inventory flow, loading, regional access, and employee or truck movement together.",
        "Operators deciding whether Northeast Denver's industrial utility fits better than airport-specific or smaller service-industrial alternatives.",
      ],
      mayNotFit: [
        "Small trades or service users that do not need a larger warehouse footprint.",
        "Customer-facing showroom or office/flex users whose location decision depends on visibility, amenities, or visitor experience.",
        "Specialized manufacturing users without direct validation of power, ventilation, clear height, code, and landlord approval.",
      ],
      buildingExperience: "The operating question is whether the property can handle inventory, receiving, shipping, employees, and vendor access in the same daily rhythm. Users should compare the building by workflow, not by address alone.",
      locationContext: "4550 Kingston St sits in Northeast Denver Industrial, a district where warehouse, service-industrial, and distribution users compare Denver-side I-70 access and airport reach. It complements 10515-10525 E 40th Ave as a larger-format alternative and 3559 N Himalaya Rd as an airport/Pena corridor comparison.",
      advantages: [
        "Adds warehouse/distribution depth to Denver's industrial/flex Building Profile coverage.",
        "Helps users distinguish larger warehouse needs from small-bay contractor/service requirements.",
        "Supports comparison of Northeast Denver Industrial against the Denver Airport / Pena Boulevard Corridor.",
      ],
      tradeoffs: [
        "Larger warehouse environments may carry more capacity than smaller operators need.",
        "Operational function may outweigh office image, visibility, or walkable amenities.",
        "Truck movement, loading, parking, clear height, and current suite condition still require direct validation.",
      ],
      operationalProfile: [
        { label: "Warehouse function", summary: "Use this environment to evaluate inventory flow, receiving, shipping, storage density, and whether the building format matches the business's daily volume." },
        { label: "Truck and delivery access", summary: "Warehouse users should validate loading type, truck circulation, delivery hours, trailer staging, and site constraints before treating the property as viable." },
        { label: "Northeast Denver reach", summary: "The district supports Denver-side I-70 and airport-oriented industrial access, but employee geography and supplier routes should still be tested." },
      ],
      environmentExplanation: {
        whyItExists: "Warehouse and distribution environments exist for businesses that need to move and store goods reliably while balancing loading, access, labor, and regional reach.",
        whyChooseThisEnvironment: "Choose this environment over small-bay service when inventory movement and storage scale matter more than compact suite flexibility. Choose it over airport-specific logistics when Northeast Denver's central industrial access is more useful than Pena corridor adjacency.",
        representativeValue: "4550 Kingston St is a Denver benchmark for warehouse/distribution fit inside Northeast Denver Industrial.",
      },
      nearbyAlternatives: [
        { label: "10445 E 49th Ave", url: buildingPath("10445 E 49th Ave"), reason: "Compare this when another large-format Northeast Denver industrial example is needed." },
        { label: "10515-10525 E 40th Ave", url: buildingPath("10515-10525 E 40th Ave"), reason: "Compare this when small-bay service or contractor operations may fit better than a larger warehouse." },
        { label: "3559 N Himalaya Rd", url: buildingPath("3559 N Himalaya Rd"), reason: "Compare this when airport/Pena access is a stronger driver than central Northeast Denver positioning." },
      ],
      nearbyDistricts: [
        { label: "Denver Airport / Pena Boulevard Corridor", url: districts.airportPena.path, reason: "Compare for airport-adjacent logistics and east-metro distribution access." },
      ],
      relatedDistricts: [
        { districtId: "den-airport-pena-corridor", reason: "Compare for airport-adjacent logistics and east-metro distribution access." },
      ],
      validationNotes: [
        "Confirm loading type, door access, truck circulation, and delivery-hour rules.",
        "Verify clear height, sprinkler/racking assumptions, and storage layout.",
        "Confirm employee parking, trailer staging, and vendor access.",
        "Validate permitted use, power, ventilation, and any manufacturing or special-use requirements.",
      ],
      representativeCompanies: [
        "Relevant company categories include distributors, wholesalers, importers, e-commerce fulfillment users, and service-distribution businesses.",
        "These categories describe operating-model fit and do not identify current tenants.",
      ],
      ecosystemSubtypes: ["warehouse", "distribution", "last_mile_logistics"],
      representativeRole: "warehouse_distribution_environment",
      businessActivities: ["receiving", "shipping", "distribution", "inventory_management", "storage"],
      businessArchetypes: ["distributor", "wholesaler", "importer", "ecommerce_fulfillment_business"],
      operationalCharacteristics: ["large_floorplates", "regional_distribution_access", "freeway_access", "delivery_access", "industrial_identity"],
      fitSummary: "Warehouse/distribution fit depends on inventory movement, loading validation, storage layout, and regional access.",
      sourceNotes: ["Repository building data identifies 4550 Kingston St as an industrial Denver building with large-format space context; district graph data supports warehouse, distribution, and I-70/airport-access positioning."],
    },
  }),
];

module.exports = {
  canonicalBuildings: records,
};
