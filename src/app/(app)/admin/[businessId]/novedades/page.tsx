import { getRepositories } from "@/data";
import { FeedManager } from "@/features/admin/feed-manager";
import { requireBusinessAdmin } from "@/lib/session";

export default async function NovedadesAdminPage({
  params,
}: {
  params: Promise<{ businessId: string }>;
}) {
  const { businessId } = await params;
  await requireBusinessAdmin(businessId);
  const posts = await getRepositories().feed.list({ businessId });

  return <FeedManager businessId={businessId} posts={posts} />;
}
