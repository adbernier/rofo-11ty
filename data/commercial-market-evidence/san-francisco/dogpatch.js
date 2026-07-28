const district = {
  metroId: "san-francisco",
  metroName: "San Francisco",
  cityId: "san-francisco",
  cityName: "San Francisco",
  districtId: "dogpatch",
  districtName: "Dogpatch",
  districtPath: "/commercial-real-estate/CA/san-francisco/dogpatch/",
  primaryEcosystem: "industrial_flex",
  secondaryEcosystems: ["office", "life_science"],
  referenceDocument: "docs/commercial-market-evidence-financial-district.md",
};

const neighboringDistrictRelationships = [
  {
    districtId: "mission-bay",
    districtName: "Mission Bay",
    relationship:
      "Mission Bay is the stronger comparison when polished innovation-campus context, UCSF adjacency, health care, life science, and newer master-planned buildings matter more than industrial reuse character.",
  },
  {
    districtId: "potrero-hill",
    districtName: "Potrero Hill",
    relationship:
      "Potrero Hill is the stronger comparison when lower-rise neighborhood office, production, maker, and service-commercial needs matter more than waterfront redevelopment or Mission Bay adjacency.",
  },
  {
    districtId: "showplace-square",
    districtName: "Showplace Square",
    relationship:
      "Showplace Square is the stronger comparison when creative-office, production-adjacent, AI, robotics, or design-market adjacency matters more than Dogpatch's waterfront industrial-reuse story.",
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
    id: "sf-dogpatch-pier-70-building-12",
    title: "Pier 70 Building 12",
    subjectId: "70-pier-bldg-102",
    subjectName: "70 Pier Bldg 102",
    buildingProfileReference: "/commercial-real-estate/building/CA/san-francisco/70-pier-bldg-102/",
    buildingProfileStatus: "source_ready",
    evidenceType: "waterfront_industrial_adaptive_reuse",
    evidenceTypeLabel: "Waterfront Industrial Adaptive Reuse",
    evidenceRole: "pier_70_mixed_commercial_anchor",
    evidenceRoleLabel: "Pier 70 Mixed Commercial Anchor",
    confidence: "editorially_supported",
    whyItBelongs:
      "Pier 70 Building 12 is the strongest current example of Dogpatch industrial reuse becoming a modern mixed commercial environment.",
    districtFit:
      "It explains the district's core difference from Mission Bay: Dogpatch commercial value comes from adapting industrial waterfront fabric, not only from new innovation-campus development.",
    typicalCompanies: [
      "creative office users",
      "maker-oriented brands",
      "design and production-adjacent teams",
      "innovation users seeking waterfront character",
    ],
    typicalUsers: [
      "teams that want modern commercial functionality while keeping a visible connection to Dogpatch's industrial and waterfront history",
    ],
    leasingSituations: [
      "adaptive reuse office searches",
      "creative or product teams comparing Mission Bay polish with Dogpatch character",
      "tenants evaluating mixed commercial environments near Pier 70",
    ],
    strengths: [
      "district-defining adaptive reuse",
      "waterfront industrial identity",
      "mixed commercial environment",
      "strong comparison value against Mission Bay",
    ],
    tradeoffs: [
      "The industrial-reuse setting may require more validation around access, building-specific fit, and daily employee convenience than newer Mission Bay buildings.",
    ],
    nearbyAlternatives: [
      "Pier 70 Building 101",
      "Power Station - Station A",
      "American Industrial Center",
      "Mission Bay waterfront office buildings",
    ],
    publicSources: repositorySources("/commercial-real-estate/building/CA/san-francisco/70-pier-bldg-102/"),
  }),
  evidenceRecord({
    id: "sf-dogpatch-pier-70-building-101",
    title: "Pier 70 Building 101",
    subjectId: "pier-70-building-101",
    subjectName: "Pier 70 Building 101",
    buildingProfileReference: "/commercial-real-estate/building/CA/san-francisco/pier-70-building-101/",
    buildingProfileStatus: "source_ready",
    evidenceType: "historic_shipyard_adaptive_reuse",
    evidenceTypeLabel: "Historic Shipyard Adaptive Reuse",
    evidenceRole: "historic_waterfront_reuse_benchmark",
    evidenceRoleLabel: "Historic Waterfront Reuse Benchmark",
    confidence: "editorially_supported",
    whyItBelongs:
      "Pier 70 Building 101 helps explain the historic shipyard character that makes Dogpatch commercially distinct from conventional office districts.",
    districtFit:
      "It shows the long-term reuse potential of industrial waterfront assets and anchors the district narrative beyond isolated creative-office buildings.",
    typicalCompanies: [
      "creative office users",
      "production-adjacent companies",
      "innovation teams",
      "design and maker businesses",
    ],
    typicalUsers: [
      "businesses that want a location story connected to industrial heritage, waterfront redevelopment, and creative commercial reuse",
    ],
    leasingSituations: [
      "historic adaptive reuse comparisons",
      "tenants weighing Pier 70 against Power Station and Mission Bay options",
      "creative teams evaluating character-rich waterfront environments",
    ],
    strengths: [
      "historic shipyard identity",
      "waterfront redevelopment context",
      "adaptive reuse value",
      "strong district storytelling role",
    ],
    tradeoffs: [
      "Historic industrial character may not provide the same predictability, image, or transit convenience as newer purpose-built office and lab environments.",
    ],
    nearbyAlternatives: [
      "Pier 70 Building 12",
      "Power Station - Station A",
      "American Industrial Center",
      "Mission Bay innovation buildings",
    ],
    publicSources: repositorySources("/commercial-real-estate/building/CA/san-francisco/pier-70-building-101/"),
  }),
  evidenceRecord({
    id: "sf-dogpatch-power-station-station-a",
    title: "Power Station - Station A",
    subjectId: "1201-illinois-st",
    subjectName: "1201 Illinois St",
    buildingProfileReference: "/commercial-real-estate/building/CA/san-francisco/1201-illinois-st/",
    buildingProfileStatus: "source_ready",
    evidenceType: "industrial_innovation_district_anchor",
    evidenceTypeLabel: "Industrial Innovation District Anchor",
    evidenceRole: "power_station_transition_anchor",
    evidenceRoleLabel: "Power Station Transition Anchor",
    confidence: "editorially_supported",
    whyItBelongs:
      "Power Station - Station A is a landmark anchor for Dogpatch's shift from industrial infrastructure toward office, R&D, and mixed-use redevelopment.",
    districtFit:
      "It captures Dogpatch's future-facing commercial identity: industrial utility and waterfront land can become innovation-oriented workspace without becoming Mission Bay.",
    typicalCompanies: [
      "innovation companies",
      "office/R&D users",
      "technology teams",
      "life-science-adjacent companies",
    ],
    typicalUsers: [
      "companies comparing future-oriented Dogpatch redevelopment with Mission Bay's more established institutional and innovation-campus environment",
    ],
    leasingSituations: [
      "office/R&D searches",
      "tenants evaluating Power Station and Pier 70 redevelopment",
      "companies comparing district maturity against future growth potential",
    ],
    strengths: [
      "landmark redevelopment identity",
      "office/R&D positioning",
      "waterfront and industrial context",
      "clear future-supply signal",
    ],
    tradeoffs: [
      "Future-facing redevelopment may involve more timing, delivery, and district-maturity questions than established office or lab clusters.",
    ],
    nearbyAlternatives: [
      "Power Station - 300 23rd St",
      "Power Station - 200 23rd St",
      "Pier 70 Building 12",
      "Mission Bay innovation buildings",
    ],
    publicSources: repositorySources("/commercial-real-estate/building/CA/san-francisco/1201-illinois-st/"),
  }),
  evidenceRecord({
    id: "sf-dogpatch-power-station-300-23rd",
    title: "Power Station - 300 23rd St",
    subjectId: "300-23rd-st",
    subjectName: "300 23rd St",
    buildingProfileReference: "/commercial-real-estate/building/CA/san-francisco/300-23rd-st/",
    buildingProfileStatus: "source_ready",
    evidenceType: "modern_office_rd_waterfront",
    evidenceTypeLabel: "Modern Office/R&D Waterfront Building",
    evidenceRole: "next_generation_workspace_benchmark",
    evidenceRoleLabel: "Next-Generation Workspace Benchmark",
    confidence: "editorially_supported",
    whyItBelongs:
      "Power Station - 300 23rd St represents the next generation of Dogpatch workspace: larger, flexible, technically capable buildings near Mission Bay.",
    districtFit:
      "It demonstrates that Dogpatch can support more advanced office/R&D and life-science-adjacent demand while retaining an industrial waterfront location story.",
    typicalCompanies: [
      "office/R&D users",
      "life-science-adjacent teams",
      "technology companies",
      "innovation and product groups",
    ],
    typicalUsers: [
      "teams that need more capability and scale than legacy creative buildings while still comparing Dogpatch against Mission Bay",
    ],
    leasingSituations: [
      "office/R&D requirements",
      "life-science-adjacent location comparisons",
      "companies weighing Power Station buildings against Mission Bay and South Beach options",
    ],
    strengths: [
      "larger flexible workspace",
      "technical capability signal",
      "Mission Bay adjacency",
      "future Dogpatch growth evidence",
    ],
    tradeoffs: [
      "Technical suitability, delivery timing, and specific space capabilities must be validated before treating the building as a substitute for established lab inventory.",
    ],
    nearbyAlternatives: [
      "Power Station - 200 23rd St",
      "Power Station - Station A",
      "550 Terry Francois",
      "Mission Bay life science buildings",
    ],
    publicSources: repositorySources("/commercial-real-estate/building/CA/san-francisco/300-23rd-st/"),
  }),
  evidenceRecord({
    id: "sf-dogpatch-power-station-200-23rd",
    title: "Power Station - 200 23rd St",
    subjectId: "200-23rd-st",
    subjectName: "200 23rd St",
    buildingProfileReference: "/commercial-real-estate/building/CA/san-francisco/200-23rd-st/",
    buildingProfileStatus: "source_ready",
    evidenceType: "office_rd_supply_depth",
    evidenceTypeLabel: "Office/R&D Supply Depth",
    evidenceRole: "power_station_scale_complement",
    evidenceRoleLabel: "Power Station Scale Complement",
    confidence: "editorially_supported",
    whyItBelongs:
      "Power Station - 200 23rd St complements 300 23rd and helps show the scale of future Dogpatch commercial supply.",
    districtFit:
      "It makes the Power Station story more than one anchor building by showing a repeatable office/R&D district pattern emerging near the waterfront.",
    typicalCompanies: [
      "R&D-oriented companies",
      "technology users",
      "life-science support teams",
      "innovation and growth companies",
    ],
    typicalUsers: [
      "organizations that need enough district depth to compare multiple modern Dogpatch options rather than a single one-off building",
    ],
    leasingSituations: [
      "multi-building Power Station comparisons",
      "tenants evaluating future supply depth",
      "users balancing Mission Bay specialization with Dogpatch flexibility",
    ],
    strengths: [
      "Power Station depth",
      "modern office/R&D positioning",
      "waterfront redevelopment context",
      "scale comparison against 300 23rd",
    ],
    tradeoffs: [
      "The same future-supply advantages also create review needs around timing, delivered condition, and whether the specific building supports the intended operations.",
    ],
    nearbyAlternatives: [
      "Power Station - 300 23rd St",
      "Power Station - Station A",
      "409 Illinois",
      "Mission Bay innovation buildings",
    ],
    publicSources: repositorySources("/commercial-real-estate/building/CA/san-francisco/200-23rd-st/"),
  }),
  evidenceRecord({
    id: "sf-dogpatch-ucsf-life-sciences-building",
    title: "UCSF Life Sciences Building",
    subjectId: "654-minnesota-st",
    subjectName: "654 Minnesota St",
    buildingProfileReference: "/commercial-real-estate/building/CA/san-francisco/654-minnesota-st/",
    buildingProfileStatus: "source_ready",
    evidenceType: "institutional_life_science_anchor",
    evidenceTypeLabel: "Institutional Life Science Anchor",
    evidenceRole: "mission_bay_ecosystem_bridge",
    evidenceRoleLabel: "Mission Bay Ecosystem Bridge",
    confidence: "editorially_supported",
    whyItBelongs:
      "The UCSF Life Sciences Building links Dogpatch directly to Mission Bay's clinical, research, and life-science ecosystem.",
    districtFit:
      "It explains why Dogpatch can be relevant to life-science-adjacent and research users even when Mission Bay remains the stronger institutional core.",
    typicalCompanies: [
      "life-science support teams",
      "research-adjacent companies",
      "medical and innovation users",
      "institutional partners",
    ],
    typicalUsers: [
      "organizations that value UCSF and Mission Bay proximity but want to understand whether Dogpatch provides a more flexible or industrial-adjacent setting",
    ],
    leasingSituations: [
      "life-science-adjacent searches",
      "Mission Bay versus Dogpatch comparisons",
      "research support or innovation users validating proximity requirements",
    ],
    strengths: [
      "institutional anchor signal",
      "life-science adjacency",
      "Mission Bay bridge role",
      "future innovation ecosystem context",
    ],
    tradeoffs: [
      "Dogpatch adjacency does not automatically provide validated lab infrastructure, so users must confirm technical needs building by building.",
    ],
    nearbyAlternatives: [
      "UCSF Mission Bay / Genentech Hall",
      "The Exchange",
      "Power Station - Station A",
      "Mission Bay research buildings",
    ],
    publicSources: repositorySources("/commercial-real-estate/building/CA/san-francisco/654-minnesota-st/"),
  }),
  evidenceRecord({
    id: "sf-dogpatch-american-industrial-center",
    title: "American Industrial Center",
    subjectId: "2325-3rd-st",
    subjectName: "2325 3rd St",
    buildingProfileReference: "/commercial-real-estate/building/CA/san-francisco/2325-3rd-st/",
    buildingProfileStatus: "source_ready",
    evidenceType: "maker_industrial_conversion",
    evidenceTypeLabel: "Maker / Industrial Conversion",
    evidenceRole: "small_business_production_roots",
    evidenceRoleLabel: "Small Business Production Roots",
    confidence: "editorially_supported",
    whyItBelongs:
      "American Industrial Center is essential non-trophy evidence of Dogpatch's maker, studio, production, and small-business roots.",
    districtFit:
      "It keeps the collection grounded in operational industrial conversion rather than making Dogpatch only about future waterfront redevelopment.",
    typicalCompanies: [
      "maker businesses",
      "creative production teams",
      "small business operators",
      "studio and light-production users",
    ],
    typicalUsers: [
      "businesses that need practical creative-production space and care less about polished office image than operational flexibility",
    ],
    leasingSituations: [
      "small-bay or production-adjacent searches",
      "maker and studio space comparisons",
      "tenants weighing Dogpatch against Potrero Hill and Showplace Square",
    ],
    strengths: [
      "maker and production identity",
      "small-business relevance",
      "industrial conversion character",
      "practical counterpoint to redevelopment anchors",
    ],
    tradeoffs: [
      "Operationally useful converted industrial space may require more diligence around loading, power, permitted use, visitor access, and customer presentation.",
    ],
    nearbyAlternatives: [
      "700 Indiana",
      "900 Minnesota",
      "1501 Mariposa",
      "Potrero Hill production buildings",
    ],
    publicSources: repositorySources("/commercial-real-estate/building/CA/san-francisco/2325-3rd-st/"),
  }),
  evidenceRecord({
    id: "sf-dogpatch-700-indiana",
    title: "700 Indiana",
    subjectId: "700-indiana-st",
    subjectName: "700 Indiana St",
    buildingProfileReference: "/commercial-real-estate/building/CA/san-francisco/700-indiana-st/",
    buildingProfileStatus: "source_ready",
    evidenceType: "neighborhood_scale_industrial_conversion",
    evidenceTypeLabel: "Neighborhood-Scale Industrial Conversion",
    evidenceRole: "smaller_dogpatch_format_benchmark",
    evidenceRoleLabel: "Smaller Dogpatch Format Benchmark",
    confidence: "editorially_supported",
    whyItBelongs:
      "700 Indiana explains smaller Dogpatch commercial formats near the historic industrial core.",
    districtFit:
      "It shows that Dogpatch's usefulness is not limited to large redevelopment projects; smaller adaptive buildings also support creative and practical users.",
    typicalCompanies: [
      "creative office users",
      "small production teams",
      "studio businesses",
      "local service-commercial users",
    ],
    typicalUsers: [
      "tenants seeking a smaller industrial-conversion environment with Dogpatch character and less campus-like scale",
    ],
    leasingSituations: [
      "smaller creative office searches",
      "neighborhood-scale production comparisons",
      "tenants comparing American Industrial Center, Minnesota Street, and Pier 70 options",
    ],
    strengths: [
      "smaller building scale",
      "industrial conversion identity",
      "historic-core context",
      "practical comparison value",
    ],
    tradeoffs: [
      "Smaller converted buildings may offer less expansion flexibility, amenity depth, or technical predictability than larger redevelopment assets.",
    ],
    nearbyAlternatives: [
      "American Industrial Center",
      "900 Minnesota",
      "Pier 70 Building 12",
      "Showplace Square creative buildings",
    ],
    publicSources: repositorySources("/commercial-real-estate/building/CA/san-francisco/700-indiana-st/"),
  }),
  evidenceRecord({
    id: "sf-dogpatch-900-minnesota",
    title: "900 Minnesota",
    subjectId: "900-minnesota-st",
    subjectName: "900 Minnesota St",
    buildingProfileReference: "/commercial-real-estate/building/CA/san-francisco/900-minnesota-st/",
    buildingProfileStatus: "source_ready",
    evidenceType: "historic_neighborhood_creative_office",
    evidenceTypeLabel: "Historic Neighborhood Creative Office",
    evidenceRole: "lower_rise_neighborhood_anchor",
    evidenceRoleLabel: "Lower-Rise Neighborhood Anchor",
    confidence: "editorially_supported",
    whyItBelongs:
      "900 Minnesota shows the lower-rise neighborhood office and creative-production environment that differs from Mission Bay.",
    districtFit:
      "It helps explain the human-scale Dogpatch commercial fabric between large waterfront redevelopment and everyday creative-production buildings.",
    typicalCompanies: [
      "creative office users",
      "studio companies",
      "neighborhood service businesses",
      "production-adjacent teams",
    ],
    typicalUsers: [
      "teams that want neighborhood character and creative-production context rather than a polished innovation campus or downtown tower",
    ],
    leasingSituations: [
      "lower-rise creative office searches",
      "Dogpatch versus Mission Bay comparisons",
      "tenants evaluating neighborhood character against scale and amenities",
    ],
    strengths: [
      "historic neighborhood character",
      "creative-production context",
      "lower-rise format",
      "clear contrast with Mission Bay",
    ],
    tradeoffs: [
      "Neighborhood-scale character can come with fewer large-user amenities and less conventional office polish than newer innovation districts.",
    ],
    nearbyAlternatives: [
      "700 Indiana",
      "American Industrial Center",
      "99 Rhode Island",
      "Potrero Hill creative buildings",
    ],
    publicSources: repositorySources("/commercial-real-estate/building/CA/san-francisco/900-minnesota-st/"),
  }),
  evidenceRecord({
    id: "sf-dogpatch-1501-mariposa",
    title: "1501 Mariposa",
    subjectId: "1501-mariposa-st",
    subjectName: "1501 Mariposa St",
    buildingProfileReference: "/commercial-real-estate/building/CA/san-francisco/1501-mariposa-st/",
    buildingProfileStatus: "source_ready",
    evidenceType: "production_flex_neighborhood_edge",
    evidenceTypeLabel: "Production / Flex Neighborhood Edge",
    evidenceRole: "dogpatch_potrero_operational_edge",
    evidenceRoleLabel: "Dogpatch / Potrero Operational Edge",
    confidence: "editorially_supported",
    whyItBelongs:
      "1501 Mariposa represents the operational and PDR edge of Dogpatch and Potrero that many office-only comparisons miss.",
    districtFit:
      "It protects Dogpatch's industrial/flex identity by showing the production and service-commercial uses that sit behind the district's innovation narrative.",
    typicalCompanies: [
      "production teams",
      "flex users",
      "service-commercial businesses",
      "creative operations companies",
    ],
    typicalUsers: [
      "businesses that need practical operating characteristics and may compare Dogpatch with Potrero Hill or other production-adjacent districts",
    ],
    leasingSituations: [
      "industrial/flex searches",
      "production-adjacent office comparisons",
      "users validating loading, power, and operating permissions near central San Francisco",
    ],
    strengths: [
      "operational edge evidence",
      "industrial/flex relevance",
      "Potrero comparison value",
      "non-office district completeness",
    ],
    tradeoffs: [
      "The operational edge may be less visitor-friendly or polished than waterfront redevelopment and needs careful validation for specific industrial or flex uses.",
    ],
    nearbyAlternatives: [
      "American Industrial Center",
      "1700 17th",
      "2400 16th",
      "Potrero Hill production buildings",
    ],
    publicSources: repositorySources("/commercial-real-estate/building/CA/san-francisco/1501-mariposa-st/"),
  }),
];

