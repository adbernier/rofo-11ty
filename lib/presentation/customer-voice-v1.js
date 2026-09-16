"use strict";

// Customer presentation is intentionally downstream of recommendation logic.
// See docs/product/rofo-customer-voice-v1.md before adding customer-facing copy.
const EMPTY = /^(not provided|not stated|not a stated priority|unknown|n\/a|none)$/i;
const PROPERTY_CHECK = /\b(availability|suite|building|loading|clear height|power|yard|parking|permitted use|use compatibility|configuration|office ratio|office\/warehouse mix|buildout|ventilation)\b/i;
const INTERNAL = /\b(applicability|bounded|calibration|composition|evidence foundation|evidence model|reviewed evidence|evidence supports|requirement-specific|projection|resolver|operating environment|investigation status|representative environment|readiness|canonical|abstention|eligibility|cohort|deterministic|provenance)\b/i;

const DISTRICT_FACTS = Object.freeze({
  "northgate-north-market-industrial": { name: "Northgate / North Market", distinction: "Lighter warehouse and service space in north Sacramento", why: ["A practical starting point for contractor, service-industrial and office/warehouse searches.", "Multi-tenant space in the area can combine workspace, storage and field operations."], character: "Lighter, multi-tenant warehouse and service space", bestFor: "Contractor, service-industrial and office/warehouse" },
  "power-inn-industrial": { name: "Power Inn", distinction: "Sacramento's deeper warehouse, distribution and production district", why: ["A stronger place to start for conventional warehouse, distribution and production searches.", "The broader district includes a wider range of industrial formats than Northgate / North Market."], character: "Broader conventional industrial building mix", bestFor: "Warehouse, distribution and production" },
  "indianapolis-airport-logistics": { distinction: "Airport-side warehouse, distribution and logistics operations", bestFor: "Warehouse, distribution and airport-related operations", character: "Larger logistics-led industrial settings" },
  "park-100-northwest-indianapolis": { name: "Park 100 / Northwest Indianapolis", distinction: "Multi-tenant office/warehouse and lighter operating space", bestFor: "Contractor, service and office/warehouse needs", character: "Multi-tenant industrial and flex buildings" },
  "southwest-phoenix-industrial": { distinction: "Conventional warehouse and industrial space in southwest Phoenix", bestFor: "Warehouse, distribution and conventional industrial needs", character: "Broad conventional industrial building mix" },
  "airport-south-central-industrial": { name: "Airport / South Central", distinction: "Central infill space for service, warehouse and production uses", bestFor: "Service, warehouse and light production needs", character: "Infill industrial and office/production settings" },
  "north-phoenix-advanced-operations": { name: "North Phoenix Advanced Operations", distinction: "Technical, engineering and advanced-production settings", bestFor: "Technical, engineering and advanced-production work", character: "Specialized technical and production settings" },
  "miramar": { distinction: "Broad warehouse, contractor, service and showroom district", bestFor: "Warehouse, contractor, service and showroom needs", character: "Broad mix of conventional industrial formats" },
  "otay-mesa": { distinction: "Border-oriented distribution, logistics and manufacturing district", bestFor: "Distribution, logistics and manufacturing", character: "Larger, truck-oriented industrial settings" },
  "kearny-mesa": { distinction: "Central service, showroom and office/warehouse district", bestFor: "Service, showroom and office/warehouse needs", character: "Customer-facing and operating space in a central location" },
  "sorrento-mesa": { distinction: "Technical, R&D and engineering-focused business area", bestFor: "R&D, engineering and technical operations", character: "Technical and office/industrial settings" },
  "anaheim-canyon": { distinction: "Broader warehouse, distribution and industrial district", bestFor: "Warehouse, distribution and larger operating needs", character: "Conventional industrial and business-park buildings" },
  "fullerton-industrial-service-area": { name: "Fullerton Industrial / Service Area", distinction: "Smaller-format contractor, service and office/warehouse area", bestFor: "Contractor, service and smaller office/warehouse needs", character: "Smaller multi-tenant and service-industrial space" }
});

