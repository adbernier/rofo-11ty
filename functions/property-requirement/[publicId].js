import { getBriefBundle, getPropertyRequirementDraft, ownsBrief, privateHtml, sameOriginMutation, savePropertyRequirementDraft } from "../api/location-brief-v2/_shared.js";
import { renderSearchSummary } from "../api/location-brief-v2/_search-summary.js";

function esc(value) { return String(value == null ? "" : value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char])); }
const PURPOSES = [
  ["client_meetings", "Client meetings"],
  ["team_collaboration", "Team collaboration"],
  ["quiet_focused_work", "Quiet focused work"],
  ["showroom_presentation", "Showroom / presentation"],
];

function render(bundle, draft, saved = false) {
  const selected = new Set(draft?.answers?.officePurposes || []);
  const briefUrl = `/location-brief/${bundle.brief.publicId}`;
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Continue your search | Rofo</title><link rel="stylesheet" href="/assets/requirement-prototype.css"><style>
  body{margin:0;background:#f5f8fc;font-family:Inter,ui-sans-serif,system-ui,sans-serif;color:#0f172a}.property-stage{max-width:1160px;margin:auto;padding:clamp(2rem,5vw,4rem) 1rem 5rem}.property-stage__header{margin-bottom:2rem}.property-stage__header h1{font-size:clamp(2.2rem,5vw,3.6rem);line-height:1.04;letter-spacing:-.035em;margin:.45rem 0 .7rem}.property-stage__header p{max-width:720px;color:#64748b}.property-stage__layout{display:grid;grid-template-columns:minmax(0,1.7fr) minmax(250px,.7fr);gap:2rem;align-items:start}.property-stage__card{background:#fff;border:1px solid #dbe6f1;border-radius:12px;padding:clamp(1.5rem,4vw,2.5rem);box-shadow:0 12px 26px rgba(15,23,42,.05)}.property-stage__card h2{font-size:clamp(1.6rem,4vw,2.35rem);line-height:1.15;margin:0 0 .75rem}.property-stage__help{color:#64748b;margin:0 0 1.4rem}.property-stage__saved{padding:.75rem 1rem;border-radius:8px;background:#eef4ff;color:#123f8c;font-weight:700}.property-stage__actions{display:flex;align-items:center;justify-content:space-between;gap:1rem;margin-top:2rem;padding-top:1.25rem;border-top:1px solid #edf2f7}.property-stage__back{color:#475569;text-decoration:none}.property-stage__layout .requirement-search-summary{position:sticky;top:20px}.property-stage__actions .requirement-button--primary{min-width:120px}@media(max-width:760px){.property-stage__layout{grid-template-columns:1fr}.property-stage__layout .requirement-search-summary{position:static;order:2}.property-stage__actions{flex-wrap:wrap}.property-stage__actions button{flex:1 1 180px}}
  </style></head><body><main class="property-stage requirement-prototype"><header class="property-stage__header"><p class="requirement-prototype__eyebrow">Space search</p><h1>Tell us what you need in a space.</h1><p>A few more details will help Rofo narrow the available options.</p></header><div class="property-stage__layout"><form method="post" class="property-stage__card"><input type="hidden" name="draftRevision" value="${esc(draft?.draftRevision || 0)}"><h2>How will you use the space?</h2><p class="property-stage__help">Choose all that apply.</p>${saved ? `<p class="property-stage__saved">Your search is up to date.</p>` : ""}<div class="requirement-choice-grid">${PURPOSES.map(([value, label]) => `<label class="requirement-choice"><input type="checkbox" name="officePurposes" value="${value}"${selected.has(value) ? " checked" : ""}><span>${label}</span></label>`).join("")}</div><div class="property-stage__actions"><a class="property-stage__back" href="${briefUrl}">← Back to my Location Brief</a><button class="requirement-button requirement-button--primary" type="submit">Continue</button></div></form>${renderSearchSummary(bundle, esc)}</div></main></body></html>`;
}

async function loadOwned(request, env, publicId) {
  if (!/^LB2-[A-F0-9]{24}$/i.test(publicId || "")) return { response: privateHtml("Location Brief not found.", 404) };
  const bundle = await getBriefBundle(env, publicId, false);
  if (!bundle) return { response: privateHtml("Location Brief not found.", 404) };
  if (!await ownsBrief(request, bundle.brief)) return { response: privateHtml("Open this page from the browser that owns the Location Brief.", 403) };
  const requirement = bundle.currentRevision.requirement;
  const marketId = requirement.locationLogic?.marketAnchor?.marketId || requirement.locationLogic?.marketAnchor?.geographyId;
  if (requirement.propertyTypes?.length !== 1 || requirement.propertyTypes[0] !== "office" || marketId !== "san-francisco") return { response: privateHtml("This property-stage continuation is currently available for San Francisco Office searches.", 409) };
  return { bundle };
}

export async function onRequestGet({ request, env, params }) {
  const loaded = await loadOwned(request, env, params.publicId); if (loaded.response) return loaded.response;
  const draft = await getPropertyRequirementDraft(env, loaded.bundle.brief);
  return privateHtml(render(loaded.bundle, draft, new URL(request.url).searchParams.get("saved") === "1"));
}

export async function onRequestPost({ request, env, params }) {
  const loaded = await loadOwned(request, env, params.publicId); if (loaded.response) return loaded.response;
  if (!sameOriginMutation(request)) return privateHtml("Invalid request origin.", 403);
  const form = await request.formData();
  try {
    await savePropertyRequirementDraft(env, loaded.bundle, { officePurposes: form.getAll("officePurposes") }, Number(form.get("draftRevision") || 0));
  } catch (error) { return privateHtml(error.message || "Unable to save this detail.", error.status || 503); }
  let responseOrigin = request.headers.get("origin") || "";
  if (!responseOrigin && request.headers.get("referer")) { try { responseOrigin = new URL(request.headers.get("referer")).origin; } catch {} }
  if (!responseOrigin) responseOrigin = new URL(request.url).origin;
  return Response.redirect(`${responseOrigin}/property-requirement/${encodeURIComponent(loaded.bundle.brief.publicId)}?saved=1`, 303);
}
