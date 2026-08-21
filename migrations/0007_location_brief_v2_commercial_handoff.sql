create table if not exists location_brief_v2_commercial_requests (
  brief_id text not null,
  property_draft_revision integer not null,
  request_hash text not null,
  lead_id text not null,
  status text not null,
  created_at text not null,
  updated_at text not null,
  primary key (brief_id, property_draft_revision)
);
