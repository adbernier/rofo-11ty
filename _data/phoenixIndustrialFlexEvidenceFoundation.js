const PROPERTY_VERIFICATION = "Representative buildings and environments illustrate reviewed operating character, not availability or property capability. Loading, clear height, power, yard or outdoor storage, trailer parking, ventilation, parking rights, permitted use, hazardous-material capability, and specialized manufacturing infrastructure require current property investigation.";

const ACCESS_LIMITATION = "Employee origins, customer and supplier geography, service territory, commute performance, and relative airport or freeway accessibility are not recommendation-grade comparative evidence in this foundation.";

const source = (id, type, title, location, supports) => Object.freeze({
  id,
  type,
  title,
  location,
  supports,
  reviewedOn: "2026-09-03",
});

const representative = ({ id, label, kind, path, ownerGeographyId, role, sources }) => Object.freeze({
  id,
  label,
  kind,
  path,
  ownerGeographyId,
  role,
  sources: Object.freeze(sources),
  confidence: "REVIEWED",
  reviewStatus: "APPROVED_FOR_EVIDENCE_FOUNDATION",
  availabilitySemantics: "REPRESENTATIVE_ONLY_NOT_AVAILABILITY",
  propertyVerification: PROPERTY_VERIFICATION,
});

const sources = Object.freeze({
  phoenixGeneralPlan: source(
    "phoenix-general-plan-employment-centers",
    "OFFICIAL_PLANNING",
    "City of Phoenix — General Plan major employment centers and corridors",
    "https://www.phoenix.gov/administration/departments/pdd/growth-infrastructure/general-plan/general-plan-2025-maps.html",
    "City ownership and the durable Southwest Phoenix, Sky Harbor Airport, South Central Industrial, and Deer Valley employment identities."
  ),
  phoenixGrowthArea: source(
    "phoenix-growth-area-element",
    "OFFICIAL_PLANNING",
    "City of Phoenix — Growth Area Element",
    "https://www.phoenix.gov/content/dam/phoenix/pddsite/documents/pz/pdd_pz_pdf_00153.pdf",
    "Separate City employment concentrations for Southwest Phoenix, Sky Harbor Airport, South Central Industrial, and Deer Valley."
  ),
  phoenixCityLimits: source(
    "phoenix-city-limit-map-service",
    "OFFICIAL_GEOGRAPHY",
    "City of Phoenix — City Limit and Annexation Boundaries",
    "https://maps.phoenix.gov/pub/rest/services/Public/STR_CityLimit_Annex_Boundaries/MapServer/info/iteminfo",
    "Municipal ownership boundary; this foundation excludes independently owned Valley municipalities."
  ),
  northPhoenixEconomicContext: source(
    "phoenix-district-1-advanced-operations",
    "OFFICIAL_ECONOMIC_DEVELOPMENT",
    "City of Phoenix — District 1: Powering Phoenix's Future",
    "https://www.phoenix.gov/administration/mayorcouncil/district1.html",
    "North Phoenix advanced-manufacturing, supplier, research, and Deer Valley aviation/employment context without asserting ordinary-property capability."
  ),
  phoenixBuildingRegistry: source(
    "rofo-phoenix-building-registry",
    "REPOSITORY_BUILDING_RECORD",
    "Rofo canonical Phoenix building registry",
    "data-sources/reference/company-buildings.json",
    "Canonical Phoenix ownership, paths, and Industrial classifications for retained building representatives."
  ),
  reviewedPublicDecision: source(
    "rofo-phoenix-industrial-public-decision",
    "REVIEWED_PUBLIC_GUIDANCE",
    "Rofo Phoenix Industrial public decision guide",
    "_data/phoenixIndustrialPublicDecision.js",
    "Reviewed public operating thesis and explicit investigation boundaries; retained as supporting evidence rather than certification by itself."
  ),
  tempeEvidence: source(
    "tempe-i10-independent-evidence",
    "REPOSITORY_EVIDENCE_FOUNDATION",
    "Rofo Tempe I-10 Industrial evidence collection",
    "data/commercial-market-evidence/tempe/tempe-i-10-industrial.js",
    "Confirms Tempe municipal ownership and its status as independently owned comparison context, not Phoenix evidence."
  ),
});

