#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const readline = require("readline");

const ROOT = process.cwd();
const OUTPUT_DIR = path.join(ROOT, "data", "district-building-candidates", "audits");

const DISTRICTS = [
  {
    slug: "soma",
    name: "SoMa",
    city: "San Francisco",
    state: "CA",
    area_id: "sf-soma",
    canonical_path: "/commercial-real-estate/CA/san-francisco/soma/",
    universe_slug: "soma",
    candidate_file: path.join(ROOT, "data", "district-building-candidates", "soma.json"),
    identity_terms: [
      "soma",
      "south of market",
      "folsom",
      "brannan",
      "townsend",
      "2nd st",
      "3rd st",
      "4th st",
      "5th st",
      "6th st",
      "7th st",
      "8th st",
      "9th st",
      "market st",
      "howard",
      "harrison",
    ],
    representative_terms: ["warehouse", "creative", "adaptive", "loft", "showroom", "tech", "startup"],
  },
  {
    slug: "mission-bay",
    name: "Mission Bay",
    city: "San Francisco",
    state: "CA",
    area_id: "sf-mission-bay",
    canonical_path: "/commercial-real-estate/CA/san-francisco/mission-bay/",
    universe_slug: "mission-bay",
    candidate_file: path.join(ROOT, "data", "district-building-candidates", "mission-bay.json"),
    identity_terms: [
      "mission bay",
      "china basin",
      "ucsf",
      "terry francois",
      "third st",
      "3rd st",
      "mission rock",
      "owens",
      "gene friend",
      "rhode island",
      "minnesota",
      "illinois",
      "16th st",
    ],
    representative_terms: ["lab", "life science", "medical", "research", "biotech", "clinic", "campus", "institutional"],
  },
];

const RAW_LISTINGS_PATH = path.join(ROOT, "_data", "raw-listings.json");
const PUBLIC_BUILDINGS_PATH = path.join(ROOT, "_data", "buildingPages.js");
const NEIGHBORHOOD_PAGES_PATH = path.join(ROOT, "_data", "neighborhoodPages.js");
const RELATIONSHIPS_PATH = path.join(ROOT, "data", "peter", "research", "commercial_area_building_relationships_v1.json");
const UNIVERSE_PATH = path.join(ROOT, "data", "media", "generated", "district_building_universe_v1.json");
const MEDIA_MANIFEST_PATH = path.join(ROOT, "data", "media", "generated", "representative_image_review_manifest_v1.json");
const CURATED_MEDIA_PATH = path.join(ROOT, "data", "media", "generated", "curated_district_media_export_v1.json");
const PDF_MANIFEST_PATH = path.join(ROOT, "data", "media", "generated", "pdfs_sample_manifest.json");
const RAW_CSV_LISTINGS_PATH = path.join(ROOT, "data", "peter", "raw", "rofo_listings.csv");

