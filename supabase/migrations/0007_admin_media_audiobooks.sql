-- Nexo Mentor - admin hub: per-business message templates, audiobooks, media uploads.
-- Depends on 0002 (businesses, is_business_admin, storage buckets) and 0003 (can_read_business_scope, posts, message_templates).
-- Idempotent / guarded, mirrors 0002/0003 style.

-- ============================================================
-- 1. message_templates: scope per business (null = biblioteca base global)
-- ============================================================
alter table public.message_templates
  add column if not exists business_id uuid references public.businesses(id) on delete cascade;

create index if not exists message_templates_business_id_idx on public.message_templates (business_id);

drop policy if exists message_templates_select on public.message_templates;
create policy message_templates_select on public.message_templates for select to authenticated
  using (public.can_read_business_scope(business_id));

drop policy if exists message_templates_write on public.message_templates;
create policy message_templates_write on public.message_templates for all to authenticated
  using (public.is_business_admin(business_id))
  with check (public.is_business_admin(business_id));

-- ============================================================
-- 2. audiobooks (espejo de courses; slug único global para resolver por slug)
-- ============================================================
create table if not exists public.audiobooks (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references public.businesses(id) on delete cascade,
  slug text not null unique,
  title text not null,
  author text not null default '',
  description text not null default '',
  cover_url text,
  audio_url text,
  audio_path text,
  category text not null default 'General',
  duration_seconds integer not null default 0,
  is_published boolean not null default false,
  sort_order integer not null default 0,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists audiobooks_business_id_idx on public.audiobooks (business_id);

alter table public.audiobooks enable row level security;

drop policy if exists audiobooks_select on public.audiobooks;
create policy audiobooks_select on public.audiobooks for select to authenticated using (
  public.can_read_business_scope(business_id)
  and (is_published or public.is_business_admin(business_id))
);

drop policy if exists audiobooks_write on public.audiobooks;
create policy audiobooks_write on public.audiobooks for all to authenticated
  using (public.is_business_admin(business_id))
  with check (public.is_business_admin(business_id));

-- ============================================================
-- 3. posts: el Admin de negocio (líder) puede editar/fijar posts de su negocio
-- ============================================================
drop policy if exists posts_update on public.posts;
create policy posts_update on public.posts for update to authenticated
  using (author_id = (select auth.uid()) or public.is_admin() or public.is_business_admin(business_id))
  with check (author_id = (select auth.uid()) or public.is_admin() or public.is_business_admin(business_id));

-- ============================================================
-- 4. Bucket público de media (videos de Academia + audios de Audiolibros)
-- ============================================================
insert into storage.buckets (id, name, public, file_size_limit)
values ('business-media', 'business-media', true, 524288000)
on conflict (id) do update set public = true, file_size_limit = 524288000;

-- Lectura pública por el flag del bucket. Escritura: admin de ese negocio (carpeta = businessId).
drop policy if exists media_business_write on storage.objects;
create policy media_business_write on storage.objects for insert to authenticated with check (
  bucket_id = 'business-media'
  and public.is_business_admin(((storage.foldername(name))[1])::uuid)
);

drop policy if exists media_business_update on storage.objects;
create policy media_business_update on storage.objects for update to authenticated
  using (
    bucket_id = 'business-media'
    and public.is_business_admin(((storage.foldername(name))[1])::uuid)
  )
  with check (
    bucket_id = 'business-media'
    and public.is_business_admin(((storage.foldername(name))[1])::uuid)
  );

drop policy if exists media_business_delete on storage.objects;
create policy media_business_delete on storage.objects for delete to authenticated using (
  bucket_id = 'business-media'
  and public.is_business_admin(((storage.foldername(name))[1])::uuid)
);
