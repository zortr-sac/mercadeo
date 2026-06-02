-- Nexo Mentor - constancia (anti-rejection diary) + activity-based gamification.
-- Doc §5.2.2 (módulo anti-rechazo) y §5.2.3 (gamificación por actividad, NO por resultados).
-- Depends on 0002 (businesses) and 0003 (RLS helpers).

-- ============================================================
-- 1. Learnings: diario anti-rechazo con reencuadre de IA
-- ============================================================
create table if not exists public.learnings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  business_id uuid references public.businesses(id) on delete set null,
  situation text not null,
  reframe text,
  created_at timestamptz not null default now()
);

create index if not exists learnings_user_idx on public.learnings (user_id, created_at);

alter table public.learnings enable row level security;

drop policy if exists learnings_rw on public.learnings;
create policy learnings_rw on public.learnings for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- ============================================================
-- 2. Activity events: se premia ACTIVIDAD, nunca resultados económicos
-- ============================================================
do $$ begin
  create type public.activity_kind as enum (
    'lesson_completed', 'prospect_added', 'conversation_used',
    'message_generated', 'learning_logged', 'post_created'
  );
exception when duplicate_object then null; end $$;

create table if not exists public.activity_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  business_id uuid references public.businesses(id) on delete set null,
  kind public.activity_kind not null,
  points integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists activity_events_user_idx on public.activity_events (user_id, created_at);

alter table public.activity_events enable row level security;

drop policy if exists activity_select on public.activity_events;
create policy activity_select on public.activity_events for select to authenticated using (
  user_id = (select auth.uid())
  or public.is_admin()
  or public.is_business_admin(business_id)
);

drop policy if exists activity_insert on public.activity_events;
create policy activity_insert on public.activity_events for insert to authenticated
  with check (user_id = (select auth.uid()));
