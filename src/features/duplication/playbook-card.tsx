import { ChevronRight, ListChecks } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PLAYBOOK_TYPE_LABELS, type Playbook } from "@/data/types";
import { ROUTES } from "@/lib/constants";
import { FALLBACK_PLAYBOOK_ICON, PLAYBOOK_ICONS } from "./icon-map";

export function PlaybookCard({ playbook }: { playbook: Playbook }) {
  const Icon = PLAYBOOK_ICONS[playbook.icon] ?? FALLBACK_PLAYBOOK_ICON;

  return (
    <Link href={`${ROUTES.duplicacion}/${playbook.slug}`} className="group block">
      <Card className="flex h-full items-start gap-4 p-4 transition-colors group-hover:bg-muted">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-lg gradient-brand text-white">
          <Icon className="size-6" />
        </span>
        <div className="min-w-0 flex-1">
          <Badge
            variant={playbook.type === "business" ? "default" : "gold"}
            className="mb-2"
          >
            {PLAYBOOK_TYPE_LABELS[playbook.type]}
          </Badge>
          <h3 className="font-display text-xl font-semibold leading-snug">
            {playbook.title}
          </h3>
          <p className="mt-2 line-clamp-2 text-muted-foreground">
            {playbook.description}
          </p>
          <p className="mt-3 flex items-center gap-2 font-medium text-brand-700">
            <ListChecks className="size-5" />
            {playbook.steps.length} pasos
          </p>
        </div>
        <ChevronRight className="size-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1" />
      </Card>
    </Link>
  );
}
