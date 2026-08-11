const district = {
  metroId: "east-bay",
  metroName: "East Bay",
  cityId: "hayward",
  cityName: "Hayward",
  districtId: "hayward-industrial",
  districtName: "Hayward Industrial",
  districtPath: "/commercial-real-estate/CA/hayward/hayward-industrial/",
  primaryEcosystem: "industrial_flex",
  secondaryEcosystems: [],
  referenceDocument: "docs/commercial-market-evidence-financial-district.md",
};

const neighboringDistrictRelationships = [
  {
    districtId: "union-city-industrial",
    districtName: "Union City Industrial",
    relationship:
      "Union City Industrial is the closest comparison when a user wants similar I-880 warehouse and manufacturing utility with a stronger Tri-City orientation.",
  },
  {
    districtId: "warm-springs-innovation-district",
    districtName: "Warm Springs Innovation District",
    relationship:
      "Warm Springs is the stronger comparison when advanced manufacturing, hardware, R&D support, or Fremont/Silicon Valley adjacency matters more than central East Bay warehouse reach.",
  },
  {
    districtId: "west-berkeley",
    districtName: "West Berkeley",
    relationship:
      "West Berkeley is the stronger comparison when maker identity, small-bay character, Berkeley adjacency, and production-adjacent flex matter more than Hayward's I-880 warehouse utility.",
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
    id: "east-bay-hayward-industrial-21371-cabot-blvd",
    title: "21371 Cabot Blvd",
    subjectId: "21371-cabot-blvd",
    subjectName: "21371 Cabot Blvd",
    buildingProfileReference: "/commercial-real-estate/building/CA/hayward/21371-cabot-blvd/",
    buildingProfileStatus: "migrated",
    evidenceType: "office_flex_industrial_building",
    evidenceTypeLabel: "Office / Flex Industrial Building",
    evidenceRole: "north_hayward_flex_benchmark",
    evidenceRoleLabel: "North Hayward Flex Benchmark",
    whyItBelongs:
      "21371 Cabot Blvd gives Hayward Industrial a north-corridor office/flex example near Winton Avenue, Hesperian Boulevard, and I-880.",
    districtFit:
      "It helps explain that Hayward Industrial is not only large warehouse space; some users compare smaller flex and operations-support buildings with freeway access.",
    typicalCompanies: ["office/flex users", "service businesses", "operations teams", "light industrial businesses"],
    typicalUsers: ["occupiers comparing north Hayward access with San Leandro, Union City, and West Berkeley alternatives"],
    leasingSituations: [
      "companies that need office support, service access, and light operational flexibility in a Hayward search",
      "users testing whether a north Hayward business-center setting is more useful than deeper warehouse or manufacturing space",
    ],
    strengths: ["north Hayward access", "office/flex context", "I-880 corridor comparison value"],
    tradeoffs: ["Users must validate loading, parking, office-to-warehouse balance, permitted use, and actual suite condition before shortlisting."],
    nearbyAlternatives: ["25901 Industrial Blvd", "3151 Diablo Ave", "West Berkeley"],
    publicSources: [
      { label: "Rofo Building Profile", url: "/commercial-real-estate/building/CA/hayward/21371-cabot-blvd/", sourceType: "repository" },
      { label: "Rofo representative building page expansions", url: "_data/representativeBuildingPageExpansions.js", sourceType: "repository" },
    ],
  }),
  evidenceRecord({
    id: "east-bay-hayward-industrial-25901-industrial-blvd",
    title: "25901 Industrial Blvd",
    subjectId: "25901-industrial-blvd",
    subjectName: "25901 Industrial Blvd",
    buildingProfileReference: "/commercial-real-estate/building/CA/hayward/25901-industrial-blvd/",
    buildingProfileStatus: "migrated",
    evidenceType: "warehouse_light_manufacturing_building",
    evidenceTypeLabel: "Warehouse / Light-Manufacturing Building",
    evidenceRole: "industrial_boulevard_warehouse_benchmark",
    evidenceRoleLabel: "Industrial Boulevard Warehouse Benchmark",
    whyItBelongs:
      "25901 Industrial Blvd anchors the Industrial Boulevard side of Hayward Industrial with warehouse and light-manufacturing evidence near Highway 92.",
    districtFit:
      "It supports Hayward's district story as a practical I-880 and Highway 92 industrial location for users that need storage, production support, or distribution reach.",
    typicalCompanies: ["warehouse users", "manufacturing-support businesses", "distribution operators", "service-industrial companies"],
    typicalUsers: ["businesses comparing Hayward's core industrial corridor with Union City, Fremont, and San Leandro"],
    leasingSituations: [
      "warehouse or light-production searches where access to Highway 92 and I-880 shapes the location decision",
      "operators comparing larger Hayward industrial buildings against smaller flex or service-commercial alternatives",
    ],
    strengths: ["Industrial Boulevard identity", "warehouse and light-manufacturing relevance", "Highway 92 and I-880 access context"],
    tradeoffs: ["The profile does not establish current loading, power, clear height, suite condition, or manufacturing compatibility."],
    nearbyAlternatives: ["3832 Bay Center Pl", "3596 Baumberg Ave", "Union City Industrial"],
    publicSources: [
      { label: "Rofo Building Profile", url: "/commercial-real-estate/building/CA/hayward/25901-industrial-blvd/", sourceType: "repository" },
      { label: "Rofo representative building page expansions", url: "_data/representativeBuildingPageExpansions.js", sourceType: "repository" },
    ],
  }),
  evidenceRecord({
    id: "east-bay-hayward-industrial-31350-huntwood-ave",
    title: "31350 Huntwood Ave",
    subjectId: "31350-huntwood-ave",
    subjectName: "31350 Huntwood Ave",
    buildingProfileReference: "/commercial-real-estate/building/CA/hayward/31350-huntwood-ave/",
    buildingProfileStatus: "migrated",
    evidenceType: "south_hayward_industrial_building",
    evidenceTypeLabel: "South Hayward Industrial Building",
    evidenceRole: "union_city_edge_industrial_benchmark",
    evidenceRoleLabel: "Union City-Edge Industrial Benchmark",
    whyItBelongs:
      "31350 Huntwood Ave gives the collection south Hayward evidence near Industrial Parkway and the Hayward/Union City side of the corridor.",
    districtFit:
      "It explains the district's southern edge where users compare Hayward and Union City for warehouse, service, manufacturing, and I-880 operating reach.",
    typicalCompanies: ["warehouse users", "service-industrial operators", "manufacturing-support teams", "regional distribution users"],
    typicalUsers: ["operators deciding whether Hayward or Union City gives the better central East Bay industrial base"],
    leasingSituations: [
      "companies comparing south Hayward and Union City access for warehouse, service, or light-production needs",
      "users validating whether a south-corridor location improves employee, customer, or delivery geography",
    ],
    strengths: ["south Hayward coverage", "Union City comparison value", "warehouse and manufacturing-support relevance"],
    tradeoffs: ["Truck access, loading, parking, outdoor needs, power, and permitted use remain property-level questions."],
    nearbyAlternatives: ["25901 Industrial Blvd", "1550 Pacific St", "Warm Springs Innovation District"],
    publicSources: [
      { label: "Rofo Building Profile", url: "/commercial-real-estate/building/CA/hayward/31350-huntwood-ave/", sourceType: "repository" },
      { label: "Rofo representative building page expansions", url: "_data/representativeBuildingPageExpansions.js", sourceType: "repository" },
    ],
  }),
  evidenceRecord({
    id: "east-bay-hayward-industrial-3151-diablo-ave",
    title: "3151 Diablo Ave",
    subjectId: "3151-diablo-ave",
    subjectName: "3151 Diablo Ave",
    buildingProfileReference: "/commercial-real-estate/building/CA/hayward/3151-diablo-ave/",
    buildingProfileStatus: "migrated",
    evidenceType: "multi_tenant_industrial_park_building",
    evidenceTypeLabel: "Multi-Tenant Industrial Park Building",
    evidenceRole: "diablo_avenue_service_industrial_benchmark",
    evidenceRoleLabel: "Diablo Avenue Service-Industrial Benchmark",
    whyItBelongs:
      "3151 Diablo Ave adds Depot Road and Clawiter Road area evidence for smaller and mid-sized industrial-park users in Hayward.",
    districtFit:
      "It helps users understand the service-industrial and multi-tenant side of Hayward rather than treating the district only as large-format warehouse space.",
    typicalCompanies: ["contractor operations", "service businesses", "light industrial users", "small warehouse users"],
    typicalUsers: ["businesses that need practical industrial-park space with Hayward access and property-level validation"],
    leasingSituations: [
      "service or contractor searches where parking, loading, and work-area layout matter more than public-facing image",
      "users comparing smaller Hayward industrial buildings with West Berkeley or Union City alternatives",
    ],
    strengths: ["service-industrial evidence", "multi-tenant industrial-park context", "Depot Road and Clawiter comparison value"],
    tradeoffs: ["Specific suite layout, service-vehicle rules, loading, and allowed uses cannot be inferred from district fit alone."],
    nearbyAlternatives: ["21371 Cabot Blvd", "3832 Bay Center Pl", "West Berkeley"],
    publicSources: [
      { label: "Rofo Building Profile", url: "/commercial-real-estate/building/CA/hayward/3151-diablo-ave/", sourceType: "repository" },
      { label: "Rofo representative building page expansions", url: "_data/representativeBuildingPageExpansions.js", sourceType: "repository" },
    ],
  }),
  evidenceRecord({
    id: "east-bay-hayward-industrial-3447-investment-blvd",
    title: "3447 Investment Blvd",
    subjectId: "3447-investment-blvd",
    subjectName: "3447 Investment Blvd",
    buildingProfileReference: "/commercial-real-estate/building/CA/hayward/3447-investment-blvd/",
    buildingProfileStatus: "migrated",
    evidenceType: "eden_landing_flex_building",
    evidenceTypeLabel: "Eden Landing Flex Building",
    evidenceRole: "small_flex_service_benchmark",
    evidenceRoleLabel: "Small Flex / Service Benchmark",
    whyItBelongs:
      "3447 Investment Blvd shows the Eden Landing side of Hayward Industrial where smaller flex and service-commercial users compare operational fit.",
    districtFit:
      "It broadens the collection beyond warehouse examples by adding a flex-oriented building near Industrial Boulevard and Highway 92.",
    typicalCompanies: ["flex tenants", "service-industrial businesses", "small operations users", "showroom-adjacent service companies"],
    typicalUsers: ["occupiers comparing smaller Hayward flex buildings with heavier warehouse options"],
    leasingSituations: [
      "small operations or service-commercial searches where flex layout and access matter together",
      "users comparing Eden Landing, Industrial Boulevard, and West Berkeley for practical building fit",
    ],
    strengths: ["Eden Landing coverage", "small flex context", "service-commercial industrial relevance"],
    tradeoffs: ["Flex suitability depends on exact suite configuration, customer access, loading, signage, and permitted use."],
    nearbyAlternatives: ["3596 Baumberg Ave", "25901 Industrial Blvd", "West Berkeley"],
    publicSources: [
      { label: "Rofo Building Profile", url: "/commercial-real-estate/building/CA/hayward/3447-investment-blvd/", sourceType: "repository" },
      { label: "Rofo representative building page expansions", url: "_data/representativeBuildingPageExpansions.js", sourceType: "repository" },
    ],
  }),
  evidenceRecord({
    id: "east-bay-hayward-industrial-3596-baumberg-ave",
    title: "3596 Baumberg Ave",
    subjectId: "3596-baumberg-ave",
    subjectName: "3596 Baumberg Ave",
    buildingProfileReference: "/commercial-real-estate/building/CA/hayward/3596-baumberg-ave/",
    buildingProfileStatus: "migrated",
    evidenceType: "bridge_adjacent_logistics_building",
    evidenceTypeLabel: "Bridge-Adjacent Logistics Building",
    evidenceRole: "baumberg_avenue_logistics_benchmark",
    evidenceRoleLabel: "Baumberg Avenue Logistics Benchmark",
    whyItBelongs:
      "3596 Baumberg Ave explains the San Mateo Bridge-adjacent side of Hayward's industrial market near Highway 92 and Eden Landing.",
    districtFit:
      "It supports Hayward Industrial's role for users that need East Bay industrial space with bridge, I-880, and regional service-distribution access.",
    typicalCompanies: ["logistics users", "warehouse tenants", "service-distribution companies", "regional operators"],
    typicalUsers: ["companies evaluating whether Hayward improves East Bay, Peninsula, and Highway 92 operating reach"],
    leasingSituations: [
      "distribution or service searches where Highway 92 and I-880 access are central to the location decision",
      "operators comparing west Hayward, Union City, and Peninsula-facing industrial alternatives",
    ],
    strengths: ["Highway 92 context", "bridge-adjacent industrial evidence", "warehouse and distribution relevance"],
    tradeoffs: ["Users still need to verify truck circulation, loading, parking, trailer needs, and delivery-hour constraints directly."],
    nearbyAlternatives: ["25901 Industrial Blvd", "3447 Investment Blvd", "Union City Industrial"],
    publicSources: [
      { label: "Rofo Building Profile", url: "/commercial-real-estate/building/CA/hayward/3596-baumberg-ave/", sourceType: "repository" },
      { label: "Rofo representative building page expansions", url: "_data/representativeBuildingPageExpansions.js", sourceType: "repository" },
    ],
  }),
  evidenceRecord({
    id: "east-bay-hayward-industrial-3832-bay-center-pl",
    title: "3832 Bay Center Pl",
    subjectId: "3832-bay-center-pl",
    subjectName: "3832 Bay Center Pl",
    buildingProfileReference: "/commercial-real-estate/building/CA/hayward/3832-bay-center-pl/",
    buildingProfileStatus: "migrated",
    evidenceType: "bay_center_business_park_industrial",
    evidenceTypeLabel: "Bay Center Business-Park Industrial",
    evidenceRole: "business_park_warehouse_flex_benchmark",
    evidenceRoleLabel: "Business-Park Warehouse / Flex Benchmark",
    whyItBelongs:
      "3832 Bay Center Pl gives Hayward Industrial a Bay Center example where warehouse, flex, and business-park industrial patterns overlap.",
    districtFit:
      "It helps explain why users compare Hayward for practical space near Industrial Boulevard, Clawiter Road, Highway 92, and the San Mateo Bridge side of the corridor.",
    typicalCompanies: ["warehouse/flex users", "distribution teams", "operations-support businesses", "service-industrial users"],
    typicalUsers: ["occupiers comparing Hayward with San Leandro, Union City, West Berkeley, and Peninsula-facing industrial options"],
    leasingSituations: [
      "warehouse/flex searches where business-park setting and operating access both matter",
      "teams validating how Bay Center, Industrial Boulevard, and Highway 92 access support service or distribution workflows",
    ],
    strengths: ["Bay Center context", "warehouse/flex evidence", "Highway 92 and San Mateo Bridge comparison value"],
    tradeoffs: ["Warehouse/flex fit must be validated through actual loading, clear height, parking, office ratio, suite condition, and permitted use."],
    nearbyAlternatives: ["3151 Diablo Ave", "25901 Industrial Blvd", "Union City Industrial"],
    publicSources: [
      { label: "Rofo Building Profile", url: "/commercial-real-estate/building/CA/hayward/3832-bay-center-pl/", sourceType: "repository" },
      { label: "Rofo representative building page expansions", url: "_data/representativeBuildingPageExpansions.js", sourceType: "repository" },
    ],
  }),
];

module.exports = {
  collectionId: "hayward-industrial-commercial-market-evidence",
  schemaVersion: "commercial-market-evidence-v1",
  district,
  neighboringDistrictRelationships,
  records,
  deferredCandidates: [
    {
      id: "hayward-industrial-business-guides",
      label: "Hayward Industrial business guides",
      status: "blocked_for_now",
      reason:
        "The collection and selected Building Profiles support district evidence, but public business-type guides still require deeper business-specific recommendation coverage.",
      prerequisite:
        "Add business-type-specific recommendation evidence and guide readiness before public guide expansion.",
    },
  ],
};
