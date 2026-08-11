const district = {
  metroId: "east-bay",
  metroName: "East Bay",
  cityId: "berkeley",
  cityName: "Berkeley",
  districtId: "downtown-berkeley",
  districtName: "Downtown Berkeley",
  districtPath: "/commercial-real-estate/CA/berkeley/downtown-berkeley/",
  primaryEcosystem: "office",
  secondaryEcosystems: ["retail", "coworking"],
  referenceDocument: "docs/commercial-market-evidence-financial-district.md",
};

const neighboringDistrictRelationships = [
  {
    districtId: "emeryville-commercial-core",
    districtName: "Emeryville Commercial Core",
    relationship:
      "Emeryville is the stronger comparison when a company wants a more campus-oriented East Bay office or research-support setting with easier parking and freeway access.",
  },
  {
    districtId: "west-berkeley",
    districtName: "West Berkeley",
    relationship:
      "West Berkeley is the stronger comparison when industrial/flex character, maker activity, and practical production-oriented buildings matter more than BART-oriented downtown office context.",
  },
  {
    districtId: "jack-london-square",
    districtName: "Jack London Square",
    relationship:
      "Jack London Square is the stronger comparison when waterfront Oakland identity and a broader Oakland client or creative-office context matter more than UC Berkeley adjacency.",
  },
];

function evidenceRecord(fields) {
  return {
    subjectType: "building",
    district,
    neighboringDistrictRelationships,
    reviewStatus: "approved_reference",
    confidence: "editorially_supported",
    ...fields,
  };
}

