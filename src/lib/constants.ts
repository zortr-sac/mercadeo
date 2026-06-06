/** Constantes centrales. Unica fuente de verdad: sin strings magicos en el resto del codigo. */

export const APP = {
  name: "NetScale",
  fullName: "NetScale",
  shortName: "NetScale",
  description:
    "Tu negocio, paso a paso. Formacion, herramientas e IA para vendedores de red de mercadeo.",
  themeColor: "#1D4ED8",
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
  bienvenida: "/bienvenida",
  login: "/login",
  academia: "/academia",
  crear: "/crear",
  vender: "/vender",
  audiolibros: "/audiolibros",
  descargados: "/descargados",
  duplicacion: "/duplicacion",
  prospectos: "/vender/prospectos",
  mensajes: "/vender/mensajes",
  constancia: "/constancia",
  progreso: "/progreso",
  perfil: "/perfil",
  admin: "/admin",
  terminos: "/terminos",
  privacidad: "/privacidad",
  suspendido: "/suspendido",
} as const;

/** Pestañas del hub de administración por negocio. */
export const ADMIN_TABS = [
  "resumen",
  "academia",
  "audiolibros",
  "mensajes",
  "lideres",
  "consumo",
  "suscripciones",
  "ajustes",
] as const;

export type AdminTab = (typeof ADMIN_TABS)[number];

export const ADMIN_TAB_LABELS: Record<AdminTab, string> = {
  resumen: "Resumen",
  academia: "Academia",
  audiolibros: "Audiolibros",
  mensajes: "Mensajes",
  lideres: "Líderes",
  consumo: "Consumo",
  suscripciones: "Suscripciones",
  ajustes: "Ajustes",
};

export function adminBusinessPath(
  businessId: string,
  tab: AdminTab = "resumen",
): string {
  return `/admin/${businessId}/${tab}`;
}

/** Ruta base de gestión de Academia de un negocio. */
export function academyBasePath(businessId: string): string {
  return `/admin/${businessId}/academia`;
}

/** Nombre de la cookie de sesion (mock ahora; Supabase usa sus propias cookies en fase 2). */
export const SESSION_COOKIE = "nexo_mentor_session";

/** Cookie: negocio que el admin de plataforma previsualiza "como miembro". */
export const PREVIEW_COOKIE = "ns_preview_business";

/** Cookie del token de sesión única (anti-cuenta-compartida). */
export const SESSION_ID_COOKIE = "ns_sid";

/** Cookie con el slug del negocio del miembro (destino al expulsar su sesión). */
export const MEMBER_SLUG_COOKIE = "ns_member_slug";

/**
 * Primeros segmentos de ruta reservados por la app. Cualquier OTRO primer
 * segmento (`/{slug}`) se interpreta como el login público de un negocio.
 * Al añadir una ruta de primer nivel nueva, agrégala aquí.
 */
export const RESERVED_ROOT_SEGMENTS = new Set([
  "bienvenida",
  "login",
  "offline",
  "registro",
  "terminos",
  "privacidad",
  "suspendido",
  "academia",
  "crear",
  "vender",
  "audiolibros",
  "descargados",
  "duplicacion",
  "constancia",
  "progreso",
  "perfil",
  "admin",
  "api",
  "manifest.webmanifest",
  "sw.js",
  "icons",
]);

/** True si la ruta es el login público de un negocio (`/{slug}`). */
export function isBusinessLoginPath(pathname: string): boolean {
  const seg = pathname.split("/")[1] ?? "";
  return seg.length > 0 && !RESERVED_ROOT_SEGMENTS.has(seg);
}

/** Fuente de datos activa: "mock" (local) o "supabase" (real). */
export const DATA_SOURCE: "mock" | "supabase" =
  process.env.NEXT_PUBLIC_DATA_SOURCE === "supabase" ? "supabase" : "mock";

/**
 * Pago y contacto de la plataforma. Mientras no exista pasarela de pago, el
 * alta de clientes se cierra por WhatsApp + Yape a este número. Fuente única:
 * cambia el monto o el número aquí y se refleja en todo el flujo de registro.
 */
export const PAYMENT = {
  pricePen: 30,
  /** Número local para mostrar al usuario. */
  whatsappDisplay: "908 765 016",
  /** Formato internacional (Perú +51) para enlaces wa.me. */
  whatsappIntl: "51908765016",
  yapeDisplay: "908 765 016",
} as const;

export const DEFAULT_SUBSCRIPTION_PRICE_PEN = PAYMENT.pricePen;

/**
 * Parámetros de la suscripción mensual por cliente.
 * - reminderDaysBefore: días antes del vencimiento en que se envía el push.
 * - expiringSoonDays: umbral para marcar "por vencer" en el panel admin.
 * - periodMonths: duración de un período al registrar un pago.
 */
export const SUBSCRIPTION = {
  reminderDaysBefore: 1,
  expiringSoonDays: 3,
  periodMonths: 1,
} as const;

export const LEGAL_DISCLAIMERS = {
  sales:
    "NetScale es una plataforma de formacion y herramientas. No es una oportunidad de negocio, inversion ni programa de afiliacion. No garantiza ingresos ni resultados economicos.",
  signup:
    "Al crear mi cuenta acepto los Terminos y la Politica de Privacidad. Entiendo que la plataforma no garantiza ingresos y que soy responsable del uso que haga de sus herramientas.",
  ai:
    "Este contenido fue generado con ayuda de IA como sugerencia. Revisalo antes de enviarlo. No lo uses para prometer ingresos, garantizar ganancias ni captar personas con ofertas basadas en reclutamiento.",
  compliance:
    "Detectamos una frase que podria interpretarse como promesa de ingresos o garantia de resultados. Te sugerimos una alternativa mas segura.",
} as const;
