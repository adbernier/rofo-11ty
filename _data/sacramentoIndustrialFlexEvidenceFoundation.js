const PROPERTY_VERIFICATION = "Representative buildings and environments illustrate durable operating character, not current availability or property capability. Loading, clear height, power, yard or outdoor storage, trailer parking, truck circulation, parking rights, ventilation, permitted use, hazardous-material capability, specialized manufacturing infrastructure, exact building format, and current availability require current property investigation.";

const ACCESS_LIMITATION = "Named corridors, airports, freeways, and transit may describe geography, but employee origins, customer and supplier geography, commute, service territory, regional distribution reach, and relative freeway, airport, or transit performance are not recommendation-grade comparative evidence in this foundation.";

const source = (id, type, title, location, supports) => Object.freeze({
  id, type, title, location, supports, reviewedOn: "2026-09-03",
});

const representative = ({ id, label, kind, path = null, ownerGeographyId, role, sources }) => Object.freeze({
  id, label, kind, path, ownerGeographyId, role,
  sources: Object.freeze(sources),
  confidence: "REVIEWED",
  reviewStatus: "APPROVED_FOR_EVIDENCE_FOUNDATION",
  availabilitySemantics: "REPRESENTATIVE_ONLY_NOT_AVAILABILITY",
  propertyVerification: PROPERTY_VERIFICATION,
});

const sources = Object.freeze({
  generalPlan: source(
    "sacramento-2040-general-plan-industrial",
    "OFFICIAL_PLANNING",
    "City of Sacramento 2040 General Plan — Land Use and Placemaking",
    "https://www.cityofsacramento.gov/content/dam/portal/cdd/Planning/adopted-2040-general-plan/2040%20GP_2-03_Land%20Use%20and%20Placemaking_Adopted.pdf",
    "Establishes Power Inn Road as Sacramento's largest concentration of industrial uses and recognizes City industrial clusters in North Natomas and North Sacramento; it supports durable operating character, not property capability."
  ),
  powerInnDistrict: source(
    "sacramento-power-inn-pbid",
    "OFFICIAL_DISTRICT",
    "City of Sacramento — Power Inn Area Property and Business Improvement District",
    "https://www.cityofsacramento.gov/finance/infrastructure-finance/special-districts/annual-service-districts",
    "Confirms Power Inn as a named City of Sacramento commercial and industrial corridor."
  ),
  sciPlan: source(
    "sacramento-sci-specific-plan",
    "OFFICIAL_SPECIFIC_PLAN",
    "City of Sacramento — Sacramento Center for Innovation Specific Plan",
    "https://www.cityofsacramento.gov/content/dam/portal/cdd/Planning/Long-Range/SCI-Specific-Plan_Amended_1-23-18.pdf",
    "Defines SCI and Ramona-area components and describes SCI as a distinct district within the larger Power Inn Alliance area; this supports component context and rejects SCI/Ramona as an independent peer to Power Inn."
  ),
  northNatomasPlan: source(
    "sacramento-north-natomas-community-plan",
    "OFFICIAL_COMMUNITY_PLAN",
    "City of Sacramento 2040 General Plan — North Natomas Community Plan",
    "https://www.cityofsacramento.gov/content/dam/portal/cdd/Planning/adopted-2040-general-plan/2040%20GP_3-11f_North%20Natomas_Adopted.pdf",
    "Confirms North Natomas as a City planning area with trade, transportation, and utilities employment context; broad Natomas alone is not treated as the bounded recommendation geography."
  ),
  northgateEir: source(
    "sacramento-northgate-industrial-park-eir",
    "OFFICIAL_ENVIRONMENTAL_REVIEW",
    "City of Sacramento — Northgate Industrial Park Initial Study/Mitigated Negative Declaration",
    "https://www.cityofsacramento.gov/content/dam/portal/cdd/Planning/Environmental-Impact-Reports/Northgate-Industrial-Park/Final-Initial-Study-Mitigated-Negative-Declaration-for-the-Northgate-Industrial-Park-Project.pdf",
    "Confirms a bounded North Sacramento warehouse/light-industrial project context amid industrial, commercial, and office uses."
  ),
  publicDecision: source(
    "rofo-sacramento-industrial-public-decision",
    "REPOSITORY_PUBLIC_CONTEXT",
    "Rofo Sacramento Industrial public decision guide",
    "_data/sacramentoIndustrialPublicDecision.js",
    "Reviewed public orientation and representative discovery; access, parking, loading, and availability language is excluded from recommendation evidence."
  ),
  geographyGraph: source(
    "rofo-sacramento-location-knowledge-graph",
    "REPOSITORY_GEOGRAPHY",
    "Rofo location knowledge graph",
    "_data/locationKnowledgeGraph.js",
    "Existing City-owned Power Inn Industrial and Natomas identities and public routes; legacy comparative traits are not promoted."
  ),
  canonicalBuildings: source(
    "rofo-sacramento-canonical-building-registry",
    "REPOSITORY_BUILDING_RECORD",
    "Rofo canonical building registry",
    "data-sources/reference/company-buildings.json",
    "Canonical Sacramento paths and Industrial classifications for retained building representatives."
  ),
  historicalCorpus: source(
    "rofo-sacramento-historical-property-corpus",
    "HISTORICAL_PROPERTY_DISCOVERY",
    "Rofo historical building semantic identity corpus",
    "data/peter/derived/building_semantic_identity_v1.csv",
    "Discovery evidence for repeated Power Inn, Northgate, North Market, and Ramona property identities; historical listing facts are not current evidence."
  ),
});

