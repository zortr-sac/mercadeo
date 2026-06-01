import { z } from "zod";
import { POST_TYPES } from "@/data/types";

/** Esquema de validación para crear una publicación. */
export const newPostSchema = z
  .object({
    type: z.enum([
      POST_TYPES.ANNOUNCEMENT,
      POST_TYPES.MOTIVATION,
      POST_TYPES.EVENT,
      POST_TYPES.RECOGNITION,
    ]),
    title: z
      .string()
      .trim()
      .min(3, "El título es muy corto.")
      .max(120, "El título es muy largo."),
    body: z
      .string()
      .trim()
      .min(10, "El contenido es muy corto.")
      .max(2000, "El contenido es muy largo."),
    eventDate: z.string().nullable().optional(),
    eventLocation: z.string().trim().max(160).nullable().optional(),
    pinned: z.boolean().optional(),
  })
  .refine(
    (data) => data.type !== POST_TYPES.EVENT || Boolean(data.eventDate),
    { message: "Indica la fecha del evento.", path: ["eventDate"] },
  );

export type NewPostValues = z.infer<typeof newPostSchema>;
