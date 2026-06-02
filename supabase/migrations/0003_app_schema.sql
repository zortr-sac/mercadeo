-- Nexo Mentor - application schema for the repository layer.
-- Adds feed, academy and duplication tables + aligns profiles with the Profile type.
-- Depends on 0001 (profiles, helper functions) and 0002 (businesses, RLS helpers).

-- ============================================================
-- 1. Align profiles with the app Profile type
-- ============================================================
alter table public.profiles add column if not exists email       text;
alter table public.profiles add column if not exists avatar_url  text;
alter table public.profiles add column if not exists country     text;
alter table public.profiles add column if not exists sponsor_id  uuid references public.profiles(id) on delete set null;
alter table public.profiles add column if not exists rank        text;
alter table public.profiles add column if not exists is_active   boolean not null default true;
alter table public.profiles add column if not exists joined_at   timestamptz not null default now();
alter table public.profiles add column if not exists is_demo     boolean not null default false;

create index if not exists profiles_sponsor_id_idx on public.profiles (sponsor_id);

-- ============================================================
-- 2. Enums
-- ============================================================
do $$ begin create type public.post_type as enum ('announcement','motivation','event','recognition'); exception when duplicate_object then null; end $$;
do $$ begin create type public.course_level as enum ('beginner','intermediate','advanced'); exception when duplicate_object then null; end $$;
do $$ begin create type public.lesson_type as enum ('video','article','pdf','quiz'); exception when duplicate_object then null; end $$;
do $$ begin create type public.playbook_type as enum ('business','product'); exception when duplicate_object then null; end $$;
do $$ begin create type public.script_category as enum ('prospecting','invitation','presentation','closing','objection','followup','reactivation'); exception when duplicate_object then null; end $$;
do $$ begin create type public.resource_type as enum ('pdf','video','image','slides','link'); exception when duplicate_object then null; end $$;
do $$ begin create type public.message_tone as enum ('calm','warm','direct','reactivation'); exception when duplicate_object then null; end $$;

-- ============================================================
-- 3. Academy
-- ============================================================
create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references public.businesses(id) on delete cascade,
  slug text not null unique,
  title text not null,
  description text not null default '',
  cover_url text,
  level public.course_level not null default 'beginner',
  category text not null default 'Inicio',
  estimated_minutes integer not null default 0,
  is_published boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.course_modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  sort_order integer not null default 0
);

create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.course_modules(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  slug text not null,
  title text not null,
  content_type public.lesson_type not null default 'article',
  video_url text,
  content text,
  resource_url text,
  duration_minutes integer not null default 0,
  sort_order integer not null default 0,
  unique (course_id, slug)
);

create table if not exists public.lesson_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  completed boolean not null default true,
  completed_at timestamptz not null default now(),
  primary key (user_id, lesson_id)
);

create index if not exists courses_business_id_idx on public.courses (business_id);
create index if not exists course_modules_course_id_idx on public.course_modules (course_id);
create index if not exists lessons_course_id_idx on public.lessons (course_id);
create index if not exists lessons_module_id_idx on public.lessons (module_id);

-- ============================================================
-- 4. Feed
-- ============================================================
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references public.businesses(id) on delete cascade,
  type public.post_type not null,
  title text not null,
  body text not null default '',
  author_id uuid references auth.users(id) on delete set null,
  cover_url text,
  pinned boolean not null default false,
  event_date timestamptz,
  event_location text,
  reactions integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists posts_business_id_idx on public.posts (business_id);
create index if not exists posts_author_id_idx on public.posts (author_id);