function readJson(filePath, fallback = {}) {
  if (!fs.existsSync(filePath)) return fallback;
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function requireData(filePath, fallback = []) {
  if (!fs.existsSync(filePath)) return fallback;
  return require(filePath);
}

function clean(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function slugify(value) {
  return clean(value)
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function canonicalPathFor(record) {
  if (record.canonical_building_path || record.building_path) return record.canonical_building_path || record.building_path;
  const address = clean(record.address || record.name);
  const city = clean(record.city);
  const state = clean(record.state || record.state_abbr);
  if (!address || !city || !state) return "";
  return `/commercial-real-estate/building/${state}/${slugify(city)}/${slugify(address)}/`;
}

function addressKey(record) {
  return [
    clean(record.address || record.display_name || record.name).toLowerCase(),
    clean(record.city).toLowerCase(),
    clean(record.state || record.state_abbr).toUpperCase(),
  ].join("|");
}

function descriptionText(record) {
  return clean([
    record.property_description,
    record.space_description,
    record.teaser,
    record.building_description,
    record.about_context,
    record.location_context,
  ].join(" "));
}

function descriptionQuality(text) {
  const length = clean(text).length;
  if (length >= 220) return "rich";
  if (length >= 80) return "usable";
  if (length > 0) return "thin";
  return "missing";
}

function hasImage(record) {
  return Boolean(
    record.hero_image ||
    (Array.isArray(record.image_urls) && record.image_urls.length) ||
    record.has_original_images ||
    record.original_image_count > 0
  );
}

function parseCsvLine(line) {
  const values = [];
  let current = "";
  let quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"') {
      if (quoted && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        quoted = !quoted;
      }
    } else if (char === "," && !quoted) {
      values.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  values.push(current);
  return values;
}

async function collectCsvListingStats(buildingIdsByDistrict) {
  const stats = {};
  const buildingIdToDistricts = new Map();

  for (const district of DISTRICTS) {
    stats[district.slug] = {
      listing_rows: 0,
      source_distribution: {},
      status_distribution: {},
      space_type_distribution: {},
      records_with_source_metadata: 0,
      records_with_created_at: 0,
      records_with_updated_at: 0,
      records_with_external_url: 0,
    };
    for (const id of buildingIdsByDistrict[district.slug] || []) {
      if (!buildingIdToDistricts.has(id)) buildingIdToDistricts.set(id, []);
      buildingIdToDistricts.get(id).push(district.slug);
    }
  }

  if (!fs.existsSync(RAW_CSV_LISTINGS_PATH)) return stats;

  const stream = fs.createReadStream(RAW_CSV_LISTINGS_PATH);
  const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });
  let headers = null;

  for await (const line of rl) {
    if (!headers) {
      headers = parseCsvLine(line);
      continue;
    }
    if (!line) continue;
    const values = parseCsvLine(line);
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || "";
    });

    const districts = buildingIdToDistricts.get(row.building_id);
    if (!districts) continue;

    for (const slug of districts) {
      const item = stats[slug];
      item.listing_rows += 1;
      if (row.source) {
        item.records_with_source_metadata += 1;
        item.source_distribution[row.source] = (item.source_distribution[row.source] || 0) + 1;
      }
      if (row.status) item.status_distribution[row.status] = (item.status_distribution[row.status] || 0) + 1;
      if (row.space_type) item.space_type_distribution[row.space_type] = (item.space_type_distribution[row.space_type] || 0) + 1;
      if (row.created_at) item.records_with_created_at += 1;
      if (row.updated_at) item.records_with_updated_at += 1;
      if (row.external_url) item.records_with_external_url += 1;
    }
  }

  return stats;
}

function topDistribution(object, limit = 8) {
  return Object.entries(object || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([key, count]) => ({ key, count }));
}

function pct(part, whole) {
  if (!whole) return 0;
  return Number(((part / whole) * 100).toFixed(1));
}

function getCurrentPublicReps(neighborhoodPages, district) {
  const page = neighborhoodPages.find((item) => (
    item.canonical_neighborhood_path === district.canonical_path ||
    clean(item.title).toLowerCase().includes(district.name.toLowerCase()) ||
    item.district?.slug === district.slug
  ));
  return page?.representative_buildings || [];
}

