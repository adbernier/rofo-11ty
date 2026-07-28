const district = {
  metroId: "san-francisco",
  metroName: "San Francisco",
  cityId: "san-francisco",
  cityName: "San Francisco",
  districtId: "design-district",
  districtName: "Design District",
  districtPath: "/commercial-real-estate/CA/san-francisco/design-district/",
  primaryEcosystem: "retail",
  secondaryEcosystems: ["office", "industrial_flex"],
  referenceDocument: "docs/commercial-market-evidence-financial-district.md",
};

const neighboringDistrictRelationships = [
  {
    districtId: "showplace-square",
    districtName: "Showplace Square",
    relationship:
      "Showplace Square is the closest comparison when creative-office, production-adjacent, AI, robotics, or brick-and-timber workspace demand matters more than showroom and design-trade identity.",
  },
  {
    districtId: "soma",
    districtName: "SoMa",
    relationship:
      "SoMa is the stronger comparison when a company wants broader central-city technology inventory, stronger transit logic, or a larger range of startup-to-headquarters office choices.",
  },
  {
    districtId: "potrero-hill",
    districtName: "Potrero Hill",
    relationship:
      "Potrero Hill is the stronger comparison when neighborhood-scale production, maker, service-commercial, or lower-rise office/flex context matters more than clustered design-market identity.",
  },
];

function evidenceRecord(fields) {
  return {
    subjectType: "building",
    district,
    neighboringDistrictRelationships,
    reviewStatus: "approved_reference",
    ...fields,
  };
}

function repositorySources(buildingProfileReference) {
  return [
    {
      label: "Rofo Building Profile",
      url: buildingProfileReference,
      sourceType: "repository",
    },
    {
      label: "Rofo canonical Commercial Building Intelligence",
      url: "_data/commercialBuildingIntelligence.js",
      sourceType: "repository",
    },
    {
      label: "Rofo canonical representative-building documentation",
      url: "docs/sf-canonical-representative-buildings.md",
      sourceType: "repository",
    },
  ];
}

