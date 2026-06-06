-- Se elimina la generación de contenido con IA del producto.
-- Estas tablas solo guardaban métricas/límites de IA; sin IA no tienen uso.
-- Aplicar DESPUÉS de desplegar el código sin IA (para no romper el código viejo).

drop table if exists public.ai_usage cascade;
drop table if exists public.ai_limit_overrides cascade;
drop table if exists public.ai_generation_events cascade;
