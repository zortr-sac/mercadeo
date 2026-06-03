"use client";

import { useRouter } from "next/navigation";
import { Newspaper, Pencil, Pin, PinOff, Plus } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { POST_TYPE_LABELS, type Post } from "@/data/types";
import { eventDate as fmtEventDate, relativeDate } from "@/lib/format";
import { ManagerCard, ManagerHeader, ManagerRow } from "./admin-ui";
import { FeedForm } from "./feed-form";
import { updateBusinessPostAction } from "./feed-admin-actions";

/** Gestión del feed del negocio (crear / editar / fijar / eliminar). */
export function FeedManager({
  businessId,
  posts,
}: {
  businessId: string;
  posts: Post[];
}) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Post | null>(null);
  const [pending, startTransition] = useTransition();
  const [pinningId, setPinningId] = useState<string | null>(null);

  function togglePin(post: Post) {
    setPinningId(post.id);
    startTransition(async () => {
      try {
        await updateBusinessPostAction(businessId, post.id, {
          pinned: !post.pinned,
        });
        toast.success(post.pinned ? "Publicación desfijada." : "Publicación fijada.");
        router.refresh();
      } catch {
        toast.error("No se pudo cambiar el estado.");
      } finally {
        setPinningId(null);
      }
    });
  }

  return (
    <ManagerCard>
      <ManagerHeader
        icon={Newspaper}
        title="Novedades"
        description="Publica anuncios, motivación, eventos y reconocimientos para tu equipo."
        action={
          <Button onClick={() => setCreating(true)}>
            <Plus className="size-5" aria-hidden />
            Nueva publicación
          </Button>
        }
      />

      {posts.length === 0 ? (
        <EmptyState
          icon={Newspaper}
          title="Sin publicaciones todavía"
          description="Crea la primera novedad para mantener informado a tu equipo."
          action={
            <Button onClick={() => setCreating(true)}>
              <Plus className="size-5" aria-hidden />
              Crear publicación
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <ManagerRow key={post.id}>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  {post.pinned && (
                    <Badge variant="gold">
                      <Pin className="size-3" aria-hidden />
                      Fijado
                    </Badge>
                  )}
                  <Badge variant="outline">{POST_TYPE_LABELS[post.type]}</Badge>
                  <h3 className="font-display text-lg font-semibold leading-tight">
                    {post.title}
                  </h3>
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                  {post.body}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {post.type === "event" && post.eventDate
                    ? `Evento: ${fmtEventDate(post.eventDate)}`
                    : `Publicado ${relativeDate(post.createdAt)}`}
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => togglePin(post)}
                  loading={pending && pinningId === post.id}
                  disabled={pending}
                >
                  {post.pinned ? (
                    <>
                      <PinOff className="size-4" aria-hidden />
                      Desfijar
                    </>
                  ) : (
                    <>
                      <Pin className="size-4" aria-hidden />
                      Fijar
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditing(post)}
                  aria-label={`Editar ${post.title}`}
                >
                  <Pencil className="size-4" aria-hidden />
                  Editar
                </Button>
              </div>
            </ManagerRow>
          ))}
        </div>
      )}

      {creating && (
        <FeedForm businessId={businessId} onClose={() => setCreating(false)} />
      )}
      {editing && (
        <FeedForm
          businessId={businessId}
          post={editing}
          onClose={() => setEditing(null)}
        />
      )}
    </ManagerCard>
  );
}
