const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const commercialMarketEvidence = require("../_data/commercialMarketEvidence");
const locationKnowledgeGraph = require("../_data/locationKnowledgeGraph");
const buildingPages = require("../_data/buildingPages");

const REQUIRED_RECORD_FIELDS = [
  "id",
  "title",
  "evidenceType",
  "evidenceRole",
  "whyItBelongs",
  "districtFit",
  "typicalUsers",
  "leasingSituations",
  "strengths",
  "tradeoffs",
  "nearbyAlternatives",
  "confidence",
  "publicSources",
];

const ARRAY_FIELDS = new Set([
  "typicalUsers",
  "leasingSituations",
  "strengths",
  "tradeoffs",
  "nearbyAlternatives",
  "publicSources",
]);

const NARRATIVE_FIELDS = [
  "whyItBelongs",
  "districtFit",
];

const VALID_CONFIDENCE_VALUES = new Set([
  "verified_property_fact",
  "source_supported",
  "editorially_supported",
  "representative_inherited",
  "district_inferred",
  "taxonomy_inferred",
  "review_required",
]);

const PLACEHOLDER_PATTERN = /\b(TODO|TBD|N\/A|undefined|null|lorem ipsum|\[object Object\])\b/i;
const MIN_NARRATIVE_WORDS = 12;

const errors = [];
const warnings = [];

function normalizeText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function wordCount(value) {
  return normalizeText(value).split(/\s+/).filter(Boolean).length;
}

function addError(message) {
  errors.push(message);
}

function addWarning(message) {
  warnings.push(message);
}

function uniqueValues(values) {
  return Array.from(new Set(values.filter(Boolean)));
}

function duplicateValues(values) {
  const seen = new Set();
  const duplicates = new Set();
  for (const rawValue of values.filter(Boolean)) {
    const value = normalizeText(rawValue).toLowerCase();
    if (seen.has(value)) duplicates.add(rawValue);
    seen.add(value);
  }
  return Array.from(duplicates);
}

function collectTextValues(value) {
  if (value === null || value === undefined) return [];
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(collectTextValues);
  if (typeof value === "object") return Object.values(value).flatMap(collectTextValues);
  return [String(value)];
}

function isInternalRepositoryPath(value) {
  return /^(docs|_data|data|scripts|lib|functions)\//.test(String(value || ""));
}

function validatePublicSource(recordLabel, source, index) {
  if (!source || typeof source !== "object") {
    addError(`${recordLabel}: publicSources[${index}] must be an object`);
    return;
  }
  if (!normalizeText(source.label)) addError(`${recordLabel}: publicSources[${index}] missing label`);
  if (!normalizeText(source.url)) addError(`${recordLabel}: publicSources[${index}] missing url`);
  if (!normalizeText(source.sourceType)) addError(`${recordLabel}: publicSources[${index}] missing sourceType`);

  if (isInternalRepositoryPath(source.url)) {
    const sourcePath = path.join(ROOT, source.url);
    if (!fs.existsSync(sourcePath)) addError(`${recordLabel}: repository source does not exist: ${source.url}`);
  }
}

