-- Roles for the single-login flow. Every auth user has one row here; the
-- app reads `role` right after sign-in to decide where to send them.
-- Run this in the Supabase SQL editor.

create table if not exists public.profiles (
  id    uuid primary key references auth.users (id) on delete cascade,
  email text,
  role  text not null default 'staff'
        check (role in ('admin', 'staff', 'partner', 'lead_manager')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Each user can read their own profile (so the app can detect their role).
create policy "read own profile"
  on public.profiles for select
  using (auth.uid() = id);

-- Auto-create a profile row when a new auth user is created.
-- The default role is 'staff'; change a user's role from the
-- Supabase Table editor (or with an admin-only update policy).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
