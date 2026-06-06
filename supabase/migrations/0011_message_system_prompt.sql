-- Mensajes 100% por negocio + system prompt por mensaje.
--
-- 1) Cada mensaje guarda las instrucciones del admin para la IA (cómo debe responder).
alter table public.message_templates
  add column if not exists system_prompt text not null default '';

-- 2) Reversión del contenido base: se retiran las plantillas globales de plataforma.
--    Cada negocio crea sus propios mensajes desde cero (igual que en Academia).
delete from public.message_templates where business_id is null;
