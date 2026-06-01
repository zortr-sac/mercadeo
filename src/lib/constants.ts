/** Constantes centrales de HGW. Única fuente de verdad: sin strings mágicos en el resto del código. */

export const APP = {
  name: "HGW",
  fullName: "HGW Líderes",
  shortName: "HGW",
  description: "Plataforma de formación, información y duplicación para líderes HGW.",
  themeColor: "#2563eb",
} as const;

/**
 * Roles del sistema. Valores en inglés para alinear con el enum `user_role` de Supabase (fase 2).
 * Las etiquetas visibles van en español.
 */
export const ROLES = {
  MEMBER: "member",
  LEADER: "leader",
  ADMIN: "admin",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

/** Jerarquía de permisos (mayor número = más permisos). */
export const ROLE_RANK: Record<Role, number> = {
  member: 0,
  leader: 1,
  admin: 2,
};

export const ROLE_LABELS: Record<Role, string> = {
  member: "Miembro",
  leader: "Líder",
  admin: "Administrador",
};

/** Rutas de la aplicación. Fuente única para navegación y guards. */
export const ROUTES = {
  home: "/",
  login: "/login",
  feed: "/feed",
  academia: "/academia",
  duplicacion: "/duplicacion",
  prospectos: "/duplicacion/prospectos",
  perfil: "/perfil",
  admin: "/admin",
} as const;

/** Nombre de la cookie de sesión (mock ahora; Supabase usa sus propias cookies en fase 2). */
export const SESSION_COOKIE = "hgw_session";

/** Fuente de datos activa: "mock" (local) o "supabase" (real). */
export const DATA_SOURCE: "mock" | "supabase" =
  process.env.NEXT_PUBLIC_DATA_SOURCE === "supabase" ? "supabase" : "mock";
