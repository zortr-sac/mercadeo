import type { Metadata } from "next";
import { requireSession } from "@/lib/session";
import { HomeScreen } from "@/features/home/home-screen";

export const metadata: Metadata = { title: "Inicio" };

export default async function HomePage() {
  const user = await requireSession();
  const firstName = user.fullName.split(" ")[0] || user.fullName;
  const avatar = (firstName[0] || "U").toUpperCase();
  return <HomeScreen firstName={firstName} avatar={avatar} />;
}
