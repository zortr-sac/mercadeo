"use client";

import { useRouter } from "next/navigation";
import { Globe2, Palette, Save } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import type { Business } from "@/data/types";
import { ManagerCard, ManagerHeader, NoticePanel } from "./admin-ui";
import { updateBusinessDomainAction } from "./business-actions";

function ColorSwatch({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-[var(--radius-md)] border border-border bg-background p-4">
      <span
        className="size-10 shrink-0 rounded-[var(--radius-sm)] border border-border"
        style={{ background: value }}
        aria-hidden
      />
      <div>
        <p className="text-base font-medium">{label}</p>
        <p className="font-mono text-sm uppercase text-muted-foreground">
          {value}
        </p>
      </div>
    </div>
  );
}

/** Ajustes del negocio: marca (solo lectura) y dominio propio (editable). */
export function SettingsManager({ business }: { business: Business }) {
  const router = useRouter();
  const [domain, setDomain] = useState(business.customDomain ?? "");
  const [pending, startTransition] = useTransition();

  function saveDomain(event: React.FormEvent) {
    event.preventDefault();
    const next = domain.trim() || null;
    startTransition(async () => {
      try {
        await updateBusinessDomainAction(business.id, next);
        toast.success(next ? "Dominio guardado." : "Dominio eliminado.");
        router.refresh();
      } catch {
        toast.error("No se pudo guardar el dominio.");
      }
    });
  }

  return (
    <div className="space-y-5">
      <ManagerCard>
        <ManagerHeader
          icon={Palette}
          title="Marca"
          description="Los colores se definieron al crear el negocio y dan identidad a la app."
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <ColorSwatch label="Color principal" value={business.primaryColor} />
          <ColorSwatch label="Color de acento" value={business.accentColor} />
        </div>
        <NoticePanel>
          La marca y los colores son de solo lectura desde aquí. Para cambiarlos,
          contacta al administrador de la plataforma.
        </NoticePanel>
      </ManagerCard>

      <ManagerCard>
        <ManagerHeader
          icon={Globe2}
          title="Dominio propio"
          description="Conecta un dominio para que tus clientes entren con tu dirección."
        />
        <form onSubmit={saveDomain} className="space-y-4">
          <Field
            label="Dominio conectado"
            htmlFor="biz-domain"
            hint="Opcional. Ej. academia.marca.com. Déjalo vacío para no usar dominio propio."
          >
            <Input
              id="biz-domain"
              value={domain}
              onChange={(event) => setDomain(event.target.value)}
              placeholder="academia.marca.com"
            />
          </Field>
          <Button type="submit" loading={pending}>
            <Save className="size-5" aria-hidden />
            Guardar dominio
          </Button>
        </form>
        <NoticePanel>
          En producción, este dominio debe apuntar al servidor de la plataforma
          para resolver el negocio por su dirección web.
        </NoticePanel>
      </ManagerCard>
    </div>
  );
}
