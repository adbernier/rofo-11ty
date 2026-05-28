#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const OUTPUT_DIR = path.join(ROOT, "data", "district-building-candidates", "reviews");

const DISTRICTS = [
  {
    slug: "mission-bay",
    name: "Mission Bay",
    page_path: "/commercial-real-estate/CA/san-francisco/mission-bay/",
    candidate_file: "mission-bay.json",
    target_count: 25,
    role_overrides: {
      "600 Townsend St": "SoMa-to-Mission Bay modern office edge",
      "99 Rhode Island St": "Potrero and life-science-adjacent office edge",
      "54 Jeff Adachi Way": "Newer Mission Bay commercial block",
      "1800 Owens St": "Institutional/life-science office",
      "500 Terry Francois Blvd": "Waterfront-adjacent commercial",
      "550 Terry A Francois Blvd": "Waterfront-adjacent commercial",
      "555 Mission Rock St": "Modern mixed-use commercial",
      "1201 4th St": "Modern mixed-use commercial",
      "1455 3rd St": "Modern mixed-use commercial",
      "1155 4th St": "Modern mixed-use commercial",
      "70 Pier Bldg 102": "Waterfront-adjacent commercial",
    },
    live_addition_notes: {
      "70 Pier Bldg 102": "Skip for now: existing page is Dogpatch-associated and does not clearly strengthen Mission Bay's institutional/life-science thesis.",
    },
  },
  {
    slug: "old-oakland",
    name: "Old Oakland",
    page_path: "/commercial-real-estate/CA/oakland/old-oakland/",
    candidate_file: "old-oakland.json",
    target_count: 25,
    role_overrides: {
      "1221 Broadway": "Broadway transition toward the civic core",
      "1111 Broadway": "Downtown edge office example",
      "1000 Broadway": "Historic downtown transition",
      "1212 Broadway": "Low-rise historic commercial",
      "969 Broadway": "Low-rise historic commercial",
      "831 Broadway": "Low-rise historic commercial",
      "827 Broadway": "Low-rise historic commercial",
      "530 8th St": "Street-level commercial block",
      "484 9th St": "Street-level commercial block",
      "577 5th St": "Historic downtown transition",
    },
  },
  {
    slug: "jack-london-square",
    name: "Jack London Square",
    page_path: "/commercial-real-estate/CA/oakland/jack-london-square/",
    candidate_file: "jack-london-square.json",
    target_count: 25,
    role_overrides: {
      "66 Franklin St": "Waterfront office and visitor-facing edge",
      "230 Madison St": "Warehouse-adjacent adaptive commercial texture",
      "105 2nd St": "Lower-scale waterfront commercial block",
      "160 Franklin St": "Waterfront-adjacent commercial",
      "424 3rd St": "Adaptive commercial building",
      "119 Filbert St": "Waterfront-adjacent commercial",
      "580 2nd St": "Waterfront-adjacent commercial",
      "985 3rd St": "Adaptive commercial building",
    },
  },
  {
    slug: "downtown-palo-alto",
    name: "Downtown Palo Alto",
    page_path: "/commercial-real-estate/CA/palo-alto/downtown-palo-alto/",
    candidate_file: "downtown-palo-alto.json",
    target_count: 25,
    role_overrides: {
      "228 Hamilton Ave": "Hamilton Avenue client-facing office setting",
      "530 Lytton Ave": "Lytton Avenue professional office fabric",
      "200-228 Hamilton Ave": "Retail-supported downtown commercial block",
      "400 Hamilton Ave": "Compact Peninsula office example",
      "200 Hamilton Ave": "Caltrain-oriented professional office",
      "560 Waverley St": "Startup/professional downtown building",
      "225 Hamilton Ave": "Hamilton Avenue professional office",
      "101 Lytton Ave": "Lytton Avenue professional office fabric",
      "550 Hamilton Ave": "Hamilton Avenue client-facing office setting",
      "525 University Ave": "University Avenue professional office",
    },
  },
  {
    slug: "jackson-square",
    name: "Jackson Square",
    page_path: "/commercial-real-estate/CA/san-francisco/jackson-square/",
    candidate_file: "jackson-square.json",
    target_count: 15,
    role_overrides: {
      "75 Broadway": "Boutique office edge near the downtown core",
      "2 Embarcadero Ctr": "Embarcadero and Financial District edge",
      "924 Sansome St": "Historic street-level commercial texture",
      "50 California St": "Formal office-core adjacency",
      "33 Drumm St": "Waterfront-edge retail support",
      "27 Drumm St": "Small-format downtown edge example",
      "1100 Grant Ave": "Historic boutique office",
      "145 Jefferson St": "Historic boutique office",
      "890 Jackson St": "Low-rise historic commercial",
      "1606 Stockton St": "Historic boutique office",
    },
    live_addition_notes: {
      "1100 Grant Ave": "Good public-page candidate, but current Jackson Square set is already at six; consider only if replacing a weaker edge example.",
      "145 Jefferson St": "Skip for now: useful historic/tourism-edge context, but less central to Jackson Square's boutique-office identity.",
      "890 Jackson St": "Skip for now: possible historic context, but not strong enough to expand the live set beyond six.",
      "555 North Point St": "Skip for now: edge geography is weaker for Jackson Square district interpretation.",
      "1606 Stockton St": "Skip for now: North Beach/Stockton edge is weaker than current reviewed examples.",
    },
  },
];

