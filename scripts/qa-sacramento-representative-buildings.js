const fs = require("fs");
const path = require("path");
const graph = require("../_data/locationKnowledgeGraph");
const buildingPages = require("../_data/buildingPages");

const TARGET_DISTRICTS = [
  "downtown-sacramento",
  "midtown-sacramento",
  "arden-point-west",
  "folsom-commercial-core",
  "elk-grove-commercial-core",
];

const GENERIC_PATTERNS = [
  /\bgood for many businesses\b/i,
  /\bwell located\b/i,
  /\bmodern amenities\b/i,
  /\bconvenient access\b/i,
  /\bstrong option\b/i,
  /\bpremier\b/i,
  /\bworld-class\b/i,
  /\bbest-in-class\b/i,
  /\bavailable\b/i,
  /\bvacancy\b/i,
  /\brent\b/i,
  /\brates?\b/i,
];

function normalizeUrl(value) {
  const url = String(value || "").trim();
  if (!url) return "";
  return url.endsWith("/") ? url : `${url}/`;
}

function normalizeText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function meaningful(value, minWords = 5) {
  return normalizeText(value).split(/\s+/).filter(Boolean).length >= minWords;
}

function duplicateValues(values) {
  const seen = new Set();
  const duplicates = [];
  for (const value of values.filter(Boolean)) {
    const normalized = normalizeText(value).toLowerCase();
    if (seen.has(normalized)) duplicates.push(value);
    seen.add(normalized);
  }
  return duplicates;
}

function loadPublisherPlan() {
  const filePath = path.join(__dirname, "../data/generated/publisher-expansion-plans.json");
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

const errors = [];
const warnings = [];
const buildingByPath = new Map(buildingPages.map((building) => [normalizeUrl(building.building_path), building]));
const districtBySlug = new Map(graph.map((node) => [node.slug, node]));

console.log("Sacramento Representative Building QA");

for (const slug of TARGET_DISTRICTS) {
  const district = districtBySlug.get(slug);
  if (!district) {
    errors.push(`${slug}: invented district ID`);
    continue;
  }

  const reps = Array.isArray(district.representativeBuildings) ? district.representativeBuildings : [];
  const paths = reps.map((building) => normalizeUrl(building.path || building.building_path));
  const roles = reps.map((building) => building.representativeRole);

  if (reps.length < 2) {
    warnings.push(`${district.label}: fewer than two credible representative buildings`);
  }
  for (const duplicate of duplicateValues(paths)) {
    errors.push(`${district.label}: duplicate representative building ${duplicate}`);
  }
  for (const duplicate of duplicateValues(roles)) {
    warnings.push(`${district.label}: repeated representative role ${duplicate}`);
  }

  console.log(`\n${district.label}`);
  console.log(`Representative buildings: ${reps.length}`);

  for (const building of reps) {
    const url = normalizeUrl(building.path || building.building_path);
    const record = buildingByPath.get(url);
    const text = [
      building.name,
      building.representativeRole,
      building.representativeReason,
      building.bestFitSummary,
      building.primaryTradeoff,
    ].join(" ");

    if (!building.name) errors.push(`${district.label}: empty card title for ${url || "missing URL"}`);
    if (!building.address) errors.push(`${building.name || url}: missing address`);
    if (!url || !url.startsWith("/commercial-real-estate/building/")) errors.push(`${building.name}: invalid canonical URL ${url}`);
    if (!record) errors.push(`${building.name}: broken canonical URL ${url}`);
    if (!meaningful(building.representativeReason, 7)) errors.push(`${building.name}: missing representative reason`);
    if (!meaningful(building.bestFitSummary, 7)) errors.push(`${building.name}: missing best-fit summary`);
    if (!meaningful(building.primaryTradeoff, 7)) errors.push(`${building.name}: missing primary tradeoff`);
    if (!building.representativeRole) errors.push(`${building.name}: missing representative role`);
    if (!["high", "medium"].includes(building.sourceConfidence)) warnings.push(`${building.name}: source confidence should be high or medium`);
    if (!building.buildingBriefReadiness) warnings.push(`${building.name}: missing Building Brief readiness state`);
    if (record && record.city !== district.city) {
      const sameMetroSuburb = ["Folsom", "Elk Grove"].includes(record.city) && ["Folsom", "Elk Grove"].includes(district.city);
      if (!sameMetroSuburb) warnings.push(`${building.name}: building city ${record.city} differs from district city ${district.city}`);
    }
    for (const pattern of GENERIC_PATTERNS) {
      if (pattern.test(text)) warnings.push(`${building.name}: possible unsupported or generic phrase "${pattern.source}"`);
    }
    if (/\b(undefined|N\/A|\[object Object\])\b/i.test(text)) errors.push(`${building.name}: placeholder output token found`);
    if (/availability|vacancy|lease rate|asking rent/i.test(text)) errors.push(`${building.name}: unsupported production availability claim`);

    const alternatives = Array.isArray(building.nearbyAlternatives) ? building.nearbyAlternatives : [];
    for (const alternative of alternatives) {
      const altUrl = normalizeUrl(alternative.path || alternative.url);
      if (altUrl === url) errors.push(`${building.name}: self-referential alternative`);
      if (altUrl && !buildingByPath.has(altUrl)) errors.push(`${building.name}: broken alternative link ${altUrl}`);
    }

    console.log(`- ${building.name} | ${url} | ${building.representativeRole} | ${building.buildingBriefReadiness}`);
  }
}

const publisherPlan = loadPublisherPlan();
if (publisherPlan) {
  const sacramento = (publisherPlan.metros || []).find((metro) => metro.metroId === "sacramento");
  const completedDistrictNames = new Set(TARGET_DISTRICTS.map((slug) => districtBySlug.get(slug)?.label).filter(Boolean));
  const stillRecommended = (sacramento?.gaps || []).filter((gap) =>
    gap.category === "representativeBuildings" && completedDistrictNames.has(gap.itemName || gap.entityName)
  );

  if (stillRecommended.length) {
    errors.push(`Publisher still recommends completed representative-building tasks: ${stillRecommended.map((gap) => gap.itemName || gap.entityName).join(", ")}`);
  }
}

const serialized = JSON.stringify(TARGET_DISTRICTS.map((slug) => districtBySlug.get(slug)));
["undefined", "N/A", "[object Object]"].forEach((token) => {
  if (serialized.includes(token)) errors.push(`Sacramento representative-building output contains ${token}`);
});

console.log(`\nErrors: ${errors.length ? errors.join("; ") : "none"}`);
console.log(`Warnings: ${warnings.length ? warnings.join("; ") : "none"}`);

if (errors.length) process.exit(1);
