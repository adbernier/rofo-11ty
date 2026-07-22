create table if not exists field_photos (
  id text primary key,
  subject_type text not null check (subject_type in ('city', 'district', 'building')),
  subject_id text not null,
  subject_name text not null,
  market_id text,
  image_role text not null default 'hero',
  image_type text not null,
  status text not null check (status in ('draft', 'published', 'archived')),
  public_url text not null,
  thumbnail_url text not null,
  storage_key text not null,
  thumbnail_storage_key text not null,
  width integer not null,
  height integer not null,
  file_size integer not null,
  mime_type text not null,
  caption text not null,
  alt_text text not null,
  source_type text not null default 'rofo_original',
  rights_status text not null default 'owned',
  photographer text not null,
  attribution text not null default 'Photo © Rofo',
  captured_at text,
  uploaded_at text not null,
  published_at text,
  archived_at text,
  superseded_by text,
  created_by text,
  updated_at text not null
);

create index if not exists idx_field_photos_subject
  on field_photos(subject_type, subject_id, image_role, status);

create index if not exists idx_field_photos_recent
  on field_photos(uploaded_at);

create index if not exists idx_field_photos_market
  on field_photos(market_id, status);
