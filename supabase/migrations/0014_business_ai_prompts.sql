-- Instrucciones base por negocio para la generación de contenido con IA.
-- Se SUMAN al prompt del sistema (no lo reemplazan): el filtro legal MLN y el
-- formato técnico se mantienen; el admin añade directrices de marca/estilo.
-- La vista businesses_with_stats usa `select b.*`, así que expone estas columnas
-- automáticamente (no hay que recrearla).

alter table public.businesses
  add column if not exists flyer_prompt text not null default '',
  add column if not exists presentation_prompt text not null default '';
