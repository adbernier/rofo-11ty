#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "../..");
const geographyDir = path.join(root, "data/geography");
const reportsDir = path.join(geographyDir, "reports");

const nodesPath = path.join(geographyDir, "nodes.json");
const aliasesPath = path.join(geographyDir, "aliases.json");
const relationshipsPath = path.join(geographyDir, "relationships.json");
const enrichedPath = path.join(geographyDir, "relationships.enriched.json");
const reportPath = path.join(reportsDir, "relationship_validation_report.md");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function round(value, decimals = 1) {
  if (value == null || Number.isNaN(value)) return null;
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function toRad(degrees) {
  return (degrees * Math.PI) / 180;
}

function distanceMiles(a, b) {
  if (!a?.coordinates || !b?.coordinates) return null;

  const lat1 = Number(a.coordinates.lat);
  const lng1 = Number(a.coordinates.lng);
  const lat2 = Number(b.coordinates.lat);
  const lng2 = Number(b.coordinates.lng);

  if (![lat1, lng1, lat2, lng2].every(Number.isFinite)) return null;

  const earthRadiusMiles = 3958.8;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) ** 2;

  return round(2 * earthRadiusMiles * Math.asin(Math.sqrt(h)), 1);
}

function sameMetroOrMarket(sourceNode, targetNode) {
  if (!sourceNode || !targetNode) return false;

  const sourceMetro = sourceNode.metro || null;
  const targetMetro = targetNode.metro || null;
  if (sourceMetro && targetMetro && sourceMetro === targetMetro) return true;

  const sourceRegion = sourceNode.region || null;
  const targetRegion = targetNode.region || null;
  if (sourceRegion && targetRegion && sourceRegion === targetRegion) return true;

  const sourceParent = sourceNode.parent || null;
  const targetParent = targetNode.parent || null;
  if (sourceParent && targetParent && sourceParent === targetParent) return true;

  return false;
}

function sharedAliasNotes(sourceId, targetId, aliasesByTarget) {
  const sourceAliases = aliasesByTarget.get(sourceId) || new Set();
  const targetAliases = aliasesByTarget.get(targetId) || new Set();
  if (!sourceAliases.size || !targetAliases.size) return null;

  const overlap = [...sourceAliases].filter((alias) => targetAliases.has(alias));
  if (!overlap.length) return null;

  return `Shared normalized alias terms: ${overlap.slice(0, 5).join(", ")}${
    overlap.length > 5 ? `, plus ${overlap.length - 5} more` : ""
  }.`;
}

function validationScore({
  sourceNode,
  targetNode,
  isSelfLink,
  isReciprocal,
  sameState,
  sameMarket,
  distance,
}) {
  if (!sourceNode || !targetNode || isSelfLink) return 0;

  let score = 0;

  if (isReciprocal) score += 30;
  if (sameMarket) score += 25;
  if (sameState) score += 10;

  if (distance != null) {
    if (distance <= 10) score += 25;
    else if (distance <= 25) score += 18;
    else if (distance <= 50) score += 10;
    else if (distance <= 100) score += 3;
    else if (distance > 250) score -= 25;
    else score -= 8;
  }

  if (sourceNode.validation_status === "needs_review") score -= 15;
  if (targetNode.validation_status === "needs_review") score -= 15;

  return Math.max(0, Math.min(100, score));
}

function classify({ sourceNode, targetNode, isSelfLink, distance, sameState, sameMarket, isReciprocal, score }) {
  if (!sourceNode || !targetNode || isSelfLink) {
    return {
      validation_status: "suppress",
      promotion_status: "suppress",
    };
  }

  if (distance != null && distance > 250 && !sameMarket) {
    return {
      validation_status: "needs_review",
      promotion_status: "suppress",
    };
  }

  if (distance != null && distance > 100 && !sameMarket) {
    return {
      validation_status: "needs_review",
      promotion_status: "editorial_review",
    };
  }

  if (score >= 60 && isReciprocal && (sameMarket || sameState) && distance != null && distance <= 50) {
    return {
      validation_status: "validated_candidate",
      promotion_status: "candidate_public",
    };
  }

  if (score >= 45 && (isReciprocal || sameMarket) && distance != null && distance <= 100) {
    return {
      validation_status: "needs_editorial_review",
      promotion_status: "editorial_review",
    };
  }

  return {
    validation_status: "internal_seed",
    promotion_status: "internal_seed",
  };
}

