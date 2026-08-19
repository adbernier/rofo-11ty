module.exports = {
  schemaVersion: "recommendation-presentation-groups:v1",
  marketId: "san-francisco",
  propertyType: "office",
  groups: [
    {
      presentationGroupId: "sf-office:showplace-square-design-district",
      canonicalDistrictId: "showplace-square",
      memberDistrictIds: ["showplace-square", "design-district"],
      displayName: "Showplace Square / Design District",
      aliases: ["Showplace Square", "Design District", "Showplace Square Design District"],
      groupingReason: "SUBSTANTIALLY_OVERLAPPING_DECISION_GEOGRAPHY",
      reviewStatus: "APPROVED",
      componentPolicy: "CANONICAL_KNOWLEDGE_OWNER",
      eligibilityPolicy: "ANY_ELIGIBLE_MEMBER_WITH_CANONICAL_COMPONENTS",
      candidatePolicy: "DEDUPE_MEMBERS_PRESERVE_SOURCE_IDENTITIES",
      publicSurfacePolicy: "PRESERVE_EXISTING_IDENTITIES",
      provenance: [
        "_data/locationKnowledgeGraph.js",
        "_data/commercialLocationModel.js",
        "_data/neighborhoodPages.js",
        "data/commercial-market-evidence/san-francisco/showplace-square.js",
        "data/commercial-market-evidence/san-francisco/design-district.js",
      ],
    },
  ],
};
