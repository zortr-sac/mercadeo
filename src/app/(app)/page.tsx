import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Bell,
  GraduationCap,
  MessageCircle,
  ShieldCheck,
  Users,
} from "lucide-react";
import { getRepositories } from "@/data";
import { Container } from "@/components/layout/page-header";
import { PushNotificationManager } from "@/components/pwa/push-notification-manager";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { POST_TYPE_LABELS } from "@/data/types";
import { ROUTES } from "@/lib/constants";
import { relativeDate } from "@/lib/format";
import { requireSession } from "@/lib/session";

export const metadata: Metadata = { title: "Inicio" };

export default async function DashboardPage() {
  const user = await requireSession();
  const repos = getRepositories();
  const [posts, courses, businesses] = await Promise.all([
    repos.feed.list({ businessId: user.businessId }),
    repos.academy.listCourses({ businessId: user.businessId }),
    repos.businesses.list(),
  ]);
  const latest = posts.slice(0, 3);
  const featuredCourse = courses[0];
  const isAdmin = user.role === "admin";

  const quickLinks = isAdmin
    ? [
        {
          href: ROUTES.admin,
          label: "Crear negocio",
          description: "Marca, dominio y link",
          icon: ShieldCheck,
        },
        {
          href: ROUTES.mensajes,
          label: "Probar IA",
          description: "Modo Cumplimiento",
          icon: MessageCircle,
        },
      ]
    : [
        {
          href: ROUTES.mensajes,
          label: "Preparar mensaje",
          description: "IA + WhatsApp",
          icon: MessageCircle,
        },
        {
          href: ROUTES.prospectos,
          label: "Ver prospectos",
          description: "Seguimiento simple",
          icon: Users,
        },
        {
          href: ROUTES.academia,
          label: "Continuar academia",
          description: "Tutoriales claros",
          icon: GraduationCap,
        },
      ];

  return (
    <Container className="max-w-7xl">
      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-5">
          <div>
            <p className="font-semibold text-brand-700">
              Hola, {user.fullName}
            </p>
            <h1 className="mt-2 font-display text-3xl font-bold tracking-tight">
              {isAdmin
                ? "Administra negocios desde un solo lugar"
                : "Tu plan de trabajo para hoy"}
            </h1>
            <p className="mt-3 max-w-3xl text-lg leading-relaxed text-muted-foreground">
              {isAdmin
                ? "Crea marcas, conecta dominios, publica contenido y entrega un registro claro para cada negocio."
                : "Escribe mejor, registra seguimientos y avanza en academia sin depender de la memoria."}
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            {quickLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link key={link.href} href={link.href} className="group">
                  <Card className="h-full p-4 transition-colors group-hover:bg-muted">
                    <Icon className="mb-4 size-7 text-brand-700" />
                    <p className="font-semibold">{link.label}</p>
                    <p className="mt-1 text-muted-foreground">{link.description}</p>
                  </Card>
                </Link>
              );
            })}
          </div>

          {!isAdmin && (
            <PushNotificationManager
              userId={user.id}
              businessId={user.businessId}
            />
          )}

          {featuredCourse && (
            <Link
              href={`${ROUTES.academia}/${featuredCourse.slug}`}
              className="group block rounded-lg border border-border bg-card p-5 transition-colors hover:bg-muted"
            >
              <div className="flex items-center gap-4">
                <span className="flex size-14 shrink-0 items-center justify-center rounded-lg bg-gold-100 text-gold-800">
                  <GraduationCap className="size-7" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-gold-700">
                    Empieza por aqui
                  </p>
                  <h2 className="font-display text-xl font-semibold">
                    {featuredCourse.title}
                  </h2>
                  <p className="mt-1 text-muted-foreground">
                    {featuredCourse.description}
                  </p>
                </div>
                <ArrowRight className="size-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          )}
        </div>

        <aside className="space-y-5">
          <div className="rounded-lg border border-border bg-card p-5">
            <div className="mb-4 flex items-center gap-2">
              <Bell className="size-5 text-brand-700" />
              <h2 className="font-display text-xl font-semibold">
                Enfoque del dia
              </h2>
            </div>
            <div className="space-y-3">
              {[
                "Revisar seguimientos pendientes.",
                "Generar un mensaje personalizado.",
                "Completar una microleccion.",
              ].map((item) => (
                <p key={item} className="flex gap-3">
                  <ShieldCheck className="mt-1 size-5 shrink-0 text-brand-700" />
                  <span>{item}</span>
                </p>
              ))}
            </div>
          </div>

          {isAdmin && (
            <div className="rounded-lg border border-border bg-card p-5">
              <h2 className="font-display text-xl font-semibold">Negocios</h2>
              <div className="mt-4 space-y-3">
                {businesses.slice(0, 3).map((business) => (
                  <div key={business.id} className="rounded-lg bg-muted p-3">
                    <p className="font-semibold">{business.name}</p>
                    <p className="text-muted-foreground">
                      {business.memberCount} clientes · {business.contentCount} contenidos
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-lg border border-border bg-card p-5">
            <h2 className="font-display text-xl font-semibold">Novedades</h2>
            <div className="mt-4 space-y-3">
              {latest.map((post) => (
                <Link key={post.id} href={ROUTES.feed} className="block">
                  <div className="rounded-lg bg-muted p-3 transition-colors hover:bg-secondary">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <Badge variant="muted">{POST_TYPE_LABELS[post.type]}</Badge>
                      <span className="text-muted-foreground">
                        {relativeDate(post.createdAt)}
                      </span>
                    </div>
                    <p className="font-semibold">{post.title}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </section>
    </Container>
  );
}
