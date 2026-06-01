-- HGW — Security baseline: roles, helper functions, RLS policies (SKETCH)
-- Apply only when moving from local-first mock to real Supabase.
-- Keep in sync with docs/security/security-model.md.
-- NOTE: This is a design sketch. Review column names against the final schema
--       (owned by the data/schema designer) before applying.

-- ============================================================
-- 0. Roles enum
-- ============================================================
do $$ begin
  create type public.app_role as enum ('admin', 'leader', 'member');
exception when duplicate_object then null; end $$;

-- ============================================================
-- 1. Core tables (trimmed to columns relevant for authz)
-- ============================================================
create table if not exists public.teams (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  leader_id     uuid references auth.users(id) on delete set null,
  parent_team_id uuid references public.teams(id) on delete set null,
  created_at    timestamptz not null default now()
);

create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  role        public.app_role not null default 'member',
  team_id     uuid references public.teams(id) on delete set null,
  full_name   text,
  status      text not null default 'active', -- active | suspended
  created_at  timestamptz not null default now()
);

-- ============================================================
-- 2. Helper functions (SECURITY DEFINER -> bypass RLS, no recursion)
--    Prefer JWT app_metadata for role/team to avoid extra reads.
-- ============================================================
create or replace function public.current_role()
returns public.app_role language sql stable security definer set search_path = public as $$
  select coalesce(
    nullif(current_setting('request.jwt.claims', true)::json #>> '{app_metadata,role}', '')::public.app_role,
    (select role from public.profiles where id = auth.uid())
  );
$$;

create or replace function public.current_team_id()
returns uuid language sql stable security definer set search_path = public as $$
  select coalesce(
    nullif(current_setting('request.jwt.claims', true)::json #>> '{app_metadata,team_id}', '')::uuid,
    (select team_id from public.profiles where id = auth.uid())
  );
$$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select public.current_role() = 'admin';
$$;

create or replace function public.is_leader_of(target_team uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select public.current_role() = 'leader' and public.current_team_id() = target_team;
$$;

-- ============================================================
-- 3. New-user trigger: auto-create profile (role=member by default)
-- ============================================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, new.raw_user_meta_data ->> 'full_name', 'member')
  on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- 4. Enable RLS everywhere (deny-by-default)
-- ============================================================
alter table public.teams    enable row level security;
alter table public.profiles enable row level security;

-- ---- profiles ----
-- read own; read teammates; admin reads all
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles for select using (
  id = auth.uid()
  or public.is_admin()
  or team_id = public.current_team_id()
);
-- update own profile (NOT role/team), admin updates all
drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid() and role = (select role from public.profiles p where p.id = auth.uid())
                              and team_id is not distinct from (select team_id from public.profiles p where p.id = auth.uid()));
drop policy if exists profiles_admin_all on public.profiles;
create policy profiles_admin_all on public.profiles for all
  using (public.is_admin()) with check (public.is_admin());

-- ---- teams ----
drop policy if exists teams_select on public.teams;
create policy teams_select on public.teams for select using (
  public.is_admin() or id = public.current_team_id()
);
drop policy if exists teams_admin_write on public.teams;
create policy teams_admin_write on public.teams for all
  using (public.is_admin()) with check (public.is_admin());

-- ============================================================
-- 5. Content tables (Duplicación / Academia / Feed)
--    Convention: owner_id uuid, team_id uuid, is_published bool.
-- ============================================================

-- Reusable pattern documented as comments; replace TABLE per real schema.

-- ---------- DUPLICACIÓN: presentations ----------
alter table if exists public.presentations enable row level security;
-- read: published + own team, or owner, or admin
drop policy if exists presentations_select on public.presentations;
create policy presentations_select on public.presentations for select using (
  public.is_admin()
  or owner_id = auth.uid()
  or (team_id = public.current_team_id() and is_published)
);
-- write (insert/update/delete): admin global; leader within own team
drop policy if exists presentations_insert on public.presentations;
create policy presentations_insert on public.presentations for insert with check (
  public.is_admin()
  or (public.current_role() = 'leader' and team_id = public.current_team_id() and owner_id = auth.uid())
);
drop policy if exists presentations_modify on public.presentations;
create policy presentations_modify on public.presentations for update using (
  public.is_admin() or (owner_id = auth.uid() and public.current_role() = 'leader')
) with check (
  public.is_admin() or (owner_id = auth.uid() and team_id = public.current_team_id())
);
drop policy if exists presentations_delete on public.presentations;
create policy presentations_delete on public.presentations for delete using (
  public.is_admin() or (owner_id = auth.uid() and public.current_role() = 'leader')
);

-- ---------- DUPLICACIÓN: presentation_events (tracking, per-user) ----------
alter table if exists public.presentation_events enable row level security;
drop policy if exists pe_select on public.presentation_events;
create policy pe_select on public.presentation_events for select using (
  public.is_admin() or user_id = auth.uid() or team_id = public.current_team_id() and public.current_role() = 'leader'
);
drop policy if exists pe_write_own on public.presentation_events;
create policy pe_write_own on public.presentation_events for all
  using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());

