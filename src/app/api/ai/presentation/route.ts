import { NextResponse } from "next/server";
import { z } from "zod";
import { checkCompliance, makeSafeAlternative } from "@/lib/ai/compliance";
import { generateWithGemini } from "@/lib/ai/gemini";
import { assertWithinBudget, recordAiUsage } from "@/lib/ai/usage";
import { LEGAL_DISCLAIMERS } from "@/lib/constants";
import { requireSession } from "@/lib/session";

const requestSchema = z.object({
  idempotencyKey: z.string().min(8),
  topic: z.string().min(3).max(500),
});

const SYSTEM_PROMPT = `Eres un asistente que crea presentaciones simples y claras para vendedores de productos de bienestar y belleza (network marketing).

PUBLICO: suele tener mas de 50 anios. Lenguaje claro, cercano y respetuoso.

REGLAS (obligatorias):
- NO prometas ingresos, ganancias ni resultados. NO hables de reclutar ni de comisiones. NO uses presion.
- Enfocate en informar sobre el producto/beneficio con respeto y calma.

DEVUELVE un JSON valido con esta forma EXACTA:
{"title": "titulo corto de la presentacion", "slides": [{"title": "titulo de la lamina", "bullets": ["punto 1", "punto 2", "punto 3"]}]}
Crea entre 4 y 6 laminas. Cada lamina con 2 a 4 bullets cortos y claros.`;

function parseLoose(text: string): { title?: string; slides?: unknown[] } | null {
  const cleaned = text.trim().replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(cleaned.slice(start, end + 1));
      } catch {
        return null;
      }
    }
    return null;
  }
}

function gate(text: string): string {
  let t = text.trim();
  if (checkCompliance(t).status === "blocked") t = makeSafeAlternative(t);
  return t;
}

type Slide = { title: string; bullets: string[] };
function sanitize(raw: { title?: string; slides?: unknown[] }): { title: string; slides: Slide[] } {
  const slides = Array.isArray(raw.slides) ? raw.slides : [];
  return {
    title: gate(String(raw.title ?? "Presentación")).slice(0, 80),
    slides: slides
      .slice(0, 8)
      .map((s) => {
        const obj = (s ?? {}) as { title?: unknown; bullets?: unknown };
        return {
          title: gate(String(obj.title ?? "")).slice(0, 90),
          bullets: (Array.isArray(obj.bullets) ? obj.bullets : [])
            .slice(0, 6)
            .map((b) => gate(String(b)).slice(0, 200))
            .filter(Boolean),
        };
      })
      .filter((s) => s.title || s.bullets.length),
  };
}

export async function POST(request: Request) {
  const user = await requireSession();
  const json = await request.json().catch(() => null);
  const parsed = requestSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Solicitud invalida" }, { status: 400 });
  }
  const { topic, idempotencyKey } = parsed.data;

  const budget = await assertWithinBudget(user.businessId, user.id);
  if (!budget.ok) {
    return NextResponse.json({ error: "ai_limit" }, { status: 429 });
  }

  const generated = await generateWithGemini({
    system: SYSTEM_PROMPT,
    prompt: `Tema: "${topic}". Genera el JSON de la presentacion.`,
    json: true,
    temperature: 0.6,
    maxOutputTokens: 900,
  });

  const fallback: { title: string; slides: Slide[] } = {
    title: topic.slice(0, 70),
    slides: [
      { title: "Hola", bullets: ["Te comparto información clara y sin compromiso."] },
      { title: "El producto", bullets: ["Para qué sirve", "Cómo se usa", "A quién le ayuda"] },
      { title: "Con calma", bullets: ["Cuando quieras, te explico con más detalle."] },
      { title: "Gracias", bullets: ["Estoy aquí para ayudarte cuando lo necesites."] },
    ],
  };

  let result = fallback;
  if (generated) {
    const data = parseLoose(generated.text);
    if (data && Array.isArray(data.slides) && data.slides.length) {
      const clean = sanitize(data);
      if (clean.slides.length) result = clean;
    }
    await recordAiUsage({
      businessId: user.businessId,
      userId: user.id,
      endpoint: "presentation",
      model: generated.model,
      usage: generated.usage,
      idempotencyKey,
    });
  }

  return NextResponse.json({
    id: idempotencyKey,
    title: result.title,
    slides: result.slides,
    source: generated ? "gemini" : "fallback",
    disclaimer: LEGAL_DISCLAIMERS.ai,
  });
}
