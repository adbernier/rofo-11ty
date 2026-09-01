import assert from "node:assert/strict";
import fs from "node:fs";

const root = new URL("../", import.meta.url);
const snapshotSource = fs.readFileSync(new URL("functions/_shared/project-snapshot.js", root), "utf8");
const snapshotModule = await import(`data:text/javascript;base64,${Buffer.from(snapshotSource).toString("base64")}`);
const {
  BROKER_READINESS,
  assessBrokerReadiness,
  buildProjectSnapshotFromLead,
  projectSnapshotTextLines,
} = snapshotModule;

function lead(overrides = {}) {
  return {
    lead_type: "live_market_investigation",
    qualification_status: "qualified_requirement",
    market: "Example Market",
    city: "Example Market",
    state: "CA",
    requested_space_type: "Office",
    business_type: "professional_services",
    business_use: "Financial Services",
    space_needed: "Under 2,500 SF",
    move_timing: "asap",
    email: "sanitized@example.invalid",
    ...overrides,
  };
}

const trenton = lead({
  market: "Trenton",
  city: "Trenton",
  state: "MI",
  requested_space_type: "Flex",
  effective_space_type: "Flex",
  business_type: "professional_services",
  business_use: "Professional Services",
  location_profile_features: "Office + warehouse",
  investigation_headcount: "1",
  location_intent: "compare",
  company: "",
  phone: "",
});
const trentonSnapshot = buildProjectSnapshotFromLead(trenton);
const trentonReadiness = assessBrokerReadiness(trenton);
assert.deepEqual(trentonSnapshot.operationalFeatures, ["Office + warehouse"]);
assert.equal(trentonReadiness.status, BROKER_READINESS.NEEDS_QUALIFICATION);
assert.deepEqual(trentonReadiness.gaps.map((gap) => gap.code), ["specific_business_use"]);
assert.match(trentonReadiness.summary, /Industrial\/Flex/);
assert.match(trentonReadiness.summary, /Office \+ warehouse/);
assert(projectSnapshotTextLines(trentonSnapshot).includes("Operational Features: Office + warehouse"));
assert(projectSnapshotTextLines(trentonSnapshot).includes("Location Approach: Compare with nearby markets"));

assert.equal(assessBrokerReadiness(lead({
  location_profile_operational_use: "client_meetings, quiet_focused_work",
})).status, BROKER_READINESS.READY, "specific Office use and work pattern should be broker ready");

assert.equal(assessBrokerReadiness(lead({
  requested_space_type: "Retail",
  effective_space_type: "Retail",
  business_type: "neighborhood_service",
  business_use: "Barber",
  location_profile_features: "Visibility, Parking",
  phone: "",
  company: "",
})).status, BROKER_READINESS.READY, "small specific Retail requirements should not need phone or company");

assert.equal(assessBrokerReadiness(lead({
  requested_space_type: "Retail",
  effective_space_type: "Retail",
  business_type: "other",
  business_use: "storefront",
  location_profile_features: "Visibility",
})).status, BROKER_READINESS.NEEDS_QUALIFICATION, "generic storefront is not a specific Retail use");

assert.equal(assessBrokerReadiness(lead({
  requested_space_type: "Industrial / Warehouse",
  effective_space_type: "Industrial / Warehouse",
  business_type: "other",
  business_use: "Light manufacturer",
  location_profile_features: "Loading, Power",
})).status, BROKER_READINESS.READY, "specific Industrial use plus an operating signal should be broker ready");

const thinFlex = assessBrokerReadiness(lead({
  requested_space_type: "Flex",
  effective_space_type: "Flex",
  business_use: "Professional Services",
  location_profile_features: "",
}));
assert.equal(thinFlex.status, BROKER_READINESS.NEEDS_QUALIFICATION);
assert.deepEqual(thinFlex.gaps.map((gap) => gap.code), ["specific_business_use", "operating_need"]);

assert.equal(assessBrokerReadiness(lead({ move_timing: "" })).status, BROKER_READINESS.INSUFFICIENT);
assert.equal(assessBrokerReadiness(lead({
  requested_space_type: "Flex",
  effective_space_type: "Flex",
  business_use: "Dealership",
  location_profile_features: "Loading",
  business_classification_status: "investigate",
})).status, BROKER_READINESS.NEEDS_QUALIFICATION, "specialized ambiguous use should remain conservative");

const files = {
  browserProfile: fs.readFileSync(new URL("js/search-profile.js", root), "utf8"),
  browserBrief: fs.readFileSync(new URL("js/recommendation-context.js", root), "utf8"),
  briefNormalizer: fs.readFileSync(new URL("functions/api/location-brief/_shared.js", root), "utf8"),
  briefSubmit: fs.readFileSync(new URL("functions/api/location-brief/submit.js", root), "utf8"),
  leadShared: fs.readFileSync(new URL("functions/api/leads/_shared.js", root), "utf8"),
  admin: fs.readFileSync(new URL("functions/admin/leads.js", root), "utf8"),
};
assert(files.browserProfile.includes("features: selectedFeatureValues()"));
assert(files.browserBrief.includes("features: Array.isArray(value.features)"));
assert(files.briefNormalizer.includes("features: cleanArray(value.features, 12)"));
assert(files.briefSubmit.includes("location_profile_features: cleanArray(businessProfile.features, 12).join"));
assert(files.leadShared.includes("OFFICEFINDER_COMMENTS_MAX_LENGTH"));
assert(files.leadShared.includes("projectSnapshotTextLines(projectSnapshot)"));
assert(files.leadShared.includes("options.readinessOverride !== true"), "core OfficeFinder/broker approval must fail closed without an explicit override");
assert(files.admin.includes('field("Submission state", qualified ? "Valid requirement"'));
assert(files.admin.includes('field("Broker readiness", readiness.label'));
assert(files.admin.includes("recordBrokerReadinessAtSend"));
assert(files.admin.includes('name="readiness_override" value="acknowledged" required'));
assert(files.admin.includes("broker_readiness_at_send"));

console.log("Requirement quality and broker readiness QA passed.");
