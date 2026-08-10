const district = {
  metroId: "east-bay",
  metroName: "East Bay",
  cityId: "berkeley",
  cityName: "Berkeley",
  districtId: "west-berkeley",
  districtName: "West Berkeley",
  districtPath: "/commercial-real-estate/CA/berkeley/west-berkeley/",
  primaryEcosystem: "industrial_flex",
  secondaryEcosystems: ["office", "retail"],
  referenceDocument: "docs/commercial-market-evidence-financial-district.md",
};

const neighboringDistrictRelationships = [
  {
    districtId: "emeryville-commercial-core",
    districtName: "Emeryville Commercial Core",
    relationship:
      "Emeryville is the stronger comparison when business-park structure, life-science support, and parking-oriented office/flex buildings matter more than Berkeley maker identity.",
  },
  {
    districtId: "downtown-berkeley",
    districtName: "Downtown Berkeley",
    relationship:
      "Downtown Berkeley is the stronger comparison when BART access, UC Berkeley adjacency, and a walkable office or retail environment matter more than production-oriented flex space.",
  },
  {
    districtId: "jack-london-square",
    districtName: "Jack London Square",
    relationship:
      "Jack London Square is the stronger comparison when Oakland waterfront identity and creative-office context matter more than Berkeley industrial/flex utility.",
  },
  {
    districtId: "hayward-industrial",
    districtName: "Hayward Industrial",
    relationship:
      "Hayward Industrial is the stronger comparison when warehouse, I-880 distribution, service-industrial reach, and heavier operational utility matter more than West Berkeley's small-bay and maker pattern.",
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
    id: "east-bay-west-berkeley-2501-9th-st",
    title: "2501 9th St",
    subjectId: "2501-9th-st",
    subjectName: "2501 9th St",
    buildingProfileReference: "/commercial-real-estate/building/CA/berkeley/2501-9th-st/",
    buildingProfileStatus: "migrated",
    evidenceType: "small_bay_industrial_cluster",
    evidenceTypeLabel: "Small-Bay Industrial Cluster",
    evidenceRole: "ninth_street_industrial_flex_benchmark",
    evidenceRoleLabel: "Ninth Street Industrial / Flex Benchmark",
    whyItBelongs:
      "2501 9th St helps anchor the Ninth Street side of West Berkeley for small-bay industrial, maker, service, and operations-oriented users.",
    districtFit:
      "It explains the practical West Berkeley decision where production fit, service access, and Berkeley identity matter more than polished office presentation.",
    typicalCompanies: ["maker businesses", "service-industrial users", "small manufacturers", "contractor operations"],
    typicalUsers: ["businesses comparing West Berkeley with Emeryville, Hayward, and other East Bay industrial/flex options"],
    leasingSituations: [
      "teams validating whether small-bay industrial or flex format can support storage, production, receiving, or dispatch",
      "operators comparing Berkeley identity against more warehouse-oriented East Bay corridors",
    ],
    strengths: ["small-bay industrial evidence", "Ninth Street cluster context", "maker and service-operational relevance"],
    tradeoffs: ["Exact loading, parking, power, ventilation, and permitted use must be verified before any real space decision."],
    nearbyAlternatives: ["2550 9th St", "2560 9th St", "1608 4th St"],
    publicSources: [
      { label: "Rofo Building Profile", url: "/commercial-real-estate/building/CA/berkeley/2501-9th-st/", sourceType: "repository" },
      { label: "Rofo representative building page expansions", url: "_data/representativeBuildingPageExpansions.js", sourceType: "repository" },
    ],
  }),
  evidenceRecord({
    id: "east-bay-west-berkeley-2550-9th-st",
    title: "2550 9th St",
    subjectId: "2550-9th-st",
    subjectName: "2550 9th St",
    buildingProfileReference: "/commercial-real-estate/building/CA/berkeley/2550-9th-st/",
    buildingProfileStatus: "migrated",
    evidenceType: "flex_service_building",
    evidenceTypeLabel: "Flex / Service Building",
    evidenceRole: "ninth_street_service_flex_benchmark",
    evidenceRoleLabel: "Ninth Street Service / Flex Benchmark",
    whyItBelongs:
      "2550 9th St adds another Ninth Street reference for flex, service, and small production-oriented users in West Berkeley.",
    districtFit:
      "It supports the district story that West Berkeley is evaluated through clusters of modest flex and industrial-transition buildings rather than a single anchor property.",
    typicalCompanies: ["small production businesses", "service-commercial operators", "maker businesses", "office/flex users"],
    typicalUsers: ["occupiers that need a flexible Berkeley operating base with practical access and direct property validation"],
    leasingSituations: [
      "small production or service-commercial searches comparing nearby Ninth Street and Heinz Avenue options",
      "users deciding whether West Berkeley's small-building pattern fits better than Emeryville business-park context",
    ],
    strengths: ["service-flex evidence", "Ninth Street comparison value", "small production relevance"],
    tradeoffs: ["Building-specific condition, utility, loading, and use approval cannot be inferred from district fit."],
    nearbyAlternatives: ["2501 9th St", "2560 9th St", "829 Heinz Ave"],
    publicSources: [
      { label: "Rofo Building Profile", url: "/commercial-real-estate/building/CA/berkeley/2550-9th-st/", sourceType: "repository" },
      { label: "Rofo representative building page expansions", url: "_data/representativeBuildingPageExpansions.js", sourceType: "repository" },
    ],
  }),
  evidenceRecord({
    id: "east-bay-west-berkeley-2560-9th-st",
    title: "2560 9th St",
    subjectId: "2560-9th-st",
    subjectName: "2560 9th St",
    buildingProfileReference: "/commercial-real-estate/building/CA/berkeley/2560-9th-st/",
    buildingProfileStatus: "migrated",
    evidenceType: "flex_r_and_d_support_building",
    evidenceTypeLabel: "Flex / R&D-Support Building",
    evidenceRole: "technical_flex_transition_benchmark",
    evidenceRoleLabel: "Technical Flex Transition Benchmark",
    whyItBelongs:
      "2560 9th St helps explain the technical, maker, and production-adjacent side of West Berkeley flex demand.",
    districtFit:
      "It gives the collection a flex/R&D-support example while keeping specialized infrastructure and use claims subject to direct validation.",
    typicalCompanies: ["R&D-support users", "maker businesses", "production-adjacent companies", "technical operations teams"],
    typicalUsers: ["businesses comparing West Berkeley's practical technical-flex context against South Bay R&D parks or heavier I-880 industrial corridors"],
    leasingSituations: [
      "teams that need office, technical, storage, or light operational space in one search",
      "operators validating whether a West Berkeley flex building can support workflow before considering larger industrial alternatives",
    ],
    strengths: ["technical-flex evidence", "production-adjacent relevance", "Ninth Street and Heinz corridor comparison value"],
    tradeoffs: ["R&D or production compatibility requires property-level validation and should not be assumed from the profile alone."],
    nearbyAlternatives: ["2550 9th St", "829 Heinz Ave", "717 Potter St"],
    publicSources: [
      { label: "Rofo Building Profile", url: "/commercial-real-estate/building/CA/berkeley/2560-9th-st/", sourceType: "repository" },
      { label: "Rofo representative building page expansions", url: "_data/representativeBuildingPageExpansions.js", sourceType: "repository" },
    ],
  }),
  evidenceRecord({
    id: "east-bay-west-berkeley-2600-10th-st",
    title: "2600 10th St",
    subjectId: "2600-10th-st",
    subjectName: "2600 10th St",
    buildingProfileReference: "/commercial-real-estate/building/CA/berkeley/2600-10th-st/",
    buildingProfileStatus: "migrated",
    evidenceType: "creative_production_center",
    evidenceTypeLabel: "Creative Production Center",
    evidenceRole: "creative_production_benchmark",
    evidenceRoleLabel: "Creative Production Benchmark",
    whyItBelongs:
      "2600 10th St gives West Berkeley a creative production and adaptive commercial benchmark tied to the district's maker identity.",
    districtFit:
      "It explains why some West Berkeley users compare production-adjacent space for media, creative, and adaptable commercial needs rather than only warehouse utility.",
    typicalCompanies: ["creative production users", "media businesses", "studio-oriented teams", "adaptive commercial users"],
    typicalUsers: ["teams that need Berkeley character, production context, and practical building evaluation in the same location decision"],
    leasingSituations: [
      "creative production or studio searches comparing West Berkeley against Dogpatch, Emeryville, and Jack London Square",
      "users validating whether building layout and operations fit production-adjacent work",
    ],
    strengths: ["creative production evidence", "adaptive commercial context", "strong district identity value"],
    tradeoffs: ["Creative-production relevance does not establish current suite condition, specialized infrastructure, or permitted-use fit."],
    nearbyAlternatives: ["829 Heinz Ave", "918 Parker St", "1608 4th St"],
    publicSources: [
      { label: "Rofo Building Profile", url: "/commercial-real-estate/building/CA/berkeley/2600-10th-st/", sourceType: "repository" },
      { label: "Rofo representative building page expansions", url: "_data/representativeBuildingPageExpansions.js", sourceType: "repository" },
    ],
  }),
  evidenceRecord({
    id: "east-bay-west-berkeley-2929-7th-st",
    title: "2929 7th St",
    subjectId: "2929-7th-st",
    subjectName: "2929 7th St",
    buildingProfileReference: "/commercial-real-estate/building/CA/berkeley/2929-7th-st/",
    buildingProfileStatus: "migrated",
    evidenceType: "waterfront_edge_industrial_flex",
    evidenceTypeLabel: "Waterfront-Edge Industrial / Flex",
    evidenceRole: "aquatic_park_industrial_flex_benchmark",
    evidenceRoleLabel: "Aquatic Park Industrial / Flex Benchmark",
    whyItBelongs:
      "2929 7th St gives the collection west-side and Aquatic Park-edge industrial/flex evidence near I-80 and Berkeley's waterfront-adjacent commercial fabric.",
    districtFit:
      "It broadens West Berkeley beyond Ninth Street by showing how west-side access and industrial/flex utility shape the district.",
    typicalCompanies: ["flex users", "operations-oriented businesses", "industrial users", "service-commercial teams"],
    typicalUsers: ["occupiers comparing west-side Berkeley access and practical industrial/flex settings"],
    leasingSituations: [
      "users evaluating west-side Berkeley access, service movement, and industrial/flex layout",
      "operators comparing Aquatic Park-edge context with Ninth Street, Gilman, and Heinz corridor options",
    ],
    strengths: ["west-side industrial/flex evidence", "I-80 access context", "district range beyond Ninth Street"],
    tradeoffs: ["Users still need to validate building condition, delivery access, parking, and operational permissions directly."],
    nearbyAlternatives: ["950 Gilman St", "650 University Ave", "2501 9th St"],
    publicSources: [
      { label: "Rofo Building Profile", url: "/commercial-real-estate/building/CA/berkeley/2929-7th-st/", sourceType: "repository" },
      { label: "Rofo representative building page expansions", url: "_data/representativeBuildingPageExpansions.js", sourceType: "repository" },
    ],
  }),
  evidenceRecord({
    id: "east-bay-west-berkeley-3100-san-pablo-ave",
    title: "3100 San Pablo Ave",
    subjectId: "3100-san-pablo-ave",
    subjectName: "3100 San Pablo Ave",
    buildingProfileReference: "/commercial-real-estate/building/CA/berkeley/3100-san-pablo-ave/",
    buildingProfileStatus: "migrated",
    evidenceType: "commercial_flex_corridor_edge",
    evidenceTypeLabel: "Commercial / Flex Corridor Edge",
    evidenceRole: "san_pablo_service_commercial_benchmark",
    evidenceRoleLabel: "San Pablo Service-Commercial Benchmark",
    whyItBelongs:
      "3100 San Pablo Ave explains West Berkeley's San Pablo corridor edge for service-commercial, showroom, and flex users.",
    districtFit:
      "It shows where local commercial visibility and flex utility overlap on the eastern side of the district.",
    typicalCompanies: ["service-commercial businesses", "showroom users", "flex users", "local professional operators"],
    typicalUsers: ["businesses comparing Berkeley and Emeryville corridor access with some customer or service presence"],
    leasingSituations: [
      "service-commercial searches where corridor visibility and operational flexibility both matter",
      "users comparing San Pablo Avenue context against deeper industrial West Berkeley blocks",
    ],
    strengths: ["San Pablo corridor evidence", "service-commercial context", "showroom and flex comparison value"],
    tradeoffs: ["Corridor presence may not provide the same operational utility as deeper industrial buildings or the same polish as office-first districts."],
    nearbyAlternatives: ["650 University Ave", "918 Parker St", "Emeryville Commercial Core"],
    publicSources: [
      { label: "Rofo Building Profile", url: "/commercial-real-estate/building/CA/berkeley/3100-san-pablo-ave/", sourceType: "repository" },
      { label: "Rofo representative building page expansions", url: "_data/representativeBuildingPageExpansions.js", sourceType: "repository" },
    ],
  }),
  evidenceRecord({
    id: "east-bay-west-berkeley-650-university-ave",
    title: "650 University Ave",
    subjectId: "650-university-ave",
    subjectName: "650 University Ave",
    buildingProfileReference: "/commercial-real-estate/building/CA/berkeley/650-university-ave/",
    buildingProfileStatus: "migrated",
    evidenceType: "university_avenue_service_flex",
    evidenceTypeLabel: "University Avenue Service / Flex",
    evidenceRole: "west_side_berkeley_access_benchmark",
    evidenceRoleLabel: "West-Side Berkeley Access Benchmark",
    whyItBelongs:
      "650 University Ave ties West Berkeley's industrial/flex geography to the west-side University Avenue commercial corridor.",
    districtFit:
      "It helps users understand when West Berkeley access and service context matter more than a pure maker or warehouse setting.",
    typicalCompanies: ["service-commercial users", "office/flex businesses", "west-side Berkeley operators", "local customer-service teams"],
    typicalUsers: ["businesses needing Berkeley access, service context, and practical flex evaluation"],
    leasingSituations: [
      "office/flex or service-commercial searches that depend on west-side Berkeley access",
      "users comparing University Avenue context with Ninth Street, San Pablo, and Emeryville alternatives",
    ],
    strengths: ["University Avenue access context", "service and office/flex relevance", "bridge between customer access and practical space"],
    tradeoffs: ["The environment may not satisfy heavier industrial requirements or downtown-style office expectations."],
    nearbyAlternatives: ["3100 San Pablo Ave", "2929 7th St", "Downtown Berkeley"],
    publicSources: [
      { label: "Rofo Building Profile", url: "/commercial-real-estate/building/CA/berkeley/650-university-ave/", sourceType: "repository" },
      { label: "Rofo representative building page expansions", url: "_data/representativeBuildingPageExpansions.js", sourceType: "repository" },
    ],
  }),
  evidenceRecord({
    id: "east-bay-west-berkeley-717-potter-st",
    title: "717 Potter St",
    subjectId: "717-potter-st",
    subjectName: "717 Potter St",
    buildingProfileReference: "/commercial-real-estate/building/CA/berkeley/717-potter-st/",
    buildingProfileStatus: "migrated",
    evidenceType: "technical_production_flex",
    evidenceTypeLabel: "Technical Production / Flex",
    evidenceRole: "potter_street_technical_flex_benchmark",
    evidenceRoleLabel: "Potter Street Technical / Flex Benchmark",
    whyItBelongs:
      "717 Potter St gives West Berkeley a technical production and R&D-support reference without treating specialized use as assumed.",
    districtFit:
      "It supports the district's research-adjacent and maker story while keeping infrastructure, approvals, and suitability subject to validation.",
    typicalCompanies: ["technical production users", "R&D-support teams", "maker businesses", "product companies"],
    typicalUsers: ["teams that need a practical Berkeley setting for technical or production-adjacent work"],
    leasingSituations: [
      "users validating whether a technical/flex building can support their operational requirements",
      "businesses comparing Potter Street and Heinz/Ninth Street context against Emeryville or South Bay alternatives",
    ],
    strengths: ["technical-flex evidence", "research-adjacent district context", "production-support comparison value"],
    tradeoffs: ["Specialized technical, lab, ventilation, power, and use requirements must be verified and are not asserted by this evidence record."],
    nearbyAlternatives: ["829 Heinz Ave", "2560 9th St", "2600 10th St"],
    publicSources: [
      { label: "Rofo Building Profile", url: "/commercial-real-estate/building/CA/berkeley/717-potter-st/", sourceType: "repository" },
      { label: "Rofo representative building page expansions", url: "_data/representativeBuildingPageExpansions.js", sourceType: "repository" },
    ],
  }),
  evidenceRecord({
    id: "east-bay-west-berkeley-829-heinz-ave",
    title: "829 Heinz Ave",
    subjectId: "829-heinz-ave",
    subjectName: "829 Heinz Ave",
    buildingProfileReference: "/commercial-real-estate/building/CA/berkeley/829-heinz-ave/",
    buildingProfileStatus: "migrated",
    evidenceType: "heinz_avenue_maker_flex",
    evidenceTypeLabel: "Heinz Avenue Maker / Flex",
    evidenceRole: "maker_and_r_and_d_support_benchmark",
    evidenceRoleLabel: "Maker and R&D-Support Benchmark",
    whyItBelongs:
      "829 Heinz Ave anchors the Heinz Avenue maker and technical-flex pattern within West Berkeley.",
    districtFit:
      "It helps explain why users compare West Berkeley for Berkeley identity, production-adjacent activity, and practical flex buildings.",
    typicalCompanies: ["maker businesses", "R&D-support users", "light-industrial teams", "creative production users"],
    typicalUsers: ["businesses comparing West Berkeley's Heinz and Ninth Street fabric against Emeryville or South Bay flex options"],
    leasingSituations: [
      "maker or technical-flex searches where the exact balance of office, production, storage, and receiving must be validated",
      "operators evaluating whether Berkeley identity is worth trading off against heavier industrial utility elsewhere",
    ],
    strengths: ["Heinz Avenue evidence", "maker and technical-flex relevance", "strong district identity"],
    tradeoffs: ["Technical suitability, production approvals, loading, parking, and current condition remain property-specific validation items."],
    nearbyAlternatives: ["717 Potter St", "2560 9th St", "2600 10th St"],
    publicSources: [
      { label: "Rofo Building Profile", url: "/commercial-real-estate/building/CA/berkeley/829-heinz-ave/", sourceType: "repository" },
      { label: "Rofo representative building page expansions", url: "_data/representativeBuildingPageExpansions.js", sourceType: "repository" },
    ],
  }),
  evidenceRecord({
    id: "east-bay-west-berkeley-918-parker-st",
    title: "918 Parker St",
    subjectId: "918-parker-st",
    subjectName: "918 Parker St",
    buildingProfileReference: "/commercial-real-estate/building/CA/berkeley/918-parker-st/",
    buildingProfileStatus: "migrated",
    evidenceType: "parker_street_production_flex",
    evidenceTypeLabel: "Parker Street Production / Flex",
    evidenceRole: "production_service_flex_benchmark",
    evidenceRoleLabel: "Production / Service Flex Benchmark",
    whyItBelongs:
      "918 Parker St rounds out West Berkeley's production, flex, and service-commercial evidence beyond the Fourth, Ninth, Gilman, Heinz, and San Pablo examples.",
    districtFit:
      "It shows the district's practical mixed commercial fabric for users that need flex utility with Berkeley context.",
    typicalCompanies: ["production users", "flex businesses", "service-commercial operators", "maker teams"],
    typicalUsers: ["occupiers evaluating practical West Berkeley buildings where workflow validation matters more than a formal office image"],
    leasingSituations: [
      "production or service-flex searches comparing multiple West Berkeley micro-locations",
      "businesses deciding whether West Berkeley's maker context fits better than heavier industrial corridors",
    ],
    strengths: ["Parker Street evidence", "production and service-flex context", "district breadth beyond the main corridors"],
    tradeoffs: ["Street context and building format may not satisfy users that need heavy warehouse utility, large truck movement, or polished client-facing office space."],
    nearbyAlternatives: ["2600 10th St", "3100 San Pablo Ave", "829 Heinz Ave"],
    publicSources: [
      { label: "Rofo Building Profile", url: "/commercial-real-estate/building/CA/berkeley/918-parker-st/", sourceType: "repository" },
      { label: "Rofo representative building page expansions", url: "_data/representativeBuildingPageExpansions.js", sourceType: "repository" },
    ],
  }),
  evidenceRecord({
    id: "east-bay-west-berkeley-950-gilman-st",
    title: "950 Gilman St",
    subjectId: "950-gilman-st",
    subjectName: "950 Gilman St",
    buildingProfileReference: "/commercial-real-estate/building/CA/berkeley/950-gilman-st/",
    buildingProfileStatus: "migrated",
    evidenceType: "gilman_street_industrial_flex",
    evidenceTypeLabel: "Gilman Street Industrial / Flex",
    evidenceRole: "gilman_corridor_industrial_flex_benchmark",
    evidenceRoleLabel: "Gilman Corridor Industrial / Flex Benchmark",
    whyItBelongs:
      "950 Gilman St gives West Berkeley a Gilman corridor benchmark for industrial, flex, and service-commercial users.",
    districtFit:
      "It helps explain the I-80-oriented and maker/service side of the district for users comparing West Berkeley with Emeryville and larger East Bay industrial corridors.",
    typicalCompanies: ["industrial users", "flex users", "maker businesses", "service-commercial operators"],
    typicalUsers: ["teams that need West Berkeley access, service context, and practical industrial/flex validation"],
    leasingSituations: [
      "industrial/flex searches where I-80 reach and Gilman corridor context are relevant",
      "operators comparing small-bay West Berkeley buildings against Hayward or Union City industrial alternatives",
    ],
    strengths: ["Gilman corridor evidence", "industrial/flex relevance", "I-80 access context"],
    tradeoffs: ["Users must validate loading, parking, truck access, property condition, and use permissions directly."],
    nearbyAlternatives: ["2501 9th St", "2929 7th St", "2600 10th St"],
    publicSources: [
      { label: "Rofo Building Profile", url: "/commercial-real-estate/building/CA/berkeley/950-gilman-st/", sourceType: "repository" },
      { label: "Rofo representative building page expansions", url: "_data/representativeBuildingPageExpansions.js", sourceType: "repository" },
    ],
  }),
];

module.exports = {
  collectionId: "west-berkeley-commercial-market-evidence",
  schemaVersion: "commercial-market-evidence-v1",
  district,
  neighboringDistrictRelationships,
  records,
  deferredCandidates: [
    {
      id: "west-berkeley-business-guides",
      label: "West Berkeley business guides",
      status: "blocked_for_now",
      reason:
        "West Berkeley now has district evidence and Building Profiles, but public business guides should wait for a separately approved guide packet that compares maker, service, flex, and research-support audiences.",
      prerequisite:
        "Approve a focused West Berkeley business-guide mission with guide-specific taxonomy, internal-linking, and recommendation QA scope.",
    },
  ],
};
