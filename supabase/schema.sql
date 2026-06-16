-- ============================================================================
-- XPOD CRM — core schema (run in the Supabase SQL editor)
-- Additive: extends the existing `profiles` table, adds the CRM domain tables.
-- Safe to re-run (uses IF NOT EXISTS / IF EXISTS guards).
-- ============================================================================

-- ── profiles: extend existing table ────────────────────────────────────────
alter table public.profiles add column if not exists name   text;
alter table public.profiles add column if not exists phone  text;
alter table public.profiles add column if not exists active boolean not null default true;

-- Canonical role set: admin | salesman | lead_manager | partner
-- Migrate any legacy values before tightening the constraint.
update public.profiles set role = 'salesman' where role = 'staff';
alter table public.profiles alter column role set default 'salesman';
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles
  add constraint profiles_role_check
  check (role in ('admin', 'salesman', 'lead_manager', 'partner'));

-- ── helper: is the current auth user an admin? ─────────────────────────────
create or replace function public.is_admin()
returns boolean
language sql security definer stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ── partners ───────────────────────────────────────────────────────────────
create table if not exists public.partners (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  company         text,
  email           text,
  phone           text,
  location        text,
  royalty_percent numeric(5,2) not null default 0,
  status          text not null default 'active'
                  check (status in ('active', 'inactive')),
  profile_id      uuid references public.profiles (id) on delete set null,
  created_at      timestamptz not null default now()
);

-- Add newer partner columns (safe on existing installs)
alter table public.partners add column if not exists state        text;
alter table public.partners add column if not exists photo_url    text;
alter table public.partners add column if not exists partner_type text not null default 'Authorized Partner';

-- ── sales_team (salesmen) ───────────────────────────────────────────────────
create table if not exists public.sales_team (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text,
  phone       text,
  capacity    integer not null default 10,
  active      boolean not null default true,
  profile_id  uuid references public.profiles (id) on delete set null,
  created_at  timestamptz not null default now()
);

-- ── lead_managers ───────────────────────────────────────────────────────────
create table if not exists public.lead_managers (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text,
  phone       text,
  active      boolean not null default true,
  profile_id  uuid references public.profiles (id) on delete set null,
  created_at  timestamptz not null default now()
);

-- ── leads ───────────────────────────────────────────────────────────────────
-- Lead Pool   = status in ('new','pending_review') and assigned_to is null
-- Trash       = deleted_at is not null
create table if not exists public.leads (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  phone           text,
  email           text,
  source          text,
  status          text not null default 'new'
                  check (status in ('new','pending_review','assigned','converted','rejected')),
  value           numeric(12,2) not null default 0,
  partner_id      uuid references public.partners (id) on delete set null,
  assigned_to     uuid references public.sales_team (id) on delete set null,
  lead_manager_id uuid references public.lead_managers (id) on delete set null,
  notes           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  deleted_at      timestamptz
);

-- ── conversion_requests ─────────────────────────────────────────────────────
create table if not exists public.conversion_requests (
  id           uuid primary key default gen_random_uuid(),
  lead_id      uuid not null references public.leads (id) on delete cascade,
  requested_by uuid references public.profiles (id) on delete set null,
  status       text not null default 'pending'
               check (status in ('pending','approved','rejected')),
  amount       numeric(12,2) not null default 0,
  royalty      numeric(12,2) not null default 0,
  note         text,
  created_at   timestamptz not null default now(),
  decided_at   timestamptz,
  decided_by   uuid references public.profiles (id) on delete set null
);

-- ── Row Level Security: admins get full access to every CRM table ───────────
do $$
declare t text;
begin
  foreach t in array array[
    'partners','sales_team','lead_managers','leads','conversion_requests'
  ]
  loop
    execute format('alter table public.%I enable row level security;', t);
    execute format('drop policy if exists "admin full access" on public.%I;', t);
    execute format($f$
      create policy "admin full access" on public.%I
      for all using (public.is_admin()) with check (public.is_admin());
    $f$, t);
  end loop;
end $$;

-- Helpful indexes
create index if not exists leads_status_idx       on public.leads (status);
create index if not exists leads_assigned_idx     on public.leads (assigned_to);
create index if not exists leads_deleted_idx      on public.leads (deleted_at);
create index if not exists conv_req_status_idx    on public.conversion_requests (status);

-- ── Auto-profile: read name + role from signUp metadata ─────────────────────
-- When the admin creates a partner via signUp(..., { data: { name, role } }),
-- this security-definer trigger writes those into profiles (bypassing RLS).
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, name, role)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'name',
    coalesce(new.raw_user_meta_data->>'role', 'salesman')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── Storage bucket for partner photos ───────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('partner-photos', 'partner-photos', true)
on conflict (id) do nothing;

drop policy if exists "partner photos public read" on storage.objects;
create policy "partner photos public read" on storage.objects
  for select using (bucket_id = 'partner-photos');

drop policy if exists "partner photos auth write" on storage.objects;
create policy "partner photos auth write" on storage.objects
  for insert to authenticated with check (bucket_id = 'partner-photos');

drop policy if exists "partner photos auth update" on storage.objects;
create policy "partner photos auth update" on storage.objects
  for update to authenticated using (bucket_id = 'partner-photos');
