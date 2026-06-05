# HGW — Plataforma PWA para Líderes MLN

## Visión
PWA interna para el grupo de líderes de HGW (marketing multinivel). Objetivos:
mantener informado, enseñar, y un **sistema de duplicación** para presentar negocio y producto.

## Decisiones (2026-05-30)
- **Stack**: Next.js 16 (App Router) + TypeScript + Tailwind v4 + Supabase (diferido) + Zustand.
- **PWA** instalable, mobile-first, español, modo claro/oscuro.
- **Backend**: local-first (capa repositorio + mock con seeds en español) → conectar Supabase después.
- **Roles**: Admin · Líder · Miembro (RBAC con `can(role, action)`).
- **Branding**: azul confianza + dorado prosperidad (tokens en `globals.css`).

## Módulos MVP — COMPLETADOS
1. **Sistema de Duplicación** ✅ — playbooks paso a paso (negocio/producto), guiones por categoría
   con copia al portapapeles, biblioteca de recursos, CRM de prospectos (kanban).
2. **Academia** ✅ — catálogo por nivel, detalle de curso, lecciones (video/artículo/PDF),
   progreso persistente, navegación anterior/siguiente.
3. **Feed + Anuncios** ✅ — lista con filtros, tarjetas por tipo, reacciones optimistas,
   creación de publicaciones (líder/admin) vía server action + Zod.

## Estado de construcción
- [x] Andamiaje Next.js 16 + Tailwind v4 + TS
- [x] Dependencias núcleo
- [x] Sistema de diseño (tokens, tema claro/oscuro, UI kit: button, card, badge, avatar, field, modal, etc.)
- [x] Capa de datos (repositorio + mock + container por env)
- [x] Auth mock + roles + protección de rutas (middleware + requireSession/requireRole)
- [x] App shell (sidebar desktop, bottom nav móvil, header, theme toggle, user menu)
- [x] Módulo Feed (+ crear publicación)
- [x] Módulo Academia (catálogo, curso, lección, progreso)
- [x] Módulo Duplicación (playbooks, guiones, recursos, prospectos)
- [x] Dashboard (saludo, accesos, curso destacado, novedades)
- [x] Perfil (datos, equipo/downline, logout)
- [x] PWA (manifest dinámico, iconos, service worker, página offline, prompt A2HS)
- [x] Build de producción limpio (19 rutas, sin errores, ~172 kB First Load JS)
- [x] Prueba E2E con navegador (login, módulos, crear post, modo oscuro, móvil + desktop)

## Cambios (2026-06-03)
- [x] **Registro público de clientes funcional**: el formulario `/registro/[businessSlug]`
  era cosmético (solo mostraba "Registro recibido", no creaba cuenta). Ahora crea la
  cuenta real en Supabase Auth con contraseña vía `registerMemberAction`
  (`src/features/registration/registration-actions.ts`): valida con Zod server-side,
  fuerza rol `member`, deriva el negocio del slug, `email_confirm` para ingreso inmediato
  y rollback si falla el perfil. UI con campo de contraseña + pantalla "Cuenta creada"
  que enlaza a `/login`. Verificado E2E con Playwright (registro → login → dashboard).

## Pendiente / Próximos pasos
- [ ] Integrar pasarela de pago antes de activar la cuenta (hoy queda activa sin cobro).
- [ ] Rate limiting / anti-abuso en el alta pública (usa service role).
- [ ] Esquema Supabase + RLS: escribir migración SQL (tablas, enums, índices, policies) y `seed.sql`.
- [ ] Implementar `src/data/supabase/*` (mismo contrato de repositorio) y activar con `NEXT_PUBLIC_DATA_SOURCE=supabase`.
- [ ] Auth real con `@supabase/ssr` (cookies httpOnly, refresh en middleware).
- [ ] Persistir progreso/prospectos en servidor (hoy en localStorage) con cola offline.
- [ ] Panel de administración (CRUD de cursos, anuncios, usuarios).
- [ ] Revisión de calidad adversarial (workflow).

## v2 (futuro)
- Rangos y gamificación, métricas/dashboard de líder, calendario/eventos,
  chat/comunidad, push notifications (Web Push/VAPID), red completa patrocinador→downline.

## Cómo ejecutar
```bash
npm run dev      # desarrollo (http://localhost:3000)
npm run build    # build de producción
npm start        # servir build
npm run typecheck
npm run lint
```
Login demo: elige cualquier perfil (sin contraseña). Henry = Admin, Carla/Diego = Líderes, resto = Miembros.
