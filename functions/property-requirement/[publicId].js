import { commercialContextForBundle, completeCommercialRequest, getBriefBundle, getCommercialRequest, getPropertyRequirementDraft, ownsBrief, privateHtml, releaseCommercialRequest, reserveCommercialRequest, sameOriginMutation, savePropertyRequirementDraft, sha256 } from "../api/location-brief-v2/_shared.js";
import { renderSearchSummary } from "../api/location-brief-v2/_search-summary.js";
import { buildLeadPayload, buildOfficeFinderPayload, detectLeadSpam, getMissingSubmitFields, logLeadToGoogleSheets, randomHex, resolveLeadRoute, saveLead, sendApprovalEmail, sendTenantConfirmationEmail, sha256 as leadSha256, updateLeadStatus } from "../api/leads/_shared.js";

function esc(value) { return String(value == null ? "" : value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char])); }
const PURPOSES = [["client_meetings", "Client meetings"], ["team_collaboration", "Team collaboration"], ["quiet_focused_work", "Quiet focused work"], ["showroom_presentation", "Showroom / presentation"]];
const TIMING = [["asap", "As soon as possible"], ["within_3_months", "Within 3 months"], ["3_to_6_months", "3–6 months"], ["6_to_12_months", "6–12 months"], ["more_than_12_months", "More than 12 months / flexible"]];
const MUST_HAVES = [["dedicated_storage", "Dedicated storage"], ["loading_receiving", "Loading / receiving"], ["special_improvements", "Special improvements"], ["parking_requirement", "Parking requirement"], ["none", "None / no special requirements"]];
const labelFor = (options, value) => options.find(([id]) => id === value)?.[1] || "";
const checked = (values, value) => new Set(values || []).has(value) ? " checked" : "";

function currentStep(draft) {
  const answers = draft?.answers || {};
  if (!(answers.officePurposes || []).length) return 1;
  if (!answers.approximateSquareFeet && !answers.approximatePeople) return 2;
  if (!answers.timing) return 3;
  if (answers.mustHavesReviewed !== true) return 4;
  return 5;
}

function choices(name, options, selected, type = "checkbox") {
  return `<div class="requirement-choice-grid">${options.map(([value, label]) => `<label class="requirement-choice"><input type="${type}" name="${name}" value="${value}"${checked(selected, value)}><span>${label}</span></label>`).join("")}</div>`;
}

