"use client";

import { Heart, MapPin, Pin } from "lucide-react";
import { useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  POST_TYPE_LABELS,
  type Post,
  type Profile,
} from "@/data/types";
import { eventDate, isUpcoming, relativeDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { toggleReactionAction } from "./actions";
import { POST_TYPE_META } from "./post-meta";

/** Tarjeta de publicación del feed con reacción optimista. */
export function PostCard({
  post,
  author,
  currentUserId,
}: {
  post: Post;
  author?: Profile;
  currentUserId: string;
}) {
  const meta = POST_TYPE_META[post.type];
  const Icon = meta.icon;
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(post.reactions);

  async function onLike() {
    const next = !liked;
    setLiked(next);
    setCount((c) => c + (next ? 1 : -1));
    try {
      await toggleReactionAction(post.id, next ? 1 : -1);
    } catch {
      // Revertir si falla.
      setLiked(!next);
      setCount((c) => c + (next ? -1 : 1));
    }
  }

  return (
    <Card className={cn("overflow-hidden", post.pinned && "ring-1 ring-brand-300")}>
      <div className="flex items-center gap-3 p-4 pb-3">
        <Avatar name={author?.fullName ?? "HGW"} src={author?.avatarUrl} size="md" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">
            {author?.fullName ?? "HGW"}
          </p>
          <p className="text-xs text-muted-foreground">
            {relativeDate(post.createdAt)}
          </p>
        </div>
        {post.pinned && (
          <Pin className="size-4 fill-brand-500 text-brand-500" aria-label="Fijado" />
        )}
        <Badge variant={meta.badge}>
          <Icon className="size-3" />
          {POST_TYPE_LABELS[post.type]}
        </Badge>
      </div>

      <div className="px-4 pb-2">
        <h3 className="font-display text-lg font-semibold leading-snug">
          {post.title}
        </h3>
        <p className="mt-1.5 whitespace-pre-line text-[0.95rem] leading-relaxed text-foreground/90">
          {post.body}
        </p>
      </div>

      {post.type === "event" && post.eventDate && (
        <div className="mx-4 mb-3 flex flex-wrap items-center gap-x-4 gap-y-1 rounded-[var(--radius-md)] bg-gold-50 px-3 py-2 text-sm dark:bg-gold-900/20">
          <span className="flex items-center gap-1.5 font-medium text-gold-800 dark:text-gold-300">
            <Icon className="size-4" />
            {eventDate(post.eventDate)}
            {isUpcoming(post.eventDate) && (
              <Badge variant="gold" className="ml-1">
                Próximo
              </Badge>
            )}
          </span>
          {post.eventLocation && (
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <MapPin className="size-4" />
              {post.eventLocation}
            </span>
          )}
        </div>
      )}

      <div className="flex items-center gap-1 border-t border-border px-2 py-1">
        <button
          onClick={onLike}
          className={cn(
            "flex items-center gap-2 rounded-[var(--radius-md)] px-3 py-2 text-sm font-medium transition-colors hover:bg-muted",
            liked ? "text-rose-600" : "text-muted-foreground",
          )}
          aria-pressed={liked}
        >
          <Heart className={cn("size-4", liked && "fill-rose-600")} />
          {count}
        </button>
      </div>
    </Card>
  );
}
