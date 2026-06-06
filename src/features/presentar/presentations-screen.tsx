"use client";
// Pestaña "Presentar": galería de presentaciones que el admin subió. Cada tarjeta
// abre el visor para pasar las diapositivas y descargar el PPT.
import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { TopBarMain, Card, Note, Chip, ImagePlaceholder } from "@/components/netscale/ui";
import { HeartButton } from "@/features/reactions/heart-button";
import { ROUTES } from "@/lib/constants";
import type { PresentationTemplate } from "@/data/types";

export function PresentationsScreen({
  templates,
  reactedIds,
}: {
  templates: PresentationTemplate[];
  reactedIds: string[];
}) {
  const router = useRouter();
  const reacted = useMemo(() => new Set(reactedIds), [reactedIds]);

  return (
    <>
      <TopBarMain title="Presentar" />
      <div className="ns-scroll ns-pad" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <p style={{ fontSize: 18, color: "var(--text-2)", marginTop: -4 }}>
          Presentaciones listas para mostrar. Ábrelas, pásalas diapositiva por diapositiva o
          descárgalas.
        </p>

        {templates.length === 0 ? (
          <Note tone="blue" icon="slides">
            Aún no hay presentaciones publicadas. Tu administrador las subirá pronto.
          </Note>
        ) : (
          templates.map((t) => (
            <PresentationCard
              key={t.id}
              template={t}
              reacted={reacted.has(t.id)}
              onOpen={() => router.push(`${ROUTES.presentar}/${t.slug}`)}
            />
          ))
        )}
      </div>
    </>
  );
}

function PresentationCard({
  template,
  reacted,
  onOpen,
}: {
  template: PresentationTemplate;
  reacted: boolean;
  onOpen: () => void;
}) {
  const cover = template.coverUrl ?? template.slides[0]?.url ?? null;

  return (
    <Card onClick={onOpen} pad={0} style={{ overflow: "hidden" }}>
      {cover ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={cover}
          alt={template.title}
          style={{ width: "100%", display: "block", aspectRatio: "16 / 9", objectFit: "cover" }}
        />
      ) : (
        <ImagePlaceholder theme="slide" icon="slides" aspect="16 / 9" radius={0} />
      )}
      <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
        <h3 style={{ fontSize: 20, lineHeight: 1.25 }}>{template.title}</h3>
        {template.description && (
          <p style={{ fontSize: 15, color: "var(--text-2)", lineHeight: 1.45 }}>
            {template.description}
          </p>
        )}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {template.slides.length > 0 && (
            <Chip tone="blue" icon="slides">
              {template.slides.length} diapositiva{template.slides.length === 1 ? "" : "s"}
            </Chip>
          )}
          <div style={{ marginLeft: "auto" }} onClick={(e) => e.stopPropagation()}>
            <HeartButton type="presentation" contentId={template.id} initialReacted={reacted} />
          </div>
        </div>
      </div>
    </Card>
  );
}
