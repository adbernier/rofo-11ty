const rules = require("../../data/publisher-rules.js");
const locationGraph = require("../../_data/locationKnowledgeGraph.js");
const recommendationQaStatus = require("../../_data/recommendationQaStatus.js");
const buildingPages = require("../../_data/buildingPages.js");
const neighborhoodPages = require("../../_data/neighborhoodPages.js");
const locationComparisonPages = require("../../_data/locationComparisonPages.js");
const commercialBuildingComparisonsData = require("../../_data/commercialBuildingComparisons.js");
const citiesData = require("../../_data/cities.js");
const commercialEcosystemTaxonomy = require("../../_data/commercialEcosystemTaxonomy.js");
const representativeBuildingIntelligence = require("../../_data/representativeBuildingIntelligence.js");
const representativeBuildingIntelligenceTaxonomy = require("../../_data/representativeBuildingIntelligenceTaxonomy.js");

const CATEGORY_LABELS = {
  metroFoundation: "Metro Foundation",
  districtCoverage: "District Coverage",
  comparisonGraph: "Comparison Graph",
  representativeBuildings: "Representative Buildings",
  buildingBriefs: "Building Briefs",
  recommendationReadiness: "Recommendation Readiness",
  editorialQuality: "Editorial Quality",
  internalLinking: "Internal Linking",
};

const READINESS_LABELS = {
  developed: "Developed",
  strong: "Strong",
  partial: "Partial",
  thin: "Thin",
  missing: "Missing",
  not_applicable: "Not Applicable",
  review_required: "Review Required",
};

const RELEVANCE_LABELS = {
  core: "Core",
  important: "Important",
  secondary: "Secondary",
  specialized: "Specialized",
  not_applicable: "Not Applicable",
  review_required: "Review Required",
};

