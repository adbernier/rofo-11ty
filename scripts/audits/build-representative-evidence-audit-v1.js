const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "../..");
const RAW_LISTINGS_PATH = path.join(ROOT, "temp_data/raw-listings.json");
const OUTPUT_JSON_PATH = path.join(ROOT, "data/reports/representative-evidence-audit-v1.json");
const OUTPUT_MD_PATH = path.join(ROOT, "data/reports/representative-evidence-audit-v1.md");

const rawListings = JSON.parse(fs.readFileSync(RAW_LISTINGS_PATH, "utf8"));
const buildingPages = require(path.join(ROOT, "_data/buildingPages.js"));
const neighborhoodPages = require(path.join(ROOT, "_data/neighborhoodPages.js"));

const KEYWORDS = {
  office: [
    ["Class A", /\bclass\s*a\b/i],
    ["office", /\boffice\b/i],
    ["professional", /\bprofessional\b/i],
    ["headquarters", /\bheadquarters?\b|\bhq\b/i],
    ["creative office", /\bcreative\s+office\b/i],
    ["coworking", /\bcowork(?:ing)?\b/i],
    ["tenant improvements", /\btenant\s+improvements?\b|\bTI\b/i],
    ["medical office", /\bmedical\s+office\b|\bmedical\b/i],
  ],
  industrial: [
    ["warehouse", /\bwarehouse\b/i],
    ["distribution", /\bdistribution\b/i],
    ["dock-high", /\bdock[-\s]?high\b|\bdock\b/i],
    ["loading", /\bloading\b|\bloading\s+dock\b/i],
    ["truck court", /\btruck\s+court\b|\btruck\b/i],
    ["clear height", /\bclear\s+height\b/i],
    ["yard", /\byard\b/i],
    ["rail", /\brail\b/i],
    ["freezer", /\bfreezer\b/i],
    ["cold storage", /\bcold\s+storage\b/i],
    ["manufacturing", /\bmanufactur(?:ing|er)\b/i],
    ["industrial park", /\bindustrial\s+park\b/i],
    ["logistics", /\blogistics\b/i],
    ["port", /\bport\b/i],
    ["freeway access", /\bfreeway\b|\binterstate\b|\bhighway\b|\bi-\d+\b/i],
  ],
  life_science: [
    ["lab", /\blab\b|\blaboratory\b/i],
    ["wet lab", /\bwet\s+lab\b/i],
    ["life science", /\blife\s+science\b/i],
    ["biotech", /\bbiotech\b|\bbiotechnology\b/i],
    ["R&D", /\br&d\b|\bresearch\s+and\s+development\b/i],
    ["research", /\bresearch\b/i],
    ["clean room", /\bclean\s+room\b|\bcleanroom\b/i],
    ["GMP", /\bgmp\b/i],
    ["engineering", /\bengineering\b/i],
    ["innovation", /\binnovation\b/i],
  ],
  retail: [
    ["showroom", /\bshowroom\b/i],
    ["storefront", /\bstorefront\b/i],
    ["retail", /\bretail\b/i],
    ["restaurant", /\brestaurant\b/i],
    ["service retail", /\bservice\s+retail\b/i],
    ["mixed-use", /\bmixed[-\s]?use\b/i],
  ],
};

