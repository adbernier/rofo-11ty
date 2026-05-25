#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const DISTRICT_BUILDING_UNIVERSE = "data/media/generated/district_building_universe_v1.json";
const OUTPUT_DIR = "data/media/generated/district_media_review_workspace_v1";
const REPORT_PATH = "data/media/reports/district_media_review_workspace_v1.md";
const DEFAULT_EXPORT_DISTRICTS = new Set(["downtown-oakland"]);
const PRIORITY_REVIEW_BUILDING_LIMIT = 48;

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function write(filePath, content) {
  fs.writeFileSync(filePath, content);
}

function visualEnvironmentCategory(building) {
  const text = [
    building.building_name,
    building.address,
    building.neighborhood_name,
    ...(building.source_layers || []),
    ...(building.association_notes || []),
  ].join(" ").toLowerCase();

  if (text.includes("industrial") || text.includes("warehouse") || text.includes("west oakland")) return "industrial / warehouse context";
  if (text.includes("mission bay") || text.includes("biotech") || text.includes("oyster")) return "lab / innovation context";
  if (text.includes("financial") || text.includes("montgomery") || text.includes("kearny")) return "downtown office context";
  if (text.includes("soma") || text.includes("brannan") || text.includes("south park")) return "mixed office / adaptive context";
  if (text.includes("retail") || text.includes("market")) return "retail-supported commercial context";
  return "commercial building context";
}

function candidateFromUniverseBuilding(districtSlug, building, tierReason) {
  return {
    district_slug: districtSlug,
    building_id: building.building_id,
    building_name: building.building_name,
    address: building.address,
    city: building.city,
    state_abbr: building.state,
    lat: building.lat,
    lng: building.lng,
    canonical_building_path: building.canonical_building_path,
    representative_building_seed: Boolean(building.representative_building_seed),
    original_image_count: building.original_image_count || 0,
    image_candidate_summaries: building.sample_image_paths || [],
    sample_image_filenames: (building.sample_image_paths || []).map((image) => image.filename),
    best_sample_image_path: (building.sample_image_paths || [])[0] || null,
    editorial_review_status: "unreviewed",
    visual_environment_category: visualEnvironmentCategory(building),
    publication_status: building.publication_status || "unknown",
    published: Boolean(building.published),
    source_layers: building.source_layers || [],
    association_notes: building.association_notes || [],
    assignment_distance_km: building.assignment_distance_km,
    assignment_confidence: building.assignment_confidence,
    neighborhood_name: building.neighborhood_name,
    historical_listing_count: building.historical_listing_count || 0,
    provider_bias_flags: building.provider_bias_flags || [],
    tier_reason: tierReason,
    notes: "",
  };
}

function localImagePath(districtSlug, image) {
  if (!image || !image.filename) return null;
  return `images/${districtSlug}/${image.filename}`;
}

function decorateImage(districtSlug, image) {
  if (!image) return image;
  return {
    ...image,
    original_absolute_path: image.absolute_path || null,
    local_relative_path: localImagePath(districtSlug, image),
  };
}

function decorateCandidateImages(districtSlug, candidate) {
  return {
    ...candidate,
    image_candidate_summaries: (candidate.image_candidate_summaries || []).map((image) => decorateImage(districtSlug, image)),
    best_sample_image_path: decorateImage(districtSlug, candidate.best_sample_image_path),
  };
}

function universeCandidateSort(a, b) {
  if (Number(b.representative_building_seed) !== Number(a.representative_building_seed)) return Number(b.representative_building_seed) - Number(a.representative_building_seed);
  if ((b.original_image_count || 0) !== (a.original_image_count || 0)) return (b.original_image_count || 0) - (a.original_image_count || 0);
  const aDistance = a.assignment_distance_km === null || a.assignment_distance_km === undefined ? 9999 : a.assignment_distance_km;
  const bDistance = b.assignment_distance_km === null || b.assignment_distance_km === undefined ? 9999 : b.assignment_distance_km;
  if (aDistance !== bDistance) return aDistance - bDistance;
  return (b.historical_listing_count || 0) - (a.historical_listing_count || 0);
}

