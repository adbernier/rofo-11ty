#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const readline = require("readline");

const ORIGINAL_IMAGE_INDEX = "data/media/generated/original_image_index_v1/original_images_by_building_id.json";
const DISTRICT_NODES = "data/geography/district_nodes.json";
const DISTRICT_ASSIGNMENTS = "data/peter/derived/bay_area_building_neighborhood_assignments.csv";
const REPRESENTATIVE_BUILDINGS = "data/peter/derived/bay_area_representative_buildings.csv";
const BUILDING_SIGNALS = "data/peter/derived/building_signals.csv";
const OUTPUT_PATH = "data/media/generated/district_media_join_v3.json";

const DISTRICTS = [
  {
    slug: "downtown-oakland",
    name: "Downtown Oakland",
    city: "Oakland",
    state_abbr: "CA",
    assignment_neighborhoods: ["Downtown Oakland", "Downtown", "City Center", "Old Oakland"],
    assignment_source: "bay_area_building_neighborhood_assignments.csv neighborhood consolidation",
    assignment_confidence: "high",
  },
  {
    slug: "uptown-oakland",
    name: "Uptown Oakland",
    city: "Oakland",
    state_abbr: "CA",
    assignment_neighborhoods: ["Uptown Oakland", "Northgate", "Northgate - Waverly", "Grand Avenue", "Lake Merritt", "Lakeside"],
    assignment_source: "bay_area_building_neighborhood_assignments.csv Uptown/Northgate proxy",
    assignment_confidence: "medium",
  },
  {
    slug: "jack-london-square",
    name: "Jack London Square",
    city: "Oakland",
    state_abbr: "CA",
    assignment_neighborhoods: ["Jack London Square"],
    assignment_source: "bay_area_building_neighborhood_assignments.csv explicit district label",
    assignment_confidence: "high",
  },
  {
    slug: "financial-district-sf",
    name: "Financial District SF",
    city: "San Francisco",
    state_abbr: "CA",
    assignment_neighborhoods: ["Financial District", "Downtown", "Embarcadero"],
    assignment_source: "bay_area_building_neighborhood_assignments.csv downtown SF consolidation",
    assignment_confidence: "medium",
  },
  {
    slug: "soma",
    name: "SoMa",
    city: "San Francisco",
    state_abbr: "CA",
    assignment_neighborhoods: ["SOMA", "South of Market", "South Park"],
    assignment_source: "bay_area_building_neighborhood_assignments.csv SoMa/South of Market consolidation",
    assignment_confidence: "medium",
  },
  {
    slug: "mission-bay",
    name: "Mission Bay",
    city: "San Francisco",
    state_abbr: "CA",
    assignment_neighborhoods: ["Mission Bay", "China Basin"],
    assignment_source: "bay_area_building_neighborhood_assignments.csv Mission Bay/China Basin consolidation",
    assignment_confidence: "medium",
  },
  {
    slug: "downtown-palo-alto",
    name: "Downtown Palo Alto",
    city: "Palo Alto",
    state_abbr: "CA",
    assignment_neighborhoods: ["Downtown Palo Alto", "University South"],
    assignment_source: "bay_area_building_neighborhood_assignments.csv University South downtown proxy",
    assignment_confidence: "medium",
  },
  {
    slug: "mountain-view-tech-corridor",
    name: "Mountain View Tech Corridor",
    city: "Mountain View",
    state_abbr: "CA",
    assignment_neighborhoods: ["Mountain View", "North Whisman", "Whisman Station", "Rex Manor", "Jackson Park", "Cuesta Park"],
    assignment_source: "bay_area_building_neighborhood_assignments.csv Mountain View corridor consolidation",
    assignment_confidence: "medium",
  },
  {
    slug: "south-san-francisco-biotech-corridor",
    name: "South SF Biotech Corridor",
    city: "South San Francisco",
    state_abbr: "CA",
    assignment_neighborhoods: ["South San Francisco Biotech Corridor", "Oyster Point", "Lindenville", "The East Side"],
    assignment_source: "bay_area_building_neighborhood_assignments.csv Oyster Point/Lindenville corridor consolidation",
    assignment_confidence: "medium",
  },
  {
    slug: "emeryville",
    name: "Emeryville",
    city: "Emeryville",
    state_abbr: "CA",
    assignment_neighborhoods: [],
    assignment_source: "building_signals.csv city fallback; no district assignment rows found",
    assignment_confidence: "low",
    city_fallback: true,
  },
  {
    slug: "west-oakland-industrial-corridor",
    name: "West Oakland Industrial Corridor",
    city: "Oakland",
    state_abbr: "CA",
    assignment_neighborhoods: ["West Oakland", "Prescott", "Clawson", "West Grand", "Upper Mandela", "McClymonds"],
    assignment_source: "bay_area_building_neighborhood_assignments.csv West Oakland industrial corridor consolidation",
    assignment_confidence: "medium",
  },
];

