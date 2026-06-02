import type { Metadata } from "next";
import { getRepositories } from "@/data";
import { BusinessRegistration } from "@/features/registration/business-registration";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ businessSlug: string }>;
}): Promise<Metadata> {
  const { businessSlug } = await params;
  const business = await getRepositories().businesses.getBySlug(businessSlug);
  return { title: business ? `Registro - ${business.name}` : "Registro" };
}

export default async function RegistroNegocioPage({
  params,
}: {
  params: Promise<{ businessSlug: string }>;
}) {
  const { businessSlug } = await params;
  const business = await getRepositories().businesses.getBySlug(businessSlug);

  return <BusinessRegistration slug={businessSlug} initialBusiness={business} />;
}
