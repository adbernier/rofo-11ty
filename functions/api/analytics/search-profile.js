import {
  ensureSearchProfileEventsTable,
  scheduleSearchProfileEventIndexes,
} from "../../_shared/search-profile-events.js";

const ALLOWED_EVENTS = new Set([
  "search_profile_viewed",
  "search_profile_started",
  "location_completed",
  "space_type_completed",
  "timing_completed",
  "size_completed",
  "features_completed",
  "contact_completed",
  "search_profile_mobile_entry_cta_clicked",
  "search_profile_find_matching_buildings_clicked",
  "search_profile_contact_screen_viewed",
  "search_profile_submitted",
  "find_locations_page_viewed",
  "find_locations_primary_cta_clicked",
]);

const BOT_USER_AGENT_PATTERN = /googlebot|bingbot|ahrefs|semrush|dotbot|mj12bot|petalbot|facebookexternalhit|twitterbot|slackbot|linkedinbot|yandex|baiduspider|duckduckbot|applebot|gptbot|chatgpt-user|ccbot|bot\b|crawler|spider/i;

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

function clean(value, max = 500) {
  return String(value || "").trim().slice(0, max);
}

function safeJson(value) {
  try {
    return JSON.stringify(value || {});
  } catch (error) {
    return "{}";
  }
}

function cleanInteger(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) return 0;
  return Math.floor(parsed);
}

function isBotUserAgent(userAgent) {
  return BOT_USER_AGENT_PATTERN.test(String(userAgent || ""));
}

export async function onRequestPost({ request, env, waitUntil }) {
  let body;
  try {
    body = await request.json();
  } catch (error) {
    return jsonResponse({ ok: false, error: "Invalid JSON" }, 400);
  }

  const eventName = clean(body.event_name, 80);
  if (!ALLOWED_EVENTS.has(eventName)) {
    return jsonResponse({ ok: false, error: "Unsupported event" }, 400);
  }

  if ((eventName === "search_profile_viewed" || eventName === "find_locations_page_viewed") && isBotUserAgent(request.headers.get("user-agent"))) {
    return jsonResponse({ ok: true, stored: false, reason: "Bot pageview ignored" });
  }

  const db = env.SEARCH_PROFILE_EVENTS_DB || env.LEADS_DB;
  if (!db) {
    return jsonResponse({ ok: true, stored: false, reason: "No analytics D1 binding configured" });
  }

  const now = new Date().toISOString();
  const id = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const context = body.context || {};
  const profile = body.profile || {};
  const attribution = body.attribution || {};
  const features = Array.isArray(profile.features)
    ? profile.features.map((item) => clean(item, 80)).filter(Boolean).join(", ")
    : clean(profile.features, 500);

  try {
    await ensureSearchProfileEventsTable(db);
    scheduleSearchProfileEventIndexes(waitUntil, db);
    await db.prepare(`
      insert into search_profile_events (
        id, event_name, profile_version, page_type, page_url, city, district,
        location_display, device_type, space_type, step_name,
        landing_page, referrer, entry_page_type, entry_city, entry_district,
        entry_comparison, entry_ecosystem, business_ecosystem, start_page_url,
        submit_page_url, previous_page_url, pages_viewed_before_start,
        comparison_pages_viewed, district_pages_viewed, building_pages_viewed,
        size_or_people, timing, features, features_count, duration_ms,
        event_json, created_at
      ) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      eventName,
      clean(body.profile_version || profile.profile_version || "V1D", 20),
      clean(context.page_type, 80),
      clean(context.page_url, 1000),
      clean(context.city, 120),
      clean(context.district, 160),
      clean(context.location_display, 240),
      clean(context.device_type, 20),
      clean(profile.space_type, 80),
      clean(body.step_name, 80),
      clean(attribution.landing_page, 1000),
      clean(attribution.referrer, 1000),
      clean(attribution.entry_page_type, 80),
      clean(attribution.entry_city, 120),
      clean(attribution.entry_district, 160),
      clean(attribution.entry_comparison, 240),
      clean(attribution.entry_ecosystem, 240),
      clean(context.business_ecosystem || attribution.business_ecosystem, 500),
      clean(attribution.start_page_url || attribution.page_where_started, 1000),
      clean(attribution.submit_page_url || attribution.page_where_submitted, 1000),
      clean(attribution.final_page_before_search_profile, 1000),
      cleanInteger(attribution.pages_viewed_before_start),
      cleanInteger(attribution.comparison_pages_viewed),
      cleanInteger(attribution.district_pages_viewed),
      cleanInteger(attribution.building_pages_viewed),
      clean(profile.size_or_people, 120),
      clean(profile.timing, 80),
      features,
      cleanInteger(profile.features_count),
      cleanInteger(attribution.duration_ms),
      safeJson({
        event_name: eventName,
        profile_version: body.profile_version || profile.profile_version || "V1D",
        context,
        profile,
        attribution,
        step_name: body.step_name || "",
      }),
      now,
    ).run();
  } catch (error) {
    console.warn("Unable to store Search Profile analytics event", error);
    return jsonResponse({ ok: true, stored: false, reason: "Analytics storage failed" });
  }

  return jsonResponse({ ok: true, stored: true });
}

export async function onRequestGet() {
  return jsonResponse({
    ok: true,
    endpoint: "/api/analytics/search-profile",
    method: "POST",
  });
}
