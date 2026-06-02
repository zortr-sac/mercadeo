"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  Copy,
  HeartHandshake,
  Loader2,
  MessageCircleHeart,
  RotateCcw,
  Save,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label, Textarea } from "@/components/ui/field";
import { saveLearningAction } from "./actions";
import type { ReframeResponse } from "./constancia-types";

function makeIdempotencyKey() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `reframe-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

/** Estado de carga claro y anunciado mientras la IA reencuadra el "no". */
function ThinkingState() {
  return (
    <div
      className="flex flex-col items-center justify-center gap-4 rounded-[var(--radius-lg)] border border-border bg-card py-12 text-center shadow-sm"
      role="status"
      aria-live="polite"
    >
      <span className="flex size-16 items-center justify-center rounded-full bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200">
        <Loader2 className="size-8 animate-spin" aria-hidden />
      </span>
      <div>
        <p className="font-display text-xl font-semibold">
          Pensando en tu situación…
        </p>
        <p className="mt-1 text-base text-muted-foreground">
          Estamos buscando una forma amable de ver ese “no”.
        </p>
      </div>
    </div>
  );
}

/**
 * Bloque 2 — Diario anti-rechazo (doc §5.2.2).
 * El vendedor escribe el "no" que recibió; la IA lo reencuadra con calma,
 * enfocado en constancia (nunca en dinero), y propone un mensaje para cerrar
 * con dignidad. Guardar el aprendizaje cuenta como actividad y suma puntos.
 */
export function RejectionJournal() {
  const router = useRouter();
  const [situation, setSituation] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [result, setResult] = useState<ReframeResponse | null>(null);

  const canSubmit = situation.trim().length >= 3 && !loading;

  async function reframe() {
    if (!canSubmit) {
      toast.error("Escribe primero qué te dijeron o qué pasó.");
      return;
    }
    setLoading(true);
    setResult(null);
    setSaved(false);

    try {
      const response = await fetch("/api/ai/reframe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idempotencyKey: makeIdempotencyKey(),
          situation: situation.trim(),
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        const fallback =
          response.status === 503
            ? "La IA está ocupada ahora mismo. Intenta de nuevo en unos segundos."
            : "No pudimos reencuadrar esto. Revisa el texto e inténtalo otra vez.";
        toast.error(payload?.error ?? fallback);
        return;
      }

      const payload = (await response.json()) as ReframeResponse;
      setResult(payload);
    } catch {
      toast.error("Hubo un problema de conexión. Revisa tu internet.");
    } finally {
      setLoading(false);
    }
  }

  async function copySuggested() {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.suggestedMessage);
      setCopied(true);
      toast.success("Mensaje copiado.");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("No se pudo copiar el mensaje.");
    }
  }

  async function save() {
    if (!result || saving || saved) return;
    setSaving(true);
    try {
      await saveLearningAction({
        situation: situation.trim(),
        reframe: result.reframe,
      });
      setSaved(true);
      toast.success("Aprendizaje guardado. ¡Sumaste constancia!");
      // Refresca el server component: aparece en el historial y suben los puntos.
      router.refresh();
    } catch {
      toast.error("No pudimos guardar el aprendizaje. Inténtalo de nuevo.");
    } finally {
      setSaving(false);
    }
  }

  function startOver() {
    setResult(null);
    setSituation("");
    setSaved(false);
  }

  return (
    <section
      aria-labelledby="diario-titulo"
      className="space-y-5 rounded-[var(--radius-lg)] border border-brand-200 bg-card p-5 shadow-sm dark:border-brand-900/50 sm:p-6"
    >
      <div className="flex items-start gap-3">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-full gradient-brand text-white">
          <HeartHandshake className="size-6" aria-hidden />
        </span>
        <div>
          <h2
            id="diario-titulo"
            className="font-display text-2xl font-bold tracking-tight"
          >
            Diario anti-rechazo
          </h2>
          <p className="mt-1 text-base leading-relaxed text-muted-foreground">
            Recibir un “no” es normal y no te define. Escríbelo aquí y te
            ayudamos a verlo con calma para seguir adelante.
          </p>
        </div>
      </div>

      {loading ? (
        <ThinkingState />
      ) : (
        <div className="space-y-2">
          <Label htmlFor="rejection-entry" className="text-base">
            ¿Qué pasó? Escribe el “no” o la respuesta difícil que recibiste.
          </Label>
          <Textarea
            id="rejection-entry"
            value={situation}
            onChange={(event) => setSituation(event.target.value)}
            rows={5}
            className="min-h-36 text-lg leading-relaxed"
            placeholder="Ej. Me dijo que no tiene tiempo y que no le insista."
          />
          <Button
            type="button"
            size="lg"
            onClick={reframe}
            disabled={!canSubmit}
            className="h-14 w-full cursor-pointer text-lg"
          >
            <Sparkles className="size-5" aria-hidden />
            Reencuadrar con IA
          </Button>
        </div>
      )}

      {/* Resultado de la IA */}
      {result && !loading && (
        <div className="space-y-5 border-t border-border pt-5">
          {/* El reencuadre, en un panel cálido. */}
          <div className="rounded-[var(--radius-lg)] border border-brand-200 bg-brand-50 p-5 text-brand-950 dark:border-brand-900/50 dark:bg-brand-900/20 dark:text-brand-50">
            <div className="flex items-center gap-2.5">
              <RotateCcw
                className="size-6 text-brand-700 dark:text-brand-300"
                aria-hidden
              />
              <h3 className="font-display text-xl font-bold tracking-tight">
                Otra forma de verlo
              </h3>
            </div>
            <p className="mt-3 text-lg leading-relaxed">{result.reframe}</p>
          </div>

          {/* Mensaje sugerido para cerrar con dignidad (texto ya compliant). */}
          <div className="rounded-[var(--radius-lg)] border border-border bg-secondary/60 p-5">
            <div className="flex items-center gap-2.5">
              <MessageCircleHeart
                className="size-6 text-brand-700 dark:text-brand-300"
                aria-hidden
              />
              <h3 className="font-display text-xl font-bold tracking-tight">
                Mensaje sugerido
              </h3>
            </div>
            <p className="mt-3 text-lg leading-relaxed text-foreground">
              {result.suggestedMessage}
            </p>
            <Button
              type="button"
              variant="secondary"
              size="lg"
              onClick={copySuggested}
              className="mt-4 h-14 w-full cursor-pointer text-lg sm:w-auto"
            >
              {copied ? (
                <Check className="size-5" aria-hidden />
              ) : (
                <Copy className="size-5" aria-hidden />
              )}
              {copied ? "Copiado" : "Copiar mensaje"}
            </Button>
          </div>

          <p className="rounded-[var(--radius-md)] bg-muted p-4 text-base leading-relaxed text-muted-foreground">
            {result.disclaimer}
          </p>

          {/* Guardar aprendizaje (suma actividad) + empezar de nuevo. */}
          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <Button
              type="button"
              size="lg"
              onClick={save}
              disabled={saving || saved}
              className="h-14 w-full cursor-pointer text-lg"
            >
              {saving ? (
                <Loader2 className="size-5 animate-spin" aria-hidden />
              ) : saved ? (
                <Check className="size-5" aria-hidden />
              ) : (
                <Save className="size-5" aria-hidden />
              )}
              {saved ? "Aprendizaje guardado" : "Guardar aprendizaje"}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={startOver}
              className="h-14 w-full cursor-pointer text-lg sm:w-auto"
            >
              Escribir otro
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}
