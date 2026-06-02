import {
  ACTIVITY_KIND_LABELS,
  type ActivityKind,
  type ActivityStats,
} from "@/data/types";
import {
  Award,
  BookOpenCheck,
  CalendarCheck,
  Flame,
  type LucideIcon,
  MessagesSquare,
  Sprout,
  Users,
} from "lucide-react";

/**
 * Gamificación por ACTIVIDAD y constancia (doc §5.2.3).
 * REGLA LEGAL: se premia el esfuerzo, NUNCA resultados económicos.
 * Aquí no se habla de dinero, ingresos ni ganancias: solo de hábito y progreso.
 */

/** Una fila del desglose por tipo de actividad. */
export interface BreakdownRow {
  kind: ActivityKind;
  label: string;
  count: number;
  icon: LucideIcon;
}

/** Icono por tipo de actividad (para el desglose). */
const KIND_ICON: Record<ActivityKind, LucideIcon> = {
  lesson_completed: BookOpenCheck,
  prospect_added: Users,
  conversation_used: MessagesSquare,
  message_generated: MessagesSquare,
  learning_logged: Sprout,
  post_created: Award,
};

/**
 * Desglose por tipo, ordenado de más a menos actividad y filtrando los que
 * están en cero para no abrumar (público 50+: solo lo relevante).
 */
export function buildBreakdown(stats: ActivityStats): BreakdownRow[] {
  return (Object.keys(ACTIVITY_KIND_LABELS) as ActivityKind[])
    .map((kind) => ({
      kind,
      label: ACTIVITY_KIND_LABELS[kind],
      count: stats.byKind[kind] ?? 0,
      icon: KIND_ICON[kind],
    }))
    .filter((row) => row.count > 0)
    .sort((a, b) => b.count - a.count);
}

/** Un logro derivado en el cliente a partir de las estadísticas. */
export interface Achievement {
  id: string;
  title: string;
  /** Texto corto que explica cómo se consigue / por qué importa. */
  hint: string;
  icon: LucideIcon;
  unlocked: boolean;
}

/**
 * Logros derivados SOLO de actividad (lecciones, prospectos, conversaciones,
 * aprendizajes, racha). Mostramos desbloqueados y por desbloquear para motivar.
 */
export function deriveAchievements(stats: ActivityStats): Achievement[] {
  const learnings = stats.byKind.learning_logged ?? 0;
  const conversations = stats.byKind.conversation_used ?? 0;
  const lessons = stats.byKind.lesson_completed ?? 0;

  return [
    {
      id: "first-learning",
      title: "Primer aprendizaje",
      hint: "Registra tu primer “no” reencuadrado.",
      icon: Sprout,
      unlocked: learnings >= 1,
    },
    {
      id: "streak-3",
      title: "Racha de 3 días",
      hint: "Mantente activo 3 días seguidos.",
      icon: Flame,
      unlocked: stats.streakDays >= 3,
    },
    {
      id: "five-conversations",
      title: "5 conversaciones",
      hint: "Atiende 5 conversaciones con clientes.",
      icon: MessagesSquare,
      unlocked: conversations >= 5,
    },
    {
      id: "first-lesson",
      title: "Primera lección",
      hint: "Completa una lección de la Academia.",
      icon: BookOpenCheck,
      unlocked: lessons >= 1,
    },
    {
      id: "constant",
      title: "Constante",
      hint: "Suma 5 acciones en una sola semana.",
      icon: CalendarCheck,
      unlocked: stats.weekCount >= 5,
    },
  ];
}

/** Un día de la semana con su conteo de actividad (lun→dom). */
export interface WeekDay {
  /** Inicial del día en español (L, M, X, J, V, S, D). */
  initial: string;
  /** Nombre largo para lectores de pantalla. */
  longName: string;
  count: number;
  isToday: boolean;
}

const DAY_INITIALS = ["L", "M", "X", "J", "V", "S", "D"];
const DAY_NAMES = [
  "lunes",
  "martes",
  "miércoles",
  "jueves",
  "viernes",
  "sábado",
  "domingo",
];

/** Índice de día con la semana empezando en lunes (0 = lunes … 6 = domingo). */
function mondayIndex(date: Date): number {
  return (date.getDay() + 6) % 7;
}

/**
 * Reparte los eventos recientes en los 7 días de la semana en curso para una
 * mini-barra de actividad. Solo cuenta presencia por día; los datos sensibles
 * (tipo o resultado económico) no se exponen aquí.
 */
export function buildWeek(eventDates: string[]): WeekDay[] {
  const now = new Date();
  const todayIdx = mondayIndex(now);

  // Inicio de la semana (lunes 00:00) en hora local.
  const monday = new Date(now);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(now.getDate() - todayIdx);

  const counts = new Array(7).fill(0) as number[];
  for (const iso of eventDates) {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) continue;
    if (d < monday) continue;
    const idx = mondayIndex(d);
    counts[idx] += 1;
  }

  return DAY_INITIALS.map((initial, idx) => ({
    initial,
    longName: DAY_NAMES[idx],
    count: counts[idx],
    isToday: idx === todayIdx,
  }));
}
