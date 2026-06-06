-- Reacciones (corazón) por usuario sobre cualquier contenido. Una fila por
-- (usuario, tipo, contenido). El admin ve los conteos para saber qué gusta más.
-- content_type: 'ad' | 'presentation' | 'audiobook' | 'course'.

create table if not exists public.content_reactions (
  user_id uuid not null references auth.users(id) on delete cascade,
  content_type text not null,
  content_id uuid not null,
  business_id uuid references public.businesses(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, content_type, content_id)
);

create index if not exists content_reactions_item_idx on public.content_reactions (content_type, content_id);
create index if not exists content_reactions_business_idx on public.content_reactions (business_id, content_type);

alter table public.content_reactions enable row level security;

-- Cada usuario gestiona sus propias reacciones. Los conteos agregados los calcula
-- el servidor con service-role (sin exponer quién reaccionó).
drop policy if exists content_reactions_owner_rw on public.content_reactions;
create policy content_reactions_owner_rw on public.content_reactions for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
