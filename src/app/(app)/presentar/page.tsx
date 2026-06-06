import type { Metadata } from "next";
import { getRepositories } from "@/data";
import { requireSession } from "@/lib/session";
import { getEffectiveBusiness } from "@/lib/active-business";
import { PresentationsScreen } from "@/features/presentar/presentations-screen";

export const metadata: Metadata = { title: "Presentar" };

export default async function PresentarPage() {
  const user = await requireSession();
  const { businessId } = await getEffectiveBusiness(user);
  const repos = getRepositories();
  const [templates, reactedIds] = await Promise.all([
    repos.presentationTemplates.list({ businessId }),
    repos.reactions.listReactedIds(user.id, "presentation"),
  ]);

  return <PresentationsScreen templates={templates} reactedIds={reactedIds} />;
}
