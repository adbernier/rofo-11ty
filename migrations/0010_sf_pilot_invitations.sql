-- Explicit mailbox invitations. Existing unenrolled/legacy searches fail closed.
create table if not exists sf_pilot_invitations (id text primary key,brief_id text not null,email text not null,verified_at integer,revoked_at integer,created_at integer not null);
create unique index if not exists sf_pilot_active_invitation on sf_pilot_invitations(brief_id) where revoked_at is null;
alter table sf_pilot_searches add column invitation_id text;
alter table sf_pilot_access add column invitation_id text;
