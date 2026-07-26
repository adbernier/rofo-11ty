const ecosystemTaxonomy = require("../_data/commercialEcosystemTaxonomy.js");
const intelligenceTaxonomy = require("../_data/representativeBuildingIntelligenceTaxonomy.js");
const representativeBuildingIntelligence = require("../_data/representativeBuildingIntelligence.js");
const publisherSnapshot = require("../data/generated/publisher-analysis.json");
const publisherPlans = require("../data/generated/publisher-expansion-plans.json");
const { analyzePublisher } = require("../lib/publisher/analyze-metros.js");
const { buildPublisherExpansionPlans } = require("../lib/publisher/expansion-planner.js");

const EXPECTED_SCORES = {
  "san-francisco": { overall: 74, status: "Editorially Developed" },
  sacramento: { overall: 98, status: "Distribution Ready" },
  "san-diego": { overall: 84, status: "Expansion Ready" },
  "orange-county": { overall: 84, status: "Expansion Ready" },
  denver: { overall: 94, status: "Distribution Ready" },
  seattle: { overall: 74, status: "Editorially Developed" },
};

const DENVER_INDUSTRIAL_TARGET_ROLES = [
  "large_scale_distribution_environment",
  "warehouse_distribution_environment",
  "contractor_service_cluster",
  "light_manufacturing_environment",
  "last_mile_logistics_environment",
  "flex_business_park",
  "research_development_environment",
];

const DENVER_OFFICE_TARGET_ROLES = [
  "downtown_class_a_office",
  "professional_office_environment",
  "creative_office_environment",
  "executive_office_environment",
  "suburban_office_campus",
  "government_office_environment",
  "small_tenant_office_environment",
  "transit_oriented_office_environment",
];

const DENVER_MEDICAL_TARGET_ROLES = [
  "medical_office_environment",
  "outpatient_clinic_environment",
];

const DENVER_MEDICAL_TARGET_OPERATIONAL_CATEGORIES = [
  "parking_vehicles",
  "configuration",
  "infrastructure",
  "market_presence",
  "location_workforce",
  "outdoor_special_use",
];

const VALID_CONFIDENCE = new Set([
  "verified_property_fact",
  "editorially_supported",
  "district_inferred",
  "taxonomy_inferred",
  "review_required",
]);

const errors = [];
const warnings = [];

