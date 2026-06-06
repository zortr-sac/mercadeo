import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { MessageCircle, Phone, ShieldAlert } from "lucide-react";
import { logout } from "@/app/(auth)/login/actions";
import { PAYMENT, ROUTES } from "@/lib/constants";
import { requireSession } from "@/lib/session";
import { isExpired } from "@/lib/subscription";

export const metadata: Metadata = { title: "Suscripción suspendida" };

/**
 * Pantalla de bloqueo por impago. Vive FUERA del grupo (app), así que no carga la
 * navegación de la app: un cliente vencido no puede moverse por las secciones.
 * Solo la ven los clientes con suscripción vencida; el resto vuelve al inicio.
 */
export default async function SuspendidoPage() {
  const user = await requireSession();

  if (!(user.role === "member" && isExpired(user.subscriptionExpiresAt))) {
    redirect(ROUTES.home);
  }

  const phoneDisplay = `+51 ${PAYMENT.whatsappDisplay}`;
  const waMessage = encodeURIComponent(
    "Hola, mi suscripción venció y quiero renovar mi acceso.",
  );

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-background px-6 py-12 text-center">
      <div className="flex size-20 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <ShieldAlert className="size-10" aria-hidden />
      </div>

      <div className="space-y-2">
        <h1 className="font-display text-2xl font-bold tracking-tight">
          Tu suscripción venció
        </h1>
        <p className="max-w-sm text-base text-muted-foreground">
          Tu acceso está suspendido por falta de pago. Para reactivarlo, escríbenos
          o llámanos y con gusto te ayudamos a ponerte al día.
        </p>
      </div>

      <div className="w-full max-w-sm space-y-3">
        <a
          href={`https://wa.me/${PAYMENT.whatsappIntl}?text=${waMessage}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex w-full items-center justify-center gap-2 rounded-[var(--radius-md)] bg-brand-600 px-4 py-3 text-base font-semibold text-white transition-colors hover:bg-brand-700"
        >
          <MessageCircle className="size-5" aria-hidden />
          Escribir por WhatsApp
        </a>
        <a
          href={`tel:+${PAYMENT.whatsappIntl}`}
          className="inline-flex w-full items-center justify-center gap-2 rounded-[var(--radius-md)] border border-border bg-card px-4 py-3 text-base font-medium transition-colors hover:bg-muted"
        >
          <Phone className="size-5" aria-hidden />
          Llamar al {phoneDisplay}
        </a>
      </div>

      <form action={logout}>
        <button
          type="submit"
          className="text-base font-medium text-muted-foreground underline-offset-4 hover:underline"
        >
          Cerrar sesión
        </button>
      </form>
    </main>
  );
}
