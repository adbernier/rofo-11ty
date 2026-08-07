const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function assertIncludes(source, expected, context) {
  assert(source.includes(expected), `${context} missing expected text: ${expected}`);
}

function assertNotIncludes(source, forbidden, context) {
  assert(!source.includes(forbidden), `${context} contains forbidden text: ${forbidden}`);
}

const recommendationsPage = read("pages/recommendations.njk");
const recommendationContext = read("js/recommendation-context.js");
const searchProfile = read("js/search-profile.js");
const leadShared = read("functions/api/leads/_shared.js");
const briefShared = read("functions/api/location-brief/_shared.js");
const briefSubmit = read("functions/api/location-brief/submit.js");
const officeFinderShared = read("functions/api/leads/_shared.js");
const adminLeads = read("functions/admin/leads.js");

assertIncludes(recommendationsPage, "Request Current Availability", "recommendations page CTA");
assertIncludes(recommendationsPage, "data-live-market-headcount", "recommendations page execution intake");
assertIncludes(recommendationsPage, "data-live-market-size", "recommendations page execution intake");
assertNotIncludes(recommendationsPage, "data-live-market-budget", "recommendations page execution intake");
assertNotIncludes(recommendationsPage, "What should Rofo check?", "recommendations page execution scope");
assertIncludes(recommendationsPage, "What we'll research", "recommendations page execution scope");
assertNotIncludes(recommendationsPage, "Does this recommendation feel right?", "recommendations page customer copy");

assertIncludes(recommendationContext, "renderRepresentativeBuildings([fits[index] || fits[0]], state)", "selected-district representative buildings");
assertIncludes(recommendationContext, "renderRepresentativeBuildings(fits.length ? [fits[0]] : [], state)", "default representative buildings");
assertIncludes(recommendationContext, "Your current availability request has been received.", "submission success");
assertIncludes(recommendationContext, "This does not promise immediate broker contact.", "submission success");
assertIncludes(recommendationContext, "budgetContext", "execution context");

assertIncludes(searchProfile, "commuteOrientations", "Business Profile commute normalization");
assertIncludes(searchProfile, "key === \"commuteOrientation\"", "Business Profile commute multi-select");
assertIncludes(searchProfile, "selectedOptionLabels(commuteOrientationOptions, summary.commuteOrientation)", "Business Profile commute summary");

assertIncludes(briefShared, "Your Rofo Location Brief", "customer Location Brief email");
assertIncludes(briefShared, "We've received your request.", "customer Location Brief email");
assertIncludes(briefShared, "We'll review your Location Brief and determine the best next step.", "customer Location Brief email");
assertIncludes(briefShared, "What we'll research", "customer Location Brief email");
assertNotIncludes(briefShared.slice(briefShared.indexOf("export async function sendLiveMarketInvestigationConfirmationEmail")), "This does not promise immediate broker contact.", "customer Location Brief email");
assertIncludes(briefShared, "headcount: clean(requirements.headcount", "execution context email");

assertIncludes(leadShared, "New Rofo ${propertyType} Requirement - ${market}", "broker email subject");
assertIncludes(leadShared, "Project Snapshot", "broker/internal email");
assertIncludes(leadShared, "Best Fits", "broker/internal email");
assertIncludes(leadShared, "Location Brief", "broker/internal email");
assertIncludes(leadShared, "Client", "broker email");
assertIncludes(leadShared, "This is not a promise of immediate broker contact.", "tenant confirmation email");

assertIncludes(officeFinderShared, "OFFICEFINDER_LOCATION_PROFILE_PLACEHOLDER_PHONE", "OfficeFinder placeholder phone");
assertIncludes(officeFinderShared, "placeholder_phone_used", "OfficeFinder placeholder logging");
assertIncludes(officeFinderShared, "Rofo Location Brief", "OfficeFinder comments");
assertIncludes(officeFinderShared, "Please review the Brief before contacting the client.", "OfficeFinder comments");

assertIncludes(briefSubmit, "headcount: clean(requirements.headcount", "Location Brief submit fingerprint");
assertIncludes(briefSubmit, "approximateSize: clean(requirements.approximateSize", "Location Brief submit fingerprint");
assertIncludes(briefSubmit, "budgetContext: clean(requirements.budgetContext", "Location Brief submit fingerprint");

assertIncludes(adminLeads, "Requirement", "lead dashboard summary");
assertIncludes(adminLeads, "Business Profile", "lead dashboard summary");
assertIncludes(adminLeads, "Send Requirement", "lead dashboard fulfillment action");
assertIncludes(adminLeads, "More Details", "lead dashboard advanced details");
assertIncludes(adminLeads, "Stored lead JSON", "lead dashboard advanced details");

console.log("V1 launch readiness polish QA passed.");
