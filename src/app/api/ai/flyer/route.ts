import { NextResponse } from "next/server";
import { z } from "zod";
import { checkCompliance } from "@/lib/ai/compliance";
import { generateImageWithGemini } from "@/lib/ai/gemini";
import { parseInlineImage } from "@/lib/ai/image-input";
import { assertWithinBudget, recordAiUsage } from "@/lib/ai/usage";
import { LEGAL_DISCLAIMERS } from "@/lib/constants";
import { requireSession } from "@/lib/session";

const requestSchema = z.object({
  idempotencyKey: z.string().min(8),
  description: z.string().min(3).max(500),
  kind: z.string().max(40).optional(),
  /** Imagen de referencia opcional (data URL o base64). */
  imageBase64: z.string().max(12_000_000).optional(),
  imageMimeType: z.enum(["image/png", "image/jpeg", "image/webp"]).optional(),
});

function buildPrompt(description: string, kind?: string, hasImage?: boolean): string {
  const angle = kind ? ` It is a "${kind}" style ad.` : "";
  const reference = hasImage
    ? " Use the attached reference image as the real product/subject of the ad; keep it recognizable and faithful to it."
    : "";
  return [
    "Create a clean, modern advertising flyer image for a wellness or beauty product,",
    "vertical 4:5 aspect, suitable to share on social media (Instagram, WhatsApp, TikTok).",
    `Subject: ${description}.${angle}${reference}`,
    "Warm, trustworthy and friendly tone; soft natural lighting; a tidy, attractive composition;",
    "real-looking product. Spanish-speaking adult audience.",
    "IMPORTANT: do NOT include any text that promises income, earnings, getting rich, or guaranteed",
    "results; no claims about curing illnesses. Keep any on-image text minimal and in Spanish.",
  ].join(" ");
}

export async function POST(request: Request) {
  const user = await requireSession();
  const json = await request.json().catch(() => null);
  const parsed = requestSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Solicitud invalida" }, { status: 400 });
  }
  const { description, kind, idempotencyKey, imageBase64, imageMimeType } = parsed.data;

  // Presupuesto mensual de IA (la imagen es lo más costoso): bloquea si ya llegó al límite.
  const budget = await assertWithinBudget(user.businessId, user.id);
  if (!budget.ok) {
    return NextResponse.json({ error: "ai_limit" }, { status: 429 });
  }

  // Gate the user's text BEFORE spending an image generation.
  const check = checkCompliance(description);
  if (check.status === "blocked") {
    return NextResponse.json({
      id: idempotencyKey,
      status: "blocked",
      message: "Ese texto puede sonar a promesa de ingresos o resultados. Escríbelo de forma más informativa, sin prometer ganancias.",
    });
  }

  const reference = parseInlineImage(imageBase64, imageMimeType);
  const image = await generateImageWithGemini({
    prompt: buildPrompt(description, kind, Boolean(reference)),
    image: reference,
  });

  if (!image.ok) {
    const message =
      image.reason === "quota"
        ? "La generación de imágenes no está disponible: la cuenta de IA no tiene cuota/facturación activa para imágenes. Avísale al administrador."
        : "No se pudo crear la imagen ahora mismo. Intenta de nuevo en un momento.";
    return NextResponse.json({ id: idempotencyKey, status: "unavailable", message });
  }

  await recordAiUsage({
    businessId: user.businessId,
    userId: user.id,
    endpoint: "flyer",
    model: image.model,
    usage: image.usage,
    idempotencyKey,
  });

  return NextResponse.json({
    id: idempotencyKey,
    status: "ok",
    image: image.data,
    mimeType: image.mimeType,
    disclaimer: LEGAL_DISCLAIMERS.ai,
  });
}