const records = [
  evidenceRecord({
    id: "east-bay-downtown-berkeley-1936-university-ave",
    title: "1936 University Ave",
    subjectId: "1936-university-ave",
    subjectName: "1936 University Ave",
    buildingProfileReference: "/commercial-real-estate/building/CA/berkeley/1936-university-ave/",
    buildingProfileStatus: "migrated",
    evidenceType: "downtown_commercial_building",
    evidenceTypeLabel: "Downtown Commercial Building",
    evidenceRole: "university_avenue_service_office_benchmark",
    evidenceRoleLabel: "University Avenue Service-Office Benchmark",
    whyItBelongs:
      "1936 University Ave helps explain Downtown Berkeley's University Avenue office, service, and street-level commercial pattern near the Shattuck core.",
    districtFit:
      "It shows why some users choose Downtown Berkeley for visibility, central Berkeley access, and university-adjacent service context rather than campus-style office scale.",
    typicalCompanies: ["professional-service firms", "education-adjacent organizations", "service businesses", "small office users"],
    typicalUsers: ["teams that want a walkable Berkeley address with BART, civic, and University Avenue context"],
    leasingSituations: [
      "small office or service-commercial searches comparing University Avenue with Shattuck Avenue",
      "users validating whether downtown visibility and Berkeley identity matter more than parking or expansion scale",
    ],
    strengths: ["University Avenue corridor context", "office and service-commercial relevance", "BART and UC Berkeley adjacency"],
    tradeoffs: ["Parking, customer arrival, suite condition, and street-level configuration must be validated before a real space decision."],
    nearbyAlternatives: ["2030 Addison St", "2140 Shattuck Ave", "West Berkeley"],
    publicSources: [
      { label: "Rofo Building Profile", url: "/commercial-real-estate/building/CA/berkeley/1936-university-ave/", sourceType: "repository" },
      { label: "Rofo representative building page expansions", url: "_data/representativeBuildingPageExpansions.js", sourceType: "repository" },
    ],
  }),
  evidenceRecord({
    id: "east-bay-downtown-berkeley-2030-addison-st",
    title: "2030 Addison St",
    subjectId: "2030-addison-st",
    subjectName: "2030 Addison St",
    buildingProfileReference: "/commercial-real-estate/building/CA/berkeley/2030-addison-st/",
    buildingProfileStatus: "migrated",
    evidenceType: "civic_adjacent_office_building",
    evidenceTypeLabel: "Civic-Adjacent Office Building",
    evidenceRole: "addison_street_professional_office_benchmark",
    evidenceRoleLabel: "Addison Street Professional Office Benchmark",
    whyItBelongs:
      "2030 Addison St adds a named Addison Street office reference near Downtown Berkeley's civic, arts, BART, and university-adjacent commercial core.",
    districtFit:
      "It supports the district story that Downtown Berkeley is not only Shattuck frontage; nearby civic and arts blocks also shape professional-office demand.",
    typicalCompanies: ["professional-service firms", "nonprofits", "education-adjacent organizations", "civic-adjacent offices"],
    typicalUsers: ["occupiers comparing a central Berkeley office setting against Emeryville or Oakland alternatives"],
    leasingSituations: [
      "professional office searches where BART and civic proximity matter",
      "organizations evaluating whether a downtown Berkeley address fits clients, staff, and institutional relationships",
    ],
    strengths: ["Addison Street context", "civic and arts adjacency", "professional-office evidence"],
    tradeoffs: ["Users should validate office layout, visitor access, parking strategy, and whether surrounding downtown activity fits the business."],
    nearbyAlternatives: ["2130 Center St", "2168 Shattuck Ave", "1936 University Ave"],
    publicSources: [
      { label: "Rofo Building Profile", url: "/commercial-real-estate/building/CA/berkeley/2030-addison-st/", sourceType: "repository" },
      { label: "Rofo representative building page expansions", url: "_data/representativeBuildingPageExpansions.js", sourceType: "repository" },
    ],
  }),
  evidenceRecord({
    id: "east-bay-downtown-berkeley-2040-bancroft-way",
    title: "2040 Bancroft Way",
    subjectId: "2040-bancroft-way",
    subjectName: "2040 Bancroft Way",
    buildingProfileReference: "/commercial-real-estate/building/CA/berkeley/2040-bancroft-way/",
    buildingProfileStatus: "migrated",
    evidenceType: "university_edge_office_building",
    evidenceTypeLabel: "University-Edge Office Building",
    evidenceRole: "uc_berkeley_edge_benchmark",
    evidenceRoleLabel: "UC Berkeley Edge Benchmark",
    whyItBelongs:
      "2040 Bancroft Way gives the collection a campus-edge office and service example for organizations that value UC Berkeley adjacency.",
    districtFit:
      "It clarifies the eastern side of Downtown Berkeley, where institutional adjacency can matter more than freeway access or suburban office scale.",
    typicalCompanies: ["education-adjacent organizations", "nonprofits", "professional-service firms", "student-serving service users"],
    typicalUsers: ["teams deciding whether the UC Berkeley edge is part of their location strategy"],
    leasingSituations: [
      "office searches where university proximity is a requirement or strong preference",
      "service or nonprofit users comparing campus-edge context with central Shattuck or University Avenue alternatives",
    ],
    strengths: ["UC Berkeley adjacency", "campus-edge context", "downtown office and service relevance"],
    tradeoffs: ["Campus-edge activity, parking, access, and building configuration should be validated for day-to-day operations."],
    nearbyAlternatives: ["2130 Center St", "2070 Allston Way", "Emeryville Commercial Core"],
    publicSources: [
      { label: "Rofo Building Profile", url: "/commercial-real-estate/building/CA/berkeley/2040-bancroft-way/", sourceType: "repository" },
      { label: "Rofo representative building page expansions", url: "_data/representativeBuildingPageExpansions.js", sourceType: "repository" },
    ],
  }),
  evidenceRecord({
    id: "east-bay-downtown-berkeley-2070-allston-way",
    title: "2070 Allston Way",
    subjectId: "2070-allston-way",
    subjectName: "2070 Allston Way",
    buildingProfileReference: "/commercial-real-estate/building/CA/berkeley/2070-allston-way/",
    buildingProfileStatus: "migrated",
    evidenceType: "secondary_street_office_building",
    evidenceTypeLabel: "Secondary-Street Office Building",
    evidenceRole: "allston_way_small_office_benchmark",
    evidenceRoleLabel: "Allston Way Small Office Benchmark",
    whyItBelongs:
      "2070 Allston Way gives Downtown Berkeley a smaller professional-office example off the primary Shattuck and University Avenue corridors.",
    districtFit:
      "It helps users understand the district's secondary-street office pattern for smaller teams that want central access without relying on a large tower setting.",
    typicalCompanies: ["small professional offices", "local service businesses", "consulting firms", "nonprofits"],
    typicalUsers: ["smaller teams comparing walkable central Berkeley access with more parking-oriented East Bay alternatives"],
    leasingSituations: [
      "small-suite searches where BART proximity and downtown identity are more important than campus scale",
      "users comparing secondary-street buildings with higher-visibility Shattuck or University Avenue options",
    ],
    strengths: ["smaller office evidence", "central Berkeley access", "secondary-street comparison value"],
    tradeoffs: ["Small-building fit depends on exact suite condition, access, signage, parking, and visitor experience."],
    nearbyAlternatives: ["2118 Milvia St", "2130 Center St", "2168 Shattuck Ave"],
    publicSources: [
      { label: "Rofo Building Profile", url: "/commercial-real-estate/building/CA/berkeley/2070-allston-way/", sourceType: "repository" },
      { label: "Rofo representative building page expansions", url: "_data/representativeBuildingPageExpansions.js", sourceType: "repository" },
    ],
  }),
  evidenceRecord({
    id: "east-bay-downtown-berkeley-2118-milvia-st",
    title: "2118 Milvia St",
    subjectId: "2118-milvia-st",
    subjectName: "2118 Milvia St",
    buildingProfileReference: "/commercial-real-estate/building/CA/berkeley/2118-milvia-st/",
    buildingProfileStatus: "migrated",
    evidenceType: "civic_core_service_office",
    evidenceTypeLabel: "Civic-Core Service Office",
    evidenceRole: "milvia_street_service_office_benchmark",
    evidenceRoleLabel: "Milvia Street Service-Office Benchmark",
    whyItBelongs:
      "2118 Milvia St adds a quieter civic-core office reference for local service and smaller professional users near Downtown Berkeley's core.",
    districtFit:
      "It shows that Downtown Berkeley can support central Berkeley access without every relevant building needing primary Shattuck frontage.",
    typicalCompanies: ["local service businesses", "small professional offices", "community-serving organizations", "consulting teams"],
    typicalUsers: ["small users prioritizing central Berkeley access, BART proximity, and civic-area convenience"],
    leasingSituations: [
      "small office searches comparing quieter downtown blocks with higher-visibility corridors",
      "local service businesses validating visitor access, signage, and downtown fit",
    ],
    strengths: ["Milvia Street context", "civic-core access", "small office and local-service evidence"],
    tradeoffs: ["Visibility, parking, suite quality, and visitor arrival should be compared against Shattuck and University Avenue options."],
    nearbyAlternatives: ["2070 Allston Way", "2030 Addison St", "2140 Shattuck Ave"],
    publicSources: [
      { label: "Rofo Building Profile", url: "/commercial-real-estate/building/CA/berkeley/2118-milvia-st/", sourceType: "repository" },
      { label: "Rofo representative building page expansions", url: "_data/representativeBuildingPageExpansions.js", sourceType: "repository" },
    ],
  }),
  evidenceRecord({
    id: "east-bay-downtown-berkeley-2130-center-st",
    title: "2130 Center St",
    subjectId: "2130-center-st",
    subjectName: "2130 Center St",
    buildingProfileReference: "/commercial-real-estate/building/CA/berkeley/2130-center-st/",
    buildingProfileStatus: "migrated",
    evidenceType: "arts_civic_core_office",
    evidenceTypeLabel: "Arts / Civic-Core Office",
    evidenceRole: "center_street_civic_office_benchmark",
    evidenceRoleLabel: "Center Street Civic Office Benchmark",
    whyItBelongs:
      "2130 Center St explains Downtown Berkeley's Center Street setting near BART, civic uses, arts venues, and the UC Berkeley edge.",
    districtFit:
      "It supports the district's civic and institutional side, distinct from West Berkeley's industrial/flex identity and Emeryville's business-park context.",
    typicalCompanies: ["nonprofits", "civic-adjacent organizations", "professional-service firms", "education-adjacent users"],
    typicalUsers: ["teams that need BART access, downtown Berkeley identity, and proximity to civic or university-facing activity"],
    leasingSituations: [
      "office searches where civic, arts, transit, and institutional adjacency matter",
      "users comparing Center Street with Shattuck, Addison, and Bancroft alternatives",
    ],
    strengths: ["Center Street identity", "BART and civic access", "institutional-adjacent office evidence"],
    tradeoffs: ["Users should validate parking, visitor arrival, building access, and whether nearby activity supports or distracts from operations."],
    nearbyAlternatives: ["2030 Addison St", "2040 Bancroft Way", "2168 Shattuck Ave"],
    publicSources: [
      { label: "Rofo Building Profile", url: "/commercial-real-estate/building/CA/berkeley/2130-center-st/", sourceType: "repository" },
      { label: "Rofo representative building page expansions", url: "_data/representativeBuildingPageExpansions.js", sourceType: "repository" },
    ],
  }),
  evidenceRecord({
    id: "east-bay-downtown-berkeley-2140-shattuck-ave",
    title: "2140 Shattuck Ave",
    subjectId: "2140-shattuck-ave",
    subjectName: "2140 Shattuck Ave",
    buildingProfileReference: "/commercial-real-estate/building/CA/berkeley/2140-shattuck-ave/",
    buildingProfileStatus: "migrated",
    evidenceType: "transit_oriented_office_building",
    evidenceTypeLabel: "Transit-Oriented Office Building",
    evidenceRole: "shattuck_corridor_office_benchmark",
    evidenceRoleLabel: "Shattuck Corridor Office Benchmark",
    whyItBelongs:
      "2140 Shattuck Ave anchors the Shattuck Avenue side of Downtown Berkeley for BART-oriented office and professional-service users.",
    districtFit:
      "It is a practical example of why companies compare Downtown Berkeley when transit, UC Berkeley adjacency, and walkable downtown services matter.",
    typicalCompanies: ["professional-service firms", "education-adjacent organizations", "nonprofits", "client-facing office users"],
    typicalUsers: ["teams that want the main Downtown Berkeley business corridor rather than an industrial/flex or campus-office setting"],
    leasingSituations: [
      "office searches where Shattuck Avenue identity and BART proximity are central to fit",
      "users weighing Downtown Berkeley against Emeryville for transit versus parking tradeoffs",
    ],
    strengths: ["Shattuck Avenue office evidence", "BART-oriented downtown context", "professional-service relevance"],
    tradeoffs: ["Transit strength does not remove the need to validate parking, suite layout, visitor arrival, and current building condition."],
    nearbyAlternatives: ["2150 Shattuck Ave", "2168 Shattuck Ave", "1936 University Ave"],
    publicSources: [
      { label: "Rofo Building Profile", url: "/commercial-real-estate/building/CA/berkeley/2140-shattuck-ave/", sourceType: "repository" },
      { label: "Rofo representative building page expansions", url: "_data/representativeBuildingPageExpansions.js", sourceType: "repository" },
    ],
  }),
  evidenceRecord({
    id: "east-bay-downtown-berkeley-2150-shattuck-ave",
    title: "2150 Shattuck Ave",
    subjectId: "2150-shattuck-ave",
    subjectName: "2150 Shattuck Ave",
    buildingProfileReference: "/commercial-real-estate/building/CA/berkeley/2150-shattuck-ave/",
    buildingProfileStatus: "migrated",
    evidenceType: "central_shattuck_office_building",
    evidenceTypeLabel: "Central Shattuck Office Building",
    evidenceRole: "bart_oriented_professional_office_benchmark",
    evidenceRoleLabel: "BART-Oriented Professional Office Benchmark",
    whyItBelongs:
      "2150 Shattuck Ave strengthens the collection's central Shattuck office coverage for transit-oriented professional and university-adjacent users.",
    districtFit:
      "It helps distinguish Downtown Berkeley from Emeryville by showing a walkable, BART-centered professional-office pattern.",
    typicalCompanies: ["professional-service firms", "education-adjacent organizations", "regional project teams", "small to mid-size office users"],
    typicalUsers: ["occupiers comparing Shattuck Avenue visibility, transit, and downtown services against more parking-oriented East Bay districts"],
    leasingSituations: [
      "professional office searches centered on Downtown Berkeley BART",
      "teams deciding whether a central Shattuck address fits clients, employees, and university-facing relationships",
    ],
    strengths: ["central Shattuck evidence", "BART-oriented professional-office context", "walkable downtown service access"],
    tradeoffs: ["Parking, visitor arrival, floorplate fit, and current suite condition should be verified early."],
    nearbyAlternatives: ["2140 Shattuck Ave", "2168 Shattuck Ave", "2300 Shattuck Ave"],
    publicSources: [
      { label: "Rofo Building Profile", url: "/commercial-real-estate/building/CA/berkeley/2150-shattuck-ave/", sourceType: "repository" },
      { label: "Rofo representative building page expansions", url: "_data/representativeBuildingPageExpansions.js", sourceType: "repository" },
    ],
  }),
  evidenceRecord({
    id: "east-bay-downtown-berkeley-2168-shattuck-ave",
    title: "2168 Shattuck Ave",
    subjectId: "2168-shattuck-ave",
    subjectName: "2168 Shattuck Ave",
    buildingProfileReference: "/commercial-real-estate/building/CA/berkeley/2168-shattuck-ave/",
    buildingProfileStatus: "migrated",
    evidenceType: "professional_office_building",
    evidenceTypeLabel: "Professional Office Building",
    evidenceRole: "constitution_square_professional_office_benchmark",
    evidenceRoleLabel: "Constitution Square Professional Office Benchmark",
    whyItBelongs:
      "2168 Shattuck Ave, identified in Rofo source data as Constitution Square, gives Downtown Berkeley a useful professional-office benchmark on the central business corridor.",
    districtFit:
      "It supports the district's BART-oriented office story and gives users another concrete Shattuck Avenue alternative to compare.",
    typicalCompanies: ["professional-service firms", "consulting teams", "nonprofits", "university-facing organizations"],
    typicalUsers: ["office users that want central Downtown Berkeley identity and easy access to BART and local services"],
    leasingSituations: [
      "professional-office searches comparing Shattuck corridor buildings",
      "users validating whether downtown walkability and Berkeley identity offset parking constraints",
    ],
    strengths: ["professional-office evidence", "central Shattuck corridor context", "named building reference in Rofo source data"],
    tradeoffs: ["Users should validate layout, condition, parking, visitor experience, and any shared-building requirements."],
    nearbyAlternatives: ["2140 Shattuck Ave", "2150 Shattuck Ave", "2070 Allston Way"],
    publicSources: [
      { label: "Rofo Building Profile", url: "/commercial-real-estate/building/CA/berkeley/2168-shattuck-ave/", sourceType: "repository" },
      { label: "Rofo representative building page expansions", url: "_data/representativeBuildingPageExpansions.js", sourceType: "repository" },
    ],
  }),
  evidenceRecord({
    id: "east-bay-downtown-berkeley-2300-shattuck-ave",
    title: "2300 Shattuck Ave",
    subjectId: "2300-shattuck-ave",
    subjectName: "2300 Shattuck Ave",
    buildingProfileReference: "/commercial-real-estate/building/CA/berkeley/2300-shattuck-ave/",
    buildingProfileStatus: "migrated",
    evidenceType: "shattuck_corridor_office_building",
    evidenceTypeLabel: "Shattuck Corridor Office Building",
    evidenceRole: "south_shattuck_office_scale_benchmark",
    evidenceRoleLabel: "South Shattuck Office Scale Benchmark",
    whyItBelongs:
      "2300 Shattuck Ave adds scale and south-corridor depth to Downtown Berkeley's Shattuck Avenue office evidence.",
    districtFit:
      "It broadens the collection beyond the immediate BART core while remaining tied to Downtown Berkeley's main business corridor.",
    typicalCompanies: ["office users", "professional-service firms", "education-adjacent teams", "organizations comparing East Bay office districts"],
    typicalUsers: ["teams that want Downtown Berkeley identity but may compare multiple Shattuck corridor positions"],
    leasingSituations: [
      "office searches where the user is comparing central and south Shattuck alternatives",
      "larger or more established users deciding whether Downtown Berkeley has enough practical office depth",
    ],
    strengths: ["south Shattuck corridor evidence", "office scale comparison value", "district range beyond the core BART block"],
    tradeoffs: ["Users should compare pedestrian pattern, parking, visitor access, and exact suite condition against more central Downtown Berkeley options."],
    nearbyAlternatives: ["2150 Shattuck Ave", "2168 Shattuck Ave", "Emeryville Commercial Core"],
    publicSources: [
      { label: "Rofo Building Profile", url: "/commercial-real-estate/building/CA/berkeley/2300-shattuck-ave/", sourceType: "repository" },
      { label: "Rofo representative building page expansions", url: "_data/representativeBuildingPageExpansions.js", sourceType: "repository" },
    ],
  }),
];

module.exports = {
  collectionId: "downtown-berkeley-commercial-market-evidence",
  schemaVersion: "commercial-market-evidence-v1",
  district,
  neighboringDistrictRelationships,
  records,
  deferredCandidates: [
    {
      id: "downtown-berkeley-business-guides",
      label: "Downtown Berkeley business guides",
      status: "blocked_for_now",
      reason:
        "Downtown Berkeley now has district evidence and Building Profiles, but public business guides should wait for a separately approved guide packet with guide-specific taxonomy, internal-linking, and recommendation QA scope.",
      prerequisite:
        "Approve a focused Downtown Berkeley business-guide mission for university-adjacent office, service retail, and downtown customer-access audiences.",
    },
  ],
};
