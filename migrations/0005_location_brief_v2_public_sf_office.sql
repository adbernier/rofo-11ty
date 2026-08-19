-- Public SF Office vNext support. Existing v1 and v2 records are untouched.
create table if not exists location_brief_v2_intelligence_gaps (
  id text primary key,
  brief_id text not null,
  requirement_revision_id text not null,
  recommendation_snapshot_id text not null,
  market_id text not null,
  property_type text not null,
  district_id text not null,
  intelligence_dimension text not null,
  requirement_signal text,
  materiality text,
  blocking_status text,
  reason text,
  observed_at text not null
);
create index if not exists idx_location_brief_v2_gaps_brief on location_brief_v2_intelligence_gaps(brief_id, observed_at);
create index if not exists idx_location_brief_v2_gaps_market on location_brief_v2_intelligence_gaps(market_id, property_type, district_id, intelligence_dimension);
create table if not exists location_brief_v2_creation_requests (
  request_id text primary key,
  public_id text not null,
  created_at text not null
);
