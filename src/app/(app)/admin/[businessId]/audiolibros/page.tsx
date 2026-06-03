import { getRepositories } from "@/data";
import { AudiobookManager } from "@/features/admin/audiobook-manager";
import { requireBusinessAdmin } from "@/lib/session";

export default async function AudiobooksAdminPage({
  params,
}: {
  params: Promise<{ businessId: string }>;
}) {
  const { businessId } = await params;
  await requireBusinessAdmin(businessId);
  const audiobooks = await getRepositories().audiobooks.listAdmin(businessId);

  return <AudiobookManager businessId={businessId} audiobooks={audiobooks} />;
}
