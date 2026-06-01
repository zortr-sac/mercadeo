import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getRepositories } from "@/data";
import { Container, PageHeader } from "@/components/layout/page-header";
import { ROUTES } from "@/lib/constants";
import { requireSession } from "@/lib/session";
import { ScriptLibrary } from "@/features/duplication/script-library";

export const metadata: Metadata = { title: "Guiones" };

export default async function GuionesPage() {
  await requireSession();
  const scripts = await getRepositories().duplication.listScripts();

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
          title="Guiones"
          subtitle="Qué decir en cada momento. Copia, personaliza y úsalo."
        />
      </div>
      <div className="mt-6">
        <ScriptLibrary scripts={scripts} />
      </div>
    </Container>
  );
}
