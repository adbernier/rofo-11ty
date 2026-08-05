#!/usr/bin/env node

const businessBriefs = require("../_data/businessBriefs.js");
const businessArchetypes = require("../_data/businessArchetypes.js");
const locationKnowledgeGraph = require("../_data/locationKnowledgeGraph.js");
const sfOfficeModel = require("../_data/sfOfficeRecommendationModel.js");

const EXPECTED_MARKETS = ["san-francisco", "denver"];
const EXPECTED_ARCHETYPES = [
  "growing-technology-company",
  "client-facing-professional-services",
  "law-firm",
  "healthcare-organization",
  "nonprofit-mission-driven-organization",
];
const REQUIRED_COUNT = EXPECTED_MARKETS.length * EXPECTED_ARCHETYPES.length;
const DEBUG_TERMS = [
  "resolver state",
  "candidate set",
  "ignored economics",
  "next-question metadata",
  "entered",
  "rose",
  "debug",
];
const UNSUPPORTED_CLAIMS = [
  "available now",
  "current asking rent",
  "current rent",
  "landlord motivation",
  "concession",
  "vacancy rate",
];

function fail(message) {
  failures.push(message);
}

function clean(value) {
  return String(value || "").trim();
}

function hasDuplicate(values) {
  return new Set(values).size !== values.length;
}

function visibleText(brief) {
  return [
    brief.title,
    brief.seoTitle,
    brief.metaDescription,
    brief.pageHeading,
    ...(brief.executiveSummary || []),
    brief.comparativeGuidance,
    ...(brief.tradeoffs || []),
    ...(brief.alternativeConditions || []),
    ...brief.bestFits.flatMap((fit) => [
      fit.districtName,
      fit.fitLabel,
      fit.summary,
      ...(fit.reasons || []),
    ]),
  ].join(" ").toLowerCase();
}

function districtExists(slug, marketId) {
  return locationKnowledgeGraph.some((node) => {
    if (node.type !== "district" || node.slug !== slug) return false;
    return node.marketId === marketId || node.operationalMarketId === marketId || clean(node.city).toLowerCase().replace(/\s+/g, "-") === marketId;
  });
}

function assertUniqueBy(label, values) {
  if (hasDuplicate(values)) {
    fail(`${label} must be unique`);
  }
}

const failures = [];
const briefs = businessBriefs.briefs || [];
const byId = new Map(briefs.map((brief) => [brief.id, brief]));

if (briefs.length !== REQUIRED_COUNT) {
  fail(`Expected ${REQUIRED_COUNT} Phase 1 Business Briefs, found ${briefs.length}`);
}

assertUniqueBy("Business Brief IDs", briefs.map((brief) => brief.id));
assertUniqueBy("Business Brief URLs", briefs.map((brief) => brief.url));
assertUniqueBy("Business Brief SEO titles", briefs.map((brief) => brief.seoTitle));
assertUniqueBy("Business Brief meta descriptions", briefs.map((brief) => brief.metaDescription));

for (const marketId of EXPECTED_MARKETS) {
  for (const archetypeId of EXPECTED_ARCHETYPES) {
    const id = `${marketId}:office:${archetypeId}`;
    if (!byId.has(id)) fail(`Missing required Business Brief: ${id}`);
  }
}

for (const archetypeId of EXPECTED_ARCHETYPES) {
  const archetype = businessArchetypes.archetypes[archetypeId];
  if (!archetype) {
    fail(`Missing reusable archetype: ${archetypeId}`);
    continue;
  }
  for (const field of [
    "description",
    "typicalOperatingPattern",
    "publishingGuidance",
    "knownLimits",
  ]) {
    if (!clean(archetype[field])) fail(`Archetype ${archetypeId} missing ${field}`);
  }
  for (const listField of [
    "primaryLocationDrivers",
    "materialQuestions",
    "buildingSearchFactors",
    "brokerExecutionConsiderations",
  ]) {
    if (!Array.isArray(archetype[listField]) || !archetype[listField].length) {
      fail(`Archetype ${archetypeId} missing ${listField}`);
    }
  }
}

