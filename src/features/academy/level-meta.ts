import type { CourseLevel } from "@/data/types";

/** Estilo de badge por nivel de curso. */
export const LEVEL_BADGE: Record<CourseLevel, "success" | "default" | "gold"> = {
  beginner: "success",
  intermediate: "default",
  advanced: "gold",
};
