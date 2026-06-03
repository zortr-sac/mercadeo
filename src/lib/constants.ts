/** Constantes centrales. Unica fuente de verdad: sin strings magicos en el resto del codigo. */

export const APP = {
  name: "Nexo Mentor",
  fullName: "Nexo Mentor",
  shortName: "Nexo",
  description:
    "SaaS de formacion, seguimiento y comunicacion asistida para vendedores de red de mercadeo.",
  themeColor: "#0f766e",
} as const;

/**
 * Roles del sistema.
 * admin = owner de la plataforma, leader = administrador de un negocio, member = cliente/vendedor.
 */
export const ROLES = {
  MEMBER: "member",
  LEADER: "leader",
  ADMIN: "admin",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

/** Jerarquia de permisos (mayor numero = mas permisos). */
export const ROLE_RANK: Record<Role, number> = {
  member: 0,
  leader: 1,
  admin: 2,
};

export const ROLE_LABELS: Record<Role, string> = {
  member: "Cliente",
  leader: "Admin de negocio",
  admin: "Admin plataforma",
};

/** Rutas de la aplicacion. Fuente unica para navegacion y guards. */
export const ROUTES = {
  home: "/",
  login: "/login",
  feed: "/feed",
  academia: "/academia",
  audiolibros: "/audiolibros",
  duplicacion: "/duplicacion",
  prospectos: "/duplicacion/prospectos",
  mensajes: "/mensajes",
  constancia: "/constancia",
  perfil: "/perfil",
  admin: "/admin",
  terminos: "/terminos",
  privacidad: "/privacidad",
} as const;

/** Pestañas del hub de administración por negocio. */
export const ADMIN_TABS = [
  "resumen",
  "academia",
  "audiolibros",
  "novedades",
  "mensajes",
  "lideres",
  "ajustes",
] as const;

export type AdminTab = (typeof ADMIN_TABS)[number];

export const ADMIN_TAB_LABELS: Record<AdminTab, string> = {
  resumen: "Resumen",
  academia: "Academia",
  audiolibros: "Audiolibros",
  novedades: "Novedades",
  mensajes: "Mensajes",
  lideres: "Líderes",
  ajustes: "Ajustes",
};

export function adminBusinessPath(
  businessId: string,
  tab: AdminTab = "resumen",
): string {
  return `/admin/${businessId}/${tab}`;
}

/** Nombre de la cookie de sesion (mock ahora; Supabase usa sus propias cookies en fase 2). */
export const SESSION_COOKIE = "nexo_mentor_session";

/** Fuente de datos activa: "mock" (local) o "supabase" (real). */
export const DATA_SOURCE: "mock" | "supabase" =
  process.env.NEXT_PUBLIC_DATA_SOURCE === "supabase" ? "supabase" : "mock";

export const DEFAULT_SUBSCRIPTION_PRICE_PEN = 15;

export const LEGAL_DISCLAIMERS = {
  sales:
    "Nexo Mentor es una plataforma de formacion y herramientas. No es una oportunidad de negocio, inversion ni programa de afiliacion. No garantiza ingresos ni resultados economicos.",
  signup:
    "Al crear mi cuenta acepto los Terminos y la Politica de Privacidad. Entiendo que la plataforma no garantiza ingresos y que soy responsable del uso que haga de sus herramientas.",
  ai:
    "Este contenido fue generado con ayuda de IA como sugerencia. Revisalo antes de enviarlo. No lo uses para prometer ingresos, garantizar ganancias ni captar personas con ofertas basadas en reclutamiento.",
  compliance:
    "Detectamos una frase que podria interpretarse como promesa de ingresos o garantia de resultados. Te sugerimos una alternativa mas segura.",
} as const;