function slugify(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizePath(value) {
  const path = String(value || "").trim();
  if (!path) return "";
  return path.endsWith("/") ? path : `${path}/`;
}

function textValue(value) {
  if (Array.isArray(value)) return value.map(textValue).join(" ");
  if (value && typeof value === "object") return Object.values(value).map(textValue).join(" ");
  return String(value || "");
}

function hasText(value, min = 1) {
  return textValue(value).trim().length >= min;
}

function arrayCount(value) {
  return Array.isArray(value) ? value.filter(Boolean).length : 0;
}

function scoreRatio(completed, total) {
  if (!total) return 100;
  return Math.max(0, Math.min(100, Math.round((completed / total) * 100)));
}

function issue(id, metro, category, taskType, itemName, severity, reason, options = {}) {
  return {
    id: `${metro.id}:${category}:${taskType}:${slugify(options.sourceId || itemName || id || Math.random())}`,
    code: options.code || id,
    metroId: metro.id,
    metroName: metro.name,
    category,
    categoryLabel: CATEGORY_LABELS[category] || category,
    taskType,
    itemName,
    severity,
    priority: rules.severityWeights[severity] || 0,
    reason,
    sourceId: options.sourceId || "",
    publicUrl: options.publicUrl || "",
    adminUrl: options.adminUrl || "",
    suggestedNextAction: options.suggestedNextAction || reason,
    automationCandidate: Boolean(options.automationCandidate),
    readinessState: options.readinessState || "",
  };
}

function gateBlocker(gate, severity, code, message, options = {}) {
  return {
    gate,
    severity,
    code,
    message,
    sourceId: options.sourceId || "",
    relatedTaskId: options.relatedTaskId || "",
  };
}

function category(key, completed, total, explanation, issues = []) {
  const baseScore = scoreRatio(completed, total);
  const hasCritical = issues.some((item) => item.severity === "critical");
  const highCount = issues.filter((item) => item.severity === "high").length;
  const score = Math.max(0, Math.min(100, baseScore - (hasCritical ? 20 : 0) - Math.min(highCount * 5, 20)));
  return {
    key,
    label: CATEGORY_LABELS[key],
    score,
    completed,
    total,
    missing: Math.max(total - completed, 0),
    explanation,
    issues,
  };
}

function primaryCityPath(metro, cities) {
  const city = cities.find((item) =>
    String(item.city || "").toLowerCase() === metro.primaryCity.toLowerCase() &&
    String(item.state_abbr || "").toUpperCase() === metro.state
  );
  if (!city) return "";
  return normalizePath(`/commercial-real-estate/${city.state_abbr}/${city.slug || slugify(city.city)}/`);
}

function qaForMetro(metro) {
  for (const alias of metro.compassAliases || [metro.id]) {
    if (recommendationQaStatus[alias]) return recommendationQaStatus[alias];
  }
  return null;
}

function isCompassReady(metro, qa) {
  return Boolean(qa && qa.qaStatus === "completed" && /compass_ready|pilot_passed/.test(String(qa.validationStatus || "")));
}

function qaState(qa) {
  if (!qa) return "missing";
  if (qa.qaStatus === "completed" && /compass_ready|pilot_passed/.test(String(qa.validationStatus || ""))) return "passed";
  if (qa.qaStatus === "completed") return "completed-not-ready";
  if (qa.qaStatus === "needs_review") return "failed";
  return qa.qaStatus || "pending";
}

function nodePublicPath(node) {
  return normalizePath(node.path || node.marketPath || "");
}

function nodeText(node) {
  return textValue([
    node.description,
    node.summary,
    node.positioning,
    node.bestFor,
    node.tradeoffs,
    node.strengths,
    node.questionsToValidate,
  ]);
}

function nodeHasStructuredQualities(node) {
  return Boolean(
    arrayCount(node.bestFor) ||
    arrayCount(node.tradeoffs) ||
    arrayCount(node.strengths) ||
    arrayCount(node.questionsToValidate) ||
    Object.keys(node.attributes || {}).length ||
    Object.keys(node.retailAttributes || {}).length ||
    Object.keys(node.industrialAttributes || {}).length ||
    Object.keys(node.spaceTypeFit || {}).length
  );
}

function comparisonTargets(node) {
  return (((node.relationships || {}).compareWith) || [])
    .map((item) => String(item.slug || item.targetSlug || item.path || "").trim())
    .filter(Boolean);
}

function buildingPath(record) {
  return normalizePath(record && (record.building_path || record.canonical_path || record.path || record.url));
}

function collectRepresentativeBuildings(districts, buildingByPath) {
  const records = [];
  const seen = new Set();

  for (const district of districts) {
    const districtPath = nodePublicPath(district);
    for (const item of district.representativeBuildings || []) {
      const path = buildingPath(item);
      const key = path || `${district.slug}:${item.address || item.name || item}`;
      if (!key || seen.has(key)) continue;
      seen.add(key);
      records.push({
        district,
        districtPath,
        path,
        name: item.name || item.display_name || item.address || path || "Representative building",
        sourceItem: item,
        record: buildingByPath.get(path) || null,
      });
    }
  }

  for (const building of buildingByPath.values()) {
    if (!building.editorial_representative && !building.building_brief) continue;
    const areaPath = normalizePath(building.commercial_area && building.commercial_area.path);
    const matchingDistrict = districts.find((district) => nodePublicPath(district) === areaPath);
    if (!matchingDistrict) continue;
    const path = buildingPath(building);
    if (!path || seen.has(path)) continue;
    seen.add(path);
    records.push({
      district: matchingDistrict,
      districtPath: areaPath,
      path,
      name: building.display_name || building.name || building.address || path,
      sourceItem: building,
      record: building,
    });
  }

  return records;
}

function districtEcosystem(node) {
  return (node && node.commercialEcosystem) || null;
}

function createEcosystemBucket(ecosystem) {
  return {
    id: ecosystem.id,
    label: ecosystem.label,
    districtCount: 0,
    secondaryDistrictCount: 0,
    recommendationNodeCount: 0,
    representativeBuildingCount: 0,
    buildingBriefCount: 0,
    status: "Missing",
    districts: [],
    subtypes: {},
    archetypes: {},
    activities: {},
    reviewRequiredDistricts: [],
    notableSubtypeGaps: [],
    representativeBuildingIntelligence: createRepresentativeIntelligenceBucket(ecosystem.id),
  };
}

function createRepresentativeIntelligenceBucket(ecosystemId) {
  return {
    ecosystemId,
    state: "missing",
    stateLabel: "Missing",
    buildingCount: 0,
    explicitCount: 0,
    inheritedOnlyCount: 0,
    reviewRequiredCount: 0,
    rolesCovered: {},
    subtypesCovered: {},
    activityCoverage: {},
    archetypeCoverage: {},
    operationalCharacteristicsCovered: {},
    operationalCategoriesCovered: {},
    missingRoles: [],
    missingOperationalCategories: [],
    highestPriorityMissingRole: "",
    highestPriorityMissingOperationalCategory: "",
    exampleBuildings: [],
  };
}

function incrementCounter(map, id) {
  if (!id) return;
  map[id] = (map[id] || 0) + 1;
}

function ecosystemStatus(bucket) {
  if ((bucket.reviewRequiredDistricts || []).length && bucket.districtCount === 0) return "Review Required";
  if (!bucket.districtCount && !bucket.secondaryDistrictCount) return "Missing";
  if (!bucket.districtCount && bucket.secondaryDistrictCount) return "Partial";
  if (bucket.districtCount && !bucket.representativeBuildingCount) return "Thin";
  if (bucket.representativeBuildingCount && !bucket.buildingBriefCount) return "Partial";
  return "Developed";
}

function representativeBuildingEcosystem(item) {
  const explicit = item && item.sourceItem && item.sourceItem.commercialEcosystem;
  if (explicit && explicit.primary) return explicit.primary;
  const buildingExplicit = item && item.record && (item.record.commercialEcosystem || item.record.commercial_ecosystem);
  if (buildingExplicit && buildingExplicit.primary) return buildingExplicit.primary;
  const district = districtEcosystem(item && item.district);
  return district && district.primary;
}

function representativeIntelligenceFor(item) {
  const path = normalizePath(item && item.path);
  if (!path) return null;
  return representativeBuildingIntelligence.byPath[path] || null;
}

function intelligencePrimaryEcosystem(intelligence) {
  return intelligence && intelligence.commercialIntelligence && intelligence.commercialIntelligence.primaryEcosystem;
}

function incrementRepresentativeIntelligence(bucket, item) {
  const intelligence = representativeIntelligenceFor(item);
  incrementRepresentativeIntelligenceRecord(bucket, intelligence);
}

function incrementRepresentativeIntelligenceRecord(bucket, intelligence) {
  if (!intelligence || !intelligence.commercialIntelligence) return;
  const commercial = intelligence.commercialIntelligence;
  const target = bucket.representativeBuildingIntelligence;
  target.buildingCount += 1;
  if (commercial.confidence === "editorially_supported" || commercial.provenance.representativeRole === "source_record") target.explicitCount += 1;
  if (commercial.provenance.primaryEcosystem === "district" && commercial.provenance.operationalCharacteristics !== "explicit") target.inheritedOnlyCount += 1;
  if (commercial.reviewRequired || commercial.confidence === "review_required") target.reviewRequiredCount += 1;
  incrementCounter(target.rolesCovered, commercial.representativeRole);
  (commercial.ecosystemSubtypes || []).forEach((id) => incrementCounter(target.subtypesCovered, id));
  (commercial.businessActivities || []).forEach((id) => incrementCounter(target.activityCoverage, id));
  (commercial.businessArchetypes || []).forEach((id) => incrementCounter(target.archetypeCoverage, id));
  (commercial.operationalCharacteristics || []).forEach((id) => {
    incrementCounter(target.operationalCharacteristicsCovered, id);
    const characteristic = representativeBuildingIntelligenceTaxonomy.operationalCharacteristicById[id];
    if (characteristic) incrementCounter(target.operationalCategoriesCovered, characteristic.category);
  });
  if (target.exampleBuildings.length < 6) {
    target.exampleBuildings.push({
      name: intelligence.name,
      path: intelligence.path,
      role: commercial.representativeRole,
      confidence: commercial.confidence,
    });
  }
}

function representativeIntelligenceState(target, relevance) {
  if (relevance === "not_applicable") return "not_applicable";
  if (!target.buildingCount) return "missing";
  if (target.reviewRequiredCount >= target.buildingCount) return "review_required";
  const roleCount = Object.keys(target.rolesCovered || {}).length;
  const subtypeCount = Object.keys(target.subtypesCovered || {}).length;
  const activityCount = Object.keys(target.activityCoverage || {}).length;
  const categoryCount = Object.keys(target.operationalCategoriesCovered || {}).length;
  const authoredRatio = target.buildingCount ? target.explicitCount / target.buildingCount : 0;
  if (roleCount >= 5 && subtypeCount >= 4 && activityCount >= 6 && categoryCount >= 4 && authoredRatio >= 0.5) return "developed";
  if (roleCount >= 3 && subtypeCount >= 3 && activityCount >= 4 && categoryCount >= 3) return "strong";
  if (roleCount >= 2 && activityCount >= 3 && categoryCount >= 2) return "partial";
  return "thin";
}

function targetRepresentativeRolesForMetro(metro, ecosystemId) {
  const configured = (((rules.ecosystemReadiness || {}).targetRepresentativeRoles || {})[metro && metro.id] || {})[ecosystemId];
  if (Array.isArray(configured) && configured.length) {
    return configured.filter((id) => {
      const role = representativeBuildingIntelligenceTaxonomy.representativeRoleById[id];
      return role && role.ecosystemId === ecosystemId;
    });
  }
  return representativeBuildingIntelligenceTaxonomy.representativeRoles
    .filter((role) => role.ecosystemId === ecosystemId)
    .map((role) => role.id);
}

function targetOperationalCategoriesForMetro(metro, ecosystemId) {
  const configured = (((rules.ecosystemReadiness || {}).targetOperationalCategories || {})[metro && metro.id] || {})[ecosystemId];
  if (Array.isArray(configured) && configured.length) {
    return configured.filter((id) => representativeBuildingIntelligenceTaxonomy.operationalCharacteristicCategoryById[id]);
  }
  return representativeBuildingIntelligenceTaxonomy.operationalCharacteristicCategories
    .filter((category) =>
      representativeBuildingIntelligenceTaxonomy.operationalCharacteristics.some((characteristic) =>
        characteristic.category === category.id &&
        (characteristic.applicableEcosystems || []).includes(ecosystemId)
      )
    )
    .map((category) => category.id);
}

function finalizeRepresentativeIntelligenceBucket(bucket, relevance, metro = null) {
  const target = bucket.representativeBuildingIntelligence;
  const coveredRoles = Object.keys(target.rolesCovered || {});
  const expectedRoles = targetRepresentativeRolesForMetro(metro, bucket.id);
  const coveredCategories = Object.keys(target.operationalCategoriesCovered || {});
  const expectedCategories = targetOperationalCategoriesForMetro(metro, bucket.id);
  target.missingRoles = expectedRoles.filter((id) => !coveredRoles.includes(id)).slice(0, 8);
  target.missingOperationalCategories = expectedCategories.filter((id) => !coveredCategories.includes(id)).slice(0, 6);
  target.highestPriorityMissingRole = target.missingRoles[0] || "";
  target.highestPriorityMissingOperationalCategory = target.missingOperationalCategories[0] || "";
  target.state = representativeIntelligenceState(target, relevance);
  target.stateLabel = READINESS_LABELS[target.state] || target.state;
}

function buildEcosystemCoverage(districts, representativeBuildings, briefs) {
  const ecosystems = commercialEcosystemTaxonomy.ecosystems.reduce((result, ecosystem) => {
    result[ecosystem.id] = createEcosystemBucket(ecosystem);
    return result;
  }, {});
  const missingPrimaryEcosystemDistricts = [];
  const reviewRequiredDistricts = [];
  const briefPaths = new Set(briefs.map((item) => item.path).filter(Boolean));
  const cityNames = new Set(districts.map((district) => String(district.city || "").toLowerCase()).filter(Boolean));
  const intelligencePathsSeen = new Set();

  districts.forEach((district) => {
    const ecosystem = districtEcosystem(district);
    if (!ecosystem || !ecosystem.primary || !ecosystems[ecosystem.primary]) {
      missingPrimaryEcosystemDistricts.push({
        slug: district.slug,
        label: district.label || district.slug,
      });
      return;
    }
    const bucket = ecosystems[ecosystem.primary];
    bucket.districtCount += 1;
    bucket.recommendationNodeCount += 1;
    bucket.districts.push({
      slug: district.slug,
      label: district.label || district.slug,
      path: nodePublicPath(district),
    });
    if (ecosystem.confidence === "review_required") {
      const item = { slug: district.slug, label: district.label || district.slug, path: nodePublicPath(district) };
      bucket.reviewRequiredDistricts.push(item);
      reviewRequiredDistricts.push(item);
    }
    (ecosystem.subtypes || []).forEach((id) => incrementCounter(bucket.subtypes, id));
    (ecosystem.activities || []).forEach((id) => incrementCounter(bucket.activities, id));
    (ecosystem.archetypes || []).forEach((id) => incrementCounter(bucket.archetypes, id));
    (ecosystem.secondary || []).forEach((id) => {
      if (ecosystems[id]) ecosystems[id].secondaryDistrictCount += 1;
    });
  });

  representativeBuildings.forEach((item) => {
    const intelligence = representativeIntelligenceFor(item);
    const ecosystemId = intelligencePrimaryEcosystem(intelligence) || representativeBuildingEcosystem(item);
    if (!ecosystemId || !ecosystems[ecosystemId]) return;
    ecosystems[ecosystemId].representativeBuildingCount += 1;
    if (briefPaths.has(item.path)) ecosystems[ecosystemId].buildingBriefCount += 1;
    incrementRepresentativeIntelligence(ecosystems[ecosystemId], item);
    if (item.path) intelligencePathsSeen.add(normalizePath(item.path));
  });

  (representativeBuildingIntelligence.records || []).forEach((record) => {
    if (!record.path || intelligencePathsSeen.has(record.path)) return;
    if (!cityNames.has(String(record.city || "").toLowerCase())) return;
    const ecosystemId = intelligencePrimaryEcosystem(record);
    if (!ecosystemId || !ecosystems[ecosystemId]) return;
    incrementRepresentativeIntelligenceRecord(ecosystems[ecosystemId], record);
  });

  Object.values(ecosystems).forEach((bucket) => {
    bucket.status = ecosystemStatus(bucket);
    const topSubtypes = Object.entries(bucket.subtypes).sort((a, b) => b[1] - a[1]).map(([id]) => id);
    const expectedSubtypes = (commercialEcosystemTaxonomy.ecosystemById[bucket.id] || {}).subtypeIds || [];
    bucket.notableSubtypeGaps = expectedSubtypes.filter((id) => !topSubtypes.includes(id)).slice(0, 4);
    finalizeRepresentativeIntelligenceBucket(bucket, "review_required");
  });

  const underrepresentedEcosystems = Object.values(ecosystems)
    .filter((bucket) => bucket.status === "Missing" || bucket.status === "Thin" || bucket.status === "Review Required")
    .map((bucket) => ({
      id: bucket.id,
      label: bucket.label,
      status: bucket.status,
      districtCount: bucket.districtCount,
      representativeBuildingCount: bucket.representativeBuildingCount,
    }));

  const subtypeCoverage = {};
  const activityCoverage = {};
  const archetypeCoverage = {};
  Object.values(ecosystems).forEach((bucket) => {
    Object.entries(bucket.subtypes).forEach(([id, count]) => { subtypeCoverage[id] = (subtypeCoverage[id] || 0) + count; });
    Object.entries(bucket.activities).forEach(([id, count]) => { activityCoverage[id] = (activityCoverage[id] || 0) + count; });
    Object.entries(bucket.archetypes).forEach(([id, count]) => { archetypeCoverage[id] = (archetypeCoverage[id] || 0) + count; });
  });

  return {
    ecosystems,
    subtypeCoverage,
    activityCoverage,
    archetypeCoverage,
    missingPrimaryEcosystemDistricts,
    reviewRequiredDistricts,
    underrepresentedEcosystems,
    summary: {
      ecosystemCount: Object.keys(ecosystems).length,
      developedCount: Object.values(ecosystems).filter((bucket) => bucket.status === "Developed").length,
      partialCount: Object.values(ecosystems).filter((bucket) => bucket.status === "Partial").length,
      thinCount: Object.values(ecosystems).filter((bucket) => bucket.status === "Thin").length,
      missingCount: Object.values(ecosystems).filter((bucket) => bucket.status === "Missing").length,
      reviewRequiredDistrictCount: reviewRequiredDistricts.length,
    },
  };
}

function stateObject(state, rationale = [], details = {}) {
  return {
    state,
    label: READINESS_LABELS[state] || state,
    rationale,
    ...details,
  };
}

function relevanceForMetro(metro, ecosystemId) {
  const config = rules.ecosystemReadiness || {};
  const metroConfig = (config.metroRelevance || {})[metro.id] || {};
  return metroConfig[ecosystemId] || (config.relevanceDefaults || {})[ecosystemId] || "review_required";
}

function stateForCount(count, relevance, layer) {
  if (relevance === "not_applicable") return "not_applicable";
  if (relevance === "review_required") return "review_required";
  const minimums = (((rules.ecosystemReadiness || {}).minimums || {})[layer] || {})[relevance] || {};
  if (!count) return "missing";
  if (count >= (minimums.developed || Number.MAX_SAFE_INTEGER)) return "developed";
  if (count >= (minimums.strong || Number.MAX_SAFE_INTEGER)) return "strong";
  if (count >= (minimums.partial || 1)) return "partial";
  return "thin";
}

function strongestState(states) {
  const order = ["missing", "thin", "partial", "strong", "developed"];
  return states.sort((a, b) => order.indexOf(b) - order.indexOf(a))[0] || "missing";
}

function weakestState(states) {
  const order = ["review_required", "missing", "thin", "partial", "strong", "developed", "not_applicable"];
  return states.sort((a, b) => order.indexOf(a) - order.indexOf(b))[0] || "missing";
}

function layerCounts(bucket) {
  return {
    districts: bucket.districtCount || 0,
    secondaryDistricts: bucket.secondaryDistrictCount || 0,
    recommendations: bucket.recommendationNodeCount || 0,
    representativeBuildings: bucket.representativeBuildingCount || 0,
    buildingBriefs: bucket.buildingBriefCount || 0,
    subtypes: Object.keys(bucket.subtypes || {}).length,
    archetypes: Object.keys(bucket.archetypes || {}).length,
    activities: Object.keys(bucket.activities || {}).length,
    reviewRequiredDistricts: (bucket.reviewRequiredDistricts || []).length,
    representativeRoles: Object.keys(((bucket.representativeBuildingIntelligence || {}).rolesCovered) || {}).length,
    operationalCategories: Object.keys(((bucket.representativeBuildingIntelligence || {}).operationalCategoriesCovered) || {}).length,
    operationalCharacteristics: Object.keys(((bucket.representativeBuildingIntelligence || {}).operationalCharacteristicsCovered) || {}).length,
    reviewRequiredRepresentativeBuildings: ((bucket.representativeBuildingIntelligence || {}).reviewRequiredCount) || 0,
  };
}

function evaluateEcosystemLayer(metro, ecosystemId, bucket) {
  const relevance = relevanceForMetro(metro, ecosystemId);
  finalizeRepresentativeIntelligenceBucket(bucket, relevance, metro);
  const counts = layerCounts(bucket);
  const layers = {
    districts: stateForCount(counts.districts, relevance, "districts"),
    recommendations: stateForCount(counts.recommendations, relevance, "districts"),
    representativeBuildings: stateForCount(counts.representativeBuildings, relevance, "representativeBuildings"),
    buildingBriefs: stateForCount(counts.buildingBriefs, relevance, "buildingBriefs"),
    subtypes: stateForCount(counts.subtypes, relevance, "subtypes"),
    archetypes: stateForCount(counts.archetypes, relevance, "archetypes"),
    activities: stateForCount(counts.activities, relevance, "activities"),
    editorialReview: counts.reviewRequiredDistricts ? "review_required" : "developed",
  };
  const representativeIntelligence = bucket.representativeBuildingIntelligence || createRepresentativeIntelligenceBucket(ecosystemId);
  const gaps = [];
  const blocking = [];
  const evidence = [];
  if (relevance === "not_applicable") {
    return {
      ecosystemId,
      label: bucket.label,
      relevance,
      relevanceLabel: RELEVANCE_LABELS[relevance],
      readinessState: "not_applicable",
      readinessLabel: READINESS_LABELS.not_applicable,
      layers,
      counts,
      gaps: [],
      blocking: false,
      strategicPriority: (rules.ecosystemReadiness.strategicPriority || []).indexOf(ecosystemId) + 1 || 99,
      evidence: ["Ecosystem is explicitly not applicable for this metro."],
      completionCriteria: [],
    };
  }
  if (relevance === "review_required" || counts.reviewRequiredDistricts) {
    gaps.push("Ecosystem classification requires editorial review.");
    blocking.push("ecosystem_review_required");
  }
  if (!counts.districts && counts.secondaryDistricts) {
    gaps.push("Ecosystem appears only as a secondary district expression.");
  }
  if (!counts.districts && !counts.secondaryDistricts) {
    gaps.push("No district coverage for this relevant ecosystem.");
    if (relevance === "core") blocking.push("core_ecosystem_missing");
  }
  if (counts.districts && !counts.representativeBuildings && (relevance === "core" || relevance === "important")) {
    gaps.push("Representative Building coverage is missing for this ecosystem.");
    if (relevance === "core") blocking.push("ecosystem_representative_building_gap");
  }
  if (counts.representativeBuildings && !counts.buildingBriefs && (relevance === "core" || relevance === "important")) {
    gaps.push("Building Brief coverage is missing for this ecosystem.");
  }
  if (layers.subtypes === "missing" || layers.subtypes === "thin") gaps.push("Subtype breadth is thin.");
  if (layers.archetypes === "missing" || layers.archetypes === "thin") gaps.push("Business archetype coverage is thin.");
  if (layers.activities === "missing" || layers.activities === "thin") gaps.push("Business activity coverage is thin.");
  if ((counts.representativeBuildings || 0) > 0 && representativeIntelligence.state === "review_required") gaps.push("Representative Building intelligence requires editorial review.");
  if ((counts.representativeBuildings || 0) > 0 && ["missing", "thin"].includes(representativeIntelligence.state)) gaps.push("Representative Building operational coverage is thin.");
  evidence.push(`${counts.districts} primary districts and ${counts.secondaryDistricts} secondary districts.`);
  evidence.push(`${counts.representativeBuildings} Representative Buildings and ${counts.buildingBriefs} Building Briefs.`);
  if (counts.representativeBuildings) {
    evidence.push(`${counts.representativeRoles} representative roles and ${counts.operationalCategories} operational categories are covered.`);
  }

  let readinessState = weakestState(Object.values(layers).filter((state) => state !== "not_applicable"));
  if (readinessState === "developed" && counts.districts < 2 && (relevance === "core" || relevance === "important")) readinessState = "strong";
  if (readinessState === "missing" && counts.secondaryDistricts) readinessState = "partial";
  if (readinessState === "review_required") {
    // Keep review state ahead of all other layer results.
  } else if ((relevance === "core" || relevance === "important") && counts.districts && !counts.representativeBuildings) {
    readinessState = "thin";
  } else if ((relevance === "core" || relevance === "important") && counts.representativeBuildings && !counts.buildingBriefs) {
    readinessState = "partial";
  } else if (readinessState === "missing" && relevance === "secondary") {
    readinessState = "missing";
  }

  const expectedSubtypes = ((commercialEcosystemTaxonomy.ecosystemById[ecosystemId] || {}).subtypeIds || []).slice(0, 5);
  return {
    ecosystemId,
    label: bucket.label,
    relevance,
    relevanceLabel: RELEVANCE_LABELS[relevance] || relevance,
    readinessState,
    readinessLabel: READINESS_LABELS[readinessState] || readinessState,
    layers,
    counts,
    gaps,
    blocking: blocking.length > 0 || ((relevance === "core") && (readinessState === "missing" || readinessState === "thin" || readinessState === "review_required")),
    blockingCodes: blocking,
    strategicPriority: (rules.ecosystemReadiness.strategicPriority || []).indexOf(ecosystemId) + 1 || 99,
    evidence,
    targetSubtypes: expectedSubtypes,
    targetArchetypes: ((commercialEcosystemTaxonomy.ecosystemById[ecosystemId] || {}).businessArchetypeIds || []).slice(0, 6),
    targetActivities: ((commercialEcosystemTaxonomy.ecosystemById[ecosystemId] || {}).typicalBusinessActivities || []).slice(0, 6),
    representativeBuildingIntelligence: {
      ...representativeIntelligence,
      rolesCovered: Object.keys(representativeIntelligence.rolesCovered || {}),
      subtypesCovered: Object.keys(representativeIntelligence.subtypesCovered || {}),
      activityCoverage: Object.keys(representativeIntelligence.activityCoverage || {}),
      archetypeCoverage: Object.keys(representativeIntelligence.archetypeCoverage || {}),
      operationalCharacteristicsCovered: Object.keys(representativeIntelligence.operationalCharacteristicsCovered || {}),
      operationalCategoriesCovered: Object.keys(representativeIntelligence.operationalCategoriesCovered || {}),
    },
    completionCriteria: [
      "Validated district ecosystem classification",
      "Representative Building coverage across the most important subtypes",
      "Representative Building intelligence covers roles, business activities, archetypes, and operational validation focus",
      "Building Brief migration only after canonical records and district association exist",
      "Publisher ecosystem QA passes without hard errors",
    ],
  };
}

function buildGeographicReadiness({ districts, districtCoverage, comparisonGraph, recommendationReadiness, severeGraphIssues, compassReady, qa }) {
  const rationale = [];
  if (districts.length) rationale.push(`${districts.length} district nodes are available for the metro.`);
  if (districtCoverage.score >= 80) rationale.push("District coverage is mature enough for expansion planning.");
  if (comparisonGraph.score >= 50) rationale.push("District comparison relationships are meaningfully developed.");
  if (compassReady) rationale.push("Recommendation QA indicates Compass Ready status.");
  else if (!qa) rationale.push("Recommendation QA authority is missing, but geographic graph coverage can still be measured.");
  if (severeGraphIssues.length) rationale.push(`${severeGraphIssues.length} severe graph or public-route issues remain.`);

  let state = "missing";
  if (districts.length) state = "thin";
  if (districts.length >= 3) state = "partial";
  if (districtCoverage.score >= 70 && comparisonGraph.score >= 45) state = "strong";
  if (districtCoverage.score >= 90 && comparisonGraph.score >= 70 && recommendationReadiness.score >= 80 && !severeGraphIssues.length) state = "developed";
  if (severeGraphIssues.length) state = state === "developed" ? "strong" : state;
  return stateObject(state, rationale, {
    passed: ["strong", "developed"].includes(state),
    metrics: {
      districtCount: districts.length,
      districtCoverageScore: districtCoverage.score,
      comparisonGraphScore: comparisonGraph.score,
      recommendationReadinessScore: recommendationReadiness.score,
    },
  });
}

function buildEcosystemBalance(evaluations) {
  const relevant = evaluations.filter((item) => item.relevance !== "not_applicable");
  const totalReps = relevant.reduce((total, item) => total + item.counts.representativeBuildings, 0);
  const totalBriefs = relevant.reduce((total, item) => total + item.counts.buildingBriefs, 0);
  const byReps = [...relevant].sort((a, b) => b.counts.representativeBuildings - a.counts.representativeBuildings)[0] || null;
  const byBriefs = [...relevant].sort((a, b) => b.counts.buildingBriefs - a.counts.buildingBriefs)[0] || null;
  const repShare = byReps && totalReps ? byReps.counts.representativeBuildings / totalReps : 0;
  const briefShare = byBriefs && totalBriefs ? byBriefs.counts.buildingBriefs / totalBriefs : 0;
  const warnings = [];
  const thresholds = rules.ecosystemReadiness.concentrationThresholds || {};
  if (byReps && repShare >= (thresholds.representativeBuildingShare || 0.7)) {
    warnings.push(`Representative Building coverage is concentrated in ${byReps.label}.`);
  }
  if (byBriefs && briefShare >= (thresholds.buildingBriefShare || 0.75)) {
    warnings.push(`Building Brief coverage is concentrated in ${byBriefs.label}.`);
  }
  const underdevelopedCore = relevant.filter((item) =>
    (item.relevance === "core" || item.relevance === "important") &&
    ["missing", "thin", "partial", "review_required"].includes(item.readinessState)
  );
  if (byBriefs && briefShare >= (thresholds.buildingBriefShare || 0.75) && underdevelopedCore.length) {
    warnings.push(`${byBriefs.label} Building Brief depth may mask gaps in ${underdevelopedCore.map((item) => item.label).join(", ")}.`);
  }
  let state = "balanced";
  if (!totalReps && !totalBriefs) state = "thin_across_all_ecosystems";
  else if (byBriefs && briefShare >= (thresholds.buildingBriefShare || 0.75)) state = `${byBriefs.ecosystemId}_brief_concentrated`;
  else if (byReps && repShare >= (thresholds.representativeBuildingShare || 0.7)) state = `${byReps.ecosystemId}_representative_building_concentrated`;
  else if (relevant.filter((item) => item.counts.districts > 0).length <= 2) state = "specialized";
  return {
    state,
    label: state.split("_").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" "),
    dominantEcosystem: byBriefs ? byBriefs.ecosystemId : byReps ? byReps.ecosystemId : "",
    representativeBuildingShare: Number(repShare.toFixed(2)),
    buildingBriefShare: Number(briefShare.toFixed(2)),
    warnings,
  };
}

