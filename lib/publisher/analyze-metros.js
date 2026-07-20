const rules = require("../../data/publisher-rules.js");
const locationGraph = require("../../_data/locationKnowledgeGraph.js");
const recommendationQaStatus = require("../../_data/recommendationQaStatus.js");
const buildingPages = require("../../_data/buildingPages.js");
const neighborhoodPages = require("../../_data/neighborhoodPages.js");
const locationComparisonPages = require("../../_data/locationComparisonPages.js");
const commercialBuildingComparisonsData = require("../../_data/commercialBuildingComparisons.js");
const citiesData = require("../../_data/cities.js");

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
      record: building,
    });
  }

  return records;
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
  for (const item of repsWithRecords) {
    const brief = item.record.building_brief;
    if (!brief) {
      queue.push(issue("missing-brief", metro, "buildingBriefs", "representative building missing Building Brief", item.name, "medium", "Representative building has not migrated to the canonical Building Brief journey.", {
        sourceId: item.path,
        publicUrl: item.path,
        automationCandidate: true,
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

function analyzePublisher() {
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
    generatedAt: new Date().toISOString(),
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
