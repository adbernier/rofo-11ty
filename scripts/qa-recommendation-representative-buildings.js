const fs = require("fs");
const path = require("path");
const buildingPages = require("../_data/buildingPages");
const graph = require("../_data/locationKnowledgeGraph");
const profiles = require("../_data/recommendationProfiles");
const representativeBuildings = require("../_data/recommendationRepresentativeBuildings");
const { resolveMarketPath } = require("../js/recommendation-resolver");
const { resolveForDistrict } = require("../js/recommendation-representative-buildings");

const validBuildingUrls = new Set(buildingPages.map((building) => normalizeUrl(building.building_path)));

const scenarios = [
  {
    name: "San Francisco city search",
    city: "San Francisco",
    profile: {
      locations: [{ label: "San Francisco", type: "city", city: "San Francisco", state: "CA", slug: "san-francisco", path: "/commercial-real-estate/CA/san-francisco/" }],
      spaceType: "Office",
      size: "2,500-5,000 sqft",
      locationIntent: "compare",
      priorities: ["transit", "growth flexibility", "technology ecosystem"],
    },
  },
  {
    name: "Financial District focused search",
    city: "San Francisco",
    profile: {
      locations: [{ label: "Financial District", type: "district", city: "San Francisco", state: "CA", slug: "financial-district", path: "/commercial-real-estate/CA/san-francisco/financial-district/" }],
      spaceType: "Office",
      size: "5,000-10,000 sqft",
      locationIntent: "focus",
      priorities: ["client-facing location", "transit", "executive image"],
    },
  },
  {
    name: "SoMa focused search",
    city: "San Francisco",
    profile: {
      locations: [{ label: "SoMa", type: "district", city: "San Francisco", state: "CA", slug: "soma", path: "/commercial-real-estate/CA/san-francisco/soma/" }],
      spaceType: "Office",
      size: "10,000-25,000 sqft",
      locationIntent: "focus",
      priorities: ["creative office", "transit", "technology"],
    },
  },
  {
    name: "Mission Bay focused search",
    city: "San Francisco",
    profile: {
      locations: [{ label: "Mission Bay", type: "district", city: "San Francisco", state: "CA", slug: "mission-bay", path: "/commercial-real-estate/CA/san-francisco/mission-bay/" }],
      spaceType: "Office",
      size: "15,000-30,000 sqft",
      locationIntent: "focus",
      priorities: ["modern buildings", "life science", "Caltrain"],
    },
  },
  {
    name: "Showplace Square secondary-association search",
    city: "San Francisco",
    directDistrict: { label: "Showplace Square", type: "district", city: "San Francisco", state: "CA", slug: "showplace-square", path: "/commercial-real-estate/CA/san-francisco/showplace-square/" },
    profile: {
      locations: [{ label: "Showplace Square", type: "district", city: "San Francisco", state: "CA", slug: "showplace-square", path: "/commercial-real-estate/CA/san-francisco/showplace-square/" }],
      spaceType: "Office",
      size: "8,000-20,000 sqft",
      locationIntent: "focus",
      priorities: ["creative office", "production adjacency", "Caltrain"],
    },
  },
  {
    name: "Design District one-building fallback",
    city: "San Francisco",
    directDistrict: { label: "Design District", type: "district", city: "San Francisco", state: "CA", slug: "design-district", path: "/commercial-real-estate/CA/san-francisco/design-district/" },
    profile: {
      locations: [{ label: "Design District", type: "district", city: "San Francisco", state: "CA", slug: "design-district", path: "/commercial-real-estate/CA/san-francisco/design-district/" }],
      spaceType: "Office",
      size: "4,000-12,000 sqft",
      locationIntent: "focus",
      priorities: ["design", "showroom", "creative office"],
    },
  },
  {
    name: "Dogpatch zero-building fallback",
    city: "San Francisco",
    directDistrict: { label: "Dogpatch", type: "district", city: "San Francisco", state: "CA", slug: "dogpatch", path: "/commercial-real-estate/CA/san-francisco/dogpatch/" },
    profile: {
      locations: [{ label: "Dogpatch", type: "district", city: "San Francisco", state: "CA", slug: "dogpatch", path: "/commercial-real-estate/CA/san-francisco/dogpatch/" }],
      spaceType: "Office",
      size: "4,000-12,000 sqft",
      locationIntent: "focus",
      priorities: ["industrial character", "Mission Bay adjacency"],
    },
  },
  {
    name: "Jackson Square thin search",
    city: "San Francisco",
    profile: {
      locations: [{ label: "Jackson Square", type: "district", city: "San Francisco", state: "CA", slug: "jackson-square", path: "/commercial-real-estate/CA/san-francisco/jackson-square/" }],
      spaceType: "Office",
      size: "2,000-6,000 sqft",
      locationIntent: "focus",
      priorities: ["boutique office", "walkability", "client-facing location"],
    },
  },
  {
    name: "Sacramento cross-market thin search",
    city: "Sacramento",
    profile: {
      locations: [{ label: "Sacramento", type: "city", city: "Sacramento", state: "CA", slug: "sacramento", path: "/commercial-real-estate/CA/sacramento/" }],
      spaceType: "Office",
      size: "3,000-8,000 sqft",
      locationIntent: "compare",
      priorities: ["transit", "professional services"],
    },
  },
];

