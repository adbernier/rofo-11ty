const SEARCH_PROFILE_EVENT_INDEXES = [
  "create index if not exists idx_search_profile_events_created_at on search_profile_events(created_at)",
  "create index if not exists idx_search_profile_events_event_name on search_profile_events(event_name)",
  "create index if not exists idx_search_profile_events_page_type on search_profile_events(page_type)",
  "create index if not exists idx_search_profile_events_event_created on search_profile_events(event_name, created_at)",
  "create index if not exists idx_search_profile_events_created_event on search_profile_events(created_at, event_name)",
  "create index if not exists idx_search_profile_events_created_page_type on search_profile_events(created_at, page_type)",
  "create index if not exists idx_search_profile_events_page_type_created on search_profile_events(page_type, created_at)",
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
