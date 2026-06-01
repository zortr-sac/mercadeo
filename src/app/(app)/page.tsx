import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  GraduationCap,
  Megaphone,
  Rocket,
  Users,
} from "lucide-react";
import { getRepositories } from "@/data";
import { Container } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { POST_TYPE_LABELS } from "@/data/types";
import { ROUTES } from "@/lib/constants";
import { relativeDate } from "@/lib/format";
import { requireSession } from "@/lib/session";
import { DashboardGreeting } from "@/features/dashboard/greeting";

export const metadata: Metadata = { title: "Inicio" };

const QUICK_LINKS = [
  {
    href: ROUTES.academia,
    title: "Academia",
    description: "Fórmate y certifícate",
    icon: GraduationCap,
  },
  {
    href: ROUTES.duplicacion,
    title: "Duplicación",
    description: "El sistema paso a paso",
    icon: Rocket,
  },
  {
    href: ROUTES.prospectos,
    title: "Prospectos",
    description: "Gestiona tu lista",
    icon: Users,
  },
];

export default async function DashboardPage() {
  const user = await requireSession();
  const repos = getRepositories();
  const [posts, courses] = await Promise.all([
    repos.feed.list(),
    repos.academy.listCourses(),
  ]);
  const latest = posts.slice(0, 3);
  const featuredCourse = courses[0];

  return (
    <Container>
      <DashboardGreeting name={user.fullName} />

      {/* Accesos rápidos */}
      <div className="mt-6 grid grid-cols-3 gap-3">
        {QUICK_LINKS.map((link) => {
          const Icon = link.icon;
          return (
            <Link key={link.href} href={link.href} className="group">
              <Card className="flex h-full flex-col items-center gap-2 p-4 text-center transition-all group-hover:-translate-y-0.5 group-hover:shadow-md">
                <span className="flex size-11 items-center justify-center rounded-full gradient-brand text-white">
                  <Icon className="size-5" />
                </span>
                <span className="text-sm font-semibold">{link.title}</span>
                <span className="hidden text-xs text-muted-foreground sm:block">
                  {link.description}
                </span>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Curso destacado */}
      {featuredCourse && (
        <Link href={`${ROUTES.academia}/${featuredCourse.slug}`} className="group mt-6 block">
          <Card className="overflow-hidden">
            <div className="flex items-center gap-4 p-5">
              <span className="flex size-14 shrink-0 items-center justify-center rounded-[var(--radius-md)] gradient-gold text-gold-950">
                <GraduationCap className="size-7" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium uppercase tracking-wide text-gold-600">
                  Empieza por aquí
                </p>
                <h3 className="font-display text-base font-semibold">
                  {featuredCourse.title}
                </h3>
                <p className="line-clamp-1 text-sm text-muted-foreground">
                  {featuredCourse.description}
                </p>
              </div>
              <ArrowRight className="size-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
            </div>
          </Card>
        </Link>
      )}

      {/* Últimas novedades */}
      <div className="mt-8 mb-3 flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
          <Megaphone className="size-5 text-brand-600" />
          Novedades
        </h2>
        <Link
          href={ROUTES.feed}
          className="text-sm font-medium text-brand-600 hover:underline dark:text-brand-400"
        >
          Ver todo
        </Link>
      </div>
      <div className="space-y-3">
        {latest.map((post) => (
          <Link key={post.id} href={ROUTES.feed} className="group block">
            <Card className="p-4 transition-colors group-hover:bg-muted">
              <div className="mb-1 flex items-center justify-between gap-2">
                <Badge variant="muted">{POST_TYPE_LABELS[post.type]}</Badge>
                <span className="text-xs text-muted-foreground">
                  {relativeDate(post.createdAt)}
                </span>
              </div>
              <h3 className="font-medium leading-snug">{post.title}</h3>
            </Card>
          </Link>
        ))}
      </div>
    </Container>
  );
}
