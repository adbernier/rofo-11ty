#!/usr/bin/env node

const businessBriefs = require("../_data/businessBriefs.js");
const businessBriefRedirects = require("../_data/businessBriefRedirects.js");
const spaceTypePages = require("../_data/spaceTypePages.js");
const businessArchetypes = require("../_data/businessArchetypes.js");
const locationKnowledgeGraph = require("../_data/locationKnowledgeGraph.js");
const neighborhoodPages = require("../_data/neighborhoodPages.js");
const sfOfficeModel = require("../_data/sfOfficeRecommendationModel.js");
const { resolveDenverOfficeRecommendation } = require("../lib/recommendations/denver-office-recommendation-resolver.js");

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

const DENVER_ARCHETYPE_PROFILES = {
  "growing-technology-company": {
    city: "Denver",
    spaceType: "Office",
    businessType: "technology",
    recruitingImportance: "high",
    expectedGrowth: "significant",
    officeEnvironment: "modern and polished",
  },
  "client-facing-professional-services": {
    city: "Denver",
    spaceType: "Office",
    businessType: "professional services",
    clientVisitFrequency: "often",
    officeEnvironment: "traditional and professional",
    commuteOrientation: "central city",
  },
  "law-firm": {
    city: "Denver",
    spaceType: "Office",
    businessType: "law firm",
    clientVisitFrequency: "often",
    officeEnvironment: "traditional and professional",
  },
  "healthcare-organization": {
    city: "Denver",
    spaceType: "Office",
    businessType: "healthcare",
    operationalUse: ["administrative office", "healthcare services"],
    parkingImportance: "high",
  },
  "nonprofit-mission-driven-organization": {
    city: "Denver",
    spaceType: "Office",
    businessType: "nonprofit",
    transitImportance: "high",
  },
};

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
const readinessSummary = businessBriefs.readinessSummary || {};
const byId = new Map(briefs.map((brief) => [brief.id, brief]));
const publicDistrictRoutes = new Set(
  neighborhoodPages
    .filter((page) => !page.noindex)
    .map((page) => page.canonical_neighborhood_path)
    .filter(Boolean)
);

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
  const canonicalParentUrl = `/commercial-real-estate/${brief.market.state}/${brief.market.marketSlug}/office-space/`;
  const canonicalBriefUrl = `${canonicalParentUrl}${brief.archetype.slug}/`;
  if (brief.url !== canonicalBriefUrl) {
    fail(`${context} has invalid canonical Business Brief URL; expected ${canonicalBriefUrl}`);
  }
  if (brief.canonicalUrl !== brief.url) {
    fail(`${context} canonicalUrl must match migrated URL`);
  }
  if (brief.internalLinks.propertyType !== canonicalParentUrl) {
    fail(`${context} property-type parent link must use canonical hierarchy`);
  }
  const oldRoute = `/${brief.market.marketSlug}/office/${brief.archetype.slug}/`;
  const oldRouteNoSlash = oldRoute.slice(0, -1);
  if (!Array.isArray(brief.legacyUrls) || !brief.legacyUrls.includes(oldRoute) || !brief.legacyUrls.includes(oldRouteNoSlash)) {
    fail(`${context} must expose legacy URLs for redirects`);
  }
  if (!Array.isArray(brief.breadcrumbs) || brief.breadcrumbs.length !== 5) {
    fail(`${context} must expose canonical breadcrumbs`);
  } else {
    const breadcrumbUrls = brief.breadcrumbs.map((crumb) => crumb.url);
    if (breadcrumbUrls[1] !== `/commercial-real-estate/${brief.market.state}/`) {
      fail(`${context} breadcrumb state URL must use canonical state route`);
    }
    if (breadcrumbUrls[2] !== brief.market.route) {
      fail(`${context} breadcrumb market URL must use canonical market route`);
    }
    if (breadcrumbUrls[3] !== canonicalParentUrl) {
      fail(`${context} breadcrumb property-type URL must use canonical office-space route`);
    }
    if (breadcrumbUrls[4] !== brief.url) {
      fail(`${context} breadcrumb page URL must use migrated Business Brief route`);
    }
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
    if (brief.isIndexable && !publicDistrictRoutes.has(fit.districtPath)) {
      fail(`${context} links to an unpublished district route: ${fit.districtPath}`);
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

  if (brief.market.marketId === "denver") {
    const profile = DENVER_ARCHETYPE_PROFILES[brief.archetype.id];
    if (!profile) {
      fail(`${context} missing Denver resolver-alignment profile`);
    } else {
      const result = resolveDenverOfficeRecommendation(profile);
      const resolverIds = new Set((result.currentCandidates || []).map((item) => item.districtId));
      const shortlistIds = new Set((result.shortlist || []).map((item) => item.districtId));
      for (const fit of brief.bestFits) {
        if (!resolverIds.has(fit.districtSlug) && !shortlistIds.has(fit.districtSlug)) {
          fail(`${context} uses ${fit.districtSlug}, which is not supported by the Denver Office resolver for ${brief.archetype.id}`);
        }
      }
      if (brief.isIndexable && brief.id === "denver:office:healthcare-organization") {
        fail(`${context} healthcare brief must remain held until Denver healthcare-office comparison evidence improves`);
      }
      if (brief.isIndexable && result.ignoredSignals.length) {
        fail(`${context} published Denver resolver-alignment profile should not depend on ignored economics`);
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
const redirects = businessBriefRedirects || [];
const summaryPairs = briefs.map((brief) => clean(brief.executiveSummary[0]).toLowerCase());
if (hasDuplicate(summaryPairs)) {
  fail("Executive summaries must not be exact duplicates");
}

const publishedDenver = published.filter((brief) => brief.market.marketId === "denver");
const heldDenver = held.filter((brief) => brief.market.marketId === "denver");
const officeHubRoutes = new Set(
  (spaceTypePages || [])
    .filter((entry) => entry.page_slug === "office-space")
    .map((entry) => `/commercial-real-estate/${entry.state_abbr}/${entry.city_slug}/${entry.page_slug}/`)
);

if (published.length !== 9) {
  fail(`Expected 9 published/indexable Business Briefs after Denver Phase 1B, found ${published.length}`);
}

if (held.length !== 1) {
  fail(`Expected 1 held/noindex Business Brief after Denver Phase 1B, found ${held.length}`);
}

if (publishedDenver.length !== 4) {
  fail(`Expected 4 published/indexable Denver Business Briefs, found ${publishedDenver.length}`);
}

if (heldDenver.length !== 1 || heldDenver[0].id !== "denver:office:healthcare-organization") {
  fail("Expected only Denver healthcare organization brief to remain held/noindex");
}

for (const brief of published) {
  if (!officeHubRoutes.has(brief.internalLinks.propertyType)) {
    fail(`${brief.id} published Business Brief parent Office Space route does not exist: ${brief.internalLinks.propertyType}`);
  }
}

for (const brief of held) {
  if (brief.isIndexable) fail(`${brief.id} held Business Brief must not be indexable`);
}

const redirectKeys = new Set();
for (const redirect of redirects) {
  const key = `${redirect.from} ${redirect.to}`;
  if (redirectKeys.has(key)) fail(`Duplicate Business Brief redirect: ${key}`);
  redirectKeys.add(key);
  if (redirect.status !== 301) fail(`Business Brief redirect must be permanent: ${key}`);
  if (!redirect.from || redirect.from.includes("/commercial-real-estate/")) {
    fail(`Business Brief redirect source must be a legacy non-canonical URL: ${redirect.from}`);
  }
  if (!redirect.to || !redirect.to.startsWith("/commercial-real-estate/")) {
    fail(`Business Brief redirect target must be canonical: ${redirect.to}`);
  }
  if (redirect.from === redirect.to) {
    fail(`Business Brief redirect creates a self-redirect: ${key}`);
  }
}

const expectedRedirectCount = briefs.reduce((sum, brief) => sum + (brief.legacyUrls || []).length, 0);
if (redirects.length !== expectedRedirectCount) {
  fail(`Expected ${expectedRedirectCount} Business Brief redirects, found ${redirects.length}`);
}

for (const brief of briefs) {
  for (const legacy of brief.legacyUrls || []) {
    const match = redirects.find((redirect) => redirect.from === legacy && redirect.to === brief.url && redirect.status === 301);
    if (!match) fail(`${brief.id} missing permanent redirect from ${legacy} to ${brief.url}`);
  }
}

if (!readinessSummary.byMarket || !readinessSummary.byMarket.denver) {
  fail("Business Brief readiness summary must include Denver");
} else {
  const denverSummary = readinessSummary.byMarket.denver;
  if (denverSummary.published !== 4 || denverSummary.hold !== 1) {
    fail(`Denver readiness summary should report 4 published and 1 hold, found ${denverSummary.published || 0} published and ${denverSummary.hold || 0} hold`);
  }
}

console.log("Business Brief QA");
console.log(`- total briefs: ${briefs.length}`);
console.log(`- published/indexable: ${published.length}`);
console.log(`- held/noindex: ${held.length}`);
console.log(`- Denver published/indexable: ${publishedDenver.length}`);
console.log(`- Denver held/noindex: ${heldDenver.length}`);
console.log(`- route convention: ${businessBriefs.routeConvention}`);
console.log(`- redirects: ${redirects.length}`);

if (failures.length) {
  console.error("\nFailures:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log("Business Brief QA passed.");
