import assert from "node:assert/strict";
import fs from "node:fs";

const source = fs.readFileSync(new URL("../functions/_shared/project-snapshot.js", import.meta.url), "utf8");
const snapshotModule = await import(`data:text/javascript;base64,${Buffer.from(source).toString("base64")}`);
const { buildProjectSnapshotFromLead, buildProjectSnapshotFromBrief, businessPresentation, marketDisplayName, projectSnapshotTextLines } = snapshotModule;

const barberBrief = {
  searchProfile: {
    locations: [
      { city: "Derry", state: "NH" },
      { city: "Salem", state: "NH" },
      { city: "Londonderry", state: "NH" },
    ],
    spaceType: "Retail",
    businessType: "professional_services",
  },
  liveMarketInvestigation: {
    confirmedRequirements: {
      businessType: "professional_services",
      businessTypeOther: "Barber",
      approximateSize: "Under 2,500 SF",
      timing: "asap",
    },
  },
};
const barber = buildProjectSnapshotFromBrief(barberBrief);
assert.equal(barber.market, "Derry / Salem / Londonderry, NH");
assert.equal(barber.businessUse, "Barber");
assert.equal(barber.canonicalBusinessType, "neighborhood_service");
assert.equal(barber.businessCategory, "Neighborhood Service");
assert.equal(barber.timing, "As soon as possible");

const dealership = buildProjectSnapshotFromLead({
  market: "Naperville",
  city: "Naperville",
  state: "IL",
  requested_space_type: "Flex",
  business_type: "professional_services",
  business_use: "Dealership",
  space_needed: "Under 2,500 SF",
  move_timing: "asap",
});
assert.equal(dealership.market, "Naperville, IL");
assert.equal(dealership.businessUse, "Dealership");
assert.equal(dealership.canonicalBusinessType, "professional_services");
assert.equal(dealership.classificationStatus, "investigate");
assert(projectSnapshotTextLines(dealership).includes("Use Classification: Verify intended use"));

const legacy = buildProjectSnapshotFromLead({ market: "Naperville", state: "IL", business_type: "professional_services" });
assert.equal(legacy.businessUse, "Professional Services");
assert.equal(legacy.businessCategory, "Professional Services");
assert.equal(marketDisplayName({ market: "Kansas City", state: "MO" }), "Kansas City, MO");
assert.equal(businessPresentation({ canonical: "professional_services" }).classificationStatus, "classified");

const files = {
  dashboard: fs.readFileSync(new URL("../functions/admin/leads.js", import.meta.url), "utf8"),
  leadSubmit: fs.readFileSync(new URL("../functions/api/leads/submit.js", import.meta.url), "utf8"),
  leadEmail: fs.readFileSync(new URL("../functions/api/leads/_shared.js", import.meta.url), "utf8"),
  legacySubmit: fs.readFileSync(new URL("../functions/api/location-brief/submit.js", import.meta.url), "utf8"),
};
assert(files.dashboard.includes('field("Business / use"'));
assert(files.dashboard.includes('field("Category"'));
assert(files.leadSubmit.includes("lead.location_profile_business_use = business.businessUse"));
assert(files.legacySubmit.includes("business_classification_status: business.classificationStatus"));
assert(files.leadEmail.includes('"Business / use"'));
assert(!source.includes("customer@") && !source.includes("555-"), "Shared projection must not contain production PII fixtures.");

console.log("Real-user lead context integrity QA passed.");
