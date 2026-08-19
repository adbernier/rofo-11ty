const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const prototype = read("js/requirement-prototype.js");
const prototypePage = read("pages/prototype/requirement-v1.njk");
const operatorRoot = read("functions/operator/location-brief-v2/index.js");
const briefRenderer = read("functions/operator/location-brief-v2/[publicId].js");
const v2Create = read("functions/api/location-brief-v2/create.js");
const v2Update = read("functions/api/location-brief-v2/[publicId].js");

assert(operatorRoot.includes("locationBriefV2=new"), "Operator root must declare an explicit new-search intent.");
assert(!operatorRoot.includes("Canonical Requirement JSON"), "Operator root must not expose the fixture JSON seam.");
assert(briefRenderer.includes("locationBriefV2=new"), "New search from a Brief must declare an explicit new-search intent.");
assert(prototype.includes('const locationBriefV2Intent = ["new", "edit"].includes(requestedIntent)'));
assert(prototype.indexOf("if (locationBriefV2Mode) clearPrototypePersistence()") < prototype.indexOf("let state = locationBriefV2Mode ? initialState() : restore()"), "Operator persistence must be cleared before interview construction.");
assert(prototype.includes("sessionStorage.removeItem(SESSION_KEY)"));
assert(prototype.includes("localStorage.removeItem(SESSION_KEY)"));
assert(prototype.includes("let state = locationBriefV2Mode ? initialState() : restore()"), "Operator flows must bypass legacy restoration.");
assert(prototype.includes("if (locationBriefV2Mode) return;"), "Operator state must not contaminate legacy prototype persistence.");

assert(!prototypePage.includes("Save Location Brief v2"), "The manual persistence seam must be removed.");
assert(!prototype.includes("data-save-location-brief-v2"));
assert(prototype.includes("await persistLocationBriefV2(nextInterview.requirement)"), "The final CTA must persist automatically.");
assert(prototype.includes('method: editing ? "PUT" : "POST"'));
assert(prototype.includes("result.briefUrl"));

assert(briefRenderer.includes("locationBriefV2=edit"));
assert(briefRenderer.includes("brief=${encodeURIComponent(brief.publicId)}"));
assert(prototype.includes("result.currentRevision.requirement"), "Edit must hydrate the server-canonical Requirement.");
assert(prototype.includes("result.currentRevision.revisionNumber"));
assert(prototype.includes("expectedRevision: locationBriefV2Context.revisionNumber"));
assert(!briefRenderer.includes("<textarea data-requirement>"), "Raw Requirement JSON must not be the normal edit interface.");
assert(briefRenderer.includes("Canonical current Requirement"));
assert(briefRenderer.includes("debug ? debugPanel(bundle)"));

for (const source of [v2Create, v2Update, prototype]) {
  ["saveLead", "OfficeFinder", "resolveLeadRoute", "sendApprovalEmail", "sendLocationBriefEmail"].forEach((term) => assert(!source.includes(term), `Operator flow must not invoke ${term}.`));
}

console.log("Location Brief v2 operator acceptance flow QA passed.");
