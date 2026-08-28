import {
  buildLeadPayload,
  buildOfficeFinderPayload,
  detectLeadSpam,
  getMissingSubmitFields,
  jsonResponse,
  logLeadToGoogleSheets,
  randomHex,
  readSubmittedFields,
  redirectResponse,
  resolveLeadRoute,
  saveLead,
  sendApprovalEmail,
  sendTenantConfirmationEmail,
  sha256,
  updateLeadStatus,
} from "./_shared.js";
import { commercialContextForBundle, getBriefBundle as getLocationBriefV2Bundle, ownsBrief as ownsLocationBriefV2 } from "../location-brief-v2/_shared.js";
import { businessPresentation, marketDisplayName } from "../../_shared/project-snapshot.js";

export async function onRequestPost({ request, env }) {
  let fields;

  try {
    fields = await readSubmittedFields(request);
  } catch (error) {
    return jsonResponse({ error: "Unable to parse submitted lead" }, 400);
  }

  const lead = buildLeadPayload(fields, request);
  if (/^LB2-[A-F0-9]{24}$/i.test(lead.location_brief_v2_public_id || "")) {
    try {
      const briefBundle = await getLocationBriefV2Bundle(env, lead.location_brief_v2_public_id, false);
      if (briefBundle && await ownsLocationBriefV2(request, briefBundle.brief)) {
        const context = commercialContextForBundle(briefBundle);
        const business = businessPresentation({ canonical: context.businessCategory, specific: context.businessUse, propertyType: context.propertyType });
        lead.location_brief_v2_context = context;
        lead.location_brief_v2_url = `${new URL(request.url).origin}/location-brief/${briefBundle.brief.publicId}`;
        lead.market = context.marketName || lead.market;
        lead.city = context.marketCity || lead.city;
        lead.state = context.marketState || lead.state;
        lead.location_display = marketDisplayName({ market: lead.market, city: lead.city, state: lead.state });
        lead.location_profile_business_type = business.canonicalBusinessType;
        lead.business_type = business.canonicalBusinessType;
        lead.location_profile_business_use = business.businessUse;
        lead.business_use = business.businessUse;
        lead.business_classification_status = business.classificationStatus;
        lead.requirements = [lead.requirements, "", "Rofo Location Brief v2", JSON.stringify(context, null, 2)].filter(Boolean).join("\n");
      }
    } catch (error) {
      console.warn("Unable to attach Location Brief v2 context to commercial request", error);
    }
  }
  const spam = detectLeadSpam(lead, fields);

  if (spam.isSpam) {
    const id = crypto.randomUUID ? crypto.randomUUID() : randomHex(16);
    const token = randomHex(32);
    lead.status = "spam_quarantined";
    lead.spam_score = spam.score;
    lead.spam_reasons = spam.reasons;
    lead.officefinder_status = "officefinder_not_attempted";

    const record = {
      id,
      token_hash: await sha256(token),
      status: "spam_quarantined",
      lead,
      officefinder_payload: {},
    };

    try {
      await saveLead(env, record);
    } catch (error) {
      console.warn("Unable to quarantine spam lead", error);
    }

    if ((request.headers.get("accept") || "").includes("application/json")) {
      return jsonResponse({ ok: true, status: "received" });
    }

    return redirectResponse("/thank-you/");
  }

  if (spam.isSuspicious) {
    lead.spam_score = spam.score;
    lead.spam_reasons = spam.reasons;
  }

  const missing = getMissingSubmitFields(lead);

  if (missing.length) {
    return jsonResponse({
      error: "Missing required lead fields",
      missing,
    }, 400);
  }

  const id = crypto.randomUUID ? crypto.randomUUID() : randomHex(16);
  const token = randomHex(32);
  const routeRecommendation = resolveLeadRoute(lead);
  lead.route_recommendation = routeRecommendation;
  const officefinderPayload = buildOfficeFinderPayload(lead, env);
  const record = {
    id,
    token_hash: await sha256(token),
    status: "pending",
    lead,
    officefinder_payload: officefinderPayload,
  };

  try {
    const storage = await saveLead(env, record);
    const sheets = await logLeadToGoogleSheets(env, record);
    const email = await sendApprovalEmail(env, request, record, token);
    let tenantConfirmation = { sent: false, skipped: true, reason: "Not attempted" };

    if (lead.lead_type === "location_profile") {
      try {
        tenantConfirmation = await sendTenantConfirmationEmail(env, record);
        const leadWithConfirmation = {
          ...lead,
          tenant_confirmation_sent_at: tenantConfirmation.sent ? tenantConfirmation.sent_at : lead.tenant_confirmation_sent_at,
          tenant_confirmation_error: tenantConfirmation.sent ? "" : tenantConfirmation.reason || "",
        };
        record.lead = leadWithConfirmation;
        await updateLeadStatus(env, id, {
          status: record.status,
          lead: leadWithConfirmation,
        });
      } catch (error) {
        tenantConfirmation = { sent: false, reason: error.message };
        const leadWithConfirmationError = {
          ...lead,
          tenant_confirmation_error: error.message,
        };
        record.lead = leadWithConfirmationError;
        await updateLeadStatus(env, id, {
          status: record.status,
          lead: leadWithConfirmationError,
        });
      }
    }

    if ((request.headers.get("accept") || "").includes("application/json")) {
      return jsonResponse({
        ok: true,
        id,
        status: "pending",
        storage,
        route_recommendation: routeRecommendation,
        sheets,
        notification: email,
        tenant_confirmation: tenantConfirmation,
      });
    }

    return redirectResponse("/thank-you/");
  } catch (error) {
    return jsonResponse({
      error: "Lead submission could not be stored",
      message: error.message,
    }, 500);
  }
}

export async function onRequestGet() {
  return jsonResponse({
    ok: true,
    endpoint: "/api/leads/submit",
    method: "POST",
  });
}
