const district = {
  metroId: "denver",
  metroName: "Denver",
  cityId: "denver",
  cityName: "Denver",
  districtId: "downtown-denver",
  districtName: "Downtown Denver",
  districtPath: "/commercial-real-estate/CO/denver/downtown-denver/",
  primaryEcosystem: "office",
  secondaryEcosystems: ["retail", "hospitality"],
  referenceDocument: "docs/commercial-market-evidence-financial-district.md",
};

const neighboringDistrictRelationships = [
  {
    districtId: "lodo",
    districtName: "LoDo",
    relationship:
      "LoDo is the stronger comparison when historic mixed-use texture, hospitality adjacency, and a less formal downtown-edge office environment matter more than central civic or tower-core identity.",
  },
  {
    districtId: "cherry-creek",
    districtName: "Cherry Creek",
    relationship:
      "Cherry Creek is the stronger comparison when boutique client-facing identity, retail adjacency, and customer arrival experience matter more than a central downtown office address.",
  },
  {
    districtId: "denver-tech-center",
    districtName: "Denver Tech Center",
    relationship:
      "Denver Tech Center is the stronger comparison when southeast metro commute patterns, parking, suburban office scale, or regional headquarters convenience outweigh downtown access.",
  },
  {
    districtId: "rino",
    districtName: "RiNo",
    relationship:
      "RiNo is the stronger comparison when creative, adaptive, production-adjacent, or startup-oriented district character matters more than formal professional-service context.",
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
    id: "den-downtown-denver-1200-17th-st",
    title: "1200 17th St",
    subjectId: "1200-17th-st",
    subjectName: "1200 17th St",
    buildingProfileReference: "/commercial-real-estate/building/CO/denver/1200-17th-st/",
    buildingProfileStatus: "migrated",
    evidenceType: "downtown_class_a_office",
    evidenceTypeLabel: "Downtown Class A Office",
    evidenceRole: "formal_professional_office_benchmark",
    evidenceRoleLabel: "Formal Professional Office Benchmark",
    confidence: "editorially_supported",
    whyItBelongs:
      "1200 17th St gives Downtown Denver a clear central-office benchmark for legal, finance, consulting, and regional professional-service users.",
    districtFit:
      "It explains why some businesses choose downtown for civic access, client meetings, transit, and address identity rather than parking-oriented suburban convenience.",
    typicalCompanies: ["law firms", "finance firms", "consulting firms", "regional professional offices"],
    typicalUsers: [
      "professional-service teams that need central Denver identity, client access, and a formal office setting",
    ],
    leasingSituations: [
      "companies comparing Downtown Denver with Cherry Creek or Denver Tech Center for client-facing office use",
      "regional office searches where central identity and civic access matter more than suburban parking convenience",
    ],
    strengths: [
      "formal downtown office identity",
      "professional-service fit",
      "central civic and transit context",
      "clear comparison value against suburban office nodes",
    ],
    tradeoffs: [
      "Parking, arrival experience, and commute friction need earlier validation than in southeast suburban office alternatives.",
    ],
    nearbyAlternatives: ["1600 Broadway", "1700 Lincoln St", "Denver Place", "Cherry Creek office alternatives"],
    publicSources: [
      {
        label: "Rofo Building Profile",
        url: "/commercial-real-estate/building/CO/denver/1200-17th-st/",
        sourceType: "repository",
      },
      {
        label: "Rofo Downtown Denver representative-building records",
        url: "_data/locationKnowledgeGraph.js",
        sourceType: "repository",
      },
    ],
  }),
  evidenceRecord({
    id: "den-downtown-denver-1600-broadway",
    title: "1600 Broadway",
    subjectId: "1600-broadway",
    subjectName: "1600 Broadway",
    buildingProfileReference: "/commercial-real-estate/building/CO/denver/1600-broadway/",
    buildingProfileStatus: "migrated",
    evidenceType: "government_adjacent_office",
    evidenceTypeLabel: "Government-Adjacent Office",
    evidenceRole: "civic_access_benchmark",
    evidenceRoleLabel: "Civic Access Benchmark",
    confidence: "editorially_supported",
    whyItBelongs:
      "1600 Broadway represents the Broadway and Lincoln office context where civic, government-adjacent, and institutional access can shape downtown fit.",
    districtFit:
      "It broadens the district beyond finance and law by showing why public-sector adjacency, visitor access, and central administrative context matter for some users.",
    typicalCompanies: ["government-adjacent firms", "policy organizations", "consulting firms", "administrative offices"],
    typicalUsers: [
      "teams that regularly coordinate with civic institutions, public agencies, professional-service partners, or downtown administrative users",
    ],
    leasingSituations: [
      "organizations comparing central civic access against a more conventional tower address",
      "administrative or professional-service teams that need visitor access and downtown legitimacy without a suburban office pattern",
    ],
    strengths: [
      "civic and government-adjacent context",
      "central visitor access",
      "professional administrative setting",
      "useful contrast to Cherry Creek and Denver Tech Center",
    ],
    tradeoffs: [
      "Civic proximity does not remove the need to validate security, visitor arrival, parking, and exact commute patterns.",
    ],
    nearbyAlternatives: ["1200 17th St", "1700 Lincoln St", "Denver Place", "LoDo office alternatives"],
    publicSources: [
      {
        label: "Rofo Building Profile",
        url: "/commercial-real-estate/building/CO/denver/1600-broadway/",
        sourceType: "repository",
      },
      {
        label: "Rofo Downtown Denver representative-building records",
        url: "_data/locationKnowledgeGraph.js",
        sourceType: "repository",
      },
    ],
  }),
  evidenceRecord({
    id: "den-downtown-denver-1700-lincoln-st",
    title: "1700 Lincoln St",
    subjectId: "1700-lincoln-st",
    subjectName: "1700 Lincoln St",
    buildingProfileReference: "/commercial-real-estate/building/CO/denver/1700-lincoln-st/",
    buildingProfileStatus: "migrated",
    evidenceType: "executive_office_environment",
    evidenceTypeLabel: "Executive Office Environment",
    evidenceRole: "client_facing_presence_benchmark",
    evidenceRoleLabel: "Client-Facing Presence Benchmark",
    confidence: "editorially_supported",
    whyItBelongs:
      "1700 Lincoln St helps explain Downtown Denver for client-facing and executive professional-service users that need central identity and polished presence.",
    districtFit:
      "It demonstrates the district's high-image office logic while keeping the practical tradeoff visible against Cherry Creek's boutique setting and DTC's parking-oriented scale.",
    typicalCompanies: ["executive offices", "law firms", "finance teams", "consulting firms", "regional headquarters"],
    typicalUsers: [
      "client-facing leadership, legal, finance, consulting, and advisory teams that benefit from a recognizable downtown address",
    ],
    leasingSituations: [
      "firms evaluating whether executive image and client arrival justify a downtown office requirement",
      "teams comparing central Denver address value against Cherry Creek polish or Denver Tech Center access",
    ],
    strengths: [
      "executive office identity",
      "client-facing professional presence",
      "central Denver address signal",
      "comparison value for law and professional services",
    ],
    tradeoffs: [
      "A high-image downtown setting may be less useful for teams that prioritize easy parking, suburban commute balance, or operational space.",
    ],
    nearbyAlternatives: ["1200 17th St", "1600 Broadway", "Denver Place", "Denver Tech Center office alternatives"],
    publicSources: [
      {
        label: "Rofo Building Profile",
        url: "/commercial-real-estate/building/CO/denver/1700-lincoln-st/",
        sourceType: "repository",
      },
      {
        label: "Rofo Downtown Denver representative-building records",
        url: "_data/locationKnowledgeGraph.js",
        sourceType: "repository",
      },
    ],
  }),
  evidenceRecord({
    id: "den-downtown-denver-denver-place",
    title: "Denver Place",
    subjectId: "999-18th-st",
    subjectName: "Denver Place",
    buildingProfileReference: "/commercial-real-estate/building/CO/denver/999-18th-st/",
    buildingProfileStatus: "migrated",
    evidenceType: "transit_oriented_office_environment",
    evidenceTypeLabel: "Transit-Oriented Office Environment",
    evidenceRole: "walkable_downtown_access_benchmark",
    evidenceRoleLabel: "Walkable Downtown Access Benchmark",
    confidence: "editorially_supported",
    whyItBelongs:
      "Denver Place shows Downtown Denver as a central office environment where transit, walkability, civic access, and regional identity can work together.",
    districtFit:
      "It adds evidence for teams that prioritize employee access and downtown amenity context while still needing to compare parking and visitor arrival carefully.",
    typicalCompanies: ["professional-service firms", "regional offices", "nonprofit organizations", "central administrative teams"],
    typicalUsers: [
      "office users that value transit, walkability, nearby services, and a central Denver setting for employees or stakeholders",
    ],
    leasingSituations: [
      "organizations comparing walkable downtown access against parking-led alternatives in Denver Tech Center or suburban nodes",
      "nonprofit, administrative, or professional teams weighing stakeholder access, employee commute, and central-market identity",
    ],
    strengths: [
      "transit-oriented downtown access",
      "walkable office context",
      "regional office identity",
      "stakeholder and employee access comparison value",
    ],
    tradeoffs: [
      "Transit and walkability advantages should be weighed against parking-sensitive customers, suburban employee patterns, and suite-level fit.",
    ],
    nearbyAlternatives: ["1200 17th St", "1600 Broadway", "1700 Lincoln St", "RiNo office alternatives"],
    publicSources: [
      {
        label: "Rofo Building Profile",
        url: "/commercial-real-estate/building/CO/denver/999-18th-st/",
        sourceType: "repository",
      },
      {
        label: "Rofo Downtown Denver representative-building records",
        url: "_data/locationKnowledgeGraph.js",
        sourceType: "repository",
      },
    ],
  }),
];

