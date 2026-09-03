const PROPERTY_VERIFICATION = "Representative buildings and environments illustrate durable operating character, not current availability or property capability. Loading, clear height, power, yard or outdoor storage, trailer parking, truck circulation, parking rights, permitted use, ventilation, hazardous-material capability, and specialized manufacturing infrastructure require current property investigation.";

const ACCESS_LIMITATION = "Airport adjacency and named corridors may describe geography, but employee origins, customer and supplier geography, service territory, labor access, commute, and relative airport or interstate performance are not recommendation-grade comparative evidence in this foundation.";

const source = (id, type, title, location, supports) => Object.freeze({
  id,
  type,
  title,
  location,
  supports,
  reviewedOn: "2026-09-03",
});

const representative = ({ id, label, kind, path = null, ownerGeographyId, role, sources }) => Object.freeze({
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
  indyNeighborhoods: source(
    "indy-official-neighborhood-areas",
    "OFFICIAL_GEOGRAPHY",
    "City of Indianapolis — Open Indy neighborhood areas",
    "https://gis.indy.gov/server/rest/services/ArcGISOnline/CityWideInvestments/MapServer/legend",
    "Recognizes Park 100, Park Fletcher, and Stout Field as separately named Indianapolis geographies; establishes municipal identity without certifying operating fit."
  ),
  parkFletcherParcel: source(
    "indy-park-fletcher-industrial-parcel",
    "OFFICIAL_PROPERTY_RECORD",
    "Indianapolis/Marion County property record — Park Fletcher Industrial & Research Center",
    "https://maps.indy.gov/AssessorPropertyCards.Reports.Service/ReportPage.aspx?ParcelNumber=9041987",
    "Confirms a durable Indianapolis-owned Park Fletcher industrial/research identity; current property capability and availability are excluded."
  ),
  park100OwnerIndustrial: source(
    "prologis-park-100-industrial-records",
    "OWNER_PROPERTY_RECORD",
    "Prologis — Park 100 industrial property records",
    "https://www.prologis.com/industrial-properties/building/ind00330-prologis-park-100-building-30",
    "Confirms Park 100 as an Indianapolis industrial property family with both smaller and larger operating formats; current suite and capability claims are excluded."
  ),
  park100OwnerFlex: source(
    "orton-northwest-seven-park-100",
    "OWNER_PROPERTY_RECORD",
    "Orton Development — Northwest Seven at Park 100",
    "https://www.ortondevelopment.com/northwest-seven-at-park-100",
    "Confirms seven single-story multi-tenant office/Flex buildings within Park 100 and supports a durable Flex operating environment."
  ),
  rofoHistoricalBuildings: source(
    "rofo-indianapolis-historical-building-identity",
    "REPOSITORY_HISTORICAL_BUILDING_CORPUS",
    "Rofo historical building semantic identity corpus",
    "data/peter/derived/building_semantic_identity_v1.json",
    "Discovery evidence for repeated Park 100 property identities and formats; historical listing language is not current property or availability evidence."
  ),
  rofoCanonicalBuildings: source(
    "rofo-indianapolis-canonical-building-registry",
    "REPOSITORY_BUILDING_RECORD",
    "Rofo canonical building registry",
    "data-sources/reference/company-buildings.json",
    "Canonical Indianapolis paths and Industrial classifications for retained building representatives."
  ),
  existingAirportEvidence: source(
    "rofo-indianapolis-airport-logistics-evidence",
    "REPOSITORY_EVIDENCE_COLLECTION",
    "Indianapolis Airport Logistics commercial-market evidence",
    "data/commercial-market-evidence/indianapolis/indianapolis-airport-logistics.js",
    "Existing reviewed warehouse, distribution, service-industrial, and property-verification context after municipal ownership reconciliation."
  ),
});

