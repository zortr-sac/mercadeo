"use client";

import {
  ExternalLink,
  FileText,
  Film,
  Image as ImageIcon,
  Link2,
  Presentation,
  type LucideIcon,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Segmented } from "@/components/ui/segmented";
import {
  RESOURCE_TYPE_LABELS,
  type Resource,
  type ResourceType,
} from "@/data/types";

const TYPE_ICON: Record<ResourceType, LucideIcon> = {
  pdf: FileText,
  video: Film,
  image: ImageIcon,
  slides: Presentation,
  link: Link2,
};

/** Biblioteca de recursos descargables, filtrable por categoría. */
export function ResourceLibrary({
  resources,
  categories,
}: {
  resources: Resource[];
  categories: string[];
}) {
  const [filter, setFilter] = useState<string>("all");

  const filtered = useMemo(
    () =>
      filter === "all"
        ? resources
        : resources.filter((r) => r.category === filter),
    [filter, resources],
  );

  const options = [
    { value: "all", label: "Todos" },
    ...categories.map((c) => ({ value: c, label: c })),
  ];

  return (
    <div className="space-y-5">
      <Segmented options={options} value={filter} onChange={setFilter} />
      <div className="grid gap-3 sm:grid-cols-2">
        {filtered.map((r) => {
          const Icon = TYPE_ICON[r.type];
          return (
            <a
              key={r.id}
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group"
            >
              <Card className="flex h-full items-start gap-3 p-4 transition-all group-hover:-translate-y-0.5 group-hover:shadow-md">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-300">
                  <Icon className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-medium">{r.title}</h3>
                  <p className="line-clamp-2 text-xs text-muted-foreground">
                    {r.description}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {RESOURCE_TYPE_LABELS[r.type]}
                    {r.sizeLabel ? ` · ${r.sizeLabel}` : ""}
                  </p>
                </div>
                <ExternalLink className="size-4 shrink-0 text-muted-foreground" />
              </Card>
            </a>
          );
        })}
      </div>
    </div>
  );
}
