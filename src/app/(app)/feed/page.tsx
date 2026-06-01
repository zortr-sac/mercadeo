import type { Metadata } from "next";
import { getRepositories } from "@/data";
import { Container, PageHeader } from "@/components/layout/page-header";
import { can } from "@/lib/rbac";
import { requireSession } from "@/lib/session";
import { FeedList } from "@/features/feed/feed-list";
import { CreatePostButton } from "@/features/feed/create-post";

export const metadata: Metadata = { title: "Feed" };

export default async function FeedPage() {
  const user = await requireSession();
  const repos = getRepositories();
  const [posts, authors] = await Promise.all([
    repos.feed.list(),
    repos.users.list(),
  ]);

  return (
    <Container>
      <PageHeader
        title="Feed"
        subtitle="Anuncios, eventos y motivación para tu equipo."
        action={can(user.role, "feed.create") ? <CreatePostButton /> : null}
      />
      <div className="mt-6">
        <FeedList initialPosts={posts} authors={authors} currentUser={user} />
      </div>
    </Container>
  );
}
