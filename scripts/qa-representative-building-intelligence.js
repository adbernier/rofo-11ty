const ecosystemTaxonomy = require("../_data/commercialEcosystemTaxonomy.js");
const intelligenceTaxonomy = require("../_data/representativeBuildingIntelligenceTaxonomy.js");
const representativeBuildingIntelligence = require("../_data/representativeBuildingIntelligence.js");
const publisherSnapshot = require("../data/generated/publisher-analysis.json");
const publisherPlans = require("../data/generated/publisher-expansion-plans.json");
const { analyzePublisher } = require("../lib/publisher/analyze-metros.js");
const { buildPublisherExpansionPlans } = require("../lib/publisher/expansion-planner.js");

const EXPECTED_SCORES = {
  "san-francisco": { overall: 74, status: "Editorially Developed" },
  sacramento: { overall: 84, status: "Expansion Ready" },
  "san-diego": { overall: 84, status: "Expansion Ready" },
  "orange-county": { overall: 84, status: "Expansion Ready" },
  denver: { overall: 84, status: "Expansion Ready" },
  seattle: { overall: 19, status: "In Development" },
};

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
    requireField(industrial && industrial.readinessState !== "developed", "Sacramento: industrial/flex should remain underdeveloped");
    const intelligence = (industrial && industrial.representativeBuildingIntelligence) || {};
    requireField(industrial && industrial.readinessState === "partial", `Sacramento: industrial/flex should advance to partial after Representative Building foundation, got ${industrial && industrial.readinessState}`);
    requireField(intelligence.state === "developed", `Sacramento: expected developed industrial/flex representative intelligence, got ${intelligence.state}`);
    requireField((intelligence.rolesCovered || []).length >= 6, "Sacramento: industrial/flex representative-role breadth is too narrow after foundation");
    requireField((intelligence.operationalCategoriesCovered || []).includes("access_loading"), "Sacramento: access/loading operational coverage should be detected after foundation");
    requireField(industrial.layers && industrial.layers.buildingBriefs === "missing", "Sacramento: industrial/flex should still expose missing Building Brief depth");
  }
  if (sacramentoPlan && sacramentoPlan.recommendedEcosystemSprint) {
    const sprint = sacramentoPlan.recommendedEcosystemSprint;
    requireField(sprint.ecosystemId === "industrial_flex", `Sacramento: expected industrial/flex sprint, got ${sprint.ecosystemId}`);
    requireField(sprint.title !== "Sacramento Industrial & Flex Ecosystem Representative Building Foundation", "Sacramento: completed representative-building foundation is still recommended");
    requireField(/Building Brief Migration$/.test(sprint.title), `Sacramento: expected next industrial/flex sprint to be Building Brief Migration, got ${sprint.title}`);
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

  const seattle = metroById({ analysis: first }, "seattle");
  if (seattle) {
    requireField(["missing", "thin"].includes(seattle.ecosystemReadiness.state), `Seattle: expected thin/missing ecosystem readiness, got ${seattle.ecosystemReadiness.state}`);
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