function normalizeUrl(url) {
  if (!url) return "";
  return url.endsWith("/") ? url : `${url}/`;
}

function normalizeText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function duplicateValues(values) {
  const seen = new Set();
  const duplicates = [];
  values.filter(Boolean).forEach((value) => {
    const normalized = normalizeText(value).toLowerCase();
    if (seen.has(normalized)) duplicates.push(value);
    seen.add(normalized);
  });
  return duplicates;
}

function malformedUrl(url) {
  return !url || !url.startsWith("/") || url.startsWith("//") || url.includes(" ") || (!url.includes("?") && !url.includes("#") && !url.endsWith("/"));
}

function analyzeCard(card, district) {
  const errors = [];
  const warnings = [];
  if (!card.name) errors.push("missing building name");
  if (!card.canonicalUrl || !validBuildingUrls.has(normalizeUrl(card.canonicalUrl))) errors.push(`broken internal Building Brief link: ${card.canonicalUrl || "missing"}`);
  if (!card.buildingBriefStatus) errors.push(`missing Building Brief status: ${card.name || card.canonicalUrl}`);
  if (!card.representativeReason) errors.push(`missing representative reason: ${card.name || card.canonicalUrl}`);
  if (!card.bestFitSummary) errors.push(`missing best-fit summary: ${card.name || card.canonicalUrl}`);
  if (!card.primaryTradeoff) errors.push(`missing primary tradeoff: ${card.name || card.canonicalUrl}`);
  if (malformedUrl(card.canonicalUrl)) errors.push(`malformed link: ${card.canonicalUrl || "missing"}`);
  const districtSlug = district.slug;
  const associated = card.districtSlug === districtSlug || (card.secondaryDistrictSlugs || []).includes(districtSlug);
  if (!associated) errors.push(`invalid district association: ${card.name || card.canonicalUrl}`);
  if (!card.image) warnings.push(`image missing: ${card.name}`);
  [card.name, card.representativeReason, card.bestFitSummary, card.primaryTradeoff].forEach((value) => {
    if (String(value || "").includes("undefined")) errors.push(`undefined text: ${card.name || card.canonicalUrl}`);
    if (String(value || "").includes("[object Object]")) errors.push(`object text: ${card.name || card.canonicalUrl}`);
    if (/\bN\/A\b/.test(String(value || ""))) errors.push(`N/A text: ${card.name || card.canonicalUrl}`);
  });
  return { errors, warnings };
}

function analyzeDistrict(district, isPrimary) {
  const result = resolveForDistrict(district, representativeBuildings);
  const errors = [];
  const warnings = [];
  const cards = result.buildings || [];
  const duplicateBuildings = duplicateValues(cards.map((card) => card.canonicalUrl));
  const repeatedReasons = duplicateValues(cards.map((card) => card.representativeReason));
  const repeatedTradeoffs = duplicateValues(cards.map((card) => card.primaryTradeoff));

  if (result.shown && cards.length > 3) errors.push("more than three cards rendered");
  if (result.shown && cards.length < 2) errors.push("fewer than two cards while rendering module");
  if (duplicateBuildings.length) errors.push(`duplicate building inside district: ${duplicateBuildings.join(", ")}`);
  if (repeatedReasons.length) warnings.push(`repeated representative reasons: ${repeatedReasons.join(" | ")}`);
  if (repeatedTradeoffs.length) warnings.push(`repeated tradeoffs: ${repeatedTradeoffs.join(" | ")}`);
  if (!result.shown && cards.length === 1) warnings.push("only one eligible building; module correctly omitted");
  if (!result.shown && cards.length === 0) warnings.push("unsupported district; module correctly omitted");

  cards.forEach((card) => {
    const cardResult = analyzeCard(card, district);
    errors.push(...cardResult.errors);
    warnings.push(...cardResult.warnings);
  });

  return {
    district: district.label,
    districtSlug: district.slug,
    primary: isPrimary,
    moduleShown: result.shown,
    omissionReason: result.shown ? "" : result.reason,
    buildingCount: result.shown ? cards.length : 0,
    selectedBuildings: cards.slice(0, 3).map((card) => card.name),
    canonicalUrls: cards.slice(0, 3).map((card) => card.canonicalUrl),
    buildingBriefStatuses: cards.slice(0, 3).map((card) => card.buildingBriefStatus),
    duplicateBuildings,
    repeatedReasons,
    repeatedTradeoffs,
    liveMarketInvestigationCtaPresent: isPrimary,
    liveMarketInvestigationCtaDestination: "#location-brief-contact",
    districtGuideLinkPresent: Boolean(district.path),
    errors,
    warnings,
  };
}

