const district = {
  metroId: "east-bay",
  metroName: "East Bay",
  cityId: "fremont",
  cityName: "Fremont",
  districtId: "warm-springs-innovation-district",
  districtName: "Warm Springs Innovation District",
  districtPath: "/commercial-real-estate/CA/fremont/warm-springs-innovation-district/",
  primaryEcosystem: "industrial_flex",
  secondaryEcosystems: ["office"],
  referenceDocument: "docs/commercial-market-evidence-financial-district.md",
};

const neighboringDistrictRelationships = [
  {
    districtId: "union-city-industrial",
    districtName: "Union City Industrial",
    relationship:
      "Union City Industrial is the stronger comparison when warehouse, light-manufacturing, and general I-880 operating utility matter more than advanced manufacturing or technology-adjacent flex context.",
  },
  {
    districtId: "hayward-industrial",
    districtName: "Hayward Industrial",
    relationship:
      "Hayward Industrial is the stronger comparison when central East Bay warehouse, service-industrial, and Highway 92 reach matter more than Fremont's innovation-industrial setting.",
  },
  {
    districtId: "moffett-park",
    districtName: "Moffett Park",
    relationship:
      "Moffett Park is the stronger comparison when South Bay R&D business-park identity and Highway 101 access matter more than Fremont manufacturing adjacency.",
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
    id: "east-bay-warm-springs-innovation-district-47697-westinghouse-dr",
    title: "47697 Westinghouse Dr",
    subjectId: "47697-westinghouse-dr",
    subjectName: "47697 Westinghouse Dr",
    buildingProfileReference: "/commercial-real-estate/building/CA/fremont/47697-westinghouse-dr/",
    buildingProfileStatus: "migrated",
    evidenceType: "warm_springs_business_center_flex",
    evidenceTypeLabel: "Warm Springs Business-Center Flex",
    evidenceRole: "westinghouse_flex_operations_benchmark",
    evidenceRoleLabel: "Westinghouse Flex Operations Benchmark",
    whyItBelongs:
      "47697 Westinghouse Dr explains Warm Springs as a business-center flex environment for office, service, and technology operations near I-880.",
    districtFit:
      "It helps show that Warm Springs is not only heavy industrial; some users evaluate it for flexible office/operational formats near South Fremont industrial access.",
    typicalCompanies: ["technology operations teams", "office/flex users", "service businesses", "R&D support users"],
    typicalUsers: ["businesses comparing Warm Springs flex with Union City industrial utility and South Bay R&D parks"],
    leasingSituations: [
      "office/flex searches where operational support, parking, and I-880 access matter together",
      "technical or service users comparing Fremont against Sunnyvale, Union City, and Hayward",
    ],
    strengths: ["business-center flex context", "Warm Springs Boulevard access", "technology and service-operations relevance"],
    tradeoffs: ["Users must validate office/operational split, loading, parking, permitted use, and technical infrastructure directly."],
    nearbyAlternatives: ["46723 Lakeview Blvd", "45101-45169 Industrial Dr", "Moffett Park"],
    publicSources: [
      { label: "Rofo Building Profile", url: "/commercial-real-estate/building/CA/fremont/47697-westinghouse-dr/", sourceType: "repository" },
      { label: "Rofo representative building page expansions", url: "_data/representativeBuildingPageExpansions.js", sourceType: "repository" },
    ],
  }),
  evidenceRecord({
    id: "east-bay-warm-springs-innovation-district-48603-warm-springs-blvd",
    title: "48603 Warm Springs Blvd",
    subjectId: "48603-warm-springs-blvd",
    subjectName: "48603 Warm Springs Blvd",
    buildingProfileReference: "/commercial-real-estate/building/CA/fremont/48603-warm-springs-blvd/",
    buildingProfileStatus: "migrated",
    evidenceType: "warm_springs_boulevard_industrial_flex",
    evidenceTypeLabel: "Warm Springs Boulevard Industrial / Flex",
    evidenceRole: "warm_springs_boulevard_corridor_benchmark",
    evidenceRoleLabel: "Warm Springs Boulevard Corridor Benchmark",
    whyItBelongs:
      "48603 Warm Springs Blvd gives the collection a Warm Springs Boulevard reference near Kato Road, Milmont Drive, and the BART-area industrial corridor.",
    districtFit:
      "It supports the district story that Warm Springs works as a South Fremont industrial and R&D/flex corridor, not just a single Kato Road cluster.",
    typicalCompanies: ["R&D/flex users", "light manufacturers", "technical operations teams", "service businesses"],
    typicalUsers: ["occupiers comparing South Fremont corridor access, transit adjacency, and production-support requirements"],
    leasingSituations: [
      "flex or light-industrial searches where Warm Springs Boulevard frontage and nearby industrial access shape the short list",
      "businesses deciding whether Fremont's innovation-industrial context is more useful than Hayward or Union City warehouse utility",
    ],
    strengths: ["Warm Springs Boulevard coverage", "BART-area context", "industrial and R&D/flex comparison value"],
    tradeoffs: ["The evidence does not establish current suite condition, lease terms, specialized infrastructure, or final tenant fit."],
    nearbyAlternatives: ["48860 Milmont Dr", "48834 Kato Rd", "Union City Industrial"],
    publicSources: [
      { label: "Rofo Building Profile", url: "/commercial-real-estate/building/CA/fremont/48603-warm-springs-blvd/", sourceType: "repository" },
      { label: "Rofo representative building page expansions", url: "_data/representativeBuildingPageExpansions.js", sourceType: "repository" },
    ],
  }),
  evidenceRecord({
    id: "east-bay-warm-springs-innovation-district-48810-48818-kato-rd",
    title: "48810-48818 Kato Rd",
    subjectId: "48810-48818-kato-rd",
    subjectName: "48810-48818 Kato Rd",
    buildingProfileReference: "/commercial-real-estate/building/CA/fremont/48810-48818-kato-rd/",
    buildingProfileStatus: "migrated",
    evidenceType: "kato_road_advanced_manufacturing_flex",
    evidenceTypeLabel: "Kato Road Advanced Manufacturing / Flex",
    evidenceRole: "kato_road_cluster_depth",
    evidenceRoleLabel: "Kato Road Cluster Depth",
    whyItBelongs:
      "48810-48818 Kato Rd adds Kato Road cluster depth for users evaluating Warm Springs for hardware, production, and technical operations.",
    districtFit:
      "It strengthens the collection's core manufacturing/flex evidence and helps distinguish Warm Springs from more general East Bay warehouse districts.",
    typicalCompanies: ["hardware companies", "advanced manufacturing users", "R&D support teams", "production-support businesses"],
    typicalUsers: ["teams that need to compare exact Kato Road buildings before assuming infrastructure, loading, or production fit"],
    leasingSituations: [
      "advanced manufacturing or R&D/flex searches where Kato Road location and technical validation are central",
      "users comparing nearby Warm Springs buildings for office/warehouse mix, power, loading, and operating access",
    ],
    strengths: ["Kato Road cluster depth", "advanced manufacturing relevance", "technical operations comparison value"],
    tradeoffs: ["Similar corridor identity does not prove similar power, loading, ventilation, parking, or permitted-use fit."],
    nearbyAlternatives: ["48834 Kato Rd", "48860 Milmont Dr", "45101-45169 Industrial Dr"],
    publicSources: [
      { label: "Rofo Building Profile", url: "/commercial-real-estate/building/CA/fremont/48810-48818-kato-rd/", sourceType: "repository" },
      { label: "Rofo representative building page expansions", url: "_data/representativeBuildingPageExpansions.js", sourceType: "repository" },
    ],
  }),
  evidenceRecord({
    id: "east-bay-warm-springs-innovation-district-48834-kato-rd",
    title: "48834 Kato Rd",
    subjectId: "48834-kato-rd",
    subjectName: "48834 Kato Rd",
    buildingProfileReference: "/commercial-real-estate/building/CA/fremont/48834-kato-rd/",
    buildingProfileStatus: "migrated",
    evidenceType: "kato_road_hardware_manufacturing_building",
    evidenceTypeLabel: "Kato Road Hardware / Manufacturing Building",
    evidenceRole: "hardware_manufacturing_benchmark",
    evidenceRoleLabel: "Hardware Manufacturing Benchmark",
    whyItBelongs:
      "48834 Kato Rd represents Warm Springs' hardware, manufacturing, and production-adjacent identity near Milmont Drive and I-880.",
    districtFit:
      "It gives the district a clear Kato Road manufacturing benchmark for users comparing Fremont against Union City, Hayward, and South Bay flex corridors.",
    typicalCompanies: ["hardware teams", "light manufacturers", "R&D support users", "technical production teams"],
    typicalUsers: ["occupiers that need Fremont manufacturing adjacency but must validate property-level infrastructure before shortlisting"],
    leasingSituations: [
      "manufacturing-support searches where technical infrastructure, access, and supplier geography drive the location decision",
      "users comparing Kato Road with Warm Springs Boulevard, Milmont Drive, and nearby Fremont alternatives",
    ],
    strengths: ["Kato Road manufacturing identity", "hardware and production relevance", "Fremont innovation-industrial comparison value"],
    tradeoffs: ["Production suitability depends on direct validation of power, ventilation, approvals, loading, parking, and suite condition."],
    nearbyAlternatives: ["48810-48818 Kato Rd", "48860 Milmont Dr", "46723 Lakeview Blvd"],
    publicSources: [
      { label: "Rofo Building Profile", url: "/commercial-real-estate/building/CA/fremont/48834-kato-rd/", sourceType: "repository" },
      { label: "Rofo representative building page expansions", url: "_data/representativeBuildingPageExpansions.js", sourceType: "repository" },
    ],
  }),
  evidenceRecord({
    id: "east-bay-warm-springs-innovation-district-48860-milmont-dr",
    title: "48860 Milmont Dr",
    subjectId: "48860-milmont-dr",
    subjectName: "48860 Milmont Dr",
    buildingProfileReference: "/commercial-real-estate/building/CA/fremont/48860-milmont-dr/",
    buildingProfileStatus: "migrated",
    evidenceType: "milmont_drive_manufacturing_flex",
    evidenceTypeLabel: "Milmont Drive Manufacturing / Flex",
    evidenceRole: "milmont_drive_manufacturing_benchmark",
    evidenceRoleLabel: "Milmont Drive Manufacturing Benchmark",
    whyItBelongs:
      "48860 Milmont Dr explains the Milmont Drive side of Warm Springs' manufacturing and R&D/flex identity near the Fremont/Milpitas edge.",
    districtFit:
      "It broadens the collection beyond Kato Road and Warm Springs Boulevard, showing how users compare South Fremont, Milpitas adjacency, and I-880 access.",
    typicalCompanies: ["manufacturing users", "R&D/flex tenants", "technical operations teams", "companies comparing Warm Springs with Milpitas"],
    typicalUsers: ["businesses evaluating Warm Springs for manufacturing/flex space near Fremont and Milpitas supplier or workforce geography"],
    leasingSituations: [
      "manufacturing or R&D/flex searches where Milmont Drive, Kato Road, and South Fremont access all matter",
      "users comparing Warm Springs with Milpitas and Union City for technical operations or production support",
    ],
    strengths: ["Milmont Drive coverage", "Fremont/Milpitas edge context", "manufacturing and R&D/flex relevance"],
    tradeoffs: ["Users must validate technical infrastructure, loading, parking, power, and permitted use before treating the building as operationally suitable."],
    nearbyAlternatives: ["48603 Warm Springs Blvd", "48834 Kato Rd", "Moffett Park"],
    publicSources: [
      { label: "Rofo Building Profile", url: "/commercial-real-estate/building/CA/fremont/48860-milmont-dr/", sourceType: "repository" },
      { label: "Rofo representative building page expansions", url: "_data/representativeBuildingPageExpansions.js", sourceType: "repository" },
    ],
  }),
];

module.exports = {
  collectionId: "warm-springs-innovation-district-commercial-market-evidence",
  schemaVersion: "commercial-market-evidence-v1",
  district,
  neighboringDistrictRelationships,
  records,
  deferredCandidates: [
    {
      id: "warm-springs-innovation-district-business-guides",
      status: "blocked_for_now",
      reason:
        "Business-guide work should wait until recommendation QA and deeper public district guidance confirm which Warm Springs occupier archetypes need separate guide treatment.",
    },
  ],
};
