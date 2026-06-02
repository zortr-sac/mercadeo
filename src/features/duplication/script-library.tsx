"use client";

import Link from "next/link";
import { Check, Copy, MessageSquareText, WandSparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Segmented } from "@/components/ui/segmented";
import {
  SCRIPT_CATEGORY_LABELS,
  type Script,
  type ScriptCategory,
} from "@/data/types";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

type Filter = "all" | ScriptCategory;

export function ScriptLibrary({ scripts }: { scripts: Script[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categories = useMemo(
    () => [...new Set(scripts.map((script) => script.category))],
    [scripts],
  );

  const filtered = useMemo(
    () =>
      filter === "all"
        ? scripts
        : scripts.filter((script) => script.category === filter),
    [filter, scripts],
  );

  const options = [
    { value: "all" as Filter, label: "Todos" },
    ...categories.map((category) => ({
      value: category as Filter,
      label: SCRIPT_CATEGORY_LABELS[category],
    })),
  ];

  async function copy(script: Script) {
    try {
      await navigator.clipboard.writeText(script.content);
      setCopiedId(script.id);
      toast.success("Plantilla copiada.");
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast.error("No se pudo copiar.");
    }
  }

  return (
    <div className="space-y-5">
      <Segmented options={options} value={filter} onChange={setFilter} />

      {filtered.length === 0 ? (
        <EmptyState
          icon={MessageSquareText}
          title="Sin plantillas"
          description="No hay textos en esta categoria todavia."
        />
      ) : (
        <div className="space-y-4">
          {filtered.map((script) => (
            <Card key={script.id} className="p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <Badge variant="muted" className="mb-2">
                    {SCRIPT_CATEGORY_LABELS[script.category]}
                  </Badge>
                  <h3 className="font-display text-xl font-semibold">
                    {script.title}
                  </h3>
                  <p className="text-muted-foreground">{script.scenario}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link
                    href={ROUTES.mensajes}
                    className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 font-medium transition-colors hover:bg-muted"
                  >
                    <WandSparkles className="size-5" />
                    Usar IA
                  </Link>
                  <button
                    onClick={() => copy(script)}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 font-medium transition-colors hover:bg-muted",
                      copiedId === script.id && "border-green-300 text-green-700",
                    )}
                  >
                    {copiedId === script.id ? (
                      <>
                        <Check className="size-5" /> Copiado
                      </>
                    ) : (
                      <>
                        <Copy className="size-5" /> Copiar
                      </>
                    )}
                  </button>
                </div>
              </div>
              <p className="mt-4 whitespace-pre-line rounded-lg bg-muted/70 p-4 leading-relaxed">
                {script.content}
              </p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