function summarizeDistrict(district, sources, csvStats) {
  const universeBuildings = sources.universe.districts?.[district.universe_slug]?.buildings || [];
  const candidateOutput = readJson(district.candidate_file, { candidates: [], recommended_public_representatives: [] });
  const mediaManifest = sources.mediaManifest.districts?.[district.slug] || {};
  const curatedAssets = sources.curatedMedia.districts?.[district.slug]?.assets || [];

  const universeByAddress = new Map(universeBuildings.map((building) => [addressKey(building), building]));
  const universeByPath = new Map(universeBuildings.map((building) => [canonicalPathFor(building), building]));
  const buildingIds = new Set(universeBuildings.map((building) => clean(building.building_id)).filter(Boolean));

  const rawListingMatches = sources.rawListings.filter((listing) => (
    listing.city === district.city &&
    listing.state_abbr === district.state &&
    (universeByAddress.has(addressKey(listing)) || universeByPath.has(canonicalPathFor(listing)))
  ));

  const rawListingAddressCounts = new Map();
  for (const listing of rawListingMatches) {
    const key = addressKey(listing);
    rawListingAddressCounts.set(key, (rawListingAddressCounts.get(key) || 0) + 1);
  }

  const rawListingClusters = [...rawListingAddressCounts.entries()].sort((a, b) => b[1] - a[1]);
  const duplicateAddressRecords = rawListingClusters.reduce((total, [, count]) => total + Math.max(0, count - 1), 0);
  const likelySuiteRows = rawListingMatches.filter((listing) => clean(listing.space_suite)).length;

  const publicPages = sources.publicBuildings.filter((building) => (
    building.city === district.city &&
    building.state_abbr === district.state &&
    (
      building.commercial_area?.slug === district.slug ||
      building.commercial_area?.id === district.area_id ||
      universeByAddress.has(addressKey(building)) ||
      universeByPath.has(building.building_path)
    )
  ));

  const descriptions = rawListingMatches.map(descriptionText).filter(Boolean);
  const descriptionQualityCounts = { rich: 0, usable: 0, thin: 0, missing: 0 };
  for (const listing of rawListingMatches) {
    descriptionQualityCounts[descriptionQuality(descriptionText(listing))] += 1;
  }

  const sourceCompanies = new Set(rawListingMatches.map((listing) => clean(listing.source_company)).filter(Boolean));
  const sourceCompanyRows = rawListingMatches.filter((listing) => clean(listing.source_company)).length;

  const imageRecords = {
    universe_original_image_buildings: universeBuildings.filter((building) => building.has_original_images || building.original_image_count > 0).length,
    universe_original_image_count: universeBuildings.reduce((sum, building) => sum + (building.original_image_count || 0), 0),
    raw_listing_hero_image_records: rawListingMatches.filter((listing) => listing.hero_image).length,
    public_page_image_records: publicPages.filter(hasImage).length,
    curated_accepted_assets: curatedAssets.filter((asset) => asset.exported).length,
    review_manifest_buildings_with_originals: mediaManifest.coverage_stats?.buildings_with_original_image_coverage || 0,
    review_manifest_original_images: mediaManifest.coverage_stats?.original_image_count || 0,
  };

  const withImagesAddresses = new Set();
  for (const building of universeBuildings) if (hasImage(building)) withImagesAddresses.add(addressKey(building));
  for (const listing of rawListingMatches) if (hasImage(listing)) withImagesAddresses.add(addressKey(listing));
  for (const building of publicPages) if (hasImage(building)) withImagesAddresses.add(addressKey(building));

  const imageRichWeakMetadata = universeBuildings
    .filter((building) => (building.original_image_count || 0) > 0)
    .map((building) => {
      const listingCount = rawListingAddressCounts.get(addressKey(building)) || 0;
      const publicPage = publicPages.find((page) => addressKey(page) === addressKey(building));
      const description = publicPage ? descriptionText(publicPage) : "";
      return { building, listingCount, descriptionQuality: descriptionQuality(description) };
    })
    .filter((item) => item.descriptionQuality === "missing" || item.descriptionQuality === "thin")
    .sort((a, b) => (b.building.original_image_count || 0) - (a.building.original_image_count || 0))
    .slice(0, 12)
    .map((item) => ({
      name: clean(item.building.building_name || item.building.address),
      address: item.building.address,
      canonical_building_path: item.building.canonical_building_path,
      original_image_count: item.building.original_image_count || 0,
      historical_listing_count: item.building.historical_listing_count || item.listingCount || 0,
      metadata_issue: `${item.descriptionQuality} public/enriched description`,
    }));

  const topListingBuildings = universeBuildings
    .map((building) => ({
      name: clean(building.building_name || building.address),
      address: building.address,
      canonical_building_path: building.canonical_building_path,
      historical_listing_count: building.historical_listing_count || 0,
      source_layers: building.source_layers || [],
      assignment_distance_km: building.assignment_distance_km ?? null,
      has_original_images: Boolean(building.has_original_images),
      original_image_count: building.original_image_count || 0,
      representative_building_seed: Boolean(building.representative_building_seed),
    }))
    .sort((a, b) => b.historical_listing_count - a.historical_listing_count)
    .slice(0, 15);

  const currentCandidateAddresses = new Set((candidateOutput.candidates || []).map(addressKey));
  const strongCandidateAddresses = new Set((candidateOutput.candidates || [])
    .filter((candidate) => candidate.publish_recommendation === "strong_public_candidate")
    .map(addressKey));
  const underutilized = topListingBuildings
    .filter((building) => !strongCandidateAddresses.has(addressKey(building)))
    .slice(0, 10);

  const representativeText = (record) => [
    record.name,
    record.building_name,
    record.address,
    record.property_description,
    record.space_description,
  ].join(" ").toLowerCase();
  const representativeTermMatches = rawListingMatches
    .filter((listing) => district.representative_terms.some((term) => representativeText(listing).includes(term)))
    .map((listing) => ({
      name: listing.name || listing.address,
      address: listing.address,
      canonical_building_path: canonicalPathFor(listing),
      source_company: listing.source_company || "",
      term_signal: district.representative_terms.find((term) => representativeText(listing).includes(term)),
      has_hero_image: Boolean(listing.hero_image),
      description_quality: descriptionQuality(descriptionText(listing)),
    }));

  const termMatchAddressMap = new Map();
  for (const match of representativeTermMatches) {
    const key = addressKey({ ...match, city: district.city, state: district.state });
    if (!termMatchAddressMap.has(key)) termMatchAddressMap.set(key, { ...match, record_count: 0 });
    termMatchAddressMap.get(key).record_count += 1;
  }

  const sourceLayerDistribution = {};
  const confidenceDistribution = {};
  const distanceBuckets = { under_0_5km: 0, "0_5_to_1_0km": 0, "1_0_to_1_5km": 0, over_1_5km: 0, missing: 0 };
  for (const building of universeBuildings) {
    for (const layer of building.source_layers || []) {
      sourceLayerDistribution[layer] = (sourceLayerDistribution[layer] || 0) + 1;
    }
    const confidence = building.assignment_confidence || "missing";
    confidenceDistribution[confidence] = (confidenceDistribution[confidence] || 0) + 1;
    const distance = building.assignment_distance_km;
    if (distance == null) distanceBuckets.missing += 1;
    else if (distance < 0.5) distanceBuckets.under_0_5km += 1;
    else if (distance < 1.0) distanceBuckets["0_5_to_1_0km"] += 1;
    else if (distance < 1.5) distanceBuckets["1_0_to_1_5km"] += 1;
    else distanceBuckets.over_1_5km += 1;
  }

  const publicRepCount = getCurrentPublicReps(sources.neighborhoodPages, district).length;

  return {
    district: {
      slug: district.slug,
      name: district.name,
      city: district.city,
      state: district.state,
      area_id: district.area_id,
    },
    raw_coverage_metrics: {
      raw_building_associations_from_universe: universeBuildings.length,
      total_raw_records_observed: universeBuildings.length + rawListingMatches.length + (csvStats[district.slug]?.listing_rows || 0),
      raw_listing_records_from_enriched_json: rawListingMatches.length,
      raw_listing_rows_from_legacy_csv_by_building_id: csvStats[district.slug]?.listing_rows || 0,
      unique_addresses_from_universe: new Set(universeBuildings.map(addressKey)).size,
      unique_addresses_from_enriched_raw_listings: rawListingAddressCounts.size,
      unique_building_candidates: new Set([
        ...universeBuildings.map(addressKey),
        ...rawListingMatches.map(addressKey),
        ...publicPages.map(addressKey),
      ]).size,
      existing_public_building_pages: publicPages.length,
      current_public_representative_count: publicRepCount,
      candidate_file_rows: (candidateOutput.candidates || []).length,
      strong_public_candidates_from_candidate_file: (candidateOutput.candidates || []).filter((candidate) => candidate.publish_recommendation === "strong_public_candidate").length,
      records_with_any_image_signal: withImagesAddresses.size,
      records_with_original_images: imageRecords.universe_original_image_buildings,
      original_image_count_from_universe: imageRecords.universe_original_image_count,
      review_manifest_buildings_with_originals: imageRecords.review_manifest_buildings_with_originals,
      review_manifest_original_images: imageRecords.review_manifest_original_images,
      records_with_raw_listing_hero_images: imageRecords.raw_listing_hero_image_records,
      curated_exported_assets: imageRecords.curated_accepted_assets,
      records_with_pdfs: 0,
      pdf_source_accessible: Boolean(sources.pdfManifest.accessible),
      records_with_descriptions: descriptions.length,
      description_quality_counts: descriptionQualityCounts,
      records_with_lat_lng: universeBuildings.filter((building) => building.lat != null && building.lng != null).length,
      records_with_company_or_source_metadata: sourceCompanyRows + (csvStats[district.slug]?.records_with_source_metadata || 0),
      unique_source_companies_from_enriched_json: sourceCompanies.size,
    },
    quality_structure_analysis: {
      raw_listing_duplicate_address_clusters: rawListingClusters.filter(([, count]) => count > 1).length,
      raw_listing_duplicate_address_records: duplicateAddressRecords,
      raw_listing_duplicate_address_rate: pct(duplicateAddressRecords, rawListingMatches.length),
      likely_suite_level_rows: likelySuiteRows,
      likely_suite_level_rate: pct(likelySuiteRows, rawListingMatches.length),
      missing_or_thin_description_rate: pct(descriptionQualityCounts.missing + descriptionQualityCounts.thin, rawListingMatches.length),
      original_image_building_coverage_rate_of_universe: pct(imageRecords.universe_original_image_buildings, universeBuildings.length),
      raw_listing_hero_image_record_rate: pct(imageRecords.raw_listing_hero_image_records, rawListingMatches.length),
      source_layer_distribution: topDistribution(sourceLayerDistribution, 10),
      assignment_confidence_distribution: topDistribution(confidenceDistribution, 10),
      assignment_distance_buckets: distanceBuckets,
      top_duplicate_address_clusters: rawListingClusters.slice(0, 12).map(([key, count]) => ({ address_key: key, record_count: count })),
      top_legacy_csv_sources: topDistribution(csvStats[district.slug]?.source_distribution, 10),
      top_legacy_csv_space_types: topDistribution(csvStats[district.slug]?.space_type_distribution, 10),
      top_legacy_csv_statuses: topDistribution(csvStats[district.slug]?.status_distribution, 10),
    },
    district_matching_analysis: {
      current_matching_sources: [
        "commercial_area_building_relationships_v1 reviewed/approximate relationships",
        "district_building_universe_v1 broad internal associations",
        "bay_area_neighborhood_assignment and raw-corpus area assignment layers where available",
        "lat_lng_proximity to reviewed district centers",
        "building_signals metadata",
        "public building commercial_area assignment where available",
        "address/path joins into _data/raw-listings.json and _data/buildingPages.js",
      ],
      likely_false_positive_risk: universeBuildings.filter((building) => (building.source_layers || []).includes("lat_lng_proximity")).length,
      likely_false_negative_risk_notes: [
        "The enriched raw listing JSON has no lat/lng fields, so district joining depends on address/path matches into the universe.",
        "The SoMa/Mission Bay split is sensitive around Townsend, South Park, China Basin, Showplace Square, and Potrero/Design District edges.",
        "Mission Bay institutional/life-science buildings may be underrepresented if they have limited historical listings, missing commercial-area metadata, or no listing-building relationship row.",
        "Older raw CSV sources include coordinates, but descriptions and public suitability signals live in separate exports and are not fully joined in public data.",
      ],
      source_layer_distribution: topDistribution(sourceLayerDistribution, 10),
      assignment_distance_buckets: distanceBuckets,
    },
    hidden_underutilized_assets: {
      image_rich_weak_metadata: imageRichWeakMetadata,
      high_listing_activity_not_strong_public_candidates: underutilized,
      representative_term_matches: [...termMatchAddressMap.values()]
        .sort((a, b) => b.record_count - a.record_count)
        .slice(0, 15),
      candidate_rows_not_in_strong_recommendations: (candidateOutput.candidates || [])
        .filter((candidate) => candidate.publish_recommendation !== "strong_public_candidate")
        .slice(0, 10)
        .map((candidate) => ({
          name: candidate.name,
          address: candidate.address,
          recommendation: candidate.publish_recommendation,
          caution_notes: candidate.caution_notes,
          image_availability: candidate.image_availability,
          description_data_quality_signal: candidate.description_data_quality_signal,
        })),
    },
    candidate_funnel_analysis: {
      universe_buildings: universeBuildings.length,
      selected_candidate_rows: (candidateOutput.candidates || []).length,
      selection_rate_from_universe_to_candidate_file: pct((candidateOutput.candidates || []).length, universeBuildings.length),
      strong_public_candidates: (candidateOutput.candidates || []).filter((candidate) => candidate.publish_recommendation === "strong_public_candidate").length,
      strong_candidate_rate_from_universe: pct((candidateOutput.candidates || []).filter((candidate) => candidate.publish_recommendation === "strong_public_candidate").length, universeBuildings.length),
      current_filtering_interpretation: "The current candidate process intentionally caps each district at 25 rows and requires reviewed/seeded district association before possible public recommendation. It also penalizes proximity-only associations and thin descriptions.",
      diagnosis: "",
    },
  };
}

