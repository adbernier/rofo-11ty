const district = {
  metroId: "east-bay",
  metroName: "East Bay",
  cityId: "emeryville",
  cityName: "Emeryville",
  districtId: "emeryville-commercial-core",
  districtName: "Emeryville Commercial Core",
  districtPath: "/commercial-real-estate/CA/emeryville/emeryville-commercial-core/",
  primaryEcosystem: "office",
  secondaryEcosystems: ["flex", "life_science_support", "retail"],
  referenceDocument: "docs/commercial-market-evidence-financial-district.md",
};

const neighboringDistrictRelationships = [
  {
    districtId: "downtown-berkeley",
    districtName: "Downtown Berkeley",
    relationship:
      "Downtown Berkeley is the stronger comparison when BART access, UC Berkeley adjacency, and a walkable downtown office or retail setting matter more than business-park structure.",
  },
  {
    districtId: "west-berkeley",
    districtName: "West Berkeley",
    relationship:
      "West Berkeley is the stronger comparison when industrial/flex character, maker activity, and practical production-oriented buildings matter more than Emeryville's office and R&D-support setting.",
  },
  {
    districtId: "jack-london-square",
    districtName: "Jack London Square",
    relationship:
      "Jack London Square is the stronger comparison when Oakland waterfront identity, customer-facing creative-office context, and downtown Oakland adjacency matter more than Emeryville's campus-oriented East Bay access.",
  },
];

function evidenceRecord(fields) {
  return {
    subjectType: "commercial_area",
    district,
    neighboringDistrictRelationships,
    reviewStatus: "approved_reference",
    confidence: "editorially_supported",
    buildingProfileStatus: "not_applicable_area_evidence",
    ...fields,
  };
}

