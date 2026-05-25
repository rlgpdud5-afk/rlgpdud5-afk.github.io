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

create index if not exists idx_gigs_status on gigs(status);
create index if not exists idx_gigs_region on gigs(region);
create index if not exists idx_gigs_tags on gigs using gin(role_tags);
create index if not exists idx_workers_tags on workers using gin(role_tags);
create index if not exists idx_applications_gig on applications(gig_id);
create index if not exists idx_applications_worker on applications(worker_id);

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

-- DEMO ONLY: public read/write. Lock down when Supabase Auth is added.
drop policy if exists "demo_workers_all" on workers;
create policy "demo_workers_all" on workers for all using (true) with check (true);

drop policy if exists "demo_gigs_all" on gigs;
create policy "demo_gigs_all" on gigs for all using (true) with check (true);

drop policy if exists "demo_applications_all" on applications;
create policy "demo_applications_all" on applications for all using (true) with check (true);
