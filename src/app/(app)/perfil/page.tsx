import type { Metadata } from "next";
import { Mail, MapPin, Phone, Users } from "lucide-react";
import { getRepositories } from "@/data";
import { Container, PageHeader } from "@/components/layout/page-header";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ROLE_LABELS } from "@/lib/constants";
import { longDate } from "@/lib/format";
import { can } from "@/lib/rbac";
import { requireSession } from "@/lib/session";
import { LogoutButton } from "@/features/dashboard/logout-button";

export const metadata: Metadata = { title: "Mi perfil" };

export default async function PerfilPage() {
  const user = await requireSession();
  const team = can(user.role, "team.view")
    ? await getRepositories().users.getTeam(user.id)
    : [];

  return (
    <Container>
      <PageHeader title="Mi perfil" />

      <Card className="mt-6 overflow-hidden">
        <div className="h-20 gradient-brand" />
        <div className="px-5 pb-5">
          <div className="-mt-10 flex items-end gap-4">
            <Avatar
              name={user.fullName}
              src={user.avatarUrl}
              size="lg"
              className="ring-4 ring-card"
            />
            <div className="pb-1">
              <Badge variant={user.role === "admin" ? "gold" : "default"}>
                {ROLE_LABELS[user.role]}
              </Badge>
            </div>
          </div>
          <h2 className="mt-3 font-display text-xl font-bold">
            {user.fullName}
          </h2>
          {user.rank && (
            <p className="text-sm text-gold-600">Rango: {user.rank}</p>
          )}

          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="size-4" />
              {user.email}
            </div>
            {user.phone && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="size-4" />
                {user.phone}
              </div>
            )}
            {user.country && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="size-4" />
                {user.country}
              </div>
            )}
          </dl>
          <p className="mt-3 text-xs text-muted-foreground">
            Miembro desde {longDate(user.joinedAt)}
          </p>
        </div>
      </Card>

      {can(user.role, "team.view") && (
        <Card className="mt-5 p-5">
          <h3 className="mb-3 flex items-center gap-2 font-display text-base font-semibold">
            <Users className="size-5 text-brand-600" />
            Mi equipo ({team.length})
          </h3>
          {team.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Aún no tienes miembros en tu equipo.
            </p>
          ) : (
            <div className="space-y-2">
              {team.map((member) => (
                <div key={member.id} className="flex items-center gap-3">
                  <Avatar
                    name={member.fullName}
                    src={member.avatarUrl}
                    size="sm"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {member.fullName}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {ROLE_LABELS[member.role]}
                      {member.rank ? ` · ${member.rank}` : ""}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      <div className="mt-6">
        <LogoutButton />
      </div>
    </Container>
  );
}