const candidates = Object.freeze({
  "indianapolis-airport-logistics": Object.freeze({
    geographyId: "indianapolis-airport-logistics",
    label: "Indianapolis Airport Logistics",
    municipality: "Indianapolis",
    state: "IN",
    publicOwnerId: "indianapolis",
    path: "/commercial-real-estate/IN/indianapolis/indianapolis-airport-logistics/",
    componentGeographyIds: Object.freeze(["park-fletcher", "stout-field"]),
    geographicThesis: "A bounded City of Indianapolis west/southwest Industrial operating context associated with the City-recognized Park Fletcher and Stout Field geographies. It excludes independently owned Plainfield and does not claim a complete airport-region or Indianapolis-metro comparison.",
    confidence: "REVIEWED",
    reviewStatus: "CERTIFIED_RECOMMENDATION_EVIDENCE",
    provenance: Object.freeze([sources.indyNeighborhoods, sources.parkFletcherParcel, sources.existingAirportEvidence]),
    representatives: Object.freeze([
      representative({
        id: "4557-w-bradbury-ave",
        label: "4557 W Bradbury Avenue",
        kind: "BUILDING",
        path: "/commercial-real-estate/building/IN/indianapolis/4557-w-bradbury-ave/",
        ownerGeographyId: "indianapolis-airport-logistics",
        role: "Conventional warehouse and service-industrial reference within the Stout Field/Park Fletcher operating context",
        sources: [sources.rofoCanonicalBuildings, sources.existingAirportEvidence, sources.indyNeighborhoods],
      }),
      representative({
        id: "park-fletcher-stout-field-industrial-environment",
        label: "Park Fletcher / Stout Field Industrial Environment",
        kind: "COMMERCIAL_ENVIRONMENT",
        ownerGeographyId: "indianapolis-airport-logistics",
        role: "Indianapolis-owned warehouse, distribution, and industrial/research operating environment",
        sources: [sources.indyNeighborhoods, sources.parkFletcherParcel, sources.existingAirportEvidence],
      }),
    ]),
  }),
  "park-100-northwest-indianapolis": Object.freeze({
    geographyId: "park-100-northwest-indianapolis",
    label: "Park 100 / Northwest Indianapolis",
    municipality: "Indianapolis",
    state: "IN",
    publicOwnerId: "indianapolis",
    path: null,
    componentGeographyIds: Object.freeze(["park-100"]),
    geographicThesis: "The City-recognized Park 100 neighborhood and business-park environment in northwest Indianapolis. The descriptive operating envelope includes the established Zionsville Road, Woodland Drive, W 71st–82nd Street, Moller Road, and Winton Drive cluster, but parcel membership must follow the official City geography rather than proximity alone.",
    confidence: "REVIEWED",
    reviewStatus: "CERTIFIED_RECOMMENDATION_EVIDENCE",
    provenance: Object.freeze([sources.indyNeighborhoods, sources.park100OwnerIndustrial, sources.park100OwnerFlex, sources.rofoHistoricalBuildings]),
    representatives: Object.freeze([
      representative({
        id: "7601-winton-dr",
        label: "7601 Winton Drive",
        kind: "BUILDING",
        path: "/commercial-real-estate/building/IN/indianapolis/7601-winton-dr/",
        ownerGeographyId: "park-100-northwest-indianapolis",
        role: "Park 100 warehouse/distribution reference reassigned from the legacy Airport Logistics grouping",
        sources: [sources.rofoCanonicalBuildings, sources.rofoHistoricalBuildings, sources.indyNeighborhoods],
      }),
      representative({
        id: "park-100-multitenant-industrial-flex-environment",
        label: "Park 100 Multi-Tenant Industrial/Flex Environment",
        kind: "COMMERCIAL_ENVIRONMENT",
        ownerGeographyId: "park-100-northwest-indianapolis",
        role: "Industrial, office/warehouse, and smaller-format multi-tenant Flex operating environment",
        sources: [sources.park100OwnerIndustrial, sources.park100OwnerFlex, sources.rofoHistoricalBuildings],
      }),
    ]),
  }),
});

