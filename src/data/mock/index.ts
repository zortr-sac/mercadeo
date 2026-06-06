import { DEFAULT_SUBSCRIPTION_PRICE_PEN, type Role } from "@/lib/constants";
import type {
  AcademyRepository,
  ActivityRepository,
  AudiobookPatch,
  AudiobookRepository,
  NewPresentationTemplateInput,
  PresentationTemplatePatch,
  PresentationTemplateRepository,
  NewAdTemplateInput,
  AdTemplatePatch,
  AdTemplateRepository,
  ReactionRepository,
  BusinessRepository,
  CoursePatch,
  DuplicationRepository,
  InteractionRepository,
  LearningRepository,
  LessonPatch,
  MessageTemplatePatch,
  NewActivityInput,
  NewAudiobookInput,
  NewBusinessContentInput,
  NewBusinessInput,
  NewCourseInput,
  NewInteractionInput,
  NewLearningInput,
  NewLessonInput,
  NewMessageTemplateInput,
  NewProspectInput,
  ProspectPatch,
  ProspectRepository,
  Repositories,
  UserRepository,
  SubscriptionRepository,
  RecordPaymentInput,
  BusinessExpirySummary,
} from "../repositories";
import type {
  ActivityEvent,
  ActivityKind,
  Audiobook,
  Business,
  BusinessContent,
  Course,
  CourseModule,
  CourseWithContent,
  Learning,
  Lesson,
  MessageTemplate,
  PresentationTemplate,
  AdTemplate,
  ContentReactionType,
  Prospect,
  ProspectInteraction,
  SubscriptionPayment,
} from "../types";
import { ACTIVITY_POINTS } from "../types";
import { getSubscriptionState } from "@/lib/subscription";
import { SEED_PROSPECTS } from "./seed-prospects";
import { SEED_COURSES } from "./seed-academy";
import { SEED_BUSINESSES, SEED_BUSINESS_CONTENT } from "./seed-businesses";
import {
  SEED_MESSAGE_TEMPLATES,
  SEED_PLAYBOOKS,
  SEED_RESOURCES,
  SEED_SCRIPTS,
} from "./seed-duplication";
import { SEED_USERS } from "./seed-users";

const tick = <T>(value: T): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), 30));

const businessesData: Business[] = [...SEED_BUSINESSES];
const businessContentData: BusinessContent[] = [...SEED_BUSINESS_CONTENT];

function mockSlug(value: string, taken: (s: string) => boolean): string {
  const base =
    value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 48) || "item";
  let slug = base;
  let suffix = 2;
  while (taken(slug)) {
    slug = `${base}-${suffix}`;
    suffix += 1;
  }
  return slug;
}

