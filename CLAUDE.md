# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> El proyecto vive en `HGW/` (dentro de `Mercadeo/`). `package.json`, `.git` y todo el código están aquí. Ejecuta los comandos desde esta carpeta.

## Qué es

**Nexo Mentor** (paquete `hgw-platform`) — SaaS multiempresa, PWA mobile-first, para formación, seguimiento y comunicación asistida de vendedores de red de mercadeo (MLN). Contenido en español, código en inglés.

Tres módulos núcleo: **Duplicación** (playbooks de presentación + guiones + recursos + CRM kanban de prospectos), **Academia** (cursos por nivel → módulos → lecciones con progreso) y **Feed** (anuncios/motivación/eventos/reconocimientos). Más un copiloto de **mensajes con IA** que pasa por un motor de cumplimiento legal MLN.

## Comandos

```bash
npm run dev        # desarrollo en http://localhost:3000
npm run build      # build de producción
npm start          # servir el build
npm run typecheck  # tsc --noEmit (TypeScript strict)
npm run lint       # eslint (flat config, eslint.config.mjs)
```

No hay framework de tests configurado todavía; la verificación se hace con `typecheck` + `lint` + prueba E2E manual con navegador. Login demo: cualquier perfil sin contraseña.

## Stack y convenciones críticas

- **Next.js 16.2.6** (App Router) + **React 19** + **Tailwind v4** + **TypeScript strict**. Lee `AGENTS.md`: Next.js 16 tiene breaking changes vs. tu conocimiento previo — consulta `node_modules/next/dist/docs/` antes de escribir código de framework.
- **El middleware es `src/proxy.ts` y exporta `proxy()`** (convención Next.js 16, NO `middleware.ts`/`middleware()`). Protege rutas: redirige a `/login` sin sesión.
- **Path alias**: `@/*` → `src/*`.
- **Sin strings mágicos**: `src/lib/constants.ts` es la única fuente de verdad para roles, rutas (`ROUTES`), nombre de app, cookie de sesión, disclaimers legales y la flag `DATA_SOURCE`. Importa de ahí; no hardcodees.
- Estado cliente: **Zustand** persistido en localStorage (`src/store/*`). Validación: **Zod**. Toasts: **sonner**. Tema claro/oscuro: **next-themes**.

## Arquitectura de datos (patrón clave)

La capa de datos está **invertida**: la UI siempre llama a `getRepositories()` (`src/data/index.ts`) y nunca importa una implementación concreta.

- `src/data/repositories.ts` — interfaces de contrato (`Repositories`, `FeedRepository`, `ProspectRepository`, etc.). **Toda nueva operación de datos se declara primero aquí.**
- `src/data/supabase/` — implementación **activa** (Postgres + RLS, proyecto Supabase "Mercadeo"). Mapea snake_case ↔ camelCase. Crea un cliente server por request, así que RLS aplica con la sesión del usuario.
- `src/data/mock/` — implementación local-first con seeds en español (`seed-*.ts`). Fallback de desarrollo.
- `src/data/types.ts` — todos los modelos de dominio y sus enums + labels en español (`POST_TYPES`, `COURSE_LEVELS`, `PROSPECT_STAGES`, etc.).
- `NEXT_PUBLIC_DATA_SOURCE=mock|supabase` selecciona la implementación. **Hoy `supabase`** (ver `.env.local`).

Al añadir una capacidad de datos: añade el método a la interfaz en `repositories.ts`, impleméntalo en **ambas** (`supabase/` y `mock/`), y úsalo vía `getRepositories()`.

**Esquema y seed** viven en `supabase/migrations/`: `0001` (roles + helpers RLS), `0002` (multiempresa), `0003` (feed/academia/duplicación + vista `businesses_with_stats` + funciones `list_demo_users`/`increment_post_reaction`), `0004` (seed idempotente: usuarios `auth.users` + datos). Tras tocar el esquema, corre los Supabase advisors (regla del proyecto). Las escrituras de feed/prospectos/admin pasan por Server Actions que llaman al repositorio (`src/features/**/​*-actions.ts`).

## Multiempresa (multi-tenant)

Casi todas las entidades llevan `businessId: string | null`. Un `businessId` concreto = contenido propio de ese negocio; `null` = contenido global de plataforma visible para todos. Los filtros de repositorio aplican `scopeBusiness` (own OR null). Respeta este alcance al agregar queries o seeds.

**Hub de administración por negocio** (`/admin` + `/admin/[businessId]/<tab>`): el admin de plataforma gestiona todos los negocios; el líder (`leader` = "Admin de negocio") solo el suyo. Pestañas: Resumen, Academia (CRUD cursos/lecciones, **video por subida** a Storage), Audiolibros (CRUD + **audio por subida**), Novedades (feed del negocio), Mensajes (plantillas del negocio; las globales `null` son solo-lectura), **Líderes** (asignar/invitar varios líderes por negocio) y Ajustes. Guard `requireBusinessAdmin(businessId)` en `src/lib/session.ts` + RLS `is_business_admin` como defensa en capas. Acciones en `src/features/admin/*-actions.ts`. **Audiolibros** es además sección de cliente (`/audiolibros`, `audiobooks` repo, migración `0007`). Subidas de media: bucket público `business-media`, subida directa navegador→Storage vía `src/lib/supabase/storage.ts` + `src/components/ui/file-upload.tsx` (la URL pública se guarda en la BD). Crear líderes nuevos usa el cliente service-role (`src/lib/supabase/admin.ts`).

## Auth y autorización