const evidence = Object.freeze({
  industrial: Object.freeze({
    "indianapolis-airport-logistics": Object.freeze({
      traits: Object.freeze(["CONVENTIONAL_INDUSTRIAL", "WAREHOUSE_DISTRIBUTION", "REGIONAL_LOGISTICS_CONTEXT", "SERVICE_INDUSTRIAL", "BROADER_OPERATIONAL_USE"]),
      strengths: Object.freeze(["The Indianapolis-owned Park Fletcher/Stout Field context supports warehouse, distribution, service-industrial, and broader operational investigation.", "This is the more logistics-led of the two reviewed City candidates when the Requirement establishes distribution or broader Industrial intent independently of exact access."]),
      tradeoffs: Object.freeze(["Airport identity is context, not evidence that this geography provides superior airport, highway, labor, supplier, or customer access.", "Loading, circulation, clear height, yard, power, parking, and permitted use remain property investigations."]),
    }),
    "park-100-northwest-indianapolis": Object.freeze({
      traits: Object.freeze(["CONVENTIONAL_INDUSTRIAL", "WAREHOUSE_DISTRIBUTION", "SERVICE_INDUSTRIAL", "CONTRACTOR_SERVICE", "OFFICE_WAREHOUSE", "MULTI_TENANT_OPERATING_FORMATS"]),
      strengths: Object.freeze(["The official Park 100 identity and reviewed owner records support a durable, established Industrial and multi-tenant operating environment.", "Repeated historical property identities support Industrial depth without treating old listing claims as current facts."]),
      tradeoffs: Object.freeze(["Park 100 also contains larger Industrial formats, so it is not simply a small-space alternative to Airport Logistics.", "Building format, loading, power, parking, use, and availability vary and require current investigation."]),
    }),
  }),
  flex: Object.freeze({
    "indianapolis-airport-logistics": Object.freeze({
      traits: Object.freeze(["INDUSTRIAL_LED_FLEX", "OFFICE_WAREHOUSE", "SERVICE_INDUSTRIAL"]),
      strengths: Object.freeze(["Industrial-led office/warehouse and service uses can be investigated within the reviewed operating context."]),
      tradeoffs: Object.freeze(["The evidence does not establish a broad office-first or smaller-format Flex ecosystem."]),
    }),
    "park-100-northwest-indianapolis": Object.freeze({
      traits: Object.freeze(["SMALLER_FORMAT_FLEX", "OFFICE_WAREHOUSE", "CONTRACTOR_SERVICE", "MULTI_TENANT_FLEX", "LIGHTER_OPERATIONS"]),
      strengths: Object.freeze(["Reviewed multi-tenant office/Flex evidence supports lighter operations, contractor/service, and office/warehouse investigation."]),
      tradeoffs: Object.freeze(["Individual properties range from small Flex to conventional Industrial; the geography does not guarantee a particular size or office/warehouse ratio."]),
    }),
  }),
  mixed: Object.freeze({
    "indianapolis-airport-logistics": Object.freeze({ traits: Object.freeze(["OFFICE_WAREHOUSE", "SERVICE_INDUSTRIAL", "DISTRIBUTION_OPERATIONS"]), evidenceBoundary: "Industrial-led mixed uses only; exact office proportion and operational capability require property investigation." }),
    "park-100-northwest-indianapolis": Object.freeze({ traits: Object.freeze(["OFFICE_WAREHOUSE", "CONTRACTOR_SERVICE", "LIGHTER_OPERATIONS", "MULTI_TENANT_FLEX"]), evidenceBoundary: "Lighter and multi-tenant mixed formats are supported; exact use mix, size, and capability remain property-specific." }),
  }),
});

