import {
  canonicalizeBrief,
  generatePublicId,
  jsonResponse,
  locationIntentLabel,
  locationIntentSummary,
  locationSummary,
  publicBriefUrl,
  saveLocationBrief,
  scheduleLocationBriefIndexes,
  sendLiveMarketInvestigationConfirmationEmail,
  sendLocationBriefEmail,
  sizeSummary,
  spaceSummary,
  trackLocationBriefEvent,
} from "./_shared.js";
import {
  buildOfficeFinderPayload,
  randomHex,
  resolveLeadRoute,
  saveLead,
  sendApprovalEmail,
  sha256,
} from "../leads/_shared.js";
import {
  buildProjectSnapshotFromBrief,
  projectSnapshotTextLines,
} from "../../_shared/project-snapshot.js";

function clean(value, max = 500) {
  return String(value || "").trim().slice(0, max);
}

function stableJson(value) {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableJson(value[key])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

function isInvestigationInput(input) {
  return Boolean(input && input.liveMarketInvestigation && input.liveMarketInvestigation.investigationIntent === true);
}

function selectedBuildingKeys(investigation) {
  return Array.isArray(investigation.representativeBuildings)
    ? investigation.representativeBuildings
      .filter((building) => building && building.selected !== false)
      .map((building) => clean(building.buildingId || building.name, 180).toLowerCase())
      .filter(Boolean)
      .sort()
    : [];
}

function normalizedInvestigationFingerprint(input) {
  const investigation = input.liveMarketInvestigation || {};
  const requirements = investigation.confirmedRequirements || {};
  const scope = investigation.investigationScope || {};
  return stableJson({
    source: clean(investigation.investigationSource || investigation.source || "recommendation_representative_buildings", 120).toLowerCase(),
    city: clean(investigation.city, 140).toLowerCase(),
    state: clean(investigation.state, 20).toUpperCase(),
    districtId: clean(investigation.districtId || investigation.districtSlug, 180).toLowerCase(),
    districtName: clean(investigation.districtName || investigation.district, 180).toLowerCase(),
    buildings: selectedBuildingKeys(investigation),
    includeCompetitiveBuildings: investigation.includeCompetitiveBuildings !== false,
    scope: {
      currentAvailability: scope.currentAvailability === true,
      futureAvailability: scope.futureAvailability === true,
      comparableBuildings: scope.comparableBuildings === true,
      leasingActivity: scope.leasingActivity === true,
      marketInsight: scope.marketInsight === true,
      brokerGuidance: scope.brokerGuidance === true,
    },
    timing: clean(investigation.timing || requirements.timing, 80).toLowerCase(),
    brokerPreference: clean(investigation.brokerPreference || "research_first", 80).toLowerCase(),
    requirements: {
      spaceType: clean(requirements.spaceType, 120).toLowerCase(),
      targetSize: clean(requirements.targetSize, 120).toLowerCase(),
      locationIntent: clean(requirements.locationIntent, 120).toLowerCase(),
      priorities: Array.isArray(requirements.locationPriorities) ? requirements.locationPriorities.map((item) => clean(item, 120).toLowerCase()).sort() : [],
      knownConstraints: clean(requirements.knownConstraints, 1000).toLowerCase(),
    },
    notes: clean(investigation.additionalNotes, 2000).toLowerCase(),
    contactEmail: clean(input.contact && input.contact.email, 240).toLowerCase(),
  });
}

function idempotencyDb(env) {
  return env.LOCATION_BRIEFS_DB || env.LEADS_DB || null;
}

function idempotencyKv(env) {
  return env.LOCATION_BRIEFS_KV || env.LEADS_KV || null;
}

async function ensureIdempotencyTable(db) {
  await db.prepare(`
    create table if not exists location_brief_idempotency (
      idempotency_key text primary key,
      request_fingerprint text,
      status text not null,
      public_id text,
      brief_id text,
      response_json text,
      duplicate_count integer not null default 0,
      confirmation_email_status text,
      confirmation_email_sent_at text,
      confirmation_email_error text,
      created_at text not null,
      updated_at text not null,
      latest_retry_at text
    )
  `).run();
}

async function reserveInvestigationIdempotency(env, request, input) {
  if (!isInvestigationInput(input)) return null;
  const token = clean(input.liveMarketInvestigation.submissionToken, 160);
  if (!/^[a-zA-Z0-9._:-]{12,180}$/.test(token)) {
    return { error: "Invalid Live Market Investigation submission token" };
  }
  const fingerprint = normalizedInvestigationFingerprint(input);
  const key = await sha256(`live-market-investigation:v1:${token}:${fingerprint}`);
  const publicId = input.publicId || generatePublicId();
  const now = new Date().toISOString();
  const db = idempotencyDb(env);
  if (db) {
    await ensureIdempotencyTable(db);
    try {
      await db.prepare(`
        insert into location_brief_idempotency (
          idempotency_key, request_fingerprint, status, public_id, created_at, updated_at
        ) values (?, ?, ?, ?, ?, ?)
      `).bind(key, fingerprint, "processing", publicId, now, now).run();
      return { key, keyHash: key, fingerprint, publicId, duplicate: false, storage: "d1" };
    } catch (error) {
      const row = await db.prepare("select * from location_brief_idempotency where idempotency_key = ?").bind(key).first();
      if (!row) throw error;
      await db.prepare(`
        update location_brief_idempotency
        set duplicate_count = duplicate_count + 1, latest_retry_at = ?, updated_at = ?
        where idempotency_key = ?
      `).bind(now, now, key).run();
      const response = row.response_json ? JSON.parse(row.response_json) : null;
      return {
        key,
        keyHash: key,
        fingerprint,
        publicId: row.public_id || publicId,
        duplicate: true,
        status: row.status,
        response,
        storage: "d1",
      };
    }
  }

  const kv = idempotencyKv(env);
  if (kv) {
    const existing = await kv.get(`location-brief-idempotency:${key}`, "json");
    if (existing) {
      const updated = {
        ...existing,
        duplicateCount: Number(existing.duplicateCount || 0) + 1,
        latestRetryAt: now,
        updatedAt: now,
      };
      await kv.put(`location-brief-idempotency:${key}`, JSON.stringify(updated));
      return {
        key,
        keyHash: key,
        fingerprint,
        publicId: existing.publicId || publicId,
        duplicate: true,
        status: existing.status,
        response: existing.response || null,
        storage: "kv",
      };
    }
    await kv.put(`location-brief-idempotency:${key}`, JSON.stringify({
      requestFingerprint: fingerprint,
      status: "processing",
      publicId,
      duplicateCount: 0,
      createdAt: now,
      updatedAt: now,
    }));
    return { key, keyHash: key, fingerprint, publicId, duplicate: false, storage: "kv" };
  }

  return { key, keyHash: key, fingerprint, publicId, duplicate: false, storage: "" };
}

async function completeInvestigationIdempotency(env, reservation, brief, response, confirmationEmail) {
  if (!reservation || reservation.error || !reservation.key) return;
  const now = new Date().toISOString();
  const db = idempotencyDb(env);
  if (reservation.storage === "d1" && db) {
    await ensureIdempotencyTable(db);
    await db.prepare(`
      update location_brief_idempotency
      set status = ?, public_id = ?, brief_id = ?, response_json = ?, confirmation_email_status = ?, confirmation_email_sent_at = ?, confirmation_email_error = ?, updated_at = ?
      where idempotency_key = ?
    `).bind(
      "received",
      brief.publicId,
      brief.id,
      JSON.stringify(response),
      confirmationEmail && confirmationEmail.status || "",
      confirmationEmail && confirmationEmail.sentAt || "",
      confirmationEmail && confirmationEmail.reason || "",
      now,
      reservation.key,
    ).run();
    return;
  }
  const kv = idempotencyKv(env);
  if (reservation.storage === "kv" && kv) {
    const current = await kv.get(`location-brief-idempotency:${reservation.key}`, "json") || {};
    await kv.put(`location-brief-idempotency:${reservation.key}`, JSON.stringify({
      ...current,
      status: "received",
      publicId: brief.publicId,
      briefId: brief.id,
      response,
      confirmationEmailStatus: confirmationEmail && confirmationEmail.status || "",
      confirmationEmailSentAt: confirmationEmail && confirmationEmail.sentAt || "",
      confirmationEmailError: confirmationEmail && confirmationEmail.reason || "",
      updatedAt: now,
    }));
  }
}

async function releaseInvestigationIdempotency(env, reservation) {
  if (!reservation || reservation.error || !reservation.key) return;
  const db = idempotencyDb(env);
  if (reservation.storage === "d1" && db) {
    await ensureIdempotencyTable(db);
    await db.prepare("delete from location_brief_idempotency where idempotency_key = ? and status = ?").bind(reservation.key, "processing").run();
    return;
  }
  const kv = idempotencyKv(env);
  if (reservation.storage === "kv" && kv) {
    const current = await kv.get(`location-brief-idempotency:${reservation.key}`, "json");
    if (current && current.status === "processing") {
      await kv.delete(`location-brief-idempotency:${reservation.key}`);
    }
  }
}

async function readJson(request) {
  try {
    return await request.json();
  } catch (error) {
    return null;
  }
}

function hasRequiredContact(brief) {
  return Boolean(brief.contact && brief.contact.name && brief.contact.email);
}

function firstLocation(brief) {
  const locations = brief.searchProfile && Array.isArray(brief.searchProfile.locations)
    ? brief.searchProfile.locations
    : [];
  return locations[0] || {};
}

function recommendedMarketPathSummary(brief) {
  const path = brief.marketPath && Array.isArray(brief.marketPath.recommendedPath)
    ? brief.marketPath.recommendedPath
    : [];
  const compareWith = brief.marketPath && Array.isArray(brief.marketPath.compareWith)
    ? brief.marketPath.compareWith
    : [];
  const labels = [];
  for (const item of [...path, ...compareWith]) {
    if (item && item.label && !labels.includes(item.label)) labels.push(item.label);
  }
  return labels.join(" / ");
}

function logPipelineStep(step, details = {}) {
  console.log("[location-brief-pipeline]", JSON.stringify({
    step,
    ...details,
  }));
}

function investigationScopeSummary(investigation) {
  const scope = investigation && investigation.investigationScope || {};
  const labels = {
    currentAvailability: "Current availability",
    futureAvailability: "Future or upcoming availability",
    comparableBuildings: "Comparable buildings",
    leasingActivity: "Recent leasing activity or comps",
    marketInsight: "Market conditions and tenant considerations",
    brokerGuidance: "Broker guidance when available",
  };
  return Object.keys(labels).filter((key) => scope[key]).map((key) => labels[key]).join(", ");
}

function selectedInvestigationBuildings(investigation) {
  return investigation && Array.isArray(investigation.representativeBuildings)
    ? investigation.representativeBuildings.filter((building) => building && building.selected !== false)
    : [];
}

function investigationRequirementsSummary(investigation) {
  if (!investigation || !investigation.investigationIntent) return "";
  const selectedBuildings = selectedInvestigationBuildings(investigation);
  const requirements = investigation.confirmedRequirements || {};
  return [
    "Live Market Investigation requested",
    investigation.districtName ? `District: ${investigation.districtName}` : "",
    investigation.city ? `City: ${[investigation.city, investigation.state].filter(Boolean).join(", ")}` : "",
    selectedBuildings.length ? `Selected representative buildings: ${selectedBuildings.map((building) => building.name).join(", ")}` : "Selected representative buildings: district-level only",
    `Include competitive buildings: ${investigation.includeCompetitiveBuildings !== false ? "Yes" : "No"}`,
    investigationScopeSummary(investigation) ? `Investigation scope: ${investigationScopeSummary(investigation)}` : "",
    investigation.timing || requirements.timing ? `Timing: ${investigation.timing || requirements.timing}` : "",
    investigation.brokerPreference ? `Broker preference: ${investigation.brokerPreference}` : "",
    requirements.locationPriorities && requirements.locationPriorities.length ? `Profile priorities: ${requirements.locationPriorities.join(", ")}` : "",
    investigation.additionalNotes ? `Investigation notes: ${investigation.additionalNotes}` : "",
  ].filter(Boolean).join("\n");
}

function buildLocationBriefLead(brief, request, briefUrl) {
  const contact = brief.contact || {};
  const location = firstLocation(brief);
  const market = locationSummary(brief);
  const spaceType = spaceSummary(brief);
  const size = sizeSummary(brief);
  const recommendedMarketPath = recommendedMarketPathSummary(brief);
  const locationIntent = brief.searchProfile && brief.searchProfile.locationIntent || "compare";
  const priorities = Array.isArray(brief.priorities) ? brief.priorities.filter(Boolean) : [];
  const investigation = brief.liveMarketInvestigation;
  const investigationSummary = investigationRequirementsSummary(investigation);
  const requirements = [
    investigationSummary,
    brief.feedback ? `Feedback: ${brief.feedback}` : "",
    priorities.length ? `Business priorities: ${priorities.join(", ")}` : "",
    brief.notes ? `Notes: ${brief.notes}` : "",
  ].filter(Boolean).join("\n\n");
  const selectedBuildings = selectedInvestigationBuildings(investigation);
  const projectSnapshot = brief.projectSnapshot || buildProjectSnapshotFromBrief(brief);
  const snapshotLines = projectSnapshotTextLines(projectSnapshot);
  const businessProfile = brief.searchProfile || {};

  return {
    lead_type: investigation && investigation.investigationIntent ? "live_market_investigation" : "location_brief",
    profile_version: "location_brief_v1",
    name: contact.name || "",
    email: contact.email || "",
    phone: contact.phone || "",
    company: contact.company || "",
    city: location.city || (location.type === "city" ? location.label : ""),
    state: location.state || "",
    market,
    space_type: spaceType,
    requested_space_type: spaceType,
    space_needed: size,
    move_timing: brief.searchProfile && brief.searchProfile.timing || investigation && investigation.timing || "",
    requirements,
    page_type: "location_brief",
    page_url: briefUrl,
    rofo_source: "location_brief",
    source: "location_brief",
    location_display: market,
    location_city: location.city || "",
    location_district: location.type === "district" ? location.label : "",
    location_state: location.state || "",
    status: investigation && investigation.investigationIntent ? "market_investigation_requested" : "expert_review_requested",
    officefinder_status: "officefinder_not_attempted",
    location_intent: locationIntent,
    location_intent_label: locationIntentLabel(locationIntent),
    location_intent_summary: locationIntentSummary(locationIntent),
    location_brief_id: brief.id,
    location_brief_public_id: brief.publicId,
    location_brief_url: briefUrl,
    location_brief_status: brief.status,
    recommended_market_path: recommendedMarketPath,
    project_snapshot_json: JSON.stringify(projectSnapshot),
    project_snapshot_summary: snapshotLines.join("\n"),
    top_three_districts: (projectSnapshot.topDistricts || []).join(", "),
    location_profile_business_type: businessProfile.businessType || businessProfile.business_type || "",
    location_profile_operational_use: Array.isArray(businessProfile.operationalUse) ? businessProfile.operationalUse.join(", ") : "",
    location_profile_office_environment: businessProfile.officeEnvironment || businessProfile.office_environment || "",
    location_profile_commute_orientation: businessProfile.commuteOrientation || businessProfile.commute_orientation || "",
    location_profile_expected_growth: businessProfile.expectedGrowth || businessProfile.expected_growth || "",
    location_profile_institution_proximity: businessProfile.institutionProximity || businessProfile.institution_proximity || "",
    business_priorities: priorities.join(", "),
    investigation_requested: investigation && investigation.investigationIntent ? "yes" : "",
    investigation_status: investigation && investigation.investigationIntent ? investigation.investigationStatus || "requested" : "",
    investigation_source: investigation && investigation.investigationIntent ? investigation.investigationSource || investigation.source || "" : "",
    investigation_city: investigation && investigation.investigationIntent ? investigation.city || "" : "",
    investigation_district: investigation && investigation.investigationIntent ? investigation.districtName || "" : "",
    investigation_district_id: investigation && investigation.investigationIntent ? investigation.districtId || "" : "",
    investigation_buildings: selectedBuildings.map((building) => building.name).join(", "),
    investigation_building_urls: selectedBuildings.map((building) => building.url).join(", "),
    investigation_include_competitive_buildings: investigation && investigation.investigationIntent ? String(investigation.includeCompetitiveBuildings !== false) : "",
    investigation_scope: investigationScopeSummary(investigation),
    investigation_timing: investigation && investigation.investigationIntent ? investigation.timing || "" : "",
    investigation_broker_preference: investigation && investigation.investigationIntent ? investigation.brokerPreference || "" : "",
    investigation_notes: investigation && investigation.investigationIntent ? investigation.additionalNotes || "" : "",
    investigation_request_id: investigation && investigation.investigationIntent ? (investigation.idempotencyKeyHash || "").slice(0, 16) : "",
    investigation_idempotency_hash: investigation && investigation.investigationIntent ? (investigation.idempotencyKeyHash || "").slice(0, 24) : "",
    investigation_request_fingerprint: investigation && investigation.investigationIntent ? (investigation.requestFingerprint || "").slice(0, 24) : "",
    investigation_confirmation_email_status: investigation && investigation.investigationIntent && investigation.confirmationEmail ? investigation.confirmationEmail.status || "" : "",
    investigation_confirmation_email_sent_at: investigation && investigation.investigationIntent && investigation.confirmationEmail ? investigation.confirmationEmail.sentAt || "" : "",
    investigation_confirmation_email_error: investigation && investigation.investigationIntent && investigation.confirmationEmail ? investigation.confirmationEmail.error || "" : "",
    investigation_internal_email_status: investigation && investigation.investigationIntent && investigation.internalEmail ? investigation.internalEmail.status || "" : "",
    investigation_internal_email_error: investigation && investigation.investigationIntent && investigation.internalEmail ? investigation.internalEmail.error || "" : "",
    investigation_duplicate_retry_count: investigation && investigation.investigationIntent ? String(investigation.duplicateRetryCount || 0) : "",
    investigation_latest_retry_at: investigation && investigation.investigationIntent ? investigation.latestRetryAt || "" : "",
    location_brief_payload: JSON.stringify(brief),
    timestamp: brief.createdAt || new Date().toISOString(),
    user_agent: request.headers.get("user-agent") || "",
    ip_country: request.cf && request.cf.country || "",
    effective_space_type: spaceType,
  };
}

async function createLocationBriefLead(env, request, brief, briefUrl) {
  if (!env.LEADS_DB && !env.LEADS_KV) {
    return { stored: false, reason: "Lead dashboard storage is not configured." };
  }

  const id = crypto.randomUUID ? crypto.randomUUID() : randomHex(16);
  const token = randomHex(32);
  const lead = buildLocationBriefLead(brief, request, briefUrl);
  const routeRecommendation = resolveLeadRoute(lead);
  lead.route_recommendation = routeRecommendation;
  lead.assigned_broker = routeRecommendation.broker_email
    ? routeRecommendation.broker_name
      ? `${routeRecommendation.broker_name} <${routeRecommendation.broker_email}>`
      : routeRecommendation.broker_email
    : "";
  lead.officefinder_status = "officefinder_pending_approval";
  const officefinderPayload = buildOfficeFinderPayload(lead, env);
  const record = {
    id,
    token_hash: await sha256(token),
    status: "pending",
    lead,
    officefinder_payload: officefinderPayload,
  };

  const storage = await saveLead(env, record);
  return {
    stored: true,
    id,
    token,
    status: record.status,
    storage,
    routeRecommendation,
    officefinderStatus: lead.officefinder_status,
    record,
  };
}

async function createCanonicalBrief(env, request, input) {
  let lastError = null;

  for (let attempt = 0; attempt < 4; attempt += 1) {
    const brief = canonicalizeBrief({
      ...input,
      publicId: attempt === 0 ? input.publicId : generatePublicId(),
    }, request);

    if (!hasRequiredContact(brief)) {
      return { brief, storage: "" };
    }

    try {
      const storage = await saveLocationBrief(env, brief);
      return { brief, storage };
    } catch (error) {
      lastError = error;
      if (!/unique|constraint|public_id/i.test(String(error && error.message || ""))) {
        throw error;
      }
    }
  }

  throw lastError || new Error("Unable to generate a unique Location Brief ID");
}

export async function onRequestPost({ request, env, waitUntil }) {
  const input = await readJson(request);
  if (!input || typeof input !== "object") {
    return jsonResponse({ ok: false, error: "Invalid Location Brief payload" }, 400);
  }
  const inputContact = input.contact && typeof input.contact === "object" ? input.contact : {};
  const missingContact = [
    clean(inputContact.name) ? "" : "name",
    clean(inputContact.email) ? "" : "email",
  ].filter(Boolean);
  if (missingContact.length) {
    return jsonResponse({
      ok: false,
      error: "Missing required contact fields",
      missing: missingContact,
    }, 400);
  }

  let idempotency = null;
  try {
    idempotency = await reserveInvestigationIdempotency(env, request, input);
  } catch (error) {
    return jsonResponse({
      ok: false,
      error: "Live Market Investigation idempotency check failed",
      message: error.message,
    }, 500);
  }
  if (idempotency && idempotency.error) {
    return jsonResponse({ ok: false, error: idempotency.error }, 400);
  }
  if (idempotency && idempotency.duplicate) {
    if (idempotency.response) {
      return jsonResponse({
        ...idempotency.response,
        ok: true,
        duplicate: true,
        duplicateResolved: true,
        idempotencyStatus: "duplicate_resolved",
      });
    }
    const url = publicBriefUrl(request, idempotency.publicId);
    return jsonResponse({
      ok: true,
      duplicate: true,
      duplicateResolved: true,
      idempotencyStatus: idempotency.status || "processing",
      publicId: idempotency.publicId,
      url,
      status: "received",
      message: "The original market investigation request is already being processed.",
    }, 202);
  }

  if (idempotency && input.liveMarketInvestigation) {
    input.publicId = idempotency.publicId;
    input.liveMarketInvestigation.idempotencyKeyHash = idempotency.keyHash;
    input.liveMarketInvestigation.requestFingerprint = idempotency.fingerprint;
  }

  let result;
  try {
    result = await createCanonicalBrief(env, request, input);
  } catch (error) {
    await releaseInvestigationIdempotency(env, idempotency);
    return jsonResponse({
      ok: false,
      error: "Location Brief could not be stored",
      message: error.message,
    }, 500);
  }

  const { brief, storage } = result;
  if (!hasRequiredContact(brief)) {
    await releaseInvestigationIdempotency(env, idempotency);
    return jsonResponse({
      ok: false,
      error: "Missing required contact fields",
      missing: [
        brief.contact && brief.contact.name ? "" : "name",
        brief.contact && brief.contact.email ? "" : "email",
      ].filter(Boolean),
    }, 400);
  }

  const url = publicBriefUrl(request, brief.publicId);
  scheduleLocationBriefIndexes(waitUntil, env.LOCATION_BRIEFS_DB || env.LEADS_DB);
  const isInvestigation = Boolean(brief.liveMarketInvestigation && brief.liveMarketInvestigation.investigationIntent);

  const eventPayload = {
    source: "recommendations",
    profile_version: "location_brief_v1",
    location: (brief.searchProfile.locations || []).map((item) => item.label).join(" / "),
    spaceType: brief.searchProfile.spaceType,
    size: brief.searchProfile.size,
    timing: brief.searchProfile.timing || "",
    locationIntent: brief.searchProfile.locationIntent || "compare",
    investigationIntent: Boolean(brief.liveMarketInvestigation && brief.liveMarketInvestigation.investigationIntent),
    investigationDistrict: brief.liveMarketInvestigation && brief.liveMarketInvestigation.districtName || "",
  };

  try {
    logPipelineStep("brief_created", {
      briefId: brief.id,
      publicId: brief.publicId,
      briefUrl: url,
      storage,
    });
    await trackLocationBriefEvent(env, "location_brief_created", brief, eventPayload);
    await trackLocationBriefEvent(env, "expert_review_requested", brief, eventPayload);
    await trackLocationBriefEvent(env, "location_brief_submitted", brief, eventPayload);
    if (brief.liveMarketInvestigation && brief.liveMarketInvestigation.investigationIntent) {
      await trackLocationBriefEvent(env, "live_market_investigation_requested", brief, eventPayload);
    }
  } catch (error) {
    console.warn("Unable to store Location Brief analytics events", error);
  }

  let lead = { stored: false, reason: "Not attempted" };
  let email = { sent: false, reason: "Not attempted" };
  let confirmationEmail = { sent: false, status: isInvestigation ? "not_attempted" : "not_applicable", reason: isInvestigation ? "Not attempted" : "Not a Live Market Investigation request" };

  if (isInvestigation) {
    try {
      confirmationEmail = await sendLiveMarketInvestigationConfirmationEmail(env, request, brief);
    } catch (error) {
      confirmationEmail = { sent: false, status: "failed", reason: error.message };
    }
    brief.liveMarketInvestigation = {
      ...brief.liveMarketInvestigation,
      investigationStatus: "received",
      confirmationEmail: {
        status: confirmationEmail.status || (confirmationEmail.sent ? "sent" : "not_sent"),
        sent: confirmationEmail.sent === true,
        sentAt: confirmationEmail.sentAt || "",
        error: confirmationEmail.sent ? "" : confirmationEmail.reason || "",
      },
      internalEmail: {
        status: email.sent ? "sent" : "failed",
        sent: email.sent === true,
        error: email.sent ? "" : email.reason || "",
      },
    };
  }

  try {
    lead = await createLocationBriefLead(env, request, brief, url);
    logPipelineStep("lead_created", {
      leadId: lead.id,
      briefId: brief.id,
      publicId: brief.publicId,
      routeTo: lead.routeRecommendation && lead.routeRecommendation.route_to || "",
      assignedBroker: lead.routeRecommendation && lead.routeRecommendation.broker_email || "",
      officefinderStatus: lead.officefinderStatus || "",
    });
  } catch (error) {
    lead = { stored: false, reason: error.message };
    console.warn("Unable to create Location Brief lead dashboard record", error);
  }

  if (lead && lead.stored && lead.record && lead.token) {
    try {
      email = await sendApprovalEmail(env, request, lead.record, lead.token);
      logPipelineStep("internal_notification", {
        leadId: lead.id,
        briefId: brief.id,
        sent: email.sent === true,
        reason: email.reason || "",
      });
    } catch (error) {
      email = { sent: false, reason: error.message };
      console.warn("Unable to send Location Brief approval notification", error);
    }
  } else {
    try {
      email = await sendLocationBriefEmail(env, request, brief);
      logPipelineStep("internal_notification_fallback", {
        briefId: brief.id,
        sent: email.sent === true,
        reason: email.reason || "",
      });
    } catch (error) {
      email = { sent: false, reason: error.message };
    }
  }

  const leadResponse = lead && typeof lead === "object"
    ? {
      stored: lead.stored === true,
      id: lead.id || "",
      status: lead.status || "",
      storage: lead.storage || "",
      routeRecommendation: lead.routeRecommendation || null,
      officefinderStatus: lead.officefinderStatus || "",
      reason: lead.reason || "",
    }
    : lead;

  const responsePayload = {
    ok: true,
    id: brief.id,
    publicId: brief.publicId,
    status: isInvestigation ? "received" : brief.status,
    url,
    storage,
    lead: leadResponse,
    email,
    confirmationEmail,
    duplicate: false,
    idempotencyStatus: isInvestigation ? "received" : "",
  };

  await completeInvestigationIdempotency(env, idempotency, brief, responsePayload, confirmationEmail);

  return jsonResponse(responsePayload);
}

export async function onRequestGet() {
  return jsonResponse({
    ok: true,
    endpoint: "/api/location-brief/submit",
    method: "POST",
  });
}
