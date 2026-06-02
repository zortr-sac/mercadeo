import type { Metadata } from "next";
import Link from "next/link";
import { BookText, FolderDown, MessageCircle, Users } from "lucide-react";
import { getRepositories } from "@/data";
import { Container, PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { ROUTES } from "@/lib/constants";
import { requireSession } from "@/lib/session";
import { PlaybookCard } from "@/features/duplication/playbook-card";

export const metadata: Metadata = { title: "Sistema comercial" };

const SHORTCUTS = [
  {
    href: ROUTES.mensajes,
    label: "Mensajes IA",
    description: "Personaliza y envia",
    icon: MessageCircle,
  },
  {
    href: `${ROUTES.duplicacion}/guiones`,
    label: "Plantillas",
    description: "Textos base seguros",
    icon: BookText,
  },
  {
    href: `${ROUTES.duplicacion}/recursos`,
    label: "Recursos",
    description: "Material oficial",
    icon: FolderDown,
  },
  {
    href: ROUTES.prospectos,
    label: "Prospectos",
    description: "CRM personal",
    icon: Users,
  },
];

export default async function DuplicacionPage() {
  const user = await requireSession();
  const playbooks = await getRepositories().duplication.listPlaybooks({
    businessId: user.businessId,
  });

  return (
    <Container className="max-w-6xl">
      <PageHeader
        title="Sistema comercial"
        subtitle="Pasos simples para comunicar, dar seguimiento y compartir materiales sin presionar."
      />

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {SHORTCUTS.map((shortcut) => {
          const Icon = shortcut.icon;
          return (
            <Link key={shortcut.href} href={shortcut.href} className="group">
              <Card className="flex h-full flex-col gap-3 p-4 transition-colors group-hover:bg-muted">
                <Icon className="size-7 text-brand-700" />
                <span className="font-semibold">{shortcut.label}</span>
                <span className="text-muted-foreground">{shortcut.description}</span>
              </Card>
            </Link>
          );
        })}
      </div>

      <h2 className="mb-3 mt-8 font-display text-xl font-semibold">
        Rutas guiadas
      </h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {playbooks.map((playbook) => (
          <PlaybookCard key={playbook.id} playbook={playbook} />
        ))}
      </div>
    </Container>
  );
}
