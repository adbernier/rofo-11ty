const locationGraph = require("./locationKnowledgeGraph");
const buildingPages = require("./buildingPages");
const commercialBuildingIntelligence = require("./commercialBuildingIntelligence");
const ecosystemTaxonomy = require("./commercialEcosystemTaxonomy");
const intelligenceTaxonomy = require("./representativeBuildingIntelligenceTaxonomy");

const CONFIDENCE = {
  explicit: "editorially_supported",
  property: "verified_property_fact",
  district: "district_inferred",
  taxonomy: "taxonomy_inferred",
  review: "review_required",
};

function clean(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function slugify(value) {
  return clean(value)
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizePath(value) {
  const path = clean(value);
  if (!path) return "";
  return path.endsWith("/") ? path : `${path}/`;
}

function buildingPath(record) {
  return normalizePath(record && (record.building_path || record.canonical_path || record.path || record.url));
}

function unique(values) {
  const seen = new Set();
  return (values || [])
    .map(clean)
    .filter(Boolean)
    .filter((value) => {
      if (seen.has(value)) return false;
      seen.add(value);
      return true;
    });
}

function firstKnown(...values) {
  return values.map(clean).find(Boolean) || "";
}

function districtEcosystem(district) {
  return (district && district.commercialEcosystem) || {};
}

function explicitCommercialIntelligence(item, record) {
  return (item && item.commercialIntelligence) ||
    (item && item.commercial_intelligence) ||
    (record && record.representative_building_intelligence) ||
    null;
}

function explicitEcosystem(item, record) {
  return (item && item.commercialEcosystem) ||
    (record && (record.commercialEcosystem || record.commercial_ecosystem)) ||
    {};
}

function roleIdFromText(value) {
  const text = Array.isArray(value) ? value.map(clean).join(" ").toLowerCase() : clean(value).toLowerCase();
  if (!text) return "";
  if (text.includes("life science") || text.includes("lab") || text.includes("research")) return "life_science_campus";
  if (text.includes("medical") || text.includes("patient")) return "medical_office_environment";
  if (text.includes("government") || text.includes("civic") || text.includes("capitol")) return "government_office_environment";
  if (text.includes("creative") || text.includes("adaptive") || text.includes("historic")) return "creative_office_environment";
  if (text.includes("campus")) return "suburban_office_campus";
  if (text.includes("transit")) return "transit_oriented_office_environment";
  if (text.includes("executive")) return "executive_office_environment";
  if (text.includes("professional")) return "professional_office_environment";
  if (text.includes("production") || text.includes("flex")) return "flex_business_park";
  if (text.includes("warehouse") || text.includes("distribution")) return "warehouse_distribution_environment";
  if (text.includes("service") || text.includes("contractor")) return "contractor_service_cluster";
  if (text.includes("small-bay") || text.includes("small bay")) return "small_bay_service_environment";
  return "";
}

function roleForEcosystem(primary, subtypes, sourceRole, district) {
  const explicitRole = clean(sourceRole);
  if (intelligenceTaxonomy.representativeRoleById[explicitRole]) return explicitRole;
  const textRole = roleIdFromText(explicitRole);
  if (textRole && intelligenceTaxonomy.representativeRoleById[textRole]) {
    const candidate = intelligenceTaxonomy.representativeRoleById[textRole];
    if (candidate.ecosystemId === primary) return textRole;
  }

  const subtypeSet = new Set(subtypes || []);
  if (primary === "industrial_flex") {
    if (subtypeSet.has("contractor_yard") || subtypeSet.has("contractor_service")) return "contractor_service_cluster";
    if (subtypeSet.has("small_bay_industrial")) return "small_bay_service_environment";
    if (subtypeSet.has("showroom_flex")) return "showroom_flex_environment";
    if (subtypeSet.has("food_production")) return "food_production_environment";
    if (subtypeSet.has("last_mile_logistics")) return "last_mile_logistics_environment";
    if (subtypeSet.has("distribution") || subtypeSet.has("warehouse")) return "warehouse_distribution_environment";
    if (subtypeSet.has("light_manufacturing") || subtypeSet.has("manufacturing")) return "light_manufacturing_environment";
    if (subtypeSet.has("research_development")) return "research_development_environment";
    if (subtypeSet.has("flex")) return "flex_business_park";
    return "urban_industrial_environment";
  }
  if (primary === "life_science") {
    if (subtypeSet.has("wet_lab") || subtypeSet.has("research_lab") || subtypeSet.has("biotech_research")) return "research_lab_environment";
    return "life_science_campus";
  }
  if (primary === "medical") {
    if (subtypeSet.has("hospital_adjacent")) return "hospital_adjacent_medical_environment";
    if (subtypeSet.has("outpatient_clinic")) return "outpatient_clinic_environment";
    return "medical_office_environment";
  }
  if (primary === "retail") {
    if (subtypeSet.has("showroom_retail")) return "showroom_retail_environment";
    if (subtypeSet.has("shopping_center") || subtypeSet.has("lifestyle_retail")) return "destination_retail_environment";
    return "neighborhood_service_retail";
  }
  if (primary === "special_purpose") {
    if (subtypeSet.has("automotive")) return "automotive_service_environment";
    if (subtypeSet.has("education")) return "education_environment";
    return "institutional_environment";
  }
  if (primary === "office") {
    const districtSlug = slugify(district && (district.slug || district.label));
    if (subtypeSet.has("creative_office")) return "creative_office_environment";
    if (subtypeSet.has("office_campus") || subtypeSet.has("suburban_office")) return "suburban_office_campus";
    if (subtypeSet.has("government_office")) return "government_office_environment";
    if (subtypeSet.has("executive_office")) return "executive_office_environment";
    if (districtSlug.includes("downtown") || subtypeSet.has("downtown_office")) return "downtown_class_a_office";
    return "professional_office_environment";
  }
  return "";
}

function roleCandidateFromSource(value) {
  const roleId = roleIdFromText(value);
  return roleId ? intelligenceTaxonomy.representativeRoleById[roleId] || null : null;
}

function primaryFromSourceText(value) {
  const text = Array.isArray(value) ? value.map(clean).join(" ").toLowerCase() : clean(value).toLowerCase();
  if (!text) return "";
  if (text.includes("life science") || text.includes("biotech") || text.includes("lab") || text.includes("research")) return "life_science";
  if (text.includes("medical") || text.includes("clinical") || text.includes("health")) return "medical";
  if (text.includes("production") || text.includes("flex") || text.includes("industrial") || text.includes("maker") || text.includes("warehouse")) return "industrial_flex";
  if (text.includes("showroom") || text.includes("retail") || text.includes("restaurant")) return "retail";
  if (text.includes("institutional") || text.includes("education") || text.includes("event") || text.includes("entertainment")) return "special_purpose";
  return "";
}

function filteredSubtypesForPrimary(values, primary) {
  return unique(values).filter((id) => {
    const subtype = ecosystemTaxonomy.subtypeById[id];
    return subtype && subtype.ecosystemId === primary;
  });
}

function characteristicsForRole(role) {
  return role && Array.isArray(role.commonOperationalCharacteristics) ? role.commonOperationalCharacteristics : [];
}

function profileFor(characteristicIds) {
  const result = intelligenceTaxonomy.operationalCharacteristicCategories.reduce((acc, category) => {
    acc[category.id] = [];
    return acc;
  }, {});
  for (const id of characteristicIds || []) {
    const characteristic = intelligenceTaxonomy.operationalCharacteristicById[id];
    if (!characteristic || !result[characteristic.category]) continue;
    result[characteristic.category].push(id);
  }
  return result;
}

function sourceConfidence(item, record, explicit) {
  if (explicit && explicit.confidence) return clean(explicit.confidence);
  if (item && item.sourceConfidence === "high") return CONFIDENCE.explicit;
  if (record && record.source_confidence === "high") return CONFIDENCE.explicit;
  if (item && item.sourceConfidence) return CONFIDENCE.district;
  if (record && record.source_confidence) return CONFIDENCE.district;
  return CONFIDENCE.review;
}

function validationFocus(explicit, item, role, characteristics) {
  const explicitFocus = explicit && (explicit.validationFocus || explicit.validation_focus);
  const sourceQuestions = item && item.validationFocus;
  const labels = characteristics
    .map((id) => intelligenceTaxonomy.operationalCharacteristicById[id])
    .filter((value) => value && value.requiresValidation)
    .map((value) => value.label);
  return unique([...(explicitFocus || []), ...(sourceQuestions || []), ...labels, "Permitted uses", "Current suite configuration"]).slice(0, 8);
}

function representativeReasons(explicit, item, record, role, district) {
  const values = [];
  if (explicit) values.push(...(explicit.representativeReasons || explicit.representative_reasons || []));
  values.push(
    item && (item.representativeReason || item.editorialReason || item.reason),
    record && (record.editorial_reason || record.shortlist_reason),
    role && role.editorialPurpose ? `${role.editorialPurpose} ${district && district.label ? `in ${district.label}.` : ""}` : ""
  );
  return unique(values).slice(0, 4);
}

function tradeoffs(explicit, item, record, role) {
  const values = [];
  if (explicit) values.push(...(explicit.tradeoffs || []));
  values.push(
    item && item.primaryTradeoff,
    record && Array.isArray(record.tradeoffs) ? record.tradeoffs[0] : "",
    role && role.ecosystemId === "industrial_flex" ? "Operational details such as loading, parking, permitted uses, and suite condition must be validated before relying on the example." : "",
    role && role.ecosystemId === "office" ? "Tenant fit can change materially by floorplate, lease economics, parking, and visitor-access expectations." : "",
    role && role.ecosystemId === "medical" ? "Patient access, plumbing, accessibility, and buildout compatibility should be validated building by building." : ""
  );
  return unique(values).slice(0, 4);
}

function buildRecord(source, buildingByPath, districtsByPath) {
  const { district, item } = source;
  const path = buildingPath(item);
  const record = buildingByPath.get(path) || null;
  const districtEco = districtEcosystem(district);
  const explicit = explicitCommercialIntelligence(item, record);
  const explicitEco = explicitEcosystem(item, record);
  const roleText = [
    (explicit && explicit.representativeRole) || item.representativeRole || record && record.editorial_role,
    ...(item.representativeThemes || []),
  ];
  const sourceRoleCandidate = roleCandidateFromSource(roleText);
  const candidatePrimary = sourceRoleCandidate &&
    sourceRoleCandidate.ecosystemId !== districtEco.primary &&
    ((districtEco.secondary || []).includes(sourceRoleCandidate.ecosystemId) || districtEco.primary === "office" || !districtEco.primary)
    ? sourceRoleCandidate.ecosystemId
    : "";
  const textPrimary = primaryFromSourceText(roleText);
  const primary = clean((explicit && (explicit.primaryEcosystem || explicit.primary_ecosystem)) || explicitEco.primary || candidatePrimary || districtEco.primary || textPrimary || "office");
  let ecosystemSubtypes = filteredSubtypesForPrimary([
    ...((explicit && (explicit.ecosystemSubtypes || explicit.ecosystem_subtypes)) || []),
    ...(explicitEco.subtypes || []),
    ...((districtEco && districtEco.subtypes) || []),
  ], primary);
  const roleId = roleForEcosystem(primary, ecosystemSubtypes, roleText, district);
  const role = intelligenceTaxonomy.representativeRoleById[roleId] || null;
  if (!ecosystemSubtypes.length && role) ecosystemSubtypes = role.compatibleSubtypes.slice(0, 2);
  const activities = unique([
    ...((explicit && (explicit.businessActivities || explicit.business_activities)) || []),
    ...(role ? role.expectedActivityPatterns : []),
    ...((districtEco && districtEco.activities) || []),
  ]).slice(0, 8);
  const archetypes = unique([
    ...((explicit && (explicit.businessArchetypes || explicit.business_archetypes)) || []),
    ...((districtEco && districtEco.archetypes) || []),
    ...((primary && ecosystemTaxonomy.ecosystemById[primary] ? ecosystemTaxonomy.ecosystemById[primary].businessArchetypeIds : []) || []),
  ]).slice(0, 8);
  const characteristics = unique([
    ...((explicit && (explicit.operationalCharacteristics || explicit.operational_characteristics)) || []),
    ...characteristicsForRole(role),
  ]).slice(0, 10);
  const confidence = sourceConfidence(item, record, explicit);
  const inheritedOnly = !explicit && !item.representativeReason && !record;
  const reviewRequired = confidence === CONFIDENCE.review || !primary || !roleId || inheritedOnly;

  return {
    buildingId: clean((explicit && explicit.buildingId) || record && record.building_path || path || `${district && district.slug}:${item.name || item.address}`),
    name: firstKnown(item && item.name, record && (record.display_name || record.name), item && item.address),
    address: firstKnown(item && item.address, record && record.address),
    path,
    city: firstKnown(record && record.city, district && district.city),
    state: firstKnown(record && record.state_abbr, district && district.state),
    districtSlug: clean(district && district.slug),
    districtName: clean(district && (district.label || district.slug)),
    districtPath: normalizePath(district && district.path),
    source: source.source,
    hasCanonicalRecord: Boolean(record),
    buildingBriefStatus: record && record.building_brief ? "published" : clean(item && item.buildingBriefReadiness),
    buildingBriefPath: record && record.building_brief ? path : "",
    commercialIntelligence: {
      primaryEcosystem: primary,
      ecosystemSubtypes,
      representativeRole: roleId,
      businessActivities: activities,
      businessArchetypes: archetypes,
      operationalCharacteristics: characteristics,
      representativeReasons: representativeReasons(explicit, item, record, role, district),
      tradeoffs: tradeoffs(explicit, item, record, role),
      validationFocus: validationFocus(explicit, item, role, characteristics),
      confidence: reviewRequired ? CONFIDENCE.review : confidence,
      provenance: {
        primaryEcosystem: explicit && (explicit.primaryEcosystem || explicit.primary_ecosystem) ? "explicit" : explicitEco.primary ? "canonical_building" : districtEco.primary ? "district" : "review_required",
        ecosystemSubtypes: explicit && (explicit.ecosystemSubtypes || explicit.ecosystem_subtypes) ? "explicit" : explicitEco.subtypes ? "canonical_building" : ecosystemSubtypes.length ? "district" : "review_required",
        representativeRole: explicit && explicit.representativeRole ? "explicit" : item && item.representativeRole ? "source_record" : roleId ? "taxonomy_inferred" : "review_required",
        businessActivities: explicit && (explicit.businessActivities || explicit.business_activities) ? "explicit" : role ? "representative_role" : districtEco.activities ? "district" : "review_required",
        businessArchetypes: explicit && (explicit.businessArchetypes || explicit.business_archetypes) ? "explicit" : districtEco.archetypes ? "district" : "taxonomy_inferred",
        operationalCharacteristics: explicit && (explicit.operationalCharacteristics || explicit.operational_characteristics) ? "explicit" : role ? "representative_role" : "review_required",
      },
      reviewRequired,
    },
    operationalCharacteristicProfile: profileFor(characteristics),
  };
}

function collectSources() {
  const buildingByPath = new Map((Array.isArray(buildingPages) ? buildingPages : []).map((record) => [buildingPath(record), record]).filter(([path]) => path));
  const commercialByPath = new Map((commercialBuildingIntelligence.canonicalBuildings || []).map((record) => [normalizePath(record.building_path), record]).filter(([path]) => path));
  const districtsByPath = new Map(locationGraph.filter((node) => node.type === "district").map((district) => [normalizePath(district.path), district]).filter(([path]) => path));
  const sources = [];
  const seen = new Set();

  for (const district of locationGraph.filter((node) => node.type === "district")) {
    for (const item of district.representativeBuildings || []) {
      const path = buildingPath(item);
      const key = path || `${district.slug}:${item.name || item.address}`;
      if (!key || seen.has(key)) continue;
      seen.add(key);
      const commercialRecord = commercialByPath.get(path);
      sources.push({
        district,
        item: {
          ...item,
          commercialIntelligence: item.commercialIntelligence || item.commercial_intelligence || (commercialRecord && (commercialRecord.commercialIntelligence || commercialRecord.commercial_intelligence)) || null,
        },
        source: "location_knowledge_graph",
      });
    }
  }

  for (const building of buildingByPath.values()) {
    if (!building.editorial_representative && !building.building_brief) continue;
    const district = districtsByPath.get(normalizePath(building.commercial_area && building.commercial_area.path));
    if (!district) continue;
    const path = buildingPath(building);
    if (!path || seen.has(path)) continue;
    seen.add(path);
    const commercialRecord = commercialByPath.get(path);
    sources.push({
      district,
      item: {
        ...building,
        commercialIntelligence: building.commercialIntelligence || building.commercial_intelligence || building.representative_building_intelligence || (commercialRecord && (commercialRecord.commercialIntelligence || commercialRecord.commercial_intelligence)) || null,
      },
      source: building.building_brief ? "building_brief" : "canonical_building",
    });
  }

  for (const canonical of commercialBuildingIntelligence.canonicalBuildings || []) {
    const path = normalizePath(canonical.building_path);
    if (!path || seen.has(path)) continue;
    const canonicalDistrict = (canonical.identity || {}).canonicalDistrict || {};
    const districtPath = normalizePath(canonicalDistrict.path);
    const district = districtsByPath.get(districtPath) || {
      slug: slugify(canonicalDistrict.name || districtPath),
      label: canonicalDistrict.name || "Representative district",
      city: (canonical.identity || {}).city,
      state: (canonical.identity || {}).state_abbr,
      path: districtPath,
      commercialEcosystem: {},
    };
    seen.add(path);
    sources.push({
      district,
      source: "commercial_building_intelligence",
      item: {
        name: (canonical.identity || {}).name,
        address: (canonical.identity || {}).address,
        path,
        representativeRole: (canonical.editorial || {}).editorialRole,
        representativeReason: (canonical.editorial || {}).editorialReason,
        representativeThemes: (canonical.editorial || {}).representativeThemes || [],
        commercialIntelligence: canonical.commercialIntelligence || canonical.commercial_intelligence || null,
        sourceConfidence: (canonical.quality || {}).sourceConfidence,
        buildingBriefReadiness: "commercial-building-intelligence",
      },
    });
  }

  return { sources, buildingByPath, districtsByPath };
}

function buildRepresentativeBuildingIntelligence() {
  const { sources, buildingByPath, districtsByPath } = collectSources();
  const records = sources
    .map((source) => buildRecord(source, buildingByPath, districtsByPath))
    .sort((a, b) => a.districtName.localeCompare(b.districtName) || a.name.localeCompare(b.name) || a.path.localeCompare(b.path));
  return {
    schemaVersion: 1,
    generatedFrom: [
      "_data/locationKnowledgeGraph.js representativeBuildings",
      "_data/buildingPages.js editorial_representative/building_brief records",
      "_data/commercialBuildingIntelligence.js canonicalBuildings",
    ],
    inheritanceOrder: [
      "canonical building identity",
      "representative building source item",
      "district commercial ecosystem",
      "representative role taxonomy",
      "Building Brief explicit editorial content",
    ],
    records,
    byPath: records.reduce((result, record) => {
      if (record.path) result[record.path] = record;
      return result;
    }, {}),
    byBuildingId: records.reduce((result, record) => {
      if (record.buildingId) result[record.buildingId] = record;
      return result;
    }, {}),
    stats: {
      recordCount: records.length,
      explicitCount: records.filter((record) => record.commercialIntelligence.confidence === CONFIDENCE.explicit).length,
      reviewRequiredCount: records.filter((record) => record.commercialIntelligence.reviewRequired).length,
      buildingBriefCount: records.filter((record) => record.buildingBriefStatus === "published").length,
    },
  };
}

const intelligence = buildRepresentativeBuildingIntelligence();

module.exports = {
  ...intelligence,
  buildRepresentativeBuildingIntelligence,
  normalizePath,
  profileFor,
};
