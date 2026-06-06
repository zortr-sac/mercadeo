import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/constants";

/** /constancia was renamed to /progreso in the NetScale redesign. */
export default function ConstanciaPage() {
  redirect(ROUTES.progreso);
}
