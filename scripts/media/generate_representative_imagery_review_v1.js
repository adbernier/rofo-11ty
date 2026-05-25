#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const INPUT_DIR = "data/media/generated/bay_area_media_discovery_v2";
const OUTPUT_DIR = "data/media/generated/representative_imagery_review";
const REPORT_PATH = "data/media/reports/representative_imagery_review_v1.md";

const REVIEW_DISTRICTS = [
  { slug: "financial-district-sf", name: "Financial District SF" },
  { slug: "downtown-oakland", name: "Downtown Oakland" },
  { slug: "uptown-oakland", name: "Uptown Oakland" },
  { slug: "jack-london-square", name: "Jack London Square" },
  { slug: "soma", name: "SoMa" },
  { slug: "mission-bay", name: "Mission Bay" },
  { slug: "downtown-palo-alto", name: "Downtown Palo Alto" },
  { slug: "south-san-francisco-biotech-corridor", name: "South San Francisco Biotech Corridor" },
];

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function readJson(filePath, fallback = null) {
  if (!fs.existsSync(filePath)) return fallback;
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`);
}

function formatNumber(value) {
  return new Intl.NumberFormat("en-US").format(value || 0);
}

function formatBytes(value) {
  if (!value) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  let amount = Number(value);
  let index = 0;
  while (amount >= 1024 && index < units.length - 1) {
    amount /= 1024;
    index += 1;
  }
  return `${amount >= 10 || index === 0 ? Math.round(amount) : amount.toFixed(1)} ${units[index]}`;
}

function increment(map, key, amount = 1) {
  map[key] = (map[key] || 0) + amount;
}

function imageType(asset) {
  return asset.image_type || asset.extension || "unknown";
}

function imageDimensions(asset) {
  if (asset.width && asset.height) return { width: asset.width, height: asset.height };
  return { width: null, height: null };
}

function likelyVisualCategory(building, asset) {
  const text = [
    building.building_name,
    building.address,
    building.assignment_neighborhood,
    building.district_name,
    asset.source_path,
  ].join(" ").toLowerCase();

  if (building.media_count > 20 && asset.derivative !== "orig") return "likely_low_value_or_redundant_image";
  if (text.includes("broadway") || text.includes("montgomery") || text.includes("market") || text.includes("sansome")) {
    return "likely_tower_or_building_candidate";
  }
  if (text.includes("water") || text.includes("embarcadero") || text.includes("franklin") || text.includes("oyster") || text.includes("terry")) {
    return "likely_streetscape_or_context_candidate";
  }
  if (text.includes("hamilton") || text.includes("university") || text.includes("lytt")) {
    return "likely_streetscape_or_context_candidate";
  }
  if (asset.derivative === "orig" && building.original_media_count > 0 && building.media_count <= 8) {
    return "likely_hero_candidate";
  }
  if (asset.derivative === "orig") return "likely_tower_or_building_candidate";
  return "likely_low_value_or_redundant_image";
}

function buildingContext(building) {
  const text = [building.building_name, building.address, building.assignment_neighborhood, building.district_name].join(" ").toLowerCase();
  if (text.includes("oyster") || text.includes("gateway") || text.includes("littlefield") || text.includes("linden")) {
    return "biotech/R&D corridor candidate";
  }
  if (text.includes("water") || text.includes("embarcadero") || text.includes("franklin")) {
    return "waterfront commercial context";
  }
  if (text.includes("broadway") || text.includes("montgomery") || text.includes("market") || text.includes("sansome")) {
    return "downtown office building context";
  }
  if (text.includes("hamilton") || text.includes("university") || text.includes("lytton")) {
    return "walkable downtown commercial context";
  }
  return building.historical_activity_bucket ? `${building.historical_activity_bucket} historical activity building` : "commercial building context";
}

function imageScore(building, asset) {
  let score = 0;
  if (asset.derivative === "orig") score += 35;
  else if (asset.derivative === "standard") score += 15;
  else score += 5;

  score += Math.min(building.original_media_count || 0, 8) * 3;
  score += Math.min(building.listing_count || 0, 100) / 5;
  if (building.district_assignment_confidence === "high") score += 12;
  else if (building.district_assignment_confidence === "medium") score += 6;
  if (building.building_record_confidence === "high") score += 8;
  if (building.representative_export_seed) score += 8;
  if ((building.media_count || 0) > 30) score -= 8;

  const category = likelyVisualCategory(building, asset);
  if (category === "likely_hero_candidate") score += 10;
  if (category === "likely_low_value_or_redundant_image") score -= 15;

  return Math.round(score * 10) / 10;
}

function reviewStatus(building, asset) {
  if (!asset || !asset.source_path) return "needs_media_match";
  if (asset.derivative !== "orig") return "defer_derivative_review";
  if ((building.media_count || 0) > 30) return "needs_duplicate_review";
  return "ready_for_editorial_visual_review";
}

function candidateFromAsset(district, building, asset) {
  const dimensions = imageDimensions(asset);
  return {
    district_slug: district.slug,
    district_name: district.name,
    building_id: building.building_id,
    building_name: building.building_name || "",
    city: building.city,
    state_abbr: building.state_abbr || "CA",
    canonical_building_path: building.canonical_building_path || null,
    building_type_context: buildingContext(building),
    image_path: asset.source_path,
    image_origin: asset.origin || "buildings5",
    image_type: imageType(asset),
    image_derivative: asset.derivative || "unknown",
    image_dimensions: dimensions,
    image_size_bytes: asset.bytes || null,
    image_size_display: asset.bytes ? formatBytes(asset.bytes) : null,
    image_count_per_building: building.media_count || 0,
    original_image_count_per_building: building.original_media_count || 0,
    representative_score_placeholder: imageScore(building, asset),
    editorial_review_status: reviewStatus(building, asset),
    visual_category_placeholder: likelyVisualCategory(building, asset),
    district_assignment_confidence: building.district_assignment_confidence || "unknown",
    building_record_confidence: building.building_record_confidence || "unknown",
    review_notes: "Internal curation queue only. Human review required before any public use.",
    public_ready: false,
  };
}

function fallbackCandidate(district, building) {
  return {
    district_slug: district.slug,
    district_name: district.name,
    building_id: building.building_id,
    building_name: building.building_name || "",
    city: building.city,
    state_abbr: building.state_abbr || "CA",
    canonical_building_path: building.canonical_building_path || null,
    building_type_context: buildingContext(building),
    image_path: null,
    image_origin: null,
    image_type: null,
    image_derivative: null,
    image_dimensions: { width: null, height: null },
    image_size_bytes: null,
    image_size_display: null,
    image_count_per_building: building.media_count || 0,
    original_image_count_per_building: building.original_media_count || 0,
    representative_score_placeholder: building.representative_image_score_placeholder || 0,
    editorial_review_status: "needs_media_match",
    visual_category_placeholder: "pending_media_match",
    district_assignment_confidence: building.district_assignment_confidence || "unknown",
    building_record_confidence: building.building_record_confidence || "unknown",
    review_notes: "District/building candidate exists, but no matched image is present in the available V2 manifest.",
    public_ready: false,
  };
}

function districtReview(district) {
  const inputPath = path.join(INPUT_DIR, `${district.slug}.json`);
  const input = readJson(inputPath, null);
  if (!input) {
    return {
      version: "v1",
      generated_at: new Date().toISOString(),
      district,
      public_ready: false,
      input_status: "missing_v2_manifest",
      coverage_summary: {
        building_count: 0,
        media_matched_building_count: 0,
        image_candidate_count: 0,
        original_candidate_count: 0,
        derivative_candidate_count: 0,
      },
      image_diversity_indicators: {},
      duplicate_heavy_building_warnings: [],
      review_queue: [],
      top_candidate_summary: [],
    };
  }

  const buildings = input.buildings || [];
  const queue = [];
  for (const building of buildings) {
    const assets = building.media_assets || [];
    if (assets.length) {
      for (const asset of assets) {
        queue.push(candidateFromAsset(district, building, asset));
      }
    } else if (building.representative_export_seed || (building.representative_image_score_placeholder || 0) >= 20) {
      queue.push(fallbackCandidate(district, building));
    }
  }

  queue.sort((a, b) => {
    if (b.representative_score_placeholder !== a.representative_score_placeholder) {
      return b.representative_score_placeholder - a.representative_score_placeholder;
    }
    return (b.original_image_count_per_building || 0) - (a.original_image_count_per_building || 0);
  });

  const matchedQueue = queue.filter((item) => item.image_path);
  const derivativeCounts = {};
  const categoryCounts = {};
  const buildingCounts = {};
  const extensionCounts = {};
  for (const item of matchedQueue) {
    increment(derivativeCounts, item.image_derivative || "unknown");
    increment(categoryCounts, item.visual_category_placeholder || "unknown");
    increment(buildingCounts, item.building_id);
    increment(extensionCounts, item.image_type || "unknown");
  }

  const duplicateWarnings = Object.entries(buildingCounts)
    .filter(([, count]) => count >= 12)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 25)
    .map(([buildingId, count]) => {
      const item = matchedQueue.find((candidate) => candidate.building_id === buildingId);
      return {
        building_id: buildingId,
        building_name: item ? item.building_name : "",
        image_count: count,
        warning: "Many matched assets for one building. Review for duplicate derivatives, repeated angles, or low-value listing images.",
      };
    });

  return {
    version: "v1",
    generated_at: new Date().toISOString(),
    district: {
      slug: district.slug,
      name: district.name,
      city: input.district ? input.district.city : undefined,
      state_abbr: input.district ? input.district.state_abbr : "CA",
    },
    public_ready: false,
    input_status: "loaded_v2_manifest",
    source_manifest: inputPath,
    coverage_summary: {
      building_count: buildings.length,
      media_matched_building_count: buildings.filter((building) => (building.media_count || 0) > 0).length,
      image_candidate_count: matchedQueue.length,
      review_queue_count: queue.length,
      original_candidate_count: matchedQueue.filter((item) => item.image_derivative === "orig").length,
      derivative_candidate_count: matchedQueue.filter((item) => item.image_derivative !== "orig").length,
    },
    image_diversity_indicators: {
      derivative_counts: derivativeCounts,
      visual_category_counts: categoryCounts,
      image_type_counts: extensionCounts,
      distinct_building_count: new Set(matchedQueue.map((item) => item.building_id)).size,
      duplicate_heavy_building_count: duplicateWarnings.length,
    },
    duplicate_heavy_building_warnings: duplicateWarnings,
    top_candidate_summary: queue.slice(0, 12).map((item) => ({
      building_id: item.building_id,
      building_name: item.building_name,
      image_path: item.image_path,
      visual_category_placeholder: item.visual_category_placeholder,
      editorial_review_status: item.editorial_review_status,
      representative_score_placeholder: item.representative_score_placeholder,
    })),
    review_queue: queue.slice(0, 250),
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

function generateReport(reviews, v2Coverage) {
  const lines = [];
  lines.push("# Representative Imagery Review Workflow V1");
  lines.push("");
  lines.push("This workflow creates an internal editorial review layer for representative Bay Area commercial district imagery. It does not publish images, create galleries, upload to R2, optimize files, modify production assets, or auto-select final imagery.");
  lines.push("");
  lines.push("## Source");
  lines.push("");
  lines.push(`- Input directory: \`${INPUT_DIR}\``);
  lines.push("- Source workflow: Bay Area Media Discovery V2");
  if (v2Coverage && v2Coverage.scan_summary) {
    lines.push(`- V2 scanned files in available manifest: ${formatNumber(v2Coverage.scan_summary.scanned_files)}`);
    lines.push(`- V2 matched target media files in available manifest: ${formatNumber(v2Coverage.scan_summary.matched_media_files)}`);
  }
  lines.push("");
  lines.push("## Review Workflow");
  lines.push("");
  lines.push("district -> matched media candidates -> representative-image candidate scoring -> editorial review queue");
  lines.push("");
  lines.push("## District Review Coverage");
  lines.push("");
  lines.push(markdownTable(
    ["District", "Buildings", "Media-matched buildings", "Image candidates", "Original candidates", "Review queue"],
    reviews.map((review) => [
      review.district.name,
      formatNumber(review.coverage_summary.building_count),
      formatNumber(review.coverage_summary.media_matched_building_count),
      formatNumber(review.coverage_summary.image_candidate_count),
      formatNumber(review.coverage_summary.original_candidate_count),
      formatNumber(review.coverage_summary.review_queue_count),
    ]),
  ));
  lines.push("");
  lines.push("## Heuristics");
  lines.push("");
  lines.push("- Prefer `orig` assets for review because they are closest to the preservation source.");
  lines.push("- Treat standard/thumb/smthumb derivatives as lower-priority unless they are the only available evidence.");
  lines.push("- Flag buildings with many matched assets for duplicate/redundant image review.");
  lines.push("- Use building name, address, district, derivative type, image count, assignment confidence, and historical activity only as review prioritization signals.");
  lines.push("- `representative_score_placeholder` is internal sorting scaffolding, not a quality claim.");
  lines.push("");
  lines.push("## Guardrails");
  lines.push("");
  lines.push("- Representative imagery is a presentation layer, not the source of district intelligence.");
  lines.push("- Do not use media counts as public coverage or inventory metrics.");
  lines.push("- Do not infer current availability, rent, vacancy, ownership, or listing status from historical images.");
  lines.push("- Human editorial review is required before any image moves toward public use.");
  lines.push("");
  const totalImages = reviews.reduce((sum, review) => sum + review.coverage_summary.image_candidate_count, 0);
  if (!totalImages) {
    lines.push("## Current Run Note");
    lines.push("");
    lines.push("The available local V2 manifests contain no matched image assets. This workflow still generated district review scaffolds and fallback building queues. Copy the EC2-populated V2 manifests into `data/media/generated/bay_area_media_discovery_v2/` and rerun this script to populate real image review queues.");
    lines.push("");
  }
  lines.push("## Outputs");
  lines.push("");
  lines.push("- `data/media/generated/representative_imagery_review/_manifest.json`");
  lines.push("- `data/media/generated/representative_imagery_review/{district}.json`");
  lines.push("- `data/media/generated/representative_imagery_review/all_review_candidates.json`");
  lines.push("- `data/media/generated/representative_imagery_review/district_visual_coverage_summary.json`");
  lines.push("");
  return `${lines.join("\n")}\n`;
}

