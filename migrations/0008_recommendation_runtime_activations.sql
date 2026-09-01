create table if not exists recommendation_runtime_activations (
  activation_key text primary key,
  market_id text not null,
  property_type text not null,
  cohort text not null,
  enabled integer not null check (enabled in (0, 1)),
  certification_id text not null,
  updated_at text not null,
  updated_by text not null
);

insert into recommendation_runtime_activations (
  activation_key,
  market_id,
  property_type,
  cohort,
  enabled,
  certification_id,
  updated_at,
  updated_by
) values (
  'san-diego:industrial_flex:bounded',
  'san-diego',
  'industrial_flex',
  'bounded',
  1,
  'san-diego-industrial-flex-v1',
  '2026-09-01T00:00:00.000Z',
  'migration:0008'
) on conflict (activation_key) do nothing;
