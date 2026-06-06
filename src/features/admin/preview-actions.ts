"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getRepositories } from "@/data";
import { PREVIEW_COOKIE, ROUTES } from "@/lib/constants";
import { requireRole } from "@/lib/session";

/** Admin: start previewing a business "as a member" → opens the client app. */
export async function enterBusinessPreviewAction(businessId: string): Promise<void> {
  await requireRole("admin");
  const business = await getRepositories().businesses.getById(businessId);
  if (!business) redirect(ROUTES.admin);
  (await cookies()).set(PREVIEW_COOKIE, businessId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  redirect(ROUTES.home);
}

/** Admin: stop previewing → back to the admin dashboard. */
export async function exitBusinessPreviewAction(): Promise<void> {
  (await cookies()).delete(PREVIEW_COOKIE);
  redirect(ROUTES.admin);
}
