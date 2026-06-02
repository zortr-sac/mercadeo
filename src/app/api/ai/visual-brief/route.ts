import { NextResponse } from "next/server";
import { z } from "zod";
import { checkCompliance } from "@/lib/ai/compliance";

const requestSchema = z.object({
  idempotencyKey: z.string().min(8),
  businessName: z.string().min(1).max(120),
  objective: z.string().min(1).max(200),
  productContext: z.string().max(500).default(""),
});

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = requestSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Solicitud invalida", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const input = parsed.data;
  const compliance = checkCompliance(`${input.objective}\n${input.productContext}`);
  const visualBrief = [
    `Pieza visual para ${input.businessName}.`,
    `Objetivo: ${input.objective}.`,
    "Estilo: fotografia realista, luz natural, personas adultas conversando con calma, espacio limpio, sin dinero, sin autos de lujo, sin promesas escritas.",
    input.productContext
      ? `Contexto del producto: ${input.productContext}.`
      : "Usar elementos neutros de bienestar y formacion.",
    "Texto sugerido en la pieza: 'Informacion clara para decidir con calma'.",
  ].join("\n");

  return NextResponse.json({
    id: input.idempotencyKey,
    visualBrief,
    compliance,
  });
}
