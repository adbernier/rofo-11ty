const fs = require("fs");
const path = require("path");
const readline = require("readline");

const root = process.cwd();
const outputPath = path.join(root, "data/peter/research/atlanta_building_listing_subset_v1.json");
const reportPath = path.join(root, "data/peter/reports/atlanta_neighborhood_raw_subset_comparison.md");

const buildingsPath = path.join(root, "data/peter/raw/rofo_buildings.csv");
const listingsPath = path.join(root, "data/peter/raw/rofo_listings.csv");
const descriptionSamplePath = path.join(root, "data/peter/derived/raw_listing_descriptions_sample.csv");
const spaceTypeLookup = require(path.join(root, "data/peter/research/legacy_space_type_code_lookup.json"));
const neighborhoodPages = require(path.join(root, "_data/neighborhoodPages.js"));
const priorityAreas = require(path.join(root, "data/peter/research/priority_market_commercial_area_entities_v1.json"));

const targetAreaIds = new Set([
  "atl-buckhead",
  "atl-midtown",
  "atl-downtown-atlanta",
  "atl-perimeter-center",
  "atl-west-midtown",
]);

const targetAreas = priorityAreas
  .filter((area) => targetAreaIds.has(area.id))
  .map((area) => ({
    id: area.id,
    name: area.canonical_name,
    aliases: area.aliases || [],
    type: area.area_type,
    centroid: area.approximate_centroid,
    profile: area.commercial_profile || [],
    radius_km: {
      "atl-buckhead": 3.8,
      "atl-midtown": 2.8,
      "atl-downtown-atlanta": 2.8,
      "atl-perimeter-center": 4.2,
      "atl-west-midtown": 3.0,
    }[area.id],
  }));

function parseCsvLine(line) {
  const values = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];

    if (char === '"' && inQuotes && next === '"') {
      current += '"';
      index += 1;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      values.push(current);
      current = "";
    } else {
      current += char;
    }
  }

  values.push(current);
  return values;
}

