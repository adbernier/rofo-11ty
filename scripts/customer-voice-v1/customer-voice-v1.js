"use strict";

const JARGON = Object.freeze([
  ["applicability", "ERROR"], ["bounded", "ERROR"], ["candidate", "REVIEW"], ["calibration", "ERROR"],
  ["composition", "ERROR"], ["evidence foundation", "ERROR"], ["evidence model", "ERROR"],
  ["reviewed evidence", "ERROR"], ["evidence supports", "ERROR"], ["requirement-specific", "ERROR"],
  ["projection", "ERROR"], ["resolver", "ERROR"], ["operating environment", "WARNING"],
  ["investigation status", "ERROR"], ["representative environment", "WARNING"], ["readiness", "ERROR"],
  ["canonical", "ERROR"], ["abstention", "ERROR"], ["eligibility", "ERROR"], ["cohort", "ERROR"],
  ["deterministic", "ERROR"], ["provenance", "ERROR"], ["not a stated priority", "WARNING"],
  ["not provided", "WARNING"], ["not stated", "WARNING"], ["unknown", "REVIEW"]
]);
const EMPTY_VALUES = /^(not provided|not stated|not a stated priority|unknown|n\/a)$/i;
const normalize = value => String(value || "").toLowerCase().replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
const words = value => new Set(normalize(value).split(" ").filter(word => word.length > 3));
function similarity(a, b) { const x = words(a), y = words(b); const union = new Set([...x, ...y]); return union.size ? [...x].filter(v => y.has(v)).length / union.size : 0; }
function lintText(text, context = {}) {
  const findings = [];
  const lower = String(text || "").toLowerCase();
  for (const [term, severity] of JARGON) if (lower.includes(term)) findings.push({ rule: "INTERNAL_JARGON", severity, term, ...context });
  for (const sentence of String(text || "").split(/(?<=[.!?])\s+/)) if (sentence.split(/\s+/).length > 32) findings.push({ rule: "SENTENCE_COMPLEXITY", severity: "WARNING", excerpt: sentence.slice(0, 180), ...context });
  return findings;
}
const omitEmpty = value => value == null || value === "" || EMPTY_VALUES.test(String(value).trim());
function uniqueMeaningful(items) {
  const kept = [];
  for (const item of (items || []).filter(value => !omitEmpty(value))) if (!kept.some(value => similarity(value, item) >= 0.72)) kept.push(item);
  return kept;
}

const districtCopy = Object.freeze({
  "northgate-north-market-industrial": {
    name: "Northgate / North Market",
    distinction: "Lighter warehouse and service space in north Sacramento",
    why: ["A practical starting point for contractor, service-industrial and office/warehouse searches.", "Multi-tenant space in the area can combine workspace, storage and field operations."],
    worth: [],
    examples: ["1329 N Market Boulevard", "Northgate / North Market industrial area"]
  },
  "power-inn-industrial": {
    name: "Power Inn",
    distinction: "Sacramento's deeper industrial and production district",
    why: ["A stronger place to start for conventional warehouse, distribution and production searches.", "The broader district includes a wider range of industrial formats than Northgate / North Market."],
    worth: [],
    examples: ["8583 Elder Creek Road", "5711 Florin Perkins Road"]
  }
});
function searchSummary(requirement) {
  const summary = requirement.businessContext?.summary || "Commercial space";
  return { heading: "Your search", summary: `${summary} in Sacramento`, detail: "Industrial / Warehouse / Flex" };
}
function projectSnapshot(requirement, snapshot, mode) {
  const search = searchSummary(requirement);
  if (snapshot.readiness === "INVESTIGATE" || !(snapshot.shortlist || []).length) return {
    mode: "INVESTIGATE", search, heading: "A little more detail will help narrow the location", intro: "We need to understand a few building and operating requirements before pointing you to a district.", locations: [], comparison: [], confirm: uniqueMeaningful(["The work happening in the space", "Required building size and layout", "Loading, power, parking or yard needs", "Where employees, customers and suppliers need to reach you"]), next: { heading: "Tell us what the space needs to support", action: "Continue my search →" }
  };
  const locations = snapshot.shortlist.map(item => districtCopy[item.districtId]).filter(Boolean);
  const comparison = locations.length > 1 ? [
    { label: "Best starting point for", values: ["Contractor, service-industrial and office/warehouse", "Warehouse, distribution and production"] },
    { label: "Typical character", values: ["Lighter, multi-tenant operating space", "Broader conventional industrial building mix"] },
    { label: "What to confirm", values: ["Suite configuration and vehicle needs", "Building systems and operational requirements"] }
  ] : [];
  return { mode, search, heading: locations.length === 1 ? "One area to start with" : "Two areas worth comparing", intro: locations.length === 1 ? `${locations[0].name} is the clearest starting point for the search you described.` : "Both are worth considering: Northgate / North Market covers the lighter warehouse and service-industrial side of the search, while Power Inn offers the deeper conventional warehouse, distribution and production setting.", locations, comparison, confirm: ["Loading, clear height, power and yard needs", "Suite configuration, permitted use and current availability"], next: { heading: "Ready to look at specific spaces?", action: "Find spaces that fit →" } };
}

module.exports = { JARGON, lintText, omitEmpty, uniqueMeaningful, similarity, districtCopy, projectSnapshot };
