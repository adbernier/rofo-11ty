const fs = require("fs");
const path = require("path");

let failures = 0;

function read(relativePath) {
  return fs.readFileSync(path.join(__dirname, "..", relativePath), "utf8");
}

function assert(condition, message) {
  if (!condition) {
    failures += 1;
    console.error(`Lead operations cleanup QA failed: ${message}`);
  }
}

const adminLeads = read("functions/admin/leads.js");
const leadShared = read("functions/api/leads/_shared.js");
const briefShared = read("functions/api/location-brief/_shared.js");
const briefSubmit = read("functions/api/location-brief/submit.js");
const docs = read("docs/lead-routing-officefinder.md");
const customerConfirmationSource = briefShared.slice(briefShared.indexOf("export async function sendLiveMarketInvestigationConfirmationEmail"));

assert(leadShared.includes("New Rofo Requirement in ${snapshot.market || market || \"Market\"}"), "internal alert subject should use New Rofo Requirement in {City/Market}.");
assert(leadShared.includes("LEAD_NOTIFY_EMAIL is not configured"), "missing internal recipient should return an explicit configuration error.");
assert(leadShared.includes("RESEND_API_KEY is not configured"), "missing Resend API key should return an explicit configuration error.");
assert(leadShared.includes("status: \"not_configured\""), "missing email configuration should produce not_configured status.");
assert(leadShared.includes("status: \"failed\""), "Resend failure should produce failed status.");
assert(leadShared.includes("status: \"sent\""), "successful Resend request should produce sent status.");
assert(leadShared.includes("recipient: env.LEAD_NOTIFY_EMAIL"), "internal alert result should expose the resolved internal recipient.");
assert(leadShared.includes("sender: env.RESEND_FROM_EMAIL || \"Rofo Leads <onboarding@resend.dev>\""), "internal alert result should expose the sender used.");
assert(leadShared.includes("Review Lead in Dashboard"), "internal alert should include a direct dashboard link.");
assert(leadShared.includes("Location Brief") && leadShared.includes("Project Snapshot") && leadShared.includes("Best Fits"), "internal alert should include Brief, Project Snapshot, and Best Fits context.");
assert(leadShared.includes("Review the requirement in the dashboard before sending it to a fulfillment partner."), "internal alert should use dashboard-first routing language.");
assert(!leadShared.includes("OfficeFinder and broker routing still require manual approval"), "internal alert should not expose legacy approval wording.");

assert(briefSubmit.includes("internal_email_status"), "Location Brief submission should persist internal alert status to lead JSON.");
assert(briefSubmit.includes("internal_email_recipient"), "Location Brief submission should persist internal alert recipient.");
assert(briefSubmit.includes("await updateLeadStatus(env, lead.id"), "Location Brief submission should update the stored lead after the internal alert attempt.");
assert(briefSubmit.includes("confirmationEmail = await sendLiveMarketInvestigationConfirmationEmail"), "customer confirmation should remain independent of internal alert delivery.");
assert(briefSubmit.includes("email = await sendApprovalEmail"), "internal alert should be attempted after lead creation.");

assert(briefShared.includes("Subject") || briefShared.includes("Your Rofo Location Brief"), "customer confirmation should keep the Location Brief subject.");
assert(briefShared.includes("We'll review your Location Brief and determine the best next step"), "customer confirmation should not promise immediate broker contact.");
assert(briefShared.includes("Headcount") && briefShared.includes("Approximate size") && briefShared.includes("Timing"), "customer confirmation should include execution context when provided.");
assert(briefShared.includes("We've received your request."), "customer confirmation should use warmer received-request hero language.");
assert(briefShared.includes("Depending on your request, we'll either continue the research directly or involve a local market expert when appropriate."), "customer confirmation should preserve flexibility without defensive broker language.");
assert(briefShared.includes("What we'll research"), "customer confirmation should include a friendly research section.");
assert(briefShared.includes("executionTimingLabel"), "customer confirmation should render human-readable timing labels.");
assert(!customerConfirmationSource.includes("This does not promise immediate broker contact"), "customer confirmation should remove defensive broker-contact language.");
assert(!customerConfirmationSource.includes("Broker preference"), "customer confirmation should not expose broker preference.");

assert(adminLeads.includes("function renderProjectSnapshot"), "dashboard should render a Project Snapshot summary.");
assert(adminLeads.includes("field(\"Selected district\""), "dashboard summary should include selected district.");
assert(adminLeads.includes("field(\"Best Fits\""), "dashboard summary should include Best Fits.");
assert(adminLeads.includes("field(\"Headcount\""), "dashboard summary should include headcount.");
assert(adminLeads.includes("field(\"Approx. size\""), "dashboard summary should include approximate size.");
assert(adminLeads.includes("field(\"Timing\""), "dashboard summary should include timing.");
assert(adminLeads.includes("Open Brief"), "dashboard summary should include a Location Brief link.");
assert(adminLeads.includes("<h3>Send To</h3>"), "dashboard default view should show a unified Send To control.");
assert(adminLeads.includes("value: \"officefinder\""), "OfficeFinder should appear as a first-class fulfillment destination.");
assert(adminLeads.includes("value: `broker:${broker.id}`"), "direct broker partners should appear in the same destination dropdown.");
assert(adminLeads.includes("action\" value=\"send_requirement\""), "dashboard should post one unified send_requirement action.");
assert(adminLeads.includes("Send Requirement"), "dashboard should use Send Requirement terminology.");
assert(adminLeads.includes("data-send-requirement-button disabled"), "Send Requirement button should be disabled until a destination is chosen.");
assert(adminLeads.includes("button.textContent = \"Sending...\""), "Send Requirement button should expose a loading state.");
assert(adminLeads.includes("approveLead(env, id, \"officefinder\")"), "OfficeFinder destination should use the existing OfficeFinder approval adapter.");
assert(adminLeads.includes("createAndSendReferral(env, request"), "broker destination should preserve the existing referral workflow.");
assert(adminLeads.includes("<summary>More Details</summary>"), "dashboard should use one collapsed More Details section for Location Brief diagnostics.");
assert(adminLeads.includes("OfficeFinder diagnostics"), "OfficeFinder diagnostics should remain accessible under Advanced.");
assert(adminLeads.includes("Stored lead JSON"), "raw lead JSON should remain accessible under Advanced.");
assert(!adminLeads.includes("<h3>Live Market Investigation</h3>"), "legacy Live Market Investigation block should not render as a default standalone section.");
assert(!adminLeads.includes("<h3>Recommended Market Path</h3>"), "legacy Recommended Market Path block should not render as a default standalone section.");
assert(!adminLeads.includes("Partner referrals are managed above"), "dashboard should not expose legacy partner-referral helper copy.");

assert(docs.includes("RESEND_API_KEY"), "production checklist should document RESEND_API_KEY.");
assert(docs.includes("LEAD_NOTIFY_EMAIL"), "production checklist should document LEAD_NOTIFY_EMAIL.");
assert(docs.includes("RESEND_FROM_EMAIL"), "production checklist should document RESEND_FROM_EMAIL.");
assert(docs.includes("verified Resend sending domain"), "production checklist should document verified-domain requirement.");
assert(docs.includes("not_configured") && docs.includes("failed") && docs.includes("sent"), "docs should define internal email status meanings.");
assert(docs.includes("Send Requirement"), "docs should document the unified Send Requirement action.");
assert(docs.includes("More Details"), "docs should document the collapsed More Details section.");

if (failures) {
  process.exitCode = 1;
} else {
  console.log("Lead operations cleanup QA passed.");
}
