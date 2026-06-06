-- Sesión única por cuenta (anti-cuenta-compartida): cada login genera un token
-- y lo guarda aquí; el middleware expulsa al dispositivo cuyo token no coincide.
alter table public.profiles add column if not exists active_session_id text;
