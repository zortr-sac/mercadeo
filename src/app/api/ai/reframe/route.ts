import { NextResponse } from "next/server";
import { z } from "zod";
import { checkCompliance, makeSafeAlternative } from "@/lib/ai/compliance";
import { generateWithGemini } from "@/lib/ai/gemini";
import { LEGAL_DISCLAIMERS } from "@/lib/constants";
import { requireSession } from "@/lib/session";

const requestSchema = z.object({
  idempotencyKey: z.string().min(8),
  situation: z.string().min(3).max(1000),
});

const SYSTEM_PROMPT = `Eres un coach cálido y breve para un vendedor de productos de bienestar (network marketing) que acaba de recibir un "no" o un rechazo de un cliente.

PUBLICO: suele tener mas de 50 anios. Lenguaje claro, cercano y respetuoso.

OBJETIVO: ayudarlo a no abandonar. Se premia la CONSTANCIA y la actividad, NUNCA los resultados economicos.

REGLAS (obligatorias):
- Reencuadra el "no" de forma constructiva: un no es informacion, no un fracaso; puede ser que no era el momento, el mensaje no fue claro, o no era el perfil.
- NO prometas ingresos, ganancias ni resultados. NO hables de reclutar ni de comisiones. NO uses presion.
- Da animo realista, no falso optimismo. Sugiere una accion concreta y pequena para seguir.

DEVUELVE un JSON valido con esta forma exacta:
{"reencuadre": "2-3 frases que reencuadran el no y dan animo, enfocadas en constancia", "mensaje": "un mensaje corto y respetuoso que el vendedor podria enviarle a esa persona para cerrar con dignidad y dejar la puerta abierta, sin presion"}`;

function parseLoose(text: string): { reencuadre?: string; mensaje?: string } | null {
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

function gate(raw: string) {
  let text = raw.trim();
  let check = checkCompliance(text);
  if (check.status === "blocked") {
    text = makeSafeAlternative(text);
    check = checkCompliance(text);
  }
  return { text, status: check.status };
}

export async function POST(request: Request) {
  await requireSession();
  const json = await request.json().catch(() => null);
  const parsed = requestSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Solicitud invalida" }, { status: 400 });
  }

  const input = parsed.data;
  const generated = await generateWithGemini({
    system: SYSTEM_PROMPT,
    prompt: `El cliente respondio o reacciono asi: "${input.situation}". Genera el JSON con reencuadre y mensaje.`,
    json: true,
    temperature: 0.7,
    maxOutputTokens: 500,
  });

  // Fallback determinista si la IA no esta disponible.
  if (!generated) {
    return NextResponse.json({
      id: input.idempotencyKey,
      reframe:
        "Ese no no define tu capacidad: te dio informacion. Quiza no era el momento o el mensaje no fue claro. Registra el aprendizaje y sigue con la siguiente persona.",
      suggestedMessage:
        "Gracias por responderme con sinceridad. Si mas adelante quieres revisar la informacion con calma, con gusto te la comparto. Te deseo un buen dia.",
      source: "fallback",
      compliance: { status: "safe" },
      disclaimer: LEGAL_DISCLAIMERS.ai,
    });
  }

  const data = parseLoose(generated.text);
  const reframe =
    typeof data?.reencuadre === "string" && data.reencuadre.trim()
      ? gate(data.reencuadre).text
      : "Un no es informacion, no un fracaso. Sigue con la siguiente persona con la misma calma.";
  const message =
    typeof data?.mensaje === "string" && data.mensaje.trim()
      ? gate(data.mensaje)
      : gate(
          "Gracias por tu sinceridad. Si mas adelante quieres revisar la informacion, con gusto te la comparto.",
        );

  return NextResponse.json({
    id: input.idempotencyKey,
    reframe,
    suggestedMessage: message.text,
    source: "gemini",
    compliance: { status: message.status },
    disclaimer: LEGAL_DISCLAIMERS.ai,
  });
}
