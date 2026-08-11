const district = {
  metroId: "east-bay",
  metroName: "East Bay",
  cityId: "union-city",
  cityName: "Union City",
  districtId: "union-city-industrial",
  districtName: "Union City Industrial",
  districtPath: "/commercial-real-estate/CA/union-city/union-city-industrial/",
  primaryEcosystem: "industrial_flex",
  secondaryEcosystems: [],
  referenceDocument: "docs/commercial-market-evidence-financial-district.md",
};

const neighboringDistrictRelationships = [
  {
    districtId: "hayward-industrial",
    districtName: "Hayward Industrial",
    relationship:
      "Hayward Industrial is the stronger comparison when a user wants a deeper central East Bay warehouse and service-industrial base with broader mid-Bay reach.",
  },
  {
    districtId: "warm-springs-innovation-district",
    districtName: "Warm Springs Innovation District",
    relationship:
      "Warm Springs is the stronger comparison when advanced manufacturing, hardware, R&D support, or Fremont technology adjacency matters more than general warehouse and flex utility.",
  },
  {
    districtId: "west-berkeley",
    districtName: "West Berkeley",
    relationship:
      "West Berkeley is the stronger comparison when maker identity, smaller industrial/flex buildings, and Berkeley adjacency matter more than Tri-City I-880 industrial access.",
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
    id: "east-bay-union-city-industrial-30100-30150-ahern-st",
    title: "30100-30150 Ahern St",
    subjectId: "30100-30150-ahern-st",
    subjectName: "30100-30150 Ahern St",
    buildingProfileReference: "/commercial-real-estate/building/CA/union-city/30100-30150-ahern-st/",
    buildingProfileStatus: "migrated",
    evidenceType: "warehouse_light_manufacturing_building",
    evidenceTypeLabel: "Warehouse / Light-Manufacturing Building",
    evidenceRole: "ahern_street_industrial_benchmark",
    evidenceRoleLabel: "Ahern Street Industrial Benchmark",
    whyItBelongs:
      "30100-30150 Ahern St gives Union City Industrial an Ahern Street warehouse and manufacturing-support example near Whipple Road and I-880.",
    districtFit:
      "It helps explain the district as a compact Tri-City industrial market for users that need practical storage, production support, and regional access.",
    typicalCompanies: ["warehouse users", "light manufacturers", "service-industrial businesses", "regional distribution users"],
    typicalUsers: ["occupiers comparing Union City with Hayward, Fremont, and Warm Springs for industrial utility"],
    leasingSituations: [
      "warehouse or light-manufacturing searches where I-880 access and Tri-City reach shape the location decision",
      "operators comparing Union City building format against deeper Hayward warehouse or more technical Fremont options",
    ],
    strengths: ["Ahern Street coverage", "warehouse and light-manufacturing relevance", "Tri-City I-880 comparison value"],
    tradeoffs: ["Users must validate loading, truck circulation, power, parking, permitted use, and actual suite condition before shortlisting."],
    nearbyAlternatives: ["30300 Whipple Rd", "1550 Pacific St", "Hayward Industrial"],
    publicSources: [
      { label: "Rofo Building Profile", url: "/commercial-real-estate/building/CA/union-city/30100-30150-ahern-st/", sourceType: "repository" },
      { label: "Rofo representative building page expansions", url: "_data/representativeBuildingPageExpansions.js", sourceType: "repository" },
    ],
  }),
  evidenceRecord({
    id: "east-bay-union-city-industrial-30300-whipple-rd",
    title: "30300 Whipple Rd",
    subjectId: "30300-whipple-rd",
    subjectName: "30300 Whipple Rd",
    buildingProfileReference: "/commercial-real-estate/building/CA/union-city/30300-whipple-rd/",
    buildingProfileStatus: "migrated",
    evidenceType: "i880_warehouse_distribution_building",
    evidenceTypeLabel: "I-880 Warehouse / Distribution Building",
    evidenceRole: "whipple_road_warehouse_benchmark",
    evidenceRoleLabel: "Whipple Road Warehouse Benchmark",
    whyItBelongs:
      "30300 Whipple Rd anchors the Whipple Road side of Union City Industrial for warehouse and distribution users near I-880.",
    districtFit:
      "It supports the district story that Union City works for companies comparing Hayward, Fremont, and Peninsula-facing access without needing a larger metro warehouse node.",
    typicalCompanies: ["warehouse users", "distribution businesses", "service operators", "manufacturing-support teams"],
    typicalUsers: ["businesses evaluating Union City for compact I-880 warehouse and operating access"],
    leasingSituations: [
      "distribution or storage searches where Whipple Road and I-880 access are central to the decision",
      "teams comparing Union City with Hayward Industrial and Warm Springs for the right balance of warehouse utility and regional reach",
    ],
    strengths: ["Whipple Road context", "warehouse and distribution evidence", "I-880 access relevance"],
    tradeoffs: ["The profile does not establish current loading, clear height, trailer movement, parking, or availability."],
    nearbyAlternatives: ["30336 Whipple Rd", "30100-30150 Ahern St", "Hayward Industrial"],
    publicSources: [
      { label: "Rofo Building Profile", url: "/commercial-real-estate/building/CA/union-city/30300-whipple-rd/", sourceType: "repository" },
      { label: "Rofo representative building page expansions", url: "_data/representativeBuildingPageExpansions.js", sourceType: "repository" },
    ],
  }),
  evidenceRecord({
    id: "east-bay-union-city-industrial-30336-whipple-rd",
    title: "30336 Whipple Rd",
    subjectId: "30336-whipple-rd",
    subjectName: "30336 Whipple Rd",
    buildingProfileReference: "/commercial-real-estate/building/CA/union-city/30336-whipple-rd/",
    buildingProfileStatus: "migrated",
    evidenceType: "whipple_road_industrial_flex_building",
    evidenceTypeLabel: "Whipple Road Industrial / Flex Building",
    evidenceRole: "whipple_road_flex_depth",
    evidenceRoleLabel: "Whipple Road Flex Depth",
    whyItBelongs:
      "30336 Whipple Rd adds a second Whipple Road example so Union City Industrial is not represented by only one warehouse building.",
    districtFit:
      "It strengthens the collection's Whipple Road cluster evidence and helps users compare multiple nearby Union City industrial/flex formats.",
    typicalCompanies: ["industrial/flex users", "service businesses", "warehouse operators", "light production teams"],
    typicalUsers: ["occupiers that want Union City access but need to compare exact building format and operating fit"],
    leasingSituations: [
      "users comparing adjacent Whipple Road buildings for access, layout, loading, and parking differences",
      "service or light-production searches where Union City utility is attractive but building-level validation matters",
    ],
    strengths: ["Whipple Road cluster depth", "industrial/flex comparison value", "Union City operating context"],
    tradeoffs: ["Similar location context does not mean similar suite condition, loading, parking, or permitted-use fit."],
    nearbyAlternatives: ["30300 Whipple Rd", "4001 Whipple Rd", "Warm Springs Innovation District"],
    publicSources: [
      { label: "Rofo Building Profile", url: "/commercial-real-estate/building/CA/union-city/30336-whipple-rd/", sourceType: "repository" },
      { label: "Rofo representative building page expansions", url: "_data/representativeBuildingPageExpansions.js", sourceType: "repository" },
    ],
  }),
  evidenceRecord({
    id: "east-bay-union-city-industrial-32900-alvarado-niles-rd",
    title: "32900 Alvarado Niles Rd",
    subjectId: "32900-alvarado-niles-rd",
    subjectName: "32900 Alvarado Niles Rd",
    buildingProfileReference: "/commercial-real-estate/building/CA/union-city/32900-alvarado-niles-rd/",
    buildingProfileStatus: "migrated",
    evidenceType: "alvarado_niles_industrial_building",
    evidenceTypeLabel: "Alvarado Niles Industrial Building",
    evidenceRole: "alvarado_niles_industrial_benchmark",
    evidenceRoleLabel: "Alvarado Niles Industrial Benchmark",
    whyItBelongs:
      "32900 Alvarado Niles Rd explains Union City's Alvarado Niles industrial pattern near Central Avenue, Union City Boulevard, and I-880.",
    districtFit:
      "It broadens the collection beyond Whipple Road and shows how Union City's industrial identity extends across nearby corridor and business-park locations.",
    typicalCompanies: ["warehouse users", "service-industrial operators", "light manufacturers", "regional businesses"],
    typicalUsers: ["companies comparing Union City Boulevard, Alvarado Niles Road, and Hayward/Fremont industrial alternatives"],
    leasingSituations: [
      "industrial searches where Alvarado Niles access is useful for customer, supplier, or employee geography",
      "users comparing corridor-adjacent Union City buildings with Whipple Road or Warm Springs alternatives",
    ],
    strengths: ["Alvarado Niles coverage", "corridor comparison value", "warehouse and service-industrial relevance"],
    tradeoffs: ["Users still need property-specific validation for loading, parking, truck movement, power, and office/warehouse split."],
    nearbyAlternatives: ["33288 Central Ave", "33333 Western Ave", "Hayward Industrial"],
    publicSources: [
      { label: "Rofo Building Profile", url: "/commercial-real-estate/building/CA/union-city/32900-alvarado-niles-rd/", sourceType: "repository" },
      { label: "Rofo representative building page expansions", url: "_data/representativeBuildingPageExpansions.js", sourceType: "repository" },
    ],
  }),
  evidenceRecord({
    id: "east-bay-union-city-industrial-33288-central-ave",
    title: "33288 Central Ave",
    subjectId: "33288-central-ave",
    subjectName: "33288 Central Ave",
    buildingProfileReference: "/commercial-real-estate/building/CA/union-city/33288-central-ave/",
    buildingProfileStatus: "migrated",
    evidenceType: "central_avenue_service_industrial_building",
    evidenceTypeLabel: "Central Avenue Service-Industrial Building",
    evidenceRole: "central_avenue_service_industrial_benchmark",
    evidenceRoleLabel: "Central Avenue Service-Industrial Benchmark",
    whyItBelongs:
      "33288 Central Ave adds Central Avenue and Western Avenue evidence for service-industrial users in Union City Industrial.",
    districtFit:
      "It helps explain the smaller service and operations side of the district, where users compare building utility rather than only large warehouse capacity.",
    typicalCompanies: ["service businesses", "contractor operations", "small warehouse users", "light production teams"],
    typicalUsers: ["operators that need Union City industrial access with practical service-vehicle and work-area validation"],
    leasingSituations: [
      "service or contractor searches where parking, loading, and work-area layout are central questions",
      "users comparing Central Avenue, Western Avenue, and Whipple Road industrial formats",
    ],
    strengths: ["Central Avenue coverage", "service-industrial context", "small and mid-sized operator relevance"],
    tradeoffs: ["Service fit depends on exact parking, loading, signage, vehicle rules, permitted use, and suite condition."],
    nearbyAlternatives: ["33333 Western Ave", "32900 Alvarado Niles Rd", "West Berkeley"],
    publicSources: [
      { label: "Rofo Building Profile", url: "/commercial-real-estate/building/CA/union-city/33288-central-ave/", sourceType: "repository" },
      { label: "Rofo representative building page expansions", url: "_data/representativeBuildingPageExpansions.js", sourceType: "repository" },
    ],
  }),
  evidenceRecord({
    id: "east-bay-union-city-industrial-33333-western-ave",
    title: "33333 Western Ave",
    subjectId: "33333-western-ave",
    subjectName: "33333 Western Ave",
    buildingProfileReference: "/commercial-real-estate/building/CA/union-city/33333-western-ave/",
    buildingProfileStatus: "migrated",
    evidenceType: "western_avenue_industrial_building",
    evidenceTypeLabel: "Western Avenue Industrial Building",
    evidenceRole: "western_avenue_operating_benchmark",
    evidenceRoleLabel: "Western Avenue Operating Benchmark",
    whyItBelongs:
      "33333 Western Ave supports the central Union City industrial story with a Western Avenue example tied to I-880 and Alvarado Niles access.",
    districtFit:
      "It gives the collection another central industrial reference so users can understand Union City as a cluster of practical operating buildings rather than a single corridor.",
    typicalCompanies: ["warehouse users", "service businesses", "light industrial operators", "distribution-support teams"],
    typicalUsers: ["businesses evaluating central Union City for practical I-880 industrial utility"],
    leasingSituations: [
      "operators comparing central Union City buildings for loading, parking, storage, and service movement",
      "teams deciding whether Union City, Hayward, or Fremont creates the best daily operating geography",
    ],
    strengths: ["Western Avenue coverage", "central Union City industrial context", "I-880 and Alvarado Niles access value"],
    tradeoffs: ["The collection does not establish current space condition, lease terms, tenant fit, or specialized infrastructure."],
    nearbyAlternatives: ["33288 Central Ave", "32900 Alvarado Niles Rd", "Warm Springs Innovation District"],
    publicSources: [
      { label: "Rofo Building Profile", url: "/commercial-real-estate/building/CA/union-city/33333-western-ave/", sourceType: "repository" },
      { label: "Rofo representative building page expansions", url: "_data/representativeBuildingPageExpansions.js", sourceType: "repository" },
    ],
  }),
  evidenceRecord({
    id: "east-bay-union-city-industrial-4001-whipple-rd",
    title: "4001 Whipple Rd",
    subjectId: "4001-whipple-rd",
    subjectName: "4001 Whipple Rd",
    buildingProfileReference: "/commercial-real-estate/building/CA/union-city/4001-whipple-rd/",
    buildingProfileStatus: "migrated",
    evidenceType: "union_city_fremont_edge_industrial",
    evidenceTypeLabel: "Union City / Fremont-Edge Industrial",
    evidenceRole: "south_whipple_corridor_benchmark",
    evidenceRoleLabel: "South Whipple Corridor Benchmark",
    whyItBelongs:
      "4001 Whipple Rd explains the Union City/Fremont edge of the industrial corridor for users comparing I-880 reach across both cities.",
    districtFit:
      "It completes the collection's south-corridor context by showing why some users compare Union City with Fremont and Warm Springs for operational access.",
    typicalCompanies: ["warehouse users", "manufacturing-support teams", "service-industrial businesses", "regional operators"],
    typicalUsers: ["occupiers comparing Union City Industrial with Fremont and Warm Springs alternatives"],
    leasingSituations: [
      "industrial searches where the Union City/Fremont edge changes employee, supplier, or customer geography",
      "users comparing Whipple Road and Warm Springs when warehouse utility and manufacturing adjacency both matter",
    ],
    strengths: ["Union City/Fremont edge context", "south Whipple Road coverage", "I-880 industrial comparison value"],
    tradeoffs: ["Operational fit remains dependent on exact loading, parking, power, clear height, suite layout, and permitted use."],
    nearbyAlternatives: ["30336 Whipple Rd", "45101-45169 Industrial Dr", "Hayward Industrial"],
    publicSources: [
      { label: "Rofo Building Profile", url: "/commercial-real-estate/building/CA/union-city/4001-whipple-rd/", sourceType: "repository" },
      { label: "Rofo representative building page expansions", url: "_data/representativeBuildingPageExpansions.js", sourceType: "repository" },
    ],
  }),
];

module.exports = {
  collectionId: "union-city-industrial-commercial-market-evidence",
  schemaVersion: "commercial-market-evidence-v1",
  district,
  neighboringDistrictRelationships,
  records,
  deferredCandidates: [
    {
      id: "union-city-industrial-business-guides",
      label: "Union City Industrial business guides",
      status: "blocked_for_now",
      reason:
        "The collection and selected Building Profiles support district evidence, but public business-type guides still require deeper business-specific recommendation coverage.",
      prerequisite:
        "Add business-type-specific recommendation evidence and guide readiness before public guide expansion.",
    },
  ],
};