function buildWorkspaceData(universe) {
  const districts = Object.values(universe.districts).map((district) => {
    const imageBuildings = (district.buildings || [])
      .filter((building) => building.has_original_images && building.original_image_count > 0)
      .sort(universeCandidateSort);
    const priorityBuildings = imageBuildings.slice(0, PRIORITY_REVIEW_BUILDING_LIMIT);
    const secondaryBuildings = imageBuildings.slice(PRIORITY_REVIEW_BUILDING_LIMIT);
    return {
      district_name: district.district_name,
      district_slug: district.district_slug,
      district_id: district.district_id,
      canonical_path: district.canonical_path,
      commercial_identity_summary: district.commercial_identity_summary,
      environment_mix: {},
      coverage_stats: {
        building_count: district.building_count || 0,
        buildings_with_original_image_coverage: district.buildings_with_original_images || 0,
        buildings_without_original_image_coverage: district.buildings_without_original_images || 0,
        original_image_count: district.total_original_images || 0,
        coverage_rate: district.image_coverage_rate || 0,
        representative_seed_count: district.representative_seed_count || 0,
      },
      source_layer_counts: district.source_layer_counts || {},
      provider_bias_summary: district.provider_bias_summary || {},
      priority_review: priorityBuildings
        .map((building) => candidateFromUniverseBuilding(district.district_slug, building, "image-covered building prioritized from district building universe"))
        .map((candidate) => decorateCandidateImages(district.district_slug, candidate)),
      secondary_review: secondaryBuildings
        .map((building) => candidateFromUniverseBuilding(district.district_slug, building, "additional image-covered building from district building universe"))
        .map((candidate) => decorateCandidateImages(district.district_slug, candidate)),
      long_tail_available: {
        buildings_without_original_images: district.buildings_without_original_images || 0,
        image_covered_buildings_beyond_review_tiers: 0,
        note: "The workspace focuses review on image-covered buildings. The universe JSON preserves the full district building set, including buildings without original images.",
      },
    };
  });

  return {
    version: "v1",
    generated_at: new Date().toISOString(),
    public_ready: false,
    source_files: {
      district_building_universe_v1: DISTRICT_BUILDING_UNIVERSE,
    },
    source_totals: universe.totals || {},
    review_states: ["accepted", "rejected", "hero_candidate", "supporting_candidate"],
    districts,
  };
}

function collectImageExportManifest(workspaceData) {
  const districts = {};
  for (const district of workspaceData.districts) {
    const images = [];
    const seen = new Set();
    const collect = (candidate, tier) => {
      for (const image of candidate.image_candidate_summaries || []) {
        if (!image.original_absolute_path || !image.filename) continue;
        const key = image.original_absolute_path;
        if (seen.has(key)) continue;
        seen.add(key);
        images.push({
          district_slug: district.district_slug,
          district_name: district.district_name,
          tier,
          building_id: candidate.building_id,
          building_name: candidate.building_name,
          source_absolute_path: image.original_absolute_path,
          local_relative_path: image.local_relative_path,
          filename: image.filename,
          size_bytes: image.size_bytes || 0,
          extension: image.extension || null,
        });
      }
    };
    for (const candidate of district.priority_review) collect(candidate, "priority_review");
    for (const candidate of district.secondary_review) collect(candidate, "secondary_review");
    districts[district.district_slug] = {
      district_name: district.district_name,
      image_count: images.length,
      default_export: DEFAULT_EXPORT_DISTRICTS.has(district.district_slug),
      target_directory: `data/media/generated/district_media_review_workspace_v1/images/${district.district_slug}/`,
      images,
    };
  }
  return {
    version: "v1",
    generated_at: new Date().toISOString(),
    purpose: "Internal image copy manifest for local District Media Review Workspace V1.",
    default_export_districts: Array.from(DEFAULT_EXPORT_DISTRICTS),
    guardrails: [
      "Copy only selected district review images.",
      "Do not copy the full original archive.",
      "Do not resize, optimize, upload, transform, or delete media.",
    ],
    districts,
  };
}

