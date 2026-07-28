const district = {
  metroId: "san-francisco",
  metroName: "San Francisco",
  cityId: "san-francisco",
  cityName: "San Francisco",
  districtId: "soma",
  districtName: "SoMa",
  districtPath: "/commercial-real-estate/CA/san-francisco/soma/",
  primaryEcosystem: "office",
  secondaryEcosystems: ["retail", "industrial_flex"],
  referenceDocument: "docs/commercial-market-evidence-financial-district.md",
};

const neighboringDistrictRelationships = [
  {
    districtId: "mission-bay",
    districtName: "Mission Bay",
    relationship:
      "Mission Bay is the stronger comparison when newer buildings, life-science adjacency, health anchors, waterfront access, or a more planned innovation-district setting matter more than SoMa's adaptive central-city range.",
  },
  {
    districtId: "financial-district",
    districtName: "Financial District",
    relationship:
      "The Financial District is the stronger comparison when traditional CBD credibility, professional-service density, client-facing formality, and established tower inventory matter more than creative or adaptive office character.",
  },
  {
    districtId: "jackson-square",
    districtName: "Jackson Square",
    relationship:
      "Jackson Square is the stronger comparison when smaller boutique office character, historic north-downtown texture, and executive intimacy matter more than SoMa's broader technology and creative-office range.",
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

const records = [
  evidenceRecord({
    id: "sf-soma-salesforce-tower",
    title: "Salesforce Tower",
    subjectId: "415-mission-st",
    subjectName: "415 Mission St",
    buildingProfileReference: "/commercial-real-estate/building/CA/san-francisco/415-mission-st/",
    buildingProfileStatus: "migrated",
    evidenceType: "technology_headquarters_tower",
    evidenceTypeLabel: "Technology Headquarters Tower",
    evidenceRole: "transbay_district_icon",
    evidenceRoleLabel: "Transbay District Icon",
    confidence: "editorially_supported",
    whyItBelongs:
      "Salesforce Tower defines the post-Transbay era of San Francisco office development and large-scale technology headquarters demand.",
    districtFit:
      "It shows the premium modern tower side of SoMa, where technology identity, transit investment, skyline visibility, and headquarters scale overlap at the downtown edge.",
    typicalCompanies: [
      "technology headquarters",
      "large software companies",
      "enterprise sales organizations",
      "growth-stage corporate teams",
      "client-facing technology firms",
    ],
    typicalUsers: [
      "companies that want a modern San Francisco headquarters signal with more technology identity than the traditional Financial District tower core",
    ],
    leasingSituations: [
      "large headquarters searches",
      "companies comparing Transbay towers with Financial District, Mission Bay, and Peninsula campus options",
    ],
    strengths: [
      "modern headquarters identity",
      "Transbay positioning",
      "technology-market signal",
      "tower scale",
      "strong comparison value",
    ],
    tradeoffs: [
      "May be too costly, formal, or large-scale for teams seeking SoMa's adaptive creative inventory or smaller startup-oriented buildings.",
    ],
    nearbyAlternatives: [
      "181 Fremont",
      "303 Second",
      "425 Market",
      "Mission Bay headquarters environments",
    ],
    publicSources: [
      {
        label: "Rofo Building Profile",
        url: "/commercial-real-estate/building/CA/san-francisco/415-mission-st/",
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
    ],
  }),
  evidenceRecord({
    id: "sf-soma-181-fremont",
    title: "181 Fremont",
    subjectId: "181-fremont-st",
    subjectName: "181 Fremont St",
    buildingProfileReference: "/commercial-real-estate/building/CA/san-francisco/181-fremont-st/",
    buildingProfileStatus: "migrated",
    evidenceType: "premium_transbay_mixed_use_tower",
    evidenceTypeLabel: "Premium Transbay Mixed-Use Tower",
    evidenceRole: "high_end_transbay_comparison_benchmark",
    evidenceRoleLabel: "High-End Transbay Comparison Benchmark",
    confidence: "editorially_supported",
    whyItBelongs:
      "181 Fremont represents the premium Transbay mixed-use model at the high end of modern SoMa office decisions.",
    districtFit:
      "It helps explain that SoMa includes polished tower and mixed-use choices as well as adaptive creative buildings, giving tenants a wider range than a single creative-office stereotype.",
    typicalCompanies: [
      "technology companies",
      "executive offices",
      "investment and advisory teams",
      "premium professional services",
      "corporate users seeking Transbay access",
    ],
    typicalUsers: [
      "teams comparing premium modern SoMa identity with Salesforce Tower, Financial District towers, and newer Mission Bay office environments",
    ],
    leasingSituations: [
      "premium Transbay office searches",
      "companies balancing tower image, transit access, and mixed-use district context",
    ],
    strengths: [
      "premium Transbay positioning",
      "mixed-use identity",
      "modern Class A environment",
      "strong tower comparison value",
    ],
    tradeoffs: [
      "May not provide the adaptive texture, cost profile, or creative-office informality that makes other parts of SoMa valuable.",
    ],
    nearbyAlternatives: [
      "Salesforce Tower",
      "303 Second",
      "680 Folsom",
      "Financial District premium towers",
    ],
    publicSources: [
      {
        label: "Rofo Building Profile",
        url: "/commercial-real-estate/building/CA/san-francisco/181-fremont-st/",
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
    ],
  }),
  evidenceRecord({
    id: "sf-soma-303-second",
    title: "303 Second",
    subjectId: "303-2nd-st",
    subjectName: "303 2nd St",
    buildingProfileReference: "/commercial-real-estate/building/CA/san-francisco/303-2nd-st/",
    buildingProfileStatus: "migrated",
    evidenceType: "large_floorplate_class_a_office",
    evidenceTypeLabel: "Large-Floorplate Class A Office",
    evidenceRole: "soma_south_financial_district_bridge",
    evidenceRoleLabel: "SoMa / South Financial District Bridge",
    confidence: "editorially_supported",
    whyItBelongs:
      "303 Second is a core SoMa and South Financial District comparison building for large-floorplate Class A office space.",
    districtFit:
      "It shows how SoMa can support larger professional and technology users near the downtown edge without becoming identical to the Financial District.",
    typicalCompanies: [
      "technology firms",
      "professional-service teams",
      "corporate offices",
      "large office users",
      "companies seeking Transbay and South Financial District access",
    ],
    typicalUsers: [
      "teams that need larger modern office floors near downtown while still considering whether SoMa or South Beach better describes the search",
    ],
    leasingSituations: [
      "large-floorplate office searches",
      "tenant comparisons across SoMa, South Beach, Transbay, and the Financial District",
    ],
    strengths: [
      "large floorplates",
      "Class A office utility",
      "downtown-edge access",
      "strong boundary-comparison value",
    ],
    tradeoffs: [
      "The boundary position can make the tenant decision feel less purely SoMa and more like a South Financial District or South Beach comparison.",
    ],
    nearbyAlternatives: [
      "Salesforce Tower",
      "181 Fremont",
      "188 Spear",
      "425 Market",
    ],
    publicSources: [
      {
        label: "Rofo Building Profile",
        url: "/commercial-real-estate/building/CA/san-francisco/303-2nd-st/",
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
    ],
  }),
  evidenceRecord({
    id: "sf-soma-680-folsom",
    title: "680 Folsom",
    subjectId: "680-folsom-st",
    subjectName: "680 Folsom St",
    buildingProfileReference: "/commercial-real-estate/building/CA/san-francisco/680-folsom-st/",
    buildingProfileStatus: "migrated",
    evidenceType: "large_scale_adaptive_reuse_office",
    evidenceTypeLabel: "Large-Scale Adaptive-Reuse Office",
    evidenceRole: "central_soma_adaptive_reuse_benchmark",
    evidenceRoleLabel: "Central SoMa Adaptive-Reuse Benchmark",
    confidence: "editorially_supported",
    whyItBelongs:
      "680 Folsom is a strong example of large-scale adaptive reuse turning older SoMa commercial stock into modern technology workspace.",
    districtFit:
      "It captures SoMa's central promise: adaptive commercial texture can support modern teams without requiring either a traditional CBD tower or a Mission Bay campus.",
    typicalCompanies: [
      "technology companies",
      "creative office users",
      "product teams",
      "growth companies",
      "modern professional-service groups",
    ],
    typicalUsers: [
      "teams that want modern workplace quality while preserving some adaptive SoMa character and central-city flexibility",
    ],
    leasingSituations: [
      "adaptive-reuse office searches",
      "companies comparing central SoMa with Transbay towers, West SoMa creative buildings, and Mission Bay",
    ],
    strengths: [
      "adaptive reuse",
      "technology-office relevance",
      "central SoMa access",
      "modernized older-building character",
      "strong comparison value",
    ],
    tradeoffs: [
      "May not offer the same tower image as Transbay buildings or the same campus and research context as Mission Bay.",
    ],
    nearbyAlternatives: [
      "140 New Montgomery",
      "888 Brannan",
      "650 Townsend",
      "795 Folsom",
    ],
    publicSources: [
      {
        label: "Rofo Building Profile",
        url: "/commercial-real-estate/building/CA/san-francisco/680-folsom-st/",
        sourceType: "repository",
      },
      {
        label: "Rofo canonical Commercial Building Intelligence",
        url: "_data/commercialBuildingIntelligence.js",
        sourceType: "repository",
      },
      {
        label: "Rofo Building Page Standard",
        url: "docs/building-page-standard.md",
        sourceType: "repository",
      },
    ],
  }),
  evidenceRecord({
    id: "sf-soma-140-new-montgomery",
    title: "140 New Montgomery",
    subjectId: "140-new-montgomery-st",
    subjectName: "140 New Montgomery St",
    buildingProfileReference: "/commercial-real-estate/building/CA/san-francisco/140-new-montgomery-st/",
    buildingProfileStatus: "migrated",
    evidenceType: "historic_technology_adaptive_reuse",
    evidenceTypeLabel: "Historic Technology Adaptive Reuse",
    evidenceRole: "historic_soma_office_identity_benchmark",
    evidenceRoleLabel: "Historic SoMa Office Identity Benchmark",
    confidence: "editorially_supported",
    whyItBelongs:
      "140 New Montgomery is essential for understanding SoMa's historic office character and technology-era reuse.",
    districtFit:
      "It shows that SoMa's commercial value is not only new towers or warehouses, but the reuse of recognizable older office buildings for modern technology and creative users.",
    typicalCompanies: [
      "technology firms",
      "creative agencies",
      "design-led companies",
      "professional-service teams",
      "brand and product teams",
    ],
    typicalUsers: [
      "companies that want architectural identity and central access without choosing a conventional Financial District tower",
    ],
    leasingSituations: [
      "historic adaptive office searches",
      "companies comparing architectural identity against tower efficiency or warehouse character",
    ],
    strengths: [
      "historic architectural identity",
      "technology-era reuse",
      "central SoMa positioning",
      "strong alternative to conventional towers",
    ],
    tradeoffs: [
      "Users should validate suite configuration, building systems, expansion options, and whether historic character supports the actual work pattern.",
    ],
    nearbyAlternatives: [
      "680 Folsom",
      "144 Second",
      "303 Second",
      "Financial District historic towers",
    ],
    publicSources: [
      {
        label: "Rofo Building Profile",
        url: "/commercial-real-estate/building/CA/san-francisco/140-new-montgomery-st/",
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
    ],
  }),
  evidenceRecord({
    id: "sf-soma-650-townsend",
    title: "650 Townsend",
    subjectId: "650-townsend-st",
    subjectName: "650 Townsend St",
    buildingProfileReference: "/commercial-real-estate/building/CA/san-francisco/650-townsend-st/",
    buildingProfileStatus: "migrated",
    evidenceType: "west_soma_creative_technology_office",
    evidenceTypeLabel: "West SoMa Creative Technology Office",
    evidenceRole: "large_creative_floorplate_benchmark",
    evidenceRoleLabel: "Large Creative Floorplate Benchmark",
    confidence: "editorially_supported",
    whyItBelongs:
      "650 Townsend represents West SoMa creative floorplates and technology demand near Caltrain.",
    districtFit:
      "It explains the southern and western side of SoMa, where larger creative layouts, technology culture, and regional rail access can matter more than tower prestige.",
    typicalCompanies: [
      "technology companies",
      "creative office users",
      "product and engineering teams",
      "media and gaming companies",
      "companies prioritizing Caltrain access",
    ],
    typicalUsers: [
      "teams that need larger creative floors and a practical Townsend corridor workday rather than a formal downtown address",
    ],
    leasingSituations: [
      "West SoMa creative-office searches",
      "companies comparing Caltrain-oriented SoMa with Mission Bay and Design District alternatives",
    ],
    strengths: [
      "large creative floorplates",
      "Caltrain-oriented geography",
      "technology demand signal",
      "West SoMa identity",
    ],
    tradeoffs: [
      "The corridor can feel more utilitarian than Transbay or the Financial District, and exact commute fit depends heavily on employee geography.",
    ],
    nearbyAlternatives: [
      "888 Brannan",
      "600 Townsend",
      "808 Brannan",
      "Design District creative buildings",
    ],
    publicSources: [
      {
        label: "Rofo Building Profile",
        url: "/commercial-real-estate/building/CA/san-francisco/650-townsend-st/",
        sourceType: "repository",
      },
      {
        label: "Rofo canonical Commercial Building Intelligence",
        url: "_data/commercialBuildingIntelligence.js",
        sourceType: "repository",
      },
      {
        label: "Rofo Building Page Standard",
        url: "docs/building-page-standard.md",
        sourceType: "repository",
      },
    ],
  }),
  evidenceRecord({
    id: "sf-soma-888-brannan",
    title: "888 Brannan",
    subjectId: "888-brannan-st",
    subjectName: "888 Brannan St",
    buildingProfileReference: "/commercial-real-estate/building/CA/san-francisco/888-brannan-st/",
    buildingProfileStatus: "migrated",
    evidenceType: "warehouse_to_headquarters_office",
    evidenceTypeLabel: "Warehouse-to-Headquarters Office",
    evidenceRole: "large_adaptive_creative_technology_benchmark",
    evidenceRoleLabel: "Large Adaptive Creative Technology Benchmark",
    confidence: "editorially_supported",
    whyItBelongs:
      "888 Brannan explains SoMa's warehouse-to-headquarters pattern for large creative technology users that need scale without adopting a conventional tower identity.",
    districtFit:
      "It connects SoMa with Design District and Showplace Square, showing how older industrial-scale buildings can become large creative-office environments.",
    typicalCompanies: [
      "technology companies",
      "creative agencies",
      "design and product teams",
      "large startup or scaleup teams",
      "innovation-oriented office users",
    ],
    typicalUsers: [
      "teams that want scale, creative identity, and adaptive building character instead of a tower or life-science campus",
    ],
    leasingSituations: [
      "large creative-office requirements",
      "companies comparing SoMa adaptive reuse with Design District, Showplace Square, and Mission Bay options",
    ],
    strengths: [
      "warehouse-to-headquarters character",
      "large creative-office scale",
      "technology identity",
      "Design District and Showplace Square bridge value",
    ],
    tradeoffs: [
      "May be less polished than newer towers and less specialized than Mission Bay research or healthcare-adjacent environments.",
    ],
    nearbyAlternatives: [
      "650 Townsend",
      "680 Folsom",
      "2 Henry Adams",
      "808 Brannan",
    ],
    publicSources: [
      {
        label: "Rofo Building Profile",
        url: "/commercial-real-estate/building/CA/san-francisco/888-brannan-st/",
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
    ],
  }),
  evidenceRecord({
    id: "sf-soma-795-folsom",
    title: "795 Folsom",
    subjectId: "795-folsom-st",
    subjectName: "795 Folsom St",
    buildingProfileReference: "/commercial-real-estate/building/CA/san-francisco/795-folsom-st/",
    buildingProfileStatus: "migrated",
    evidenceType: "central_soma_mid_rise_office",
    evidenceTypeLabel: "Central SoMa Mid-Rise Office",
    evidenceRole: "mid_rise_creative_office_benchmark",
    evidenceRoleLabel: "Mid-Rise Creative Office Benchmark",
    confidence: "editorially_supported",
    whyItBelongs:
      "795 Folsom is a useful mid-rise reference for central SoMa without jumping directly to trophy towers.",
    districtFit:
      "It gives the collection a practical middle layer between Transbay towers, large adaptive-reuse headquarters, and smaller startup buildings near the downtown boundary.",
    typicalCompanies: [
      "technology teams",
      "creative office users",
      "professional-service groups",
      "product companies",
      "mid-sized growth teams",
    ],
    typicalUsers: [
      "companies that want central SoMa access and creative-office identity at a more practical scale than the largest tower or headquarters examples",
    ],
    leasingSituations: [
      "central SoMa mid-rise searches",
      "teams comparing smaller creative office options with larger adaptive or Class A alternatives",
    ],
    strengths: [
      "mid-rise scale",
      "central SoMa access",
      "creative-office relevance",
      "practical comparison value",
    ],
    tradeoffs: [
      "May not provide the symbolic headquarters signal of Transbay towers or the larger creative floorplates of West SoMa buildings.",
    ],
    nearbyAlternatives: [
      "144 Second",
      "140 New Montgomery",
      "680 Folsom",
      "303 Second",
    ],
    publicSources: [
      {
        label: "Rofo Building Profile",
        url: "/commercial-real-estate/building/CA/san-francisco/795-folsom-st/",
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
    ],
  }),
  evidenceRecord({
    id: "sf-soma-144-second",
    title: "144 Second",
    subjectId: "144-2nd-st",
    subjectName: "144 2nd St",
    buildingProfileReference: "/commercial-real-estate/building/CA/san-francisco/144-2nd-st/",
    buildingProfileStatus: "migrated",
    evidenceType: "startup_creative_mid_rise_office",
    evidenceTypeLabel: "Startup Creative Mid-Rise Office",
    evidenceRole: "smaller_technology_team_benchmark",
    evidenceRoleLabel: "Smaller Technology Team Benchmark",
    confidence: "editorially_supported",
    whyItBelongs:
      "144 Second is a practical representative building for smaller and mid-sized technology, professional-service, and creative teams near the downtown boundary.",
    districtFit:
      "It shows that SoMa is not only headquarters scale; the district also works for smaller teams that need central access, creative identity, and a less formal office path.",
    typicalCompanies: [
      "startups",
      "small technology teams",
      "creative agencies",
      "boutique professional services",
      "product and design firms",
    ],
    typicalUsers: [
      "smaller teams comparing whether SoMa's central access and creative-office identity fit better than Jackson Square or Financial District alternatives",
    ],
    leasingSituations: [
      "startup and mid-sized office searches",
      "teams comparing smaller SoMa options against boutique downtown and central Financial District buildings",
    ],
    strengths: [
      "startup relevance",
      "smaller team fit",
      "central access",
      "creative-office signal",
    ],
    tradeoffs: [
      "May not provide enough image, amenities, or expansion capacity for larger companies and may still require block-by-block context validation.",
    ],
    nearbyAlternatives: [
      "156 2nd",
      "140 New Montgomery",
      "795 Folsom",
      "Jackson Square boutique offices",
    ],
    publicSources: [
      {
        label: "Rofo Building Profile",
        url: "/commercial-real-estate/building/CA/san-francisco/144-2nd-st/",
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
    ],
  }),
  evidenceRecord({
    id: "sf-soma-600-townsend",
    title: "600 Townsend",
    subjectId: "600-townsend-st",
    subjectName: "600 Townsend St",
    buildingProfileReference: "/commercial-real-estate/building/CA/san-francisco/600-townsend-st/",
    buildingProfileStatus: "migrated",
    evidenceType: "townsend_corridor_creative_office",
    evidenceTypeLabel: "Townsend Corridor Creative Office",
    evidenceRole: "caltrain_oriented_workspace_benchmark",
    evidenceRoleLabel: "Caltrain-Oriented Workspace Benchmark",
    confidence: "editorially_supported",
    whyItBelongs:
      "600 Townsend helps explain the Townsend corridor and the way SoMa supports teams prioritizing Caltrain, creative space, and practical layouts.",
    districtFit:
      "It anchors the southern SoMa workday where regional rail access, creative-office character, and utilitarian corridor context shape tenant fit more than formal address prestige.",
    typicalCompanies: [
      "technology teams",
      "creative office users",
      "product and design groups",
      "Caltrain-oriented companies",
      "mid-sized growth teams",
    ],
    typicalUsers: [
      "teams that prioritize employee commute patterns, practical creative workspace, and southern SoMa access over tower image",
    ],
    leasingSituations: [
      "Townsend corridor office searches",
      "companies comparing West SoMa, Showplace Square, Mission Bay, and central SoMa alternatives",
    ],
    strengths: [
      "Caltrain-oriented access",
      "creative workspace",
      "Townsend corridor identity",
      "practical team-space value",
    ],
    tradeoffs: [
      "The experience can feel more corridor-oriented and less polished than Transbay, the Financial District, or newer Mission Bay buildings.",
      "Transit fit depends heavily on whether Caltrain and southern SoMa access matter to employees.",
    ],
    nearbyAlternatives: [
      "650 Townsend",
      "888 Brannan",
      "680 Folsom",
      "460 Townsend",
    ],
    publicSources: [
      {
        label: "Rofo Building Profile",
        url: "/commercial-real-estate/building/CA/san-francisco/600-townsend-st/",
        sourceType: "repository",
      },
      {
        label: "Rofo canonical Commercial Building Intelligence",
        url: "_data/commercialBuildingIntelligence.js",
        sourceType: "repository",
      },
      {
        label: "Rofo Building Page Standard",
        url: "docs/building-page-standard.md",
        sourceType: "repository",
      },
    ],
  }),
];

module.exports = {
  schemaVersion: "commercial-market-evidence-v1",
  collectionId: "sf-soma-commercial-market-evidence",
  collectionType: "district_commercial_market_evidence",
  status: "production_reference",
  district,
  districtNarrative: {
    whyItExists:
      "SoMa exists as San Francisco's flexible central-city technology and creative-office district, where Transbay towers, adaptive reuse, startup buildings, warehouse-to-headquarters conversions, and Caltrain-oriented corridors sit between the Financial District, Mission Bay, South Beach, and the Design District.",
    strongestWhen: [
      "a company wants central San Francisco access with more creative and adaptive office character than a traditional CBD tower core",
      "technology, product, design, or creative teams need a location that can range from startup scale to headquarters scale",
      "Caltrain, Transbay, or southern SoMa access matters to the employee base",
      "the tenant wants to compare polished Class A options with adaptive reuse and larger creative floorplates inside one district",
    ],
    weakerWhen: [
      "the company needs a formal Financial District client-facing address",
      "the requirement depends on life-science, research, medical, or campus specialization better served by Mission Bay",
      "parking, loading, or production operations are central enough to require Dogpatch, Potrero, or industrial alternatives",
      "the team wants a quieter boutique executive setting like Jackson Square rather than block-by-block SoMa variation",
    ],
  },
  naturalBusinessFit: {
    fits: [
      "software companies",
      "AI and product teams",
      "creative agencies",
      "design and showroom users",
      "growth companies",
      "startup teams",
      "technology headquarters",
      "selective food, beverage, fitness, wellness, and daily-needs retail tied to office, residential, and destination uses",
    ],
    lessNaturalFor: [
      "traditional finance, law, or consulting firms that need a formal Financial District identity",
      "life-science users requiring validated lab infrastructure or UCSF adjacency",
      "parking-sensitive customer operations",
      "warehouse, yard, or loading-heavy users",
      "small executive teams that want historic boutique character more than central creative-office variety",
      "retailers that need consistent high-street foot traffic rather than node-specific demand",
    ],
  },
  qualityStandard:
    "A strong SoMa Commercial Market Evidence collection must show the district's range without collapsing it into one stereotype. It should explain Transbay towers, central adaptive reuse, West SoMa creative floorplates, startup-scale buildings, and Townsend corridor commute logic while preserving clear tradeoffs against the Financial District, Mission Bay, Jackson Square, South Beach, and Design District alternatives.",
  records,
  deferredCandidates: [
    {
      title: "414 Brannan",
      reason:
        "Useful lower-scale brick-and-timber evidence, but 144 Second, 795 Folsom, and 600 Townsend already establish smaller and mid-sized creative-office roles in this bounded collection.",
    },
    {
      title: "909 Harrison",
      reason:
        "Good value-oriented startup evidence, but it should be added later if Publisher needs deeper low-cost or early-stage SoMa segmentation.",
    },
    {
      title: "410 Townsend and 460 Townsend",
      reason:
        "Relevant Townsend corridor alternatives, but 600 Townsend carries the initial Caltrain-oriented corridor role for this collection.",
    },
    {
      title: "808 Brannan and Design District overlap buildings",
      reason:
        "Important for Design District and Showplace Square comparisons, but they should be handled in those district collections unless SoMa needs deeper AI or robotics evidence.",
    },
    {
      title: "South Beach and South Financial District edge records",
      reason:
        "Buildings such as 188 Spear, Rincon Center, and One Market should remain in their own edge collections to avoid blurring SoMa with adjacent districts.",
    },
  ],
};
