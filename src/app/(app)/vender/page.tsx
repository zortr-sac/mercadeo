import type { Metadata } from "next";
import { getRepositories } from "@/data";
import { requireSession } from "@/lib/session";
import { getEffectiveBusiness } from "@/lib/active-business";
import { AdsScreen } from "@/features/vender/ads-screen";

export const metadata: Metadata = { title: "Vender" };

export default async function VenderPage() {
  const user = await requireSession();
  const { businessId } = await getEffectiveBusiness(user);
  const repos = getRepositories();
  const [ads, reactedIds] = await Promise.all([
    repos.adTemplates.list({ businessId }),
    repos.reactions.listReactedIds(user.id, "ad"),
  ]);

  return <AdsScreen ads={ads} reactedIds={reactedIds} />;
}