function html() {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex,nofollow">
  <title>District Media Review Workspace V1</title>
  <link rel="stylesheet" href="./styles.css">
</head>
<body>
  <div class="app-shell">
    <aside class="sidebar">
      <div class="brand">
        <div class="eyebrow">Internal editorial</div>
        <h1>District media review</h1>
      </div>
      <label class="field-label" for="districtSelect">District</label>
      <select id="districtSelect" class="select"></select>
      <div id="districtStats" class="stats"></div>
      <div class="actions">
        <button id="exportReview" class="button">Export review state</button>
        <button id="clearFilters" class="button subtle">Clear filters</button>
      </div>
      <div class="filters">
        <label><input type="checkbox" id="imagesOnly"> With images</label>
        <label><input type="checkbox" id="needsReviewOnly"> Unreviewed</label>
      </div>
    </aside>

    <main class="workspace">
      <header class="workspace-header">
        <div>
          <div id="districtKicker" class="eyebrow">Commercial district</div>
          <h2 id="districtTitle"></h2>
        </div>
        <div id="reviewCounts" class="review-counts"></div>
      </header>
      <section id="candidateGroups" class="candidate-groups"></section>
    </main>
  </div>
  <script src="./workspace-data.js"></script>
  <script src="./app.js"></script>
</body>
</html>
`;
}

function css() {
  return `:root {
  color-scheme: light;
  --bg: #f6f4ef;
  --panel: #ffffff;
  --ink: #202124;
  --muted: #6f6f68;
  --line: #ddd8cc;
  --accent: #315f52;
  --accent-soft: #dce8e3;
  --danger: #8c3b33;
  --shadow: 0 12px 30px rgba(28, 25, 20, 0.08);
}

* { box-sizing: border-box; }
body {
  margin: 0;
  background: var(--bg);
  color: var(--ink);
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  line-height: 1.45;
}

.app-shell {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 320px minmax(0, 1fr);
}

.sidebar {
  position: sticky;
  top: 0;
  height: 100vh;
  padding: 24px;
  border-right: 1px solid var(--line);
  background: rgba(255, 255, 255, 0.62);
  overflow: auto;
}

.brand h1, .workspace-header h2 {
  margin: 4px 0 0;
  font-size: 24px;
  line-height: 1.1;
  letter-spacing: 0;
}

.eyebrow {
  color: var(--muted);
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.field-label {
  display: block;
  margin-top: 28px;
  margin-bottom: 8px;
  color: var(--muted);
  font-size: 13px;
  font-weight: 650;
}

.select, .button {
  width: 100%;
  border: 1px solid var(--line);
  border-radius: 7px;
  background: var(--panel);
  color: var(--ink);
  font: inherit;
}

.select { padding: 10px 12px; }
.button {
  padding: 10px 12px;
  cursor: pointer;
  background: var(--accent);
  color: white;
  border-color: var(--accent);
  font-weight: 650;
}
.button.subtle {
  background: white;
  color: var(--ink);
  border-color: var(--line);
}

.actions {
  display: grid;
  gap: 8px;
  margin-top: 18px;
}

.filters {
  display: grid;
  gap: 8px;
  margin-top: 18px;
  color: var(--muted);
  font-size: 14px;
}

.stats {
  display: grid;
  gap: 8px;
  margin-top: 18px;
}
.stat {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 9px 0;
  border-bottom: 1px solid var(--line);
  font-size: 13px;
}
.stat strong { font-size: 14px; }

.workspace {
  min-width: 0;
  padding: 28px;
}

.workspace-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 22px;
}

.review-counts {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: flex-end;
}
.pill {
  border: 1px solid var(--line);
  border-radius: 999px;
  padding: 5px 9px;
  background: rgba(255,255,255,0.72);
  color: var(--muted);
  font-size: 12px;
}

.candidate-groups {
  display: grid;
  gap: 28px;
}
.group-title {
  margin: 0 0 12px;
  font-size: 15px;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}
.candidate-card {
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: 8px;
  box-shadow: var(--shadow);
  overflow: hidden;
}
.image-frame {
  aspect-ratio: 4 / 3;
  background: #e7e2d8;
  border-bottom: 1px solid var(--line);
  display: grid;
  place-items: center;
  color: var(--muted);
  font-size: 13px;
}
.image-frame img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.card-body {
  padding: 14px;
}
.building-title {
  margin: 0;
  font-size: 16px;
  line-height: 1.25;
}
.meta {
  margin-top: 5px;
  color: var(--muted);
  font-size: 13px;
}
.path {
  margin-top: 10px;
  color: var(--muted);
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 11px;
  overflow-wrap: anywhere;
}
.candidate-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 12px;
}
.tag {
  border-radius: 999px;
  background: var(--accent-soft);
  color: var(--accent);
  padding: 4px 7px;
  font-size: 12px;
}
.review-buttons {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 7px;
  margin-top: 12px;
}
.review-button {
  border: 1px solid var(--line);
  border-radius: 6px;
  background: white;
  color: var(--ink);
  padding: 8px;
  cursor: pointer;
  font-size: 13px;
}
.review-button.active {
  background: var(--accent);
  border-color: var(--accent);
  color: white;
}
.review-button[data-state="rejected"].active {
  background: var(--danger);
  border-color: var(--danger);
}