const records = [
  evidenceRecord({
    id: "sf-design-district-showplace",
    title: "San Francisco Design Center - Showplace",
    subjectId: "2-henry-adams-st",
    subjectName: "2 Henry Adams St",
    buildingProfileReference: "/commercial-real-estate/building/CA/san-francisco/2-henry-adams-st/",
    buildingProfileStatus: "source_ready",
    evidenceType: "design_showroom_anchor",
    evidenceTypeLabel: "Design Showroom Anchor",
    evidenceRole: "district_icon_showroom_benchmark",
    evidenceRoleLabel: "District Icon / Showroom Benchmark",
    confidence: "editorially_supported",
    whyItBelongs:
      "Showplace is the defining environment for the Design District because it concentrates showroom, design-trade, and adaptive commercial identity in one recognizable anchor.",
    districtFit:
      "It explains why this district is not simply SoMa office overflow: the commercial logic begins with design-market clustering and visitor-oriented showroom use.",
    typicalCompanies: [
      "furniture showrooms",
      "interior design brands",
      "architecture and design firms",
      "home and trade-service companies",
    ],
    typicalUsers: [
      "businesses that need a recognized design address, showroom context, and regular interaction with trade customers or design partners",
    ],
    leasingSituations: [
      "showroom searches",
      "design firms comparing client-facing space",
      "creative office users weighing showroom adjacency against broader SoMa options",
    ],
    strengths: [
      "district-defining identity",
      "showroom clustering",
      "historic adaptive reuse character",
      "strong design-market recognition",
    ],
    tradeoffs: [
      "The showroom-centered identity can be too specialized for companies that only need conventional creative office or broader technology-market visibility.",
    ],
    nearbyAlternatives: [
      "San Francisco Design Center - Galleria",
      "One Henry Adams",
      "2 Kansas",
      "Showplace Square creative office buildings",
    ],
    publicSources: repositorySources("/commercial-real-estate/building/CA/san-francisco/2-henry-adams-st/"),
  }),
  evidenceRecord({
    id: "sf-design-district-galleria",
    title: "San Francisco Design Center - Galleria",
    subjectId: "101-henry-adams-st",
    subjectName: "101 Henry Adams St",
    buildingProfileReference: "/commercial-real-estate/building/CA/san-francisco/101-henry-adams-st/",
    buildingProfileStatus: "source_ready",
    evidenceType: "design_event_showroom_center",
    evidenceTypeLabel: "Design Event / Showroom Center",
    evidenceRole: "trade_event_ecosystem_anchor",
    evidenceRoleLabel: "Trade Event / Ecosystem Anchor",
    confidence: "editorially_supported",
    whyItBelongs:
      "The Galleria complements Showplace by showing how the district supports event, showroom, and trade-facing activity beyond a single building format.",
    districtFit:
      "It gives the Design District a civic and event-oriented design-market role that differs from the office-first logic of SoMa or the Financial District.",
    typicalCompanies: [
      "design showrooms",
      "event users",
      "trade-facing brands",
      "home furnishings and design-service firms",
    ],
    typicalUsers: [
      "teams that benefit from periodic customer visits, product presentation, trade events, and proximity to other design-oriented tenants",
    ],
    leasingSituations: [
      "showroom and gallery comparisons",
      "customer-facing design searches",
      "event-adjacent office or showroom decisions",
    ],
    strengths: [
      "event and showroom identity",
      "design-trade ecosystem",
      "visitor-facing commercial role",
      "strong relationship to the Henry Adams cluster",
    ],
    tradeoffs: [
      "Companies without showroom, event, or trade-facing needs may find the specialized identity less useful than a broader creative-office district.",
    ],
    nearbyAlternatives: [
      "San Francisco Design Center - Showplace",
      "One Henry Adams",
      "2 Kansas",
      "Jackson Square boutique design buildings",
    ],
    publicSources: repositorySources("/commercial-real-estate/building/CA/san-francisco/101-henry-adams-st/"),
  }),
  evidenceRecord({
    id: "sf-design-district-one-henry-adams",
    title: "One Henry Adams",
    subjectId: "1-henry-adams-st",
    subjectName: "1 Henry Adams St",
    buildingProfileReference: "/commercial-real-estate/building/CA/san-francisco/1-henry-adams-st/",
    buildingProfileStatus: "source_ready",
    evidenceType: "showroom_creative_office_anchor",
    evidenceTypeLabel: "Showroom / Creative Office Anchor",
    evidenceRole: "henry_adams_cluster_depth",
    evidenceRoleLabel: "Henry Adams Cluster Depth",
    confidence: "editorially_supported",
    whyItBelongs:
      "One Henry Adams gives the Design Center cluster additional depth by connecting showroom identity with creative office and neighborhood-anchor use.",
    districtFit:
      "It helps show that the district works as a cluster of related design environments rather than one isolated landmark or generic warehouse conversion.",
    typicalCompanies: [
      "design firms",
      "showroom operators",
      "creative agencies",
      "trade-service companies",
    ],
    typicalUsers: [
      "teams that want design-district identity but need more flexible creative-office use than a pure showroom format",
    ],
    leasingSituations: [
      "small and mid-sized creative office searches",
      "showroom-adjacent relocations",
      "tenants comparing Henry Adams buildings with nearby Kansas and Townsend options",
    ],
    strengths: [
      "cluster adjacency",
      "showroom-to-office flexibility",
      "neighborhood-anchor role",
      "clear Design Center context",
    ],
    tradeoffs: [
      "It may be too locally specific for teams that need the scale, visibility, or transit convenience of larger SoMa office buildings.",
    ],
    nearbyAlternatives: [
      "San Francisco Design Center - Showplace",
      "San Francisco Design Center - Galleria",
      "2 Kansas",
      "460 Townsend",
    ],
    publicSources: repositorySources("/commercial-real-estate/building/CA/san-francisco/1-henry-adams-st/"),
  }),
  evidenceRecord({
    id: "sf-design-district-2-kansas",
    title: "2 Kansas",
    subjectId: "2-kansas-st",
    subjectName: "2 Kansas St",
    buildingProfileReference: "/commercial-real-estate/building/CA/san-francisco/2-kansas-st/",
    buildingProfileStatus: "source_ready",
    evidenceType: "adaptive_showroom_creative_office",
    evidenceTypeLabel: "Adaptive Showroom / Creative Office",
    evidenceRole: "warehouse_showroom_pattern",
    evidenceRoleLabel: "Warehouse Showroom Pattern",
    confidence: "editorially_supported",
    whyItBelongs:
      "2 Kansas represents the warehouse and showroom pattern extending beyond the Henry Adams core into smaller creative-commercial buildings.",
    districtFit:
      "It shows how the Design District supports practical creative office and showroom uses without relying only on the formal Design Center complex.",
    typicalCompanies: [
      "creative studios",
      "showroom-adjacent teams",
      "design-service firms",
      "product and brand companies",
    ],
    typicalUsers: [
      "tenants that want adaptive commercial character with design-market adjacency but do not need a large district-anchor building",
    ],
    leasingSituations: [
      "creative office comparisons",
      "showroom-adjacent moves",
      "teams weighing Design District character against Showplace Square and Potrero alternatives",
    ],
    strengths: [
      "adaptive reuse character",
      "showroom adjacency",
      "smaller creative-office scale",
      "useful comparison against Henry Adams anchors",
    ],
    tradeoffs: [
      "Smaller adaptive buildings can require more building-specific validation around access, loading, layout, and customer-facing presentation.",
    ],
    nearbyAlternatives: [
      "One Henry Adams",
      "500 De Haro",
      "460 Townsend",
      "Showplace Square creative office buildings",
    ],
    publicSources: repositorySources("/commercial-real-estate/building/CA/san-francisco/2-kansas-st/"),
  }),
  evidenceRecord({
    id: "sf-design-district-500-de-haro",
    title: "500 De Haro",
    subjectId: "500-de-haro-st",
    subjectName: "500 De Haro St",
    buildingProfileReference: "/commercial-real-estate/building/CA/san-francisco/500-de-haro-st/",
    buildingProfileStatus: "source_ready",
    evidenceType: "production_adjacent_creative_office",
    evidenceTypeLabel: "Production-Adjacent Creative Office",
    evidenceRole: "creative_production_transition",
    evidenceRoleLabel: "Creative Production Transition",
    confidence: "editorially_supported",
    whyItBelongs:
      "500 De Haro explains the district's transition from design and showroom identity toward creative, technology, and production-adjacent office users.",
    districtFit:
      "It places the Design District closer to Potrero and Showplace Square operating needs, where creative work may require practical production adjacency.",
    typicalCompanies: [
      "creative production teams",
      "design firms",
      "technology and product groups",
      "studio-oriented office users",
    ],
    typicalUsers: [
      "companies that need creative office character while preserving practical access to production, studio, or service-commercial surroundings",
    ],
    leasingSituations: [
      "creative office and production-adjacent comparisons",
      "tenants deciding between Design District, Showplace Square, and Potrero Hill",
      "teams validating office/flex tradeoffs",
    ],
    strengths: [
      "production-adjacent context",
      "creative-office identity",
      "Potrero and Showplace comparison value",
      "practical district edge position",
    ],
    tradeoffs: [
      "The edge position may offer less pure showroom identity than Henry Adams buildings and less broad technology-office depth than SoMa.",
    ],
    nearbyAlternatives: [
      "300 De Haro",
      "555 De Haro",
      "2 Kansas",
      "Potrero Hill production-adjacent buildings",
    ],
    publicSources: repositorySources("/commercial-real-estate/building/CA/san-francisco/500-de-haro-st/"),
  }),
  evidenceRecord({
    id: "sf-design-district-1000-brannan",
    title: "1000 Brannan",
    subjectId: "1000-brannan-st",
    subjectName: "1000 Brannan St",
    buildingProfileReference: "/commercial-real-estate/building/CA/san-francisco/1000-brannan-st/",
    buildingProfileStatus: "source_ready",
    evidenceType: "brannan_corridor_creative_office",
    evidenceTypeLabel: "Brannan Corridor Creative Office",
    evidenceRole: "larger_creative_inventory_benchmark",
    evidenceRoleLabel: "Larger Creative Inventory Benchmark",
    confidence: "editorially_supported",
    whyItBelongs:
      "1000 Brannan represents the Brannan corridor's larger creative-office inventory near the Design District and Showplace Square overlap.",
    districtFit:
      "It broadens the collection beyond showroom anchors by showing how larger adaptive office buildings help the district compete for creative and technology users.",
    typicalCompanies: [
      "technology firms",
      "creative office users",
      "product companies",
      "growth-stage teams",
    ],
    typicalUsers: [
      "teams that like Design District character but need more scale than a boutique showroom-adjacent office can provide",
    ],
    leasingSituations: [
      "larger creative-office searches",
      "tenants comparing Brannan corridor buildings",
      "technology teams weighing SoMa, Design District, and Showplace Square alternatives",
    ],
    strengths: [
      "larger creative-office format",
      "Brannan corridor identity",
      "technology and design overlap",
      "strong comparison with West SoMa buildings",
    ],
    tradeoffs: [
      "It may feel less connected to the Design Center core and more dependent on a tenant's tolerance for overlapping district identity.",
    ],
    nearbyAlternatives: [
      "999 Brannan",
      "888 Brannan",
      "808 Brannan",
      "650 Townsend",
    ],
    publicSources: repositorySources("/commercial-real-estate/building/CA/san-francisco/1000-brannan-st/"),
  }),
  evidenceRecord({
    id: "sf-design-district-999-brannan",
    title: "999 Brannan",
    subjectId: "999-brannan-st",
    subjectName: "999 Brannan St",
    buildingProfileReference: "/commercial-real-estate/building/CA/san-francisco/999-brannan-st/",
    buildingProfileStatus: "source_ready",
    evidenceType: "startup_scale_creative_office",
    evidenceTypeLabel: "Startup-Scale Creative Office",
    evidenceRole: "mid_market_creative_demand",
    evidenceRoleLabel: "Mid-Market Creative Demand",
    confidence: "editorially_supported",
    whyItBelongs:
      "999 Brannan helps explain smaller and mid-market creative-office demand around the Design District without making the district only about landmark showrooms.",
    districtFit:
      "It shows the day-to-day tenant layer that may value creative surroundings, central access, and design identity without needing a flagship address.",
    typicalCompanies: [
      "startup teams",
      "creative agencies",
      "small technology companies",
      "design-oriented professional services",
    ],
    typicalUsers: [
      "smaller teams that want adaptable creative office near SoMa and Showplace Square but prefer a less corporate environment",
    ],
    leasingSituations: [
      "startup office searches",
      "cost-sensitive creative-office comparisons",
      "tenants deciding between Brannan corridor, SoMa, and Design District identity",
    ],
    strengths: [
      "startup-scale relevance",
      "creative-office character",
      "Brannan corridor comparison value",
      "less formal district expression",
    ],
    tradeoffs: [
      "It does not carry the same district-defining showroom signal as the Henry Adams cluster or the same scale as larger technology buildings.",
    ],
    nearbyAlternatives: [
      "1000 Brannan",
      "909 Harrison",
      "808 Brannan",
      "2 Kansas",
    ],
    publicSources: repositorySources("/commercial-real-estate/building/CA/san-francisco/999-brannan-st/"),
  }),
  evidenceRecord({
    id: "sf-design-district-adobe-san-francisco",
    title: "Adobe San Francisco",
    subjectId: "601-townsend-st",
    subjectName: "601 Townsend St",
    buildingProfileReference: "/commercial-real-estate/building/CA/san-francisco/601-townsend-st/",
    buildingProfileStatus: "source_ready",
    evidenceType: "technology_creative_office_anchor",
    evidenceTypeLabel: "Technology / Creative Office Anchor",
    evidenceRole: "corporate_creative_presence",
    evidenceRoleLabel: "Corporate Creative Presence",
    confidence: "editorially_supported",
    whyItBelongs:
      "Adobe San Francisco shows the district's connection to larger technology occupiers while retaining a creative and production-adjacent edge.",
    districtFit:
      "It helps explain why some corporate users may evaluate this geography for creative identity instead of defaulting to the Financial District or Mission Bay.",
    typicalCompanies: [
      "technology companies",
      "creative software teams",
      "product organizations",
      "corporate design groups",
    ],
    typicalUsers: [
      "larger teams that want San Francisco technology presence with more creative-market context than a traditional downtown tower",
    ],
    leasingSituations: [
      "corporate technology office comparisons",
      "creative headquarters or satellite-office evaluations",
      "tenants comparing Townsend corridor, SoMa, and Mission Bay options",
    ],
    strengths: [
      "corporate technology signal",
      "creative-office identity",
      "Townsend corridor relevance",
      "strong comparison against SoMa alternatives",
    ],
    tradeoffs: [
      "The technology signal can blur the Design District with nearby SoMa and Showplace Square unless the showroom and design context also matters.",
    ],
    nearbyAlternatives: [
      "600 Townsend",
      "650 Townsend",
      "460 Townsend",
      "Mission Bay technology and life-science buildings",
    ],
    publicSources: repositorySources("/commercial-real-estate/building/CA/san-francisco/601-townsend-st/"),
  }),
  evidenceRecord({
    id: "sf-design-district-460-townsend",
    title: "460 Townsend",
    subjectId: "460-townsend-st",
    subjectName: "460 Townsend St",
    buildingProfileReference: "/commercial-real-estate/building/CA/san-francisco/460-townsend-st/",
    buildingProfileStatus: "migrated",
    evidenceType: "townsend_corridor_adaptive_office",
    evidenceTypeLabel: "Townsend Corridor Adaptive Office",
    evidenceRole: "design_soma_edge_benchmark",
    evidenceRoleLabel: "Design / SoMa Edge Benchmark",
    confidence: "editorially_supported",
    whyItBelongs:
      "460 Townsend is an existing Rofo representative building that ties Design District creative-commercial identity to the broader Townsend corridor.",
    districtFit:
      "It helps users understand the district boundary problem: the same building can explain design character, Showplace overlap, and SoMa-adjacent office logic.",
    typicalCompanies: [
      "creative office users",
      "design teams",
      "technology groups",
      "product and studio companies",
    ],
    typicalUsers: [
      "teams evaluating whether they need Design District character, SoMa access, or a practical Townsend corridor office environment",
    ],
    leasingSituations: [
      "Townsend corridor comparisons",
      "creative office relocations",
      "tenants validating whether Design District or SoMa is the better search frame",
    ],
    strengths: [
      "existing Building Profile evidence",
      "adaptive office character",
      "district-boundary comparison value",
      "Townsend corridor context",
    ],
    tradeoffs: [
      "Its overlap value also makes it less pure as a Design Center showroom example and more dependent on a tenant's access priorities.",
    ],
    nearbyAlternatives: [
      "600 Townsend",
      "2 Kansas",
      "601 Townsend",
      "Showplace Square creative office buildings",
    ],
    publicSources: repositorySources("/commercial-real-estate/building/CA/san-francisco/460-townsend-st/"),
  }),
  evidenceRecord({
    id: "sf-design-district-888-brannan",
    title: "888 Brannan",
    subjectId: "888-brannan-st",
    subjectName: "888 Brannan St",
    buildingProfileReference: "/commercial-real-estate/building/CA/san-francisco/888-brannan-st/",
    buildingProfileStatus: "migrated",
    evidenceType: "large_floorplate_creative_technology_office",
    evidenceTypeLabel: "Large-Floorplate Creative Technology Office",
    evidenceRole: "design_showplace_soma_bridge",
    evidenceRoleLabel: "Design / Showplace / SoMa Bridge",
    confidence: "editorially_supported",
    whyItBelongs:
      "888 Brannan is useful because it bridges Design District, Showplace Square, and SoMa technology demand through large-format adaptive creative office space.",
    districtFit:
      "It proves the district's edge can support larger technology and creative users, while also showing why adjacent district comparisons must remain explicit.",
    typicalCompanies: [
      "technology companies",
      "creative office users",
      "product teams",
      "large-format workspace users",
    ],
    typicalUsers: [
      "tenants that want warehouse-to-headquarters character near the Design District but still need enough scale for larger teams",
    ],
    leasingSituations: [
      "large creative-office searches",
      "SoMa versus Design District comparisons",
      "teams evaluating whether district identity or building scale matters more",
    ],
    strengths: [
      "large floorplates",
      "warehouse-to-headquarters character",
      "technology-market relevance",
      "high comparison value across adjacent districts",
    ],
    tradeoffs: [
      "It may be better framed as a SoMa or Showplace Square option when the search does not benefit from design-market adjacency.",
    ],
    nearbyAlternatives: [
      "650 Townsend",
      "1000 Brannan",
      "808 Brannan",
      "680 Folsom",
    ],
    publicSources: repositorySources("/commercial-real-estate/building/CA/san-francisco/888-brannan-st/"),
  }),
];

