"use client";

import { Newspaper } from "lucide-react";
import { useMemo, useState } from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { Segmented } from "@/components/ui/segmented";
import { POST_TYPE_LABELS, type Post, type PostType, type Profile } from "@/data/types";
import { PostCard } from "./post-card";

type Filter = "all" | PostType;

/** Lista de publicaciones con filtro por tipo. */
export function FeedList({
  initialPosts,
  authors,
  currentUser,
}: {
  initialPosts: Post[];
  authors: Profile[];
  currentUser: Profile;
}) {
  const [filter, setFilter] = useState<Filter>("all");

  const authorsById = useMemo(
    () => new Map(authors.map((a) => [a.id, a])),
    [authors],
  );

  const posts = useMemo(
    () =>
      filter === "all"
        ? initialPosts
        : initialPosts.filter((p) => p.type === filter),
    [filter, initialPosts],
  );

  const options = [
    { value: "all" as Filter, label: "Todo" },
    { value: "announcement" as Filter, label: POST_TYPE_LABELS.announcement },
    { value: "event" as Filter, label: POST_TYPE_LABELS.event },
    { value: "recognition" as Filter, label: POST_TYPE_LABELS.recognition },
    { value: "motivation" as Filter, label: POST_TYPE_LABELS.motivation },
  ];

  return (
    <div className="space-y-5">
      <Segmented options={options} value={filter} onChange={setFilter} />

      {posts.length === 0 ? (
        <EmptyState
          icon={Newspaper}
          title="Sin publicaciones"
          description="Cuando haya novedades de este tipo, aparecerán aquí."
        />
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              author={authorsById.get(post.authorId)}
              currentUserId={currentUser.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
