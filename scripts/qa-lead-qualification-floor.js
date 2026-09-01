const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");

function read(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), "utf8");
}

function assert(condition, message) {
  if (!condition) {
    console.error(`Lead qualification floor QA failed: ${message}`);
    process.exit(1);
  }
}

const recommendations = read("pages/recommendations.njk");
const recommendationContext = read("js/recommendation-context.js");
const submit = read("functions/api/location-brief/submit.js");
const briefShared = read("functions/api/location-brief/_shared.js");
const projectSnapshot = read("functions/_shared/project-snapshot.js");
const leadShared = read("functions/api/leads/_shared.js");
const adminLeads = read("functions/admin/leads.js");

assert(recommendations.includes("data-live-market-business-type"), "availability request should include a business-type field.");
assert(recommendations.includes("What kind of business is this for?"), "business-type field should use customer-friendly copy.");
assert(recommendations.includes("data-live-market-size"), "availability request should include approximate-size control.");
assert(recommendations.includes("Under 2,500 SF"), "availability request should include property-type-appropriate size ranges.");
assert(recommendations.includes("data-live-market-timing"), "availability request should include timing control.");
assert(recommendations.includes("Just exploring"), "timing should allow exploratory users.");

assert(recommendationContext.includes("businessTypeFromProfile()"), "client should reuse Business Profile business type.");
assert(recommendationContext.includes("validateInvestigationQualification"), "client should validate qualification before submission.");
assert(recommendationContext.includes("hasUsableSizeSignal"), "client should require a usable sizing signal.");
assert(recommendationContext.includes("normalizedType === \"office\" || normalizedType === \"coworking\""), "office headcount should qualify as sizing context.");
assert(recommendationContext.includes("Add an approximate size range. For office requests, headcount can be used instead."), "client should reject not-sure size without fallback context.");

assert(submit.includes("validateInvestigationQualification"), "server should validate live investigation qualification.");
assert(submit.includes("Availability request needs a few more details"), "server should return a clear qualification error.");
assert(submit.includes("business_type"), "server validation should require business type.");
assert(submit.includes("usable_size"), "server validation should require usable size context.");
assert(submit.includes("isFlexIndustrialLike(spaceType)"), "server should handle flex/warehouse/industrial sizing distinctly.");
assert(submit.includes("qualification_status"), "new qualified requests should persist structural qualification status.");
assert(submit.includes("qualified_requirement"), "new availability requests should be marked structurally qualified.");

assert(briefShared.includes("businessType"), "canonical Live Market Investigation should preserve request-stage business type.");
assert(briefShared.includes("Business / use"), "customer confirmation should include the specific business/use when present.");
assert(projectSnapshot.includes("executionTimingLabel"), "Project Snapshot should render human-readable timing labels.");
assert(projectSnapshot.includes("executionSizeLabel"), "Project Snapshot should render human-readable size labels.");
assert(leadShared.includes("raw.includes(\"not_sure\")"), "OfficeFinder sizing fallback should treat not_sure as not sure.");

assert(adminLeads.includes("DEFAULT_OPERATOR_TIME_ZONE = \"America/Los_Angeles\""), "dashboard should default to Pacific operator timezone.");
assert(adminLeads.includes("env.OPERATOR_TIME_ZONE"), "dashboard should support configurable operator timezone.");
assert(adminLeads.includes("timeZoneName: \"short\""), "dashboard timestamps should show timezone abbreviation.");
assert(adminLeads.includes("Legacy requirement — structural status unavailable"), "legacy requirements should render safely without inventing a current structural status.");
assert(adminLeads.includes("Valid requirement"), "qualified new leads should render an honest structural-validity label.");
assert(!adminLeads.includes('qualified ? "Qualified requirement"'), "structural validity should not be presented as broker readiness.");
assert(new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
  timeZone: "America/Los_Angeles",
  timeZoneName: "short",
}).format(new Date("2026-08-09T20:38:00.000Z")).includes("1:38"), "Pacific daylight-saving conversion should render 20:38 UTC as 1:38 PM locally.");

assert(!leadShared.includes("gmail.com\") addSpamSignal"), "free Gmail addresses should not become spam by themselves.");

console.log("Lead qualification floor QA passed.");