@media (max-width: 860px) {
  .app-shell { grid-template-columns: 1fr; }
  .sidebar {
    position: relative;
    height: auto;
    border-right: 0;
    border-bottom: 1px solid var(--line);
  }
  .workspace { padding: 18px; }
  .workspace-header { align-items: flex-start; flex-direction: column; }
  .review-counts { justify-content: flex-start; }
}
`;
}

function js() {
  return `const DATA = window.DISTRICT_MEDIA_REVIEW_WORKSPACE_V1;
const STATE_KEY = "rofo:district-media-review:v1";
const districtSelect = document.getElementById("districtSelect");
const districtStats = document.getElementById("districtStats");
const districtTitle = document.getElementById("districtTitle");
const districtKicker = document.getElementById("districtKicker");
const reviewCounts = document.getElementById("reviewCounts");
const candidateGroups = document.getElementById("candidateGroups");
const imagesOnly = document.getElementById("imagesOnly");
const needsReviewOnly = document.getElementById("needsReviewOnly");

let reviewState = loadState();

function loadState() {
  try { return JSON.parse(localStorage.getItem(STATE_KEY) || "{}"); }
  catch (_) { return {}; }
}

function saveState() {
  localStorage.setItem(STATE_KEY, JSON.stringify(reviewState));
}

function keyFor(candidate, image) {
  return [candidate.district_slug, candidate.building_id, image && image.filename ? image.filename : "no-image"].join("::");
}

function imageSrc(image) {
  if (!image) return "";
  return image.local_relative_path || (image.absolute_path ? "file://" + image.absolute_path : "");
}

function displayName(candidate) {
  return candidate.building_name || candidate.address || "Building " + candidate.building_id;
}

function allDistrictCandidates(district) {
  return [
    ...district.priority_review.map((item) => ({...item, tier: "priority_review"})),
    ...district.secondary_review.map((item) => ({...item, tier: "secondary_review"})),
  ];
}

function candidateImages(candidate) {
  return candidate.image_candidate_summaries && candidate.image_candidate_summaries.length
    ? candidate.image_candidate_summaries
    : [null];
}

function stateCounts(district) {
  const counts = {accepted: 0, rejected: 0, hero_candidate: 0, supporting_candidate: 0, unreviewed: 0};
  for (const candidate of allDistrictCandidates(district)) {
    for (const image of candidateImages(candidate)) {
      const state = reviewState[keyFor(candidate, image)] || "unreviewed";
      counts[state] = (counts[state] || 0) + 1;
    }
  }
  return counts;
}

function renderStats(district) {
  const stats = district.coverage_stats || {};
  districtStats.innerHTML = [
    ["Buildings", stats.building_count],
    ["Covered", stats.buildings_with_original_image_coverage],
    ["Images", stats.original_image_count],
    ["Coverage", ((stats.coverage_rate || 0) * 100).toFixed(1) + "%"],
  ].map(([label, value]) => '<div class="stat"><span>' + label + '</span><strong>' + value + '</strong></div>').join("");
}

function renderCounts(district) {
  const counts = stateCounts(district);
  reviewCounts.innerHTML = Object.entries(counts)
    .map(([label, value]) => '<span class="pill">' + label.replace("_", " ") + ': ' + value + '</span>')
    .join("");
}

function shouldShow(candidate, image) {
  if (imagesOnly.checked && !image) return false;
  if (needsReviewOnly.checked && reviewState[keyFor(candidate, image)]) return false;
  return true;
}

