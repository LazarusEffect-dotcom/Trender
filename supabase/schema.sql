-- Starter schema. Review and test policies in a non-production project first.
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now()
);

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.organization_members (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'analyst' check (role in ('owner','admin','analyst','viewer')),
  created_at timestamptz not null default now(),
  primary key (organization_id, user_id)
);

create table if not exists public.datasets (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  uploaded_by uuid not null references auth.users(id),
  name text not null,
  storage_path text,
  file_type text not null check (file_type in ('csv','xlsx','xls')),
  row_count bigint not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.saved_reports (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  created_by uuid not null references auth.users(id),
  title text not null,
  report_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists datasets_org_created_idx on public.datasets(organization_id, created_at desc);
create index if not exists saved_reports_org_created_idx on public.saved_reports(organization_id, created_at desc);

create or replace function public.is_org_member(target_org uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.organization_members
    where organization_id = target_org and user_id = auth.uid()
  );
$$;

alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.datasets enable row level security;
alter table public.saved_reports enable row level security;

create policy "Users can view own profile" on public.profiles
for select using (id = auth.uid());
create policy "Users can insert own profile" on public.profiles
for insert with check (id = auth.uid());
create policy "Users can update own profile" on public.profiles
for update using (id = auth.uid()) with check (id = auth.uid());

create policy "Members can view their organizations" on public.organizations
for select using (public.is_org_member(id) or created_by = auth.uid());
create policy "Authenticated users can create organizations" on public.organizations
for insert to authenticated with check (created_by = auth.uid());

create policy "Members can view membership list" on public.organization_members
for select using (public.is_org_member(organization_id));
create policy "Organization creator can add self as owner" on public.organization_members
for insert to authenticated with check (
  user_id = auth.uid() and role = 'owner'
  and exists (select 1 from public.organizations o where o.id = organization_id and o.created_by = auth.uid())
);

create policy "Members can view datasets" on public.datasets
for select using (public.is_org_member(organization_id));
create policy "Analysts and admins can create datasets" on public.datasets
for insert to authenticated with check (
  uploaded_by = auth.uid() and exists (
    select 1 from public.organization_members m
    where m.organization_id = datasets.organization_id
      and m.user_id = auth.uid() and m.role in ('owner','admin','analyst')
  )
);
create policy "Admins can delete datasets" on public.datasets
for delete using (exists (
  select 1 from public.organization_members m
  where m.organization_id = datasets.organization_id
    and m.user_id = auth.uid() and m.role in ('owner','admin')
));

create policy "Members can view reports" on public.saved_reports
for select using (public.is_org_member(organization_id));
create policy "Analysts can create reports" on public.saved_reports
for insert to authenticated with check (
  created_by = auth.uid() and exists (
    select 1 from public.organization_members m
    where m.organization_id = saved_reports.organization_id
      and m.user_id = auth.uid() and m.role in ('owner','admin','analyst')
  )
);
create policy "Authors or admins can delete reports" on public.saved_reports
for delete using (
  created_by = auth.uid() or exists (
    select 1 from public.organization_members m
    where m.organization_id = saved_reports.organization_id
      and m.user_id = auth.uid() and m.role in ('owner','admin')
  )
);

-- Create a PRIVATE Storage bucket named company-uploads in the Supabase dashboard.
-- Add storage.objects policies only after choosing and enforcing a canonical storage path:
-- organization_id/user_id/dataset_id/filename. Do not make this bucket public.