const candidates = Object.freeze({
  "southwest-phoenix-industrial": Object.freeze({
    geographyId: "southwest-phoenix-industrial",
    label: "Southwest Phoenix Industrial",
    municipality: "Phoenix",
    state: "AZ",
    publicOwnerId: "phx-southwest-phoenix-industrial",
    path: "/commercial-real-estate/AZ/phoenix/southwest-phoenix-industrial/",
    componentGeographyIds: Object.freeze(["southwest-phoenix-industrial"]),
    geographicThesis: "The City-recognized Southwest Phoenix employment geography within Phoenix city limits. West Phoenix Industrial may provide directional context but is not a separately ranked peer.",
    confidence: "REVIEWED",
    reviewStatus: "CERTIFIED_RECOMMENDATION_EVIDENCE",
    provenance: Object.freeze([sources.phoenixGeneralPlan, sources.phoenixGrowthArea, sources.phoenixCityLimits, sources.reviewedPublicDecision]),
    representatives: Object.freeze([
      representative({
        id: "1002-s-56th-ave",
        label: "1002 S 56th Avenue",
        kind: "BUILDING",
        path: "/commercial-real-estate/building/AZ/phoenix/1002-s-56th-ave/",
        ownerGeographyId: "southwest-phoenix-industrial",
        role: "Conventional Industrial and warehouse/service-operating reference",
        sources: [sources.phoenixBuildingRegistry, sources.reviewedPublicDecision, sources.phoenixGeneralPlan],
      }),
    ]),
  }),
  "airport-south-central-industrial": Object.freeze({
    geographyId: "airport-south-central-industrial",
    label: "Airport / South Central Industrial",
    municipality: "Phoenix",
    state: "AZ",
    publicOwnerId: "phx-airport-sky-harbor",
    path: null,
    publicContextPaths: Object.freeze([
      "/commercial-real-estate/AZ/phoenix/phoenix-airport-sky-harbor-area/",
    ]),
    componentGeographyIds: Object.freeze(["phoenix-airport-sky-harbor-area", "south-central-industrial", "cotton-center-south-airport"]),
    geographicThesis: "A bounded City-of-Phoenix operating family combining the officially recognized Sky Harbor Airport and South Central Industrial employment contexts with the reviewed Cotton Center/South Airport office-production context. It does not include Tempe or imply uniform airport-oriented capability.",
    confidence: "REVIEWED",
    reviewStatus: "CERTIFIED_RECOMMENDATION_EVIDENCE",
    provenance: Object.freeze([sources.phoenixGeneralPlan, sources.phoenixGrowthArea, sources.phoenixCityLimits, sources.reviewedPublicDecision]),
    representatives: Object.freeze([
      representative({
        id: "3241-e-washington-st",
        label: "3241 E Washington Street",
        kind: "BUILDING",
        path: "/commercial-real-estate/building/AZ/phoenix/3241-e-washington-st/",
        ownerGeographyId: "airport-south-central-industrial",
        role: "Central infill light-industrial and warehouse reference",
        sources: [sources.phoenixBuildingRegistry, sources.reviewedPublicDecision, sources.phoenixGeneralPlan],
      }),
      representative({
        id: "4625-e-cotton-center-blvd",
        label: "Cotton Flex Center — 4625 E Cotton Center Boulevard",
        kind: "BUILDING",
        path: "/commercial-real-estate/building/AZ/phoenix/4625-e-cotton-center-blvd/",
        ownerGeographyId: "airport-south-central-industrial",
        role: "Flex and office-production business-park reference",
        sources: [sources.phoenixBuildingRegistry, sources.reviewedPublicDecision, sources.phoenixGeneralPlan],
      }),
    ]),
  }),
  "north-phoenix-advanced-operations": Object.freeze({
    geographyId: "north-phoenix-advanced-operations",
    label: "North Phoenix Advanced Operations",
    municipality: "Phoenix",
    state: "AZ",
    publicOwnerId: "phx-north-phoenix-tsmc-corridor",
    path: null,
    publicContextPaths: Object.freeze([
      "/commercial-real-estate/AZ/phoenix/deer-valley/",
      "/commercial-real-estate/AZ/phoenix/north-phoenix-tsmc-corridor/",
    ]),
    componentGeographyIds: Object.freeze(["deer-valley", "north-phoenix-tsmc-corridor"]),
    geographicThesis: "A bounded City-of-Phoenix operating family joining Deer Valley's mixed Industrial/Flex and aerospace-support employment context with the North Phoenix semiconductor-manufacturing ecosystem. It is a specialized contextual alternative, not a claim that ordinary North Phoenix properties support advanced manufacturing.",
    confidence: "REVIEWED",
    reviewStatus: "CERTIFIED_RECOMMENDATION_EVIDENCE",
    provenance: Object.freeze([sources.phoenixGeneralPlan, sources.phoenixGrowthArea, sources.phoenixCityLimits, sources.northPhoenixEconomicContext, sources.reviewedPublicDecision]),
    representatives: Object.freeze([
      representative({
        id: "deer-valley-industrial-flex-environment",
        label: "Deer Valley Industrial/Flex Employment Environment",
        kind: "COMMERCIAL_ENVIRONMENT",
        path: "/commercial-real-estate/AZ/phoenix/deer-valley/",
        ownerGeographyId: "north-phoenix-advanced-operations",
        role: "Mixed Industrial/Flex, aerospace-support, service, and office-production environment",
        sources: [sources.phoenixGeneralPlan, sources.northPhoenixEconomicContext, sources.reviewedPublicDecision],
      }),
      representative({
        id: "north-phoenix-semiconductor-ecosystem",
        label: "North Phoenix Semiconductor Manufacturing Ecosystem",
        kind: "COMMERCIAL_ENVIRONMENT",
        path: "/commercial-real-estate/AZ/phoenix/north-phoenix-tsmc-corridor/",
        ownerGeographyId: "north-phoenix-advanced-operations",
        role: "Advanced-manufacturing, engineering, technical-operations, and supplier ecosystem context",
        sources: [sources.phoenixGeneralPlan, sources.northPhoenixEconomicContext, sources.reviewedPublicDecision],
      }),
    ]),
  }),
});

