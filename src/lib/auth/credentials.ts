import "server-only";

/** Solo los dígitos del teléfono (quita espacios, guiones, paréntesis, +). */
export function normalizePhone(phone: string): string {
  return phone.replace(/\D+/g, "");
}

/**
 * Email sintético interno para Supabase Auth. El miembro NUNCA lo ve: solo usa
 * su teléfono + PIN. Es único por teléfono + negocio y no se le envía correo
 * (las cuentas se crean con email_confirm).
 */
export function memberEmail(phone: string, slug: string): string {
  return `${normalizePhone(phone)}@${slug}.members.netscale.app`;
}

/**
 * Convierte el PIN de 4 dígitos en una contraseña determinista de ≥6 caracteres
 * para Supabase (que exige longitud mínima). La seguridad la da el PIN, no esta
 * transformación; se aplica la MISMA fórmula al crear y al iniciar sesión.
 */
export function pinToPassword(pin: string): string {
  return `ns-pin-${normalizePhone(pin)}`;
}
