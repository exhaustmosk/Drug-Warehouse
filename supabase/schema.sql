create extension if not exists "pgcrypto";

create table if not exists public.inventory_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
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

create table if not exists public.operations (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade,
  type text not null,
  description text not null,
  priority text not null default 'Medium',
  status text not null default 'Pending',
  assigned_to text,
  scheduled_date date,
  created_at timestamptz not null default now()
);

create table if not exists public.warehouse_zones (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
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

create table if not exists public.facility_alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  message text not null,
  severity text default 'Warning',
  created_at timestamptz not null default now()
);

create table if not exists public.compliance_checks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  title text not null,
  severity text not null default 'Compliant',
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  status text not null default 'Generated',
  created_at timestamptz not null default now()
);

create table if not exists public.app_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  low_stock_threshold integer default 25,
  temperature_alert_threshold integer default 8,
  updated_at timestamptz not null default now()
);

alter table public.profiles add column if not exists onboarding_completed boolean default false;
alter table public.profiles add column if not exists full_name text;
alter table public.profiles add column if not exists job_title text;
alter table public.profiles add column if not exists phone_number text;
alter table public.profiles add column if not exists warehouse_name text;
alter table public.profiles add column if not exists warehouse_location text;
alter table public.profiles add column if not exists warehouse_area text;
alter table public.profiles add column if not exists warehouse_type text;
alter table public.profiles add column if not exists license_number text;
alter table public.profiles add column if not exists updated_at timestamptz default now();

-- Existing projects may already have these tables without user_id.
-- Add the ownership column in-place before creating policies.
alter table public.inventory_items add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.operations add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.warehouse_zones add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.facility_alerts add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.compliance_checks add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.reports add column if not exists user_id uuid references auth.users(id) on delete cascade;

-- Backfill old rows to the first profile owner so legacy rows remain visible.
-- If profiles is empty, rows remain null until next write from frontend.
update public.inventory_items
set user_id = (select id from public.profiles order by created_at asc limit 1)
where user_id is null;

update public.operations
set user_id = (select id from public.profiles order by created_at asc limit 1)
where user_id is null;

update public.warehouse_zones
set user_id = (select id from public.profiles order by created_at asc limit 1)
where user_id is null;

update public.facility_alerts
set user_id = (select id from public.profiles order by created_at asc limit 1)
where user_id is null;

update public.compliance_checks
set user_id = (select id from public.profiles order by created_at asc limit 1)
where user_id is null;

update public.reports
set user_id = (select id from public.profiles order by created_at asc limit 1)
where user_id is null;

-- Optional defaults so inserts can work even if frontend omits user_id.
alter table public.inventory_items alter column user_id set default auth.uid();
alter table public.operations alter column user_id set default auth.uid();
alter table public.warehouse_zones alter column user_id set default auth.uid();
alter table public.facility_alerts alter column user_id set default auth.uid();
alter table public.compliance_checks alter column user_id set default auth.uid();
alter table public.reports alter column user_id set default auth.uid();

alter table public.inventory_items enable row level security;
alter table public.operations enable row level security;
alter table public.warehouse_zones enable row level security;
alter table public.facility_alerts enable row level security;
alter table public.compliance_checks enable row level security;
alter table public.reports enable row level security;
alter table public.app_settings enable row level security;

drop policy if exists "inventory owned rows" on public.inventory_items;
create policy "inventory owned rows" on public.inventory_items
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "operations owned rows" on public.operations;
create policy "operations owned rows" on public.operations
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "zones owned rows" on public.warehouse_zones;
create policy "zones owned rows" on public.warehouse_zones
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "alerts owned rows" on public.facility_alerts;
create policy "alerts owned rows" on public.facility_alerts
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "checks owned rows" on public.compliance_checks;
create policy "checks owned rows" on public.compliance_checks
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "reports owned rows" on public.reports;
create policy "reports owned rows" on public.reports
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "settings owned rows" on public.app_settings;
create policy "settings owned rows" on public.app_settings
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Account roles (admin vs employee) and directory email
alter table public.profiles add column if not exists role text not null default 'employee';
alter table public.profiles add column if not exists email text;

-- Helper for RLS: avoids recursive policy checks on profiles
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

grant execute on function public.is_admin() to authenticated;

-- Admins can list all profiles for the Employees directory (additive with your existing "own row" policy)
drop policy if exists "profiles admin directory read" on public.profiles;
create policy "profiles admin directory read" on public.profiles
for select to authenticated
using (public.is_admin());

-- For a full reset use one script: `supabase/schema_final.sql` (replaces splitting schema + multitenant).
