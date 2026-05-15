const fs = require("fs");
const path = require("path");
const readline = require("readline");

const ROOT = path.resolve(__dirname, "../..");
const SUBSET_PATH = path.join(ROOT, "data/peter/research/atlanta_building_listing_subset_v1.json");
const USERS_PATH = path.join(ROOT, "data/peter/raw/rofo_users.csv");
const BROKER_HOUSES_PATH = path.join(ROOT, "data/peter/raw/rofo_broker_houses.csv");
const BUILDINGS_PATH = path.join(ROOT, "data/peter/raw/rofo_buildings.csv");
const RELATIONSHIPS_PATH = path.join(ROOT, "data/peter/raw/rofo_relationships_listing_buildings.csv");
const OUTPUT_PATH = path.join(ROOT, "data/peter/atlanta/lineage/atlanta_lineage_objects.json");

function parseCsvLine(line) {
  const values = [];
  let value = "";
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];

    if (char === '"' && quoted && next === '"') {
      value += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      values.push(value);
      value = "";
    } else {
      value += char;
    }
  }

  values.push(value);
  return values;
}

function rowFromValues(headers, values) {
  const row = {};
  headers.forEach((header, index) => {
    row[header] = values[index] ?? "";
  });
  return row;
}

async function streamCsv(filePath, onRow) {
  const stream = fs.createReadStream(filePath);
  const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });
  let headers = null;

  for await (const line of rl) {
    if (!headers) {
      headers = parseCsvLine(line);
      continue;
    }
    if (!line.trim()) continue;
    await onRow(rowFromValues(headers, parseCsvLine(line)));
  }
}

function cleanText(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim();
}

function emptyToNull(value) {
  const cleaned = cleanText(value);
  return cleaned ? cleaned : null;
}