const records = [
  evidenceRecord({
    id: "east-bay-emeryville-commercial-core-powell-street-office-corridor",
    title: "Powell Street Office Corridor",
    subjectId: "powell-street-office-corridor",
    subjectName: "Powell Street Office Corridor",
    evidenceType: "office_corridor",
    evidenceTypeLabel: "Office Corridor",
    evidenceRole: "district_office_anchor",
    evidenceRoleLabel: "District Office Anchor",
    whyItBelongs:
      "Powell Street anchors Emeryville's commercial core with a recurring office-building pattern tied to regional access, business-park structure, and nearby services.",
    districtFit:
      "The corridor explains why Emeryville is evaluated differently from Downtown Berkeley: the decision is often about campus-style office access rather than BART-first downtown identity.",
    typicalCompanies: ["professional-service firms", "technology-adjacent teams", "regional office users", "headquarters-support teams"],
    typicalUsers: ["occupiers comparing Emeryville office access with Berkeley, Oakland, and other East Bay alternatives"],
    leasingSituations: [
      "office searches where freeway access, parking strategy, and building-by-building fit matter more than downtown pedestrian identity",
      "teams comparing Powell Street office buildings with Berkeley downtown and Oakland waterfront alternatives",
    ],
    strengths: ["office-corridor identity", "regional East Bay access", "business-park comparison value"],
    tradeoffs: ["Users should validate exact suite condition, parking terms, transit fit, and visitor arrival before treating the corridor as a match."],
    nearbyAlternatives: ["Downtown Berkeley", "Jack London Square", "West Berkeley"],
    publicSources: [
      { label: "Rofo Location Knowledge Graph", url: "_data/locationKnowledgeGraph.js", sourceType: "repository" },
      { label: "Rofo representative building page expansions", url: "_data/representativeBuildingPageExpansions.js", sourceType: "repository" },
    ],
  }),
  evidenceRecord({
    id: "east-bay-emeryville-commercial-core-christie-avenue-mixed-office-cluster",
    title: "Christie Avenue Mixed Office Cluster",
    subjectId: "christie-avenue-mixed-office-cluster",
    subjectName: "Christie Avenue Mixed Office Cluster",
    evidenceType: "mixed_office_cluster",
    evidenceTypeLabel: "Mixed Office Cluster",
    evidenceRole: "office_amenity_context",
    evidenceRoleLabel: "Office / Amenity Context",
    whyItBelongs:
      "Christie Avenue adds mixed office and amenity context near Emeryville's central commercial grid, supporting users that want East Bay access with nearby services.",
    districtFit:
      "It shows how the district combines office buildings, retail services, and campus-oriented commercial blocks rather than functioning as a traditional downtown main-street environment.",
    typicalCompanies: ["office users", "professional-service firms", "technology-adjacent teams", "client-service teams"],
    typicalUsers: ["teams that want Emeryville identity with services close to the office search area"],
    leasingSituations: [
      "office users weighing amenity adjacency against building format, parking, and regional access",
      "companies comparing Christie Avenue with Powell Street, Shellmound Street, Downtown Berkeley, and Jack London Square",
    ],
    strengths: ["mixed office context", "amenity adjacency", "central Emeryville commercial-grid relevance"],
    tradeoffs: ["Amenity proximity does not establish current availability, exact space quality, signage, or visitor access for a specific building."],
    nearbyAlternatives: ["Powell Street Office Corridor", "Downtown Berkeley", "Jack London Square"],
    publicSources: [
      { label: "Rofo Location Knowledge Graph", url: "_data/locationKnowledgeGraph.js", sourceType: "repository" },
      { label: "Rofo representative building page expansions", url: "_data/representativeBuildingPageExpansions.js", sourceType: "repository" },
    ],
  }),
  evidenceRecord({
    id: "east-bay-emeryville-commercial-core-horton-hollis-flex-transition",
    title: "Horton / Hollis Office-Flex Transition",
    subjectId: "horton-hollis-office-flex-transition",
    subjectName: "Horton / Hollis Office-Flex Transition",
    evidenceType: "office_flex_transition",
    evidenceTypeLabel: "Office / Flex Transition",
    evidenceRole: "production_adjacent_context",
    evidenceRoleLabel: "Production-Adjacent Context",
    whyItBelongs:
      "Horton and Hollis give Emeryville Commercial Core a practical office/flex transition pattern where office, service, and production-adjacent needs overlap.",
    districtFit:
      "This context helps explain why some occupiers compare Emeryville with West Berkeley for R&D-support or flex needs while still wanting a more office-oriented environment.",
    typicalCompanies: ["R&D-support users", "office/flex teams", "creative production support users", "service-commercial operators"],
    typicalUsers: ["occupiers that need to compare Emeryville office/flex fit with West Berkeley's more production-oriented building stock"],
    leasingSituations: [
      "teams validating whether a flexible East Bay office base can support light operational or production-adjacent needs",
      "users comparing Emeryville's central grid with West Berkeley, Oakland, and heavier I-880 industrial alternatives",
    ],
    strengths: ["office/flex comparison value", "production-adjacent commercial texture", "useful bridge to West Berkeley comparisons"],
    tradeoffs: ["Specific loading, power, ventilation, production permissions, and technical infrastructure must be validated at the property level."],
    nearbyAlternatives: ["West Berkeley", "Powell Street Office Corridor", "Jack London Square"],
    publicSources: [
      { label: "Rofo Location Knowledge Graph", url: "_data/locationKnowledgeGraph.js", sourceType: "repository" },
      { label: "Rofo representative building page expansions", url: "_data/representativeBuildingPageExpansions.js", sourceType: "repository" },
    ],
  }),
  evidenceRecord({
    id: "east-bay-emeryville-commercial-core-shellmound-bay-street-commercial-spine",
    title: "Shellmound / Bay Street Commercial Spine",
    subjectId: "shellmound-bay-street-commercial-spine",
    subjectName: "Shellmound / Bay Street Commercial Spine",
    evidenceType: "retail_amenity_commercial_spine",
    evidenceTypeLabel: "Retail / Amenity Commercial Spine",
    evidenceRole: "district_amenity_anchor",
    evidenceRoleLabel: "District Amenity Anchor",
    whyItBelongs:
      "Shellmound and Bay Street help explain the amenity side of Emeryville's commercial core where office users evaluate nearby retail and service context.",
    districtFit:
      "The spine supports Emeryville's district story as a mixed commercial environment with office, service, and retail adjacency rather than a purely industrial or downtown office district.",
    typicalCompanies: ["office users", "client-service firms", "retail-adjacent office teams", "regional service businesses"],
    typicalUsers: ["teams that want office access with nearby retail services and a recognizable Emeryville commercial setting"],
    leasingSituations: [
      "office searches where nearby services, employee convenience, and visitor arrival influence district choice",
      "users comparing Emeryville's retail-supported office environment with Downtown Berkeley or Jack London Square",
    ],
    strengths: ["retail and service adjacency", "recognizable Emeryville commercial identity", "office amenity support"],
    tradeoffs: ["Retail adjacency does not replace building-level validation for office configuration, parking, pricing, or current availability."],
    nearbyAlternatives: ["Christie Avenue Mixed Office Cluster", "Downtown Berkeley", "Jack London Square"],
    publicSources: [
      { label: "Rofo Location Knowledge Graph", url: "_data/locationKnowledgeGraph.js", sourceType: "repository" },
      { label: "Rofo representative building page expansions", url: "_data/representativeBuildingPageExpansions.js", sourceType: "repository" },
    ],
  }),
  evidenceRecord({
    id: "east-bay-emeryville-commercial-core-northern-r-and-d-support-edge",
    title: "Northern R&D-Support Edge",
    subjectId: "northern-r-and-d-support-edge",
    subjectName: "Northern R&D-Support Edge",
    evidenceType: "r_and_d_support_edge",
    evidenceTypeLabel: "R&D-Support Edge",
    evidenceRole: "berkeley_adjacency_context",
    evidenceRoleLabel: "Berkeley-Adjacency Context",
    whyItBelongs:
      "The northern edge of Emeryville connects the commercial core toward Berkeley with office, flex, and technology-adjacent context useful for R&D-support users.",
    districtFit:
      "It explains why Emeryville can be a bridge between Berkeley adjacency and a more structured business-park environment without claiming specialized technical infrastructure.",
    typicalCompanies: ["R&D-support teams", "technology-adjacent companies", "office/flex users", "Berkeley-adjacent business users"],
    typicalUsers: ["occupiers that want Berkeley proximity but need Emeryville's more parking-oriented office/flex setting"],
    leasingSituations: [
      "teams comparing Berkeley-adjacent office/flex options with West Berkeley and Downtown Berkeley",
      "R&D-support users validating whether Emeryville offers the right office, flex, access, and employee-location balance",
    ],
    strengths: ["Berkeley adjacency", "office/flex support context", "technology-adjacent district explanation"],
    tradeoffs: ["R&D-support fit remains a cautious location pattern; technical infrastructure, lab use, and specialized buildout cannot be inferred."],
    nearbyAlternatives: ["West Berkeley", "Downtown Berkeley", "Powell Street Office Corridor"],
    publicSources: [
      { label: "Rofo Location Knowledge Graph", url: "_data/locationKnowledgeGraph.js", sourceType: "repository" },
      { label: "Rofo representative building page expansions", url: "_data/representativeBuildingPageExpansions.js", sourceType: "repository" },
    ],
  }),
];

module.exports = {
  collectionId: "emeryville-commercial-core-commercial-market-evidence",
  schemaVersion: "commercial-market-evidence-v1",
  district,
  neighboringDistrictRelationships,
  records,
  deferredCandidates: [
    {
      id: "emeryville-commercial-core-building-profiles",
      label: "Emeryville Commercial Core selected Building Profiles",
      status: "researchable_later",
      reason:
        "This bounded mission creates district-level Commercial Market Evidence only; no selected Building Profile work items were included in the execution packet.",
      prerequisite:
        "A future Building Profile mission should select exact buildings only when source-supported property evidence materially strengthens the district explanation.",
    },
    {
      id: "emeryville-commercial-core-business-guides",
      label: "Emeryville Commercial Core business guides",
      status: "blocked_for_now",
      reason:
        "A district evidence collection alone is not enough to publish defensible business-type guides without deeper representative-building and recommendation-readiness coverage.",
      prerequisite:
        "Add selected Building Profiles and business-type-specific recommendation evidence before public guide expansion.",
    },
  ],
};
