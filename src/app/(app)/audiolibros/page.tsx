import type { Metadata } from "next";
import { getRepositories } from "@/data";
import { Container, PageHeader } from "@/components/layout/page-header";
import { AudiobookCatalog } from "@/features/audiolibros/audiobook-catalog";
import { requireSession } from "@/lib/session";

export const metadata: Metadata = { title: "Audiolibros" };

export default async function AudiolibrosPage() {
  const user = await requireSession();
  const audiobooks = await getRepositories().audiobooks.list({
    businessId: user.businessId,
  });

  return (
    <Container>
      <PageHeader
        title="Audiolibros"
        subtitle="Escucha cuando quieras. Toca play y aprende mientras haces otras cosas."
      />
      <div className="mt-6">
        <AudiobookCatalog audiobooks={audiobooks} />
      </div>
    </Container>
  );
}
