function criterionText(requirement, dimensions) {
  return (requirement.criteria || []).filter((item) => dimensions.includes(item.dimension)).map((item) => {
    const value = item.value || {}; return (value.list || []).join(" · ") || value.text || "";
  }).filter(Boolean).join(" · ");
}
function titleCase(value) { return String(value || "").replace(/[-_]+/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase()); }
function businessLabel(requirement) {
  const value = (requirement.criteria || []).find((item) => item.dimension === "universal.business.type")?.value || {};
  return value.list?.[1] || value.text || requirement.businessContext?.summary || "";
}
export function searchSummaryRows(bundle, options = {}) {
  const requirement = bundle.currentRevision.requirement; const entryContext = bundle.entryContext || {};
  const locations = (bundle.currentSnapshot?.shortlist || []).map((item) => item.districtName).join(" · ");
  const candidates = (requirement.locationLogic?.specificPreference?.candidateDistrictNames || []).join(" · ");
  return [
    ["Space", titleCase((requirement.propertyTypes || [entryContext.propertyType])[0])],
    ["Market", requirement.locationLogic?.marketAnchor?.displayName || titleCase(requirement.locationLogic?.marketAnchor?.marketId || entryContext.marketId)],
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