function question(step, answers, share = {}) {
  if (step === 1) return `<h2>How will you use the space?</h2><p class="property-stage__help">Choose all that apply.</p>${choices("officePurposes", PURPOSES, answers.officePurposes)}`;
  if (step === 2) return `<h2>About how much space do you need, or how many people should it support?</h2><p class="property-stage__help">Give Rofo whichever estimate is easier. You do not need both.</p><div class="property-stage__measure"><label><span>Approximate square feet</span><input type="number" inputmode="numeric" min="1" step="1" name="approximateSquareFeet" value="${esc(answers.approximateSquareFeet || "")}" placeholder="Example: 3,000"></label><span class="property-stage__or">or</span><label><span>Approximate people</span><input type="number" inputmode="numeric" min="1" step="1" name="approximatePeople" value="${esc(answers.approximatePeople || "")}" placeholder="Example: 20"></label></div>`;
  if (step === 3) return `<h2>When do you need the space?</h2>${choices("timing", TIMING, answers.timing ? [answers.timing] : [], "radio")}`;
  if (step === 4) return `<h2>Are there any must-have space needs?</h2><p class="property-stage__help">Choose any that apply. Leave everything blank if there are no special requirements.</p>${choices("mustHaves", MUST_HAVES, answers.mustHaves)}`;
  const purposeLabels = (answers.officePurposes || []).map((value) => labelFor(PURPOSES, value)).filter(Boolean);
  const size = answers.approximateSquareFeet ? `${Number(answers.approximateSquareFeet).toLocaleString()} sq ft` : `${Number(answers.approximatePeople).toLocaleString()} people`;
  const mustHaveLabels = (answers.mustHaves || []).map((value) => labelFor(MUST_HAVES, value)).filter(Boolean);
  const completion = `<div class="property-stage__complete"><p class="requirement-prototype__eyebrow">Space needs</p><h2>Your space requirements are ready.</h2><p>Rofo has saved the initial details needed for the next stage of your search.</p><dl class="property-stage__summary"><div><dt>How you'll use it</dt><dd>${esc(purposeLabels.join(" · "))}</dd></div><div><dt>Approximate need</dt><dd>${esc(size)}</dd></div><div><dt>Timing</dt><dd>${esc(labelFor(TIMING, answers.timing))}</dd></div><div><dt>Must-haves</dt><dd>${esc(mustHaveLabels.join(" · ") || "No special requirements")}</dd></div></dl></div>`;
  if (share.submitted) return `${completion}<section class="property-stage__share property-stage__share--complete"><p class="requirement-prototype__eyebrow">Market investigation</p><h2>Your search has been shared with Rofo.</h2><p>We've received your Location Brief and space requirements. A local commercial real estate expert can review the search, current and upcoming availability, and market context and follow up with relevant options or questions.</p><a class="requirement-button requirement-button--primary" href="${esc(share.briefUrl)}">View my Location Brief</a></section>`;
  return `${completion}<section class="property-stage__share"><p class="requirement-prototype__eyebrow">Next step</p><h2>Ready to see what's available?</h2><p>Rofo can use your search to investigate current and upcoming availability, asking rents, and opportunities worth considering in the locations you're evaluating and other nearby areas that may fit.</p><p>A local commercial real estate expert can review the search and follow up with relevant options or questions.</p><div class="property-stage__contact"><label><span>Name</span><input name="name" autocomplete="name" required value="${esc(share.name || "")}"></label><label><span>Work email</span><input type="email" name="email" autocomplete="email" required value="${esc(share.email || "")}"></label><label><span>Phone <em>optional</em></span><input type="tel" name="phone" autocomplete="tel" value="${esc(share.phone || "")}"></label></div><input type="hidden" name="action" value="share"><input type="hidden" name="human_check" value="1"><p class="property-stage__reassurance">Your Location Brief and space requirements will be included, so you won't need to repeat everything.</p><button class="requirement-button requirement-button--primary" type="submit">Share my search with Rofo</button></section>`;
}