function ecosystemGap(evaluation, code, layer, severity, rationale, options = {}) {
  return {
    id: `ecosystem:${evaluation.ecosystemId}:${code}`,
    code,
    label: options.label || code.split("_").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" "),
    severity,
    layer,
    ecosystemId: evaluation.ecosystemId,
    ecosystemLabel: evaluation.label,
    relevance: evaluation.relevance,
    readinessState: evaluation.readinessState,
    rationale,
    evidence: evaluation.evidence,
    recommendedSprintFamily: options.sprintFamily || "Ecosystem Representative Building Foundation",
    completionCriteria: evaluation.completionCriteria,
    blocksEcosystemReadiness: Boolean(options.blocks),
  };
}

function buildEcosystemGaps(evaluations, balance) {
  const gaps = [];
  for (const evaluation of evaluations) {
    if (evaluation.relevance === "not_applicable") continue;
    if (evaluation.readinessState === "review_required") {
      gaps.push(ecosystemGap(evaluation, "ecosystem_review_required", "editorialReview", "high", "Ecosystem classification requires editorial review.", { sprintFamily: "Ecosystem Classification Review", blocks: true }));
    }
    if (evaluation.readinessState === "missing") {
      gaps.push(ecosystemGap(evaluation, evaluation.relevance === "core" ? "core_ecosystem_missing" : "ecosystem_missing", "districts", evaluation.relevance === "core" ? "high" : "medium", "Relevant ecosystem has no meaningful district coverage.", { sprintFamily: "Ecosystem District Foundation", blocks: evaluation.relevance === "core" }));
    }
    if (evaluation.readinessState === "thin") {
      gaps.push(ecosystemGap(evaluation, "ecosystem_thin", "representativeBuildings", evaluation.relevance === "core" ? "high" : "medium", "Relevant ecosystem has district coverage but lacks enough representative-building or layer depth.", { sprintFamily: "Ecosystem Representative Building Foundation", blocks: evaluation.relevance === "core" }));
    }
    if (evaluation.layers.representativeBuildings === "missing" && evaluation.counts.districts > 0) {
      gaps.push(ecosystemGap(evaluation, "ecosystem_representative_building_gap", "representativeBuildings", evaluation.relevance === "core" ? "high" : "medium", "District foundation exists, but Representative Buildings are missing.", { sprintFamily: "Ecosystem Representative Building Foundation", blocks: evaluation.relevance === "core" }));
    }
    if (evaluation.layers.buildingBriefs === "missing" && evaluation.counts.representativeBuildings > 0) {
      gaps.push(ecosystemGap(evaluation, "ecosystem_building_brief_gap", "buildingBriefs", "medium", "Representative Buildings exist, but Building Brief depth is missing.", { sprintFamily: "Ecosystem Building Brief Migration" }));
    }
    if (evaluation.layers.subtypes === "missing" || evaluation.layers.subtypes === "thin") {
      gaps.push(ecosystemGap(evaluation, "ecosystem_subtype_gap", "subtypes", "medium", "Subtype breadth is too narrow for the ecosystem's relevance.", { sprintFamily: "Ecosystem Subtype Expansion" }));
    }
    if (evaluation.layers.archetypes === "missing" || evaluation.layers.archetypes === "thin") {
      gaps.push(ecosystemGap(evaluation, "ecosystem_archetype_gap", "archetypes", "low", "Business archetype coverage is too narrow.", { sprintFamily: "Archetype Coverage Expansion" }));
    }
    if (evaluation.layers.activities === "missing" || evaluation.layers.activities === "thin") {
      gaps.push(ecosystemGap(evaluation, "ecosystem_activity_gap", "activities", "low", "Business activity coverage is too narrow.", { sprintFamily: "Business Activity Coverage Review" }));
    }
    const intelligence = evaluation.representativeBuildingIntelligence || {};
    if (evaluation.counts.representativeBuildings > 0 && intelligence.state === "review_required") {
      gaps.push(ecosystemGap(evaluation, "representative_building_review_required", "representativeBuildingIntelligence", "medium", "Representative Building intelligence exists but requires editorial review.", { sprintFamily: "Representative Building Intelligence Review" }));
    }
    if (evaluation.counts.representativeBuildings > 0 && ["missing", "thin"].includes(intelligence.state)) {
      gaps.push(ecosystemGap(evaluation, "representative_building_intelligence_missing", "representativeBuildingIntelligence", evaluation.relevance === "core" ? "high" : "medium", "Representative Buildings lack sufficient role, activity, archetype, or operational intelligence.", { sprintFamily: "Ecosystem Representative Building Foundation" }));
    }
    if ((intelligence.missingRoles || []).length && evaluation.relevance !== "not_applicable" && !["strong", "developed"].includes(evaluation.readinessState)) {
      gaps.push(ecosystemGap(evaluation, "representative_role_thin", "representativeBuildingIntelligence", evaluation.relevance === "core" ? "medium" : "low", "Representative role coverage is too narrow for this ecosystem.", { sprintFamily: "Ecosystem Representative Building Foundation" }));
    }
    if ((intelligence.missingOperationalCategories || []).length && evaluation.counts.representativeBuildings > 0 && !["strong", "developed"].includes(evaluation.readinessState)) {
      gaps.push(ecosystemGap(evaluation, "operational_category_gap", "representativeBuildingIntelligence", "low", "Representative Buildings do not yet cover enough operational decision categories.", { sprintFamily: "Ecosystem Representative Building Foundation" }));
    }
    if (!evaluation.counts.districts && evaluation.counts.secondaryDistricts) {
      gaps.push(ecosystemGap(evaluation, "ecosystem_secondary_only", "districts", "low", "Ecosystem appears only as secondary context.", { sprintFamily: "Ecosystem District Foundation" }));
    }
  }
  (balance.warnings || []).forEach((warning) => {
    if (!/Building Brief/i.test(warning)) return;
    const dominant = evaluations.find((item) => item.ecosystemId === balance.dominantEcosystem) || evaluations[0];
    if (!dominant) return;
    gaps.push(ecosystemGap(dominant, "ecosystem_building_brief_concentration", "balance", "medium", warning, { sprintFamily: "Ecosystem Balance Sprint" }));
  });
  return gaps;
}

