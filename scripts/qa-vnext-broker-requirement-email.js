const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const ROOT = path.join(__dirname, "..");
const temp = fs.mkdtempSync(path.join(os.tmpdir(), "rofo-vnext-email-qa-"));
const output = path.join(temp, "lead-shared.cjs");
execFileSync(path.join(ROOT, "node_modules/esbuild/bin/esbuild"), [path.join(ROOT, "functions/api/leads/_shared.js"), "--bundle", "--platform=node", "--format=cjs", `--outfile=${output}`], { stdio: "pipe" });
const leadTools = require(output);

const dashboardUrl = "https://www.rofo.com/admin/leads?id=lead-vnext";
const briefUrl = "https://www.rofo.com/location-brief/LB2-1234567890ABCDEF12345678";
const lead = {
  lead_type: "vnext_market_investigation", name: "Avery Morgan", email: "avery@rofo.com", phone: "", company: "",
  market: "San Francisco", city: "San Francisco", state: "CA", effective_space_type: "Office space", space_needed: "5000 sqft", move_timing: "6–12 months",
  business_type: "Architecture, Design & Creative Services", location_brief_url: briefUrl,
  requirements: "LEGACY COMPATIBILITY NOTES MUST REMAIN IN PAYLOAD",
  location_brief_v2_context: {
    schemaVersion: "vnext-commercial-context:v1",
    locationRequirement: { marketId: "san-francisco", propertyType: "office", business: "Architecture, Design & Creative Services", employeeOrigins: "San Francisco + Marin / North Bay", clientVisitFrequency: "Clients visit occasionally", environment: "Creative and distinctive" },
    recommendation: { readiness: "FULL", locationsWorthInvestigating: ["Marina District", "Presidio", "Jackson Square"] },
    propertyRequirement: { sizeLabel: "5,000 sqft", timingLabel: "6–12 months", purposes: ["Team collaboration"], mustHaves: ["Dedicated storage", "Parking requirement"] },
  },
};
const record = { id: "lead-vnext", status: "pending", lead };
const html = leadTools.buildVnextApprovalEmailHtml(record, dashboardUrl);
const text = leadTools.buildVnextApprovalEmailText(record, dashboardUrl);

for (const expected of ["Rofo Location Brief", "New Rofo Requirement", "5,000 SF Office · San Francisco · 6–12 months", "Architecture, Design &amp; Creative Services", "Open Location Brief →", "Project Snapshot", "Locations to investigate", "Marina District · Presidio · Jackson Square", "Requirement", "Timing", "Space use", "Team collaboration", "Must-haves", "Dedicated storage · Parking requirement", "Workforce", "San Francisco + Marin / North Bay", "Clients", "visit occasionally", "Environment", "Creative and distinctive", "Contact", "Not provided", "Investigation", "Review Lead in Dashboard →"]) assert(html.includes(expected), `vNext email should render ${expected}`);
assert(html.includes(`href="${briefUrl}"`)); assert(!html.includes(`>${briefUrl}<`), "HTML should use a Brief CTA instead of displaying the raw URL.");
assert(!html.includes("LEGACY COMPATIBILITY NOTES"), "vNext HTML must not duplicate the compatibility Notes blob.");
assert(!/>\s*Notes\s*</i.test(html)); assert.equal(lead.requirements, "LEGACY COMPATIBILITY NOTES MUST REMAIN IN PAYLOAD", "Email rendering must not mutate the legacy payload.");
assert(text.includes(briefUrl), "Plain-text fallback should retain the view-only Brief URL."); assert(text.includes("Phone: Not provided")); assert(!text.includes("LEGACY COMPATIBILITY NOTES"));

const sparse = structuredClone(record);
sparse.lead.phone = ""; sparse.lead.location_brief_v2_context.recommendation.locationsWorthInvestigating = ["Mission Bay"];
sparse.lead.location_brief_v2_context.propertyRequirement = { sizeLabel: "20 people", timingLabel: "Flexible", purposes: ["Quiet focused work"], mustHaves: [] };
sparse.lead.location_brief_v2_context.locationRequirement.clientVisitFrequency = ""; sparse.lead.location_brief_v2_context.locationRequirement.environment = "";
const sparseHtml = leadTools.buildVnextApprovalEmailHtml(sparse, dashboardUrl);
assert(sparseHtml.includes("Office for 20 people · San Francisco · Flexible")); assert(sparseHtml.includes("Mission Bay")); assert(!sparseHtml.includes("Must-haves")); assert(!sparseHtml.includes("Environment</td>")); assert(!/undefined|null/.test(sparseHtml));

const source = fs.readFileSync(path.join(ROOT, "functions/api/leads/_shared.js"), "utf8");
assert(source.includes('value.schemaVersion === "vnext-commercial-context:v1"'));
assert(source.includes("const html = vnextContext ? buildVnextApprovalEmailHtml(record, dashboardUrl) : legacyHtml"), "Legacy rendering must remain the fallback.");
assert(source.includes("const text = vnextContext ? buildVnextApprovalEmailText(record, dashboardUrl) : legacyText"));
assert(source.includes("buildOfficeFinderPayload")); assert(source.includes("getApprovalActions")); assert(source.includes("Review Lead in Dashboard"));

fs.rmSync(temp, { recursive: true, force: true });
console.log("vNext broker requirement email QA passed.");
