#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const INPUT_JOIN = "data/media/generated/district_media_join_v3.json";
const ORIGINAL_IMAGE_INDEX = "data/media/generated/original_image_index_v1/original_images_by_building_id.json";
const OUTPUT_PATH = "data/media/generated/representative_image_review_manifest_v1.json";
const REPORT_PATH = "data/media/reports/representative_image_review_manifest_v1.md";

const PRIORITY_LIMIT = 8;
const SECONDARY_LIMIT = 16;
const MAX_IMAGES_PER_BUILDING_SUMMARY = 4;

function loadJson(filePath, fallback = null) {
  if (!fs.existsSync(filePath)) return fallback;
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function formatNumber(value) {
  return new Intl.NumberFormat("en-US").format(value || 0);
}

function imageSizeScore(image) {
  const size = Number(image.size_bytes || 0);
  if (size >= 500000) return 12;
  if (size >= 250000) return 10;
  if (size >= 120000) return 8;
  if (size >= 60000) return 5;
  if (size > 0) return 2;
  return 0;
}

function environmentCategory(building, district) {
  const text = [
    building.building_name,
    building.address,
    building.assignment_neighborhood,
    district.district.name,
    district.district.environment_type,
    district.district.commercial_identity_summary,
  ].join(" ").toLowerCase();

  if (text.includes("oyster") || text.includes("gateway") || text.includes("biotech") || text.includes("life science")) return "industrial";
  if (text.includes("warehouse") || text.includes("industrial") || text.includes("west oakland") || text.includes("mandela")) return "industrial";
  if (text.includes("historic") || text.includes("russ") || text.includes("jackson")) return "historic";
  if (text.includes("broadway") || text.includes("montgomery") || text.includes("market") || text.includes("sansome") || text.includes("city center")) return "office_tower";
  if (text.includes("retail") || text.includes("corridor") || text.includes("castro") || text.includes("university")) return "retail_corridor";
  if (text.includes("water") || text.includes("embarcadero") || text.includes("franklin") || text.includes("terry")) return "streetscape";
  if (text.includes("mixed") || text.includes("soma") || text.includes("mission bay")) return "mixed_use";
  if (text.includes("adaptive") || text.includes("reuse") || text.includes("brannan")) return "adaptive_reuse";
  return "pedestrian_environment";
}

function imageDiversityScore(building) {
  const extensions = new Set((building.sample_image_paths || []).map((image) => image.extension).filter(Boolean));
  const sizes = new Set((building.sample_image_paths || []).map((image) => {
    const size = Number(image.size_bytes || 0);
    if (size >= 500000) return "large";
    if (size >= 120000) return "medium";
    if (size > 0) return "small";
    return "unknown";
  }));
  return Math.min(extensions.size * 2 + sizes.size * 2 + Math.min(building.original_image_count || 0, 5), 15);
}

function buildingProminenceScore(building) {
  let score = 0;
  score += Math.min(Number(building.listing_count || 0), 100) / 4;
  if (building.representative_building_seed) score += 18;
  if (building.canonical_building_path) score += 8;
  if (building.building_record_confidence === "high") score += 6;
  if (building.district_assignment_confidence === "high") score += 8;
  else if (building.district_assignment_confidence === "medium") score += 4;
  return score;
}

function duplicatePenalty(building) {
  const count = Number(building.original_image_count || 0);
  if (count >= 20) return 12;
  if (count >= 10) return 7;
  return 0;
}

function reviewScore(building) {
  const images = building.sample_image_paths || [];
  const bestImageScore = images.reduce((max, image) => Math.max(max, imageSizeScore(image)), 0);
  const imageCoverageScore = Math.min(Number(building.original_image_count || 0), 10) * 5;
  const base = Number(building.representative_image_score_placeholder || 0);
  return Math.round((base + buildingProminenceScore(building) + imageCoverageScore + bestImageScore + imageDiversityScore(building) - duplicatePenalty(building)) * 10) / 10;
}

function imageSummary(image) {
  return {
    filename: image.filename || null,
    relative_path: image.relative_path || null,
    absolute_path: image.absolute_path || null,
    extension: image.extension || null,
    size_bytes: image.size_bytes || 0,
    mtime: image.mtime || null,
    hash_part: image.hash_part || null,
  };
}

function candidateSummary(building, district) {
  const images = (building.sample_image_paths || [])
    .slice()
    .sort((a, b) => Number(b.size_bytes || 0) - Number(a.size_bytes || 0));
  const category = environmentCategory(building, district);
  const score = reviewScore(building);
  return {
    building_id: building.building_id,
    building_name: building.building_name || "",
    address: building.address || "",
    city: building.city || district.district.city,
    state_abbr: building.state_abbr || district.district.state_abbr,
    canonical_building_path: building.canonical_building_path || null,
    source_layers: building.source_layers || [],
    representative_building_seed: Boolean(building.representative_building_seed),
    original_image_count: Number(building.original_image_count || 0),
    image_candidate_summaries: images.slice(0, MAX_IMAGES_PER_BUILDING_SUMMARY).map(imageSummary),
    sample_image_filenames: images.slice(0, MAX_IMAGES_PER_BUILDING_SUMMARY).map((image) => image.filename).filter(Boolean),
    best_sample_image_path: images[0] ? imageSummary(images[0]) : null,
    representative_score_placeholder: score,
    editorial_review_status: building.original_image_count > 0 ? "unreviewed" : "needs_image_match",
    editorial_decision_placeholder: "pending",
    visual_environment_category: category,
    building_prominence_placeholder: buildingProminenceScore(building),
    image_diversity_placeholder: imageDiversityScore(building),
    duplicate_suppression_note: Number(building.original_image_count || 0) >= 10
      ? "High image count for one building. Review for repetitive angles or derivative-like originals before choosing representative imagery."
      : "",
    notes: "Internal editorial prioritization only. Source images remain in district_media_join_v3 and original image index.",
  };
}

function environmentMix(candidates) {
  const mix = {};
  for (const candidate of candidates) {
    mix[candidate.visual_environment_category] = (mix[candidate.visual_environment_category] || 0) + 1;
  }
  return mix;
}

function splitTiers(candidates) {
  const withImages = candidates.filter((candidate) => candidate.original_image_count > 0);
  const withoutImages = candidates.filter((candidate) => candidate.original_image_count === 0 && candidate.representative_building_seed);
  const ordered = withImages.concat(withoutImages).sort((a, b) => b.representative_score_placeholder - a.representative_score_placeholder);
  const priority = ordered.slice(0, PRIORITY_LIMIT);
  const secondary = ordered.slice(PRIORITY_LIMIT, PRIORITY_LIMIT + SECONDARY_LIMIT);
  const longTail = ordered.slice(PRIORITY_LIMIT + SECONDARY_LIMIT);
  return { priority, secondary, longTail, ordered };
}

function districtReview(district) {
  const candidates = (district.representative_image_candidates || district.buildings || [])
    .map((building) => candidateSummary(building, district));
  const allUnderlyingImages = candidates.reduce((sum, candidate) => sum + candidate.original_image_count, 0);
  const { priority, secondary, longTail, ordered } = splitTiers(candidates);
  const stats = district.image_coverage_statistics || {};

  return {
    district_name: district.district.name,
    district_slug: district.district.slug,
    district_id: district.district.id,
    canonical_path: district.district.canonical_path || null,
    coverage_stats: {
      building_count: stats.building_count || 0,
      buildings_with_original_image_coverage: stats.buildings_with_original_image_coverage || 0,
      original_image_count: stats.original_image_count || allUnderlyingImages,
      coverage_rate: stats.coverage_rate || 0,
      average_original_images_per_covered_building: stats.average_original_images_per_covered_building || 0,
      review_candidate_building_count: candidates.length,
      review_candidate_image_count: allUnderlyingImages,
    },
    priority_review: priority,
    secondary_review: secondary,
    long_tail_available: {
      remaining_building_candidate_count: longTail.length,
      remaining_image_count: longTail.reduce((sum, candidate) => sum + candidate.original_image_count, 0),
      source_of_truth: "data/media/generated/district_media_join_v3.json",
      note: "Long-tail images are not excluded. They remain available in district_media_join_v3 and the original image index.",
    },
    environment_mix: environmentMix(ordered),
    editorial_placeholders: {
      district_image_strategy: "pending_editorial_review",
      selected_hero_image: null,
      selected_context_images: [],
      review_status: "unreviewed",
    },
  };
}

function markdownTable(headers, rows) {
  if (!rows.length) return "_None._";
  return [
    `| ${headers.join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${row.join(" | ")} |`),
  ].join("\n");
}

