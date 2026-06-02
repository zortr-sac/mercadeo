import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getRepositories } from "@/data";
import { Container, PageHeader } from "@/components/layout/page-header";
import { ROUTES } from "@/lib/constants";
import { requireSession } from "@/lib/session";
import { ScriptLibrary } from "@/features/duplication/script-library";

export const metadata: Metadata = { title: "Plantillas" };

export default async function GuionesPage() {
  const user = await requireSession();
  const scripts = await getRepositories().duplication.listScripts({
    businessId: user.businessId,
  });

  return (
    <Container>
      <Link
        href={ROUTES.duplicacion}
        className="inline-flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-5" />
        Volver al sistema comercial
      </Link>
      <div className="mt-4">
        <PageHeader
          title="Plantillas"
          subtitle="Textos base para copiar o llevar al generador de IA."
        />
      </div>
      <div className="mt-6">
        <ScriptLibrary scripts={scripts} />
      </div>
    </Container>
  );
}
