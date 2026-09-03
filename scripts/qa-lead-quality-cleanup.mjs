import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";

const root = path.resolve(new URL("..", import.meta.url).pathname);
const require = createRequire(import.meta.url);
const temp = fs.mkdtempSync(path.join(os.tmpdir(), "rofo-lead-quality-"));
function bundle(source, outputName) {
  const output = path.join(temp, outputName);
  execFileSync(path.join(root, "node_modules/esbuild/bin/esbuild"), [path.join(root, source), "--bundle", "--platform=node", "--format=cjs", `--outfile=${output}`], { stdio: "pipe" });
  return require(output);
}

const leads = bundle("functions/api/leads/_shared.js", "leads.cjs");
const snapshots = bundle("functions/_shared/project-snapshot.js", "snapshots.cjs");
const adminSource = fs.readFileSync(path.join(root, "functions/admin/leads.js"), "utf8");
const searchProfileSource = fs.readFileSync(path.join(root, "js/search-profile.js"), "utf8");

for (const [input, expected] of [
  ["7183448623", "7183448623"],
  ["17183448623", "7183448623"],
  ["16319889211", "6319889211"],
  ["+1 718 344 8623", "7183448623"],
  ["(718) 344-8623", "7183448623"],
  ["718-344-8623", "7183448623"],
  ["442071838750", "442071838750"],
  ["", ""],
]) assert.equal(leads.normalizePhoneDigitsForSpam(input), expected, input);
assert.equal(leads.normalizePhoneDigitsForSpam("1234567890123").length, 13);
assert.equal(leads.phoneDigitCountSpamReason("17183448623"), "");
assert.equal(leads.phoneDigitCountSpamReason("16319889211"), "");
assert.equal(leads.phoneDigitCountSpamReason("+1 718 344 8623"), "");
assert.equal(leads.phoneDigitCountSpamReason("(718) 344-8623"), "");
assert.equal(leads.phoneDigitCountSpamReason("123456789012"), "Phone has more than 10 digits (12)");
assert.equal(leads.phoneDigitCountSpamReason("+44 20 7183 8750"), "Phone has more than 10 digits (12)");
assert.equal(leads.phoneDigitCountSpamReason(""), "");
assert.equal(leads.normalizePhoneForOfficeFinder("+1 718 344 8623"), "718-344-8623");
assert.equal(leads.normalizePhoneForOfficeFinder("+44 20 7183 8750"), "");
const cleanLead = { lead_type: "vnext_market_investigation", name: "Sanitized User", email: "user@sanitized-business.invalid", phone: "17183448623", requested_space_type: "Retail Space", requirements: "Frozen meat and dog food" };
assert.equal(leads.detectLeadSpam(cleanLead, { lead_type: cleanLead.lead_type, human_check: "1", requested_space_type: "Retail Space" }).score, 0);
assert.equal(leads.detectLeadSpam({ ...cleanLead, phone: "" }, { lead_type: cleanLead.lead_type, human_check: "1", requested_space_type: "Retail Space" }).score, 0);
assert(leads.detectLeadSpam(cleanLead, { lead_type: cleanLead.lead_type, human_check: "1", requested_space_type: "Retail Space", _gotcha: "bot" }).isSpam, "Other spam signals must remain effective");
assert(adminSource.includes("phoneDigitCountSpamReason(phone)"));
assert(!adminSource.includes("function phoneDigits"));

const frozen = snapshots.businessPresentation({ canonical: "technology", specific: "Frozen meat and dog food", propertyType: "Retail" });
assert.equal(frozen.canonicalBusinessType, "food_beverage");
assert.equal(frozen.businessCategory, "Food / beverage");
assert.equal(frozen.businessUse, "Frozen meat and dog food");
assert.equal(frozen.classificationStatus, "classified");

const frozenBrief = snapshots.buildProjectSnapshotFromBrief({
  searchProfile: { locations: [{ city: "Sanitized Market", state: "NY" }], spaceType: "Retail", businessType: "technology" },
  liveMarketInvestigation: { confirmedRequirements: { businessType: "technology", businessTypeOther: "Frozen meat and dog food", approximateSize: "2,500–5,000 SF", timing: "asap" } },
});
assert.equal(frozenBrief.businessUse, "Frozen meat and dog food");
assert.equal(frozenBrief.businessCategory, "Food / beverage");
assert.notEqual(frozenBrief.canonicalBusinessType, "technology");
const frozenLead = {
  market: "Sanitized Market", state: "NY", requested_space_type: "Retail", effective_space_type: "Retail",
  business_type: "technology", business_use: "Frozen meat and dog food", space_needed: "2,500–5,000 SF",
  move_timing: "asap", location_profile_features: "Storefront, freezers, rear loading, parking",
};
const frozenLeadSnapshot = snapshots.buildProjectSnapshotFromLead(frozenLead);
assert.equal(frozenLeadSnapshot.businessUse, "Frozen meat and dog food");
assert.equal(frozenLeadSnapshot.businessCategory, "Food / beverage");
assert.equal(snapshots.assessBrokerReadiness(frozenLead).status, snapshots.BROKER_READINESS.READY);

const technology = snapshots.businessPresentation({ canonical: "technology", specific: "Software product company", propertyType: "Office" });
assert.equal(technology.canonicalBusinessType, "technology");
assert.equal(technology.businessCategory, "technology");

const unknownRetail = snapshots.businessPresentation({ canonical: "technology", specific: "Acme widgets and repairs", propertyType: "Retail" });
assert.equal(unknownRetail.canonicalBusinessType, "other");
assert.equal(unknownRetail.classificationStatus, "investigate");
assert.notEqual(snapshots.businessPresentation({ canonical: "technology", specific: "Architectural products", propertyType: "Retail" }).canonicalBusinessType, "technology");
assert(searchProfileSource.includes('businessType: isOfficeProfile() ? profile.businessType || "" : ""'));

console.log("Lead quality cleanup QA passed.");
