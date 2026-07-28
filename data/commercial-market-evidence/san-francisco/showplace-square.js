const district = {
  metroId: "san-francisco",
  metroName: "San Francisco",
  cityId: "san-francisco",
  cityName: "San Francisco",
  districtId: "showplace-square",
  districtName: "Showplace Square",
  districtPath: "/commercial-real-estate/CA/san-francisco/showplace-square/",
  primaryEcosystem: "office",
  secondaryEcosystems: ["industrial_flex", "retail"],
  referenceDocument: "docs/commercial-market-evidence-financial-district.md",
};

const neighboringDistrictRelationships = [
  {
    districtId: "soma",
    districtName: "SoMa",
    relationship:
      "SoMa is the stronger comparison when broader technology-office inventory, central-city amenities, larger market depth, or more conventional growth-company identity matter more than Showplace Square's production-adjacent creative texture.",
  },
  {
    districtId: "design-district",
    districtName: "Design District",
    relationship:
      "The Design District is the stronger comparison when showroom, design-trade, and Henry Adams identity matter more than AI, robotics, technology office, or production-adjacent creative-office demand.",
  },
  {
    districtId: "potrero-hill",
    districtName: "Potrero Hill",
    relationship:
      "Potrero Hill is the stronger comparison when neighborhood-scale production, practical flex, and maker roots matter more than Showplace Square's more central creative-office and Townsend corridor identity.",
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
    id: "sf-showplace-square-2-henry-adams",
    title: "2 Henry Adams",
    subjectId: "2-henry-adams-st",
    subjectName: "2 Henry Adams St",
    buildingProfileReference: "/commercial-real-estate/building/CA/san-francisco/2-henry-adams-st/",
    buildingProfileStatus: "source_ready",
    evidenceType: "brick_and_timber_rd_creative_office",
    evidenceTypeLabel: "Brick-and-Timber R&D / Creative Office",
    evidenceRole: "showplace_ai_rd_design_benchmark",
    evidenceRoleLabel: "AI, R&D, and Design Benchmark",
    confidence: "editorially_supported",
    whyItBelongs:
      "2 Henry Adams is the clearest Showplace Square example of brick-and-timber building stock being repositioned for AI, R&D, creative office, and design demand.",
    districtFit:
      "It explains why Showplace Square is more than a generic office edge: the district combines older industrial character, design-market adjacency, and newer technical-work relevance.",
    typicalCompanies: [
      "AI teams",
      "robotics companies",
      "creative office users",
      "design-oriented technology firms",
    ],
    typicalUsers: [
      "teams that want technical or creative workspace in a brick-and-timber environment near SoMa, Design District, and Potrero alternatives",
    ],
    leasingSituations: [
      "AI or R&D workspace comparisons",
      "creative office searches with design-market adjacency",
      "tenants deciding between Showplace Square, Design District, and SoMa",
    ],
    strengths: [
      "brick-and-timber identity",
      "AI and R&D relevance",
      "design-market adjacency",
      "district-defining comparison value",
    ],
    tradeoffs: [
      "The technical-work signal still requires building-specific validation around infrastructure, loading, visitor experience, and whether a showroom-adjacent setting is useful.",
    ],
    nearbyAlternatives: [
      "808 Brannan",
      "650 Townsend",
      "San Francisco Design Center - Showplace",
      "SoMa creative office buildings",
    ],
    publicSources: repositorySources("/commercial-real-estate/building/CA/san-francisco/2-henry-adams-st/"),
  }),
  evidenceRecord({
    id: "sf-showplace-square-808-brannan",
    title: "808 Brannan",
    subjectId: "808-brannan-st",
    subjectName: "808 Brannan St",
    buildingProfileReference: "/commercial-real-estate/building/CA/san-francisco/808-brannan-st/",
    buildingProfileStatus: "source_ready",
    evidenceType: "technology_creative_adaptive_reuse_ai",
    evidenceTypeLabel: "Technology / Creative / Adaptive Reuse / AI",
    evidenceRole: "robotics_ai_comparison_benchmark",
    evidenceRoleLabel: "Robotics and AI Comparison Benchmark",
    confidence: "editorially_supported",
    whyItBelongs:
      "808 Brannan is important Showplace Square evidence for robotics, AI, and larger creative-office users near the old Airbnb cluster.",
    districtFit:
      "It shows the district's ability to compete for technology and creative-office demand without becoming the broader SoMa office market.",
    typicalCompanies: [
      "robotics companies",
      "AI teams",
      "technology product groups",
      "larger creative office users",
    ],
    typicalUsers: [
      "growth companies that need larger creative-office environments near SoMa while preserving Showplace Square's adaptive-reuse and production-adjacent context",
    ],
    leasingSituations: [
      "robotics and AI office comparisons",
      "larger creative floorplate searches",
      "tenants comparing Showplace Square with SoMa and Design District alternatives",
    ],
    strengths: [
      "technology and AI signal",
      "larger creative-office comparison value",
      "adaptive-reuse context",
      "proximity to Brannan and Townsend alternatives",
    ],
    tradeoffs: [
      "The technology-office identity can blur with SoMa unless the tenant specifically values Showplace Square's creative and production-adjacent surroundings.",
    ],
    nearbyAlternatives: [
      "888 Brannan",
      "650 Townsend",
      "1000 Brannan",
      "2 Henry Adams",
    ],
    publicSources: repositorySources("/commercial-real-estate/building/CA/san-francisco/808-brannan-st/"),
  }),
  evidenceRecord({
    id: "sf-showplace-square-650-townsend",
    title: "650 Townsend",
    subjectId: "650-townsend-st",
    subjectName: "650 Townsend St",
    buildingProfileReference: "/commercial-real-estate/building/CA/san-francisco/650-townsend-st/",
    buildingProfileStatus: "source_ready",
    evidenceType: "large_floorplate_technology_creative_office",
    evidenceTypeLabel: "Large-Floorplate Technology Creative Office",
    evidenceRole: "townsend_technology_office_anchor",
    evidenceRoleLabel: "Townsend Technology Office Anchor",
    confidence: "editorially_supported",
    whyItBelongs:
      "650 Townsend is essential for understanding the Townsend and Showplace Square technology-office environment.",
    districtFit:
      "It gives Showplace Square a larger-floorplate office anchor and helps explain why some companies compare the district with West SoMa and Caltrain-oriented creative inventory.",
    typicalCompanies: [
      "technology companies",
      "creative office users",
      "product teams",
      "growth companies needing larger floorplates",
    ],
    typicalUsers: [
      "companies that want larger creative-office scale near Townsend without defaulting to a conventional downtown tower",
    ],
    leasingSituations: [
      "large creative floorplate searches",
      "Townsend corridor comparisons",
      "tenants evaluating Showplace Square against SoMa and Design District options",
    ],
    strengths: [
      "larger-floorplate office signal",
      "Townsend corridor identity",
      "technology tenant relevance",
      "SoMa comparison value",
    ],
    tradeoffs: [
      "The building's value depends on whether the user wants the southern SoMa and Showplace workday rather than downtown polish or Mission Bay campus context.",
    ],
    nearbyAlternatives: [
      "600 Townsend",
      "888 Brannan",
      "808 Brannan",
      "410 Townsend",
    ],
    publicSources: repositorySources("/commercial-real-estate/building/CA/san-francisco/650-townsend-st/"),
  }),
  evidenceRecord({
    id: "sf-showplace-square-600-townsend",
    title: "600 Townsend",
    subjectId: "600-townsend-st",
    subjectName: "600 Townsend St",
    buildingProfileReference: "/commercial-real-estate/building/CA/san-francisco/600-townsend-st/",
    buildingProfileStatus: "source_ready",
    evidenceType: "caltrain_adjacent_creative_adaptive_reuse",
    evidenceTypeLabel: "Caltrain-Adjacent Creative Adaptive Reuse",
    evidenceRole: "regional_access_creative_office_benchmark",
    evidenceRoleLabel: "Regional Access Creative Office Benchmark",
    confidence: "editorially_supported",
    whyItBelongs:
      "600 Townsend is a strong representative building for companies that want creative office character with regional transit access.",
    districtFit:
      "It connects Showplace Square to the Caltrain-oriented office pattern while preserving the district's adaptive creative-office and production-adjacent context.",
    typicalCompanies: [
      "creative office users",
      "technology teams",
      "regional employee-base companies",
      "product and design organizations",
    ],
    typicalUsers: [
      "teams that need creative-office character while keeping Caltrain and southern SoMa access in the comparison set",
    ],
    leasingSituations: [
      "Caltrain-adjacent creative office searches",
      "Townsend corridor comparisons",
      "tenants choosing between Showplace Square, SoMa, and Mission Bay access patterns",
    ],
    strengths: [
      "regional access value",
      "adaptive creative-office character",
      "Townsend corridor relevance",
      "strong comparison against 650 Townsend",
    ],
    tradeoffs: [
      "Transit-oriented creative office may still be less polished than Mission Bay or less central than traditional Financial District options.",
    ],
    nearbyAlternatives: [
      "650 Townsend",
      "410 Townsend",
      "460 Townsend",
      "SoMa Caltrain-adjacent offices",
    ],
    publicSources: repositorySources("/commercial-real-estate/building/CA/san-francisco/600-townsend-st/"),
  }),
  evidenceRecord({
    id: "sf-showplace-square-699-8th",
    title: "699 8th St",
    subjectId: "699-8th-st",
    subjectName: "699 8th St",
    buildingProfileReference: "/commercial-real-estate/building/CA/san-francisco/699-8th-st/",
    buildingProfileStatus: "source_ready",
    evidenceType: "mid_rise_production_adjacent_creative_office",
    evidenceTypeLabel: "Mid-Rise Production-Adjacent Creative Office",
    evidenceRole: "lower_rise_showplace_office_depth",
    evidenceRoleLabel: "Lower-Rise Showplace Office Depth",
    confidence: "editorially_supported",
    whyItBelongs:
      "699 8th St shows lower-rise, production-adjacent office inventory that keeps Showplace Square grounded beyond its larger Townsend and Brannan examples.",
    districtFit:
      "It prevents the collection from over-indexing on larger Brannan and Townsend examples by showing the smaller-format layer that supports everyday creative-office demand.",
    typicalCompanies: [
      "creative office users",
      "studio teams",
      "production-adjacent companies",
      "local technology and product teams",
    ],
    typicalUsers: [
      "teams that want Showplace Square character and practical surroundings without needing the largest district anchors",
    ],
    leasingSituations: [
      "lower-rise creative office searches",
      "production-adjacent office comparisons",
      "tenants weighing 8th Street, De Haro, and Townsend alternatives",
    ],
    strengths: [
      "lower-rise office depth",
      "production-adjacent surroundings",
      "smaller-format comparison value",
      "clear Showplace Square identity",
    ],
    tradeoffs: [
      "Smaller-format creative inventory may provide less expansion capacity, fewer amenities, or more variable block conditions than larger Townsend buildings.",
    ],
    nearbyAlternatives: [
      "410 Townsend",
      "300 De Haro",
      "555 De Haro",
      "Potrero Hill creative office buildings",
    ],
    publicSources: repositorySources("/commercial-real-estate/building/CA/san-francisco/699-8th-st/"),
  }),
  evidenceRecord({
    id: "sf-showplace-square-410-townsend",
    title: "410 Townsend",
    subjectId: "410-townsend-st",
    subjectName: "410 Townsend St",
    buildingProfileReference: "/commercial-real-estate/building/CA/san-francisco/410-townsend-st/",
    buildingProfileStatus: "source_ready",
    evidenceType: "transit_oriented_technology_creative_office",
    evidenceTypeLabel: "Transit-Oriented Technology Creative Office",
    evidenceRole: "caltrain_showplace_connection",
    evidenceRoleLabel: "Caltrain / Showplace Connection",
    confidence: "editorially_supported",
    whyItBelongs:
      "410 Townsend helps connect Showplace Square with the Caltrain-oriented SoMa office market.",
    districtFit:
      "It explains how Showplace Square can participate in technology and creative-office searches that require regional access, not only showroom or production adjacency.",
    typicalCompanies: [
      "technology teams",
      "creative office users",
      "product companies",
      "regional employee-base tenants",
    ],
    typicalUsers: [
      "companies comparing Showplace Square with SoMa when regional commute access and creative-office character both matter",
    ],
    leasingSituations: [
      "Caltrain-oriented office comparisons",
      "technology office searches",
      "tenants comparing 410 Townsend with 600 Townsend, 460 Townsend, and 699 8th",
    ],
    strengths: [
      "regional transit relevance",
      "technology office signal",
      "creative-office character",
      "bridge to SoMa alternatives",
    ],
    tradeoffs: [
      "The transit and SoMa connection may be less useful for users whose needs are driven by showroom identity or practical production/flex capability.",
    ],
    nearbyAlternatives: [
      "600 Townsend",
      "460 Townsend",
      "699 8th St",
      "650 Townsend",
    ],
    publicSources: repositorySources("/commercial-real-estate/building/CA/san-francisco/410-townsend-st/"),
  }),
  evidenceRecord({
    id: "sf-showplace-square-300-de-haro",
    title: "300 De Haro",
    subjectId: "300-de-haro-st",
    subjectName: "300 De Haro St",
    buildingProfileReference: "/commercial-real-estate/building/CA/san-francisco/300-de-haro-st/",
    buildingProfileStatus: "source_ready",
    evidenceType: "creative_office_production_neighborhood_edge",
    evidenceTypeLabel: "Creative Office / Production Neighborhood Edge",
    evidenceRole: "potrero_production_transition_benchmark",
    evidenceRoleLabel: "Potrero Production Transition Benchmark",
    confidence: "editorially_supported",
    whyItBelongs:
      "300 De Haro represents Showplace Square's relationship to Potrero Hill and production/flex uses.",
    districtFit:
      "It keeps the collection grounded in practical production adjacency rather than treating Showplace Square as only a technology or creative-office district.",
    typicalCompanies: [
      "creative office users",
      "production-adjacent teams",
      "studio companies",
      "service-commercial users",
    ],
    typicalUsers: [
      "businesses that need creative-office functionality while staying close to Potrero Hill production and flex alternatives",
    ],
    leasingSituations: [
      "office-plus-production comparisons",
      "Potrero and Showplace edge searches",
      "tenants evaluating whether practical access matters more than showroom or SoMa identity",
    ],
    strengths: [
      "production-adjacent context",
      "Potrero comparison value",
      "creative-office usefulness",
      "neighborhood-edge role",
    ],
    tradeoffs: [
      "The edge position can make district identity less clear, so tenant fit depends on whether Showplace, Potrero, or Design District context matters most.",
    ],
    nearbyAlternatives: [
      "500 De Haro",
      "555 De Haro",
      "99 Rhode Island",
      "Potrero Hill production/flex buildings",
    ],
    publicSources: repositorySources("/commercial-real-estate/building/CA/san-francisco/300-de-haro-st/"),
  }),
  evidenceRecord({
    id: "sf-showplace-square-555-de-haro",
    title: "555 De Haro",
    subjectId: "555-de-haro-st",
    subjectName: "555 De Haro St",
    buildingProfileReference: "/commercial-real-estate/building/CA/san-francisco/555-de-haro-st/",
    buildingProfileStatus: "source_ready",
    evidenceType: "creative_office_industrial_conversion_flex",
    evidenceTypeLabel: "Creative Office / Industrial Conversion / Flex",
    evidenceRole: "office_flex_creative_production_benchmark",
    evidenceRoleLabel: "Office/Flex Creative Production Benchmark",
    confidence: "editorially_supported",
    whyItBelongs:
      "555 De Haro is useful Showplace Square evidence for businesses comparing office/flex and creative-production needs.",
    districtFit:
      "It shows that Showplace Square's commercial value includes flexible industrial-conversion formats, not only creative office or design showrooms.",
    typicalCompanies: [
      "office/flex users",
      "creative production teams",
      "studio operators",
      "product and service-commercial companies",
    ],
    typicalUsers: [
      "teams that need creative-office identity plus practical flexibility for production, prototyping, or service-commercial work",
    ],
    leasingSituations: [
      "office/flex searches",
      "industrial-conversion comparisons",
      "tenants deciding between Showplace Square, Potrero Hill, and Design District edges",
    ],
    strengths: [
      "office/flex evidence",
      "industrial-conversion character",
      "creative production relevance",
      "useful alternative to 300 De Haro",
    ],
    tradeoffs: [
      "Flex-oriented buildings require careful validation of loading, power, permitted use, customer access, and whether the office component is strong enough.",
    ],
    nearbyAlternatives: [
      "300 De Haro",
      "500 De Haro",
      "699 8th St",
      "Potrero Hill flex buildings",
    ],
    publicSources: repositorySources("/commercial-real-estate/building/CA/san-francisco/555-de-haro-st/"),
  }),
  evidenceRecord({
    id: "sf-showplace-square-460-townsend",
    title: "460 Townsend",
    subjectId: "460-townsend-st",
    subjectName: "460 Townsend St",
    buildingProfileReference: "/commercial-real-estate/building/CA/san-francisco/460-townsend-st/",
    buildingProfileStatus: "source_ready",
    evidenceType: "creative_adaptive_reuse_design_overlap",
    evidenceTypeLabel: "Creative Adaptive Reuse / Design Overlap",
    evidenceRole: "design_showplace_soma_bridge",
    evidenceRoleLabel: "Design / Showplace / SoMa Bridge",
    confidence: "editorially_supported",
    whyItBelongs:
      "460 Townsend is useful overlap evidence between Design District and Showplace Square.",
    districtFit:
      "It helps explain the district-boundary problem by showing how Showplace Square can combine creative office, adaptive reuse, design context, and SoMa adjacency.",
    typicalCompanies: [
      "creative office users",
      "design-adjacent companies",
      "technology teams",
      "studio-oriented office tenants",
    ],
    typicalUsers: [
      "teams comparing Showplace Square, Design District, and SoMa because they need creative character and practical central access",
    ],
    leasingSituations: [
      "creative adaptive-reuse searches",
      "district-boundary comparisons",
      "tenants comparing Townsend, Kansas, and De Haro alternatives",
    ],
    strengths: [
      "adaptive-reuse character",
      "design and Showplace overlap",
      "SoMa adjacency",
      "useful bridge evidence",
    ],
    tradeoffs: [
      "The overlap can make it less useful for users seeking a pure design-showroom identity, pure technology-office scale, or pure production/flex functionality.",
    ],
    nearbyAlternatives: [
      "600 Townsend",
      "2 Kansas",
      "601 Townsend",
      "410 Townsend",
    ],
    publicSources: repositorySources("/commercial-real-estate/building/CA/san-francisco/460-townsend-st/"),
  }),
];