-- ============================================================
-- 5. Duplication (playbooks, scripts, resources, message templates)
-- ============================================================
create table if not exists public.playbooks (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references public.businesses(id) on delete cascade,
  slug text not null unique,
  title text not null,
  type public.playbook_type not null,
  description text not null default '',
  icon text not null default 'MessageCircle',
  steps jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.scripts (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references public.businesses(id) on delete cascade,
  title text not null,
  category public.script_category not null,
  scenario text not null default '',
  content text not null,
  tags text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.resources (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references public.businesses(id) on delete cascade,
  title text not null,
  type public.resource_type not null,
  description text not null default '',
  url text not null,
  category text not null default 'Inicio',
  size_label text,
  created_at timestamptz not null default now()
);

create table if not exists public.message_templates (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category public.script_category not null,
  situation text not null default '',
  base_text text not null,
  default_tone public.message_tone not null default 'warm',
  compliance_hint text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists playbooks_business_id_idx on public.playbooks (business_id);
create index if not exists scripts_business_id_idx on public.scripts (business_id);
create index if not exists resources_business_id_idx on public.resources (business_id);

-- ============================================================
-- 6. Helper: content visible to the current user (global OR own business OR admin)
-- ============================================================
create or replace function public.can_read_business_scope(target_business uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select target_business is null
    or public.is_admin()
    or target_business = public.current_business_id();
$$;

-- ============================================================
-- 7. RLS
-- ============================================================
alter table public.courses           enable row level security;
alter table public.course_modules    enable row level security;
alter table public.lessons           enable row level security;
alter table public.lesson_progress   enable row level security;
alter table public.posts             enable row level security;
alter table public.playbooks         enable row level security;
alter table public.scripts           enable row level security;
alter table public.resources         enable row level security;
alter table public.message_templates enable row level security;

-- Courses: read published in scope (admins read all); business admins manage own.
drop policy if exists courses_select on public.courses;
create policy courses_select on public.courses for select to authenticated using (
  public.can_read_business_scope(business_id) and (is_published or public.is_business_admin(business_id))
);
drop policy if exists courses_write on public.courses;
create policy courses_write on public.courses for all to authenticated
  using (public.is_business_admin(business_id))
  with check (public.is_business_admin(business_id));

-- Modules / lessons inherit visibility from their course.
drop policy if exists modules_select on public.course_modules;
create policy modules_select on public.course_modules for select to authenticated using (
  exists (select 1 from public.courses c where c.id = course_id
          and public.can_read_business_scope(c.business_id)
          and (c.is_published or public.is_business_admin(c.business_id)))
);
drop policy if exists modules_write on public.course_modules;
create policy modules_write on public.course_modules for all to authenticated
  using (exists (select 1 from public.courses c where c.id = course_id and public.is_business_admin(c.business_id)))
  with check (exists (select 1 from public.courses c where c.id = course_id and public.is_business_admin(c.business_id)));

drop policy if exists lessons_select on public.lessons;
create policy lessons_select on public.lessons for select to authenticated using (
  exists (select 1 from public.courses c where c.id = course_id
          and public.can_read_business_scope(c.business_id)
          and (c.is_published or public.is_business_admin(c.business_id)))
);
drop policy if exists lessons_write on public.lessons;
create policy lessons_write on public.lessons for all to authenticated
  using (exists (select 1 from public.courses c where c.id = course_id and public.is_business_admin(c.business_id)))
  with check (exists (select 1 from public.courses c where c.id = course_id and public.is_business_admin(c.business_id)));

-- Lesson progress: each user owns theirs.
drop policy if exists lesson_progress_rw on public.lesson_progress;
create policy lesson_progress_rw on public.lesson_progress for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- Posts: read in scope; author/admin manage; business admins publish.
drop policy if exists posts_select on public.posts;
create policy posts_select on public.posts for select to authenticated using (
  public.can_read_business_scope(business_id)
);
drop policy if exists posts_insert on public.posts;
create policy posts_insert on public.posts for insert to authenticated with check (
  author_id = (select auth.uid())
  and (public.is_admin() or business_id = public.current_business_id())
);
drop policy if exists posts_update on public.posts;
create policy posts_update on public.posts for update to authenticated
  using (author_id = (select auth.uid()) or public.is_admin())
  with check (author_id = (select auth.uid()) or public.is_admin());
drop policy if exists posts_delete on public.posts;
create policy posts_delete on public.posts for delete to authenticated using (
  author_id = (select auth.uid()) or public.is_admin() or public.is_business_admin(business_id)
);

-- Playbooks / scripts / resources: read in scope; business admins manage.
drop policy if exists playbooks_select on public.playbooks;
create policy playbooks_select on public.playbooks for select to authenticated using (public.can_read_business_scope(business_id));
drop policy if exists playbooks_write on public.playbooks;
create policy playbooks_write on public.playbooks for all to authenticated
  using (public.is_business_admin(business_id)) with check (public.is_business_admin(business_id));

drop policy if exists scripts_select on public.scripts;
create policy scripts_select on public.scripts for select to authenticated using (public.can_read_business_scope(business_id));
drop policy if exists scripts_write on public.scripts;
create policy scripts_write on public.scripts for all to authenticated
  using (public.is_business_admin(business_id)) with check (public.is_business_admin(business_id));

drop policy if exists resources_select on public.resources;
create policy resources_select on public.resources for select to authenticated using (public.can_read_business_scope(business_id));
drop policy if exists resources_write on public.resources;
create policy resources_write on public.resources for all to authenticated
  using (public.is_business_admin(business_id)) with check (public.is_business_admin(business_id));

-- Message templates: shared catalog, readable by any authenticated user; admins manage.
drop policy if exists message_templates_select on public.message_templates;
create policy message_templates_select on public.message_templates for select to authenticated using (true);
drop policy if exists message_templates_write on public.message_templates;
create policy message_templates_write on public.message_templates for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ============================================================
-- 8. Demo login support + reaction counter
-- ============================================================
-- Curated demo users for the "choose a profile" login screen (anon-callable).
create or replace function public.list_demo_users()
returns table (
  id uuid, business_id uuid, full_name text, email text,
  avatar_url text, role public.app_role
)
language sql stable security definer set search_path = public as $$
  select id, business_id, full_name, email, avatar_url, role
  from public.profiles
  where is_demo
  order by case role when 'admin' then 0 when 'leader' then 1 else 2 end, full_name;
$$;
revoke all on function public.list_demo_users() from public;
grant execute on function public.list_demo_users() to anon, authenticated;

-- Atomic reaction toggle, callable by any signed-in user.
create or replace function public.increment_post_reaction(p_post_id uuid, p_delta integer)
returns integer language sql security definer set search_path = public as $$
  update public.posts
     set reactions = greatest(0, reactions + p_delta)
   where id = p_post_id
   returning reactions;
$$;
revoke all on function public.increment_post_reaction(uuid, integer) from public;
grant execute on function public.increment_post_reaction(uuid, integer) to authenticated;

-- ============================================================
-- 9. Businesses overview view (custom domain + member/content counts)
-- ============================================================
create or replace view public.businesses_with_stats
with (security_invoker = on) as
  select b.*,
    (select d.hostname from public.business_domains d
       where d.business_id = b.id and d.is_primary limit 1) as custom_domain,
    (select count(*) from public.profiles p where p.business_id = b.id) as member_count,
    (select count(*) from public.business_content c where c.business_id = b.id) as content_count
  from public.businesses b;
