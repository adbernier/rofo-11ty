const fs = require("fs");
const path = require("path");

const pages = require("../../_data/neighborhoodPages.js");
const commercialLocationModel = require("../../_data/commercialLocationModel.js");
const comparisonPages = require("../../_data/locationComparisonPages.js");

const outputDir = path.join(process.cwd(), "data/reports");
const jsonPath = path.join(outputDir, "district-building-depth-audit-v1.json");
const mdPath = path.join(outputDir, "district-building-depth-audit-v1.md");

function count(value) {
  return Array.isArray(value) ? value.length : 0;
}

function districtType(page, model) {
  const tags = [
    model?.primary_archetype,
    ...(model?.secondary_archetypes || []),
    ...(page.approximate_space_types || []),
    ...(page.commercial_profile || []),
    page.commercial_area_type,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (/life|science|lab|biotech|pharma|medical|healthcare|research/.test(tags)) return "life science / medical";
  if (/warehouse|industrial|logistics|distribution|manufacturing|port|airport|flex/.test(tags)) return "industrial / flex";
  if (/downtown|office|professional|corporate|client|finance|transit/.test(tags)) return "office";
  if (/retail|hospitality|mixed|creative|adaptive|waterfront/.test(tags)) return "mixed commercial";
  return "commercial district";
}

function buildingDepthScore(representativeBuildingCount) {
  if (representativeBuildingCount >= 20) return 100;
  if (representativeBuildingCount >= 10) return 75;
  if (representativeBuildingCount >= 5) return 50;
  if (representativeBuildingCount >= 1) return 25;
  return 0;
}

function buildingBucket(representativeBuildingCount) {
  if (representativeBuildingCount >= 20) return "20+";
  if (representativeBuildingCount >= 10) return "10-20";
  if (representativeBuildingCount >= 5) return "5-10";
  return "0-5";
}

function scorePriority({ representativeBuildingCount, comparisonCount, relationshipCount, districtType, hasLocationModel }) {
  let score = 0;

  if (representativeBuildingCount === 0) score += 45;
  else if (representativeBuildingCount <= 2) score += 36;
  else if (representativeBuildingCount <= 5) score += 26;
  else if (representativeBuildingCount <= 10) score += 12;

  score += Math.min(comparisonCount, 4) * 8;
  score += Math.min(relationshipCount, 6) * 4;

  if (/industrial|flex|life science|medical/.test(districtType)) score += 10;
  if (/office/.test(districtType)) score += 6;
  if (hasLocationModel) score += 6;

  return Math.min(100, score);
}

function priorityBand(priorityScore) {
  if (priorityScore >= 75) return "highest";
  if (priorityScore >= 55) return "high";
  if (priorityScore >= 35) return "medium";
  return "lower";
}

function comparisonCountForPath(path) {
  return comparisonPages.filter(
    (comparison) => comparison.district_a_path === path || comparison.district_b_path === path
  ).length;
}

function relationshipCountForPage(page, model) {
  const paths = new Set();
  for (const relationship of model?.compare_with || []) {
    if (relationship.district_path) paths.add(relationship.district_path);
  }
  for (const relationship of page.public_commercial_districts?.districts || []) {
    if (relationship.url) paths.add(relationship.url);
  }
  for (const relationship of page.nearby_neighborhoods || []) {
    if (relationship.url || relationship.path) paths.add(relationship.url || relationship.path);
  }
  return paths.size;
}

function rowForPage(page) {
  const model = commercialLocationModel.byPath[page.canonical_neighborhood_path];
  const representativeBuildingCount = count(page.representative_buildings);
  const representativeBuildingCardCount = count(page.representative_building_cards);
  const comparisonCount = comparisonCountForPath(page.canonical_neighborhood_path);
  const relationshipCount = relationshipCountForPage(page, model);
  const type = districtType(page, model);
  const depthScore = buildingDepthScore(representativeBuildingCount);
  const priorityScore = scorePriority({
    representativeBuildingCount,
    comparisonCount,
    relationshipCount,
    districtType: type,
    hasLocationModel: Boolean(model),
  });

  return {
    district_name: page.name,
    city: page.city,
    state_abbr: page.state_abbr,
    path: page.canonical_neighborhood_path,
    district_type: type,
    primary_archetype: model?.primary_archetype || null,
    primary_archetype_label: model?.primary_archetype_label || null,
    representative_building_count: representativeBuildingCount,
    representative_building_card_count: representativeBuildingCardCount,
    comparison_count: comparisonCount,
    relationship_count: relationshipCount,
    building_depth_score: depthScore,
    priority_score: priorityScore,
    priority_band: priorityBand(priorityScore),
    building_count_bucket: buildingBucket(representativeBuildingCount),
    has_location_model: Boolean(model),
  };
}

function table(rows, columns) {
  const header = `| ${columns.map((column) => column.label).join(" |")} |`;
  const divider = `| ${columns.map(() => "---").join(" |")} |`;
  const body = rows.map((row) => `| ${columns.map((column) => column.value(row)).join(" |")} |`);
  return [header, divider, ...body].join("\n");
}

function escapeCell(value) {
  return String(value ?? "").replace(/\|/g, "/");
}

const publicDistricts = pages
  .filter((page) => page.canonical_neighborhood_path && !page.noindex && !page.prototype)
  .map(rowForPage)
  .sort((a, b) => b.priority_score - a.priority_score || a.representative_building_count - b.representative_building_count || a.district_name.localeCompare(b.district_name));

const buckets = {
  "0-5": publicDistricts.filter((row) => row.building_count_bucket === "0-5"),
  "5-10": publicDistricts.filter((row) => row.building_count_bucket === "5-10"),
  "10-20": publicDistricts.filter((row) => row.building_count_bucket === "10-20"),
  "20+": publicDistricts.filter((row) => row.building_count_bucket === "20+"),
};

const typeSummary = [...new Set(publicDistricts.map((row) => row.district_type))]
  .sort()
  .map((type) => {
    const rows = publicDistricts.filter((row) => row.district_type === type);
    return {
      district_type: type,
      district_count: rows.length,
      average_representative_buildings: Number((rows.reduce((sum, row) => sum + row.representative_building_count, 0) / rows.length).toFixed(2)),
      highest_priority_count: rows.filter((row) => row.priority_band === "highest").length,
      zero_building_count: rows.filter((row) => row.representative_building_count === 0).length,
    };
  });

const audit = {
  generated_at: new Date().toISOString(),
  methodology: {
    representative_building_count: "Counts public representative_buildings on district pages. Representative building cards are reported separately because they do not require public building pages.",
    comparison_count: "Counts location comparison pages where the district is district_a or district_b.",
    relationship_count: "Counts unique compare_with, public commercial district, and nearby relationship targets.",
    building_depth_score: "0 for no public representative buildings, 25 for 1-4, 50 for 5-9, 75 for 10-19, 100 for 20+.",
    priority_score: "Higher when public building depth is shallow, comparison/relationship surface area is strong, and the district has a location model. Industrial/flex and life-science/medical districts receive a small boost because building examples materially improve comprehension.",
  },
  summary: {
    district_count: publicDistricts.length,
    bucket_counts: Object.fromEntries(Object.entries(buckets).map(([bucket, rows]) => [bucket, rows.length])),
    highest_priority_count: publicDistricts.filter((row) => row.priority_band === "highest").length,
    high_priority_count: publicDistricts.filter((row) => row.priority_band === "high").length,
  },
  type_summary: typeSummary,
  highest_priority_districts: publicDistricts.filter((row) => row.priority_band === "highest").slice(0, 75),
  all_districts: publicDistricts,
};

const topColumns = [
  { label: "Priority", value: (row) => row.priority_score },
  { label: "District", value: (row) => `[${escapeCell(row.district_name)}](${row.path})` },
  { label: "Type", value: (row) => escapeCell(row.district_type) },
  { label: "Buildings", value: (row) => row.representative_building_count },
  { label: "Cards", value: (row) => row.representative_building_card_count },
  { label: "Comparisons", value: (row) => row.comparison_count },
  { label: "Relationships", value: (row) => row.relationship_count },
];

const bucketColumns = [
  { label: "Bucket", value: (row) => row.bucket },
  { label: "Count", value: (row) => row.count },
  { label: "Expansion posture", value: (row) => row.posture },
];

const typeColumns = [
  { label: "Type", value: (row) => escapeCell(row.district_type) },
  { label: "Districts", value: (row) => row.district_count },
  { label: "Avg buildings", value: (row) => row.average_representative_buildings },
  { label: "Zero buildings", value: (row) => row.zero_building_count },
  { label: "Highest priority", value: (row) => row.highest_priority_count },
];

const bucketRows = [
  { bucket: "0-5", count: buckets["0-5"].length, posture: "Primary expansion pool. Add credible public representatives or representative cards first." },
  { bucket: "5-10", count: buckets["5-10"].length, posture: "Selective expansion. Improve only where district story is still underexplained." },
  { bucket: "10-20", count: buckets["10-20"].length, posture: "Generally adequate. Use cleanup, ordering, and role-label refinement before adding more." },
  { bucket: "20+", count: buckets["20+"].length, posture: "Deep coverage. Avoid more public depth unless there is a specific product reason." },
];

const zeroBuildingTop = publicDistricts
  .filter((row) => row.representative_building_count === 0)
  .slice(0, 50);

const markdown = `# District Building Depth Audit V1

Generated: ${audit.generated_at}

This is an internal audit of public district pages. It does not modify public pages.

## Methodology

- Representative building count uses public \`representative_buildings\`.
- Representative building cards are reported separately because they enrich pages without requiring public building pages.
- Comparison count uses location comparison pages where the district appears as either side.
- Relationship count combines location-model comparisons, reviewed commercial district relationships, and nearby relationship targets.
- Priority score favors districts with shallow public representative-building depth and meaningful comparison/relationship surface area.

## Summary

- Public district pages audited: ${audit.summary.district_count}
- Highest-priority building expansion targets: ${audit.summary.highest_priority_count}
- High-priority building expansion targets: ${audit.summary.high_priority_count}

${table(bucketRows, bucketColumns)}

## District Type Summary

${table(typeSummary, typeColumns)}

## Highest Priority Expansion Targets

${table(publicDistricts.slice(0, 75), topColumns)}

## Highest Priority Zero-Building Districts

${table(zeroBuildingTop, topColumns)}

## Expansion Roadmap

1. Start with 0-building districts that already have 2+ comparison paths and clear industrial, logistics, life-science, or office archetypes.
2. Prioritize representative building cards first where public building pages do not yet exist.
3. Add public representative building pages only where existing raw data supports clean identity, address quality, and district role.
4. Treat 5-10 building districts as refinement candidates rather than automatic expansion candidates.
5. Avoid expanding 10+ building districts unless the current set is redundant, mislabeled, or weakly matched to the district thesis.

## Full Data

See \`data/reports/district-building-depth-audit-v1.json\` for all district rows.
`;

fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(jsonPath, `${JSON.stringify(audit, null, 2)}\n`);
fs.writeFileSync(mdPath, markdown);

console.log(`Wrote ${jsonPath}`);
console.log(`Wrote ${mdPath}`);
console.log(`Audited ${publicDistricts.length} public district pages`);