function validateRecord(collection, record, context) {
  const recordLabel = `${collection.collectionId || "unknown collection"} / ${record && (record.id || record.title || "unknown record")}`;

  if (!record || typeof record !== "object") {
    addError(`${collection.collectionId}: record must be an object`);
    return;
  }

  for (const field of REQUIRED_RECORD_FIELDS) {
    if (!Object.prototype.hasOwnProperty.call(record, field)) {
      addError(`${recordLabel}: missing required field ${field}`);
      continue;
    }
    const value = record[field];
    if (ARRAY_FIELDS.has(field)) {
      if (!Array.isArray(value)) addError(`${recordLabel}: ${field} must be an array`);
      else if (!value.length) addError(`${recordLabel}: ${field} must not be empty`);
    } else if (!normalizeText(value)) {
      addError(`${recordLabel}: ${field} must not be empty`);
    }
  }

  for (const field of NARRATIVE_FIELDS) {
    if (wordCount(record[field]) < MIN_NARRATIVE_WORDS) {
      addError(`${recordLabel}: ${field} is too short for editorial evidence`);
    }
  }

  if (!VALID_CONFIDENCE_VALUES.has(record.confidence)) {
    addError(`${recordLabel}: invalid confidence value ${record.confidence}`);
  }

  if (record.buildingProfileReference) {
    const normalizedReference = normalizeUrl(record.buildingProfileReference);
    if (!context.buildingProfilePaths.has(normalizedReference)) {
      addError(`${recordLabel}: unresolved Building Profile reference ${record.buildingProfileReference}`);
    }
  }

  for (const source of record.publicSources || []) {
    validatePublicSource(recordLabel, source, (record.publicSources || []).indexOf(source));
  }

  const sourceUrls = (record.publicSources || []).map((source) => normalizeText(source.url));
  for (const duplicate of duplicateValues(sourceUrls)) {
    addError(`${recordLabel}: duplicate public source ${duplicate}`);
  }

  if (duplicateValues([record.whyItBelongs, record.districtFit, ...(record.tradeoffs || []), ...(record.strengths || [])]).length) {
    addError(`${recordLabel}: duplicate descriptions detected within evidence record`);
  }

  for (const field of ["tradeoffs", "nearbyAlternatives"]) {
    if (!Array.isArray(record[field]) || !record[field].length) {
      addError(`${recordLabel}: missing ${field}`);
    }
  }

  const text = collectTextValues(record).join("\n");
  if (PLACEHOLDER_PATTERN.test(text)) {
    addError(`${recordLabel}: contains placeholder value`);
  }
}

function normalizeUrl(url) {
  if (!url) return "";
  return url.endsWith("/") ? url : `${url}/`;
}

function confidenceBucket(confidence) {
  if (confidence === "verified_property_fact" || confidence === "source_supported" || confidence === "editorially_supported") return "High";
  if (confidence === "representative_inherited" || confidence === "district_inferred") return "Medium";
  return "Low";
}

function buildContext() {
  return {
    districtSlugs: new Set((locationKnowledgeGraph || []).map((node) => node.slug).filter(Boolean)),
    buildingProfilePaths: new Set((buildingPages || []).map((building) => normalizeUrl(building.building_path)).filter(Boolean)),
  };
}

function validateCollection(collection, context, collectionIds) {
  if (!collection || typeof collection !== "object") {
    addError("Commercial Market Evidence collection must be an object");
    return;
  }

  if (!normalizeText(collection.collectionId)) addError("Collection missing collectionId");
  else if (collectionIds.has(collection.collectionId)) addError(`Duplicate collectionId ${collection.collectionId}`);
  collectionIds.add(collection.collectionId);

  if (!collection.district || typeof collection.district !== "object") {
    addError(`${collection.collectionId}: missing district identity`);
  } else {
    if (!collection.district.districtId) addError(`${collection.collectionId}: district missing districtId`);
    if (!collection.district.districtName) addError(`${collection.collectionId}: district missing districtName`);
    if (collection.district.districtId && !context.districtSlugs.has(collection.district.districtId)) {
      addError(`${collection.collectionId}: unknown district ${collection.district.districtId}`);
    }
  }

  const relationshipIds = (collection.neighboringDistrictRelationships || collection.records?.[0]?.neighboringDistrictRelationships || [])
    .map((relationship) => relationship && relationship.districtId)
    .filter(Boolean);
  for (const districtId of relationshipIds) {
    if (!context.districtSlugs.has(districtId)) {
      addError(`${collection.collectionId}: unknown neighboring district ${districtId}`);
    }
  }

  if (!Array.isArray(collection.records) || !collection.records.length) {
    addError(`${collection.collectionId}: records must not be empty`);
    return;
  }

  const ids = new Set();
  const titles = [];
  const subjectIds = [];
  const subjectNames = [];
  const narrativeValues = [];

  for (const record of collection.records) {
    if (record.id) {
      if (ids.has(record.id)) addError(`${collection.collectionId}: duplicate evidence id ${record.id}`);
      ids.add(record.id);
    }
    titles.push(record.title);
    subjectIds.push(record.subjectId);
    subjectNames.push(record.subjectName);
    narrativeValues.push(record.whyItBelongs, record.districtFit);
    validateRecord(collection, record, context);
  }

  for (const duplicate of duplicateValues(titles)) addError(`${collection.collectionId}: duplicate title ${duplicate}`);
  for (const duplicate of duplicateValues(subjectIds)) addError(`${collection.collectionId}: duplicate subjectId ${duplicate}`);
  for (const duplicate of duplicateValues(subjectNames)) addError(`${collection.collectionId}: duplicate subjectName ${duplicate}`);
  for (const duplicate of duplicateValues(narrativeValues)) {
    addError(`${collection.collectionId}: duplicate narrative description "${normalizeText(duplicate).slice(0, 80)}"`);
  }

  if (!Array.isArray(collection.deferredCandidates)) {
    addWarning(`${collection.collectionId}: deferredCandidates missing`);
  }
}

