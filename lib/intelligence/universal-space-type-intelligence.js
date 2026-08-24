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

function projectionFoundations(requirement, foundations) {
  if (!foundations.some((item) => item.id === "industrial") || !foundations.some((item) => item.id === "flex")) return foundations;
  const activities = new Set(cleanList(requirement.activities));
  const count = (ids) => ids.filter((id) => activities.has(id)).length;
  const industrialSignals = count(["store", "receive", "ship_distribute", "dispatch", "operate_vehicles", "repair_service", "prepare_produce_food"]);
  const flexSignals = count(["work", "meet_collaborate", "host_visitors", "display_present", "research_test"]);
  if (industrialSignals > flexSignals) return [registry.foundations.industrial];
  if (flexSignals > industrialSignals) return [registry.foundations.flex];
  return foundations;
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
  const foundations = projectionFoundations(requirement, foundationsForRequirement(requirement));
  const projectedDimensions = foundations.flatMap((foundation) => foundation.dimensions.map((item) => {
    const activatedBy = item.signals.filter((itemSignal) => signalIsPresent(requirement, itemSignal, dimensions, activities)).map((itemSignal) => `${itemSignal.kind}:${itemSignal.id}`);
    return { foundationId: foundation.id, item, activatedBy };
  }));
  const activated = projectedDimensions.filter((entry) => entry.activatedBy.length);
  const relevant = activated.length ? activated : foundations.flatMap((foundation) => foundation.dimensions.slice(0, 2).map((item) => ({ foundationId: foundation.id, item, activatedBy: [] })));
  return {
    schemaVersion: registry.briefProjectionContract.schemaVersion,
    intelligenceLevel: "UNIVERSAL_SPACE_TYPE",
    foundations: foundations.map((foundation) => ({ id: foundation.id, label: foundation.label })),
    whatMatters: relevant.slice(0, 5).map(({ item, activatedBy }) => ({ id: item.id, label: item.label, whyItMatters: item.whyItMatters, activatedBy })),
    understoodRequirement: foundations.flatMap((foundation) => foundation.dimensions.flatMap((item) => item.signals
      .filter((itemSignal) => signalIsPresent(requirement, itemSignal, dimensions, activities))
      .map((itemSignal) => ({ dimensionId: item.id, signal: `${itemSignal.kind}:${itemSignal.id}`, strength: itemSignal.strength })))),
    investigationTopics: [...new Set(relevant.flatMap(({ item }) => item.investigationTopics))].slice(0, 7),
    propertyConsiderations: [...new Set(relevant.filter(({ item }) => /property|building|site|configuration|infrastructure|use compatibility/i.test(`${item.label} ${item.whyItMatters}`)).map(({ item }) => item.label))],
    missingRequirementSignals: [...new Set(foundations.flatMap((foundation) => foundation.requirementGaps))],
    locationIntelligenceBoundary: {
      code: "LOCAL_EVIDENCE_REQUIRED",
      statement: "These topics describe what matters for the space type. They do not establish local fit, rankings, rents, availability, access performance, permitted use, or building capability.",
    },
  };
}

module.exports = { registry, foundationsForRequirement, projectUniversalIntelligence };
