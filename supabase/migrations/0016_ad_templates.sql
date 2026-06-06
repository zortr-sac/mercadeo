-- Anuncios de producto que el admin sube (imagen + texto + categoría).
-- Los clientes solo los ven, copian el texto, descargan la imagen y comparten.

create table if not exists public.ad_templates (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references public.businesses(id) on delete cascade,
  title text not null,
  body_text text not null default '',
  image_url text,
  image_path text,
  category text not null default 'General',
  is_published boolean not null default false,
  sort_order integer not null default 0,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists ad_templates_business_idx on public.ad_templates (business_id, sort_order);

alter table public.ad_templates enable row level security;

-- Lectura: usuarios del negocio ven los publicados; el admin del negocio ve todos.
drop policy if exists ad_templates_select on public.ad_templates;
create policy ad_templates_select on public.ad_templates for select to authenticated using (
  public.can_read_business_scope(business_id)
  and (is_published or public.is_business_admin(business_id))
);

-- Escritura: solo el admin del negocio (o de plataforma).
drop policy if exists ad_templates_write on public.ad_templates;
create policy ad_templates_write on public.ad_templates for all to authenticated
  using (public.is_business_admin(business_id))
  with check (public.is_business_admin(business_id));
