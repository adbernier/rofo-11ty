#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "../..");
const geographyDir = path.join(root, "data/geography");
const outputDir = path.join(root, "generated/geography/comparison-intelligence");
const reportsDir = path.join(geographyDir, "reports");

const candidatesPath = path.join(geographyDir, "public_relationship_candidates.json");
const enrichedPath = path.join(geographyDir, "relationships.enriched.json");
const nodesPath = path.join(geographyDir, "nodes.json");
const aliasesPath = path.join(geographyDir, "aliases.json");
const reportPath = path.join(reportsDir, "comparison_intelligence_v1_report.md");

const ELIGIBLE_RECOMMENDATIONS = new Set(["strong_candidate", "comparison_candidate"]);

function readJson(filePath) {
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

function milesText(distance) {
  if (distance == null) return "nearby";
  if (distance < 1) return "less than a mile";
  if (distance === 1) return "about 1 mile";
  return `about ${distance} miles`;
}

function coveragePhrase(coverage) {
  if (coverage === "high") return "strong historical Rofo coverage";
  if (coverage === "medium") return "moderate historical Rofo coverage";
  if (coverage === "low") return "limited historical Rofo coverage";
  return "coverage that still needs review";
}

function corridorPhrase(candidate) {
  if (candidate.same_metro_or_market && candidate.same_state) {
    return "within the same legacy geography bucket";
  }
  if (candidate.same_state) return `within ${candidate.source_state}`;
  return "as a legacy nearby-market relationship";
}

function comparisonMode(candidate) {
  if (candidate.public_use_recommendation === "comparison_candidate") {
    return "market comparison candidate";
  }
  return "nearby geography candidate";
}

function makeOpening(candidate) {
  const source = candidate.source_node_name;
  const target = candidate.target_node_name;
  const distance = milesText(candidate.computed_distance_miles);
  return `${target} is a ${comparisonMode(candidate)} for ${source}, sitting ${distance} away ${corridorPhrase(candidate)}. Treat the relationship as a geography prompt for editorial review, not as a market ranking or inventory claim.`;
}

function makeEnvironmentDifferences(candidate) {
  const source = candidate.source_node_name;
  const target = candidate.target_node_name;
  const distance = candidate.computed_distance_miles;

  if (candidate.public_use_recommendation === "comparison_candidate") {
    return [
      `${source} and ${target} are far enough apart to support a real comparison, but close enough to belong in the same regional decision set.`,
      `${target} should be reviewed as a nearby alternative with its own access pattern, tenant base, and commercial identity rather than as a substitute for ${source}.`,
    ];
  }

  if (distance != null && distance <= 5) {
    return [
      `${source} and ${target} are very close geographically, so the first public use should be nearby orientation rather than a strong commercial contrast.`,
      `Any stronger distinction should come from corpus review, built-form differences, or editorial knowledge of how businesses compare the two places.`,
    ];
  }

  return [
    `${source} and ${target} appear close enough to support nearby-market navigation.`,
    `Public comparison copy should wait for a clearer commercial rationale from corpus or editorial review.`,
  ];
}

function makeTenantFit(candidate) {
  const sourceCoverage = coveragePhrase(candidate.source_city_stats_coverage);
  const targetCoverage = coveragePhrase(candidate.target_city_stats_coverage);

  if (candidate.public_use_recommendation === "comparison_candidate") {
    return `Potentially useful for businesses comparing nearby markets with different access, cost, client-proximity, or workforce tradeoffs. Source coverage shows ${sourceCoverage}; target coverage shows ${targetCoverage}.`;
  }

  return `Best treated as a nearby-market path for users who are still orienting geographically. Source coverage shows ${sourceCoverage}; target coverage shows ${targetCoverage}.`;
}

function makeNearbyAlternative(candidate) {
  const source = candidate.source_node_name;
  const target = candidate.target_node_name;
  if (candidate.public_use_recommendation === "comparison_candidate") {
    return `${target} may be a useful nearby alternative to ${source} after editorial review explains the practical business difference.`;
  }
  return `${target} can be shown as near ${source}, but should not be framed as a distinct commercial alternative until the rationale is reviewed.`;
}

function makeEditorialCautions(candidate) {
  const cautions = [
    "Do not expose validation scores publicly.",
    "Do not imply current availability or inventory depth from this relationship.",
    "Do not describe commercial identity without corpus or editorial support.",
  ];

  if (candidate.corpus_support_status === "not_evaluated") {
    cautions.push("Raw corpus support has not been evaluated.");
  }
  if (candidate.public_use_recommendation === "strong_candidate") {
    cautions.push("Strong candidate means strong geography signal, not automatic public comparison copy.");
  }
  return cautions;
}

function buildRecord(candidate, sourceNode, targetNode) {
  const outputSlug = `${slugify(candidate.source_node_name)}__${slugify(candidate.target_node_name)}__${candidate.id.replace(/[^a-zA-Z0-9]+/g, "-")}`;

  return {
    id: `comparison-intelligence:${candidate.id}`,
    relationship_id: candidate.id,
    source: {
      id: candidate.source_id,
      name: candidate.source_node_name,
      type: candidate.source_node_type,
      state: candidate.source_state,
      canonical_path: candidate.source_canonical_path,
      metro_or_market: candidate.source_metro_or_market,
      node_validation_status: sourceNode?.validation_status || null,
    },
    target: {
      id: candidate.target_id,
      name: candidate.target_node_name,
      type: candidate.target_node_type,
      state: candidate.target_state,
      canonical_path: candidate.target_canonical_path,
      metro_or_market: candidate.target_metro_or_market,
      node_validation_status: targetNode?.validation_status || null,
    },
    relationship: {
      type: candidate.relationship_type,
      computed_distance_miles: candidate.computed_distance_miles,
      is_reciprocal: candidate.is_reciprocal,
      same_state: candidate.same_state,
      same_metro_or_market: candidate.same_metro_or_market,
      source_validation_status: candidate.source_validation_status,
      corpus_support_status: candidate.corpus_support_status,
      public_use_recommendation: candidate.public_use_recommendation,
      editorial_status: "unreviewed",
      publication_status: "not_published",
    },
    editorial_intelligence: {
      positioning_summary: makeOpening(candidate),
      environment_differences: makeEnvironmentDifferences(candidate),
      likely_tenant_fit: makeTenantFit(candidate),
      nearby_alternative_note: makeNearbyAlternative(candidate),
      public_label_suggestion: candidate.public_label_suggestion,
      editorial_cautions: makeEditorialCautions(candidate),
    },
    generation_notes: {
      generated_by: "scripts/geography/generate_comparison_intelligence.js",
      generated_at: new Date().toISOString(),
      tone: "calm, editorial, geography-first, non-dashboard",
      source_files: [
        "data/geography/public_relationship_candidates.json",
        "data/geography/relationships.enriched.json",
        "data/geography/nodes.json",
        "data/geography/aliases.json",
      ],
      limitations: [
        "City-level geography only; district-level commercial identity still requires review.",
        "No current availability, listing, rent, or ranking claims are generated.",
        "Representative buildings are not used as an intelligence source.",
      ],
    },
    output_file: `${outputSlug}.json`,
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
  const candidateReview = readJson(candidatesPath);
  const enriched = readJson(enrichedPath);
  const nodes = readJson(nodesPath);
  readJson(aliasesPath);

  const enrichedById = new Map(enriched.map((relationship) => [relationship.id, relationship]));
  const nodeById = new Map(nodes.map((node) => [node.id, node]));

  const eligibleCandidates = candidateReview.candidates
    .filter((candidate) => ELIGIBLE_RECOMMENDATIONS.has(candidate.public_use_recommendation))
    .map((candidate) => ({
      ...enrichedById.get(candidate.id),
      ...candidate,
    }))
    .sort((a, b) => {
      if (a.public_use_recommendation !== b.public_use_recommendation) {
        return a.public_use_recommendation === "strong_candidate" ? -1 : 1;
      }
      if (b.validation_score !== a.validation_score) return b.validation_score - a.validation_score;
      return (a.computed_distance_miles ?? Infinity) - (b.computed_distance_miles ?? Infinity);
    });

  fs.mkdirSync(outputDir, { recursive: true });
  fs.mkdirSync(reportsDir, { recursive: true });

  const generated = [];
  for (const candidate of eligibleCandidates) {
    const record = buildRecord(candidate, nodeById.get(candidate.source_id), nodeById.get(candidate.target_id));
    fs.writeFileSync(path.join(outputDir, record.output_file), JSON.stringify(record, null, 2) + "\n");
    generated.push(record);
  }

  const manifest = {
    generated_at: new Date().toISOString(),
    output_directory: "generated/geography/comparison-intelligence",
    total_records: generated.length,
    source_files: [
      "data/geography/public_relationship_candidates.json",
      "data/geography/relationships.enriched.json",
      "data/geography/nodes.json",
      "data/geography/aliases.json",
    ],
    eligibility: {
      public_use_recommendation: [...ELIGIBLE_RECOMMENDATIONS],
    },
    records: generated.map((record) => ({
      id: record.id,
      relationship_id: record.relationship_id,
      source: record.source.name,
      target: record.target.name,
      public_use_recommendation: record.relationship.public_use_recommendation,
      file: record.output_file,
    })),
  };
  fs.writeFileSync(path.join(outputDir, "_manifest.json"), JSON.stringify(manifest, null, 2) + "\n");

  const byRecommendation = countBy(generated, (record) => record.relationship.public_use_recommendation);
  const byState = countBy(generated, (record) => record.source.state);
  const examples = generated.slice(0, 20);
  const comparisonExamples = generated.filter((record) => record.relationship.public_use_recommendation === "comparison_candidate").slice(0, 20);

  const report = `# Comparison Intelligence V1 Report

Date: 2026-05-21

Output directory:

- \`generated/geography/comparison-intelligence/\`

Inputs:

- \`data/geography/public_relationship_candidates.json\`
- \`data/geography/relationships.enriched.json\`
- \`data/geography/nodes.json\`
- \`data/geography/aliases.json\`

## Summary

Comparison Intelligence V1 generated calm, editorial geography comparison records for relationships marked \`strong_candidate\` or \`comparison_candidate\`.

These records are not connected to public templates. They are review artifacts for future SEO, internal-linking, nearby-market, and district-comparison workflows.

## Counts

| Metric | Count |
| --- | ---: |
| Generated comparison records | ${generated.length} |
| Strong candidate inputs | ${generated.filter((record) => record.relationship.public_use_recommendation === "strong_candidate").length} |
| Comparison candidate inputs | ${generated.filter((record) => record.relationship.public_use_recommendation === "comparison_candidate").length} |

## Count By Recommendation

${table(byRecommendation, [
  { label: "Recommendation", value: (row) => row.key },
  { label: "Count", value: (row) => row.count },
])}

## Count By State

${table(byState, [
  { label: "State", value: (row) => row.key },
  { label: "Count", value: (row) => row.count },
])}

## Generated Record Examples

${table(examples, [
  { label: "Source", value: (row) => row.source.name },
  { label: "Target", value: (row) => row.target.name },
  { label: "Recommendation", value: (row) => row.relationship.public_use_recommendation },
  { label: "Distance", value: (row) => row.relationship.computed_distance_miles },
  { label: "File", value: (row) => row.output_file },
])}

## Comparison Candidate Examples

${table(comparisonExamples, [
  { label: "Source", value: (row) => row.source.name },
  { label: "Target", value: (row) => row.target.name },
  { label: "Distance", value: (row) => row.relationship.computed_distance_miles },
  { label: "Positioning", value: (row) => row.editorial_intelligence.positioning_summary },
])}

## Editorial Guardrails

- Do not publish these records without editorial review.
- Do not expose validation scores.
- Do not make availability, rent, ranking, or inventory-depth claims.
- Do not infer district identity from city-level nearness alone.
- Use the generated copy as a restrained starting point, not final market prose.

## Recommended Next Step

Run a metro-specific editorial pass on the generated records. The highest-value next layer is to add a short commercial rationale to each selected relationship: access pattern, tenant fit, built form, client proximity, workforce geography, transit/freeway connection, or nearby district alternative logic.
`;

  fs.writeFileSync(reportPath, report);

  console.log(JSON.stringify({
    output_directory: "generated/geography/comparison-intelligence",
    manifest: "generated/geography/comparison-intelligence/_manifest.json",
    report: "data/geography/reports/comparison_intelligence_v1_report.md",
    generated_records: generated.length,
    by_recommendation: Object.fromEntries(byRecommendation.map((row) => [row.key, row.count])),
  }, null, 2));
}

main();
