import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Container, PageHeader } from "@/components/layout/page-header";
import { ROUTES } from "@/lib/constants";
import { requireSession } from "@/lib/session";
import { ProspectsBoard } from "@/features/duplication/prospects-board";

export const metadata: Metadata = { title: "Prospectos" };

export default async function ProspectosPage() {
  const user = await requireSession();

  return (
    <Container className="max-w-5xl">
      <Link
        href={ROUTES.duplicacion}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Volver a Duplicación
      </Link>
      <div className="mt-4">
        <ProspectsBoard ownerId={user.id} />
      </div>
    </Container>
  );
}
