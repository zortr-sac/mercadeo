import "server-only";
import { serverEnv } from "@/lib/env";

const ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models";

export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}

interface GeminiResult {
  text: string;
  usage: TokenUsage;
  model: string;
}

/** Lee usageMetadata de la respuesta de Gemini (tokens exactos facturables). */
function readUsage(m?: {
  promptTokenCount?: number;
  candidatesTokenCount?: number;
  totalTokenCount?: number;
}): TokenUsage {
  const inputTokens = m?.promptTokenCount ?? 0;
  const outputTokens = m?.candidatesTokenCount ?? 0;
  return {
    inputTokens,
    outputTokens,
    totalTokens: m?.totalTokenCount ?? inputTokens + outputTokens,
  };
}

/**
 * Llama a Gemini (generateContent vía REST) con una instrucción de sistema.
 * Devuelve el texto generado o `null` si no hay API key, hay timeout o error
 * (el llamador debe tener un fallback determinista).
 */
export async function generateWithGemini(params: {
  system: string;
  prompt: string;
  /** Imagen opcional (visión): base64 sin el prefijo `data:`, + su mime type. */
  image?: { data: string; mimeType: string };
  /** Pide salida JSON (responseMimeType application/json). */
  json?: boolean;
  temperature?: number;
  maxOutputTokens?: number;
  timeoutMs?: number;
}): Promise<GeminiResult | null> {
  const apiKey = serverEnv.GEMINI_API_KEY;
  if (!apiKey) return null;

  const model = serverEnv.GEMINI_MODEL || "gemini-2.5-flash";
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), params.timeoutMs ?? 12_000);

  const parts: Record<string, unknown>[] = [{ text: params.prompt }];
  if (params.image) {
    parts.push({
      inline_data: { mime_type: params.image.mimeType, data: params.image.data },
    });
  }

  try {
    const response = await fetch(
      `${ENDPOINT}/${model}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: params.system }] },
          contents: [{ role: "user", parts }],
          generationConfig: {
            temperature: params.temperature ?? 0.7,
            topP: 0.9,
            maxOutputTokens: params.maxOutputTokens ?? 512,
            // Gemini 2.5 razona ("thinking") por defecto y consume el presupuesto
            // de salida. Lo desactivamos para que todo el budget sea el mensaje.
            thinkingConfig: { thinkingBudget: 0 },
            ...(params.json ? { responseMimeType: "application/json" } : {}),
          },
          safetySettings: [
            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_ONLY_HIGH" },
            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_ONLY_HIGH" },
          ],
        }),
        signal: controller.signal,
      },
    );

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.warn(
        `[gemini] generateContent ${response.status}: ${detail.slice(0, 300)}`,
      );
      return null;
    }

    const data = (await response.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
      usageMetadata?: {
        promptTokenCount?: number;
        candidatesTokenCount?: number;
        totalTokenCount?: number;
      };
    };
    const text = data.candidates?.[0]?.content?.parts
      ?.map((part) => part.text ?? "")
      .join("")
      .trim();

    return text ? { text, usage: readUsage(data.usageMetadata), model } : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

interface GeminiImageResult {
  /** base64 image data (no `data:` prefix). */
  data: string;
  mimeType: string;
  usage: TokenUsage;
  model: string;
}

/**
 * Generates an image with Gemini 2.5 Flash Image ("Nano Banana") via the same
 * generateContent endpoint and API key. Returns the base64 image or `null` if
 * there is no key / the model is unavailable (the caller shows a friendly retry).
 */
export async function generateImageWithGemini(params: {
  prompt: string;
  timeoutMs?: number;
}): Promise<GeminiImageResult | null> {
  const apiKey = serverEnv.GEMINI_API_KEY;
  if (!apiKey) return null;

  const model = "gemini-2.5-flash-image";
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), params.timeoutMs ?? 30_000);

  try {
    const response = await fetch(`${ENDPOINT}/${model}:generateContent`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: params.prompt }] }],
        generationConfig: { responseModalities: ["IMAGE"] },
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.warn(`[gemini] image ${response.status}: ${detail.slice(0, 300)}`);
      return null;
    }

    type InlineData = { mimeType?: string; mime_type?: string; data?: string };
    const data = (await response.json()) as {
      candidates?: { content?: { parts?: { inlineData?: InlineData; inline_data?: InlineData }[] } }[];
      usageMetadata?: {
        promptTokenCount?: number;
        candidatesTokenCount?: number;
        totalTokenCount?: number;
      };
    };
    const usage = readUsage(data.usageMetadata);
    const parts = data.candidates?.[0]?.content?.parts ?? [];
    for (const part of parts) {
      const inline = part.inlineData ?? part.inline_data;
      if (inline?.data) {
        return { data: inline.data, mimeType: inline.mimeType ?? inline.mime_type ?? "image/png", usage, model };
      }
    }
    return null;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
