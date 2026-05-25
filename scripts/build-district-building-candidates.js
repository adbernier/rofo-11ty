#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const OUTPUT_DIR = path.join(ROOT, "data", "district-building-candidates");

const RAW_LISTINGS_PATH = path.join(ROOT, "_data", "raw-listings.json");
const BUILDING_PAGES_PATH = path.join(ROOT, "_data", "buildingPages.js");
const NEIGHBORHOOD_PAGES_PATH = path.join(ROOT, "_data", "neighborhoodPages.js");
const RELATIONSHIPS_PATH = path.join(ROOT, "data", "peter", "research", "commercial_area_building_relationships_v1.json");
const UNIVERSE_PATH = path.join(ROOT, "data", "media", "generated", "district_building_universe_v1.json");
const CURATED_MEDIA_PATH = path.join(ROOT, "data", "media", "generated", "curated_district_media_export_v1.json");

const DISTRICTS = [
  {
    slug: "soma",
    name: "SoMa",
    city: "San Francisco",
    state: "CA",
    path: "/commercial-real-estate/CA/san-francisco/soma/",
    area_ids: ["sf-soma"],
    universe_slug: "soma",
    role_defaults: ["Converted warehouse / creative office", "Adaptive mixed-use commercial", "Large-floorplate office"],
  },
  {
    slug: "financial-district-sf",
    name: "Financial District SF",
    city: "San Francisco",
    state: "CA",
    path: "/commercial-real-estate/CA/san-francisco/financial-district/",
    area_ids: ["sf-financial-district"],
    universe_slug: "financial-district-sf",
    role_defaults: ["Vertical downtown office form", "Transit-oriented business core", "Client-facing office building"],
  },
  {
    slug: "downtown-oakland",
    name: "Downtown Oakland",
    city: "Oakland",
    state: "CA",
    path: "/commercial-real-estate/CA/oakland/downtown-oakland/",
    area_ids: ["oak-downtown-oakland"],
    universe_slug: "downtown-oakland",
    role_defaults: ["BART/transit-oriented business core", "Civic office core", "Broadway office corridor"],
  },
  {
    slug: "uptown-oakland",
    name: "Uptown Oakland",
    city: "Oakland",
    state: "CA",
    path: "/commercial-real-estate/CA/oakland/uptown-oakland/",
    area_ids: ["oak-uptown"],
    universe_slug: "uptown-oakland",
    role_defaults: ["Mixed-use office district", "Arts-adjacent commercial block", "Lake Merritt edge office"],
  },
  {
    slug: "jack-london-square",
    name: "Jack London Square",
    city: "Oakland",
    state: "CA",
    path: "/commercial-real-estate/CA/oakland/jack-london-square/",
    area_ids: ["oak-jack-london-square"],
    universe_slug: "jack-london-square",
    role_defaults: ["Waterfront-adjacent commercial", "Adaptive industrial/showroom context", "Service-commercial waterfront block"],
  },
  {
    slug: "downtown-palo-alto",
    name: "Downtown Palo Alto",
    city: "Palo Alto",
    state: "CA",
    path: "/commercial-real-estate/CA/palo-alto/downtown-palo-alto/",
    area_ids: ["ba-downtown-palo-alto"],
    universe_slug: "downtown-palo-alto",
    role_defaults: ["Startup/professional downtown building", "Caltrain-adjacent professional office", "Retail-supported downtown block"],
  },
  {
    slug: "mission-bay",
    name: "Mission Bay",
    city: "San Francisco",
    state: "CA",
    path: "/commercial-real-estate/CA/san-francisco/mission-bay/",
    area_ids: ["sf-mission-bay"],
    universe_slug: "mission-bay",
    role_defaults: ["Institutional/life-science office", "Modern mixed-use commercial", "Waterfront-adjacent commercial"],
  },
  {
    slug: "jackson-square",
    name: "Jackson Square",
    city: "San Francisco",
    state: "CA",
    path: "/commercial-real-estate/CA/san-francisco/jackson-square/",
    area_ids: ["sf-jackson-square"],
    universe_slug: null,
    role_defaults: ["Historic boutique office", "Financial District edge office", "Street-level commercial block"],
  },
  {
    slug: "old-oakland",
    name: "Old Oakland",
    city: "Oakland",
    state: "CA",
    path: "/commercial-real-estate/CA/oakland/old-oakland/",
    area_ids: ["oak-old-oakland"],
    universe_slug: "downtown-oakland",
    universe_filter: (building) =>
      String(building.neighborhood_name || "").includes("Old Oakland") ||
      (building.association_notes || []).join(" ").includes("Old Oakland"),
    role_defaults: ["Historic downtown transition", "Street-level commercial block", "Downtown edge office"],
  },
];

