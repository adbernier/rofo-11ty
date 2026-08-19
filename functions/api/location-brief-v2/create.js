import { createBrief, findCreationRequest, getBriefBundle, isSfOfficeEntryContext, isSfOfficeRequirement, operatorAllowed, privateJson, publicSourceAllowed, publicV2Enabled, recordCreationRequest, sameOriginMutation } from "./_shared.js";

export async function onRequestPost({ request, env }) {
  const operator = operatorAllowed(request, env);
  const publicEnabled = publicV2Enabled(env);
  if (!operator && !publicEnabled) return privateJson({ ok: false, error: "Location Brief v2 is not enabled." }, 404);
  if (!operator && !sameOriginMutation(request)) return privateJson({ ok: false, error: "Invalid request origin." }, 403);
  let body; try { body = await request.json(); } catch { return privateJson({ ok: false, error: "Invalid JSON." }, 400); }
  if (!body.requirement || typeof body.requirement !== "object") return privateJson({ ok: false, error: "A canonical Requirement is required." }, 400);
  if (!operator && (!isSfOfficeRequirement(body.requirement) || !isSfOfficeEntryContext(body.entryContext) || !publicSourceAllowed(env, body.entryContext?.sourceType))) {
    return privateJson({ ok: false, error: "This vNext rollout currently supports San Francisco Office searches only.", fallbackUrl: "/find-locations/" }, 409);
  }
  try {
    const requestId = String(body.creationRequestId || "").trim().slice(0, 120);
    const existingPublicId = await findCreationRequest(env, requestId);
    if (existingPublicId) {
      const existing = await getBriefBundle(env, existingPublicId, false);
      if (existing) return privateJson({ ok: true, publicId: existingPublicId, briefUrl: operator ? `/operator/location-brief-v2/${existingPublicId}` : `/location-brief/${existingPublicId}`, revisionNumber: existing.currentRevision.revisionNumber, readiness: existing.currentSnapshot.readiness, idempotentReplay: true });
    }
    const result = await createBrief(env, body.requirement, body.entryContext, operator ? "anonymous_operator" : "anonymous_public");
    await recordCreationRequest(env, requestId, result.brief.publicId);
    const briefUrl = operator ? `/operator/location-brief-v2/${result.brief.publicId}` : `/location-brief/${result.brief.publicId}`;
    return privateJson({ ok: true, publicId: result.brief.publicId, briefUrl, revisionNumber: 1, readiness: result.snapshot.readiness }, 201, { "set-cookie": result.setCookie });
  } catch (error) { return privateJson({ ok: false, error: "Your Location Brief could not be saved. Your answers remain on this page so you can retry." }, 503); }
}
