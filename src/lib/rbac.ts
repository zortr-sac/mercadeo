/** Control de acceso basado en roles (RBAC). Matriz de permisos por acción. */
import { ROLE_RANK, type Role } from "./constants";

/** Acciones protegidas de la app. */
export type Action =
  | "feed.create" // publicar en el feed
  | "feed.pin" // fijar publicaciones
  | "academy.manage" // CRUD de cursos
  | "users.manage" // gestionar usuarios
  | "team.view" // ver el equipo (downline)
  | "admin.access"; // acceder al panel de administración

/** Rango mínimo requerido por acción. */
const REQUIRED_RANK: Record<Action, number> = {
  "feed.create": ROLE_RANK.leader,
  "feed.pin": ROLE_RANK.leader,
  "academy.manage": ROLE_RANK.leader,
  "users.manage": ROLE_RANK.admin,
  "team.view": ROLE_RANK.leader,
  "admin.access": ROLE_RANK.leader,
};

/** ¿Puede `role` ejecutar `action`? */
export function can(role: Role, action: Action): boolean {
  return ROLE_RANK[role] >= REQUIRED_RANK[action];
}

/** ¿`role` tiene al menos el rango de `min`? */
export function hasAtLeast(role: Role, min: Role): boolean {
  return ROLE_RANK[role] >= ROLE_RANK[min];
}