const candidates = Object.freeze({
  "power-inn-industrial": Object.freeze({
    geographyId: "power-inn-industrial",
    label: "Power Inn Industrial",
    municipality: "Sacramento",
    state: "CA",
    parentMarketId: "sacramento",
    publicOwnerId: "sacramento",
    path: "/commercial-real-estate/CA/sacramento/power-inn-industrial/",
    componentGeographyIds: Object.freeze(["florin-perkins-industrial", "sci-ramona-component"]),
    geographicThesis: "A City of Sacramento industrial corridor centered on the established Power Inn area, including reviewed Florin-Perkins operating context. SCI/Ramona remains a component context within the larger Power Inn area, not a separately ranked peer.",
    confidence: "REVIEWED",
    reviewStatus: "CERTIFIED_RECOMMENDATION_EVIDENCE",
    provenance: Object.freeze([sources.generalPlan, sources.powerInnDistrict, sources.sciPlan, sources.geographyGraph]),
    representatives: Object.freeze([
      representative({ id: "8583-elder-creek-rd", label: "8583 Elder Creek Road", kind: "BUILDING", path: "/commercial-real-estate/building/CA/sacramento/8583-elder-creek-rd/", ownerGeographyId: "power-inn-industrial", role: "Conventional Industrial and warehouse operating-format reference", sources: [sources.canonicalBuildings, sources.publicDecision, sources.generalPlan] }),
      representative({ id: "5711-florin-perkins-rd", label: "5711 Florin Perkins Road", kind: "BUILDING", path: "/commercial-real-estate/building/CA/sacramento/5711-florin-perkins-rd/", ownerGeographyId: "power-inn-industrial", role: "Industrial/service and office/warehouse-format reference in the Florin-Perkins component context", sources: [sources.canonicalBuildings, sources.publicDecision, sources.powerInnDistrict] }),
    ]),
  }),
  "northgate-north-market-industrial": Object.freeze({
    geographyId: "northgate-north-market-industrial",
    label: "Northgate / North Market Industrial",
    municipality: "Sacramento",
    state: "CA",
    parentMarketId: "sacramento",
    publicOwnerId: "sacramento",
    path: null,
    componentGeographyIds: Object.freeze(["northgate-industrial-park", "north-market-boulevard", "natomas-public-context"]),
    geographicThesis: "A bounded City of Sacramento northern warehouse, light-industrial, service-industrial, and office/warehouse environment centered on the established Northgate and North Market Boulevard clusters. It uses Natomas as public context without claiming all Natomas or North Sacramento as one commercial geography.",
    confidence: "REVIEWED",
    reviewStatus: "CERTIFIED_RECOMMENDATION_EVIDENCE",
    provenance: Object.freeze([sources.generalPlan, sources.northNatomasPlan, sources.northgateEir, sources.geographyGraph, sources.historicalCorpus]),
    representatives: Object.freeze([
      representative({ id: "1329-n-market-blvd", label: "1329 N Market Boulevard", kind: "BUILDING", path: "/commercial-real-estate/building/CA/sacramento/1329-n-market-blvd/", ownerGeographyId: "northgate-north-market-industrial", role: "Northern Sacramento Industrial and multi-tenant operating-format reference", sources: [sources.canonicalBuildings, sources.publicDecision, sources.historicalCorpus] }),
      representative({ id: "northgate-north-market-industrial-environment", label: "Northgate / North Market Industrial Environment", kind: "COMMERCIAL_ENVIRONMENT", ownerGeographyId: "northgate-north-market-industrial", role: "Warehouse, light-industrial, service-industrial, and office/warehouse commercial environment", sources: [sources.northgateEir, sources.generalPlan, sources.historicalCorpus] }),
    ]),
  }),
});

