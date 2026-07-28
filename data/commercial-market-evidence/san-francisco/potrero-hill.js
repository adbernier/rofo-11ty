const district = {
  metroId: "san-francisco",
  metroName: "San Francisco",
  cityId: "san-francisco",
  cityName: "San Francisco",
  districtId: "potrero-hill",
  districtName: "Potrero Hill",
  districtPath: "/commercial-real-estate/CA/san-francisco/potrero-hill/",
  primaryEcosystem: "industrial_flex",
  secondaryEcosystems: ["office", "life_science"],
  referenceDocument: "docs/commercial-market-evidence-financial-district.md",
};

const neighboringDistrictRelationships = [
  {
    districtId: "dogpatch",
    districtName: "Dogpatch",
    relationship:
      "Dogpatch is the stronger comparison when waterfront industrial reuse, Pier 70, Power Station, and Mission Bay-adjacent innovation context matter more than Potrero's neighborhood-scale production and flex edge.",
  },
  {
    districtId: "showplace-square",
    districtName: "Showplace Square",
    relationship:
      "Showplace Square is the stronger comparison when central creative-office, AI, robotics, showroom-adjacent, or Design District overlap matters more than Potrero's practical neighborhood-commercial character.",
  },
  {
    districtId: "mission-bay",
    districtName: "Mission Bay",
    relationship:
      "Mission Bay is the stronger comparison when polished innovation-campus buildings, health care, life science, UCSF gravity, and newer development matter more than production/flex practicality.",
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
    id: "sf-potrero-hill-99-rhode-island",
    title: "99 Rhode Island",
    subjectId: "99-rhode-island-st",
    subjectName: "99 Rhode Island St",
    buildingProfileReference: "/commercial-real-estate/building/CA/san-francisco/99-rhode-island-st/",
    buildingProfileStatus: "source_ready",
    evidenceType: "creative_office_neighborhood_edge",
    evidenceTypeLabel: "Creative Office Neighborhood Edge",
    evidenceRole: "potrero_showplace_transition_benchmark",
    evidenceRoleLabel: "Potrero / Showplace Transition Benchmark",
    confidence: "editorially_supported",
    whyItBelongs:
      "99 Rhode Island fits the Potrero and Showplace transition and illustrates smaller creative office options near the district's northern edge.",
    districtFit:
      "It shows why Potrero Hill can serve creative office users that want neighborhood character and production adjacency without shifting fully into SoMa or Showplace Square.",
    typicalCompanies: [
      "creative office users",
      "studio teams",
      "local professional services",
      "production-adjacent companies",
    ],
    typicalUsers: [
      "teams that want smaller creative office space near Showplace and Mission Bay while preserving Potrero's neighborhood-scale character",
    ],
    leasingSituations: [
      "creative office searches",
      "Potrero versus Showplace comparisons",
      "tenants balancing neighborhood character against central creative-office inventory",
    ],
    strengths: [
      "creative-office relevance",
      "neighborhood edge position",
      "Showplace comparison value",
      "smaller-format office evidence",
    ],
    tradeoffs: [
      "The transition location can make the tenant decision depend on whether Potrero identity or Showplace creative-office depth is more important.",
    ],
    nearbyAlternatives: [
      "300 De Haro",
      "550 15th",
      "1455 17th",
      "Showplace Square creative office buildings",
    ],
    publicSources: repositorySources("/commercial-real-estate/building/CA/san-francisco/99-rhode-island-st/"),
  }),
  evidenceRecord({
    id: "sf-potrero-hill-1000-16th",
    title: "1000 16th / Potrero 1010",
    subjectId: "1000-16th-st",
    subjectName: "1000 16th St",
    buildingProfileReference: "/commercial-real-estate/building/CA/san-francisco/1000-16th-st/",
    buildingProfileStatus: "source_ready",
    evidenceType: "mixed_use_transit_edge_anchor",
    evidenceTypeLabel: "Mixed-Use Transit Edge Anchor",
    evidenceRole: "sixteenth_street_gateway_benchmark",
    evidenceRoleLabel: "16th Street Gateway Benchmark",
    confidence: "editorially_supported",
    whyItBelongs:
      "1000 16th / Potrero 1010 explains how the 16th Street corridor is becoming a mixed-use gateway between Potrero Hill, Mission Bay, and Showplace Square.",
    districtFit:
      "It is more useful as district context than pure office inventory because it shows the neighborhood gateway and mixed-use pattern around Potrero's northern edge.",
    typicalCompanies: [
      "neighborhood-serving retail users",
      "service businesses",
      "local office users",
      "mixed-use commercial tenants",
    ],
    typicalUsers: [
      "businesses that benefit from 16th Street visibility, neighborhood access, and proximity to Mission Bay without requiring a campus-style setting",
    ],
    leasingSituations: [
      "mixed-use gateway comparisons",
      "retail and service-commercial evaluations",
      "tenants comparing Potrero, Mission Bay, and Showplace edge locations",
    ],
    strengths: [
      "16th Street gateway role",
      "mixed-use context",
      "Mission Bay and Showplace adjacency",
      "neighborhood-anchor value",
    ],
    tradeoffs: [
      "The mixed-use context may be less useful for businesses needing pure industrial/flex utility or conventional office scale.",
    ],
    nearbyAlternatives: [
      "150 Hooper",
      "99 Rhode Island",
      "UCSF Mission Bay / Genentech Hall",
      "Mission Bay mixed-use anchors",
    ],
    publicSources: repositorySources("/commercial-real-estate/building/CA/san-francisco/1000-16th-st/"),
  }),
  evidenceRecord({
    id: "sf-potrero-hill-150-hooper",
    title: "150 Hooper",
    subjectId: "150-hooper-st",
    subjectName: "150 Hooper St",
    buildingProfileReference: "/commercial-real-estate/building/CA/san-francisco/150-hooper-st/",
    buildingProfileStatus: "source_ready",
    evidenceType: "design_education_creative_production",
    evidenceTypeLabel: "Design / Education / Creative Production",
    evidenceRole: "maker_education_anchor",
    evidenceRoleLabel: "Maker and Education Anchor",
    confidence: "editorially_supported",
    whyItBelongs:
      "150 Hooper helps explain Potrero Hill's relationship to design, making, education, and production-oriented activity.",
    districtFit:
      "It demonstrates that Potrero's commercial value is not only flex utility; the district also supports institutional and creative-production ecosystems.",
    typicalCompanies: [
      "design education users",
      "creative production teams",
      "maker-oriented organizations",
      "studio and workshop users",
    ],
    typicalUsers: [
      "organizations that need a practical creative-production setting with links to design, education, and maker culture",
    ],
    leasingSituations: [
      "creative production searches",
      "institutional or education-adjacent comparisons",
      "tenants deciding between Potrero, Design District, and Showplace environments",
    ],
    strengths: [
      "design and education signal",
      "creative-production identity",
      "maker ecosystem context",
      "district-anchor role",
    ],
    tradeoffs: [
      "Institutional and production-oriented value does not automatically translate to general office, retail, or life-science suitability.",
    ],
    nearbyAlternatives: [
      "1000 16th",
      "300 De Haro",
      "350 Rhode Island",
      "Design District maker and showroom buildings",
    ],
    publicSources: repositorySources("/commercial-real-estate/building/CA/san-francisco/150-hooper-st/"),
  }),
  evidenceRecord({
    id: "sf-potrero-hill-350-rhode-island",
    title: "350 Rhode Island",
    subjectId: "350-rhode-island-st",
    subjectName: "350 Rhode Island St",
    buildingProfileReference: "/commercial-real-estate/building/CA/san-francisco/350-rhode-island-st/",
    buildingProfileStatus: "source_ready",
    evidenceType: "historic_production_neighborhood_anchor",
    evidenceTypeLabel: "Historic Production Neighborhood Anchor",
    evidenceRole: "older_potrero_commercial_character",
    evidenceRoleLabel: "Older Potrero Commercial Character",
    confidence: "editorially_supported",
    whyItBelongs:
      "350 Rhode Island is useful for understanding older Potrero industrial and commercial character.",
    districtFit:
      "It grounds the collection in Potrero's maker and production roots rather than only newer gateway or Mission Bay-adjacent development.",
    typicalCompanies: [
      "maker businesses",
      "creative production teams",
      "neighborhood service users",
      "small office and studio tenants",
    ],
    typicalUsers: [
      "businesses that value older commercial character and production adjacency more than polished office image",
    ],
    leasingSituations: [
      "historic production-building comparisons",
      "small creative or maker searches",
      "tenants weighing Potrero character against newer Mission Bay or Dogpatch alternatives",
    ],
    strengths: [
      "historic commercial character",
      "production roots",
      "neighborhood-anchor role",
      "useful contrast against newer projects",
    ],
    tradeoffs: [
      "Older building character can require more diligence around building condition, access, loading, power, and user-specific operational fit.",
    ],
    nearbyAlternatives: [
      "99 Rhode Island",
      "1700 17th",
      "1455 17th",
      "Dogpatch maker buildings",
    ],
    publicSources: repositorySources("/commercial-real-estate/building/CA/san-francisco/350-rhode-island-st/"),
  }),
  evidenceRecord({
    id: "sf-potrero-hill-1700-17th",
    title: "1700 17th",
    subjectId: "1700-17th-st",
    subjectName: "1700 17th St",
    buildingProfileReference: "/commercial-real-estate/building/CA/san-francisco/1700-17th-st/",
    buildingProfileStatus: "source_ready",
    evidenceType: "lower_rise_production_flex",
    evidenceTypeLabel: "Lower-Rise Production / Flex",
    evidenceRole: "potrero_flex_operating_benchmark",
    evidenceRoleLabel: "Potrero Flex Operating Benchmark",
    confidence: "editorially_supported",
    whyItBelongs:
      "1700 17th represents the lower-rise production and flex environment that distinguishes Potrero Hill from Mission Bay.",
    districtFit:
      "It explains why Potrero can serve practical creative-production and service-commercial needs that do not fit polished innovation-campus inventory.",
    typicalCompanies: [
      "production users",
      "flex businesses",
      "creative operations teams",
      "service-commercial companies",
    ],
    typicalUsers: [
      "operators that need central San Francisco access with more practical building formats than conventional office districts provide",
    ],
    leasingSituations: [
      "production/flex searches",
      "office-plus-production comparisons",
      "tenants validating whether Potrero, Dogpatch, or Mission District edge buildings fit operations",
    ],
    strengths: [
      "production/flex relevance",
      "lower-rise format",
      "central location",
      "clear contrast against Mission Bay",
    ],
    tradeoffs: [
      "Operational fit is building-specific, so loading, power, permitted use, and visitor needs must be validated carefully.",
    ],
    nearbyAlternatives: [
      "1840 17th",
      "350 Rhode Island",
      "1501 Mariposa",
      "Mission District production/flex edges",
    ],
    publicSources: repositorySources("/commercial-real-estate/building/CA/san-francisco/1700-17th-st/"),
  }),
  evidenceRecord({
    id: "sf-potrero-hill-1840-17th",
    title: "1840 17th",
    subjectId: "1840-17th-st",
    subjectName: "1840 17th St",
    buildingProfileReference: "/commercial-real-estate/building/CA/san-francisco/1840-17th-st/",
    buildingProfileStatus: "source_ready",
    evidenceType: "industrial_production_counterpoint",
    evidenceTypeLabel: "Industrial Production Counterpoint",
    evidenceRole: "non_office_operational_evidence",
    evidenceRoleLabel: "Non-Office Operational Evidence",
    confidence: "editorially_supported",
    whyItBelongs:
      "1840 17th is a useful operational counterpoint to office-heavy SoMa and Mission Bay buildings.",
    districtFit:
      "It keeps Potrero's industrial/flex identity visible by showing production and industrial uses that are easy to miss in office-first comparisons.",
    typicalCompanies: [
      "industrial and production users",
      "service-commercial businesses",
      "flex operators",
      "creative operations teams",
    ],
    typicalUsers: [
      "businesses whose search is driven by operating requirements rather than customer-facing image or office polish",
    ],
    leasingSituations: [
      "industrial/flex comparisons",
      "production and service-commercial searches",
      "tenants validating Potrero against Dogpatch and Mission District edge options",
    ],
    strengths: [
      "industrial and production relevance",
      "non-office comparison value",
      "practical operating context",
      "Potrero identity beyond creative office",
    ],
    tradeoffs: [
      "The operational character may be less appropriate for customer-facing uses, executive office needs, or tenants that require polished amenities.",
    ],
    nearbyAlternatives: [
      "1700 17th",
      "2400 16th",
      "1501 Mariposa",
      "Dogpatch industrial conversion buildings",
    ],
    publicSources: repositorySources("/commercial-real-estate/building/CA/san-francisco/1840-17th-st/"),
  }),
  evidenceRecord({
    id: "sf-potrero-hill-550-15th",
    title: "550 15th",
    subjectId: "550-15th-st",
    subjectName: "550 15th St",
    buildingProfileReference: "/commercial-real-estate/building/CA/san-francisco/550-15th-st/",
    buildingProfileStatus: "source_ready",
    evidenceType: "creative_production_adjacent_office",
    evidenceTypeLabel: "Creative Production-Adjacent Office",
    evidenceRole: "potrero_showplace_overlap_benchmark",
    evidenceRoleLabel: "Potrero / Showplace Overlap Benchmark",
    confidence: "editorially_supported",
    whyItBelongs:
      "550 15th explains the Potrero and Showplace overlap for companies needing office plus practical access.",
    districtFit:
      "It shows how Potrero can support creative office users that still need production-adjacent context near Showplace Square and the Design District.",
    typicalCompanies: [
      "creative office users",
      "production-adjacent teams",
      "design and product companies",
      "studio-oriented office tenants",
    ],
    typicalUsers: [
      "teams that need office functionality and creative character without losing access to practical production or service-commercial surroundings",
    ],
    leasingSituations: [
      "creative office searches",
      "office-plus-production comparisons",
      "tenants deciding whether Potrero, Showplace Square, or Design District is the better frame",
    ],
    strengths: [
      "creative-office fit",
      "production adjacency",
      "Showplace comparison value",
      "practical access context",
    ],
    tradeoffs: [
      "The overlap can blur district identity and may be less compelling if the tenant needs pure office scale or pure production utility.",
    ],
    nearbyAlternatives: [
      "99 Rhode Island",
      "300 De Haro",
      "500 De Haro",
      "Showplace Square creative office buildings",
    ],
    publicSources: repositorySources("/commercial-real-estate/building/CA/san-francisco/550-15th-st/"),
  }),
  evidenceRecord({
    id: "sf-potrero-hill-1455-17th",
    title: "1455 17th",
    subjectId: "1455-17th-st",
    subjectName: "1455 17th St",
    buildingProfileReference: "/commercial-real-estate/building/CA/san-francisco/1455-17th-st/",
    buildingProfileStatus: "source_ready",
    evidenceType: "neighborhood_value_creative_office",
    evidenceTypeLabel: "Neighborhood Value Creative Office",
    evidenceRole: "smaller_format_potrero_benchmark",
    evidenceRoleLabel: "Smaller-Format Potrero Benchmark",
    confidence: "editorially_supported",
    whyItBelongs:
      "1455 17th is a smaller-format example that keeps the Potrero collection from over-indexing on large redevelopment sites.",
    districtFit:
      "It represents the practical neighborhood-office layer that can matter for smaller teams choosing Potrero for character, access, and relative simplicity.",
    typicalCompanies: [
      "small creative office users",
      "local professional services",
      "studio teams",
      "value-oriented office tenants",
    ],
    typicalUsers: [
      "smaller teams that want Potrero location and creative office identity without a large mixed-use or production-heavy building",
    ],
    leasingSituations: [
      "small office searches",
      "value-oriented creative office comparisons",
      "tenants comparing neighborhood-scale Potrero with larger Showplace or Mission Bay options",
    ],
    strengths: [
      "smaller-format office evidence",
      "neighborhood-scale character",
      "value comparison role",
      "balanced portfolio coverage",
    ],
    tradeoffs: [
      "Smaller-format buildings may not provide the expansion capacity, amenities, or operational infrastructure needed by larger or more technical users.",
    ],
    nearbyAlternatives: [
      "99 Rhode Island",
      "350 Rhode Island",
      "1700 17th",
      "Mission District neighborhood office buildings",
    ],
    publicSources: repositorySources("/commercial-real-estate/building/CA/san-francisco/1455-17th-st/"),
  }),
];

