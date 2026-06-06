import "server-only";
import { cookies } from "next/headers";
import { getRepositories } from "@/data";
import type { Business, Profile } from "@/data/types";
import { PREVIEW_COOKIE } from "./constants";

export interface EffectiveBusiness {
  /** The businessId whose content the client screens should show. */
  businessId: string | null;
  /** The previewed business when an admin is "viewing as a member", else null. */
  preview: Business | null;
}

/**
 * Resolves the businessId the client experience should use. For a normal user
 * it's their own `businessId`. For a platform admin with an active preview
 * cookie, it's the previewed business (the RLS `is_admin()` lets them read it).
 */
export async function getEffectiveBusiness(user: Profile): Promise<EffectiveBusiness> {
  if (user.role === "admin") {
    const cookieId = (await cookies()).get(PREVIEW_COOKIE)?.value;
    if (cookieId) {
      const business = await getRepositories().businesses.getById(cookieId);
      if (business) return { businessId: business.id, preview: business };
    }
  }
  return { businessId: user.businessId, preview: null };
}