function stableJson(value) {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableJson(value[key])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

function requireField(condition, message) {
  if (!condition) errors.push(message);
}

function validateUnique(items, label) {
  const seen = new Set();
  for (const item of items || []) {
    if (!item || !item.id) {
      errors.push(`${label}: missing id`);
      continue;
    }
    if (seen.has(item.id)) errors.push(`${label}: duplicate id ${item.id}`);
    seen.add(item.id);
  }
}

function validateRefs(ids, lookup, label, source) {
  for (const id of ids || []) {
    if (!lookup[id]) errors.push(`${source}: unknown ${label} ${id}`);
  }
}

function validateTaxonomy() {
  validateUnique(intelligenceTaxonomy.operationalCharacteristicCategories, "operational category");
  validateUnique(intelligenceTaxonomy.operationalCharacteristics, "operational characteristic");
  validateUnique(intelligenceTaxonomy.representativeRoles, "representative role");

  for (const characteristic of intelligenceTaxonomy.operationalCharacteristics) {
    if (!intelligenceTaxonomy.operationalCharacteristicCategoryById[characteristic.category]) {
      errors.push(`${characteristic.id}: unknown operational category ${characteristic.category}`);
    }
    validateRefs(characteristic.applicableEcosystems, ecosystemTaxonomy.ecosystemById, "ecosystem", characteristic.id);
    validateRefs(characteristic.applicableSubtypes, ecosystemTaxonomy.subtypeById, "subtype", characteristic.id);
    validateRefs(characteristic.relatedActivities, ecosystemTaxonomy.activityById, "activity", characteristic.id);
    validateRefs(characteristic.relatedBusinessArchetypes, ecosystemTaxonomy.archetypeById, "archetype", characteristic.id);
    for (const subtypeId of characteristic.applicableSubtypes || []) {
      const subtype = ecosystemTaxonomy.subtypeById[subtypeId];
      if (subtype && !(characteristic.applicableEcosystems || []).includes(subtype.ecosystemId)) {
        errors.push(`${characteristic.id}: subtype ${subtypeId} belongs to ${subtype.ecosystemId}, not an applicable ecosystem`);
      }
    }
  }

  for (const role of intelligenceTaxonomy.representativeRoles) {
    if (!ecosystemTaxonomy.ecosystemById[role.ecosystemId]) errors.push(`${role.id}: unknown role ecosystem ${role.ecosystemId}`);
    validateRefs(role.compatibleSubtypes, ecosystemTaxonomy.subtypeById, "subtype", role.id);
    validateRefs(role.expectedActivityPatterns, ecosystemTaxonomy.activityById, "activity", role.id);
    validateRefs(role.commonOperationalCharacteristics, intelligenceTaxonomy.operationalCharacteristicById, "operational characteristic", role.id);
    for (const subtypeId of role.compatibleSubtypes || []) {
      const subtype = ecosystemTaxonomy.subtypeById[subtypeId];
      if (subtype && subtype.ecosystemId !== role.ecosystemId) {
        errors.push(`${role.id}: subtype ${subtypeId} belongs to ${subtype.ecosystemId}, not ${role.ecosystemId}`);
      }
    }
    for (const characteristicId of role.commonOperationalCharacteristics || []) {
      const characteristic = intelligenceTaxonomy.operationalCharacteristicById[characteristicId];
      if (characteristic && !(characteristic.applicableEcosystems || []).includes(role.ecosystemId)) {
        errors.push(`${role.id}: characteristic ${characteristicId} does not apply to ${role.ecosystemId}`);
      }
    }
  }
}

function validateRecord(record) {
  const label = record.name || record.path || record.buildingId;
  const commercial = record.commercialIntelligence || {};
  requireField(record.buildingId, `${label}: missing buildingId`);
  requireField(record.name, `${label}: missing name`);
  requireField(record.districtSlug, `${label}: missing districtSlug`);
  requireField(commercial.primaryEcosystem, `${label}: missing primary ecosystem`);
  requireField(ecosystemTaxonomy.ecosystemById[commercial.primaryEcosystem], `${label}: unknown ecosystem ${commercial.primaryEcosystem}`);
  requireField(VALID_CONFIDENCE.has(commercial.confidence), `${label}: invalid confidence ${commercial.confidence}`);
  validateRefs(commercial.ecosystemSubtypes, ecosystemTaxonomy.subtypeById, "subtype", label);
  validateRefs(commercial.businessActivities, ecosystemTaxonomy.activityById, "activity", label);
  validateRefs(commercial.businessArchetypes, ecosystemTaxonomy.archetypeById, "archetype", label);
  validateRefs(commercial.operationalCharacteristics, intelligenceTaxonomy.operationalCharacteristicById, "operational characteristic", label);
  if (commercial.representativeRole) {
    const role = intelligenceTaxonomy.representativeRoleById[commercial.representativeRole];
    requireField(Boolean(role), `${label}: unknown role ${commercial.representativeRole}`);
    if (role && role.ecosystemId !== commercial.primaryEcosystem) {
      errors.push(`${label}: role ${role.id} belongs to ${role.ecosystemId}, not ${commercial.primaryEcosystem}`);
    }
  } else {
    warnings.push(`${label}: representative role missing`);
  }
  for (const subtypeId of commercial.ecosystemSubtypes || []) {
    const subtype = ecosystemTaxonomy.subtypeById[subtypeId];
    if (subtype && subtype.ecosystemId !== commercial.primaryEcosystem) {
      warnings.push(`${label}: subtype ${subtypeId} is inherited from adjacent ecosystem ${subtype.ecosystemId}`);
    }
  }
  if (!(commercial.operationalCharacteristics || []).length) warnings.push(`${label}: operational intelligence missing`);
  if (commercial.reviewRequired) warnings.push(`${label}: intelligence requires review`);
}

function validateRecords() {
  const ids = new Set();
  for (const record of representativeBuildingIntelligence.records || []) {
    if (ids.has(record.buildingId)) errors.push(`duplicate Representative Building ID ${record.buildingId}`);
    ids.add(record.buildingId);
    validateRecord(record);
  }
  requireField((representativeBuildingIntelligence.records || []).length > 0, "Representative Building Intelligence produced no records");
}

function metroById(snapshot, id) {
  return (snapshot.analysis.metros || []).find((metro) => metro.metroId === id);
}

function planById(plans, id) {
  return (plans.metros || []).find((metro) => metro.metroId === id);
}

function evaluationFor(metro, ecosystemId) {
  return (((metro.ecosystemReadiness || {}).evaluations) || []).find((item) => item.ecosystemId === ecosystemId);
}

function validatePublisherAndPlans() {
  const first = analyzePublisher({ generatedAt: "2026-07-21T00:00:00.000Z" });
  const second = analyzePublisher({ generatedAt: "2026-07-21T00:00:00.000Z" });
  if (stableJson(first) !== stableJson(second)) errors.push("Publisher output is not deterministic after Representative Building Intelligence.");

  const firstPlans = buildPublisherExpansionPlans({ ...first, generatedAt: "2026-07-21T00:00:00.000Z" }, { generatedAt: "2026-07-21T00:00:00.000Z" });
  const secondPlans = buildPublisherExpansionPlans({ ...first, generatedAt: "2026-07-21T00:00:00.000Z" }, { generatedAt: "2026-07-21T00:00:00.000Z" });
  if (stableJson(firstPlans) !== stableJson(secondPlans)) errors.push("Publisher expansion prompt output is not deterministic.");

  for (const [id, expected] of Object.entries(EXPECTED_SCORES)) {
    const metro = metroById({ analysis: first }, id);
    if (!metro) continue;
    requireField(metro.overallScore === expected.overall, `${metro.metroName}: Publisher score changed to ${metro.overallScore}`);
    requireField(metro.readinessStatus === expected.status, `${metro.metroName}: Publisher status changed to ${metro.readinessStatus}`);
  }

  for (const metro of first.metros || []) {
    for (const evaluation of ((metro.ecosystemReadiness || {}).evaluations || [])) {
      const intelligence = evaluation.representativeBuildingIntelligence;
      requireField(Boolean(intelligence), `${metro.metroName}: ${evaluation.ecosystemId} missing Representative Building Intelligence analysis`);
      if (!intelligence) continue;
      ["buildingCount", "rolesCovered", "operationalCategoriesCovered", "missingRoles"].forEach((field) => {
        requireField(Object.prototype.hasOwnProperty.call(intelligence, field), `${metro.metroName}: ${evaluation.ecosystemId} intelligence missing ${field}`);
      });
    }
  }

  const sacramento = metroById({ analysis: first }, "sacramento");
  const sacramentoPlan = planById(firstPlans, "sacramento");
  if (sacramento) {
    const industrial = evaluationFor(sacramento, "industrial_flex");
    requireField(industrial && industrial.readinessState !== "developed", "Sacramento: industrial/flex should remain short of developed while missing roles remain");
    const intelligence = (industrial && industrial.representativeBuildingIntelligence) || {};
    requireField(industrial && ["partial", "strong"].includes(industrial.readinessState), `Sacramento: industrial/flex should remain partial or strong after Brief migration, got ${industrial && industrial.readinessState}`);
    requireField(intelligence.state === "developed", `Sacramento: expected developed industrial/flex representative intelligence, got ${intelligence.state}`);
    requireField((intelligence.rolesCovered || []).length >= 6, "Sacramento: industrial/flex representative-role breadth is too narrow after foundation");
    requireField((intelligence.operationalCategoriesCovered || []).includes("access_loading"), "Sacramento: access/loading operational coverage should be detected after foundation");
    requireField(industrial.layers && ["strong", "developed"].includes(industrial.layers.buildingBriefs), `Sacramento: industrial/flex should expose migrated Building Brief depth, got ${industrial.layers && industrial.layers.buildingBriefs}`);
    requireField((intelligence.missingRoles || []).length > 0, "Sacramento: industrial/flex should still expose remaining missing representative roles");
  }
  if (sacramentoPlan && sacramentoPlan.recommendedEcosystemSprint) {
    const sprint = sacramentoPlan.recommendedEcosystemSprint;
    requireField(sprint.ecosystemId === "industrial_flex", `Sacramento: expected industrial/flex sprint, got ${sprint.ecosystemId}`);
    requireField(sprint.title !== "Sacramento Industrial & Flex Ecosystem Representative Building Foundation", "Sacramento: completed representative-building foundation is still recommended");
    requireField(sprint.title !== "Sacramento Industrial & Flex Ecosystem Building Brief Migration", "Sacramento: completed first-wave Building Brief migration is still recommended");
    requireField(/Ecosystem Balance Sprint$/.test(sprint.title) || /Subtype Expansion$/.test(sprint.title), `Sacramento: expected a post-migration balance or subtype sprint, got ${sprint.title}`);
    requireField((sprint.codexPrompt || "").includes("grade-level") || (sprint.codexPrompt || "").includes("operational categories"), "Sacramento: prompt lacks operational-coverage guidance");
    requireField(!/Office Building Brief Migration$/.test(sprint.title), "Sacramento: office migration outranked industrial/flex foundation");
  }

  const sanFrancisco = metroById({ analysis: first }, "san-francisco");
  if (sanFrancisco) {
    const office = evaluationFor(sanFrancisco, "office");
    const industrial = evaluationFor(sanFrancisco, "industrial_flex");
    const lifeScience = evaluationFor(sanFrancisco, "life_science");
    requireField(office && (office.representativeBuildingIntelligence.rolesCovered || []).length >= 3, "San Francisco: office roles should show variety");
    requireField(industrial && (industrial.representativeBuildingIntelligence.rolesCovered || []).some((id) => id.includes("flex") || id.includes("industrial")), "San Francisco: industrial/flex roles should be visible");
    requireField(lifeScience && (lifeScience.representativeBuildingIntelligence.rolesCovered || []).length >= 1, "San Francisco: life-science role should be visible");
  }

  ["denver", "san-diego", "orange-county"].forEach((id) => {
    const metro = metroById({ analysis: first }, id);
    if (!metro) return;
    ["office", "industrial_flex", "medical", "retail"].forEach((ecosystemId) => {
      const evaluation = evaluationFor(metro, ecosystemId);
      requireField(Boolean(evaluation && evaluation.representativeBuildingIntelligence), `${metro.metroName}: missing ${ecosystemId} Representative Building Intelligence visibility`);
    });
  });

  const denver = metroById({ analysis: first }, "denver");
  const denverPlan = planById(firstPlans, "denver");
  if (denver) {
    const industrial = evaluationFor(denver, "industrial_flex");
    const industrialIntelligence = (industrial && industrial.representativeBuildingIntelligence) || {};
    DENVER_INDUSTRIAL_TARGET_ROLES.forEach((roleId) => {
      requireField((industrialIntelligence.rolesCovered || []).includes(roleId), `Denver: missing industrial/flex target role ${roleId}`);
    });
    requireField((industrialIntelligence.missingRoles || []).length === 0, "Denver: completed industrial/flex target role foundation should not expose missing target roles");
    requireField((industrialIntelligence.reviewRequiredCount || 0) === 0, "Denver: industrial/flex foundation should not leave review-required representative buildings");
    requireField(!((denverPlan && denverPlan.recommendedEcosystemSprint && denverPlan.recommendedEcosystemSprint.title) || "").includes("Industrial & Flex Ecosystem Representative Building Foundation"), "Denver: completed industrial/flex representative-building foundation is still recommended");

    const office = evaluationFor(denver, "office");
    const officeIntelligence = (office && office.representativeBuildingIntelligence) || {};
    DENVER_OFFICE_TARGET_ROLES.forEach((roleId) => {
      requireField((officeIntelligence.rolesCovered || []).includes(roleId), `Denver: missing office target role ${roleId}`);
    });
    requireField((officeIntelligence.missingRoles || []).length === 0, "Denver: completed office target role foundation should not expose missing target roles");
    requireField((officeIntelligence.missingOperationalCategories || []).length === 0, "Denver: completed office foundation should not expose missing target operational categories");
    requireField((officeIntelligence.reviewRequiredCount || 0) === 0, "Denver: office foundation should not leave review-required representative buildings");
    requireField(!((denverPlan && denverPlan.recommendedEcosystemSprint && denverPlan.recommendedEcosystemSprint.title) || "").includes("Office Ecosystem Representative Building Foundation"), "Denver: completed office representative-building foundation is still recommended");

    const medical = evaluationFor(denver, "medical");
    const medicalIntelligence = (medical && medical.representativeBuildingIntelligence) || {};
    DENVER_MEDICAL_TARGET_ROLES.forEach((roleId) => {
      requireField((medicalIntelligence.rolesCovered || []).includes(roleId), `Denver: missing medical target role ${roleId}`);
    });
    DENVER_MEDICAL_TARGET_OPERATIONAL_CATEGORIES.forEach((categoryId) => {
      requireField((medicalIntelligence.operationalCategoriesCovered || []).includes(categoryId), `Denver: missing medical target operational category ${categoryId}`);
    });
    requireField((medicalIntelligence.missingRoles || []).length === 0, "Denver: completed medical target role foundation should not expose missing target roles");
    requireField((medicalIntelligence.missingOperationalCategories || []).length === 0, "Denver: completed medical foundation should not expose missing target operational categories");
    requireField((medicalIntelligence.reviewRequiredCount || 0) === 0, "Denver: medical foundation should not leave review-required representative buildings");
    requireField(!((denverPlan && denverPlan.recommendedEcosystemSprint && denverPlan.recommendedEcosystemSprint.title) || "").includes("Medical Ecosystem Representative Building Foundation"), "Denver: completed medical representative-building foundation is still recommended");
  }

  const seattle = metroById({ analysis: first }, "seattle");
  if (seattle) {
    const office = evaluationFor(seattle, "office");
    const industrial = evaluationFor(seattle, "industrial_flex");
    const officeIntelligence = (office && office.representativeBuildingIntelligence) || {};
    const industrialIntelligence = (industrial && industrial.representativeBuildingIntelligence) || {};
    const seattlePlan = planById(firstPlans, "seattle");
    requireField(seattle.ecosystemReadiness.state === "partial", `Seattle: expected partial ecosystem readiness after office completion, got ${seattle.ecosystemReadiness.state}`);
    requireField(office && office.readinessState === "strong", `Seattle: expected strong office readiness after completion, got ${office && office.readinessState}`);
    [
      "downtown_class_a_office",
      "executive_office_environment",
      "creative_office_environment",
      "professional_office_environment",
      "suburban_office_campus",
    ].forEach((roleId) => {
      requireField((officeIntelligence.rolesCovered || []).includes(roleId), `Seattle: missing office target role ${roleId}`);
    });
    requireField((officeIntelligence.buildingCount || 0) >= 5, `Seattle: expected office representative-building foundation count, got ${officeIntelligence.buildingCount || 0}`);
    requireField(officeIntelligence.state === "strong", `Seattle: expected strong office representative intelligence, got ${officeIntelligence.state}`);
    requireField((officeIntelligence.missingRoles || []).length === 0, "Seattle: completed office target role foundation should not expose missing target roles");
    requireField(industrial && industrial.readinessState === "strong", `Seattle: expected strong industrial/flex readiness after Building Brief coverage, got ${industrial && industrial.readinessState}`);
    requireField((industrialIntelligence.buildingCount || 0) >= 3, `Seattle: expected industrial/flex representative-building foundation count, got ${industrialIntelligence.buildingCount || 0}`);
    requireField((industrialIntelligence.rolesCovered || []).length >= 3, "Seattle: industrial/flex representative-role breadth remains too narrow after foundation");
    requireField(industrialIntelligence.state === "strong", `Seattle: expected strong industrial/flex representative intelligence, got ${industrialIntelligence.state}`);
    requireField(!((seattlePlan && seattlePlan.recommendedEcosystemSprint && seattlePlan.recommendedEcosystemSprint.title) || "").includes("Industrial & Flex Ecosystem Representative Building Foundation"), "Seattle: completed industrial/flex representative-building foundation is still recommended");
    requireField(!((seattlePlan && seattlePlan.recommendedEcosystemSprint && seattlePlan.recommendedEcosystemSprint.title) || "").includes("Office Ecosystem Representative Building Foundation"), "Seattle: completed office representative-building foundation is still recommended");
  }

  const serialized = JSON.stringify({
    taxonomy: intelligenceTaxonomy,
    intelligence: representativeBuildingIntelligence,
    analysis: first.metros.map((metro) => ({
      metroId: metro.metroId,
      ecosystemReadiness: metro.ecosystemReadiness,
      ecosystemCoverage: metro.ecosystemCoverage,
    })),
    plans: firstPlans.metros.map((plan) => ({
      metroId: plan.metroId,
      recommendedEcosystemSprint: plan.recommendedEcosystemSprint,
    })),
  });
  ["undefined", "N/A", "[object Object]"].forEach((token) => {
    if (serialized.includes(token)) errors.push(`Representative Building Intelligence output contains ${token}`);
  });
}

validateTaxonomy();
validateRecords();
validatePublisherAndPlans();

console.log("Representative Building Intelligence QA");
console.log(`Operational categories: ${intelligenceTaxonomy.operationalCharacteristicCategories.length}`);
console.log(`Operational characteristics: ${intelligenceTaxonomy.operationalCharacteristics.length}`);
console.log(`Representative roles: ${intelligenceTaxonomy.representativeRoles.length}`);
console.log(`Representative records: ${(representativeBuildingIntelligence.records || []).length}`);
console.log(`Review required records: ${(representativeBuildingIntelligence.records || []).filter((record) => record.commercialIntelligence.reviewRequired).length}`);
for (const id of ["san-francisco", "sacramento", "san-diego", "orange-county", "denver", "seattle"]) {
  const metro = metroById(publisherSnapshot, id);
  const plan = planById(publisherPlans, id);
  if (!metro) continue;
  const industrial = evaluationFor(metro, "industrial_flex") || {};
  const intelligence = industrial.representativeBuildingIntelligence || {};
  console.log(`\n${metro.metroName}`);
  console.log(`Publisher score/status: ${metro.overallScore}% / ${metro.readinessStatus}`);
  console.log(`Industrial/flex intelligence: ${intelligence.stateLabel || "Missing"} (${intelligence.buildingCount || 0} buildings, ${(intelligence.rolesCovered || []).length || 0} roles)`);
  console.log(`Recommended ecosystem sprint: ${plan && plan.recommendedEcosystemSprint ? plan.recommendedEcosystemSprint.title : "none"}`);
}
if (warnings.length) console.log(`\nWarnings: ${warnings.slice(0, 30).join("; ")}${warnings.length > 30 ? `; +${warnings.length - 30} more` : ""}`);
console.log(`\nErrors: ${errors.length ? errors.join("; ") : "none"}`);

if (errors.length) process.exit(1);