module.exports = Object.freeze({
  schemaVersion: "indianapolis-industrial-flex-evidence-foundation:v1",
  scope: "EVIDENCE_ONLY_NO_RESOLVER_OR_ACTIVATION",
  recommendationBoundary: "CITY_OF_INDIANAPOLIS_TWO_PEER_ONLY",
  futureMarketId: "indianapolis-industrial-flex",
  customerEntryPropertyType: "industrial_flex",
  evidenceCandidateIds: Object.freeze(["indianapolis-airport-logistics", "park-100-northwest-indianapolis"]),
  candidates,
  evidence,
  representativeCount: 4,
  propertyVerification: PROPERTY_VERIFICATION,
  accessIntelligence: Object.freeze({ status: "INSUFFICIENT_FOR_RECOMMENDATION", limitation: ACCESS_LIMITATION }),
  requirementSignalCompatibility: Object.freeze({
    status: "SUFFICIENT_WITH_ABSTENTION",
    airportLogisticsLeading: Object.freeze(["warehouse_storage", "receiving_distribution", "regional_distribution", "broader_industrial_operation"]),
    park100Leading: Object.freeze(["contractor_service", "office_warehouse", "smaller_format_flex", "lighter_operations", "mixed_office_operational_use"]),
    nonRankingSignals: Object.freeze(["airport_access", "freeway_access", "employee_origins", "customer_geography", "supplier_geography", "service_territory", "rent", "availability", "exact_loading"]),
  }),
  historicalBuildingAudit: Object.freeze({
    corpus: "data/peter/derived/building_semantic_identity_v1.json",
    indianapolisEntities: 2155,
    indianapolisEntitiesWithHistoricalListingEvidence: 2009,
    explicitPark100EntityRecords: 10,
    explicitPark100UniqueAddresses: 7,
    explicitPark100RecordsWithHistoricalEvidence: 9,
    explicitPark100HistoricalListingEvidenceCount: 29,
    duplicateOrAmbiguousEntityRecords: 3,
    usableAddressRecords: 10,
    canonicalCurrentPark100BuildingRecords: 1,
    park100FieldPhotoSubjects: 0,
    broaderNorthwestDiscoveryEntities: 98,
    broaderNorthwestEntitiesWithHistoricalEvidence: 94,
    limitation: "The broad northwest query is discovery-only and includes false positives; only explicit Park 100 identities and independently verified ownership may support representatives.",
  }),
  ownershipReconciliation: Object.freeze({
    retainedAirportRepresentativeIds: Object.freeze(["4557-w-bradbury-ave", "park-fletcher-stout-field-industrial-environment"]),
    reassignedToPark100: Object.freeze(["7601-winton-dr"]),
    rejectedFromCityUniverse: Object.freeze([{ id: "558-airtech-parkway", reason: "Authoritative owner and public records identify the property in Plainfield, Indiana; it cannot represent a City of Indianapolis candidate." }]),
  }),
  futureAbstentionBoundary: Object.freeze(["INDIANAPOLIS_METRO_OR_REGIONAL_COMPARISON", "UNSUPPORTED_MUNICIPALITY", "DECISIVE_ACCESS_GEOGRAPHY", "EXACT_LOADING_CLEAR_HEIGHT_POWER_OR_YARD", "PERMITTED_USE_OR_HAZARDOUS_PROCESS_DEPENDENCY", "SPECIALIZED_MANUFACTURING_CAPABILITY", "UNRESOLVED_INDUSTRIAL_FLEX_INTENT", "CANDIDATES_CANNOT_BE_COMPARED_FAIRLY"]),
  futureEntryContext: Object.freeze({
    accepted: Object.freeze([
      { marketId: "indianapolis", candidateGeographyId: null, treatment: "COMPARISON_CONTEXT_ONLY" },
      { marketId: "indianapolis", candidateGeographyId: "indianapolis-airport-logistics", treatment: "COMPARISON_CONTEXT_ONLY" },
      { marketId: "indianapolis", candidateGeographyId: "park-100-northwest-indianapolis", treatment: "COMPARISON_CONTEXT_ONLY" },
    ]),
    rejectedMarketIds: Object.freeze(["indianapolis-metro", "plainfield", "whitestown", "lebanon", "brownsburg", "greenwood", "carmel", "fishers"]),
  }),
  legacyDisposition: Object.freeze({
    reviewedRecommendationEvidence: Object.freeze(["Official City identities for Park 100, Park Fletcher, and Stout Field.", "Canonical Indianapolis Industrial record for 4557 W Bradbury Avenue.", "Canonical Indianapolis Industrial record for 7601 Winton Drive, reassigned to Park 100.", "Reviewed owner evidence for Park 100 Industrial and multi-tenant office/Flex environments."]),
    calibrationHypothesis: Object.freeze(["Airport Logistics may lead logistics-led, distribution, and broader operational Requirements.", "Park 100 may lead contractor/service, office/warehouse, lighter-operation, and smaller-format Flex Requirements."]),
    publicEditorialContext: Object.freeze(["Existing Indianapolis Industrial public guidance remains useful orientation but is not certification by itself.", "Historical Indianapolis listing descriptions are discovery evidence only."]),
    rejectedForLevel3: Object.freeze(["Legacy ordinal loading, truck, airport, freeway, parking, yard, power, and access ratings.", "Current rent or availability inferred from historical listings.", "558 Airtech Parkway as Indianapolis-owned evidence.", "Proximity-only assignment of broad northwest Indianapolis buildings to Park 100."]),
  }),
});