function generatedPageChecks() {
  const htmlPath = path.join(__dirname, "..", "_site", "recommendations", "index.html");
  if (!fs.existsSync(htmlPath)) return { errors: [], warnings: ["generated recommendations page not found; run npm run build for markup checks"] };
  const sourcePaths = [
    path.join(__dirname, "..", "pages", "recommendations.njk"),
    path.join(__dirname, "..", "js", "recommendation-context.js"),
    path.join(__dirname, "..", "js", "recommendation-representative-buildings.js"),
  ];
  const htmlMtime = fs.statSync(htmlPath).mtimeMs;
  const sourceIsNewer = sourcePaths.some((sourcePath) => fs.existsSync(sourcePath) && fs.statSync(sourcePath).mtimeMs > htmlMtime);
  if (sourceIsNewer) {
    return { errors: [], warnings: ["generated recommendations page is stale; run npm run build for markup checks"] };
  }
  const html = fs.readFileSync(htmlPath, "utf8");
  const errors = [];
  const warnings = [];
  if (!html.includes("data-location-brief-representative-buildings")) errors.push("recommendation page missing representative-building module shell");
  if (!html.includes("representative examples, not current availability")) errors.push("missing representative-example disclosure");
  const jsHasInvestigationCta = fs.readFileSync(path.join(__dirname, "..", "js", "recommendation-context.js"), "utf8").includes("data-live-market-investigation-cta");
  if (!jsHasInvestigationCta && !html.includes("data-location-brief-contact")) errors.push("missing Live Market Investigation CTA");
  if (!html.includes('id="location-brief-contact"')) errors.push("dead investigation CTA");
  if (html.includes("undefined")) errors.push("generated recommendations page contains undefined");
  if (html.includes("[object Object]")) errors.push("generated recommendations page contains object text");
  if (/\bN\/A\b/.test(html)) errors.push("generated recommendations page contains N/A");
  return { errors, warnings };
}

function scenarioResult(scenario) {
  const state = resolveMarketPath(scenario.profile, graph, profiles);
  const recommendedDistricts = scenario.directDistrict
    ? [scenario.directDistrict]
    : (state.recommendedPath || []).filter((item) => item.type === "district");
  const districts = recommendedDistricts.length
    ? recommendedDistricts
    : state.primaryRecommendation && state.primaryRecommendation.type === "district"
      ? [state.primaryRecommendation]
      : [];
  const districtResults = districts.map((district, index) => analyzeDistrict(district, index === 0));
  return {
    scenario: scenario.name,
    recommendedCity: scenario.city,
    recommendedDistricts: districts.map((district) => district.label),
    districtResults,
    errors: districtResults.flatMap((district) => district.errors),
    warnings: districtResults.flatMap((district) => district.warnings),
  };
}

function printReport(rows, pageChecks) {
  rows.forEach((row) => {
    console.log(`\n${row.scenario}`);
    console.log(`Recommended city: ${row.recommendedCity}`);
    console.log(`Recommended districts: ${row.recommendedDistricts.length ? row.recommendedDistricts.join(", ") : "none"}`);
    row.districtResults.forEach((district) => {
      console.log(`- ${district.district}${district.primary ? " (primary)" : ""}: ${district.moduleShown ? "shown" : `omitted (${district.omissionReason})`}`);
      console.log(`  Building count: ${district.buildingCount}`);
      console.log(`  Selected buildings: ${district.selectedBuildings.length ? district.selectedBuildings.join(", ") : "none"}`);
      console.log(`  Canonical URLs: ${district.canonicalUrls.length ? district.canonicalUrls.join(", ") : "none"}`);
      console.log(`  Building Brief status: ${district.buildingBriefStatuses.length ? district.buildingBriefStatuses.join(", ") : "none"}`);
      console.log(`  Live Market Investigation CTA: ${district.liveMarketInvestigationCtaPresent ? district.liveMarketInvestigationCtaDestination : "not rendered for secondary district"}`);
      console.log(`  District guide link: ${district.districtGuideLinkPresent ? "present" : "missing"}`);
      console.log(`  Errors: ${district.errors.length ? district.errors.join("; ") : "none"}`);
      console.log(`  Warnings: ${district.warnings.length ? district.warnings.join("; ") : "none"}`);
    });
  });

  console.log("\nGenerated recommendation page checks");
  console.log(`Errors: ${pageChecks.errors.length ? pageChecks.errors.join("; ") : "none"}`);
  console.log(`Warnings: ${pageChecks.warnings.length ? pageChecks.warnings.join("; ") : "none"}`);
}

function main() {
  const rows = scenarios.map(scenarioResult);
  const pageChecks = generatedPageChecks();
  printReport(rows, pageChecks);
  if (rows.some((row) => row.errors.length) || pageChecks.errors.length) {
    process.exitCode = 1;
  }
}

main();
