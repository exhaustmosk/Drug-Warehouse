-- DrugWare multitenant migration (organizations + organization_id scoped RLS)
-- Apply after baseline schema.sql, or merge into one migration on a fresh DB.

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  join_code text not null unique,
  created_at timestamptz not null default now()
);

create index if not exists organizations_join_code_upper on public.organizations (upper(trim(join_code)));

alter table public.profiles add column if not exists organization_id uuid references public.organizations (id);

alter table public.inventory_items add column if not exists organization_id uuid references public.organizations (id);
alter table public.operations add column if not exists organization_id uuid references public.organizations (id);
alter table public.warehouse_zones add column if not exists organization_id uuid references public.organizations (id);
alter table public.facility_alerts add column if not exists organization_id uuid references public.organizations (id);
alter table public.compliance_checks add column if not exists organization_id uuid references public.organizations (id);
alter table public.reports add column if not exists organization_id uuid references public.organizations (id);
alter table public.reports add column if not exists body_text text;
alter table public.app_settings add column if not exists organization_id uuid references public.organizations (id);

-- Backfill single shared org when none exists (existing single-company installs)
insert into public.organizations (name, join_code)
select 'Default workspace', 'DW-DEFAULT-' || substring(md5(random()::text || clock_timestamp()::text) from 1 for 6)
where not exists (select 1 from public.organizations limit 1);

update public.profiles
set organization_id = (select id from public.organizations order by created_at asc limit 1)
where organization_id is null;

update public.inventory_items i
set organization_id = p.organization_id
from public.profiles p
where p.id = i.user_id and i.organization_id is null;

update public.operations o
set organization_id = p.organization_id
from public.profiles p
where p.id = o.user_id and o.organization_id is null;

update public.warehouse_zones z
set organization_id = p.organization_id
from public.profiles p
where p.id = z.user_id and z.organization_id is null;

update public.facility_alerts a
set organization_id = p.organization_id
from public.profiles p
where p.id = a.user_id and a.organization_id is null;

update public.compliance_checks c
set organization_id = p.organization_id
from public.profiles p
where p.id = c.user_id and c.organization_id is null;

update public.reports r
set organization_id = p.organization_id
from public.profiles p
where p.id = r.user_id and r.organization_id is null;

update public.app_settings s
set organization_id = p.organization_id
from public.profiles p
where p.id = s.user_id and s.organization_id is null;

delete from public.app_settings a
using public.app_settings b
where a.organization_id is not null
  and a.organization_id = b.organization_id
  and a.ctid > b.ctid;

create unique index if not exists app_settings_one_per_org on public.app_settings (organization_id)
  where organization_id is not null;

create index if not exists inventory_org_idx on public.inventory_items (organization_id);
create index if not exists operations_org_idx on public.operations (organization_id);
create index if not exists zones_org_idx on public.warehouse_zones (organization_id);
create index if not exists alerts_org_idx on public.facility_alerts (organization_id);
create index if not exists compliance_org_idx on public.compliance_checks (organization_id);
create index if not exists reports_org_idx on public.reports (organization_id);

-- Resolve current tenant from profiles (SECURITY DEFINER avoids RLS recursion)
create or replace function public.current_organization_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select p.organization_id from public.profiles p where p.id = auth.uid();
$$;

grant execute on function public.current_organization_id() to authenticated;

-- Owner creates organization (called before profiles.organization_id is set)
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

  insert into public.organizations as ins (name, join_code)
  values (trim(org_name), new_code)
  returning ins.id into new_id;

  return query select new_id, new_code;
end;
$$;

grant execute on function public.create_organization(text) to authenticated;

-- Workers resolve org via join code
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

grant execute on function public.lookup_organization(text) to authenticated;

alter table public.organizations enable row level security;

drop policy if exists org_member_read on public.organizations;
create policy org_member_read on public.organizations
for select to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.organization_id = organizations.id
  )
);

-- Replace tenant-table policies (organization scoped: read all tenant rows; write as authenticated member)
drop policy if exists "inventory owned rows" on public.inventory_items;
drop policy if exists inventory_org_rw on public.inventory_items;
drop policy if exists inventory_select_org on public.inventory_items;
drop policy if exists inventory_insert_org on public.inventory_items;
drop policy if exists inventory_update_org on public.inventory_items;
drop policy if exists inventory_delete_org on public.inventory_items;
create policy inventory_select_org on public.inventory_items for select to authenticated
using (
  organization_id is not null
  and organization_id = public.current_organization_id()
);
create policy inventory_insert_org on public.inventory_items for insert to authenticated
with check (
  organization_id is not null
  and organization_id = public.current_organization_id()
  and auth.uid() = user_id
);
create policy inventory_update_org on public.inventory_items for update to authenticated
using (organization_id = public.current_organization_id())
with check (organization_id = public.current_organization_id());
create policy inventory_delete_org on public.inventory_items for delete to authenticated
using (organization_id = public.current_organization_id());

drop policy if exists "operations owned rows" on public.operations;
drop policy if exists operations_org_rw on public.operations;
drop policy if exists operations_select_org on public.operations;
drop policy if exists operations_insert_org on public.operations;
drop policy if exists operations_update_org on public.operations;
drop policy if exists operations_delete_org on public.operations;
create policy operations_select_org on public.operations for select to authenticated
using (organization_id is not null and organization_id = public.current_organization_id());
create policy operations_insert_org on public.operations for insert to authenticated
with check (
  organization_id is not null
  and organization_id = public.current_organization_id()
  and auth.uid() = user_id
);
create policy operations_update_org on public.operations for update to authenticated
using (organization_id = public.current_organization_id())
with check (organization_id = public.current_organization_id());
create policy operations_delete_org on public.operations for delete to authenticated
using (organization_id = public.current_organization_id());

