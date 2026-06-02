import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock } from "lucide-react";
import Link from "next/link";
import { getRepositories } from "@/data";
import { Container } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { PLAYBOOK_TYPE_LABELS } from "@/data/types";
import { ROUTES } from "@/lib/constants";
import { minutesLabel } from "@/lib/format";
import { requireSession } from "@/lib/session";
import {
  FALLBACK_PLAYBOOK_ICON,
  PLAYBOOK_ICONS,
} from "@/features/duplication/icon-map";
import { StepList } from "@/features/duplication/step-list";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ playbookSlug: string }>;
}): Promise<Metadata> {
  const { playbookSlug } = await params;
  const playbook = await getRepositories().duplication.getPlaybookBySlug(
    playbookSlug,
  );
  return { title: playbook?.title ?? "Ruta guiada" };
}

export default async function PlaybookPage({
  params,
}: {
  params: Promise<{ playbookSlug: string }>;
}) {
  await requireSession();
  const { playbookSlug } = await params;
  const playbook = await getRepositories().duplication.getPlaybookBySlug(
    playbookSlug,
  );
  if (!playbook) notFound();

  const Icon = PLAYBOOK_ICONS[playbook.icon] ?? FALLBACK_PLAYBOOK_ICON;
  const totalMin = playbook.steps.reduce(
    (sum, step) => sum + (step.durationMinutes ?? 0),
    0,
  );

  return (
    <Container>
      <Link
        href={ROUTES.duplicacion}
        className="inline-flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-5" />
        Volver al sistema comercial
      </Link>

      <div className="mt-4 flex items-start gap-4">
        <span className="flex size-14 shrink-0 items-center justify-center rounded-lg gradient-brand text-white">
          <Icon className="size-7" />
        </span>
        <div>
          <Badge variant={playbook.type === "business" ? "default" : "gold"}>
            {PLAYBOOK_TYPE_LABELS[playbook.type]}
          </Badge>
          <h1 className="mt-2 font-display text-2xl font-bold">
            {playbook.title}
          </h1>
          <p className="mt-2 text-muted-foreground">{playbook.description}</p>
          {totalMin > 0 && (
            <p className="mt-3 flex items-center gap-2 text-muted-foreground">
              <Clock className="size-5" />
              Duracion estimada: {minutesLabel(totalMin)}
            </p>
          )}
        </div>
      </div>

      <div className="mt-8">
        <StepList playbookId={playbook.id} steps={playbook.steps} />
      </div>
    </Container>
  );
}
