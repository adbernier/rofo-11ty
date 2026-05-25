#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const OUTPUT_DIR = "data/media/generated/bay_area_district_media";
const REPORT_PATH = "data/media/reports/bay_area_media_join_pilot_v1.md";

const BUILDING_SIGNALS = "data/peter/derived/building_signals.csv";
const DISTRICT_ASSIGNMENTS = "data/peter/derived/bay_area_building_neighborhood_assignments.csv";
const REPRESENTATIVE_BUILDINGS = "data/peter/derived/bay_area_representative_buildings.csv";
const MEDIA_SUMMARY = "data/media/generated/media_corpus_inventory_v1_summary.json";
const BUILDINGS_SAMPLE_MANIFEST = "data/media/generated/buildings5_sample_manifest.json";

const TARGET_DISTRICTS = [
  {
    id: "district:ca:oakland:downtown-oakland",
    name: "Downtown Oakland",
    slug: "downtown-oakland",
    city: "Oakland",
    state_abbr: "CA",
    assignment_names: ["Downtown Oakland"],
    assignment_source: "bay_area_representative_buildings.csv + bay_area_building_neighborhood_assignments.csv",
  },
  {
    id: "district:ca:oakland:uptown-oakland",
    name: "Uptown Oakland",
    slug: "uptown-oakland",
    city: "Oakland",
    state_abbr: "CA",
    assignment_names: ["Uptown Oakland"],
    assignment_source: "bay_area_representative_buildings.csv + bay_area_building_neighborhood_assignments.csv",
  },
  {
    id: "district:ca:oakland:jack-london-square",
    name: "Jack London Square",
    slug: "jack-london-square",
    city: "Oakland",
    state_abbr: "CA",
    assignment_names: ["Jack London Square"],
    assignment_source: "bay_area_representative_buildings.csv + bay_area_building_neighborhood_assignments.csv",
  },
  {
    id: "district:ca:san-francisco:financial-district-sf",
    name: "Financial District SF",
    slug: "financial-district-sf",
    city: "San Francisco",
    state_abbr: "CA",
    assignment_names: ["Financial District"],
    assignment_source: "bay_area_representative_buildings.csv + Bay Area editorial district alias",
  },
  {
    id: "district:ca:palo-alto:downtown-palo-alto",
    name: "Downtown Palo Alto",
    slug: "downtown-palo-alto",
    city: "Palo Alto",
    state_abbr: "CA",
    assignment_names: ["Downtown Palo Alto"],
    assignment_source: "bay_area_representative_buildings.csv + University South proxy review",
  },
  {
    id: "district:ca:san-francisco:mission-bay",
    name: "Mission Bay",
    slug: "mission-bay",
    city: "San Francisco",
    state_abbr: "CA",
    assignment_names: ["Mission Bay"],
    assignment_source: "bay_area_representative_buildings.csv",
  },
  {
    id: "district:ca:san-francisco:soma",
    name: "SoMa",
    slug: "soma",
    city: "San Francisco",
    state_abbr: "CA",
    assignment_names: ["SOMA", "SoMa"],
    assignment_source: "bay_area_representative_buildings.csv + legacy SOMA label",
  },
  {
    id: "district:ca:south-san-francisco:biotech-corridor",
    name: "South San Francisco Biotech Corridor",
    slug: "south-san-francisco-biotech-corridor",
    city: "South San Francisco",
    state_abbr: "CA",
    assignment_names: ["South San Francisco Biotech Corridor"],
    assignment_source: "bay_area_representative_buildings.csv + Oyster Point/Lindenville corridor editorial consolidation",
  },
];

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];
    if (quoted) {
      if (char === '"' && next === '"') {
        cell += '"';
        i += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        cell += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === ",") {
      row.push(cell);
      cell = "";
    } else if (char === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else if (char !== "\r") {
      cell += char;
    }
  }
  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }
  const headers = rows.shift() || [];
  return rows
    .filter((values) => values.some((value) => value !== ""))
    .map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index] || ""])));
}

function readCsv(filePath) {
  return parseCsv(fs.readFileSync(filePath, "utf8"));
}