function readJson(filePath, fallback) {
  if (!fs.existsSync(filePath)) return fallback;
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
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

function buildingPathFor(item) {
  if (item.canonical_building_path || item.building_path) return item.canonical_building_path || item.building_path;
  const address = clean(item.address || item.building_name || item.name);
  const city = clean(item.city);
  const state = clean(item.state || item.state_abbr);
  if (!address || !city || !state) return "";
  return `/commercial-real-estate/building/${state}/${slugify(city)}/${slugify(address)}/`;
}

function addressKey(item) {
  return [
    clean(item.address || item.display_name || item.building_name || item.name).toLowerCase(),
    clean(item.city).toLowerCase(),
    clean(item.state || item.state_abbr).toUpperCase(),
  ].join("|");
}

function isBadPublicFit(candidate) {
  const text = [
    candidate.name,
    candidate.address,
    candidate.description_sample,
    candidate.source_type,
  ].join(" ").toLowerCase();

  return /\b(apartment|apartments|duplex|single family|condo|residential|house|home)\b/.test(text) ||
    !candidate.address ||
    !candidate.city ||
    !candidate.state;
}

function typeFromRaw(raw) {
  const values = [...(raw.space_types || []), ...(raw.raw_space_types || [])].filter(Boolean);
  return values.length ? [...new Set(values.map((value) => clean(value).toLowerCase()))].join(", ") : "";
}

function descriptionQuality(text) {
  const length = clean(text).length;
  if (length >= 220) return "rich";
  if (length >= 80) return "usable";
  if (length > 0) return "thin";
  return "missing";
}

function loadRawListingAggregates(rawListings) {
  const byPath = new Map();
  const byAddress = new Map();

  for (const listing of rawListings) {
    const buildingPath = buildingPathFor(listing);
    const key = addressKey(listing);
    const existing = byPath.get(buildingPath) || byAddress.get(key) || {
      listing_count: 0,
      source_companies: new Set(),
      space_types: new Set(),
      raw_space_types: new Set(),
      has_hero_image: false,
      longest_description: "",
    };

    existing.listing_count += 1;
    if (listing.source_company) existing.source_companies.add(listing.source_company);
    if (listing.space_type) existing.space_types.add(listing.space_type);
    if (listing.raw_space_type) existing.raw_space_types.add(listing.raw_space_type);
    if (listing.hero_image) existing.has_hero_image = true;
    const description = clean(`${listing.property_description || ""} ${listing.space_description || ""}`);
    if (description.length > existing.longest_description.length) existing.longest_description = description;

    if (buildingPath) byPath.set(buildingPath, existing);
    if (key) byAddress.set(key, existing);
  }

  const convert = (value) => value && {
    listing_count: value.listing_count,
    source_companies: [...value.source_companies],
    space_types: [...value.space_types],
    raw_space_types: [...value.raw_space_types],
    has_hero_image: value.has_hero_image,
    longest_description: value.longest_description,
  };

  return {
    byPath,
    byAddress,
    lookup(candidate) {
      return convert(byPath.get(candidate.canonical_building_path) || byAddress.get(addressKey(candidate)));
    },
  };
}

function mediaIndex(curatedMedia, universe) {
  const byPath = new Map();
  const byAddress = new Map();

  for (const district of Object.values(curatedMedia.districts || {})) {
    for (const asset of district.assets || []) {
      if (!asset.exported) continue;
      const entry = {
        type: "reviewed_curated_media",
        url: asset.output_url_path || "",
        review_state: asset.review_state || "",
      };
      if (asset.canonical_building_path) byPath.set(asset.canonical_building_path, entry);
      if (asset.address) byAddress.set(addressKey({ address: asset.address, city: "San Francisco", state: "CA" }), entry);
    }
  }

  for (const district of Object.values(universe.districts || {})) {
    for (const building of district.buildings || []) {
      if (!building.has_original_images) continue;
      const entry = {
        type: "original_image_index",
        original_image_count: building.original_image_count || 0,
      };
      if (building.canonical_building_path && !byPath.has(building.canonical_building_path)) {
        byPath.set(building.canonical_building_path, entry);
      }
      if (building.address && !byAddress.has(addressKey(building))) {
        byAddress.set(addressKey(building), entry);
      }
    }
  }

  return {
    lookup(candidate) {
      return byPath.get(candidate.canonical_building_path) || byAddress.get(addressKey(candidate)) || null;
    },
  };
}

function inferRole(district, candidate) {
  const text = [
    candidate.name,
    candidate.address,
    candidate.space_building_type,
    candidate.description_sample,
    candidate.source_type,
  ].join(" ").toLowerCase();

  if (/mission-bay/.test(district.slug) && /\b(lab|life|medical|ucsf|rhode island|jeff adachi)\b/.test(text)) return "Institutional/life-science office";
  if (/financial/.test(district.slug) && /\b(tower|plaza|sansome|montgomery|california|sutter)\b/.test(text)) return "Vertical downtown office form";
  if (/jackson-square/.test(district.slug) && /\b(sansome|broadway|jackson|drumm|embarcadero)\b/.test(text)) return "Historic boutique office";
  if (/old-oakland/.test(district.slug) && /\b(washington|clay|7th|8th|broadway)\b/.test(text)) return "Historic downtown transition";
  if (/jack-london/.test(district.slug) && /\b(water|franklin|madison|2nd|jack london|warehouse|industrial)\b/.test(text)) return "Waterfront-adjacent commercial";
  if (/downtown-oakland/.test(district.slug) && /\b(broadway|city center|frank ogawa|14th|clay)\b/.test(text)) return "BART/transit-oriented business core";
  if (/uptown-oakland/.test(district.slug) && /\b(webster|franklin|broadway|kaiser|20th|21st)\b/.test(text)) return "Mixed-use office district";
  if (/palo-alto/.test(district.slug) && /\b(hamilton|lytton|university|caltrain)\b/.test(text)) return "Startup/professional downtown building";
  if (/soma/.test(district.slug) && /\b(warehouse|2nd|folsom|brannan|townsend|market)\b/.test(text)) return "Converted warehouse / creative office";

  return district.role_defaults[0];
}

function inclusionReason(candidate) {
  const reasons = [];
  if (candidate.current_public_representative) reasons.push("current public representative seed");
  if (candidate.reviewed_relationship) reasons.push("reviewed commercial-area building relationship");
  if (candidate.source_type.includes("internal_universe")) reasons.push("appears in broad internal district-building universe");
  if (candidate.existing_public_page_status === "public_building_page_exists") reasons.push("canonical public building page exists");
  if (candidate.image_availability && candidate.image_availability !== "none_known") reasons.push("image signal available");
  if (candidate.listing_history_signal) reasons.push(candidate.listing_history_signal);
  return reasons.length ? reasons.join("; ") : "included for internal district coverage review";
}

function cautionNotes(candidate) {
  const cautions = [];
  if (candidate.description_data_quality_signal === "missing" || candidate.description_data_quality_signal === "thin") {
    cautions.push("thin source description");
  }
  if (candidate.raw_listing_count > 0 && candidate.raw_listing_count <= 1) {
    cautions.push("limited listing-history signal");
  }
  if (candidate.source_type.includes("proximity_only")) {
    cautions.push("district association depends mainly on proximity");
  }
  if (isBadPublicFit(candidate)) {
    cautions.push("not a strong public representative fit without manual review");
  }
  if (/cowork|regus|spaces|wework/i.test([candidate.name, candidate.description_sample, candidate.source_file].join(" "))) {
    cautions.push("possible coworking/provider-specific artifact");
  }
  return cautions;
}

function recommendationFor(candidate, score) {
  if (isBadPublicFit(candidate)) return "reject";
  if (score >= 85) return "strong_public_candidate";
  const hasDistrictAssociation =
    candidate.reviewed_relationship ||
    candidate.current_public_representative ||
    candidate.representative_seed ||
    candidate.source_type.includes("bay_area_neighborhood_assignment") ||
    candidate.source_type.includes("bay_area_raw_corpus_area_assignment");
  if (score >= 49 && hasDistrictAssociation) return "possible_public_candidate";
  return "internal_only";
}

function scoreCandidate(candidate) {
  let score = 0;
  if (candidate.current_public_representative) score += 36;
  if (candidate.reviewed_relationship) score += candidate.reviewed_relationship_confidence === "high" ? 42 : 26;
  if (candidate.existing_public_page_status === "public_building_page_exists") score += 18;
  if (candidate.image_availability !== "none_known") score += 12;
  score += Math.min(candidate.raw_listing_count || candidate.historical_listing_activity || 0, 24);
  if (candidate.description_data_quality_signal === "rich") score += 12;
  if (candidate.description_data_quality_signal === "usable") score += 7;
  if (candidate.source_type.includes("representative_seed")) score += 16;
  if (candidate.source_type.includes("relationship")) score += 10;
  if (candidate.source_type.includes("internal_universe")) score += 7;
  if (candidate.source_type.includes("proximity_only")) score -= 10;
  if (isBadPublicFit(candidate)) score -= 80;
  return score;
}

function candidateFromRelationship(row) {
  return {
    name: clean(row.building_name || row.address),
    address: clean(row.address),
    city: clean(row.city),
    state: clean(row.state_abbr),
    canonical_building_path: clean(row.building_path),
    latitude: null,
    longitude: null,
    space_building_type: (row.inferred_space_type_mix || []).map((item) => item.space_type).join(", "),
    source_file: "data/peter/research/commercial_area_building_relationships_v1.json",
    source_type: ["reviewed_relationship"],
    reviewed_relationship: true,
    reviewed_relationship_confidence: row.confidence || "",
    historical_listing_activity: row.historical_listing_activity || 0,
    relationship_status: row.relationship_status || "",
  };
}

function candidateFromUniverse(building) {
  const sourceType = ["internal_universe"];
  if (building.source_layers || []) {
    sourceType.push(...building.source_layers.map((layer) => layer === "lat_lng_proximity" ? "proximity_only" : layer));
  }
  if (building.representative_building_seed) sourceType.push("representative_seed");
  return {
    name: clean(building.building_name || building.address),
    address: clean(building.address),
    city: clean(building.city),
    state: clean(building.state),
    canonical_building_path: clean(building.canonical_building_path),
    latitude: building.lat ?? null,
    longitude: building.lng ?? null,
    space_building_type: "",
    source_file: "data/media/generated/district_building_universe_v1.json",
    source_type: [...new Set(sourceType)],
    historical_listing_activity: building.historical_listing_count || 0,
    universe_image_count: building.original_image_count || 0,
    representative_seed: Boolean(building.representative_building_seed),
    assignment_distance_km: building.assignment_distance_km ?? null,
    neighborhood_name: building.neighborhood_name || "",
  };
}

function candidateFromPublicRep(building) {
  return {
    name: clean(building.name || building.display_name || building.address),
    address: clean(building.address || building.display_name),
    city: "",
    state: "",
    canonical_building_path: clean(building.building_path),
    latitude: null,
    longitude: null,
    space_building_type: clean(building.editorial_type_label || building.type),
    source_file: "_data/neighborhoodPages.js",
    source_type: ["current_public_representative"],
    current_public_representative: true,
    current_public_descriptor: building.editorial_descriptor || "",
  };
}

function mergeCandidate(existing, incoming) {
  for (const key of ["name", "address", "city", "state", "canonical_building_path", "space_building_type", "source_file"]) {
    if (!existing[key] && incoming[key]) existing[key] = incoming[key];
  }
  if (existing.latitude == null && incoming.latitude != null) existing.latitude = incoming.latitude;
  if (existing.longitude == null && incoming.longitude != null) existing.longitude = incoming.longitude;
  existing.source_type = [...new Set([...(existing.source_type || []), ...(incoming.source_type || [])])];
  existing.reviewed_relationship = existing.reviewed_relationship || incoming.reviewed_relationship || false;
  existing.current_public_representative = existing.current_public_representative || incoming.current_public_representative || false;
  existing.representative_seed = existing.representative_seed || incoming.representative_seed || false;
  existing.historical_listing_activity = Math.max(existing.historical_listing_activity || 0, incoming.historical_listing_activity || 0);
  existing.universe_image_count = Math.max(existing.universe_image_count || 0, incoming.universe_image_count || 0);
  existing.reviewed_relationship_confidence = existing.reviewed_relationship_confidence || incoming.reviewed_relationship_confidence || "";
  existing.current_public_descriptor = existing.current_public_descriptor || incoming.current_public_descriptor || "";
  existing.relationship_status = existing.relationship_status || incoming.relationship_status || "";
  existing.assignment_distance_km = existing.assignment_distance_km ?? incoming.assignment_distance_km ?? null;
  existing.neighborhood_name = existing.neighborhood_name || incoming.neighborhood_name || "";
}

function addCandidate(map, candidate) {
  const key = addressKey(candidate) || candidate.canonical_building_path;
  if (!key) return;
  const existing = map.get(key);
  if (existing) {
    mergeCandidate(existing, candidate);
  } else {
    map.set(key, candidate);
  }
}

function enrichCandidate(candidate, district, buildingByPath, buildingByAddress, rawIndex, imageIndex) {
  const page = buildingByPath.get(candidate.canonical_building_path) || buildingByAddress.get(addressKey(candidate));
  if (page) {
    candidate.name = candidate.name || clean(page.name || page.display_name || page.address);
    candidate.address = candidate.address || clean(page.address || page.display_name);
    candidate.city = candidate.city || clean(page.city);
    candidate.state = candidate.state || clean(page.state_abbr);
    candidate.canonical_building_path = candidate.canonical_building_path || page.building_path;
    candidate.space_building_type = candidate.space_building_type || clean(page.primary_type_label || page.type);
  }

  const raw = rawIndex.lookup(candidate);
  candidate.raw_listing_count = raw ? raw.listing_count : 0;
  candidate.source_companies = raw ? raw.source_companies : [];
  candidate.listing_history_signal = candidate.historical_listing_activity || candidate.raw_listing_count
    ? `${candidate.historical_listing_activity || candidate.raw_listing_count} historical listing signal(s)`
    : "";
  candidate.description_sample = clean((page && (page.teaser || page.building_description)) || (raw && raw.longest_description) || "").slice(0, 360);
  candidate.description_data_quality_signal = descriptionQuality(candidate.description_sample);
  if (!candidate.space_building_type && raw) candidate.space_building_type = typeFromRaw(raw);
  candidate.existing_public_page_status = page ? "public_building_page_exists" : "no_public_building_page_found";

  const image = imageIndex.lookup(candidate);
  if (image) {
    candidate.image_availability = image.type === "reviewed_curated_media"
      ? "reviewed_curated_media"
      : `original_image_index:${image.original_image_count || candidate.universe_image_count || 1}`;
  } else if (candidate.universe_image_count) {
    candidate.image_availability = `original_image_index:${candidate.universe_image_count}`;
  } else if (raw && raw.has_hero_image) {
    candidate.image_availability = "raw_listing_hero_image";
  } else {
    candidate.image_availability = "none_known";
  }

  candidate.district_slug = district.slug;
  candidate.district_name = district.name;
  candidate.likely_representative_role = candidate.current_public_descriptor || inferRole(district, candidate);

  const score = scoreCandidate(candidate);
  candidate.reason_for_inclusion = inclusionReason(candidate);
  candidate.publish_recommendation = recommendationFor(candidate, score);
  candidate.caution_notes = cautionNotes(candidate);
  candidate.internal_review_score = score;

  return candidate;
}

function buildDistrictCandidates(district, sources) {
  const candidates = new Map();
  const relationshipRows = sources.relationships.relationships.filter((row) =>
    district.area_ids.includes(row.primary_area_id)
  );
  for (const row of relationshipRows) addCandidate(candidates, candidateFromRelationship(row));

  const page = sources.neighborhoodPages.find((item) => item.canonical_neighborhood_path === district.path);
  for (const building of page?.representative_buildings || []) {
    const candidate = candidateFromPublicRep(building);
    candidate.city = district.city;
    candidate.state = district.state;
    addCandidate(candidates, candidate);
  }

  const universeDistrict = district.universe_slug ? sources.universe.districts[district.universe_slug] : null;
  const universeBuildings = (universeDistrict?.buildings || [])
    .filter((building) => district.universe_filter ? district.universe_filter(building) : true)
    .slice()
    .sort((a, b) => {
      if (Number(b.representative_building_seed) !== Number(a.representative_building_seed)) return Number(b.representative_building_seed) - Number(a.representative_building_seed);
      if (Number(b.has_original_images) !== Number(a.has_original_images)) return Number(b.has_original_images) - Number(a.has_original_images);
      if ((b.original_image_count || 0) !== (a.original_image_count || 0)) return (b.original_image_count || 0) - (a.original_image_count || 0);
      if ((b.historical_listing_count || 0) !== (a.historical_listing_count || 0)) return (b.historical_listing_count || 0) - (a.historical_listing_count || 0);
      return (a.assignment_distance_km || 9999) - (b.assignment_distance_km || 9999);
    })
    .slice(0, 80);
  for (const building of universeBuildings) addCandidate(candidates, candidateFromUniverse(building));

  const enriched = [...candidates.values()]
    .map((candidate) => enrichCandidate(candidate, district, sources.buildingByPath, sources.buildingByAddress, sources.rawIndex, sources.imageIndex))
    .filter((candidate) => candidate.address)
    .sort((a, b) => b.internal_review_score - a.internal_review_score)
    .slice(0, 25);

  const strong = enriched.filter((candidate) => candidate.publish_recommendation === "strong_public_candidate");
  const possible = enriched.filter((candidate) => candidate.publish_recommendation === "possible_public_candidate");
  const recommended = [...strong, ...possible]
    .filter((candidate) => candidate.publish_recommendation !== "reject")
    .slice(0, 8)
    .map((candidate) => ({
      name: candidate.name,
      address: candidate.address,
      canonical_building_path: candidate.canonical_building_path,
      likely_representative_role: candidate.likely_representative_role,
      publish_recommendation: candidate.publish_recommendation,
      caution_notes: candidate.caution_notes,
    }));

  return {
    generated_at: new Date().toISOString(),
    purpose: "Internal District Building Candidate Universe for editorial review. Not a listings feed and not a publication queue.",
    guardrails: [
      "Do not imply current availability.",
      "Do not mass-publish building pages from this file.",
      "Use candidates to explain district form, not to create listing grids.",
      "Manual review is required before changing public representative buildings.",
    ],
    district: {
      slug: district.slug,
      name: district.name,
      city: district.city,
      state: district.state,
      canonical_path: district.path,
      area_ids: district.area_ids,
    },
    counts: {
      candidates: enriched.length,
      strong_public_candidates: strong.length,
      possible_public_candidates: possible.length,
      internal_only: enriched.filter((candidate) => candidate.publish_recommendation === "internal_only").length,
      reject: enriched.filter((candidate) => candidate.publish_recommendation === "reject").length,
      with_existing_public_page: enriched.filter((candidate) => candidate.existing_public_page_status === "public_building_page_exists").length,
      with_image_signal: enriched.filter((candidate) => candidate.image_availability !== "none_known").length,
    },
    recommended_public_representatives: recommended,
    candidates: enriched.map((candidate) => ({
      name: candidate.name,
      address: candidate.address,
      city: candidate.city,
      state: candidate.state,
      district_slug: candidate.district_slug,
      district_name: candidate.district_name,
      canonical_building_path: candidate.canonical_building_path || "",
      source_file: candidate.source_file,
      source_type: candidate.source_type,
      latitude: candidate.latitude,
      longitude: candidate.longitude,
      space_building_type: candidate.space_building_type,
      image_availability: candidate.image_availability,
      existing_public_page_status: candidate.existing_public_page_status,
      listing_history_signal: candidate.listing_history_signal,
      description_data_quality_signal: candidate.description_data_quality_signal,
      likely_representative_role: candidate.likely_representative_role,
      reason_for_inclusion: candidate.reason_for_inclusion,
      publish_recommendation: candidate.publish_recommendation,
      caution_notes: candidate.caution_notes,
      internal_review_score: candidate.internal_review_score,
    })),
  };
}

function summaryMarkdown(results) {
  const weakDepth = results.filter((item) => item.counts.strong_public_candidates < 4);
  const needsManualReview = results.filter((item) =>
    item.counts.candidates < 10 ||
    item.counts.strong_public_candidates < 4 ||
    item.counts.reject > 0
  );
  const needsImagery = results.filter((item) => item.counts.with_image_signal < Math.min(4, item.counts.candidates));

  const lines = [
    "# District Building Candidate Universe",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "Internal editorial review output. These files are not listings, not live availability, and not a publication queue.",
    "",
    "## Candidate Counts",
    "",
    "| District | Candidates | Strong public | Possible public | Internal only | Reject | Existing pages | Image signals |",
    "|---|---:|---:|---:|---:|---:|---:|---:|",
  ];

  for (const item of results) {
    lines.push(`| ${item.district.name} | ${item.counts.candidates} | ${item.counts.strong_public_candidates} | ${item.counts.possible_public_candidates} | ${item.counts.internal_only} | ${item.counts.reject} | ${item.counts.with_existing_public_page} | ${item.counts.with_image_signal} |`);
  }

  lines.push(
    "",
    "## Recommended Public Representative Candidates",
    ""
  );

  for (const item of results) {
    lines.push(`### ${item.district.name}`, "");
    if (!item.recommended_public_representatives.length) {
      lines.push("- No public candidates recommended without more manual review.", "");
      continue;
    }
    for (const candidate of item.recommended_public_representatives) {
      const caution = candidate.caution_notes.length ? ` Caution: ${candidate.caution_notes.join("; ")}.` : "";
      lines.push(`- ${candidate.address}: ${candidate.likely_representative_role} (${candidate.publish_recommendation}).${caution}`);
    }
    if (item.counts.strong_public_candidates < 4) {
      lines.push(`- Depth caution: fewer than 4 strong public candidates were found for ${item.district.name}.`);
    }
    lines.push("");
  }

  lines.push(
    "## Weak Depth",
    "",
    weakDepth.length ? weakDepth.map((item) => `- ${item.district.name}: ${item.counts.strong_public_candidates} strong public candidate(s).`).join("\n") : "- None.",
    "",
    "## Manual Review Priorities",
    "",
    needsManualReview.length ? needsManualReview.map((item) => `- ${item.district.name}`).join("\n") : "- None.",
    "",
    "## Imagery Priorities",
    "",
    needsImagery.length ? needsImagery.map((item) => `- ${item.district.name}: ${item.counts.with_image_signal} candidate(s) with known image signal.`).join("\n") : "- None.",
    "",
    "## Data Quality Cautions",
    "",
    "- Broad internal-universe candidates can include proximity-based associations and must be manually reviewed.",
    "- Existing public building pages are historical/contextual pages, not live inventory claims.",
    "- Raw listing counts are historical signal only and should not drive public representative selection by themselves.",
    "- Old Oakland and Jackson Square require special attention because historic district form is not fully captured by listing-history signals.",
    "- Mission Bay requires manual review for life-science/institutional fit; office listings alone do not prove lab suitability.",
    ""
  );

  return lines.join("\n");
}

function main() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const rawListings = readJson(RAW_LISTINGS_PATH, []);
  const buildingPages = require(BUILDING_PAGES_PATH);
  const neighborhoodPages = require(NEIGHBORHOOD_PAGES_PATH);
  const relationships = readJson(RELATIONSHIPS_PATH, { relationships: [] });
  const universe = readJson(UNIVERSE_PATH, { districts: {} });
  const curatedMedia = readJson(CURATED_MEDIA_PATH, { districts: {} });

  const buildingByPath = new Map(buildingPages.map((building) => [building.building_path, building]));
  const buildingByAddress = new Map(buildingPages.map((building) => [addressKey(building), building]));
  const rawIndex = loadRawListingAggregates(rawListings);
  const imageIndex = mediaIndex(curatedMedia, universe);

  const sources = {
    buildingByPath,
    buildingByAddress,
    neighborhoodPages,
    relationships,
    universe,
    rawIndex,
    imageIndex,
  };

  const results = DISTRICTS.map((district) => buildDistrictCandidates(district, sources));

  for (const result of results) {
    fs.writeFileSync(
      path.join(OUTPUT_DIR, `${result.district.slug}.json`),
      `${JSON.stringify(result, null, 2)}\n`
    );
  }

  const manifest = {
    generated_at: new Date().toISOString(),
    purpose: "Internal candidate universe manifest for core Rofo district pages.",
    output_dir: "data/district-building-candidates",
    source_files: [
      "_data/raw-listings.json",
      "_data/buildingPages.js",
      "_data/neighborhoodPages.js",
      "data/peter/research/commercial_area_building_relationships_v1.json",
      "data/media/generated/district_building_universe_v1.json",
      "data/media/generated/curated_district_media_export_v1.json",
    ],
    districts: results.map((result) => ({
      slug: result.district.slug,
      name: result.district.name,
      file: `${result.district.slug}.json`,
      counts: result.counts,
    })),
  };

  fs.writeFileSync(path.join(OUTPUT_DIR, "_manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
  fs.writeFileSync(path.join(OUTPUT_DIR, "_summary.md"), summaryMarkdown(results));

  console.log(`Wrote ${results.length} district candidate files to ${path.relative(ROOT, OUTPUT_DIR)}`);
  for (const result of results) {
    console.log(`${result.district.slug}: ${result.counts.candidates} candidates, ${result.counts.strong_public_candidates} strong public`);
  }
}

main();
