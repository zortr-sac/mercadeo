import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/constants";

/** /duplicacion/prospectos moved to /vender/prospectos in the NetScale redesign. */
export default function ProspectosRedirect() {
  redirect(ROUTES.prospectos);
}