function writeReport(output) {
  const lines = [];
  lines.push("# Representative Image Review Manifest V1");
  lines.push("");
  lines.push("This is an internal editorial prioritization layer for reviewing representative district imagery. It does not publish images, create galleries, upload to R2, resize, optimize, transform, delete, or suppress source media.");
  lines.push("");
  lines.push("## Source Of Truth");
  lines.push("");
  lines.push("- Complete district media join: `data/media/generated/district_media_join_v3.json`");
  lines.push("- Original image lookup: `data/media/generated/original_image_index_v1/original_images_by_building_id.json`");
  lines.push("- This manifest only orders small review sets for humans.");
  lines.push("");
  lines.push("## District Review Tiers");
  lines.push("");
  lines.push(markdownTable(
    ["District", "Buildings", "Covered buildings", "Images", "Priority", "Secondary", "Long-tail buildings"],
    Object.values(output.districts).map((district) => [
      district.district_name,
      formatNumber(district.coverage_stats.building_count),
      formatNumber(district.coverage_stats.buildings_with_original_image_coverage),
      formatNumber(district.coverage_stats.original_image_count),
      formatNumber(district.priority_review.length),
      formatNumber(district.secondary_review.length),
      formatNumber(district.long_tail_available.remaining_building_candidate_count),
    ]),
  ));
  lines.push("");
  lines.push("## Guardrails");
  lines.push("");
  lines.push("- Heuristics prioritize review order only; they do not eliminate images.");
  lines.push("- Image count is an internal coverage signal, not public copy.");
  lines.push("- Human review is required before any accepted representative image export.");
  lines.push("- Historical media does not imply current availability or listing status.");
  lines.push("");
  lines.push("## Verification");
  lines.push("");
  lines.push("- `node --check scripts/media/build_representative_image_review_manifest_v1.js`");
  lines.push("- `node scripts/media/build_representative_image_review_manifest_v1.js`");
  lines.push("");
  fs.writeFileSync(REPORT_PATH, `${lines.join("\n")}\n`);
}