const buildingPages = require(path.join(ROOT, "_data", "buildingPages.js"));
const neighborhoodPages = require(path.join(ROOT, "_data", "neighborhoodPages.js"));
const buildingByPath = new Map(buildingPages.map((building) => [building.building_path, building]));

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), "utf8"));
}

function clean(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function publicPageStatus(candidate) {
  return buildingByPath.has(candidate.canonical_building_path)
    ? "public_building_page_exists"
    : "no_public_building_page_found";
}

function currentPageFor(district) {
  return neighborhoodPages.find((page) => page.canonical_neighborhood_path === district.page_path) || {};
}

function currentPathsFor(district) {
  return new Set((currentPageFor(district).representative_buildings || []).map((building) => building.building_path));
}

function recommendation(candidate, district, currentPaths) {
  if (currentPaths.has(candidate.canonical_building_path)) return "current_public_representative";
  if (publicPageStatus(candidate) !== "public_building_page_exists") return "skip_no_public_page";
  if (
    district.live_addition_notes?.[candidate.address] &&
    candidate.address !== "1100 Grant Ave"
  ) return "skip_boundary_or_role_unclear";
  if (candidate.publish_recommendation === "strong_public_candidate") return "safe_live_candidate";
  if (candidate.publish_recommendation === "possible_public_candidate") return "possible_live_candidate";
  return "internal_review_only";
}

function skipReason(candidate, district, currentPaths) {
  if (currentPaths.has(candidate.canonical_building_path)) return "";
  if (district.live_addition_notes?.[candidate.address]) return district.live_addition_notes[candidate.address];
  if (publicPageStatus(candidate) !== "public_building_page_exists") return "No existing public building page; do not publish until a building page exists.";
  if (candidate.publish_recommendation === "internal_only") return "Existing page match, but district role or boundary fit is not strong enough for live use.";
  return "";
}

function sourceStrength(candidate) {
  const values = [];
  if (candidate.publish_recommendation === "strong_public_candidate") values.push("strong candidate");
  if (candidate.publish_recommendation === "possible_public_candidate") values.push("possible candidate");
  if (candidate.existing_public_page_status === "public_building_page_exists") values.push("public page");
  if (candidate.image_availability && candidate.image_availability !== "none_known") values.push("image signal");
  if (candidate.listing_history_signal) values.push(candidate.listing_history_signal);
  return values.join("; ");
}

function buildDistrictReview(district) {
  const source = readJson(path.join("data", "district-building-candidates", district.candidate_file));
  const currentPaths = currentPathsFor(district);
  const currentRepresentatives = currentPageFor(district).representative_buildings || [];
  const seen = new Set();

  const shortlist = source.candidates
    .filter((candidate) => {
      const key = clean(candidate.address).toLowerCase();
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, district.target_count)
    .map((candidate) => {
      const page = buildingByPath.get(candidate.canonical_building_path);
      const liveRecommendation = recommendation(candidate, district, currentPaths);
      return {
        name: candidate.name,
        address: candidate.address,
        canonical_building_path: candidate.canonical_building_path,
        public_page_status: publicPageStatus(candidate),
        current_public_representative: currentPaths.has(candidate.canonical_building_path),
        image_availability: candidate.image_availability,
        existing_public_page_type: page?.primary_type_label || page?.type || "",
        likely_representative_role: district.role_overrides[candidate.address] || candidate.likely_representative_role,
        source_strength: sourceStrength(candidate),
        recommended_public_status: candidate.publish_recommendation,
        live_update_recommendation: liveRecommendation,
        skip_or_caution_reason: skipReason(candidate, district, currentPaths),
        data_quality_cautions: candidate.caution_notes || [],
      };
    });

  const safeAdditions = shortlist.filter((item) => item.live_update_recommendation === "safe_live_candidate");
  const possibleAdditions = shortlist.filter((item) => item.live_update_recommendation === "possible_live_candidate");
  const skippedNoPage = shortlist.filter((item) => item.live_update_recommendation === "skip_no_public_page");

  return {
    generated_at: new Date().toISOString(),
    purpose: "Internal representative building shortlist for Bay Area district review. Not a listings feed and not a publication queue.",
    district: {
      slug: district.slug,
      name: district.name,
      canonical_path: district.page_path,
    },
    counts: {
      candidates: shortlist.length,
      current_public_representatives: currentRepresentatives.length,
      existing_public_page_matches: shortlist.filter((item) => item.public_page_status === "public_building_page_exists").length,
      strong_public_candidates: shortlist.filter((item) => item.recommended_public_status === "strong_public_candidate").length,
      possible_public_candidates: shortlist.filter((item) => item.recommended_public_status === "possible_public_candidate").length,
      safe_live_additions: safeAdditions.length,
      possible_live_additions: possibleAdditions.length,
      skipped_no_public_page: skippedNoPage.length,
    },
    current_public_representatives: currentRepresentatives.map((building) => ({
      address: building.address,
      canonical_building_path: building.building_path,
      role: building.editorial_descriptor,
    })),
    recommended_live_additions: [...safeAdditions, ...possibleAdditions].map((item) => ({
      address: item.address,
      canonical_building_path: item.canonical_building_path,
      likely_representative_role: item.likely_representative_role,
      recommendation: item.live_update_recommendation,
    })),
    skipped_because_no_public_page: skippedNoPage.slice(0, 12).map((item) => ({
      address: item.address,
      canonical_building_path: item.canonical_building_path,
      likely_representative_role: item.likely_representative_role,
      source_strength: item.source_strength,
    })),
    data_quality_cautions: [
      "Many raw candidates are proximity-led and need boundary review before public use.",
      "Listing-history signals are historical context only and must not imply current availability.",
      "Existing public building pages often contain generic space-type copy, not district-form interpretation.",
      "Candidates without public building pages were intentionally not recommended for live district updates.",
    ],
    shortlist,
  };
}

function markdownFor(review) {
  const lines = [
    `# ${review.district.name} Representative Building Shortlist`,
    "",
    `Generated: ${review.generated_at}`,
    "",
    "Internal editorial review only. Do not treat this as a listing feed or availability signal.",
    "",
    "## Counts",
    "",
    `- Candidates reviewed: ${review.counts.candidates}`,
    `- Current public representatives: ${review.counts.current_public_representatives}`,
    `- Existing public page matches: ${review.counts.existing_public_page_matches}`,
    `- Strong public candidates: ${review.counts.strong_public_candidates}`,
    `- Possible public candidates: ${review.counts.possible_public_candidates}`,
    `- Safe live additions: ${review.counts.safe_live_additions}`,
    `- Possible live additions: ${review.counts.possible_live_additions}`,
    `- Skipped because no public page: ${review.counts.skipped_no_public_page}`,
    "",
    "## Current Public Representatives",
    "",
    ...(review.current_public_representatives.length
      ? review.current_public_representatives.map((item) => `- ${item.address}: ${item.role}`)
      : ["- None."]),
    "",
    "## Recommended Live Additions",
    "",
    ...(review.recommended_live_additions.length
      ? review.recommended_live_additions.map((item) => `- ${item.address}: ${item.likely_representative_role} (${item.recommendation})`)
      : ["- No safe live additions recommended from this pass."]),
    "",
    "## Skipped Because No Public Page",
    "",
    ...(review.skipped_because_no_public_page.length
      ? review.skipped_because_no_public_page.map((item) => `- ${item.address}: ${item.likely_representative_role}; ${item.source_strength}`)
      : ["- None."]),
    "",
    "## Shortlist",
    "",
  ];

  for (const item of review.shortlist) {
    lines.push(
      `### ${item.address}`,
      "",
      `- Role: ${item.likely_representative_role}`,
      `- Public page: ${item.public_page_status}`,
      `- Current public representative: ${item.current_public_representative ? "yes" : "no"}`,
      `- Image availability: ${item.image_availability}`,
      `- Candidate status: ${item.recommended_public_status}`,
      `- Live update recommendation: ${item.live_update_recommendation}`,
      `- Source strength: ${item.source_strength || "limited"}`,
      `- Caution: ${item.skip_or_caution_reason || (item.data_quality_cautions || []).join("; ") || "manual review still required"}`,
      ""
    );
  }

  return lines.join("\n");
}

function summaryMarkdown(reviews) {
  const lines = [
    "# Bay Area Focus District Representative Building Review",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "Internal review summary. Public updates should remain scoped to candidates with existing public building pages and clear district roles.",
    "",
    "| District | Candidates | Strong | Possible | Existing pages | Current reps | Safe additions | Skipped no page |",
    "|---|---:|---:|---:|---:|---:|---:|---:|",
  ];

  for (const review of reviews) {
    lines.push(`| ${review.district.name} | ${review.counts.candidates} | ${review.counts.strong_public_candidates} | ${review.counts.possible_public_candidates} | ${review.counts.existing_public_page_matches} | ${review.counts.current_public_representatives} | ${review.counts.safe_live_additions + review.counts.possible_live_additions} | ${review.counts.skipped_no_public_page} |`);
  }

  lines.push("", "## Recommended Additions", "");
  for (const review of reviews) {
    lines.push(`### ${review.district.name}`, "");
    if (!review.recommended_live_additions.length) {
      lines.push("- No safe live additions recommended.", "");
    } else {
      for (const item of review.recommended_live_additions) {
        lines.push(`- ${item.address}: ${item.likely_representative_role}`);
      }
      lines.push("");
    }
  }

  lines.push(
    "## Data Quality Cautions",
    "",
    "- Old Oakland has useful raw depth, but most better historic candidates lack public building pages.",
    "- Jack London Square has public-page matches, but the clear district-specific set is already mostly represented; many additional matches drift into Downtown Oakland.",
    "- Mission Bay still lacks public pages for the strongest institutional/life-science candidates such as 1800 Owens and Terry Francois/Mission Rock addresses.",
    "- Downtown Palo Alto has many plausible raw candidates but only a small existing public-page set.",
    "- Jackson Square has enough public-page depth; additional candidates should be replacements, not expansion.",
    "- Do not use historical listing counts as freshness or availability.",
    ""
  );

  return lines.join("\n");
}

function main() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  const reviews = DISTRICTS.map(buildDistrictReview);

  for (const review of reviews) {
    fs.writeFileSync(
      path.join(OUTPUT_DIR, `${review.district.slug}-shortlist.json`),
      JSON.stringify(review, null, 2),
      "utf8"
    );
    fs.writeFileSync(
      path.join(OUTPUT_DIR, `${review.district.slug}-shortlist-review.md`),
      markdownFor(review),
      "utf8"
    );
  }

  fs.writeFileSync(
    path.join(OUTPUT_DIR, "bay-area-focus-summary.json"),
    JSON.stringify({ generated_at: new Date().toISOString(), districts: reviews }, null, 2),
    "utf8"
  );
  fs.writeFileSync(
    path.join(OUTPUT_DIR, "bay-area-focus-summary.md"),
    summaryMarkdown(reviews),
    "utf8"
  );

  for (const review of reviews) {
    console.log(`${review.district.name}: ${review.counts.candidates} candidates, ${review.counts.existing_public_page_matches} public-page matches, ${review.counts.safe_live_additions + review.counts.possible_live_additions} recommended additions`);
  }
}

main();
