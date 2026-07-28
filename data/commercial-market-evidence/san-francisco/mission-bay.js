const district = {
  metroId: "san-francisco",
  metroName: "San Francisco",
  cityId: "san-francisco",
  cityName: "San Francisco",
  districtId: "mission-bay",
  districtName: "Mission Bay",
  districtPath: "/commercial-real-estate/CA/san-francisco/mission-bay/",
  primaryEcosystem: "life_science",
  secondaryEcosystems: ["office", "medical", "retail"],
  referenceDocument: "docs/commercial-market-evidence-financial-district.md",
};

const neighboringDistrictRelationships = [
  {
    districtId: "soma",
    districtName: "SoMa",
    relationship:
      "SoMa is the stronger comparison when a company needs more varied creative-office inventory, older adaptive-reuse buildings, central technology identity, or broader central-city building types.",
  },
  {
    districtId: "financial-district",
    districtName: "Financial District",
    relationship:
      "The Financial District is the stronger comparison when client-facing formality, traditional professional-service density, BART-oriented access, and established CBD address value matter more than innovation-district context.",
  },
  {
    districtId: "north-bayshore",
    districtName: "North Bayshore",
    relationship:
      "North Bayshore is the stronger comparison when a technology or research-oriented company wants a larger Peninsula campus model rather than San Francisco's urban innovation district.",
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
    id: "sf-mission-bay-uber-mission-bay",
    title: "Uber Mission Bay",
    subjectId: "1455-3rd-st",
    subjectName: "1455 3rd St",
    buildingProfileReference: "/commercial-real-estate/building/CA/san-francisco/1455-3rd-st/",
    buildingProfileStatus: "migrated",
    evidenceType: "technology_headquarters_campus",
    evidenceTypeLabel: "Technology Headquarters Campus",
    evidenceRole: "modern_headquarters_identity_benchmark",
    evidenceRoleLabel: "Modern Headquarters Identity Benchmark",
    confidence: "editorially_supported",
    whyItBelongs:
      "Uber Mission Bay defines the district's modern headquarters identity and shows why Mission Bay is not simply an overflow office market from downtown.",
    districtFit:
      "It represents the planned, campus-like office environment that attracts technology and growth companies seeking newer buildings, visibility, and innovation-district context.",
    typicalCompanies: [
      "technology companies",
      "growth-stage headquarters",
      "AI and software teams",
      "healthcare technology companies",
      "innovation-oriented corporate teams",
    ],
    typicalUsers: [
      "large or growing teams that want a modern San Francisco headquarters environment tied to Mission Bay's health, research, waterfront, and transit context",
    ],
    leasingSituations: [
      "headquarters searches comparing Mission Bay with SoMa, Transbay, and Peninsula campus options",
      "large modern office requirements where district identity and recruiting signal matter",
    ],
    strengths: [
      "modern headquarters identity",
      "campus-like workplace signal",
      "technology and innovation context",
      "clear contrast with traditional downtown towers",
    ],
    tradeoffs: [
      "May be less useful for smaller teams, traditional client-facing firms, or companies whose employees need the broadest BART-oriented downtown access.",
    ],
    nearbyAlternatives: [
      "The Exchange",
      "500 Terry Francois",
      "Salesforce Tower",
      "North Bayshore campus environments",
    ],
    publicSources: [
      {
        label: "Rofo Building Profile",
        url: "/commercial-real-estate/building/CA/san-francisco/1455-3rd-st/",
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
    id: "sf-mission-bay-alexandria-center-1700-owens",
    title: "Alexandria Center at Mission Bay - 1700 Owens",
    subjectId: "1700-owens-st",
    subjectName: "1700 Owens St",
    buildingProfileReference: "/commercial-real-estate/building/CA/san-francisco/1700-owens-st/",
    buildingProfileStatus: "migrated",
    evidenceType: "life_science_research_campus",
    evidenceTypeLabel: "Life Science Research Campus",
    evidenceRole: "private_life_science_cluster_benchmark",
    evidenceRoleLabel: "Private Life Science Cluster Benchmark",
    confidence: "editorially_supported",
    whyItBelongs:
      "Alexandria Center at Mission Bay - 1700 Owens is a core life-science reference for the private lab and R&D cluster that grew around UCSF.",
    districtFit:
      "It shows Mission Bay's specialized commercial value: companies choose the district when research adjacency, technical-space validation, and innovation ecosystem matter more than generic office flexibility.",
    typicalCompanies: [
      "life-science companies",
      "biotech firms",
      "research companies",
      "healthcare-adjacent technology users",
      "research support teams",
    ],
    typicalUsers: [
      "organizations that benefit from Mission Bay's UCSF adjacency and need to evaluate laboratory, R&D, or technical office requirements carefully",
    ],
    leasingSituations: [
      "life-science and research-oriented searches",
      "companies comparing Mission Bay specialization with broader SoMa or Peninsula innovation alternatives",
    ],
    strengths: [
      "life-science ecosystem signal",
      "research adjacency",
      "campus environment",
      "technical-use validation value",
      "strong district-defining role",
    ],
    tradeoffs: [
      "Lab, ventilation, power, hazardous-material, and technical-use suitability must be validated building by building and suite by suite.",
      "Mission Bay specialization may be less useful for general office users that do not benefit from research adjacency.",
    ],
    nearbyAlternatives: [
      "1500 Owens",
      "455 Mission Bay Boulevard South",
      "550 Terry Francois",
      "North Bayshore research campuses",
    ],
    publicSources: [
      {
        label: "Rofo Building Profile",
        url: "/commercial-real-estate/building/CA/san-francisco/1700-owens-st/",
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
    id: "sf-mission-bay-alexandria-center-1500-owens",
    title: "Alexandria Center at Mission Bay - 1500 Owens",
    subjectId: "1500-owens-st",
    subjectName: "1500 Owens St",
    buildingProfileReference: "/commercial-real-estate/building/CA/san-francisco/1500-owens-st/",
    buildingProfileStatus: "migrated",
    evidenceType: "biotech_research_environment",
    evidenceTypeLabel: "Biotech Research Environment",
    evidenceRole: "life_science_ecosystem_depth_benchmark",
    evidenceRoleLabel: "Life Science Ecosystem Depth Benchmark",
    confidence: "editorially_supported",
    whyItBelongs:
      "Alexandria Center at Mission Bay - 1500 Owens complements 1700 Owens by showing Mission Bay as a life-science ecosystem rather than a one-building story.",
    districtFit:
      "It adds depth to the private research cluster and helps explain why multiple nearby buildings matter when a tenant needs biotech context, research neighbors, and specialized validation.",
    typicalCompanies: [
      "biotech companies",
      "research startups",
      "life-science support firms",
      "product-development teams",
      "health innovation companies",
    ],
    typicalUsers: [
      "research-oriented organizations comparing whether Mission Bay's cluster depth improves hiring, partnerships, technical operations, or credibility",
    ],
    leasingSituations: [
      "research and product-development requirements",
      "tenant searches that must compare several Mission Bay lab-adjacent buildings before choosing a building path",
    ],
    strengths: [
      "cluster depth",
      "research-neighbor context",
      "biotech-oriented identity",
      "campus-style setting",
    ],
    tradeoffs: [
      "Biotech suitability depends on suite-level infrastructure, code, landlord approval, and operating requirements.",
      "Companies should compare whether the Mission Bay research cluster matters more than broader office flexibility.",
    ],
    nearbyAlternatives: [
      "1700 Owens",
      "455 Mission Bay Boulevard South",
      "550 Terry Francois",
      "The Exchange",
    ],
    publicSources: [
      {
        label: "Rofo Building Profile",
        url: "/commercial-real-estate/building/CA/san-francisco/1500-owens-st/",
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
    id: "sf-mission-bay-455-mission-bay-boulevard-south",
    title: "455 Mission Bay Boulevard South",
    subjectId: "455-mission-bay-blvd-s",
    subjectName: "455 Mission Bay Blvd S",
    buildingProfileReference: "/commercial-real-estate/building/CA/san-francisco/455-mission-bay-blvd-s/",
    buildingProfileStatus: "migrated",
    evidenceType: "research_lab_environment",
    evidenceTypeLabel: "Research Lab Environment",
    evidenceRole: "ucsf_adjacency_research_benchmark",
    evidenceRoleLabel: "UCSF-Adjacency Research Benchmark",
    confidence: "editorially_supported",
    whyItBelongs:
      "455 Mission Bay Boulevard South is important evidence for understanding UCSF adjacency and research-tenant demand inside Mission Bay.",
    districtFit:
      "It reinforces that Mission Bay's strongest commercial logic is not just new office inventory, but proximity to research institutions and technical-use ecosystems.",
    typicalCompanies: [
      "research companies",
      "biotech firms",
      "health innovation teams",
      "life-science office users",
      "collaboration-focused startups",
    ],
    typicalUsers: [
      "teams that need to evaluate whether adjacency to UCSF, research peers, and specialized building capabilities materially affect the location decision",
    ],
    leasingSituations: [
      "research-lab and life-science office searches",
      "companies validating technical infrastructure before committing to a Mission Bay location",
    ],
    strengths: [
      "UCSF adjacency",
      "research-lab context",
      "innovation cluster credibility",
      "technical-use validation value",
    ],
    tradeoffs: [
      "Specific lab, ventilation, loading, waste, and safety requirements remain property- and suite-level validation topics.",
      "A research-oriented Mission Bay setting can be over-specialized for users that mainly need conventional office space.",
    ],
    nearbyAlternatives: [
      "1700 Owens",
      "1500 Owens",
      "550 Terry Francois",
      "UCSF Mission Bay / Genentech Hall",
    ],
    publicSources: [
      {
        label: "Rofo Building Profile",
        url: "/commercial-real-estate/building/CA/san-francisco/455-mission-bay-blvd-s/",
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
    id: "sf-mission-bay-the-exchange",
    title: "The Exchange",
    subjectId: "1800-owens-st",
    subjectName: "1800 Owens St",
    buildingProfileReference: "/commercial-real-estate/building/CA/san-francisco/1800-owens-st/",
    buildingProfileStatus: "migrated",
    evidenceType: "modern_class_a_innovation_office",
    evidenceTypeLabel: "Modern Class A Innovation Office",
    evidenceRole: "general_office_beyond_lab_benchmark",
    evidenceRoleLabel: "General Office Beyond Lab Benchmark",
    confidence: "editorially_supported",
    whyItBelongs:
      "The Exchange shows Mission Bay's office identity beyond pure lab use and gives general office tenants a modern district benchmark.",
    districtFit:
      "It helps companies evaluate newer construction, institutional adjacency, waterfront access, and a planned district rhythm against SoMa and Financial District alternatives.",
    typicalCompanies: [
      "technology companies",
      "health-adjacent office users",
      "life-science-adjacent teams",
      "modern professional-service groups",
      "growth companies",
    ],
    typicalUsers: [
      "organizations that want Mission Bay's innovation context and modern office scale without assuming that the search is primarily laboratory driven",
    ],
    leasingSituations: [
      "modern office requirements near health, research, and waterfront anchors",
      "companies comparing Mission Bay with central SoMa, South Beach, and the Financial District",
    ],
    strengths: [
      "modern Class A office identity",
      "large-floorplate usefulness",
      "health and research adjacency",
      "planned district context",
      "strong alternative to downtown towers",
    ],
    tradeoffs: [
      "Do not assume lab capability or specialized infrastructure without validating the specific space.",
      "The location can feel more specialized and less broadly familiar than the Financial District or central SoMa.",
    ],
    nearbyAlternatives: [
      "Uber Mission Bay",
      "500 Terry Francois",
      "550 Terry Francois",
      "Salesforce Tower",
    ],
    publicSources: [
      {
        label: "Rofo Building Profile",
        url: "/commercial-real-estate/building/CA/san-francisco/1800-owens-st/",
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
    id: "sf-mission-bay-500-terry-francois",
    title: "500 Terry Francois",
    subjectId: "500-terry-francois-blvd",
    subjectName: "500 Terry Francois Blvd",
    buildingProfileReference: "/commercial-real-estate/building/CA/san-francisco/500-terry-francois-blvd/",
    buildingProfileStatus: "migrated",
    evidenceType: "waterfront_modern_office",
    evidenceTypeLabel: "Waterfront Modern Office",
    evidenceRole: "bayfront_office_character_benchmark",
    evidenceRoleLabel: "Bayfront Office Character Benchmark",
    confidence: "editorially_supported",
    whyItBelongs:
      "500 Terry Francois explains the bayfront office character of Mission Bay and the appeal of newer buildings outside the traditional downtown core.",
    districtFit:
      "It shows that Mission Bay can be a general modern office choice shaped by waterfront access, larger blocks, institutional anchors, and a quieter planned rhythm.",
    typicalCompanies: [
      "technology teams",
      "health-adjacent companies",
      "modern office users",
      "professional-service groups",
      "innovation-oriented firms",
    ],
    typicalUsers: [
      "teams comparing waterfront-adjacent Mission Bay with South Beach, SoMa, and Financial District alternatives for employee experience and district identity",
    ],
    leasingSituations: [
      "waterfront-adjacent office searches",
      "companies deciding whether Mission Bay's planned environment improves recruiting, clients, or daily work patterns",
    ],
    strengths: [
      "waterfront-adjacent setting",
      "newer district identity",
      "modern office context",
      "useful comparison against South Beach and SoMa",
    ],
    tradeoffs: [
      "District amenities and street activity may feel less organic than older neighborhoods.",
      "Event activity, traffic, and waterfront circulation should be considered by operating schedule.",
    ],
    nearbyAlternatives: [
      "The Exchange",
      "550 Terry Francois",
      "185 Berry",
      "409 Illinois",
    ],
    publicSources: [
      {
        label: "Rofo Building Profile",
        url: "/commercial-real-estate/building/CA/san-francisco/500-terry-francois-blvd/",
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
    id: "sf-mission-bay-550-terry-francois",
    title: "550 Terry Francois",
    subjectId: "550-terry-a-francois-blvd",
    subjectName: "550 Terry A Francois Blvd",
    buildingProfileReference: "/commercial-real-estate/building/CA/san-francisco/550-terry-a-francois-blvd/",
    buildingProfileStatus: "migrated",
    evidenceType: "office_lab_waterfront_building",
    evidenceTypeLabel: "Office/Lab Waterfront Building",
    evidenceRole: "office_lab_innovation_benchmark",
    evidenceRoleLabel: "Office/Lab Innovation Benchmark",
    confidence: "editorially_supported",
    whyItBelongs:
      "550 Terry Francois represents newer office and lab-adjacent supply that deepens Mission Bay's innovation identity along the waterfront.",
    districtFit:
      "It connects Mission Bay's modern office appeal with life-science adjacency, making it useful for tenants who need both workplace quality and technical-context validation.",
    typicalCompanies: [
      "life-science-adjacent companies",
      "healthcare technology firms",
      "research-oriented office users",
      "innovation teams",
      "modern office tenants",
    ],
    typicalUsers: [
      "organizations weighing Mission Bay's waterfront office experience against the practical need to validate technical infrastructure and specialized-use assumptions",
    ],
    leasingSituations: [
      "office/lab-adjacent searches",
      "companies comparing waterfront office character with stronger life-science cluster positioning",
    ],
    strengths: [
      "office/lab adjacency",
      "waterfront context",
      "modern building pattern",
      "innovation-district signal",
    ],
    tradeoffs: [
      "Office/lab orientation should not be treated as proof that any available suite supports specialized research use.",
      "Waterfront and event-area circulation can affect commute, visitor, and operating patterns.",
    ],
    nearbyAlternatives: [
      "500 Terry Francois",
      "1700 Owens",
      "The Exchange",
      "409 Illinois",
    ],
    publicSources: [
      {
        label: "Rofo Building Profile",
        url: "/commercial-real-estate/building/CA/san-francisco/550-terry-a-francois-blvd/",
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
    id: "sf-mission-bay-ucsf-mission-bay-genentech-hall",
    title: "UCSF Mission Bay / Genentech Hall",
    subjectId: "600-16th-st",
    subjectName: "600 16th St",
    buildingProfileReference: "/commercial-real-estate/building/CA/san-francisco/600-16th-st/",
    buildingProfileStatus: "migrated",
    evidenceType: "institutional_research_anchor",
    evidenceTypeLabel: "Institutional Research Anchor",
    evidenceRole: "district_origin_and_life_science_anchor",
    evidenceRoleLabel: "District Origin / Life Science Anchor",
    confidence: "editorially_supported",
    whyItBelongs:
      "UCSF Mission Bay / Genentech Hall is essential evidence because it explains why Mission Bay became a life-science and research-oriented district.",
    districtFit:
      "It is not a standard office leasing asset, but it anchors the institutional gravity that makes nearby research, medical, technology, and life-science-adjacent buildings meaningful.",
    typicalCompanies: [
      "life-science companies",
      "research support firms",
      "healthcare-adjacent technology users",
      "clinical research partners",
      "innovation ecosystem participants",
    ],
    typicalUsers: [
      "companies and institutions that benefit from proximity to UCSF, research activity, clinical talent, or Mission Bay's institutional innovation ecosystem",
    ],
    leasingSituations: [
      "district-selection decisions where research adjacency matters more than a single building feature",
      "companies comparing Mission Bay with North Bayshore, South San Francisco, or downtown office alternatives",
    ],
    strengths: [
      "institutional anchor",
      "research ecosystem gravity",
      "life-science district explanation",
      "long-term credibility for Mission Bay's specialization",
    ],
    tradeoffs: [
      "As institutional evidence, it should not be treated as a direct leasing substitute for private office or lab buildings.",
      "Companies still need to validate whether specific available buildings support their technical and operational requirements.",
    ],
    nearbyAlternatives: [
      "1700 Owens",
      "455 Mission Bay Boulevard South",
      "UCSF Medical Center at Mission Bay",
      "North Bayshore research campuses",
    ],
    publicSources: [
      {
        label: "Rofo Building Profile",
        url: "/commercial-real-estate/building/CA/san-francisco/600-16th-st/",
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
    id: "sf-mission-bay-ucsf-medical-center",
    title: "UCSF Medical Center at Mission Bay",
    subjectId: "1825-4th-st",
    subjectName: "1825 4th St",
    buildingProfileReference: "/commercial-real-estate/building/CA/san-francisco/1825-4th-st/",
    buildingProfileStatus: "migrated",
    evidenceType: "medical_institutional_anchor",
    evidenceTypeLabel: "Medical Institutional Anchor",
    evidenceRole: "healthcare_and_clinical_ecosystem_anchor",
    evidenceRoleLabel: "Healthcare and Clinical Ecosystem Anchor",
    confidence: "editorially_supported",
    whyItBelongs:
      "UCSF Medical Center at Mission Bay explains the healthcare and clinical side of the district's commercial ecosystem.",
    districtFit:
      "It shows why Mission Bay is relevant to medical, health-technology, patient-adjacent, and research-support users even when they are not leasing inside a hospital property.",
    typicalCompanies: [
      "healthcare-adjacent technology companies",
      "medical support services",
      "clinical research partners",
      "life-science firms",
      "patient-adjacent service providers",
    ],
    typicalUsers: [
      "organizations that need to understand whether clinical proximity, patient access, or health-system adjacency improves the business case for Mission Bay",
    ],
    leasingSituations: [
      "medical-adjacent office searches",
      "healthcare and life-science companies comparing clinical proximity with general downtown access",
    ],
    strengths: [
      "medical ecosystem credibility",
      "clinical adjacency",
      "institutional anchor value",
      "healthcare and research context",
    ],
    tradeoffs: [
      "Hospital adjacency does not mean nearby private office space supports medical use, patient access, clinical operations, or specialized compliance needs.",
      "Event, hospital, and district circulation should be validated for visitor and employee patterns.",
    ],
    nearbyAlternatives: [
      "UCSF Mission Bay / Genentech Hall",
      "455 Mission Bay Boulevard South",
      "1700 Owens",
      "Mission Bay medical-adjacent office options",
    ],
    publicSources: [
      {
        label: "Rofo Building Profile",
        url: "/commercial-real-estate/building/CA/san-francisco/1825-4th-st/",
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
    id: "sf-mission-bay-chase-center",
    title: "Chase Center",
    subjectId: "1-warriors-way",
    subjectName: "1 Warriors Way",
    buildingProfileReference: "/commercial-real-estate/building/CA/san-francisco/1-warriors-way/",
    buildingProfileStatus: "migrated",
    evidenceType: "mixed_use_amenity_anchor",
    evidenceTypeLabel: "Mixed-Use Amenity Anchor",
    evidenceRole: "event_and_neighborhood_experience_anchor",
    evidenceRoleLabel: "Event and Neighborhood Experience Anchor",
    confidence: "editorially_supported",
    whyItBelongs:
      "Chase Center is not standard office inventory, but it is a major demand and amenity anchor that shapes how companies experience Mission Bay.",
    districtFit:
      "It explains the district's event-driven traffic, restaurant demand, visitor patterns, and mixed-use amenity identity alongside office, research, medical, and residential uses.",
    typicalCompanies: [
      "event-adjacent service businesses",
      "food and beverage users",
      "hospitality partners",
      "consumer-facing brands",
      "office users evaluating amenity context",
    ],
    typicalUsers: [
      "tenants that need to understand how event activity, visitor access, food service, and neighborhood energy affect employee and customer experience",
    ],
    leasingSituations: [
      "office searches where event-area circulation and amenities affect daily operations",
      "retail or service decisions tied to healthcare, residential, office, and arena-driven demand nodes",
    ],
    strengths: [
      "district amenity anchor",
      "event-driven activity",
      "mixed-use identity",
      "retail and food-service demand context",
    ],
    tradeoffs: [
      "Event traffic, parking demand, street closures, and crowd patterns can complicate daily operations for some users.",
      "Arena adjacency should not be confused with broad corridor-wide retail demand.",
    ],
    nearbyAlternatives: [
      "555 Mission Rock",
      "500 Terry Francois",
      "South Beach ballpark district",
      "Mission Bay retail nodes",
    ],
    publicSources: [
      {
        label: "Rofo Building Profile",
        url: "/commercial-real-estate/building/CA/san-francisco/1-warriors-way/",
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
    id: "sf-mission-bay-409-illinois",
    title: "409 Illinois",
    subjectId: "409-illinois-st",
    subjectName: "409 Illinois St",
    buildingProfileReference: "/commercial-real-estate/building/CA/san-francisco/409-illinois-st/",
    buildingProfileStatus: "migrated",
    evidenceType: "waterfront_edge_innovation_office",
    evidenceTypeLabel: "Waterfront-Edge Innovation Office",
    evidenceRole: "smaller_modern_office_format_benchmark",
    evidenceRoleLabel: "Smaller Modern Office Format Benchmark",
    confidence: "editorially_supported",
    whyItBelongs:
      "409 Illinois explains the Illinois and Terry Francois edge of Mission Bay and gives the district a smaller modern office-format example.",
    districtFit:
      "It shows the middle ground between campus lab buildings, large headquarters environments, and waterfront office assets, which helps tenants compare scale inside Mission Bay.",
    typicalCompanies: [
      "technology teams",
      "innovation companies",
      "health-adjacent office users",
      "professional-service teams",
      "smaller growth companies",
    ],
    typicalUsers: [
      "teams that want Mission Bay's innovation and waterfront context but may not need a large headquarters, lab campus, or institutional anchor relationship",
    ],
    leasingSituations: [
      "smaller modern office searches in Mission Bay",
      "companies comparing Illinois/Terry Francois edge buildings with larger Owens Street or Third Street options",
    ],
    strengths: [
      "smaller modern office scale",
      "waterfront-edge context",
      "innovation identity",
      "useful internal Mission Bay comparison value",
    ],
    tradeoffs: [
      "May not carry the same headquarters signal, life-science cluster gravity, or institutional adjacency as larger Mission Bay anchors.",
      "Transit, parking, event circulation, and exact suite infrastructure should be validated by use case.",
    ],
    nearbyAlternatives: [
      "499 Illinois",
      "550 Terry Francois",
      "500 Terry Francois",
      "The Exchange",
    ],
    publicSources: [
      {
        label: "Rofo Building Profile",
        url: "/commercial-real-estate/building/CA/san-francisco/409-illinois-st/",
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
];

module.exports = {
  schemaVersion: "commercial-market-evidence-v1",
  collectionId: "sf-mission-bay-commercial-market-evidence",
  collectionType: "district_commercial_market_evidence",
  status: "production_reference",
  district,
  districtNarrative: {
    whyItExists:
      "Mission Bay exists as San Francisco's planned innovation district, where newer office buildings, UCSF, life-science research, medical anchors, waterfront access, residential growth, and event-driven amenities create a different commercial decision than the Financial District or older SoMa.",
    strongestWhen: [
      "a company benefits from UCSF, life-science, healthcare, or research adjacency",
      "a growth-stage technology or innovation company wants newer buildings and a campus-like district rhythm",
      "waterfront access, Caltrain adjacency, modern office identity, and room to scale matter",
      "the business wants San Francisco talent access without a traditional CBD tower identity",
    ],
    weakerWhen: [
      "the company needs a formal client-facing Financial District address",
      "employees or clients depend primarily on BART-oriented downtown access",
      "the team wants historic warehouse character, boutique executive space, or older central-city street life",
      "the requirement is general office space without any benefit from Mission Bay's specialized health, research, or innovation ecosystem",
    ],
  },
  naturalBusinessFit: {
    fits: [
      "life-science companies",
      "research-oriented organizations",
      "healthcare-adjacent technology users",
      "growth-stage office teams",
      "AI and technology companies",
      "innovation-focused corporate teams",
      "medical-adjacent service providers",
      "selective food, beverage, and service retail tied to office, residential, healthcare, and event demand",
    ],
    lessNaturalFor: [
      "traditional law, finance, or advisory firms that need a formal CBD client address",
      "companies seeking historic boutique office character",
      "warehouse, yard, loading-heavy, or production users",
      "retailers that depend on classic high-street visibility or regional customer parking",
      "small teams that need maximum cost efficiency more than innovation-district identity",
      "users that require lab, medical, or technical infrastructure without verifying building-specific capabilities",
    ],
  },
  qualityStandard:
    "A strong Mission Bay Commercial Market Evidence collection must explain the district's specialized innovation, health, life-science, medical, waterfront, and event-amenity roles without implying that every building supports lab or medical use. Evidence should help tenants compare Mission Bay with SoMa, the Financial District, South Beach, Dogpatch, and Peninsula campus alternatives.",
  records,
  deferredCandidates: [
    {
      title: "499 Illinois",
      reason:
        "Useful as a companion to 409 Illinois, but this bounded collection already includes one smaller Illinois/Terry Francois edge benchmark.",
    },
    {
      title: "555 Mission Rock",
      reason:
        "Important future mixed-use context, but Chase Center and the core office/life-science records already establish Mission Bay's amenity and development pattern for v1.",
    },
    {
      title: "China Basin / 185 Berry",
      reason:
        "A valuable South Beach and ballpark-transition comparison, but it should remain primarily part of South Beach evidence rather than core Mission Bay evidence.",
    },
    {
      title: "Dogpatch Power Station projects",
      reason:
        "Essential for Mission Bay adjacency comparisons, but those records belong in Dogpatch evidence because they explain a different industrial-to-innovation transition.",
    },
  ],
};
