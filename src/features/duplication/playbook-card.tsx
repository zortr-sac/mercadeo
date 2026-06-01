import { ChevronRight, ListChecks } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PLAYBOOK_TYPE_LABELS, type Playbook } from "@/data/types";
import { ROUTES } from "@/lib/constants";
import { resolveIcon } from "./icon-map";

/** Tarjeta de playbook (ruta guiada) de duplicación. */
export function PlaybookCard({ playbook }: { playbook: Playbook }) {
  const Icon = resolveIcon(playbook.icon);

  return (
    <Link href={`${ROUTES.duplicacion}/${playbook.slug}`} className="group block">
      <Card className="flex h-full items-start gap-4 p-4 transition-all group-hover:-translate-y-0.5 group-hover:shadow-md">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-[var(--radius-md)] gradient-brand text-white">
          <Icon className="size-6" />
        </span>
        <div className="min-w-0 flex-1">
          <Badge
            variant={playbook.type === "business" ? "default" : "gold"}
            className="mb-1.5"
          >
            {PLAYBOOK_TYPE_LABELS[playbook.type]}
          </Badge>
          <h3 className="font-display text-base font-semibold leading-snug">
            {playbook.title}
          </h3>
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
            {playbook.description}
          </p>
          <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-brand-600 dark:text-brand-400">
            <ListChecks className="size-3.5" />
            {playbook.steps.length} pasos
          </p>
        </div>
        <ChevronRight className="size-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
      </Card>
    </Link>
  );
}