-- ---------- ACADEMIA: courses (and modules/lessons follow same pattern) ----------
alter table if exists public.courses enable row level security;
drop policy if exists courses_select on public.courses;
create policy courses_select on public.courses for select using (
  public.is_admin()
  or owner_id = auth.uid()
  or (is_published and (team_id is null or team_id = public.current_team_id()))
);
drop policy if exists courses_write on public.courses;
create policy courses_write on public.courses for all using (
  public.is_admin() or (public.current_role() = 'leader' and owner_id = auth.uid())
) with check (
  public.is_admin() or (public.current_role() = 'leader' and owner_id = auth.uid() and team_id = public.current_team_id())
);

-- ---------- ACADEMIA: lesson_progress (per-user) ----------
alter table if exists public.lesson_progress enable row level security;
drop policy if exists lp_select on public.lesson_progress;
create policy lp_select on public.lesson_progress for select using (
  user_id = auth.uid()
  or public.is_admin()
  or (public.current_role() = 'leader' and team_id = public.current_team_id())
);
drop policy if exists lp_upsert_own on public.lesson_progress;
create policy lp_upsert_own on public.lesson_progress for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ---------- FEED: posts ----------
alter table if exists public.posts enable row level security;
drop policy if exists posts_select on public.posts;
create policy posts_select on public.posts for select using (
  public.is_admin() or team_id = public.current_team_id()
);
drop policy if exists posts_insert on public.posts;
create policy posts_insert on public.posts for insert with check (
  public.is_admin()
  or (public.current_role() in ('leader','member') and owner_id = auth.uid() and team_id = public.current_team_id())
);
drop policy if exists posts_modify on public.posts;
create policy posts_modify on public.posts for update using (
  public.is_admin() or owner_id = auth.uid()
) with check (public.is_admin() or owner_id = auth.uid());
drop policy if exists posts_delete on public.posts;
create policy posts_delete on public.posts for delete using (
  public.is_admin()
  or owner_id = auth.uid()
  or public.is_leader_of(team_id)            -- leader moderates own team
);

-- ---------- FEED: announcements (official, leader/admin authored) ----------
alter table if exists public.announcements enable row level security;
drop policy if exists ann_select on public.announcements;
create policy ann_select on public.announcements for select using (
  public.is_admin() or team_id = public.current_team_id()
);
drop policy if exists ann_write on public.announcements;
create policy ann_write on public.announcements for all using (
  public.is_admin() or public.is_leader_of(team_id)
) with check (
  public.is_admin() or (public.is_leader_of(team_id) and owner_id = auth.uid())
);

-- ---------- FEED: comments ----------
alter table if exists public.comments enable row level security;
drop policy if exists comments_select on public.comments;
create policy comments_select on public.comments for select using (
  public.is_admin() or team_id = public.current_team_id()
);
drop policy if exists comments_insert on public.comments;
create policy comments_insert on public.comments for insert with check (
  owner_id = auth.uid() and team_id = public.current_team_id()
);
drop policy if exists comments_delete on public.comments;
create policy comments_delete on public.comments for delete using (
  public.is_admin() or owner_id = auth.uid() or public.is_leader_of(team_id)
);

-- ---------- FEED: reactions (per-user) ----------
alter table if exists public.reactions enable row level security;
drop policy if exists reactions_rw on public.reactions;
create policy reactions_rw on public.reactions for all
  using (user_id = auth.uid() or public.is_admin() or team_id = public.current_team_id())
  with check (user_id = auth.uid());

-- ============================================================
-- 6. Transversal: app_settings (read-all, write-admin) + audit_log (admin-read)
-- ============================================================
alter table if exists public.app_settings enable row level security;
drop policy if exists settings_select on public.app_settings;
create policy settings_select on public.app_settings for select using (auth.uid() is not null);
drop policy if exists settings_admin on public.app_settings;
create policy settings_admin on public.app_settings for all
  using (public.is_admin()) with check (public.is_admin());

alter table if exists public.audit_log enable row level security;
drop policy if exists audit_admin_read on public.audit_log;
create policy audit_admin_read on public.audit_log for select using (public.is_admin());
-- writes to audit_log happen via SECURITY DEFINER functions / service_role only (no client INSERT policy).
