// TEMPORAL — setup de cuenta admin de prueba para E2E. Borrar tras el test.
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Faltan envs");
  process.exit(1);
}
const admin = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const email = "qa.admin@nexotest.com";
const password = "QaAdmin2026!";

const { data, error } = await admin.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
  user_metadata: { full_name: "QA Admin" },
});
if (error) {
  console.error("createUser error:", error.message);
  process.exit(1);
}
const { error: pErr } = await admin
  .from("profiles")
  .update({ role: "admin", email, full_name: "QA Admin", is_active: true })
  .eq("id", data.user.id);
if (pErr) {
  console.error("profile error:", pErr.message);
  process.exit(1);
}
console.log("OK admin creado:", data.user.id);
