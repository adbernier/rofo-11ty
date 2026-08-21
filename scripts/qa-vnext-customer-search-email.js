const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const ROOT = path.join(__dirname, "..");
const temp = fs.mkdtempSync(path.join(os.tmpdir(), "rofo-vnext-customer-email-qa-"));
const output = path.join(temp, "lead-shared.cjs");
execFileSync(path.join(ROOT, "node_modules/esbuild/bin/esbuild"), [path.join(ROOT, "functions/api/leads/_shared.js"), "--bundle", "--platform=node", "--format=cjs", `--outfile=${output}`], { stdio: "pipe" });
const leadTools = require(output);

const briefUrl = "https://www.rofo.com/location-brief/LB2-1234567890ABCDEF12345678";
const lead = {
  lead_type: "vnext_market_investigation",
  name: "Alan Rivera",
  email: "alan@example.com",
  market: "San Francisco",
  effective_space_type: "Office space",
  space_needed: "5000 sqft",
  move_timing: "6–12 months",
  location_brief_url: briefUrl,
  location_brief_v2_context: {
    schemaVersion: "vnext-commercial-context:v1",
    locationRequirement: {
      marketId: "san-francisco",
      propertyType: "office",
      business: "Architecture, Design & Creative Services",
    },
    recommendation: {
      readiness: "FULL",
      locationsWorthInvestigating: ["Marina District", "Presidio", "Jackson Square"],
    },
    propertyRequirement: {
      sizeLabel: "5,000 sqft",
      timingLabel: "6–12 months",
      purposes: ["Team collaboration"],
      mustHaves: ["Dedicated storage"],
    },
  },
};

const html = leadTools.buildVnextTenantConfirmationHtml(lead);
const text = leadTools.buildVnextTenantConfirmationText(lead);
for (const expected of [
  "Rofo Location Brief",
  "We've received your search.",
  "Hi Alan,",
  "Thanks for sharing your search with Rofo. We've received your Location Brief and space requirements.",
  "View My Location Brief →",
  "Your Search",
  "Architecture, Design &amp; Creative Services",
  "5,000 SF Office",
  "6–12 months",
  "Marina District · Presidio · Jackson Square",
  "Team collaboration",
  "What Happens Next",
  "Rofo can use your requirements to investigate current and upcoming spaces, asking rents, and opportunities worth considering.",
  "A local commercial real estate expert can also review the search and follow up when helpful.",
]) assert(html.includes(expected), `vNext customer email should render ${expected}`);
assert(html.includes(`href="${briefUrl}"`), "The HTML action should use the durable view-only Brief URL.");
assert(!html.includes(`>${briefUrl}<`), "The raw Brief URL must not be displayed in HTML.");
assert(text.includes(briefUrl), "The plain-text fallback should include the Brief URL.");
assert(text.includes("Hi Alan,"));
assert(text.includes("Locations worth investigating: Marina District · Presidio · Jackson Square"));

const forbidden = [
  "determine the best next step",
  "approval",
  "OfficeFinder",
  "lead qualification",
  "Project Snapshot",
  "Recommendation Snapshot",
  "within 24 hours",
  "will contact you",
  "will find spaces",
  "complete inventory",
  "guaranteed",
];
for (const phrase of forbidden) {
  assert(!html.toLowerCase().includes(phrase.toLowerCase()), `HTML must not include ${phrase}`);
  assert(!text.toLowerCase().includes(phrase.toLowerCase()), `Text must not include ${phrase}`);
}

const sparse = structuredClone(lead);
sparse.name = "x";
sparse.move_timing = "";
sparse.location_brief_v2_context.propertyRequirement = { sizeLabel: "20 people", purposes: [], mustHaves: [] };
sparse.location_brief_v2_context.recommendation = { readiness: "INVESTIGATE", locationsWorthInvestigating: [] };
const sparseHtml = leadTools.buildVnextTenantConfirmationHtml(sparse);
const sparseText = leadTools.buildVnextTenantConfirmationText(sparse);
assert(sparseHtml.includes("Hi,"), "An unusable first name should use the generic greeting.");
assert(sparseHtml.includes("Office for 20 people"));
assert(!sparseHtml.includes("Timing</td>"));
assert(!sparseHtml.includes("Locations worth investigating</td>"));
assert(!sparseHtml.includes("Space use</td>"));
assert(!/undefined|null/.test(sparseHtml));
assert(sparseText.includes("Hi,"));

const stringContext = structuredClone(lead);
stringContext.location_brief_v2_context = JSON.stringify(stringContext.location_brief_v2_context);
assert(leadTools.buildVnextTenantConfirmationHtml(stringContext).includes("We've received your search."));

const source = fs.readFileSync(path.join(ROOT, "functions/api/leads/_shared.js"), "utf8");
assert(source.includes('? "We\'ve received your Rofo search"'), "Structured vNext confirmation should use the new subject.");
assert(source.includes(': isLocationBriefLead(lead) ? "Your Rofo Location Brief"'), "Legacy Location Brief subject must remain unchanged.");
assert(source.includes("buildVnextApprovalEmailHtml(record, dashboardUrl)"), "Broker email renderer must remain present.");
assert(source.includes("buildVnextApprovalEmailText(record, dashboardUrl)"));
assert(source.includes("sendApprovalEmail"));
assert(source.includes("buildOfficeFinderPayload"));

let sentPayload;
global.fetch = async (_url, options) => {
  sentPayload = JSON.parse(options.body);
  return { ok: true };
};

(async () => {
  const emailEnv = { RESEND_API_KEY: "test-key" };
  const result = await leadTools.sendTenantConfirmationEmail(emailEnv, { status: "pending", lead });
  assert.equal(result.sent, true);
  assert.equal(sentPayload.subject, "We've received your Rofo search");
  assert.equal(sentPayload.to[0], lead.email);
  assert(sentPayload.html.includes("We've received your search."));
  assert(sentPayload.text.includes(briefUrl));

  const legacyLead = { lead_type: "location_brief", name: "Legacy User", email: "legacy@example.com", location_brief_url: briefUrl };
  await leadTools.sendTenantConfirmationEmail(emailEnv, { status: "pending", lead: legacyLead });
  assert.equal(sentPayload.subject, "Your Rofo Location Brief");
  assert(sentPayload.html.includes("Your Location Brief request was received."));

  fs.rmSync(temp, { recursive: true, force: true });
  console.log("vNext customer search confirmation email QA passed.");
})().catch((error) => {
  fs.rmSync(temp, { recursive: true, force: true });
  console.error(error);
  process.exitCode = 1;
});
