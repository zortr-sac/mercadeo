"use client";

import { useRouter } from "next/navigation";
import { Globe2, Palette, Save } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import type { Business } from "@/data/types";
import { ManagerCard, ManagerHeader, NoticePanel } from "./admin-ui";
import { ColorPalettePicker } from "./color-palette-picker";
import {
  updateBusinessBrandingAction,
  updateBusinessDomainAction,
} from "./business-actions";

/** Ajustes del negocio: color de marca (editable) y dominio propio. */
export function SettingsManager({ business }: { business: Business }) {
  const router = useRouter();
  const [domain, setDomain] = useState(business.customDomain ?? "");
  const [color, setColor] = useState(business.primaryColor);
  const [savingDomain, startDomain] = useTransition();
  const [savingColor, startColor] = useTransition();

  const colorChanged = color.toLowerCase() !== business.primaryColor.toLowerCase();

  function saveColor() {
    startColor(async () => {
      const res = await updateBusinessBrandingAction(business.id, color);
      if (res && res.ok === false) {
        toast.error(res.error ?? "No se pudo guardar el color.");
        return;
      }
      toast.success("Color de la marca actualizado.");
      router.refresh();
    });
  }

  function saveDomain(event: React.FormEvent) {
    event.preventDefault();
    const next = domain.trim() || null;
    startDomain(async () => {
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
          title="Color de la marca"
          description="Un solo color para la app del cliente: se aplica a botones, íconos y acentos."
        />
        <ColorPalettePicker value={color} onChange={setColor} />
        <Button onClick={saveColor} loading={savingColor} disabled={!colorChanged} className="mt-4">
          <Save className="size-5" aria-hidden />
          Guardar color
        </Button>
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
          <Button type="submit" loading={savingDomain}>
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
