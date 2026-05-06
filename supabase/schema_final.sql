-- ============================================================================
-- DrugWare — ONE combined schema (reset + recreate)
-- ============================================================================
-- Run this in Supabase Dashboard → SQL Editor (as one script).
--
-- ⚠ WARNING: Deletes all application data in the listed public tables below.
--
-- What this replaces:
--   Do NOT rely on mixing old snippets (e.g. "Disable RLS…") with this script.
--   Either run ONLY this file on a reset database, OR fix RLS conflicts manually.
--
-- Email confirmation (“check your email”) is controlled in the Supabase Dashboard,
-- not here: Authentication → Providers → Email → toggle “Confirm email”.
--
-- If CREATE TRIGGER fails on “execute function”, replace with:
--   for each row execute procedure public.handle_new_user();
-- ============================================================================

create extension if not exists "pgcrypto";

-- -----------------------------------------------------------------------------
-- 1) Drop auth trigger (functions must stay until policies are gone — see below).
-- -----------------------------------------------------------------------------
drop trigger if exists on_auth_user_created on auth.users;

-- -----------------------------------------------------------------------------
-- 2) Drop tables first. CASCADE removes RLS policies that depend on
--    current_organization_id() / is_admin(); otherwise DROP FUNCTION fails (2BP01).
-- -----------------------------------------------------------------------------
drop table if exists public.reports cascade;
drop table if exists public.facility_alerts cascade;
drop table if exists public.compliance_checks cascade;
drop table if exists public.operations cascade;
drop table if exists public.inventory_items cascade;
drop table if exists public.warehouse_zones cascade;
drop table if exists public.app_settings cascade;
drop table if exists public.profiles cascade;
drop table if exists public.organizations cascade;

-- -----------------------------------------------------------------------------
-- 3) Drop helpers (safe after policies are gone)
-- -----------------------------------------------------------------------------
drop function if exists public.handle_new_user();

drop function if exists public.lookup_organization(text);
drop function if exists public.create_organization(text);
drop function if exists public.current_organization_id();
drop function if exists public.is_admin();

-- -----------------------------------------------------------------------------
-- organizations (tenant)
-- -----------------------------------------------------------------------------
create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  join_code text not null unique,
  created_at timestamptz not null default now()
);

create index organizations_join_code_normalized on public.organizations (upper(trim(join_code)));

-- -----------------------------------------------------------------------------
-- profiles (1:1 with auth.users — created by trigger + onboarding upsert)
-- -----------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  job_title text,
  phone_number text,
  warehouse_name text,
  warehouse_location text,
  warehouse_area text,
  warehouse_type text,
  license_number text,
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz default now(),
  role text not null default 'employee' check (role in ('admin', 'employee')),
  email text,
  organization_id uuid references public.organizations (id) on delete set null
);

create index profiles_organization_id_idx on public.profiles (organization_id);

-- -----------------------------------------------------------------------------
-- Tenant data tables (org-scoped + user attribution)
-- -----------------------------------------------------------------------------
create table public.inventory_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade default auth.uid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  drug_name text not null,
  generic_name text,
  batch text not null,
  quantity text not null,
  expiry_date date not null,
  storage_type text not null default 'Ambient',
  location text,
  status text not null default 'In Stock',
  created_at timestamptz not null default now()
);

create index inventory_items_organization_id_idx on public.inventory_items (organization_id);

-- App uses human-readable IDs like OP-2026-001 (must stay text PK)
create table public.operations (
  id text primary key,
  user_id uuid references auth.users (id) on delete cascade default auth.uid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  type text not null,
  description text not null,
  priority text not null default 'Medium',
  status text not null default 'Pending',
  assigned_to text,
  scheduled_date date,
  created_at timestamptz not null default now()
);

create index operations_organization_id_idx on public.operations (organization_id);

create table public.warehouse_zones (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade default auth.uid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  name text not null,
  type text,
  status text default 'Normal',
  area text,
  items_count integer default 0,
  capacity integer default 0,
  temperature text,
  humidity text,
  last_maintenance date,
  created_at timestamptz not null default now()
);

create index warehouse_zones_organization_id_idx on public.warehouse_zones (organization_id);

create table public.facility_alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade default auth.uid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  message text not null,
  severity text default 'Warning',
  created_at timestamptz not null default now()
);

