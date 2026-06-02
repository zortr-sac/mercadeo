"use client";

import { useState } from "react";
import { toast } from "sonner";
import { EmptyState } from "@/components/ui/empty-state";
import { Inbox } from "lucide-react";
import type { MessageTemplate } from "@/data/types";
import { TemplateGallery } from "./template-gallery";
import { ProspectModal } from "./prospect-modal";
import { MessageResult } from "./message-result";
import type { MessageResponse } from "./types";

function makeIdempotencyKey() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `msg-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

type View =
  | { step: "gallery" }
  | { step: "result"; template: MessageTemplate; name: string; phone: string; result: MessageResponse };

/**
 * Asistente de 3 pasos para escribir mensajes con IA, pensado para personas
 * de 50+ años: galería → modal (nombre) → resultado editable.
 */
export function MessageCopilot({
  templates,
  initialName = "",
  initialPhone = "",
}: {
  templates: MessageTemplate[];
  initialName?: string;
  initialPhone?: string;
}) {
  const [view, setView] = useState<View>({ step: "gallery" });
  const [activeTemplate, setActiveTemplate] = useState<MessageTemplate | null>(
    null,
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingName, setLoadingName] = useState("");

  if (templates.length === 0) {
    return (
      <EmptyState
        icon={Inbox}
        title="Aún no hay plantillas disponibles"
        description="Cuando se agreguen plantillas, aparecerán aquí agrupadas por situación."
      />
    );
  }

  function openTemplate(template: MessageTemplate) {
    setActiveTemplate(template);
    setModalOpen(true);
  }

  function closeModal() {
    if (loading) return;
    setModalOpen(false);
  }

  async function generate({ name, phone }: { name: string; phone: string }) {
    if (!activeTemplate) return;
    const finalPhone = initialPhone || phone;
    setLoadingName(name);
    setLoading(true);

    try {
      const response = await fetch("/api/ai/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idempotencyKey: makeIdempotencyKey(),
          prospectName: name,
          templateTitle: activeTemplate.title,
          templateBase: activeTemplate.baseText,
          situation: activeTemplate.situation,
          complianceHint: activeTemplate.complianceHint,
          tone: activeTemplate.defaultTone,
          prospectContext: "",
          userInstruction: "",
        }),
      });

      if (!response.ok) {
        toast.error("No se pudo escribir el mensaje. Inténtalo de nuevo.");
        return;
      }

      const payload = (await response.json()) as MessageResponse;
      setModalOpen(false);
      setView({
        step: "result",
        template: activeTemplate,
        name,
        phone: finalPhone,
        result: payload,
      });
    } catch {
      toast.error("Hubo un problema de conexión. Revisa tu internet.");
    } finally {
      setLoading(false);
    }
  }

  function backToGallery() {
    setView({ step: "gallery" });
    setActiveTemplate(null);
  }

  if (view.step === "result") {
    return (
      <MessageResult
        template={view.template}
        prospectName={view.name}
        phone={view.phone}
        result={view.result}
        onBack={backToGallery}
      />
    );
  }

  return (
    <>
      <TemplateGallery templates={templates} onSelect={openTemplate} />
      <ProspectModal
        template={activeTemplate}
        open={modalOpen}
        loading={loading}
        loadingName={loadingName}
        initialName={initialName}
        hasInitialPhone={Boolean(initialPhone)}
        onClose={closeModal}
        onSubmit={generate}
      />
    </>
  );
}
