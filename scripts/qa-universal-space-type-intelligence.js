"use strict";

const assert = require("node:assert/strict");
const registry = require("../_data/universalSpaceTypeIntelligence");
const { foundationsForRequirement, projectUniversalIntelligence } = require("../lib/intelligence/universal-space-type-intelligence");

(async () => {
  const { ACTIVITY_REGISTRY, BUSINESS_IDENTITY_TAXONOMY, RETAIL_BUSINESS_IDENTITY_TAXONOMY } = await import("../lib/requirements/requirement-interview-v1.mjs");
  const { DIMENSION_REGISTRY } = await import("../lib/requirements/requirement-domain-v1.mjs");
  const activities = new Set(ACTIVITY_REGISTRY.map((item) => item.id));
  const dimensions = new Set(DIMENSION_REGISTRY.map((item) => item.id));
  const identities = new Set([...BUSINESS_IDENTITY_TAXONOMY, ...RETAIL_BUSINESS_IDENTITY_TAXONOMY].map((item) => item.value));

  assert.equal(registry.schemaVersion, "universal-space-type-intelligence:v1");
  assert.deepEqual(Object.keys(registry.foundations), ["office", "retail", "industrial", "flex"]);
  assert.equal(registry.intelligenceLevels.length, 3);
  assert.equal(registry.briefProjectionContract.customerPresentationStatus, "NOT_WIRED");

  for (const foundation of Object.values(registry.foundations)) {
    assert.equal(foundation.status, "READY", `${foundation.id} foundation is reviewed`);
    assert.ok(foundation.dimensions.length >= 4, `${foundation.id} has bounded useful coverage`);
    assert.ok(foundation.requirementGaps.length, `${foundation.id} declares signal gaps`);
    assert.equal(new Set(foundation.dimensions.map((item) => item.id)).size, foundation.dimensions.length);
    for (const pattern of foundation.usePatterns) {
      for (const activity of pattern.activities || []) assert.ok(activities.has(activity), `${activity} reuses canonical activity taxonomy`);
      if (pattern.businessIdentity) assert.ok(identities.has(pattern.businessIdentity), `${pattern.businessIdentity} reuses canonical business taxonomy`);
    }
    for (const item of foundation.dimensions) {
      assert.ok(item.verificationBoundary);
      for (const mapped of item.signals) {
        if (mapped.kind === "activity") assert.ok(activities.has(mapped.id), `${mapped.id} is registered`);
        if (mapped.kind === "dimension") assert.ok(dimensions.has(mapped.id), `${mapped.id} is registered`);
      }
    }
  }

  const universalContent = JSON.stringify(registry.foundations).toLowerCase();
  for (const localTerm of ["san francisco", "sacramento street", "mission bay", "financial district", "bayview industrial", "dogpatch"]) {
    assert.ok(!universalContent.includes(localTerm), `universal foundations exclude local fact: ${localTerm}`);
  }
  for (const forbiddenClaim of ["asking rent", "vacancy rate", "best district", "ranked locations", "excellent loading"]) {
    assert.ok(!universalContent.includes(forbiddenClaim), `universal foundations exclude unsupported claim: ${forbiddenClaim}`);
  }
  assert.notDeepEqual(registry.foundations.industrial.dimensions.map((item) => item.id), registry.foundations.flex.dimensions.map((item) => item.id));

  const noviIndustrial = {
    propertyTypes: ["industrial_flex"],
    activities: ["store", "receive", "ship_distribute", "operate_vehicles"],
    criteria: [
      { dimension: "industrial.access.truck_circulation", value: "Box trucks" },
      { dimension: "industrial.site.fleet_storage", value: "Six vehicles" },
    ],
    locationLogic: { marketAnchor: { displayName: "Novi" } },
  };
  assert.deepEqual(foundationsForRequirement(noviIndustrial).map((item) => item.id), ["industrial", "flex"], "shared public context retains both distinct substrates");
  const projection = projectUniversalIntelligence(noviIndustrial);
  assert.deepEqual(projection, projectUniversalIntelligence(JSON.parse(JSON.stringify(noviIndustrial))), "projection is deterministic");
  assert.equal(projection.intelligenceLevel, "UNIVERSAL_SPACE_TYPE");
  assert.ok(projection.understoodRequirement.some((item) => item.signal === "dimension:industrial.access.truck_circulation"));
  assert.ok(projection.investigationTopics.includes("truck and service access"));
  assert.ok(projection.missingRequirementSignals.includes("clear height"));
  assert.equal(projection.locationIntelligenceBoundary.code, "LOCAL_EVIDENCE_REQUIRED");
  assert.ok(!JSON.stringify(projection).includes("Novi"), "projection does not turn a selected market into a local conclusion");
  assert.ok(!Object.hasOwn(projection, "recommendations"));
  assert.ok(!Object.hasOwn(projection, "rankings"));

  const officeProjection = projectUniversalIntelligence({ propertyTypes: ["office"], activities: ["work", "meet_collaborate"], criteria: [{ dimension: "office.access.client_visits", value: "Often" }] });
  assert.deepEqual(officeProjection.foundations.map((item) => item.id), ["office"]);
  assert.ok(officeProjection.understoodRequirement.some((item) => item.signal === "activity:meet_collaborate"));
  const retailProjection = projectUniversalIntelligence({ propertyTypes: ["retail_service"], activities: ["sell_serve"], criteria: [{ dimension: "retail.customer.destination_visibility", value: "Visibility" }] });
  assert.deepEqual(retailProjection.foundations.map((item) => item.id), ["retail"]);
  assert.ok(!retailProjection.whatMatters.some((item) => item.id.startsWith("office.")), "Retail does not inherit Office assumptions");

  assert.equal(registry.medicalDisposition.status, "DEFERRED");
  assert.match(registry.medicalDisposition.boundary, /verification topics, never conclusions/);
  console.log("Universal Space-Type Intelligence QA passed.");
})().catch((error) => { console.error(error); process.exitCode = 1; });