module.exports = {
  schemaVersion: "commercial-market-evidence-v1",
  collectionId: "den-downtown-denver-commercial-market-evidence",
  collectionType: "district_commercial_market_evidence",
  status: "production_reference",
  district,
  districtNarrative: {
    whyItExists:
      "Downtown Denver exists as the metro's central office, civic, legal, finance, consulting, transit, hospitality, and regional business core. It is strongest when a company benefits from central Denver identity and access rather than a suburban office pattern.",
    strongestWhen: [
      "a company needs client, civic, legal, finance, or institutional access",
      "the office should signal central Denver professional presence",
      "employee transit access and downtown walkability matter to the daily operating pattern",
      "regional stakeholders or visitors expect a recognizable downtown business location",
    ],
    weakerWhen: [
      "a company needs industrial, warehouse, loading, yard, or production utility",
      "southeast metro commute patterns or parking convenience matter more than central identity",
      "a boutique retail-adjacent client experience is more important than downtown office context",
      "creative adaptive character matters more than formal professional-service setting",
    ],
  },
  naturalBusinessFit: {
    fits: [
      "law firms",
      "finance and advisory firms",
      "consulting and professional-service firms",
      "regional offices and headquarters",
      "government-adjacent organizations",
      "nonprofits and stakeholder-facing administrative teams",
      "companies that benefit from central access, transit, civic proximity, and downtown address identity",
    ],
    lessNaturalFor: [
      "industrial, warehouse, flex, production, or distribution users",
      "parking-heavy back-office operations",
      "large suburban campus users",
      "retail concepts that depend primarily on neighborhood or destination shopping patterns",
      "creative teams that prioritize RiNo or LoDo texture over a formal downtown office setting",
    ],
  },
  qualityStandard:
    "A strong Downtown Denver Commercial Market Evidence collection explains central office decisions through source-supported examples. The initial collection should distinguish formal office identity, civic adjacency, executive presence, transit access, and practical tradeoffs without implying live availability or leasing economics.",
  records,
  deferredCandidates: [
    {
      title: "Additional LoDo and CBD edge office examples",
      reason:
        "Useful for later comparative depth, but this bounded collection first establishes the core Downtown Denver office roles selected by the district evidence mission.",
    },
    {
      title: "Retail and hospitality anchors",
      reason:
        "Important for downtown experience, but they should become a later non-office evidence expansion rather than dilute this office-focused collection.",
    },
    {
      title: "Detailed tenant or availability evidence",
      reason:
        "Live tenant, rent, concessions, and availability details remain outside this source collection until Rofo has a supported production data source for them.",
    },
  ],
};
