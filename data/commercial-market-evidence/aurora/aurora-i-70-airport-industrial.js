const district = {
  metroId: "denver",
  metroName: "Denver",
  cityId: "aurora",
  cityName: "Aurora",
  districtId: "aurora-i-70-airport-industrial",
  districtName: "Aurora I-70 / Airport Industrial",
  districtPath: "/commercial-real-estate/CO/aurora/aurora-i-70-airport-industrial/",
  primaryEcosystem: "industrial_flex",
  secondaryEcosystems: ["medical"],
  referenceDocument: "docs/commercial-market-evidence.md",
};

const neighboringDistrictRelationships = [
  {
    districtId: "northeast-denver-industrial",
    districtName: "Northeast Denver Industrial",
    relationship:
      "Northeast Denver Industrial is the stronger comparison when Denver-side I-70 access, larger warehouse utility, and more established service-industrial evidence matter more than Aurora-specific geography.",
  },
  {
    districtId: "commerce-city",
    districtName: "Commerce City",
    relationship:
      "Commerce City is the stronger comparison when north/east industrial, manufacturing, yard, or heavier operational context matters more than Aurora office/flex adjacency.",
  },
];

function evidenceRecord(fields) {
  return {
    district,
    neighboringDistrictRelationships,
    reviewStatus: "approved_reference",
    ...fields,
  };
}

