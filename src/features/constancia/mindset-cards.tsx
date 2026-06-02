import {
  Compass,
  Footprints,
  HandHeart,
  Lightbulb,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MindsetCard {
  icon: LucideIcon;
  title: string;
  body: string;
  /** La tarjeta ancla usa acento dorado para romper la monotonía visual. */
  accent?: boolean;
}

const CARDS: MindsetCard[] = [
  {
    icon: Lightbulb,
    title: "Un “no” es información, no un veredicto",
    body: "Te dice que quizá no era el momento o el mensaje no fue claro. No dice nada sobre tu valor.",
  },
  {
    icon: Footprints,
    title: "La constancia vence al talento",
    body: "No necesitas ser el mejor: necesitas seguir apareciendo. Quien insiste con calma, avanza.",
    accent: true,
  },
  {
    icon: Compass,
    title: "Tu meta de hoy: dos conversaciones claras",
    body: "Pequeña y alcanzable. Dos charlas con respeto ya son un buen día de trabajo.",
  },
  {
    icon: HandHeart,
    title: "Celebra la acción, no solo el resultado",
    body: "Escribiste, llamaste, lo intentaste. Eso ya cuenta y merece reconocerse.",
  },
];

/**
 * Bloque 4 — Micro-lecciones de mentalidad (contenido estático).
 * Ideas cortas de constancia y mentalidad, en tono cálido y de apoyo, para
 * sostener el ánimo y combatir el abandono tras un rechazo.
 */
export function MindsetCards() {
  return (
    <section aria-labelledby="mentalidad-titulo" className="space-y-4">
      <div>
        <h2
          id="mentalidad-titulo"
          className="font-display text-2xl font-bold tracking-tight"
        >
          Ideas para sostener el ánimo
        </h2>
        <p className="mt-1 text-base leading-relaxed text-muted-foreground">
          Léelas con calma cuando lo necesites. Vuelve a ellas cada vez que un
          “no” pese.
        </p>
      </div>

      <ul className="grid gap-4 sm:grid-cols-2">
        {CARDS.map((card) => (
          <li
            key={card.title}
            className={cn(
              "rounded-[var(--radius-lg)] border p-5 shadow-sm",
              card.accent
                ? "border-gold-200 bg-gold-50 text-gold-950 dark:border-gold-900/50 dark:bg-gold-900/20 dark:text-gold-50"
                : "border-border bg-card text-card-foreground",
            )}
          >
            <span
              className={cn(
                "flex size-12 items-center justify-center rounded-full",
                card.accent
                  ? "bg-gold-100 text-gold-600 dark:bg-gold-900/40 dark:text-gold-300"
                  : "bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200",
              )}
            >
              <card.icon className="size-6" aria-hidden />
            </span>
            <h3 className="mt-3 font-display text-xl font-bold leading-snug tracking-tight">
              {card.title}
            </h3>
            <p
              className={cn(
                "mt-2 text-lg leading-relaxed",
                card.accent
                  ? "text-gold-900 dark:text-gold-100"
                  : "text-muted-foreground",
              )}
            >
              {card.body}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
