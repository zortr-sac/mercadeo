-- Seed the NetScale Academia blocks as GLOBAL courses (business_id null),
-- idempotent via fixed UUIDs + ON CONFLICT DO NOTHING. Lessons have no video yet
-- (video_url null -> the UI shows a clean placeholder); admins upload real videos.
-- A course belongs to a block through its `category` (= block key):
--   antianalfabetismo · programas-comerciales · marketing-digital
-- (the "plan-compensacion" block is a static screen, it has no course).

insert into public.courses (id, business_id, slug, title, description, level, category, estimated_minutes, is_published, sort_order) values
  ('0c000001-0000-4000-8000-000000000000', null, 'primeros-pasos-redes-mercadeo', 'Primeros pasos en redes de mercadeo', 'Videos cortos de inducción: qué es el multinivel, sin tecnicismos.', 'beginner', 'antianalfabetismo', 19, true, 1),
  ('0c000002-0000-4000-8000-000000000000', null, 'control-de-peso', 'Control de Peso', 'Ayuda a personas a sentirse mejor con su cuerpo.', 'beginner', 'programas-comerciales', 12, true, 1),
  ('0c000003-0000-4000-8000-000000000000', null, 'estetica-cosmetica', 'Estética y Cosmética', 'Productos de belleza y cuidado de la piel.', 'beginner', 'programas-comerciales', 12, true, 2),
  ('0c000004-0000-4000-8000-000000000000', null, 'amigos-de-la-salud', 'Amigos de la Salud', 'Bienestar y vitalidad para el día a día.', 'beginner', 'programas-comerciales', 12, true, 3),
  ('0c000005-0000-4000-8000-000000000000', null, 'fotos-y-redes-sociales', 'Fotos y redes sociales', 'Toma fotos a tus productos y súbelas a redes, sin ser influencer.', 'beginner', 'marketing-digital', 14, true, 1)
on conflict (slug) do nothing;

insert into public.course_modules (id, course_id, title, sort_order) values
  ('0d000001-0000-4000-8000-000000000000', '0c000001-0000-4000-8000-000000000000', 'Contenido', 0),
  ('0d000002-0000-4000-8000-000000000000', '0c000002-0000-4000-8000-000000000000', 'Contenido', 0),
  ('0d000003-0000-4000-8000-000000000000', '0c000003-0000-4000-8000-000000000000', 'Contenido', 0),
  ('0d000004-0000-4000-8000-000000000000', '0c000004-0000-4000-8000-000000000000', 'Contenido', 0),
  ('0d000005-0000-4000-8000-000000000000', '0c000005-0000-4000-8000-000000000000', 'Contenido', 0)
on conflict (id) do nothing;

insert into public.lessons (id, module_id, course_id, slug, title, content_type, video_url, content, duration_minutes, sort_order) values
  ('0e000101-0000-4000-8000-000000000000','0d000001-0000-4000-8000-000000000000','0c000001-0000-4000-8000-000000000000','que-es-el-mercadeo-en-red','¿Qué es el mercadeo en red?','video',null,null,3,1),
  ('0e000102-0000-4000-8000-000000000000','0d000001-0000-4000-8000-000000000000','0c000001-0000-4000-8000-000000000000','mitos-y-verdades','Mitos y verdades','video',null,null,4,2),
  ('0e000103-0000-4000-8000-000000000000','0d000001-0000-4000-8000-000000000000','0c000001-0000-4000-8000-000000000000','tu-primer-contacto','Tu primer contacto','video',null,null,5,3),
  ('0e000104-0000-4000-8000-000000000000','0d000001-0000-4000-8000-000000000000','0c000001-0000-4000-8000-000000000000','como-invitar-sin-presionar','Cómo invitar sin presionar','video',null,null,4,4),
  ('0e000105-0000-4000-8000-000000000000','0d000001-0000-4000-8000-000000000000','0c000001-0000-4000-8000-000000000000','resumen-del-modulo','Resumen del módulo','video',null,null,3,5),
  ('0e000201-0000-4000-8000-000000000000','0d000002-0000-4000-8000-000000000000','0c000002-0000-4000-8000-000000000000','conoce-el-programa','Conoce el programa de control de peso','video',null,null,4,1),
  ('0e000202-0000-4000-8000-000000000000','0d000002-0000-4000-8000-000000000000','0c000002-0000-4000-8000-000000000000','a-quien-le-ayuda','A quién le ayuda','video',null,null,3,2),
  ('0e000203-0000-4000-8000-000000000000','0d000002-0000-4000-8000-000000000000','0c000002-0000-4000-8000-000000000000','como-presentarlo','Cómo presentarlo con calma','video',null,null,5,3),
  ('0e000301-0000-4000-8000-000000000000','0d000003-0000-4000-8000-000000000000','0c000003-0000-4000-8000-000000000000','conoce-estetica','Conoce la línea de estética','video',null,null,4,1),
  ('0e000302-0000-4000-8000-000000000000','0d000003-0000-4000-8000-000000000000','0c000003-0000-4000-8000-000000000000','cuidado-de-la-piel','Cuidado de la piel paso a paso','video',null,null,4,2),
  ('0e000303-0000-4000-8000-000000000000','0d000003-0000-4000-8000-000000000000','0c000003-0000-4000-8000-000000000000','como-ofrecerlo','Cómo ofrecerlo en tu trabajo','video',null,null,5,3),
  ('0e000401-0000-4000-8000-000000000000','0d000004-0000-4000-8000-000000000000','0c000004-0000-4000-8000-000000000000','conoce-amigos-salud','Conoce Amigos de la Salud','video',null,null,4,1),
  ('0e000402-0000-4000-8000-000000000000','0d000004-0000-4000-8000-000000000000','0c000004-0000-4000-8000-000000000000','bienestar-diario','Bienestar para el día a día','video',null,null,3,2),
  ('0e000403-0000-4000-8000-000000000000','0d000004-0000-4000-8000-000000000000','0c000004-0000-4000-8000-000000000000','como-compartirlo','Cómo compartirlo con cariño','video',null,null,5,3),
  ('0e000501-0000-4000-8000-000000000000','0d000005-0000-4000-8000-000000000000','0c000005-0000-4000-8000-000000000000','fotos-que-se-ven-bien','Toma fotos que se ven bien','video',null,null,4,1),
  ('0e000502-0000-4000-8000-000000000000','0d000005-0000-4000-8000-000000000000','0c000005-0000-4000-8000-000000000000','textos-sencillos','Escribe textos sencillos','video',null,null,3,2),
  ('0e000503-0000-4000-8000-000000000000','0d000005-0000-4000-8000-000000000000','0c000005-0000-4000-8000-000000000000','tu-primera-publicacion','Sube tu primera publicación','video',null,null,4,3),
  ('0e000504-0000-4000-8000-000000000000','0d000005-0000-4000-8000-000000000000','0c000005-0000-4000-8000-000000000000','responde-con-calma','Responde con calma','video',null,null,3,4)
on conflict (course_id, slug) do nothing;
