"use client";

import { useState } from "react";
import { Check, Copy, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { WhatsappIcon } from "@/features/ai/whatsapp-icon";
import type { ConversationSuggestion } from "./conversation-types";

function normalizePhone(phone: string | null | undefined) {
  return (phone ?? "").replace(/[^\d]/g, "");
}

/**
 * Una respuesta sugerida por la IA. Texto grande y legible (50+), un chip
 * suave "Revisar" si no es 100% segura, y dos acciones táctiles grandes:
 * usar y enviar por WhatsApp, o copiar. Ambas guardan en la memoria.
 */
export function SuggestionCard({
  suggestion,
  index,
  phone,
  onUse,
  onCopy,
}: {
  suggestion: ConversationSuggestion;
  index: number;
  phone: string | null;
  /** Se dispara al enviar por WhatsApp (para registrar en la memoria). */
  onUse: (text: string) => void;
  /** Se dispara al copiar (para registrar en la memoria). */
  onCopy: (text: string) => void;
}) {
  const [copied, setCopied] = useState(false);
  const needsReview = suggestion.status !== "safe";

  const digits = normalizePhone(phone);
  const whatsappHref = `https://wa.me/${digits}?text=${encodeURIComponent(
    suggestion.text,
  )}`;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(suggestion.text);
      setCopied(true);
      onCopy(suggestion.text);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // El contenedor muestra el toast de error; aquí no rompemos la UI.
    }
  }

  return (
    <article className="rounded-[var(--radius-lg)] border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-2 text-base font-semibold text-muted-foreground">
          <span className="flex size-7 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700 dark:bg-brand-900/40 dark:text-brand-200">
            {index + 1}
          </span>
          Opción {index + 1}
        </span>
        {needsReview && (
          <Badge variant="gold" className="px-3 py-1 text-sm">
            <Info className="size-4" aria-hidden />
            Revisar
          </Badge>
        )}
      </div>

      <p className="mt-3 text-lg leading-relaxed text-foreground">
        {suggestion.text}
      </p>

      {/* Si la IA marcó algo, lo explicamos con calma, sin alarmar. */}
      {needsReview && suggestion.issues.length > 0 && (
        <ul className="mt-3 list-disc space-y-1 rounded-[var(--radius-md)] bg-gold-50 px-5 py-3 text-base leading-relaxed text-gold-900 dark:bg-gold-900/20 dark:text-gold-100">
          {suggestion.issues.map((issue) => (
            <li key={`${issue.code}-${issue.label}`}>{issue.label}</li>
          ))}
        </ul>
      )}

      <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto]">
        <a
          href={whatsappHref}
          target="_blank"
          rel="noreferrer"
          onClick={() => onUse(suggestion.text)}
          className="inline-flex h-14 cursor-pointer items-center justify-center gap-2.5 rounded-[var(--radius-md)] bg-primary px-7 text-lg font-semibold text-primary-foreground transition-colors hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <WhatsappIcon className="size-6" aria-hidden />
          Usar y enviar por WhatsApp
        </a>
        <Button
          type="button"
          variant="secondary"
          size="lg"
          onClick={handleCopy}
          className="h-14 cursor-pointer text-lg"
        >
          {copied ? (
            <Check className="size-5" aria-hidden />
          ) : (
            <Copy className="size-5" aria-hidden />
          )}
          {copied ? "Copiado" : "Copiar"}
        </Button>
      </div>
    </article>
  );
}
