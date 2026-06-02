# Mercadeo — Nexo Mentor

SaaS multiempresa (PWA) para vendedores de red de mercadeo: academia, CRM simple,
**copiloto de IA** (mensajes por situación y asistente de conversación con captura),
memoria por prospecto, módulo de **constancia** con gamificación por actividad,
recordatorios **push** y **Modo Cumplimiento** legal.

## Stack

- **Next.js 16** (App Router) · React 19 · TypeScript strict · Tailwind v4
- **Supabase** (Postgres + Auth + RLS) como backend
- **Google Gemini** para la IA (texto y visión), con filtro de cumplimiento propio
- **Web Push** (VAPID) para notificaciones

## Desarrollo local

```bash
npm install
cp .env.example .env.local   # y rellena los valores
npm run dev                  # http://localhost:3000
```

Comandos: `npm run dev` · `npm run build` · `npm start` · `npm run typecheck` · `npm run lint`.

## Configuración (Supabase + IA + Push)

1. **Base de datos**: aplica las migraciones de `supabase/migrations/` (esquema + RLS).
   `supabase/seed-demo.sql` es **opcional** (datos de prueba) — no usar en producción.
2. **Variables de entorno**: ver `.env.example`. Las claves server-only (service role,
   VAPID privada, Gemini) nunca llevan prefijo `NEXT_PUBLIC_`.
3. **Push**: genera llaves con `npx web-push generate-vapid-keys`.
4. **Cuenta inicial**: crea un usuario admin en Supabase Auth y su fila en `profiles`
   con `role = 'admin'`.

## Autenticación

Login real con **correo y contraseña** (Supabase Auth, cookies httpOnly vía
`@supabase/ssr`). El registro de clientes es por negocio en `/registro/[slug]`.
La autorización se valida en servidor (guards `requireSession`/`requireRole`) + RLS.

## Rutas clave

`/login` · `/admin` · `/mensajes` · `/duplicacion/prospectos` · `/constancia` ·
`/academia` · `/feed` · `/registro/[businessSlug]` · `/terminos` · `/privacidad`

## Líneas rojas de producto

- No promete ingresos ni resultados económicos.
- No calcula comisiones, downlines ni e-wallets. No paga por reclutar.
- La IA bloquea o marca promesas de ingreso, reclutamiento por comisiones y claims de salud.
- La gamificación premia **actividad y constancia**, nunca ingresos.

## Despliegue

App lista para Vercel (Next.js). Configura las variables de entorno del proyecto y
apunta `NEXT_PUBLIC_APP_URL` al dominio. `NEXT_PUBLIC_DATA_SOURCE=supabase`.
