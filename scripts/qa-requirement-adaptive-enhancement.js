"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { projectUniversalIntelligence } = require("../lib/intelligence/universal-space-type-intelligence");

(async () => {
  const interview = await import("../lib/requirements/requirement-interview-v1.mjs");
  const domain = await import("../lib/requirements/requirement-domain-v1.mjs");
  const seeded = (propertyType, marketId = "boise") => interview.createSeededInterview({ id: `${marketId}-${propertyType}`, requirement: { ...domain.createEmptyRequirement(), propertyTypes: [propertyType], locationLogic: { ...domain.createEmptyRequirement().locationLogic, marketAnchor: { marketId, geographyId: marketId, displayName: marketId.replace(/\b\w/g, (letter) => letter.toUpperCase()) } } } });
  const ids = (state) => interview.eligibleQuestions(state).map((item) => item.id);
  const criterion = (state, dimension) => state.requirement.criteria.find((item) => item.dimension === dimension);

  let warehouse = seeded("industrial_flex", "novi");
  assert(ids(warehouse).includes("industrial.pattern"));
  warehouse = interview.applyInterviewAnswer(warehouse, "industrial.pattern", { optionIds: ["storage", "distribution"] });
  assert(warehouse.requirement.activities.includes("store") && warehouse.requirement.activities.includes("ship_distribute"));
  assert(ids(warehouse).includes("logistics.receiving") && ids(warehouse).includes("industrial.loading_form"));
  assert(!ids(warehouse).includes("industrial.use_mix") && !ids(warehouse).includes("industrial.customer_priority"));
  warehouse = interview.applyInterviewAnswer(warehouse, "logistics.receiving", { optionId: "box" });
  warehouse = interview.applyInterviewAnswer(warehouse, "industrial.loading_form", { optionId: "dock" });
  assert.match(criterion(warehouse, "industrial.access.truck_circulation").value.text, /box-truck/i);
  assert.match(criterion(warehouse, "industrial.loading.form").value.text, /dock-high/i);

  let flex = seeded("industrial_flex");
  flex = interview.applyInterviewAnswer(flex, "industrial.pattern", { optionIds: ["office", "showroom", "prototype"] });
  assert(ids(flex).includes("industrial.use_mix") && ids(flex).includes("industrial.customer_priority"));
  flex = interview.applyInterviewAnswer(flex, "industrial.use_mix", { optionId: "balanced" });
  flex = interview.applyInterviewAnswer(flex, "industrial.customer_priority", { optionId: "experience" });
  assert.match(criterion(flex, "industrial.operations.use_mix").value.text, /balanced/i);
  assert.match(criterion(flex, "industrial.customer.visit_priority").value.text, /showroom/i);
  const flexProjection = projectUniversalIntelligence(flex.requirement);
  assert.deepEqual(flexProjection.foundations.map((item) => item.id), ["flex"]);
  assert(flexProjection.whatMatters.some((item) => item.id === "flex.use_mix" && /Balanced/.test(item.statedRequirement)));
  assert(flexProjection.whatMatters.length <= 5 && flexProjection.investigationTopics.length <= 7);

  let office = seeded("office");
  assert(ids(office).includes("office.working_pattern") && ids(office).includes("office.growth_horizon"));
  for (const forbidden of ["industrial.loading_form", "logistics.receiving", "retail.storefront_priority"]) assert(!ids(office).includes(forbidden));
  office = interview.applyInterviewAnswer(office, "office.working_pattern", { optionId: "focused" });
  office = interview.applyInterviewAnswer(office, "office.growth_horizon", { optionId: "modest" });
  const officeProjection = projectUniversalIntelligence(office.requirement);
  assert(officeProjection.whatMatters.some((item) => item.id === "office.configuration" && /focused work|growth/i.test(item.statedRequirement)));

  let boutique = seeded("retail_service", "nashville");
  boutique = interview.applyInterviewAnswer(boutique, "retail.business_identity", { optionId: "boutique_brand" });
  assert(ids(boutique).includes("retail.storefront_priority"));
  assert(!ids(boutique).includes("retail.delivery_service"));
  boutique = interview.applyInterviewAnswer(boutique, "retail.storefront_priority", { optionId: "essential" });
  assert.match(criterion(boutique, "retail.property.storefront_priority").value.text, /signage are essential/i);

  let food = seeded("retail_service", "nashville");
  food = interview.applyInterviewAnswer(food, "retail.business_identity", { optionId: "food_beverage" });
  assert(ids(food).includes("retail.delivery_service"));
  food = interview.applyInterviewAnswer(food, "retail.delivery_service", { optionId: "frequent" });
  assert.match(criterion(food, "retail.operations.delivery_receiving").value.text, /frequent food/i);

  const roundTrip = interview.hydrateInterviewState(JSON.parse(JSON.stringify(flex)));
  assert.equal(criterion(roundTrip, "industrial.operations.use_mix").value.text, criterion(flex, "industrial.operations.use_mix").value.text);
  const oldRequirement = domain.normalizeRequirement({ schemaVersion: "requirement:v1", propertyTypes: ["office"], activities: ["work"] });
  assert(!oldRequirement.criteria.some((item) => ["industrial.loading.form", "industrial.operations.use_mix"].includes(item.dimension)), "Absent legacy answers remain unknown, not false");

  const candidate = JSON.parse(JSON.stringify(flex.requirement));
  candidate.locationLogic.specificPreference = { candidateDistrictIds: ["jackson-square"], candidateDistrictNames: ["Jackson Square"] };
  assert.deepEqual(projectUniversalIntelligence(candidate), projectUniversalIntelligence(flex.requirement), "Entry geography cannot influence new signals");

  const css = fs.readFileSync(path.join(__dirname, "../assets/requirement-prototype.css"), "utf8");
  assert(css.includes("min-height:3.35rem") && css.includes(":focus-within") && css.includes("input:checked"));
  assert(css.includes("@media(max-width:760px)") && css.includes(".requirement-choice-grid") && css.includes("grid-template-columns:1fr"));

  console.log("Adaptive Requirement Enhancement QA passed: branching, canonical persistence, projection, neutrality, and mobile/accessibility contracts.");
})().catch((error) => { console.error(error); process.exit(1); });
