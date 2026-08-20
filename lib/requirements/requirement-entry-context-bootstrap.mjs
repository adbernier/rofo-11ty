import { createInterviewState } from "./requirement-interview-v1.mjs";

const list = (value) => Array.isArray(value) ? value.filter(Boolean) : [];

export function seedTrustedEntryContext(interview, entryContext = {}, districtGeography = { markets: {} }) {
  if (!interview || !entryContext || entryContext.intent !== "new") return interview;
  const requirement = structuredClone(interview.requirement);

  if (entryContext.marketId === "san-francisco") {
    requirement.locationLogic.marketAnchor = { geographyId: "san-francisco", marketId: "san-francisco", displayName: "San Francisco", marketName: "San Francisco", city: "San Francisco", state: "CA", source: "entry_context" };
    requirement.locationLogic.locations = ["San Francisco"];
    requirement.criteria = [...requirement.criteria.filter((item) => item.dimension !== "universal.location.anchor"), { id: "criterion_universal_location_anchor", dimension: "universal.location.anchor", label: "Market anchor", value: { text: "San Francisco", number: null, boolean: null, list: [] }, status: "REQUIRED", scope: "location", source: "external_record", confidence: 1, rationale: "Inherited from trusted canonical route EntryContext.", authority: "rofo", requiresConfirmation: false, confirmed: true }];
  }

  if (entryContext.propertyType === "office") requirement.propertyTypes = ["office"];

  const candidateDistrictIds = list(entryContext.candidateDistrictIds);
  if (candidateDistrictIds.length) {
    const knownDistricts = districtGeography.markets?.[entryContext.marketId] || [];
    const candidateDistrictNames = list(entryContext.candidateDistrictNames);
    const names = candidateDistrictIds.map((id, index) => knownDistricts.find((item) => item.districtId === id)?.name || candidateDistrictNames[index] || id);
    requirement.locationLogic.specificPreference = { ...requirement.locationLogic.specificPreference, hasPreference: true, source: "entry_context", candidateDistrictIds: candidateDistrictIds.slice(), candidateDistrictNames: names };
    requirement.criteria = [...requirement.criteria.filter((item) => item.dimension !== "universal.location.specific_preference"), { id: "criterion_universal_location_specific_preference", dimension: "universal.location.specific_preference", label: "Specific location preference", value: { text: "", number: null, boolean: null, list: names }, status: "PREFERRED", scope: "location", source: "external_record", confidence: 1, rationale: "Inherited as neutral comparison context from the source district route.", authority: "rofo", requiresConfirmation: false, confirmed: true }];
  }

  return createInterviewState({ requirement, districtGeography });
}
