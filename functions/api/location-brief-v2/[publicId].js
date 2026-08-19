import { getBriefBundle, operatorAllowed, ownsBrief, privateJson, reviseBrief, sameOriginMutation } from "./_shared.js";

export async function onRequestGet({ request, env, params }) {
  const operator = operatorAllowed(request, env);
  const bundle = await getBriefBundle(env, params.publicId, operator && new URL(request.url).searchParams.get("debug") === "1");
  if (!bundle) return privateJson({ ok: false, error: "Location Brief v2 not found." }, 404);
  const owner = await ownsBrief(request, bundle.brief);
  if (!operator && !owner) return privateJson({ ok: false, error: "Edit capability required." }, 403);
  return privateJson({ ok: true, owner, ...bundle, brief: { ...bundle.brief, ownerCapabilityHash: undefined } });
}

export async function onRequestPut({ request, env, params }) {
  const operator = operatorAllowed(request, env);
  if (!operator && !sameOriginMutation(request)) return privateJson({ ok: false, error: "Invalid request origin." }, 403);
  const bundle = await getBriefBundle(env, params.publicId, true); if (!bundle) return privateJson({ ok: false, error: "Location Brief v2 not found." }, 404);
  if (!await ownsBrief(request, bundle.brief)) return privateJson({ ok: false, error: "Edit capability required." }, 403);
  let body; try { body = await request.json(); } catch { return privateJson({ ok: false, error: "Invalid JSON." }, 400); }
  try { const result = await reviseBrief(env, bundle, body.requirement, body.expectedRevision, operator ? "anonymous_operator" : "anonymous_public"); return privateJson({ ok: true, publicId: bundle.brief.publicId, briefUrl: operator ? `/operator/location-brief-v2/${bundle.brief.publicId}` : `/location-brief/${bundle.brief.publicId}`, revisionNumber: result.revision.revisionNumber, readiness: result.snapshot.readiness }); }
  catch (error) { return privateJson({ ok: false, error: error.message }, error.status || 500); }
}