const TARGETS = [
  { name: "Long Island City", path: "/commercial-real-estate/NY/long-island-city/long-island-city/", city: "Long Island City", state: "NY", focus: ["office", "industrial", "retail"] },
  { name: "Energy Corridor", path: "/commercial-real-estate/TX/houston/energy-corridor/", city: "Houston", state: "TX", focus: ["office"], includeTerms: ["energy corridor", "katy freeway", "park row", "broadfield", "park ten", "eldridge", "dairy ashford"], excludeTerms: ["westchase"] },
  { name: "Round Rock", path: "/commercial-real-estate/TX/round-rock/round-rock/", city: "Round Rock", state: "TX", focus: ["office", "industrial"] },
  { name: "Downtown Oakland", path: "/commercial-real-estate/CA/oakland/downtown-oakland/", city: "Oakland", state: "CA", focus: ["office", "retail"], includeTerms: ["downtown oakland", "broadway", "harrison", "14th st", "kaiser", "city center", "franklin"], excludeTerms: ["jack london"] },
  { name: "The Domain", path: "/commercial-real-estate/TX/austin/the-domain/", city: "Austin", state: "TX", focus: ["office", "retail"], includeTerms: ["domain", "feathergrass", "stonelake", "boyer", "braker", "burnet"] },
  { name: "Chandler", path: "/commercial-real-estate/AZ/chandler/chandler/", city: "Chandler", state: "AZ", focus: ["office", "industrial", "life_science"] },
  { name: "Denver Tech Center", path: "/commercial-real-estate/CO/denver/denver-tech-center/", city: "Denver", state: "CO", focus: ["office"], includeTerms: ["denver tech center", "dtc", "syracuse", "ulster", "union", "belleview", "technology center"] },
  { name: "Downtown Palo Alto", path: "/commercial-real-estate/CA/palo-alto/downtown-palo-alto/", city: "Palo Alto", state: "CA", focus: ["office", "retail"], includeTerms: ["university ave", "hamilton", "lytton", "alma", "emerson", "ramona", "cowper", "waverley", "bryant", "high st"] },
  { name: "North San Jose", path: "/commercial-real-estate/CA/san-jose/north-san-jose/", city: "San Jose", state: "CA", focus: ["office", "industrial", "life_science"], includeTerms: ["north san jose", "zanker", "gateway", "brokaw", "trimble", "component", "charcot", "junction", "orchard", "river oaks", "montague"] },
  { name: "Commerce City", path: "/commercial-real-estate/CO/commerce-city/commerce-city/", city: "Commerce City", state: "CO", focus: ["industrial"] },
  { name: "Elizabeth Industrial", path: "/commercial-real-estate/NJ/elizabeth/elizabeth-industrial/", city: "Elizabeth", state: "NJ", focus: ["industrial"], includeTerms: ["elizabeth", "warehouse", "port", "airport", "industrial"] },
  { name: "Industry City / Sunset Park", path: "/commercial-real-estate/NY/new-york/industry-city-sunset-park/", city: "New York", state: "NY", focus: ["industrial", "office", "retail"], includeTerms: ["industry city", "sunset park"] },
  { name: "JFK Airport Area", path: "/commercial-real-estate/NY/new-york/jfk-airport-area/", city: "New York", state: "NY", focus: ["industrial"], includeTerms: ["jfk", "airport", "cargo", "freight", "jamaica", "rockaway", "conduit"], excludeTerms: ["john f kennedy pkwy", "john f. kennedy pkwy"] },
  { name: "Port Newark / Elizabeth", path: "/commercial-real-estate/NJ/newark/port-newark-elizabeth/", city: "Newark", state: "NJ", focus: ["industrial"], includeTerms: ["port newark", "port", "warehouse", "industrial", "logistics", "freight"], excludeTerms: ["gateway center"] },
];

function lower(value) {
  return String(value || "").toLowerCase();
}