function readJsonIfExists(filePath, fallback) {
  if (!fs.existsSync(filePath)) return fallback;
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function parseMediaFileName(filePath) {
  const fileName = path.basename(filePath || "");
  const match = fileName.match(/^(\d+)_([A-Za-z0-9_-]+)(\.[^.]+)$/);
  if (!match) return null;
  return {
    building_id: match[1],
    media_hash: match[2],
    extension: match[3].toLowerCase(),
  };
}

function inferDerivative(filePath) {
  const parts = String(filePath || "").split(/[\\/]+/);
  for (const part of parts) {
    if (["orig", "standard", "thumb", "smthumb"].includes(part)) return part;
  }
  return "unknown";
}

function loadMediaRecords() {
  const manifest = readJsonIfExists(BUILDINGS_SAMPLE_MANIFEST, null);
  const records = [];
  if (!manifest) return { records, source: "missing_manifest", source_path: BUILDINGS_SAMPLE_MANIFEST };

  const samples = []
    .concat(Array.isArray(manifest.samples) ? manifest.samples : [])
    .concat(Array.isArray(manifest.dimension_samples) ? manifest.dimension_samples : []);

  for (const sample of samples) {
    const filePath = sample.filePath || sample.path || "";
    const parsed = parseMediaFileName(filePath);
    if (!parsed) continue;
    records.push({
      ...parsed,
      source_path: filePath,
      derivative: sample.derivative || inferDerivative(filePath),
      origin: "buildings5",
      image_type: sample.ext || parsed.extension,
      bytes: sample.bytes || null,
      width: sample.width || null,
      height: sample.height || null,
      media_source: BUILDINGS_SAMPLE_MANIFEST,
    });
  }

  return {
    records,
    source: manifest.accessible === false ? "placeholder_or_unscanned_sample_manifest" : "sample_manifest",
    source_path: BUILDINGS_SAMPLE_MANIFEST,
  };
}

function numeric(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function confidenceFor(row, mediaCount) {
  if (mediaCount > 0 && row.assignment_confidence === "high" && numeric(row.listing_count) >= 20) return "high";
  if (mediaCount > 0) return "medium";
  if (row.assignment_confidence === "high" && numeric(row.listing_count) >= 20) return "medium";
  return "low";
}

function candidateRole(row) {
  const name = `${row.building_name || ""} ${row.address || ""}`.toLowerCase();
  if (name.includes("oyster") || name.includes("gateway")) return "corridor/life-science commercial texture candidate";
  if (name.includes("broadway") || name.includes("montgomery") || name.includes("market")) return "core office district candidate";
  if (name.includes("franklin") || name.includes("water") || name.includes("embarcadero")) return "waterfront/adaptive commercial texture candidate";
  if (name.includes("hamilton") || name.includes("university") || name.includes("lytton")) return "walkable downtown commercial candidate";
  return "representative commercial environment candidate";
}

function representativeStatus(row, mediaCount) {
  if (mediaCount > 0 && row.assignment_confidence === "high") return "media_matched_review_candidate";
  if (row.assignment_confidence === "high") return "building_supported_needs_media_match";
  return "needs_assignment_review";
}

function sortCandidates(a, b) {
  if (b.media_count !== a.media_count) return b.media_count - a.media_count;
  if (numeric(b.listing_count) !== numeric(a.listing_count)) return numeric(b.listing_count) - numeric(a.listing_count);
  return numeric(a.assignment_distance_km) - numeric(b.assignment_distance_km);
}

function summarizeMedia(records) {
  const byBuilding = new Map();
  const unmatched = [];
  for (const record of records) {
    if (!record.building_id) {
      unmatched.push(record);
      continue;
    }
    if (!byBuilding.has(record.building_id)) byBuilding.set(record.building_id, []);
    byBuilding.get(record.building_id).push(record);
  }
  return { byBuilding, unmatched };
}

function manifestForDistrict(district, repRows, assignmentRows, buildingById, mediaByBuilding) {
  const names = new Set(district.assignment_names);
  const candidateRows = repRows.filter((row) => row.city === district.city && names.has(row.neighborhood_name));
  const assignmentCandidateRows = assignmentRows.filter((row) => row.city === district.city && names.has(row.neighborhood_name));
  const allBuildingIds = new Set(candidateRows.map((row) => row.building_id));
  for (const row of assignmentCandidateRows) allBuildingIds.add(row.building_id);

  const buildings = candidateRows.map((row) => {
    const building = buildingById.get(row.building_id) || {};
    const media = mediaByBuilding.get(row.building_id) || [];
    return {
      building_id: row.building_id,
      building_name: row.building_name || building.name || "",
      address: row.address || building.address || "",
      city: row.city,
      state_abbr: "CA",
      listing_count: numeric(row.listing_count),
      historical_activity_bucket: row.activity_bucket || building.activity_bucket || "",
      district_assignment_confidence: row.assignment_confidence || "",
      district_assignment_distance_km: numeric(row.assignment_distance_km),
      district_assignment_source: district.assignment_source,
      canonical_building_source: "data/peter/derived/building_signals.csv",
      media_count: media.length,
      original_media_count: media.filter((item) => item.derivative === "orig").length,
      derivative_media_count: media.filter((item) => item.derivative !== "orig").length,
      image_type_breakdown: media.reduce((acc, item) => {
        acc[item.image_type || item.extension || "unknown"] = (acc[item.image_type || item.extension || "unknown"] || 0) + 1;
        return acc;
      }, {}),
      media_assets: media.slice(0, 25),
      representative_image_candidate: true,
      representative_image_candidate_status: representativeStatus(row, media.length),
      representative_image_candidate_role: candidateRole(row),
      confidence_level: confidenceFor(row, media.length),
      review_notes: media.length
        ? "Media matched by building_id. Human image-quality review required before public use."
        : "Building is district-supported, but no recovered media asset was present in the currently available manifest sample.",
    };
  }).sort(sortCandidates);

  const mediaMatchedBuildingIds = buildings.filter((item) => item.media_count > 0).map((item) => item.building_id);

  return {
    version: "v1",
    generated_at: new Date().toISOString(),
    district: {
      id: district.id,
      name: district.name,
      slug: district.slug,
      city: district.city,
      state_abbr: district.state_abbr,
    },
    join_workflow: [
      "media filename -> building_id",
      "building_id -> canonical building record",
      "canonical building -> Bay Area district candidate",
      "district candidate -> representative image review queue",
    ],
    assignment_source: district.assignment_source,
    coverage_summary: {
      candidate_building_count: allBuildingIds.size,
      representative_candidate_count: buildings.length,
      media_matched_representative_building_count: mediaMatchedBuildingIds.length,
      observed_media_asset_count: buildings.reduce((sum, item) => sum + item.media_count, 0),
      media_manifest_status: mediaMatchedBuildingIds.length ? "matched_from_available_manifest" : "no_matches_in_available_manifest",
    },
    buildings,
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

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`);
}

function report(manifests, mediaInfo, unmatched, mediaSummary) {
  const lines = [];
  lines.push("# Bay Area Media Join Pilot V1");
  lines.push("");
  lines.push("This pilot creates the first visual relationship layer between recovered Rofo building media and canonical Bay Area commercial districts. It is infrastructure-only and does not publish imagery, optimize assets, upload to R2, or modify production media.");
  lines.push("");
  lines.push("## Join Workflow");
  lines.push("");
  lines.push("1. Parse recovered media filenames using `{building_id}_{hash}.{ext}`.");
  lines.push("2. Join `building_id` to canonical building records in `data/peter/derived/building_signals.csv`.");
  lines.push("3. Join canonical buildings to Bay Area district candidates using `data/peter/derived/bay_area_representative_buildings.csv` and assignment metadata.");
  lines.push("4. Produce district media manifests and representative-image review queues.");
  lines.push("");
  lines.push("## Media Input Status");
  lines.push("");
  lines.push(markdownTable(
    ["Input", "Status", "Records"],
    [
      [mediaInfo.source_path, mediaInfo.source, String(mediaInfo.records.length)],
      [MEDIA_SUMMARY, fs.existsSync(MEDIA_SUMMARY) ? "available" : "missing", ""],
    ],
  ));
  lines.push("");
  if (!mediaInfo.records.length) {
    lines.push("The current repo only contains the local placeholder/sample media inventory, so no actual recovered image assets were matched in this run. The join workflow is ready for the EC2 media inventory output or a full building-media manifest.");
    lines.push("");
  }
  lines.push("## District Coverage");
  lines.push("");
  lines.push(markdownTable(
    ["District", "Candidate buildings", "Representative candidates", "Media-matched buildings", "Observed assets", "Status"],
    manifests.map((manifest) => [
      manifest.district.name,
      String(manifest.coverage_summary.candidate_building_count),
      String(manifest.coverage_summary.representative_candidate_count),
      String(manifest.coverage_summary.media_matched_representative_building_count),
      String(manifest.coverage_summary.observed_media_asset_count),
      manifest.coverage_summary.media_manifest_status,
    ]),
  ));
  lines.push("");
  lines.push("## Representative Image Candidate Logic");
  lines.push("");
  lines.push("- High-confidence district assignments and historical activity provide candidate priority.");
  lines.push("- Actual media matches are required before an image can move into visual QA.");
  lines.push("- `orig` assets should be preferred as preservation sources.");
  lines.push("- Derivatives can help identify legacy display behavior, but should not be treated as preservation masters.");
  lines.push("- All public image use remains blocked until human review confirms image quality, relevance, and rights/appropriateness.");
  lines.push("");
  lines.push("## Unmatched Media");
  lines.push("");
  lines.push(`Unmatched or out-of-scope media records in this run: ${unmatched.length}.`);
  lines.push("");
  lines.push("## Strategic Assessment");
  lines.push("");
  lines.push("The Bay Area district-to-building layer is strong enough to support a media join pilot for the target districts. The limiting factor is not district assignment data; it is the absence of a full recovered-media manifest in the local repo. Once the EC2 inventory output is copied back, this workflow can identify which flagship commercial districts have enough visual coverage for representative environment review.");
  lines.push("");
  lines.push("## Next Step");
  lines.push("");
  lines.push("Run the Python media inventory on the EC2 instance with a full or district-targeted manifest export, copy the output into `data/media/generated/`, then rerun this join pilot. The next version should add image-quality sampling and Media-to-Building Join V2 review statuses.");
  lines.push("");
  lines.push("## Outputs");
  lines.push("");
  lines.push("- `data/media/generated/bay_area_district_media/_manifest.json`");
  lines.push("- `data/media/generated/bay_area_district_media/{district}.json`");
  lines.push("- `data/media/generated/bay_area_district_media/representative_image_candidates.json`");
  lines.push("- `data/media/generated/bay_area_district_media/unmatched_media_report.json`");
  lines.push("- `data/media/generated/bay_area_district_media/bay_area_media_coverage_summary.json`");
  return `${lines.join("\n")}\n`;
}

function main() {
  ensureDir(OUTPUT_DIR);
  ensureDir(path.dirname(REPORT_PATH));

  const buildingRows = readCsv(BUILDING_SIGNALS);
  const assignmentRows = readCsv(DISTRICT_ASSIGNMENTS);
  const repRows = readCsv(REPRESENTATIVE_BUILDINGS);
  const buildingById = new Map(buildingRows.map((row) => [row.building_id, row]));
  const mediaInfo = loadMediaRecords();
  const { byBuilding: mediaByBuilding, unmatched } = summarizeMedia(mediaInfo.records);

  const manifests = TARGET_DISTRICTS.map((district) => manifestForDistrict(
    district,
    repRows,
    assignmentRows,
    buildingById,
    mediaByBuilding,
  ));

  for (const manifest of manifests) {
    writeJson(path.join(OUTPUT_DIR, `${manifest.district.slug}.json`), manifest);
  }

  const representativeCandidates = manifests.flatMap((manifest) => manifest.buildings.map((building) => ({
    district_id: manifest.district.id,
    district_name: manifest.district.name,
    district_slug: manifest.district.slug,
    ...building,
  }))).sort(sortCandidates);

  const coverageSummary = {
    version: "v1",
    generated_at: new Date().toISOString(),
    media_input: {
      source: mediaInfo.source,
      source_path: mediaInfo.source_path,
      parsed_media_records: mediaInfo.records.length,
      matched_media_building_ids: mediaByBuilding.size,
    },
    target_district_count: manifests.length,
    totals: {
      candidate_buildings: manifests.reduce((sum, item) => sum + item.coverage_summary.candidate_building_count, 0),
      representative_candidates: representativeCandidates.length,
      media_matched_representative_buildings: representativeCandidates.filter((item) => item.media_count > 0).length,
      observed_media_assets: representativeCandidates.reduce((sum, item) => sum + item.media_count, 0),
    },
    districts: manifests.map((manifest) => ({
      district: manifest.district,
      coverage_summary: manifest.coverage_summary,
    })),
  };

  const manifestIndex = {
    version: "v1",
    generated_at: new Date().toISOString(),
    status: "internal_pilot_not_public",
    public_ready: false,
    notes: [
      "No media is published by this output.",
      "Representative buildings remain presentation examples, not intelligence sources.",
      "Current local run depends on available media manifests; full EC2 media inventory is required for actual image coverage.",
    ],
    files: manifests.map((manifest) => `${manifest.district.slug}.json`).concat([
      "representative_image_candidates.json",
      "unmatched_media_report.json",
      "bay_area_media_coverage_summary.json",
    ]),
  };

  writeJson(path.join(OUTPUT_DIR, "_manifest.json"), manifestIndex);
  writeJson(path.join(OUTPUT_DIR, "representative_image_candidates.json"), {
    version: "v1",
    generated_at: new Date().toISOString(),
    public_ready: false,
    candidates: representativeCandidates,
  });
  writeJson(path.join(OUTPUT_DIR, "unmatched_media_report.json"), {
    version: "v1",
    generated_at: new Date().toISOString(),
    source: mediaInfo.source,
    unmatched_count: unmatched.length,
    unmatched_media: unmatched.slice(0, 500),
  });
  writeJson(path.join(OUTPUT_DIR, "bay_area_media_coverage_summary.json"), coverageSummary);
  fs.writeFileSync(REPORT_PATH, report(manifests, mediaInfo, unmatched, coverageSummary));

  console.log(`Wrote Bay Area media join pilot outputs to ${OUTPUT_DIR}`);
  console.log(`Wrote report to ${REPORT_PATH}`);
}

main();
