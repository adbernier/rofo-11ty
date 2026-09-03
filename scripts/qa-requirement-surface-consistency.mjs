import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";

const root = path.resolve(new URL("..", import.meta.url).pathname);
const require = createRequire(import.meta.url);
const temp = fs.mkdtempSync(path.join(os.tmpdir(), "rofo-requirement-surface-"));
function bundle(source, name) {
  const output = path.join(temp, name);
  execFileSync(path.join(root, "node_modules/esbuild/bin/esbuild"), [path.join(root, source), "--bundle", "--platform=node", "--format=cjs", `--outfile=${output}`], { stdio: "pipe" });
  return require(output);
}

const snapshotModule = bundle("functions/_shared/project-snapshot.js", "snapshot.cjs");
const legacyRenderer = bundle("functions/location-brief/[publicId].js", "legacy-renderer.cjs");
const leadModule = bundle("functions/api/leads/_shared.js", "leads.cjs");
const {
  BROKER_READINESS,
  assessBrokerReadiness,
  buildProjectSnapshotFromBrief,
  buildProjectSnapshotFromLead,
  locationBriefReferenceText,
  projectSnapshotTextLines,
} = snapshotModule;

const palmettoBrief = {
  id: "sanitized-palmetto-brief",
  publicId: "LB-PALMETTO-SANITIZED",
  createdAt: "2026-09-01T12:00:00.000Z",
  status: "submitted",
  searchProfile: {
    locations: [{ label: "Palmetto", city: "Palmetto", state: "FL", type: "city" }],
    spaceType: "Office",
    size: "",
    timing: "asap",
    locationIntent: "compare",
    businessType: "design_creative",
    expectedGrowth: "some",
    operationalUse: ["team_collaboration"],
  },
  marketPath: { recommendedPath: [], compareWith: [], questionsToValidate: [] },
  priorities: [],
  notes: "",
  contact: { company: "Sanitized Painting Company" },
  liveMarketInvestigation: {
    investigationIntent: true,
    city: "Palmetto",
    state: "FL",
    districtName: "",
    representativeBuildings: [],
    includeCompetitiveBuildings: true,
    investigationScope: { currentAvailability: true, comparableBuildings: true },
    brokerPreference: "research_first",
    confirmedRequirements: {
      businessType: "design_creative",
      businessTypeOther: "Subcontractor Painting",
      spaceType: "Office",
      approximateSize: "2,500–5,000 SF",
      timing: "asap",
      locationIntent: "Compare with nearby markets",
    },
    additionalNotes: "",
  },
};

const snapshot = buildProjectSnapshotFromBrief(palmettoBrief);
assert.equal(snapshot.market, "Palmetto, FL");
assert.equal(snapshot.propertyType, "Office");
assert.equal(snapshot.businessUse, "Subcontractor Painting");
assert.equal(snapshot.businessCategory, "Design / creative");
assert.equal(snapshot.approximateSize, "2,500–5,000 SF");
assert.equal(snapshot.timing, "As soon as possible");
assert.equal(snapshot.growth, "Some growth");
assert.deepEqual(snapshot.operationalUse, ["Team collaboration"]);
assert.equal(snapshot.locationIntent, "Compare with nearby markets");
assert.equal(snapshot.researchPreference, "Research first; contact me with findings");

const customerHtml = legacyRenderer.renderLocationBriefPage(palmettoBrief);
for (const expected of ["Palmetto, FL", "Office", "Subcontractor Painting", "2,500–5,000 SF", "Some growth", "Team collaboration", "Compare with nearby markets", "Research first; contact me with findings"]) {
  assert(customerHtml.includes(expected), `Customer Brief should render ${expected}`);
}
for (const forbidden of ["Size to confirm", "team_collaboration", ">some<", "district-level only", "District-level review only"]) {
  assert(!customerHtml.includes(forbidden), `Customer Brief must not render ${forbidden}`);
}

