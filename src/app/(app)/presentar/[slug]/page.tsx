import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getRepositories } from "@/data";
import { requireSession } from "@/lib/session";
import { PresentationViewer } from "@/features/presentar/presentation-viewer";

export const metadata: Metadata = { title: "Presentación" };

export default async function PresentationViewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const user = await requireSession();
  const repos = getRepositories();
  // La RLS limita a los miembros a presentaciones publicadas de su negocio.
  const template = await repos.presentationTemplates.getBySlug(slug);
  if (!template) notFound();

  const reactedIds = await repos.reactions.listReactedIds(user.id, "presentation");

  return (
    <PresentationViewer template={template} reacted={reactedIds.includes(template.id)} />
  );
}
