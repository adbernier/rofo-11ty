const taxonomy = require("../_data/commercialEcosystemTaxonomy.js");
const locationGraph = require("../_data/locationKnowledgeGraph.js");
const buildingPages = require("../_data/buildingPages.js");
const rules = require("../data/publisher-rules.js");
const { analyzePublisher } = require("../lib/publisher/analyze-metros.js");

const errors = [];
const warnings = [];

function stableJson(value) {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableJson(value[key])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

function normalizePath(value) {
  const path = String(value || "").trim();
  if (!path) return "";
  return path.endsWith("/") ? path : `${path}/`;
}

function buildingPath(record) {
  return normalizePath(record && (record.building_path || record.canonical_path || record.path || record.url));
}

function textValue(value) {
  if (Array.isArray(value)) return value.map(textValue).join(" ");
  if (value && typeof value === "object") return Object.values(value).map(textValue).join(" ");
  return String(value || "");
}

function validateUnique(items, label) {
  const seen = new Set();
  for (const item of items) {
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
  validateUnique(taxonomy.ecosystems, "ecosystem");
  validateUnique(taxonomy.ecosystemSubtypes, "subtype");
  validateUnique(taxonomy.businessActivities, "activity");
  validateUnique(taxonomy.businessArchetypes, "archetype");

  for (const ecosystem of taxonomy.ecosystems) {
    validateRefs(ecosystem.typicalBusinessActivities, taxonomy.activityById, "activity", `ecosystem ${ecosystem.id}`);
    validateRefs(ecosystem.subtypeIds, taxonomy.subtypeById, "subtype", `ecosystem ${ecosystem.id}`);
    validateRefs(ecosystem.businessArchetypeIds, taxonomy.archetypeById, "archetype", `ecosystem ${ecosystem.id}`);
  }
  for (const subtype of taxonomy.ecosystemSubtypes) {
    if (!taxonomy.ecosystemById[subtype.ecosystemId]) errors.push(`subtype ${subtype.id}: unknown ecosystem ${subtype.ecosystemId}`);
  }
  for (const activity of taxonomy.businessActivities) {
    validateRefs(activity.ecosystemIds, taxonomy.ecosystemById, "ecosystem", `activity ${activity.id}`);
    validateRefs(activity.subtypeIds, taxonomy.subtypeById, "subtype", `activity ${activity.id}`);
  }
  for (const archetype of taxonomy.businessArchetypes) {
    validateRefs(archetype.primaryActivities, taxonomy.activityById, "activity", `archetype ${archetype.id}`);
    validateRefs(archetype.secondaryActivities, taxonomy.activityById, "activity", `archetype ${archetype.id}`);
    validateRefs(archetype.preferredEcosystems, taxonomy.ecosystemById, "ecosystem", `archetype ${archetype.id}`);
    validateRefs(archetype.possibleEcosystemAlternatives, taxonomy.ecosystemById, "ecosystem", `archetype ${archetype.id}`);
  }
}

function validateDistrictEcosystem(district) {
  const ecosystem = district.commercialEcosystem || {};
  const label = district.slug || district.label || "district";
  if (!ecosystem.primary) {
    errors.push(`${label}: recommendation-active district missing primary ecosystem`);
    return;
  }
  if (!taxonomy.ecosystemById[ecosystem.primary]) errors.push(`${label}: unknown primary ecosystem ${ecosystem.primary}`);
  if (ecosystem.confidence === "review_required") warnings.push(`${label}: district classification requires review`);
  (ecosystem.secondary || []).forEach((id) => {
    if (!taxonomy.ecosystemById[id]) errors.push(`${label}: unknown secondary ecosystem ${id}`);
    if (id === ecosystem.primary) errors.push(`${label}: secondary ecosystem duplicates primary ${id}`);
  });
  (ecosystem.subtypes || []).forEach((id) => {
    const subtype = taxonomy.subtypeById[id];
    if (!subtype) {
      errors.push(`${label}: unknown subtype ${id}`);
    } else if (subtype.ecosystemId !== ecosystem.primary && !(ecosystem.secondary || []).includes(subtype.ecosystemId)) {
      errors.push(`${label}: subtype ${id} belongs to ${subtype.ecosystemId}, not a declared ecosystem`);
    }
  });
  validateRefs(ecosystem.activities, taxonomy.activityById, "activity", label);
  validateRefs(ecosystem.archetypes, taxonomy.archetypeById, "archetype", label);
  if ((ecosystem.secondary || []).length === 0 && Object.keys(district.spaceTypeFit || {}).length > 2) {
    warnings.push(`${label}: mixed-use district has only one ecosystem`);
  }
}

function validateBuildingAlignment(districtsByPath) {
  const buildingByPath = new Map((Array.isArray(buildingPages) ? buildingPages : []).map((record) => [buildingPath(record), record]).filter(([path]) => path));
  for (const district of locationGraph.filter((node) => node.type === "district")) {
    for (const item of district.representativeBuildings || []) {
      const path = normalizePath(item.path || item.building_path || item.canonical_path || item.url);
      const label = item.name || item.address || path || `${district.slug}: representative building`;
      const explicit = item.commercialEcosystem || {};
      if (explicit.primary && !taxonomy.ecosystemById[explicit.primary]) errors.push(`${label}: unknown representative-building ecosystem ${explicit.primary}`);
      (explicit.subtypes || []).forEach((id) => {
        if (!taxonomy.subtypeById[id]) errors.push(`${label}: unknown representative-building subtype ${id}`);
      });
      if (!explicit.primary && !district.commercialEcosystem) warnings.push(`${label}: representative building lacks explicit or inherited ecosystem`);
      if (path && !buildingByPath.has(path)) warnings.push(`${label}: representative building lacks canonical page record for ecosystem inheritance validation`);
    }
  }

  for (const building of buildingByPath.values()) {
    if (!building.building_brief) continue;
    const path = buildingPath(building);
    const areaPath = normalizePath(building.commercial_area && building.commercial_area.path);
    const district = districtsByPath.get(areaPath);
    const explicit = building.commercialEcosystem || building.commercial_ecosystem || {};
    if (!explicit.primary && !district) {
      warnings.push(`${building.display_name || building.name || path}: Building Brief lacks explicit or inherited ecosystem`);
    }
    if (explicit.primary && !taxonomy.ecosystemById[explicit.primary]) errors.push(`${building.display_name || path}: unknown Building Brief ecosystem ${explicit.primary}`);
    (explicit.subtypes || []).forEach((id) => {
      if (!taxonomy.subtypeById[id]) errors.push(`${building.display_name || path}: unknown Building Brief subtype ${id}`);
    });
  }
}

function validatePublisherOutput() {
  const first = analyzePublisher({ generatedAt: "2026-07-21T00:00:00.000Z" });
  const second = analyzePublisher({ generatedAt: "2026-07-21T00:00:00.000Z" });
  if (stableJson(first) !== stableJson(second)) errors.push("Publisher ecosystem output is not deterministic.");
  for (const metro of first.metros || []) {
    if (!metro.ecosystemCoverage || !metro.ecosystemCoverage.ecosystems) {
      errors.push(`${metro.metroName}: Publisher ecosystem coverage missing`);
      continue;
    }
    const ecosystems = metro.ecosystemCoverage.ecosystems;
    for (const ecosystem of taxonomy.ecosystems) {
      if (!ecosystems[ecosystem.id]) errors.push(`${metro.metroName}: missing Publisher ecosystem bucket ${ecosystem.id}`);
    }
    if (metro.metroId !== "seattle" && (!ecosystems.industrial_flex || ecosystems.industrial_flex.status === "Missing")) {
      warnings.push(`${metro.metroName}: metro has no industrial/flex district`);
    }
    const totalPrimary = Object.values(ecosystems).reduce((total, item) => total + (item.districtCount || 0), 0);
    const officePrimary = ecosystems.office ? ecosystems.office.districtCount || 0 : 0;
    if (totalPrimary >= 4 && officePrimary / totalPrimary >= 0.75) {
      warnings.push(`${metro.metroName}: ecosystem coverage is heavily concentrated in office`);
    }
  }
  return first;
}

validateTaxonomy();

const districts = locationGraph.filter((node) => node.type === "district");
const districtsByPath = new Map(districts.map((district) => [normalizePath(district.path), district]).filter(([path]) => path));
districts.forEach(validateDistrictEcosystem);
validateBuildingAlignment(districtsByPath);
const analysis = validatePublisherOutput();

const serialized = textValue([
  taxonomy,
  districts.map((district) => ({ slug: district.slug, commercialEcosystem: district.commercialEcosystem })),
  (analysis.metros || []).map((metro) => ({ metroId: metro.metroId, ecosystemCoverage: metro.ecosystemCoverage })),
]);
["undefined", "N/A", "[object Object]"].forEach((token) => {
  if (serialized.includes(token)) errors.push(`Commercial ecosystem output contains ${token}`);
});

console.log("Commercial Ecosystem Foundation QA");
console.log(`Ecosystems: ${taxonomy.ecosystems.length}`);
console.log(`Subtypes: ${taxonomy.ecosystemSubtypes.length}`);
console.log(`Activities: ${taxonomy.businessActivities.length}`);
console.log(`Archetypes: ${taxonomy.businessArchetypes.length}`);
console.log(`Districts classified: ${districts.length}`);
for (const metro of analysis.primaryMetros || []) {
  const ecosystems = metro.ecosystemCoverage.ecosystems;
  console.log(`\n${metro.metroName}`);
  console.log(`Districts: ${metro.districtCount}`);
  console.log(`Office: ${ecosystems.office.status} (${ecosystems.office.districtCount} districts, ${ecosystems.office.representativeBuildingCount} reps, ${ecosystems.office.buildingBriefCount} briefs)`);
  console.log(`Industrial/Flex: ${ecosystems.industrial_flex.status} (${ecosystems.industrial_flex.districtCount} districts, ${ecosystems.industrial_flex.representativeBuildingCount} reps, ${ecosystems.industrial_flex.buildingBriefCount} briefs)`);
  console.log(`Life Science: ${ecosystems.life_science.status} (${ecosystems.life_science.districtCount} districts, ${ecosystems.life_science.representativeBuildingCount} reps, ${ecosystems.life_science.buildingBriefCount} briefs)`);
  console.log(`Review required: ${metro.ecosystemCoverage.summary.reviewRequiredDistrictCount}`);
}
console.log(`\nErrors: ${errors.length ? errors.join("; ") : "none"}`);
console.log(`Warnings: ${warnings.length ? warnings.join("; ") : "none"}`);

if (errors.length) process.exit(1);
