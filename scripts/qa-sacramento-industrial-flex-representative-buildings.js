const fs = require("fs");
const path = require("path");

const graph = require("../_data/locationKnowledgeGraph");
const buildingPages = require("../_data/buildingPages");
const ecosystemTaxonomy = require("../_data/commercialEcosystemTaxonomy");
const intelligenceTaxonomy = require("../_data/representativeBuildingIntelligenceTaxonomy");
const representativeBuildingIntelligence = require("../_data/representativeBuildingIntelligence");

const TARGET_DISTRICTS = [
  "natomas",
  "power-inn-industrial",
  "rancho-cordova-commercial-core",
  "rocklin-commercial-core",
  "west-sacramento-industrial",
];

const REQUIRED_ROLES = [
  "small_bay_service_environment",
  "flex_business_park",
  "contractor_service_cluster",
  "warehouse_distribution_environment",
  "last_mile_logistics_environment",
  "light_manufacturing_environment",
];

const REQUIRED_SUBTYPES = [
  "small_bay_industrial",
  "flex",
  "contractor_service",
  "warehouse",
  "distribution",
  "light_manufacturing",
];

const REQUIRED_OPERATIONAL_CATEGORIES = [
  "access_loading",
  "parking_vehicles",
  "configuration",
  "infrastructure",
  "market_presence",
  "location_workforce",
];

const VISIBLE_TEXT_FIELDS = [
  "name",
  "address",
  "representativeRole",
  "representativeReason",
  "bestFitSummary",
  "primaryTradeoff",
  "buildingType",
];

const GENERIC_PATTERNS = [
  /\bgood location\b/i,
  /\bpopular building\b/i,
  /\bwell-known property\b/i,
  /\bconvenient access\b/i,
  /\bstrong option\b/i,
  /\bmodern amenities\b/i,
  /\bpremier\b/i,
  /\bworld-class\b/i,
  /\bbest-in-class\b/i,
];

const PROHIBITED_PUBLIC_PATTERNS = [
  /\bavailable\b/i,
  /\bvacancy\b/i,
  /\basking rent\b/i,
  /\blease rate\b/i,
  /\bper sqft\b/i,
];

function normalizeUrl(value) {
  const url = String(value || "").trim();
  if (!url) return "";
  return url.endsWith("/") ? url : `${url}/`;
}

function normalizeText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function meaningful(value, minWords = 7) {
  return normalizeText(value).split(/\s+/).filter(Boolean).length >= minWords;
}

function duplicateValues(values) {
  const seen = new Set();
  const duplicates = [];
  for (const value of values.filter(Boolean)) {
    const key = normalizeText(value).toLowerCase();
    if (seen.has(key)) duplicates.push(value);
    seen.add(key);
  }
  return duplicates;
}

