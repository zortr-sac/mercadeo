import { DEFAULT_SUBSCRIPTION_PRICE_PEN } from "@/lib/constants";
import type {
  AcademyRepository,
  ActivityRepository,
  BusinessRepository,
  DuplicationRepository,
  FeedRepository,
  InteractionRepository,
  LearningRepository,
  NewActivityInput,
  NewBusinessContentInput,
  NewBusinessInput,
  NewInteractionInput,
  NewLearningInput,
  NewPostInput,
  NewProspectInput,
  ProspectPatch,
  ProspectRepository,
  Repositories,
  UserRepository,
} from "../repositories";
import type {
  ActivityEvent,
  ActivityKind,
  Business,
  BusinessContent,
  Learning,
  Post,
  Prospect,
  ProspectInteraction,
} from "../types";
import { ACTIVITY_POINTS } from "../types";
import { SEED_PROSPECTS } from "./seed-prospects";
import { SEED_COURSES } from "./seed-academy";
import { SEED_BUSINESSES, SEED_BUSINESS_CONTENT } from "./seed-businesses";
import {
  SEED_MESSAGE_TEMPLATES,
  SEED_PLAYBOOKS,
  SEED_RESOURCES,
  SEED_SCRIPTS,
} from "./seed-duplication";
import { SEED_POSTS } from "./seed-feed";
import { SEED_USERS } from "./seed-users";

const tick = <T>(value: T): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), 30));

const posts: Post[] = [...SEED_POSTS];

const businessesData: Business[] = [...SEED_BUSINESSES];
const businessContentData: BusinessContent[] = [...SEED_BUSINESS_CONTENT];

const businesses: BusinessRepository = {
  list: () => tick([...businessesData]),
  getBySlug: (slug) =>
    tick(businessesData.find((business) => business.slug === slug) ?? null),
  listContent: (businessId) =>
    tick(businessContentData.filter((item) => item.businessId === businessId)),
  create: (input: NewBusinessInput) => {
    const now = new Date().toISOString();
    const base =
      input.name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
        .slice(0, 48) || `negocio-${businessesData.length + 1}`;
    let slug = base;
    let suffix = 2;
    while (businessesData.some((business) => business.slug === slug)) {
      slug = `${base}-${suffix}`;
      suffix += 1;
    }
    const business: Business = {
      id: `b-${businessesData.length + 1}-${now}`,
      slug,
      name: input.name.trim(),
      legalName: null,
      logoUrl: null,
      primaryColor: input.primaryColor,
      accentColor: input.accentColor,
      customDomain: input.customDomain?.trim() || null,
      registrationPath: `/registro/${slug}`,
      subscriptionPricePen: DEFAULT_SUBSCRIPTION_PRICE_PEN,
      status: "active",
      adminEmail: input.adminEmail.trim(),
      memberCount: 0,
      contentCount: 0,
      createdAt: now,
    };
    businessesData.unshift(business);
    return tick(business);
  },
  updateDomain: (id, hostname) => {
    const business = businessesData.find((item) => item.id === id);
    if (business) business.customDomain = hostname?.trim() || null;
    return tick(undefined);
  },
  createContent: (input: NewBusinessContentInput) => {
    const now = new Date().toISOString();
    const item: BusinessContent = {
      id: `bc-${businessContentData.length + 1}-${now}`,
      businessId: input.businessId,
      title: input.title.trim(),
      description: input.description.trim(),
      type: input.type,
      url: input.url.trim(),
      category: input.category.trim(),
      isPublished: input.isPublished,
      createdAt: now,
    };
    businessContentData.unshift(item);
    const business = businessesData.find((b) => b.id === input.businessId);
    if (business) business.contentCount += 1;
    return tick(item);
  },
};

const users: UserRepository = {
  getById: (id) => tick(SEED_USERS.find((user) => user.id === id) ?? null),
  list: (filter) =>
    tick(
      filter && "businessId" in filter
        ? SEED_USERS.filter((user) => user.businessId === filter.businessId)
        : [...SEED_USERS],
    ),
  getTeam: (leaderId) =>
    tick(SEED_USERS.filter((user) => user.sponsorId === leaderId)),
};

