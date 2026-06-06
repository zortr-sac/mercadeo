import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getRepositories } from "@/data";
import { requireSession } from "@/lib/session";
import { CopilotoScreen } from "@/features/vender/copiloto-screen";

export const metadata: Metadata = { title: "Conversación" };

export default async function CopilotoPage({
  params,
}: {
  params: Promise<{ prospectId: string }>;
}) {
  const user = await requireSession();
  const { prospectId } = await params;
  const prospect = await getRepositories().prospects.getById(prospectId);
  if (!prospect || prospect.ownerId !== user.id) notFound();
  return <CopilotoScreen prospectId={prospect.id} name={prospect.name} />;
}