const businesses: BusinessRepository = {
  list: () => tick([...businessesData]),
  getBySlug: (slug) =>
    tick(businessesData.find((business) => business.slug === slug) ?? null),
  getById: (id) => tick(businessesData.find((business) => business.id === id) ?? null),
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
  updateBranding: (id, primaryColor, accentColor) => {
    const business = businessesData.find((item) => item.id === id);
    if (business) {
      business.primaryColor = primaryColor;
      business.accentColor = accentColor;
    }
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
  findByEmail: (email) =>
    tick(
      SEED_USERS.find(
        (user) => user.email.toLowerCase() === email.trim().toLowerCase(),
      ) ?? null,
    ),
  assign: (userId, businessId, role: Role) => {
    const user = SEED_USERS.find((item) => item.id === userId);
    if (!user) throw new Error("Usuario no encontrado");
    user.businessId = businessId;
    user.role = role;
    return tick(user);
  },
};

type MockCourse = CourseWithContent;
const coursesData: MockCourse[] = SEED_COURSES.map((course) => ({
  ...course,
  lessonCount: course.modules.reduce((sum, m) => sum + m.lessons.length, 0),
}));

function toCourse(course: MockCourse): Course {
  return {
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
  };
}

const completedByUser = new Map<string, Set<string>>();

const academy: AcademyRepository = {
  listCourses: (filter) => {
    const items = coursesData
      .filter((course) => course.isPublished)
      .filter((course) => (filter?.level ? course.level === filter.level : true))
      .filter((course) =>
        filter && "businessId" in filter
          ? course.businessId === filter.businessId || course.businessId === null
          : true,
      )
      .sort((a, b) => a.sortOrder - b.sortOrder);
    return tick(items.map(toCourse));
  },
  getCourseBySlug: (slug) =>
    tick(coursesData.find((course) => course.slug === slug) ?? null),
  getLesson: (courseSlug, lessonSlug) => {
    const course = coursesData.find((item) => item.slug === courseSlug);
    if (!course) return tick(null);
    for (const courseModule of course.modules) {
      const lesson = courseModule.lessons.find((item) => item.slug === lessonSlug);
      if (lesson) return tick({ course, lesson });
    }
    return tick(null);
  },
  getCompletedLessonIds: (userId) => tick(Array.from(completedByUser.get(userId) ?? [])),
  markLessonComplete: (userId, lessonId) => {
    const set = completedByUser.get(userId) ?? new Set<string>();
    set.add(lessonId);
    completedByUser.set(userId, set);
    return tick(undefined);
  },
  listCoursesAdmin: (businessId) =>
    tick(
      coursesData
        .filter((course) => course.businessId === businessId)
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map(toCourse),
    ),
  getCourseById: (id) => tick(coursesData.find((course) => course.id === id) ?? null),
  createCourse: (input: NewCourseInput) => {
    const now = new Date().toISOString();
    const course: MockCourse = {
      id: `c-${coursesData.length + 1}-${now}`,
      businessId: input.businessId,
      slug: mockSlug(input.title, (s) => coursesData.some((c) => c.slug === s)),
      title: input.title.trim(),
      description: input.description.trim(),
      coverUrl: null,
      level: input.level,
      category: input.category.trim(),
      estimatedMinutes: input.estimatedMinutes,
      isPublished: input.isPublished,
      sortOrder: input.sortOrder ?? 0,
      modules: [],
      lessonCount: 0,
    };
    coursesData.unshift(course);
    return tick(toCourse(course));
  },
  updateCourse: (id, patch: CoursePatch) => {
    const course = coursesData.find((item) => item.id === id);
    if (!course) throw new Error("Curso no encontrado");
    Object.assign(course, patch);
    return tick(toCourse(course));
  },
  removeCourse: (id) => {
    const index = coursesData.findIndex((item) => item.id === id);
    if (index >= 0) coursesData.splice(index, 1);
    return tick(undefined);
  },
  ensureModule: (courseId, title) => {
    const course = coursesData.find((item) => item.id === courseId);
    if (!course) throw new Error("Curso no encontrado");
    if (course.modules[0]) {
      const m = course.modules[0];
      return tick({ id: m.id, courseId, title: m.title, sortOrder: m.sortOrder });
    }
    const mod: CourseModule & { lessons: Lesson[] } = {
      id: `m-${courseId}-1`,
      courseId,
      title: title.trim() || "Contenido",
      sortOrder: 1,
      lessons: [],
    };
    course.modules.push(mod);
    return tick({ id: mod.id, courseId, title: mod.title, sortOrder: mod.sortOrder });
  },
  createLesson: (input: NewLessonInput) => {
    const course = coursesData.find((item) => item.id === input.courseId);
    if (!course) throw new Error("Curso no encontrado");
    const mod =
      course.modules.find((m) => m.id === input.moduleId) ?? course.modules[0];
    if (!mod) throw new Error("Módulo no encontrado");
    const lesson: Lesson = {
      id: `l-${input.courseId}-${Date.now()}`,
      moduleId: mod.id,
      courseId: input.courseId,
      slug: mockSlug(input.title, (s) =>
        course.modules.some((m) => m.lessons.some((l) => l.slug === s)),
      ),
      title: input.title.trim(),
      contentType: input.contentType,
      videoUrl: input.videoUrl ?? null,
      content: input.content ?? null,
      resourceUrl: input.resourceUrl ?? null,
      durationMinutes: input.durationMinutes ?? 0,
      sortOrder: input.sortOrder ?? 0,
    };
    mod.lessons.push(lesson);
    course.lessonCount += 1;
    return tick(lesson);
  },
  updateLesson: (id, patch: LessonPatch) => {
    for (const course of coursesData) {
      for (const mod of course.modules) {
        const lesson = mod.lessons.find((l) => l.id === id);
        if (lesson) {
          Object.assign(lesson, patch);
          return tick(lesson);
        }
      }
    }
    throw new Error("Lección no encontrada");
  },
  removeLesson: (id) => {
    for (const course of coursesData) {
      for (const mod of course.modules) {
        const index = mod.lessons.findIndex((l) => l.id === id);
        if (index >= 0) {
          mod.lessons.splice(index, 1);
          course.lessonCount = Math.max(0, course.lessonCount - 1);
          return tick(undefined);
        }
      }
    }
    return tick(undefined);
  },
};

const templatesData: MessageTemplate[] = [...SEED_MESSAGE_TEMPLATES];

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
      templatesData
        .filter((t) => (filter?.category ? t.category === filter.category : true))
        .filter((t) =>
          filter && "businessId" in filter
            ? t.businessId === filter.businessId || t.businessId === null
            : true,
        ),
    ),
  createMessageTemplate: (input: NewMessageTemplateInput) => {
    const template: MessageTemplate = {
      id: `mt-${templatesData.length + 1}-${Date.now()}`,
      businessId: input.businessId,
      title: input.title.trim(),
      category: input.category,
      situation: input.situation.trim(),
      baseText: input.baseText.trim(),
      defaultTone: input.defaultTone,
      complianceHint: input.complianceHint.trim(),
      systemPrompt: input.systemPrompt.trim(),
    };
    templatesData.unshift(template);
    return tick(template);
  },
  updateMessageTemplate: (id, patch: MessageTemplatePatch) => {
    const template = templatesData.find((t) => t.id === id);
    if (!template) throw new Error("Plantilla no encontrada");
    Object.assign(template, patch);
    return tick(template);
  },
  removeMessageTemplate: (id) => {
    const index = templatesData.findIndex((t) => t.id === id);
    if (index >= 0) templatesData.splice(index, 1);
    return tick(undefined);
  },
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

