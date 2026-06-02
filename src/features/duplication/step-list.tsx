"use client";

import { Check, Clock, Lightbulb } from "lucide-react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Progress } from "@/components/ui/progress";
import type { PlaybookStep } from "@/data/types";
import { minutesLabel } from "@/lib/format";
import { cn } from "@/lib/utils";

/** Estado local de pasos completados por playbook (persistido). */
interface StepState {
  done: Record<string, boolean>;
  toggle: (stepId: string) => void;
}
const useStepStore = create<StepState>()(
  persist(
    (set) => ({
      done: {},
      toggle: (stepId) =>
        set((s) => {
          const next = { ...s.done };
          if (next[stepId]) delete next[stepId];
          else next[stepId] = true;
          return { done: next };
        }),
    }),
    { name: "nexo-playbook-steps" },
  ),
);

/** Lista interactiva de pasos de un playbook con checklist persistente. */
export function StepList({
  steps,
}: {
  playbookId: string;
  steps: PlaybookStep[];
}) {
  const done = useStepStore((s) => s.done);
  const toggle = useStepStore((s) => s.toggle);

  const completed = steps.filter((s) => done[s.id]).length;
  const pct = steps.length ? Math.round((completed / steps.length) * 100) : 0;

  return (
    <div className="space-y-4">
      <div className="rounded-[var(--radius-lg)] border border-border bg-card p-4">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium">Avance de la ruta</span>
          <span className="text-muted-foreground">
            {completed} de {steps.length}
          </span>
        </div>
        <Progress value={pct} />
      </div>

      <ol className="space-y-3">
        {steps.map((step, idx) => {
          const isDone = Boolean(done[step.id]);
          return (
            <li
              key={step.id}
              className={cn(
                "rounded-[var(--radius-lg)] border bg-card p-4 transition-colors",
                isDone ? "border-green-300 bg-green-50/50 dark:bg-green-900/10" : "border-border",
              )}
            >
              <div className="flex items-start gap-3">
                <button
                  onClick={() => toggle(step.id)}
                  className={cn(
                    "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                    isDone
                      ? "border-green-600 bg-green-600 text-white"
                      : "border-border text-transparent hover:border-brand-400",
                  )}
                  aria-pressed={isDone}
                  aria-label={`Marcar paso ${idx + 1}`}
                >
                  <Check className="size-4" />
                </button>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-brand-600 dark:text-brand-400">
                      Paso {idx + 1}
                    </span>
                    {step.durationMinutes && (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="size-3" />
                        {minutesLabel(step.durationMinutes)}
                      </span>
                    )}
                  </div>
                  <h3
                    className={cn(
                      "font-display text-base font-semibold",
                      isDone && "text-muted-foreground line-through",
                    )}
                  >
                    {step.title}
                  </h3>
                  <p className="mt-1 text-sm text-foreground/90">
                    {step.description}
                  </p>
                  {step.tips.length > 0 && (
                    <ul className="mt-3 space-y-1.5">
                      {step.tips.map((tip, t) => (
                        <li
                          key={t}
                          className="flex items-start gap-2 text-sm text-muted-foreground"
                        >
                          <Lightbulb className="mt-0.5 size-3.5 shrink-0 text-gold-500" />
                          {tip}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
