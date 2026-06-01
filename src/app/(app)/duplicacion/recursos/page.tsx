import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getRepositories } from "@/data";
import { Container, PageHeader } from "@/components/layout/page-header";
import { ROUTES } from "@/lib/constants";
import { requireSession } from "@/lib/session";
import { ResourceLibrary } from "@/features/duplication/resource-library";

export const metadata: Metadata = { title: "Recursos" };

export default async function RecursosPage() {
  await requireSession();
  const [resources, categories] = await Promise.all([
    getRepositories().duplication.listResources(),
    getRepositories().duplication.listResourceCategories(),
  ]);

  return (
    <Container>
      <Link
        href={ROUTES.duplicacion}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Volver a Duplicación
      </Link>
      <div className="mt-4">
        <PageHeader
          title="Recursos"
          subtitle="Materiales oficiales para presentar y compartir."
        />
      </div>
      <div className="mt-6">
        <ResourceLibrary resources={resources} categories={categories} />
      </div>
    </Container>
  );
}
