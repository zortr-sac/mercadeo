"use client";

import { useRouter } from "next/navigation";
import { Globe2, Palette, Save, Sparkles } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/field";
import type { Business } from "@/data/types";
import { ManagerCard, ManagerHeader, NoticePanel } from "./admin-ui";
import { ColorPalettePicker } from "./color-palette-picker";
import {
  updateBusinessBrandingAction,
  updateBusinessDomainAction,
  updateBusinessPromptsAction,
} from "./business-actions";

/** Ajustes del negocio: color de marca (editable) y dominio propio. */
export function SettingsManager({ business }: { business: Business }) {
  const router = useRouter();
  const [domain, setDomain] = useState(business.customDomain ?? "");
  const [color, setColor] = useState(business.primaryColor);
  const [savingDomain, startDomain] = useTransition();
  const [savingColor, startColor] = useTransition();
  const [flyerPrompt, setFlyerPrompt] = useState(business.flyerPrompt ?? "");
  const [presentationPrompt, setPresentationPrompt] = useState(
    business.presentationPrompt ?? "",
  );
  const [savingPrompts, startPrompts] = useTransition();

  const colorChanged = color.toLowerCase() !== business.primaryColor.toLowerCase();

  function savePrompts() {
    startPrompts(async () => {
      const res = await updateBusinessPromptsAction(
        business.id,
        flyerPrompt,
        presentationPrompt,
      );
      if (res && res.ok === false) {
        toast.error(res.error ?? "No se pudieron guardar las instrucciones.");
        return;
      }
      toast.success("Instrucciones de IA guardadas.");
      router.refresh();
    });
  }

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

      <ManagerCard>
        <ManagerHeader
          icon={Sparkles}
          title="Instrucciones para la IA"
          description="Directrices fijas que la IA seguirá al crear anuncios y presentaciones de tu negocio. Se suman a las reglas del sistema (que siempre cuidan el cumplimiento legal)."
        />
        <div className="space-y-4">
          <Field
            label="Anuncios (flyers)"
            htmlFor="flyer-prompt"
            hint="Ej. Usa tonos cálidos y el nombre de la marca; estilo limpio; sin texto recargado."
          >
            <Textarea
              id="flyer-prompt"
              value={flyerPrompt}
              onChange={(event) => setFlyerPrompt(event.target.value)}
              rows={4}
              className="min-h-28 text-lg leading-relaxed"
              placeholder="Instrucciones para los anuncios de tu negocio…"
            />
          </Field>
          <Field
            label="Presentaciones"
            htmlFor="presentation-prompt"
            hint="Ej. Enfócate en los beneficios del producto; lenguaje sencillo; cierra con una invitación amable."
          >
            <Textarea
              id="presentation-prompt"
              value={presentationPrompt}
              onChange={(event) => setPresentationPrompt(event.target.value)}
              rows={4}
              className="min-h-28 text-lg leading-relaxed"
              placeholder="Instrucciones para las presentaciones de tu negocio…"
            />
          </Field>
          <Button onClick={savePrompts} loading={savingPrompts}>
            <Save className="size-5" aria-hidden />
            Guardar instrucciones
          </Button>
        </div>
      </ManagerCard>
    </div>
  );
}
