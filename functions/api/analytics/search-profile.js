const ALLOWED_EVENTS = new Set([
  "search_profile_viewed",
  "search_profile_started",
  "location_completed",
  "space_type_completed",
  "timing_completed",
  "size_completed",
  "features_completed",
  "contact_completed",
  "search_profile_submitted",
]);

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

async function ensureTable(db) {
  await db.prepare(`
    create table if not exists search_profile_events (
      id text primary key,
      event_name text not null,
      profile_version text,
      page_type text,
      page_url text,
      city text,
      district text,
      location_display text,
      device_type text,
      space_type text,
      step_name text,
      event_json text,
      created_at text not null
    )
  `).run();
  await db.prepare("create index if not exists idx_search_profile_events_created_at on search_profile_events(created_at)").run();
  await db.prepare("create index if not exists idx_search_profile_events_event_name on search_profile_events(event_name)").run();
  await db.prepare("create index if not exists idx_search_profile_events_page_type on search_profile_events(page_type)").run();
  await db.prepare("create index if not exists idx_search_profile_events_event_created on search_profile_events(event_name, created_at)").run();
  await db.prepare("create index if not exists idx_search_profile_events_created_page_type on search_profile_events(created_at, page_type)").run();
}

export async function onRequestPost({ request, env }) {
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

  const db = env.SEARCH_PROFILE_EVENTS_DB || env.LEADS_DB;
  if (!db) {
    return jsonResponse({ ok: true, stored: false, reason: "No analytics D1 binding configured" });
  }

  const now = new Date().toISOString();
  const id = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const context = body.context || {};
  const profile = body.profile || {};

  try {
    await ensureTable(db);
    await db.prepare(`
      insert into search_profile_events (
        id, event_name, profile_version, page_type, page_url, city, district,
        location_display, device_type, space_type, step_name, event_json, created_at
      ) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
      safeJson({
        event_name: eventName,
        profile_version: body.profile_version || profile.profile_version || "V1D",
        context,
        profile,
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
