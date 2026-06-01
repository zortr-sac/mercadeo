import { z } from "zod";

/**
 * Validación de variables de entorno con Zod.
 * Las variables NEXT_PUBLIC_* son seguras para el cliente.
 * SUPABASE_SERVICE_ROLE_KEY y VAPID_PRIVATE_KEY NUNCA deben exponerse al cliente.
 */
const clientSchema = z.object({
  NEXT_PUBLIC_DATA_SOURCE: z.enum(["mock", "supabase"]).default("mock"),
  NEXT_PUBLIC_APP_NAME: z.string().default("HGW"),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional().or(z.literal("")),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional().or(z.literal("")),
});

/** Acceso tipado a env del cliente. Falla rápido si hay configuración inválida. */
export const env = clientSchema.parse({
  NEXT_PUBLIC_DATA_SOURCE: process.env.NEXT_PUBLIC_DATA_SOURCE,
  NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
});