create index facility_alerts_organization_id_idx on public.facility_alerts (organization_id);

create table public.compliance_checks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade default auth.uid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  title text not null,
  severity text not null default 'Compliant',
  notes text,
  created_at timestamptz not null default now()
);

create index compliance_checks_organization_id_idx on public.compliance_checks (organization_id);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade default auth.uid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  name text not null,
  status text not null default 'Ready',
  body_text text,
  created_at timestamptz not null default now()
);

create index reports_organization_id_idx on public.reports (organization_id);

-- One settings row per organization (matches frontend upsert/filter by organization_id)
create table public.app_settings (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  user_id uuid references auth.users (id) on delete set null,
  low_stock_threshold integer default 25,
  temperature_alert_threshold integer default 8,
  updated_at timestamptz not null default now(),
  constraint app_settings_organization_id_key unique (organization_id)
);

-- -----------------------------------------------------------------------------
-- Helpers (RLS-safe)
-- -----------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select p.role = 'admin' from public.profiles p where p.id = auth.uid()),
    false
  );
$$;

create or replace function public.current_organization_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select p.organization_id from public.profiles p where p.id = auth.uid();
$$;

create or replace function public.create_organization(org_name text)
returns table (id uuid, join_code text)
language plpgsql
security definer
set search_path = public
as $$
declare
  new_id uuid;
  new_code text;
  tries int := 0;
begin
  if trim(coalesce(org_name, '')) = '' then
    raise exception 'Organization name is required';
  end if;

  loop
    new_code := 'DW-' || upper(substring(replace(gen_random_uuid()::text || random()::text, '-', '') from 1 for 8));
    exit when not exists (select 1 from public.organizations o where o.join_code = new_code);
    tries := tries + 1;
    if tries > 30 then raise exception 'Could not generate join code'; end if;
  end loop;

  -- Use table alias so "id" does not clash with RETURNS TABLE output column name "id" (ambiguous otherwise).
  insert into public.organizations as ins (name, join_code)
  values (trim(org_name), new_code)
  returning ins.id into new_id;

  return query select new_id, new_code;
end;
$$;

-- Supabase RPC: first column name must match .rpc() / PostgREST (use join_code_input)
create or replace function public.lookup_organization(join_code_input text)
returns table (id uuid, name text)
language sql
stable
security definer
set search_path = public
as $$
  select o.id, o.name
  from public.organizations o
  where upper(trim(o.join_code)) = upper(trim(join_code_input));
$$;

-- -----------------------------------------------------------------------------
-- Auth: auto-create profiles row when a user signs up
-- Mirrors signup metadata role (admin | employee) into profiles.role when present.
-- -----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  r text;
begin
  r := coalesce(nullif(trim(new.raw_user_meta_data ->> 'role'), ''), 'employee');
  if r is distinct from 'admin' and r is distinct from 'employee' then
    r := 'employee';
  end if;

  insert into public.profiles (id, email, role)
  values (new.id, new.email, r)
  on conflict (id) do update set
    email = excluded.email,
    role = excluded.role,
    updated_at = now();

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- -----------------------------------------------------------------------------
-- Grants (authenticated API)
-- -----------------------------------------------------------------------------
grant usage on schema public to postgres, anon, authenticated, service_role;

grant select, insert, update, delete on all tables in schema public to postgres, service_role;

grant select, insert, update, delete on all tables in schema public to authenticated;

grant execute on function public.is_admin() to authenticated;
grant execute on function public.current_organization_id() to authenticated;
grant execute on function public.create_organization(text) to authenticated;
grant execute on function public.lookup_organization(text) to authenticated;

-- -----------------------------------------------------------------------------
-- Row Level Security
-- -----------------------------------------------------------------------------
alter table public.organizations enable row level security;
alter table public.profiles enable row level security;
alter table public.inventory_items enable row level security;
alter table public.operations enable row level security;
alter table public.warehouse_zones enable row level security;
alter table public.facility_alerts enable row level security;
alter table public.compliance_checks enable row level security;
alter table public.reports enable row level security;
alter table public.app_settings enable row level security;

-- Organizations: members see their tenant row only
create policy organizations_select_members on public.organizations
for select to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.organization_id = organizations.id
  )
);

