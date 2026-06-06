"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import { DEFAULT_BRAND } from "@/lib/brand-theme";
import { ColorPalettePicker } from "./color-palette-picker";
import { createBusinessAction } from "./business-actions";

/**
 * Formulario para crear un negocio (solo admin de plataforma).
 * Tras crear, refresca el listado de negocios del servidor.
 */
export function CreateBusinessForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const [name, setName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [primaryColor, setPrimaryColor] = useState(DEFAULT_BRAND);
  const [domain, setDomain] = useState("");

  function reset() {
    setName("");
    setAdminEmail("");
    setPrimaryColor(DEFAULT_BRAND);
    setDomain("");
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (name.trim().length < 2 || !adminEmail.includes("@")) {
      toast.error("Completa el nombre del negocio y el correo del administrador.");
      return;
    }
    startTransition(async () => {
      try {
        await createBusinessAction({
          name: name.trim(),
          adminEmail: adminEmail.trim().toLowerCase(),
          primaryColor,
          accentColor: primaryColor,
          customDomain: domain.trim() || null,
        });
        toast.success("Negocio creado.");
        reset();
        setOpen(false);
        router.refresh();
      } catch {
        toast.error("No se pudo crear el negocio. Inténtalo de nuevo.");
      }
    });
  }

  return (
    <>
      <Button type="button" onClick={() => setOpen(true)} size="lg">
        <Plus className="size-5" aria-hidden />
        Crear negocio
      </Button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Crear negocio"
        description="Define la marca, los colores y el administrador inicial del negocio."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Nombre del negocio" htmlFor="nb-name">
            <Input
              id="nb-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ej. Bienestar Andino"
              required
            />
          </Field>
          <Field
            label="Correo del administrador"
            htmlFor="nb-email"
            hint="Será quien administre este negocio."
          >
            <Input
              id="nb-email"
              type="email"
              value={adminEmail}
              onChange={(event) => setAdminEmail(event.target.value)}
              placeholder="admin@negocio.com"
              required
            />
          </Field>
          <Field label="Color de la marca" hint="Un solo color: la app del cliente se verá toda de este color.">
            <ColorPalettePicker value={primaryColor} onChange={setPrimaryColor} />
          </Field>
          <Field
            label="Dominio propio"
            htmlFor="nb-domain"
            hint="Opcional. Ej. academia.marca.com"
          >
            <Input
              id="nb-domain"
              value={domain}
              onChange={(event) => setDomain(event.target.value)}
              placeholder="academia.marca.com"
            />
          </Field>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              disabled={pending}
            >
              Cancelar
            </Button>
            <Button type="submit" loading={pending}>
              Crear negocio
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
