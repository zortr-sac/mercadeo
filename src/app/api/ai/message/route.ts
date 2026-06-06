import { NextResponse } from "next/server";
import { z } from "zod";
import {
  buildResponsibleMessage,
  checkCompliance,
  makeSafeAlternative,
} from "@/lib/ai/compliance";
import { generateWithGemini } from "@/lib/ai/gemini";
import { assertWithinBudget, recordAiUsage } from "@/lib/ai/usage";
import { LEGAL_DISCLAIMERS } from "@/lib/constants";
import { requireSession } from "@/lib/session";

const requestSchema = z.object({
  idempotencyKey: z.string().min(8),
  prospectName: z.string().min(1).max(80),
  prospectContext: z.string().max(500).default(""),
  templateTitle: z.string().min(1).max(120),
  templateBase: z.string().min(1).max(800),
  situation: z.string().max(300).default(""),
  complianceHint: z.string().max(300).default(""),
  tone: z.enum(["calm", "warm", "direct", "reactivation"]),
  userInstruction: z.string().max(500).default(""),
  // Instrucciones por mensaje que define el admin (se suman al SYSTEM_PROMPT base).
  systemPrompt: z.string().max(2000).default(""),
});

const TONE_LABELS: Record<string, string> = {
  warm: "cercano y humano",
  calm: "calmado y sin prisa",
  direct: "directo pero amable",
  reactivation: "respetuoso para retomar el contacto",
};

const SYSTEM_PROMPT = `Eres un asistente que ayuda a un vendedor de productos de bienestar a escribir un mensaje de WhatsApp para un cliente potencial.

PUBLICO: el vendedor y el cliente suelen tener mas de 50 anios. Escribe claro y sencillo.

REGLAS DE CUMPLIMIENTO (obligatorias, sin excepcion):
- NUNCA prometas ni insinues ingresos, ganancias, "libertad financiera" ni resultados garantizados.
- NUNCA hables de reclutar personas, "downline", ni comisiones por traer gente.
- NUNCA hagas afirmaciones de salud (curar, eliminar enfermedades, tratamientos garantizados).
- NUNCA uses presion ni urgencia artificial ("ultima oportunidad", "solo hoy", "te vas a arrepentir").

ESTILO DEL MENSAJE:
- Saluda por el nombre del cliente.
- Suena humano, cercano y natural; nunca robotico ni como mensaje masivo.
- Adapta el tono a la situacion emocional indicada.
- Ofrece compartir informacion breve, sin compromiso, y deja libertad para responder.
- Espanol neutro, frases cortas y claras. Maximo 4 frases. Como mucho 1 emoji (o ninguno).

Devuelve UNICAMENTE el texto del mensaje listo para enviar, sin comillas, sin titulos y sin explicaciones.`;

export async function POST(request: Request) {
  const user = await requireSession();
  const json = await request.json().catch(() => null);
  const parsed = requestSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Solicitud invalida", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const input = parsed.data;

  // Presupuesto mensual de IA: si ya alcanzó su límite, bloquea (popup de WhatsApp).
  const budget = await assertWithinBudget(user.businessId, user.id);
  if (!budget.ok) {
    return NextResponse.json({ error: "ai_limit" }, { status: 429 });
  }
  const toneLabel = TONE_LABELS[input.tone] ?? "cercano";

  // Revisa el material que entra (situacion / contexto) por si trae frases de riesgo.
  const inputCheck = checkCompliance(
    `${input.situation}\n${input.prospectContext}\n${input.userInstruction}\n${input.templateBase}`,
  );

  const userPrompt = [
    `Nombre del cliente: ${input.prospectName.trim()}.`,
    input.situation ? `Situacion del cliente: ${input.situation}.` : "",
    `Intencion de la plantilla: ${input.templateTitle}.`,
    `Guia base: ${input.templateBase}.`,
    input.complianceHint ? `Recordatorio de cumplimiento: ${input.complianceHint}.` : "",
    input.prospectContext ? `Contexto adicional: ${input.prospectContext}.` : "",
    input.userInstruction ? `Indicacion extra del vendedor: ${input.userInstruction}.` : "",
    `Tono deseado: ${toneLabel}.`,
    "Escribe el mensaje de WhatsApp siguiendo todas las reglas.",
  ]
    .filter(Boolean)
    .join("\n");

  // El cumplimiento legal base SIEMPRE aplica; el system prompt del mensaje se suma encima.
  const system = input.systemPrompt
    ? `${SYSTEM_PROMPT}\n\n--- Instrucciones de este mensaje ---\n${input.systemPrompt}`
    : SYSTEM_PROMPT;

  const generated = await generateWithGemini({
    system,
    prompt: userPrompt,
    temperature: 0.75,
    maxOutputTokens: 320,
  });

  const source = generated ? "gemini" : "fallback";

  if (generated) {
    await recordAiUsage({
      businessId: user.businessId,
      userId: user.id,
      endpoint: "message",
      model: generated.model,
      usage: generated.usage,
      idempotencyKey: input.idempotencyKey,
    });
  }

  // Mensaje base: IA real si esta disponible, si no el generador determinista.
  let message =
    generated?.text ??
    buildResponsibleMessage({
      prospectName: input.prospectName,
      context: input.prospectContext || input.situation,
      templateTitle: input.templateTitle,
      templateBase: input.templateBase,
      tone: input.tone,
    });

  // Modo Cumplimiento: el output SIEMPRE pasa por el filtro. Si esta bloqueado,
  // forzamos la alternativa segura para no enviar nunca una frase de riesgo.
  let outputCheck = checkCompliance(message);
  if (outputCheck.status === "blocked") {
    message = makeSafeAlternative(message);
    outputCheck = checkCompliance(message);
  }

  const issues = [...inputCheck.issues, ...outputCheck.issues].filter(
    (issue, index, list) =>
      list.findIndex((item) => item.code === issue.code) === index,
  );
  const status = issues.some((issue) => issue.severity === "block")
    ? "blocked"
    : issues.length > 0
      ? "needs_review"
      : "safe";

  return NextResponse.json({
    id: input.idempotencyKey,
    message,
    source,
    compliance: {
      status,
      issues,
      suggestedText: outputCheck.suggestedText,
    },
    disclaimer: LEGAL_DISCLAIMERS.ai,
  });
}
