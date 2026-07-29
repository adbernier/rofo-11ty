const district = {
  metroId: "san-francisco",
  metroName: "San Francisco",
  cityId: "san-francisco",
  cityName: "San Francisco",
  districtId: "south-beach",
  districtName: "South Beach",
  districtPath: "/commercial-real-estate/CA/san-francisco/south-beach/",
  primaryEcosystem: "office",
  secondaryEcosystems: ["retail"],
  referenceDocument: "docs/commercial-market-evidence-financial-district.md",
};

const neighboringDistrictRelationships = [
  {
    districtId: "financial-district",
    districtName: "Financial District",
    relationship:
      "The Financial District is the stronger comparison when traditional CBD identity, executive address signal, dense professional-service adjacency, or formal client-facing office image matters more than waterfront or mixed-use context.",
  },
  {
    districtId: "soma",
    districtName: "SoMa",
    relationship:
      "SoMa is the stronger comparison when creative adaptive office, inland technology inventory, startup flexibility, or broader central-city growth-company identity matters more than the Spear, Rincon, and ballpark edge.",
  },
  {
    districtId: "mission-bay",
    districtName: "Mission Bay",
    relationship:
      "Mission Bay is the stronger comparison when newer innovation-campus context, life-science adjacency, UCSF gravity, or planned waterfront development matters more than South Beach's downtown-waterfront bridge.",
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
    id: "sf-south-beach-188-spear",
    title: "188 Spear",
    subjectId: "188-spear-st",
    subjectName: "188 Spear St",
    buildingProfileReference: "/commercial-real-estate/building/CA/san-francisco/188-spear-st/",
    buildingProfileStatus: "source_ready",
    evidenceType: "south_financial_district_modernized_office",
    evidenceTypeLabel: "South Financial District Modernized Office",
    evidenceRole: "spear_street_office_benchmark",
    evidenceRoleLabel: "Spear Street Office Benchmark",
    confidence: "editorially_supported",
    whyItBelongs:
      "188 Spear is a strong representative building for the Spear Street corridor and the South Beach/South Financial District office environment.",
    districtFit:
      "It explains the district's bridge position between traditional downtown office demand, Embarcadero access, and a more mixed-use South Beach workday.",
    typicalCompanies: [
      "professional-service firms",
      "technology teams",
      "client-facing office users",
      "regional office tenants",
    ],
    typicalUsers: [
      "teams that want Financial District access and transit convenience without defaulting to a trophy tower or northern CBD identity",
    ],
    leasingSituations: [
      "Spear Street corridor searches",
      "South Financial District versus South Beach comparisons",
      "tenants balancing client access with waterfront-adjacent mixed-use context",
    ],
    strengths: [
      "Spear Street office identity",
      "downtown and Embarcadero access",
      "modernized mid-rise office signal",
      "useful comparison against 88 Spear and 201 Spear",
    ],
    tradeoffs: [
      "The boundary position can make the tenant decision less clearly South Beach and more like a South Financial District or Transbay comparison.",
    ],
    nearbyAlternatives: [
      "88 Spear",
      "201 Spear",
      "303 Second",
      "Financial District office towers",
    ],
    publicSources: repositorySources("/commercial-real-estate/building/CA/san-francisco/188-spear-st/"),
  }),
  evidenceRecord({
    id: "sf-south-beach-88-spear",
    title: "The Spear",
    subjectId: "88-spear-st",
    subjectName: "88 Spear St",
    buildingProfileReference: "/commercial-real-estate/building/CA/san-francisco/88-spear-st/",
    buildingProfileStatus: "source_ready",
    evidenceType: "repositioned_waterfront_adjacent_office",
    evidenceTypeLabel: "Repositioned Waterfront-Adjacent Office",
    evidenceRole: "hospitality_style_repositioning_benchmark",
    evidenceRoleLabel: "Hospitality-Style Repositioning Benchmark",
    confidence: "editorially_supported",
    whyItBelongs:
      "The Spear shows hospitality-style repositioning in the South Beach and South Financial District market.",
    districtFit:
      "It demonstrates that South Beach office decisions can be shaped by amenity, repositioning, and experience as much as by conventional downtown address logic.",
    typicalCompanies: [
      "professional-service teams",
      "creative business-service firms",
      "technology office users",
      "companies prioritizing amenity-rich repositioned space",
    ],
    typicalUsers: [
      "tenants that want a polished office experience near downtown and the waterfront without choosing the most formal CBD tower setting",
    ],
    leasingSituations: [
      "amenity-driven office searches",
      "repositioned building comparisons",
      "tenants comparing South Beach with Transbay, Financial District, and SoMa alternatives",
    ],
    strengths: [
      "amenity and repositioning signal",
      "waterfront-adjacent context",
      "South Financial District comparison value",
      "strong contrast against older mixed-use anchors",
    ],
    tradeoffs: [
      "Amenity-led repositioning may matter less for tenants whose decision is driven primarily by traditional CBD image, lowest cost, or specialized technical space.",
    ],
    nearbyAlternatives: [
      "188 Spear",
      "201 Spear",
      "Rincon Center",
      "Transbay office buildings",
    ],
    publicSources: repositorySources("/commercial-real-estate/building/CA/san-francisco/88-spear-st/"),
  }),
  evidenceRecord({
    id: "sf-south-beach-201-spear",
    title: "201 Spear",
    subjectId: "201-spear-st",
    subjectName: "201 Spear St",
    buildingProfileReference: "/commercial-real-estate/building/CA/san-francisco/201-spear-st/",
    buildingProfileStatus: "source_ready",
    evidenceType: "transit_oriented_professional_services_mid_rise",
    evidenceTypeLabel: "Transit-Oriented Professional Services Mid-Rise",
    evidenceRole: "embarcadero_access_professional_services_benchmark",
    evidenceRoleLabel: "Embarcadero Access Professional Services Benchmark",
    confidence: "editorially_supported",
    whyItBelongs:
      "201 Spear is a durable comparison building for access to the Embarcadero, downtown, and South Beach without a trophy tower.",
    districtFit:
      "It shows the practical professional-service layer of South Beach: close enough to downtown for client access while distinct from formal Financial District towers.",
    typicalCompanies: [
      "professional-service firms",
      "consulting teams",
      "regional offices",
      "established technology or business-service companies",
    ],
    typicalUsers: [
      "teams that value practical downtown and waterfront access more than skyline identity or creative warehouse character",
    ],
    leasingSituations: [
      "professional-service office comparisons",
      "Embarcadero and Spear Street searches",
      "tenants weighing mid-rise utility against trophy tower cost or image",
    ],
    strengths: [
      "professional-service fit",
      "Embarcadero access",
      "mid-rise office utility",
      "clear alternative to trophy towers",
    ],
    tradeoffs: [
      "It may not provide the same flagship image as Financial District towers or the same creative-office identity as SoMa adaptive reuse.",
    ],
    nearbyAlternatives: [
      "188 Spear",
      "88 Spear",
      "345 Spear",
      "Financial District mid-rise offices",
    ],
    publicSources: repositorySources("/commercial-real-estate/building/CA/san-francisco/201-spear-st/"),
  }),
  evidenceRecord({
    id: "sf-south-beach-303-second",
    title: "303 Second",
    subjectId: "303-2nd-st",
    subjectName: "303 2nd St",
    buildingProfileReference: "/commercial-real-estate/building/CA/san-francisco/303-2nd-st/",
    buildingProfileStatus: "source_ready",
    evidenceType: "modern_class_a_transbay_edge_office",
    evidenceTypeLabel: "Modern Class A Transbay-Edge Office",
    evidenceRole: "soma_financial_district_comparison_anchor",
    evidenceRoleLabel: "SoMa / Financial District Comparison Anchor",
    confidence: "editorially_supported",
    whyItBelongs:
      "303 Second is an important South Beach and Transbay-edge building that supports comparison with SoMa and the Financial District.",
    districtFit:
      "It represents the district's more modern Class A office edge, where large floorplates and transit orientation blur the line between South Beach, SoMa, and Transbay.",
    typicalCompanies: [
      "technology companies",
      "large office users",
      "client-facing business teams",
      "regional headquarters users",
    ],
    typicalUsers: [
      "companies that want larger modern office options near downtown while still comparing whether South Beach or SoMa better describes the search",
    ],
    leasingSituations: [
      "large-floorplate Class A searches",
      "South Beach, SoMa, and Transbay boundary comparisons",
      "tenants comparing modern office utility against traditional Financial District identity",
    ],
    strengths: [
      "modern Class A office signal",
      "large-floorplate comparison value",
      "transit-oriented location",
      "useful boundary evidence",
    ],
    tradeoffs: [
      "The boundary position can reduce neighborhood specificity and may feel more like a SoMa or Transbay office choice than a pure South Beach decision.",
    ],
    nearbyAlternatives: [
      "188 Spear",
      "415 Mission",
      "181 Fremont",
      "SoMa Class A office buildings",
    ],
    publicSources: repositorySources("/commercial-real-estate/building/CA/san-francisco/303-2nd-st/"),
  }),
  evidenceRecord({
    id: "sf-south-beach-rincon-center",
    title: "Rincon Center",
    subjectId: "121-spear-st",
    subjectName: "121 Spear St",
    buildingProfileReference: "/commercial-real-estate/building/CA/san-francisco/121-spear-st/",
    buildingProfileStatus: "source_ready",
    evidenceType: "historic_mixed_use_neighborhood_anchor",
    evidenceTypeLabel: "Historic Mixed-Use Neighborhood Anchor",
    evidenceRole: "rincon_mixed_use_identity_anchor",
    evidenceRoleLabel: "Rincon Mixed-Use Identity Anchor",
    confidence: "editorially_supported",
    whyItBelongs:
      "Rincon Center is essential for explaining the older mixed office, retail, and residential character of the Rincon and South Beach edge.",
    districtFit:
      "It keeps South Beach from being reduced to office inventory by showing the mixed-use neighborhood fabric that supports daytime, residential, and visitor demand.",
    typicalCompanies: [
      "office users serving downtown and waterfront customers",
      "service retail operators",
      "food and beverage users",
      "mixed-use neighborhood businesses",
    ],
    typicalUsers: [
      "businesses that benefit from office, residential, retail, and visitor activity around a historic mixed-use South Beach anchor",
    ],
    leasingSituations: [
      "mixed-use anchor comparisons",
      "service retail and food demand evaluations",
      "tenants deciding whether South Beach's neighborhood pattern is useful",
    ],
    strengths: [
      "mixed-use character",
      "historic conversion signal",
      "Rincon edge identity",
      "office, retail, and residential context",
    ],
    tradeoffs: [
      "Mixed-use value depends on daypart and tenant type, so office, retail, event, and residential patterns must be evaluated separately.",
    ],
    nearbyAlternatives: [
      "88 Spear",
      "345 Spear",
      "425 1st",
      "South Beach mixed-use anchors",
    ],
    publicSources: repositorySources("/commercial-real-estate/building/CA/san-francisco/121-spear-st/"),
  }),
  evidenceRecord({
    id: "sf-south-beach-hills-plaza",
    title: "Hills Plaza",
    subjectId: "345-spear-st",
    subjectName: "345 Spear St",
    buildingProfileReference: "/commercial-real-estate/building/CA/san-francisco/345-spear-st/",
    buildingProfileStatus: "source_ready",
    evidenceType: "historic_waterfront_adaptive_reuse_office",
    evidenceTypeLabel: "Historic Waterfront Adaptive-Reuse Office",
    evidenceRole: "waterfront_historic_office_benchmark",
    evidenceRoleLabel: "Waterfront Historic Office Benchmark",
    confidence: "editorially_supported",
    whyItBelongs:
      "Hills Plaza is a strong example of waterfront-adjacent office in a historic warehouse setting.",
    districtFit:
      "It explains South Beach's ability to offer historic character and waterfront proximity without shifting fully into Mission Bay or SoMa creative-office logic.",
    typicalCompanies: [
      "technology teams",
      "creative office users",
      "business-service firms",
      "companies prioritizing waterfront-adjacent character",
    ],
    typicalUsers: [
      "tenants that want historic adaptive-reuse character with South Beach waterfront access and downtown proximity",
    ],
    leasingSituations: [
      "historic waterfront office comparisons",
      "adaptive-reuse searches",
      "tenants comparing South Beach with Mission Bay and SoMa alternatives",
    ],
    strengths: [
      "historic warehouse character",
      "waterfront adjacency",
      "technology and creative-office relevance",
      "strong contrast against Spear Street offices",
    ],
    tradeoffs: [
      "Historic waterfront character may not satisfy users needing conventional Class A office polish, heavy transit concentration, or specialized innovation-campus infrastructure.",
    ],
    nearbyAlternatives: [
      "Rincon Center",
      "201 Spear",
      "185 Berry",
      "Mission Bay waterfront offices",
    ],
    publicSources: repositorySources("/commercial-real-estate/building/CA/san-francisco/345-spear-st/"),
  }),
  evidenceRecord({
    id: "sf-south-beach-301-brannan",
    title: "301 Brannan",
    subjectId: "301-brannan-st",
    subjectName: "301 Brannan St",
    buildingProfileReference: "/commercial-real-estate/building/CA/san-francisco/301-brannan-st/",
    buildingProfileStatus: "source_ready",
    evidenceType: "mixed_use_historic_neighborhood_anchor",
    evidenceTypeLabel: "Mixed-Use Historic Neighborhood Anchor",
    evidenceRole: "brannan_mixed_use_fabric_benchmark",
    evidenceRoleLabel: "Brannan Mixed-Use Fabric Benchmark",
    confidence: "editorially_supported",
    whyItBelongs:
      "301 Brannan explains South Beach's blend of housing, commercial space, and historic industrial character.",
    districtFit:
      "It shows the district's inland mixed-use fabric, where residential, commercial, and older industrial patterns shape tenant fit differently than pure downtown office blocks.",
    typicalCompanies: [
      "neighborhood-serving businesses",
      "creative office users",
      "service retail operators",
      "small professional-service firms",
    ],
    typicalUsers: [
      "businesses that need a mixed-use South Beach setting with housing, commercial activity, and historic industrial context nearby",
    ],
    leasingSituations: [
      "mixed-use neighborhood comparisons",
      "Brannan corridor evaluations",
      "tenants deciding between South Beach, SoMa, and Mission Bay edge locations",
    ],
    strengths: [
      "mixed-use fabric",
      "historic industrial character",
      "neighborhood-anchor value",
      "useful contrast against Spear Street offices",
    ],
    tradeoffs: [
      "The mixed-use pattern may be less useful for tenants needing formal office identity, heavy foot traffic, or specialized technical infrastructure.",
    ],
    nearbyAlternatives: [
      "345 Spear",
      "185 Berry",
      "303 Second",
      "SoMa Brannan corridor buildings",
    ],
    publicSources: repositorySources("/commercial-real-estate/building/CA/san-francisco/301-brannan-st/"),
  }),
  evidenceRecord({
    id: "sf-south-beach-185-berry",
    title: "China Basin / 185 Berry",
    subjectId: "185-berry-st",
    subjectName: "185 Berry St",
    buildingProfileReference: "/commercial-real-estate/building/CA/san-francisco/185-berry-st/",
    buildingProfileStatus: "source_ready",
    evidenceType: "waterfront_technology_ballpark_campus",
    evidenceTypeLabel: "Waterfront Technology Ballpark Campus",
    evidenceRole: "mission_bay_ballpark_transition_benchmark",
    evidenceRoleLabel: "Mission Bay / Ballpark Transition Benchmark",
    confidence: "editorially_supported",
    whyItBelongs:
      "China Basin / 185 Berry is important for understanding the ballpark, South Beach, and Mission Bay transition near Caltrain.",
    districtFit:
      "It explains the southern edge of South Beach where waterfront, technology, campus-style office, ballpark activity, and Mission Bay comparisons begin to overlap.",
    typicalCompanies: [
      "technology companies",
      "campus-style office users",
      "media and product teams",
      "waterfront-adjacent office tenants",
    ],
    typicalUsers: [
      "teams comparing South Beach and Mission Bay because waterfront access, Caltrain proximity, and ballpark district identity matter",
    ],
    leasingSituations: [
      "ballpark district office comparisons",
      "South Beach versus Mission Bay searches",
      "tenants evaluating waterfront-adjacent technology office options near Caltrain",
    ],
    strengths: [
      "waterfront and ballpark district identity",
      "technology office relevance",
      "campus-style comparison value",
      "Mission Bay transition context",
    ],
    tradeoffs: [
      "Ballpark and waterfront activity may be a benefit or a complication depending on visitor patterns, employee commute, event schedules, and parking needs.",
    ],
    nearbyAlternatives: [
      "345 Spear",
      "500 Terry Francois",
      "301 Brannan",
      "Mission Bay waterfront buildings",
    ],
    publicSources: repositorySources("/commercial-real-estate/building/CA/san-francisco/185-berry-st/"),
  }),
  evidenceRecord({
    id: "sf-south-beach-one-embarcadero-south",
    title: "One Embarcadero South",
    subjectId: "425-1st-st",
    subjectName: "425 1st St",
    buildingProfileReference: "/commercial-real-estate/building/CA/san-francisco/425-1st-st/",
    buildingProfileStatus: "source_ready",
    evidenceType: "residential_commercial_mixed_use_anchor",
    evidenceTypeLabel: "Residential / Commercial Mixed-Use Anchor",
    evidenceRole: "south_beach_neighborhood_balance_benchmark",
    evidenceRoleLabel: "South Beach Neighborhood Balance Benchmark",
    confidence: "editorially_supported",
    whyItBelongs:
      "One Embarcadero South helps explain South Beach as a mixed-use neighborhood rather than a pure office district.",
    districtFit:
      "It gives the collection a residential-commercial anchor that helps users understand why customer access, neighborhood services, and daily activity patterns matter here.",
    typicalCompanies: [
      "service retail users",
      "fitness and wellness operators",
      "neighborhood-serving businesses",
      "office users valuing mixed-use surroundings",
    ],
    typicalUsers: [
      "businesses that benefit from South Beach's combination of office workers, residents, waterfront access, and neighborhood services",
    ],
    leasingSituations: [
      "mixed-use neighborhood evaluations",
      "service retail and customer-access comparisons",
      "tenants determining whether South Beach's residential-commercial pattern supports demand",
    ],
    strengths: [
      "residential and commercial mix",
      "neighborhood-anchor role",
      "customer-access context",
      "balance against office-heavy evidence",
    ],
    tradeoffs: [
      "Mixed-use neighborhood demand can vary by daypart, event activity, residential patterns, and whether the tenant needs office workers or local residents most.",
    ],
    nearbyAlternatives: [
      "Rincon Center",
      "188 Spear",
      "303 Second",
      "South Beach service-retail nodes",
    ],
    publicSources: repositorySources("/commercial-real-estate/building/CA/san-francisco/425-1st-st/"),
  }),
];