function buildEcosystemReadiness(metro, ecosystemCoverage) {
  const evaluations = Object.values(ecosystemCoverage.ecosystems || {}).map((bucket) => evaluateEcosystemLayer(metro, bucket.id, bucket));
  const balance = buildEcosystemBalance(evaluations);
  const gaps = buildEcosystemGaps(evaluations, balance);
  const relevant = evaluations.filter((item) => item.relevance === "core" || item.relevance === "important");
  const blocking = relevant.filter((item) => item.blocking || ["missing", "thin", "review_required"].includes(item.readinessState));
  const rationale = [];
  const developed = relevant.filter((item) => item.readinessState === "developed" || item.readinessState === "strong");
  if (developed.length) rationale.push(`${developed.map((item) => item.label).join(", ")} coverage is strong or developed.`);
  const underdeveloped = relevant.filter((item) => ["missing", "thin", "partial", "review_required"].includes(item.readinessState));
  if (underdeveloped.length) rationale.push(`${underdeveloped.map((item) => `${item.label} is ${item.readinessLabel}`).join("; ")}.`);
  if (balance.warnings.length) rationale.push(balance.warnings[0]);

  let state = "missing";
  if (relevant.length) state = "thin";
  if (relevant.some((item) => item.readinessState === "partial" || item.readinessState === "strong" || item.readinessState === "developed")) state = "partial";
  if (relevant.every((item) => ["strong", "developed"].includes(item.readinessState))) state = "strong";
  if (relevant.every((item) => item.readinessState === "developed")) state = "developed";
  if (relevant.some((item) => item.readinessState === "review_required")) state = "review_required";
  if (relevant.some((item) => item.relevance === "core" && item.readinessState === "missing")) state = "missing";

  return {
    ...stateObject(state, rationale, {
      passed: ["strong", "developed"].includes(state) && !blocking.length,
      relevantEcosystems: evaluations.filter((item) => item.relevance !== "not_applicable").map((item) => item.ecosystemId),
      blockingEcosystems: blocking.map((item) => item.ecosystemId),
      evaluations,
      gaps,
    }),
    balance,
  };
}

