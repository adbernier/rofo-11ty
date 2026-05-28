#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const OUTPUT_DIR = path.join(ROOT, "data", "district-building-candidates", "reviews");

const UNIVERSE_PATH = path.join(ROOT, "data", "media", "generated", "district_building_universe_v1.json");
const CANDIDATE_PATH = path.join(ROOT, "data", "district-building-candidates", "soma.json");
const AUDIT_PATH = path.join(ROOT, "data", "district-building-candidates", "audits", "coverage-summary.json");
const BUILDING_PAGES_PATH = path.join(ROOT, "_data", "buildingPages.js");

const SHORTLIST = [
  {
    address: "144 2nd St",
    role: "Converted warehouse / creative office",
    subarea: "2nd Street transition",
    status: "flagship_representative",
    why: "Compact older commercial fabric with strong historical listing signal and original-image coverage; useful as a primary example of SoMa's adaptive office texture near the downtown edge.",
    cautions: ["No current public building page in the local buildingPages data.", "Needs human image review before use."],
  },
  {
    address: "156 2nd St",
    role: "Converted warehouse / creative office",
    subarea: "2nd Street transition",
    status: "flagship_representative",
    why: "Pairs naturally with 144 2nd St and reinforces the smaller-grain creative-office pattern that differentiates SoMa from the Financial District.",
    cautions: ["No current public building page in the local buildingPages data.", "Likely duplicate-cluster review needed with nearby 2nd Street records."],
  },
  {
    address: "414 Brannan St",
    role: "South Park creative office cluster",
    subarea: "South Park / Brannan",
    status: "flagship_representative",
    why: "Strong image support, high-confidence South Park assignment, and Brannan Street location make it one of the cleanest examples of SoMa's warehouse-office district form.",
    cautions: ["Missing public/enriched description.", "Needs manual confirmation of exterior image quality."],
  },
  {
    address: "334 Brannan St",
    role: "South Park creative office cluster",
    subarea: "South Park / Brannan",
    status: "strong_supporting_representative",
    why: "High historical activity and representative seed signal; helps explain the Brannan/South Park commercial cluster even though image support is not yet known.",
    cautions: ["No known image signal in current generated indexes.", "Missing public/enriched description."],
  },
  {
    address: "330 Townsend St",
    role: "Townsend corridor office",
    subarea: "Townsend corridor",
    status: "strong_supporting_representative",
    why: "Very high historical listing activity and a clear Townsend corridor address; useful for explaining SoMa's larger office/warehouse corridor south of the central blocks.",
    cautions: ["No known original-image coverage.", "High listing count must not be interpreted as current availability."],
  },
  {
    address: "600 Townsend St",
    role: "Townsend corridor office",
    subarea: "Townsend / Mission Bay edge",
    status: "strong_supporting_representative",
    why: "Image-supported public-page candidate on the SoMa-to-Mission Bay edge; helps show the shift from older SoMa fabric toward newer southern commercial geography.",
    cautions: ["Thin public description.", "Edge assignment overlaps with Mission Bay context."],
  },
  {
    address: "460 Townsend St",
    role: "Flex / production-commercial edge",
    subarea: "Townsend corridor",
    status: "strong_supporting_representative",
    why: "Industrial/flex public-page signal that helps keep SoMa from reading as only office; useful for production-commercial and service-commercial texture.",
    cautions: ["No known image signal.", "Needs manual check that building form is district-representative rather than a thin listing artifact."],
  },
  {
    address: "699 2nd St",
    role: "China Basin edge commercial",
    subarea: "China Basin / 2nd Street edge",
    status: "strong_supporting_representative",
    why: "Image-supported seed near the China Basin edge; useful for showing SoMa's transition toward waterfront, ballpark, and Mission Bay-adjacent commercial geography.",
    cautions: ["Missing public/enriched description.", "Needs manual review because edge geography can drift into Mission Bay/China Basin."],
  },
  {
    address: "689 3rd St",
    role: "China Basin edge commercial",
    subarea: "China Basin / 3rd Street edge",
    status: "strong_supporting_representative",
    why: "Original-image coverage and named-building signal make it a good candidate for the larger block scale around 3rd Street and the southern/eastern edge of SoMa.",
    cautions: ["Missing public/enriched description.", "May need naming normalization against Paramount Building."],
  },
  {
    address: "640 2nd St",
    role: "China Basin edge commercial",
    subarea: "China Basin / 2nd Street edge",
    status: "possible_supporting_representative",
    why: "Helps fill the southern 2nd Street pattern and gives a bridge between South Park and China Basin edge conditions.",
    cautions: ["No known image signal.", "Missing public/enriched description."],
  },
  {
    address: "118 King St",
    role: "China Basin edge commercial",
    subarea: "King Street / ballpark edge",
    status: "possible_supporting_representative",
    why: "Useful for explaining the King Street edge and SoMa's relationship to larger event, waterfront, and Mission Bay-adjacent blocks.",
    cautions: ["No known image signal.", "Needs manual check because this edge can read more China Basin than core SoMa."],
  },
  {
    address: "250 King St",
    role: "Large modern office insertion",
    subarea: "King Street / China Basin edge",
    status: "possible_supporting_representative",
    why: "High historical activity along the King Street edge; can help show larger modern office form inside SoMa's broader mixed commercial geography.",
    cautions: ["No known image signal.", "Should be framed as district form, not availability."],
  },
  {
    address: "185 Berry St",
    role: "Large modern office insertion",
    subarea: "China Basin edge",
    status: "possible_supporting_representative",
    why: "Represents larger contemporary office blocks around the ballpark/China Basin edge and contrasts with smaller converted buildings farther north.",
    cautions: ["No known image signal.", "Could feel generic if not paired with adaptive/warehouse examples."],
  },
  {
    address: "303 2nd St",
    role: "2nd/3rd Street transition",
    subarea: "2nd Street transition",
    status: "possible_supporting_representative",
    why: "Supports the north-south 2nd Street commercial sequence and helps explain SoMa's transition from downtown-adjacent office into older mixed commercial blocks.",
    cautions: ["No known image signal.", "Missing public/enriched description."],
  },
  {
    address: "425 2nd St",
    role: "2nd/3rd Street transition",
    subarea: "2nd Street transition",
    status: "possible_supporting_representative",
    why: "Adds depth to the 2nd Street corridor and helps represent the mid-block commercial rhythm between Market Street and the southern warehouse areas.",
    cautions: ["No known image signal.", "Missing public/enriched description."],
  },
  {
    address: "215 2nd St",
    role: "2nd/3rd Street transition",
    subarea: "2nd Street transition",
    status: "possible_supporting_representative",
    why: "Useful as a supporting corridor candidate with representative seed signal, especially if imagery or better description can be recovered.",
    cautions: ["No known image signal.", "Missing public/enriched description."],
  },
  {
    address: "390 4th St",
    role: "Central SoMa commercial block",
    subarea: "Central SoMa / 4th Street",
    status: "possible_supporting_representative",
    why: "Helps represent central SoMa away from the 2nd Street/South Park concentration and gives the shortlist more geographic balance.",
    cautions: ["No known image signal.", "Missing public/enriched description."],
  },
  {
    address: "370 4th St",
    role: "Central SoMa commercial block",
    subarea: "Central SoMa / 4th Street",
    status: "possible_supporting_representative",
    why: "Image-supported central SoMa candidate that can help show the district's everyday mid-block commercial fabric.",
    cautions: ["Low historical listing signal.", "Missing public/enriched description."],
  },
  {
    address: "355 Bryant St",
    role: "Design-forward office conversion",
    subarea: "Bryant / South Park edge",
    status: "possible_supporting_representative",
    why: "Original-image coverage and Bryant Street location make it useful for the design/warehouse corridor side of SoMa.",
    cautions: ["Low historical listing signal.", "Missing public/enriched description."],
  },
  {
    address: "145 9th St",
    role: "Western SoMa adaptive commercial",
    subarea: "Western SoMa / 9th Street",
    status: "strong_supporting_representative",
    why: "Largest original-image signal in the SoMa universe and useful for expanding representation west of the central/South Park cluster.",
    cautions: ["Missing public/enriched description.", "Needs manual review because the current association is proximity-led."],
  },
  {
    address: "146 11th St",
    role: "Design/warehouse corridor",
    subarea: "Western SoMa / 11th Street",
    status: "possible_supporting_representative",
    why: "Image-supported western SoMa candidate that may help explain the district's production-commercial and warehouse edge.",
    cautions: ["Low historical listing signal.", "Proximity-led association requires manual boundary review."],
  },
  {
    address: "795 Folsom St",
    role: "Transit-adjacent office",
    subarea: "Central SoMa / Folsom",
    status: "strong_supporting_representative",
    why: "Current public representative and reviewed relationship seed; useful as a known public anchor even though it is provider/listing flavored.",
    cautions: ["No known image signal.", "Name/source has coworking/provider artifact risk."],
  },
  {
    address: "875 Howard St",
    role: "Central SoMa commercial block",
    subarea: "Central SoMa / Howard",
    status: "possible_supporting_representative",
    why: "Adds a Howard Street central-SoMa candidate with historical activity and representative seed signal.",
    cautions: ["No known image signal.", "Missing public/enriched description."],
  },
  {
    address: "1045 Mission St",
    role: "Market/Mission transition retail-commercial",
    subarea: "Market/Mission edge",
    status: "internal_only",
    why: "Useful for understanding the northern Mission/Market edge, but less clearly representative of SoMa's core warehouse-office identity.",
    cautions: ["Public commercial-area assignment points to Civic Center.", "Retail listing language risks feeling generic."],
  },
  {
    address: "545 Folsom St",
    role: "Central SoMa street-level commercial",
    subarea: "Folsom / downtown edge",
    status: "internal_only",
    why: "Can help explain Folsom Street street-level commercial texture, but current public assignment points outside SoMa.",
    cautions: ["Commercial-area assignment points to Financial District.", "No known image signal."],
  },
  {
    address: "565 4th St",
    role: "Central SoMa street-level commercial",
    subarea: "Central SoMa / 4th Street",
    status: "internal_only",
    why: "Adds everyday street-level commercial fabric on 4th Street, useful as internal context even if not a strong public representative.",
    cautions: ["Retail-oriented public page may be too thin/generic.", "No known image signal."],
  },
  {
    address: "95 Third Street",
    role: "Transit-adjacent office",
    subarea: "3rd Street / Yerba Buena edge",
    status: "internal_only",
    why: "Helps map the northern 3rd Street edge, but the provider/source flavor may make it weak as a public district-form example.",
    cautions: ["Potential coworking/provider artifact.", "May read more Yerba Buena/downtown edge than SoMa core."],
  },
  {
    address: "609 Mission St",
    role: "Downtown edge office insertion",
    subarea: "Mission Street / downtown edge",
    status: "internal_only",
    why: "Image-supported edge candidate, useful for understanding how SoMa meets the downtown office core.",
    cautions: ["Likely downtown/Yerba Buena edge rather than core SoMa.", "Low historical listing signal."],
  },
  {
    address: "525 6th St",
    role: "Central SoMa commercial block",
    subarea: "Central SoMa / 6th Street",
    status: "possible_supporting_representative",
    why: "Image-supported central/western SoMa candidate that broadens the shortlist beyond the 2nd/3rd Street cluster.",
    cautions: ["Low historical listing signal.", "Needs manual exterior review."],
  },
  {
    address: "650 Townsend St",
    role: "Townsend corridor office",
    subarea: "Townsend corridor",
    status: "possible_supporting_representative",
    why: "Townsend address with meaningful historical listing activity; helpful for reinforcing the southern office/warehouse corridor.",
    cautions: ["No known image signal.", "Needs manual confirmation of building form and boundary fit."],
  },
];

