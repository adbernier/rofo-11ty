const buildingPages = require("../_data/buildingPages");
const neighborhoodPages = require("../_data/neighborhoodPages");
const commercialLeasingHandbook = require("../_data/commercialLeasingHandbook");

const genericAlternativePhrases = [
  "another nearby option",
  "similar location",
  "worth considering",
  "comparable building",
];

const requiredSections = [
  "summary",
  "buildingImportance",
  "quickFacts",
  "idealFor",
  "mayNotFit",
  "buildingExperience",
  "districtContext",
  "advantages",
  "tradeoffs",
  "validationNotes",
  "nearbyAlternatives",
  "relatedInsights",
];

function normalizeUrl(url) {
  if (!url) return "";
  return url.endsWith("/") ? url : `${url}/`;
}

function getCount(value) {
  return Array.isArray(value) ? value.length : 0;
}

function wordCount(value) {
  return String(value || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

function collectUrls() {
  const urls = new Set([
    "/",
    "/find-locations/",
    "/commercial-real-estate/CA/san-francisco/",
    "/commercial-real-estate/lease-guide/",
  ]);

  for (const building of buildingPages) {
    urls.add(normalizeUrl(building.building_path));
  }

  for (const page of neighborhoodPages) {
    urls.add(normalizeUrl(page.path || page.url));
    if (page.canonical_neighborhood_path) {
      urls.add(normalizeUrl(page.canonical_neighborhood_path));
    }
    if (page.state_abbr && page.city_slug && page.slug) {
      urls.add(normalizeUrl(`/commercial-real-estate/${page.state_abbr}/${page.city_slug}/${page.slug}/`));
    }
  }

  for (const topic of commercialLeasingHandbook.articles || commercialLeasingHandbook.topics || []) {
    urls.add(normalizeUrl(topic.url));
  }

  return urls;
}

function textValues(value) {
  if (!value) return [];
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(textValues);
  if (typeof value === "object") return Object.values(value).flatMap(textValues);
  return [String(value)];
}

function uniqueLinks(items) {
  const seen = new Set();
  const duplicates = [];

  for (const item of items || []) {
    const url = normalizeUrl(item.url);
    if (!url) continue;
    if (seen.has(url)) duplicates.push(url);
    seen.add(url);
  }

  return duplicates;
}

function duplicateCanonicalRecords(building) {
  return buildingPages.filter((candidate) => candidate.building_path === building.building_path).length;
}

function briefSections(brief) {
  const sections = [];
  const checks = [
    ["summary", brief.summary || brief.buildingSummary],
    ["buildingImportance", brief.buildingImportance || brief.rofoTake],
    ["quickFacts", brief.quickFacts || brief.snapshot],
    ["idealFor", brief.idealFor || brief.bestFit],
    ["mayNotFit", brief.mayNotFit],
    ["buildingExperience", brief.buildingExperience],
    ["districtContext", brief.districtContext || brief.locationContext],
    ["advantages", brief.advantages],
    ["tradeoffs", brief.tradeoffs],
    ["validationNotes", brief.validationNotes],
    ["nearbyAlternatives", brief.nearbyAlternatives],
    ["relatedInsights", brief.relatedInsights],
    ["representativeCompanies", brief.representativeCompanies],
  ];

  for (const [label, value] of checks) {
    if (Array.isArray(value) ? value.length : Boolean(value)) {
      sections.push(label);
    }
  }

  return sections;
}

function analyzeBrief(building, validUrls) {
  const brief = building.building_brief;
  const alternatives = brief.nearbyAlternatives || [];
  const relatedInsights = brief.relatedInsights || [];
  const links = [...alternatives, ...relatedInsights];
  const sections = briefSections(brief);
  const brokenInternalLinks = links
    .map((item) => normalizeUrl(item.url))
    .filter((url) => url.startsWith("/") && !validUrls.has(url));
  const errors = [];
  const warnings = [];
  const allText = textValues(brief).join("\n");
  const duplicateAlternativeLinks = uniqueLinks(alternatives);
  const selfLinkedAlternatives = alternatives
    .filter((item) => normalizeUrl(item.url) === normalizeUrl(building.building_path))
    .map((item) => item.label || item.name || item.url);
  const missingRequiredSections = requiredSections.filter((section) => !sections.includes(section));
  const emptyCardTitles = [...alternatives, ...relatedInsights].filter((item) => !String(item.label || item.name || item.title || "").trim());
  const summaryWords = wordCount(brief.summary || brief.buildingSummary);
  const duplicateRecordCount = duplicateCanonicalRecords(building);

  if (!validUrls.has(normalizeUrl(building.building_path))) errors.push("invalid Building Brief URL");
  if (duplicateRecordCount > 1) errors.push(`duplicate canonical records: ${duplicateRecordCount}`);
  if (brokenInternalLinks.length) errors.push(`broken internal links: ${brokenInternalLinks.join(", ")}`);
  if (duplicateAlternativeLinks.length) errors.push(`duplicate alternatives: ${duplicateAlternativeLinks.join(", ")}`);
  if (selfLinkedAlternatives.length) errors.push(`self-linked alternatives: ${selfLinkedAlternatives.join(", ")}`);
  if (emptyCardTitles.length) errors.push("empty card titles");
  if (allText.includes("undefined")) errors.push("contains undefined text");
  if (allText.includes("[object Object]")) errors.push("contains object rendering text");
  if (/\bN\/A\b/.test(allText)) errors.push("contains N/A");
  if (missingRequiredSections.length) errors.push(`missing required sections: ${missingRequiredSections.join(", ")}`);

  for (const item of alternatives) {
    const reason = String(item.reason || "").toLowerCase();
    if (genericAlternativePhrases.some((phrase) => reason.includes(phrase))) {
      errors.push(`generic alternative reason: ${item.label || item.name || item.url}`);
    }
  }

  if (summaryWords < 35 || summaryWords > 90) warnings.push(`hero summary word count outside target range: ${summaryWords}`);
  if (getCount(brief.quickFacts || brief.snapshot) < 5) warnings.push("fewer than five quick facts");
  if (getCount(brief.idealFor || brief.bestFit) < 3) warnings.push("fewer than three ideal-fit items");
  if (getCount(brief.mayNotFit) < 2) warnings.push("fewer than two may-not-fit items");
  if (getCount(brief.advantages) < 3) warnings.push("fewer than three advantages");
  if (getCount(brief.tradeoffs) < 3) warnings.push("fewer than three tradeoffs");
  if (getCount(alternatives) < 3) warnings.push("fewer than three alternatives");
  if (getCount(brief.validationNotes) < 3) warnings.push("fewer than three validation questions");
  if (getCount(relatedInsights) < 2) warnings.push("fewer than two related insights");

  return {
    name: building.display_name || building.address,
    url: building.building_path,
    district: building.commercial_building_intelligence?.identity?.canonicalDistrict?.name || building.commercial_area?.name || "",
    populatedSections: sections,
    heroSummaryWordCount: summaryWords,
    quickFactCount: getCount(brief.quickFacts || brief.snapshot),
    idealFitCount: getCount(brief.idealFor || brief.bestFit),
    mayNotFitCount: getCount(brief.mayNotFit),
    advantageCount: getCount(brief.advantages),
    tradeoffCount: getCount(brief.tradeoffs),
    alternativeCount: getCount(alternatives),
    validationQuestionCount: getCount(brief.validationNotes),
    relatedInsightCount: getCount(relatedInsights),
    representativeCompanyCount: getCount(brief.representativeCompanies),
    brokenInternalLinks: Array.from(new Set(brokenInternalLinks)),
    duplicateAlternatives: Array.from(new Set(duplicateAlternativeLinks)),
    selfLinkedAlternatives,
    missingRequiredSections,
    errors: Array.from(new Set(errors)),
    warnings: Array.from(new Set(warnings)),
  };
}

function printReport(rows) {
  for (const row of rows) {
    console.log(`\n${row.name}`);
    console.log(`URL: ${row.url}`);
    console.log(`District: ${row.district || "unknown"}`);
    console.log(`Populated sections: ${row.populatedSections.join(", ")}`);
    console.log(`Hero summary words: ${row.heroSummaryWordCount}`);
    console.log(`Quick facts: ${row.quickFactCount}`);
    console.log(`Ideal fit: ${row.idealFitCount}`);
    console.log(`May not fit: ${row.mayNotFitCount}`);
    console.log(`Advantages: ${row.advantageCount}`);
    console.log(`Tradeoffs: ${row.tradeoffCount}`);
    console.log(`Nearby alternatives: ${row.alternativeCount}`);
    console.log(`Validation questions: ${row.validationQuestionCount}`);
    console.log(`Related insights: ${row.relatedInsightCount}`);
    console.log(`Representative companies: ${row.representativeCompanyCount}`);
    console.log(`Broken internal links: ${row.brokenInternalLinks.length ? row.brokenInternalLinks.join(", ") : "none"}`);
    console.log(`Duplicate alternatives: ${row.duplicateAlternatives.length ? row.duplicateAlternatives.join(", ") : "none"}`);
    console.log(`Self-linked alternatives: ${row.selfLinkedAlternatives.length ? row.selfLinkedAlternatives.join(", ") : "none"}`);
    console.log(`Missing required sections: ${row.missingRequiredSections.length ? row.missingRequiredSections.join(", ") : "none"}`);
    console.log(`Errors: ${row.errors.length ? row.errors.join("; ") : "none"}`);
    console.log(`Warnings: ${row.warnings.length ? row.warnings.join("; ") : "none"}`);
  }
}

function main() {
  const validUrls = collectUrls();
  const rows = buildingPages
    .filter((building) => building.building_brief)
    .map((building) => analyzeBrief(building, validUrls));

  printReport(rows);

  const hasErrors = rows.some((row) => row.errors.length);
  if (hasErrors) {
    process.exitCode = 1;
  }
}

main();
