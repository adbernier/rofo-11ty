const assert = require("node:assert/strict");
const path = require("node:path");
const districtGeography = require("../_data/requirementPrototypeDistrictGeography");

(async () => {
  const interview = await import(path.resolve("lib/requirements/requirement-interview-v1.mjs"));
  const bootstrap = await import(path.resolve("lib/requirements/requirement-entry-context-bootstrap.mjs"));
  const fresh = () => interview.createInterviewState({ districtGeography });
  const context = (districtId, districtName, extra = {}) => ({ intent: "new", marketId: "san-francisco", candidateDistrictIds: districtId ? [districtId] : [], candidateDistrictNames: districtName ? [districtName] : [], sourceType: "district", sourcePath: `/commercial-real-estate/CA/san-francisco/${districtId || ""}/`, ...extra });

  for (const [districtId, districtName] of [["financial-district", "Financial District"], ["mission-bay", "Mission Bay"]]) {
    const entry = context(districtId, districtName);
    const seeded = bootstrap.seedTrustedEntryContext(fresh(), entry, districtGeography);
    assert.equal(seeded.requirement.locationLogic.marketAnchor.displayName, "San Francisco");
    assert.deepEqual(seeded.requirement.locationLogic.specificPreference.candidateDistrictIds, [districtId]);
    assert.deepEqual(seeded.requirement.locationLogic.specificPreference.candidateDistrictNames, [districtName]);
    assert.equal(seeded.requirement.locationLogic.specificPreference.source, "entry_context");
    assert.equal(seeded.answers["location.anchor"], undefined, "Trusted route context must not masquerade as a user answer.");
    assert.equal(seeded.answers["location.district_candidates"], undefined, "A route candidate must remain inherited context.");
    const next = interview.selectNextQuestion(seeded);
    assert.equal(next.question.id, "foundation.property_context");
    assert.equal(next.question.prompt, "What kind of space are you looking for?");
    assert.equal(entry.sourceType, "district");
    assert(entry.sourcePath.includes(districtId));
  }

  const office = bootstrap.seedTrustedEntryContext(fresh(), context("", "", { propertyType: "office", sourceType: "space_type" }), districtGeography);
  assert.equal(office.requirement.locationLogic.marketAnchor.displayName, "San Francisco");
  assert.deepEqual(office.requirement.propertyTypes, ["office"]);
  assert.notEqual(interview.selectNextQuestion(office).question.id, "foundation.property_context", "Trusted Office context must skip the property-type question.");

  const blank = bootstrap.seedTrustedEntryContext(fresh(), { intent: "new" }, districtGeography);
  assert.equal(interview.selectNextQuestion(blank).question.id, "location.anchor");

  const existing = fresh();
  assert.equal(bootstrap.seedTrustedEntryContext(existing, { intent: "edit", marketId: "san-francisco" }, districtGeography), existing, "Edit hydration must remain server-canonical.");

  console.log("Rofo vNext district EntryContext bootstrap QA passed.");
})().catch((error) => { console.error(error); process.exitCode = 1; });
