const district = {
  metroId: "fort-wayne",
  metroName: "Fort Wayne",
  cityId: "fort-wayne",
  cityName: "Fort Wayne",
  districtId: "fort-wayne-airport-industrial",
  districtName: "Fort Wayne Airport Industrial",
  districtPath: "/commercial-real-estate/IN/fort-wayne/fort-wayne-airport-industrial/",
  primaryEcosystem: "industrial_flex",
  secondaryEcosystems: [],
  referenceDocument: "docs/commercial-market-evidence.md",
};

const neighboringDistrictRelationships = [];

function evidenceRecord(fields) {
  return {
    district,
    neighboringDistrictRelationships,
    reviewStatus: "approved_reference",
    ...fields,
  };
}

const records = [
  evidenceRecord({
    id: "fw-airport-industrial-air-trade-centre",
    title: "Fort Wayne International Airport Air Trade Centre",
    subjectType: "industrial_area",
    subjectId: "air-trade-centre",
    subjectName: "Air Trade Centre",
    buildingProfileStatus: "not_applicable_area_evidence",
    evidenceType: "airport_oriented_industrial_area",
    evidenceTypeLabel: "Airport-Oriented Industrial Area",
    evidenceRole: "industrial_foundation_anchor",
    evidenceRoleLabel: "Industrial Foundation Anchor",
    confidence: "source_supported",
    whyItBelongs:
      "The Air Trade Centre gives Fort Wayne a source-supported airport-area industrial foundation for warehouse, logistics, distribution, and service-operational searches.",
    districtFit:
      "It explains why Fort Wayne warehouse / industrial research should begin with airport and Airport Expressway geography before broader citywide recommendations are created.",
    typicalCompanies: ["warehouse users", "distribution businesses", "service-industrial operators", "airport-adjacent commercial users"],
    typicalUsers: [
      "occupiers that need warehouse, distribution, service, storage, or operational space with airport-area access",
    ],
    leasingSituations: [
      "companies comparing Fort Wayne for warehouse, distribution, service, or light operational requirements",
      "businesses that need to validate airport proximity, truck movement, loading, yard, and employee access before touring individual properties",
    ],
    strengths: [
      "airport-oriented industrial identity",
      "warehouse and distribution relevance",
      "useful foundation for Fort Wayne industrial geography",
      "clear source-supported basis for future representative-property work",
    ],
    tradeoffs: [
      "The area establishes commercial context but does not confirm current availability, building-level loading, clear height, trailer parking, or permitted use.",
    ],
    nearbyAlternatives: [
      "Airport Expressway industrial properties",
      "Fort Wayne service-industrial alternatives",
      "Indianapolis warehouse / industrial alternatives",
    ],
    publicSources: [
      {
        label: "Fort Wayne International Airport Air Trade Centre",
        url: "https://fwairport.com/business/air-trade-centre/",
        sourceType: "official_airport",
      },
      {
        label: "Rofo Location Knowledge Graph",
        url: "_data/locationKnowledgeGraph.js",
        sourceType: "repository",
      },
    ],
  }),
  evidenceRecord({
    id: "fw-airport-industrial-greater-fort-wayne-logistics",
    title: "Greater Fort Wayne Logistics and Manufacturing Context",
    subjectType: "market_context",
    subjectId: "greater-fort-wayne-logistics-manufacturing",
    subjectName: "Greater Fort Wayne Logistics and Manufacturing Context",
    buildingProfileStatus: "not_applicable_market_context",
    evidenceType: "economic_development_context",
    evidenceTypeLabel: "Economic Development Context",
    evidenceRole: "warehouse_industrial_market_context",
    evidenceRoleLabel: "Warehouse / Industrial Market Context",
    confidence: "source_supported",
    whyItBelongs:
      "Economic-development source material supports treating Fort Wayne as a logistics, manufacturing, and operational-market candidate rather than an office-only commercial market.",
    districtFit:
      "This context supports the airport-industrial foundation while keeping the recommendation narrow: it establishes why industrial work is researchable, not that every Fort Wayne corridor is ready for public guidance.",
    typicalCompanies: ["manufacturing users", "logistics users", "warehouse users", "service and operations businesses"],
    typicalUsers: [
      "occupiers evaluating Fort Wayne for goods movement, production support, storage, or regional service operations",
    ],
    leasingSituations: [
      "warehouse or industrial users comparing Fort Wayne with other Midwest operating markets",
      "companies that need to validate labor geography, access, building format, and operational permissions before committing to a submarket",
    ],
    strengths: [
      "supports industrial and logistics relevance",
      "helps distinguish Fort Wayne from general commercial search demand",
      "adds source trace for a bounded market foundation",
      "creates a basis for follow-up building and district research",
    ],
    tradeoffs: [
      "Economic-development context is not a substitute for property-level due diligence, live availability, use approvals, or technical building validation.",
    ],
    nearbyAlternatives: [
      "Fort Wayne Airport Industrial",
      "other Northeast Indiana industrial sites requiring future validation",
      "Indianapolis warehouse / industrial alternatives",
    ],
    publicSources: [
      {
        label: "Greater Fort Wayne Inc. economic-development source material",
        url: "https://www.greaterfortwayneinc.com/",
        sourceType: "official_economic_development",
      },
      {
        label: "Rofo Commercial Knowledge Market Snapshot",
        url: "_data/commercialKnowledgeMarketSnapshots.js",
        sourceType: "repository",
      },
    ],
  }),
  evidenceRecord({
    id: "fw-airport-industrial-airport-expressway-properties",
    title: "Airport Expressway Industrial Property Pattern",
    subjectType: "representative_property_pattern",
    subjectId: "airport-expressway-industrial-property-pattern",
    subjectName: "Airport Expressway Industrial Property Pattern",
    buildingProfileStatus: "candidate_building_profiles_deferred",
    evidenceType: "representative_industrial_property_pattern",
    evidenceTypeLabel: "Representative Industrial Property Pattern",
    evidenceRole: "building_profile_prerequisite",
    evidenceRoleLabel: "Building Profile Prerequisite",
    confidence: "review_required",
    whyItBelongs:
      "Airport Expressway property evidence identifies durable industrial and warehouse candidates, but Building Profiles should wait for stronger source validation of each exact address and physical format.",
    districtFit:
      "The pattern is useful because it points future Fort Wayne building work toward airport-area industrial properties instead of unsupported citywide building selection.",
    typicalCompanies: ["warehouse users", "service-industrial businesses", "distributors", "contractor and operations users"],
    typicalUsers: [
      "businesses that need representative warehouse or industrial examples before comparing live opportunities",
    ],
    leasingSituations: [
      "future research that validates individual Fort Wayne industrial properties against the building-page standard",
      "operators comparing whether Airport Expressway properties match loading, yard, storage, office/warehouse mix, and service-territory needs",
    ],
    strengths: [
      "identifies where representative-building research should continue",
      "keeps candidate property evidence separate from confirmed Building Profiles",
      "supports an airport-industrial foundation without inventing complete coverage",
      "records the prerequisite for future public building work",
    ],
    tradeoffs: [
      "The current source set is not yet strong enough to migrate a full representative Building Profile set without additional exact-address and owner/property validation.",
    ],
    nearbyAlternatives: [
      "Air Trade Centre area",
      "other Fort Wayne industrial candidates requiring source validation",
      "Indianapolis industrial properties",
    ],
    publicSources: [
      {
        label: "Rofo Building Page Standard",
        url: "docs/building-page-standard.md",
        sourceType: "repository",
      },
      {
        label: "Rofo Commercial Market Evidence standard",
        url: "docs/commercial-market-evidence.md",
        sourceType: "repository",
      },
    ],
  }),
];