drop policy if exists "zones owned rows" on public.warehouse_zones;
drop policy if exists zones_org_rw on public.warehouse_zones;
drop policy if exists zones_select_org on public.warehouse_zones;
drop policy if exists zones_insert_org on public.warehouse_zones;
drop policy if exists zones_update_org on public.warehouse_zones;
drop policy if exists zones_delete_org on public.warehouse_zones;
create policy zones_select_org on public.warehouse_zones for select to authenticated
using (organization_id is not null and organization_id = public.current_organization_id());
create policy zones_insert_org on public.warehouse_zones for insert to authenticated
with check (
  organization_id is not null
  and organization_id = public.current_organization_id()
  and auth.uid() = user_id
);
create policy zones_update_org on public.warehouse_zones for update to authenticated
using (organization_id = public.current_organization_id())
with check (organization_id = public.current_organization_id());
create policy zones_delete_org on public.warehouse_zones for delete to authenticated
using (organization_id = public.current_organization_id());

drop policy if exists "alerts owned rows" on public.facility_alerts;
drop policy if exists alerts_org_rw on public.facility_alerts;
drop policy if exists alerts_select_org on public.facility_alerts;
drop policy if exists alerts_insert_org on public.facility_alerts;
drop policy if exists alerts_update_org on public.facility_alerts;
drop policy if exists alerts_delete_org on public.facility_alerts;
create policy alerts_select_org on public.facility_alerts for select to authenticated
using (organization_id is not null and organization_id = public.current_organization_id());
create policy alerts_insert_org on public.facility_alerts for insert to authenticated
with check (
  organization_id is not null
  and organization_id = public.current_organization_id()
  and auth.uid() = user_id
);
create policy alerts_update_org on public.facility_alerts for update to authenticated
using (organization_id = public.current_organization_id())
with check (organization_id = public.current_organization_id());
create policy alerts_delete_org on public.facility_alerts for delete to authenticated
using (organization_id = public.current_organization_id());

drop policy if exists "checks owned rows" on public.compliance_checks;
drop policy if exists checks_org_rw on public.compliance_checks;
drop policy if exists checks_select_org on public.compliance_checks;
drop policy if exists checks_insert_org on public.compliance_checks;
drop policy if exists checks_update_org on public.compliance_checks;
drop policy if exists checks_delete_org on public.compliance_checks;
create policy checks_select_org on public.compliance_checks for select to authenticated
using (organization_id is not null and organization_id = public.current_organization_id());
create policy checks_insert_org on public.compliance_checks for insert to authenticated
with check (
  organization_id is not null
  and organization_id = public.current_organization_id()
  and auth.uid() = user_id
);
create policy checks_update_org on public.compliance_checks for update to authenticated
using (organization_id = public.current_organization_id())
with check (organization_id = public.current_organization_id());
create policy checks_delete_org on public.compliance_checks for delete to authenticated
using (organization_id = public.current_organization_id());

drop policy if exists "reports owned rows" on public.reports;
drop policy if exists reports_org_rw on public.reports;
drop policy if exists reports_select_org on public.reports;
drop policy if exists reports_insert_org on public.reports;
drop policy if exists reports_update_org on public.reports;
drop policy if exists reports_delete_org on public.reports;
create policy reports_select_org on public.reports for select to authenticated
using (organization_id is not null and organization_id = public.current_organization_id());
create policy reports_insert_org on public.reports for insert to authenticated
with check (
  organization_id is not null
  and organization_id = public.current_organization_id()
  and auth.uid() = user_id
);
create policy reports_update_org on public.reports for update to authenticated
using (organization_id = public.current_organization_id())
with check (organization_id = public.current_organization_id());
create policy reports_delete_org on public.reports for delete to authenticated
using (organization_id = public.current_organization_id());

drop policy if exists "settings owned rows" on public.app_settings;
drop policy if exists settings_org_rw on public.app_settings;
drop policy if exists settings_select_org on public.app_settings;
drop policy if exists settings_insert_org on public.app_settings;
drop policy if exists settings_update_org on public.app_settings;
drop policy if exists settings_delete_org on public.app_settings;
create policy settings_select_org on public.app_settings for select to authenticated
using (organization_id is not null and organization_id = public.current_organization_id());
create policy settings_insert_org on public.app_settings for insert to authenticated
with check (
  organization_id is not null
  and organization_id = public.current_organization_id()
  and auth.uid() = user_id
);
create policy settings_update_org on public.app_settings for update to authenticated
using (organization_id = public.current_organization_id())
with check (organization_id = public.current_organization_id());
create policy settings_delete_org on public.app_settings for delete to authenticated
using (organization_id = public.current_organization_id());

drop policy if exists "profiles admin directory read" on public.profiles;
drop policy if exists profiles_select_self on public.profiles;
drop policy if exists profiles_update_self on public.profiles;

create policy profiles_select_self on public.profiles for select to authenticated
using (auth.uid() = id);

create policy profiles_update_self on public.profiles for update to authenticated
using (auth.uid() = id);

-- Admins view coworkers in same org only (permissive OR with profiles_select_self)
create policy profiles_admin_org_directory on public.profiles for select to authenticated
using (
  public.is_admin()
  and public.current_organization_id() is not null
  and profiles.organization_id = public.current_organization_id()
);

