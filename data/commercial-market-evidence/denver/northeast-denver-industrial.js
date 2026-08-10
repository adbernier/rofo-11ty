const district = {
  metroId: "denver",
  metroName: "Denver",
  cityId: "denver",
  cityName: "Denver",
  districtId: "northeast-denver-industrial",
  districtName: "Northeast Denver Industrial",
  districtPath: "/commercial-real-estate/CO/denver/northeast-denver-industrial/",
  primaryEcosystem: "industrial_flex",
  secondaryEcosystems: ["warehouse", "distribution", "manufacturing"],
  referenceDocument: "docs/commercial-market-evidence.md",
};

const neighboringDistrictRelationships = [
  {
    districtId: "commerce-city",
    districtName: "Commerce City",
    relationship:
      "Commerce City is the stronger comparison when broader north/east industrial, manufacturing, yard, or heavier operational context matters more than Denver-side I-70 access.",
  },
  {
    districtId: "denver-airport-pena-boulevard-corridor",
    districtName: "Denver Airport / Pena Boulevard Corridor",
    relationship:
      "Denver Airport / Pena Boulevard Corridor is the stronger comparison when airport-specific logistics, Pena Boulevard movement, or aviation-support geography matters more than central Northeast Denver industrial access.",
  },
  {
    districtId: "aurora",
    districtName: "Aurora",
    relationship:
      "Aurora is the broader east-metro comparison when local Aurora customer, employee, office, medical, or mixed service geography matters more than Denver-side industrial corridor depth.",
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
    id: "den-northeast-industrial-10500-10600-e-54th-ave",
    title: "10500-10600 E. 54th Ave",
    subjectId: "10500-10600-e-54th-ave",
    subjectName: "10500-10600 E. 54th Ave",
    buildingProfileReference: "/commercial-real-estate/building/CO/denver/10500-10600-e-54th-ave/",
    buildingProfileStatus: "migrated",
    evidenceType: "warehouse_distribution_environment",
    evidenceTypeLabel: "Warehouse / Distribution Environment",
    evidenceRole: "warehouse_industrial_depth",
    evidenceRoleLabel: "Warehouse / Industrial Depth",
    confidence: "editorially_supported",
    whyItBelongs:
      "10500-10600 E. 54th Ave gives Northeast Denver Industrial a warehouse and distribution benchmark for users evaluating storage, receiving, shipping, and I-70 access.",
    districtFit:
      "It explains the district's warehouse-oriented middle ground between larger-format distribution examples and smaller service-industrial or contractor-oriented spaces.",
    typicalCompanies: ["warehouse users", "distributors", "wholesalers", "e-commerce fulfillment users"],
    typicalUsers: [
      "occupiers comparing Denver-side I-70 warehouse environments where loading, storage, truck access, and regional movement shape fit",
    ],
    leasingSituations: [
      "warehouse or distribution users validating whether Northeast Denver's industrial corridor fits their route, labor, and inventory needs",
      "businesses comparing storage and shipping requirements against smaller service-industrial or airport-specific alternatives",
    ],
    strengths: [
      "warehouse and distribution evidence",
      "Denver-side I-70 industrial context",
      "clear contrast against smaller service-industrial examples",
      "useful comparison against airport/Pena and Commerce City alternatives",
    ],
    tradeoffs: [
      "Representative warehouse evidence does not establish current availability, clear height, loading configuration, parking, trailer movement, or suite-level fit.",
    ],
    nearbyAlternatives: ["10445 E 49th Ave", "11551 E 49th Ave", "10515-10525 E 40th Ave", "Denver Airport / Pena Boulevard Corridor"],
    publicSources: [
      {
        label: "Rofo Building Profile",
        url: "/commercial-real-estate/building/CO/denver/10500-10600-e-54th-ave/",
        sourceType: "repository",
      },
      {
        label: "Rofo Northeast Denver Industrial representative-building records",
        url: "_data/locationKnowledgeGraph.js",
        sourceType: "repository",
      },
    ],
  }),
  evidenceRecord({
    id: "den-northeast-industrial-11551-e-49th-ave",
    title: "11551 E 49th Ave",
    subjectId: "11551-e-49th-ave",
    subjectName: "11551 E 49th Ave",
    buildingProfileReference: "/commercial-real-estate/building/CO/denver/11551-e-49th-ave/",
    buildingProfileStatus: "migrated",
    evidenceType: "light_manufacturing_environment",
    evidenceTypeLabel: "Light Manufacturing Environment",
    evidenceRole: "production_oriented_industrial_benchmark",
    evidenceRoleLabel: "Production-Oriented Industrial Benchmark",
    confidence: "editorially_supported",
    whyItBelongs:
      "11551 E 49th Ave adds production-oriented industrial evidence to Northeast Denver Industrial so the district is not explained only through storage or distribution.",
    districtFit:
      "It supports the district's light manufacturing and industrial-service fit while keeping power, ventilation, loading, code, and permitted-use validation explicit.",
    typicalCompanies: ["light manufacturers", "production-support businesses", "specialty fabrication users", "industrial service companies"],
    typicalUsers: [
      "occupiers comparing Northeast Denver Industrial for assembly, light manufacturing, receiving, shipping, and production-support requirements",
    ],
    leasingSituations: [
      "production-oriented users testing whether Northeast Denver offers enough industrial utility before comparing Commerce City or other heavier industrial alternatives",
      "businesses validating whether building systems, permitted use, and loading can support a specific production process",
    ],
    strengths: [
      "light manufacturing evidence",
      "production-support comparison value",
      "industrial utility beyond pure warehouse use",
      "clear validation focus for specialized users",
    ],
    tradeoffs: [
      "Production-oriented fit depends on property-level power, ventilation, code, use approval, loading, and hazardous-material constraints that Rofo does not infer from district identity.",
    ],
    nearbyAlternatives: ["10500-10600 E. 54th Ave", "10445 E 49th Ave", "10515-10525 E 40th Ave", "Commerce City"],
    publicSources: [
      {
        label: "Rofo Building Profile",
        url: "/commercial-real-estate/building/CO/denver/11551-e-49th-ave/",
        sourceType: "repository",
      },
      {
        label: "Rofo Northeast Denver Industrial representative-building records",
        url: "_data/locationKnowledgeGraph.js",
        sourceType: "repository",
      },
    ],
  }),
];

module.exports = {
  collectionId: "northeast-denver-industrial-commercial-market-evidence",
  schemaVersion: "commercial-market-evidence-v1",
  district,
  neighboringDistrictRelationships,
  records,
  deferredCandidates: [
    {
      id: "northeast-denver-industrial-business-guides",
      label: "Northeast Denver Industrial business guides",
      status: "blocked_for_now",
      reason:
        "Northeast Denver Industrial now has selected warehouse and production evidence, but public business guides should wait for broader industrial comparison coverage and guide-specific editorial scope.",
      prerequisite:
        "Complete deeper Denver industrial comparison evidence across Commerce City, Denver Airport / Pena Boulevard Corridor, Aurora, and supporting service-industrial formats or approve a focused business-guide packet.",
    },
  ],
};
