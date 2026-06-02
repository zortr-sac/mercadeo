-- Nexo Mentor - multi-tenant SaaS baseline.
-- Review in a staging Supabase project before production.

create extension if not exists pgcrypto;

do $$ begin
  create type public.business_status as enum ('draft', 'active', 'suspended');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.business_content_type as enum ('course', 'video', 'pdf', 'image', 'link');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.prospect_stage as enum ('new', 'contacted', 'presented', 'followup', 'customer', 'lost');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.prospect_interest as enum ('product', 'business', 'both');
exception when duplicate_object then null; end $$;

create table if not exists public.businesses (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  legal_name text,
  logo_path text,
  primary_color text not null default '#0f766e',
  accent_color text not null default '#f59e0b',
  subscription_price_pen integer not null default 15 check (subscription_price_pen > 0),
  status public.business_status not null default 'draft',
  admin_email text not null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.business_domains (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  hostname text not null unique,
  is_primary boolean not null default false,
  verified_at timestamptz,
  created_at timestamptz not null default now()
);

alter table if exists public.profiles
  add column if not exists business_id uuid references public.businesses(id) on delete set null;

alter table if exists public.profiles
  add column if not exists phone text;

create table if not exists public.business_content (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  title text not null,
  description text not null default '',
  type public.business_content_type not null,
  storage_path text,
  external_url text,
  category text not null default 'Inicio',
  is_published boolean not null default false,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint business_content_has_location check (storage_path is not null or external_url is not null)
);

create table if not exists public.prospects (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  phone text,
  email text,
  stage public.prospect_stage not null default 'new',
  interest public.prospect_interest not null default 'product',
  notes text not null default '',
  next_action_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists prospects_owner_next_action_idx
  on public.prospects (owner_id, next_action_at)
  where next_action_at is not null;

create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references public.businesses(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  user_agent text,
  disabled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ai_generation_events (
  id uuid primary key default gen_random_uuid(),
  idempotency_key text not null,
  business_id uuid references public.businesses(id) on delete set null,
  user_id uuid references auth.users(id) on delete set null,
  feature text not null,
  compliance_status text not null,
  blocked boolean not null default false,
  prompt_hash text not null,
  created_at timestamptz not null default now(),
  unique (user_id, idempotency_key)
);

create or replace function public.current_business_id()
returns uuid language sql stable security definer set search_path = public as $$
  select coalesce(
    nullif(current_setting('request.jwt.claims', true)::json #>> '{app_metadata,business_id}', '')::uuid,
    (select business_id from public.profiles where id = auth.uid())
  );
$$;

create or replace function public.is_business_admin(target_business uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select public.current_role() in ('admin', 'leader')
    and (public.is_admin() or public.current_business_id() = target_business);
$$;

alter table public.businesses enable row level security;
alter table public.business_domains enable row level security;
alter table public.business_content enable row level security;
alter table public.prospects enable row level security;
alter table public.push_subscriptions enable row level security;
alter table public.ai_generation_events enable row level security;

drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles for select using (
  id = auth.uid()
  or public.is_admin()
  or business_id = public.current_business_id()
);

drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self on public.profiles for update
  using (id = auth.uid())
  with check (
    id = auth.uid()
    and role = (select role from public.profiles p where p.id = auth.uid())
    and business_id is not distinct from (
      select business_id from public.profiles p where p.id = auth.uid()
    )
    and team_id is not distinct from (
      select team_id from public.profiles p where p.id = auth.uid()
    )
  );

drop policy if exists businesses_public_active_select on public.businesses;
create policy businesses_public_active_select on public.businesses
  for select using (status = 'active' or public.is_admin() or id = public.current_business_id());

drop policy if exists businesses_admin_write on public.businesses;
create policy businesses_admin_write on public.businesses
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists domains_select on public.business_domains;
create policy domains_select on public.business_domains
  for select using (public.is_admin() or business_id = public.current_business_id());

drop policy if exists domains_admin_write on public.business_domains;
create policy domains_admin_write on public.business_domains
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists content_select on public.business_content;
create policy content_select on public.business_content
  for select using (
    public.is_admin()
    or (auth.uid() is not null and business_id = public.current_business_id())
  );

drop policy if exists content_business_admin_write on public.business_content;
create policy content_business_admin_write on public.business_content
  for all using (public.is_business_admin(business_id))
  with check (public.is_business_admin(business_id));

drop policy if exists prospects_owner_select on public.prospects;
create policy prospects_owner_select on public.prospects
  for select using (
    owner_id = auth.uid()
    or public.is_admin()
    or public.is_business_admin(business_id)
  );

drop policy if exists prospects_owner_insert on public.prospects;
create policy prospects_owner_insert on public.prospects
  for insert with check (
    owner_id = auth.uid()
    and business_id = public.current_business_id()
  );

drop policy if exists prospects_owner_update on public.prospects;
create policy prospects_owner_update on public.prospects
  for update using (owner_id = auth.uid() or public.is_business_admin(business_id))
  with check (owner_id = auth.uid() or public.is_business_admin(business_id));

drop policy if exists prospects_owner_delete on public.prospects;
create policy prospects_owner_delete on public.prospects
  for delete using (owner_id = auth.uid() or public.is_business_admin(business_id));

drop policy if exists push_owner_rw on public.push_subscriptions;
create policy push_owner_rw on public.push_subscriptions
  for all using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());

drop policy if exists ai_events_owner_insert on public.ai_generation_events;
create policy ai_events_owner_insert on public.ai_generation_events
  for insert with check (user_id = auth.uid() or public.is_admin());

drop policy if exists ai_events_owner_select on public.ai_generation_events;
create policy ai_events_owner_select on public.ai_generation_events
  for select using (
    user_id = auth.uid()
    or public.is_admin()
    or (business_id = public.current_business_id() and public.current_role() = 'leader')
  );

insert into storage.buckets (id, name, public)
values ('business-assets', 'business-assets', false)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('business-content', 'business-content', false)
on conflict (id) do nothing;

drop policy if exists storage_business_assets_read on storage.objects;
create policy storage_business_assets_read on storage.objects
  for select to authenticated using (
    bucket_id in ('business-assets', 'business-content')
    and (
      public.is_admin()
      or (storage.foldername(name))[1] = public.current_business_id()::text
    )
  );

drop policy if exists storage_business_assets_write on storage.objects;
create policy storage_business_assets_write on storage.objects
  for insert to authenticated with check (
    bucket_id in ('business-assets', 'business-content')
    and public.is_business_admin(((storage.foldername(name))[1])::uuid)
  );

drop policy if exists storage_business_assets_update on storage.objects;
create policy storage_business_assets_update on storage.objects
  for update to authenticated using (
    bucket_id in ('business-assets', 'business-content')
    and public.is_business_admin(((storage.foldername(name))[1])::uuid)
  ) with check (
    bucket_id in ('business-assets', 'business-content')
    and public.is_business_admin(((storage.foldername(name))[1])::uuid)
  );

drop policy if exists storage_business_assets_delete on storage.objects;
create policy storage_business_assets_delete on storage.objects
  for delete to authenticated using (
    bucket_id in ('business-assets', 'business-content')
    and public.is_business_admin(((storage.foldername(name))[1])::uuid)
  );
