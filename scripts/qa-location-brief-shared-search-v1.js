"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const voice = require("../lib/presentation/customer-voice-v1");

const criterion = (dimension, text, status = "PREFERRED") => ({ dimension, status, value: { text, number: null, boolean: null, list: [] } });
const item = (districtId, districtName, distinction) => ({ districtId, districtName, propertyTypeFit: { summary: distinction }, strengths: [distinction], tradeoffs: [] });
const section = (brief, id) => brief.sections.find(entry => entry.id === id);
const text = brief => brief.sections.flatMap(entry => [...(entry.paragraphs || []), ...(entry.items || [])]).join(" ");

const northstar = {
  businessContext: { summary: "45-person professional-services company; clients visit frequently; recruiting and culture matter." },
  objective: { summary: "Relocate the San Francisco office before the current lease expires" },
  propertyTypes: ["office"], activities: ["work", "meet_collaborate", "host_visitors"],
  locationLogic: { summary: "Employee geography, client access, recruiting, and culture matter.", rationale: ["Employee and client access"], specificPreference: { hasPreference: true } },
  sizeCapacity: { summary: "About 10,000 SF initial estimate; 35–40 people onsite at peak." }, timing: { summary: "Current lease expires in 14 months" }, growth: { summary: "Headcount expected to grow from 45 to 55–60." },
  criteria: [criterion("office.occupancy.peak_attendance", "35–40 people", "REQUIRED"), criterion("office.access.client_visits", "Clients visit frequently", "REQUIRED"), criterion("office.access.transit", "Strong BART access", "PREFERRED"), criterion("universal.timing.current_lease", "Lease expires in 14 months", "REQUIRED"), criterion("universal.growth.future_state", "Grow to 55–60 people", "REQUIRED")]
};
const architecture = {
  businessContext: { summary: "Architecture / design firm. Ordinary Office use." }, propertyTypes: ["office"], activities: ["work", "meet_collaborate"],
  locationLogic: { marketAnchor: { marketId: "san-francisco" }, specificPreference: { hasPreference: false } },
  criteria: [criterion("universal.location.employee_origins", "San Francisco"), criterion("office.access.client_visits", "Clients rarely or never visit", "FLEXIBLE"), criterion("universal.access.transit_importance", "Public transit is helpful"), criterion("universal.access.parking_importance", "Convenient parking is helpful"), criterion("office.occupancy.peak_attendance", "35")]
};
const miramar = {
  businessContext: { summary: "Showroom business with service vehicles and customer visits." }, propertyTypes: ["industrial_flex"], activities: ["host_visitors", "operate_vehicles"],
  locationLogic: { specificPreference: { hasPreference: true } }, sizeCapacity: { summary: "Approximately 7,500 SF." },
  criteria: [criterion("industrial.use.showroom", "Showroom", "REQUIRED"), criterion("industrial.site.service_vehicles", "Service vehicles", "REQUIRED"), criterion("industrial.access.customer_visits", "Customer visits", "REQUIRED"), criterion("industrial.access.freeway", "Freeway access", "PREFERRED"), criterion("universal.access.parking_importance", "Parking is important", "PREFERRED")]
};
const otay = {
  businessContext: { summary: "Warehouse search centered on logistics and border-oriented operations." }, propertyTypes: ["industrial_flex"], activities: ["store", "receive"],
  locationLogic: { specificPreference: { hasPreference: true } }, sizeCapacity: { summary: "Approximately 40,000 SF." },
  criteria: [criterion("industrial.operations.logistics", "Logistics", "REQUIRED"), criterion("industrial.access.truck_circulation", "Truck access", "REQUIRED"), criterion("industrial.loading.grade_level", "Loading", "REQUIRED"), criterion("industrial.site.trailer_parking", "Trailer parking", "REQUIRED"), criterion("industrial.access.border", "Border access", "REQUIRED")]
};

