import { getBriefBundle, operatorAllowed, ownsBrief, privateHtml } from "../../api/location-brief-v2/_shared.js";

function esc(value) { return String(value == null ? "" : value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char])); }
function criterion(requirement, dimension) { return (requirement.criteria || []).find((item) => item.dimension === dimension); }
function criterionText(requirement, dimension) { const value = criterion(requirement, dimension)?.value || {}; return (value.list || []).join(" + ") || value.text || ""; }
function titleCase(value) { return String(value || "").replace(/[-_]+/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase()); }
function businessLabel(requirement) {
  const value = criterion(requirement, "universal.business.type")?.value || {};
  return value.list?.[1] || value.text || requirement.businessContext?.summary || "";
}
function marketLabel(requirement, entryContext) { return requirement.locationLogic?.marketAnchor?.displayName || requirement.locationLogic?.marketAnchor?.marketName || titleCase(requirement.locationLogic?.marketAnchor?.marketId || entryContext.marketId); }
function propertyLabel(requirement, entryContext) { return titleCase((requirement.propertyTypes || [entryContext.propertyType])[0]); }
function searchRows(requirement, entryContext) {
  return [
    ["Business", businessLabel(requirement)],
    ["Space", propertyLabel(requirement, entryContext)],
    ["Market", marketLabel(requirement, entryContext)],
    ["Employees", criterionText(requirement, "universal.location.employee_origins")],
    ["Clients", criterionText(requirement, "office.access.client_visits") || criterionText(requirement, "universal.location.customer_origins")],
    ["Environment", criterionText(requirement, "office.environment.image")],
    ["Transit", criterionText(requirement, "universal.access.transit_importance")],
    ["Parking", criterionText(requirement, "universal.access.parking_importance")],
    ["Areas already considered", (requirement.locationLogic?.specificPreference?.candidateDistrictNames || []).join(" + ")],
  ].filter(([, value]) => value);
}
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
  if (item.office?.summary) return item.office.summary;
  if (item.environment?.businessIdentityBasis === "USER_STATED_COMPANY_CONTEXT" && environment) return cleanStrength(environment);
  if (employee) return cleanStrength(employee);
  return item.role || item.office?.summary || cleanStrength((item.strengths || [])[0]) || "A useful location to compare against your priorities.";
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
  return `<article class="lb2-rec${rich ? " lb2-rec--rich" : ""}">
    ${rich ? mediaMarkup(item.presentation, item.districtName) : ""}<div class="lb2-rec__body"><p class="lb2-rec__role">${esc(options.role || "Alternative worth comparing")}</p>
    <h3>${esc(item.districtName)}</h3><p class="lb2-rec__reason">${esc(conciseReason(item))}</p>
    ${strengths.length ? `<div class="lb2-rec__detail"><h4>${options.candidate ? "Why it may fit your search" : "Why it fits"}</h4><ul>${strengths.map((value) => `<li>${esc(value)}</li>`).join("")}</ul></div>` : ""}
    ${tradeoffs.length ? `<div class="lb2-rec__detail lb2-rec__detail--tradeoff"><h4>${options.candidate ? "Things to weigh" : "Tradeoffs"}</h4><ul>${tradeoffs.map((value) => `<li>${esc(value)}</li>`).join("")}</ul></div>` : ""}
    ${path ? `<a class="lb2-text-link" href="${esc(path)}" data-brief-explore>Explore ${esc(item.districtName)} <span aria-hidden="true">→</span></a>` : ""}
    ${rich ? buildingsMarkup(item.presentation) : ""}</div></article>`;
}
function recommendationCards(snapshot, requirement) {
  return (snapshot.shortlist || []).map((item, index) => {
    return districtCard(item, requirement, { rich: index === 0, role: index === 0 ? (snapshot.readiness === "BOUNDED" ? "Strong starting point" : "Recommended by Rofo") : "Alternative worth comparing" });
  }).join("");
}
function comparisonRows(snapshot) {
  const items = snapshot.shortlist || [];
  const definitions = [
    ["Employee access", (item) => humanBand(item.employeeAccessSummary?.band || item.accessComponent?.band)],
    ["Business environment", (item) => humanBand(item.environment?.band)],
    ["Office fit", (item) => humanBand(item.office?.band)],
    ["Parking", (item) => item.parkingRelevant ? humanBand(item.parkingEnvironment) : "Not a stated priority"],
  ];
  return definitions.map(([label, getter]) => ({ label, values: items.map(getter) })).filter((row) => new Set(row.values).size > 1);
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
  if (!(candidates || []).length) return `<section class="lb2-considering"><div class="lb2-section-head"><p class="lb2-eyebrow">Your list</p><h2>Areas you're considering</h2></div><p class="lb2-subtle">You haven't added any areas yet. Recommended locations remain available to explore above.</p></section>`;
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
function nextStep(readiness) {
  if (readiness === "FULL") return { heading: "Find actual spaces", action: "Tell Rofo what the space needs", copy: "Rofo will ask a few additional questions about what the space itself needs before investigating available properties." };
  if (readiness === "BOUNDED") return { heading: "Investigate the broader market", action: "Investigate the broader market", copy: "These starting points are useful, but Rofo should investigate other potentially relevant areas before narrowing to actual properties." };
  return { heading: "Investigate available space", action: "Investigate available space", copy: "The next useful step is to define what the actual space must support, then investigate compatible properties and nearby areas." };
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
  const readiness = currentSnapshot.readiness;
  const priorities = readiness === "INVESTIGATE" ? investigationPriorities(requirement) : [];
  const guidanceHeading = readiness === "FULL" ? "Recommended locations" : readiness === "BOUNDED" ? "Strong starting points" : "What matters most";
  const comparedCandidate = currentSnapshot.candidateAssessments?.[0]; const comparedAlternative = currentSnapshot.comparisonAlternatives?.[0];
  const guidanceCopy = readiness === "FULL" ? "There usually isn't one perfect location. These are the areas that best fit the priorities you gave us, with different strengths and tradeoffs." : readiness === "BOUNDED" ? "Rofo has good intelligence on these areas. Some other potentially relevant parts of the market still need further investigation." : comparedCandidate && comparedAlternative ? `${comparedCandidate.districtName} is worth considering based on the business environment and Office fit you described. Comparing it with ${comparedAlternative.districtName} helps show a different set of district and office tradeoffs.` : "Use these priorities to evaluate the areas and properties you investigate next.";
  const next = nextStep(readiness);
  const publicExperience = options.publicExperience === true;
  const briefUrl = publicExperience ? `/location-brief/${brief.publicId}` : `/operator/location-brief-v2/${brief.publicId}`;
  const editUrl = publicExperience ? `/location-requirement/?journey=edit&brief=${encodeURIComponent(brief.publicId)}` : `/prototype/requirement-v1/?locationBriefV2=edit&brief=${encodeURIComponent(brief.publicId)}`;
  const newSearchUrl = publicExperience ? `/location-requirement/?journey=new&marketId=san-francisco&propertyType=office` : `/prototype/requirement-v1/?locationBriefV2=new`;
  const findSpacesParams = new URLSearchParams({ city: "San Francisco", state: "CA", spaceType: "Office", source: "location_brief_v2", sourcePath: briefUrl, locationBrief: brief.publicId });
  if (entryContext.sourceType) findSpacesParams.set("entrySource", entryContext.sourceType);
  if (entryContext.sourcePath) findSpacesParams.set("entrySourcePath", entryContext.sourcePath);
  if (entryContext.candidateDistrictIds?.[0]) findSpacesParams.set("entryDistrict", entryContext.candidateDistrictIds[0]);
  if (entryContext.businessArchetypeId) findSpacesParams.set("businessArchetype", entryContext.businessArchetypeId);
  const considered = [...new Set([...(currentSnapshot.shortlist || []).map((item) => item.districtName), ...(candidates || []).map((item) => item.sourceIdentity || item.canonicalDistrictId)].filter(Boolean))];
  if (considered.length) findSpacesParams.set("district", considered.slice(0, 3).join(", "));
  const findSpacesUrl = `/find-locations/?${findSpacesParams.toString()}`;
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Your Location Brief | Rofo</title><style>
  :root{font-family:Inter,ui-sans-serif,system-ui,sans-serif;color:#17221d;background:#f3f5f1;line-height:1.55}*{box-sizing:border-box}body{margin:0}.lb2{max-width:1120px;margin:auto;padding:34px 22px 80px}.lb2 a{color:#175f40}.lb2-hero{display:flex;align-items:end;justify-content:space-between;gap:24px;padding:28px 4px 36px;border-bottom:1px solid #d7ded8}.lb2-brand{font-weight:800;text-decoration:none;color:#173f2e!important}.lb2-eyebrow{margin:0 0 7px;color:#5a7466;text-transform:uppercase;letter-spacing:.1em;font-size:.72rem;font-weight:800}.lb2 h1{font-size:clamp(2.45rem,6vw,4.4rem);line-height:1.02;letter-spacing:-.045em;margin:12px 0}.lb2-hero__context{font-size:1.15rem;margin:0;color:#526158}.lb2-button{display:inline-flex;justify-content:center;align-items:center;border-radius:999px;padding:11px 18px;background:#173f2e;color:#fff!important;text-decoration:none;font-weight:750;border:0;cursor:pointer}.lb2-button--quiet{background:#e6ece7;color:#173f2e!important}.lb2-search{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:30px;padding:38px 4px 34px;align-items:start}.lb2-section-head h2,.lb2-search h2{font-size:clamp(1.55rem,3vw,2.2rem);line-height:1.15;margin:0 0 10px;letter-spacing:-.025em}.lb2-search dl{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:18px 28px;margin:22px 0 0}.lb2-search dt{font-size:.76rem;text-transform:uppercase;letter-spacing:.07em;color:#718078;font-weight:750}.lb2-search dd{margin:4px 0 0;font-weight:650}.lb2-guidance{background:#fff;border-radius:24px;padding:34px;box-shadow:0 12px 40px rgba(23,63,46,.07)}.lb2-guidance__intro{max-width:720px;margin:0 0 26px;color:#53635a;font-size:1.04rem}.lb2-rec-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}.lb2-rec{display:flex;flex-direction:column;border:1px solid #dce3dd;border-radius:17px;background:#fbfcfa;overflow:hidden}.lb2-rec__body{display:flex;flex:1;flex-direction:column;padding:22px}.lb2-rec--rich{grid-column:1/-1;display:grid;grid-template-columns:minmax(280px,.9fr) minmax(0,1.35fr);background:#f6faf6;border-color:#8bac99}.lb2-district-media{margin:0;min-height:330px}.lb2-district-media img{width:100%;height:100%;object-fit:cover;display:block}.lb2-rec__role{font-size:.73rem;text-transform:uppercase;letter-spacing:.075em;color:#617b6b;font-weight:800;margin:0}.lb2-rec h3,.lb2-compare-card h3{font-size:1.45rem;line-height:1.2;margin:9px 0}.lb2-rec--rich h3{font-size:clamp(1.7rem,4vw,2.5rem)}.lb2-rec__reason{font-weight:680;margin:0 0 18px}.lb2-rec__detail{border-top:1px solid #e2e7e3;padding-top:13px;margin-top:8px}.lb2-rec__detail h4,.lb2-buildings h4{font-size:.78rem;text-transform:uppercase;letter-spacing:.06em;margin:0 0 7px;color:#64756b}.lb2-rec__detail ul{margin:0;padding-left:18px;font-size:.92rem}.lb2-rec__detail--tradeoff{color:#59655e}.lb2-text-link{margin-top:18px;font-weight:780;text-decoration:none}.lb2-buildings{border-top:1px solid #d9e1db;margin-top:20px;padding-top:16px}.lb2-buildings>p{font-size:.85rem;color:#637269}.lb2-building-grid{display:grid;gap:8px}.lb2-building-grid a{display:grid;text-decoration:none;background:#fff;padding:11px 12px;border-radius:9px}.lb2-building-grid span{font-size:.82rem;color:#5c6a62}.lb2-comparison,.lb2-considering,.lb2-alternatives,.lb2-next{padding:46px 4px 8px}.lb2-focus-tabs{display:flex;gap:8px;margin:16px 0}.lb2-focus-tabs button{border:1px solid #b8c7bc;background:#fff;color:#173f2e;border-radius:999px;padding:9px 14px;font-weight:750;cursor:pointer}.lb2-focus-tabs button.is-active{background:#173f2e;color:#fff}.lb2-compare-card{max-width:720px;background:#fff;border:1px solid #dce3dd;border-radius:16px;padding:22px}.lb2-compare-card ul{padding-left:20px}.lb2-pair-differences{margin-top:34px}.lb2-compare{margin-top:20px;border:1px solid #d9e0da;border-radius:16px;overflow:hidden;background:#fff}.lb2-compare__row{display:grid;grid-template-columns:minmax(150px,.8fr) repeat(var(--lb2-cols),minmax(130px,1fr));gap:0}.lb2-compare__row>*{padding:14px 16px;border-bottom:1px solid #e5e9e6}.lb2-compare__row>*+*{border-left:1px solid #e5e9e6}.lb2-compare__row:last-child>*{border-bottom:0}.lb2-compare__head{background:#eef3ef}.lb2-candidate-limited{padding:18px;background:#fff;border:1px solid #dce3dd;border-radius:12px}.lb2-candidate-limited span,.lb2-subtle{color:#69786f}.lb2-next__panel{display:flex;justify-content:space-between;gap:30px;align-items:center;background:#173f2e;color:#fff;border-radius:22px;padding:28px 30px}.lb2-next__panel h2{margin:0 0 6px}.lb2-next__panel p{margin:0;max-width:670px;color:#dbe7df}.lb2-next__panel button{white-space:nowrap;border:0;opacity:.68}.lb2-investigate-list{display:grid;gap:9px;margin:20px 0 0;padding:0;list-style:none}.lb2-investigate-list li{padding:14px 16px;background:#f2f6f3;border-radius:10px}.lb2-debug{margin-top:45px;background:#111;color:#e8eee9;border-radius:15px;padding:20px}.lb2-debug summary{cursor:pointer;font-weight:800}.lb2-debug dl{display:grid;grid-template-columns:max-content 1fr;gap:5px 16px}.lb2-debug dd{margin:0}.lb2-debug pre{overflow:auto;background:#1c211e;padding:12px;font-size:11px}.lb2-debug h3{margin-top:24px}@media(max-width:850px){.lb2-rec-grid{grid-template-columns:1fr}.lb2-rec--rich{grid-column:auto;grid-template-columns:1fr}.lb2-district-media{min-height:240px}.lb2-search dl{grid-template-columns:repeat(2,minmax(0,1fr))}.lb2-compare{border:0;background:transparent}.lb2-compare__head{display:none}.lb2-compare__row{grid-template-columns:1fr;background:#fff;border:1px solid #d9e0da;border-radius:12px;margin-bottom:10px}.lb2-compare__row>*{border:0!important;padding:9px 14px}.lb2-compare__row span:before{content:attr(data-label);font-weight:700}}@media(max-width:600px){.lb2{padding:20px 14px 60px}.lb2-hero{display:block;padding-top:12px}.lb2-hero .lb2-button{margin-top:20px}.lb2-search{grid-template-columns:1fr;padding-top:28px}.lb2-search dl{grid-template-columns:1fr 1fr;gap:14px}.lb2-guidance{padding:22px 16px;border-radius:18px}.lb2-next__panel{display:block}.lb2-next__panel button{margin-top:18px;width:100%}}
  </style></head><body><main class="lb2">
  <header class="lb2-hero"><div><a class="lb2-brand" href="/">Rofo</a><p class="lb2-eyebrow">Your saved location search</p><h1>Your Location Brief</h1><p class="lb2-hero__context">${esc(property)} · ${esc(market)}</p></div><a class="lb2-button lb2-button--quiet" href="${esc(newSearchUrl)}">Start a new search</a></header>
  <section class="lb2-search"><div><p class="lb2-eyebrow">What Rofo understands</p><h2>Your search</h2><dl>${searchRows(requirement, entryContext).map(([label, value]) => `<div><dt>${esc(label)}</dt><dd>${esc(value)}</dd></div>`).join("")}</dl></div>${owner ? `<a class="lb2-button lb2-button--quiet" href="${esc(editUrl)}">Edit my search</a>` : ""}</section>
  ${readiness === "INVESTIGATE" ? candidateSection(candidates, currentSnapshot, requirement) : ""}
  ${readiness === "INVESTIGATE" ? comparisonAlternatives(currentSnapshot, requirement) : ""}
  ${readiness !== "INVESTIGATE" || priorities.length ? `<section class="lb2-guidance"><div class="lb2-section-head"><p class="lb2-eyebrow">Location guidance</p><h2>${esc(guidanceHeading)}</h2></div><p class="lb2-guidance__intro">${esc(guidanceCopy)}</p>${readiness === "INVESTIGATE" ? `<ul class="lb2-investigate-list">${priorities.map((item) => `<li>${esc(item)}</li>`).join("")}</ul>` : `<div class="lb2-rec-grid">${recommendationCards(currentSnapshot, requirement)}</div>`}</section>` : ""}
  ${readiness === "INVESTIGATE" ? "" : comparison(currentSnapshot)}
  ${readiness === "INVESTIGATE" ? "" : candidateSection(candidates, currentSnapshot, requirement)}
  <section class="lb2-next"><div class="lb2-next__panel"><div><p class="lb2-eyebrow">Next step</p><h2>${esc(next.heading)}</h2><p>${esc(next.copy)}</p></div>${publicExperience ? `<a class="lb2-button" href="${esc(findSpacesUrl)}" data-vnext-find-spaces>${esc(next.action)}</a>` : `<button class="lb2-button" type="button" disabled title="Operator preview only — no action is submitted">${esc(next.action)}</button>`}</div></section>
  ${debug ? debugPanel(bundle) : ""}
  </main><script>(function(){var endpoint='/api/analytics/search-profile';function track(name,extra){${publicExperience ? `try{fetch(endpoint,{method:'POST',headers:{'content-type':'application/json'},credentials:'same-origin',keepalive:true,body:JSON.stringify({event_name:name,profile_version:'location-brief:v2',context:Object.assign({page_type:'location_brief_v2',page_url:location.pathname,city:'San Francisco',space_type:'Office',readiness:${JSON.stringify(readiness)},brief_id:${JSON.stringify(brief.publicId)}},extra||{}),profile:{profile_version:'location-brief:v2',space_type:'Office'},attribution:{entry_page_type:${JSON.stringify(entryContext.sourceType || '')},landing_page:${JSON.stringify(entryContext.landingPage || '')}})})}catch(error){}` : ``}}track('vnext_brief_viewed');var key='rofoLocationBriefV2Return';document.querySelectorAll('[data-brief-explore]').forEach(function(link){link.addEventListener('click',function(){try{sessionStorage.setItem(key,JSON.stringify({url:${JSON.stringify(briefUrl)},label:'Back to my Location Brief'}));}catch(error){}track('vnext_district_explored',{district:link.textContent.replace(/Explore|→/g,'').trim()});});});document.querySelectorAll('a[href*="journey=edit"]').forEach(function(link){link.addEventListener('click',function(){track('vnext_requirement_edited')})});document.querySelectorAll('[data-vnext-find-spaces]').forEach(function(link){link.addEventListener('click',function(){track('vnext_find_spaces_clicked')})});var root=document.querySelector('[data-comparison-focus-root]');if(!root)return;var panels=root.querySelectorAll('[data-focus-panel]');var buttons=root.querySelectorAll('[data-focus-button]');function focus(name){panels.forEach(function(panel){panel.hidden=panel.dataset.focusPanel!==name;});buttons.forEach(function(button){button.classList.toggle('is-active',button.dataset.focusButton===name);});}buttons.forEach(function(button){button.addEventListener('click',function(){focus(button.dataset.focusButton);});});document.querySelectorAll('[data-focus-alternative]').forEach(function(button){button.addEventListener('click',function(){focus('alternative');root.scrollIntoView({behavior:'smooth',block:'start'});});});})();</script></body></html>`;
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