function renderCandidate(candidate) {
  const cards = [];
  for (const image of candidateImages(candidate)) {
    if (!shouldShow(candidate, image)) continue;
    const key = keyFor(candidate, image);
    const active = reviewState[key] || "";
    const img = image ? '<img loading="lazy" src="' + imageSrc(image) + '" alt="">' : '<span>No matched original image</span>';
    const file = image ? (image.local_relative_path || image.filename) : "pending image match";
    const source = image && image.original_absolute_path ? '<div class="path">source: ' + image.original_absolute_path + '</div>' : "";
    cards.push('<article class="candidate-card">' +
      '<div class="image-frame">' + img + '</div>' +
      '<div class="card-body">' +
      '<h3 class="building-title">' + displayName(candidate) + '</h3>' +
      '<div class="meta">' + candidate.address + ' · ' + candidate.visual_environment_category + '</div>' +
      '<div class="candidate-tags">' +
      '<span class="tag">' + candidate.tier.replace("_", " ") + '</span>' +
      '<span class="tag">' + candidate.original_image_count + ' originals</span>' +
      '<span class="tag">' + (candidate.published ? 'published/historical' : 'unpublished/context') + '</span>' +
      (candidate.representative_building_seed ? '<span class="tag">representative seed</span>' : '') +
      '</div>' +
      '<div class="path">' + file + '</div>' +
      source +
      '<div class="review-buttons">' +
      button("accepted", active, key) +
      button("rejected", active, key) +
      button("hero_candidate", active, key) +
      button("supporting_candidate", active, key) +
      '</div>' +
      '</div>' +
      '</article>');
  }
  return cards.join("");
}

function button(state, active, key) {
  return '<button class="review-button ' + (active === state ? 'active' : '') + '" data-state="' + state + '" data-key="' + key + '">' + state.replace("_", " ") + '</button>';
}

function renderDistrict() {
  const slug = districtSelect.value;
  const district = DATA.districts.find((item) => item.district_slug === slug);
  if (!district) return;
  districtTitle.textContent = district.district_name;
  districtKicker.textContent = district.district_slug;
  renderStats(district);
  renderCounts(district);
  const groups = [
    ["Priority review", district.priority_review.map((item) => ({...item, tier: "priority_review"}))],
    ["Secondary review", district.secondary_review.map((item) => ({...item, tier: "secondary_review"}))],
  ];
  candidateGroups.innerHTML = groups.map(([title, candidates]) => {
    const cards = candidates.map(renderCandidate).join("");
    return '<section><h2 class="group-title">' + title + '</h2><div class="card-grid">' + (cards || '<div class="meta">No candidates match the current filters.</div>') + '</div></section>';
  }).join("");
}

function init() {
  districtSelect.innerHTML = DATA.districts.map((district) => '<option value="' + district.district_slug + '">' + district.district_name + '</option>').join("");
  districtSelect.addEventListener("change", renderDistrict);
  imagesOnly.addEventListener("change", renderDistrict);
  needsReviewOnly.addEventListener("change", renderDistrict);
  candidateGroups.addEventListener("click", (event) => {
    const button = event.target.closest(".review-button");
    if (!button) return;
    const key = button.dataset.key;
    const state = button.dataset.state;
    reviewState[key] = reviewState[key] === state ? "" : state;
    if (!reviewState[key]) delete reviewState[key];
    saveState();
    renderDistrict();
  });
  document.getElementById("exportReview").addEventListener("click", () => {
    const blob = new Blob([JSON.stringify({generated_at: new Date().toISOString(), state: reviewState}, null, 2)], {type: "application/json"});
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "district-media-review-state-v1.json";
    link.click();
    URL.revokeObjectURL(link.href);
  });
  document.getElementById("clearFilters").addEventListener("click", () => {
    imagesOnly.checked = false;
    needsReviewOnly.checked = false;
    renderDistrict();
  });
  renderDistrict();
}

init();
`;
}

function report(workspaceData) {
  return `# District Media Review Workspace V1

Created an internal-only static editorial workspace for reviewing representative district imagery.

## Location

