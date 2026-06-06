import type { Metadata } from "next";
import { getRepositories } from "@/data";
import { requireSession } from "@/lib/session";
import { getEffectiveBusiness } from "@/lib/active-business";
import { AudiobookPlayerScreen } from "@/features/audiolibros/audiobook-player-screen";

export const metadata: Metadata = { title: "Audiolibros" };

export default async function AudiolibrosPage() {
  const user = await requireSession();
  const { businessId } = await getEffectiveBusiness(user);
  const audiobooks = await getRepositories().audiobooks.list({ businessId });
  return <AudiobookPlayerScreen audiobooks={audiobooks} />;
}