function main() {
  ensureDir(OUTPUT_DIR);
  ensureDir(path.dirname(REPORT_PATH));

  const v2Coverage = readJson(path.join(INPUT_DIR, "bay_area_district_media_coverage.json"), null);
  const reviews = REVIEW_DISTRICTS.map(districtReview);

  for (const review of reviews) {
    writeJson(path.join(OUTPUT_DIR, `${review.district.slug}.json`), review);
  }

  const allCandidates = reviews
    .flatMap((review) => review.review_queue.map((candidate) => ({
      ...candidate,
      source_review_file: `${review.district.slug}.json`,
    })))
    .sort((a, b) => b.representative_score_placeholder - a.representative_score_placeholder);

  const coverageSummary = {
    version: "v1",
    generated_at: new Date().toISOString(),
    public_ready: false,
    source_input_dir: INPUT_DIR,
    districts: reviews.map((review) => ({
      district: review.district,
      coverage_summary: review.coverage_summary,
      image_diversity_indicators: review.image_diversity_indicators,
      duplicate_heavy_building_warning_count: review.duplicate_heavy_building_warnings.length,
    })),
    totals: {
      districts: reviews.length,
      buildings: reviews.reduce((sum, review) => sum + review.coverage_summary.building_count, 0),
      media_matched_buildings: reviews.reduce((sum, review) => sum + review.coverage_summary.media_matched_building_count, 0),
      image_candidates: reviews.reduce((sum, review) => sum + review.coverage_summary.image_candidate_count, 0),
      review_queue_items: reviews.reduce((sum, review) => sum + review.coverage_summary.review_queue_count, 0),
    },
  };

  writeJson(path.join(OUTPUT_DIR, "_manifest.json"), {
    version: "v1",
    generated_at: new Date().toISOString(),
    public_ready: false,
    source_input_dir: INPUT_DIR,
    files: REVIEW_DISTRICTS.map((district) => `${district.slug}.json`).concat([
      "all_review_candidates.json",
      "district_visual_coverage_summary.json",
    ]),
    guardrails: [
      "Internal editorial review only.",
      "No image publishing, optimization, uploads, galleries, or production media changes.",
      "Human review required before public use.",
    ],
  });
  writeJson(path.join(OUTPUT_DIR, "all_review_candidates.json"), {
    version: "v1",
    generated_at: new Date().toISOString(),
    public_ready: false,
    candidates: allCandidates.slice(0, 2000),
  });
  writeJson(path.join(OUTPUT_DIR, "district_visual_coverage_summary.json"), coverageSummary);
  fs.writeFileSync(REPORT_PATH, generateReport(reviews, v2Coverage));

  console.log(`Wrote representative imagery review outputs to ${OUTPUT_DIR}`);
  console.log(`Wrote report to ${REPORT_PATH}`);
}

main();
