-- Bounded vNext Location Brief -> Property Requirement continuation.
-- Location Requirement revisions and recommendation snapshots remain immutable.
create table if not exists location_brief_v2_property_requirement_drafts (
  brief_id text primary key,
  schema_version text not null,
  location_requirement_revision_id text not null,
  recommendation_snapshot_id text not null,
  draft_revision integer not null,
  answers_json text not null,
  created_at text not null,
  updated_at text not null
);