const normalize = value => String(value || "").replace(/\s+/g, " ").trim();
const omitEmpty = value => value == null || !normalize(value) || EMPTY.test(normalize(value));
const words = value => new Set(normalize(value).toLowerCase().replace(/[^a-z0-9 ]/g, " ").split(/\s+/).filter(word => word.length > 3));
function similarity(a, b) { const x = words(a), y = words(b), union = new Set([...x, ...y]); return union.size ? [...x].filter(word => y.has(word)).length / union.size : 0; }
function uniqueMeaningful(values, limit = Infinity) { const result = []; for (const value of values || []) { const clean = customerSentence(value); if (!omitEmpty(clean) && !result.some(item => similarity(item, clean) >= 0.72)) result.push(clean); if (result.length >= limit) break; } return result; }
function customerSentence(value) {
  return normalize(value)
    .replace(/^This Requirement aligns with (?:the )?(?:reviewed )?/i, "This search aligns with ")
    .replace(/^This Requirement matches (?:the )?(?:reviewed )?/i, "This search matches ")
    .replace(/^Reviewed\s+/i, "")
    .replace(/\breviewed\s+(?:local\s+)?evidence\s+(?:supports|shows)\s+/gi, "")
    .replace(/\breviewed\s+/gi, "")
    .replace(/\bevidence supports\s+/gi, "")
    .replace(/\bIndustrial-led applicability:?\s*/gi, "")
    .replace(/\bMixed Industrial\/Flex applicability:?\s*/gi, "")
    .replace(/\boperating environment\b/gi, "commercial setting")
    .replace(/\brepresentative environments\b/gi, "examples in the area")
    .replace(/\brepresentative environment\b/gi, "example of the area")
    .replace(/\brequirement-specific investigation\b/gi, "property-level confirmation")
    .replace(/\bproperty capabilities\b/gi, "building details")
    .replace(/\bA supported ([^.]+) environment\b/gi, "A $1 setting")
    .replace(/\bsupported access\b/gi, "access")
    .replace(/\s+\./g, ".");
}
function itemFact(item) { return DISTRICT_FACTS[item.districtId] || {}; }
function itemName(item) { return itemFact(item).name || item.districtName || item.name || "Area"; }
function rawSummary(item) { return item.propertyTypeFit?.summary || item.industrialFlex?.summary || item.retail?.summary || item.office?.summary || item.role || (item.strengths || item.reasons || [])[0]; }
function distinction(item) { return itemFact(item).distinction || customerSentence(rawSummary(item)) || "A location worth considering for this search"; }
function why(item) { const fact = itemFact(item); return uniqueMeaningful(fact.why || item.strengths || item.reasons || [rawSummary(item)], 3); }
function worthKnowing(item) { return uniqueMeaningful([...(item.tradeoffs || []), ...(item.locationConsiderations || [])].filter(value => !PROPERTY_CHECK.test(value)), 2); }
function checksFor(items, propertyType) {
  const observed = uniqueMeaningful(items.flatMap(item => [...(item.tradeoffs || []), ...(item.unknowns || [])]).filter(value => PROPERTY_CHECK.test(value)), 4);
  if (observed.length) return observed;
  if (propertyType === "industrial_flex") return ["Loading, clear height, power and yard needs", "Suite configuration, permitted use and current availability"];
  if (propertyType === "retail_service") return ["Space configuration, permitted use and current availability"];
  return ["Building configuration, lease terms and current availability"];
}
function comparisonRows(items) {
  if (items.length < 2) return [];
  const definitions = [
    { label: "Best starting point for", values: items.map(item => itemFact(item).bestFor || distinction(item)) },
    { label: "Typical character", values: items.map(item => itemFact(item).character || customerSentence(rawSummary(item))) }
  ];
  return definitions.filter(row => row.values.every(value => !omitEmpty(value)) && new Set(row.values.map(normalize)).size > 1);
}
function meaningfulIntro(items, market) {
  if (items.length === 1) return `${itemName(items[0])} is the clearest starting point for the search you described: ${distinction(items[0]).replace(/^./, letter => letter.toLowerCase())}.`;
  if (items.length === 2) {
    const first = items[0], second = items[1];
    return `Both are worth considering: ${itemName(first)} offers ${distinction(first).replace(/^./, letter => letter.toLowerCase())}, while ${itemName(second)} offers ${distinction(second).replace(/^./, letter => letter.toLowerCase())}.`;
  }
  if (items.length > 2) return `These areas cover different sides of the search: ${items.map(item => `${itemName(item)} for ${distinction(item).replace(/^./, letter => letter.toLowerCase())}`).join("; ")}.`;
  return `A little more detail will help narrow the right part of ${market || "the market"}.`;
}
function projectLocationBrief({ snapshot, requirement, market }) {
  const items = snapshot.shortlist || [];
  const investigate = snapshot.readiness === "INVESTIGATE" || !items.length;
  if (investigate) return {
    mode: "INVESTIGATE", heading: "A little more detail will help narrow the location",
    intro: "We need to understand a few building and operating needs before pointing you to a district.",
    locations: [], comparison: [],
    confirmHeading: "What we'll ask next",
    confirm: ["What the space needs to support", "The size and layout you need", "Any loading, power, parking or yard requirements", "Who needs to reach the location"],
    next: { heading: "Tell us what the space needs to support", copy: "A few practical details will help Rofo focus the search.", action: "Continue my search →" }
  };
  const locations = items.map(item => ({ id: item.districtId, name: itemName(item), distinction: distinction(item), why: why(item), worthKnowing: worthKnowing(item) }));
  return {
    mode: snapshot.readiness,
    heading: items.length === 1 ? "One area to start with" : items.length === 2 ? "Two areas worth comparing" : `${items.length} areas worth comparing`,
    intro: meaningfulIntro(items, market), locations,
    comparison: comparisonRows(items),
    confirmHeading: "What we'll confirm",
    confirm: checksFor(items, requirement.propertyTypes?.[0]),
    next: { heading: "Ready to look at specific spaces?", copy: "We'll use this location guidance and confirm the property details that matter to your search.", action: "Find spaces that fit →" }
  };
}
const VALUE_LABELS = Object.freeze({
  work: "day-to-day work", meet_collaborate: "team collaboration", host_visitors: "client and visitor meetings",
  sell_serve: "customer-facing activity", dispatch: "dispatch", operate_vehicles: "service vehicles",
  store: "storage", receive: "receiving", repair_service: "onsite service or repair work",
  outdoor_operations: "outdoor operations", ship_distribute: "shipping and distribution",
  make_assemble: "manufacturing and assembly", display_present: "product display or presentations",
  product_development: "product development", prototype: "prototyping", research: "R&D",
  research_test: "R&D and prototyping", prepare_produce_food: "food preparation or production",
  treat_care: "patient or client care", teach_train_events: "teaching, training or events"
});
function criterionValue(item) {
  const value = item?.value || {};
  return normalize((value.list || []).join(", ") || value.text || (value.number == null ? "" : value.number));
}
function criteriaFor(requirement, predicate) { return (requirement.criteria || []).map(item => ({ ...item, text: criterionValue(item) })).filter(item => !omitEmpty(item.text) && predicate(item)); }
function firstCriterion(requirement, dimensions) { return criteriaFor(requirement, item => dimensions.includes(item.dimension))[0]?.text || ""; }
function sentence(value) { const clean = customerSentence(value); return clean ? `${clean.replace(/[.!?]+$/, "")}.` : ""; }
function joinNames(values) {
  const names = (values || []).filter(Boolean);
  if (names.length < 2) return names[0] || "";
  const compound = names.filter(value => /\band\b/i.test(value));
  const simple = names.filter(value => !/\band\b/i.test(value));
  if (compound.length === 1 && simple.length) {
    const simpleText = simple.length === 1 ? simple[0] : `${simple.slice(0, -1).join(", ")} and ${simple.at(-1)}`;
    return `${simpleText}, as well as ${compound[0]}`;
  }
  if (compound.length > 1) {
    return `${names.slice(0, -1).join("; ")}; and ${names.at(-1)}`;
  }
  return `${names.slice(0, -1).join(", ")} and ${names.at(-1)}`;
}
function readablePriority(item) {
  const labels = {
    "office.occupancy.peak_attendance": "Room for the team at peak attendance",
    "office.access.client_visits": "Client access and visits",
    "office.access.transit": "Transit access",
    "universal.access.transit_importance": "Transit access",
    "universal.access.parking_importance": "Parking",
    "office.access.parking": "Parking",
    "universal.growth.future_state": "Room for expected growth",
    "universal.timing.current_lease": "Timing around the current lease",
    "industrial.site.fleet_storage": "Vehicle storage",
    "industrial.operations.warehouse_storage": "Warehouse and storage capacity",
    "industrial.operations.repair_production": "Space for onsite service or production",
    "industrial.loading.grade_level": "Grade-level loading",
    "industrial.access.truck_circulation": "Truck circulation",
    "industrial.power.three_phase": "Three-phase power"
  };
  if (item.dimension === "universal.location.employee_origins") return `Employees coming from ${item.text}`;
  return labels[item.dimension] || item.text;
}
function cleanBusinessSummary(value) {
  return customerSentence(value)
    .replace(/(?:^|\s+)Ordinary\s+(?:Office|Retail|Industrial(?:\/Flex)?)\s+use\.?/gi, " ")
    .replace(/\s+([.,;:])/g, "$1")
    .replace(/\.{2,}/g, ".")
    .trim();
}
function environmentSummary({ environment, employeeOrigins, clientPattern, transit, parking, locationRationale }) {
  const parts = [];
  if (environment) parts.push(sentence(environment));
  const employeesMatter = /employee/i.test(locationRationale) || Boolean(employeeOrigins);
  const clientsMatter = /client|customer/i.test(locationRationale) || /frequent|regular|often/i.test(clientPattern);
  if (employeesMatter || clientsMatter) {
    const audiences = employeesMatter && clientsMatter ? "employees and visiting clients" : employeesMatter ? "employees" : "visiting clients";
    let access = employeeOrigins
      ? `We're looking for a location that works well for employees coming from ${employeeOrigins.replace(/[.!?]+$/, "")}`
      : `We're looking for a location that works well for ${audiences}`;
    if (transit) {
      const cleanTransit = transit.replace(/[.!?]+$/, "");
      const transitPhrase = /is helpful$/i.test(cleanTransit)
        ? cleanTransit.replace(/\s+is helpful$/i, "").replace(/^public transit$/i, "access to public transit").toLowerCase()
        : cleanTransit.replace(/^./, letter => letter.toLowerCase());
      access += `, with ${transitPhrase}`;
    }
    parts.push(`${access}.`);
  } else {
    if (locationRationale) parts.push(sentence(locationRationale));
    if (employeeOrigins) parts.push(`The location needs to work for employees coming from ${employeeOrigins.replace(/[.!?]+$/, "")}.`);
    if (transit) parts.push(sentence(transit));
  }
  if (clientPattern && !clientsMatter) parts.push(/rarely|never/i.test(clientPattern) ? "Client visits are uncommon." : sentence(clientPattern));
  if (parking) parts.push(sentence(parking.replace(/\bis helpful\b/i, "would be helpful")));
  return uniqueMeaningful(parts, 3);
}
function spaceRequirementPhrase(item) {
  const phrases = {
    "office.occupancy.peak_attendance": `room for about ${item.text} people at peak attendance`,
    "industrial.use.showroom": "showroom space",
    "industrial.site.service_vehicles": "service vehicles",
    "industrial.access.customer_visits": "customer visits",
    "industrial.operations.logistics": "logistics operations",
    "industrial.access.truck_circulation": "truck circulation",
    "industrial.loading.grade_level": "grade-level loading",
    "industrial.site.trailer_parking": "trailer parking",
    "industrial.access.border": "access to the border"
  };
  return phrases[item.dimension] || "";
}
function flexibilitySentence(item) {
  if (item.dimension === "office.access.client_visits") return "Client access is something we're willing to compromise on.";
  const label = readablePriority(item).replace(/ access$/i, "");
  if (item.status === "FLEXIBLE") return `${label} is something we're willing to compromise on.`;
  return `${label} would be helpful, but isn't essential.`;
}
function sharedSearchWhere(items) {
  const names = items.map(itemName);
  const offer = item => distinction(item);
  if (!names.length) return ["We don't have enough information yet to recommend specific areas confidently."];
  if (items.length === 1) return [`We'd start with ${names[0]}: ${offer(items[0])}.`];
  if (items.length === 2) return [`We'd start with ${joinNames(names)}.`, `${names[0]} offers one path: ${offer(items[0])}. ${names[1]} offers another: ${offer(items[1])}.`];
  return [
    `We'd start with ${joinNames(names)}.`,
    `Each offers a different path: ${names.map((name, index) => `${name} — ${offer(items[index])}`).join("; ")}.`
  ];
}
function projectSharedSearchBrief({ snapshot, requirement, market }) {
  const propertyType = (requirement.propertyTypes || [])[0] || "";
  const business = cleanBusinessSummary(requirement.businessContext?.summary || firstCriterion(requirement, ["universal.business.type"])) || "We still need a clearer description of the business and how it will use the space.";
  const objective = customerSentence(requirement.objective?.summary || "");
  const workPattern = firstCriterion(requirement, ["office.workplace.pattern", "universal.work.pattern"]);
  const objectiveCopy = /^(relocate|find|open|consolidate|expand|move)\b/i.test(objective)
    ? `The goal is to ${objective.replace(/^./, letter => letter.toLowerCase()).replace(/[.!?]+$/, "")}.`
    : sentence(objective);
  const businessParts = uniqueMeaningful([sentence(business), objectiveCopy, sentence(workPattern)], 3);

  const environment = firstCriterion(requirement, ["office.environment.image", "universal.environment.preference"]);
  const employeeOrigins = firstCriterion(requirement, ["universal.location.employee_origins", "office.location.employee_geography"]);
  const clientPattern = firstCriterion(requirement, ["office.access.client_visits", "universal.location.customer_origins"]);
  const transit = firstCriterion(requirement, ["universal.access.transit_importance", "office.access.transit"]);
  const parking = firstCriterion(requirement, ["universal.access.parking_importance", "office.access.parking"]);
  const locationRationale = (requirement.locationLogic?.rationale || []).join(". ") || requirement.locationLogic?.summary || "";
  const environmentParts = environmentSummary({ environment, employeeOrigins, clientPattern, transit, parking, locationRationale });
  if (!environmentParts.length) environmentParts.push("We still need to confirm which location and setting qualities should guide the search.");

  const size = customerSentence(requirement.sizeCapacity?.summary || firstCriterion(requirement, ["universal.capacity.size"]));
  const growth = customerSentence(requirement.growth?.summary || firstCriterion(requirement, ["universal.growth.future_state"]));
  const timing = customerSentence(requirement.timing?.summary || firstCriterion(requirement, ["universal.timing.target", "universal.timing.current_lease"]));
  const activities = (requirement.activities || []).map(value => propertyType === "industrial_flex" && value === "host_visitors" ? "customer visits" : VALUE_LABELS[value] || "").filter(Boolean);
  const operational = criteriaFor(requirement, item => /^(industrial\.|retail\.|office\.(?:occupancy|workplace|layout))/.test(item.dimension));
  const requiredSpaceRequirements = uniqueMeaningful(operational.filter(item => item.status === "REQUIRED" && item.dimension !== "office.occupancy.peak_attendance").map(spaceRequirementPhrase).filter(Boolean), 7);
  const preferredSpaceRequirements = uniqueMeaningful(operational.filter(item => item.status === "PREFERRED" && item.dimension !== "office.occupancy.peak_attendance").map(spaceRequirementPhrase).filter(Boolean), 7);
  const peakAttendance = criteriaFor(requirement, item => item.dimension === "office.occupancy.peak_attendance")[0];
  const propertyName = propertyType === "industrial_flex" ? "Industrial, warehouse or flex space" : propertyType === "retail_service" ? "Retail or service space" : "Office space";
  const spaceParts = [];
  const simpleSize = size.match(/^(Approximately|About)\s+([\d,.–-]+\s*SF)\.?$/i);
  if (simpleSize) spaceParts.push(`${simpleSize[1]} ${simpleSize[2]} of ${propertyName.toLowerCase()}.`);
  else if (size) spaceParts.push(`${propertyName}. ${sentence(size)}`);
  else if (peakAttendance) spaceParts.push(`${propertyName} for a team with peak attendance around ${peakAttendance.text.replace(/\s*people$/i, "")} people. We don't yet have enough information to recommend a useful square-footage range.`);
  else spaceParts.push(`${propertyName}. We don't yet know enough about team size or space needs to suggest a useful size range.`);
  const functionalNeeds = uniqueMeaningful([...activities, ...requiredSpaceRequirements], 8);
  if (functionalNeeds.length) spaceParts.push(`The space needs to support ${joinNames(functionalNeeds)}.`);
  if (preferredSpaceRequirements.length) spaceParts.push(`We'd prefer ${joinNames(preferredSpaceRequirements)}.`);
  if (growth) spaceParts.push(sentence(growth));
  if (timing) spaceParts.push(sentence(timing));
  const items = snapshot?.shortlist || [];
  const names = items.map(itemName);
  const whereParts = sharedSearchWhere(items);
  const geographyFlexible = requirement.locationLogic?.specificPreference?.hasPreference === false;
  if (geographyFlexible && names.length) whereParts.push("We're open to other areas when they solve the underlying business and space needs.");

  const flexibleCriteria = criteriaFor(requirement, item => item.status === "FLEXIBLE");
  const preferredCriteria = criteriaFor(requirement, item => item.status === "PREFERRED" && /helpful|preferred|would like|nice to have/i.test(item.text));
  const flexibility = uniqueMeaningful([
    ...flexibleCriteria.map(flexibilitySentence),
    ...preferredCriteria.map(flexibilitySentence),
    geographyFlexible ? "We're open to other districts if the location solves the underlying needs." : ""
  ], 4);
  if (!flexibility.length) flexibility.push("We haven't identified any meaningful areas of flexibility yet.");

  const required = criteriaFor(requirement, item => item.status === "REQUIRED");
  const preferred = criteriaFor(requirement, item => item.status === "PREFERRED");
  const priorities = uniqueMeaningful([...required, ...preferred].map(readablePriority), 5);
  if (!priorities.length) priorities.push(...uniqueMeaningful(activities, 5));
  if (!priorities.length) priorities.push("We still need to confirm the few priorities that should drive the decision.");

  return {
    heading: "Here's what we're looking for",
    sections: [
      { id: "business", heading: "Your business", paragraphs: businessParts },
      { id: "environment", heading: "The ideal environment", paragraphs: environmentParts },
      { id: "space", heading: "Likely space", paragraphs: uniqueMeaningful(spaceParts, 4) },
      { id: "where", heading: "Where we'd start", paragraphs: uniqueMeaningful(whereParts, 3) },
      { id: "flexibility", heading: "What we're flexible about", paragraphs: flexibility },
      { id: "priorities", heading: "What really matters", items: priorities }
    ]
  };
}
function lintCustomerText(text) {
  const findings = [];
  const source = String(text || "");
  for (const match of source.matchAll(new RegExp(INTERNAL.source, "gi"))) findings.push({ severity: "ERROR", term: match[0] });
  for (const value of ["Not provided", "Not stated", "Not a stated priority", "Unknown"]) if (source.includes(value)) findings.push({ severity: "WARNING", term: value });
  return findings;
}

module.exports = { DISTRICT_FACTS, customerSentence, omitEmpty, uniqueMeaningful, similarity, projectLocationBrief, projectSharedSearchBrief, lintCustomerText, INTERNAL };
