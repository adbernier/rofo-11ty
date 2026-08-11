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
  return `/commercial-real-estate/building/CA/oakland/${slugify(address)}/`;
}

const jackLondonSquareDistrict = {
  id: "oak-jack-london-square",
  name: "Jack London Square",
  slug: "jack-london-square",
  city: "Oakland",
  state_abbr: "CA",
  area_type: "district",
  path: "/commercial-real-estate/CA/oakland/jack-london-square/",
  primarySpaceType: "office",
};

const relatedDistricts = [
  {
    label: "Emeryville Commercial Core",
    url: "/commercial-real-estate/CA/emeryville/emeryville-commercial-core/",
    reason: "Compare when parking, business-park structure, and campus-style East Bay office access matter more.",
  },
  {
    label: "Downtown Berkeley",
    url: "/commercial-real-estate/CA/berkeley/downtown-berkeley/",
    reason: "Compare when BART-first access, UC Berkeley adjacency, and university downtown services matter more.",
  },
  {
    label: "West Berkeley",
    url: "/commercial-real-estate/CA/berkeley/west-berkeley/",
    reason: "Compare when industrial/flex utility, maker activity, or production-adjacent buildings matter more.",
  },
];

const handbookTopics = [
  {
    title: "Choosing the Right Commercial Location",
    url: "/commercial-real-estate/lease-guide/choosing-the-right-commercial-location/",
    summary: "Use location fit, access, customers, employees, and operations before narrowing the building list.",
  },
  {
    title: "How to Compare Commercial Spaces",
    url: "/commercial-real-estate/lease-guide/how-to-compare-commercial-spaces/",
    summary: "Compare buildings by business fit, total occupancy cost, operations, buildout, and future flexibility.",
  },
  {
    title: "Tenant Improvements",
    url: "/commercial-real-estate/lease-guide/tenant-improvements/",
    summary: "Understand buildout scope, timing, landlord approvals, and what to validate before leasing.",
  },
];

const defaultNearbyBuildings = [
  buildingPath("119 Filbert St"),
  buildingPath("160 Franklin St"),
  buildingPath("424 3rd St"),
];