module.exports = {
  collectionId: "fort-wayne-airport-industrial-commercial-market-evidence",
  schemaVersion: "commercial-market-evidence-v1",
  district,
  neighboringDistrictRelationships,
  records,
  deferredCandidates: [
    {
      id: "fort-wayne-industrial-building-profiles",
      label: "Fort Wayne warehouse / industrial Building Profiles",
      status: "researchable_later",
      reason:
        "Candidate industrial properties exist, but the current bounded evidence set does not yet satisfy the Building Profile standard for a durable public representative set.",
      prerequisite:
        "Validate exact address identity, owner/property source material, physical format, access/loading context, and image/provenance before migration.",
    },
    {
      id: "fort-wayne-industrial-business-guides",
      label: "Fort Wayne warehouse / industrial business guides",
      status: "blocked_for_now",
      reason:
        "One foundation district and preliminary evidence are not enough to publish defensible business-type or occupier recommendation guides.",
      prerequisite:
        "At least several mature commercial geographies, representative properties, and source-supported property-type context should exist first.",
    },
    {
      id: "fort-wayne-retail-depth",
      label: "Fort Wayne retail depth",
      status: "outside_scope_researchable_later",
      reason:
        "Retail demand appears in Search Intelligence, but this mission is bounded to warehouse / industrial foundation work.",
      prerequisite:
        "A separate retail foundation mission should assess customer corridors, retail centers, and representative retail properties.",
    },
  ],
};
