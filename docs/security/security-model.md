# HGW — Modelo de Seguridad (Roles, RLS, Auth)

> App interna MLN para líderes HGW. PWA, Next.js 14 App Router + Supabase.
> Estrategia: **local-first** (mock + capa de datos abstraída) y luego Supabase real.
> Este documento es la **fuente de verdad** del modelo de seguridad. El esquema SQL/RLS
> de `supabase/migrations/0001_security_baseline.sql` debe mantenerse consistente con él.

## 1. Principios

1. **Zero-trust en el cliente**: el cliente NUNCA es autoridad. Toda decisión de
   autorización se valida en servidor (RLS en DB + checks en Server Components / Route Handlers).
2. **Deny-by-default**: cada tabla con `ENABLE ROW LEVEL SECURITY` sin policy = sin acceso.
   Se abren permisos explícitamente.
3. **Menor privilegio**: Miembro consume, Líder publica a su equipo, Admin gestiona todo.
4. **`service_role` jamás llega al navegador**: solo en server (Route Handlers / Edge Functions),
   y solo cuando RLS no alcanza (jobs administrativos, seeding).
5. **El rol vive en la DB, no en el JWT editable por el cliente**: el rol se resuelve
   desde la tabla `profiles` (y se cachea en `app_metadata`, que el cliente no puede modificar).
6. **Local-first sin agujeros**: la capa mock debe **emular** las mismas reglas de
   autorización para que migrar a Supabase no introduzca permisos nuevos por accidente.

## 2. Roles

| Rol | Código | Descripción | Alcance de datos |
|-----|--------|-------------|------------------|
| Admin | `admin` | Gestiona todo: usuarios, contenido, anuncios, academia, configuración | Global (todos los equipos) |
| Líder | `leader` | Ve y gestiona su equipo; publica contenido/anuncios a su equipo | Su `team_id` (y descendentes si hay jerarquía) |
| Miembro | `member` | Consume contenido, marca progreso, reacciona | Su `team_id` (lectura) + sus propios registros |

Reglas de transición de rol:
- Solo **Admin** cambia roles. Un Líder **no** puede auto-promoverse ni promover a otros.
- El rol se persiste en `profiles.role` (enum) y se sincroniza a `auth.users.app_metadata.role`
  vía trigger/Edge Function para tenerlo disponible en el JWT (claim no editable por cliente).

## 3. Matriz de permisos por módulo

Leyenda: **C**=Crear, **R**=Leer, **U**=Actualizar, **D**=Borrar, **—**=sin acceso.
"propio" = solo sus registros. "equipo" = registros de su `team_id`. "global" = todo.

### Módulo 1 — Sistema de Duplicación (presentaciones de negocio/producto)
| Acción | Admin | Líder | Miembro |
|--------|-------|-------|---------|
| Presentaciones/guiones (plantillas) | CRUD global | R (todas publicadas) + C/U/D propias de su equipo | R (publicadas) |
| Recursos/assets de duplicación | CRUD global | CRUD equipo | R |
| Registrar "presentación realizada" (tracking) | R global | R equipo + CU propio | CU propio |
| Compartir enlace de presentación | R global | C/R equipo | C/R propio |

### Módulo 2 — Academia / Formación
| Acción | Admin | Líder | Miembro |
|--------|-------|-------|---------|
| Cursos / módulos / lecciones | CRUD global | R (publicados) + C/U/D propios (cursos de equipo) | R (publicados) |
| Publicar/despublicar curso | U global | U propios | — |
| Progreso de lección (`enrollments`/`progress`) | R global | R equipo + CU propio | CRU propio |
| Quizzes / resultados | CRUD global | R equipo + CU propio | CU propio |
| Certificados | C/R global | R equipo | R propio |

### Módulo 3 — Feed + Anuncios
| Acción | Admin | Líder | Miembro |
|--------|-------|-------|---------|
| Posts del feed | CRUD global | C/R/U/D propios (a su equipo) | R (equipo) + C/U/D propios si se habilita |
| Anuncios oficiales (`announcements`) | CRUD global | C/U/D para su equipo | R |
| Fijar anuncio (pin) | U global | U equipo | — |
| Comentarios | CRUD global (moderación) | CRU propio + D en su equipo (moderación) | CRU propio + D propio |
| Reacciones / likes | R global | CRUD propio | CRUD propio |

### Transversal — Usuarios y administración
| Acción | Admin | Líder | Miembro |
|--------|-------|-------|---------|
| Ver perfil propio | RU | RU | RU |
| Ver perfiles del equipo | R global | R equipo | R equipo (básico) |
| Crear/invitar usuarios | C global | C en su equipo (invitación, rol fijo `member`) | — |
| Cambiar rol de usuario | U global | — | — |
| Configuración de la app (`app_settings`) | CRUD | R | R |
| Audit log | R | — | — |

## 4. Modelo de datos (resumen, para RLS)

Tablas núcleo (esquema completo en la migración SQL):
- `profiles` (1:1 con `auth.users`): `id`, `role` (enum `app_role`), `team_id`, `full_name`, `status`.
- `teams`: `id`, `name`, `leader_id`, `parent_team_id` (jerarquía opcional).
- `presentations`, `presentation_resources`, `presentation_events` (Duplicación).
- `courses`, `modules`, `lessons`, `enrollments`, `lesson_progress`, `quiz_results`, `certificates` (Academia).
- `posts`, `announcements`, `comments`, `reactions` (Feed).
- `app_settings`, `audit_log` (transversal).

Columnas clave para autorización: `owner_id` (uuid → `auth.uid()`), `team_id`, `is_published`/`status`.

