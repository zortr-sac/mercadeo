import type { Metadata } from "next";
import { Container, PageHeader } from "@/components/layout/page-header";
import { getRepositories } from "@/data";
import { AntiRejectionCoach } from "@/features/constancia/anti-rejection";
import { requireSession } from "@/lib/session";

export const metadata: Metadata = { title: "Constancia" };

export default async function ConstanciaPage() {
  const user = await requireSession();

  const repos = getRepositories();
  const [learnings, stats, recent] = await Promise.all([
    repos.learnings.listByUser(user.id),
    repos.activity.getStats(user.id),
    repos.activity.listRecent(user.id, 12),
  ]);

  return (
    <Container className="max-w-3xl">
      <PageHeader
        title="Constancia"
        subtitle="Apoyo diario para no abandonar después de un “no”. Se premia tu actividad y tu constancia, nunca los resultados económicos."
      />
      <div className="mt-6">
        <AntiRejectionCoach
          stats={stats}
          recent={recent}
          learnings={learnings}
        />
      </div>
    </Container>
  );
}