function render(bundle, draft, saved = false, saveError = "", share = {}) {
  const answers = draft?.answers || {}; const step = currentStep(draft); const briefUrl = `/location-brief/${bundle.brief.publicId}`;
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Continue your search | Rofo</title><link rel="stylesheet" href="/assets/requirement-prototype.css"><style>
  body{margin:0;background:#f5f8fc;font-family:Inter,ui-sans-serif,system-ui,sans-serif;color:#0f172a}.property-stage{max-width:1160px;margin:auto;padding:clamp(2rem,5vw,4rem) 1rem 5rem}.property-stage__header{margin-bottom:2rem}.property-stage__header h1{font-size:clamp(2.2rem,5vw,3.6rem);line-height:1.04;letter-spacing:-.035em;margin:.45rem 0 .7rem}.property-stage__header p{max-width:720px;color:#64748b}.property-stage__layout{display:grid;grid-template-columns:minmax(0,1.7fr) minmax(250px,.7fr);gap:2rem;align-items:start}.property-stage__card{background:#fff;border:1px solid #dbe6f1;border-radius:12px;padding:clamp(1.5rem,4vw,2.5rem);box-shadow:0 12px 26px rgba(15,23,42,.05)}.property-stage__card h2{font-size:clamp(1.6rem,4vw,2.35rem);line-height:1.15;margin:0 0 .75rem}.property-stage__help{color:#64748b;margin:0 0 1.4rem}.property-stage__saved{padding:.75rem 1rem;border-radius:8px;background:#eef4ff;color:#123f8c;font-weight:700}.property-stage__progress{color:#64748b;font-size:.86rem;font-weight:750;letter-spacing:.05em;text-transform:uppercase;margin:0 0 1rem}.property-stage__measure{display:grid;grid-template-columns:1fr auto 1fr;gap:1rem;align-items:end}.property-stage__measure label,.property-stage__contact label{display:grid;gap:.5rem;font-weight:700}.property-stage__measure input,.property-stage__contact input{width:100%;box-sizing:border-box;border:1px solid #cbd5e1;border-radius:9px;padding:.85rem;font:inherit}.property-stage__or{padding-bottom:.9rem;color:#64748b}.property-stage__actions{display:flex;align-items:center;justify-content:space-between;gap:1rem;margin-top:2rem;padding-top:1.25rem;border-top:1px solid #edf2f7}.property-stage__back{color:#475569;text-decoration:none}.property-stage__layout .requirement-search-summary{position:sticky;top:20px}.property-stage__actions .requirement-button--primary{min-width:120px}.property-stage__summary{display:grid;gap:.85rem;margin:1.5rem 0 0}.property-stage__summary div{border-top:1px solid #e2e8f0;padding-top:.85rem}.property-stage__summary dt{color:#64748b;font-size:.8rem;font-weight:750;text-transform:uppercase;letter-spacing:.05em}.property-stage__summary dd{margin:.25rem 0 0;font-weight:650}.property-stage__share{margin-top:2rem;padding:1.5rem;border:1px solid #bfd2ed;border-radius:12px;background:#f6f9ff}.property-stage__share h2{font-size:1.75rem}.property-stage__share--complete{background:#eef7f1;border-color:#badbc6}.property-stage__contact{display:grid;gap:1rem;margin:1.4rem 0}.property-stage__contact em{font-weight:500;color:#64748b}.property-stage__reassurance{color:#475569;font-size:.92rem}.property-stage__share>.requirement-button{display:inline-block;text-decoration:none;margin-top:.5rem}@media(max-width:760px){.property-stage__layout{grid-template-columns:1fr}.property-stage__layout .requirement-search-summary{position:static;order:2}.property-stage__actions{flex-wrap:wrap}.property-stage__actions button{flex:1 1 180px}.property-stage__measure{grid-template-columns:1fr}.property-stage__or{padding:0;text-align:center}.property-stage__share>.requirement-button{width:100%}}
  </style></head><body><main class="property-stage requirement-prototype"><header class="property-stage__header"><p class="requirement-prototype__eyebrow">Space search</p><h1>Tell us what you need in a space.</h1><p>A few more details will help Rofo narrow the available options.</p></header><div class="property-stage__layout"><form method="post" class="property-stage__card"><input type="hidden" name="draftRevision" value="${esc(draft?.draftRevision || 0)}"><input type="hidden" name="questionId" value="${step}">${step < 5 ? `<p class="property-stage__progress">Space needs · Step ${step} of 4</p>` : ""}${saved && step < 5 ? `<p class="property-stage__saved">Your search is up to date.</p>` : ""}${saveError ? `<p class="property-stage__saved" role="alert">${esc(saveError)}</p>` : ""}${question(step, answers, { ...share, briefUrl })}<div class="property-stage__actions"><a class="property-stage__back" href="${briefUrl}">← Back to my Location Brief</a>${step < 5 ? `<button class="requirement-button requirement-button--primary" type="submit">Continue</button>` : ""}</div></form>${renderSearchSummary(bundle, esc)}</div></main>${step === 5 ? `<script>try{const events=${JSON.stringify(share.submitted ? ["share_search_submitted", "commercial_request_created", "vnext_commercial_request_submitted"] : ["property_requirement_completed", "share_search_viewed"])};events.forEach(event_name=>fetch('/api/analytics/search-profile',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({event_name,profile_version:'location-brief:v2',context:{page_type:'property_requirement',page_url:location.pathname,city:'San Francisco'},profile:{space_type:'office'},attribution:{entry_page_type:${JSON.stringify(bundle.entryContext.sourceType || "")}}}),keepalive:true}))}catch(e){}</script>` : ""}</body></html>`;
}

function propertySummary(draft) {
  const answers = draft.answers || {};
  const purposes = (answers.officePurposes || []).map((value) => labelFor(PURPOSES, value)).filter(Boolean);
  const mustHaves = (answers.mustHaves || []).map((value) => labelFor(MUST_HAVES, value)).filter(Boolean);
  return {
    purposes,
    squareFeet: answers.approximateSquareFeet || null,
    people: answers.approximatePeople || null,
    sizeLabel: answers.approximateSquareFeet ? `${Number(answers.approximateSquareFeet).toLocaleString()} sqft` : `${Number(answers.approximatePeople).toLocaleString()} people`,
    timing: answers.timing || "",
    timingLabel: labelFor(TIMING, answers.timing),
    mustHaves,
  };
}

async function createCommercialRequest(request, env, bundle, draft, form, waitUntil) {
  if (currentStep(draft) !== 5) { const error = new Error("Complete the space questions before sharing your search."); error.status = 409; throw error; }
  if (Number(form.get("draftRevision") || 0) !== Number(draft.draftRevision || 0)) { const error = new Error("This search changed in another session. Refresh before sharing."); error.status = 409; throw error; }
  const contact = { name: String(form.get("name") || "").trim(), email: String(form.get("email") || "").trim(), phone: String(form.get("phone") || "").trim() };
  const property = propertySummary(draft); const context = commercialContextForBundle(bundle);
  const briefOrigin = new URL(request.url).origin; const briefUrl = `${briefOrigin}/location-brief/${bundle.brief.publicId}`;
  const rawFields = {
    lead_type: "vnext_market_investigation", profile_version: "location-brief:v2", ...contact,
    human_check: "1", city: "San Francisco", state: "CA", market: "San Francisco",
    requested_space_type: "Office space", space_type: "Office space", routing_market: "san-francisco", routing_space_type: "office",
    space_needed: property.squareFeet ? `${property.squareFeet} sqft` : `${property.people} people`, timing: property.timingLabel,
    page_type: "property_requirement", page_url: new URL(request.url).pathname, rofo_source: context.sourcePath || "location_brief_v2",
    source: "location_brief", landing_page: bundle.entryContext.landingPage || "", referring_page: bundle.entryContext.referrer || "",
    entry_page_type: context.sourceType, location_brief_v2_public_id: bundle.brief.publicId,
    location_brief_v2_entry_source: context.sourceType, location_brief_v2_entry_source_path: context.sourcePath,
    location_brief_v2_business_archetype: context.business,
  };
  const lead = buildLeadPayload(rawFields, request);
  const structuredContext = {
    schemaVersion: "vnext-commercial-context:v1", entryContext: bundle.entryContext, locationRequirement: context,
    recommendation: { snapshotId: bundle.currentSnapshot.id, snapshotVersion: bundle.currentSnapshot.schemaVersion, readiness: bundle.currentSnapshot.readiness, locationsWorthInvestigating: context.guidanceDistricts, candidateDistrictIds: context.candidateDistrictIds, candidateDistrictNames: context.candidateDistrictNames },
    propertyRequirement: { schemaVersion: draft.schemaVersion, revision: draft.draftRevision, locationRequirementRevisionId: draft.locationRequirementRevisionId, recommendationSnapshotId: draft.recommendationSnapshotId, ...property },
    geographySemantics: "Locations are investigation preferences and context, not hard constraints; nearby compatible areas may also be considered.",
  };
  const summaryLines = [
    `Business: ${context.business}`, `Employees: ${context.employeeOrigins}`, context.clientVisitFrequency ? `Client visits: ${context.clientVisitFrequency}` : "",
    context.customerOrigins ? `Client origins: ${context.customerOrigins}` : "", `Environment: ${context.environment}`, `Transit: ${context.transitImportance}`, `Parking: ${context.parkingImportance}`,
    `Locations worth investigating: ${context.guidanceDistricts.join(", ")}`, context.candidateDistrictIds.length ? `Areas already considered: ${(context.candidateDistrictNames.length ? context.candidateDistrictNames : context.candidateDistrictIds).join(", ")}` : "",
    `Space use: ${property.purposes.join(", ")}`, `Approximate need: ${property.sizeLabel}`, `Timing: ${property.timingLabel}`, `Must-haves: ${property.mustHaves.join(", ") || "None"}`,
    "Geography: investigation preferences, not hard filters; nearby compatible areas may also be considered.",
  ].filter((line) => line && !line.endsWith(": "));
  Object.assign(lead, {
    location_brief_public_id: bundle.brief.publicId, location_brief_url: briefUrl, location_brief_status: bundle.brief.lifecycleStage,
    location_brief_v2_context: structuredContext, location_brief_v2_url: briefUrl,
    location_requirement_revision_id: bundle.currentRevision.id, location_requirement_revision_number: bundle.currentRevision.revisionNumber,
    recommendation_snapshot_id: bundle.currentSnapshot.id, recommendation_snapshot_version: bundle.currentSnapshot.schemaVersion,
    property_requirement_revision: draft.draftRevision, property_requirement_schema_version: draft.schemaVersion,
    property_requirement_use: property.purposes.join(", "), property_requirement_must_haves: property.mustHaves.join(", "),
    location_profile_business_type: context.business, business_type: context.business,
    location_profile_office_environment: context.environment, location_profile_commute_orientation: context.employeeOrigins,
    top_three_districts: context.guidanceDistricts.join(", "), recommended_market_path: context.guidanceDistricts.join(" → "),
    project_snapshot_json: JSON.stringify({ market: "San Francisco", propertyType: "Office", businessType: context.business, selectedDistrict: "", headcount: property.people ? String(property.people) : "", approximateSize: property.sizeLabel, timing: property.timingLabel, additionalNotes: property.mustHaves.join(", "), growth: "", topDistricts: context.guidanceDistricts }),
    project_snapshot_summary: summaryLines.join("\n"), requirements: summaryLines.join("\n"), qualification_status: "qualified_requirement",
    investigation_requested: "yes", investigation_status: "requested", investigation_source: "location_brief_v2_property_requirement",
    investigation_city: "San Francisco", investigation_approximate_size: property.sizeLabel, investigation_timing: property.timingLabel,
    investigation_scope: "Locations worth investigating plus nearby compatible areas", officefinder_status: "officefinder_pending_approval",
  });
  const missing = getMissingSubmitFields(lead); if (missing.length) { const error = new Error(`Add ${missing.join(" and ")} before sharing.`); error.status = 400; error.contact = contact; throw error; }
  const spam = detectLeadSpam(lead, rawFields); if (spam.isSuspicious || spam.isSpam) { lead.spam_score = spam.score; lead.spam_reasons = spam.reasons; }
  const leadId = crypto.randomUUID ? crypto.randomUUID() : randomHex(16); const requestHash = await sha256(`${bundle.brief.id}:${draft.draftRevision}:${contact.email.toLowerCase()}`);
  const reservation = await reserveCommercialRequest(env, bundle, draft, requestHash, leadId);
  if (!reservation.reserved) return { submitted: true, duplicate: true, leadId: reservation.leadId, contact };
  const token = randomHex(32); const routeRecommendation = resolveLeadRoute(lead); lead.route_recommendation = routeRecommendation;
  const record = { id: leadId, token_hash: await leadSha256(token), status: spam.isSpam ? "spam_quarantined" : "pending", lead: { ...lead, status: spam.isSpam ? "spam_quarantined" : "pending" }, officefinder_payload: spam.isSpam ? {} : buildOfficeFinderPayload(lead, env) };
  try {
    await saveLead(env, record); await completeCommercialRequest(env, bundle, draft, leadId);
  } catch (error) { await releaseCommercialRequest(env, bundle, draft, leadId); throw error; }
  const deliver = async () => { if (!spam.isSpam) {
    try { await logLeadToGoogleSheets(env, record); } catch {}
    let updatedLead = record.lead;
    try {
      const notification = await sendApprovalEmail(env, request, record, token);
      updatedLead = { ...updatedLead, internal_email_status: notification.sent ? "sent" : notification.status || "not_sent", internal_email_sent_at: notification.sentAt || "", internal_email_recipient: notification.recipient || "", internal_email_error: notification.sent ? "" : notification.reason || "" };
    } catch (error) { updatedLead = { ...updatedLead, internal_email_status: "failed", internal_email_error: error.message || "Internal notification failed" }; }
    try {
      const confirmation = await sendTenantConfirmationEmail(env, { ...record, lead: updatedLead });
      updatedLead = { ...updatedLead, tenant_confirmation_sent_at: confirmation.sent ? confirmation.sent_at : "", tenant_confirmation_error: confirmation.sent ? "" : confirmation.reason || "" };
    } catch (error) { updatedLead = { ...updatedLead, tenant_confirmation_error: error.message || "Confirmation email failed" }; }
    await updateLeadStatus(env, leadId, { status: record.status, lead: updatedLead });
  }};
  if (typeof waitUntil === "function") waitUntil(deliver()); else await deliver();
  return { submitted: true, duplicate: false, leadId, contact };
}

function propertyPage(body, status = 200) { return privateHtml(body, status, { "referrer-policy": "same-origin" }); }
async function loadOwned(request, env, publicId) {
  if (!/^LB2-[A-F0-9]{24}$/i.test(publicId || "")) return { response: privateHtml("Location Brief not found.", 404) };
  const bundle = await getBriefBundle(env, publicId, false); if (!bundle) return { response: privateHtml("Location Brief not found.", 404) };
  if (!await ownsBrief(request, bundle.brief)) return { response: privateHtml("Open this page from the browser that owns the Location Brief.", 403) };
  const requirement = bundle.currentRevision.requirement; const marketId = requirement.locationLogic?.marketAnchor?.marketId || requirement.locationLogic?.marketAnchor?.geographyId;
  if (requirement.propertyTypes?.length !== 1 || requirement.propertyTypes[0] !== "office" || marketId !== "san-francisco") return { response: privateHtml("This property-stage continuation is currently available for San Francisco Office searches.", 409) };
  return { bundle };
}

export async function onRequestGet({ request, env, params }) {
  const loaded = await loadOwned(request, env, params.publicId); if (loaded.response) return loaded.response;
  const draft = await getPropertyRequirementDraft(env, loaded.bundle.brief);
  const commercialRequest = draft ? await getCommercialRequest(env, loaded.bundle, draft) : null;
  const submitted = commercialRequest?.status === "created";
  return propertyPage(render(loaded.bundle, draft, new URL(request.url).searchParams.get("saved") === "1", "", { submitted }));
}

export async function onRequestPost({ request, env, params, waitUntil }) {
  const loaded = await loadOwned(request, env, params.publicId); if (loaded.response) return loaded.response;
  const existing = await getPropertyRequirementDraft(env, loaded.bundle.brief);
  if (!sameOriginMutation(request)) return propertyPage(render(loaded.bundle, existing, false, "We couldn't save that answer. Please try again."), 403);
  const form = await request.formData(); const step = Number(form.get("questionId") || currentStep(existing)); const answers = { ...(existing?.answers || {}) };
  if (form.get("action") === "share") {
    try {
      await createCommercialRequest(request, env, loaded.bundle, existing, form, waitUntil);
      let responseOrigin = ""; try { responseOrigin = new URL(request.headers.get("origin") || "").origin; } catch {}
      if (!responseOrigin) responseOrigin = new URL(request.url).origin;
      return Response.redirect(`${responseOrigin}/property-requirement/${encodeURIComponent(loaded.bundle.brief.publicId)}?shared=1`, 303);
    } catch (error) {
      return propertyPage(render(loaded.bundle, existing, false, "We couldn't share your search yet. Please try again.", { name: form.get("name"), email: form.get("email"), phone: form.get("phone") }), error.status || 503);
    }
  }
  let validationError = "";
  if (step !== currentStep(existing)) validationError = "This search changed in another session. Refresh before continuing.";
  else if (step === 1) { answers.officePurposes = form.getAll("officePurposes"); if (!answers.officePurposes.length) validationError = "Choose at least one way you'll use the space."; }
  else if (step === 2) { answers.approximateSquareFeet = form.get("approximateSquareFeet"); answers.approximatePeople = form.get("approximatePeople"); if (!(Number(answers.approximateSquareFeet) > 0) && !(Number(answers.approximatePeople) > 0)) validationError = "Add either approximate square feet or the number of people the space should support."; }
  else if (step === 3) { answers.timing = form.get("timing"); if (!answers.timing) validationError = "Choose the timing that best matches your search."; }
  else if (step === 4) { const selected = form.getAll("mustHaves"); answers.mustHaves = selected.includes("none") ? [] : selected; answers.mustHavesReviewed = true; }
  else validationError = "Your space requirements are already complete.";
  if (validationError) return propertyPage(render(loaded.bundle, existing, false, validationError), 400);
  try { await savePropertyRequirementDraft(env, loaded.bundle, answers, Number(form.get("draftRevision") || 0)); }
  catch (error) { return propertyPage(render(loaded.bundle, existing, false, error.message || "We couldn't save that answer. Please try again."), error.status || 503); }
  let responseOrigin = ""; try { const submitted = new URL(request.headers.get("origin") || ""); if (["http:", "https:"].includes(submitted.protocol)) responseOrigin = submitted.origin; } catch {}
  if (!responseOrigin && request.headers.get("referer")) { try { responseOrigin = new URL(request.headers.get("referer")).origin; } catch {} }
  if (!responseOrigin) responseOrigin = new URL(request.url).origin;
  return Response.redirect(`${responseOrigin}/property-requirement/${encodeURIComponent(loaded.bundle.brief.publicId)}?saved=1`, 303);
}