function applyDiagnoses(summary) {
  if (summary.district.slug === "soma") {
    summary.candidate_funnel_analysis.diagnosis = "SoMa is not truly shallow in the raw corpus. It has very large broad coverage, but most records are proximity-based, suite/listing-heavy, thinly described, or lack reviewed representative-role assignment. The one strong public candidate reflects conservative filtering and weak reviewed relationship depth, not lack of raw building associations.";
  } else if (summary.district.slug === "mission-bay") {
    summary.candidate_funnel_analysis.diagnosis = "Mission Bay has materially smaller coverage than SoMa, but it is not empty. The weak public-candidate count appears to come from limited reviewed relationships, low image coverage, thin descriptions, and the fact that institutional/life-science identity is poorly captured by ordinary office listing rows.";
  }
  return summary;
}

function markdownFor(summary, sources) {
  const metrics = summary.raw_coverage_metrics;
  const quality = summary.quality_structure_analysis;
  const matching = summary.district_matching_analysis;
  const hidden = summary.hidden_underutilized_assets;
  const funnel = summary.candidate_funnel_analysis;

  const lines = [
    `# ${summary.district.name} District Coverage Audit`,
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "Internal diagnostic audit only. This report is not a publication queue, not a listings feed, and not a recommendation to imply current availability.",
    "",
    "## 1. Raw Coverage Metrics",
    "",
    "| Metric | Count / Status |",
    "|---|---:|",
    `| Raw building associations from district universe | ${metrics.raw_building_associations_from_universe} |`,
    `| Total raw records observed across joined sources | ${metrics.total_raw_records_observed} |`,
    `| Enriched raw listing records matched by address/path | ${metrics.raw_listing_records_from_enriched_json} |`,
    `| Legacy CSV listing rows matched by building id | ${metrics.raw_listing_rows_from_legacy_csv_by_building_id} |`,
    `| Unique universe addresses | ${metrics.unique_addresses_from_universe} |`,
    `| Unique enriched raw-listing addresses | ${metrics.unique_addresses_from_enriched_raw_listings} |`,
    `| Unique building candidates across joined sources | ${metrics.unique_building_candidates} |`,
    `| Existing public building pages | ${metrics.existing_public_building_pages} |`,
    `| Current public representative buildings | ${metrics.current_public_representative_count} |`,
    `| Candidate file rows from prior pass | ${metrics.candidate_file_rows} |`,
    `| Strong public candidates from prior pass | ${metrics.strong_public_candidates_from_candidate_file} |`,
    `| Building/address records with any image signal | ${metrics.records_with_any_image_signal} |`,
    `| Universe buildings with original images | ${metrics.records_with_original_images} |`,
    `| Original image count from universe | ${metrics.original_image_count_from_universe} |`,
    `| Review manifest buildings with originals | ${metrics.review_manifest_buildings_with_originals} |`,
    `| Review manifest original images | ${metrics.review_manifest_original_images} |`,
    `| Enriched raw listing records with hero images | ${metrics.records_with_raw_listing_hero_images} |`,
    `| Curated exported district assets | ${metrics.curated_exported_assets} |`,
    `| Records with known PDFs | ${metrics.records_with_pdfs} |`,
    `| PDF source accessible in this workspace | ${metrics.pdf_source_accessible ? "yes" : "no"} |`,
    `| Matched enriched records with descriptions | ${metrics.records_with_descriptions} |`,
    `| Universe records with lat/lng | ${metrics.records_with_lat_lng} |`,
    `| Records with company/source metadata | ${metrics.records_with_company_or_source_metadata} |`,
    `| Unique source companies from enriched raw listings | ${metrics.unique_source_companies_from_enriched_json} |`,
    "",
    "Description quality from enriched raw listings:",
    "",
    `- Rich: ${metrics.description_quality_counts.rich}`,
    `- Usable: ${metrics.description_quality_counts.usable}`,
    `- Thin: ${metrics.description_quality_counts.thin}`,
    `- Missing: ${metrics.description_quality_counts.missing}`,
    "",
    "## 2. Quality / Structure Analysis",
    "",
    `- Suite/listing duplication rate: ${quality.likely_suite_level_rate}% of matched enriched raw listing rows include a suite value.`,
    `- Duplicate address clustering: ${quality.raw_listing_duplicate_address_clusters} address clusters have more than one enriched raw listing row; duplicate rows represent ${quality.raw_listing_duplicate_address_rate}% of matched enriched listing records.`,
    `- Missing/thin description prevalence: ${quality.missing_or_thin_description_rate}% of matched enriched listing rows are missing or thin.`,
    `- Original image coverage: ${quality.original_image_building_coverage_rate_of_universe}% of universe building associations have original-image coverage.`,
    `- Raw-listing hero image coverage: ${quality.raw_listing_hero_image_record_rate}% of matched enriched listing rows have a hero image.`,
    "",
    "Top duplicate address clusters:",
    "",
    ...quality.top_duplicate_address_clusters.map((item) => `- ${item.address_key}: ${item.record_count} records`),
    "",
    "Top source layers:",
    "",
    ...quality.source_layer_distribution.map((item) => `- ${item.key}: ${item.count}`),
    "",
    "Assignment distance buckets:",
    "",
    ...Object.entries(quality.assignment_distance_buckets).map(([key, count]) => `- ${key}: ${count}`),
    "",
    "Legacy CSV source distribution:",
    "",
    ...(quality.top_legacy_csv_sources.length ? quality.top_legacy_csv_sources.map((item) => `- ${item.key}: ${item.count}`) : ["- None found in joined legacy CSV listing rows."]),
    "",
    "## 3. District Matching Analysis",
    "",
    "Current matching works through these layers:",
    "",
    ...matching.current_matching_sources.map((item) => `- ${item}`),
    "",
    `Likely false-positive risk: ${matching.likely_false_positive_risk} universe associations include the proximity layer. These are useful for discovery but should not be treated as verified district membership.`,
    "",
    "Likely false-negative risks:",
    "",
    ...matching.likely_false_negative_risk_notes.map((item) => `- ${item}`),
    "",
    "## 4. Hidden / Underutilized Assets",
    "",
    "Image-rich buildings with weak public/enriched metadata:",
    "",
    ...(hidden.image_rich_weak_metadata.length ? hidden.image_rich_weak_metadata.map((item) => `- ${item.address}: ${item.original_image_count} original image(s), ${item.historical_listing_count} historical listing signal(s), ${item.metadata_issue}`) : ["- None found in joined local sources."]),
    "",
    "High-listing-activity buildings not currently strong public candidates:",
    "",
    ...(hidden.high_listing_activity_not_strong_public_candidates.length ? hidden.high_listing_activity_not_strong_public_candidates.map((item) => `- ${item.address}: ${item.historical_listing_count} historical listing signal(s), images: ${item.original_image_count}, layers: ${(item.source_layers || []).join(", ")}`) : ["- None found."]),
    "",
    "Representative-term matches from enriched listing text:",
    "",
    ...(hidden.representative_term_matches.length ? hidden.representative_term_matches.map((item) => `- ${item.address}: ${item.record_count} record(s), term: ${item.term_signal}, description: ${item.description_quality}, hero image: ${item.has_hero_image ? "yes" : "no"}`) : ["- None found in enriched listing text."]),
    "",
    "## 5. Candidate Funnel Analysis",
    "",
    `- Universe buildings: ${funnel.universe_buildings}`,
    `- Prior candidate rows selected: ${funnel.selected_candidate_rows}`,
    `- Universe-to-candidate-file selection rate: ${funnel.selection_rate_from_universe_to_candidate_file}%`,
    `- Strong public candidates: ${funnel.strong_public_candidates}`,
    `- Strong-candidate rate from universe: ${funnel.strong_candidate_rate_from_universe}%`,
    `- Filtering interpretation: ${funnel.current_filtering_interpretation}`,
    `- Diagnosis: ${funnel.diagnosis}`,
    "",
    "## 6. AWS / Archive Dependency Assessment",
    "",
    `- PDF manifest root: ${sources.pdfManifest.root || "unknown"}`,
    `- PDF manifest accessible locally: ${sources.pdfManifest.accessible ? "yes" : "no"}`,
    "- The building/listing media roots referenced by existing reports are not fully accessible in this workspace.",
    "- Existing reports state that original building imagery historically lived under `/ebs2/rofo/content/buildings5/orig` and PDFs under `/ebs1/rofo/www/content/pdfs`.",
    "- Do not delete AWS volumes, snapshots, old media roots, SQL dumps, or listing/PDF directories until the inaccessible roots have been checked from the production/archive environment.",
    "- Additional recovery/audit is warranted for PDFs, original listing media, and older building/image corpuses because local manifests are samples or stale mirrors rather than a complete live scan.",
    "",
    "## 7. Diagnostic Conclusion",
    "",
    summary.district.slug === "soma"
      ? "SoMa appears artificially shallow at the representative-candidate layer. The raw building universe is broad, but a large share of records are proximity-discovered, suite/listing-heavy, thinly described, or not reviewed into district-form roles."
      : "Mission Bay is genuinely smaller than SoMa in the current joined corpus, but the representative layer is still artificially shallow because life-science/institutional identity is not well represented by ordinary office listing rows, image coverage is low, and reviewed relationships are limited.",
    "",
    "Recommended next audit action: manually review the high-listing and image-rich underutilized buildings before changing public representative buildings. Treat archive recovery as preservation due diligence, not as a publishing automation path.",
    "",
  ];

  return lines.join("\n");
}

