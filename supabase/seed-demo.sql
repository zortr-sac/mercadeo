-- DEMO/seed OPCIONAL. NO es una migración: no se aplica en producción.
-- Úsalo solo para poblar un entorno de pruebas (supabase db reset no lo corre).

-- Nexo Mentor - demo seed (idempotent).
-- Creates real Supabase Auth users (shared demo password) + all application data.
-- Demo password for every seeded user: NexoDemo2026!
-- Re-runnable: every insert guards on conflict.

-- ============================================================
-- 1. Businesses + domains
-- ============================================================
insert into public.businesses (id, slug, name, legal_name, primary_color, accent_color, subscription_price_pen, status, admin_email, created_at)
values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'bienestar-andino', 'Bienestar Andino', 'Bienestar Andino SAC', '#0f766e', '#f59e0b', 15, 'active', 'carla@bienestarandino.com', '2026-02-01T10:00:00Z'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'nutricion-clara', 'Nutricion Clara', null, '#164e63', '#f59e0b', 15, 'draft', 'admin@nutricionclara.com', '2026-05-20T10:00:00Z')
on conflict (id) do nothing;

insert into public.business_domains (business_id, hostname, is_primary, verified_at)
values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'academia.bienestarandino.com', true, now())
on conflict (hostname) do nothing;

