const SEARCH_PROFILE_EVENT_INDEXES = [
  "create index if not exists idx_search_profile_events_created_at on search_profile_events(created_at)",
  "create index if not exists idx_search_profile_events_event_name on search_profile_events(event_name)",
  "create index if not exists idx_search_profile_events_page_type on search_profile_events(page_type)",
  "create index if not exists idx_search_profile_events_event_created on search_profile_events(event_name, created_at)",
  "create index if not exists idx_search_profile_events_created_event on search_profile_events(created_at, event_name)",
  "create index if not exists idx_search_profile_events_created_page_type on search_profile_events(created_at, page_type)",
  "create index if not exists idx_search_profile_events_page_type_created on search_profile_events(page_type, created_at)",
  "create index if not exists idx_search_profile_events_created_page_url on search_profile_events(created_at, page_url)",
  "create index if not exists idx_search_profile_events_created_city on search_profile_events(created_at, city)",
  "create index if not exists idx_search_profile_events_created_district on search_profile_events(created_at, district)",
  "create index if not exists idx_search_profile_events_created_space_type on search_profile_events(created_at, space_type)",
  "create index if not exists idx_search_profile_events_created_timing on search_profile_events(created_at, timing)",
];

const SEARCH_PROFILE_EVENT_COLUMNS = [
  ["landing_page", "text"],
  ["referrer", "text"],
  ["entry_page_type", "text"],
  ["entry_city", "text"],
  ["entry_district", "text"],
  ["entry_comparison", "text"],
  ["entry_ecosystem", "text"],
  ["business_ecosystem", "text"],
  ["start_page_url", "text"],
  ["submit_page_url", "text"],
  ["previous_page_url", "text"],
  ["pages_viewed_before_start", "integer"],
  ["comparison_pages_viewed", "integer"],
  ["district_pages_viewed", "integer"],
  ["building_pages_viewed", "integer"],
  ["size_or_people", "text"],
  ["timing", "text"],
  ["features", "text"],
  ["features_count", "integer"],
  ["duration_ms", "integer"],
];

export async function ensureSearchProfileEventsTable(db) {
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
  await ensureSearchProfileEventsColumns(db);
}

export async function ensureSearchProfileEventsColumns(db) {
  let existingColumns = new Set();
  try {
    const result = await db.prepare("pragma table_info(search_profile_events)").all();
    existingColumns = new Set((result.results || []).map((row) => row.name));
  } catch (error) {
    existingColumns = new Set();
  }

  for (const [name, type] of SEARCH_PROFILE_EVENT_COLUMNS) {
    if (existingColumns.has(name)) continue;
    try {
      await db.prepare(`alter table search_profile_events add column ${name} ${type}`).run();
    } catch (error) {
      if (!/duplicate column|already exists/i.test(String(error && error.message || ""))) {
        throw error;
      }
    }
  }
}

export async function ensureSearchProfileEventsIndexes(db) {
  for (const indexSql of SEARCH_PROFILE_EVENT_INDEXES) {
    await db.prepare(indexSql).run();
  }
}

export function scheduleSearchProfileEventIndexes(waitUntil, db) {
  if (!db || typeof waitUntil !== "function") return;
  waitUntil((async () => {
    try {
      await ensureSearchProfileEventsTable(db);
      await ensureSearchProfileEventsIndexes(db);
    } catch (error) {
      console.warn("Unable to ensure Search Profile analytics indexes", error);
    }
  })());
}
