#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const readline = require("readline");

const ORIGINAL_IMAGE_INDEX = "data/media/generated/original_image_index_v1/original_images_by_building_id.json";
const DISTRICT_NODES = "data/geography/district_nodes.json";
const DISTRICT_ASSIGNMENTS = "data/peter/derived/bay_area_building_neighborhood_assignments.csv";
const REPRESENTATIVE_BUILDINGS = "data/peter/derived/bay_area_representative_buildings.csv";
const BUILDING_SIGNALS = "data/peter/derived/building_signals.csv";
const RAW_CORPUS = "data/peter/research/bay_area_tier_a_raw_corpus_v1.json";
const OUTPUT_PATH = "data/media/generated/district_building_universe_v1.json";
const REPORT_PATH = "data/media/reports/district_building_universe_v1.md";

const DISTRICTS = [
  {
    slug: "downtown-oakland",
    name: "Downtown Oakland",
    city: "Oakland",
    state: "CA",
    aliases: ["Downtown Oakland", "Downtown", "City Center", "Old Oakland"],
    proximity_radius_km: 1.65,
  },
  {
    slug: "uptown-oakland",
    name: "Uptown Oakland",
    city: "Oakland",
    state: "CA",
    aliases: ["Uptown Oakland", "Northgate", "Northgate - Waverly", "Grand Avenue", "Lake Merritt", "Lakeside"],
    proximity_radius_km: 1.35,
  },
  {
    slug: "jack-london-square",
    name: "Jack London Square",
    city: "Oakland",
    state: "CA",
    aliases: ["Jack London Square"],
    proximity_radius_km: 1.25,
  },
  {
    slug: "financial-district-sf",
    name: "Financial District SF",
    city: "San Francisco",
    state: "CA",
    centroid: { lat: 37.7946, lng: -122.3999 },
    aliases: ["Financial District", "Downtown", "Embarcadero"],
    proximity_radius_km: 1.15,
  },
  {
    slug: "soma",
    name: "SoMa",
    city: "San Francisco",
    state: "CA",
    centroid: { lat: 37.7793, lng: -122.4016 },
    aliases: ["SOMA", "SoMa", "South of Market", "South Park"],
    proximity_radius_km: 1.75,
  },
  {
    slug: "mission-bay",
    name: "Mission Bay",
    city: "San Francisco",
    state: "CA",
    centroid: { lat: 37.7706, lng: -122.3911 },
    aliases: ["Mission Bay", "China Basin"],
    proximity_radius_km: 1.2,
  },
  {
    slug: "downtown-palo-alto",
    name: "Downtown Palo Alto",
    city: "Palo Alto",
    state: "CA",
    aliases: ["Downtown Palo Alto", "University South"],
    proximity_radius_km: 1.3,
  },
  {
    slug: "mountain-view-tech-corridor",
    name: "Mountain View Tech Corridor",
    city: "Mountain View",
    state: "CA",
    raw_slugs: ["mountain-view-castro-whisman"],
    aliases: ["Mountain View", "North Whisman", "Whisman Station", "Rex Manor", "Jackson Park", "Cuesta Park"],
    proximity_radius_km: 2.45,
  },
  {
    slug: "south-san-francisco-biotech-corridor",
    name: "South San Francisco Biotech Corridor",
    city: "South San Francisco",
    state: "CA",
    aliases: ["South San Francisco Biotech Corridor", "Oyster Point", "Lindenville", "The East Side", "East Side", "Gateway", "DNA Way"],
    proximity_radius_km: 3.45,
  },
  {
    slug: "emeryville",
    name: "Emeryville / Powell Corridor",
    city: "Emeryville",
    state: "CA",
    raw_slugs: ["emeryville-powell-corridor"],
    aliases: ["Powell Street", "Powell Corridor", "Bay Street", "Shellmound"],
    proximity_radius_km: 1.75,
    city_fallback: true,
  },
  {
    slug: "west-oakland-industrial-corridor",
    name: "West Oakland Industrial Corridor",
    city: "Oakland",
    state: "CA",
    centroid: { lat: 37.8145, lng: -122.2952 },
    aliases: ["West Oakland", "Prescott", "Clawson", "West Grand", "Upper Mandela", "McClymonds"],
    proximity_radius_km: 2.0,
  },
];