- **Auth real (Supabase, producción)**: login **email + contraseña** (`src/app/(auth)/login/`, `signInWithPassword`). NO hay selector demo (se retiró junto con `list_demo_users`). `src/lib/session.ts` resuelve la sesión vía `supabase.auth.getUser()` + perfil; `getSession()`, `requireSession()`, `requireRole(min)`, `requireBusinessAdmin(businessId)` son `server-only` y redirigen. Cuenta admin de producción: **admin@mercadeo.com** (rota la contraseña). `src/proxy.ts` refresca sesión y protege rutas (públicas: login, registro, terminos, privacidad, offline).
- **RBAC** (`src/lib/rbac.ts`): jerarquía `member(0) < leader(1) < admin(2)`. `can(role, action)`; `academy.manage`/`feed.pin`/`admin.access` = `leader`; `users.manage` = `admin`. `leader` = "Admin de negocio", `admin` = "Admin de plataforma".
- **Defensa en capas**: el layout `(app)` exige `requireSession()`; el hub admin exige `requireRole("leader")` y cada negocio `requireBusinessAdmin(businessId)`; RLS (`is_business_admin`) es la segunda línea. La UI condicional por rol es solo UX. Lee `docs/security/security-model.md` (fuente de verdad de seguridad).

## IA real (Gemini) + Cumplimiento legal MLN (no romper)

Las salidas de IA usan **Gemini** vía REST (`src/lib/ai/gemini.ts` — `generateWithGemini`, soporta imagen/visión con `inline_data` y salida JSON; desactiva el "thinking" de 2.5 para no agotar tokens; si no hay `GEMINI_API_KEY` o falla, devuelve `null` y el llamador usa un fallback determinista). Config en `.env.local`: `GEMINI_API_KEY`, `GEMINI_MODEL` (default `gemini-2.5-flash`).

`src/lib/ai/compliance.ts` es un motor de reglas regex que bloquea/marca promesas de ingresos, comisiones por reclutar, afirmaciones de salud y presión artificial. **Toda** salida de IA pasa por `checkCompliance()` antes de responder, y si está `blocked` se fuerza la alternativa segura. Endpoints:
- `POST /api/ai/message` — genera un mensaje desde una plantilla + nombre del cliente (sección Mensajes: galería por emoción/situación → modal → resultado → WhatsApp).
- `POST /api/ai/conversation` — **copiloto de conversación** (doc §5.2.1): recibe una **captura de pantalla** (Gemini la lee) o texto + la **memoria del prospecto**, devuelve "lo que entendí" + 3 respuestas sugeridas + ficha actualizada. UI en `/duplicacion/prospectos/[prospectId]`.

**Memoria por prospecto** (la IA "conoce" a cada cliente): tabla `prospect_interactions` (timeline: cliente/vendedor/nota) + `prospects.ai_profile` (ficha sintetizada). Server actions en `src/features/duplication/conversation-actions.ts` (`recordExchangeAction`, `addProspectNoteAction`, `deleteInteractionAction`). Migración `0005_prospect_memory.sql`. Cualquier feature que genere texto hacia prospectos debe pasar por el filtro de cumplimiento. Estado: `safe | needs_review | blocked`. El contexto de negocio y los textos legales están en `proyecto_saas.docx` (raíz de `Mercadeo/`).

## Estructura de rutas (App Router, en español)

- `(auth)/login` — selección de perfil demo (público).
- `(app)/*` — área autenticada con shell (sidebar desktop + bottom nav móvil): `feed`, `academia/[courseSlug]/[lessonSlug]`, `duplicacion` (+ `guiones`, `recursos`, `prospectos`, `[playbookSlug]`), `mensajes`, `constancia`, `perfil`, `admin`.
- `registro/[businessSlug]` — alta pública por negocio.
- `api/ai/*`, `api/push/subscribe` — Route Handlers.

Componentes por dominio en `src/features/<dominio>/`; UI kit reutilizable en `src/components/ui/`; layout/shell en `src/components/layout/`.

## PWA + Push notifications (funcional)

Manifest dinámico en `src/app/manifest.ts`, página `offline`, prompt A2HS. El **service worker** (`public/sw.js`) cachea offline + maneja `push`/`notificationclick`; se registra en `src/components/pwa/service-worker-register.tsx` (OJO: registra de inmediato si `document.readyState==="complete"`, porque el efecto corre después del evento `load`). **Push real** end-to-end: VAPID (`NEXT_PUBLIC_VAPID_PUBLIC_KEY` + `VAPID_PRIVATE_KEY` + `VAPID_SUBJECT`), `/api/push/subscribe` persiste en `push_subscriptions` (RLS owner), `/api/push/send` envía con `web-push` (servidor → FCM → SW → notificación). Iconos: `scripts/gen-icons.mjs`.

## Constancia + gamificación + legal

- **Constancia** (`/constancia`, doc §5.2.2/§5.2.3): diario anti-rechazo con reencuadre IA real (`/api/ai/reframe`, Gemini + compliance) que persiste en `learnings`; panel de **gamificación por actividad** (racha, semana, puntos, logros) calculado en `activity.getStats`. **Se premia actividad, NUNCA resultados económicos.**
- **Actividad**: `activity_events` (migración `0006`) + helper `src/lib/activity.ts` (`logActivity`) llamado desde las server actions (prospecto, conversación, post, lección, aprendizaje). Nunca bloquea el flujo principal.
- **Legal**: páginas públicas `/terminos` y `/privacidad` (`src/app/terminos`, `/privacidad`, contenido del doc §6/§7), enlazadas desde login y el consentimiento del registro. Añadidas a `PUBLIC_PATHS` en `proxy.ts` + `lib/supabase/middleware.ts`.

@AGENTS.md
