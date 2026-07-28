const district = {
  metroId: "san-francisco",
  metroName: "San Francisco",
  cityId: "san-francisco",
  cityName: "San Francisco",
  districtId: "mission-district",
  districtName: "Mission District",
  districtPath: "/commercial-real-estate/CA/san-francisco/mission-district/",
  primaryEcosystem: "retail",
  secondaryEcosystems: ["office", "industrial_flex"],
  referenceDocument: "docs/commercial-market-evidence-financial-district.md",
};

const neighboringDistrictRelationships = [
  {
    districtId: "soma",
    districtName: "SoMa",
    relationship:
      "SoMa is the stronger comparison when central office inventory, technology-market depth, larger creative buildings, or downtown-adjacent growth-company identity matter more than neighborhood commercial demand.",
  },
  {
    districtId: "potrero-hill",
    districtName: "Potrero Hill",
    relationship:
      "Potrero Hill is the stronger comparison when production, flex, neighborhood-office, and practical access needs matter more than Mission Street visibility or dense neighborhood retail demand.",
  },
  {
    districtId: "design-district",
    districtName: "Design District",
    relationship:
      "The Design District is the stronger comparison when showroom, design-trade, and clustered creative-commercial identity matter more than the Mission's neighborhood, retail, and cultural-commercial character.",
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
    id: "sf-mission-district-armory",
    title: "San Francisco Armory",
    subjectId: "1800-mission-st",
    subjectName: "1800 Mission St",
    buildingProfileReference: "/commercial-real-estate/building/CA/san-francisco/1800-mission-st/",
    buildingProfileStatus: "source_ready",
    evidenceType: "historic_large_format_adaptive_reuse",
    evidenceTypeLabel: "Historic Large-Format Adaptive Reuse",
    evidenceRole: "district_icon_production_benchmark",
    evidenceRoleLabel: "District Icon / Production Benchmark",
    confidence: "editorially_supported",
    whyItBelongs:
      "The San Francisco Armory is the Mission District's clearest large-format commercial landmark and adaptive-reuse reference.",
    districtFit:
      "It shows that the Mission's commercial identity includes historic, production-capable buildings and large floorplates, not only storefront retail and restaurants.",
    typicalCompanies: [
      "production users",
      "creative office teams",
      "event or media operators",
      "large-format adaptive reuse tenants",
    ],
    typicalUsers: [
      "organizations that need a recognizable Mission District setting with unusually large adaptive building character and production-capable history",
    ],
    leasingSituations: [
      "large-format adaptive reuse searches",
      "creative or production-oriented tenant comparisons",
      "users weighing Mission character against SoMa, Potrero, or Design District alternatives",
    ],
    strengths: [
      "district landmark identity",
      "large floorplate signal",
      "historic adaptive reuse character",
      "production and event context",
    ],
    tradeoffs: [
      "The landmark character does not automatically solve parking, loading, operational, or conventional office-image requirements.",
    ],
    nearbyAlternatives: [
      "1850 Bryant",
      "Mission Creative / Daziel Building",
      "3150 18th",
      "SoMa adaptive reuse buildings",
    ],
    publicSources: repositorySources("/commercial-real-estate/building/CA/san-francisco/1800-mission-st/"),
  }),
  evidenceRecord({
    id: "sf-mission-district-heath-ceramics",
    title: "Heath Ceramics San Francisco",
    subjectId: "2900-18th-st",
    subjectName: "2900 18th St",
    buildingProfileReference: "/commercial-real-estate/building/CA/san-francisco/2900-18th-st/",
    buildingProfileStatus: "source_ready",
    evidenceType: "maker_retail_production_anchor",
    evidenceTypeLabel: "Maker / Retail / Production Anchor",
    evidenceRole: "neighborhood_commercial_ecosystem_anchor",
    evidenceRoleLabel: "Neighborhood Commercial Ecosystem Anchor",
    confidence: "editorially_supported",
    whyItBelongs:
      "Heath Ceramics San Francisco is essential non-office evidence showing how the Mission supports production, retail, food, design, and community-facing business under one roof.",
    districtFit:
      "It explains why the Mission is commercially useful for neighborhood-facing maker and design businesses that depend on culture, foot traffic, and production adjacency.",
    typicalCompanies: [
      "maker businesses",
      "design retailers",
      "food and beverage operators",
      "community-facing brands",
    ],
    typicalUsers: [
      "businesses that need a public-facing Mission address while preserving maker, design, production, or experiential retail identity",
    ],
    leasingSituations: [
      "maker-retail searches",
      "neighborhood anchor comparisons",
      "tenants weighing the Mission against Design District and Potrero production-adjacent alternatives",
    ],
    strengths: [
      "maker and design identity",
      "neighborhood-anchor role",
      "public-facing retail relevance",
      "production and community context",
    ],
    tradeoffs: [
      "This kind of mixed production and retail model is highly operator-specific and does not translate cleanly to every office, retail, or flex tenant.",
    ],
    nearbyAlternatives: [
      "3150 18th",
      "2400 16th",
      "San Francisco Design Center - Showplace",
      "Potrero Hill production buildings",
    ],
    publicSources: repositorySources("/commercial-real-estate/building/CA/san-francisco/2900-18th-st/"),
  }),
  evidenceRecord({
    id: "sf-mission-district-1850-bryant",
    title: "1850 Bryant",
    subjectId: "1850-bryant-st",
    subjectName: "1850 Bryant St",
    buildingProfileReference: "/commercial-real-estate/building/CA/san-francisco/1850-bryant-st/",
    buildingProfileStatus: "source_ready",
    evidenceType: "emerging_office_rd_innovation",
    evidenceTypeLabel: "Emerging Office/R&D Innovation",
    evidenceRole: "mission_innovation_edge_benchmark",
    evidenceRoleLabel: "Mission Innovation Edge Benchmark",
    confidence: "editorially_supported",
    whyItBelongs:
      "1850 Bryant explains where the Mission may support larger office/R&D and innovation uses without becoming SoMa or Mission Bay.",
    districtFit:
      "It gives the district a future-facing commercial edge while preserving the important distinction that the Mission is not a conventional office-core district.",
    typicalCompanies: [
      "office/R&D users",
      "innovation companies",
      "creative technology teams",
      "production-adjacent growth companies",
    ],
    typicalUsers: [
      "teams that want Mission identity and proximity to Potrero or Showplace while evaluating whether a larger modern project can support technical work",
    ],
    leasingSituations: [
      "office/R&D searches",
      "Mission versus Potrero and SoMa comparisons",
      "tenants validating whether emerging Mission projects can support innovation use cases",
    ],
    strengths: [
      "emerging innovation signal",
      "larger-format project role",
      "Mission and Potrero edge relevance",
      "useful contrast against neighborhood-scale buildings",
    ],
    tradeoffs: [
      "Emerging office/R&D positioning requires careful validation of delivery, technical capabilities, and whether the Mission context fits employees and visitors.",
    ],
    nearbyAlternatives: [
      "San Francisco Armory",
      "2400 16th",
      "1700 17th",
      "Potrero Hill production/flex buildings",
    ],
    publicSources: repositorySources("/commercial-real-estate/building/CA/san-francisco/1850-bryant-st/"),
  }),
  evidenceRecord({
    id: "sf-mission-district-mission-creative",
    title: "Mission Creative / Daziel Building",
    subjectId: "2741-16th-st",
    subjectName: "2741 16th St",
    buildingProfileReference: "/commercial-real-estate/building/CA/san-francisco/2741-16th-st/",
    buildingProfileStatus: "source_ready",
    evidenceType: "creative_neighborhood_adaptive_reuse",
    evidenceTypeLabel: "Creative Neighborhood Adaptive Reuse",
    evidenceRole: "sixteenth_street_creative_benchmark",
    evidenceRoleLabel: "16th Street Creative Benchmark",
    confidence: "editorially_supported",
    whyItBelongs:
      "Mission Creative / Daziel Building is a smaller-scale creative-office reference near the 16th Street corridor.",
    districtFit:
      "It shows the Mission's selective office fit for creative and neighborhood-oriented users that value corridor identity over conventional corporate office depth.",
    typicalCompanies: [
      "creative studios",
      "design and media teams",
      "nonprofits",
      "neighborhood professional-service firms",
    ],
    typicalUsers: [
      "teams that want creative office in a recognizable Mission corridor without needing a large campus, tower, or formal downtown address",
    ],
    leasingSituations: [
      "creative office searches",
      "16th Street corridor comparisons",
      "tenants comparing smaller Mission buildings with SoMa or Design District alternatives",
    ],
    strengths: [
      "creative-office character",
      "16th Street corridor relevance",
      "adaptive neighborhood identity",
      "smaller-scale office fit",
    ],
    tradeoffs: [
      "Smaller neighborhood office formats may limit expansion options and may not satisfy users that need conventional Class A polish or parking.",
    ],
    nearbyAlternatives: [
      "1880 Mission",
      "San Francisco Armory",
      "3150 18th",
      "SoMa creative office buildings",
    ],
    publicSources: repositorySources("/commercial-real-estate/building/CA/san-francisco/2741-16th-st/"),
  }),
  evidenceRecord({
    id: "sf-mission-district-1880-mission",
    title: "1880 Mission",
    subjectId: "1880-mission-st",
    subjectName: "1880 Mission St",
    buildingProfileReference: "/commercial-real-estate/building/CA/san-francisco/1880-mission-st/",
    buildingProfileStatus: "source_ready",
    evidenceType: "transit_oriented_neighborhood_office",
    evidenceTypeLabel: "Transit-Oriented Neighborhood Office",
    evidenceRole: "mission_street_practical_office_benchmark",
    evidenceRoleLabel: "Mission Street Practical Office Benchmark",
    confidence: "editorially_supported",
    whyItBelongs:
      "1880 Mission represents practical transit-oriented office near 16th Street BART and Mission Street commercial activity.",
    districtFit:
      "It helps explain how the Mission can work for selective office users whose employees and customers value transit, walkability, and neighborhood visibility.",
    typicalCompanies: [
      "local professional services",
      "nonprofits",
      "creative teams",
      "service-oriented office users",
    ],
    typicalUsers: [
      "organizations that need Mission Street access and transit convenience more than executive image or large contiguous office inventory",
    ],
    leasingSituations: [
      "neighborhood office searches",
      "transit-oriented Mission Street comparisons",
      "tenants balancing customer access against parking and loading constraints",
    ],
    strengths: [
      "Mission Street visibility",
      "transit orientation",
      "neighborhood office practicality",
      "customer and employee access",
    ],
    tradeoffs: [
      "Mission Street visibility and transit access can come with parking, loading, and block-specific operating tradeoffs.",
    ],
    nearbyAlternatives: [
      "Mission Creative / Daziel Building",
      "San Francisco Armory",
      "1850 Bryant",
      "SoMa transit-oriented offices",
    ],
    publicSources: repositorySources("/commercial-real-estate/building/CA/san-francisco/1880-mission-st/"),
  }),
  evidenceRecord({
    id: "sf-mission-district-3150-18th",
    title: "3150 18th",
    subjectId: "3150-18th-st",
    subjectName: "3150 18th St",
    buildingProfileReference: "/commercial-real-estate/building/CA/san-francisco/3150-18th-st/",
    buildingProfileStatus: "source_ready",
    evidenceType: "maker_creative_adaptive_reuse",
    evidenceTypeLabel: "Maker / Creative Adaptive Reuse",
    evidenceRole: "alabama_18th_creative_production_cluster",
    evidenceRoleLabel: "Alabama / 18th Creative Production Cluster",
    confidence: "editorially_supported",
    whyItBelongs:
      "3150 18th helps explain the Alabama and 18th Street creative-production cluster and why companies choose the Mission for culture and maker adjacency.",
    districtFit:
      "It demonstrates the Mission's creative production layer between neighborhood retail corridors and the more industrial Potrero or Dogpatch alternatives.",
    typicalCompanies: [
      "creative office users",
      "maker businesses",
      "design teams",
      "studio and production-adjacent companies",
    ],
    typicalUsers: [
      "tenants that want Mission cultural identity, maker adjacency, and adaptive building character in a smaller creative-commercial setting",
    ],
    leasingSituations: [
      "creative-production searches",
      "maker and studio comparisons",
      "tenants weighing Mission, Design District, Potrero, and Showplace locations",
    ],
    strengths: [
      "maker adjacency",
      "creative-production context",
      "adaptive reuse character",
      "Alabama and 18th Street cluster value",
    ],
    tradeoffs: [
      "The building's value is tied to creative and maker context, so it may be less persuasive for conventional office users or broad retail concepts.",
    ],
    nearbyAlternatives: [
      "Heath Ceramics San Francisco",
      "Mission Creative / Daziel Building",
      "2400 16th",
      "Design District adaptive showroom buildings",
    ],
    publicSources: repositorySources("/commercial-real-estate/building/CA/san-francisco/3150-18th-st/"),
  }),
  evidenceRecord({
    id: "sf-mission-district-2400-16th",
    title: "2400 16th",
    subjectId: "2400-16th-st",
    subjectName: "2400 16th St",
    buildingProfileReference: "/commercial-real-estate/building/CA/san-francisco/2400-16th-st/",
    buildingProfileStatus: "source_ready",
    evidenceType: "production_flex_neighborhood_edge",
    evidenceTypeLabel: "Production / Flex Neighborhood Edge",
    evidenceRole: "mission_potrero_operational_edge",
    evidenceRoleLabel: "Mission / Potrero Operational Edge",
    confidence: "editorially_supported",
    whyItBelongs:
      "2400 16th represents the Mission's production and flex edge near Potrero and Showplace Square.",
    districtFit:
      "It keeps the collection honest about operational uses that sit near the Mission boundary and are not captured by restaurant, retail, or creative-office examples alone.",
    typicalCompanies: [
      "production users",
      "flex businesses",
      "service-commercial operators",
      "creative operations teams",
    ],
    typicalUsers: [
      "businesses that need practical operating characteristics while staying close to the Mission, Potrero, and Showplace commercial edges",
    ],
    leasingSituations: [
      "production/flex searches",
      "Mission versus Potrero comparisons",
      "tenants validating loading, access, and operational fit near central San Francisco",
    ],
    strengths: [
      "production and flex relevance",
      "neighborhood-edge role",
      "Potrero and Showplace comparison value",
      "operational counterpoint to retail and office records",
    ],
    tradeoffs: [
      "Operationally useful edge buildings can be less polished for customer visits and require detailed validation of permitted use, loading, and access.",
    ],
    nearbyAlternatives: [
      "1850 Bryant",
      "1700 17th",
      "3150 18th",
      "Potrero Hill flex buildings",
    ],
    publicSources: repositorySources("/commercial-real-estate/building/CA/san-francisco/2400-16th-st/"),
  }),
  evidenceRecord({
    id: "sf-mission-district-new-mission-theater",
    title: "2601 Mission / New Mission Theater",
    subjectId: "2601-mission-st",
    subjectName: "2601 Mission St",
    buildingProfileReference: "/commercial-real-estate/building/CA/san-francisco/2601-mission-st/",
    buildingProfileStatus: "source_ready",
    evidenceType: "historic_mixed_use_neighborhood_anchor",
    evidenceTypeLabel: "Historic Mixed-Use Neighborhood Anchor",
    evidenceRole: "mission_street_cultural_commercial_anchor",
    evidenceRoleLabel: "Mission Street Cultural Commercial Anchor",
    confidence: "editorially_supported",
    whyItBelongs:
      "2601 Mission / New Mission Theater is a key commercial landmark for understanding Mission Street's neighborhood-serving and entertainment identity.",
    districtFit:
      "It shows the Mission's commercial geography as a public-facing neighborhood corridor, not just a workplace or production district.",
    typicalCompanies: [
      "food and beverage operators",
      "entertainment and hospitality users",
      "service retail",
      "neighborhood-facing brands",
    ],
    typicalUsers: [
      "businesses that depend on Mission Street visibility, neighborhood demand, cultural identity, and public-facing commercial activity",
    ],
    leasingSituations: [
      "neighborhood retail and hospitality comparisons",
      "Mission Street visibility evaluations",
      "tenants distinguishing public-facing commercial demand from office or production needs",
    ],
    strengths: [
      "Mission Street landmark identity",
      "neighborhood-serving commercial relevance",
      "historic mixed-use character",
      "retail and entertainment context",
    ],
    tradeoffs: [
      "Public-facing neighborhood energy may not align with quieter office users, production needs, or parking-sensitive customer operations.",
    ],
    nearbyAlternatives: [
      "San Francisco Armory",
      "1880 Mission",
      "Mission Creative / Daziel Building",
      "Mission Street retail corridors",
    ],
    publicSources: repositorySources("/commercial-real-estate/building/CA/san-francisco/2601-mission-st/"),
  }),
];

