/**
 * Implementación MOCK (local-first) de los repositorios.
 * Datos en memoria sembrados desde los seeds en español.
 * Las mutaciones persisten durante la sesión del servidor de desarrollo.
 */
import type {
  AcademyRepository,
  DuplicationRepository,
  FeedRepository,
  NewPostInput,
  Repositories,
  UserRepository,
} from "../repositories";
import type { Post } from "../types";
import { SEED_COURSES } from "./seed-academy";
import { SEED_PLAYBOOKS, SEED_RESOURCES, SEED_SCRIPTS } from "./seed-duplication";
import { SEED_POSTS } from "./seed-feed";
import { SEED_USERS } from "./seed-users";

/** Pequeña demora simulada para que la UI se comporte como con red real. */
const tick = <T>(value: T): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), 30));

/** Copia mutable de posts (las creaciones se reflejan en la sesión). */
const posts: Post[] = [...SEED_POSTS];

const users: UserRepository = {
  listDemoUsers: () => tick([...SEED_USERS]),
  getById: (id) => tick(SEED_USERS.find((u) => u.id === id) ?? null),
  list: () => tick([...SEED_USERS]),
  getTeam: (leaderId) =>
    tick(SEED_USERS.filter((u) => u.sponsorId === leaderId)),
};

const feed: FeedRepository = {
  list: (filter) => {
    const items = filter?.type
      ? posts.filter((p) => p.type === filter.type)
      : [...posts];
    // Fijados primero; luego por fecha descendente.
    items.sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return b.createdAt.localeCompare(a.createdAt);
    });
    return tick(items);
  },
  getById: (id) => tick(posts.find((p) => p.id === id) ?? null),
  create: (input: NewPostInput) => {
    const now = new Date().toISOString();
    const post: Post = {
      id: `p-${posts.length + 1}-${now}`,
      type: input.type,
      title: input.title,
      body: input.body,
      authorId: input.authorId,
      coverUrl: null,
      pinned: input.pinned ?? false,
      eventDate: input.eventDate ?? null,
      eventLocation: input.eventLocation ?? null,
      reactions: 0,
      createdAt: now,
    };
    posts.unshift(post);
    return tick(post);
  },
  toggleReaction: (id, delta) => {
    const post = posts.find((p) => p.id === id);
    if (!post) return tick(0);
    post.reactions = Math.max(0, post.reactions + delta);
    return tick(post.reactions);
  },
};

const academy: AcademyRepository = {
  listCourses: (filter) => {
    const items = SEED_COURSES.filter((c) => c.isPublished).filter((c) =>
      filter?.level ? c.level === filter.level : true,
    );
    items.sort((a, b) => a.sortOrder - b.sortOrder);
    // Devolver versión ligera (sin contenido) para el catálogo.
    return tick(items.map(({ modules: _m, lessonCount: _l, ...rest }) => rest));
  },
  getCourseBySlug: (slug) =>
    tick(SEED_COURSES.find((c) => c.slug === slug) ?? null),
  getLesson: (courseSlug, lessonSlug) => {
    const course = SEED_COURSES.find((c) => c.slug === courseSlug);
    if (!course) return tick(null);
    for (const mod of course.modules) {
      const lesson = mod.lessons.find((l) => l.slug === lessonSlug);
      if (lesson) return tick({ course, lesson });
    }
    return tick(null);
  },
};

const duplication: DuplicationRepository = {
  listPlaybooks: (filter) =>
    tick(
      filter?.type
        ? SEED_PLAYBOOKS.filter((p) => p.type === filter.type)
        : [...SEED_PLAYBOOKS],
    ),
  getPlaybookBySlug: (slug) =>
    tick(SEED_PLAYBOOKS.find((p) => p.slug === slug) ?? null),
  listScripts: (filter) =>
    tick(
      filter?.category
        ? SEED_SCRIPTS.filter((s) => s.category === filter.category)
        : [...SEED_SCRIPTS],
    ),
  listResources: (filter) =>
    tick(
      filter?.category
        ? SEED_RESOURCES.filter((r) => r.category === filter.category)
        : [...SEED_RESOURCES],
    ),
  listResourceCategories: () =>
    tick([...new Set(SEED_RESOURCES.map((r) => r.category))]),
};

export const mockRepositories: Repositories = {
  users,
  feed,
  academy,
  duplication,
};
