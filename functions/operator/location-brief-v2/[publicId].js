import { getBriefBundle, operatorAllowed, ownsBrief, privateHtml } from "../../api/location-brief-v2/_shared.js";
import { renderSearchSummary } from "../../api/location-brief-v2/_search-summary.js";
import universalIntelligence from "../../../lib/intelligence/universal-space-type-intelligence.js";

const { projectUniversalIntelligence } = universalIntelligence;

function esc(value) { return String(value == null ? "" : value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char])); }
function criterion(requirement, dimension) { return (requirement.criteria || []).find((item) => item.dimension === dimension); }
function criterionText(requirement, dimension) { const value = criterion(requirement, dimension)?.value || {}; return (value.list || []).join(" + ") || value.text || ""; }
function titleCase(value) { return String(value || "").replace(/[-_]+/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase()); }
function marketLabel(requirement, entryContext) { return requirement.locationLogic?.marketAnchor?.displayName || requirement.locationLogic?.marketAnchor?.marketName || titleCase(requirement.locationLogic?.marketAnchor?.marketId || entryContext.marketId); }
function propertyLabel(requirement, entryContext) { const value = (requirement.propertyTypes || [entryContext.propertyType])[0]; return value === "retail_service" ? "Retail / service" : value === "industrial_flex" ? "Industrial / Warehouse / Flex" : titleCase(value); }
function humanBand(value) {
  return { STRONG: "Strong", GOOD: "Good", MODERATE: "Mixed", MIXED: "Mixed", PARTIAL: "Mixed", WEAK: "Limited", UNKNOWN: "Not established" }[value] || "Not established";
}
function cleanStrength(value) {
  return String(value || "")
    .replace(/Strong supported access for employees coming from (.+)\./, "Strong employee access from $1.")
    .replace(/Good supported access for employees coming from (.+)\./, "Good employee access from $1.")
    .replace(/Moderate supported access for employees coming from (.+)\./, "Mixed employee access from $1.")
    .replace(/(.+) is supported by this district's reviewed business-environment pattern\./, "Its business environment aligns with $1.")
    .replace(/It has strong reviewed Office fit\./, "Strong fit for ordinary office use.")
    .replace(/It has good reviewed Office fit for selective users\./, "Good office fit for selective users.")
    .replace(/Its reviewed district parking environment supports/, "Its parking environment supports");
}
function conciseReason(item) {
  const environment = (item.environment?.reasons || []).find((reason) => !/^Business type:/i.test(reason));
  const employee = (item.strengths || []).find((strength) => /^Strong supported access for employees/i.test(strength)) || (item.strengths || []).find((strength) => /employees coming from/i.test(strength));
  if (item.eligibilitySource === "SHADOW_ACCESS_ACTIVATION" && employee) return cleanStrength(employee);
  if (item.propertyTypeFit?.summary || item.retail?.summary || item.office?.summary) return item.propertyTypeFit?.summary || item.retail?.summary || item.office.summary;
  if (item.environment?.businessIdentityBasis === "USER_STATED_COMPANY_CONTEXT" && environment) return cleanStrength(environment);
  if (employee) return cleanStrength(employee);
  return item.role || item.propertyTypeFit?.summary || item.retail?.summary || item.office?.summary || cleanStrength((item.strengths || [])[0]) || "A useful location to compare against your priorities.";
}
function districtPath(item, requirement) {
  if (item.presentation?.districtPath) return item.presentation.districtPath;
  const market = requirement.locationLogic?.marketAnchor || {};
  if ((market.marketId || market.geographyId) !== "san-francisco") return "";
  return `/commercial-real-estate/CA/san-francisco/${encodeURIComponent(item.districtId)}/`;
}
function mediaMarkup(presentation, name) {
  if (!presentation?.image?.src) return "";
  return `<figure class="lb2-district-media"><img src="${esc(presentation.image.src)}" alt="${esc(presentation.image.alt || name)}" loading="lazy"></figure>`;
}
function buildingsMarkup(presentation) {
  const buildings = presentation?.representativeBuildings || [];
  if (!buildings.length) return "";
  return `<section class="lb2-buildings"><h4>Representative buildings</h4><p>These are representative examples, not current availability. They help explain the kinds of commercial environments to evaluate next.</p><div class="lb2-building-grid">${buildings.map((building) => `<a href="${esc(building.canonicalUrl)}"><strong>${esc(building.name)}</strong><span>${esc(building.representativeReason)}</span></a>`).join("")}</div></section>`;
}
function districtCard(item, requirement, options = {}) {
  const path = districtPath(item, requirement);
  const strengths = (item.strengths || item.reasons || []).map(cleanStrength).filter(Boolean).slice(0, 3);
  const tradeoffs = [...new Set([...(item.tradeoffs || []), ...(options.candidate ? item.unknowns || [] : [])])].filter(Boolean).slice(0, options.candidate ? 3 : 2);
  const rich = Boolean(options.rich);
  const hasMedia = Boolean(rich && item.presentation?.image?.src);
  return `<article class="lb2-rec${rich ? " lb2-rec--rich" : ""}${hasMedia ? " lb2-rec--has-media" : ""}">
    ${rich ? mediaMarkup(item.presentation, item.districtName) : ""}<div class="lb2-rec__body"><p class="lb2-rec__role">${esc(options.role || "Worth investigating")}</p>
    <h3>${esc(item.districtName)}</h3><p class="lb2-rec__reason">${esc(conciseReason(item))}</p>
    ${strengths.length ? `<div class="lb2-rec__detail"><h4>${options.candidate ? "Why it may fit your search" : "Why consider this location"}</h4><ul>${strengths.map((value) => `<li>${esc(value)}</li>`).join("")}</ul></div>` : ""}
    ${tradeoffs.length ? `<div class="lb2-rec__detail lb2-rec__detail--tradeoff"><h4>Things to weigh</h4><ul>${tradeoffs.map((value) => `<li>${esc(value)}</li>`).join("")}</ul></div>` : ""}
    ${path ? `<a class="lb2-text-link" href="${esc(path)}" data-brief-explore>Explore ${esc(item.districtName)} <span aria-hidden="true">→</span></a>` : ""}
    ${rich ? buildingsMarkup(item.presentation) : ""}</div></article>`;
}
function recommendationFocus(snapshot, requirement, omittedIds = []) {
  const omitted = new Set(omittedIds); const items = (snapshot.shortlist || []).filter((item) => !omitted.has(item.districtId));
  if (!items.length) return "";
  return `<div class="lb2-location-focus" data-location-focus-root><div class="lb2-focus-tabs" aria-label="Locations worth investigating">${items.map((item, index) => `<button type="button" class="${index ? "" : "is-active"}" data-focus-button="${esc(item.districtId)}">${esc(item.districtName)}</button>`).join("")}</div>${items.map((item, index) => `<div data-focus-panel="${esc(item.districtId)}"${index ? " hidden" : ""}>${districtCard(item, requirement, { rich: true, role: "Worth investigating" })}</div>`).join("")}</div>`;
}
function comparisonRows(snapshot) {
  const items = snapshot.shortlist || [];
  const retail = items.some((item) => item.retail || item.propertyTypeFit?.summary && !item.office);
  const industrialFlex = items.some((item) => item.industrialFlex);
  const fitLabel = industrialFlex ? `${titleCase(items[0]?.model || "Industrial / Flex")} character` : retail ? "Retail environment" : "Office character";
  const accessLabel = industrialFlex ? "Employee / operational access" : retail ? "Customer access" : "Employee access";
  const definitions = [
    ["Why consider it", (item) => conciseReason(item)],
    [fitLabel, (item) => item.propertyTypeFit?.summary || item.industrialFlex?.summary || item.retail?.summary || item.office?.summary || humanBand(item.propertyTypeFit?.band || item.industrialFlex?.band || item.retail?.band || item.office?.band)],
    ["Parking", (item) => item.parkingRelevant ? humanBand(item.parkingEnvironment) : "Not a stated priority"],
    ["Key tradeoff", (item) => cleanStrength((item.tradeoffs || item.unknowns || [])[0]) || "No material tradeoff established"],
    [accessLabel, (item) => item.employeeAccessSummary?.label || humanBand(item.accessComponent?.band)],
  ];
  return definitions.map(([label, getter]) => ({ label, values: items.map(getter) })).filter((row) => row.values.some(Boolean) && (!["Employee access", "Customer access", "Employee / operational access"].includes(row.label) || new Set(row.values).size > 1));
}
function comparison(snapshot) {
  const items = snapshot.shortlist || []; const rows = comparisonRows(snapshot);
  if (items.length < 2 || !rows.length) return "";
  return `<section class="lb2-comparison"><div class="lb2-section-head"><p class="lb2-eyebrow">Compare</p><h2>How they differ</h2></div><div class="lb2-compare" style="--lb2-cols:${items.length}" role="table" aria-label="Location comparison"><div class="lb2-compare__row lb2-compare__head" role="row"><span role="columnheader">Priority</span>${items.map((item) => `<strong role="columnheader">${esc(item.districtName)}</strong>`).join("")}</div>${rows.map((row) => `<div class="lb2-compare__row" role="row"><strong role="rowheader">${esc(row.label)}</strong>${row.values.map((value, index) => `<span role="cell" data-label="${esc(items[index].districtName)}: ">${esc(value)}</span>`).join("")}</div>`).join("")}</div></section>`;
}
function candidateName(candidate, snapshot) {
  const match = (snapshot.shortlist || []).find((item) => item.districtId === candidate.canonicalDistrictId || item.districtId === candidate.sourceIdentity);
  if (match) return match.districtName;
  if (candidate.canonicalDistrictId === "showplace-square") return "Showplace Square / Design District";
  return titleCase(candidate.canonicalDistrictId);
}
function assessmentItem(assessment) { return { ...assessment.componentResult, unknowns: assessment.unknowns, presentation: assessment.presentation }; }
function candidateSection(candidates, snapshot, requirement) {
  if (!(candidates || []).length) return "";
  const assessments = snapshot.candidateAssessments || [];
  const alternative = snapshot.readiness === "INVESTIGATE" ? (snapshot.comparisonAlternatives || [])[0] : null;
  return `<section class="lb2-considering" data-comparison-focus-root><div class="lb2-section-head"><p class="lb2-eyebrow">Your list</p><h2>${snapshot.readiness === "INVESTIGATE" ? "Area you're considering" : "Areas you're considering"}</h2></div>${alternative ? `<div class="lb2-focus-tabs" aria-label="District focus"><button type="button" class="is-active" data-focus-button="candidate">${esc(assessments[0]?.districtName || "Your area")}</button><button type="button" data-focus-button="alternative">${esc(alternative.districtName)}</button></div>` : ""}${candidates.map((candidate, index) => {
    const assessment = assessments.find((item) => item.districtId === candidate.canonicalDistrictId || item.sourceDistrictIds?.includes(candidate.sourceIdentity));
    if (["WELL_SUPPORTED", "PARTIALLY_SUPPORTED", "ASSESSABLE"].includes(assessment?.assessmentStatus)) return `<div data-focus-panel="candidate"${index ? "" : " data-focus-anchor"}>${districtCard(assessmentItem(assessment), requirement, { rich: true, candidate: true, role: "Already on your list" })}</div>${index === 0 && alternative ? `<div data-focus-panel="alternative" hidden>${districtCard(assessmentItem(alternative), requirement, { rich: true, candidate: true, role: "Worth comparing" })}</div>` : ""}`;
    if (assessment) return `<div class="lb2-candidate-limited"><strong>${esc(assessment.districtName)}</strong><span>Already on your list</span><p>Rofo does not yet have enough reviewed intelligence to assess this area fairly for your search.</p></div>`;
    return `<div class="lb2-candidate-limited"><strong>${esc(candidateName(candidate, snapshot))}</strong><span>Already on your list</span></div>`;
  }).join("")}</section>`;
}
function compareValue(value, difference) {
  if (difference.sharedUnknown) return "Not established for your mixed Bay Area workforce";
  if (["STRONG", "GOOD", "MODERATE", "MIXED", "PARTIAL", "WEAK", "UNKNOWN"].includes(value)) return humanBand(value);
  return value;
}
function comparisonAlternatives(snapshot, requirement) {
  const items = snapshot.comparisonAlternatives || [];
  if (!items.length) return "";
  const candidate = (snapshot.candidateAssessments || [])[0]; const item = items[0];
  const supported = (item.differences || []).filter((difference) => !difference.sharedUnknown).slice(0, 2);
  return `<section class="lb2-alternatives"><div class="lb2-section-head"><p class="lb2-eyebrow">Compare</p><h2>Another area worth considering</h2></div><article class="lb2-compare-card"><p class="lb2-rec__role">Worth comparing</p><h3>${esc(item.districtName)}</h3><p>${esc(item.comparisonReason)}</p>${supported.length ? `<ul>${supported.map((difference) => `<li><strong>${esc(difference.label)}:</strong> ${esc(compareValue(difference.alternativeValue, difference))}</li>`).join("")}</ul>` : ""}${item.unknowns?.length ? `<p class="lb2-subtle">${esc(item.unknowns[0])}</p>` : ""}<button class="lb2-button lb2-button--quiet" type="button" data-focus-alternative>Compare with ${esc(candidate?.districtName || "your area")}</button></article>
  <div class="lb2-pair-differences"><div class="lb2-section-head"><h2>How they differ</h2></div><div class="lb2-compare" style="--lb2-cols:2" role="table" aria-label="Candidate district comparison"><div class="lb2-compare__row lb2-compare__head" role="row"><span role="columnheader">Priority</span><strong role="columnheader">${esc(candidate?.districtName)}</strong><strong role="columnheader">${esc(item.districtName)}</strong></div>${(item.differences || []).map((difference) => `<div class="lb2-compare__row" role="row"><strong role="rowheader">${esc(difference.label)}</strong><span role="cell" data-label="${esc(candidate?.districtName)}: ">${esc(compareValue(difference.candidateValue, difference))}</span><span role="cell" data-label="${esc(item.districtName)}: ">${esc(compareValue(difference.alternativeValue, difference))}</span></div>`).join("")}</div></div></section>`;
}
function investigationPriorities(requirement) {
  const property = (requirement.propertyTypes || [])[0];
  const employees = criterionText(requirement, "universal.location.employee_origins");
  const parking = criterionText(requirement, "universal.access.parking_importance");
  const transit = criterionText(requirement, "universal.access.transit_importance");
  if (property === "medical") return ["Medical-compatible use, existing buildout, accessibility, patient arrival, and actual property availability need property-level investigation."];
  const mixedOrigins = /Across the Bay Area|mixed/i.test(employees);
  const helpfulModes = /helpful/i.test(parking) && /helpful/i.test(transit);
  if (mixedOrigins && helpfulModes) return ["Your team is distributed across the Bay Area, so no single commute direction clearly determines the location. Because parking and transit are helpful rather than hard requirements, business environment and office character can carry more weight in the comparison."];
  if (mixedOrigins) return ["Your team is distributed across the Bay Area, so no single commute direction clearly determines the location. Employee access remains an important question to validate across the areas you compare."];
  return [];
}
function universalGuidance(requirement) {
  const projection = projectUniversalIntelligence(requirement);
  if (!projection.foundations.length || !projection.whatMatters.length) return { projection, matters: "" };
  const matters = `<section class="lb2-universal" aria-labelledby="lb2-matters-heading"><div class="lb2-section-head"><p class="lb2-eyebrow">Your requirement</p><h2 id="lb2-matters-heading">What matters for this search</h2></div><div class="lb2-matter-grid">${projection.whatMatters.map((item) => `<article><h3>${esc(item.label)}</h3><p>${esc(item.whyItMatters)}</p></article>`).join("")}</div></section>`;
  return { projection, matters };
}
function investigationGuidance(projection, certified, market) {
  if (!projection.foundations.length || !projection.investigationTopics.length) return "";
  const boundary = certified
    ? "These locations fit the requirement based on reviewed location intelligence. Individual buildings, current availability, economics, and use compatibility still need property-level investigation."
    : `Rofo has not yet calibrated ${market || "this market"} for automatic location comparison. We'll use your selected market as the starting point and evaluate relevant alternatives against the requirements that matter for your business.`;
  return `<section class="lb2-investigation" aria-labelledby="lb2-investigation-heading"><div class="lb2-section-head"><p class="lb2-eyebrow">Next questions</p><h2 id="lb2-investigation-heading">What we'll investigate next</h2></div><p class="lb2-guidance__intro">${esc(boundary)}</p><ul class="lb2-investigate-list">${projection.investigationTopics.slice(0, 6).map((item) => `<li>${esc(item)}</li>`).join("")}</ul></section>`;
}
function nextStep(readiness) {
  if (readiness === "BOUNDED") return { heading: "See available spaces in these locations", action: "Continue →", copy: "Tell Rofo a little more about what you need, then continue to available options while keeping the broader market open." };
  if (readiness === "INVESTIGATE") return { heading: "See available spaces that fit your search", action: "Continue →", copy: "Tell Rofo a little more about what you need so the property search can focus on compatible options." };
  return { heading: "See available spaces in these locations", action: "Continue →", copy: "Tell Rofo a little more about what you need, then continue to available options." };
}
function debugPanel(bundle) {
  const { brief, currentRevision, currentSnapshot, candidates } = bundle;
  return `<details class="lb2-debug" open><summary>Operator diagnostics</summary>
    <dl><dt>Brief</dt><dd>${esc(brief.publicId)}</dd><dt>Lifecycle</dt><dd>${esc(brief.lifecycleStage)}</dd><dt>Requirement revision</dt><dd>${esc(currentRevision.revisionNumber)}</dd><dt>Snapshot</dt><dd>${esc(currentSnapshot.id)}</dd><dt>Readiness</dt><dd>${esc(currentSnapshot.readiness)}</dd><dt>Engine</dt><dd>${esc(currentSnapshot.engineVersion)}</dd></dl>
    <h3>Foundation versions</h3><pre>${esc(JSON.stringify(currentSnapshot.foundationVersions, null, 2))}</pre>
    <h3>Requirement revisions</h3><ol>${bundle.revisions.map((item) => `<li>Revision ${item.revisionNumber} · ${esc(item.createdAt)}${item.id === brief.currentRequirementRevisionId ? " · current" : " · superseded"}</li>`).join("")}</ol>
    <h3>Recommendation snapshots</h3><ol>${bundle.snapshots.map((item) => `<li>${esc(item.id)} · ${esc(item.readiness)} · ${esc(item.createdAt)}${item.id === brief.currentRecommendationSnapshotId ? " · current" : " · superseded"}</li>`).join("")}</ol>
    <h3>Plausible universe and component fits</h3><pre>${esc(JSON.stringify(currentSnapshot.plausibleUniverse, null, 2))}</pre>
    <h3>Candidate provenance</h3><pre>${esc(JSON.stringify(candidates, null, 2))}</pre>
    <h3>Candidate comparison</h3><pre>${esc(JSON.stringify(currentSnapshot.comparisonAlternatives || [], null, 2))}</pre>
    <h3>Canonical current Requirement</h3><pre>${esc(JSON.stringify(currentRevision.requirement, null, 2))}</pre>
    <h3>Intelligence gaps</h3><pre>${esc(JSON.stringify(currentSnapshot.intelligenceGaps, null, 2))}</pre>
  </details>`;
}
export function renderLocationBriefV2Page(bundle, owner, debug, options = {}) {
  const { brief, entryContext, currentRevision, currentSnapshot, candidates } = bundle;
  const requirement = currentRevision.requirement;
  const property = propertyLabel(requirement, entryContext); const market = marketLabel(requirement, entryContext);
  const marketId = requirement.locationLogic?.marketAnchor?.marketId || requirement.locationLogic?.marketAnchor?.geographyId || entryContext.marketId || "";
  const isRetail = requirement.propertyTypes?.length === 1 && requirement.propertyTypes[0] === "retail_service";
  const propertyContinuationSupported = requirement.propertyTypes?.length === 1 && requirement.propertyTypes[0] === "office" && (requirement.locationLogic?.marketAnchor?.marketId || requirement.locationLogic?.marketAnchor?.geographyId) === "san-francisco";
  const readiness = currentSnapshot.readiness;
  const reviewedLocalIntelligence = marketId === "san-francisco" && ["office", "retail_service", "industrial_flex"].includes(requirement.propertyTypes?.[0]);
  const certified = reviewedLocalIntelligence && ["FULL", "BOUNDED"].includes(readiness) && (currentSnapshot.shortlist || []).length > 0;
  const universal = universalGuidance(requirement);
  const priorities = readiness === "INVESTIGATE" ? investigationPriorities(requirement) : [];
  const hasCandidates = marketId === "san-francisco" && (candidates || []).length > 0;
  const guidanceHeading = readiness === "INVESTIGATE" ? "What matters most" : hasCandidates ? "Also worth investigating" : "Locations worth investigating";
  const comparedCandidate = currentSnapshot.candidateAssessments?.[0]; const comparedAlternative = currentSnapshot.comparisonAlternatives?.[0];
  const guidanceCopy = readiness === "FULL" ? `Based on your business and priorities, these are the San Francisco areas we'd investigate first. Each offers a different combination of access, business environment, ${isRetail ? "customer context and storefront character" : "office character"}, and practical tradeoffs.` : readiness === "BOUNDED" ? "These are the areas Rofo can support most confidently for this search. Some parts of the market still require additional investigation." : comparedCandidate && comparedAlternative ? `${comparedCandidate.districtName} is worth considering based on the business environment and ${isRetail ? "Retail" : "Office"} fit you described. Comparing it with ${comparedAlternative.districtName} helps show a different set of district tradeoffs.` : "Use these priorities to evaluate the areas and properties you investigate next.";
  const next = nextStep(certified ? readiness : "INVESTIGATE");
  const publicExperience = options.publicExperience === true;
  const briefUrl = publicExperience ? `/location-brief/${brief.publicId}` : `/operator/location-brief-v2/${brief.publicId}`;
  const editUrl = publicExperience ? `/location-requirement/?journey=edit&brief=${encodeURIComponent(brief.publicId)}` : `/prototype/requirement-v1/?locationBriefV2=edit&brief=${encodeURIComponent(brief.publicId)}`;
  const newSearchUrl = publicExperience ? `/location-requirement/?journey=new&marketId=${encodeURIComponent(marketId)}&propertyType=${encodeURIComponent(requirement.propertyTypes?.[0] || "office")}` : `/prototype/requirement-v1/?locationBriefV2=new`;
  const candidateIds = (candidates || []).map((item) => item.canonicalDistrictId);
  const findSpacesUrl = `/property-requirement/${encodeURIComponent(brief.publicId)}`;
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Your Location Brief | Rofo</title><link rel="stylesheet" href="/assets/requirement-prototype.css"><style>
  :root{font-family:Inter,ui-sans-serif,system-ui,sans-serif;color:#0f172a;background:#f5f8fc;line-height:1.55}*{box-sizing:border-box}body{margin:0}.lb2{max-width:1160px;margin:auto;padding:34px 22px 80px}.lb2 a{color:#1746cc}.lb2-hero{display:flex;align-items:end;justify-content:space-between;gap:24px;padding:28px 4px 36px;border-bottom:1px solid #dbe6f1}.lb2-brand{font-weight:800;text-decoration:none;color:#0f172a!important}.lb2-eyebrow{margin:0 0 7px;color:#1746cc;text-transform:uppercase;letter-spacing:.1em;font-size:.72rem;font-weight:800}.lb2 h1{font-size:clamp(2.45rem,6vw,4.2rem);line-height:1.02;letter-spacing:-.045em;margin:12px 0}.lb2-hero__context{font-size:1.15rem;margin:0;color:#64748b}.lb2-button{display:inline-flex;justify-content:center;align-items:center;border-radius:8px;padding:11px 18px;background:#1746cc;color:#fff!important;text-decoration:none;font-weight:750;border:1px solid #1746cc;cursor:pointer}.lb2-button:hover,.lb2-button:focus-visible{background:#103aa8;border-color:#103aa8}.lb2-button:focus-visible{outline:3px solid #bfdbfe;outline-offset:3px}.lb2-button--quiet{background:#fff;color:#1746cc!important;border-color:#dbe6f1}.lb2-layout{display:grid;grid-template-columns:minmax(0,1.7fr) minmax(250px,.7fr);gap:clamp(1rem,3vw,2rem);align-items:start;padding-top:38px}.lb2-main{min-width:0}.lb2-summary-column{position:sticky;top:20px;display:grid;gap:12px}.lb2-summary-column>.lb2-button{justify-self:stretch}.lb2-section-head h2{font-size:clamp(1.55rem,3vw,2.2rem);line-height:1.15;margin:0 0 10px;letter-spacing:-.025em}.lb2-guidance,.lb2-universal,.lb2-investigation{background:#fff;border:1px solid #dbe6f1;border-radius:12px;padding:34px;box-shadow:0 12px 26px rgba(15,23,42,.05)}.lb2-universal,.lb2-investigation{margin-bottom:30px}.lb2-matter-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.lb2-matter-grid article{padding:16px;background:#f7faff;border-radius:9px}.lb2-matter-grid h3{font-size:1rem;margin:0 0 5px}.lb2-matter-grid p{font-size:.9rem;color:#596579;margin:0}.lb2-guidance__intro{max-width:780px;margin:0 0 24px;color:#64748b;font-size:1.04rem}.lb2-rec{display:flex;flex-direction:column;border:1px solid #dbe6f1;border-radius:12px;background:#fbfdff;overflow:hidden}.lb2-rec__body{display:flex;flex:1;flex-direction:column;padding:22px}.lb2-rec--rich{background:#fbfdff;border-color:#9db7ec}.lb2-rec--has-media{display:grid;grid-template-columns:minmax(240px,.85fr) minmax(0,1.35fr)}[data-focus-panel][hidden]{display:none!important}.lb2-district-media{margin:0;min-height:290px}.lb2-district-media img{width:100%;height:100%;object-fit:cover;display:block}.lb2-rec__role{font-size:.73rem;text-transform:uppercase;letter-spacing:.075em;color:#1746cc;font-weight:800;margin:0}.lb2-rec h3,.lb2-compare-card h3{font-size:1.45rem;line-height:1.2;margin:9px 0}.lb2-rec--rich h3{font-size:clamp(1.7rem,4vw,2.5rem)}.lb2-rec__reason{font-weight:680;margin:0 0 18px}.lb2-rec__detail{border-top:1px solid #e2e8f0;padding-top:13px;margin-top:8px}.lb2-rec__detail h4,.lb2-buildings h4{font-size:.78rem;text-transform:uppercase;letter-spacing:.06em;margin:0 0 7px;color:#64748b}.lb2-rec__detail ul{margin:0;padding-left:18px;font-size:.92rem}.lb2-rec__detail--tradeoff{color:#596579}.lb2-text-link{margin-top:18px;font-weight:780;text-decoration:none}.lb2-buildings{border-top:1px solid #dbe6f1;margin-top:20px;padding-top:16px}.lb2-buildings>p{font-size:.85rem;color:#64748b}.lb2-building-grid{display:grid;gap:8px}.lb2-building-grid a{display:grid;text-decoration:none;background:#fff;padding:11px 12px;border:1px solid #e8eef5;border-radius:8px}.lb2-building-grid span{font-size:.82rem;color:#64748b}.lb2-comparison,.lb2-considering,.lb2-alternatives,.lb2-next{padding:42px 0 8px}.lb2-focus-tabs{display:flex;gap:8px;margin:16px 0;overflow:auto}.lb2-focus-tabs button{border:1px solid #9db7ec;background:#fff;color:#1746cc;border-radius:8px;padding:10px 14px;font-weight:750;cursor:pointer;white-space:nowrap}.lb2-focus-tabs button:hover,.lb2-focus-tabs button:focus-visible{border-color:#1746cc}.lb2-focus-tabs button.is-active{background:#1746cc;color:#fff}.lb2-compare-card{max-width:720px;background:#fff;border:1px solid #dbe6f1;border-radius:12px;padding:22px}.lb2-compare-card ul{padding-left:20px}.lb2-pair-differences{margin-top:34px}.lb2-compare{margin-top:20px;border:1px solid #dbe6f1;border-radius:12px;overflow:hidden;background:#fff}.lb2-compare__row{display:grid;grid-template-columns:minmax(140px,.72fr) repeat(var(--lb2-cols),minmax(150px,1fr));gap:0}.lb2-compare__row>*{padding:14px 16px;border-bottom:1px solid #e8eef5}.lb2-compare__row>*+*{border-left:1px solid #e8eef5}.lb2-compare__row:last-child>*{border-bottom:0}.lb2-compare__head{background:#eef4ff}.lb2-candidate-limited{padding:18px;background:#fff;border:1px solid #dbe6f1;border-radius:12px}.lb2-candidate-limited span,.lb2-subtle{color:#64748b}.lb2-next__panel{display:flex;justify-content:space-between;gap:30px;align-items:center;background:#123f8c;color:#fff;border-radius:12px;padding:28px 30px}.lb2-next__panel h2{margin:0 0 6px}.lb2-next__panel p{margin:0;max-width:670px;color:#dbeafe}.lb2-next__panel .lb2-button{white-space:nowrap;background:#fff;color:#123f8c!important;border-color:#fff}.lb2-next__panel .lb2-button:hover,.lb2-next__panel .lb2-button:focus-visible{background:#eef4ff;border-color:#eef4ff}.lb2-next__panel button{white-space:nowrap;border-color:#fff;opacity:.68}.lb2-investigate-list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px;margin:20px 0 0;padding:0;list-style:none}.lb2-investigate-list li{padding:14px 16px;background:#eef4ff;border-radius:8px}.lb2-debug{margin-top:45px;background:#111827;color:#e5e7eb;border-radius:12px;padding:20px}.lb2-debug summary{cursor:pointer;font-weight:800}.lb2-debug dl{display:grid;grid-template-columns:max-content 1fr;gap:5px 16px}.lb2-debug dd{margin:0}.lb2-debug pre{overflow:auto;background:#1f2937;padding:12px;font-size:11px}.lb2-debug h3{margin-top:24px}@media(max-width:900px){.lb2-layout{grid-template-columns:1fr}.lb2-summary-column{position:static;order:-1}.lb2-rec--has-media{grid-template-columns:1fr}.lb2-district-media{min-height:240px}.lb2-compare{border:0;background:transparent}.lb2-compare__head{display:none}.lb2-compare__row{grid-template-columns:1fr;background:#fff;border:1px solid #dbe6f1;border-radius:12px;margin-bottom:10px}.lb2-compare__row>*{border:0!important;padding:9px 14px}.lb2-compare__row span:before{content:attr(data-label);font-weight:700}}@media(max-width:600px){.lb2{padding:20px 14px 60px}.lb2-hero{display:block;padding-top:12px}.lb2-hero .lb2-button{margin-top:20px}.lb2-guidance,.lb2-universal,.lb2-investigation{padding:22px 16px}.lb2-matter-grid,.lb2-investigate-list{grid-template-columns:1fr}.lb2-next__panel{display:block}.lb2-next__panel .lb2-button,.lb2-next__panel button{margin-top:18px;width:100%}}
  </style></head><body><main class="lb2">
  <header class="lb2-hero"><div><a class="lb2-brand" href="/">Rofo</a><p class="lb2-eyebrow">Location search</p><h1>Your Location Brief</h1><p class="lb2-hero__context">${esc(property)} · ${esc(market)}</p></div><a class="lb2-button lb2-button--quiet" href="${esc(newSearchUrl)}">Start a new search</a></header>
  <div class="lb2-layout"><div class="lb2-main">${universal.matters}${hasCandidates ? candidateSection(candidates, currentSnapshot, requirement) : ""}
  ${reviewedLocalIntelligence && readiness === "INVESTIGATE" ? comparisonAlternatives(currentSnapshot, requirement) : ""}
  ${certified || priorities.length ? `<section class="lb2-guidance"><div class="lb2-section-head"><p class="lb2-eyebrow">Location guidance</p><h2>${esc(guidanceHeading)}</h2></div><p class="lb2-guidance__intro">${esc(guidanceCopy)}</p>${certified ? recommendationFocus(currentSnapshot, requirement, candidateIds) : `<ul class="lb2-investigate-list">${priorities.map((item) => `<li>${esc(item)}</li>`).join("")}</ul>`}</section>` : ""}
  ${certified ? comparison(currentSnapshot) : ""}
  ${investigationGuidance(universal.projection, certified, market)}
  <section class="lb2-next"><div class="lb2-next__panel"><div><p class="lb2-eyebrow">Next step</p><h2>${esc(next.heading)}</h2><p>${esc(next.copy)}</p></div>${publicExperience && owner && propertyContinuationSupported ? `<a class="lb2-button" href="${esc(findSpacesUrl)}" data-vnext-find-spaces>${esc(next.action)}</a>` : `<button class="lb2-button" type="button" disabled title="${esc(propertyContinuationSupported ? "Continue from the browser that owns this Location Brief" : "This property-stage continuation is currently available for San Francisco Office searches")}">${esc(next.action)}</button>`}</div></section></div><div class="lb2-summary-column">${renderSearchSummary(bundle, esc, { includeLocations: certified })}${owner ? `<a class="lb2-button lb2-button--quiet" href="${esc(editUrl)}">Edit my search</a>` : ""}</div></div>
  ${debug ? debugPanel(bundle) : ""}
  </main><script>(function(){var endpoint='/api/analytics/search-profile';function track(name,extra){${publicExperience ? `try{fetch(endpoint,{method:'POST',headers:{'content-type':'application/json'},credentials:'same-origin',keepalive:true,body:JSON.stringify({event_name:name,profile_version:'location-brief:v2',context:Object.assign({page_type:'location_brief_v2',page_url:location.pathname,city:'San Francisco',space_type:${JSON.stringify(property)},readiness:${JSON.stringify(readiness)},brief_id:${JSON.stringify(brief.publicId)}},extra||{}),profile:{profile_version:'location-brief:v2',space_type:${JSON.stringify(property)}},attribution:{entry_page_type:${JSON.stringify(entryContext.sourceType || '')},landing_page:${JSON.stringify(entryContext.landingPage || '')}})})}catch(error){}` : ``}}track('vnext_brief_viewed');var key='rofoLocationBriefV2Return';document.querySelectorAll('[data-brief-explore]').forEach(function(link){link.addEventListener('click',function(){try{sessionStorage.setItem(key,JSON.stringify({url:${JSON.stringify(briefUrl)},label:'Back to my Location Brief'}));}catch(error){}track('vnext_district_explored',{district:link.textContent.replace(/Explore|→/g,'').trim()});});});document.querySelectorAll('a[href*="journey=edit"]').forEach(function(link){link.addEventListener('click',function(){track('vnext_requirement_edited')})});document.querySelectorAll('[data-vnext-find-spaces]').forEach(function(link){link.addEventListener('click',function(){track('vnext_find_spaces_clicked')})});})();</script><script src="/assets/location-brief-v2.js" defer data-cfasync="false"></script></body></html>`;
}

export async function onRequestGet({ request, env, params }) {
  if (!operatorAllowed(request, env)) return privateHtml("Operator Location Brief v2 is disabled.", 404);
  if (!/^LB2-[A-F0-9]{24}$/.test(String(params.publicId || "").toUpperCase())) return privateHtml("Location Brief v2 not found.", 404);
  let bundle = await getBriefBundle(env, params.publicId, false); if (!bundle) return privateHtml("Location Brief v2 not found.", 404);
  const owner = await ownsBrief(request, bundle.brief);
  const debug = owner && new URL(request.url).searchParams.get("debug") === "1";
  if (debug) bundle = await getBriefBundle(env, params.publicId, true);
  return privateHtml(renderLocationBriefV2Page(bundle, owner, debug));
}