const evidence = Object.freeze({
  industrial: Object.freeze({
    "southwest-phoenix-industrial": Object.freeze({
      traits: Object.freeze(["CONVENTIONAL_INDUSTRIAL", "WAREHOUSE_STORAGE", "DISTRIBUTION", "CONTRACTOR_SERVICE", "BROADER_OPERATIONAL_USE"]),
      strengths: Object.freeze(["The clearest reviewed Phoenix starting environment for conventional warehouse, distribution, service-industrial, and broader Industrial operations.", "A durable City-recognized employment geography with a canonical Industrial representative."]),
      tradeoffs: Object.freeze(["The geography is broad and does not establish a uniform building format.", "All loading, circulation, yard, power, parking, and permitted-use requirements remain property investigations."]),
    }),
    "airport-south-central-industrial": Object.freeze({
      traits: Object.freeze(["CENTRAL_INFILL_INDUSTRIAL", "LIGHTER_WAREHOUSE", "CONTRACTOR_SERVICE", "SERVICE_DISTRIBUTION", "LIGHT_PRODUCTION"]),
      strengths: Object.freeze(["Reviewed Phoenix contexts support central infill warehouse, service-industrial, lighter production, and mixed operating formats.", "The two building representatives show both Industrial and office-production forms without treating the area as uniform."]),
      tradeoffs: Object.freeze(["Airport adjacency is identity context, not evidence of superior freight or airport performance.", "The operating family contains varied Office, Flex, service, and Industrial environments that require property-level validation."]),
    }),
    "north-phoenix-advanced-operations": Object.freeze({
      traits: Object.freeze(["ADVANCED_MANUFACTURING_CONTEXT", "TECHNICAL_OPERATIONS", "AEROSPACE_SUPPORT_CONTEXT", "PRODUCTION_ECOSYSTEM"]),
      strengths: Object.freeze(["Official City evidence supports a differentiated advanced-manufacturing, aerospace-support, supplier, and technical-operations ecosystem.", "It provides a reviewed specialized alternative to conventional warehouse-oriented Phoenix contexts."]),
      tradeoffs: Object.freeze(["Ecosystem presence does not establish specialized capability at an ordinary property.", "Conventional warehouse, logistics, and general service users may be better represented by the other Phoenix candidates."]),
    }),
  }),
  flex: Object.freeze({
    "southwest-phoenix-industrial": Object.freeze({
      traits: Object.freeze(["OFFICE_WAREHOUSE", "CONTRACTOR_SERVICE", "INDUSTRIAL_LED_FLEX"]),
      strengths: Object.freeze(["Industrial-led office/warehouse and service Flex investigation is supported within the broader operating geography."]),
      tradeoffs: Object.freeze(["The evidence does not establish a technical R&D or office-first Flex identity."]),
    }),
    "airport-south-central-industrial": Object.freeze({
      traits: Object.freeze(["OFFICE_PRODUCTION", "LIGHTER_FLEX", "CONTRACTOR_SERVICE", "SERVICE_DISTRIBUTION_HYBRID"]),
      strengths: Object.freeze(["Cotton Center and central infill evidence support lighter Flex, office-production, service, and operating hybrids."]),
      tradeoffs: Object.freeze(["Customer-facing suitability and the office-to-operational mix vary by property."]),
    }),
    "north-phoenix-advanced-operations": Object.freeze({
      traits: Object.freeze(["TECHNICAL_WORKSPACE", "R_AND_D_PRODUCTION_HYBRID", "ENGINEERING_OPERATIONS", "OFFICE_PRODUCTION"]),
      strengths: Object.freeze(["Deer Valley and the North Phoenix ecosystem support investigation of technical, engineering, R&D-adjacent, and office-production environments."]),
      tradeoffs: Object.freeze(["Laboratory, clean-room, power, ventilation, and specialized production requirements are not geography capabilities and require abstention or property diligence."]),
    }),
  }),
  mixed: Object.freeze({
    "southwest-phoenix-industrial": Object.freeze({ traits: Object.freeze(["OFFICE_WAREHOUSE", "CONTRACTOR_SERVICE", "INDUSTRIAL_LED_FLEX"]), evidenceBoundary: "Industrial-led mixed uses only; office proportion and customer-facing suitability remain property-specific." }),
    "airport-south-central-industrial": Object.freeze({ traits: Object.freeze(["OFFICE_PRODUCTION", "SERVICE_DISTRIBUTION_HYBRID", "LIGHT_PRODUCTION"]), evidenceBoundary: "Lighter operational and office-production mixes are supported; exact use mix and building function require investigation." }),
    "north-phoenix-advanced-operations": Object.freeze({ traits: Object.freeze(["R_AND_D_PRODUCTION_HYBRID", "ENGINEERING_OPERATIONS", "OFFICE_PRODUCTION"]), evidenceBoundary: "Technical mixed-use context is supported; specialized infrastructure and permitted capability are never inferred." }),
  }),
});

