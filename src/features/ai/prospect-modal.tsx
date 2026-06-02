"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Sparkles, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import type { MessageTemplate } from "@/data/types";

/** Estado de carga claro mientras la IA redacta el mensaje. */
function WritingState({ name }: { name: string }) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-4 py-10 text-center"
      role="status"
      aria-live="polite"
    >
      <span className="flex size-16 items-center justify-center rounded-full bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200">
        <Loader2 className="size-8 animate-spin" aria-hidden />
      </span>
      <div>
        <p className="font-display text-xl font-semibold">
          Escribiendo el mensaje…
        </p>
        <p className="mt-1 text-base text-muted-foreground">
          Estamos preparando un texto claro y cuidado para {name || "tu cliente"}.
        </p>
      </div>
    </div>
  );
}

/** Formulario interno: se inicializa desde props y se remonta vía `key`. */
function ProspectForm({
  initialName,
  hasInitialPhone,
  onSubmit,
}: {
  initialName: string;
  hasInitialPhone: boolean;
  onSubmit: (values: { name: string; phone: string }) => void;
}) {
  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | undefined>();
  const nameRef = useRef<HTMLInputElement>(null);

  // Enfoca el nombre al montar si está vacío, para guiar el primer paso.
  useEffect(() => {
    if (!initialName) nameRef.current?.focus();
  }, [initialName]);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (name.trim().length < 2) {
      setError("Escribe el nombre del cliente.");
      nameRef.current?.focus();
      return;
    }
    onSubmit({ name: name.trim(), phone: phone.trim() });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Field label="Nombre del cliente" htmlFor="prospect-name" error={error}>
        <div className="relative">
          <User
            className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            ref={nameRef}
            id="prospect-name"
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              if (error) setError(undefined);
            }}
            placeholder="Ej. Rosa"
            autoComplete="off"
            className="h-14 pl-11 text-lg"
            aria-invalid={Boolean(error)}
          />
        </div>
      </Field>

      {!hasInitialPhone && (
        <Field
          label="WhatsApp del cliente"
          htmlFor="prospect-phone"
          hint="Opcional. Inclúyelo con el código del país (ej. +51)."
        >
          <Input
            id="prospect-phone"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            inputMode="tel"
            autoComplete="off"
            placeholder="+51 999 999 999"
            className="h-14 text-lg"
          />
        </Field>
      )}

      <Button type="submit" size="lg" className="h-14 w-full text-lg">
        <Sparkles className="size-5" aria-hidden />
        Continuar
      </Button>
    </form>
  );
}

/**
 * Paso 2: tras elegir una tarjeta, pide SOLO el nombre del cliente (y el
 * WhatsApp si no vino ya). Muestra un estado de carga claro al generar.
 */
export function ProspectModal({
  template,
  open,
  loading,
  loadingName,
  initialName,
  hasInitialPhone,
  onClose,
  onSubmit,
}: {
  template: MessageTemplate | null;
  open: boolean;
  loading: boolean;
  loadingName: string;
  initialName: string;
  hasInitialPhone: boolean;
  onClose: () => void;
  onSubmit: (values: { name: string; phone: string }) => void;
}) {
  return (
    <Modal
      open={open}
      onClose={loading ? () => {} : onClose}
      title={template?.title ?? "Preparar mensaje"}
      description={template?.situation}
    >
      {loading ? (
        <WritingState name={loadingName} />
      ) : (
        <ProspectForm
          // Remonta el formulario por plantilla para limpiar el estado al reabrir.
          key={template?.id ?? "none"}
          initialName={initialName}
          hasInitialPhone={hasInitialPhone}
          onSubmit={onSubmit}
        />
      )}
    </Modal>
  );
}
