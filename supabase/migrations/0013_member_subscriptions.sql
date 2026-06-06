-- Nexo Mentor - suscripción mensual POR CLIENTE (member).
-- El vencimiento vive en `profiles`; el estado (activo/por vencer/vencido) es DERIVADO
-- de la fecha en el código, no se almacena. Historial de pagos en `subscription_payments`.
-- Revisar en un proyecto Supabase de staging antes de producción.

-- 1) Campos de suscripción en profiles.
--    null = sin suscripción (líderes y admin de plataforma quedan en null).
alter table if exists public.profiles
  add column if not exists subscription_expires_at timestamptz;

alter table if exists public.profiles
  add column if not exists subscription_reminder_sent_at timestamptz;

-- Índice parcial: el cron localiza rápido a quién le vence pronto.
create index if not exists profiles_subscription_expires_idx
  on public.profiles (subscription_expires_at)
  where subscription_expires_at is not null;

-- 2) Historial de pagos ("registrar cuando un cliente pagó su mes").
create table if not exists public.subscription_payments (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references auth.users(id) on delete cascade,
  business_id uuid references public.businesses(id) on delete set null,
  amount_pen integer not null check (amount_pen >= 0),
  paid_at timestamptz not null default now(),
  period_end timestamptz not null,            -- nuevo vencimiento tras este pago
  recorded_by uuid references auth.users(id) on delete set null,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists subscription_payments_member_idx
  on public.subscription_payments (member_id, paid_at desc);

create index if not exists subscription_payments_business_idx
  on public.subscription_payments (business_id);

-- 3) RLS de subscription_payments: solo el admin de plataforma.
alter table public.subscription_payments enable row level security;

drop policy if exists subscription_payments_admin_all on public.subscription_payments;
create policy subscription_payments_admin_all on public.subscription_payments
  for all using (public.is_admin()) with check (public.is_admin());

-- 4) Endurecer profiles_update_self: el usuario NO puede tocar sus propios campos de
--    suscripción (si no, un cliente con la anon key se auto-renovaría). El admin de
--    plataforma sí puede, vía la policy profiles_admin_all (0001). Se recrea la policy
--    de 0002 añadiendo la protección de los campos nuevos.
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
    and subscription_expires_at is not distinct from (
      select subscription_expires_at from public.profiles p where p.id = auth.uid()
    )
    and subscription_reminder_sent_at is not distinct from (
      select subscription_reminder_sent_at from public.profiles p where p.id = auth.uid()
    )
  );
