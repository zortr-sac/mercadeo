import type { Metadata } from "next";
import Link from "next/link";
import { BookText, FolderDown, Users } from "lucide-react";
import { getRepositories } from "@/data";
import { Container, PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { ROUTES } from "@/lib/constants";
import { requireSession } from "@/lib/session";
import { PlaybookCard } from "@/features/duplication/playbook-card";

export const metadata: Metadata = { title: "Duplicación" };

const SHORTCUTS = [
  {
    href: ROUTES.duplicacion + "/guiones",
    label: "Guiones",
    description: "Qué decir en cada momento",
    icon: BookText,
  },
  {
    href: ROUTES.duplicacion + "/recursos",
    label: "Recursos",
    description: "Materiales para descargar",
    icon: FolderDown,
  },
  {
    href: ROUTES.prospectos,
    label: "Prospectos",
    description: "Tu CRM personal",
    icon: Users,
  },
];

export default async function DuplicacionPage() {
  await requireSession();
  const playbooks = await getRepositories().duplication.listPlaybooks();

  return (
    <Container>
      <PageHeader
        title="Sistema de Duplicación"
        subtitle="El método paso a paso para presentar negocio y producto de forma duplicable."
      />

      <div className="mt-6 grid grid-cols-3 gap-3">
        {SHORTCUTS.map((s) => {
          const Icon = s.icon;
          return (
            <Link key={s.href} href={s.href} className="group">
              <Card className="flex h-full flex-col items-center gap-2 p-4 text-center transition-all group-hover:-translate-y-0.5 group-hover:shadow-md">
                <span className="flex size-11 items-center justify-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-300">
                  <Icon className="size-5" />
                </span>
                <span className="text-sm font-semibold">{s.label}</span>
                <span className="hidden text-xs text-muted-foreground sm:block">
                  {s.description}
                </span>
              </Card>
            </Link>
          );
        })}
      </div>

      <h2 className="mb-3 mt-8 font-display text-lg font-semibold">
        Rutas guiadas
      </h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {playbooks.map((pb) => (
          <PlaybookCard key={pb.id} playbook={pb} />
        ))}
      </div>
    </Container>
  );
}