function ecosystemGapPriority(gap) {
  const severity = { critical: 100, high: 70, medium: 40, low: 15 }[gap.severity] || 0;
  const relevance = { core: 30, important: 20, secondary: 8, specialized: 8, review_required: 15 }[gap.relevance] || 0;
  const strategicIndex = (rules.ecosystemReadiness.strategicPriority || []).indexOf(gap.ecosystemId);
  const strategic = strategicIndex === -1 ? 0 : Math.max(0, 20 - strategicIndex * 3);
  return severity + relevance + strategic + (gap.blocksEcosystemReadiness ? 25 : 0);
}

function findAvoidPhrases(text) {
  const lower = String(text || "").toLowerCase();
  return rules.editorialAvoidPhrases.filter((phrase) => lower.includes(phrase));
}

function briefFieldValue(brief, field) {
  if (!brief) return null;
  return brief[field];
}

function weightedScore(parts) {
  const totalWeight = parts.reduce((total, part) => total + part.weight, 0);
  if (!totalWeight) return 0;
  const score = parts.reduce((total, part) => total + ((Number(part.score) || 0) * part.weight), 0) / totalWeight;
  return Math.max(0, Math.min(100, Math.round(score)));
}

function dimension(key, label, score, explanation, details = {}) {
  return {
    key,
    label,
    score: Math.max(0, Math.min(100, Math.round(score))),
    status: details.status || "",
    explanation,
    completed: details.completed || {},
    targets: details.targets || {},
    blockers: details.blockers || [],
    topOpportunity: details.topOpportunity || "",
  };
}

