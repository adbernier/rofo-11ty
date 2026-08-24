const ROLE = Object.freeze({ ELIGIBLE: "RECOMMENDATION_ELIGIBLE", CONTEXT: "PRESENTATION_CONTEXT", SPECIALIZED: "SPECIALIZED_INVESTIGATION", EXCLUDED: "EXCLUDED" });

// Shared geography ownership for two separate fit models. Applicability belongs
// here; Requirement-specific preference never does.
const geographies = Object.freeze([
  { districtId: "bayview-industrial", role: ROLE.ELIGIBLE, industrial: "CORE_INDUSTRIAL", flex: "CORE_FLEX", aliases: ["Bayview PDR", "Bayview/Hunters Point Industrial"], evidenceOwner: "bayview-industrial" },
  { districtId: "central-waterfront", role: ROLE.ELIGIBLE, industrial: "CORE_INDUSTRIAL", flex: "CORE_FLEX", aliases: ["Central Waterfront Core PDR", "Third Street Industrial District"], evidenceOwner: "central-waterfront" },
  { districtId: "dogpatch", role: ROLE.ELIGIBLE, industrial: "SITUATIONAL_INDUSTRIAL", flex: "CORE_FLEX", aliases: ["Northern Central Waterfront"], evidenceOwner: "dogpatch" },
  { districtId: "showplace-square", role: ROLE.ELIGIBLE, industrial: "SITUATIONAL_INDUSTRIAL", flex: "CORE_FLEX", aliases: ["Design District", "Showplace Square Design District"], evidenceOwner: "showplace-square" },
  { districtId: "potrero-hill", role: ROLE.ELIGIBLE, industrial: "SITUATIONAL_INDUSTRIAL", flex: "SITUATIONAL_FLEX", aliases: ["Potrero Hill production edge"], evidenceOwner: "potrero-hill", scopeLimitation: "Only the reviewed eastern/base PDR edge is relevant; the residential hill is not an Industrial/Flex decision." },
  { districtId: "soma", role: ROLE.ELIGIBLE, industrial: "GENERALLY_NOT_INDUSTRIAL", flex: "SITUATIONAL_FLEX", aliases: [], evidenceOwner: "soma", scopeLimitation: "Adaptive office/showroom Flex only; not conventional warehouse or logistics geography." },
]);

const contextual = Object.freeze([
  { geographyId: "bayview", role: ROLE.CONTEXT, ownerDistrictId: "bayview-industrial", reason: "Broader public identity; the operational decision is Bayview Industrial." },
  { geographyId: "northeast-mission-pdr", role: ROLE.CONTEXT, ownerDistrictId: "mission-district", reason: "Reviewed internal operating context, but not sufficiently separable from Mission/Potrero/Showplace for an independent recommendation vote." },
  { geographyId: "southern-waterfront-piers-80-96", role: ROLE.SPECIALIZED, ownerDistrictId: "bayview-industrial", reason: "Port, maritime, cargo, and heavy-commercial investigation context rather than an ordinary tenant shortlist geography." },
  { geographyId: "mission-bay", role: ROLE.EXCLUDED, ownerDistrictId: "mission-bay", reason: "Modern and institutional context does not establish ordinary Industrial or technical Flex suitability." },
]);

module.exports = {
  schemaVersion: "sf-industrial-flex-decision-geographies:v1",
  marketId: "san-francisco",
  customerEntryPropertyType: "industrial_flex",
  internalModels: ["industrial", "flex"],
  roles: ROLE,
  geographies,
  contextual,
  presentationGroups: [{ presentationGroupId: "sf-industrial-flex:showplace-design", canonicalDistrictId: "showplace-square", memberDistrictIds: ["showplace-square", "design-district"], displayName: "Showplace Square / Design District", reviewStatus: "APPROVED" }],
  completenessRule: "Every material SF Industrial/Flex candidate is independently classified for Industrial and Flex, or assigned a non-scoring context/specialized/excluded role with a reviewed reason.",
};
