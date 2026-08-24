const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const accessFoundation = require("../_data/sfAccessFoundationV0");
const compositionFoundation = require("../_data/sfOfficeCompositionFoundation");
const sfOfficeModel = require("../_data/sfOfficeRecommendationModel");
const districtGeography = require("../_data/requirementPrototypeDistrictGeography");
const composer = require("../lib/recommendations/private-location-composition");

const value = (text = "", list = []) => ({ text, number: null, boolean: null, list });
const criterion = (dimension, text, list = [], status = "PREFERRED") => ({
  id: `criterion_${dimension.replace(/[^a-z0-9]+/gi, "_").toLowerCase()}`,
  dimension,
  value: value(text, list),
  status,
  scope: dimension.startsWith("universal.business") ? "business" : "location",
  source: "user_statement",
  confidence: 1,
  rationale: "Deterministic QA fixture",
  authority: "business",
  requiresConfirmation: false,
  confirmed: true,
});

(async function run() {
  const engine = await import(path.resolve("lib/requirements/requirement-interview-v1.mjs"));
  const domain = await import(path.resolve("lib/requirements/requirement-domain-v1.mjs"));

  assert.deepEqual(engine.BUSINESS_IDENTITY_TAXONOMY.map((item) => item.id), ["design_creative", "professional_services", "technology", "life_science", "nonprofit"]);
  assert(domain.DIMENSIONS_BY_ID["universal.business.type"]);
  assert.equal(domain.DIMENSIONS_BY_ID["office.occupancy.peak_attendance"].readiness.includes("location"), false);
  assert.equal(domain.DIMENSIONS_BY_ID["office.occupancy.peak_attendance"].readiness.includes("property"), true);
  assert.equal(engine.QUESTIONS_BY_ID["work.peak"].stage, "PROPERTY");

  const commonAnswers = {
    "location.anchor": { text: "San Francisco, CA", market: { geographyId: "san-francisco", marketId: "san-francisco", marketName: "San Francisco", city: "San Francisco", state: "CA", displayName: "San Francisco, CA" } },
    "foundation.property_context": { optionId: "office" },
    "location.district_candidates": { noPreference: true, districtIds: [], otherText: "" },
    "foundation.objective": { optionId: "relocate" },
    "office.client_frequency": { optionId: "rare" },
    "office.exceptions": { optionIds: ["none"] },
    "employee.origins": { optionIds: ["san_francisco"] },
    "access.transit": { optionId: "helpful" },
    "access.parking": { optionId: "helpful" },
    "final.unusual": { optionId: "none" },
  };

  function runOfficePath(id, businessAnswer, environmentAnswer, seedRequirement = null) {
    let state = seedRequirement ? engine.createSeededInterview({ id, requirement: seedRequirement, districtGeography }) : engine.createInterviewState({ scenarioId: id, districtGeography });
    const questions = [];
    for (let index = 0; index < 30; index += 1) {
      const selection = engine.selectNextQuestion(state);
      if (!selection.question) break;
      const question = selection.question;
      questions.push(question.id);
      const answer = question.id === "business.identity" ? businessAnswer : question.id === "office.environment_confirmation" ? environmentAnswer : commonAnswers[question.id];
      assert(answer, `Missing answer for ${question.id}`);
      state = engine.applyInterviewAnswer(state, question.id, answer);
    }
    assert.equal(engine.selectNextQuestion(state).action, "READY");
    assert.equal(state.requirement.readiness.readyForLocation.ready, true);
    return { state, questions, recommendation: composer.composeLocationRecommendations(state.requirement, accessFoundation, compositionFoundation, sfOfficeModel) };
  }

  const architectureNeutral = runOfficePath("architecture-neutral", { optionId: "design_creative" }, { optionId: "neutral" });
  const architectureEstablished = runOfficePath("architecture-established", { optionId: "design_creative" }, { optionId: "established" });
  const accountingNeutral = runOfficePath("accounting-neutral", { optionId: "professional_services" }, { optionId: "neutral" });
  const accountingCreative = runOfficePath("accounting-creative", { optionId: "professional_services" }, { optionId: "creative" });
  const unknownBusiness = runOfficePath("unknown-business", { text: "furniture importer" }, null);

  for (const result of [architectureNeutral, architectureEstablished, accountingNeutral, accountingCreative, unknownBusiness]) {
    assert(!result.questions.includes("work.peak"));
    assert(!result.questions.some((id) => /growth/i.test(id)), "No growth question may enter ordinary Office Location intake.");
    assert.equal(result.questions.at(-1), "final.unusual");
  }
  assert(architectureNeutral.questions.indexOf("business.identity") < architectureNeutral.questions.indexOf("office.environment_confirmation"));
  assert(architectureNeutral.questions.indexOf("office.environment_confirmation") < architectureNeutral.questions.indexOf("office.client_frequency"));
  assert(architectureNeutral.questions.indexOf("office.exceptions") < architectureNeutral.questions.indexOf("employee.origins"));

  const architectureIdentity = architectureNeutral.state.requirement.criteria.find((item) => item.dimension === "universal.business.type");
  assert.deepEqual(architectureIdentity.value.list, ["design_creative", "Architecture, Design & Creative Services"]);
  assert.equal(architectureNeutral.recommendation.businessIdentity.typeId, "design_creative");
  assert.equal(architectureNeutral.recommendation.businessIdentity.environmentPreference, "NO_STRONG_PREFERENCE");
  assert.equal(architectureEstablished.recommendation.businessIdentity.environmentPreference, "traditional_professional");
  assert.deepEqual(architectureNeutral.recommendation.shortlist.map((item) => item.districtId), ["soma", "jackson-square", "showplace-square"]);
  assert.deepEqual(architectureEstablished.recommendation.shortlist.map((item) => item.districtId), ["jackson-square", "financial-district", "south-beach"]);

  assert.equal(accountingNeutral.recommendation.businessIdentity.typeId, "professional_services");
  assert.equal(accountingNeutral.recommendation.businessIdentity.environmentPreference, "NO_STRONG_PREFERENCE");
  assert.equal(accountingCreative.recommendation.businessIdentity.environmentPreference, "creative_informal");
  assert.deepEqual(accountingNeutral.recommendation.shortlist.map((item) => item.districtId), ["financial-district", "jackson-square", "south-beach"]);

  const componentSignature = (result, component) => result.recommendation.considered.map((item) => [item.districtId, component === "access" ? [item.access.overall, item.access.confidence, item.accessComponent.band] : [item.office.band, item.office.summary]]);
  assert.deepEqual(componentSignature(architectureNeutral, "access"), componentSignature(architectureEstablished, "access"));
  assert.deepEqual(componentSignature(architectureNeutral, "office"), componentSignature(architectureEstablished, "office"));
  assert.deepEqual(componentSignature(accountingNeutral, "access"), componentSignature(accountingCreative, "access"));
  assert.deepEqual(componentSignature(accountingNeutral, "office"), componentSignature(accountingCreative, "office"));
  assert.notDeepEqual(accountingNeutral.recommendation.considered.map((item) => [item.districtId, item.environment.band]), accountingCreative.recommendation.considered.map((item) => [item.districtId, item.environment.band]));

  const unknownIdentity = unknownBusiness.state.requirement.criteria.find((item) => item.dimension === "universal.business.type");
  assert.equal(unknownIdentity.value.text, "furniture importer");
  assert.equal(unknownIdentity.status, "UNKNOWN");
  assert(!unknownBusiness.questions.includes("office.environment_confirmation"));
  assert.equal(unknownBusiness.recommendation.businessIdentity.typeId, "");
  assert.equal(unknownBusiness.recommendation.businessIdentity.environmentPreference, "");
  const restoredArchitecture = engine.hydrateInterviewState(JSON.parse(JSON.stringify(architectureNeutral.state)));
  assert.equal(engine.selectNextQuestion(restoredArchitecture).action, "READY");
  assert.deepEqual(restoredArchitecture.requirement.criteria.find((item) => item.dimension === "universal.business.type").value.list, ["design_creative", "Architecture, Design & Creative Services"]);
  const backedArchitecture = engine.backInterview(restoredArchitecture);
  assert.equal(engine.selectNextQuestion(backedArchitecture).question.id, "final.unusual");
  assert.deepEqual(backedArchitecture.requirement.criteria.find((item) => item.dimension === "universal.business.type").value.list, ["design_creative", "Architecture, Design & Creative Services"]);

  const retailState = engine.createSeededInterview({ id: "retail-applicability", requirement: { objective: { summary: "Open a store" }, propertyTypes: ["retail_service"], activities: ["host_visitors", "sell_serve"], locationLogic: { locations: ["San Francisco"], marketAnchor: { marketId: "san-francisco", geographyId: "san-francisco", displayName: "San Francisco, CA" } } }, districtGeography });
  assert(!engine.eligibleQuestions(retailState).some((item) => ["business.identity", "office.environment_confirmation"].includes(item.id)), "Office-reviewed identity/environment questions must not become mandatory for unsupported property contexts.");

  const knownIdentitySeed = {
    criteria: [criterion("universal.business.type", "", ["design_creative", "Architecture, Design & Creative Services"])],
  };
  const knownContext = runOfficePath("known-context", null, { optionId: "neutral" }, knownIdentitySeed);
  assert(!knownContext.questions.includes("business.identity"));
  assert(knownContext.questions.includes("office.environment_confirmation"));

  let editableIdentityState = engine.createSeededInterview({ id: "editable-identity", requirement: knownIdentitySeed, districtGeography });
  for (const questionId of ["location.anchor", "foundation.property_context", "location.district_candidates", "foundation.objective"]) editableIdentityState = engine.applyInterviewAnswer(editableIdentityState, questionId, commonAnswers[questionId]);
  assert.equal(engine.selectNextQuestion(editableIdentityState).question.id, "office.environment_confirmation");
  const changedToUnknown = domain.updateCriterion(editableIdentityState.requirement, criterion("universal.business.type", "furniture importer", [], "UNKNOWN"));
  assert.deepEqual(changedToUnknown.errors, []);
  const changedUnknownState = engine.createSeededInterview({ id: "changed-unknown", requirement: changedToUnknown.requirement, districtGeography });
  assert(!engine.eligibleQuestions(changedUnknownState).some((item) => item.id === "office.environment_confirmation"));
  const changedToAccounting = domain.updateCriterion(changedToUnknown.requirement, criterion("universal.business.type", "", ["professional_services", "Financial & Professional Services"]));
  assert.deepEqual(changedToAccounting.errors, []);
  const changedAccountingState = engine.createSeededInterview({ id: "changed-accounting", requirement: changedToAccounting.requirement, districtGeography });
  assert.equal(changedAccountingState.requirement.criteria.find((item) => item.dimension === "universal.business.type").value.list[0], "professional_services");
  assert(engine.eligibleQuestions(changedAccountingState).some((item) => item.id === "office.environment_confirmation"));

  const knownPeakUpdate = domain.updateCriterion(architectureNeutral.state.requirement, criterion("office.occupancy.peak_attendance", "35", [], "PREFERRED"));
  assert.deepEqual(knownPeakUpdate.errors, []);
  assert.equal(knownPeakUpdate.requirement.criteria.find((item) => item.dimension === "office.occupancy.peak_attendance").value.text, "35");
  assert.equal(knownPeakUpdate.requirement.readiness.readyForLocation.ready, true);
  const knownPeakState = engine.createSeededInterview({ id: "known-peak", requirement: knownPeakUpdate.requirement, districtGeography });
  assert(!engine.eligibleQuestions(knownPeakState).some((item) => item.id === "work.peak"));
  const knownPeakRecommendation = composer.composeLocationRecommendations(knownPeakState.requirement, accessFoundation, compositionFoundation, sfOfficeModel);
  assert.deepEqual(knownPeakRecommendation.shortlist.map((item) => item.districtId), architectureNeutral.recommendation.shortlist.map((item) => item.districtId));

  assert(architectureNeutral.recommendation.shortlist.some((item) => item.presentationGroupId === "sf-office:showplace-square-design-district"));
  assert.equal(architectureNeutral.recommendation.shortlist.filter((item) => ["showplace-square", "design-district"].includes(item.districtId)).length, 1);
  const source = fs.readFileSync("lib/requirements/requirement-interview-v1.mjs", "utf8");
  const businessBlock = source.slice(source.indexOf("BUSINESS_IDENTITY_TAXONOMY"), source.indexOf("const officeEnvironmentChoices"));
  ["financial-district", "soma", "jackson-square", "showplace-square", "design-district"].forEach((districtId) => assert(!businessBlock.includes(districtId)));

  const page = fs.readFileSync("pages/prototype/requirement-v1.njk", "utf8");
  const client = fs.readFileSync("js/requirement-prototype.js", "utf8");
  assert(page.includes("data-continue-question disabled"));
  assert(client.includes("backInterview(state.interview)") && client.includes("sessionStorage.getItem") && client.includes("sessionStorage.setItem"));
  assert(!client.includes('input.addEventListener("change", () => submitAnswer'));
  assert(client.includes('["Business", businessIdentity]') && client.includes('["Environment", criterionText(["office.environment.image"])]'));

  const unchangedHashes = {
    "_data/sfOfficeRecommendationModel.js": "e76839ebf3e5be19bcffc412cc1bdd3f8dbd32977b07d1bf2a14dcaa354a1e81",
    "lib/recommendations/sf-office-recommendation-resolver.js": "6f0f4e968915a78beeba5d473bf315723ea073beff8208ac9e7925ea235b4dde",
    "lib/recommendations/normalize-sf-office-profile.js": "6116531e6296d573f3a2dd728cf677b9f9a54ac9fd64753ef3a6609549cc3f95",
    "_data/neighborhoodPages.js": "5234d07c7e3159509dd23db2a5fa3ce3e851fb0728386458a65cb12fc07f4748",
    "pages/sitemap.njk": "1fdc4e164ac4fa478afc850f6a577bec9c7ca696f45023b0e7ec5333153964d4",
  };
  Object.entries(unchangedHashes).forEach(([file, expected]) => assert.equal(crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex"), expected));

  const report = (name, result) => console.log(`${name}: questions=${result.questions.length}; ${result.questions.join(" -> ")}; shortlist=${result.recommendation.shortlist.map((item) => item.districtName).join(" | ")}`);
  report("architecture/no preference", architectureNeutral);
  report("architecture/established", architectureEstablished);
  report("accounting/no preference", accountingNeutral);
  report("accounting/creative", accountingCreative);
  report("unknown business", unknownBusiness);
  report("known identity", knownContext);
  console.log("Requirement business identity + Location-stage simplification QA passed.");
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
