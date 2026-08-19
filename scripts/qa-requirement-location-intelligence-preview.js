const assert = require("node:assert/strict");
const fs = require("node:fs");
const { createLocationIntelligencePreview } = require("../lib/requirements/requirement-location-intelligence-preview");

function criterion(dimension, value, status = "PREFERRED") {
  return { id: dimension, dimension, value: { text: Array.isArray(value) ? "" : String(value), number: null, boolean: null, list: Array.isArray(value) ? value : [] }, status };
}

function requirement(overrides = {}) {
  const base = {
    propertyTypes: ["office"],
    activities: ["work", "meet_collaborate", "host_visitors"],
    businessContext: { summary: "Office business" },
    locationLogic: {
      marketAnchor: { marketId: "san-francisco", geographyId: "san-francisco", displayName: "San Francisco, CA" },
      specificPreference: { candidateDistrictIds: [], candidateDistrictNames: [], informalText: "" },
    },
    criteria: [],
  };
  return { ...base, ...overrides, locationLogic: { ...base.locationLogic, ...(overrides.locationLogic || {}), specificPreference: { ...base.locationLogic.specificPreference, ...(overrides.locationLogic && overrides.locationLogic.specificPreference || {}) } } };
}

const scenarios = {
  A: requirement({ criteria: [criterion("universal.location.employee_origins", ["San Francisco", "East Bay"]), criterion("universal.access.transit_importance", "Public transit is very important", "REQUIRED"), criterion("universal.access.parking_importance", "Parking is not important", "FLEXIBLE"), criterion("universal.location.customer_origins", ["San Francisco"]), criterion("office.access.client_visits", "Clients visit frequently", "REQUIRED")] }),
  B: requirement({ criteria: [criterion("universal.location.employee_origins", ["San Francisco", "Marin / North Bay"]), criterion("universal.access.transit_importance", "Public transit is helpful"), criterion("universal.access.parking_importance", "Convenient parking is very important", "REQUIRED"), criterion("office.access.client_visits", "Clients visit frequently", "REQUIRED")] }),
  C: requirement({ criteria: [criterion("universal.location.employee_origins", ["San Francisco", "Peninsula", "South Bay"]), criterion("universal.location.customer_origins", ["Peninsula", "South Bay"]), criterion("office.access.client_visits", "Clients visit frequently", "REQUIRED")] }),
  D: requirement({ locationLogic: { specificPreference: { candidateDistrictIds: ["soma", "south-beach"], candidateDistrictNames: ["SoMa", "South Beach"] } }, criteria: [criterion("universal.location.employee_origins", ["San Francisco", "East Bay"]), criterion("universal.access.transit_importance", "Public transit is very important", "REQUIRED"), criterion("universal.access.parking_importance", "Parking is not important", "FLEXIBLE"), criterion("office.access.client_visits", "Clients visit frequently", "REQUIRED")] }),
  E: requirement({ criteria: [criterion("universal.location.employee_origins", ["San Francisco", "East Bay"]), criterion("universal.access.transit_importance", "Public transit is very important", "REQUIRED"), criterion("universal.access.parking_importance", "Parking is not important", "FLEXIBLE"), criterion("office.access.client_visits", "Clients rarely or never visit", "FLEXIBLE")] }),
};

const results = Object.fromEntries(Object.entries(scenarios).map(([id, item]) => [id, createLocationIntelligencePreview(item)]));
Object.entries(results).forEach(([id, result]) => {
  assert.equal(result.supported, true, `Scenario ${id} should use SF Office.`);
  assert.equal(result.recommendations.length, 3, `Scenario ${id} should expose a deterministic top three.`);
  assert(!result.projection.resolverInput.districtAnchor, `Scenario ${id} must not project a candidate district as an anchor.`);
  result.recommendations.forEach((item) => item.explanation.signals.forEach((signal) => assert(result.result.profileSignalsUsed.includes(signal), `Scenario ${id} explanation cited unsupported signal ${signal}.`)));
});

assert.deepEqual(results.D.recommendations.map((item) => item.districtId), results.A.recommendations.map((item) => item.districtId), "Candidate districts must not filter or alter rankings.");
assert.equal(results.D.candidateComparisons.length, 2, "Candidate districts should remain available for comparison.");
assert(results.A.projection.unconsumedSignals.some((item) => item.sourceDimension === "universal.location.customer_origins"), "Client origins must be explicit unconsumed context.");

const informal = createLocationIntelligencePreview(requirement({ locationLogic: { specificPreference: { informalText: "near the Ferry Building" } } }));
assert(informal.projection.unconsumedSignals.some((item) => item.treatment === "unresolved"), "Informal geography must remain unresolved.");

const unsupported = createLocationIntelligencePreview(requirement({ locationLogic: { marketAnchor: { marketId: "orlando", displayName: "Orlando, FL" } } }));
assert.equal(unsupported.supported, false);
assert.match(unsupported.message, /does not yet have a recommendation model connected/);

const conflict = createLocationIntelligencePreview(requirement({ criteria: [criterion("universal.location.employee_origins", ["East Bay", "Marin / North Bay"])] }));
assert(conflict.projection.conflicts.some((item) => item.sourceDimension === "universal.location.employee_origins"), "Unsafe multi-direction commute mapping must be rejected.");
assert(!conflict.projection.resolverInput.commuteOrientation, "Rejected commute mapping must not leak into resolver input.");

const prototype = fs.readFileSync("pages/prototype/requirement-v1.njk", "utf8");
const client = fs.readFileSync("js/requirement-prototype.js", "utf8");
assert.match(prototype, /robots: noindex,nofollow/);
assert.match(prototype, /See my location recommendations/);
const fetches = client.match(/fetch\s*\(/g) || [];
assert.equal(fetches.length, 2, "Only explicit operator v2 persistence/edit hydration may use the network from this private client.");
assert(client.includes("/api/location-brief-v2/create") && !client.includes("/api/location-brief/submit"), "Normal private preview must remain session-local and commercially disconnected.");
assert.equal(fs.existsSync("lib/recommendations/sf-office-recommendation-resolver.js"), true, "Existing resolver remains the integration target.");

console.log("Requirement Location Intelligence preview QA passed.");
Object.entries(results).forEach(([id, result]) => console.log(`${id}: ${result.recommendations.map((item) => item.districtName).join(" > ")} | used=${result.result.profileSignalsUsed.join(",") || "none"}`));

module.exports = { scenarios, results };
