import type { Metadata } from "next";
import { getRepositories } from "@/data";
import { Container, PageHeader } from "@/components/layout/page-header";
import { MessageCopilot } from "@/features/ai/message-copilot";
import { requireSession } from "@/lib/session";

export const metadata: Metadata = { title: "Mensajes IA" };

function readParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export default async function MensajesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireSession();
  const params = await searchParams;
  const templates = await getRepositories().duplication.listMessageTemplates();

  return (
    <Container className="max-w-5xl">
      <PageHeader
        title="Escribe un mensaje"
        subtitle="Elige la situación de tu cliente y nosotros redactamos un mensaje claro para enviar por WhatsApp."
      />
      <div className="mt-6">
        <MessageCopilot
          templates={templates}
          initialName={readParam(params.prospect)}
          initialPhone={readParam(params.phone)}
        />
      </div>
    </Container>
  );
}