function table(rows, columns) {
  if (!rows.length) return "_None._\n";
  const header = `| ${columns.map((column) => column.label).join(" | ")} |`;
  const separator = `| ${columns.map(() => "---").join(" | ")} |`;
  const body = rows.map((row) => {
    return `| ${columns
      .map((column) => String(column.value(row) ?? "").replace(/\|/g, "\\|"))
      .join(" | ")} |`;
  });
  return [header, separator, ...body].join("\n") + "\n";
}

function main() {
  const nodes = readJson(nodesPath);
  const aliases = readJson(aliasesPath);
  const relationships = readJson(relationshipsPath);

  const nodeById = new Map(nodes.map((node) => [node.id, node]));
  const relationshipByPair = new Map(
    relationships.map((relationship) => [
      `${relationship.source_id}::${relationship.target_id}`,
      relationship,
    ])
  );

  const aliasesByTarget = new Map();
  for (const alias of aliases) {
    if (!alias.target_id || !alias.normalized_alias) continue;
    if (!aliasesByTarget.has(alias.target_id)) {
      aliasesByTarget.set(alias.target_id, new Set());
    }
    aliasesByTarget.get(alias.target_id).add(alias.normalized_alias);
  }

  const enriched = relationships.map((relationship) => {
    const sourceNode = nodeById.get(relationship.source_id);
    const targetNode = nodeById.get(relationship.target_id);
    const isSelfLink = relationship.source_id === relationship.target_id;
    const reciprocal = relationshipByPair.get(`${relationship.target_id}::${relationship.source_id}`);
    const distance = distanceMiles(sourceNode, targetNode);
    const sameState = Boolean(
      sourceNode?.state_abbr && targetNode?.state_abbr && sourceNode.state_abbr === targetNode.state_abbr
    );
    const sameMarket = sameMetroOrMarket(sourceNode, targetNode);
    const isReciprocal = Boolean(reciprocal);
    const score = validationScore({
      sourceNode,
      targetNode,
      isSelfLink,
      isReciprocal,
      sameState,
      sameMarket,
      distance,
    });
    const classification = classify({
      sourceNode,
      targetNode,
      isSelfLink,
      distance,
      sameState,
      sameMarket,
      isReciprocal,
      score,
    });

    return {
      ...relationship,
      source_validation_status: relationship.validation_status || null,
      computed_distance_miles: distance,
      is_reciprocal: isReciprocal,
      reciprocal_relationship_id: reciprocal?.id || null,
      same_state: sameState,
      same_metro_or_market: sameMarket,
      source_node_name: sourceNode?.name || null,
      target_node_name: targetNode?.name || null,
      source_node_type: sourceNode?.type || null,
      target_node_type: targetNode?.type || null,
      alias_overlap_notes: sharedAliasNotes(relationship.source_id, relationship.target_id, aliasesByTarget),
      corpus_support_status: "not_evaluated",
      validation_score: score,
      validation_status: classification.validation_status,
      promotion_status: classification.promotion_status,
    };
  });

  fs.mkdirSync(reportsDir, { recursive: true });
  fs.writeFileSync(enrichedPath, JSON.stringify(enriched, null, 2) + "\n");

  const counts = {
    total: enriched.length,
    suppress: enriched.filter((relationship) => relationship.promotion_status === "suppress").length,
    candidate_public: enriched.filter((relationship) => relationship.promotion_status === "candidate_public").length,
    editorial_review: enriched.filter((relationship) => relationship.promotion_status === "editorial_review").length,
    internal_seed: enriched.filter((relationship) => relationship.promotion_status === "internal_seed").length,
    missing_node: enriched.filter((relationship) => !relationship.source_node_name || !relationship.target_node_name).length,
    reciprocal: enriched.filter((relationship) => relationship.is_reciprocal).length,
    distance_available: enriched.filter((relationship) => relationship.computed_distance_miles != null).length,
  };

  const topReciprocalPairs = enriched
    .filter((relationship) => relationship.is_reciprocal)
    .sort((a, b) => {
      if (b.validation_score !== a.validation_score) return b.validation_score - a.validation_score;
      return (a.computed_distance_miles ?? Infinity) - (b.computed_distance_miles ?? Infinity);
    })
    .slice(0, 20);

  const longestDistanceRelationships = enriched
    .filter((relationship) => relationship.computed_distance_miles != null)
    .sort((a, b) => b.computed_distance_miles - a.computed_distance_miles)
    .slice(0, 20);

  const missingNodeIssues = enriched
    .filter((relationship) => !relationship.source_node_name || !relationship.target_node_name)
    .slice(0, 20);

  const suppressed = enriched
    .filter((relationship) => relationship.promotion_status === "suppress")
    .sort((a, b) => {
      if ((b.computed_distance_miles ?? -1) !== (a.computed_distance_miles ?? -1)) {
        return (b.computed_distance_miles ?? -1) - (a.computed_distance_miles ?? -1);
      }
      return a.id.localeCompare(b.id);
    })
    .slice(0, 20);

  const report = `# Relationship Validation V1 Report

Date: 2026-05-21

Input:

- \`data/geography/relationships.json\`
- \`data/geography/nodes.json\`
- \`data/geography/aliases.json\`

Output:

- \`data/geography/relationships.enriched.json\`

## Summary

Relationship Validation V1 enriches legacy geography relationships with distance, reciprocity, same-state and same-region signals. It does not promote anything directly into public page rendering.

Promotion statuses are conservative:

- \`candidate_public\`: strong enough to become a public comparison candidate after editorial review.
- \`editorial_review\`: plausible but needs human interpretation before use.
- \`internal_seed\`: useful infrastructure seed, not public-ready.
- \`suppress\`: missing nodes, self-links, or geography that appears too weak/misleading for public use.

## Counts

| Metric | Count |
| --- | ---: |
| Total relationships processed | ${counts.total} |
| Suppressed relationships | ${counts.suppress} |
| Candidate public relationships | ${counts.candidate_public} |
| Editorial review relationships | ${counts.editorial_review} |
| Internal seed relationships | ${counts.internal_seed} |
| Reciprocal relationships | ${counts.reciprocal} |
| Relationships with computed distance | ${counts.distance_available} |
| Missing-node issues | ${counts.missing_node} |

## Scoring Model

Positive signals:

- reciprocal relationship
- reasonable computed distance
- same legacy metro/region or parent market
- same state

Negative signals:

- missing source or target node
- self-link
- very large distance without shared market support
- source or target node already marked \`needs_review\`

Scores are internal triage aids only. They should not be displayed publicly.

## Top Reciprocal Pairs

${table(topReciprocalPairs, [
  { label: "Relationship", value: (row) => row.id },
  { label: "Source", value: (row) => row.source_node_name },
  { label: "Target", value: (row) => row.target_node_name },
  { label: "Distance", value: (row) => row.computed_distance_miles },
  { label: "Score", value: (row) => row.validation_score },
  { label: "Promotion", value: (row) => row.promotion_status },
])}

## Longest-Distance Relationships

${table(longestDistanceRelationships, [
  { label: "Relationship", value: (row) => row.id },
  { label: "Source", value: (row) => `${row.source_node_name || row.source_id}` },
  { label: "Target", value: (row) => `${row.target_node_name || row.target_id}` },
  { label: "Distance", value: (row) => row.computed_distance_miles },
  { label: "Same Market", value: (row) => row.same_metro_or_market },
  { label: "Promotion", value: (row) => row.promotion_status },
])}

## Missing-Node Issues

${table(missingNodeIssues, [
  { label: "Relationship", value: (row) => row.id },
  { label: "Source ID", value: (row) => row.source_id },
  { label: "Target ID", value: (row) => row.target_id },
  { label: "Promotion", value: (row) => row.promotion_status },
])}

## Suppressed Sample

${table(suppressed, [
  { label: "Relationship", value: (row) => row.id },
  { label: "Source", value: (row) => row.source_node_name || row.source_id },
  { label: "Target", value: (row) => row.target_node_name || row.target_id },
  { label: "Distance", value: (row) => row.computed_distance_miles },
  { label: "Reason", value: (row) => (!row.source_node_name || !row.target_node_name ? "missing node" : "large distance / weak market support") },
])}

## Recommended Next Step

Run a region-focused editorial validation pass for high-priority metros, starting with Atlanta and the Bay Area. For each \`candidate_public\` or \`editorial_review\` relationship, add a short commercial rationale before using it in public district comparison logic.

The next enrichment layer should add raw corpus support:

- shared lead/listing/building corpus evidence
- district-level assignment where available
- relationship rationale candidates
- editorial approval status

Until that layer exists, \`relationships.enriched.json\` should remain infrastructure only.
`;

  fs.writeFileSync(reportPath, report);
  console.log(
    JSON.stringify(
      {
        output: path.relative(root, enrichedPath),
        report: path.relative(root, reportPath),
        counts,
      },
      null,
      2
    )
  );
}

main();