const feed: FeedRepository = {
  list: (filter) => {
    const items = posts.filter((post) => {
      const typeMatches = filter?.type ? post.type === filter.type : true;
      const businessMatches =
        filter && "businessId" in filter
          ? post.businessId === filter.businessId || post.businessId === null
          : true;
      return typeMatches && businessMatches;
    });
    items.sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return b.createdAt.localeCompare(a.createdAt);
    });
    return tick(items);
  },
  getById: (id) => tick(posts.find((post) => post.id === id) ?? null),
  create: (input: NewPostInput) => {
    const now = new Date().toISOString();
    const post: Post = {
      id: `p-${posts.length + 1}-${now}`,
      businessId: input.businessId ?? null,
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
    const post = posts.find((item) => item.id === id);
    if (!post) return tick(0);
    post.reactions = Math.max(0, post.reactions + delta);
    return tick(post.reactions);
  },
};

const academy: AcademyRepository = {
  listCourses: (filter) => {
    const items = SEED_COURSES.filter((course) => course.isPublished)
      .filter((course) => (filter?.level ? course.level === filter.level : true))
      .filter((course) =>
        filter && "businessId" in filter
          ? course.businessId === filter.businessId || course.businessId === null
          : true,
      );
    items.sort((a, b) => a.sortOrder - b.sortOrder);
    return tick(
      items.map((course) => ({
        id: course.id,
        businessId: course.businessId,
        slug: course.slug,
        title: course.title,
        description: course.description,
        coverUrl: course.coverUrl,
        level: course.level,
        category: course.category,
        estimatedMinutes: course.estimatedMinutes,
        isPublished: course.isPublished,
        sortOrder: course.sortOrder,
      })),
    );
  },
  getCourseBySlug: (slug) =>
    tick(SEED_COURSES.find((course) => course.slug === slug) ?? null),
  getLesson: (courseSlug, lessonSlug) => {
    const course = SEED_COURSES.find((item) => item.slug === courseSlug);
    if (!course) return tick(null);
    for (const courseModule of course.modules) {
      const lesson = courseModule.lessons.find((item) => item.slug === lessonSlug);
      if (lesson) return tick({ course, lesson });
    }
    return tick(null);
  },
};

const duplication: DuplicationRepository = {
  listPlaybooks: (filter) =>
    tick(
      SEED_PLAYBOOKS.filter((playbook) =>
        filter?.type ? playbook.type === filter.type : true,
      ).filter((playbook) =>
        filter && "businessId" in filter
          ? playbook.businessId === filter.businessId || playbook.businessId === null
          : true,
      ),
    ),
  getPlaybookBySlug: (slug) =>
    tick(SEED_PLAYBOOKS.find((playbook) => playbook.slug === slug) ?? null),
  listScripts: (filter) =>
    tick(
      SEED_SCRIPTS.filter((script) =>
        filter?.category ? script.category === filter.category : true,
      ).filter((script) =>
        filter && "businessId" in filter
          ? script.businessId === filter.businessId || script.businessId === null
          : true,
      ),
    ),
  listMessageTemplates: (filter) =>
    tick(
      filter?.category
        ? SEED_MESSAGE_TEMPLATES.filter(
            (template) => template.category === filter.category,
          )
        : [...SEED_MESSAGE_TEMPLATES],
    ),
  listResources: (filter) =>
    tick(
      SEED_RESOURCES.filter((resource) =>
        filter?.category ? resource.category === filter.category : true,
      ).filter((resource) =>
        filter && "businessId" in filter
          ? resource.businessId === filter.businessId || resource.businessId === null
          : true,
      ),
    ),
  listResourceCategories: () =>
    tick([...new Set(SEED_RESOURCES.map((resource) => resource.category))]),
};

const prospectsData: Prospect[] = [...SEED_PROSPECTS];

