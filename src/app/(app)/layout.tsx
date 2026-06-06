import { redirect } from "next/navigation";
import { SessionProvider } from "@/components/session-provider";
import { InstallPrompt } from "@/components/pwa/install-prompt";
import { OfflineBootstrap } from "@/components/offline/offline-bootstrap";
import { NetScaleShell } from "@/components/netscale/shell";
import { PreviewBar } from "@/components/netscale/preview-bar";
import { getRepositories } from "@/data";
import { requireSession } from "@/lib/session";
import { getEffectiveBusiness } from "@/lib/active-business";
import { isExpired } from "@/lib/subscription";
import { ROUTES } from "@/lib/constants";

/** NetScale client shell: mobile-first column + bottom nav. */
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireSession();
  const { businessId, preview } = await getEffectiveBusiness(user);

  // A platform admin doesn't use the client app directly: unless they are
  // previewing a business "as a member", send them to their dashboard.
  if (user.role === "admin" && !preview) {
    redirect(ROUTES.admin);
  }

  // Cliente (member) con suscripción vencida → pantalla de suspensión por impago.
  // Líderes y admin de plataforma no tienen suscripción, así que nunca se bloquean.
  if (user.role === "member" && isExpired(user.subscriptionExpiresAt)) {
    redirect(ROUTES.suspendido);
  }

  // Color de marca del negocio: la app del cliente es unicolor y lo adopta.
  let brandColor = preview?.primaryColor ?? null;
  if (!brandColor && businessId) {
    const business = await getRepositories().businesses.getById(businessId);
    brandColor = business?.primaryColor ?? null;
  }

  return (
    <SessionProvider user={user}>
      <NetScaleShell
        brandColor={brandColor}
        topBar={preview ? <PreviewBar businessName={preview.name} /> : undefined}
      >
        {children}
      </NetScaleShell>
      <InstallPrompt />
      <OfflineBootstrap />
    </SessionProvider>
  );
}
