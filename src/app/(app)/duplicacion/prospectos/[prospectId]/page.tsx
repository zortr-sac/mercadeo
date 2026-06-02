import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getRepositories } from "@/data";
import { Container } from "@/components/layout/page-header";
import { requireSession } from "@/lib/session";
import { ProspectDetail } from "@/features/duplication/prospect-detail";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ prospectId: string }>;
}): Promise<Metadata> {
  const { prospectId } = await params;
  const prospect = await getRepositories().prospects.getById(prospectId);
  return { title: prospect ? `${prospect.name} · Prospecto` : "Prospecto" };
}

export default async function ProspectDetailPage({
  params,
}: {
  params: Promise<{ prospectId: string }>;
}) {
  await requireSession();
  const { prospectId } = await params;

  const repos = getRepositories();
  const prospect = await repos.prospects.getById(prospectId);
  if (!prospect) notFound();

  const interactions = await repos.interactions.listByProspect(prospectId);

  return (
    <Container className="max-w-3xl">
      <ProspectDetail prospect={prospect} interactions={interactions} />
    </Container>
  );
}