const records = [
  evidenceRecord({
    id: "aurora-i70-airport-3250-abilene",
    title: "3250 Abilene St",
    subjectType: "building",
    subjectId: "3250-abilene-st",
    subjectName: "3250 Abilene St",
    buildingProfileReference: "/commercial-real-estate/building/CO/aurora/3250-abilene-st/",
    buildingProfileStatus: "migrated",
    evidenceType: "aurora_industrial_building",
    evidenceTypeLabel: "Aurora Industrial Building",
    evidenceRole: "large_format_industrial_benchmark",
    evidenceRoleLabel: "Large-Format Industrial Benchmark",
    confidence: "editorially_supported",
    whyItBelongs:
      "3250 Abilene St gives Aurora a concrete industrial Building Profile for comparing larger-format operational needs against office, medical, and retail-heavy Aurora context.",
    districtFit:
      "It supports Aurora's airport and east-metro industrial foundation while preserving the need to compare heavier requirements against Northeast Denver Industrial and Commerce City.",
    typicalCompanies: ["warehouse users", "distribution users", "service-industrial companies", "operations teams"],
    typicalUsers: [
      "occupiers evaluating whether Aurora can support warehouse, storage, receiving, shipping, or industrial service operations",
    ],
    leasingSituations: [
      "companies comparing Aurora with Denver-side I-70 warehouse alternatives",
      "businesses that need to validate loading, truck movement, parking, and exact industrial suitability before touring",
    ],
    strengths: [
      "existing Aurora industrial Building Profile",
      "large-format operational evidence",
      "useful comparison against office and medical Aurora nodes",
      "supports east-metro warehouse / industrial foundation work",
    ],
    tradeoffs: [
      "The profile supports representative evidence only; current availability, loading, clear height, and trailer movement must be validated directly.",
    ],
    nearbyAlternatives: ["1300-1390 S Potomac St", "17100-17210 E Ohio Dr", "Northeast Denver Industrial", "Commerce City"],
    publicSources: [
      {
        label: "Rofo Building Profile",
        url: "/commercial-real-estate/building/CO/aurora/3250-abilene-st/",
        sourceType: "repository",
      },
      {
        label: "Aurora Economic Development Council",
        url: "https://www.auroraedc.com/",
        sourceType: "economic_development",
      },
    ],
  }),
  evidenceRecord({
    id: "aurora-i70-airport-1300-potomac",
    title: "1300-1390 S Potomac St",
    subjectType: "building",
    subjectId: "1300-1390-s-potomac-st",
    subjectName: "1300-1390 S Potomac St",
    buildingProfileReference: "/commercial-real-estate/building/CO/aurora/1300-1390-s-potomac-st/",
    buildingProfileStatus: "migrated",
    evidenceType: "aurora_industrial_building",
    evidenceTypeLabel: "Aurora Industrial Building",
    evidenceRole: "service_industrial_benchmark",
    evidenceRoleLabel: "Service Industrial Benchmark",
    confidence: "editorially_supported",
    whyItBelongs:
      "1300-1390 S Potomac St adds a second Aurora industrial reference for service, storage, and operational users that need a more local Aurora geography.",
    districtFit:
      "It broadens the district evidence beyond one large-format example and helps separate Aurora service-industrial fit from pure office or medical-office demand.",
    typicalCompanies: ["service businesses", "warehouse users", "contractor operations", "local distribution users"],
    typicalUsers: [
      "businesses that need practical office/warehouse or industrial-service utility in Aurora rather than a downtown Denver or DTC office setting",
    ],
    leasingSituations: [
      "service-industrial users validating whether Aurora solves customer, employee, and operating geography",
      "warehouse users comparing local Aurora access with larger Denver industrial corridors",
    ],
    strengths: [
      "Aurora industrial Building Profile depth",
      "service-industrial context",
      "local operating geography",
      "useful alternative to Denver-side industrial districts",
    ],
    tradeoffs: [
      "Exact suite configuration, loading, parking, use permissions, and current availability are not implied by representative evidence.",
    ],
    nearbyAlternatives: ["3250 Abilene St", "17100-17210 E Ohio Dr", "Northeast Denver Industrial", "Commerce City"],
    publicSources: [
      {
        label: "Rofo Building Profile",
        url: "/commercial-real-estate/building/CO/aurora/1300-1390-s-potomac-st/",
        sourceType: "repository",
      },
      {
        label: "City of Aurora Economic Development",
        url: "https://www.auroragov.org/business_services/economic_development",
        sourceType: "official_government",
      },
    ],
  }),
  evidenceRecord({
    id: "aurora-i70-airport-17100-ohio",
    title: "17100-17210 E Ohio Dr",
    subjectType: "building",
    subjectId: "17100-17210-e-ohio-dr",
    subjectName: "17100-17210 E Ohio Dr",
    buildingProfileReference: "/commercial-real-estate/building/CO/aurora/17100-17210-e-ohio-dr/",
    buildingProfileStatus: "migrated",
    evidenceType: "aurora_industrial_building",
    evidenceTypeLabel: "Aurora Industrial Building",
    evidenceRole: "small_mid_format_industrial_benchmark",
    evidenceRoleLabel: "Small / Mid-Format Industrial Benchmark",
    confidence: "editorially_supported",
    whyItBelongs:
      "17100-17210 E Ohio Dr gives Aurora a smaller-format industrial reference so the foundation is not defined only by larger industrial footprints.",
    districtFit:
      "It helps explain why Aurora may work for local warehouse, service, or flex operations that need east-metro access but not a full regional distribution building.",
    typicalCompanies: ["small warehouse users", "service businesses", "office/warehouse users", "local operations teams"],
    typicalUsers: [
      "occupiers comparing smaller industrial or office/warehouse settings within Aurora's east-metro geography",
    ],
    leasingSituations: [
      "smaller operations validating whether Aurora provides enough industrial utility",
      "businesses comparing Aurora industrial space against office-heavy or medical-heavy Aurora alternatives",
    ],
    strengths: [
      "small and mid-format industrial evidence",
      "office/warehouse comparison value",
      "Aurora local operating context",
      "useful balance against larger industrial examples",
    ],
    tradeoffs: [
      "Smaller industrial buildings may not support the loading, yard, power, or trailer requirements of heavier warehouse users.",
    ],
    nearbyAlternatives: ["3250 Abilene St", "1300-1390 S Potomac St", "452 Sable Blvd", "Northeast Denver Industrial"],
    publicSources: [
      {
        label: "Rofo Building Profile",
        url: "/commercial-real-estate/building/CO/aurora/17100-17210-e-ohio-dr/",
        sourceType: "repository",
      },
      {
        label: "Denver-area industrial comparison graph",
        url: "_data/locationKnowledgeGraph.js",
        sourceType: "repository",
      },
    ],
  }),
];

module.exports = {
  collectionId: "aurora-i-70-airport-industrial-commercial-market-evidence",
  schemaVersion: "commercial-market-evidence-v1",
  district,
  neighboringDistrictRelationships,
  records,
  deferredCandidates: [
    {
      id: "aurora-industrial-business-guides",
      label: "Aurora warehouse / industrial business guides",
      status: "blocked_for_now",
      reason:
        "Aurora now has industrial foundation evidence, but public business guides still need broader district comparison and editorial recommendation coverage.",
      prerequisite:
        "Complete deeper Aurora district evidence and compare it against Northeast Denver Industrial, Commerce City, and airport-corridor alternatives.",
    },
  ],
};
