"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const ROOT = path.join(__dirname, "..");
const temp = fs.mkdtempSync(path.join(os.tmpdir(), "rofo-brief-density-"));
function bundle(source, name) {
  const output = path.join(temp, name);
  execFileSync(path.join(ROOT, "node_modules/esbuild/bin/esbuild"), [path.join(ROOT, source), "--bundle", "--platform=node", "--format=cjs", `--outfile=${output}`], { stdio: "pipe" });
  return require(output);
}
const legacy = bundle("functions/location-brief/[publicId].js", "legacy.cjs");
const v2 = bundle("functions/operator/location-brief-v2/[publicId].js", "v2.cjs");

const sparseLegacy = legacy.renderLocationBriefPage({
  publicId: "LB-SPARSE1", createdAt: "2026-08-28T12:00:00.000Z", status: "submitted",
  searchProfile: {
    locations: [{ label: "Manchester", city: "Manchester", state: "NH" }],
    spaceType: "Retail", size: "2,000–5,000 SF", timing: "6_12_months", locationIntent: "compare",
  },
  marketPath: { title: "Recommended starting point", primaryLocationLabel: "Manchester", recommendedPath: [{ label: "Manchester", summary: "", strengths: [], tradeoffs: [], bestFor: [] }], compareWith: [], questionsToValidate: [] },
  priorities: [], notes: "", contact: {},
  liveMarketInvestigation: {
    investigationIntent: true, city: "Manchester", state: "NH", districtName: "", representativeBuildings: [],
    includeCompetitiveBuildings: true, investigationScope: { currentAvailability: true, comparableBuildings: true },
    brokerPreference: "research_first", confirmedRequirements: { timing: "6_12_months" }, additionalNotes: "",
  },
});
for (const expected of ["<h1>Manchester, NH Retail Search</h1>", "<h2>Your search</h2>", "Starting market", "Manchester, NH", "2,000–5,000 SF", "6–12 months", "Compare with nearby markets", "<h2>What Rofo will investigate</h2>", "Current availability", "Comparable buildings", "Awaiting Expert Review"]) assert(sparseLegacy.includes(expected), `Sparse legacy Brief should render ${expected}`);
for (const forbidden of ["Best Fits", "Recommended starting point", "Why these markets", "No priorities selected", "Questions for expert review", "None provided", "Representative buildings may be added", "Expert notes", "District-level only", "Competitive buildings", "Intent Guidance", "6_12_months"]) assert(!sparseLegacy.includes(forbidden), `Sparse legacy Brief must omit ${forbidden}`);
assert.equal((sparseLegacy.match(/<section class="location-brief-card/g) || []).length, 2, "Sparse legacy Brief should contain only search and investigation cards when no contact is supplied.");

const criterion = (dimension, raw) => ({ dimension, status: "PREFERRED", value: { text: Array.isArray(raw) ? "" : String(raw), list: Array.isArray(raw) ? raw : [] } });
function requirement({ marketId, market, state, propertyType, activities, criteria = [], hasPreference = false, size = "", timing = "" }) {
  return {
    schemaVersion: "requirement:v1", propertyTypes: [propertyType], activities, businessContext: { summary: "Sanitized business" },
    sizeCapacity: { summary: size }, timing: { summary: timing },
    locationLogic: { marketAnchor: { marketId, geographyId: marketId, displayName: market, city: market, state }, specificPreference: { hasPreference, candidateDistrictIds: [], candidateDistrictNames: [] } },
    criteria,
  };
}
function v2Bundle(req, snapshot) {
  return {
    brief: { publicId: "LB2-00112233445566778899AABB", lifecycleStage: "LOCATION_INVESTIGATE" },
    entryContext: { marketId: req.locationLogic.marketAnchor.marketId, propertyType: req.propertyTypes[0], sourceType: "city" },
    currentRevision: { id: "revision-1", revisionNumber: 1, requirement: req }, currentSnapshot: snapshot,
    candidates: [], revisions: [], snapshots: [],
  };
}
const emptySnapshot = { id: "snapshot-1", readiness: "INVESTIGATE", shortlist: [], candidateAssessments: [], comparisonAlternatives: [], intelligenceGaps: [] };
const sparseRequirement = requirement({ marketId: "manchester", market: "Manchester", state: "NH", propertyType: "retail_service", activities: ["host_visitors", "sell_serve"], size: "2,000–5,000 SF", timing: "6_12_months", hasPreference: false });
const sparseV2 = v2.renderLocationBriefV2Page(v2Bundle(sparseRequirement, emptySnapshot), true, false, { publicExperience: true });
for (const expected of ["Starting market", "Manchester, NH", "Space type", "Retail", "2,000–5,000 SF", "6–12 months", "Compare with nearby markets", "What Rofo will investigate", "Current availability", "Relevant nearby markets", "Comparable properties", "Find Spaces That Fit →"]) assert(sparseV2.includes(expected), `Sparse v2 Brief should render ${expected}`);
for (const forbidden of ["What matters for this search", "Locations worth investigating", "Recommended", "Representative buildings", "No priorities", "6_12_months"]) assert(!sparseV2.includes(forbidden), `Sparse v2 Brief must omit ${forbidden}`);

const richRequirement = requirement({
  marketId: "nashville", market: "Nashville", state: "TN", propertyType: "retail_service",
  activities: ["host_visitors", "sell_serve", "prepare_produce_food"], size: "2,000–5,000 SF", timing: "within_3_months",
  criteria: [criterion("retail.customer.destination_visibility", "Visibility materially supports customer visits"), criterion("retail.access.delivery_service", "Regular deliveries")],
});
const richUniversal = v2.renderLocationBriefV2Page(v2Bundle(richRequirement, emptySnapshot), true, false, { publicExperience: true });
assert(richUniversal.includes("What matters for this search"));
assert(richUniversal.includes("Visibility and storefront"));
assert(richUniversal.includes("What Rofo will investigate"));
assert(!richUniversal.includes("Locations worth investigating"));

const certifiedRequirement = requirement({
  marketId: "san-francisco", market: "San Francisco", state: "CA", propertyType: "retail_service",
  activities: ["host_visitors", "sell_serve"], criteria: [criterion("retail.customer.destination_visibility", "Visibility materially supports customer visits")],
});
const certifiedSnapshot = {
  id: "snapshot-sf", readiness: "FULL", candidateAssessments: [], comparisonAlternatives: [], intelligenceGaps: [],
  shortlist: [{
    districtId: "valencia-street", districtName: "Valencia Street", strengths: ["Reviewed customer environment"], tradeoffs: ["Property details require verification"],
    propertyTypeFit: { summary: "A supported Retail environment." },
    presentation: { representativeBuildings: [{ name: "Representative storefront environment", canonicalUrl: "/commercial-real-estate/CA/san-francisco/valencia-street/", representativeReason: "Illustrates the reviewed commercial character." }] },
  }],
};
const certified = v2.renderLocationBriefV2Page(v2Bundle(certifiedRequirement, certifiedSnapshot), true, false, { publicExperience: true });
for (const expected of ["Locations worth investigating", "Valencia Street", "Why consider this location", "Things to weigh", "Representative buildings", "Representative storefront environment"]) assert(certified.includes(expected), `Certified Brief should retain ${expected}`);

const v2Source = fs.readFileSync(path.join(ROOT, "functions/operator/location-brief-v2/[publicId].js"), "utf8");
assert(v2Source.includes("@media(max-width:600px)"));
assert(v2Source.includes(".lb2-matter-grid,.lb2-investigate-list{grid-template-columns:1fr}"));
assert(!/<h[1-6][^>]*>\s*<\/h[1-6]>/.test(sparseLegacy));
assert(!/<h[1-6][^>]*>\s*<\/h[1-6]>/.test(sparseV2));

fs.rmSync(temp, { recursive: true, force: true });
console.log("Location Brief signal-to-noise QA passed.");
