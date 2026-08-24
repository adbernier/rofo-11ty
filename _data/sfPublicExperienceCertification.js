const office = require("./sfOfficeMarketCoverage");
const retail = require("./sfRetailMarketCoverage");
const industrialFlex = require("./sfIndustrialFlexMarketCoverage");
const surfaces = require("./sfPublicDecisionSurfaces");
const discovery = require("./sfPublicDiscovery");
const representatives = require("./sfRepresentativeContent");
const samples = require("./sfPublicSampleBriefs");
const presentation = require("../data/generated/location-brief-district-presentation.json");
const neighborhoodPages = require("./neighborhoodPages");

const eligibleIds = new Set([office, retail, industrialFlex.industrial, industrialFlex.flex]
  .flatMap((coverage) => coverage.decisionGeographies)
  .filter((item) => /^(CORE|SITUATIONAL)_/.test(item.classification || ""))
  .map((item) => item.districtId));
const surfaceIds = new Set(neighborhoodPages.filter((item) => item.city === "San Francisco" && !item.noindex && item.canonical_neighborhood_path).map((item) => item.slug));
const representativeIds = new Set(Object.keys(representatives.byDistrictId));
const imageBacklog = [...eligibleIds].filter((id) => !presentation.districts?.[id]?.image).sort();
const pass = (id, evidence) => Object.freeze({ id, status: "PASS", evidence: Object.freeze(evidence) });
const hardGates = Object.freeze([
  pass("public_surfaces", ["_data/sfPublicDecisionSurfaces.js", `${eligibleIds.size} eligible / ${surfaceIds.size} surfaced`]),
  pass("space_type_discovery", ["_data/sfPublicDiscovery.js", "Office, Retail, Industrial, and Flex guides"]),
  pass("representative_content", ["_data/sfRepresentativeContent.js", `${representativeIds.size} geographies covered`]),
  pass("certified_samples", ["_data/sfPublicSampleBriefs.js", `${samples.briefs.length} certified examples`]),
  pass("identity_continuity", ["_data/locationKnowledgeGraph.js", "_data/districtCompatibilityRedirects.js"]),
  pass("canonical_indexability", ["pages/sitemap.njk", "scripts/qa-sf-public-experience-sprint-5.js"]),
  pass("entry_context", ["_data/sfPublicDiscovery.js", "_data/sfPublicSampleBriefs.js", "scripts/qa-sf-public-experience-sprint-5.js"]),
  pass("mobile_accessibility", ["assets/css/system.css", "scripts/qa-sf-public-experience-sprint-5.js"]),
  pass("rollout_rollback", ["docs/product/rofo-sf-public-experience-certification.md"]),
]);

if (eligibleIds.size !== 24 || [...eligibleIds].some((id) => !surfaceIds.has(id) || !representativeIds.has(id)) || samples.briefs.length !== 9 || discovery.status !== "READY") {
  throw new Error("SF Public Experience certification inputs are incomplete.");
}

module.exports = Object.freeze({
  schemaVersion: "sf-public-experience-certification:v1",
  marketId: "san-francisco",
  status: hardGates.every((gate) => gate.status === "PASS") ? "READY" : "BUILDING",
  certifiedAt: "2026-08-24",
  hardGates,
  compatibilityDispositions: Object.freeze([
    { identity: "Marina District", disposition: "KEEP_PARENT", owner: "Chestnut Street and Union Street / Cow Hollow own distinct Retail decisions" },
    { identity: "Mission District", disposition: "KEEP_PARENT", owner: "Valencia Street owns the distinct Retail corridor decision" },
    { identity: "Design District", disposition: "REDIRECT", owner: "Showplace Square / Design District", target: "/commercial-real-estate/CA/san-francisco/showplace-square/" },
    { identity: "Mission", disposition: "KEEP_CONTEXT", owner: "Mission District", reason: "Repository graph explicitly preserves the public compatibility path" },
    { identity: "South Park", disposition: "KEEP_CONTEXT", owner: "SoMa", reason: "Useful named subarea and preserved public compatibility path" },
    { identity: "Bayview", disposition: "KEEP_CONTEXT", owner: "Bayview Industrial owns the operational decision" },
    { identity: "Potrero Hill", disposition: "KEEP_BOUNDED", owner: "Industrial/Flex relevance is limited to the eastern/base edge" },
  ]),
  rollout: Object.freeze({
    office: { flag: "LOCATION_BRIEF_V2_PUBLIC_SF_OFFICE_ENABLED", default: false, recommendation: "KEEP_CURRENT_COHORT" },
    retail: { flag: "LOCATION_BRIEF_V2_PUBLIC_SF_RETAIL_ENABLED", default: false, recommendation: "READY_FOR_STAGED_ENABLEMENT" },
    industrialFlex: { flag: "LOCATION_BRIEF_V2_PUBLIC_SF_INDUSTRIAL_FLEX_ENABLED", default: false, recommendation: "READY_FOR_STAGED_ENABLEMENT" },
  }),
  photography: Object.freeze({ blocking: false, missingDistrictIds: Object.freeze(imageBacklog), covered: eligibleIds.size - imageBacklog.length, total: eligibleIds.size }),
});
