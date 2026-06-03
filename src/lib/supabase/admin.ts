import "server-only";
import { createClient } from "@supabase/supabase-js";
import { env, serverEnv } from "@/lib/env";

/**
 * Cliente con service_role (server-only, bypassa RLS). Úsalo SOLO para
 * operaciones administrativas que no se pueden hacer con la sesión del usuario,
 * p. ej. crear cuentas de líderes. Nunca lo expongas al cliente.
 */
export function createAdminClient() {
  const key = serverEnv.SUPABASE_SERVICE_ROLE_KEY;
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  if (!key || !url) {
    throw new Error("Supabase service role / URL no configurados");
  }
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