const audiobooksData: Audiobook[] = [];

const audiobooks: AudiobookRepository = {
  list: (filter) =>
    tick(
      audiobooksData
        .filter((a) => a.isPublished)
        .filter((a) =>
          filter && "businessId" in filter
            ? a.businessId === filter.businessId || a.businessId === null
            : true,
        )
        .sort((a, b) => a.sortOrder - b.sortOrder),
    ),
  listAdmin: (businessId) =>
    tick(
      audiobooksData
        .filter((a) => a.businessId === businessId)
        .sort((a, b) => a.sortOrder - b.sortOrder),
    ),
  getBySlug: (slug) => tick(audiobooksData.find((a) => a.slug === slug) ?? null),
  create: (input: NewAudiobookInput) => {
    const now = new Date().toISOString();
    const audiobook: Audiobook = {
      id: `ab-${audiobooksData.length + 1}-${now}`,
      businessId: input.businessId,
      slug: mockSlug(input.title, (s) => audiobooksData.some((a) => a.slug === s)),
      title: input.title.trim(),
      author: input.author.trim(),
      description: input.description.trim(),
      coverUrl: input.coverUrl ?? null,
      audioUrl: input.audioUrl ?? null,
      audioPath: input.audioPath ?? null,
      category: input.category.trim() || "General",
      durationSeconds: input.durationSeconds ?? 0,
      isPublished: input.isPublished ?? false,
      sortOrder: input.sortOrder ?? 0,
      createdAt: now,
    };
    audiobooksData.unshift(audiobook);
    return tick(audiobook);
  },
  update: (id, patch: AudiobookPatch) => {
    const audiobook = audiobooksData.find((a) => a.id === id);
    if (!audiobook) throw new Error("Audiolibro no encontrado");
    Object.assign(audiobook, patch);
    return tick(audiobook);
  },
  remove: (id) => {
    const index = audiobooksData.findIndex((a) => a.id === id);
    if (index >= 0) audiobooksData.splice(index, 1);
    return tick(undefined);
  },
};

