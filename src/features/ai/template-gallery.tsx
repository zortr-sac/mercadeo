"use client";

import { ChevronRight } from "lucide-react";
import type { MessageTemplate } from "@/data/types";
import { groupTemplates } from "./message-categories";

/**
 * Paso 1: galería de plantillas agrupadas por situación/emoción.
 * Tarjetas grandes, una acción por tarjeta. El usuario solo elige su caso.
 */
export function TemplateGallery({
  templates,
  onSelect,
}: {
  templates: MessageTemplate[];
  onSelect: (template: MessageTemplate) => void;
}) {
  const groups = groupTemplates(templates);

  return (
    <div className="space-y-10">
      {groups.map((group) => {
        const Icon = group.icon;
        return (
          <section key={group.category} aria-labelledby={`grupo-${group.category}`}>
            <div className="mb-4 flex items-center gap-3">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200">
                <Icon className="size-6" aria-hidden />
              </span>
              <h2
                id={`grupo-${group.category}`}
                className="font-display text-xl font-bold tracking-tight"
              >
                {group.label}
              </h2>
            </div>

            <ul className="grid gap-4 sm:grid-cols-2">
              {group.templates.map((template) => (
                <li key={template.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(template)}
                    className="group flex h-full w-full cursor-pointer flex-col items-start gap-2 rounded-[var(--radius-lg)] border border-border bg-card p-5 text-left shadow-sm transition-colors hover:border-brand-400 hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  >
                    <span className="flex w-full items-start justify-between gap-3">
                      <span className="font-display text-lg font-semibold leading-snug text-foreground">
                        {template.title}
                      </span>
                      <ChevronRight
                        className="mt-0.5 size-6 shrink-0 text-muted-foreground transition-colors group-hover:text-brand-600"
                        aria-hidden
                      />
                    </span>
                    <span className="text-base leading-relaxed text-muted-foreground">
                      {template.situation}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