module.exports = {
  schemaVersion: "commercial-market-evidence-v1",
  collectionId: "sf-south-beach-commercial-market-evidence",
  collectionType: "district_commercial_market_evidence",
  status: "production_reference",
  district,
  districtNarrative: {
    whyItExists:
      "South Beach exists commercially because Spear Street offices, Rincon mixed-use anchors, Embarcadero access, ballpark adjacency, waterfront buildings, residential density, and Transbay/SoMa/Mission Bay boundary conditions create a downtown-waterfront market that is neither pure Financial District nor pure SoMa.",
    strongestWhen: [
      "a company wants Financial District access with a more mixed-use and waterfront-adjacent setting",
      "professional-service, technology, or business-service users compare Spear Street, Transbay, SoMa, and South Beach options",
      "retail or service users benefit from office, residential, visitor, and event-driven demand patterns",
      "waterfront, ballpark, Caltrain, and Mission Bay adjacency are useful but a specialized Mission Bay identity is not required",
    ],
    weakerWhen: [
      "a traditional CBD address and executive office image matter more than mixed-use context",
      "the company needs creative warehouse character or deeper inland SoMa technology identity",
      "validated life-science or institutional innovation-campus infrastructure is required",
      "parking-heavy customer operations or broad high-street retail demand are central to the search",
    ],
  },
  naturalBusinessFit: {
    fits: [
      "professional-service firms",
      "technology office users",
      "business-service teams",
      "waterfront-adjacent office tenants",
      "mixed-use retail users",
      "restaurants and service retail",
      "fitness and wellness operators",
      "companies comparing downtown access with neighborhood experience",
    ],
    lessNaturalFor: [
      "heavy industrial users",
      "pure laboratory users requiring confirmed technical infrastructure",
      "traditional firms that need the clearest Financial District address signal",
      "creative teams that prioritize warehouse character over waterfront or downtown access",
      "parking-sensitive customer operations",
      "retailers dependent on broad all-day shopping foot traffic",
    ],
  },
  qualityStandard:
    "A strong South Beach Commercial Market Evidence collection should explain Spear Street office utility, Rincon mixed-use identity, waterfront and ballpark adjacency, Transbay/SoMa boundary conditions, and Mission Bay transition context without collapsing the district into the Financial District, SoMa, or Mission Bay.",
  records,
  deferredCandidates: [
    {
      title: "Additional Transbay tower comparisons",
      reason:
        "Important for office users, but Transbay and Financial District records should remain separate unless South Beach needs deeper South Financial District boundary evidence.",
    },
    {
      title: "Ballpark and waterfront public-realm evidence",
      reason:
        "Potentially useful once Commercial Market Evidence supports non-building corridor, event, and public-realm evidence more explicitly.",
    },
    {
      title: "Mission Bay waterfront office alternatives",
      reason:
        "Useful comparison evidence, but Mission Bay owns the specialized innovation and life-science waterfront collection.",
    },
    {
      title: "Restaurant and neighborhood retail tenant mix",
      reason:
        "Relevant to Experience Readiness and future retail evidence, but this v1 collection stays anchored in canonical building and representative-environment records.",
    },
  ],
};
