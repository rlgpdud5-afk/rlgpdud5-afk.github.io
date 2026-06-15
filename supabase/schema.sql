-- GigCareer role-matching MVP schema
-- Run in Supabase SQL Editor. Demo uses anon key + open RLS (replace with Auth in production).

create extension if not exists "pgcrypto";

create table if not exists workers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role_tags text[] not null default '{}',
  regions text[] not null default '{}',
  duration text default '2주',
  rating numeric(3,2) not null default 4.50 check (rating >= 0 and rating <= 5),
  completed_count int not null default 0,
  bio text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists gigs (
  id uuid primary key default gen_random_uuid(),
  employer text not null,
  title text not null,
  role_tags text[] not null default '{}',
  region text not null,
  duration text default '2주',
  pay text,
  jd_text text,
  status text not null default 'open' check (status in ('open','filled','closed')),
  employer_rating numeric(3,2) default 4.50,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists applications (
  id uuid primary key default gen_random_uuid(),
  gig_id uuid not null references gigs(id) on delete cascade,
  worker_id uuid not null references workers(id) on delete cascade,
  status text not null default 'applied' check (status in ('applied','accepted','rejected','completed')),
  match_score int not null default 0 check (match_score >= 0 and match_score <= 100),
  tailored_summary text,
  worker_review jsonb,
  employer_review jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (gig_id, worker_id)
);

-- Phase 1 seeds from the D-GIG architecture document.
-- Reviews feed the shared trust graph used later for LER issuance.
create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  subject_type text not null check (subject_type in ('gig_application','task')),
  subject_id uuid not null,
  reviewer_role text not null check (reviewer_role in ('worker','maker','reviewer','client','admin')),
  rating numeric(3,2) not null check (rating >= 0 and rating <= 5),
  comment text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists trust_events (
  id uuid primary key default gen_random_uuid(),
  subject_type text not null check (subject_type in ('profile','gig_application','task','credential')),
  subject_id uuid not null,
  delta numeric(5,2) not null default 0,
  reason text not null,
  ref_type text,
  ref_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists issued_credentials (
  id uuid primary key default gen_random_uuid(),
  source_type text not null check (source_type in ('gig','task')),
  source_id uuid not null,
  worker_did text,
  verify_id text not null unique,
  credential_data jsonb not null default '{}'::jsonb,
  content_hash text,
  skills jsonb not null default '[]'::jsonb,
  blockchain_tx text,
  status text not null default 'valid' check (status in ('draft','valid','revoked','expired')),
  issued_at timestamptz not null default now(),
  expires_at timestamptz
);

create table if not exists security_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  severity text not null check (severity in ('CRITICAL','HIGH','MEDIUM','LOW')),
  user_id uuid,
  ip text,
  location jsonb not null default '{}'::jsonb,
  device jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  response_status text not null default 'pending' check (response_status in ('pending','in_progress','resolved','ignored')),
  created_at timestamptz not null default now()
);

create index if not exists idx_gigs_status on gigs(status);
create index if not exists idx_gigs_region on gigs(region);
create index if not exists idx_gigs_tags on gigs using gin(role_tags);
create index if not exists idx_workers_tags on workers using gin(role_tags);
create index if not exists idx_applications_gig on applications(gig_id);
create index if not exists idx_applications_worker on applications(worker_id);
create index if not exists idx_reviews_subject on reviews(subject_type, subject_id);
create index if not exists idx_trust_events_subject on trust_events(subject_type, subject_id);
create index if not exists idx_credentials_verify_id on issued_credentials(verify_id);
create index if not exists idx_credentials_source on issued_credentials(source_type, source_id);
create index if not exists idx_security_events_severity_created on security_events(severity, created_at desc);

create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists workers_updated on workers;
create trigger workers_updated before update on workers
  for each row execute function set_updated_at();

drop trigger if exists gigs_updated on gigs;
create trigger gigs_updated before update on gigs
  for each row execute function set_updated_at();

drop trigger if exists applications_updated on applications;
create trigger applications_updated before update on applications
  for each row execute function set_updated_at();

alter table workers enable row level security;
alter table gigs enable row level security;
alter table applications enable row level security;
alter table reviews enable row level security;
alter table trust_events enable row level security;
alter table issued_credentials enable row level security;
alter table security_events enable row level security;

-- DEMO ONLY: public read/write. Lock down when Supabase Auth is added.
drop policy if exists "demo_workers_all" on workers;
create policy "demo_workers_all" on workers for all using (true) with check (true);

drop policy if exists "demo_gigs_all" on gigs;
create policy "demo_gigs_all" on gigs for all using (true) with check (true);

drop policy if exists "demo_applications_all" on applications;
create policy "demo_applications_all" on applications for all using (true) with check (true);

drop policy if exists "demo_reviews_all" on reviews;
create policy "demo_reviews_all" on reviews for all using (true) with check (true);

drop policy if exists "demo_trust_events_all" on trust_events;
create policy "demo_trust_events_all" on trust_events for all using (true) with check (true);

drop policy if exists "demo_issued_credentials_all" on issued_credentials;
create policy "demo_issued_credentials_all" on issued_credentials for all using (true) with check (true);

drop policy if exists "demo_security_events_all" on security_events;
create policy "demo_security_events_all" on security_events for all using (true) with check (true);

-- Enable Supabase Realtime manually after running this schema if needed:
-- alter publication supabase_realtime add table security_events;