function normalizeAddress(address) {
  return lower(address)
    .replace(/\b(suite|ste|unit|floor|fl)\b.*$/i, "")
    .replace(/[.,#]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function textFromListing(row) {
  return [
    row.name,
    row.address,
    row.city,
    row.property_description,
    row.space_description,
    row.raw_space_type,
    row.space_type,
    row.lease_category,
  ].filter(Boolean).join(" ");
}

function textFromBuilding(row) {
  return [
    row.name,
    row.display_name,
    row.address,
    row.city,
    row.teaser,
    row.building_description,
    row.about_context,
    row.common_fit,
    row.location_context,
    row.detail_summary,
    row.primary_space_type,
    row.type,
    ...(row.space_types || []),
    ...(row.raw_space_types || []),
  ].filter(Boolean).join(" ");
}

function hasAny(text, terms = []) {
  const value = lower(text);
  return terms.some((term) => value.includes(lower(term)));
}

function matchesTarget(target, row, textBuilder) {
  if (row.state_abbr !== target.state) return false;
  const text = textBuilder(row);
  if (hasAny(text, target.excludeTerms || [])) return false;
  const cityMatch = row.city === target.city;
  if (!target.includeTerms || !target.includeTerms.length) return cityMatch;
  const termMatch = hasAny(text, target.includeTerms);
  if (target.city === "New York" || target.city === "Newark") return cityMatch && termMatch;
  return cityMatch && termMatch;
}

function keywordSummary(rows, textBuilder, focus) {
  const text = rows.map(textBuilder).join(" ");
  const byCategory = {};
  const all = [];
  Object.entries(KEYWORDS).forEach(([category, definitions]) => {
    if (focus?.length && !focus.includes(category)) return;
    const matches = definitions
      .filter(([, regex]) => regex.test(text))
      .map(([label]) => label);
    if (matches.length) {
      byCategory[category] = matches;
      all.push(...matches);
    }
  });
  const unique = [...new Set(all)];
  return {
    keywords: unique,
    keyword_count: unique.length,
    categories: byCategory,
    richness: unique.length >= 8 ? "high" : unique.length >= 4 ? "medium" : unique.length >= 1 ? "low" : "none",
  };
}

function uniqueAddressCount(rows) {
  return new Set(rows.map((row) => normalizeAddress(row.address || row.name)).filter(Boolean)).size;
}

function topExamples(rows, textBuilder, limit = 5) {
  const grouped = new Map();
  rows.forEach((row) => {
    const key = normalizeAddress(row.address || row.name);
    if (!key) return;
    if (!grouped.has(key)) {
      grouped.set(key, {
        name: row.display_name || row.name || row.address,
        address: row.address || row.name,
        count: 0,
        path: row.building_path || null,
        text: "",
      });
    }
    const item = grouped.get(key);
    item.count += 1;
    item.path = item.path || row.building_path || null;
    item.text += ` ${textBuilder(row)}`;
  });
  return [...grouped.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
    .map((item) => ({
      name: item.name,
      address: item.address,
      count: item.count,
      path: item.path,
    }));
}

function reasonForThinness(target, listingRows, buildingRows, publicReferences, cardCount) {
  if (listingRows.length === 0 && buildingRows.length === 0) {
    return "No repo-accessible listings or building pages matched the district using current city and district-context filters.";
  }
  if (listingRows.length === 0) {
    return "Repo-accessible public building references exist, but listing-description evidence is missing or not district-addressable.";
  }
  if (uniqueAddressCount(listingRows) < 4) {
    return "Listing evidence is concentrated in too few unique addresses, usually repeated suite/provider rows rather than broad building coverage.";
  }
  if (publicReferences.length < 4 && buildingRows.length < 4) {
    return "Listing evidence exists, but public building/reference coverage is sparse for a publishable 10-15 card layer.";
  }
  if (cardCount >= 10) {
    return "Existing representative cards already provide depth; repo listings can supplement but are not the only evidence layer.";
  }
  return "Partial repo evidence exists, but it is not yet broad enough for a confident 10-15 representative card set.";
}

function classificationFor(metrics) {
  const usableEvidenceAddresses = new Set([
    ...metrics.listing_examples.map((item) => normalizeAddress(item.address)),
    ...metrics.building_examples.map((item) => normalizeAddress(item.address)),
  ].filter(Boolean)).size;
  if (
    metrics.raw_listing_unique_addresses >= 10 &&
    metrics.raw_building_evidence_count >= 10 &&
    metrics.listing_keyword_richness !== "none"
  ) {
    return "A";
  }
  if (
    metrics.current_representative_card_count >= 10 ||
    usableEvidenceAddresses >= 6 ||
    metrics.raw_listing_unique_addresses >= 4 ||
    metrics.raw_repo_building_evidence_count >= 4 ||
    metrics.available_public_building_reference_count >= 4 ||
    (metrics.raw_listing_unique_addresses >= 2 && metrics.available_public_building_reference_count >= 2)
  ) {
    return "B";
  }
  return "C";
}

function enoughForCards(metrics) {
  if (metrics.classification === "A") return true;
  if (metrics.current_representative_card_count >= 10) return true;
  return false;
}

function analyzeTarget(target) {
  const page = neighborhoodPages.find((item) => item.canonical_neighborhood_path === target.path);
  const representativeCards = page?.representative_building_cards || [];
  const publicReferences = page?.representative_buildings || page?.representative_building_paths || [];
  const listingRows = rawListings.filter((row) => matchesTarget(target, row, textFromListing));
  const buildingRows = buildingPages.filter((row) => matchesTarget(target, row, textFromBuilding));
  const listingKeywords = keywordSummary(listingRows, textFromListing, target.focus);
  const buildingKeywords = keywordSummary(buildingRows, textFromBuilding, target.focus);

  const metrics = {
    district_name: target.name,
    path: target.path,
    city: target.city,
    state: target.state,
    current_representative_card_count: representativeCards.length,
    available_public_building_reference_count: publicReferences.length,
    raw_repo_listing_evidence_count: listingRows.length,
    raw_listing_unique_addresses: uniqueAddressCount(listingRows),
    raw_repo_building_evidence_count: buildingRows.length,
    raw_building_unique_addresses: uniqueAddressCount(buildingRows),
    listing_keyword_richness: listingKeywords.richness,
    listing_keyword_count: listingKeywords.keyword_count,
    listing_keywords: listingKeywords.keywords,
    building_keyword_richness: buildingKeywords.richness,
    building_keyword_count: buildingKeywords.keyword_count,
    building_keywords: buildingKeywords.keywords,
    listing_examples: topExamples(listingRows, textFromListing),
    building_examples: topExamples(buildingRows, textFromBuilding),
  };

  metrics.likely_reason_evidence_is_thin = reasonForThinness(
    target,
    listingRows,
    buildingRows,
    publicReferences,
    representativeCards.length
  );
  metrics.classification = classificationFor(metrics);
  metrics.enough_repo_accessible_evidence_for_10_to_15_cards = enoughForCards(metrics);
  metrics.decision = metrics.classification === "A"
    ? "Can improve now from repo-accessible evidence."
    : metrics.classification === "B"
      ? "Partial improvement possible, but archive extraction or manual review is needed for a full card set."
      : "Requires AWS/archive extraction, better source integration, or external data before meaningful card expansion.";

  return metrics;
}

function writeMarkdown(results) {
  const counts = results.reduce((acc, item) => {
    acc[item.classification] = (acc[item.classification] || 0) + 1;
    return acc;
  }, {});
  const lines = [
    "# Representative Evidence Audit V1",
    "",
    "Scope: repo-accessible data only. This audit does not assume access to AWS archive volumes such as `listings3` or `buildings3`.",
    "",
    "Sources compared:",
    "",
    "- `temp_data/raw-listings.json`",
    "- `_data/buildingPages.js`",
    "- public representative building references on district pages",
    "- current representative building cards exposed through `_data/neighborhoodPages.js`",
    "",
    "Classification:",
    "",
    "- A = enough repo-accessible evidence exists",
    "- B = partial evidence exists, but needs archive data or manual review for a full 10-15 card layer",
    "- C = repo-accessible evidence is sparse",
    "",
    `Summary: A=${counts.A || 0}, B=${counts.B || 0}, C=${counts.C || 0}`,
    "",
    "| District | Class | Current cards | Public refs | Listing rows | Listing addresses | Building rows | Listing richness | Enough for 10-15? |",
    "| --- | --- | ---: | ---: | ---: | ---: | ---: | --- | --- |",
  ];

  results.forEach((item) => {
    lines.push(`| ${item.district_name} | ${item.classification} | ${item.current_representative_card_count} | ${item.available_public_building_reference_count} | ${item.raw_repo_listing_evidence_count} | ${item.raw_listing_unique_addresses} | ${item.raw_repo_building_evidence_count} | ${item.listing_keyword_richness} | ${item.enough_repo_accessible_evidence_for_10_to_15_cards ? "yes" : "no"} |`);
  });

  lines.push("", "## District Findings", "");
  results.forEach((item) => {
    lines.push(`### ${item.district_name}`);
    lines.push("");
    lines.push(`- Classification: ${item.classification}`);
    lines.push(`- Decision: ${item.decision}`);
    lines.push(`- Current representative cards: ${item.current_representative_card_count}`);
    lines.push(`- Public building references: ${item.available_public_building_reference_count}`);
    lines.push(`- Repo listing evidence: ${item.raw_repo_listing_evidence_count} rows across ${item.raw_listing_unique_addresses} unique addresses`);
    lines.push(`- Repo building evidence: ${item.raw_repo_building_evidence_count} rows across ${item.raw_building_unique_addresses} unique addresses`);
    lines.push(`- Listing keyword richness: ${item.listing_keyword_richness} (${item.listing_keywords.slice(0, 8).join(", ") || "none"})`);
    lines.push(`- Likely reason evidence is thin: ${item.likely_reason_evidence_is_thin}`);
    if (item.listing_examples.length) {
      lines.push("- Top listing examples:");
      item.listing_examples.slice(0, 3).forEach((example) => {
        lines.push(`  - ${example.name} — ${example.address} (${example.count} rows)`);
      });
    }
    if (item.building_examples.length) {
      lines.push("- Top public building examples:");
      item.building_examples.slice(0, 3).forEach((example) => {
        lines.push(`  - ${example.name} — ${example.address}`);
      });
    }
    lines.push("");
  });

  const byDecision = {
    canImproveNow: results.filter((item) => item.classification === "A" || item.enough_repo_accessible_evidence_for_10_to_15_cards),
    partialNeedsArchive: results.filter((item) => item.classification === "B" && !item.enough_repo_accessible_evidence_for_10_to_15_cards),
    requiresArchive: results.filter((item) => item.classification === "C"),
  };

  lines.push("## Decision Roadmap", "");
  lines.push(`- Improve now: ${byDecision.canImproveNow.map((item) => item.district_name).join(", ") || "none"}`);
  lines.push(`- Partial, archive/manual review needed: ${byDecision.partialNeedsArchive.map((item) => item.district_name).join(", ") || "none"}`);
  lines.push(`- Sparse repo evidence, archive/external sources needed: ${byDecision.requiresArchive.map((item) => item.district_name).join(", ") || "none"}`);
  lines.push("");

  return lines.join("\n");
}

function main() {
  const results = TARGETS.map(analyzeTarget);
  fs.mkdirSync(path.dirname(OUTPUT_JSON_PATH), { recursive: true });
  fs.writeFileSync(
    OUTPUT_JSON_PATH,
    JSON.stringify({
      generated_at: new Date().toISOString(),
      source_scope: "repo_accessible_only",
      sources: [
        "temp_data/raw-listings.json",
        "_data/buildingPages.js",
        "_data/neighborhoodPages.js",
      ],
      results,
    }, null, 2)
  );
  fs.writeFileSync(OUTPUT_MD_PATH, writeMarkdown(results));
  console.log(`Wrote ${OUTPUT_JSON_PATH}`);
  console.log(`Wrote ${OUTPUT_MD_PATH}`);
}

main();
