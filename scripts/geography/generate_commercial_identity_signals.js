#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "../..");
const geographyDir = path.join(root, "data/geography");
const outputDir = path.join(root, "generated/geography/identity-signals");
const comparisonDir = path.join(root, "generated/geography/comparison-intelligence");
const reportsDir = path.join(geographyDir, "reports");

const nodesPath = path.join(geographyDir, "nodes.json");
const aliasesPath = path.join(geographyDir, "aliases.json");
const candidatesPath = path.join(geographyDir, "public_relationship_candidates.json");
const relationshipsPath = path.join(geographyDir, "relationships.enriched.json");
const comparisonManifestPath = path.join(comparisonDir, "_manifest.json");
const citiesGeneratedPath = path.join(root, "_data/cities.generated.json");
const reportPath = path.join(reportsDir, "commercial_identity_enrichment_v1_report.md");

const PRIORITY_CITIES = new Set([
  "CA|Oakland",
  "CA|Palo Alto",
  "CA|San Francisco",
  "CA|South San Francisco",
  "CA|Emeryville",
  "CA|Mountain View",
  "CA|Redwood City",
  "CA|San Mateo",
  "CA|Berkeley",
  "CA|Fremont",
  "CA|Hayward",
  "GA|Atlanta",
  "GA|Sandy Springs",
  "GA|Peachtree Corners",
  "GA|Marietta",
]);