for (const brief of briefs) {
  const context = `${brief.id} (${brief.url})`;
  const text = visibleText(brief);

  if (!clean(brief.title)) fail(`${context} missing title`);
  if (!clean(brief.seoTitle)) fail(`${context} missing SEO title`);
  if (!clean(brief.metaDescription)) fail(`${context} missing meta description`);
  if (!clean(brief.pageHeading)) fail(`${context} missing page heading`);
  if (!brief.url || !brief.url.startsWith(`/${brief.market.marketSlug}/office/`)) {
    fail(`${context} has invalid URL convention`);
  }
  if (!Array.isArray(brief.executiveSummary) || brief.executiveSummary.length !== 2) {
    fail(`${context} must have two executive-summary paragraphs`);
  }
  if (!Array.isArray(brief.locationPriorities) || brief.locationPriorities.length < 4 || brief.locationPriorities.length > 6) {
    fail(`${context} must have four to six location priorities`);
  }
  if (!Array.isArray(brief.bestFits) || brief.bestFits.length < 2 || brief.bestFits.length > 4) {
    fail(`${context} must have two to four defensible Best Fits`);
  }
  if (!brief.cta || !String(brief.cta.url || "").startsWith("/find-locations/")) {
    fail(`${context} must link to the existing Business Profile flow`);
  }

  for (const fit of brief.bestFits) {
    if (!districtExists(fit.districtSlug, brief.market.marketId)) {
      fail(`${context} references invalid district ${fit.districtSlug}`);
    }
    if (!fit.districtPath) {
      fail(`${context} missing district path for ${fit.districtSlug}`);
    }
    if (!fit.summary || !Array.isArray(fit.reasons) || fit.reasons.length !== 3) {
      fail(`${context} has incomplete Best Fit content for ${fit.districtSlug}`);
    }
    for (const building of fit.representativeBuildings || []) {
      if (!building.canonicalUrl || !building.canonicalUrl.startsWith("/commercial-real-estate/building/")) {
        fail(`${context} has invalid representative building URL for ${building.name}`);
      }
    }
  }

  if (brief.isIndexable) {
    if (!["published", "ready"].includes(brief.publicationReadiness)) {
      fail(`${context} is indexable without ready/published state`);
    }
    if (brief.quality.representativeBuildingCount < 2) {
      fail(`${context} is indexable with fewer than two representative buildings`);
    }
    if (!brief.internalLinks.districts.length) {
      fail(`${context} is indexable without district links`);
    }
    if (!brief.internalLinks.buildings.length) {
      fail(`${context} is indexable without representative building links`);
    }
  }

  if (brief.market.marketId === "denver" && brief.isIndexable) {
    fail(`${context} Denver Phase 1 pages must be held from indexable publication`);
  }

  if (brief.market.marketId === "san-francisco" && !brief.isIndexable) {
    fail(`${context} San Francisco Phase 1 pages should be published`);
  }

  if (brief.market.marketId === "san-francisco") {
    const allowed = new Set(sfOfficeModel.districtOrder || []);
    for (const fit of brief.bestFits) {
      if (!allowed.has(fit.districtSlug)) {
        fail(`${context} uses ${fit.districtSlug}, which is not in the San Francisco Office model`);
      }
    }
  }

  for (const term of DEBUG_TERMS) {
    if (text.includes(term)) fail(`${context} exposes debug/resolver term: ${term}`);
  }

  for (const term of UNSUPPORTED_CLAIMS) {
    if (text.includes(term)) fail(`${context} may contain unsupported live-market claim: ${term}`);
  }

  if (/cheap|cheapest|low rent|asking rate/i.test(text)) {
    fail(`${context} contains unsupported budget/current-cost ranking language`);
  }

  const fitSummaries = brief.bestFits.map((fit) => fit.summary);
  if (hasDuplicate(fitSummaries)) {
    fail(`${context} has duplicate Best Fit summaries`);
  }
}

const published = briefs.filter((brief) => brief.isIndexable);
const held = briefs.filter((brief) => !brief.isIndexable);
const summaryPairs = briefs.map((brief) => clean(brief.executiveSummary[0]).toLowerCase());
if (hasDuplicate(summaryPairs)) {
  fail("Executive summaries must not be exact duplicates");
}

if (published.length !== 5) {
  fail(`Expected 5 published/indexable Business Briefs, found ${published.length}`);
}

if (held.length !== 5) {
  fail(`Expected 5 held/noindex Business Briefs, found ${held.length}`);
}

console.log("Business Brief QA");
console.log(`- total briefs: ${briefs.length}`);
console.log(`- published/indexable: ${published.length}`);
console.log(`- held/noindex: ${held.length}`);
console.log(`- route convention: ${businessBriefs.routeConvention}`);

if (failures.length) {
  console.error("\nFailures:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log("Business Brief QA passed.");
