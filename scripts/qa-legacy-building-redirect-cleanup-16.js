#!/usr/bin/env node
"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const review = require("../_data/legacyBuildingRedirectReview.js");
const redirects = require("../_data/legacyBuildingPropertyRedirects.js");
const buildings = require("../_data/buildings.js");
const pilotAudit = require("../data/internal/durable-property-entity-pilot-v1/gsc-legacy-url-audit.json");

const ROOT = path.join(__dirname, "..");
const SITE = path.join(ROOT, "_site");
const buildingRows = Array.isArray(buildings) ? buildings : Object.values(buildings).flatMap((value) => Array.isArray(value) ? value : [value]);
const priorCohort = pilotAudit.records.filter((item) => item.currentCanonicalUrl);
const dispositions = ["DIRECT_PROPERTY_REDIRECT_APPROVED", "KEEP_CONTEXT_REDIRECT", "NEEDS_IDENTITY_REVIEW", "NEEDS_ROUTE_REVIEW"];

assert.equal(review.length, 16, "cleanup cohort must remain exactly 16 URLs");
assert.deepEqual(review.map((item) => item.legacyBuildingId).sort(), priorCohort.map((item) => item.legacyBuildingId).sort(), "cohort must exactly match the durable pilot's 16 canonical matches");
assert.equal(new Set(review.map((item) => item.legacyPath)).size, 16);
assert.equal(redirects.length, 14);
assert.equal(review.filter((item) => item.finalDisposition === "NEEDS_IDENTITY_REVIEW").length, 2);
assert(review.every((item) => dispositions.includes(item.finalDisposition)));

const approved = new Map(redirects.map((item) => [item.from, item]));
for (const item of review) {
  const canonical = buildingRows.find((building) => building.building_path === item.proposedCanonicalDestination);
  assert(canonical, `${item.legacyBuildingId} must map to a current canonical registry record`);
  assert.equal(canonical.city.toLowerCase(), item.municipality.toLowerCase(), `${item.legacyBuildingId} municipality mismatch`);
  assert.equal(canonical.address.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim(), item.normalizedAddress, `${item.legacyBuildingId} address mismatch`);
  assert(item.propertyTypeEvidence.length, `${item.legacyBuildingId} requires reviewed property type evidence`);
  assert.equal(item.canonicalRouteReview.staleAvailabilityDetected, false);
  if (item.finalDisposition === "DIRECT_PROPERTY_REDIRECT_APPROVED") {
    assert.deepEqual(approved.get(item.legacyPath), { from: item.legacyPath, to: item.proposedCanonicalDestination, status: 301 });
    assert.equal(item.hierarchyReview, "BUILDING_IDENTITY_CONFIRMED");
    assert.equal(item.productionVerification.status, "BLOCKED_BY_EXISTING_ZONE_CONTEXT_REDIRECT");
  } else {
    assert(!approved.has(item.legacyPath), `${item.legacyBuildingId} was not approved and must retain context behavior`);
    assert.equal(item.hierarchyReview, "SUITE_BUILDING_AMBIGUITY");
    assert.equal(item.productionVerification.status, "UNCHANGED_CONTEXT_REDIRECT_AS_INTENDED");
  }
  if (fs.existsSync(SITE)) {
    const output = path.join(SITE, item.proposedCanonicalDestination.replace(/^\//, ""), "index.html");
    assert(fs.existsSync(output), `${item.legacyBuildingId} canonical route must build`);
    const html = fs.readFileSync(output, "utf8");
    assert(html.includes(`<link rel="canonical" href="https://www.rofo.com${item.proposedCanonicalDestination}">`));
    assert(!/noindex/i.test(html));
    assert(!/available sf|asking rent|lease terms|broker contact|suite availability|tenant occupancy|clear height|loading dock|available now/i.test(html));
  }
}

const redirectTemplate = fs.readFileSync(path.join(ROOT, "pages/business-brief-redirects.njk"), "utf8");
assert(redirectTemplate.includes("legacyBuildingPropertyRedirects"));
const durableContract = fs.readFileSync(path.join(ROOT, "lib/durable-property/durable-property-entity-v1.js"), "utf8");
assert(durableContract.includes("legacyPublicUrls"), "durable contract must preserve legacy aliases");
const touchedRuntimeImports = ["recommendationActivationRegistry", "recommendation", "location-brief"].some((needle) => require("../_data/legacyBuildingPropertyRedirects.js").some((item) => JSON.stringify(item).includes(needle)));
assert.equal(touchedRuntimeImports, false);

console.log("Legacy Building Redirect Cleanup QA passed: exact 16 reviewed, 14 approved one-hop 301 redirects, 2 hierarchy holds, and no stale availability output.");
