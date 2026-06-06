import type { Metadata } from "next";
import { requireSession } from "@/lib/session";
import { PerfilScreen } from "@/features/perfil/perfil-screen";

export const metadata: Metadata = { title: "Mi perfil" };

export default async function PerfilPage() {
  const user = await requireSession();
  const initials =
    user.fullName
      .split(" ")
      .map((w) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "U";
  return (
    <PerfilScreen
      fullName={user.fullName}
      initials={initials}
      role={user.role}
      userId={user.id}
      businessId={user.businessId}
    />
  );
}