module.exports = Object.freeze({
  schemaVersion: "phoenix-industrial-flex-evidence-foundation:v1",
  scope: "EVIDENCE_ONLY_NO_RESOLVER_OR_ACTIVATION",
  futureMarketId: "phoenix-industrial-flex",
  recommendationBoundary: "CITY_OF_PHOENIX_ONLY",
  customerEntryPropertyType: "industrial_flex",
  evidenceCandidateIds: Object.freeze([
    "southwest-phoenix-industrial",
    "airport-south-central-industrial",
    "north-phoenix-advanced-operations",
  ]),
  candidates,
  evidence,
  representativeCount: 5,
  propertyVerification: PROPERTY_VERIFICATION,
  accessIntelligence: Object.freeze({ status: "INSUFFICIENT_FOR_RECOMMENDATION", limitation: ACCESS_LIMITATION }),
  tempeBoundary: Object.freeze({
    geographyId: "tempe-i-10-industrial",
    municipality: "Tempe",
    path: "/commercial-real-estate/AZ/tempe/tempe-i-10-industrial/",
    relationship: "INDEPENDENT_CONTEXT_NOT_A_PHOENIX_CANDIDATE",
    provenance: Object.freeze([sources.tempeEvidence, sources.phoenixCityLimits]),
  }),
  requirementSignalCompatibility: Object.freeze({
    status: "SUFFICIENT_WITH_ABSTENTION",
    supportedSignals: Object.freeze(["warehouse_storage", "receiving_distribution", "manufacturing_assembly", "contractor_service", "office_production", "r_and_d_technical_work", "showroom_customer_facing", "loading_importance", "vehicle_operations", "size", "growth", "industrial_flex_use_mix"]),
    nonRankingSignals: Object.freeze(["employee_origins", "customer_geography", "supplier_geography", "service_territory", "airport_access", "freeway_access", "commute"]),
  }),
  futureAbstentionBoundary: Object.freeze([
    "PHOENIX_METRO_OR_VALLEY_WIDE_COMPARISON",
    "TEMPE_OR_OTHER_INDEPENDENT_MUNICIPALITY",
    "DECISIVE_ACCESS_GEOGRAPHY",
    "EXACT_LOADING_CLEAR_HEIGHT_POWER_OR_YARD",
    "PERMITTED_USE_OR_HAZARDOUS_PROCESS_DEPENDENCY",
    "SPECIALIZED_MANUFACTURING_LAB_OR_CLEAN_ROOM_CAPABILITY",
    "UNRESOLVED_INDUSTRIAL_FLEX_INTENT",
    "CANDIDATES_CANNOT_BE_COMPARED_FAIRLY",
  ]),
  futureEntryContext: Object.freeze({
    canonicalRequirementAnchor: Object.freeze({ marketId: "phoenix-metro", city: "Phoenix", treatment: "CITY_QUALIFIED_MEMBERSHIP" }),
    accepted: Object.freeze([
      { marketId: "phoenix", candidateGeographyId: null, treatment: "COMPARISON_CONTEXT_ONLY" },
      { marketId: "phoenix", candidateGeographyId: "southwest-phoenix-industrial", treatment: "COMPARISON_CONTEXT_ONLY" },
      { marketId: "phoenix", candidateGeographyId: "airport-south-central-industrial", treatment: "COMPARISON_CONTEXT_ONLY" },
      { marketId: "phoenix", candidateGeographyId: "north-phoenix-advanced-operations", treatment: "COMPARISON_CONTEXT_ONLY" },
      { marketId: "phoenix", candidateGeographyId: "phoenix-airport-sky-harbor-area", treatment: "COMPARISON_CONTEXT_ONLY" },
      { marketId: "phoenix", candidateGeographyId: "deer-valley", treatment: "COMPARISON_CONTEXT_ONLY" },
      { marketId: "phoenix", candidateGeographyId: "north-phoenix-tsmc-corridor", treatment: "COMPARISON_CONTEXT_ONLY" },
    ]),
    rejectedMarketIds: Object.freeze(["generic-phoenix-metro-without-phoenix-city", "greater-phoenix", "tempe", "mesa", "chandler", "scottsdale", "glendale", "goodyear", "avondale"]),
  }),
  legacyDisposition: Object.freeze({
    reviewedRecommendationEvidence: Object.freeze(["City-recognized Phoenix employment identities and municipal ownership.", "Canonical Industrial records for 1002 S 56th Avenue, 3241 E Washington Street, and 4625 E Cotton Center Boulevard.", "Official advanced-manufacturing and Deer Valley employment context used only at environment level."]),
    calibrationHypothesis: Object.freeze(["Southwest Phoenix may lead conventional warehouse/distribution requirements.", "Airport / South Central may lead central infill, service, or lighter office-production requirements.", "North Phoenix may lead technical or advanced-operation requirements when specialized property capability is not decisive."]),
    publicEditorialContext: Object.freeze(["The reviewed Phoenix Industrial public decision guide supports orientation but does not certify recommendation behavior by itself.", "West Phoenix, Cotton Center, Deer Valley, and TSMC corridor descriptions remain component context beneath the three candidate identities."]),
    rejectedForLevel3: Object.freeze(["Legacy confidence values, Compass status, and generated comparison prose.", "Ordinal loading, truck-access, parking, power, clear-height, yard, airport, freeway, labor, or commute ratings.", "Any inference that a Phoenix property supports semiconductor fabrication, clean rooms, advanced manufacturing, laboratory work, or aerospace production.", "Any treatment of Tempe I-10 Industrial as Phoenix-owned or as a Phoenix recommendation candidate."]),
  }),
});