function analyzeMetro(metro, indexes) {
  const { cities, cityPathSet, districtPathSet, buildingByPath, comparisonPathSet, buildingComparisonPathSet, nodeBySlug } = indexes;
  const cityNames = new Set((metro.cities || []).map((name) => name.toLowerCase()));
  const districts = locationGraph.filter((node) =>
    node &&
    node.type !== "city" &&
    cityNames.has(String(node.city || "").toLowerCase())
  );
  const qa = qaForMetro(metro);
  const qaStatus = qaState(qa);
  const compassReady = isCompassReady(metro, qa);
  const cityPath = primaryCityPath(metro, cities);
  const queue = [];
  const gateBlockers = [];

  const foundationChecks = [
    Boolean((metro.primaryCity || "").trim()),
    Boolean(cityPath && cityPathSet.has(cityPath)),
    districts.length > 0,
    compassReady,
    Boolean(qa && qa.reportPath),
  ];
  if (!foundationChecks[1]) {
    queue.push(issue("city-page", metro, "metroFoundation", "missing city page", metro.primaryCity, "critical", "Primary city page was not found.", {
      sourceId: cityPath || metro.primaryCity,
      suggestedNextAction: "Confirm the canonical city record and generated public city URL.",
    }));
  }
  if (!qa) {
    const task = issue("recommendation-qa-missing", metro, "recommendationReadiness", "missing recommendation QA status", metro.name, "high", "Authoritative recommendation QA status was not found.", {
      code: "recommendation-qa-missing",
      sourceId: metro.id,
      suggestedNextAction: "Add or update recommendation QA documentation for this metro.",
    });
    queue.push(task);
    gateBlockers.push(gateBlocker("distribution-ready", "high", "recommendation-qa-missing", "Authoritative recommendation QA status was not found.", {
      sourceId: metro.id,
      relatedTaskId: task.id,
    }));
  } else if (qaStatus !== "passed") {
    const task = issue("recommendation-qa-not-passed", metro, "recommendationReadiness", "recommendation QA not passed", metro.name, "high", `Recommendation QA status is ${qaStatus}.`, {
      code: "recommendation-qa-not-passed",
      sourceId: metro.id,
      suggestedNextAction: "Resolve recommendation QA before considering the metro Distribution Ready.",
    });
    queue.push(task);
    gateBlockers.push(gateBlocker("distribution-ready", "high", "recommendation-qa-not-passed", `Recommendation QA status is ${qaStatus}.`, {
      sourceId: metro.id,
      relatedTaskId: task.id,
    }));
  }
  const metroFoundation = category(
    "metroFoundation",
    foundationChecks.filter(Boolean).length,
    foundationChecks.length,
    "Canonical city, public route, graph support, Compass designation, and QA documentation.",
    queue.filter((item) => item.category === "metroFoundation")
  );

  let districtsWithPublicPages = 0;
  let districtsWithDescriptions = 0;
  let districtsWithQualities = 0;
  let districtsWithPositioning = 0;
  for (const district of districts) {
    const path = nodePublicPath(district);
    if (path && districtPathSet.has(path)) districtsWithPublicPages += 1;
    else queue.push(issue("district-page", metro, "districtCoverage", "missing district page", district.label || district.slug, "high", "District node does not resolve to a public district page.", {
      sourceId: district.slug,
      publicUrl: path,
      automationCandidate: false,
      suggestedNextAction: "Create or connect the district page for this location node.",
    }));

    if (hasText(nodeText(district), rules.thresholds.districtDescriptionMinLength)) districtsWithDescriptions += 1;
    else queue.push(issue("district-summary", metro, "districtCoverage", "missing district description", district.label || district.slug, "medium", "District lacks substantive decision-oriented editorial text.", {
      sourceId: district.slug,
      publicUrl: path,
      automationCandidate: true,
      suggestedNextAction: "Write a concise commercial decision summary for the district.",
    }));

    if (nodeHasStructuredQualities(district)) districtsWithQualities += 1;
    else queue.push(issue("district-qualities", metro, "districtCoverage", "missing district qualities", district.label || district.slug, "medium", "District lacks structured commercial characteristics.", {
      sourceId: district.slug,
      publicUrl: path,
      automationCandidate: true,
      suggestedNextAction: "Add best fit, strengths, tradeoffs, and validation guidance.",
    }));

    if (arrayCount(district.bestFor) && arrayCount(district.tradeoffs)) districtsWithPositioning += 1;
    else queue.push(issue("district-positioning", metro, "districtCoverage", "missing decision positioning", district.label || district.slug, "low", "District does not yet clearly show both business fit and tradeoffs.", {
      sourceId: district.slug,
      publicUrl: path,
      automationCandidate: true,
      suggestedNextAction: "Add decision-oriented best-fit and tradeoff fields.",
    }));
  }
  const districtCoverageTotal = Math.max(districts.length * 4, 1);
  const districtCoverage = category(
    "districtCoverage",
    districtsWithPublicPages + districtsWithDescriptions + districtsWithQualities + districtsWithPositioning,
    districtCoverageTotal,
    "Public district pages, substantive descriptions, structured qualities, and decision positioning.",
    queue.filter((item) => item.category === "districtCoverage")
  );

  let comparisonTotal = 0;
  let districtsWithComparison = 0;
  let districtsMeetingComparisonTarget = 0;
  for (const district of districts) {
    const targets = comparisonTargets(district);
    comparisonTotal += targets.length;
    if (targets.length) districtsWithComparison += 1;
    if (targets.length >= rules.thresholds.minComparisonsPerDistrict) districtsMeetingComparisonTarget += 1;
    if (!targets.length) {
      queue.push(issue("orphan-comparison", metro, "comparisonGraph", "orphan district comparison", district.label || district.slug, "high", "District has no comparison relationships.", {
        sourceId: district.slug,
        publicUrl: nodePublicPath(district),
        automationCandidate: true,
        suggestedNextAction: "Add meaningful compareWith relationships to nearby or decision-adjacent districts.",
      }));
    }
    for (const target of targets) {
      const targetSlug = target.replace(/^.*\/([^/]+)\/?$/, "$1");
      if (!nodeBySlug.has(targetSlug)) {
        queue.push(issue("unresolved-comparison", metro, "comparisonGraph", "unresolved comparison", `${district.label || district.slug} -> ${target}`, "critical", "Comparison target does not resolve to a location graph node.", {
          sourceId: `${district.slug}:${target}`,
          publicUrl: nodePublicPath(district),
          suggestedNextAction: "Fix or remove the unresolved comparison target.",
        }));
      } else {
        const targetNode = nodeBySlug.get(targetSlug);
        const reciprocal = comparisonTargets(targetNode).some((candidate) => candidate === district.slug || candidate.endsWith(`/${district.slug}/`));
        if (!reciprocal) {
          queue.push(issue("one-way-comparison", metro, "comparisonGraph", "one-way comparison", `${district.label || district.slug} -> ${targetNode.label || targetSlug}`, "low", "Comparison relationship is not reciprocated.", {
            sourceId: `${district.slug}:${targetSlug}`,
            publicUrl: nodePublicPath(district),
            automationCandidate: true,
            suggestedNextAction: "Review whether the comparison should be reciprocal.",
          }));
        }
      }
    }
  }
  const comparisonGraph = category(
    "comparisonGraph",
    districtsWithComparison + districtsMeetingComparisonTarget,
    Math.max(districts.length * 2, 1),
    `${comparisonTotal} graph comparison relationships; target is at least ${rules.thresholds.minComparisonsPerDistrict} useful comparisons per district in v1.`,
    queue.filter((item) => item.category === "comparisonGraph")
  );

  const districtPathsForMetro = new Set(districts.map(nodePublicPath).filter(Boolean));
  const representativeBuildings = collectRepresentativeBuildings(districts, buildingByPath);
  const representativeBuildingPathsForMetro = new Set(representativeBuildings.map((item) => item.path).filter(Boolean));
  const repsByDistrict = new Map();
  for (const item of representativeBuildings) {
    const key = item.district.slug;
    if (!repsByDistrict.has(key)) repsByDistrict.set(key, []);
    repsByDistrict.get(key).push(item);
    if (!item.path) {
      queue.push(issue("rep-no-url", metro, "representativeBuildings", "representative record missing public URL", item.name, "high", "Representative building relationship lacks a public building URL.", {
        sourceId: `${item.district.slug}:${item.name}`,
        automationCandidate: false,
        suggestedNextAction: "Connect this representative building to its canonical building URL.",
      }));
    } else if (!item.record) {
      queue.push(issue("rep-broken-url", metro, "representativeBuildings", "unresolved representative building", item.name, "critical", "Representative building URL does not resolve to a building record.", {
        sourceId: item.path,
        publicUrl: item.path,
        suggestedNextAction: "Fix the representative building path or create the canonical record.",
      }));
    }
  }
  let districtsWithReps = 0;
  let districtsMeetingRepTarget = 0;
  for (const district of districts) {
    const count = (repsByDistrict.get(district.slug) || []).length;
    if (count > 0) districtsWithReps += 1;
    if (count >= rules.thresholds.representativeBuildingsPerDistrictTarget) districtsMeetingRepTarget += 1;
    if (!count) {
      queue.push(issue("district-no-reps", metro, "representativeBuildings", "district missing representative buildings", district.label || district.slug, "medium", "District has no representative building examples.", {
        sourceId: district.slug,
        publicUrl: nodePublicPath(district),
        automationCandidate: true,
        suggestedNextAction: "Curate representative buildings that explain this district.",
      }));
    }
  }
  const representativeBuildingCoverage = category(
    "representativeBuildings",
    districtsWithReps + districtsMeetingRepTarget,
    Math.max(districts.length * 2, 1),
    `${representativeBuildings.length} representative building relationships; v1 target is ${rules.thresholds.representativeBuildingsPerDistrictTarget} per covered district.`,
    queue.filter((item) => item.category === "representativeBuildings")
  );

  const repsWithRecords = representativeBuildings.filter((item) => item.record);
  const briefs = repsWithRecords.filter((item) => item.record && item.record.building_brief);
  const ecosystemCoverage = buildEcosystemCoverage(districts, representativeBuildings, briefs);
  for (const item of repsWithRecords) {
    const brief = item.record.building_brief;
    if (!brief) {
      queue.push(issue("missing-brief", metro, "buildingBriefs", "representative building missing Building Brief", item.name, "medium", "Representative building has not migrated to the canonical Building Brief journey.", {
        sourceId: item.path,
        publicUrl: item.path,
        automationCandidate: true,
        readinessState: item.sourceItem && item.sourceItem.buildingBriefReadiness,
        suggestedNextAction: "Author a Building Brief for this representative building.",
      }));
      continue;
    }
    const missingFields = rules.buildingBriefRequiredFields.filter((field) => {
      const value = briefFieldValue(brief, field);
      return Array.isArray(value) ? value.length === 0 : !hasText(value);
    });
    if (missingFields.length) {
      queue.push(issue("incomplete-brief", metro, "buildingBriefs", "incomplete Building Brief", item.name, "medium", `Building Brief is missing: ${missingFields.join(", ")}.`, {
        sourceId: item.path,
        publicUrl: item.path,
        automationCandidate: true,
        suggestedNextAction: "Complete the missing editorial fields.",
      }));
    }
  }
  const buildingBriefCoverage = category(
    "buildingBriefs",
    briefs.length,
    repsWithRecords.length,
    `${briefs.length} of ${repsWithRecords.length} representative building records use the canonical Building Brief journey.`,
    queue.filter((item) => item.category === "buildingBriefs")
  );

  if (repsWithRecords.length > 0 && briefs.length === 0) {
    queue.push(issue("initial-building-brief-collection", metro, "buildingBriefs", "initial Building Brief collection", metro.name, "high", "Representative buildings exist, but no canonical Building Brief collection has been started.", {
      code: "initial-building-brief-collection",
      sourceId: metro.id,
      automationCandidate: true,
      suggestedNextAction: `Create an initial Building Brief collection covering ${rules.thresholds.buildingBriefTargets.editoriallyDevelopedMinimum} distinct commercial environments.`,
    }));
    gateBlockers.push(gateBlocker("editorially-developed", "medium", "building-brief-collection-missing", "No initial Building Brief collection exists.", {
      sourceId: metro.id,
    }));
  }

  let readyChecks = 0;
  const readinessTotal = 4 + Math.max(districts.length, 1);
  if (compassReady) readyChecks += 1;
  else if (qa) queue.push(issue("compass-not-ready", metro, "recommendationReadiness", "recommendation QA gap", metro.name, "high", "Metro is not marked Compass Ready by QA data.", {
    sourceId: metro.id,
    suggestedNextAction: "Run and document recommendation QA before treating the metro as Compass Ready.",
  }));
  if (qa && Number(qa.scenarioCount || 0) > 0) readyChecks += 1;
  if (qa && qa.lastQaDate) readyChecks += 1;
  if (qa && qa.reportPath) readyChecks += 1;
  for (const district of districts) {
    const explainable = arrayCount(district.strengths) && arrayCount(district.tradeoffs) && arrayCount(district.questionsToValidate);
    if (explainable) readyChecks += 1;
    else queue.push(issue("missing-explainability", metro, "recommendationReadiness", "missing explainability fields", district.label || district.slug, "medium", "Recommendation node lacks strengths, tradeoffs, or validation questions.", {
      sourceId: district.slug,
      publicUrl: nodePublicPath(district),
      automationCandidate: true,
      suggestedNextAction: "Add explainability fields used by recommendations and Location Briefs.",
    }));
  }
  const recommendationReadiness = category(
    "recommendationReadiness",
    readyChecks,
    readinessTotal,
    qa ? `${qa.scenarioCount || 0} QA scenarios; last QA ${qa.lastQaDate || "not recorded"}.` : "No recommendation QA status row found.",
    queue.filter((item) => item.category === "recommendationReadiness")
  );

  let editorialChecks = 0;
  let editorialTotal = districts.length + briefs.length;
  for (const district of districts) {
    const flagged = findAvoidPhrases(nodeText(district));
    const placeholder = /\b(N\/A|undefined|\[object Object\])\b/i.test(nodeText(district));
    if (!flagged.length && !placeholder) editorialChecks += 1;
    else queue.push(issue("editorial-scan", metro, "editorialQuality", "editorial phrase violation", district.label || district.slug, "low", `Deterministic scan flagged ${flagged.concat(placeholder ? ["placeholder value"] : []).join(", ")}.`, {
      sourceId: district.slug,
      publicUrl: nodePublicPath(district),
      automationCandidate: false,
      suggestedNextAction: "Review the record against the Editorial Style Guide.",
    }));
  }
  for (const item of briefs) {
    const flagged = findAvoidPhrases(textValue(item.record.building_brief));
    const placeholder = /\b(N\/A|undefined|\[object Object\])\b/i.test(textValue(item.record.building_brief));
    if (!flagged.length && !placeholder) editorialChecks += 1;
    else queue.push(issue("brief-style", metro, "editorialQuality", "Building Brief style guide issue", item.name, "low", `Deterministic scan flagged ${flagged.concat(placeholder ? ["placeholder value"] : []).join(", ")}.`, {
      sourceId: item.path,
      publicUrl: item.path,
      automationCandidate: false,
      suggestedNextAction: "Polish the Building Brief against the Editorial Style Guide.",
    }));
  }
  if (!editorialTotal) editorialTotal = 1;
  const editorialQuality = category(
    "editorialQuality",
    editorialChecks,
    editorialTotal,
    "Deterministic scan for placeholders, unsupported generated phrasing, and style-guide avoid phrases.",
    queue.filter((item) => item.category === "editorialQuality")
  );

  let linkChecks = 0;
  const buildingComparisons = Array.isArray(commercialBuildingComparisonsData)
    ? commercialBuildingComparisonsData
    : commercialBuildingComparisonsData.comparisons || [];
  const relevantLocationComparisons = locationComparisonPages.filter((page) =>
    cityNames.has(String(page.city || "").toLowerCase()) ||
    districtPathsForMetro.has(normalizePath(page.district_a_path)) ||
    districtPathsForMetro.has(normalizePath(page.district_b_path))
  );
  const relevantBuildingComparisons = buildingComparisons.filter((page) =>
    (page.subjects || []).some((subject) => representativeBuildingPathsForMetro.has(normalizePath(subject.path))) ||
    representativeBuildingPathsForMetro.has(normalizePath(page.building_a_path)) ||
    representativeBuildingPathsForMetro.has(normalizePath(page.building_b_path))
  );
  let linkTotal = 1 + districts.length + representativeBuildings.length + relevantLocationComparisons.length + relevantBuildingComparisons.length;
  if (cityPath && cityPathSet.has(cityPath)) linkChecks += 1;
  for (const district of districts) {
    const path = nodePublicPath(district);
    if (path && districtPathSet.has(path)) linkChecks += 1;
    for (const target of comparisonTargets(district)) {
      const slug = target.replace(/^.*\/([^/]+)\/?$/, "$1");
      if (!nodeBySlug.has(slug)) {
        queue.push(issue("broken-district-link", metro, "internalLinking", "unresolved internal reference", `${district.label || district.slug} -> ${target}`, "critical", "District comparison target cannot be resolved.", {
          sourceId: `${district.slug}:${target}`,
          publicUrl: nodePublicPath(district),
          suggestedNextAction: "Fix the broken comparison reference.",
        }));
      }
    }
  }
  for (const item of representativeBuildings) {
    if (item.path && buildingByPath.has(item.path)) linkChecks += 1;
  }
  for (const page of relevantLocationComparisons) {
    if (comparisonPathSet.has(normalizePath(page.path))) linkChecks += 1;
  }
  for (const page of relevantBuildingComparisons) {
    const path = normalizePath(page.path);
    if (path && buildingComparisonPathSet.has(path)) linkChecks += 1;
  }
  const internalLinking = category(
    "internalLinking",
    linkChecks,
    Math.max(linkTotal, 1),
    "Checks public city, district, building, and comparison references that Publisher can resolve from generated data.",
    queue.filter((item) => item.category === "internalLinking")
  );

  const categories = {
    metroFoundation,
    districtCoverage,
    comparisonGraph,
    representativeBuildings: representativeBuildingCoverage,
    buildingBriefs: buildingBriefCoverage,
    recommendationReadiness,
    editorialQuality,
    internalLinking,
  };

  queue.sort((a, b) => (b.priority - a.priority) || a.categoryLabel.localeCompare(b.categoryLabel) || a.itemName.localeCompare(b.itemName));

  const severeGraphIssues = queue.filter((item) =>
    (item.severity === "critical" || item.severity === "high") &&
    (item.category === "comparisonGraph" || item.category === "districtCoverage" || item.category === "internalLinking")
  );
  const criticalIssues = queue.filter((item) => item.severity === "critical");
  const geographicReadiness = buildGeographicReadiness({ districts, districtCoverage, comparisonGraph, recommendationReadiness, severeGraphIssues, compassReady, qa });
  const ecosystemReadiness = buildEcosystemReadiness(metro, ecosystemCoverage);
  const ecosystemBalance = ecosystemReadiness.balance;
  const ecosystemGaps = [...(ecosystemReadiness.gaps || [])].sort((a, b) =>
    ecosystemGapPriority(b) - ecosystemGapPriority(a) ||
    a.ecosystemLabel.localeCompare(b.ecosystemLabel) ||
    a.code.localeCompare(b.code)
  );
  const recommendedEcosystemGap = ecosystemGaps[0] || null;
  const readinessGates = {
    geographic: {
      passed: geographicReadiness.passed,
      state: geographicReadiness.state,
      label: geographicReadiness.label,
    },
    ecosystem: {
      passed: ecosystemReadiness.passed,
      state: ecosystemReadiness.state,
      label: ecosystemReadiness.label,
      blockingEcosystems: ecosystemReadiness.blockingEcosystems,
    },
  };
  const briefTarget = Math.max(1, rules.thresholds.buildingBriefTargets.distributionReadyMinimum);
  const stagedBuildingBriefScore = repsWithRecords.length
    ? scoreRatio(Math.min(briefs.length, briefTarget), briefTarget)
    : 0;

  let compassReadinessScore = weightedScore([
    { score: districts.length ? 100 : 0, weight: 12 },
    { score: districtCoverage.score, weight: 18 },
    { score: comparisonGraph.score, weight: 22 },
    { score: recommendationReadiness.score, weight: 38 },
    { score: compassReady ? 100 : qa ? 55 : 35, weight: 10 },
  ]);
  const dimensionCaps = [];
  if (!qa) {
    compassReadinessScore = Math.min(compassReadinessScore, rules.thresholds.scoreCaps.missingQaCompass);
    dimensionCaps.push({
      dimension: "compassReadiness",
      cap: rules.thresholds.scoreCaps.missingQaCompass,
      reason: "Recommendation QA status is missing.",
      code: "missing-qa-compass-cap",
    });
  }

  let editorialCoverageScore = weightedScore([
    { score: districtCoverage.score, weight: 35 },
    { score: representativeBuildingCoverage.score, weight: 30 },
    { score: stagedBuildingBriefScore, weight: 25 },
    { score: editorialQuality.score, weight: 10 },
  ]);
  if (districts.length > 0 && representativeBuildings.length === 0) {
    editorialCoverageScore = Math.min(editorialCoverageScore, rules.thresholds.scoreCaps.noRepresentativeBuildingsEditorial);
    dimensionCaps.push({
      dimension: "editorialCoverage",
      cap: rules.thresholds.scoreCaps.noRepresentativeBuildingsEditorial,
      reason: "Priority districts have no representative buildings.",
      code: "no-representative-buildings-editorial-cap",
    });
    gateBlockers.push(gateBlocker("editorially-developed", "medium", "representative-buildings-missing", "Priority districts have no representative buildings.", {
      sourceId: metro.id,
    }));
  } else if (representativeBuildings.length > 0 && briefs.length === 0) {
    editorialCoverageScore = Math.min(editorialCoverageScore, rules.thresholds.scoreCaps.representativeBuildingsNoBriefsEditorial);
    dimensionCaps.push({
      dimension: "editorialCoverage",
      cap: rules.thresholds.scoreCaps.representativeBuildingsNoBriefsEditorial,
      reason: "Representative buildings exist, but no Building Briefs have been migrated.",
      code: "no-building-briefs-editorial-cap",
    });
  }

  let publishingReadinessScore = weightedScore([
    { score: cityPath && cityPathSet.has(cityPath) ? 100 : 0, weight: 20 },
    { score: districtsWithPublicPages ? scoreRatio(districtsWithPublicPages, Math.max(districts.length, 1)) : 0, weight: 20 },
    { score: internalLinking.score, weight: 30 },
    { score: qa ? 100 : 55, weight: 20 },
    { score: criticalIssues.length ? 0 : 100, weight: 10 },
  ]);
  if (!qa) {
    publishingReadinessScore = Math.min(publishingReadinessScore, rules.thresholds.scoreCaps.missingQaPublishing);
    dimensionCaps.push({
      dimension: "publishingReadiness",
      cap: rules.thresholds.scoreCaps.missingQaPublishing,
      reason: "Distribution readiness cannot be verified without authoritative recommendation QA status.",
      code: "missing-qa-publishing-cap",
    });
  }

  const dimensions = {
    compassReadiness: dimension(
      "compassReadiness",
      "Compass Readiness",
      compassReadinessScore,
      qa
        ? `${qa.scenarioCount || 0} QA scenarios; graph, comparisons, and explainability determine recommendation readiness.`
        : "Graph depth is measurable, but authoritative recommendation QA status is missing.",
      {
        status: qaStatus,
        completed: {
          districts: districts.length,
          comparisons: comparisonTotal,
          qaScenarios: qa ? Number(qa.scenarioCount || 0) : 0,
        },
        targets: {
          minComparisonsPerDistrict: rules.thresholds.minComparisonsPerDistrict,
        },
        blockers: gateBlockers.filter((item) => item.gate === "distribution-ready" && item.code.includes("qa")),
        topOpportunity: qa ? "Maintain QA coverage as graph content changes." : "Add an authoritative recommendation QA status row.",
      }
    ),
    editorialCoverage: dimension(
      "editorialCoverage",
      "Editorial Coverage",
      editorialCoverageScore,
      `${districtsWithDescriptions} of ${districts.length} districts have substantive descriptions; ${representativeBuildings.length} representative buildings and ${briefs.length} Building Briefs are available.`,
      {
        completed: {
          districtsWithDescriptions,
          representativeBuildings: representativeBuildings.length,
          buildingBriefs: briefs.length,
        },
        targets: {
          representativeBuildingsPerDistrict: rules.thresholds.representativeBuildingsPerDistrictTarget,
          editoriallyDevelopedBuildingBriefs: rules.thresholds.buildingBriefTargets.editoriallyDevelopedMinimum,
          distributionReadyBuildingBriefs: rules.thresholds.buildingBriefTargets.distributionReadyMinimum,
        },
        blockers: gateBlockers.filter((item) => item.gate === "editorially-developed"),
        topOpportunity: representativeBuildings.length === 0
          ? "Curate representative buildings before Building Brief migration."
          : briefs.length < rules.thresholds.buildingBriefTargets.editoriallyDevelopedMinimum
            ? `Create an initial collection of ${rules.thresholds.buildingBriefTargets.editoriallyDevelopedMinimum} Building Briefs.`
            : "Continue Building Brief migration across priority districts.",
      }
    ),
    publishingReadiness: dimension(
      "publishingReadiness",
      "Publishing Readiness",
      publishingReadinessScore,
      "Measures public route availability, resolvable links, QA authority, and critical route or graph errors.",
      {
        completed: {
          cityPage: cityPath && cityPathSet.has(cityPath) ? 1 : 0,
          districtPages: districtsWithPublicPages,
          internalLinks: linkChecks,
        },
        targets: {
          districtPages: districts.length,
          internalLinks: linkTotal,
        },
        blockers: gateBlockers.filter((item) => item.gate === "distribution-ready"),
        topOpportunity: criticalIssues.length ? "Resolve critical broken references." : qa ? "Maintain public route integrity." : "Add authoritative QA status before distribution.",
      }
    ),
  };

  const rawOverallScore = weightedScore([
    { score: dimensions.compassReadiness.score, weight: rules.dimensionWeights.compassReadiness },
    { score: dimensions.editorialCoverage.score, weight: rules.dimensionWeights.editorialCoverage },
    { score: dimensions.publishingReadiness.score, weight: rules.dimensionWeights.publishingReadiness },
  ]);
  let overallScore = rawOverallScore;
  const scoreCapReasons = [];
  if (!compassReady) {
    overallScore = Math.min(overallScore, rules.thresholds.scoreCaps.notCompassReadyOverall);
    scoreCapReasons.push({
      cap: rules.thresholds.scoreCaps.notCompassReadyOverall,
      code: "not-compass-ready-overall-cap",
      reason: qa ? "Recommendation QA has not passed Compass Ready." : "Recommendation QA is pending verification.",
    });
  }
  if (districts.length > 0 && representativeBuildings.length === 0) {
    overallScore = Math.min(overallScore, rules.thresholds.scoreCaps.noRepresentativeBuildingsOverall);
    scoreCapReasons.push({
      cap: rules.thresholds.scoreCaps.noRepresentativeBuildingsOverall,
      code: "no-representative-buildings-overall-cap",
      reason: "Metro has priority districts but no representative-building layer.",
    });
  } else if (representativeBuildings.length > 0 && briefs.length === 0) {
    overallScore = Math.min(overallScore, rules.thresholds.scoreCaps.representativeBuildingsNoBriefsOverall);
    scoreCapReasons.push({
      cap: rules.thresholds.scoreCaps.representativeBuildingsNoBriefsOverall,
      code: "no-building-briefs-overall-cap",
      reason: "Metro has representative buildings but no initial Building Brief collection.",
    });
  }
  if (criticalIssues.length) {
    overallScore = Math.min(overallScore, rules.thresholds.scoreCaps.criticalReferenceOverall);
    scoreCapReasons.push({
      cap: rules.thresholds.scoreCaps.criticalReferenceOverall,
      code: "critical-reference-overall-cap",
      reason: "Critical broken references or graph errors are present.",
    });
    gateBlockers.push(gateBlocker("distribution-ready", "critical", "critical-reference-error", "Critical broken references or graph errors are present.", {
      sourceId: metro.id,
    }));
  }

  const hasPublicFoundation = Boolean(cityPath && cityPathSet.has(cityPath) && districts.length);
  const districtFoundationReady = districtCoverage.score >= rules.thresholds.districtFoundationMinimumForEditorialDevelopment;
  const hasInitialBuildingBriefCollection = briefs.length >= rules.thresholds.buildingBriefTargets.editoriallyDevelopedMinimum;
  const editoriallyDeveloped = districtFoundationReady &&
    representativeBuildings.length > 0 &&
    hasInitialBuildingBriefCollection &&
    editorialQuality.score >= 80;
  const expansionReady = compassReady && hasPublicFoundation && !severeGraphIssues.length;
  const distributionReady = compassReady &&
    editoriallyDeveloped &&
    dimensions.publishingReadiness.score >= rules.thresholds.publishingReadinessMinimumForDistribution &&
    !criticalIssues.length &&
    !gateBlockers.some((item) => item.gate === "distribution-ready" && (item.severity === "critical" || item.severity === "high"));

  let readinessStatus = "In Development";
  if (compassReady) readinessStatus = "Compass Ready";
  if (expansionReady) readinessStatus = "Expansion Ready";
  if (editoriallyDeveloped) readinessStatus = "Editorially Developed";
  if (distributionReady) readinessStatus = "Distribution Ready";

  return {
    metroId: metro.id,
    metroName: metro.name,
    compassStatus: compassReady ? "ready" : (qa ? qa.validationStatus || qa.qaStatus : "pending-verification"),
    qaStatus: qa || null,
    readinessStatus,
    dimensions,
    rawOverallScore,
    scoreCapReasons,
    dimensionCaps,
    overallScore,
    score: overallScore,
    cityPath,
    districtCount: districts.length,
    representativeBuildingCount: representativeBuildings.length,
    buildingBriefCount: briefs.length,
    geographicReadiness,
    ecosystemReadiness,
    ecosystemBalance,
    ecosystemCoverage,
    ecosystemGaps,
    blockingEcosystems: ecosystemReadiness.blockingEcosystems,
    readinessGates,
    recommendedEcosystemSprint: recommendedEcosystemGap ? {
      title: `${metro.name} ${recommendedEcosystemGap.ecosystemLabel} ${recommendedEcosystemGap.recommendedSprintFamily}`,
      ecosystemId: recommendedEcosystemGap.ecosystemId,
      ecosystemLabel: recommendedEcosystemGap.ecosystemLabel,
      sprintFamily: recommendedEcosystemGap.recommendedSprintFamily,
      rationale: recommendedEcosystemGap.rationale,
      gapCode: recommendedEcosystemGap.code,
      completionCriteria: recommendedEcosystemGap.completionCriteria,
    } : null,
    gateBlockers,
    categories,
    queue,
    recommendedNextAction: queue[0] || {
      category: "Maintenance",
      taskType: "monitor",
      itemName: metro.name,
      severity: "low",
      suggestedNextAction: "Maintain current coverage and monitor future QA signals.",
    },
  };
}

