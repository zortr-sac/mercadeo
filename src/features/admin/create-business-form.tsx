"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
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
  const [primaryColor, setPrimaryColor] = useState("#0f766e");
  const [accentColor, setAccentColor] = useState("#f59e0b");
  const [domain, setDomain] = useState("");

  function reset() {
    setName("");
    setAdminEmail("");
    setPrimaryColor("#0f766e");
    setAccentColor("#f59e0b");
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
          accentColor,
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
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Color principal" htmlFor="nb-primary">
              <Input
                id="nb-primary"
                type="color"
                value={primaryColor}
                onChange={(event) => setPrimaryColor(event.target.value)}
                className="h-12 p-1"
              />
            </Field>
            <Field label="Color de acento" htmlFor="nb-accent">
              <Input
                id="nb-accent"
                type="color"
                value={accentColor}
                onChange={(event) => setAccentColor(event.target.value)}
                className="h-12 p-1"
              />
            </Field>
          </div>
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