module.exports = {
  schemaVersion: "commercial-market-evidence-v1",
  collectionId: "sf-potrero-hill-commercial-market-evidence",
  collectionType: "district_commercial_market_evidence",
  status: "production_reference",
  district,
  districtNarrative: {
    whyItExists:
      "Potrero Hill exists commercially because neighborhood-scale creative office, production/flex buildings, maker roots, 16th Street gateway activity, and adjacency to Mission Bay, Dogpatch, and Showplace Square create a practical central San Francisco operating environment.",
    strongestWhen: [
      "a company needs creative office or light production with more neighborhood character than SoMa or Mission Bay",
      "service-commercial, maker, flex, or production-adjacent requirements benefit from central San Francisco access",
      "the tenant wants proximity to Mission Bay, Dogpatch, Showplace Square, or the Design District without fully adopting those district identities",
      "smaller buildings, practical access, and creative-commercial surroundings matter more than corporate image",
    ],
    weakerWhen: [
      "the company needs formal client-facing office image or large conventional office inventory",
      "validated lab or institutional innovation-campus infrastructure is required",
      "the tenant needs strong transit and amenity depth comparable to SoMa or the Financial District",
      "heavy industrial, loading, power, or yard requirements exceed building-specific capacity",
    ],
  },
  naturalBusinessFit: {
    fits: [
      "creative office users",
      "light production users",
      "maker businesses",
      "service-commercial companies",
      "studio teams",
      "local professional services",
      "office-plus-production users",
      "select life-science-adjacent support teams",
    ],
    lessNaturalFor: [
      "large corporate headquarters users",
      "traditional professional-service firms that need formal downtown image",
      "lab users requiring confirmed technical infrastructure",
      "parking-sensitive customer operations",
      "general retailers that need high-street visibility",
      "heavy industrial users whose requirements must be met by specialized sites",
    ],
  },
  qualityStandard:
    "A strong Potrero Hill Commercial Market Evidence collection should show creative office, production/flex, maker, mixed-use gateway, and neighborhood-scale building formats while clearly distinguishing Potrero from Dogpatch, Showplace Square, Mission Bay, and the Mission District.",
  records,
  deferredCandidates: [
    {
      title: "300 De Haro and 555 De Haro",
      reason:
        "Important Potrero-adjacent production examples, but they are better owned by Showplace Square while this collection centers canonical Potrero Hill records.",
    },
    {
      title: "1501 Mariposa and 2400 16th",
      reason:
        "Useful edge comparisons, but they are already stronger Dogpatch or Mission District evidence and should remain in those collections.",
    },
    {
      title: "Additional Potrero retail and service corridors",
      reason:
        "Potentially useful after Commercial Market Evidence supports non-building corridor evidence more explicitly.",
    },
    {
      title: "Mission Bay lab and research buildings",
      reason:
        "Important comparison evidence, but Mission Bay owns the core institutional and life-science collection.",
    },
  ],
};