const fixtures = [
  { id: "northstar", requirement: northstar, snapshot: { shortlist: [item("financial-district", "Financial District", "Downtown professional office"), item("jackson-square", "Jackson Square", "Historic professional office"), item("south-beach", "South Beach", "Waterfront business setting")] } },
  { id: "architecture", requirement: architecture, snapshot: { shortlist: [item("soma", "SoMa", "Creative and adaptive office"), item("jackson-square", "Jackson Square", "Historic boutique office"), item("financial-district", "Financial District", "Conventional professional office")] } },
  { id: "miramar", requirement: miramar, snapshot: { shortlist: [item("kearny-mesa", "Kearny Mesa", "Central showroom and service space"), item("miramar", "Miramar", "Warehouse, contractor and showroom space")] } },
  { id: "otay", requirement: otay, snapshot: { shortlist: [item("otay-mesa", "Otay Mesa", "Border-oriented distribution and logistics"), item("miramar", "Miramar", "Central warehouse and flex space"), item("vista-business-park", "Vista Business Park", "North County industrial space")] } }
];

for (const fixture of fixtures) {
  fixture.brief = voice.projectSharedSearchBrief({ ...fixture, market: fixture.id === "northstar" || fixture.id === "architecture" ? "San Francisco" : "San Diego" });
  assert.deepEqual(fixture.brief.sections.map(entry => entry.heading), ["Your business", "The ideal environment", "Likely space", "Where we'd start", "What we're flexible about", "What really matters"]);
  assert.equal(voice.lintCustomerText(text(fixture.brief)).filter(finding => finding.severity === "ERROR").length, 0, `${fixture.id}: customer-language error`);
  assert(!/confidence|provenance|abstention|verification state|canonical|recommendation intelligence/i.test(text(fixture.brief)));
}

assert.match(text(fixtures[0].brief), /10,000 SF/); assert.match(text(fixtures[0].brief), /55–60/);
assert.match(section(fixtures[0].brief, "flexibility").paragraphs[0], /haven't identified any meaningful areas of flexibility/i, "Unknown flexibility must remain unknown.");
assert.match(section(fixtures[1].brief, "space").paragraphs.join(" "), /peak attendance around 35 people.*don't yet have enough information.*square-footage range/i, "Known attendance and missing size must both be explicit.");
assert(section(fixtures[1].brief, "flexibility").paragraphs.some(value => /Transit would be helpful, but isn't essential/i.test(value)));
assert(section(fixtures[1].brief, "flexibility").paragraphs.some(value => /open to other districts/i.test(value)));
assert(!/Ordinary Office use|not stated as required|Client access and visits is flexible/i.test(text(fixtures[1].brief)), "System-shaped language must not reach the primary Brief.");
assert.match(text(fixtures[2].brief), /7,500 SF/); assert.match(section(fixtures[2].brief, "space").paragraphs.join(" "), /showroom space/i); assert.match(text(fixtures[2].brief), /Service vehicles/); assert.match(text(fixtures[2].brief), /Customer visits/);
assert.match(text(fixtures[3].brief), /40,000 SF/); for (const value of ["truck circulation", "grade-level loading", "trailer parking", "access to the border"]) assert(section(fixtures[3].brief, "space").paragraphs.join(" ").toLowerCase().includes(value), `Otay Likely space must preserve ${value}`);
for (const fixture of fixtures) for (const location of fixture.snapshot.shortlist) assert(section(fixture.brief, "where").paragraphs.join(" ").includes(location.districtName), `${fixture.id}: shortlist changed`);

const renderer = fs.readFileSync(path.join(__dirname, "../functions/operator/location-brief-v2/[publicId].js"), "utf8");
assert(renderer.indexOf("sharedSearchMarkup(sharedSearch") < renderer.indexOf("${universal.matters}"), "Shared assignment must precede supporting intelligence.");
for (const token of ["data-brief-confirmation", "data-confirm-brief", "Yes, this sounds right", "Change something", "Put Rofo to work finding it"]) assert(renderer.includes(token));
assert(renderer.includes("localStorage.getItem(confirmationKey)===revisionId"), "Confirmation must apply only to the current Requirement revision.");
assert(renderer.includes("vnext_brief_confirmed"), "Confirmation must use existing analytics infrastructure.");
assert(fs.readFileSync(path.join(__dirname, "../functions/api/analytics/search-profile.js"), "utf8").includes('"vnext_brief_confirmed"'), "Existing analytics intake must accept the confirmation event.");
assert(!renderer.includes("submit a space")); assert(!renderer.includes("property score"));

console.log("Location Brief shared-search v1 QA passed: 4 fixtures, six deterministic sections, explicit missing size, preserved statuses, unchanged shortlists, and revision-scoped confirmation.");