module.exports = {
  schemaVersion: "commercial-market-evidence-v1",
  collectionId: "sf-showplace-square-commercial-market-evidence",
  collectionType: "district_commercial_market_evidence",
  status: "production_reference",
  district,
  districtNarrative: {
    whyItExists:
      "Showplace Square exists commercially because older industrial and showroom-adjacent buildings around Brannan, Townsend, De Haro, Henry Adams, and 8th Street support creative office, AI, robotics, design, production-adjacent, and office/flex demand near SoMa, Design District, and Potrero Hill.",
    strongestWhen: [
      "a company wants creative-office texture, adaptive reuse, or brick-and-timber character near central San Francisco",
      "AI, robotics, product, design, or studio users benefit from production-adjacent surroundings",
      "the tenant needs to compare SoMa technology depth with Design District showroom identity and Potrero production/flex practicality",
      "larger Townsend corridor options and smaller lower-rise creative buildings both belong in the search",
    ],
    weakerWhen: [
      "the company needs polished Mission Bay or Transbay office image",
      "a formal client-facing downtown address matters more than creative or production-adjacent character",
      "the use requires dedicated industrial utility beyond building-specific office/flex capacity",
      "the tenant needs a broad retail corridor rather than selective food, service, showroom, or design-adjacent demand",
    ],
  },
  naturalBusinessFit: {
    fits: [
      "creative office users",
      "AI and robotics teams",
      "technology product companies",
      "design-adjacent firms",
      "studio organizations",
      "production-adjacent teams",
      "office/flex users",
      "select showroom and service-commercial users",
    ],
    lessNaturalFor: [
      "large traditional professional-service headquarters",
      "formal client-facing finance or law firms",
      "pure laboratory users requiring confirmed technical infrastructure",
      "heavy industrial users needing specialized sites",
      "broad neighborhood retail operators",
      "companies that need the deepest downtown transit and amenity grid",
    ],
  },
  qualityStandard:
    "A strong Showplace Square Commercial Market Evidence collection should explain creative office, technology, AI/robotics, adaptive reuse, Townsend corridor access, production-adjacent buildings, and Design District/Potrero/SoMa boundary relationships without treating every adjacent creative building as interchangeable.",
  records,
  deferredCandidates: [
    {
      title: "San Francisco Design Center - Showplace and Galleria",
      reason:
        "Critical comparison evidence, but their strongest ownership remains the Design District collection where showroom and design-trade identity is the primary district story.",
    },
    {
      title: "888 Brannan and 1000 Brannan",
      reason:
        "Useful Brannan corridor comparison buildings, but they are already stronger SoMa or Design District evidence unless Showplace Square needs deeper technology-office follow-up.",
    },
    {
      title: "Additional food, service, and showroom-adjacent retail",
      reason:
        "Potentially useful after Commercial Market Evidence supports non-building corridor or tenant-mix evidence more explicitly.",
    },
    {
      title: "Potrero Hill production/flex alternatives",
      reason:
        "Important for comparison, but Potrero Hill owns the neighborhood-scale production and flex foundation.",
    },
  ],
};
