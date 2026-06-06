-- La tabla presentation_templates ya existe en la BD (feature de plantillas de
-- presentación). Aquí solo añadimos las imágenes de cada diapositiva, para
-- poder VISUALIZAR la presentación dentro de la app (además de descargar el PPT).
-- Formato: [{ "url": "...", "path": "..." }] en orden de diapositiva.

alter table public.presentation_templates
  add column if not exists slides jsonb not null default '[]'::jsonb;
