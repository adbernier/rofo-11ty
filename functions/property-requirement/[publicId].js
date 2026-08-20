import { getBriefBundle, getPropertyRequirementDraft, ownsBrief, privateHtml, savePropertyRequirementDraft } from "../api/location-brief-v2/_shared.js";

function esc(value) { return String(value == null ? "" : value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char])); }
function criterionText(requirement, dimension) { const value = (requirement.criteria || []).find((item) => item.dimension === dimension)?.value || {}; return (value.list || []).join(" + ") || value.text || ""; }
function businessLabel(requirement) { const value = (requirement.criteria || []).find((item) => item.dimension === "universal.business.type")?.value || {}; return value.list?.[1] || value.text || requirement.businessContext?.summary || ""; }
function summaryRows(bundle) {
  const requirement = bundle.currentRevision.requirement;
  return [
    ["Market", requirement.locationLogic?.marketAnchor?.displayName || "San Francisco"],
    ["Space", String(requirement.propertyTypes?.[0] || "Office").replace(/^./, (letter) => letter.toUpperCase())],
    ["Business", businessLabel(requirement)],
    ["Employees", criterionText(requirement, "universal.location.employee_origins")],
    ["Locations worth investigating", (bundle.currentSnapshot.shortlist || []).map((item) => item.districtName).join(" · ")],
  ].filter(([, value]) => value);
}
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
  body{margin:0;background:#f5f8fc;font-family:Inter,ui-sans-serif,system-ui,sans-serif;color:#0f172a}.property-stage{max-width:1160px;margin:auto;padding:clamp(2rem,5vw,4rem) 1rem 5rem}.property-stage__header{margin-bottom:2rem}.property-stage__header a{color:#1746cc;font-weight:750;text-decoration:none}.property-stage__header h1{font-size:clamp(2.2rem,5vw,3.6rem);line-height:1.04;letter-spacing:-.035em;margin:.45rem 0 .7rem}.property-stage__header p{max-width:720px;color:#64748b}.property-stage__layout{display:grid;grid-template-columns:minmax(0,1.7fr) minmax(250px,.7fr);gap:2rem;align-items:start}.property-stage__card{background:#fff;border:1px solid #dbe6f1;border-radius:12px;padding:clamp(1.5rem,4vw,2.5rem);box-shadow:0 12px 26px rgba(15,23,42,.05)}.property-stage__card h2{font-size:clamp(1.6rem,4vw,2.35rem);line-height:1.15;margin:.55rem 0 .75rem}.property-stage__help{color:#64748b;margin:0 0 1.4rem}.property-stage__actions{display:flex;align-items:center;justify-content:space-between;gap:1rem;margin-top:2rem;padding-top:1.25rem;border-top:1px solid #edf2f7}.property-stage__saved{padding:.75rem 1rem;border-radius:8px;background:#eef4ff;color:#123f8c;font-weight:700}.property-stage__back{color:#475569;text-decoration:none}.property-stage__summary{display:grid;gap:.85rem;padding:1.25rem;border:1px solid #dbe6f1;border-radius:12px;background:#fbfdff;box-shadow:0 12px 26px rgba(15,23,42,.04)}.property-stage__summary h2{font-size:1rem;margin:0}.property-stage__summary div{display:grid;gap:.2rem;padding-bottom:.75rem;border-bottom:1px solid #e8eef5}.property-stage__summary div:last-child{border:0;padding:0}.property-stage__summary span{color:#64748b;font-size:.68rem;font-weight:850;letter-spacing:.055em;text-transform:uppercase}.property-stage__summary strong{font-size:.94rem;line-height:1.4}.property-stage__boundary{margin-top:1rem;color:#64748b;font-size:.85rem}@media(max-width:760px){.property-stage__layout{grid-template-columns:1fr}.property-stage__summary{order:2}.property-stage__actions{flex-wrap:wrap}.property-stage__actions button{flex:1 1 180px}}
  </style></head><body><main class="property-stage requirement-prototype"><header class="property-stage__header"><p class="requirement-prototype__eyebrow">LOCATION SEARCH · SPACE NEEDS</p><h1>Now let's find the right space.</h1><p>Your location search is saved. Next, Rofo will learn what the actual office needs to support before investigating properties.</p></header><div class="property-stage__layout"><form method="post" class="property-stage__card"><input type="hidden" name="draftRevision" value="${esc(draft?.draftRevision || 0)}"><p class="requirement-prototype__eyebrow">First space question</p><h2>What should this office help your team do?</h2><p class="property-stage__help">Choose all that apply. This describes the space itself; it does not change the locations Rofo identified.</p>${saved ? `<p class="property-stage__saved">Saved to your Location Brief.</p>` : ""}<div class="requirement-choice-grid">${PURPOSES.map(([value, label]) => `<label class="requirement-choice"><input type="checkbox" name="officePurposes" value="${value}"${selected.has(value) ? " checked" : ""}><span>${label}</span></label>`).join("")}</div><div class="property-stage__actions"><a class="property-stage__back" href="${briefUrl}">← Back to my Location Brief</a><button class="requirement-button--primary" type="submit">Save and continue</button></div><p class="property-stage__boundary">No lead, broker request, or property search is created here.</p></form><aside class="property-stage__summary"><h2>Your search</h2>${summaryRows(bundle).map(([label, value]) => `<div><span>${esc(label)}</span><strong>${esc(value)}</strong></div>`).join("")}</aside></div></main></body></html>`;
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
  const origin = request.headers.get("origin"); if (origin && origin !== new URL(request.url).origin) return privateHtml("Invalid request origin.", 403);
  const form = await request.formData();
  try {
    await savePropertyRequirementDraft(env, loaded.bundle, { officePurposes: form.getAll("officePurposes") }, Number(form.get("draftRevision") || 0));
  } catch (error) { return privateHtml(error.message || "Unable to save this detail.", error.status || 503); }
  return Response.redirect(`${new URL(request.url).origin}/property-requirement/${encodeURIComponent(loaded.bundle.brief.publicId)}?saved=1`, 303);
}