function readJson(filePath, fallback = null) {
  if (!fs.existsSync(filePath)) return fallback;
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function slugify(input) {
  return String(input || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function loadMarketSnapshots() {
  const snapshotPath = path.join(root, "_data/marketSnapshots.generated.js");
  if (!fs.existsSync(snapshotPath)) return {};
  return require(snapshotPath);
}

function unique(items) {
  return [...new Set(items.filter(Boolean))];
}

function cityKeyFromNode(node) {
  if (!node?.state_abbr || !node?.slug) return null;
  return `${node.state_abbr}/${node.slug}`;
}

function priorityKey(node) {
  return `${node?.state_abbr || ""}|${node?.name || ""}`;
}

function coverageLevel(node) {
  return node?.internal_signals?.city_stats_coverage || null;
}

function hasSpecificSnapshotContext(node, snapshot) {
  if (!snapshot) return false;
  const name = node?.name || "";
  const notableAreas = snapshot.notable_areas || [];
  if (!notableAreas.length) return false;

  const genericAreas = new Set([
    `downtown ${name}`.toLowerCase(),
    "business district",
    "main commercial corridors",
    "downtown",
  ]);
  const specificAreas = notableAreas.filter((area) => {
    const normalized = String(area || "").toLowerCase().trim();
    return normalized && !genericAreas.has(normalized);
  });

  return specificAreas.length >= 2;
}

function inferEnvironmentType(node, context, snapshot) {
  const name = node.name || "";
  const coverage = coverageLevel(node);
  const relationCount = context.relationships.length;

  if (hasSpecificSnapshotContext(node, snapshot)) return "multi-district commercial market";
  if (coverage === "high" && relationCount >= 3) return "regional commercial center";
  if (/San Francisco|Los Angeles|San Diego|San Jose|Oakland|Sacramento|Fresno|Bakersfield/i.test(name)) {
    return "major city commercial market";
  }
  if (/Rancho|Mission|Palm|Walnut|Mountain|Santa|Costa|Newport|Irvine|Pleasanton|San Ramon|Palo Alto|Sunnyvale|Santa Clara|Mountain View/i.test(name)) {
    return "suburban commercial node";
  }
  if (relationCount >= 2) return "nearby city market";
  return "city-level geography node";
}

function inferTenantOrientation(node, context, snapshot) {
  if (hasSpecificSnapshotContext(node, snapshot) && snapshot?.tenant_takeaway) {
    return "tenant orientation requires submarket comparison, commute review, and building-quality review";
  }

  const environmentType = inferEnvironmentType(node, context, snapshot);
  if (environmentType === "major city commercial market" || environmentType === "regional commercial center") {
    return "businesses comparing regional access, customer proximity, workforce reach, and nearby alternatives";
  }
  if (environmentType === "suburban commercial node") {
    return "businesses seeking a practical suburban location with nearby market alternatives";
  }
  return "users orienting across nearby city markets before choosing a more specific district or building type";
}

function inferAccessPattern(node, context) {
  const sameMarketCount = context.relationships.filter((rel) => rel.same_metro_or_market).length;
  const nearbyDistances = context.relationships
    .map((rel) => rel.computed_distance_miles)
    .filter((distance) => Number.isFinite(distance));
  const shortest = nearbyDistances.length ? Math.min(...nearbyDistances) : null;
  const longest = nearbyDistances.length ? Math.max(...nearbyDistances) : null;

  if (shortest != null && longest != null && longest <= 8) {
    return "close-in nearby-city orientation";
  }
  if (sameMarketCount >= 2 && longest != null && longest <= 35) {
    return "same-market comparison corridor";
  }
  if (sameMarketCount >= 1) return "legacy same-market relationship";
  return "access pattern not yet evaluated";
}

function builtFormSignals(node, snapshot) {
  const signals = [];
  if (hasSpecificSnapshotContext(node, snapshot) && snapshot?.notable_areas?.length) {
    signals.push(`notable subareas referenced in existing market snapshot: ${snapshot.notable_areas.slice(0, 5).join(", ")}`);
  } else if (snapshot) {
    signals.push("existing market snapshot found, but subarea language appears generic");
  }
  if (node?.coordinates) {
    signals.push("city-level geocode available");
  }
  signals.push("district-level built form not evaluated in this V1 layer");
  return signals;
}

function commercialSummary(node, context, environmentType, snapshot) {
  if (hasSpecificSnapshotContext(node, snapshot) && snapshot?.summary) {
    return `${node.name} has existing market-snapshot context and should be treated as a ${environmentType}. Use the snapshot as orientation only; keep final public copy tied to current editorial review.`;
  }

  const relationPhrase = context.relationships.length > 1 ? "multiple reviewed nearby relationships" : "a reviewed nearby relationship";
  return `${node.name} is represented in Geography Graph V1 as a ${environmentType} with ${relationPhrase}. Current support is city-level, so the identity should guide comparison planning rather than final public prose.`;
}

function comparisonNotes(node, context) {
  const comparisonTargets = unique(
    context.comparisonRecords
      .filter((record) => record.relationship.public_use_recommendation === "comparison_candidate")
      .map((record) => (record.source.id === node.id ? record.target.name : record.source.name))
  );
  const strongTargets = unique(
    context.comparisonRecords
      .filter((record) => record.relationship.public_use_recommendation === "strong_candidate")
      .map((record) => (record.source.id === node.id ? record.target.name : record.source.name))
  );

  const notes = [];
  if (comparisonTargets.length) {
    notes.push(`Comparison review candidates: ${comparisonTargets.slice(0, 8).join(", ")}.`);
  }
  if (strongTargets.length) {
    notes.push(`Nearby geography candidates: ${strongTargets.slice(0, 8).join(", ")}.`);
  }
  if (!notes.length) notes.push("No generated comparison-intelligence records yet; retain as priority geography scaffold.");
  return notes;
}

function nearbyContext(node, context) {
  const targets = unique(
    context.relationships.map((rel) => (rel.source_id === node.id ? rel.target_node_name : rel.source_node_name))
  );
  if (!targets.length) return "No strong nearby relationship context generated yet.";
  return `Nearby relationship context currently includes ${targets.slice(0, 10).join(", ")}.`;
}

function confidenceLevel(node, context, snapshot, isPriority) {
  const coverage = coverageLevel(node);
  const hasComparison = context.comparisonRecords.some(
    (record) => record.relationship.public_use_recommendation === "comparison_candidate"
  );
  const relationshipCount = context.relationships.length;

  if (hasSpecificSnapshotContext(node, snapshot) && relationshipCount >= 2 && (coverage === "high" || coverage === "medium")) return "high";
  if ((hasComparison && coverage === "high") || (relationshipCount >= 3 && coverage !== "low")) return "medium";
  if (isPriority && (hasSpecificSnapshotContext(node, snapshot) || coverage === "high" || relationshipCount >= 1)) return "medium";
  return "low";
}

function editorialCautions(node, context, snapshot, confidence) {
  const cautions = [
    "Internal editorial scaffold only; do not publish directly.",
    "Do not infer current availability, rents, rankings, or inventory depth.",
    "Do not infer district-level identity from city-level relationship data.",
  ];
  if (!snapshot) cautions.push("No market snapshot support found for this node.");
  if (!context.comparisonRecords.length) cautions.push("No generated comparison-intelligence record found; included only as a priority geography node.");
  if (confidence === "low") cautions.push("Support is thin; use only for planning or future corpus review.");
  if (context.relationships.every((rel) => rel.corpus_support_status === "not_evaluated")) {
    cautions.push("Raw corpus support has not been evaluated for these relationships.");
  }
  return cautions;
}

function supportingSources(node, context, snapshot, cityGenerated) {
  const sources = [
    "data/geography/nodes.json",
    "data/geography/public_relationship_candidates.json",
    "data/geography/relationships.enriched.json",
  ];
  if (context.comparisonRecords.length) sources.push("generated/geography/comparison-intelligence/");
  if (snapshot) sources.push("_data/marketSnapshots.generated.js");
  if (cityGenerated) sources.push("_data/cities.generated.json");
  return unique(sources);
}

function makeRecord(node, context, snapshot, cityGenerated, isPriority) {
  const environmentType = inferEnvironmentType(node, context, snapshot);
  const confidence = confidenceLevel(node, context, snapshot, isPriority);

  return {
    node_id: node.id,
    name: node.name,
    type: node.type,
    city: node.city || node.name,
    state_abbr: node.state_abbr || node.state || null,
    canonical_path: node.canonical_path || null,
    identity_status: "draft_internal",
    commercial_identity_summary: commercialSummary(node, context, environmentType, snapshot),
    environment_type: environmentType,
    likely_tenant_orientation: inferTenantOrientation(node, context, snapshot),
    access_pattern: inferAccessPattern(node, context),
    built_form_signals: builtFormSignals(node, snapshot),
    nearby_relationship_context: nearbyContext(node, context),
    comparison_positioning_notes: comparisonNotes(node, context),
    editorial_cautions: editorialCautions(node, context, snapshot, confidence),
    supporting_sources: supportingSources(node, context, snapshot, cityGenerated),
    confidence_level: confidence,
    public_ready: false,
  };
}

function table(rows, columns) {
  if (!rows.length) return "_None._\n";
  const header = `| ${columns.map((column) => column.label).join(" | ")} |`;
  const separator = `| ${columns.map(() => "---").join(" | ")} |`;
  const body = rows.map((row) => `| ${columns.map((column) => String(column.value(row) ?? "").replace(/\|/g, "\\|")).join(" | ")} |`);
  return [header, separator, ...body].join("\n") + "\n";
}

function countBy(items, fn) {
  const counts = new Map();
  for (const item of items) {
    const key = fn(item) || "unknown";
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([key, count]) => ({ key, count }));
}

function main() {
  const nodes = readJson(nodesPath);
  readJson(aliasesPath);
  const publicCandidates = readJson(candidatesPath);
  const relationships = readJson(relationshipsPath);
  const comparisonManifest = readJson(comparisonManifestPath, { records: [] });
  const cityGeneratedRows = readJson(citiesGeneratedPath, []);
  const marketSnapshots = loadMarketSnapshots();

  const nodeById = new Map(nodes.map((node) => [node.id, node]));
  const cityGeneratedByKey = new Map(
    cityGeneratedRows.map((city) => [`${city.state_abbr}/${city.slug}`, city])
  );

  const comparisonRecords = [];
  for (const item of comparisonManifest.records || []) {
    const filePath = path.join(comparisonDir, item.file);
    if (fs.existsSync(filePath)) comparisonRecords.push(readJson(filePath));
  }

  const eligibleNodeIds = new Set();
  for (const candidate of publicCandidates.candidates || []) {
    if (["strong_candidate", "comparison_candidate"].includes(candidate.public_use_recommendation)) {
      eligibleNodeIds.add(candidate.source_id);
      eligibleNodeIds.add(candidate.target_id);
    }
  }
  for (const record of comparisonRecords) {
    eligibleNodeIds.add(record.source.id);
    eligibleNodeIds.add(record.target.id);
  }
  for (const node of nodes) {
    if (PRIORITY_CITIES.has(priorityKey(node))) eligibleNodeIds.add(node.id);
  }

  const records = [];
  const skipped = [];
  for (const nodeId of [...eligibleNodeIds].sort()) {
    const node = nodeById.get(nodeId);
    if (!node || node.type !== "city") {
      skipped.push({ node_id: nodeId, reason: "missing or non-city node" });
      continue;
    }

    const nodeRelationships = relationships.filter(
      (rel) =>
        (rel.source_id === nodeId || rel.target_id === nodeId) &&
        ["candidate_public", "editorial_review"].includes(rel.promotion_status)
    );
    const nodeComparisonRecords = comparisonRecords.filter(
      (record) => record.source.id === nodeId || record.target.id === nodeId
    );
    const isPriority = PRIORITY_CITIES.has(priorityKey(node));

    if (!nodeRelationships.length && !nodeComparisonRecords.length && !isPriority) {
      skipped.push({ node_id: nodeId, name: node.name, reason: "no strong relationship or priority signal" });
      continue;
    }

    const cityKey = cityKeyFromNode(node);
    const snapshot = cityKey ? marketSnapshots[cityKey] : null;
    const cityGenerated = cityKey ? cityGeneratedByKey.get(cityKey) : null;
    const context = {
      relationships: nodeRelationships,
      comparisonRecords: nodeComparisonRecords,
    };
    records.push(makeRecord(node, context, snapshot, cityGenerated, isPriority));
  }

  records.sort((a, b) => {
    const confidenceOrder = { high: 0, medium: 1, low: 2 };
    if (confidenceOrder[a.confidence_level] !== confidenceOrder[b.confidence_level]) {
      return confidenceOrder[a.confidence_level] - confidenceOrder[b.confidence_level];
    }
    return `${a.state_abbr}-${a.name}`.localeCompare(`${b.state_abbr}-${b.name}`);
  });

  fs.mkdirSync(outputDir, { recursive: true });
  fs.mkdirSync(reportsDir, { recursive: true });

  for (const record of records) {
    const fileName = `${String(record.state_abbr || "unknown").toLowerCase()}__${slugify(record.name)}__${record.node_id.replace(/[^a-zA-Z0-9]+/g, "-")}.json`;
    fs.writeFileSync(path.join(outputDir, fileName), JSON.stringify(record, null, 2) + "\n");
    record.output_file = fileName;
  }

  const manifest = {
    generated_at: new Date().toISOString(),
    output_directory: "generated/geography/identity-signals",
    total_records: records.length,
    public_ready: false,
    source_files: [
      "data/geography/nodes.json",
      "data/geography/aliases.json",
      "data/geography/public_relationship_candidates.json",
      "data/geography/relationships.enriched.json",
      "generated/geography/comparison-intelligence/_manifest.json",
      "generated/geography/comparison-intelligence/*.json",
      "_data/cities.generated.json",
      "_data/marketSnapshots.generated.js",
    ],
    records: records.map((record) => ({
      node_id: record.node_id,
      name: record.name,
      state_abbr: record.state_abbr,
      confidence_level: record.confidence_level,
      environment_type: record.environment_type,
      public_ready: record.public_ready,
      file: record.output_file,
    })),
    skipped,
  };
  fs.writeFileSync(path.join(outputDir, "_manifest.json"), JSON.stringify(manifest, null, 2) + "\n");

  const byState = countBy(records, (record) => record.state_abbr);
  const byConfidence = countBy(records, (record) => record.confidence_level);
  const byEnvironment = countBy(records, (record) => record.environment_type);
  const highExamples = records.filter((record) => record.confidence_level === "high").slice(0, 12);
  const lowExamples = records.filter((record) => record.confidence_level === "low").slice(0, 12);

  const report = `# Commercial Identity Enrichment V1 Report

Date: 2026-05-21

Output:

- \`generated/geography/identity-signals/\`
- \`generated/geography/identity-signals/_manifest.json\`

## Summary

Commercial Identity Enrichment V1 creates internal, draft identity signals for the strongest available geography nodes. These records are editorial scaffolding only. They are not connected to public templates and should not be treated as final public copy.

The layer favors places with strong or comparison candidate relationships, generated comparison-intelligence records, and selected priority Bay Area or Atlanta city nodes where present.

## Counts

| Metric | Count |
| --- | ---: |
| Identity records generated | ${records.length} |
| Places skipped | ${skipped.length} |
| Public-ready records | 0 |

## Count By State

${table(byState, [
  { label: "State", value: (row) => row.key },
  { label: "Count", value: (row) => row.count },
])}

## Count By Confidence

${table(byConfidence, [
  { label: "Confidence", value: (row) => row.key },
  { label: "Count", value: (row) => row.count },
])}

## Count By Environment Type

${table(byEnvironment, [
  { label: "Environment type", value: (row) => row.key },
  { label: "Count", value: (row) => row.count },
])}

## Example High-Confidence Records

${table(highExamples, [
  { label: "Name", value: (row) => row.name },
  { label: "State", value: (row) => row.state_abbr },
  { label: "Environment", value: (row) => row.environment_type },
  { label: "Summary", value: (row) => row.commercial_identity_summary },
])}

## Example Low-Confidence Records

${table(lowExamples, [
  { label: "Name", value: (row) => row.name },
  { label: "State", value: (row) => row.state_abbr },
  { label: "Environment", value: (row) => row.environment_type },
  { label: "Caution", value: (row) => row.editorial_cautions[row.editorial_cautions.length - 1] },
])}

## Places Skipped

${table(skipped.slice(0, 30), [
  { label: "Node", value: (row) => row.node_id },
  { label: "Name", value: (row) => row.name || "" },
  { label: "Reason", value: (row) => row.reason },
])}

## Warnings About Overuse

- Do not publish identity records directly.
- Do not use these records to make ranking, rent, vacancy, inventory, or current availability claims.
- Do not infer district-level specificity from city-level nearby relationships.
- Treat confidence as an editorial readiness hint, not a public metric.
- Use low-confidence records only to guide future corpus review.

## Recommended Next Step

Run a metro-specific editorial review for Bay Area, Atlanta, Southern California, Phoenix, Seattle/Bellevue, Texas, and South Florida. For each promising node, add corpus-backed commercial rationale: built form, access pattern, tenant fit, nearby alternatives, and district-level context where available.
`;

  fs.writeFileSync(reportPath, report);

  console.log(JSON.stringify({
    output_directory: "generated/geography/identity-signals",
    manifest: "generated/geography/identity-signals/_manifest.json",
    report: "data/geography/reports/commercial_identity_enrichment_v1_report.md",
    generated_records: records.length,
    skipped: skipped.length,
    by_confidence: Object.fromEntries(byConfidence.map((row) => [row.key, row.count])),
  }, null, 2));
}

main();
