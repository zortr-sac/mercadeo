import Link from "next/link";
import {
  BookOpen,
  ChevronRight,
  Headphones,
  MessageCircle,
  Newspaper,
  Users,
  type LucideIcon,
} from "lucide-react";
import { getRepositories } from "@/data";
import {
  ADMIN_TAB_LABELS,
  adminBusinessPath,
  type AdminTab,
} from "@/lib/constants";
import { requireBusinessAdmin } from "@/lib/session";

interface SummaryItem {
  tab: Exclude<AdminTab, "resumen" | "ajustes">;
  icon: LucideIcon;
  count: number;
  hint: string;
}

export default async function ResumenPage({
  params,
}: {
  params: Promise<{ businessId: string }>;
}) {
  const { businessId } = await params;
  await requireBusinessAdmin(businessId);
  const repos = getRepositories();

  const [courses, audiobooks, posts, templates, team] = await Promise.all([
    repos.academy.listCoursesAdmin(businessId),
    repos.audiobooks.listAdmin(businessId),
    repos.feed.list({ businessId }),
    repos.duplication.listMessageTemplates({ businessId }),
    repos.users.list({ businessId }),
  ]);

  // Plantillas propias del negocio (excluye las globales de plataforma).
  const ownTemplates = templates.filter((t) => t.businessId === businessId);
  const leaders = team.filter((m) => m.role === "leader" || m.role === "admin");

  const items: SummaryItem[] = [
    {
      tab: "academia",
      icon: BookOpen,
      count: courses.length,
      hint: "Cursos y lecciones",
    },
    {
      tab: "audiolibros",
      icon: Headphones,
      count: audiobooks.length,
      hint: "Audios para escuchar",
    },
    {
      tab: "novedades",
      icon: Newspaper,
      count: posts.length,
      hint: "Publicaciones del feed",
    },
    {
      tab: "mensajes",
      icon: MessageCircle,
      count: ownTemplates.length,
      hint: "Plantillas del negocio",
    },
    {
      tab: "lideres",
      icon: Users,
      count: leaders.length,
      hint: `${team.length} personas en total`,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-bold tracking-tight">
          Resumen del negocio
        </h2>
        <p className="mt-0.5 text-base text-muted-foreground">
          Un vistazo rápido a lo que tiene este negocio. Toca una tarjeta para
          gestionarlo.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.tab}
              href={adminBusinessPath(businessId, item.tab)}
              className="group flex items-center gap-4 rounded-[var(--radius-lg)] border border-border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className="flex size-14 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-200">
                <Icon className="size-7" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-display text-3xl font-bold leading-none tracking-tight">
                  {item.count}
                </p>
                <p className="mt-1 text-base font-medium">
                  {ADMIN_TAB_LABELS[item.tab]}
                </p>
                <p className="text-sm text-muted-foreground">{item.hint}</p>
              </div>
              <ChevronRight
                className="size-5 shrink-0 text-brand-600 transition-transform group-hover:translate-x-0.5"
                aria-hidden
              />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