function buildIndexes() {
  const cities = citiesData();
  const cityPathSet = new Set(cities.map((city) => normalizePath(`/commercial-real-estate/${city.state_abbr}/${city.slug || slugify(city.city)}/`)));
  const districtPathSet = new Set((Array.isArray(neighborhoodPages) ? neighborhoodPages : []).map((page) => normalizePath(page.path || page.canonical_path)).filter(Boolean));
  for (const node of locationGraph) {
    const path = nodePublicPath(node);
    if (path) districtPathSet.add(path);
  }
  const buildingByPath = new Map();
  for (const building of Array.isArray(buildingPages) ? buildingPages : []) {
    const path = buildingPath(building);
    if (path) buildingByPath.set(path, building);
  }
  const comparisonPathSet = new Set((Array.isArray(locationComparisonPages) ? locationComparisonPages : []).map((page) => normalizePath(page.path)).filter(Boolean));
  const buildingComparisons = Array.isArray(commercialBuildingComparisonsData)
    ? commercialBuildingComparisonsData
    : commercialBuildingComparisonsData.comparisons || [];
  const buildingComparisonPathSet = new Set(buildingComparisons.map((page) => normalizePath(page.path)).filter(Boolean));
  const nodeBySlug = new Map(locationGraph.filter((node) => node && node.slug).map((node) => [node.slug, node]));
  return { cities, cityPathSet, districtPathSet, buildingByPath, comparisonPathSet, buildingComparisonPathSet, nodeBySlug };
}