const evidence = Object.freeze({
  industrial: Object.freeze({
    "power-inn-industrial": Object.freeze({
      traits: Object.freeze(["CONVENTIONAL_INDUSTRIAL", "WAREHOUSE_DISTRIBUTION", "MANUFACTURING_PRODUCTION_CONTEXT", "CONTRACTOR_SERVICE", "BROADER_OPERATIONAL_USE", "OFFICE_WAREHOUSE"]),
      strengths: Object.freeze(["The City's deepest reviewed industrial concentration supports conventional Industrial, warehouse/distribution, production, contractor/service, and broader operational investigation.", "The Power Inn and Florin-Perkins context provides a customer-explainable Industrial-led operating environment without relying on an individual property's current configuration."]),
      tradeoffs: Object.freeze(["The geography does not establish that any property satisfies loading, power, yard, circulation, parking, or permitted-use requirements.", "SCI/Ramona is component context rather than a separate peer, so the foundation does not imply distinct coverage within every part of the wider Power Inn area."]),
    }),
    "northgate-north-market-industrial": Object.freeze({
      traits: Object.freeze(["WAREHOUSE_LIGHT_INDUSTRIAL", "SERVICE_INDUSTRIAL", "CONTRACTOR_SERVICE", "OFFICE_WAREHOUSE", "DISTRIBUTION_CONTEXT", "MULTI_TENANT_OPERATING_FORMATS"]),
      strengths: Object.freeze(["Official Northgate project evidence and the North Market property cluster support a northern City warehouse/light-industrial and service operating environment.", "The reviewed evidence supports conventional and lighter multi-tenant operating formats without treating all Natomas as a single Industrial district."]),
      tradeoffs: Object.freeze(["The evidence does not establish a uniform light-industrial or small-format inventory across the geography.", "Relative airport, freeway, customer, employee, and regional-distribution performance is outside this foundation."]),
    }),
  }),
  flex: Object.freeze({
    "power-inn-industrial": Object.freeze({
      traits: Object.freeze(["INDUSTRIAL_LED_FLEX", "CONTRACTOR_SERVICE", "OFFICE_WAREHOUSE", "PRODUCTION_FLEX"]),
      strengths: Object.freeze(["Industrial-led office/warehouse, contractor/service, and production-oriented Flex investigation is supported within the broader Power Inn environment."]),
      tradeoffs: Object.freeze(["The evidence does not establish a broad office-first or uniformly smaller-format Flex inventory."]),
    }),
    "northgate-north-market-industrial": Object.freeze({
      traits: Object.freeze(["LIGHTER_FLEX", "SERVICE_INDUSTRIAL", "CONTRACTOR_SERVICE", "OFFICE_WAREHOUSE", "MULTI_TENANT_FLEX"]),
      strengths: Object.freeze(["The industrial-commercial-office mix and repeated North Market property identities support lighter Flex, service, and office/warehouse investigation."]),
      tradeoffs: Object.freeze(["Exact unit size, office ratio, parking, loading, and permitted use remain property-specific."]),
    }),
  }),
  mixed: Object.freeze({
    "power-inn-industrial": Object.freeze({ traits: Object.freeze(["OFFICE_WAREHOUSE", "CONTRACTOR_SERVICE", "PRODUCTION_OPERATIONS"]), evidenceBoundary: "Industrial-led mixed uses are supported; customer-facing intensity and exact office/operational mix require property investigation." }),
    "northgate-north-market-industrial": Object.freeze({ traits: Object.freeze(["OFFICE_WAREHOUSE", "SERVICE_INDUSTRIAL", "LIGHTER_OPERATIONS", "MULTI_TENANT_FLEX"]), evidenceBoundary: "Lighter and service-oriented mixed formats are supported; exact use mix and building configuration remain property-specific." }),
  }),
});