- \`${OUTPUT_DIR}/index.html\`
- \`${OUTPUT_DIR}/workspace-data.js\`
- \`${OUTPUT_DIR}/app.js\`
- \`${OUTPUT_DIR}/styles.css\`
- \`${OUTPUT_DIR}/image-export-manifest.json\`
- \`${OUTPUT_DIR}/copy-district-images.sh\`
- \`${OUTPUT_DIR}/copy-district-images-from-ec2.sh\`

## Inputs

- \`${DISTRICT_BUILDING_UNIVERSE}\`

## Scope

- Districts: ${workspaceData.districts.length}
- Source universe buildings: ${workspaceData.source_totals.building_count || 0}
- Source universe buildings with original images: ${workspaceData.source_totals.buildings_with_original_images || 0}
- Source universe original images: ${workspaceData.source_totals.total_original_images || 0}
- Review states: accepted, rejected, hero_candidate, supporting_candidate
- State persistence: browser localStorage
- Default local image bundle district: Downtown Oakland

## Guardrails

- No public route was created.
- No uploads, image transformations, resizing, galleries, or Eleventy templates were added.
- Source image references are preserved from the district building universe.
- The workspace uses review tiers only as a human workflow aid; they are not public scores or rankings.

## Local Image Bundle

The workspace prefers local relative image paths like \`images/downtown-oakland/{filename}\` when present. The original EC2 absolute path is preserved on each image record as \`original_absolute_path\`.

To copy only the default Downtown Oakland review images from EC2 into this local workspace:

\`\`\`bash
cd /path/to/rofo-11ty
EC2_HOST=ec2-user@example.compute.amazonaws.com sh data/media/generated/district_media_review_workspace_v1/copy-district-images-from-ec2.sh
\`\`\`

To copy a specific district from EC2:

\`\`\`bash
DISTRICT_SLUG=financial-district-sf EC2_HOST=ec2-user@example.compute.amazonaws.com sh data/media/generated/district_media_review_workspace_v1/copy-district-images-from-ec2.sh
\`\`\`

If the repo is also present on EC2, the local EC2 filesystem helper can copy into the same workspace folder there:

\`\`\`bash
cd /path/to/rofo-11ty
sh data/media/generated/district_media_review_workspace_v1/copy-district-images.sh
\`\`\`

To copy a specific district on EC2:

\`\`\`bash
DISTRICT_SLUG=financial-district-sf sh data/media/generated/district_media_review_workspace_v1/copy-district-images.sh
\`\`\`

This copies only images listed in \`image-export-manifest.json\` for that district. It does not resize, optimize, upload, or transform images.
`;
}

function copyFromEc2Script() {
  return `#!/bin/sh
set -eu

DISTRICT_SLUG="\${DISTRICT_SLUG:-downtown-oakland}"
MANIFEST="data/media/generated/district_media_review_workspace_v1/image-export-manifest.json"
TARGET_ROOT="data/media/generated/district_media_review_workspace_v1/images"
EC2_HOST="\${EC2_HOST:-}"
REMOTE_READ_PREFIX="\${REMOTE_READ_PREFIX:-sudo cat}"

if [ -z "$EC2_HOST" ]; then
  echo "Set EC2_HOST, for example: EC2_HOST=ec2-user@example.compute.amazonaws.com sh $0" >&2
  exit 1
fi

if [ ! -f "$MANIFEST" ]; then
  echo "Missing manifest: $MANIFEST" >&2
  exit 1
fi

command -v node >/dev/null 2>&1 || {
  echo "This local Mac helper requires node to read the workspace manifest." >&2
  exit 1
}

quote_remote_path() {
  printf "%s" "$1" | sed "s/'/'\\\\''/g; s/^/'/; s/$/'/"
}

TARGET_DIR="$TARGET_ROOT/$DISTRICT_SLUG"
mkdir -p "$TARGET_DIR"
TMP_LIST="\${TMPDIR:-/tmp}/rofo-district-images-$DISTRICT_SLUG-$$.tsv"
trap 'rm -f "$TMP_LIST"' EXIT

node - "$MANIFEST" "$DISTRICT_SLUG" > "$TMP_LIST" <<'NODE'
const fs = require("fs");
const manifestPath = process.argv[2];
const districtSlug = process.argv[3];
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const district = manifest.districts && manifest.districts[districtSlug];

if (!district) {
  console.error("District not found in manifest: " + districtSlug);
  process.exit(1);
}

for (const image of district.images || []) {
  if (!image.source_absolute_path || !image.filename) continue;
  process.stdout.write(image.source_absolute_path + "\\t" + image.filename + "\\n");
}
NODE

copied=0
missing=0

while IFS="$(printf '\\t')" read -r source filename; do
  [ -n "$source" ] || continue
  [ -n "$filename" ] || continue
  target="$TARGET_DIR/$filename"
  remote_path=$(quote_remote_path "$source")
  if ssh "$EC2_HOST" "test -f $remote_path"; then
    if ssh "$EC2_HOST" "$REMOTE_READ_PREFIX $remote_path" > "$target.tmp"; then
      mv "$target.tmp" "$target"
      copied=$((copied + 1))
    else
      rm -f "$target.tmp"
      missing=$((missing + 1))
      echo "failed: $source" >&2
    fi
  else
    missing=$((missing + 1))
    echo "missing: $source" >&2
  fi
done < "$TMP_LIST"

echo "district=$DISTRICT_SLUG copied=$copied missing=$missing target=$TARGET_DIR"
`;
}

