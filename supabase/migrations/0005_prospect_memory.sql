-- Nexo Mentor - prospect memory for the AI conversation copilot.
-- Stores a per-prospect interaction timeline + an evolving AI "ficha" so the
-- copilot knows each client and can suggest contextual replies.
-- Depends on 0002 (prospects, helper functions) and 0003 (RLS helpers).

-- Evolving synthesized profile the AI maintains per prospect.
alter table public.prospects add column if not exists ai_profile text;

do $$ begin
  create type public.interaction_role as enum ('prospect', 'seller', 'ai', 'note');
exception when duplicate_object then null; end $$;

create table if not exists public.prospect_interactions (
  id uuid primary key default gen_random_uuid(),
  prospect_id uuid not null references public.prospects(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  business_id uuid references public.businesses(id) on delete set null,
  role public.interaction_role not null,
  content text not null,
  source text not null default 'manual', -- manual | screenshot | ai
  compliance_status text,
  created_at timestamptz not null default now()
);

create index if not exists prospect_interactions_prospect_idx
  on public.prospect_interactions (prospect_id, created_at);
create index if not exists prospect_interactions_owner_idx
  on public.prospect_interactions (owner_id);

alter table public.prospect_interactions enable row level security;

-- Owner manages their own timeline; platform/business admins can read (oversight).
drop policy if exists pi_select on public.prospect_interactions;
create policy pi_select on public.prospect_interactions for select to authenticated using (
  owner_id = (select auth.uid())
  or public.is_admin()
  or public.is_business_admin(business_id)
);

drop policy if exists pi_insert on public.prospect_interactions;
create policy pi_insert on public.prospect_interactions for insert to authenticated
  with check (owner_id = (select auth.uid()));

drop policy if exists pi_update on public.prospect_interactions;
create policy pi_update on public.prospect_interactions for update to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

drop policy if exists pi_delete on public.prospect_interactions;
create policy pi_delete on public.prospect_interactions for delete to authenticated using (
  owner_id = (select auth.uid()) or public.is_admin()
);
