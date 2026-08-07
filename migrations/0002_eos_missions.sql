create table if not exists eos_missions (
  id text primary key,
  sequence_number integer not null unique,
  display_id text not null unique,
  source_mission_id text not null,
  source text not null,
  type text not null,
  title text not null,
  objective text not null,
  status text not null check (status in ('active', 'completed')),
  started_at text not null,
  completed_at text,
  confidence text,
  estimated_effort text,
  expected_impact text,
  supporting_markets_json text not null default '[]',
  property_types_json text not null default '[]',
  themes_json text not null default '[]',
  evidence_snapshot_json text not null default '{}',
  knowledge_gap_snapshot_json text not null default '[]',
  work_packet_json text not null default '{}',
  baseline_search_snapshot_json text not null default '{}',
  task_status_json text not null default '{}',
  created_at text not null,
  updated_at text not null
);

create unique index if not exists idx_eos_missions_active_source
  on eos_missions(source, source_mission_id)
  where status = 'active';

create index if not exists idx_eos_missions_status_sequence
  on eos_missions(status, sequence_number desc);

create index if not exists idx_eos_missions_source
  on eos_missions(source, source_mission_id);