function readJson(filePath, fallback = {}) {
  if (!fs.existsSync(filePath)) return fallback;
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function clean(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function addressKey(value) {
  return clean(value).toLowerCase().replace(/\bstreet\b/g, "st").replace(/\s+/g, " ");
}

function descriptionQuality(text) {
  const length = clean(text).length;
  if (length >= 220) return "rich";
  if (length >= 80) return "usable";
  if (length > 0) return "thin";
  return "missing";
}

function pageDescription(page) {
  return clean([page?.building_description, page?.teaser, page?.about_context, page?.location_context].join(" "));
}

function formatImageAvailability(universe, candidate) {
  if (universe?.original_image_count) return `original_image_index:${universe.original_image_count}`;
  if (candidate?.image_availability && candidate.image_availability !== "none_known") return candidate.image_availability;
  return "none_known";
}

function imageCountFromAvailability(value) {
  const match = clean(value).match(/original_image_index:([0-9]+)/);
  return match ? Number(match[1]) : 0;
}

function betterUniverseRow(existing, incoming) {
  if (!existing) return incoming;
  if ((incoming.original_image_count || 0) !== (existing.original_image_count || 0)) {
    return (incoming.original_image_count || 0) > (existing.original_image_count || 0) ? incoming : existing;
  }
  if (Number(incoming.representative_building_seed) !== Number(existing.representative_building_seed)) {
    return incoming.representative_building_seed ? incoming : existing;
  }
  if ((incoming.historical_listing_count || 0) !== (existing.historical_listing_count || 0)) {
    return (incoming.historical_listing_count || 0) > (existing.historical_listing_count || 0) ? incoming : existing;
  }
  return existing;
}

function statusCounts(items) {
  return items.reduce((counts, item) => {
    counts[item.recommended_public_status] = (counts[item.recommended_public_status] || 0) + 1;
    return counts;
  }, {});
}

function clusterCounts(items) {
  return items.reduce((counts, item) => {
    counts[item.likely_district_subarea] = (counts[item.likely_district_subarea] || 0) + 1;
    return counts;
  }, {});
}

function buildShortlist() {
  const universe = readJson(UNIVERSE_PATH, {});
  const candidates = readJson(CANDIDATE_PATH, { candidates: [] });
  const audit = readJson(AUDIT_PATH, { districts: [] });
  const buildingPages = require(BUILDING_PAGES_PATH);

  const universeRows = universe.districts?.soma?.buildings || [];
  const universeByAddress = new Map();
  for (const item of universeRows) {
    const key = addressKey(item.address);
    universeByAddress.set(key, betterUniverseRow(universeByAddress.get(key), item));
  }
  const candidateByAddress = new Map(candidates.candidates.map((item) => [addressKey(item.address), item]));
  const pageByAddress = new Map(buildingPages.filter((item) => item.city === "San Francisco").map((item) => [addressKey(item.address), item]));

  const shortlist = SHORTLIST.map((entry) => {
    const universeItem = universeByAddress.get(addressKey(entry.address));
    const candidate = candidateByAddress.get(addressKey(entry.address));
    const page = pageByAddress.get(addressKey(entry.address));
    const canonical = candidate?.canonical_building_path || universeItem?.canonical_building_path || page?.building_path || "";
    const historical = universeItem?.historical_listing_count || Number(clean((candidate?.listing_history_signal || "").match(/[0-9]+/)?.[0])) || 0;
    const pageText = pageDescription(page);
    const sourceLayers = [...new Set([...(universeItem?.source_layers || []), ...(candidate?.source_type || [])])];
    const imageAvailability = formatImageAvailability(universeItem, candidate);
    const originalImageCount = universeItem?.original_image_count || imageCountFromAvailability(imageAvailability);
    const cautions = [...entry.cautions];

    if (sourceLayers.includes("lat_lng_proximity") && !sourceLayers.includes("bay_area_neighborhood_assignment")) {
      cautions.push("District association is proximity-led and needs manual boundary review.");
    }
    if (!page) cautions.push("No existing public building page found in _data/buildingPages.js.");
    if (!originalImageCount) cautions.push("No original-image signal found in current generated indexes.");

    return {
      name: clean(universeItem?.building_name || candidate?.name || page?.name || entry.address),
      address: entry.address,
      canonical_building_path: canonical,
      image_availability: imageAvailability,
      original_image_count: originalImageCount,
      public_page_status: page ? "public_building_page_exists" : "no_public_building_page_found",
      likely_representative_role: entry.role,
      likely_district_subarea: entry.subarea,
      historical_listing_signal: historical ? `${historical} historical listing signal(s)` : "",
      source_layers: sourceLayers,
      public_metadata_quality: page ? descriptionQuality(pageText) : "missing",
      why_it_helps_explain_soma: entry.why,
      risks_cautions: [...new Set(cautions)],
      recommended_public_status: entry.status,
    };
  });

  const auditSoma = audit.districts?.find((item) => item.district?.slug === "soma") || {};
  return {
    generated_at: new Date().toISOString(),
    purpose: "Internal editorial shortlist for SoMa representative building review. Not a publishing queue and not a listings feed.",
    guardrails: [
      "Do not imply current availability.",
      "Do not publish directly from this file.",
      "Use candidates to explain district form, not to create a listing grid.",
      "Manual editorial and image review remains required before public use.",
    ],
    source_files: [
      "data/media/generated/district_building_universe_v1.json",
      "data/district-building-candidates/soma.json",
      "data/district-building-candidates/audits/coverage-summary.json",
      "_data/buildingPages.js",
    ],
    district: {
      slug: "soma",
      name: "SoMa",
      city: "San Francisco",
      state: "CA",
    },
    source_context: {
      unique_candidate_buildings_from_audit: auditSoma.raw_coverage_metrics?.unique_building_candidates || null,
      universe_buildings: auditSoma.raw_coverage_metrics?.raw_building_associations_from_universe || universeRows.length,
      legacy_listing_rows: auditSoma.raw_coverage_metrics?.raw_listing_rows_from_legacy_csv_by_building_id || null,
      buildings_with_original_images: auditSoma.raw_coverage_metrics?.records_with_original_images || null,
      original_image_count: auditSoma.raw_coverage_metrics?.original_image_count_from_universe || null,
      prior_candidate_file_rows: candidates.candidates.length,
      prior_strong_public_candidates: candidates.counts?.strong_public_candidates || null,
    },
    counts: {
      shortlist_candidates: shortlist.length,
      by_recommended_public_status: statusCounts(shortlist),
      by_subarea: clusterCounts(shortlist),
      with_original_images: shortlist.filter((item) => item.original_image_count > 0).length,
      with_public_building_page: shortlist.filter((item) => item.public_page_status === "public_building_page_exists").length,
    },
    strongest_clusters: [
      {
        cluster: "2nd/3rd Street transitions",
        reason: "Best concentration of adaptive office, high historical activity, and several original-image candidates.",
      },
      {
        cluster: "South Park / Brannan",
        reason: "Most legible warehouse-office and creative-commercial fabric, with 414 Brannan especially strong for imagery and district assignment.",
      },
      {
        cluster: "Townsend corridor",
        reason: "Strongest high-activity corridor for larger office/warehouse form, though image support is uneven.",
      },
      {
        cluster: "China Basin / King Street edge",
        reason: "Important edge condition showing SoMa's transition toward Mission Bay, waterfront, and larger modern office blocks.",
      },
      {
        cluster: "Western/Central SoMa",
        reason: "Useful for geographic balance and production-commercial texture, but public metadata is thinner.",
      },
    ],
    editorial_findings: {
      strongest_archetypes: [
        "Converted warehouse / creative office",
        "South Park creative office cluster",
        "Townsend corridor office",
        "China Basin edge commercial",
        "Central SoMa mid-block commercial fabric",
      ],
      strongest_image_rich_clusters: [
        "2nd Street transition: 144 2nd, 156 2nd, 699 2nd",
        "South Park / Brannan: 414 Brannan",
        "Western SoMa: 145 9th, 146 11th",
        "Central/eastern edge: 609 Mission, 370 4th, 355 Bryant, 525 6th",
      ],
      weak_coverage_areas: [
        "Public descriptions are missing for many of the most visually useful warehouse/adaptive candidates.",
        "Townsend has strong listing activity but weak image support in the current generated indexes.",
        "Boundary-sensitive edge candidates around China Basin, King Street, and Mission Bay need manual review.",
        "Current public building pages often describe generic space type rather than district form.",
      ],
      uniquely_soma_candidates: [
        "144 2nd St",
        "156 2nd St",
        "414 Brannan St",
        "334 Brannan St",
        "699 2nd St",
        "330 Townsend St",
        "460 Townsend St",
        "145 9th St",
      ],
      expansion_assessment: "SoMa supports deeper representative-building expansion, but only after manual review and description cleanup. The raw depth is strong enough for an 8-12 public representative universe over time; the current blocker is editorial quality, not corpus size.",
    },
    shortlist,
  };
}

function markdownFor(review) {
  const lines = [
    "# SoMa Representative Building Review Shortlist",
    "",
    `Generated: ${review.generated_at}`,
    "",
    "Internal editorial review only. This file is not a publishing queue, not a listing feed, and not a claim of current availability.",
    "",
    "## Source Context",
    "",
    `- Unique candidate buildings from audit: ${review.source_context.unique_candidate_buildings_from_audit}`,
    `- Universe buildings: ${review.source_context.universe_buildings}`,
    `- Legacy listing rows: ${review.source_context.legacy_listing_rows}`,
    `- Buildings with original images: ${review.source_context.buildings_with_original_images}`,
    `- Prior candidate rows: ${review.source_context.prior_candidate_file_rows}`,
    `- Prior strong public candidates: ${review.source_context.prior_strong_public_candidates}`,
    "",
    "## Shortlist Counts",
    "",
    `- Shortlist candidates: ${review.counts.shortlist_candidates}`,
    `- With original-image signal: ${review.counts.with_original_images}`,
    `- With existing public building page: ${review.counts.with_public_building_page}`,
    "",
    "Recommended public status:",
    "",
    ...Object.entries(review.counts.by_recommended_public_status).map(([status, count]) => `- ${status}: ${count}`),
    "",
    "## Strongest Clusters",
    "",
    ...review.strongest_clusters.map((item) => `- ${item.cluster}: ${item.reason}`),
    "",
    "## Editorial Findings",
    "",
    "Strongest SoMa building archetypes:",
    "",
    ...review.editorial_findings.strongest_archetypes.map((item) => `- ${item}`),
    "",
    "Strongest image-rich clusters:",
    "",
    ...review.editorial_findings.strongest_image_rich_clusters.map((item) => `- ${item}`),
    "",
    "Weak coverage areas:",
    "",
    ...review.editorial_findings.weak_coverage_areas.map((item) => `- ${item}`),
    "",
    "Buildings that feel uniquely SoMa:",
    "",
    ...review.editorial_findings.uniquely_soma_candidates.map((item) => `- ${item}`),
    "",
    `Expansion assessment: ${review.editorial_findings.expansion_assessment}`,
    "",
    "## Shortlist",
    "",
  ];

  for (const item of review.shortlist) {
    lines.push(
      `### ${item.address}`,
      "",
      `- Name: ${item.name}`,
      `- Canonical path: ${item.canonical_building_path || "none found"}`,
      `- Image availability: ${item.image_availability}`,
      `- Original image count: ${item.original_image_count}`,
      `- Public page status: ${item.public_page_status}`,
      `- Likely representative role: ${item.likely_representative_role}`,
      `- Likely subarea/edge: ${item.likely_district_subarea}`,
      `- Recommended public status: ${item.recommended_public_status}`,
      `- Why it helps explain SoMa: ${item.why_it_helps_explain_soma}`,
      `- Risks/cautions: ${item.risks_cautions.join("; ")}`,
      ""
    );
  }

  return lines.join("\n");
}

function main() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  const review = buildShortlist();
  fs.writeFileSync(path.join(OUTPUT_DIR, "soma-shortlist.json"), JSON.stringify(review, null, 2), "utf8");
  fs.writeFileSync(path.join(OUTPUT_DIR, "soma-shortlist-review.md"), markdownFor(review), "utf8");
  console.log(`Wrote ${review.counts.shortlist_candidates} SoMa shortlist candidates to ${path.relative(ROOT, OUTPUT_DIR)}`);
  console.log(`With original images: ${review.counts.with_original_images}`);
  console.log(`With public pages: ${review.counts.with_public_building_page}`);
}

main();