async function main() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const sources = {
    rawListings: readJson(RAW_LISTINGS_PATH, []),
    publicBuildings: requireData(PUBLIC_BUILDINGS_PATH, []),
    neighborhoodPages: requireData(NEIGHBORHOOD_PAGES_PATH, []),
    relationships: readJson(RELATIONSHIPS_PATH, {}),
    universe: readJson(UNIVERSE_PATH, {}),
    mediaManifest: readJson(MEDIA_MANIFEST_PATH, {}),
    curatedMedia: readJson(CURATED_MEDIA_PATH, {}),
    pdfManifest: readJson(PDF_MANIFEST_PATH, {}),
  };

  const buildingIdsByDistrict = {};
  for (const district of DISTRICTS) {
    const buildings = sources.universe.districts?.[district.universe_slug]?.buildings || [];
    buildingIdsByDistrict[district.slug] = new Set(buildings.map((building) => clean(building.building_id)).filter(Boolean));
  }

  const csvStats = await collectCsvListingStats(buildingIdsByDistrict);
  const summaries = DISTRICTS.map((district) => applyDiagnoses(summarizeDistrict(district, sources, csvStats)));

  for (const summary of summaries) {
    fs.writeFileSync(
      path.join(OUTPUT_DIR, `${summary.district.slug}-audit.md`),
      markdownFor(summary, sources),
      "utf8"
    );
  }

  fs.writeFileSync(
    path.join(OUTPUT_DIR, "coverage-summary.json"),
    JSON.stringify({
      generated_at: new Date().toISOString(),
      purpose: "Focused internal diagnostic audit of SoMa and Mission Bay raw commercial building/listing coverage.",
      guardrails: [
        "Internal diagnostic only.",
        "Do not imply current availability.",
        "Do not publish or mass-generate representative buildings from this file.",
        "Do not delete archive infrastructure based on this workspace-only audit.",
      ],
      source_files: {
        raw_listings_json: path.relative(ROOT, RAW_LISTINGS_PATH),
        public_building_pages: path.relative(ROOT, PUBLIC_BUILDINGS_PATH),
        district_universe: path.relative(ROOT, UNIVERSE_PATH),
        image_review_manifest: path.relative(ROOT, MEDIA_MANIFEST_PATH),
        curated_media_export: path.relative(ROOT, CURATED_MEDIA_PATH),
        pdf_manifest: path.relative(ROOT, PDF_MANIFEST_PATH),
        raw_csv_listings: path.relative(ROOT, RAW_CSV_LISTINGS_PATH),
      },
      districts: summaries,
    }, null, 2),
    "utf8"
  );

  for (const summary of summaries) {
    console.log(`${summary.district.name}: ${summary.raw_coverage_metrics.raw_building_associations_from_universe} universe buildings, ${summary.raw_coverage_metrics.raw_listing_rows_from_legacy_csv_by_building_id} legacy listing rows, ${summary.raw_coverage_metrics.records_with_original_images} with original images, ${summary.raw_coverage_metrics.strong_public_candidates_from_candidate_file} strong public candidates`);
  }
  console.log(`Wrote audits to ${path.relative(ROOT, OUTPUT_DIR)}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