function loadJson(relativePath) {
  const filePath = path.join(__dirname, "..", relativePath);
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function hasValidationFocus(building, characteristicIds) {
  const validationText = normalizeText((building.commercialIntelligence?.validationFocus || []).join(" ")).toLowerCase();
  return (characteristicIds || []).every((id) => {
    const characteristic = intelligenceTaxonomy.operationalCharacteristicById[id];
    if (!characteristic || !characteristic.requiresValidation) return true;
    const labelWords = characteristic.label.toLowerCase().split(/[^a-z0-9]+/).filter((word) => word.length > 3);
    return labelWords.some((word) => validationText.includes(word)) ||
      validationText.includes("permitted use") ||
      validationText.includes("loading") ||
      validationText.includes("parking") ||
      validationText.includes("power");
  });
}

const errors = [];
const warnings = [];
const buildingByPath = new Map(buildingPages.map((building) => [normalizeUrl(building.building_path), building]));
const districtBySlug = new Map(graph.map((node) => [node.slug, node]));
const selectedBuildings = [];

console.log("Sacramento Industrial/Flex Representative Building QA");

for (const slug of TARGET_DISTRICTS) {
  const district = districtBySlug.get(slug);
  if (!district) {
    errors.push(`${slug}: invented district ID`);
    continue;
  }

  const ecosystem = district.commercialEcosystem || {};
  if (ecosystem.primary !== "industrial_flex") {
    errors.push(`${district.label}: primary ecosystem should be industrial_flex`);
  }

  const reps = Array.isArray(district.representativeBuildings) ? district.representativeBuildings : [];
  console.log(`\n${district.label}`);
  console.log(`Representative buildings: ${reps.length}`);

  if (!reps.length) warnings.push(`${district.label}: no industrial/flex representative buildings`);
  if (slug !== "rocklin-commercial-core" && reps.length < 3) {
    warnings.push(`${district.label}: fewer than three industrial/flex examples`);
  }

  for (const duplicate of duplicateValues(reps.map((building) => normalizeUrl(building.path)))) {
    errors.push(`${district.label}: duplicate building path ${duplicate}`);
  }

  for (const building of reps) {
    const url = normalizeUrl(building.path);
    const canonical = buildingByPath.get(url);
    const intelligence = building.commercialIntelligence || {};
    const role = intelligenceTaxonomy.representativeRoleById[intelligence.representativeRole];
    const visibleText = VISIBLE_TEXT_FIELDS.map((field) => building[field]).join(" ");
    const allText = JSON.stringify(building);

    selectedBuildings.push({ district, building });
    console.log(`- ${building.name} | ${url} | ${intelligence.representativeRole || building.representativeRole}`);

    if (!building.name) errors.push(`${url || district.label}: empty card title`);
    if (!building.address) errors.push(`${building.name}: missing address`);
    if (!url || !url.startsWith("/commercial-real-estate/building/")) errors.push(`${building.name}: invalid canonical URL ${url}`);
    if (!canonical) errors.push(`${building.name}: missing canonical building record ${url}`);
    if (canonical && canonical.space_type_slug !== "industrial-space") warnings.push(`${building.name}: canonical space type is ${canonical.space_type_slug}`);
    if (!meaningful(building.representativeReason)) errors.push(`${building.name}: missing representative reason`);
    if (!meaningful(building.bestFitSummary)) errors.push(`${building.name}: missing best-fit summary`);
    if (!meaningful(building.primaryTradeoff)) errors.push(`${building.name}: missing primary tradeoff`);
    if (intelligence.primaryEcosystem !== "industrial_flex") errors.push(`${building.name}: primary ecosystem is not industrial_flex`);
    if (!role) errors.push(`${building.name}: invalid representative role ${intelligence.representativeRole}`);
    if (role && role.ecosystemId !== "industrial_flex") errors.push(`${building.name}: role is not industrial/flex`);
    if (!Array.isArray(intelligence.ecosystemSubtypes) || !intelligence.ecosystemSubtypes.length) errors.push(`${building.name}: missing ecosystem subtypes`);
    if (!Array.isArray(intelligence.businessActivities) || !intelligence.businessActivities.length) errors.push(`${building.name}: missing business activities`);
    if (!Array.isArray(intelligence.businessArchetypes) || !intelligence.businessArchetypes.length) errors.push(`${building.name}: missing business archetypes`);
    if (!Array.isArray(intelligence.operationalCharacteristics) || !intelligence.operationalCharacteristics.length) errors.push(`${building.name}: missing operational characteristics`);
    if (!Array.isArray(intelligence.representativeReasons) || !intelligence.representativeReasons.length) errors.push(`${building.name}: missing intelligence representative reasons`);
    if (!Array.isArray(intelligence.validationFocus) || !intelligence.validationFocus.length) errors.push(`${building.name}: missing validation focus`);
    if (!["verified_property_fact", "editorially_supported"].includes(intelligence.confidence)) warnings.push(`${building.name}: confidence is ${intelligence.confidence || "missing"}`);
    if (!hasValidationFocus(building, intelligence.operationalCharacteristics)) {
      errors.push(`${building.name}: validation-required operational characteristics are not covered by validationFocus`);
    }

    let compatibleSubtypeCount = 0;
    for (const subtypeId of intelligence.ecosystemSubtypes || []) {
      const subtype = ecosystemTaxonomy.subtypeById[subtypeId];
      if (!subtype) errors.push(`${building.name}: unknown subtype ${subtypeId}`);
      if (subtype && subtype.ecosystemId !== "industrial_flex") errors.push(`${building.name}: subtype ${subtypeId} is not industrial_flex`);
      if (role && role.compatibleSubtypes.includes(subtypeId)) compatibleSubtypeCount += 1;
    }
    if (role && !compatibleSubtypeCount) warnings.push(`${building.name}: no subtype is expected for role ${role.id}`);
    for (const activityId of intelligence.businessActivities || []) {
      if (!ecosystemTaxonomy.activityById[activityId]) errors.push(`${building.name}: unknown activity ${activityId}`);
    }
    for (const archetypeId of intelligence.businessArchetypes || []) {
      if (!ecosystemTaxonomy.archetypeById[archetypeId]) errors.push(`${building.name}: unknown archetype ${archetypeId}`);
    }
    for (const characteristicId of intelligence.operationalCharacteristics || []) {
      if (!intelligenceTaxonomy.operationalCharacteristicById[characteristicId]) {
        errors.push(`${building.name}: unknown operational characteristic ${characteristicId}`);
      }
    }
    for (const pattern of GENERIC_PATTERNS) {
      if (pattern.test(visibleText)) warnings.push(`${building.name}: generic phrase ${pattern.source}`);
    }
    for (const pattern of PROHIBITED_PUBLIC_PATTERNS) {
      if (pattern.test(visibleText)) errors.push(`${building.name}: unsupported availability or pricing language in visible representative copy`);
    }
    if (/undefined|N\/A|\[object Object\]/.test(allText)) errors.push(`${building.name}: malformed placeholder token`);
  }
}

for (const duplicate of duplicateValues(selectedBuildings.map(({ building }) => normalizeUrl(building.path)))) {
  errors.push(`Duplicate selected building across districts: ${duplicate}`);
}

const coveredRoles = new Set();
const coveredSubtypes = new Set();
const coveredActivities = new Set();
const coveredArchetypes = new Set();
const coveredOperationalCategories = new Set();
const coveredOperationalCharacteristics = new Set();

for (const { building } of selectedBuildings) {
  const intelligence = building.commercialIntelligence || {};
  coveredRoles.add(intelligence.representativeRole);
  (intelligence.ecosystemSubtypes || []).forEach((id) => coveredSubtypes.add(id));
  (intelligence.businessActivities || []).forEach((id) => coveredActivities.add(id));
  (intelligence.businessArchetypes || []).forEach((id) => coveredArchetypes.add(id));
  (intelligence.operationalCharacteristics || []).forEach((id) => {
    coveredOperationalCharacteristics.add(id);
    const characteristic = intelligenceTaxonomy.operationalCharacteristicById[id];
    if (characteristic) coveredOperationalCategories.add(characteristic.category);
  });
}

for (const roleId of REQUIRED_ROLES) {
  if (!coveredRoles.has(roleId)) errors.push(`Target representative role missing: ${roleId}`);
}
for (const subtypeId of REQUIRED_SUBTYPES) {
  if (!coveredSubtypes.has(subtypeId)) errors.push(`Target subtype missing: ${subtypeId}`);
}
for (const categoryId of REQUIRED_OPERATIONAL_CATEGORIES) {
  if (!coveredOperationalCategories.has(categoryId)) errors.push(`Target operational category missing: ${categoryId}`);
}

const publisherAnalysis = loadJson("data/generated/publisher-analysis.json");
const publisherPlan = loadJson("data/generated/publisher-expansion-plans.json");
const analysisMetros = publisherAnalysis?.analysis?.metros || publisherAnalysis?.metros || [];
const sacAnalysis = analysisMetros.find((metro) => metro.metroId === "sacramento");
const sacPlan = publisherPlan?.metros?.find((metro) => metro.metroId === "sacramento");
const industrialEval = sacAnalysis?.ecosystemReadiness?.evaluations?.find((item) => item.ecosystemId === "industrial_flex");
const industrialIntel = industrialEval?.representativeBuildingIntelligence;

if (industrialIntel) {
  if (industrialIntel.buildingCount < selectedBuildings.length) {
    errors.push(`Publisher sees ${industrialIntel.buildingCount} industrial/flex representative buildings but graph has ${selectedBuildings.length}`);
  }
  if (industrialIntel.rolesCovered.length < REQUIRED_ROLES.length) {
    errors.push("Publisher did not detect required representative-role breadth");
  }
  if (industrialIntel.operationalCategoriesCovered.length < REQUIRED_OPERATIONAL_CATEGORIES.length) {
    errors.push("Publisher did not detect required operational-category breadth");
  }
} else {
  warnings.push("Publisher snapshot has not yet been regenerated with Sacramento industrial/flex intelligence");
}

if (sacPlan?.recommendedEcosystemSprint?.title === "Sacramento Industrial & Flex Ecosystem Representative Building Foundation") {
  errors.push("Completed Sacramento industrial/flex Representative Building Foundation sprint is still the recommended ecosystem sprint");
}
if (sacPlan?.recommendedEcosystemSprint?.ecosystemId === "office") {
  errors.push("Office ecosystem sprint outranks remaining industrial/flex dependencies");
}

const normalizedSacramentoRecords = representativeBuildingIntelligence.records.filter((record) =>
  selectedBuildings.some(({ building }) => normalizeUrl(building.path) === normalizeUrl(record.path))
);
if (normalizedSacramentoRecords.length !== selectedBuildings.length) {
  errors.push(`Representative Building Intelligence normalized ${normalizedSacramentoRecords.length} selected records, expected ${selectedBuildings.length}`);
}
for (const record of normalizedSacramentoRecords) {
  if (record.commercialIntelligence.primaryEcosystem !== "industrial_flex") {
    errors.push(`${record.name}: normalized intelligence lost industrial_flex ecosystem`);
  }
}

console.log("\nCoverage Summary");
console.log(`Buildings: ${selectedBuildings.length}`);
console.log(`Districts: ${TARGET_DISTRICTS.length}`);
console.log(`Roles: ${[...coveredRoles].sort().join(", ")}`);
console.log(`Subtypes: ${[...coveredSubtypes].sort().join(", ")}`);
console.log(`Activities: ${[...coveredActivities].sort().join(", ")}`);
console.log(`Archetypes: ${[...coveredArchetypes].sort().join(", ")}`);
console.log(`Operational categories: ${[...coveredOperationalCategories].sort().join(", ")}`);
console.log(`Operational characteristics: ${[...coveredOperationalCharacteristics].sort().join(", ")}`);
console.log(`Publisher industrial/flex state: ${industrialEval?.readinessState || "snapshot-pending"}`);
console.log(`Recommended ecosystem sprint: ${sacPlan?.recommendedEcosystemSprint?.title || "snapshot-pending"}`);

console.log(`\nErrors: ${errors.length ? errors.join("; ") : "none"}`);
console.log(`Warnings: ${warnings.length ? warnings.join("; ") : "none"}`);

if (errors.length) process.exit(1);
