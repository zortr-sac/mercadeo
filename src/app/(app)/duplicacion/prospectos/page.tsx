import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getRepositories } from "@/data";
import { Container } from "@/components/layout/page-header";
import { ROUTES } from "@/lib/constants";
import { requireSession } from "@/lib/session";
import { ProspectsBoard } from "@/features/duplication/prospects-board";

export const metadata: Metadata = { title: "Prospectos" };

export default async function ProspectosPage() {
  const user = await requireSession();
  const prospects = await getRepositories().prospects.listByOwner(user.id);

  return (
    <Container className="max-w-7xl">
      <Link
        href={ROUTES.duplicacion}
        className="inline-flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-5" />
        Volver al sistema comercial
      </Link>
      <div className="mt-4">
        <ProspectsBoard
          ownerId={user.id}
          businessId={user.businessId}
          initialProspects={prospects}
        />
      </div>
    </Container>
  );
}