function officeRetailBrief(fields) {
  const snapshot = fields.snapshot || [];
  const bestFit = fields.bestFit || [];
  const validationNotes = fields.validationNotes || [];

  return {
    status: "published",
    ecosystemContext: {
      primaryEcosystem: "office",
      secondaryEcosystems: ["retail"],
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
  const brief = officeRetailBrief(fields.brief);

  return {
    id: `east-bay-jack-london-square-${slugify(fields.address)}`,
    building_path: path,
    identity: {
      name: fields.name,
      address: fields.address,
      city: "Oakland",
      state_abbr: "CA",
      district: jackLondonSquareDistrict.name,
      canonicalDistrict: jackLondonSquareDistrict,
      secondaryDistricts: fields.secondaryDistricts || [],
      buildingType: fields.buildingType || "Waterfront-adjacent office / service-commercial building",
      primarySpaceType: "office",
      assetClass: fields.assetClass || "Representative Office / Retail Building",
    },
    editorial: {
      editorialRole: fields.editorialRole,
      editorialReason: fields.editorialReason,
      representativeThemes: fields.representativeThemes,
    },
    business: {
      businessFit: fields.businessFit,
      idealCompanyProfiles: brief.idealFor,
      companySizes: fields.companySizes || ["small businesses", "professional-service teams", "creative office users", "destination service businesses"],
    },
    experience: {
      workplaceCharacter: "Oakland waterfront-adjacent office and service-commercial environment shaped by Jack London Square, ferry and rail context, restaurants, and lower-scale adaptive blocks.",
      neighborhoodCharacter: "Waterfront-oriented Oakland commercial district with stronger destination identity than a conventional office core or suburban business park.",
      executivePresence: fields.executivePresence || "medium",
      innovationScore: fields.innovationScore || "moderate",
    },
    operations: {
      transit: "Ferry, Amtrak, local transit, and Oakland access can matter, but exact transit usefulness depends on the address and employee pattern.",
      parking: "Parking and visitor arrival should be validated early because the district is neither a pure transit-first downtown nor a suburban parking field.",
      amenities: "Restaurants, waterfront activity, services, and nearby Oakland commercial blocks shape the district experience.",
      foodEnvironment: "Food and beverage context is part of Jack London Square's destination identity, with usefulness varying by block and hours.",
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
      nearbyBuildings: (fields.nearbyBuildingPaths || defaultNearbyBuildings).filter((item) => item !== path).slice(0, 5),
      comparisonBuildings: (fields.comparisonBuildingPaths || defaultNearbyBuildings).filter((item) => item !== path).slice(0, 5),
      relatedDistricts: relatedDistricts.map((item) => item.url),
    },
    quality: {
      sourceConfidence: fields.sourceConfidence || "medium",
      publicationStatus: "published",
      sourceBasis: "Jack London Square Commercial Market Evidence district-building mission",
    },
    buildingBrief: brief,
  };
}

function briefFor(fields) {
  return {
    summary: `${fields.name} is a Jack London Square Building Profile for ${fields.fitLine}. It helps users compare Oakland waterfront identity, service-commercial context, visitor arrival, ferry and rail adjacency, and lower-scale office fit against Emeryville, Downtown Berkeley, and West Berkeley alternatives.`,
    rofoTake: `${fields.name} matters because Jack London Square needs concrete examples of its waterfront-adjacent office and service-commercial environment. This profile explains ${fields.roleLower} without implying current availability, tenancy, pricing, or specialized use suitability.`,
    snapshot: [
      { label: "Primary ecosystem", value: "Office" },
      { label: "Secondary context", value: fields.secondaryContext },
      { label: "District", value: "Jack London Square" },
      { label: "Access context", value: fields.accessContext },
      { label: "Evidence role", value: fields.evidenceRole },
      { label: "Validation context", value: "Suite condition, access, parking, signage, and current terms require verification" },
    ],
    bestFit: [
      fields.bestFitPrimary,
      "Organizations that value Oakland waterfront identity, nearby services, and a less formal commercial setting than the downtown office core.",
      "Users comparing Jack London Square with Emeryville office parks, Downtown Berkeley transit access, or West Berkeley industrial/flex buildings.",
    ],
    mayNotFit: [
      "Companies that need heavy parking, warehouse utility, lab infrastructure, medical infrastructure, or a traditional tower-core office identity.",
      "Users whose operations depend on direct BART access, large contiguous floorplates, suburban arrival patterns, or industrial production requirements.",
      "Industrial, medical, or specialized technical users whose requirements must be validated at a property-specific level.",
    ],
    buildingExperience: `Evaluate ${fields.name} around daily arrival, visitor access, suite layout, parking strategy, waterfront relevance, and whether the surrounding commercial activity supports the business.`,
    locationContext: `${fields.name} supports Jack London Square's commercial-market evidence by showing ${fields.locationContext}. Compare nearby Franklin, Filbert, and 3rd Street examples before deciding whether the user needs waterfront identity, stronger transit, parking, or industrial/flex utility.`,
    advantages: fields.advantages,
    tradeoffs: [
      "Parking, visitor arrival, and transit usefulness can vary more than in a pure downtown or suburban office setting.",
      "Lower-scale or adaptive commercial buildings can require careful validation of layout, access, building systems, signage, and improvement scope.",
      "The profile does not establish current availability, tenant mix, rent, permitted-use fit, or customer-facing suitability.",
    ],
    operationalProfile: [
      { label: "Waterfront-adjacent office", summary: "Use this profile when Oakland waterfront identity and nearby services influence the location decision." },
      { label: "Service-commercial context", summary: "Validate whether customers, clients, staff, and visitors can use the building comfortably." },
      { label: "Adaptive urban tradeoff", summary: "Compare character and district identity against parking, BART access, expansion needs, and building-specific condition." },
    ],
    environmentExplanation: {
      whyItExists: "Jack London Square office and service-commercial buildings exist for users that benefit from Oakland access, waterfront identity, restaurants, and lower-scale urban commercial texture.",
      whyChooseThisEnvironment: "Choose this environment when Oakland waterfront character and customer-facing context matter more than a conventional office core or parking-heavy business park.",
      representativeValue: `${fields.name} gives Rofo a ${fields.representativeValue}.`,
    },
    nearbyAlternatives: fields.nearbyAlternatives,
    validationNotes: [
      "Confirm current availability, suite size, floorplate, shared areas, and buildout condition before relying on the profile.",
      "Validate parking, visitor arrival, ferry, rail, bike, and local transit access for employees and customers.",
      "Confirm signage, street visibility, access control, hours, and customer-facing suitability where relevant.",
      "Compare Jack London Square with Emeryville, Downtown Berkeley, and West Berkeley if parking, transit, or industrial/flex needs matter more.",
    ],
    ecosystemSubtypes: fields.ecosystemSubtypes,
    representativeRole: fields.representativeRole,
    businessActivities: fields.businessActivities,
    businessArchetypes: fields.businessArchetypes,
    operationalCharacteristics: fields.operationalCharacteristics,
    fitSummary: "Jack London Square fit depends on Oakland waterfront identity, customer or client arrival, parking tolerance, transit pattern, nearby services, and building-specific office or service-commercial configuration.",
    sourceNotes: [
      `Repository representative building page expansions identify ${fields.name} as a Jack London Square representative building for ${fields.sourceContext}.`,
      "The Knowledge Graph identifies Jack London Square as an Oakland waterfront office and destination retail district.",
    ],
  };
}

const records = [
  record({
    name: "119 Filbert St",
    address: "119 Filbert St",
    editorialRole: "Waterfront Service-Commercial Edge Reference",
    editorialReason: "Represents the lower-scale service-commercial edge of Jack London Square near Oakland waterfront activity.",
    representativeThemes: ["Jack London Square", "Waterfront edge", "Service commercial", "Small office"],
    businessFit: ["service business", "small office", "creative office", "destination customer-facing business"],
    nearbyBuildingPaths: [buildingPath("160 Franklin St"), buildingPath("424 3rd St")],
    comparisonBuildingPaths: [buildingPath("160 Franklin St"), buildingPath("424 3rd St"), "/commercial-real-estate/CA/emeryville/emeryville-commercial-core/"],
    brief: briefFor({
      name: "119 Filbert St",
      fitLine: "service-commercial users, small offices, and creative teams evaluating the waterfront edge",
      roleLower: "the lower-scale waterfront service-commercial pattern",
      secondaryContext: "Waterfront-edge service commercial and small office",
      accessContext: "Filbert Street, Jack London Square, ferry and rail context, and nearby Oakland services",
      evidenceRole: "Lower-scale service-commercial reference",
      bestFitPrimary: "Service-commercial users, small offices, and creative teams that want Oakland waterfront adjacency without a formal tower-core setting.",
      locationContext: "how the waterfront edge adds lower-scale office and service-commercial evidence to the district",
      representativeValue: "waterfront-edge service-commercial reference",
      sourceContext: "lower-scale service-commercial and waterfront-edge environment",
      advantages: [
        "Adds lower-scale waterfront-edge evidence to the Jack London Square collection.",
        "Helps users compare service-commercial fit with more formal downtown office choices.",
        "Connects Oakland waterfront identity to small office and creative-team location decisions.",
      ],
      nearbyAlternatives: [
        { label: "160 Franklin St", url: buildingPath("160 Franklin St"), reason: "Compare when a more central waterfront-adjacent commercial reference is needed." },
        { label: "424 3rd St", url: buildingPath("424 3rd St"), reason: "Compare when adaptive commercial character matters more than waterfront-edge position." },
        { label: "Emeryville Commercial Core", url: "/commercial-real-estate/CA/emeryville/emeryville-commercial-core/", reason: "Compare when parking and campus-style office access matter more than waterfront character." },
      ],
      ecosystemSubtypes: ["service_commercial", "small_tenant_office", "waterfront_office"],
      representativeRole: "waterfront_service_commercial_edge_reference",
      businessActivities: ["professional_services", "customer_service", "client_meetings", "destination_service"],
      businessArchetypes: ["local_service_business", "professional_services_firm", "creative_office_user", "destination_service_business"],
      operationalCharacteristics: ["waterfront_identity", "visitor_access", "parking_validation_required", "service_commercial_context"],
    }),
  }),
  record({
    name: "160 Franklin St",
    address: "160 Franklin St",
    editorialRole: "Waterfront-Adjacent Commercial Reference",
    editorialReason: "Anchors Jack London Square's waterfront-adjacent commercial evidence for office, service, and visitor-facing users.",
    representativeThemes: ["Jack London Square", "Waterfront adjacency", "Office", "Service commercial"],
    businessFit: ["office user", "service business", "professional services", "visitor-facing commercial user"],
    nearbyBuildingPaths: [buildingPath("119 Filbert St"), buildingPath("424 3rd St")],
    comparisonBuildingPaths: [buildingPath("119 Filbert St"), buildingPath("424 3rd St"), "/commercial-real-estate/CA/berkeley/downtown-berkeley/"],
    brief: briefFor({
      name: "160 Franklin St",
      fitLine: "office, service, and visitor-facing users comparing Oakland waterfront-adjacent commercial settings",
      roleLower: "the waterfront-adjacent office and service-commercial pattern",
      secondaryContext: "Waterfront-adjacent office and service commercial",
      accessContext: "Franklin Street, Jack London Square waterfront, ferry, rail, and Oakland services",
      evidenceRole: "Waterfront-adjacent commercial reference",
      bestFitPrimary: "Office, service, and professional teams that want Jack London Square waterfront identity and nearby customer or visitor context.",
      locationContext: "how central waterfront-adjacent commercial context shapes Jack London Square comparisons",
      representativeValue: "waterfront-adjacent office and service-commercial reference",
      sourceContext: "waterfront-adjacent commercial environment",
      advantages: [
        "Anchors the collection with a central waterfront-adjacent commercial example.",
        "Helps users compare Oakland waterfront identity with Berkeley and Emeryville alternatives.",
        "Supports office, service, and visitor-facing business fit without asserting live availability.",
      ],
      nearbyAlternatives: [
        { label: "119 Filbert St", url: buildingPath("119 Filbert St"), reason: "Compare when the waterfront-edge service-commercial pattern is more relevant." },
        { label: "424 3rd St", url: buildingPath("424 3rd St"), reason: "Compare when adaptive commercial texture matters more than central waterfront adjacency." },
        { label: "Downtown Berkeley", url: "/commercial-real-estate/CA/berkeley/downtown-berkeley/", reason: "Compare when BART-first access and UC Berkeley adjacency matter more." },
      ],
      ecosystemSubtypes: ["waterfront_office", "professional_office", "service_commercial"],
      representativeRole: "waterfront_adjacent_commercial_reference",
      businessActivities: ["professional_services", "client_meetings", "customer_service", "visitor_facing_operations"],
      businessArchetypes: ["professional_services_firm", "creative_office_user", "local_service_business", "visitor_facing_business"],
      operationalCharacteristics: ["waterfront_identity", "visitor_access", "nearby_services", "parking_validation_required"],
    }),
  }),
  record({
    name: "424 3rd St",
    address: "424 3rd St",
    editorialRole: "Adaptive Commercial Reference",
    editorialReason: "Shows Jack London Square's adaptive commercial texture near rail, waterfront, and lower-scale commercial blocks.",
    representativeThemes: ["Jack London Square", "Adaptive commercial", "Warehouse adjacency", "Service office"],
    businessFit: ["adaptive commercial user", "creative office", "service business", "small professional office"],
    nearbyBuildingPaths: [buildingPath("160 Franklin St"), buildingPath("119 Filbert St")],
    comparisonBuildingPaths: [buildingPath("160 Franklin St"), buildingPath("119 Filbert St"), "/commercial-real-estate/CA/berkeley/west-berkeley/"],
    brief: briefFor({
      name: "424 3rd St",
      fitLine: "adaptive commercial users and creative or service teams comparing lower-scale Oakland blocks",
      roleLower: "the adaptive commercial and warehouse-adjacent pattern",
      secondaryContext: "Adaptive commercial and warehouse-adjacent office/service context",
      accessContext: "3rd Street, Jack London Square, rail and waterfront context, and Oakland commercial blocks",
      evidenceRole: "Adaptive commercial reference",
      bestFitPrimary: "Adaptive commercial users, creative office teams, and service businesses that value lower-scale Oakland character.",
      locationContext: "how warehouse-adjacent blocks distinguish Jack London Square from a conventional downtown office core",
      representativeValue: "warehouse-adjacent adaptive commercial reference",
      sourceContext: "adaptive commercial texture and warehouse-adjacent district context",
      advantages: [
        "Adds adaptive commercial evidence to the Jack London Square collection.",
        "Helps users compare lower-scale Oakland character with formal office districts.",
        "Creates a useful bridge between waterfront office context and West Berkeley industrial/flex comparisons.",
      ],
      nearbyAlternatives: [
        { label: "160 Franklin St", url: buildingPath("160 Franklin St"), reason: "Compare when waterfront-adjacent office and service context matters more." },
        { label: "119 Filbert St", url: buildingPath("119 Filbert St"), reason: "Compare when service-commercial waterfront-edge context is more important." },
        { label: "West Berkeley", url: "/commercial-real-estate/CA/berkeley/west-berkeley/", reason: "Compare when industrial/flex utility and maker-oriented buildings matter more." },
      ],
      ecosystemSubtypes: ["adaptive_commercial", "creative_office", "service_commercial"],
      representativeRole: "adaptive_commercial_reference",
      businessActivities: ["creative_office_work", "professional_services", "customer_service", "administrative_operations"],
      businessArchetypes: ["creative_office_user", "professional_services_firm", "local_service_business", "adaptive_commercial_user"],
      operationalCharacteristics: ["adaptive_building_character", "waterfront_context", "visitor_access", "parking_validation_required"],
    }),
  }),
];

module.exports = {
  canonicalBuildings: records,
};