module.exports = {
  schemaVersion: "commercial-market-evidence-v1",
  collectionId: "sf-design-district-commercial-market-evidence",
  collectionType: "district_commercial_market_evidence",
  status: "production_reference",
  district,
  districtNarrative: {
    whyItExists:
      "The Design District exists because showroom, design-trade, creative office, adaptive reuse, and production-adjacent commercial uses cluster around the Henry Adams, Kansas, De Haro, Brannan, and Townsend corridors.",
    strongestWhen: [
      "a company benefits from showroom or design-trade identity",
      "customers, trade partners, or collaborators need to visit a specialized design-market environment",
      "creative office character matters more than traditional downtown formality",
      "the tenant wants central San Francisco access with more production and showroom adjacency than a conventional office district",
    ],
    weakerWhen: [
      "the company needs a formal Financial District address or traditional client-facing CBD image",
      "the requirement depends on life-science, medical, or institutional adjacency better served by Mission Bay",
      "the tenant needs a broader technology-office inventory or stronger transit logic than SoMa can provide",
      "the business does not benefit from design, showroom, creative, or production-adjacent district identity",
    ],
  },
  naturalBusinessFit: {
    fits: [
      "showrooms",
      "design firms",
      "creative agencies",
      "architecture and interiors firms",
      "product and brand teams",
      "creative technology companies",
      "production-adjacent office users",
      "destination retail and trade-service businesses tied to design demand",
    ],
    lessNaturalFor: [
      "traditional finance, law, or consulting firms seeking formal CBD credibility",
      "life-science users requiring validated lab infrastructure",
      "parking-heavy customer operations",
      "warehouse, yard, or loading-heavy industrial users",
      "general retailers that need broad foot traffic rather than design-oriented destination demand",
      "companies that want a polished campus or tower identity more than adaptive creative-commercial character",
    ],
  },
  qualityStandard:
    "A strong Design District Commercial Market Evidence collection should explain the district's showroom and design-trade core, its adaptive creative-office inventory, and its boundary relationships with Showplace Square, SoMa, and Potrero Hill without treating every adjacent creative building as interchangeable.",
  records,
  deferredCandidates: [
    {
      title: "808 Brannan",
      reason:
        "Important comparison evidence, but it is better handled in the Showplace Square collection because its AI, robotics, and creative-office role is stronger there.",
    },
    {
      title: "650 Townsend and 600 Townsend",
      reason:
        "Useful Townsend corridor comparisons, but they are already stronger SoMa or Showplace Square evidence than Design District foundation records.",
    },
    {
      title: "300 De Haro and 555 De Haro",
      reason:
        "Relevant production-adjacent alternatives, but they should anchor Showplace Square or Potrero Hill follow-up rather than this showroom-led collection.",
    },
    {
      title: "Additional showroom or trade-service records",
      reason:
        "Potentially useful for deeper design-market segmentation after Publisher begins measuring Commercial Market Evidence quality.",
    },
  ],
};
