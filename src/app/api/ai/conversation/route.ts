import { NextResponse } from "next/server";
import { z } from "zod";
import { getRepositories } from "@/data";
import { checkCompliance, makeSafeAlternative } from "@/lib/ai/compliance";
import { generateWithGemini } from "@/lib/ai/gemini";
import { LEGAL_DISCLAIMERS } from "@/lib/constants";
import { requireSession } from "@/lib/session";
import {
  INTERACTION_ROLE_LABELS,
  PROSPECT_INTEREST_LABELS,
  PROSPECT_STAGE_LABELS,
} from "@/data/types";

const requestSchema = z
  .object({
    idempotencyKey: z.string().min(8),
    prospectId: z.string().min(1),
    incomingMessage: z.string().max(2000).default(""),
    instruction: z.string().max(300).default(""),
    imageBase64: z.string().max(8_000_000).optional(),
    imageMimeType: z
      .enum(["image/png", "image/jpeg", "image/webp"])
      .optional(),
  })
  .refine((data) => data.incomingMessage.trim().length > 0 || data.imageBase64, {
    message: "Adjunta una captura o escribe lo que dijo el cliente.",
  });

const SYSTEM_PROMPT = `Eres el copiloto de comunicacion de un vendedor de productos de bienestar (network marketing). Tu trabajo es ayudarlo a saber QUE responderle a un cliente, con mensajes autenticos, calidos y NO agresivos. Conoces al cliente por la ficha y el historial que se te dan; usalos para personalizar.

PUBLICO: el vendedor y el cliente suelen tener mas de 50 anios. Lenguaje claro y sencillo.

REGLAS DE CUMPLIMIENTO (obligatorias, sin excepcion):
- NUNCA prometas ni insinues ingresos, ganancias, "libertad financiera" ni resultados garantizados.
- NUNCA hables de reclutar personas, "downline", ni comisiones por traer gente.
- NUNCA hagas afirmaciones de salud (curar, eliminar enfermedades, tratamientos garantizados).
- NUNCA uses presion ni urgencia artificial.
- Enfocate en escuchar, ofrecer informacion sin compromiso y respetar la decision del cliente.

TAREA: Recibiras (1) la ficha y el historial del cliente, y (2) lo ultimo que dijo el cliente (texto y/o una captura de pantalla de su conversacion de WhatsApp).
1. Lee con atencion. Si hay imagen, interpreta el chat (quien dice que).
2. Da 3 respuestas posibles, distintas entre si (por ejemplo: una breve, una que hace una pregunta, una que ofrece informacion). En espanol, cortas (1 a 3 frases), listas para enviar por WhatsApp, sin comillas.
3. Resume en una sola frase "lo que entendi" de la situacion del cliente.
4. Actualiza la ficha del cliente: un resumen breve (maximo 400 caracteres) de lo que sabemos de el (nombre, intereses, objeciones, contexto, proximos pasos), integrando lo nuevo con lo anterior.

Responde UNICAMENTE con un objeto JSON valido con esta forma exacta:
{"lectura": "...", "sugerencias": ["...", "...", "..."], "ficha": "..."}`;

function parseJsonLoose(text: string): {
  lectura?: string;
  sugerencias?: unknown;
  ficha?: string;
} | null {
  const cleaned = text
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/i, "")
    .trim();
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

/** Cada sugerencia pasa por el Modo Cumplimiento; si se bloquea, se sanea. */
function gateSuggestion(raw: string) {
  let text = raw.trim();
  let check = checkCompliance(text);
  if (check.status === "blocked") {
    text = makeSafeAlternative(text);
    check = checkCompliance(text);
  }
  return { text, status: check.status, issues: check.issues };
}

export async function POST(request: Request) {
  const user = await requireSession();
  const json = await request.json().catch(() => null);
  const parsed = requestSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Solicitud invalida" },
      { status: 400 },
    );
  }

  const input = parsed.data;
  const repos = getRepositories();
  const prospect = await repos.prospects.getById(input.prospectId);
  if (!prospect || prospect.ownerId !== user.id) {
    return NextResponse.json({ error: "Prospecto no encontrado" }, { status: 404 });
  }

  const history = await repos.interactions.listByProspect(prospect.id);
  const memory = history
    .slice(-16)
    .map((item) => `- ${INTERACTION_ROLE_LABELS[item.role]}: ${item.content}`)
    .join("\n");

  const userPrompt = [
    "FICHA DEL CLIENTE:",
    `- Nombre: ${prospect.name}`,
    `- Interes: ${PROSPECT_INTEREST_LABELS[prospect.interest]}`,
    `- Etapa: ${PROSPECT_STAGE_LABELS[prospect.stage]}`,
    prospect.notes ? `- Notas del vendedor: ${prospect.notes}` : "",
    prospect.aiProfile ? `- Lo que sabemos (ficha IA): ${prospect.aiProfile}` : "",
    "",
    memory ? `HISTORIAL RECIENTE:\n${memory}` : "HISTORIAL: (sin registros previos)",
    "",
    input.incomingMessage
      ? `LO ULTIMO QUE DIJO EL CLIENTE (texto): ${input.incomingMessage}`
      : "LO ULTIMO QUE DIJO EL CLIENTE: ver la captura de pantalla adjunta.",
    input.instruction ? `INDICACION DEL VENDEDOR: ${input.instruction}` : "",
    "",
    "Genera el JSON con lectura, 3 sugerencias y la ficha actualizada.",
  ]
    .filter(Boolean)
    .join("\n");

  // Imagen opcional (acepta data URL o base64 crudo).
  let image: { data: string; mimeType: string } | undefined;
  if (input.imageBase64) {
    const dataUrl = input.imageBase64.match(/^data:(image\/[a-z]+);base64,(.*)$/i);
    if (dataUrl) {
      image = { mimeType: dataUrl[1], data: dataUrl[2] };
    } else {
      image = {
        mimeType: input.imageMimeType ?? "image/png",
        data: input.imageBase64,
      };
    }
  }

  const generated = await generateWithGemini({
    system: SYSTEM_PROMPT,
    prompt: userPrompt,
    image,
    json: true,
    temperature: 0.7,
    maxOutputTokens: 900,
    timeoutMs: 20_000,
  });

  if (!generated) {
    return NextResponse.json(
      {
        error:
          "No pudimos generar sugerencias en este momento. Intenta de nuevo en unos segundos.",
      },
      { status: 503 },
    );
  }

  const data = parseJsonLoose(generated.text);
  const rawSuggestions = Array.isArray(data?.sugerencias)
    ? (data!.sugerencias as unknown[]).filter(
        (s): s is string => typeof s === "string" && s.trim().length > 0,
      )
    : [generated.text];

  const suggestions = rawSuggestions.slice(0, 3).map(gateSuggestion);
  const reading =
    typeof data?.lectura === "string" && data.lectura.trim()
      ? data.lectura.trim()
      : "Revisa las sugerencias y elige la que mejor encaje.";
  const profile =
    typeof data?.ficha === "string" && data.ficha.trim()
      ? data.ficha.trim().slice(0, 600)
      : null;

  return NextResponse.json({
    id: input.idempotencyKey,
    reading,
    suggestions,
    profile,
    source: "gemini",
    disclaimer: LEGAL_DISCLAIMERS.ai,
  });
}
