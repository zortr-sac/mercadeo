"use client";

import { Heart, MapPin, Pin } from "lucide-react";
import { useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { POST_TYPE_LABELS, type Post, type Profile } from "@/data/types";
import { APP } from "@/lib/constants";
import { eventDate, isUpcoming, relativeDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { toggleReactionAction } from "./actions";
import { POST_TYPE_META } from "./post-meta";

export function PostCard({
  post,
  author,
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
    setCount((value) => value + (next ? 1 : -1));
    try {
      await toggleReactionAction(post.id, next ? 1 : -1);
    } catch {
      setLiked(!next);
      setCount((value) => value + (next ? -1 : 1));
    }
  }

  return (
    <Card className={cn("overflow-hidden", post.pinned && "ring-1 ring-brand-300")}>
      <div className="flex items-center gap-3 p-4 pb-3">
        <Avatar name={author?.fullName ?? APP.name} src={author?.avatarUrl} size="md" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">{author?.fullName ?? APP.name}</p>
          <p className="text-muted-foreground">{relativeDate(post.createdAt)}</p>
        </div>
        {post.pinned && (
          <Pin className="size-5 fill-brand-500 text-brand-500" aria-label="Fijado" />
        )}
        <Badge variant={meta.badge}>
          <Icon className="size-4" />
          {POST_TYPE_LABELS[post.type]}
        </Badge>
      </div>

      <div className="px-4 pb-2">
        <h3 className="font-display text-xl font-semibold leading-snug">
          {post.title}
        </h3>
        <p className="mt-2 whitespace-pre-line leading-relaxed text-foreground/90">
          {post.body}
        </p>
      </div>

      {post.type === "event" && post.eventDate && (
        <div className="mx-4 mb-3 flex flex-wrap items-center gap-x-4 gap-y-1 rounded-lg bg-gold-50 px-3 py-2">
          <span className="flex items-center gap-2 font-medium text-gold-800">
            <Icon className="size-5" />
            {eventDate(post.eventDate)}
            {isUpcoming(post.eventDate) && (
              <Badge variant="gold" className="ml-1">
                Proximo
              </Badge>
            )}
          </span>
          {post.eventLocation && (
            <span className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="size-5" />
              {post.eventLocation}
            </span>
          )}
        </div>
      )}

      <div className="flex items-center gap-1 border-t border-border px-2 py-1">
        <button
          onClick={onLike}
          className={cn(
            "flex items-center gap-2 rounded-lg px-3 py-2 font-medium transition-colors hover:bg-muted",
            liked ? "text-rose-600" : "text-muted-foreground",
          )}
          aria-pressed={liked}
        >
          <Heart className={cn("size-5", liked && "fill-rose-600")} />
          {count}
        </button>
      </div>
    </Card>
  );
}