module.exports = {
  schemaVersion: "commercial-market-evidence-v1",
  collectionId: "sf-dogpatch-commercial-market-evidence",
  collectionType: "district_commercial_market_evidence",
  status: "production_reference",
  district,
  districtNarrative: {
    whyItExists:
      "Dogpatch exists commercially because industrial waterfront infrastructure, maker and production roots, adaptive reuse, Pier 70, Power Station, and Mission Bay adjacency create a district where creative office, industrial/flex, office/R&D, and life-science-adjacent users overlap.",
    strongestWhen: [
      "a company benefits from adaptive industrial character near Mission Bay",
      "creative office, maker, production, or R&D-adjacent work needs a more practical setting than a polished office district",
      "waterfront redevelopment and future growth potential matter to the business story",
      "the tenant wants to compare Mission Bay innovation context with Dogpatch industrial reuse and operational flexibility",
    ],
    weakerWhen: [
      "the company needs the formal client-facing image of the Financial District",
      "validated lab infrastructure or direct institutional campus adjacency is more important than Dogpatch flexibility",
      "a broad technology-office inventory and stronger transit logic are more important than industrial character",
      "the operation depends on heavy industrial utility that must be confirmed building by building",
    ],
  },
  naturalBusinessFit: {
    fits: [
      "creative office users",
      "maker businesses",
      "production-adjacent companies",
      "office/R&D users",
      "life-science support teams",
      "innovation companies",
      "design and product teams",
      "select service-commercial users that benefit from central San Francisco industrial character",
    ],
    lessNaturalFor: [
      "traditional finance, law, or consulting firms seeking formal downtown image",
      "life-science users requiring confirmed lab-ready infrastructure",
      "retailers that depend on broad all-day pedestrian traffic",
      "parking-sensitive customer operations",
      "companies that need conventional Class A office polish more than adaptive character",
      "heavy industrial users whose loading, yard, or utility requirements exceed building-specific capacity",
    ],
  },
  qualityStandard:
    "A strong Dogpatch Commercial Market Evidence collection should balance Pier 70 and Power Station redevelopment with maker, production, neighborhood-scale, and Mission Bay-adjacent evidence so the district is not reduced to either future innovation branding or generic industrial reuse.",
  records,
  deferredCandidates: [
    {
      title: "409 Illinois and 499 Illinois",
      reason:
        "Useful Power Station and waterfront-adjacent comparisons, but 200 23rd, 300 23rd, and Station A already establish the first office/R&D redevelopment layer.",
    },
    {
      title: "Additional Pier 70 buildings",
      reason:
        "Potentially useful for deeper Pier 70 segmentation after the first Dogpatch collection is reviewed and Publisher begins measuring CME quality.",
    },
    {
      title: "1700 17th and 2400 16th",
      reason:
        "Important production and flex comparisons, but they are better suited to Potrero Hill or Mission District edge collections.",
    },
    {
      title: "Mission Bay research buildings",
      reason:
        "These remain comparison evidence for Dogpatch, but the Mission Bay collection should own the core institutional and life-science campus records.",
    },
  ],
};
