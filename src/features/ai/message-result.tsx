"use client";

import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Check,
  Copy,
  Info,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label, Textarea } from "@/components/ui/field";
import { WhatsappIcon } from "./whatsapp-icon";
import type { MessageTemplate } from "@/data/types";
import type { MessageResponse } from "./types";

function normalizePhone(phone: string) {
  return phone.replace(/[^\d]/g, "");
}

/**
 * Paso 3: muestra el mensaje generado (editable), el Modo Cumplimiento con su
 * aviso legal y la acción principal de compartir por WhatsApp.
 */
export function MessageResult({
  template,
  prospectName,
  phone,
  result,
  onBack,
}: {
  template: MessageTemplate;
  prospectName: string;
  phone: string;
  result: MessageResponse;
  onBack: () => void;
}) {
  const [message, setMessage] = useState(result.message);
  const [copied, setCopied] = useState(false);

  const isSafe = result.compliance.status === "safe";

  const whatsappHref = useMemo(() => {
    const text = encodeURIComponent(message);
    const digits = normalizePhone(phone);
    return digits
      ? `https://wa.me/${digits}?text=${text}`
      : `https://wa.me/?text=${text}`;
  }, [message, phone]);

  async function copyMessage() {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      toast.success("Mensaje copiado.");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("No se pudo copiar el mensaje.");
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex cursor-pointer items-center gap-2 rounded-[var(--radius-md)] px-1 py-1 text-base font-medium text-brand-700 transition-colors hover:text-brand-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:text-brand-300 dark:hover:text-brand-200"
      >
        <ArrowLeft className="size-5" aria-hidden />
        Elegir otra plantilla
      </button>

      <div className="rounded-[var(--radius-lg)] border border-border bg-card p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight">
              Tu mensaje para {prospectName}
            </h2>
            <p className="mt-1 text-base text-muted-foreground">
              Puedes ajustarlo antes de enviarlo. Plantilla: {template.title}.
            </p>
          </div>
          {isSafe ? (
            <Badge variant="success" className="px-3 py-1 text-sm">
              <ShieldCheck className="size-4" aria-hidden />
              Mensaje seguro
            </Badge>
          ) : (
            <Badge variant="gold" className="px-3 py-1 text-sm">
              <ShieldAlert className="size-4" aria-hidden />
              Revisar antes de enviar
            </Badge>
          )}
        </div>

        <div className="mt-5 space-y-2">
          <Label htmlFor="message-text">Mensaje (puedes editarlo)</Label>
          <Textarea
            id="message-text"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            rows={9}
            className="min-h-56 text-lg leading-relaxed"
            placeholder="Tu mensaje aparecerá aquí."
          />
        </div>

        {/* Modo Cumplimiento: aviso suave, sin alarmar (el texto ya viene saneado). */}
        {isSafe ? (
          <div className="mt-4 flex items-start gap-3 rounded-[var(--radius-md)] border border-brand-200 bg-brand-50 p-4 text-brand-900 dark:border-brand-900/50 dark:bg-brand-900/20 dark:text-brand-100">
            <ShieldCheck className="mt-0.5 size-5 shrink-0" aria-hidden />
            <div>
              <p className="text-base font-semibold">Modo Cumplimiento activo</p>
              <p className="mt-1 text-base leading-relaxed">
                El mensaje evita promesas de ingresos, presión y afirmaciones no
                sustentadas.
              </p>
            </div>
          </div>
        ) : (
          <div className="mt-4 flex items-start gap-3 rounded-[var(--radius-md)] border border-gold-200 bg-gold-50 p-4 text-gold-900 dark:border-gold-900/50 dark:bg-gold-900/20 dark:text-gold-100">
            <Info className="mt-0.5 size-5 shrink-0" aria-hidden />
            <div>
              <p className="text-base font-semibold">
                Revisa este detalle antes de enviar
              </p>
              {result.compliance.issues.length > 0 ? (
                <ul className="mt-1 list-disc space-y-1 pl-5 text-base leading-relaxed">
                  {result.compliance.issues.map((issue) => (
                    <li key={`${issue.code}-${issue.label}`}>{issue.label}</li>
                  ))}
                </ul>
              ) : (
                <p className="mt-1 text-base leading-relaxed">
                  Léelo con calma y ajusta lo que haga falta.
                </p>
              )}
            </div>
          </div>
        )}

        <p className="mt-4 rounded-[var(--radius-md)] bg-muted p-4 text-base leading-relaxed text-muted-foreground">
          {result.disclaimer}
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto]">
          <a
            href={message ? whatsappHref : undefined}
            target="_blank"
            rel="noreferrer"
            aria-disabled={!message}
            className="inline-flex h-14 cursor-pointer items-center justify-center gap-2.5 rounded-[var(--radius-md)] bg-primary px-7 text-lg font-semibold text-primary-foreground transition-colors hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background aria-disabled:pointer-events-none aria-disabled:opacity-50"
          >
            <WhatsappIcon className="size-6" aria-hidden />
            Compartir por WhatsApp
          </a>
          <Button
            type="button"
            variant="secondary"
            size="lg"
            onClick={copyMessage}
            disabled={!message}
            className="h-14 text-lg"
          >
            {copied ? (
              <Check className="size-5" aria-hidden />
            ) : (
              <Copy className="size-5" aria-hidden />
            )}
            {copied ? "Copiado" : "Copiar"}
          </Button>
        </div>
      </div>
    </div>
  );
}