module.exports = Object.freeze({
  schemaVersion: "sacramento-industrial-flex-evidence-foundation:v1",
  scope: "EVIDENCE_ONLY_NO_RESOLVER_OR_ACTIVATION",
  evidenceDecision: "EVIDENCE_READY_IMPLEMENT_SMALLER_UNIVERSE",
  certificationStatus: "certified_for_bounded_real_user_cohort",
  recommendationBoundary: "CITY_OF_SACRAMENTO_TWO_PEER_ONLY",
  futureMarketId: "sacramento-industrial-flex",
  customerEntryPropertyType: "industrial_flex",
  evidenceCandidateIds: Object.freeze(["power-inn-industrial", "northgate-north-market-industrial"]),
  candidates,
  evidence,
  representativeCount: 4,
  propertyVerification: PROPERTY_VERIFICATION,
  accessIntelligence: Object.freeze({ status: "INSUFFICIENT_FOR_RECOMMENDATION", limitation: ACCESS_LIMITATION }),
  requirementSignalCompatibility: Object.freeze({
    status: "SUFFICIENT_WITH_ABSTENTION",
    powerInnLeading: Object.freeze(["manufacturing_assembly", "broader_industrial_operation", "warehouse_storage", "industrial_led_office_warehouse"]),
    northgateNorthMarketLeading: Object.freeze(["contractor_service", "lighter_flex", "office_warehouse", "service_industrial", "multi_tenant_operating_format"]),
    overlapping: Object.freeze(["warehouse_storage", "receiving_distribution", "contractor_service", "office_warehouse"]),
    nonRankingSignals: Object.freeze(["freeway_access", "airport_access", "transit", "employee_origins", "customer_geography", "supplier_geography", "rent", "availability", "exact_loading"]),
  }),
  historicalPropertyAudit: Object.freeze({
    corpus: "data/peter/derived/building_semantic_identity_v1.csv",
    sacramentoSemanticPropertyRecords: 1635,
    sacramentoUniqueNormalizedAddresses: 1346,
    sacramentoRecordsWithHistoricalEvidence: 1545,
    sacramentoHistoricalEvidenceObservations: 7980,
    powerInnDiscoveryRecords: 62,
    powerInnDiscoveryUniqueAddresses: 54,
    powerInnDiscoveryRecordsWithEvidence: 57,
    powerInnHistoricalEvidenceObservations: 303,
    northgateNorthMarketDiscoveryRecords: 44,
    northgateNorthMarketDiscoveryUniqueAddresses: 31,
    northgateNorthMarketRecordsWithEvidence: 41,
    northgateNorthMarketHistoricalEvidenceObservations: 208,
    ramonaDiscoveryRecords: 5,
    ramonaUniqueAddresses: 5,
    ramonaHistoricalEvidenceObservations: 40,
    limitation: "Name and corridor queries are discovery-only, contain duplicate and suite noise, and do not establish boundaries, current availability, or current property capability.",
  }),
  geographyReconciliation: Object.freeze({
    surviving: Object.freeze(["power-inn-industrial", "northgate-north-market-industrial"]),
    componentOnly: Object.freeze([{ id: "sci-ramona", parent: "power-inn-industrial", reason: "The official SCI Specific Plan describes SCI as a distinct district within the larger Power Inn Alliance area; ranking it against Power Inn would compare a component with its parent." }]),
    rejectedBroadLabels: Object.freeze(["natomas-north-sacramento", "north-sacramento-industrial", "sacramento-metro-industrial"]),
  }),
  ownershipReconciliation: Object.freeze({
    retainedCityRepresentativeIds: Object.freeze(["8583-elder-creek-rd", "5711-florin-perkins-rd", "1329-n-market-blvd", "northgate-north-market-industrial-environment"]),
    rejectedFromCityUniverse: Object.freeze([
      { id: "3100-ramco-st", municipality: "West Sacramento", reason: "Independent municipality; public contextual evidence cannot represent a City of Sacramento candidate." },
      { id: "2928-ramco-st", municipality: "West Sacramento", reason: "Independent municipality; excluded from City recommendation evidence." },
      { id: "3380-industrial-blvd", municipality: "West Sacramento", reason: "Independent municipality; excluded from City recommendation evidence." },
      { id: "11201-sun-center-dr", municipality: "Rancho Cordova", reason: "Independent municipality; excluded from City recommendation evidence." },
      { id: "11353-pyrites-way", municipality: "Rancho Cordova", reason: "Independent municipality; excluded from City recommendation evidence." },
    ]),
  }),
  futureAbstentionBoundary: Object.freeze(["SACRAMENTO_METRO_OR_REGIONAL_COMPARISON", "INDEPENDENT_OR_UNSUPPORTED_MUNICIPALITY", "DECISIVE_ACCESS_GEOGRAPHY", "EXACT_LOADING_CLEAR_HEIGHT_POWER_OR_YARD", "PERMITTED_USE_OR_HAZARDOUS_PROCESS_DEPENDENCY", "SPECIALIZED_MANUFACTURING_CAPABILITY", "EXACT_PROPERTY_FORMAT_DEPENDENCY", "UNRESOLVED_INDUSTRIAL_FLEX_INTENT", "CANDIDATES_CANNOT_BE_COMPARED_FAIRLY"]),
  futureEntryContext: Object.freeze({
    accepted: Object.freeze([
      { marketId: "sacramento", candidateGeographyId: null, treatment: "COMPARISON_CONTEXT_ONLY" },
      { marketId: "sacramento", candidateGeographyId: "power-inn-industrial", treatment: "COMPARISON_CONTEXT_ONLY" },
      { marketId: "sacramento", candidateGeographyId: "florin-perkins-industrial", treatment: "COMPARISON_CONTEXT_ONLY" },
      { marketId: "sacramento", candidateGeographyId: "sci-ramona-component", treatment: "COMPARISON_CONTEXT_ONLY" },
      { marketId: "sacramento", candidateGeographyId: "northgate-north-market-industrial", treatment: "COMPARISON_CONTEXT_ONLY" },
      { marketId: "sacramento", candidateGeographyId: "northgate-industrial-park", treatment: "COMPARISON_CONTEXT_ONLY" },
      { marketId: "sacramento", candidateGeographyId: "north-market-boulevard", treatment: "COMPARISON_CONTEXT_ONLY" },
    ]),
    rejectedMarketIds: Object.freeze(["sacramento-metro", "west-sacramento", "rancho-cordova", "elk-grove", "roseville", "rocklin", "folsom", "citrus-heights", "northern-california"]),
  }),
  publicSurfaceCompatibility: Object.freeze({
    "power-inn-industrial": Object.freeze({ publicGeographyPage: true, cityPageMention: true, propertyTypeMention: true, reviewedRepresentatives: 2 }),
    "northgate-north-market-industrial": Object.freeze({ publicGeographyPage: false, cityPageMention: true, propertyTypeMention: true, existingContextPath: "/commercial-real-estate/CA/sacramento/natomas/", reviewedRepresentatives: 2 }),
  }),
  legacyDisposition: Object.freeze({
    reviewedRecommendationEvidence: Object.freeze(["Official Power Inn commercial/industrial identity and City industrial concentration.", "Official Northgate warehouse/light-industrial context and bounded North Market historical property cluster.", "Canonical City of Sacramento building identities for the three retained buildings."]),
    calibrationHypothesis: Object.freeze(["Power Inn may lead broader Industrial, production, and Industrial-led operational Requirements.", "Northgate / North Market may lead lighter Flex, contractor/service, multi-tenant, and office/warehouse Requirements."]),
    publicEditorialContext: Object.freeze(["Broad Natomas and North Sacramento language remains public context rather than a single recommendation candidate.", "Legacy Sacramento Industrial guide prose remains orientation, not recommendation evidence by itself."]),
    historicalPropertyDiscovery: Object.freeze(["Power Inn, Florin-Perkins, Northgate, North Market, and Ramona semantic-property clusters generated geography and representative candidates only."]),
    rejectedForLevel3: Object.freeze(["SCI/Ramona as a peer ranked against its larger Power Inn parent.", "Legacy access, loading, parking, cost, and availability comparisons.", "West Sacramento and Rancho Cordova representatives as City of Sacramento evidence.", "Historical listing facts presented as current property facts."]),
  }),
});