## 5. Funciones helper de autorización (SECURITY DEFINER, sin recursión)

Para evitar recursión de RLS (policy de `profiles` que consulta `profiles`), el rol y el
`team_id` se exponen vía funciones `SECURITY DEFINER` que leen `profiles` saltándose RLS,
o directamente desde el JWT (`app_metadata`). Definidas en la migración:
- `auth.user_role()` → `app_role` (lee `app_metadata.role`, fallback a `profiles`).
- `auth.user_team_id()` → `uuid`.
- `auth.is_admin()` → `boolean`.
- `auth.is_leader_of(target_team uuid)` → `boolean`.

## 6. Flujo de autenticación (Supabase Auth)

```
[PWA / Next.js App Router]
        |
        | 1. Login: email+password u OTP (magic link). Sesión en cookies httpOnly
        |    vía @supabase/ssr (NO localStorage → evita robo por XSS).
        v
[Supabase Auth]  --(2. emite JWT con app_metadata.role)-->  cookies de sesión
        |
        | 3. Trigger on auth.users INSERT -> crea profiles(role='member' por defecto)
        |    + Edge Function/trigger sincroniza role -> app_metadata (claim firmado)
        v
[Server Components / Route Handlers]
        | 4. createServerClient() lee cookies, valida sesión, resuelve rol server-side
        | 5. RLS en cada query aplica el rol/team -> defensa en profundidad
        v
[Respuesta]  (UI condicional por rol = solo UX, NUNCA seguridad)
```

Decisiones:
- **`@supabase/ssr`** con cookies httpOnly + `sameSite=lax` + `secure` en prod. Nunca tokens en JS.
- **Métodos**: email+password con política de contraseña fuerte, o **magic link/OTP** (preferido para
  no gestionar contraseñas). MFA (TOTP) recomendado para Admin/Líder en v2.
- **Registro cerrado**: signups públicos **deshabilitados** en Supabase. Alta solo por invitación
  (Admin global, Líder dentro de su equipo). Evita que cualquiera entre a la app interna.
- **Rol por defecto** al crear usuario: `member`. Promoción solo por Admin.
- **Rotación de sesión** y `refresh token` gestionados por `@supabase/ssr` en middleware.

## 7. Local-first: paridad de seguridad

- Capa de datos abstraída: `interface DataProvider` con dos implementaciones: `MockDataProvider`
  y `SupabaseDataProvider`. **Ambas reciben el `currentUser` (id, role, team_id)** y aplican
  las mismas reglas de visibilidad/escritura de la sección 3.
- El mock NO debe devolver datos de otros equipos a un Miembro/Líder, ni permitir escrituras
  fuera de alcance, aunque "no haya servidor". Así la migración a RLS no abre huecos.
- Los IDs/roles mock se cargan desde un fixture controlado, nunca desde input del usuario.
- Flag de entorno `NEXT_PUBLIC_DATA_SOURCE=mock|supabase` selecciona el provider.

## 8. Protección de rutas en App Router

- **`middleware.ts`**: refresca sesión (`@supabase/ssr`) y redirige a `/login` si no hay sesión
  para rutas bajo `/(app)`. El middleware es la primera barrera, NO la única.
- **Layouts de segmento protegido** (`app/(app)/layout.tsx`): `getUser()` server-side; si no hay
  usuario → `redirect('/login')`. Para rutas admin (`app/(app)/admin/...`): verificar
  `role === 'admin'` server-side → `notFound()`/`redirect` si no.
- **Route Handlers / Server Actions**: revalidar sesión y rol en cada handler con un guard
  `requireRole(['admin'])`. Nunca confiar en que el middleware ya filtró.
- **Server Actions**: validar input con Zod, comprobar `auth.uid()` y permisos antes de mutar.
- La UI muestra/oculta por rol solo por UX; la autorización real es server + RLS.

## 9. Notas de seguridad (checklist)

- [ ] `service_role` SOLO en server (env sin `NEXT_PUBLIC_`); jamás importarla en componentes cliente.
- [ ] Cliente usa SOLO la `anon` key (publishable). Verificar que no se filtre `service_role`.
- [ ] RLS **habilitado en TODAS** las tablas de negocio + `FORCE ROW LEVEL SECURITY` donde aplique.
- [ ] Storage: buckets privados por defecto; policies por `team_id`/`owner`; URLs firmadas con expiración.
- [ ] Validación server-side con Zod en Server Actions y Route Handlers (no solo en el form).
- [ ] Sanitizar todo HTML/markdown renderizado (feed, lecciones) → DOMPurify; evitar `dangerouslySetInnerHTML` sin sanitizar.
- [ ] Cookies de sesión `httpOnly` + `secure` + `sameSite=lax`. Nada de JWT en `localStorage`.
- [ ] Rate limiting en login y endpoints de escritura (Supabase Auth + límite en Route Handlers/Edge).
- [ ] CSP estricta + headers de seguridad (`X-Frame-Options=DENY`, `X-Content-Type-Options=nosniff`,
      `Referrer-Policy`, `Permissions-Policy`) en `next.config` / middleware.
- [ ] Registro público deshabilitado; alta solo por invitación.
- [ ] `audit_log` para acciones sensibles (cambio de rol, borrado de contenido, alta/baja de usuario).
- [ ] Secretos en variables de entorno / vault; nunca commiteados. `.env.local` en `.gitignore`.
- [ ] Migrar a RLS antes de exponer la PWA a usuarios reales; nunca dejar tablas "abiertas temporalmente".
- [ ] Revisar `get_advisors` de Supabase (security) tras cada migración.