function analyzePublisher(options = {}) {
  const indexes = buildIndexes();
  const configuredMetros = [...rules.metros];
  for (const [id, qa] of Object.entries(recommendationQaStatus)) {
    if (!configuredMetros.some((metro) => (metro.compassAliases || []).includes(id) || metro.id === id)) {
      configuredMetros.push({
        id,
        name: qa.metro || id,
        primaryCity: qa.metro || id,
        state: "",
        compassAliases: [id],
        cities: [qa.metro || id],
        discoveredFromQa: true,
      });
    }
  }
  const metros = configuredMetros.map((metro) => analyzeMetro(metro, indexes));
  const primaryMetros = metros.filter((metro) => {
    const config = configuredMetros.find((item) => item.id === metro.metroId);
    return !config.developmentOnly;
  });
  const inDevelopmentMetros = metros.filter((metro) => !primaryMetros.includes(metro));
  const primaryQueue = primaryMetros.flatMap((metro) => metro.queue).sort((a, b) => (b.priority - a.priority) || a.metroName.localeCompare(b.metroName));
  const queue = metros.flatMap((metro) => metro.queue).sort((a, b) => (b.priority - a.priority) || a.metroName.localeCompare(b.metroName));
  const criticalIssues = primaryQueue.filter((item) => item.severity === "critical").length;
  const compassReadyCount = primaryMetros.filter((metro) => metro.compassStatus === "ready").length;
  const averageScore = primaryMetros.length ? Math.round(primaryMetros.reduce((total, metro) => total + metro.score, 0) / primaryMetros.length) : 0;
  const closestToDistributionReady = [...primaryMetros].sort((a, b) => b.score - a.score)[0] || null;
  const metrosWithCriticalIssues = primaryMetros.filter((metro) => metro.queue.some((item) => item.severity === "critical"));
  const largestCriticalGap = [...metrosWithCriticalIssues].sort((a, b) => b.queue.filter((item) => item.severity === "critical").length - a.queue.filter((item) => item.severity === "critical").length)[0] || null;
  return {
    generatedAt: options.generatedAt || new Date().toISOString(),
    rulesVersion: rules.version,
    overview: {
      compassReadyCount,
      averageScore,
      criticalIssues,
      queuedTasks: primaryQueue.length,
      closestToDistributionReady: closestToDistributionReady ? closestToDistributionReady.metroName : "None",
      largestCriticalGap: largestCriticalGap ? largestCriticalGap.metroName : "None",
    },
    metros,
    primaryMetros,
    inDevelopmentMetros,
    primaryQueue,
    queue,
  };
}

module.exports = {
  analyzePublisher,
  CATEGORY_LABELS,
};