module.exports = {
  schemaVersion: "commercial-market-evidence-v1",
  collectionId: "sf-mission-district-commercial-market-evidence",
  collectionType: "district_commercial_market_evidence",
  status: "production_reference",
  district,
  districtNarrative: {
    whyItExists:
      "The Mission District exists commercially because dense neighborhood demand, Mission Street visibility, BART access, creative culture, maker and production roots, and selective adaptive office buildings overlap in a district that is useful but not conventional.",
    strongestWhen: [
      "a business depends on neighborhood customers, foot traffic, cultural identity, or Mission Street visibility",
      "creative, maker, nonprofit, or local professional-service users value Mission identity and transit access",
      "production, studio, or flex-adjacent needs can be met on the Potrero or Showplace edge",
      "the tenant wants a commercial environment with more neighborhood energy than SoMa, the Financial District, or Mission Bay",
    ],
    weakerWhen: [
      "the company needs a formal corporate office image or large conventional office inventory",
      "parking-heavy customer access is central to the business model",
      "validated lab or institutional innovation-campus infrastructure is required",
      "the tenant needs predictable loading, power, or operational capacity that must be verified building by building",
    ],
  },
  naturalBusinessFit: {
    fits: [
      "neighborhood retail users",
      "restaurants and food operators",
      "wellness and service businesses",
      "creative office users",
      "nonprofits",
      "maker businesses",
      "production-adjacent companies",
      "local professional-service firms",
    ],
    lessNaturalFor: [
      "traditional corporate headquarters users",
      "large office tenants that need broad contiguous inventory",
      "parking-sensitive customer operations",
      "lab users requiring confirmed technical infrastructure",
      "general industrial users with heavy loading or yard requirements",
      "retailers that need a polished high-street environment rather than neighborhood-specific demand",
    ],
  },
  qualityStandard:
    "A strong Mission District Commercial Market Evidence collection should show neighborhood-serving retail, Mission Street visibility, creative and maker culture, selective office fit, and production/flex edges without treating the district like a conventional office market.",
  records,
  deferredCandidates: [
    {
      title: "Additional Mission Street storefront and food corridors",
      reason:
        "Important for deeper retail evidence, but this first collection uses landmark and Building Profile-backed records that the validator can resolve.",
    },
    {
      title: "Clarion, Valencia, and 24th Street retail nodes",
      reason:
        "Useful future neighborhood-commercial evidence, but they require a broader non-building evidence model or additional canonical source records.",
    },
    {
      title: "Potrero and Showplace production/flex alternatives",
      reason:
        "Relevant comparisons, but they should remain in their own district collections unless a future edge-specific mission needs cross-district evidence.",
    },
    {
      title: "Additional arts, cultural, and community anchors",
      reason:
        "Potentially valuable for explainability, but they should be added after Commercial Market Evidence supports non-building evidence types more explicitly.",
    },
  ],
};