-- ============================================================
-- 2. Auth users (email/password) + identities
-- ============================================================
-- NOTE: GoTrue (Go) cannot scan NULL into its token string columns, so they must be ''.
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new, email_change,
  email_change_token_current, phone_change, phone_change_token, reauthentication_token
)
values
  ('00000000-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111', 'authenticated', 'authenticated', 'admin@nexomentor.app',    crypt('NexoDemo2026!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Mauricio Admin"}', '2026-01-15T10:00:00Z', now(), '', '', '', '', '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '22222222-2222-2222-2222-222222222222', 'authenticated', 'authenticated', 'carla@bienestarandino.com', crypt('NexoDemo2026!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Carla Rios"}', '2026-02-02T10:00:00Z', now(), '', '', '', '', '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '33333333-3333-3333-3333-333333333333', 'authenticated', 'authenticated', 'sofia@example.com',        crypt('NexoDemo2026!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Sofia Castro"}', '2026-03-10T10:00:00Z', now(), '', '', '', '', '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '44444444-4444-4444-4444-444444444444', 'authenticated', 'authenticated', 'luis@example.com',         crypt('NexoDemo2026!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Luis Fernandez"}', '2026-04-18T10:00:00Z', now(), '', '', '', '', '', '', '', '')
on conflict (id) do nothing;

insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
values
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', '{"sub":"11111111-1111-1111-1111-111111111111","email":"admin@nexomentor.app","email_verified":true}', 'email', now(), now(), now()),
  (gen_random_uuid(), '22222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', '{"sub":"22222222-2222-2222-2222-222222222222","email":"carla@bienestarandino.com","email_verified":true}', 'email', now(), now(), now()),
  (gen_random_uuid(), '33333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', '{"sub":"33333333-3333-3333-3333-333333333333","email":"sofia@example.com","email_verified":true}', 'email', now(), now(), now()),
  (gen_random_uuid(), '44444444-4444-4444-4444-444444444444', '44444444-4444-4444-4444-444444444444', '{"sub":"44444444-4444-4444-4444-444444444444","email":"luis@example.com","email_verified":true}', 'email', now(), now(), now())
on conflict (provider, provider_id) do nothing;

-- ============================================================
-- 3. Profiles (upsert over the auto-created trigger rows)
-- ============================================================
insert into public.profiles (id, business_id, full_name, email, phone, country, role, sponsor_id, rank, is_active, is_demo, joined_at, status)
values
  ('11111111-1111-1111-1111-111111111111', null,                                   'Mauricio Admin',  'admin@nexomentor.app',    '+51 999 000 001', 'Peru', 'admin',  null,                                   'Owner',            true, true, '2026-01-15T10:00:00Z', 'active'),
  ('22222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Carla Rios',      'carla@bienestarandino.com','+51 999 000 002', 'Peru', 'leader', '11111111-1111-1111-1111-111111111111', 'Admin de negocio', true, true, '2026-02-02T10:00:00Z', 'active'),
  ('33333333-3333-3333-3333-333333333333', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Sofia Castro',    'sofia@example.com',        '+51 999 000 003', 'Peru', 'member', '22222222-2222-2222-2222-222222222222', 'Cliente activo',   true, true, '2026-03-10T10:00:00Z', 'active'),
  ('44444444-4444-4444-4444-444444444444', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Luis Fernandez',  'luis@example.com',         '+51 999 000 004', 'Peru', 'member', '22222222-2222-2222-2222-222222222222', 'Cliente nuevo',    true, true, '2026-04-18T10:00:00Z', 'active')
on conflict (id) do update set
  business_id = excluded.business_id, full_name = excluded.full_name, email = excluded.email,
  phone = excluded.phone, country = excluded.country, role = excluded.role,
  sponsor_id = excluded.sponsor_id, rank = excluded.rank, is_active = excluded.is_active,
  is_demo = excluded.is_demo, joined_at = excluded.joined_at, status = excluded.status;

-- ============================================================
-- 4. Business content
-- ============================================================
insert into public.business_content (id, business_id, title, description, type, external_url, category, is_published, created_at)
values
  ('cc000001-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Bienvenida para nuevos vendedores', 'Video corto para entender el metodo de trabajo sin promesas de ingresos.', 'video', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'Inicio', true, '2026-05-10T10:00:00Z'),
  ('cc000002-0000-0000-0000-000000000002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Guia de conversacion responsable', 'PDF con frases permitidas, frases a evitar y ejemplos seguros.', 'pdf', '#', 'Cumplimiento', true, '2026-05-12T10:00:00Z'),
  ('cc000003-0000-0000-0000-000000000003', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Primer modulo de producto', 'Borrador pendiente de revision antes de publicarse.', 'course', '#', 'Producto', false, '2026-05-22T10:00:00Z')
on conflict (id) do nothing;

-- ============================================================
-- 5. Academy: courses -> modules -> lessons
-- ============================================================
insert into public.courses (id, business_id, slug, title, description, level, category, estimated_minutes, is_published, sort_order)
values
  ('c0000001-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'primeros-pasos', 'Primeros pasos en la plataforma', 'Aprende a usar academia, prospectos, mensajes IA y recordatorios en menos de una hora.', 'beginner', 'Inicio', 42, true, 1),
  ('c0000002-0000-0000-0000-000000000002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'comunicacion-con-prospectos', 'Comunicacion con prospectos', 'Guiones y criterios para iniciar conversaciones, responder objeciones y hacer seguimiento.', 'intermediate', 'Comunicacion', 58, true, 2),
  ('c0000003-0000-0000-0000-000000000003', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'constancia-y-rechazo', 'Constancia y rechazo', 'Microlecciones para no abandonar despues de recibir respuestas negativas.', 'beginner', 'Mentalidad', 35, true, 3)
on conflict (id) do nothing;

insert into public.course_modules (id, course_id, title, sort_order)
values
  ('d0000001-0000-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000001', 'Arranque guiado', 1),
  ('d0000002-0000-0000-0000-000000000002', 'c0000002-0000-0000-0000-000000000002', 'Conversaciones reales', 1),
  ('d0000003-0000-0000-0000-000000000003', 'c0000003-0000-0000-0000-000000000003', 'No tomarlo personal', 1)
on conflict (id) do nothing;

insert into public.lessons (id, module_id, course_id, slug, title, content_type, video_url, content, duration_minutes, sort_order)
values
  ('e0000001-0000-0000-0000-000000000001', 'd0000001-0000-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000001', 'como-trabajar-sin-abrumarte', 'Como trabajar sin abrumarte', 'article', null,
    $md$## Empieza con pocas acciones

El objetivo no es hacer todo en un dia. Empieza con tres acciones simples:

1. Registra tus prospectos importantes.
2. Elige una plantilla antes de escribir.
3. Agenda el siguiente seguimiento.

> La constancia nace de acciones pequenas y claras.$md$, 8, 1),
  ('e0000002-0000-0000-0000-000000000002', 'd0000001-0000-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000001', 'activa-recordatorios', 'Activa recordatorios y notificaciones', 'article', null,
    $md$## Que la memoria no sea el sistema

Los seguimientos se pierden cuando quedan solo en la cabeza. Usa la fecha de proxima accion y activa notificaciones para que la app te avise cuando toca escribir.$md$, 6, 2),
  ('e0000003-0000-0000-0000-000000000003', 'd0000001-0000-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000001', 'modo-cumplimiento', 'Modo Cumplimiento', 'article', null,
    $md$## Comunica sin ponerte en riesgo

La plataforma evita mensajes con promesas de ingresos, reclutamiento por comisiones o afirmaciones de salud no sustentadas. Si detecta una frase riesgosa, propone una alternativa mas segura.

Esto protege al usuario, al negocio y a la marca.$md$, 10, 3),
  ('e0000004-0000-0000-0000-000000000004', 'd0000002-0000-0000-0000-000000000002', 'c0000002-0000-0000-0000-000000000002', 'preguntar-antes-de-ofrecer', 'Pregunta antes de ofrecer', 'article', null,
    $md$## Escuchar primero

Antes de enviar un video o una invitacion, entiende que le importa a la persona. Un buen mensaje responde a su contexto, no a tus ganas de vender.$md$, 12, 1),
  ('e0000005-0000-0000-0000-000000000005', 'd0000002-0000-0000-0000-000000000002', 'c0000002-0000-0000-0000-000000000002', 'seguimiento-en-24-horas', 'Seguimiento en 24 horas', 'video', 'https://www.youtube.com/embed/dQw4w9WgXcQ', null, 18, 2),
  ('e0000006-0000-0000-0000-000000000006', 'd0000003-0000-0000-0000-000000000003', 'c0000003-0000-0000-0000-000000000003', 'un-no-no-es-fracaso', 'Un no no es fracaso', 'article', null,
    $md$## El rechazo es informacion

Un no puede significar que no era el momento, que el mensaje no fue claro o que la persona no es el perfil adecuado. Registra el aprendizaje y sigue con la siguiente accion.$md$, 9, 1)
on conflict (id) do nothing;

-- ============================================================
-- 6. Feed posts
-- ============================================================
insert into public.posts (id, business_id, type, title, body, author_id, pinned, event_date, event_location, reactions, created_at)
values
  ('f0000001-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'announcement', 'Nuevo modulo: responder sin presionar', 'Ya esta disponible una leccion corta para responder objeciones con calma, sin promesas de ingresos y sin mensajes agresivos.', '22222222-2222-2222-2222-222222222222', true, null, null, 42, '2026-05-28T14:00:00Z'),
  ('f0000002-0000-0000-0000-000000000002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'event', 'Taller en vivo: seguimiento de 10 minutos', 'Sesion practica para ordenar tus prospectos, preparar tres mensajes y dejar recordatorios para la semana.', '22222222-2222-2222-2222-222222222222', true, '2026-06-05T01:00:00Z', 'Zoom', 67, '2026-05-25T09:30:00Z'),
  ('f0000003-0000-0000-0000-000000000003', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'motivation', 'La meta de hoy: dos conversaciones claras', 'No necesitas convencer a nadie. Necesitas escuchar, responder con respeto y registrar el siguiente paso.', '22222222-2222-2222-2222-222222222222', false, null, null, 35, '2026-05-20T07:15:00Z'),
  ('f0000004-0000-0000-0000-000000000004', null, 'announcement', 'Modo Cumplimiento activo para todos los negocios', 'El copiloto de IA revisa frases de riesgo antes de sugerir un mensaje. La idea es cuidar al usuario, al negocio y a la reputacion de la marca.', '11111111-1111-1111-1111-111111111111', false, null, null, 51, '2026-05-15T16:45:00Z')
on conflict (id) do nothing;

-- ============================================================
-- 7. Duplication: playbooks, scripts, resources, message templates
-- ============================================================
insert into public.playbooks (id, business_id, slug, title, type, description, icon, steps)
values
  ('a1000001-0000-0000-0000-000000000001', null, 'comunicacion-responsable', 'Sistema de conversacion responsable', 'business', 'Un flujo simple para iniciar, escuchar, responder y dar seguimiento sin presionar.', 'MessageCircle',
   $j$[
     {"id":"s-com-1","sortOrder":1,"title":"Registra el contexto","description":"Antes de escribir, anota quien es la persona, que le interesa y que objecion podria tener.","tips":["No copies mensajes masivos.","El mejor mensaje suena a conversacion real."],"durationMinutes":5},
     {"id":"s-com-2","sortOrder":2,"title":"Elige una plantilla","description":"Usa una plantilla por situacion: primer contacto, seguimiento, objecion o reactivacion.","tips":["Manten el mensaje corto.","Evita promesas de ingresos o salud."],"durationMinutes":5},
     {"id":"s-com-3","sortOrder":3,"title":"Agenda el siguiente paso","description":"Cierra cada conversacion con una accion concreta: enviar informacion, llamar o revisar dudas.","tips":["Si no hay siguiente paso, el prospecto se enfria."],"durationMinutes":3}
   ]$j$),
  ('a1000002-0000-0000-0000-000000000002', null, 'presentar-producto', 'Presentar productos con claridad', 'product', 'Como hablar de beneficios reales, experiencia personal y uso responsable del producto.', 'Package',
   $j$[
     {"id":"s-prod-1","sortOrder":1,"title":"Pregunta antes de recomendar","description":"Identifica necesidad, rutina y expectativas antes de hablar de un producto.","tips":["Escucha mas de lo que hablas."],"durationMinutes":5},
     {"id":"s-prod-2","sortOrder":2,"title":"Comparte informacion verificable","description":"Evita afirmaciones de salud no sustentadas. Usa materiales aprobados por el negocio.","tips":["Cuando tengas duda, envia el recurso oficial."],"durationMinutes":8}
   ]$j$)
on conflict (id) do nothing;

insert into public.scripts (id, business_id, title, category, scenario, content, tags)
values
  ('b1000001-0000-0000-0000-000000000001', null, 'Primer contacto calido', 'prospecting', 'Para iniciar una conversacion con alguien conocido.', 'Hola [nombre], como estas? Vi que te interesa [tema] y pense en compartirte una informacion breve que podria servirte. Si te parece, te envio un resumen y lo revisas con calma.', '{"primer contacto","calido"}'),
  ('b1000002-0000-0000-0000-000000000002', null, 'Invitacion sin presion', 'invitation', 'Para invitar a ver informacion sin sonar insistente.', 'Hola [nombre], estoy aprendiendo una forma mas ordenada de compartir productos y formacion. No se si sea para ti, pero pense que podrias darme tu opinion. Te puedo enviar un video corto?', '{"invitacion","opinion"}'),
  ('b1000003-0000-0000-0000-000000000003', null, 'Objecion: parece piramide', 'objection', 'Para responder con calma y redirigir a informacion clara.', 'Entiendo la duda, [nombre]. Por eso prefiero explicarlo con claridad: aqui hablamos de productos, formacion y una metodologia de ventas responsable. No se promete dinero ni se paga por reclutar. Si quieres, te comparto la informacion oficial para que lo revises.', '{"objecion","cumplimiento"}'),
  ('b1000004-0000-0000-0000-000000000004', null, 'Seguimiento 24 horas', 'followup', 'Para dar seguimiento despues de enviar informacion.', 'Hola [nombre], pudiste revisar la informacion que te envie? Me gustaria saber que parte te llamo mas la atencion y si tienes alguna pregunta concreta.', '{"seguimiento"}'),
  ('b1000005-0000-0000-0000-000000000005', null, 'Reactivar contacto frio', 'reactivation', 'Para retomar una conversacion pausada.', 'Hola [nombre], retomo este mensaje con calma. Hace unos dias hablamos de [tema]. Si aun te interesa, puedo enviarte un resumen actualizado; si no es buen momento, no hay problema.', '{"reactivacion","respeto"}')
on conflict (id) do nothing;

insert into public.resources (id, business_id, title, type, description, url, category, size_label)
values
  ('c2000001-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Guia de conversacion responsable', 'pdf', 'Frases utiles, frases de riesgo y ejemplos seguros.', '#', 'Cumplimiento', 'PDF'),
  ('c2000002-0000-0000-0000-000000000002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Video de introduccion al metodo', 'video', 'Explica como usar academia, CRM, IA y recordatorios.', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'Inicio', 'Video'),
  ('c2000003-0000-0000-0000-000000000003', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Plantilla imprimible de seguimiento', 'pdf', 'Para usuarios que prefieren trabajar con papel y luego registrar en la app.', '#', 'Herramientas', '1 pagina')
on conflict (id) do nothing;

-- Mensajes 100% por negocio: ya no se siembran plantillas globales de plataforma.
-- Cada negocio crea sus propios mensajes desde el panel de administración.

-- ============================================================
-- 8. Prospects (owned by Sofia, the demo member)
-- ============================================================
insert into public.prospects (id, business_id, owner_id, name, phone, email, stage, interest, notes, next_action_at, created_at)
values
  ('e3000001-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '33333333-3333-3333-3333-333333333333', 'Maria Gonzalez', '+51999111111', 'maria@example.com', 'new', 'product', 'Le interesa bienestar y rutinas simples. Evitar presion.', '2026-06-04T18:00:00Z', '2026-05-26T10:00:00Z'),
  ('e3000002-0000-0000-0000-000000000002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '33333333-3333-3333-3333-333333333333', 'Roberto Diaz', '+51999222222', null, 'contacted', 'business', 'Pidio informacion general. Quiere algo flexible, sin promesas.', '2026-06-05T15:00:00Z', '2026-05-24T10:00:00Z'),
  ('e3000003-0000-0000-0000-000000000003', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '33333333-3333-3333-3333-333333333333', 'Lucia Martinez', '+51999333333', 'lucia@example.com', 'presented', 'both', 'Vio informacion. Pidio pensarlo unos dias.', '2026-06-06T17:30:00Z', '2026-05-20T10:00:00Z'),
  ('e3000004-0000-0000-0000-000000000004', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '33333333-3333-3333-3333-333333333333', 'Jorge Perez', '+51999444444', null, 'followup', 'product', 'Quiere comparar productos. Enviar resumen claro y breve.', '2026-06-04T20:00:00Z', '2026-05-15T10:00:00Z'),
  ('e3000005-0000-0000-0000-000000000005', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '33333333-3333-3333-3333-333333333333', 'Patricia Flores', '+51999555555', 'patricia@example.com', 'customer', 'product', 'Cliente. Agendar seguimiento de experiencia.', null, '2026-05-10T10:00:00Z')
on conflict (id) do nothing;

-- ============================================================
-- 9. Memoria de ejemplo del prospecto (copiloto de conversación, 0005)
-- ============================================================
update public.prospects
set ai_profile = 'Maria: interesada en bienestar y rutinas simples. Ya vio el video de introduccion. Le preocupa el precio y si encaja en su rutina diaria. Evitar presion; ofrecer informacion clara y sin compromiso.'
where id = 'e3000001-0000-0000-0000-000000000001';

insert into public.prospect_interactions (prospect_id, owner_id, business_id, role, content, source, created_at)
values
  ('e3000001-0000-0000-0000-000000000001', '33333333-3333-3333-3333-333333333333', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'seller', 'Le envie el video de introduccion y le pregunte que le parecio.', 'manual', '2026-05-27T15:00:00Z'),
  ('e3000001-0000-0000-0000-000000000001', '33333333-3333-3333-3333-333333333333', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'prospect', 'Le intereso, pero le preocupa el precio y si le sirve para su rutina.', 'manual', '2026-05-27T18:30:00Z'),
  ('e3000001-0000-0000-0000-000000000001', '33333333-3333-3333-3333-333333333333', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'note', 'Prefiere que le escriba por las tardes.', 'manual', '2026-05-28T09:00:00Z')
on conflict do nothing;

-- ============================================================
-- 10. Constancia + gamificación de Sofía (0006). Fechas relativas: racha actual.
-- ============================================================
insert into public.activity_events (user_id, business_id, kind, points, created_at) values
  ('33333333-3333-3333-3333-333333333333','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','conversation_used',5, now()),
  ('33333333-3333-3333-3333-333333333333','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','learning_logged',8, now() - interval '2 hours'),
  ('33333333-3333-3333-3333-333333333333','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','lesson_completed',10, now() - interval '4 hours'),
  ('33333333-3333-3333-3333-333333333333','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','prospect_added',5, now() - interval '1 day'),
  ('33333333-3333-3333-3333-333333333333','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','conversation_used',5, now() - interval '1 day 3 hours'),
  ('33333333-3333-3333-3333-333333333333','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','lesson_completed',10, now() - interval '2 days'),
  ('33333333-3333-3333-3333-333333333333','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','message_generated',3, now() - interval '2 days 5 hours'),
  ('33333333-3333-3333-3333-333333333333','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','conversation_used',5, now() - interval '4 days'),
  ('33333333-3333-3333-3333-333333333333','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','prospect_added',5, now() - interval '6 days'),
  ('33333333-3333-3333-3333-333333333333','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','learning_logged',8, now() - interval '6 days 2 hours');

insert into public.learnings (user_id, business_id, situation, reframe, created_at) values
  ('33333333-3333-3333-3333-333333333333','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','Me dijo que no le interesa por ahora.','Un "no por ahora" no es un "no para siempre". Te dio informacion: este no es su momento. Registralo y sigue con la siguiente persona con la misma calma.', now() - interval '2 hours'),
  ('33333333-3333-3333-3333-333333333333','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','No contesto mi ultimo mensaje en varios dias.','El silencio no siempre es rechazo; muchas veces es falta de tiempo. Manten el respeto y deja la puerta abierta sin presionar.', now() - interval '6 days 2 hours');
