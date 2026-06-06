import type { Metadata } from "next";
import { getRepositories } from "@/data";
import { requireBusinessAdmin } from "@/lib/session";
import { AI_MONTHLY_BUDGET_PEN, PRICING_DISPLAY } from "@/lib/ai/pricing";
import {
  buildUsageMetrics,
  currentMonthKey,
  usageWindowStartISO,
} from "@/features/admin/usage-metrics";
import { UsageDashboard } from "@/features/admin/usage-dashboard";

export const metadata: Metadata = { title: "Consumo de IA" };

export default async function ConsumoPage({
  params,
}: {
  params: Promise<{ businessId: string }>;
}) {
  const { businessId } = await params;
  await requireBusinessAdmin(businessId);
  const repos = getRepositories();
  const monthKey = currentMonthKey();

  const [members, rows, overrides] = await Promise.all([
    repos.users.list({ businessId }),
    repos.usage.listForWindow(businessId, usageWindowStartISO(5)),
    repos.usage.overridesForMonth(businessId, monthKey),
  ]);

  const metrics = buildUsageMetrics(rows, 6);
  const memberList = members
    .filter((m) => m.role === "member")
    .map((m) => ({ id: m.id, name: m.fullName, phone: m.phone }));

  return (
    <UsageDashboard
      businessId={businessId}
      metrics={metrics}
      members={memberList}
      overrides={overrides}
      defaultLimitPen={AI_MONTHLY_BUDGET_PEN}
      pricing={PRICING_DISPLAY}
    />
  );
}