function main() {
  ensureDir(path.dirname(OUTPUT_PATH));
  ensureDir(path.dirname(REPORT_PATH));

  const join = loadJson(INPUT_JOIN);
  if (!join || !Array.isArray(join.districts)) {
    throw new Error(`Missing or invalid input: ${INPUT_JOIN}`);
  }
  const originalIndex = loadJson(ORIGINAL_IMAGE_INDEX, {});

  const districts = {};
  for (const district of join.districts) {
    districts[district.district.slug] = districtReview(district);
  }

  const output = {
    version: "v1",
    generated_at: new Date().toISOString(),
    public_ready: false,
    purpose: "Internal editorial prioritization layer for representative commercial district imagery.",
    source_of_truth: INPUT_JOIN,
    input_files: {
      district_media_join_v3: INPUT_JOIN,
      original_images_by_building_id: ORIGINAL_IMAGE_INDEX,
    },
    original_image_index_status: {
      building_ids_in_index: Object.keys(originalIndex).length,
    },
    tier_policy: {
      priority_review_limit: PRIORITY_LIMIT,
      secondary_review_limit: SECONDARY_LIMIT,
      heuristics_only_prioritize: true,
      source_images_not_suppressed: true,
    },
    guardrails: [
      "Do not publish images from this manifest.",
      "Do not upload, resize, optimize, transform, delete, or suppress source media.",
      "Do not create public galleries from this manifest.",
      "Use this only to organize human editorial review.",
    ],
    districts,
  };

  fs.writeFileSync(OUTPUT_PATH, `${JSON.stringify(output, null, 2)}\n`);
  writeReport(output);
  console.log(`Wrote ${OUTPUT_PATH}`);
  console.log(`Wrote ${REPORT_PATH}`);
}

main();
