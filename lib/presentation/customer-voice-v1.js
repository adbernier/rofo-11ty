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
function lintCustomerText(text) {
  const findings = [];
  const source = String(text || "");
  for (const match of source.matchAll(new RegExp(INTERNAL.source, "gi"))) findings.push({ severity: "ERROR", term: match[0] });
  for (const value of ["Not provided", "Not stated", "Not a stated priority", "Unknown"]) if (source.includes(value)) findings.push({ severity: "WARNING", term: value });
  return findings;
}

module.exports = { DISTRICT_FACTS, customerSentence, omitEmpty, uniqueMeaningful, similarity, projectLocationBrief, lintCustomerText, INTERNAL };