async function readCsv(filePath, onRow) {
  const stream = fs.createReadStream(filePath);
  const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });
  let headers = null;

  for await (const line of rl) {
    if (!headers) {
      headers = parseCsvLine(line).map((header) => header.replace(/^"|"$/g, ""));
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

function number(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function clean(value) {
  return String(value || "").trim();
}

function norm(value) {
  return clean(value).toLowerCase();
}

function distanceKm(a, b) {
  if (!a || !b || a.lat == null || a.lng == null || b.lat == null || b.lng == null) {
    return Number.POSITIVE_INFINITY;
  }

  const radius = 6371.0088;
  const lat1 = Number(a.lat) * Math.PI / 180;
  const lat2 = Number(b.lat) * Math.PI / 180;
  const deltaLat = (Number(b.lat) - Number(a.lat)) * Math.PI / 180;
  const deltaLng = (Number(b.lng) - Number(a.lng)) * Math.PI / 180;
  const sinLat = Math.sin(deltaLat / 2);
  const sinLng = Math.sin(deltaLng / 2);
  const value = sinLat * sinLat + Math.cos(lat1) * Math.cos(lat2) * sinLng * sinLng;

  return 2 * radius * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
}

function decodedSpaceType(code) {
  const lookup = spaceTypeLookup[String(code)] || {};
  return lookup.public_safe_category || "other/unknown";
}

function addCount(map, key, increment = 1) {
  if (!key) return;
  map.set(key, (map.get(key) || 0) + increment);
}

function sortedCounts(map) {
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([key, count]) => ({ key, count }));
}

function assignArea(record) {
  const text = [
    record.name,
    record.address,
    record.street_name,
    record.city,
    record.metro,
  ].map(norm).join(" ");

  for (const area of targetAreas) {
    const names = [area.name, ...area.aliases].map(norm).filter(Boolean);
    if (names.some((name) => text.includes(name))) {
      return {
        area_id: area.id,
        area_name: area.name,
        assignment_confidence: "high",
        assignment_method: "explicit_name_or_address_evidence",
        distance_km: null,
      };
    }
  }

  const lat = number(record.lat || record.l_glat);
  const lng = number(record.lng || record.l_glng);
  if (lat == null || lng == null || lat === 0 || lng === 0) {
    return null;
  }

  const nearest = targetAreas
    .map((area) => ({
      area,
      distance: distanceKm({ lat, lng }, area.centroid),
    }))
    .sort((a, b) => a.distance - b.distance)[0];

  if (!nearest || nearest.distance > nearest.area.radius_km) {
    return null;
  }

  const confidence = nearest.distance <= nearest.area.radius_km * 0.55 ? "high" : "medium";

  return {
    area_id: nearest.area.id,
    area_name: nearest.area.name,
    assignment_confidence: confidence,
    assignment_method: "nearest_reviewed_area_centroid",
    distance_km: Number(nearest.distance.toFixed(3)),
  };
}

function detectTextSignals(text) {
  const value = norm(text);
  const signals = [];
  const checks = [
    ["class_a", /\bclass a\b|premier office|prestigious office/],
    ["creative_office", /creative office|studio|adaptive reuse|loft/],
    ["warehouse", /warehouse|distribution|loading|clear height|dock/],
    ["showroom", /showroom/],
    ["medical", /medical|clinic|healthcare|hospital/],
    ["professional_services", /professional services|law firm|legal|accounting|consulting/],
    ["financial_services", /financial|bank|finance|wealth/],
    ["freeway_access", /freeway|interstate|i-75|i-85|i-285|ga 400|highway/],
    ["transit_oriented", /marta|transit|rail station|subway/],
    ["retail_storefront", /retail|storefront|restaurant|shopping|mall/],
    ["coworking_or_exec_suite", /regus|executive suite|coworking|business lounge|virtual office/],
    ["furnished_or_move_in", /furnished|move-in ready|turnkey|plug and play/],
  ];

  for (const [key, regex] of checks) {
    if (regex.test(value)) signals.push(key);
  }

  return signals;
}

function signalConfidence(count, total, sourceCount) {
  const share = total ? count / total : 0;
  if (count >= 20 && share >= 0.35 && sourceCount >= 3) return "high";
  if (count >= 8 && share >= 0.18 && sourceCount >= 2) return "medium";
  if (count >= 4 && sourceCount >= 2) return "low";
  return "omit";
}

function summarizeArea(area, buildings) {
  const listings = buildings.flatMap((building) => building.listings || []);
  const spaceCounts = new Map();
  const sourceCounts = new Map();
  const signalCounts = new Map();
  const signalSources = new Map();
  const listingTypeCounts = new Map();
  const sizeValues = [];

  for (const listing of listings) {
    addCount(spaceCounts, listing.decoded_space_type);
    addCount(sourceCounts, listing.source || "unknown");
    addCount(listingTypeCounts, listing.listing_type || "unknown");
    if (listing.square_footage) sizeValues.push(listing.square_footage);
    for (const signal of listing.detected_text_signals || []) {
      addCount(signalCounts, signal);
      if (!signalSources.has(signal)) signalSources.set(signal, new Set());
      signalSources.get(signal).add(listing.source || "unknown");
    }
  }

  const totalListings = listings.length;
  const rawSignals = sortedCounts(signalCounts).map(({ key, count }) => ({
    key,
    count,
    confidence: signalConfidence(count, totalListings, signalSources.get(key)?.size || 0),
    source_count: signalSources.get(key)?.size || 0,
  }));

  const publicSafeSignalKeys = new Set([
    "class_a",
    "creative_office",
    "warehouse",
    "showroom",
    "medical",
    "professional_services",
    "financial_services",
    "freeway_access",
    "transit_oriented",
    "retail_storefront",
  ]);

  const internalOnlyKeys = new Set([
    "coworking_or_exec_suite",
    "furnished_or_move_in",
  ]);
  const sortedSpaceCounts = sortedCounts(spaceCounts);
  const sortedSourceCounts = sortedCounts(sourceCounts);

  return {
    area_id: area.id,
    area_name: area.name,
    building_count: buildings.length,
    listing_count: listings.length,
    assigned_building_confidence: {
      high: buildings.filter((building) => building.assignment_confidence === "high").length,
      medium: buildings.filter((building) => building.assignment_confidence === "medium").length,
    },
    space_type_counts: sortedSpaceCounts,
    source_counts: sortedSourceCounts.slice(0, 12),
    listing_type_counts: sortedCounts(listingTypeCounts),
    size_summary: sizeValues.length
      ? {
          min_sf: Math.min(...sizeValues),
          median_sf: sizeValues.slice().sort((a, b) => a - b)[Math.floor(sizeValues.length / 2)],
          max_sf: Math.max(...sizeValues),
        }
      : null,
    extracted_signals: rawSignals
      .filter((signal) => signal.confidence !== "omit")
      .map((signal) => ({
        ...signal,
        public_safe: publicSafeSignalKeys.has(signal.key),
        internal_only: internalOnlyKeys.has(signal.key),
      })),
    pattern_signals: derivePatternSignals(buildings.length, listings.length, sortedSpaceCounts, sortedSourceCounts),
    source_bias_notes: sourceBiasNotes(sortedSourceCounts, listings.length),
  };
}

function derivePatternSignals(buildingCount, listingCount, spaceCounts, sourceCounts) {
  const signals = [];
  const total = Math.max(listingCount, 1);
  const countFor = (key) => spaceCounts.find((entry) => entry.key === key)?.count || 0;
  const shareFor = (key) => countFor(key) / total;
  const addSignal = (key, label, confidence, evidence, publicSafe = true) => {
    signals.push({
      key,
      label,
      confidence,
      evidence,
      public_safe_candidate: publicSafe,
      internal_only: !publicSafe,
    });
  };

  if (buildingCount >= 150 && listingCount >= 500) {
    addSignal(
      "broad_raw_support",
      "Broad raw-market support",
      "high",
      `${buildingCount} raw buildings and ${listingCount} historical listing rows in the approximate area.`,
      false
    );
  } else if (buildingCount >= 75 && listingCount >= 200) {
    addSignal(
      "broad_raw_support",
      "Moderate raw-market support",
      "medium",
      `${buildingCount} raw buildings and ${listingCount} historical listing rows in the approximate area.`,
      false
    );
  }

  const officeShare = shareFor("office");
  if (countFor("office") >= 250 && officeShare >= 0.6) {
    addSignal("office_orientation", "Office-oriented", "high", `Office rows represent ${Math.round(officeShare * 100)}% of decoded historical listings.`);
  } else if (countFor("office") >= 100 && officeShare >= 0.4) {
    addSignal("office_orientation", "Office-oriented", "medium", `Office rows represent ${Math.round(officeShare * 100)}% of decoded historical listings.`);
  }

  const retailShare = shareFor("retail");
  if (countFor("retail") >= 75 && retailShare >= 0.12) {
    addSignal("retail_context", "Retail context", "medium", `Retail rows represent ${Math.round(retailShare * 100)}% of decoded historical listings.`);
  }

  const industrialCount = countFor("industrial") + countFor("flex");
  const industrialShare = industrialCount / total;
  if (industrialCount >= 150 && industrialShare >= 0.22) {
    addSignal("industrial_flex_context", "Industrial/flex context", "high", `Industrial/flex rows represent ${Math.round(industrialShare * 100)}% of decoded historical listings.`);
  } else if (industrialCount >= 60 && industrialShare >= 0.12) {
    addSignal("industrial_flex_context", "Industrial/flex context", "medium", `Industrial/flex rows represent ${Math.round(industrialShare * 100)}% of decoded historical listings.`);
  }

  const topSource = sourceCounts[0];
  if (topSource && topSource.count / total >= 0.85) {
    addSignal(
      "source_bias_risk",
      "Source-bias risk",
      "high",
      `Top source "${topSource.key}" represents ${Math.round((topSource.count / total) * 100)}% of listing rows.`,
      false
    );
  } else if (topSource && topSource.count / total >= 0.6) {
    addSignal(
      "source_bias_risk",
      "Source-bias risk",
      "medium",
      `Top source "${topSource.key}" represents ${Math.round((topSource.count / total) * 100)}% of listing rows.`,
      false
    );
  }

  return signals;
}

function sourceBiasNotes(sourceCounts, total) {
  if (!total) return ["No listing sample available."];
  const notes = [];
  const top = sourceCounts[0];
  if (top && top.count / total >= 0.45) {
    notes.push(`Top source "${top.key}" represents ${Math.round((top.count / total) * 100)}% of listing rows.`);
  }
  if (sourceCounts.some((entry) => /regus|iwg|spaces/i.test(entry.key))) {
    notes.push("Executive suite or coworking feed presence may overstate small office and furnished workspace signals.");
  }
  if (sourceCounts.length < 3) {
    notes.push("Low source diversity. Treat extracted signals as internal review only.");
  }
  return notes;
}

function representativeComparison(areaId) {
  const page = neighborhoodPages.find((candidate) => candidate.commercial_area_id === areaId);
  if (!page) return null;
  const buildings = page.representative_buildings || [];
  const typeCounts = new Map();
  for (const building of buildings) {
    addCount(typeCounts, building.type || "unknown");
  }
  return {
    representative_building_count: buildings.length,
    representative_building_types: sortedCounts(typeCounts),
    page_signals: page.approximate_semantic_signals || [],
    note: "Published representative buildings are curated for page display and may reflect feed availability rather than full market composition.",
  };
}

async function main() {
  const buildingsById = new Map();
  const areaBuckets = new Map(targetAreas.map((area) => [area.id, []]));

  await readCsv(buildingsPath, async (row) => {
    if (row.state !== "GA") return;
    const city = norm(row.city);
    const metro = norm(row.metro);
    if (!city.includes("atlanta") && !city.includes("sandy springs") && !city.includes("dunwoody") && !metro.includes("atlanta")) {
      return;
    }

    const assignment = assignArea(row);
    if (!assignment) return;

    const building = {
      building_id: row.building_id,
      building_name: row.name,
      address: row.address,
      city: row.city,
      state: row.state,
      zip: row.zip,
      latitude: number(row.lat),
      longitude: number(row.lng),
      building_size: number(row.building_size),
      floors: number(row.floors),
      units: number(row.units),
      min_size: number(row.min_size),
      max_size: number(row.max_size),
      listing_count: number(row.listing_count) || 0,
      updated_at: row.updated_at,
      ...assignment,
      listings: [],
    };

    buildingsById.set(row.building_id, building);
    areaBuckets.get(assignment.area_id).push(building);
  });

  const listingIds = new Set();
  await readCsv(listingsPath, async (row) => {
    let building = buildingsById.get(row.building_id);
    let assignment = null;

    if (!building && row.state === "GA") {
      assignment = assignArea({
        city: row.city,
        state: row.state,
        lat: row.l_glat || "",
        lng: row.l_glng || "",
        name: "",
        address: "",
        metro: "",
      });
    }

    if (!building && assignment) {
      building = {
        building_id: row.building_id || `listing-only-${row.listing_id}`,
        building_name: "",
        address: "",
        city: row.city,
        state: row.state,
        zip: "",
        latitude: number(row.l_glat),
        longitude: number(row.l_glng),
        building_size: null,
        floors: null,
        units: null,
        min_size: null,
        max_size: null,
        listing_count: 0,
        updated_at: "",
        ...assignment,
        listings: [],
      };
      buildingsById.set(building.building_id, building);
      areaBuckets.get(assignment.area_id).push(building);
    }

    if (!building) return;

    const listing = {
      listing_id: row.listing_id,
      building_id: row.building_id,
      city: row.city,
      state: row.state,
      square_footage: number(row.square_footage),
      space_type_code: row.space_type,
      decoded_space_type: decodedSpaceType(row.space_type),
      lease_type: row.lease_type,
      listing_type: row.listing_type,
      price_selection: row.price_selection,
      price_type: row.price_type,
      price_sqft: row.price_sqft,
      sqft_price: row.sqft_price,
      status: row.status,
      source: row.source,
      external_url: row.external_url,
      created_at: row.created_at,
      updated_at: row.updated_at,
      description_excerpt: "",
      detected_text_signals: [],
    };

    building.listings.push(listing);
    listingIds.add(row.listing_id);
  });

  if (fs.existsSync(descriptionSamplePath)) {
    const listingsById = new Map();
    for (const building of buildingsById.values()) {
      for (const listing of building.listings) listingsById.set(listing.listing_id, listing);
    }

    await readCsv(descriptionSamplePath, async (row) => {
      const listing = listingsById.get(row.listing_id);
      if (!listing) return;
      const text = clean(row.combined_semantic_text || row.description_text || row.l_description);
      listing.description_excerpt = text.slice(0, 500);
      listing.detected_text_signals = detectTextSignals(text);
    });
  }

  const areaSummaries = targetAreas.map((area) => summarizeArea(area, areaBuckets.get(area.id) || []));
  const subsetBuildings = targetAreas.flatMap((area) =>
    (areaBuckets.get(area.id) || [])
      .sort((a, b) => (b.listings.length + b.listing_count) - (a.listings.length + a.listing_count))
      .map((building) => ({
        ...building,
        listings: building.listings
          .sort((a, b) => (b.square_footage || 0) - (a.square_footage || 0))
          .slice(0, 40),
        listing_sample_truncated: building.listings.length > 40,
      }))
  );

  const output = {
    version: "v1",
    generated_at: new Date().toISOString(),
    scope: "Atlanta raw building and listing subset for reviewed neighborhood intelligence extraction.",
    source_files: [
      "data/peter/raw/rofo_buildings.csv",
      "data/peter/raw/rofo_listings.csv",
      "data/peter/derived/raw_listing_descriptions_sample.csv",
      "data/peter/research/priority_market_commercial_area_entities_v1.json",
    ],
    assignment_rules: [
      "Assign to reviewed Atlanta commercial areas only.",
      "Use explicit area name or alias in building text as high confidence.",
      "Otherwise assign by nearest reviewed centroid within conservative radius.",
      "Do not use assignments as polygon boundaries.",
    ],
    target_areas: targetAreas,
    area_summaries: areaSummaries,
    published_representative_comparison: Object.fromEntries(
      targetAreas.map((area) => [area.id, representativeComparison(area.id)])
    ),
    buildings: subsetBuildings,
  };

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(output, null, 2)}\n`);

  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, `${buildReport(output)}\n`);

  console.log(`Wrote ${outputPath}`);
  console.log(`Wrote ${reportPath}`);
  console.log(`Buildings: ${subsetBuildings.length}`);
  console.log(`Listings retained in subset: ${subsetBuildings.reduce((sum, building) => sum + building.listings.length, 0)}`);
  for (const summary of areaSummaries) {
    console.log(`${summary.area_name}: ${summary.building_count} buildings, ${summary.listing_count} listings`);
  }
}

function buildReport(output) {
  const lines = [];
  lines.push("# Atlanta Neighborhood Raw Subset Comparison");
  lines.push("");
  lines.push(`Date: ${new Date().toISOString().slice(0, 10)}`);
  lines.push("");
  lines.push("## Purpose");
  lines.push("");
  lines.push("This report compares the existing published representative-building approach with a broader raw Atlanta building and listing subset for neighborhood intelligence extraction.");
  lines.push("");
  lines.push("The goal is to reduce feed-source bias before promoting neighborhood intelligence signals to public pages.");
  lines.push("");
  lines.push("## Source Files");
  lines.push("");
  for (const file of output.source_files) lines.push(`- ${file}`);
  lines.push("");
  lines.push("## Assignment Method");
  lines.push("");
  for (const rule of output.assignment_rules) lines.push(`- ${rule}`);
  lines.push("");
  lines.push("Assignments are approximate and intended for internal signal analysis only. They are not polygon boundaries.");
  lines.push("");
  lines.push("## Area Summary");
  lines.push("");
  lines.push("| Area | Raw buildings | Raw listings | High-confidence assignments | Top space types | Top sources | Published representative buildings |");
  lines.push("| --- | ---: | ---: | ---: | --- | --- | ---: |");
  for (const summary of output.area_summaries) {
    const rep = output.published_representative_comparison[summary.area_id];
    lines.push(`| ${summary.area_name} | ${summary.building_count} | ${summary.listing_count} | ${summary.assigned_building_confidence.high} | ${summary.space_type_counts.slice(0, 4).map((item) => `${item.key} ${item.count}`).join(", ") || "none"} | ${summary.source_counts.slice(0, 4).map((item) => `${item.key} ${item.count}`).join(", ") || "none"} | ${rep?.representative_building_count || 0} |`);
  }
  lines.push("");
  lines.push("## Published Representative Buildings vs Broader Raw Subset");
  lines.push("");
  for (const summary of output.area_summaries) {
    const rep = output.published_representative_comparison[summary.area_id];
    lines.push(`### ${summary.area_name}`);
    lines.push("");
    lines.push(`- Published representative buildings: ${rep?.representative_building_count || 0}`);
    lines.push(`- Published page signals: ${(rep?.page_signals || []).join(", ") || "none"}`);
    lines.push(`- Raw subset buildings: ${summary.building_count}`);
    lines.push(`- Raw subset listings: ${summary.listing_count}`);
    lines.push(`- Raw top space types: ${summary.space_type_counts.slice(0, 5).map((item) => `${item.key} (${item.count})`).join(", ") || "none"}`);
    lines.push(`- Raw top sources: ${summary.source_counts.slice(0, 5).map((item) => `${item.key} (${item.count})`).join(", ") || "none"}`);
    if (summary.source_bias_notes.length) {
      lines.push("- Source-bias notes:");
      for (const note of summary.source_bias_notes) lines.push(`  - ${note}`);
    }
    lines.push("");
  }
  lines.push("## Stronger Signals From Raw Subset");
  lines.push("");
  lines.push("These are internal extraction signals from the broader raw subset. They are stronger than representative-building-only signals, but they still need source-bias review before public use.");
  lines.push("");
  for (const summary of output.area_summaries) {
    const publicSignals = summary.extracted_signals.filter((signal) => signal.public_safe && signal.confidence !== "low");
    const patternSignals = summary.pattern_signals.filter((signal) => signal.public_safe_candidate && signal.confidence !== "low");
    lines.push(`### ${summary.area_name}`);
    if (!publicSignals.length && !patternSignals.length) {
      lines.push("");
      lines.push("- No high or medium public-safe raw text or pattern signals met the threshold.");
    } else {
      lines.push("");
      for (const signal of patternSignals) {
        lines.push(`- ${signal.label}: ${signal.confidence}. ${signal.evidence}`);
      }
      for (const signal of publicSignals) {
        lines.push(`- ${signal.key}: ${signal.confidence}. ${signal.count} matched listing descriptions or text samples across ${signal.source_count} sources.`);
      }
    }
    lines.push("");
  }
  lines.push("## Internal Only Signals");
  lines.push("");
  lines.push("These signals may be useful for analyst review but should not be shown publicly without manual review:");
  lines.push("");
  const internal = new Map();
  for (const summary of output.area_summaries) {
    for (const signal of summary.pattern_signals.filter((item) => item.internal_only)) {
      if (!internal.has(signal.key)) internal.set(signal.key, []);
      internal.get(signal.key).push(`${summary.area_name} (${signal.confidence}: ${signal.evidence})`);
    }
    for (const signal of summary.extracted_signals.filter((item) => item.internal_only)) {
      if (!internal.has(signal.key)) internal.set(signal.key, []);
      internal.get(signal.key).push(`${summary.area_name} (${signal.confidence})`);
    }
  }
  if (!internal.size) {
    lines.push("- No internal-only text signals met the extraction threshold.");
  } else {
    for (const [key, values] of internal.entries()) {
      lines.push(`- ${key}: ${values.join(", ")}`);
    }
  }
  lines.push("");
  lines.push("## Data Quality Warnings");
  lines.push("");
  lines.push("- Raw `rofo_listings.csv` does not include full listing descriptions. Rich text is available only from the sampled raw listing description extract in this repo.");
  lines.push("- Coordinate assignment is approximate and should not be treated as neighborhood boundary logic.");
  lines.push("- Source concentration can materially distort neighborhood identity. Executive suite feeds can overstate coworking, furnished, and small-office signals.");
  lines.push("- Rent fields are retained in the internal subset for analysis only and should not be surfaced publicly.");
  lines.push("- Listing rows are historical activity signals, not current availability.");
  lines.push("");
  lines.push("## Recommended Approach Going Forward");
  lines.push("");
  lines.push("1. Use broader raw building/listing subsets for extraction, not only published representative buildings.");
  lines.push("2. Keep representative buildings as display examples, not the only signal source.");
  lines.push("3. Score source diversity before promoting any public neighborhood signal.");
  lines.push("4. Keep address-fallback or centroid-only assignments internal until reviewed.");
  lines.push("5. Promote only durable, public-safe signals such as office orientation, retail context, industrial/flex context, freeway access, professional services, and creative office.");
  lines.push("6. Suppress furnished, plug-and-play, current parking, move-in-ready, rent, and suite-specific language.");
  lines.push("");
  return lines.join("\n");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