const prospects: ProspectRepository = {
  listByOwner: (ownerId) =>
    tick(
      prospectsData
        .filter((prospect) => prospect.ownerId === ownerId)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    ),
  getById: (id) => tick(prospectsData.find((item) => item.id === id) ?? null),
  setAiProfile: (id, aiProfile) => {
    const prospect = prospectsData.find((item) => item.id === id);
    if (prospect) prospect.aiProfile = aiProfile;
    return tick(undefined);
  },
  create: (input: NewProspectInput) => {
    const now = new Date().toISOString();
    const prospect: Prospect = {
      id: `pr-${prospectsData.length + 1}-${now}`,
      ownerId: input.ownerId,
      businessId: input.businessId,
      name: input.name,
      phone: input.phone,
      email: input.email,
      stage: input.stage,
      interest: input.interest,
      notes: input.notes,
      nextActionAt: input.nextActionAt,
      createdAt: now,
    };
    prospectsData.unshift(prospect);
    return tick(prospect);
  },
  update: (id, patch: ProspectPatch) => {
    const prospect = prospectsData.find((item) => item.id === id);
    if (!prospect) throw new Error("Prospecto no encontrado");
    Object.assign(prospect, patch);
    return tick(prospect);
  },
  remove: (id) => {
    const index = prospectsData.findIndex((item) => item.id === id);
    if (index >= 0) prospectsData.splice(index, 1);
    return tick(undefined);
  },
};

const interactionsData: ProspectInteraction[] = [];

const interactions: InteractionRepository = {
  listByProspect: (prospectId) =>
    tick(
      interactionsData
        .filter((item) => item.prospectId === prospectId)
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    ),
  create: (input: NewInteractionInput) => {
    const now = new Date().toISOString();
    const interaction: ProspectInteraction = {
      id: `pi-${interactionsData.length + 1}-${now}`,
      prospectId: input.prospectId,
      ownerId: input.ownerId,
      businessId: input.businessId,
      role: input.role,
      content: input.content,
      source: input.source ?? "manual",
      complianceStatus: input.complianceStatus ?? null,
      createdAt: now,
    };
    interactionsData.push(interaction);
    return tick(interaction);
  },
  remove: (id) => {
    const index = interactionsData.findIndex((item) => item.id === id);
    if (index >= 0) interactionsData.splice(index, 1);
    return tick(undefined);
  },
};

const learningsData: Learning[] = [];

const learnings: LearningRepository = {
  listByUser: (userId) =>
    tick(
      learningsData
        .filter((item) => item.userId === userId)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    ),
  create: (input: NewLearningInput) => {
    const now = new Date().toISOString();
    const learning: Learning = {
      id: `ln-${learningsData.length + 1}-${now}`,
      userId: input.userId,
      businessId: input.businessId,
      situation: input.situation,
      reframe: input.reframe,
      createdAt: now,
    };
    learningsData.unshift(learning);
    return tick(learning);
  },
};

const activityData: ActivityEvent[] = [];

const activity: ActivityRepository = {
  log: (input: NewActivityInput) => {
    const now = new Date().toISOString();
    activityData.unshift({
      id: `ae-${activityData.length + 1}-${now}`,
      userId: input.userId,
      businessId: input.businessId,
      kind: input.kind,
      points: ACTIVITY_POINTS[input.kind] ?? 0,
      createdAt: now,
    });
    return tick(undefined);
  },
  listRecent: (userId, limit = 20) =>
    tick(activityData.filter((item) => item.userId === userId).slice(0, limit)),
  getStats: (userId) => {
    const rows = activityData.filter((item) => item.userId === userId);
    const byKind = {
      lesson_completed: 0,
      prospect_added: 0,
      conversation_used: 0,
      message_generated: 0,
      learning_logged: 0,
      post_created: 0,
    } as Record<ActivityKind, number>;
    let totalPoints = 0;
    let weekCount = 0;
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    for (const row of rows) {
      byKind[row.kind] += 1;
      totalPoints += row.points;
      if (new Date(row.createdAt).getTime() >= weekAgo) weekCount += 1;
    }
    return tick({
      totalPoints,
      totalEvents: rows.length,
      weekCount,
      streakDays: rows.length > 0 ? 1 : 0,
      byKind,
    });
  },
};

export const mockRepositories: Repositories = {
  businesses,
  users,
  feed,
  academy,
  duplication,
  prospects,
  interactions,
  learnings,
  activity,
};
