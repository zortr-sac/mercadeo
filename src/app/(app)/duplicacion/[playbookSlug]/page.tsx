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
import { resolveIcon } from "@/features/duplication/icon-map";
import { StepList } from "@/features/duplication/step-list";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ playbookSlug: string }>;
}): Promise<Metadata> {
  const { playbookSlug } = await params;
  const pb = await getRepositories().duplication.getPlaybookBySlug(playbookSlug);
  return { title: pb?.title ?? "Ruta guiada" };
}

export default async function PlaybookPage({
  params,
}: {
  params: Promise<{ playbookSlug: string }>;
}) {
  await requireSession();
  const { playbookSlug } = await params;
  const pb = await getRepositories().duplication.getPlaybookBySlug(playbookSlug);
  if (!pb) notFound();

  const Icon = resolveIcon(pb.icon);
  const totalMin = pb.steps.reduce((sum, s) => sum + (s.durationMinutes ?? 0), 0);

  return (
    <Container>
      <Link
        href={ROUTES.duplicacion}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Volver a Duplicación
      </Link>

      <div className="mt-4 flex items-start gap-4">
        <span className="flex size-14 shrink-0 items-center justify-center rounded-[var(--radius-lg)] gradient-brand text-white">
          <Icon className="size-7" />
        </span>
        <div>
          <Badge variant={pb.type === "business" ? "default" : "gold"}>
            {PLAYBOOK_TYPE_LABELS[pb.type]}
          </Badge>
          <h1 className="mt-1.5 font-display text-2xl font-bold">{pb.title}</h1>
          <p className="mt-1 text-muted-foreground">{pb.description}</p>
          {totalMin > 0 && (
            <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
              <Clock className="size-4" />
              Duración estimada: {minutesLabel(totalMin)}
            </p>
          )}
        </div>
      </div>

      <div className="mt-8">
        <StepList playbookId={pb.id} steps={pb.steps} />
      </div>
    </Container>
  );
}
