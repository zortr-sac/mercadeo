"use client";
// Pantalla 17 — Mi perfil. Ported 1:1 from prototipo/screens-perfil.jsx,
// wired to the real session + logout.
import { useRouter } from "next/navigation";
import { TopBarMain, Card, IconCircle, Chip, Btn, Toast, useToast } from "@/components/netscale/ui";
import type { Tone } from "@/components/netscale/ui";
import { Icon, type IconName } from "@/components/netscale/icons";
import { ROUTES } from "@/lib/constants";
import { logout } from "@/app/(auth)/login/actions";
import { PushNotificationManager } from "@/components/pwa/push-notification-manager";

type Role = "member" | "leader" | "admin";
const ROLE_CHIP: Record<Role, { label: string; icon: IconName; tone: Tone }> = {
  member: { label: "Vendedor", icon: "star", tone: "blue" },
  leader: { label: "Líder", icon: "crown", tone: "blue" },
  admin: { label: "Admin", icon: "crown", tone: "orange" },
};

export function PerfilScreen({
  fullName, initials, role, userId, businessId,
}: { fullName: string; initials: string; role: Role; userId: string; businessId: string | null }) {
  const router = useRouter();
  const [msg, flash] = useToast();
  const isLeader = role === "leader" || role === "admin";
  const chip = ROLE_CHIP[role];

  const rows: { icon: IconName; label: string; go: () => void }[] = [
    ...(isLeader ? [{ icon: "users" as IconName, label: "Mi equipo", go: () => router.push(ROUTES.admin) }] : []),
    { icon: "trophy", label: "Mi progreso", go: () => router.push(ROUTES.progreso) },
    { icon: "headphones", label: "Audiolibros", go: () => router.push(ROUTES.audiolibros) },
    { icon: "download", label: "Descargados", go: () => router.push(ROUTES.descargados) },
    { icon: "help", label: "Ayuda", go: () => flash("Escríbele a tu líder si necesitas ayuda.") },
  ];

  return (
    <>
      <TopBarMain title="Mi perfil" />
      <div className="ns-scroll ns-pad" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, paddingTop: 4 }}>
          <div style={{
            width: 96, height: 96, borderRadius: 999, display: "grid", placeItems: "center",
            background: "linear-gradient(135deg, var(--blue), var(--blue-dark))", color: "#fff",
            fontFamily: "var(--font-head)", fontWeight: 600, fontSize: 34, boxShadow: "var(--shadow-card)",
          }}>{initials}</div>
          <h1 style={{ fontSize: 24 }}>{fullName}</h1>
          <Chip tone={chip.tone} icon={chip.icon}>{chip.label}</Chip>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {rows.map((r) => (
            <Card key={r.label} onClick={r.go} pad={14}
              style={{ display: "flex", alignItems: "center", gap: 14, minHeight: 72 }}>
              <IconCircle icon={r.icon} tone="blue" size={48} />
              <span style={{ flex: 1, fontSize: 20, fontWeight: 600 }}>{r.label}</span>
              <Icon name="chevR" size={24} color="var(--locked)" strokeWidth={2.4} />
            </Card>
          ))}
        </div>
        <PushNotificationManager userId={userId} businessId={businessId} />
        <form action={logout}>
          <Btn type="submit" size="lg" variant="danger" icon="logout">Cerrar sesión</Btn>
        </form>
      </div>
      <Toast show={!!msg}>{msg}</Toast>
    </>
  );
}