-- Profiles
create policy profiles_select_self on public.profiles for select to authenticated
using (auth.uid() = id);

create policy profiles_insert_self on public.profiles for insert to authenticated
with check (auth.uid() = id);

create policy profiles_update_self on public.profiles for update to authenticated
using (auth.uid() = id);

create policy profiles_admin_org_directory on public.profiles for select to authenticated
using (
  public.is_admin()
  and public.current_organization_id() is not null
  and profiles.organization_id = public.current_organization_id()
);

-- inventory_items
create policy inventory_select_org on public.inventory_items for select to authenticated
using (
  organization_id is not null
  and organization_id = public.current_organization_id()
);

create policy inventory_insert_org on public.inventory_items for insert to authenticated
with check (
  organization_id = public.current_organization_id()
  and auth.uid() = user_id
);

create policy inventory_update_org on public.inventory_items for update to authenticated
using (organization_id = public.current_organization_id())
with check (organization_id = public.current_organization_id());

create policy inventory_delete_org on public.inventory_items for delete to authenticated
using (organization_id = public.current_organization_id());

-- operations
create policy operations_select_org on public.operations for select to authenticated
using (organization_id = public.current_organization_id());

create policy operations_insert_org on public.operations for insert to authenticated
with check (
  organization_id = public.current_organization_id()
  and auth.uid() = user_id
);

create policy operations_update_org on public.operations for update to authenticated
using (organization_id = public.current_organization_id())
with check (organization_id = public.current_organization_id());

create policy operations_delete_org on public.operations for delete to authenticated
using (organization_id = public.current_organization_id());

-- warehouse_zones
create policy zones_select_org on public.warehouse_zones for select to authenticated
using (organization_id = public.current_organization_id());

create policy zones_insert_org on public.warehouse_zones for insert to authenticated
with check (
  organization_id = public.current_organization_id()
  and auth.uid() = user_id
);

create policy zones_update_org on public.warehouse_zones for update to authenticated
using (organization_id = public.current_organization_id())
with check (organization_id = public.current_organization_id());

create policy zones_delete_org on public.warehouse_zones for delete to authenticated
using (organization_id = public.current_organization_id());

-- facility_alerts
create policy alerts_select_org on public.facility_alerts for select to authenticated
using (organization_id = public.current_organization_id());

create policy alerts_insert_org on public.facility_alerts for insert to authenticated
with check (
  organization_id = public.current_organization_id()
  and auth.uid() = user_id
);

create policy alerts_update_org on public.facility_alerts for update to authenticated
using (organization_id = public.current_organization_id())
with check (organization_id = public.current_organization_id());

create policy alerts_delete_org on public.facility_alerts for delete to authenticated
using (organization_id = public.current_organization_id());

-- compliance_checks
create policy checks_select_org on public.compliance_checks for select to authenticated
using (organization_id = public.current_organization_id());

create policy checks_insert_org on public.compliance_checks for insert to authenticated
with check (
  organization_id = public.current_organization_id()
  and auth.uid() = user_id
);

create policy checks_update_org on public.compliance_checks for update to authenticated
using (organization_id = public.current_organization_id())
with check (organization_id = public.current_organization_id());

create policy checks_delete_org on public.compliance_checks for delete to authenticated
using (organization_id = public.current_organization_id());

-- reports
create policy reports_select_org on public.reports for select to authenticated
using (organization_id = public.current_organization_id());

create policy reports_insert_org on public.reports for insert to authenticated
with check (
  organization_id = public.current_organization_id()
  and auth.uid() = user_id
);

create policy reports_update_org on public.reports for update to authenticated
using (organization_id = public.current_organization_id())
with check (organization_id = public.current_organization_id());

create policy reports_delete_org on public.reports for delete to authenticated
using (organization_id = public.current_organization_id());

-- app_settings
create policy settings_select_org on public.app_settings for select to authenticated
using (organization_id = public.current_organization_id());

create policy settings_insert_org on public.app_settings for insert to authenticated
with check (
  organization_id = public.current_organization_id()
  and auth.uid() = user_id
);

create policy settings_update_org on public.app_settings for update to authenticated
using (organization_id = public.current_organization_id())
with check (organization_id = public.current_organization_id());

create policy settings_delete_org on public.app_settings for delete to authenticated
using (organization_id = public.current_organization_id());