const presentationTemplatesData: PresentationTemplate[] = [];

const presentationTemplates: PresentationTemplateRepository = {
  list: (filter) =>
    tick(
      presentationTemplatesData
        .filter((p) => p.isPublished)
        .filter((p) =>
          filter && "businessId" in filter
            ? p.businessId === filter.businessId || p.businessId === null
            : true,
        )
        .sort((a, b) => a.sortOrder - b.sortOrder),
    ),
  listAdmin: (businessId) =>
    tick(
      presentationTemplatesData
        .filter((p) => p.businessId === businessId)
        .sort((a, b) => a.sortOrder - b.sortOrder),
    ),
  getBySlug: (slug) =>
    tick(presentationTemplatesData.find((p) => p.slug === slug) ?? null),
  create: (input: NewPresentationTemplateInput) => {
    const now = new Date().toISOString();
    const tpl: PresentationTemplate = {
      id: `pt-${presentationTemplatesData.length + 1}-${now}`,
      businessId: input.businessId,
      slug: mockSlug(input.title, (s) => presentationTemplatesData.some((p) => p.slug === s)),
      title: input.title.trim(),
      description: input.description.trim(),
      coverUrl: input.coverUrl ?? null,
      fileUrl: input.fileUrl ?? null,
      filePath: input.filePath ?? null,
      fileName: input.fileName ?? null,
      fileBytes: input.fileBytes ?? 0,
      slides: input.slides ?? [],
      isPublished: input.isPublished ?? false,
      sortOrder: input.sortOrder ?? 0,
      createdAt: now,
    };
    presentationTemplatesData.unshift(tpl);
    return tick(tpl);
  },
  update: (id, patch: PresentationTemplatePatch) => {
    const tpl = presentationTemplatesData.find((p) => p.id === id);
    if (!tpl) throw new Error("Plantilla no encontrada");
    Object.assign(tpl, patch);
    return tick(tpl);
  },
  remove: (id) => {
    const index = presentationTemplatesData.findIndex((p) => p.id === id);
    if (index >= 0) presentationTemplatesData.splice(index, 1);
    return tick(undefined);
  },
};

const adTemplatesData: AdTemplate[] = [];

const adTemplates: AdTemplateRepository = {
  list: (filter) =>
    tick(
      adTemplatesData
        .filter((a) => a.isPublished)
        .filter((a) =>
          filter && "businessId" in filter
            ? a.businessId === filter.businessId || a.businessId === null
            : true,
        )
        .sort((a, b) => a.sortOrder - b.sortOrder),
    ),
  listAdmin: (businessId) =>
    tick(
      adTemplatesData
        .filter((a) => a.businessId === businessId)
        .sort((a, b) => a.sortOrder - b.sortOrder),
    ),
  getById: (id) => tick(adTemplatesData.find((a) => a.id === id) ?? null),
  create: (input: NewAdTemplateInput) => {
    const now = new Date().toISOString();
    const ad: AdTemplate = {
      id: `ad-${adTemplatesData.length + 1}-${now}`,
      businessId: input.businessId,
      title: input.title.trim(),
      bodyText: input.bodyText.trim(),
      imageUrl: input.imageUrl ?? null,
      imagePath: input.imagePath ?? null,
      category: input.category.trim() || "General",
      isPublished: input.isPublished ?? false,
      sortOrder: input.sortOrder ?? 0,
      createdAt: now,
    };
    adTemplatesData.unshift(ad);
    return tick(ad);
  },
  update: (id, patch: AdTemplatePatch) => {
    const ad = adTemplatesData.find((a) => a.id === id);
    if (!ad) throw new Error("Anuncio no encontrado");
    Object.assign(ad, patch);
    return tick(ad);
  },
  remove: (id) => {
    const index = adTemplatesData.findIndex((a) => a.id === id);
    if (index >= 0) adTemplatesData.splice(index, 1);
    return tick(undefined);
  },
};

