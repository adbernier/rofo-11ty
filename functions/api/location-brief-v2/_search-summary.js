function criterionText(requirement, dimensions) {
  return (requirement.criteria || []).filter((item) => dimensions.includes(item.dimension)).map((item) => {
    const value = item.value || {}; return (value.list || []).join(" · ") || value.text || "";
  }).filter(Boolean).join(" · ");
}
function titleCase(value) { return String(value || "").replace(/[-_]+/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase()); }
function displayValue(value) {
  const raw = String(value || "").trim();
  const labels = {
    "6_12_months": "6–12 months",
    "3_6_months": "3–6 months",
    within_3_months: "Within 3 months",
    as_soon_as_possible: "As soon as possible",
    asap: "As soon as possible",
    just_exploring: "Just exploring",
  };
  return labels[raw] || raw.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}
function propertyLabel(value) {
  return { retail_service: "Retail", industrial_flex: "Industrial / Warehouse / Flex", office: "Office" }[value] || titleCase(value);
}
function marketLabel(requirement, entryContext) {
  const anchor = requirement.locationLogic?.marketAnchor || {};
  const market = anchor.displayName || anchor.marketName || anchor.city || titleCase(anchor.marketId || entryContext.marketId);
  if (!market || !anchor.state || new RegExp(`,\\s*${anchor.state}$`, "i").test(market)) return market;
  return `${market}, ${anchor.state}`;
}
function searchApproach(requirement) {
  const preference = requirement.locationLogic?.specificPreference || {};
  if (preference.hasPreference === false) return "Compare with nearby markets";
  if (preference.hasPreference === true) return "Focus my search here";
  return "";
}
function businessLabel(requirement) {
  const value = (requirement.criteria || []).find((item) => item.dimension === "universal.business.type")?.value || {};
  return value.list?.[1] || value.text || requirement.businessContext?.summary || "";
}
export function searchSummaryRows(bundle, options = {}) {
  const requirement = bundle.currentRevision.requirement; const entryContext = bundle.entryContext || {};
  const locations = (bundle.currentSnapshot?.shortlist || []).map((item) => item.districtName).join(" · ");
  const candidates = (requirement.locationLogic?.specificPreference?.candidateDistrictNames || []).join(" · ");
  return [
    ["Starting market", marketLabel(requirement, entryContext)],
    ["Space type", propertyLabel((requirement.propertyTypes || [entryContext.propertyType])[0])],
    ["Size", displayValue(requirement.sizeCapacity?.summary || criterionText(requirement, ["universal.capacity.size"]))],
    ["Timing", displayValue(requirement.timing?.summary || criterionText(requirement, ["universal.timing.target"]))],
    ["Search approach", searchApproach(requirement)],
    ["Areas already being considered", candidates],
    ["Business", businessLabel(requirement)],
    ["Environment", criterionText(requirement, ["office.environment.image"])],
    ["Employees", criterionText(requirement, ["universal.location.employee_origins", "office.location.employee_geography"])],
    ["Customers / clients", criterionText(requirement, ["office.access.client_visits", "universal.location.customer_origins"])],
    ["Transit / parking", criterionText(requirement, ["universal.access.transit_importance", "universal.access.parking_importance", "office.access.transit", "office.access.parking"])],
    ...(options.includeLocations === false ? [] : [["Locations worth investigating", locations]]),
  ].filter(([, value]) => value);
}
export function renderSearchSummary(bundle, esc, options = {}) {
  const rows = searchSummaryRows(bundle, options);
  return `<aside class="requirement-search-summary" aria-label="Your search"><h2>Your search</h2><div data-search-summary>${rows.map(([label, value]) => `<div class="requirement-search-summary__item"><span>${esc(label)}</span><strong>${esc(value)}</strong></div>`).join("")}</div></aside>`;
}
