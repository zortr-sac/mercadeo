import { Award, CheckCircle2, Flame, Lock, ShieldCheck, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { ActivityEvent, ActivityStats } from "@/data/types";
import { cn } from "@/lib/utils";
import { buildBreakdown, buildWeek, deriveAchievements } from "./gamification";

/** Pluraliza de forma sencilla en español ("1 día" / "2 días"). */
function plural(n: number, singular: string, pluralForm: string) {
  return `${n} ${n === 1 ? singular : pluralForm}`;
}

/**
 * Bloque 1 — Tu constancia.
 * Panel motivador con racha, actividad de la semana, puntos de constancia,
 * desglose por tipo y logros. Se premia la ACTIVIDAD, nunca el dinero.
 */
export function StreakPanel({
  stats,
  recent,
}: {
  stats: ActivityStats;
  recent: ActivityEvent[];
}) {
  const week = buildWeek(recent.map((event) => event.createdAt));
  const maxInWeek = Math.max(1, ...week.map((day) => day.count));
  const breakdown = buildBreakdown(stats);
  const achievements = deriveAchievements(stats);
  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  const hasStreak = stats.streakDays > 0;

  return (
    <section
      aria-labelledby="constancia-titulo"
      className="space-y-5 rounded-[var(--radius-lg)] border border-border bg-card p-5 shadow-sm sm:p-6"
    >
      <div className="flex items-start gap-3">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-full gradient-brand text-white">
          <Star className="size-6" aria-hidden />
        </span>
        <div>
          <h2
            id="constancia-titulo"
            className="font-display text-2xl font-bold tracking-tight"
          >
            Tu constancia
          </h2>
          <p className="mt-1 text-base leading-relaxed text-muted-foreground">
            Aquí se premia tu actividad y tu esfuerzo, no resultados económicos.
            Cada acción suma.
          </p>
        </div>
      </div>

      {/* Racha — el dato más motivador, a lo grande. */}
      <div
        className={cn(
          "flex items-center gap-4 rounded-[var(--radius-lg)] border p-5",
          hasStreak
            ? "border-gold-200 bg-gold-50 text-gold-900 dark:border-gold-900/50 dark:bg-gold-900/20 dark:text-gold-100"
            : "border-border bg-secondary text-foreground",
        )}
      >
        <span
          className={cn(
            "flex size-16 shrink-0 items-center justify-center rounded-full",
            hasStreak
              ? "bg-gold-100 text-gold-600 dark:bg-gold-900/40 dark:text-gold-300"
              : "bg-muted text-muted-foreground",
          )}
        >
          <Flame className="size-9" aria-hidden />
        </span>
        <div>
          {hasStreak ? (
            <>
              <p className="font-display text-3xl font-bold leading-tight">
                {plural(stats.streakDays, "día seguido", "días seguidos")}
              </p>
              <p className="mt-1 text-lg leading-relaxed">
                ¡Vas muy bien! Haz una acción hoy para no perder tu racha.
              </p>
            </>
          ) : (
            <>
              <p className="font-display text-3xl font-bold leading-tight">
                Empieza tu racha hoy
              </p>
              <p className="mt-1 text-lg leading-relaxed text-muted-foreground">
                Con una sola acción hoy comienzas a sumar días seguidos.
              </p>
            </>
          )}
        </div>
      </div>

      {/* Actividad de la semana — mini-barra por día. */}
      <div className="rounded-[var(--radius-lg)] border border-border bg-secondary/60 p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="font-display text-xl font-bold tracking-tight">
            Tu semana
          </h3>
          <p className="text-base text-muted-foreground">
            {plural(stats.weekCount, "acción esta semana", "acciones esta semana")}
          </p>
        </div>

        <ul
          className="mt-4 flex items-end justify-between gap-1.5"
          aria-label="Actividad por día de esta semana"
        >
          {week.map((day) => {
            const height = day.count === 0 ? 8 : 16 + (day.count / maxInWeek) * 56;
            return (
              <li
                key={day.longName}
                className="flex flex-1 flex-col items-center gap-2"
              >
                <span
                  className="flex w-full items-end justify-center"
                  style={{ height: 72 }}
                >
                  <span
                    className={cn(
                      "w-full max-w-9 rounded-full transition-[height]",
                      day.count > 0
                        ? "bg-brand-500 dark:bg-brand-400"
                        : "bg-muted",
                    )}
                    style={{ height }}
                    aria-hidden
                  />
                </span>
                <span
                  className={cn(
                    "text-base font-semibold",
                    day.isToday ? "text-brand-700 dark:text-brand-300" : "text-muted-foreground",
                  )}
                >
                  {day.initial}
                </span>
                <span className="sr-only">
                  {day.longName}: {plural(day.count, "acción", "acciones")}
                  {day.isToday ? " (hoy)" : ""}
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Puntos de constancia + desglose por tipo. */}
      <div className="grid gap-4 sm:grid-cols-[auto_1fr]">
        <div className="flex items-center gap-4 rounded-[var(--radius-lg)] border border-brand-200 bg-brand-50 p-5 text-brand-900 dark:border-brand-900/50 dark:bg-brand-900/20 dark:text-brand-100 sm:flex-col sm:items-start sm:justify-center sm:text-center">
          <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200 sm:mx-auto">
            <Award className="size-7" aria-hidden />
          </span>
          <div className="sm:mx-auto">
            <p className="font-display text-3xl font-bold leading-none">
              {stats.totalPoints}
            </p>
            <p className="mt-1 text-base font-medium">puntos de constancia</p>
          </div>
        </div>

        <div className="rounded-[var(--radius-lg)] border border-border bg-card p-5">
          <h3 className="font-display text-xl font-bold tracking-tight">
            En qué has estado activo
          </h3>
          {breakdown.length > 0 ? (
            <ul className="mt-3 space-y-2.5">
              {breakdown.map((row) => (
                <li
                  key={row.kind}
                  className="flex items-center gap-3 text-lg"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-brand-700 dark:text-brand-300">
                    <row.icon className="size-5" aria-hidden />
                  </span>
                  <span className="flex-1 leading-snug">{row.label}</span>
                  <span className="font-display text-xl font-bold tabular-nums">
                    {row.count}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-base leading-relaxed text-muted-foreground">
              Aún no tienes actividad registrada. En cuanto completes una
              lección, agregues un prospecto o registres un aprendizaje, lo verás
              aquí.
            </p>
          )}
        </div>
      </div>

      {/* Logros. */}
      <div className="rounded-[var(--radius-lg)] border border-border bg-card p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="font-display text-xl font-bold tracking-tight">Logros</h3>
          <Badge variant="default" className="px-3 py-1 text-sm">
            {unlockedCount} de {achievements.length} desbloqueados
          </Badge>
        </div>

        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {achievements.map((achievement) => (
            <li
              key={achievement.id}
              className={cn(
                "flex items-start gap-3 rounded-[var(--radius-md)] border p-4",
                achievement.unlocked
                  ? "border-brand-200 bg-brand-50 dark:border-brand-900/50 dark:bg-brand-900/20"
                  : "border-dashed border-border bg-secondary/50",
              )}
            >
              <span
                className={cn(
                  "flex size-11 shrink-0 items-center justify-center rounded-full",
                  achievement.unlocked
                    ? "bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200"
                    : "bg-muted text-muted-foreground",
                )}
              >
                <achievement.icon className="size-6" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p
                    className={cn(
                      "text-lg font-semibold leading-snug",
                      !achievement.unlocked && "text-muted-foreground",
                    )}
                  >
                    {achievement.title}
                  </p>
                  {achievement.unlocked ? (
                    <CheckCircle2
                      className="size-5 shrink-0 text-brand-600 dark:text-brand-400"
                      aria-label="Logro desbloqueado"
                    />
                  ) : (
                    <Lock
                      className="size-4 shrink-0 text-muted-foreground"
                      aria-label="Logro por desbloquear"
                    />
                  )}
                </div>
                <p className="mt-0.5 text-base leading-snug text-muted-foreground">
                  {achievement.hint}
                </p>
              </div>
            </li>
          ))}
        </ul>

        <p className="mt-4 flex items-start gap-2.5 rounded-[var(--radius-md)] bg-muted p-4 text-base leading-relaxed text-muted-foreground">
          <ShieldCheck className="mt-0.5 size-5 shrink-0" aria-hidden />
          Estos logros reconocen tu actividad y tu constancia. No miden ingresos
          ni resultados económicos.
        </p>
      </div>
    </section>
  );
}