function normalizeCompanyName(value) {
  const cleaned = cleanText(value)
    .replace(/\b(llc|inc|inc\.|corp|corp\.|corporation|co|co\.|ltd|ltd\.)\b/gi, "")
    .replace(/[,&]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!cleaned) return null;

  const known = [
    [/regus|iwg|spaces|hq global|signature by regus/i, "Regus / IWG"],
    [/wework/i, "WeWork"],
    [/boxer/i, "Boxer Property"],
    [/abbey/i, "Abbey Company"],
    [/servcorp/i, "Servcorp"],
    [/expansive/i, "Expansive"],
    [/carr workplaces/i, "Carr Workplaces"],
  ];

  for (const [pattern, normalized] of known) {
    if (pattern.test(cleaned)) return normalized;
  }

  return cleaned
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function isNeutralIngestionOrigin(value) {
  return /^lms$/i.test(cleanText(value));
}

function normalizeFeedGroup(value) {
  const cleaned = cleanText(value);
  if (!cleaned || isNeutralIngestionOrigin(cleaned)) return null;
  return normalizeCompanyName(cleaned);
}

function organizationFromContactName(value) {
  const cleaned = cleanText(value);
  if (!cleaned) return null;

  const organizationPattern =
    /\b(property|properties|realty|real estate|commercial|capital|partners|group|company|companies|management|brokerage|advisors|advisory|associates|leasing|office|spaces|workplaces|regus|boxer|highwoods|cbre|jll|cushman|colliers|savills|lee & associates|nai|avison young|newmark|transwestern)\b/i;

  if (!organizationPattern.test(cleaned)) return null;
  return normalizeCompanyName(cleaned);
}

function uniqueValues(values) {
  return Array.from(new Set(values.filter(Boolean)));
}

function normalizeNeighborhood(value) {
  const cleaned = cleanText(value);
  const labels = {
    "downtown atlanta": "Downtown Atlanta",
    midtown: "Midtown",
    buckhead: "Buckhead",
    "perimeter center": "Perimeter Center",
    "west midtown": "West Midtown",
  };
  return labels[cleaned.toLowerCase()] || cleaned || null;
}

function identifyPortfolioGroup(values) {
  const haystack = values.filter(Boolean).join(" ").toLowerCase();
  const groups = [
    [/regus|iwg|spaces|hq global|signature by regus/, "coworking_operator"],
    [/wework|servcorp|expansive|carr workplaces/, "coworking_operator"],
    [/boxer/, "boxer_property"],
    [/abbey/, "abbey_company"],
    [/highwoods/, "highwoods"],
  ];

  for (const [pattern, group] of groups) {
    if (pattern.test(haystack)) return group;
  }

  return null;
}

function assignmentReasons(building) {
  const reasons = [];
  if (building.assignment_method) reasons.push(building.assignment_method);
  if (building.distance_km !== null && building.distance_km !== undefined) {
    reasons.push(`distance_to_reviewed_centroid:${building.distance_km}km`);
  }
  if (building.latitude && building.longitude) reasons.push("building_coordinates_available");
  if (building.area_id) reasons.push(`reviewed_area:${building.area_id}`);
  return reasons;
}

async function loadUsers(userIds) {
  const users = new Map();
  await streamCsv(USERS_PATH, (row) => {
    if (!userIds.has(row.user_id)) return;
    users.set(row.user_id, {
      user_id: row.user_id,
      name: emptyToNull(row.name),
      email: emptyToNull(row.email),
      phone: emptyToNull(row.phone),
      company: normalizeCompanyName(row.company),
      raw_company: emptyToNull(row.company),
    });
  });
  return users;
}

async function loadBrokerHouses(brokerHouseIds) {
  const brokerHouses = new Map();
  await streamCsv(BROKER_HOUSES_PATH, (row) => {
    if (!brokerHouseIds.has(row.broker_house_id)) return;
    brokerHouses.set(row.broker_house_id, {
      broker_house_id: row.broker_house_id,
      company: normalizeCompanyName(row.company),
      raw_company: emptyToNull(row.company),
    });
  });
  return brokerHouses;
}

async function loadBuildingBrokerHouseIds(buildingIds) {
  const buildingBrokerHouseIds = new Map();
  const brokerHouseIds = new Set();
  await streamCsv(BUILDINGS_PATH, (row) => {
    if (!buildingIds.has(row.building_id)) return;
    const brokerHouseId = emptyToNull(row.broker_house_id);
    if (!brokerHouseId) return;
    buildingBrokerHouseIds.set(row.building_id, brokerHouseId);
    brokerHouseIds.add(brokerHouseId);
  });
  return { buildingBrokerHouseIds, brokerHouseIds };
}

async function loadRelationshipContacts(listingIds) {
  const listingContacts = new Map();
  const userIds = new Set();
  await streamCsv(RELATIONSHIPS_PATH, (row) => {
    if (!listingIds.has(row.listing_id)) return;
    const contactUserId = emptyToNull(row.contact_user_id);
    if (!contactUserId) return;
    if (!listingContacts.has(row.listing_id)) listingContacts.set(row.listing_id, contactUserId);
    userIds.add(contactUserId);
  });
  return { listingContacts, userIds };
}

async function main() {
  const subset = JSON.parse(fs.readFileSync(SUBSET_PATH, "utf8"));
  const buildingIds = new Set();
  const listingIds = new Set();
  const buildingsById = new Map();

  for (const building of subset.buildings || []) {
    buildingIds.add(building.building_id);
    buildingsById.set(building.building_id, building);
    for (const listing of building.listings || []) {
      if (listing.listing_id) listingIds.add(listing.listing_id);
    }
  }

  const { listingContacts, userIds } = await loadRelationshipContacts(listingIds);
  const users = await loadUsers(userIds);
  const { buildingBrokerHouseIds, brokerHouseIds } = await loadBuildingBrokerHouseIds(buildingIds);
  const brokerHouses = await loadBrokerHouses(brokerHouseIds);

  const objects = [];
  const seenListingBuildingPairs = new Set();
  let duplicateRowsSuppressed = 0;

  for (const building of subset.buildings || []) {
    const brokerHouseId = buildingBrokerHouseIds.get(building.building_id);
    const brokerHouse = brokerHouses.get(brokerHouseId);
    const listings = building.listings || [];

    for (const listing of listings) {
      const dedupeKey = `${listing.listing_id || "missing"}:${building.building_id}`;
      if (seenListingBuildingPairs.has(dedupeKey)) {
        duplicateRowsSuppressed += 1;
        continue;
      }
      seenListingBuildingPairs.add(dedupeKey);

      const contactUserId = listingContacts.get(listing.listing_id);
      const contact = users.get(contactUserId);
      const normalizedBrokerage = brokerHouse?.company || null;
      const contactOrganization = organizationFromContactName(contact?.name);
      const feedGroup = normalizeFeedGroup(listing.source);
      const listingCompany = contact?.company || contactOrganization || null;
      const originCompany = listingCompany || normalizedBrokerage || feedGroup || null;
      const portfolioGroup = identifyPortfolioGroup([
        originCompany,
        listingCompany,
        normalizedBrokerage,
        feedGroup,
        contact?.raw_company,
        brokerHouse?.raw_company,
        listing.source,
        building.building_name,
      ]);
      const provenanceEntities = uniqueValues([
        originCompany,
        listingCompany,
        normalizedBrokerage,
        portfolioGroup,
        feedGroup,
      ]);

      objects.push({
        listing_id: listing.listing_id || null,
        building_id: building.building_id || null,
        building_name: emptyToNull(building.building_name),
        address: emptyToNull(building.address),
        neighborhood: normalizeNeighborhood(building.area_name),
        assigned_neighborhood: normalizeNeighborhood(building.area_name),
        commercial_area_id: emptyToNull(building.area_id),
        assignment_confidence: emptyToNull(building.assignment_confidence),
        assignment_reasons: assignmentReasons(building),
        company: originCompany,
        company_raw: contact?.raw_company || brokerHouse?.raw_company || null,
        origin_company: originCompany,
        listing_company: listingCompany,
        landlord_company: null,
        broker_company: normalizedBrokerage,
        brokerage_company: normalizedBrokerage,
        brokerage: normalizedBrokerage,
        listing_contact: contact
          ? {
              user_id: contact.user_id,
              name: contact.name,
              email: contact.email,
              phone: contact.phone,
            }
          : null,
        portfolio_group: portfolioGroup,
        feed_group: feedGroup,
        provenance_entities: provenanceEntities,
        space_type: emptyToNull(listing.decoded_space_type),
        raw_space_type_code: emptyToNull(listing.space_type_code),
        listing_type: emptyToNull(listing.listing_type),
        ingestion_origin: emptyToNull(listing.source),
        source_origin: feedGroup,
        latitude: building.latitude || null,
        longitude: building.longitude || null,
        square_footage: listing.square_footage || null,
        rent_fields_internal: {
          price_selection: emptyToNull(listing.price_selection),
          price_type: emptyToNull(listing.price_type),
          price_sqft: emptyToNull(listing.price_sqft),
          sqft_price: emptyToNull(listing.sqft_price),
        },
        status: emptyToNull(listing.status),
        created_at: emptyToNull(listing.created_at),
        updated_at: emptyToNull(listing.updated_at),
        description_excerpt: emptyToNull(listing.description_excerpt),
        detected_text_signals: listing.detected_text_signals || [],
      });
    }
  }

  const output = {
    version: "atlanta-lineage-v1",
    generated_at: new Date().toISOString(),
    source_files: [
      "data/peter/research/atlanta_building_listing_subset_v1.json",
      "data/peter/raw/rofo_relationships_listing_buildings.csv",
      "data/peter/raw/rofo_users.csv",
      "data/peter/raw/rofo_buildings.csv",
      "data/peter/raw/rofo_broker_houses.csv",
    ],
    notes: [
      "Lineage objects are internal provenance records for Atlanta neighborhood intelligence.",
      "LMS is Rofo's internal listing management system and is represented as ingestion_origin, not as a single external source.",
      "True provenance diversity should be read from origin_company, listing_company, broker_company, portfolio_group, feed_group, listing_contact, and provenance_entities.",
      "Rent fields are retained for internal review only and must not be surfaced publicly.",
      "Neighborhood assignment is approximate and based on reviewed commercial area centroids from the Atlanta raw subset.",
    ],
    counts: {
      subset_buildings: subset.buildings?.length || 0,
      subset_listing_rows: Array.from(subset.buildings || []).reduce((sum, building) => sum + (building.listings?.length || 0), 0),
      lineage_objects: objects.length,
      duplicate_rows_suppressed: duplicateRowsSuppressed,
      unique_buildings: new Set(objects.map((item) => item.building_id).filter(Boolean)).size,
      unique_listings: new Set(objects.map((item) => item.listing_id).filter(Boolean)).size,
      matched_listing_contacts: objects.filter((item) => item.listing_contact).length,
      matched_brokerages: objects.filter((item) => item.brokerage).length,
      matched_origin_companies: objects.filter((item) => item.origin_company).length,
      lms_ingestion_rows: objects.filter((item) => item.ingestion_origin === "LMS").length,
      coworking_operator_rows: objects.filter((item) => item.portfolio_group === "coworking_operator").length,
    },
    objects,
  };

  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, `${JSON.stringify(output, null, 2)}\n`);
  console.log(`Wrote ${OUTPUT_PATH}`);
  console.log(`Lineage objects: ${objects.length}`);
  console.log(`Unique buildings: ${output.counts.unique_buildings}`);
  console.log(`Matched contacts: ${output.counts.matched_listing_contacts}`);
  console.log(`Matched brokerages: ${output.counts.matched_brokerages}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
