import {
  HeartHandshake,
  MessageSquareHeart,
  PhoneCall,
  RefreshCcw,
  Presentation,
  CalendarHeart,
  Handshake,
  type LucideIcon,
} from "lucide-react";
import {
  SCRIPT_CATEGORY_LABELS,
  type MessageTemplate,
  type ScriptCategory,
} from "@/data/types";

/** Icono por categoría de plantilla (uno por grupo, claro y reconocible). */
export const CATEGORY_ICONS: Record<ScriptCategory, LucideIcon> = {
  prospecting: PhoneCall,
  invitation: CalendarHeart,
  presentation: Presentation,
  closing: Handshake,
  objection: MessageSquareHeart,
  followup: HeartHandshake,
  reactivation: RefreshCcw,
};

/** Orden de aparición de los grupos en la galería. */
const CATEGORY_ORDER: ScriptCategory[] = [
  "prospecting",
  "invitation",
  "presentation",
  "followup",
  "objection",
  "reactivation",
  "closing",
];

export interface TemplateGroup {
  category: ScriptCategory;
  label: string;
  icon: LucideIcon;
  templates: MessageTemplate[];
}

/** Agrupa las plantillas por categoría, en orden estable y solo con grupos no vacíos. */
export function groupTemplates(templates: MessageTemplate[]): TemplateGroup[] {
  return CATEGORY_ORDER.map((category) => ({
    category,
    label: SCRIPT_CATEGORY_LABELS[category],
    icon: CATEGORY_ICONS[category],
    templates: templates.filter((template) => template.category === category),
  })).filter((group) => group.templates.length > 0);
}
