import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getRepositories } from "@/data";
import { getSession } from "@/lib/session";
import { ROUTES } from "@/lib/constants";
import { BusinessLoginScreen } from "@/features/auth/business-login-screen";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ businessSlug: string }>;
}): Promise<Metadata> {
  const { businessSlug } = await params;
  const business = await getRepositories().businesses.getBySlug(businessSlug);
  return { title: business ? `Entrar · ${business.name}` : "Entrar" };
}

export default async function BusinessLoginPage({
  params,
}: {
  params: Promise<{ businessSlug: string }>;
}) {
  const { businessSlug } = await params;
  const business = await getRepositories().businesses.getBySlug(businessSlug);
  if (!business) notFound();

  // Si ya hay sesión, no mostrar el login: ir directo a la app.
  const session = await getSession();
  if (session) redirect(ROUTES.home);

  return (
    <BusinessLoginScreen
      slug={businessSlug}
      businessName={business.name}
      primaryColor={business.primaryColor}
      logoUrl={business.logoUrl}
    />
  );
}