function buildSummary(collections) {
  const allRecords = collections.flatMap((collection) => collection.records || []);
  const evidenceTypes = uniqueValues(allRecords.map((record) => record.evidenceTypeLabel || record.evidenceType)).sort();
  const evidenceRoles = uniqueValues(allRecords.map((record) => record.evidenceRoleLabel || record.evidenceRole)).sort();
  const confidence = {};
  const confidenceBuckets = {};
  const districts = uniqueValues(collections.map((collection) => collection.district && collection.district.districtName)).sort();
  const deferredCandidates = collections.reduce((total, collection) => total + ((collection.deferredCandidates || []).length), 0);

  for (const record of allRecords) {
    confidence[record.confidence] = (confidence[record.confidence] || 0) + 1;
    const bucket = confidenceBucket(record.confidence);
    confidenceBuckets[bucket] = (confidenceBuckets[bucket] || 0) + 1;
  }

  return {
    schemaVersion: "commercial-market-evidence-qa-v1",
    collections: collections.length,
    districts,
    evidenceRecords: allRecords.length,
    evidenceTypes,
    evidenceRoles,
    confidence,
    confidenceBuckets,
    deferredCandidates,
    errors,
    warnings,
    validationStatus: errors.length ? "FAIL" : "PASS",
  };
}

function printSummary(summary) {
  console.log("Commercial Market Evidence\n");
  console.log(`Collections: ${summary.collections}`);
  console.log("Districts:");
  for (const district of summary.districts) console.log(`- ${district}`);
  console.log(`\nEvidence Records: ${summary.evidenceRecords}`);
  console.log("Evidence Types:");
  for (const type of summary.evidenceTypes) console.log(`- ${type}`);
  console.log("Evidence Roles:");
  for (const role of summary.evidenceRoles) console.log(`- ${role}`);
  console.log("Confidence:");
  for (const [label, count] of Object.entries(summary.confidenceBuckets)) console.log(`- ${label}: ${count}`);
  console.log(`Deferred Candidates: ${summary.deferredCandidates}`);

  if (warnings.length) {
    console.log("\nWarnings:");
    for (const warning of warnings) console.log(`- ${warning}`);
  }

  if (errors.length) {
    console.log("\nErrors:");
    for (const error of errors) console.log(`- ${error}`);
  }

  console.log(`\nValidation: ${summary.validationStatus}`);
}

function runValidation() {
  errors.length = 0;
  warnings.length = 0;

  const collections = commercialMarketEvidence.collections || [];
  const context = buildContext();
  const collectionIds = new Set();

  if (!Array.isArray(collections) || !collections.length) {
    addError("Commercial Market Evidence collections failed to load or are empty");
  }

  for (const collection of collections) validateCollection(collection, context, collectionIds);

  return buildSummary(collections);
}

if (require.main === module) {
  const summary = runValidation();
  printSummary(summary);
  if (summary.validationStatus !== "PASS") process.exitCode = 1;
}

module.exports = {
  runValidation,
};