function parseCsvLine(line) {
  const values = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const next = line[i + 1];
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
      values.push(cell);
      cell = "";
    } else {
      cell += char;
    }
  }
  values.push(cell);
  return values;
}

async function eachCsvRow(filePath, onRow) {
  const stream = fs.createReadStream(filePath);
  const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });
  let headers = null;
  for await (const line of rl) {
    if (!headers) {
      headers = parseCsvLine(line);
      continue;
    }
    if (!line.trim()) continue;
    const values = parseCsvLine(line);
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || "";
    });
    await onRow(row);
  }
}

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function buildingPath(row) {
  const address = row.address || row.building_name || row.name || "";
  const city = row.city || "";
  const state = row.state || row.state_abbr || "CA";
  if (!address || !city) return null;
  return `/commercial-real-estate/building/${state}/${slugify(city)}/${slugify(address)}/`;
}

function numberValue(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function loadJson(filePath, fallback) {
  if (!fs.existsSync(filePath)) return fallback;
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function districtNodeBySlug() {
  const nodes = loadJson(DISTRICT_NODES, []);
  const bySlug = new Map();
  for (const node of nodes) {
    if (node.state_abbr === "CA" && node.slug) bySlug.set(node.slug, node);
    if (node.slug === "financial-district-sf") bySlug.set("financial-district-sf", node);
    if (node.slug === "biotech-corridor") bySlug.set("south-san-francisco-biotech-corridor", node);
    if (node.slug === "tech-corridor") bySlug.set("mountain-view-tech-corridor", node);
  }
  return bySlug;
}

function createDistrictMaps() {
  const districts = new Map();
  for (const district of DISTRICTS) {
    districts.set(district.slug, {
      config: district,
      buildings: new Map(),
      representativeSeedIds: new Set(),
    });
  }
  return districts;
}

function addBuilding(districtEntry, row, source) {
  const id = row.building_id;
  if (!id) return;
  if (!districtEntry.buildings.has(id)) {
    districtEntry.buildings.set(id, {
      building_id: id,
      building_name: row.building_name || row.name || "",
      address: row.address || "",
      city: row.city || districtEntry.config.city,
      state_abbr: row.state || row.state_abbr || districtEntry.config.state_abbr,
      assignment_neighborhood: row.neighborhood_name || "",
      assignment_distance_km: numberValue(row.assignment_distance_km),
      district_assignment_confidence: row.assignment_confidence || districtEntry.config.assignment_confidence,
      district_assignment_source: districtEntry.config.assignment_source,
      source_layers: [source],
    });
  } else {
    const existing = districtEntry.buildings.get(id);
    if (!existing.source_layers.includes(source)) existing.source_layers.push(source);
    if (!existing.building_name && (row.building_name || row.name)) existing.building_name = row.building_name || row.name;
    if (!existing.address && row.address) existing.address = row.address;
    if (!existing.assignment_neighborhood && row.neighborhood_name) existing.assignment_neighborhood = row.neighborhood_name;
  }
}

async function loadAssignments(districts) {
  const lookup = new Map();
  for (const [slug, entry] of districts.entries()) {
    for (const name of entry.config.assignment_neighborhoods) {
      lookup.set(`${entry.config.city}||${entry.config.state_abbr}||${name}`, slug);
    }
  }

  await eachCsvRow(DISTRICT_ASSIGNMENTS, (row) => {
    const slug = lookup.get(`${row.city}||${row.state}||${row.neighborhood_name}`);
    if (!slug) return;
    addBuilding(districts.get(slug), row, "bay_area_district_assignment");
  });
}

async function loadRepresentativeSeeds(districts) {
  const lookup = new Map();
  for (const [slug, entry] of districts.entries()) {
    for (const name of entry.config.assignment_neighborhoods) {
      lookup.set(`${entry.config.city}||${name}`, slug);
    }
  }

  await eachCsvRow(REPRESENTATIVE_BUILDINGS, (row) => {
    const slug = lookup.get(`${row.city}||${row.neighborhood_name}`);
    if (!slug) return;
    const entry = districts.get(slug);
    entry.representativeSeedIds.add(row.building_id);
    addBuilding(entry, row, "representative_building_export");
  });
}

async function loadCityFallbacksAndMetadata(districts) {
  const targetIds = new Set();
  const cityFallbacks = new Map();
  for (const [slug, entry] of districts.entries()) {
    for (const id of entry.buildings.keys()) targetIds.add(id);
    if (entry.config.city_fallback) cityFallbacks.set(`${entry.config.city}||${entry.config.state_abbr}`, slug);
  }

  await eachCsvRow(BUILDING_SIGNALS, (row) => {
    const fallbackSlug = cityFallbacks.get(`${row.city}||${row.state}`);
    if (fallbackSlug) {
      addBuilding(districts.get(fallbackSlug), row, "city_fallback_building_signal");
      targetIds.add(row.building_id);
    }
    if (!targetIds.has(row.building_id)) return;
    for (const entry of districts.values()) {
      const building = entry.buildings.get(row.building_id);
      if (!building) continue;
      building.building_name = building.building_name || row.name || "";
      building.address = building.address || row.address || "";
      building.city = row.city || building.city;
      building.state_abbr = row.state || building.state_abbr;
      building.canonical_building_path = buildingPath(row);
      building.listing_count = numberValue(row.listing_count);
      building.historical_activity_bucket = row.activity_bucket || "";
      building.building_record_confidence = row.has_geo === "True" && (row.address || row.name) ? "high" : "medium";
    }
  });
}

function sampleImages(images, limit = 5) {
  return images.slice(0, limit).map((image) => ({
    filename: image.filename,
    relative_path: image.relative_path,
    absolute_path: image.absolute_path,
    extension: image.extension,
    size_bytes: image.size_bytes,
    mtime: image.mtime,
    hash_part: image.hash_part || null,
  }));
}

function representativeScore(building, images, isSeed) {
  let score = 0;
  score += Math.min(images.length, 10) * 6;
  score += Math.min(numberValue(building.listing_count), 100) / 5;
  if (building.district_assignment_confidence === "high") score += 12;
  else if (building.district_assignment_confidence === "medium") score += 6;
  if (building.building_record_confidence === "high") score += 8;
  if (isSeed) score += 10;
  return Math.round(score * 10) / 10;
}

function summarizeDistrict(slug, entry, node, originalIndex) {
  const buildings = [];
  let imageCount = 0;
  let buildingsWithImages = 0;
  const extensionCounts = {};
  const imageCountDistribution = { "0": 0, "1": 0, "2_4": 0, "5_9": 0, "10_plus": 0 };

  for (const building of entry.buildings.values()) {
    const images = originalIndex[building.building_id] || [];
    if (images.length) buildingsWithImages += 1;
    imageCount += images.length;
    if (images.length === 0) imageCountDistribution["0"] += 1;
    else if (images.length === 1) imageCountDistribution["1"] += 1;
    else if (images.length <= 4) imageCountDistribution["2_4"] += 1;
    else if (images.length <= 9) imageCountDistribution["5_9"] += 1;
    else imageCountDistribution["10_plus"] += 1;
    for (const image of images) extensionCounts[image.extension || "unknown"] = (extensionCounts[image.extension || "unknown"] || 0) + 1;

    const isSeed = entry.representativeSeedIds.has(building.building_id);
    buildings.push({
      ...building,
      original_image_count: images.length,
      sample_image_paths: sampleImages(images, 5),
      representative_building_seed: isSeed,
      representative_image_score_placeholder: representativeScore(building, images, isSeed),
      representative_image_review_status: images.length ? "has_original_images_needs_editorial_review" : "needs_original_image_match",
      public_ready: false,
    });
  }

  buildings.sort((a, b) => {
    if (b.original_image_count !== a.original_image_count) return b.original_image_count - a.original_image_count;
    if (b.representative_image_score_placeholder !== a.representative_image_score_placeholder) return b.representative_image_score_placeholder - a.representative_image_score_placeholder;
    return numberValue(b.listing_count) - numberValue(a.listing_count);
  });

  const buildingCount = buildings.length;
  return {
    district: {
      id: node ? node.id : `district:ca:${slug}`,
      slug,
      name: entry.config.name,
      city: entry.config.city,
      state_abbr: entry.config.state_abbr,
      canonical_path: node ? node.canonical_path : null,
      environment_type: node ? node.environment_type : null,
      commercial_identity_summary: node ? node.commercial_identity_summary : null,
    },
    assignment_rules: {
      assignment_neighborhoods: entry.config.assignment_neighborhoods,
      assignment_source: entry.config.assignment_source,
      confidence: entry.config.assignment_confidence,
      city_fallback: Boolean(entry.config.city_fallback),
    },
    image_coverage_statistics: {
      building_count: buildingCount,
      buildings_with_original_image_coverage: buildingsWithImages,
      buildings_without_original_image_coverage: buildingCount - buildingsWithImages,
      original_image_count: imageCount,
      coverage_rate: buildingCount ? Number((buildingsWithImages / buildingCount).toFixed(4)) : 0,
      average_original_images_per_building: buildingCount ? Number((imageCount / buildingCount).toFixed(2)) : 0,
      average_original_images_per_covered_building: buildingsWithImages ? Number((imageCount / buildingsWithImages).toFixed(2)) : 0,
      extension_counts: extensionCounts,
      image_count_distribution: imageCountDistribution,
    },
    representative_image_candidates: buildings
      .filter((building) => building.original_image_count > 0 || building.representative_building_seed)
      .slice(0, 50)
      .map((building) => ({
        building_id: building.building_id,
        building_name: building.building_name,
        address: building.address,
        city: building.city,
        state_abbr: building.state_abbr,
        canonical_building_path: building.canonical_building_path || null,
        original_image_count: building.original_image_count,
        sample_image_paths: building.sample_image_paths,
        representative_building_seed: building.representative_building_seed,
        representative_image_score_placeholder: building.representative_image_score_placeholder,
        review_status: building.representative_image_review_status,
      })),
    sample_image_paths: buildings.flatMap((building) => building.sample_image_paths).slice(0, 25),
    buildings: buildings.slice(0, 500),
  };
}

async function main() {
  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });

  const originalIndex = loadJson(ORIGINAL_IMAGE_INDEX, {});
  const nodeMap = districtNodeBySlug();
  const districts = createDistrictMaps();

  await loadAssignments(districts);
  await loadRepresentativeSeeds(districts);
  await loadCityFallbacksAndMetadata(districts);

  const districtOutputs = [];
  for (const [slug, entry] of districts.entries()) {
    districtOutputs.push(summarizeDistrict(slug, entry, nodeMap.get(slug), originalIndex));
  }

  const totals = districtOutputs.reduce((acc, item) => {
    acc.district_count += 1;
    acc.building_count += item.image_coverage_statistics.building_count;
    acc.buildings_with_original_image_coverage += item.image_coverage_statistics.buildings_with_original_image_coverage;
    acc.original_image_count += item.image_coverage_statistics.original_image_count;
    return acc;
  }, {
    district_count: 0,
    building_count: 0,
    buildings_with_original_image_coverage: 0,
    original_image_count: 0,
  });
  totals.coverage_rate = totals.building_count ? Number((totals.buildings_with_original_image_coverage / totals.building_count).toFixed(4)) : 0;

  const output = {
    version: "v3",
    generated_at: new Date().toISOString(),
    public_ready: false,
    workflow: "Geography Graph V1 + Bay Area district assignments + original_images_by_building_id + representative building datasets",
    guardrails: [
      "Internal editorial infrastructure only.",
      "No public pages, UI changes, uploads, resizing, thumbnails, or image processing.",
      "Image counts are internal coverage signals and must not be exposed publicly.",
    ],
    input_files: {
      original_image_index: ORIGINAL_IMAGE_INDEX,
      district_nodes: DISTRICT_NODES,
      district_assignments: DISTRICT_ASSIGNMENTS,
      representative_buildings: REPRESENTATIVE_BUILDINGS,
      building_signals: BUILDING_SIGNALS,
    },
    original_image_index_status: {
      building_ids_in_index: Object.keys(originalIndex).length,
      note: Object.keys(originalIndex).length ? "Original image index loaded." : "Original image index is empty in this workspace. Mirror the EC2 original index and rerun to populate coverage.",
    },
    totals,
    districts: districtOutputs,
  };

  fs.writeFileSync(OUTPUT_PATH, `${JSON.stringify(output, null, 2)}\n`);
  console.log(`Wrote ${OUTPUT_PATH}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