function readJson(filePath, fallback) {
  if (!fs.existsSync(filePath)) return fallback;
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function parseCsvLine(line) {
  const values = [];
  let cell = "";
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];
    if (quoted) {
      if (char === '"' && next === '"') {
        cell += '"';
        index += 1;
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

function numberValue(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function nullableNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function haversineKm(aLat, aLng, bLat, bLng) {
  const toRad = (value) => (value * Math.PI) / 180;
  const radius = 6371;
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const x =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return 2 * radius * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

function buildingPath(row) {
  const address = row.address || row.building_name || row.name || "";
  const city = row.city || "";
  const state = row.state || row.state_abbr || "CA";
  if (!address || !city) return null;
  return `/commercial-real-estate/building/${state}/${slugify(city)}/${slugify(address)}/`;
}

function loadDistrictNodes() {
  const nodes = readJson(DISTRICT_NODES, []);
  const bySlug = new Map();
  for (const node of nodes) {
    if (!node.slug) continue;
    bySlug.set(node.slug, node);
    if (node.slug === "biotech-corridor") bySlug.set("south-san-francisco-biotech-corridor", node);
    if (node.slug === "tech-corridor") bySlug.set("mountain-view-tech-corridor", node);
  }
  return bySlug;
}

function loadRawCorpus() {
  const raw = readJson(RAW_CORPUS, {});
  const targetAreas = raw.target_areas || [];
  const areaBySlug = new Map(targetAreas.map((area) => [area.slug, area]));
  const buildingById = new Map();
  for (const building of raw.buildings || []) {
    if (!building.building_id) continue;
    buildingById.set(String(building.building_id), building);
  }
  return { raw, areaBySlug, buildingById };
}

function createDistricts(nodeBySlug, rawCorpus) {
  const districts = new Map();
  for (const config of DISTRICTS) {
    const node = nodeBySlug.get(config.slug);
    const rawSlugs = [config.slug].concat(config.raw_slugs || []);
    const rawArea = rawSlugs.map((slug) => rawCorpus.areaBySlug.get(slug)).find(Boolean);
    districts.set(config.slug, {
      config,
      node,
      rawArea,
      buildings: new Map(),
      representativeSeedIds: new Set(),
    });
  }
  return districts;
}

function districtLabel(entry) {
  return entry.node ? entry.node.name : entry.rawArea ? entry.rawArea.name : entry.config.name || entry.config.slug;
}

function rowLat(row) {
  return nullableNumber(row.lat || row.latitude || row.building_lat);
}

function rowLng(row) {
  return nullableNumber(row.lng || row.longitude || row.building_lng);
}

function baseBuildingFromRow(row, entry) {
  const lat = rowLat(row);
  const lng = rowLng(row);
  return {
    building_id: String(row.building_id || ""),
    building_name: row.building_name || row.name || "",
    address: row.address || "",
    city: row.city || (entry.node && entry.node.parent_city) || (entry.rawArea && entry.rawArea.city) || entry.config.city || "",
    state: row.state || row.state_abbr || (entry.rawArea && entry.rawArea.state) || entry.config.state || "CA",
    lat,
    lng,
    building_size: numberValue(row.building_size),
    floors: numberValue(row.floors),
    units: numberValue(row.units),
    listing_count: numberValue(row.listing_count || row.source_listing_count),
    source_provider: row.source || row.primary_source || "",
    broker_house_id: row.broker_house_id || "",
    publication_status: row.is_active_signal === "True" ? "active_historical_signal" : "not_currently_published_or_unknown",
    published: row.is_active_signal === "True",
    canonical_building_path: buildingPath(row),
    neighborhood_name: row.neighborhood_name || row.area_name || "",
    assignment_distance_km: nullableNumber(row.assignment_distance_km || row.distance_km),
    assignment_confidence: row.assignment_confidence || "",
    assignment_method: row.assignment_method || "",
    source_layers: [],
    association_notes: [],
  };
}

function mergeBuilding(existing, incoming) {
  for (const key of ["building_name", "address", "city", "state", "source_provider", "broker_house_id", "canonical_building_path", "neighborhood_name", "assignment_confidence", "assignment_method"]) {
    if (!existing[key] && incoming[key]) existing[key] = incoming[key];
  }
  for (const key of ["lat", "lng", "assignment_distance_km"]) {
    if (existing[key] === null && incoming[key] !== null) existing[key] = incoming[key];
  }
  for (const key of ["building_size", "floors", "units", "listing_count"]) {
    if (!existing[key] && incoming[key]) existing[key] = incoming[key];
  }
  if (incoming.published) {
    existing.published = true;
    existing.publication_status = incoming.publication_status;
  }
}

function addBuilding(entry, row, layer, note) {
  const id = String(row.building_id || "");
  if (!id) return null;
  const incoming = baseBuildingFromRow(row, entry);
  let building = entry.buildings.get(id);
  if (!building) {
    building = incoming;
    entry.buildings.set(id, building);
  } else {
    mergeBuilding(building, incoming);
  }
  if (!building.source_layers.includes(layer)) building.source_layers.push(layer);
  if (note && !building.association_notes.includes(note)) building.association_notes.push(note);
  return building;
}

async function loadNeighborhoodAssignments(districts) {
  const lookup = new Map();
  for (const [slug, entry] of districts.entries()) {
    const city = (entry.node && entry.node.parent_city) || (entry.rawArea && entry.rawArea.city) || entry.config.city || "";
    for (const alias of entry.config.aliases || []) {
      lookup.set(`${city}||CA||${alias}`, slug);
    }
  }

  await eachCsvRow(DISTRICT_ASSIGNMENTS, (row) => {
    const slug = lookup.get(`${row.city}||${row.state}||${row.neighborhood_name}`);
    if (!slug) return;
    addBuilding(districts.get(slug), row, "bay_area_neighborhood_assignment", `assigned through ${row.neighborhood_name}`);
  });
}

async function loadRepresentativeSeeds(districts) {
  const lookup = new Map();
  for (const [slug, entry] of districts.entries()) {
    const city = (entry.node && entry.node.parent_city) || (entry.rawArea && entry.rawArea.city) || entry.config.city || "";
    for (const alias of entry.config.aliases || []) {
      lookup.set(`${city}||${alias}`, slug);
    }
  }

  await eachCsvRow(REPRESENTATIVE_BUILDINGS, (row) => {
    const slug = lookup.get(`${row.city}||${row.neighborhood_name}`);
    if (!slug) return;
    const entry = districts.get(slug);
    entry.representativeSeedIds.add(String(row.building_id));
    addBuilding(entry, row, "representative_building_seed", "included in representative building export");
  });
}

function loadRawCorpusAssignments(districts, rawCorpus) {
  for (const [slug, entry] of districts.entries()) {
    const rawSlugs = [slug].concat(entry.config.raw_slugs || []);
    const rawAreaIds = new Set(rawSlugs.map((rawSlug) => {
      const area = rawCorpus.areaBySlug.get(rawSlug);
      return area && area.id;
    }).filter(Boolean));
    for (const building of rawCorpus.buildingById.values()) {
      if (!rawAreaIds.has(building.area_id)) continue;
      addBuilding(entry, building, "bay_area_raw_corpus_area_assignment", `raw corpus area ${building.area_name}`);
    }
  }
}

async function loadBuildingSignals(districts) {
  const targetIds = new Set();
  const cityFallbacks = [];
  const proximityDistricts = [];

  for (const [slug, entry] of districts.entries()) {
    for (const id of entry.buildings.keys()) targetIds.add(id);
    const city = (entry.node && entry.node.parent_city) || (entry.rawArea && entry.rawArea.city) || entry.config.city || "";
    if (entry.config.city_fallback) cityFallbacks.push({ slug, city, state: "CA" });
    const centroid = (entry.rawArea && entry.rawArea.centroid) || entry.config.centroid;
    if (centroid && centroid.lat && centroid.lng) {
      proximityDistricts.push({
        slug,
        city,
      state: entry.config.state || "CA",
        lat: centroid.lat,
        lng: centroid.lng,
      radius: entry.config.proximity_radius_km || (entry.rawArea && entry.rawArea.radius_km),
      });
    }
  }

  await eachCsvRow(BUILDING_SIGNALS, (row) => {
    const rowId = String(row.building_id || "");
    if (!rowId) return;

    for (const fallback of cityFallbacks) {
      if (row.city === fallback.city && row.state === fallback.state) {
        addBuilding(districts.get(fallback.slug), row, "city_building_signal_fallback", "city-wide fallback for district without reliable neighborhood assignment rows");
        targetIds.add(rowId);
      }
    }

    const lat = rowLat(row);
    const lng = rowLng(row);
    if (lat !== null && lng !== null) {
      for (const district of proximityDistricts) {
        if (row.city !== district.city || row.state !== district.state) continue;
        const distance = haversineKm(lat, lng, district.lat, district.lng);
        if (distance <= district.radius) {
          const building = addBuilding(districts.get(district.slug), row, "lat_lng_proximity", `within ${district.radius} km of district center`);
          if (building && (building.assignment_distance_km === null || distance < building.assignment_distance_km)) {
            building.assignment_distance_km = Number(distance.toFixed(3));
          }
          targetIds.add(rowId);
        }
      }
    }

    if (!targetIds.has(rowId)) return;
    for (const entry of districts.values()) {
      if (!entry.buildings.has(rowId)) continue;
      addBuilding(entry, row, "building_signals_metadata", "metadata enrichment from building_signals.csv");
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

function providerFlags(building) {
  const text = [building.building_name, building.address, building.source_provider, building.association_notes.join(" ")].join(" ").toLowerCase();
  const flags = [];
  if (text.includes("regus")) flags.push("regus_or_coworking_possible");
  if (text.includes("cowork") || text.includes("wework") || text.includes("spaces")) flags.push("coworking_possible");
  return flags;
}

function summarizeDistrict(slug, entry, originalIndex) {
  const buildings = [];
  let buildingsWithImages = 0;
  let totalImages = 0;
  const sourceLayerCounts = {};
  const cityCounts = {};
  const coverageByLayer = {};

  for (const building of entry.buildings.values()) {
    const images = originalIndex[building.building_id] || [];
    const imageCount = images.length;
    if (imageCount) buildingsWithImages += 1;
    totalImages += imageCount;
    for (const layer of building.source_layers) {
      sourceLayerCounts[layer] = (sourceLayerCounts[layer] || 0) + 1;
      if (!coverageByLayer[layer]) coverageByLayer[layer] = { buildings: 0, buildings_with_images: 0 };
      coverageByLayer[layer].buildings += 1;
      if (imageCount) coverageByLayer[layer].buildings_with_images += 1;
    }
    cityCounts[building.city || "unknown"] = (cityCounts[building.city || "unknown"] || 0) + 1;

    buildings.push({
      building_id: building.building_id,
      building_name: building.building_name,
      address: building.address,
      city: building.city,
      state: building.state,
      lat: building.lat,
      lng: building.lng,
      source_provider: building.source_provider || null,
      broker_house_id: building.broker_house_id || null,
      publication_status: building.publication_status,
      published: building.published,
      canonical_building_path: building.canonical_building_path || null,
      neighborhood_name: building.neighborhood_name || null,
      assignment_distance_km: building.assignment_distance_km,
      assignment_confidence: building.assignment_confidence || null,
      assignment_method: building.assignment_method || null,
      source_layers: building.source_layers,
      association_notes: building.association_notes,
      building_size: building.building_size,
      floors: building.floors,
      units: building.units,
      historical_listing_count: building.listing_count,
      representative_building_seed: entry.representativeSeedIds.has(building.building_id),
      provider_bias_flags: providerFlags(building),
      original_image_count: imageCount,
      has_original_images: imageCount > 0,
      sample_image_paths: sampleImages(images, 5),
    });
  }

  buildings.sort((a, b) => {
    if (Number(b.has_original_images) !== Number(a.has_original_images)) return Number(b.has_original_images) - Number(a.has_original_images);
    if (b.original_image_count !== a.original_image_count) return b.original_image_count - a.original_image_count;
    if (Number(b.representative_building_seed) !== Number(a.representative_building_seed)) return Number(b.representative_building_seed) - Number(a.representative_building_seed);
    if ((a.assignment_distance_km || 9999) !== (b.assignment_distance_km || 9999)) return (a.assignment_distance_km || 9999) - (b.assignment_distance_km || 9999);
    return b.historical_listing_count - a.historical_listing_count;
  });

  return {
    district_name: districtLabel(entry),
    district_slug: slug,
    district_id: entry.node ? entry.node.id : entry.rawArea ? entry.rawArea.id : `district:ca:${slug}`,
    city: (entry.node && entry.node.parent_city) || (entry.rawArea && entry.rawArea.city) || entry.config.city || null,
    state: entry.config.state || "CA",
    canonical_path: entry.node ? entry.node.canonical_path : null,
    commercial_identity_summary: entry.node ? entry.node.commercial_identity_summary : entry.rawArea ? entry.rawArea.identity : null,
    centroid: entry.rawArea ? entry.rawArea.centroid : entry.config.centroid || null,
    association_inputs: {
      neighborhood_aliases: entry.config.aliases || [],
      raw_area_slug: entry.rawArea ? entry.rawArea.slug : null,
      proximity_radius_km: entry.config.proximity_radius_km || null,
      source_layers_used: Object.keys(sourceLayerCounts).sort(),
    },
    building_count: buildings.length,
    buildings_with_original_images: buildingsWithImages,
    buildings_without_original_images: buildings.length - buildingsWithImages,
    total_original_images: totalImages,
    image_coverage_rate: buildings.length ? Number((buildingsWithImages / buildings.length).toFixed(4)) : 0,
    source_layer_counts: sourceLayerCounts,
    image_coverage_by_source_layer: coverageByLayer,
    city_counts: cityCounts,
    representative_seed_count: buildings.filter((building) => building.representative_building_seed).length,
    provider_bias_summary: {
      possible_regus_or_coworking_buildings: buildings.filter((building) => building.provider_bias_flags.length).length,
      note: "Flags are lightweight internal cautions only; they are not exclusion rules.",
    },
    buildings,
  };
}

function report(output) {
  const rows = Object.values(output.districts)
    .map((district) => `| ${district.district_name} | ${district.building_count} | ${district.buildings_with_original_images} | ${district.total_original_images} | ${district.representative_seed_count} | ${Object.keys(district.source_layer_counts).join(", ")} |`)
    .join("\n");

  return `# District Building Universe V1

Generated a broad internal district-to-building universe for Bay Area commercial district media and editorial review.

## Scope

- Districts: ${output.totals.district_count}
- Buildings associated: ${output.totals.building_count}
- Buildings with original images: ${output.totals.buildings_with_original_images}
- Original images attached: ${output.totals.total_original_images}

## Method

This pass intentionally broadens beyond currently published buildings and representative seeds. It combines:

- Bay Area neighborhood assignment rows
- Bay Area raw corpus area assignments
- Representative building seeds as a signal, not a limit
- Building Signals metadata
- Lat/lng proximity to reviewed district centers where available
- Original Image Index V1 coverage

No images were copied, processed, resized, optimized, uploaded, scored, or suppressed.

## District Summary

| District | Buildings | With originals | Original images | Rep seeds | Source layers |
|---|---:|---:|---:|---:|---|
${rows}

## Guardrails

- Internal editorial infrastructure only.
- Building and image counts are review coverage signals, not public metrics.
- Provider-bias flags are cautions only and do not remove records.
- District association remains approximate where neighborhood assignments or reliable polygons are unavailable.

## Next Step

Use this universe as the input for a broader representative imagery review manifest so editorial review can select authentic district context, exterior photography, and streetscape-supporting buildings before any public imagery is considered.
`;
}

async function main() {
  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });

  const originalIndex = readJson(ORIGINAL_IMAGE_INDEX, {});
  const nodeBySlug = loadDistrictNodes();
  const rawCorpus = loadRawCorpus();
  const districts = createDistricts(nodeBySlug, rawCorpus);

  loadRawCorpusAssignments(districts, rawCorpus);
  await loadNeighborhoodAssignments(districts);
  await loadRepresentativeSeeds(districts);
  await loadBuildingSignals(districts);

  const districtOutput = {};
  for (const [slug, entry] of districts.entries()) {
    districtOutput[slug] = summarizeDistrict(slug, entry, originalIndex);
  }

  const totals = Object.values(districtOutput).reduce((acc, district) => {
    acc.district_count += 1;
    acc.building_count += district.building_count;
    acc.buildings_with_original_images += district.buildings_with_original_images;
    acc.total_original_images += district.total_original_images;
    return acc;
  }, {
    district_count: 0,
    building_count: 0,
    buildings_with_original_images: 0,
    total_original_images: 0,
  });

  const output = {
    version: "v1",
    generated_at: new Date().toISOString(),
    public_ready: false,
    workflow: "district geography -> broad building universe -> original image coverage -> future editorial curation",
    guardrails: [
      "Internal editorial infrastructure only.",
      "No public pages, Eleventy routes, uploads, image processing, resizing, optimization, or suppression.",
      "Representative building seeds are included as signals only; they do not limit the universe.",
      "Counts are internal review coverage signals and must not be exposed as public inventory metrics.",
    ],
    input_files: {
      original_image_index: ORIGINAL_IMAGE_INDEX,
      district_nodes: DISTRICT_NODES,
      district_assignments: DISTRICT_ASSIGNMENTS,
      representative_buildings: REPRESENTATIVE_BUILDINGS,
      building_signals: BUILDING_SIGNALS,
      raw_corpus: RAW_CORPUS,
    },
    original_image_index_status: {
      building_ids_in_index: Object.keys(originalIndex).length,
      loaded: Object.keys(originalIndex).length > 0,
    },
    totals,
    districts: districtOutput,
  };

  fs.writeFileSync(OUTPUT_PATH, `${JSON.stringify(output, null, 2)}\n`);
  fs.writeFileSync(REPORT_PATH, report(output));
  console.log(`Wrote ${OUTPUT_PATH}`);
  console.log(`Wrote ${REPORT_PATH}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