type MockReaction = {
  userId: string;
  businessId: string | null;
  type: ContentReactionType;
  contentId: string;
};
const reactionsData: MockReaction[] = [];

const reactions: ReactionRepository = {
  toggle: (userId, businessId, type, contentId) => {
    const idx = reactionsData.findIndex(
      (r) => r.userId === userId && r.type === type && r.contentId === contentId,
    );
    if (idx >= 0) {
      reactionsData.splice(idx, 1);
      return tick({ reacted: false });
    }
    reactionsData.push({ userId, businessId, type, contentId });
    return tick({ reacted: true });
  },
  listReactedIds: (userId, type) =>
    tick(
      reactionsData
        .filter((r) => r.userId === userId && r.type === type)
        .map((r) => r.contentId),
    ),
  getCounts: (type, businessId) => {
    const counts: Record<string, number> = {};
    for (const r of reactionsData) {
      if (r.type !== type) continue;
      if (businessId && r.businessId !== businessId) continue;
      counts[r.contentId] = (counts[r.contentId] ?? 0) + 1;
    }
    return tick(counts);
  },
};

const subscriptionPaymentsData: SubscriptionPayment[] = [];

const subscriptions: SubscriptionRepository = {
  recordPayment: ({
    memberId,
    businessId,
    amountPen,
    periodEnd,
    recordedBy,
    note,
  }: RecordPaymentInput) => {
    const user = SEED_USERS.find((item) => item.id === memberId);
    if (!user) throw new Error("Cliente no encontrado");
    user.subscriptionExpiresAt = periodEnd;
    user.subscriptionReminderSentAt = null;
    const now = new Date().toISOString();
    subscriptionPaymentsData.unshift({
      id: `pay-${subscriptionPaymentsData.length + 1}-${now}`,
      memberId,
      businessId,
      amountPen,
      paidAt: now,
      periodEnd,
      recordedBy,
      note: note ?? null,
      createdAt: now,
    });
    return tick(user);
  },
  getExpirySummaryByBusiness: () => {
    const now = new Date();
    const summary: Record<string, BusinessExpirySummary> = {};
    for (const user of SEED_USERS) {
      if (user.role !== "member" || !user.businessId) continue;
      let bucket = summary[user.businessId];
      if (!bucket) {
        bucket = { expired: 0, expiringSoon: 0, active: 0, total: 0 };
        summary[user.businessId] = bucket;
      }
      bucket.total += 1;
      const state = getSubscriptionState(user.subscriptionExpiresAt, now);
      if (state === "expired") bucket.expired += 1;
      else if (state === "expiring_soon") bucket.expiringSoon += 1;
      else if (state === "active") bucket.active += 1;
    }
    return tick(summary);
  },
  listPayments: (memberId) =>
    tick(subscriptionPaymentsData.filter((payment) => payment.memberId === memberId)),
};

export const mockRepositories: Repositories = {
  businesses,
  users,
  academy,
  duplication,
  audiobooks,
  presentationTemplates,
  adTemplates,
  reactions,
  prospects,
  interactions,
  learnings,
  activity,
  subscriptions,
};
