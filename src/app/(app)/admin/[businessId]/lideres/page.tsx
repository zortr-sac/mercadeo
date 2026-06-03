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
  const members = await getRepositories().users.list({ businessId });

  return (
    <TeamManager
      businessId={businessId}
      members={members}
      canManage={user.role === "admin"}
    />
  );
}
