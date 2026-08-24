"use strict";

const registry = require("../../_data/universalSpaceTypeIntelligence");

const cleanList = (value) => Array.isArray(value) ? value.map(String).filter(Boolean) : [];
const criteriaIds = (requirement) => new Set((requirement.criteria || []).map((item) => item && item.dimension).filter(Boolean));
const fieldPresent = (requirement, id) => id.split(".").reduce((value, key) => value && value[key], requirement) != null;

function foundationsForRequirement(requirement = {}) {
  const types = new Set(cleanList(requirement.propertyTypes));
  if (types.has("office")) return [registry.foundations.office];
  if (types.has("retail_service")) return [registry.foundations.retail];
  if (types.has("industrial_flex")) return [registry.foundations.industrial, registry.foundations.flex];
  return [];
}

function signalIsPresent(requirement, signal, dimensions, activities) {
  if (signal.kind === "activity") return activities.has(signal.id);
  if (signal.kind === "dimension") return dimensions.has(signal.id);
  if (signal.kind === "field") return fieldPresent(requirement, signal.id);
  return false;
}

function projectUniversalIntelligence(requirement = {}) {
  const dimensions = criteriaIds(requirement);
  const activities = new Set(cleanList(requirement.activities));
  const foundations = foundationsForRequirement(requirement);
  return {
    schemaVersion: registry.briefProjectionContract.schemaVersion,
    intelligenceLevel: "UNIVERSAL_SPACE_TYPE",
    foundations: foundations.map((foundation) => ({ id: foundation.id, label: foundation.label })),
    whatMatters: foundations.flatMap((foundation) => foundation.dimensions.map((item) => ({
      id: item.id,
      label: item.label,
      whyItMatters: item.whyItMatters,
      activatedBy: item.signals.filter((itemSignal) => signalIsPresent(requirement, itemSignal, dimensions, activities)).map((itemSignal) => `${itemSignal.kind}:${itemSignal.id}`),
    }))),
    understoodRequirement: foundations.flatMap((foundation) => foundation.dimensions.flatMap((item) => item.signals
      .filter((itemSignal) => signalIsPresent(requirement, itemSignal, dimensions, activities))
      .map((itemSignal) => ({ dimensionId: item.id, signal: `${itemSignal.kind}:${itemSignal.id}`, strength: itemSignal.strength })))),
    investigationTopics: [...new Set(foundations.flatMap((foundation) => foundation.dimensions.flatMap((item) => item.investigationTopics)))],
    propertyConsiderations: [...new Set(foundations.flatMap((foundation) => foundation.dimensions.filter((item) => /property|building|site|configuration|infrastructure|use compatibility/i.test(`${item.label} ${item.whyItMatters}`)).map((item) => item.label)))],
    missingRequirementSignals: [...new Set(foundations.flatMap((foundation) => foundation.requirementGaps))],
    locationIntelligenceBoundary: {
      code: "LOCAL_EVIDENCE_REQUIRED",
      statement: "These topics describe what matters for the space type. They do not establish local fit, rankings, rents, availability, access performance, permitted use, or building capability.",
    },
  };
}

module.exports = { registry, foundationsForRequirement, projectUniversalIntelligence };
