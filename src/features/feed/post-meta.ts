import {
  Calendar,
  Megaphone,
  Sparkles,
  Trophy,
  type LucideIcon,
} from "lucide-react";
import type { PostType } from "@/data/types";

/** Estilo visual (icono + color) por tipo de publicación. */
export const POST_TYPE_META: Record<
  PostType,
  { icon: LucideIcon; badge: "default" | "gold" | "success" | "muted"; tint: string }
> = {
  announcement: { icon: Megaphone, badge: "default", tint: "text-brand-600" },
  event: { icon: Calendar, badge: "gold", tint: "text-gold-600" },
  recognition: { icon: Trophy, badge: "success", tint: "text-green-600" },
  motivation: { icon: Sparkles, badge: "muted", tint: "text-violet-600" },
};
