"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Camera,
  Loader2,
  MessagesSquare,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Label, Textarea } from "@/components/ui/field";
import type { Prospect } from "@/data/types";
import { recordExchangeAction } from "./conversation-actions";
import type {
  ConversationResponse,
  ConversationSuggestion,
} from "./conversation-types";
import { imageFromClipboard, prepareScreenshot } from "./image-utils";
import { SuggestionCard } from "./suggestion-card";

function makeIdempotencyKey() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `conv-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

interface PreparedShot {
  dataUrl: string;
  mimeType: "image/jpeg";
  approxKb: number;
}

/** Estado de carga claro y anunciado mientras la IA lee la conversación. */
function ReadingState() {
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
          Leyendo la conversación…
        </p>
        <p className="mt-1 text-base text-muted-foreground">
          Estamos preparando 3 respuestas claras para que elijas.
        </p>
      </div>
    </div>
  );
}

/**
 * Bloque A: el asistente "¿Qué le respondo?". El vendedor adjunta una captura
 * (o la pega, o escribe lo que dijo el cliente), opcionalmente da una
 * indicación, y la IA devuelve "lo que entendí" + 3 respuestas listas para
 * enviar. Al usar o copiar una, se guarda en la memoria del cliente.
 */
export function ConversationAssistant({ prospect }: { prospect: Prospect }) {
  const router = useRouter();
  const [incoming, setIncoming] = useState("");
  const [instruction, setInstruction] = useState("");
  const [shot, setShot] = useState<PreparedShot | null>(null);
  const [preparing, setPreparing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ConversationResponse | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canSubmit = (incoming.trim().length > 0 || Boolean(shot)) && !loading;

  const handleFile = useCallback(async (file: File) => {
    setPreparing(true);
    try {
      const prepared = await prepareScreenshot(file);
      setShot(prepared);
    } catch {
      toast.error("No pudimos abrir esa imagen. Prueba con otra captura.");
    } finally {
      setPreparing(false);
    }
  }, []);

  // Pegar (Ctrl/Cmd+V) una imagen del portapapeles como alternativa al archivo.
  useEffect(() => {
    function onPaste(event: ClipboardEvent) {
      const file = imageFromClipboard(event);
      if (!file) return;
      event.preventDefault();
      void handleFile(file);
    }
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [handleFile]);

  function onFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) void handleFile(file);
    // Permite volver a elegir el mismo archivo si lo quitan y readjuntan.
    event.target.value = "";
  }

  function removeShot() {
    setShot(null);
  }

  async function generate() {
    if (!canSubmit) {
      toast.error("Adjunta una captura o escribe lo que te dijo el cliente.");
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const response = await fetch("/api/ai/conversation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idempotencyKey: makeIdempotencyKey(),
          prospectId: prospect.id,
          incomingMessage: incoming.trim(),
          instruction: instruction.trim(),
          ...(shot
            ? { imageBase64: shot.dataUrl, imageMimeType: shot.mimeType }
            : {}),
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        const fallback =
          response.status === 503
            ? "La IA está ocupada. Intenta de nuevo en unos segundos."
            : "No pudimos generar respuestas. Revisa e inténtalo otra vez.";
        toast.error(payload?.error ?? fallback);
        return;
      }

      const payload = (await response.json()) as ConversationResponse;
      setResult(payload);
    } catch {
      toast.error("Hubo un problema de conexión. Revisa tu internet.");
    } finally {
      setLoading(false);
    }
  }

  /** Guarda en la memoria el turno usado y refresca el Bloque B. */
  async function record(suggestion: ConversationSuggestion) {
    if (!result) return;
    try {
      await recordExchangeAction(prospect.id, {
        clientSaid: incoming.trim() || result.reading,
        sellerReplied: suggestion.text,
        profile: result.profile,
        source: shot ? "screenshot" : "manual",
      });
      router.refresh();
    } catch {
      toast.error("La respuesta se usó, pero no pudimos guardarla en la memoria.");
    }
  }

  function handleUse(text: string) {
    const suggestion = result?.suggestions.find((s) => s.text === text);
    if (suggestion) {
      toast.success("Listo. Se guardó en la memoria de este cliente.");
      void record(suggestion);
    }
  }

  function handleCopy(text: string) {
    const suggestion = result?.suggestions.find((s) => s.text === text);
    if (suggestion) {
      toast.success("Copiado y guardado en la memoria.");
      void record(suggestion);
    }
  }

  function reset() {
    setResult(null);
    setIncoming("");
    setInstruction("");
    setShot(null);
  }

  return (
    <section
      aria-labelledby="asistente-titulo"
      className="space-y-5 rounded-[var(--radius-lg)] border border-brand-200 bg-card p-5 shadow-sm dark:border-brand-900/50 sm:p-6"
    >
      <div className="flex items-start gap-3">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-full gradient-brand text-white">
          <MessagesSquare className="size-6" aria-hidden />
        </span>
        <div>
          <h2
            id="asistente-titulo"
            className="font-display text-2xl font-bold tracking-tight"
          >
            ¿Qué le respondo?
          </h2>
          <p className="mt-1 text-base leading-relaxed text-muted-foreground">
            Adjunta la captura de la conversación o escribe lo que te dijo el
            cliente. Te damos 3 respuestas listas para enviar.
          </p>
        </div>
      </div>

      {loading ? (
        <ReadingState />
      ) : (
        <>
          {/* Adjuntar / tomar captura */}
          <div className="space-y-2">
            <Label className="text-base">
              Captura de la conversación (opcional)
            </Label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={onFileChange}
              className="sr-only"
              aria-label="Adjuntar o tomar una captura de la conversación"
            />

            {shot ? (
              <div className="overflow-hidden rounded-[var(--radius-lg)] border border-border bg-muted/40">
                <div className="relative">
                  {/* Previsualización de la captura elegida. */}
                  <Image
                    src={shot.dataUrl}
                    alt="Captura de la conversación elegida"
                    width={1280}
                    height={720}
                    unoptimized
                    className="h-auto max-h-80 w-full object-contain"
                  />
                  <button
                    type="button"
                    onClick={removeShot}
                    aria-label="Quitar la captura"
                    className="absolute right-3 top-3 inline-flex size-11 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white backdrop-blur transition-colors hover:bg-black/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  >
                    <X className="size-5" aria-hidden />
                  </button>
                </div>
                <div className="flex items-center justify-between gap-3 px-4 py-3">
                  <span className="text-base text-muted-foreground">
                    Imagen lista ({shot.approxKb} KB)
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={removeShot}
                    className="cursor-pointer text-base text-destructive hover:text-destructive"
                  >
                    <Trash2 className="size-4" aria-hidden />
                    Quitar
                  </Button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={preparing}
                className="flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-[var(--radius-lg)] border-2 border-dashed border-border bg-muted/40 px-6 py-8 text-center transition-colors hover:border-brand-400 hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-60"
              >
                <span className="flex size-14 items-center justify-center rounded-full bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200">
                  {preparing ? (
                    <Loader2 className="size-7 animate-spin" aria-hidden />
                  ) : (
                    <Camera className="size-7" aria-hidden />
                  )}
                </span>
                <span className="text-lg font-semibold text-foreground">
                  {preparing ? "Preparando la imagen…" : "Tomar o subir captura"}
                </span>
                <span className="text-base text-muted-foreground">
                  Abre la cámara en el celular. También puedes pegarla con
                  Ctrl+V.
                </span>
              </button>
            )}
          </div>

          {/* O escribir lo que dijo el cliente */}
          <div className="space-y-2">
            <Label htmlFor="incoming-message" className="text-base">
              ¿Qué te dijo el cliente?
            </Label>
            <Textarea
              id="incoming-message"
              value={incoming}
              onChange={(event) => setIncoming(event.target.value)}
              rows={4}
              className="min-h-32 text-lg leading-relaxed"
              placeholder="Ej. Me dijo que lo va a pensar, pero que le preocupa el precio."
            />
            <p className="text-base text-muted-foreground">
              Adjunta la captura <strong>o</strong> escribe aquí lo que te dijo.
              Con una de las dos basta.
            </p>
          </div>

          {/* Indicación opcional */}
          <div className="space-y-2">
            <Label htmlFor="instruction" className="text-base">
              Indicación (opcional)
            </Label>
            <Textarea
              id="instruction"
              value={instruction}
              onChange={(event) => setInstruction(event.target.value)}
              rows={2}
              className="min-h-20 text-lg leading-relaxed"
              placeholder="Ej. Que sea breve y amable."
            />
          </div>

          <Button
            type="button"
            size="lg"
            onClick={generate}
            disabled={!canSubmit}
            className="h-14 w-full cursor-pointer text-lg"
          >
            <Sparkles className="size-5" aria-hidden />
            Ayúdame a responder
          </Button>
        </>
      )}

      {/* Resultado */}
      {result && !loading && (
        <div className="space-y-5 border-t border-border pt-5">
          <div className="rounded-[var(--radius-md)] bg-secondary p-4">
            <p className="text-base font-semibold text-muted-foreground">
              Lo que entendí
            </p>
            <p className="mt-1 text-lg leading-relaxed text-foreground">
              {result.reading}
            </p>
          </div>

          <div>
            <h3 className="font-display text-xl font-bold tracking-tight">
              Elige una respuesta
            </h3>
            <p className="mt-1 text-base text-muted-foreground">
              Tócala para enviarla por WhatsApp o cópiala. La guardamos en la
              memoria de {prospect.name.split(" ")[0] || prospect.name}.
            </p>
          </div>

          <div className="space-y-4">
            {result.suggestions.map((suggestion, index) => (
              <SuggestionCard
                key={`${index}-${suggestion.text.slice(0, 12)}`}
                suggestion={suggestion}
                index={index}
                phone={prospect.phone}
                onUse={handleUse}
                onCopy={handleCopy}
              />
            ))}
          </div>

          <p className="rounded-[var(--radius-md)] bg-muted p-4 text-base leading-relaxed text-muted-foreground">
            {result.disclaimer}
          </p>

          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={reset}
            className="h-14 w-full cursor-pointer text-lg sm:w-auto"
          >
            Empezar de nuevo
          </Button>
        </div>
      )}
    </section>
  );
}