function copyScript() {
  return `#!/bin/sh
set -eu

DISTRICT_SLUG="\${DISTRICT_SLUG:-downtown-oakland}"
MANIFEST="data/media/generated/district_media_review_workspace_v1/image-export-manifest.json"
TARGET_ROOT="data/media/generated/district_media_review_workspace_v1/images"
PYTHON_BIN="\${PYTHON_BIN:-/usr/bin/python}"

if [ ! -f "$MANIFEST" ]; then
  echo "Missing manifest: $MANIFEST" >&2
  exit 1
fi

"$PYTHON_BIN" - "$MANIFEST" "$DISTRICT_SLUG" "$TARGET_ROOT" <<'PY'
import json
import os
import shutil
import sys

manifest_path, district_slug, target_root = sys.argv[1:4]
with open(manifest_path, "r") as handle:
    manifest = json.load(handle)

district = manifest.get("districts", {}).get(district_slug)
if not district:
    sys.stderr.write("District not found in manifest: %s\\n" % district_slug)
    sys.exit(1)

target_dir = os.path.join(target_root, district_slug)
if not os.path.isdir(target_dir):
    os.makedirs(target_dir)

copied = 0
missing = 0
for image in district.get("images", []):
    source = image.get("source_absolute_path")
    filename = image.get("filename")
    if not source or not filename:
        continue
    target = os.path.join(target_dir, filename)
    if not os.path.exists(source):
        missing += 1
        sys.stderr.write("missing: %s\\n" % source)
        continue
    if not os.path.exists(target):
        shutil.copy2(source, target)
        copied += 1

print("district=%s copied=%s missing=%s target=%s" % (district_slug, copied, missing, target_dir))
PY
`;
}

function main() {
  ensureDir(OUTPUT_DIR);
  ensureDir(path.dirname(REPORT_PATH));
  const districtBuildingUniverse = readJson(DISTRICT_BUILDING_UNIVERSE);
  const workspaceData = buildWorkspaceData(districtBuildingUniverse);
  const imageExportManifest = collectImageExportManifest(workspaceData);
  write(path.join(OUTPUT_DIR, "index.html"), html());
  write(path.join(OUTPUT_DIR, "styles.css"), css());
  write(path.join(OUTPUT_DIR, "app.js"), js());
  write(path.join(OUTPUT_DIR, "workspace-data.js"), `window.DISTRICT_MEDIA_REVIEW_WORKSPACE_V1 = ${JSON.stringify(workspaceData, null, 2)};\n`);
  write(path.join(OUTPUT_DIR, "image-export-manifest.json"), `${JSON.stringify(imageExportManifest, null, 2)}\n`);
  write(path.join(OUTPUT_DIR, "copy-district-images.sh"), copyScript());
  write(path.join(OUTPUT_DIR, "copy-district-images-from-ec2.sh"), copyFromEc2Script());
  write(path.join(OUTPUT_DIR, "README.md"), report(workspaceData));
  write(REPORT_PATH, report(workspaceData));
  console.log(`Wrote ${OUTPUT_DIR}`);
  console.log(`Wrote ${REPORT_PATH}`);
}

main();
