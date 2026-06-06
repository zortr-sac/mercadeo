import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/constants";

/** /mensajes moved to /vender/mensajes in the NetScale redesign. */
export default function MensajesRedirect() {
  redirect(ROUTES.mensajes);
}