const historicalHtml = legacyRenderer.renderLocationBriefPage({
  publicId: "LB-HISTORICAL-SANITIZED",
  createdAt: "2025-01-01T12:00:00.000Z",
  status: "draft",
  searchProfile: { locations: [{ city: "Palmetto", state: "FL" }], spaceType: "Office", size: "Under 2,500 sqft", timing: "exploring" },
  marketPath: { recommendedPath: [], compareWith: [], questionsToValidate: [] },
  priorities: [], notes: "", contact: {},
});
assert(historicalHtml.includes("Under 2,500 SF"));
assert(historicalHtml.includes("Just exploring"));

const snapshotLines = projectSnapshotTextLines(snapshot).join("\n");
for (const expected of ["Business / Use: Subcontractor Painting", "Category: Design / creative", "Approximate Size: 2,500–5,000 SF", "Growth: Some growth", "Operating / Work Pattern: Team collaboration", "Research Approach: Research first; contact me with findings"]) {
  assert(snapshotLines.includes(expected), `Internal alert snapshot should render ${expected}`);
}
assert(!snapshotLines.includes("team_collaboration"));

const lead = {
  id: "sanitized-palmetto-lead",
  lead_type: "live_market_investigation",
  qualification_status: "qualified_requirement",
  name: "Sanitized User",
  email: "sanitized@example.invalid",
  company: "Sanitized Painting Company",
  market: "Palmetto",
  city: "Palmetto",
  state: "FL",
  requested_space_type: "Office",
  space_type: "Office",
  business_type: "design_creative",
  business_use: "Subcontractor Painting",
  space_needed: "2,500–5,000 SF",
  move_timing: "asap",
  location_intent: "compare",
  location_brief_url: "https://example.invalid/location-brief/LB-PALMETTO-SANITIZED/",
  location_brief_public_id: "LB-PALMETTO-SANITIZED",
  project_snapshot_json: JSON.stringify(snapshot),
};
const leadSnapshot = buildProjectSnapshotFromLead(lead);
assert.deepEqual(leadSnapshot, snapshot, "Persisted lead projection should retain the canonical Project Snapshot facts");
assert.equal(assessBrokerReadiness(lead).status, BROKER_READINESS.READY, "Palmetto broker-readiness behavior must remain unchanged");

const officeFinder = leadModule.buildOfficeFinderPayload(lead, {});
assert.equal(officeFinder.SqFt, "5000", "Existing OfficeFinder upper-bound convention must remain unchanged");
for (const expected of ["Subcontractor Painting", "2,500–5,000 SF", "Some growth", "Team collaboration", "Compare with nearby markets"]) {
  assert(officeFinder.Comments.includes(expected), `Fulfillment projection should render ${expected}`);
}
assert(!officeFinder.Comments.includes("team_collaboration"));
assert.match(locationBriefReferenceText({ url: lead.location_brief_url, topDistricts: [] }), /Recommendation context\n- Investigation required; no shortlist was generated\./);
assert(!locationBriefReferenceText({ url: lead.location_brief_url, topDistricts: [] }).includes("Best Fits"));

const source = {
  dashboard: fs.readFileSync(path.join(root, "functions/admin/leads.js"), "utf8"),
  submit: fs.readFileSync(path.join(root, "functions/api/location-brief/submit.js"), "utf8"),
  shared: fs.readFileSync(path.join(root, "functions/api/location-brief/_shared.js"), "utf8"),
};
assert(source.dashboard.includes('field("Recommendation", "Investigation required")'));
assert(!source.dashboard.includes('field("Best Fits"'));
assert(!source.dashboard.includes('field("Selected district", snapshot.selectedDistrict || lead.investigation_district, { showEmpty: true })'));
assert(!source.dashboard.includes('lead.investigation_buildings || "District-level only"'));
assert(source.dashboard.includes('field("Growth", snapshot.growth)'));
assert(source.dashboard.includes('field("Research approach", snapshot.researchPreference)'));
assert(source.submit.includes("const snapshotLines = projectSnapshotTextLines(projectSnapshot)"));
assert(!source.submit.includes("Selected representative buildings: district-level only"));
assert(!source.shared.includes("District-level review only"));

fs.rmSync(temp, { recursive: true, force: true });
console.log("Requirement surface consistency QA passed.");
