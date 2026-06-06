"use client";

import { useRouter } from "next/navigation";
import {
  Copy,
  Crown,
  KeyRound,
  Lock,
  Mail,
  UserMinus,
  UserPlus,
  Users,
} from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Field, Input } from "@/components/ui/field";
import { ROLE_LABELS, type Role } from "@/lib/constants";
import type { Profile } from "@/data/types";
import { ManagerCard, ManagerHeader, ManagerRow, NoticePanel } from "./admin-ui";
import {
  addMemberAction,
  assignLeaderAction,
  changeMemberPinAction,
  demoteToMemberAction,
  inviteLeaderAction,
  removeFromBusinessAction,
} from "./team-actions";

const ROLE_BADGE: Record<Role, "gold" | "default" | "muted"> = {
  admin: "gold",
  leader: "default",
  member: "muted",
};

/**
 * Gestión del equipo del negocio. El admin/líder puede **agregar miembros**
 * (teléfono + PIN) y cambiarles el PIN. Solo el admin de plataforma puede
 * invitar/asignar líderes.
 */
export function TeamManager({
  businessId,
  businessSlug,
  members,
  canManage,
}: {
  businessId: string;
  businessSlug: string;
  members: Profile[];
  canManage: boolean;
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [pending, startTransition] = useTransition();
  const [actingId, setActingId] = useState<string | null>(null);
  const [tempPassword, setTempPassword] = useState<{
    email: string;
    password: string;
  } | null>(null);

  // Alta de miembro con teléfono + PIN.
  const [mName, setMName] = useState("");
  const [mPhone, setMPhone] = useState("");
  const [mPin, setMPin] = useState("");
  const [createdMember, setCreatedMember] = useState<{
    phone: string;
    pin: string;
  } | null>(null);

  function addMember(event: React.FormEvent) {
    event.preventDefault();
    if (mName.trim().length < 2) {
      toast.error("Escribe el nombre del miembro.");
      return;
    }
    if (mPhone.replace(/\D+/g, "").length < 6) {
      toast.error("Escribe un teléfono válido.");
      return;
    }
    if (mPin.length !== 4) {
      toast.error("El PIN debe tener 4 números.");
      return;
    }
    startTransition(async () => {
      try {
        const res = await addMemberAction(businessId, {
          name: mName,
          phone: mPhone,
          pin: mPin,
        });
        setCreatedMember({ phone: res.phone, pin: res.pin });
        setMName("");
        setMPhone("");
        setMPin("");
        toast.success("Miembro creado.");
        router.refresh();
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "No se pudo crear el miembro.",
        );
      }
    });
  }

  function changePin(member: Profile) {
    const pin = window.prompt(`Nuevo PIN de 4 números para ${member.fullName}:`);
    if (pin == null) return;
    const clean = pin.replace(/\D+/g, "");
    if (clean.length !== 4) {
      toast.error("El PIN debe tener 4 números.");
      return;
    }
    runAction(
      member.id,
      () => changeMemberPinAction(businessId, member.id, clean),
      "PIN actualizado.",
    );
  }

  function invite(event: React.FormEvent) {
    event.preventDefault();
    const clean = email.trim().toLowerCase();
    if (!clean.includes("@")) {
      toast.error("Escribe un correo válido.");
      return;
    }
    startTransition(async () => {
      try {
        const result = await inviteLeaderAction(businessId, clean);
        if (result.status === "created" && result.tempPassword) {
          setTempPassword({ email: result.email, password: result.tempPassword });
          toast.success("Cuenta creada y asignada como líder.");
        } else {
          toast.success("Persona asignada como líder.");
        }
        setEmail("");
        router.refresh();
      } catch {
        toast.error("No se pudo invitar a la persona.");
      }
    });
  }

  function runAction(
    id: string,
    action: () => Promise<void>,
    successMessage: string,
  ) {
    setActingId(id);
    startTransition(async () => {
      try {
        await action();
        toast.success(successMessage);
        router.refresh();
      } catch {
        toast.error("No se pudo completar la acción.");
      } finally {
        setActingId(null);
      }
    });
  }

  async function copyPassword() {
    if (!tempPassword) return;
    try {
      await navigator.clipboard.writeText(tempPassword.password);
      toast.success("Contraseña copiada.");
    } catch {
      toast.error("Cópiala manualmente.");
    }
  }

  return (
    <div className="space-y-5">
      {/* Alta de miembro (admin o líder del negocio) */}
      <ManagerCard>
        <ManagerHeader
          icon={UserPlus}
          title="Agregar miembro"
          description="Crea la cuenta de un cliente con su teléfono y un PIN de 4 números. Esas serán sus credenciales para entrar."
        />
        <form onSubmit={addMember} className="space-y-3">
          <Field label="Nombre del miembro" htmlFor="m-name">
            <Input
              id="m-name"
              value={mName}
              onChange={(event) => setMName(event.target.value)}
              placeholder="Ej. Rosa Martínez"
            />
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Teléfono" htmlFor="m-phone">
              <Input
                id="m-phone"
                value={mPhone}
                onChange={(event) => setMPhone(event.target.value)}
                inputMode="tel"
                placeholder="Ej. 987 654 321"
              />
            </Field>
            <Field label="PIN (4 números)" htmlFor="m-pin">
              <Input
                id="m-pin"
                value={mPin}
                onChange={(event) =>
                  setMPin(event.target.value.replace(/\D+/g, "").slice(0, 4))
                }
                inputMode="numeric"
                placeholder="Ej. 1234"
              />
            </Field>
          </div>
          <Button type="submit" loading={pending}>
            <UserPlus className="size-5" aria-hidden />
            Crear miembro
          </Button>
        </form>

        {createdMember && (
          <NoticePanel tone="warn">
            <p className="font-semibold">¡Miembro creado! Comparte sus credenciales</p>
            <p className="mt-1">
              La persona entra en{" "}
              <code className="font-mono">/{businessSlug}</code> con:
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <code className="rounded-[var(--radius-sm)] border border-gold-300 bg-gold-100 px-3 py-1.5 font-mono text-base text-gold-900 dark:border-gold-900/50 dark:bg-gold-900/30 dark:text-gold-100">
                Teléfono: {createdMember.phone} · PIN: {createdMember.pin}
              </code>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setCreatedMember(null)}
              >
                Listo
              </Button>
            </div>
          </NoticePanel>
        )}
      </ManagerCard>

      {/* Invitar líder (solo admin de plataforma) */}
      {canManage ? (
        <ManagerCard>
          <ManagerHeader
            icon={Crown}
            title="Invitar líder"
            description="Asigna a una persona como administradora de este negocio por su correo."
          />
          <form
            onSubmit={invite}
            className="flex flex-col gap-3 sm:flex-row sm:items-end"
          >
            <div className="flex-1">
              <Field label="Correo de la persona" htmlFor="invite-email">
                <Input
                  id="invite-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="lider@negocio.com"
                />
              </Field>
            </div>
            <Button type="submit" loading={pending} className="sm:w-auto">
              <Mail className="size-5" aria-hidden />
              Invitar
            </Button>
          </form>

          {tempPassword && (
            <NoticePanel tone="warn">
              <p className="font-semibold">
                Contraseña temporal para {tempPassword.email}
              </p>
              <p className="mt-1">
                Compártela de forma segura. La persona debe cambiarla al entrar.
                Esta contraseña no se volverá a mostrar.
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <code className="rounded-[var(--radius-sm)] border border-gold-300 bg-gold-100 px-3 py-1.5 font-mono text-base text-gold-900 dark:border-gold-900/50 dark:bg-gold-900/30 dark:text-gold-100">
                  {tempPassword.password}
                </code>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={copyPassword}
                >
                  <Copy className="size-4" aria-hidden />
                  Copiar
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setTempPassword(null)}
                >
                  Ya la guardé
                </Button>
              </div>
            </NoticePanel>
          )}
        </ManagerCard>
      ) : (
        <NoticePanel>
          <span className="flex items-center gap-2 font-semibold">
            <Lock className="size-5" aria-hidden />
            Solo el administrador de la plataforma puede gestionar líderes.
          </span>
          <p className="mt-1">Aquí puedes agregar y gestionar a los miembros de tu negocio.</p>
        </NoticePanel>
      )}

      <ManagerCard>
        <ManagerHeader
          icon={Users}
          title="Equipo del negocio"
          description="Personas registradas en este negocio y su rol."
        />

        {members.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Aún no hay personas"
            description="Agrega un miembro arriba, o comparte el link de registro del negocio."
          />
        ) : (
          <div className="space-y-3">
            {members.map((member) => {
              const acting = pending && actingId === member.id;
              return (
                <ManagerRow key={member.id}>
                  <Avatar
                    name={member.fullName}
                    src={member.avatarUrl}
                    size="md"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate font-semibold">{member.fullName}</p>
                      <Badge variant={ROLE_BADGE[member.role]}>
                        {member.role === "leader" && (
                          <Crown className="size-3" aria-hidden />
                        )}
                        {ROLE_LABELS[member.role]}
                      </Badge>
                    </div>
                    <p className="truncate text-sm text-muted-foreground">
                      {member.phone || member.email}
                    </p>
                  </div>

                  <div className="flex shrink-0 flex-wrap gap-2">
                    {member.role === "member" && (
                      <Button
                        variant="secondary"
                        size="sm"
                        loading={acting}
                        disabled={pending}
                        onClick={() => changePin(member)}
                      >
                        <KeyRound className="size-4" aria-hidden />
                        Cambiar PIN
                      </Button>
                    )}

                    {canManage && member.role !== "admin" && (
                      <>
                        {member.role === "member" ? (
                          <Button
                            variant="outline"
                            size="sm"
                            loading={acting}
                            disabled={pending}
                            onClick={() =>
                              runAction(
                                member.id,
                                () => assignLeaderAction(businessId, member.id),
                                "Ahora es líder del negocio.",
                              )
                            }
                          >
                            <Crown className="size-4" aria-hidden />
                            Hacer líder
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            loading={acting}
                            disabled={pending}
                            onClick={() =>
                              runAction(
                                member.id,
                                () => demoteToMemberAction(businessId, member.id),
                                "Volvió a ser miembro.",
                              )
                            }
                          >
                            Quitar rol de líder
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive"
                          loading={acting}
                          disabled={pending}
                          onClick={() => {
                            if (
                              !window.confirm(
                                `¿Sacar a ${member.fullName} de este negocio?`,
                              )
                            ) {
                              return;
                            }
                            runAction(
                              member.id,
                              () => removeFromBusinessAction(businessId, member.id),
                              "Persona retirada del negocio.",
                            );
                          }}
                        >
                          <UserMinus className="size-4" aria-hidden />
                          Sacar
                        </Button>
                      </>
                    )}
                  </div>
                </ManagerRow>
              );
            })}
          </div>
        )}
      </ManagerCard>
    </div>
  );
}
