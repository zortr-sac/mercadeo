import { getRepositories } from "@/data";
import { TeamManager } from "@/features/admin/team-manager";
import { requireBusinessAdmin } from "@/lib/session";

export default async function LideresAdminPage({
  params,
}: {
  params: Promise<{ businessId: string }>;
}) {
  const { businessId } = await params;
  const user = await requireBusinessAdmin(businessId);
  const repos = getRepositories();
  const [members, business] = await Promise.all([
    repos.users.list({ businessId }),
    repos.businesses.getById(businessId),
  ]);

  return (
    <TeamManager
      businessId={businessId}
      businessSlug={business?.slug ?? ""}
      members={members}
      canManage={user.role === "admin"}
    />
  );
}
