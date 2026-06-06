import "server-only";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
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
  ActivityStats,
  Audiobook,
  Business,
  BusinessContent,
  Course,
  CourseModule,
  CourseWithContent,
  Learning,
  Lesson,
  MessageTemplate,
  Playbook,
  PresentationTemplate,
  AdTemplate,
  Profile,
  Prospect,
  ProspectInteraction,
  Resource,
  Script,
  SubscriptionPayment,
} from "../types";
import { ACTIVITY_POINTS } from "../types";
import { getSubscriptionState } from "@/lib/subscription";

/* ============================ Mappers (snake_case DB -> camelCase domain) ============================ */

/* eslint-disable @typescript-eslint/no-explicit-any */

function mapBusiness(row: any): Business {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    legalName: row.legal_name ?? null,
    logoUrl: row.logo_path ?? null,
    primaryColor: row.primary_color,
    accentColor: row.accent_color,
    customDomain: row.custom_domain ?? null,
    registrationPath: `/registro/${row.slug}`,
    subscriptionPricePen: row.subscription_price_pen,
    status: row.status,
    adminEmail: row.admin_email,
    memberCount: Number(row.member_count ?? 0),
    contentCount: Number(row.content_count ?? 0),
    createdAt: row.created_at,
  };
}

function mapBusinessContent(row: any): BusinessContent {
  return {
    id: row.id,
    businessId: row.business_id,
    title: row.title,
    description: row.description,
    type: row.type,
    url: row.external_url ?? row.storage_path ?? "#",
    category: row.category,
    isPublished: row.is_published,
    createdAt: row.created_at,
  };
}

function mapProfile(row: any): Profile {
  return {
    id: row.id,
    businessId: row.business_id ?? null,
    fullName: row.full_name ?? "",
    email: row.email ?? "",
    avatarUrl: row.avatar_url ?? null,
    phone: row.phone ?? null,
    country: row.country ?? null,
    role: row.role,
    sponsorId: row.sponsor_id ?? null,
    rank: row.rank ?? null,
    isActive: row.is_active ?? true,
    joinedAt: row.joined_at ?? row.created_at ?? "",
    subscriptionExpiresAt: row.subscription_expires_at ?? null,
  };
}

function mapSubscriptionPayment(row: any): SubscriptionPayment {
  return {
    id: row.id,
    memberId: row.member_id,
    businessId: row.business_id ?? null,
    amountPen: Number(row.amount_pen ?? 0),
    paidAt: row.paid_at,
    periodEnd: row.period_end,
    recordedBy: row.recorded_by ?? null,
    note: row.note ?? null,
    createdAt: row.created_at,
  };
}

function mapCourse(row: any): Course {
  return {
    id: row.id,
    businessId: row.business_id ?? null,
    slug: row.slug,
    title: row.title,
    description: row.description,
    coverUrl: row.cover_url ?? null,
    level: row.level,
    category: row.category,
    estimatedMinutes: row.estimated_minutes,
    isPublished: row.is_published,
    sortOrder: row.sort_order,
  };
}

function mapLesson(row: any): Lesson {
  return {
    id: row.id,
    moduleId: row.module_id,
    courseId: row.course_id,
    slug: row.slug,
    title: row.title,
    contentType: row.content_type,
    videoUrl: row.video_url ?? null,
    content: row.content ?? null,
    resourceUrl: row.resource_url ?? null,
    durationMinutes: row.duration_minutes,
    sortOrder: row.sort_order,
  };
}

function mapPlaybook(row: any): Playbook {
  return {
    id: row.id,
    businessId: row.business_id ?? null,
    slug: row.slug,
    title: row.title,
    type: row.type,
    description: row.description,
    icon: row.icon,
    steps: Array.isArray(row.steps) ? row.steps : [],
  };
}

function mapScript(row: any): Script {
  return {
    id: row.id,
    businessId: row.business_id ?? null,
    title: row.title,
    category: row.category,
    scenario: row.scenario,
    content: row.content,
    tags: row.tags ?? [],
  };
}

function mapResource(row: any): Resource {
  return {
    id: row.id,
    businessId: row.business_id ?? null,
    title: row.title,
    type: row.type,
    description: row.description,
    url: row.url,
    category: row.category,
    sizeLabel: row.size_label ?? null,
  };
}

function mapTemplate(row: any): MessageTemplate {
  return {
    id: row.id,
    businessId: row.business_id ?? null,
    title: row.title,
    category: row.category,
    situation: row.situation,
    baseText: row.base_text,
    defaultTone: row.default_tone,
    complianceHint: row.compliance_hint,
    systemPrompt: row.system_prompt ?? "",
  };
}

function mapAudiobook(row: any): Audiobook {
  return {
    id: row.id,
    businessId: row.business_id ?? null,
    slug: row.slug,
    title: row.title,
    author: row.author ?? "",
    description: row.description ?? "",
    coverUrl: row.cover_url ?? null,
    audioUrl: row.audio_url ?? null,
    audioPath: row.audio_path ?? null,
    category: row.category ?? "General",
    durationSeconds: row.duration_seconds ?? 0,
    isPublished: row.is_published ?? false,
    sortOrder: row.sort_order ?? 0,
    createdAt: row.created_at,
  };
}

function mapPresentationTemplate(row: any): PresentationTemplate {
  return {
    id: row.id,
    businessId: row.business_id ?? null,
    slug: row.slug,
    title: row.title,
    description: row.description ?? "",
    coverUrl: row.cover_url ?? null,
    fileUrl: row.file_url ?? null,
    filePath: row.file_path ?? null,
    fileName: row.file_name ?? null,
    fileBytes: Number(row.file_bytes ?? 0),
    slides: Array.isArray(row.slides) ? row.slides : [],
    isPublished: row.is_published ?? false,
    sortOrder: row.sort_order ?? 0,
    createdAt: row.created_at,
  };
}

function mapAdTemplate(row: any): AdTemplate {
  return {
    id: row.id,
    businessId: row.business_id ?? null,
    title: row.title,
    bodyText: row.body_text ?? "",
    imageUrl: row.image_url ?? null,
    imagePath: row.image_path ?? null,
    category: row.category ?? "General",
    isPublished: row.is_published ?? false,
    sortOrder: row.sort_order ?? 0,
    createdAt: row.created_at,
  };
}

function mapProspect(row: any): Prospect {
  return {
    id: row.id,
    ownerId: row.owner_id,
    businessId: row.business_id ?? null,
    name: row.name,
    phone: row.phone ?? null,
    email: row.email ?? null,
    stage: row.stage,
    interest: row.interest,
    notes: row.notes,
    nextActionAt: row.next_action_at ?? null,
    createdAt: row.created_at,
    aiProfile: row.ai_profile ?? null,
  };
}

function mapInteraction(row: any): ProspectInteraction {
  return {
    id: row.id,
    prospectId: row.prospect_id,
    ownerId: row.owner_id,
    businessId: row.business_id ?? null,
    role: row.role,
    content: row.content,
    source: row.source,
    complianceStatus: row.compliance_status ?? null,
    createdAt: row.created_at,
  };
}

function mapLearning(row: any): Learning {
  return {
    id: row.id,
    userId: row.user_id,
    businessId: row.business_id ?? null,
    situation: row.situation,
    reframe: row.reframe ?? null,
    createdAt: row.created_at,
  };
}

function mapActivity(row: any): ActivityEvent {
  return {
    id: row.id,
    userId: row.user_id,
    businessId: row.business_id ?? null,
    kind: row.kind,
    points: row.points,
    createdAt: row.created_at,
  };
}

/** Días consecutivos (UTC) con actividad, contando hasta hoy o ayer. */
function computeStreak(dates: string[]): number {
  const days = new Set(dates.map((iso) => iso.slice(0, 10)));
  if (days.size === 0) return 0;
  const oneDay = 24 * 60 * 60 * 1000;
  const today = new Date();
  const todayKey = today.toISOString().slice(0, 10);
  const yesterdayKey = new Date(today.getTime() - oneDay).toISOString().slice(0, 10);
  let cursor: Date;
  if (days.has(todayKey)) cursor = today;
  else if (days.has(yesterdayKey)) cursor = new Date(today.getTime() - oneDay);
  else return 0;
  let streak = 0;
  while (days.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor = new Date(cursor.getTime() - oneDay);
  }
  return streak;
}

function prospectColumns(input: Partial<NewProspectInput>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (input.businessId !== undefined) row.business_id = input.businessId;
  if (input.name !== undefined) row.name = input.name;
  if (input.phone !== undefined) row.phone = input.phone;
  if (input.email !== undefined) row.email = input.email;
  if (input.stage !== undefined) row.stage = input.stage;
  if (input.interest !== undefined) row.interest = input.interest;
  if (input.notes !== undefined) row.notes = input.notes;
  if (input.nextActionAt !== undefined) row.next_action_at = input.nextActionAt;
  return row;
}

/* eslint-enable @typescript-eslint/no-explicit-any */

async function db() {
  return createClient();
}

const DIACRITICS = /[̀-ͯ]/g;

function slugify(value: string): string {
  return (
    value
      .toLowerCase()
      .normalize("NFD")
      .replace(DIACRITICS, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 48) || `negocio-${Math.abs(hashString(value))}`
  );
}

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

/** Slug único global en `table` (añade -2, -3… si colisiona). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function uniqueSlug(supabase: any, table: string, base: string): Promise<string> {
  const root = slugify(base);
  let candidate = root;
  let suffix = 2;
  // Hasta ~50 intentos; suficiente en la práctica.
  for (let i = 0; i < 50; i += 1) {
    const { data } = await supabase
      .from(table)
      .select("id")
      .eq("slug", candidate)
      .maybeSingle();
    if (!data) return candidate;
    candidate = `${root}-${suffix}`;
    suffix += 1;
  }
  return `${root}-${Math.abs(hashString(base + String(Date.now())))}`;
}

/** Applies "own business OR global (null)" scope; when businessId is null, only global rows. */
function scopeBusiness<T extends { or: (f: string) => T; is: (c: string, v: null) => T }>(
  query: T,
  businessId: string | null | undefined,
): T {
  if (businessId) return query.or(`business_id.eq.${businessId},business_id.is.null`);
  return query.is("business_id", null);
}

/* ============================ Repositories ============================ */

const businesses: BusinessRepository = {
  async list() {
    const supabase = await db();
    const { data, error } = await supabase
      .from("businesses_with_stats")
      .select("*")
      .order("created_at", { ascending: true });
    if (error) throw error;
    return (data ?? []).map(mapBusiness);
  },
  async getBySlug(slug) {
    const supabase = await db();
    const { data } = await supabase
      .from("businesses_with_stats")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();
    return data ? mapBusiness(data) : null;
  },
  async getById(id) {
    const supabase = await db();
    const { data } = await supabase
      .from("businesses_with_stats")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    return data ? mapBusiness(data) : null;
  },
  async listContent(businessId) {
    const supabase = await db();
    const { data, error } = await supabase
      .from("business_content")
      .select("*")
      .eq("business_id", businessId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(mapBusinessContent);
  },
  async create(input: NewBusinessInput) {
    const supabase = await db();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const slug = slugify(input.name);
    const { data, error } = await supabase
      .from("businesses")
      .insert({
        slug,
        name: input.name.trim(),
        admin_email: input.adminEmail.trim(),
        primary_color: input.primaryColor,
        accent_color: input.accentColor,
        status: "active",
        created_by: user?.id ?? null,
      })
      .select("id")
      .single();
    if (error) throw error;
    const businessId = data.id as string;
    if (input.customDomain?.trim()) {
      await supabase.from("business_domains").insert({
        business_id: businessId,
        hostname: input.customDomain.trim(),
        is_primary: true,
      });
    }
    const { data: stats } = await supabase
      .from("businesses_with_stats")
      .select("*")
      .eq("id", businessId)
      .single();
    return mapBusiness(stats);
  },
  async updateDomain(id, hostname) {
    const supabase = await db();
    await supabase
      .from("business_domains")
      .delete()
      .eq("business_id", id)
      .eq("is_primary", true);
    if (hostname?.trim()) {
      const { error } = await supabase.from("business_domains").insert({
        business_id: id,
        hostname: hostname.trim(),
        is_primary: true,
      });
      if (error) throw error;
    }
  },
  async updateBranding(id, primaryColor, accentColor) {
    // Service-role: la tabla `businesses` no expone UPDATE por RLS; la autorización
    // se valida en la server action (requireBusinessAdmin).
    const admin = createAdminClient();
    const { error } = await admin
      .from("businesses")
      .update({
        primary_color: primaryColor,
        accent_color: accentColor,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);
    if (error) throw error;
  },
  async createContent(input: NewBusinessContentInput) {
    const supabase = await db();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from("business_content")
      .insert({
        business_id: input.businessId,
        title: input.title.trim(),
        description: input.description.trim(),
        type: input.type,
        external_url: input.url.trim(),
        category: input.category.trim(),
        is_published: input.isPublished,
        created_by: user?.id ?? null,
      })
      .select("*")
      .single();
    if (error) throw error;
    return mapBusinessContent(data);
  },
};

const users: UserRepository = {
  async getById(id) {
    const supabase = await db();
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    return data ? mapProfile(data) : null;
  },
  async list(filter) {
    const supabase = await db();
    let query = supabase.from("profiles").select("*");
    if (filter && "businessId" in filter) {
      query = filter.businessId
        ? query.eq("business_id", filter.businessId)
        : query.is("business_id", null);
    }
    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []).map(mapProfile);
  },
  async getTeam(leaderId) {
    const supabase = await db();
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("sponsor_id", leaderId);
    if (error) throw error;
    return (data ?? []).map(mapProfile);
  },
  async findByEmail(email) {
    const supabase = await db();
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .ilike("email", email.trim())
      .maybeSingle();
    return data ? mapProfile(data) : null;
  },
  async assign(userId, businessId, role) {
    const supabase = await db();
    const { data, error } = await supabase
      .from("profiles")
      .update({ business_id: businessId, role })
      .eq("id", userId)
      .select("*")
      .single();
    if (error) throw error;
    return mapProfile(data);
  },
};

async function buildCourseWithContent(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  courseRow: any,
): Promise<CourseWithContent> {
  const [{ data: modules }, { data: lessons }] = await Promise.all([
    supabase.from("course_modules").select("*").eq("course_id", courseRow.id).order("sort_order"),
    supabase.from("lessons").select("*").eq("course_id", courseRow.id).order("sort_order"),
  ]);
  const lessonRows = (lessons ?? []).map(mapLesson);
  const moduleList = (modules ?? []).map(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (m: any) => ({
      id: m.id,
      courseId: m.course_id,
      title: m.title,
      sortOrder: m.sort_order,
      lessons: lessonRows.filter((l: Lesson) => l.moduleId === m.id),
    }),
  );
  return {
    ...mapCourse(courseRow),
    modules: moduleList,
    lessonCount: lessonRows.length,
  };
}

const academy: AcademyRepository = {
  async listCourses(filter) {
    const supabase = await db();
    let query = supabase.from("courses").select("*").eq("is_published", true);
    if (filter?.level) query = query.eq("level", filter.level);
    if (filter && "businessId" in filter) query = scopeBusiness(query, filter.businessId);
    const { data, error } = await query.order("sort_order", { ascending: true });
    if (error) throw error;
    return (data ?? []).map(mapCourse);
  },
  async getCourseBySlug(slug) {
    const supabase = await db();
    const { data: course } = await supabase
      .from("courses")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();
    if (!course) return null;
    return buildCourseWithContent(supabase, course);
  },
  async getLesson(courseSlug, lessonSlug) {
    const supabase = await db();
    const { data: course } = await supabase
      .from("courses")
      .select("*")
      .eq("slug", courseSlug)
      .maybeSingle();
    if (!course) return null;
    const full = await buildCourseWithContent(supabase, course);
    for (const courseModule of full.modules) {
      const lesson = courseModule.lessons.find((item) => item.slug === lessonSlug);
      if (lesson) return { course: full, lesson };
    }
    return null;
  },
  async getCompletedLessonIds(userId) {
    const supabase = await db();
    const { data, error } = await supabase
      .from("lesson_progress")
      .select("lesson_id")
      .eq("user_id", userId)
      .eq("completed", true);
    if (error) throw error;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (data ?? []).map((r: any) => r.lesson_id as string);
  },
  async markLessonComplete(userId, lessonId) {
    const supabase = await db();
    const { error } = await supabase.from("lesson_progress").upsert(
      {
        user_id: userId,
        lesson_id: lessonId,
        completed: true,
        completed_at: new Date().toISOString(),
      },
      { onConflict: "user_id,lesson_id" },
    );
    if (error) throw error;
  },
  // --- Admin ---
  async listCoursesAdmin(businessId) {
    const supabase = await db();
    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .eq("business_id", businessId)
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return (data ?? []).map(mapCourse);
  },
  async getCourseById(id) {
    const supabase = await db();
    const { data: course } = await supabase
      .from("courses")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (!course) return null;
    return buildCourseWithContent(supabase, course);
  },
  async createCourse(input: NewCourseInput) {
    const supabase = await db();
    const slug = await uniqueSlug(supabase, "courses", input.title);
    const { data, error } = await supabase
      .from("courses")
      .insert({
        business_id: input.businessId,
        slug,
        title: input.title.trim(),
        description: input.description.trim(),
        level: input.level,
        category: input.category.trim(),
        estimated_minutes: input.estimatedMinutes,
        is_published: input.isPublished,
        sort_order: input.sortOrder ?? 0,
      })
      .select("*")
      .single();
    if (error) throw error;
    return mapCourse(data);
  },
  async updateCourse(id, patch: CoursePatch) {
    const supabase = await db();
    const row: Record<string, unknown> = {};
    if (patch.title !== undefined) row.title = patch.title;
    if (patch.description !== undefined) row.description = patch.description;
    if (patch.level !== undefined) row.level = patch.level;
    if (patch.category !== undefined) row.category = patch.category;
    if (patch.estimatedMinutes !== undefined) row.estimated_minutes = patch.estimatedMinutes;
    if (patch.isPublished !== undefined) row.is_published = patch.isPublished;
    if (patch.sortOrder !== undefined) row.sort_order = patch.sortOrder;
    const { data, error } = await supabase
      .from("courses")
      .update(row)
      .eq("id", id)
      .select("*")
      .single();
    if (error) throw error;
    return mapCourse(data);
  },
  async removeCourse(id) {
    const supabase = await db();
    const { error } = await supabase.from("courses").delete().eq("id", id);
    if (error) throw error;
  },
  async ensureModule(courseId, title) {
    const supabase = await db();
    const { data: existing } = await supabase
      .from("course_modules")
      .select("*")
      .eq("course_id", courseId)
      .order("sort_order")
      .limit(1)
      .maybeSingle();
    if (existing) {
      return {
        id: existing.id,
        courseId: existing.course_id,
        title: existing.title,
        sortOrder: existing.sort_order,
      } satisfies CourseModule;
    }
    const { data, error } = await supabase
      .from("course_modules")
      .insert({ course_id: courseId, title: title.trim() || "Contenido", sort_order: 1 })
      .select("*")
      .single();
    if (error) throw error;
    return {
      id: data.id,
      courseId: data.course_id,
      title: data.title,
      sortOrder: data.sort_order,
    } satisfies CourseModule;
  },
  async createLesson(input: NewLessonInput) {
    const supabase = await db();
    // slug único por curso
    const root = slugify(input.title);
    let slug = root;
    let suffix = 2;
    for (let i = 0; i < 50; i += 1) {
      const { data: clash } = await supabase
        .from("lessons")
        .select("id")
        .eq("course_id", input.courseId)
        .eq("slug", slug)
        .maybeSingle();
      if (!clash) break;
      slug = `${root}-${suffix}`;
      suffix += 1;
    }
    const { data, error } = await supabase
      .from("lessons")
      .insert({
        course_id: input.courseId,
        module_id: input.moduleId,
        slug,
        title: input.title.trim(),
        content_type: input.contentType,
        video_url: input.videoUrl ?? null,
        content: input.content ?? null,
        resource_url: input.resourceUrl ?? null,
        duration_minutes: input.durationMinutes ?? 0,
        sort_order: input.sortOrder ?? 0,
      })
      .select("*")
      .single();
    if (error) throw error;
    return mapLesson(data);
  },
  async updateLesson(id, patch: LessonPatch) {
    const supabase = await db();
    const row: Record<string, unknown> = {};
    if (patch.title !== undefined) row.title = patch.title;
    if (patch.contentType !== undefined) row.content_type = patch.contentType;
    if (patch.videoUrl !== undefined) row.video_url = patch.videoUrl;
    if (patch.content !== undefined) row.content = patch.content;
    if (patch.resourceUrl !== undefined) row.resource_url = patch.resourceUrl;
    if (patch.durationMinutes !== undefined) row.duration_minutes = patch.durationMinutes;
    if (patch.sortOrder !== undefined) row.sort_order = patch.sortOrder;
    const { data, error } = await supabase
      .from("lessons")
      .update(row)
      .eq("id", id)
      .select("*")
      .single();
    if (error) throw error;
    return mapLesson(data);
  },
  async removeLesson(id) {
    const supabase = await db();
    const { error } = await supabase.from("lessons").delete().eq("id", id);
    if (error) throw error;
  },
};

const duplication: DuplicationRepository = {
  async listPlaybooks(filter) {
    const supabase = await db();
    let query = supabase.from("playbooks").select("*");
    if (filter?.type) query = query.eq("type", filter.type);
    if (filter && "businessId" in filter) query = scopeBusiness(query, filter.businessId);
    const { data, error } = await query.order("created_at", { ascending: true });
    if (error) throw error;
    return (data ?? []).map(mapPlaybook);
  },
  async getPlaybookBySlug(slug) {
    const supabase = await db();
    const { data } = await supabase.from("playbooks").select("*").eq("slug", slug).maybeSingle();
    return data ? mapPlaybook(data) : null;
  },
  async listScripts(filter) {
    const supabase = await db();
    let query = supabase.from("scripts").select("*");
    if (filter?.category) query = query.eq("category", filter.category);
    if (filter && "businessId" in filter) query = scopeBusiness(query, filter.businessId);
    const { data, error } = await query.order("created_at", { ascending: true });
    if (error) throw error;
    return (data ?? []).map(mapScript);
  },
  async listMessageTemplates(filter) {
    const supabase = await db();
    let query = supabase.from("message_templates").select("*");
    if (filter?.category) query = query.eq("category", filter.category);
    if (filter && "businessId" in filter) query = scopeBusiness(query, filter.businessId);
    const { data, error } = await query.order("created_at", { ascending: true });
    if (error) throw error;
    return (data ?? []).map(mapTemplate);
  },
  async createMessageTemplate(input: NewMessageTemplateInput) {
    const supabase = await db();
    const { data, error } = await supabase
      .from("message_templates")
      .insert({
        business_id: input.businessId,
        title: input.title.trim(),
        category: input.category,
        situation: input.situation.trim(),
        base_text: input.baseText.trim(),
        default_tone: input.defaultTone,
        compliance_hint: input.complianceHint.trim(),
        system_prompt: input.systemPrompt.trim(),
      })
      .select("*")
      .single();
    if (error) throw error;
    return mapTemplate(data);
  },
  async updateMessageTemplate(id, patch: MessageTemplatePatch) {
    const supabase = await db();
    const row: Record<string, unknown> = {};
    if (patch.title !== undefined) row.title = patch.title;
    if (patch.category !== undefined) row.category = patch.category;
    if (patch.situation !== undefined) row.situation = patch.situation;
    if (patch.baseText !== undefined) row.base_text = patch.baseText;
    if (patch.defaultTone !== undefined) row.default_tone = patch.defaultTone;
    if (patch.complianceHint !== undefined) row.compliance_hint = patch.complianceHint;
    if (patch.systemPrompt !== undefined) row.system_prompt = patch.systemPrompt;
    const { data, error } = await supabase
      .from("message_templates")
      .update(row)
      .eq("id", id)
      .select("*")
      .single();
    if (error) throw error;
    return mapTemplate(data);
  },
  async removeMessageTemplate(id) {
    const supabase = await db();
    const { error } = await supabase.from("message_templates").delete().eq("id", id);
    if (error) throw error;
  },
  async listResources(filter) {
    const supabase = await db();
    let query = supabase.from("resources").select("*");
    if (filter?.category) query = query.eq("category", filter.category);
    if (filter && "businessId" in filter) query = scopeBusiness(query, filter.businessId);
    const { data, error } = await query.order("created_at", { ascending: true });
    if (error) throw error;
    return (data ?? []).map(mapResource);
  },
  async listResourceCategories() {
    const supabase = await db();
    const { data, error } = await supabase.from("resources").select("category");
    if (error) throw error;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return [...new Set((data ?? []).map((row: any) => row.category as string))];
  },
};

const prospects: ProspectRepository = {
  async listByOwner(ownerId) {
    const supabase = await db();
    const { data, error } = await supabase
      .from("prospects")
      .select("*")
      .eq("owner_id", ownerId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(mapProspect);
  },
  async getById(id) {
    const supabase = await db();
    const { data } = await supabase
      .from("prospects")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    return data ? mapProspect(data) : null;
  },
  async setAiProfile(id, aiProfile) {
    const supabase = await db();
    const { error } = await supabase
      .from("prospects")
      .update({ ai_profile: aiProfile })
      .eq("id", id);
    if (error) throw error;
  },
  async create(input: NewProspectInput) {
    const supabase = await db();
    const { data, error } = await supabase
      .from("prospects")
      .insert({ owner_id: input.ownerId, ...prospectColumns(input) })
      .select("*")
      .single();
    if (error) throw error;
    return mapProspect(data);
  },
  async update(id, patch: ProspectPatch) {
    const supabase = await db();
    const { data, error } = await supabase
      .from("prospects")
      .update(prospectColumns(patch))
      .eq("id", id)
      .select("*")
      .single();
    if (error) throw error;
    return mapProspect(data);
  },
  async remove(id) {
    const supabase = await db();
    const { error } = await supabase.from("prospects").delete().eq("id", id);
    if (error) throw error;
  },
};

const interactions: InteractionRepository = {
  async listByProspect(prospectId) {
    const supabase = await db();
    const { data, error } = await supabase
      .from("prospect_interactions")
      .select("*")
      .eq("prospect_id", prospectId)
      .order("created_at", { ascending: true });
    if (error) throw error;
    return (data ?? []).map(mapInteraction);
  },
  async create(input: NewInteractionInput) {
    const supabase = await db();
    const { data, error } = await supabase
      .from("prospect_interactions")
      .insert({
        prospect_id: input.prospectId,
        owner_id: input.ownerId,
        business_id: input.businessId,
        role: input.role,
        content: input.content,
        source: input.source ?? "manual",
        compliance_status: input.complianceStatus ?? null,
      })
      .select("*")
      .single();
    if (error) throw error;
    return mapInteraction(data);
  },
  async remove(id) {
    const supabase = await db();
    const { error } = await supabase
      .from("prospect_interactions")
      .delete()
      .eq("id", id);
    if (error) throw error;
  },
};

const learnings: LearningRepository = {
  async listByUser(userId) {
    const supabase = await db();
    const { data, error } = await supabase
      .from("learnings")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(mapLearning);
  },
  async create(input: NewLearningInput) {
    const supabase = await db();
    const { data, error } = await supabase
      .from("learnings")
      .insert({
        user_id: input.userId,
        business_id: input.businessId,
        situation: input.situation,
        reframe: input.reframe,
      })
      .select("*")
      .single();
    if (error) throw error;
    return mapLearning(data);
  },
};

const activity: ActivityRepository = {
  async log(input: NewActivityInput) {
    const supabase = await db();
    const { error } = await supabase.from("activity_events").insert({
      user_id: input.userId,
      business_id: input.businessId,
      kind: input.kind,
      points: ACTIVITY_POINTS[input.kind] ?? 0,
    });
    if (error) throw error;
  },
  async listRecent(userId, limit = 20) {
    const supabase = await db();
    const { data, error } = await supabase
      .from("activity_events")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data ?? []).map(mapActivity);
  },
  async getStats(userId) {
    const supabase = await db();
    const { data, error } = await supabase
      .from("activity_events")
      .select("kind, points, created_at")
      .eq("user_id", userId);
    if (error) throw error;
    const rows = (data ?? []) as {
      kind: ActivityKind;
      points: number;
      created_at: string;
    }[];
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
      byKind[row.kind] = (byKind[row.kind] ?? 0) + 1;
      totalPoints += row.points;
      if (new Date(row.created_at).getTime() >= weekAgo) weekCount += 1;
    }
    return {
      totalPoints,
      totalEvents: rows.length,
      weekCount,
      streakDays: computeStreak(rows.map((row) => row.created_at)),
      byKind,
    } satisfies ActivityStats;
  },
};

const audiobooks: AudiobookRepository = {
  async list(filter) {
    const supabase = await db();
    let query = supabase.from("audiobooks").select("*").eq("is_published", true);
    if (filter && "businessId" in filter) query = scopeBusiness(query, filter.businessId);
    const { data, error } = await query.order("sort_order", { ascending: true });
    if (error) throw error;
    return (data ?? []).map(mapAudiobook);
  },
  async listAdmin(businessId) {
    const supabase = await db();
    const { data, error } = await supabase
      .from("audiobooks")
      .select("*")
      .eq("business_id", businessId)
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return (data ?? []).map(mapAudiobook);
  },
  async getBySlug(slug) {
    const supabase = await db();
    const { data } = await supabase
      .from("audiobooks")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();
    return data ? mapAudiobook(data) : null;
  },
  async create(input: NewAudiobookInput) {
    const supabase = await db();
    const slug = await uniqueSlug(supabase, "audiobooks", input.title);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from("audiobooks")
      .insert({
        business_id: input.businessId,
        slug,
        title: input.title.trim(),
        author: input.author.trim(),
        description: input.description.trim(),
        category: input.category.trim() || "General",
        cover_url: input.coverUrl ?? null,
        audio_url: input.audioUrl ?? null,
        audio_path: input.audioPath ?? null,
        duration_seconds: input.durationSeconds ?? 0,
        is_published: input.isPublished ?? false,
        sort_order: input.sortOrder ?? 0,
        created_by: user?.id ?? null,
      })
      .select("*")
      .single();
    if (error) throw error;
    return mapAudiobook(data);
  },
  async update(id, patch: AudiobookPatch) {
    const supabase = await db();
    const row: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (patch.title !== undefined) row.title = patch.title;
    if (patch.author !== undefined) row.author = patch.author;
    if (patch.description !== undefined) row.description = patch.description;
    if (patch.category !== undefined) row.category = patch.category;
    if (patch.coverUrl !== undefined) row.cover_url = patch.coverUrl;
    if (patch.audioUrl !== undefined) row.audio_url = patch.audioUrl;
    if (patch.audioPath !== undefined) row.audio_path = patch.audioPath;
    if (patch.durationSeconds !== undefined) row.duration_seconds = patch.durationSeconds;
    if (patch.isPublished !== undefined) row.is_published = patch.isPublished;
    if (patch.sortOrder !== undefined) row.sort_order = patch.sortOrder;
    const { data, error } = await supabase
      .from("audiobooks")
      .update(row)
      .eq("id", id)
      .select("*")
      .single();
    if (error) throw error;
    return mapAudiobook(data);
  },
  async remove(id) {
    const supabase = await db();
    const { error } = await supabase.from("audiobooks").delete().eq("id", id);
    if (error) throw error;
  },
};

const adTemplates: AdTemplateRepository = {
  async list(filter) {
    const supabase = await db();
    let query = supabase.from("ad_templates").select("*").eq("is_published", true);
    if (filter && "businessId" in filter) query = scopeBusiness(query, filter.businessId);
    const { data, error } = await query.order("sort_order", { ascending: true });
    if (error) throw error;
    return (data ?? []).map(mapAdTemplate);
  },
  async listAdmin(businessId) {
    const supabase = await db();
    const { data, error } = await supabase
      .from("ad_templates")
      .select("*")
      .eq("business_id", businessId)
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return (data ?? []).map(mapAdTemplate);
  },
  async getById(id) {
    const supabase = await db();
    const { data } = await supabase.from("ad_templates").select("*").eq("id", id).maybeSingle();
    return data ? mapAdTemplate(data) : null;
  },
  async create(input: NewAdTemplateInput) {
    const supabase = await db();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from("ad_templates")
      .insert({
        business_id: input.businessId,
        title: input.title.trim(),
        body_text: input.bodyText.trim(),
        category: input.category.trim() || "General",
        image_url: input.imageUrl ?? null,
        image_path: input.imagePath ?? null,
        is_published: input.isPublished ?? false,
        sort_order: input.sortOrder ?? 0,
        created_by: user?.id ?? null,
      })
      .select("*")
      .single();
    if (error) throw error;
    return mapAdTemplate(data);
  },
  async update(id, patch: AdTemplatePatch) {
    const supabase = await db();
    const row: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (patch.title !== undefined) row.title = patch.title;
    if (patch.bodyText !== undefined) row.body_text = patch.bodyText;
    if (patch.category !== undefined) row.category = patch.category;
    if (patch.imageUrl !== undefined) row.image_url = patch.imageUrl;
    if (patch.imagePath !== undefined) row.image_path = patch.imagePath;
    if (patch.isPublished !== undefined) row.is_published = patch.isPublished;
    if (patch.sortOrder !== undefined) row.sort_order = patch.sortOrder;
    const { data, error } = await supabase
      .from("ad_templates")
      .update(row)
      .eq("id", id)
      .select("*")
      .single();
    if (error) throw error;
    return mapAdTemplate(data);
  },
  async remove(id) {
    const supabase = await db();
    const { error } = await supabase.from("ad_templates").delete().eq("id", id);
    if (error) throw error;
  },
};

const reactions: ReactionRepository = {
  async toggle(userId, businessId, type, contentId) {
    const supabase = await db();
    const { data: existing } = await supabase
      .from("content_reactions")
      .select("content_id")
      .eq("user_id", userId)
      .eq("content_type", type)
      .eq("content_id", contentId)
      .maybeSingle();
    if (existing) {
      const { error } = await supabase
        .from("content_reactions")
        .delete()
        .eq("user_id", userId)
        .eq("content_type", type)
        .eq("content_id", contentId);
      if (error) throw error;
      return { reacted: false };
    }
    const { error } = await supabase.from("content_reactions").insert({
      user_id: userId,
      business_id: businessId,
      content_type: type,
      content_id: contentId,
    });
    if (error) throw error;
    return { reacted: true };
  },
  async listReactedIds(userId, type) {
    const supabase = await db();
    const { data, error } = await supabase
      .from("content_reactions")
      .select("content_id")
      .eq("user_id", userId)
      .eq("content_type", type);
    if (error) throw error;
    return (data ?? []).map((r) => r.content_id as string);
  },
  async getCounts(type, businessId) {
    const admin = createAdminClient();
    let query = admin
      .from("content_reactions")
      .select("content_id")
      .eq("content_type", type);
    if (businessId) query = query.eq("business_id", businessId);
    const { data, error } = await query;
    if (error) throw error;
    const counts: Record<string, number> = {};
    for (const r of data ?? []) {
      const id = (r as { content_id: string }).content_id;
      counts[id] = (counts[id] ?? 0) + 1;
    }
    return counts;
  },
};

const subscriptions: SubscriptionRepository = {
  async recordPayment({
    memberId,
    businessId,
    amountPen,
    periodEnd,
    recordedBy,
    note,
  }: RecordPaymentInput) {
    const supabase = await db();
    const { data: profile, error: upErr } = await supabase
      .from("profiles")
      .update({
        subscription_expires_at: periodEnd,
        subscription_reminder_sent_at: null,
      })
      .eq("id", memberId)
      .select("*")
      .single();
    if (upErr) throw upErr;
    const { error: payErr } = await supabase.from("subscription_payments").insert({
      member_id: memberId,
      business_id: businessId,
      amount_pen: amountPen,
      period_end: periodEnd,
      recorded_by: recordedBy,
      note: note ?? null,
    });
    if (payErr) throw payErr;
    return mapProfile(profile);
  },
  async getExpirySummaryByBusiness() {
    const supabase = await db();
    const { data, error } = await supabase
      .from("profiles")
      .select("business_id, subscription_expires_at")
      .eq("role", "member");
    if (error) throw error;
    const now = new Date();
    const summary: Record<string, BusinessExpirySummary> = {};
    for (const row of data ?? []) {
      const businessId = (row.business_id as string | null) ?? null;
      if (!businessId) continue;
      let bucket = summary[businessId];
      if (!bucket) {
        bucket = { expired: 0, expiringSoon: 0, active: 0, total: 0 };
        summary[businessId] = bucket;
      }
      bucket.total += 1;
      const state = getSubscriptionState(
        (row.subscription_expires_at as string | null) ?? null,
        now,
      );
      if (state === "expired") bucket.expired += 1;
      else if (state === "expiring_soon") bucket.expiringSoon += 1;
      else if (state === "active") bucket.active += 1;
    }
    return summary;
  },
  async listPayments(memberId: string) {
    const supabase = await db();
    const { data, error } = await supabase
      .from("subscription_payments")
      .select("*")
      .eq("member_id", memberId)
      .order("paid_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(mapSubscriptionPayment);
  },
};

const presentationTemplates: PresentationTemplateRepository = {
  async list(filter) {
    const supabase = await db();
    let query = supabase
      .from("presentation_templates")
      .select("*")
      .eq("is_published", true);
    if (filter && "businessId" in filter) query = scopeBusiness(query, filter.businessId);
    const { data, error } = await query.order("sort_order", { ascending: true });
    if (error) throw error;
    return (data ?? []).map(mapPresentationTemplate);
  },
  async listAdmin(businessId) {
    const supabase = await db();
    const { data, error } = await supabase
      .from("presentation_templates")
      .select("*")
      .eq("business_id", businessId)
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return (data ?? []).map(mapPresentationTemplate);
  },
  async getBySlug(slug) {
    const supabase = await db();
    const { data } = await supabase
      .from("presentation_templates")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();
    return data ? mapPresentationTemplate(data) : null;
  },
  async create(input: NewPresentationTemplateInput) {
    const supabase = await db();
    const slug = await uniqueSlug(supabase, "presentation_templates", input.title);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from("presentation_templates")
      .insert({
        business_id: input.businessId,
        slug,
        title: input.title.trim(),
        description: input.description.trim(),
        cover_url: input.coverUrl ?? null,
        file_url: input.fileUrl ?? null,
        file_path: input.filePath ?? null,
        file_name: input.fileName ?? null,
        file_bytes: input.fileBytes ?? 0,
        slides: input.slides ?? [],
        is_published: input.isPublished ?? false,
        sort_order: input.sortOrder ?? 0,
        created_by: user?.id ?? null,
      })
      .select("*")
      .single();
    if (error) throw error;
    return mapPresentationTemplate(data);
  },
  async update(id, patch: PresentationTemplatePatch) {
    const supabase = await db();
    const row: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (patch.title !== undefined) row.title = patch.title;
    if (patch.description !== undefined) row.description = patch.description;
    if (patch.coverUrl !== undefined) row.cover_url = patch.coverUrl;
    if (patch.fileUrl !== undefined) row.file_url = patch.fileUrl;
    if (patch.filePath !== undefined) row.file_path = patch.filePath;
    if (patch.fileName !== undefined) row.file_name = patch.fileName;
    if (patch.fileBytes !== undefined) row.file_bytes = patch.fileBytes;
    if (patch.slides !== undefined) row.slides = patch.slides;
    if (patch.isPublished !== undefined) row.is_published = patch.isPublished;
    if (patch.sortOrder !== undefined) row.sort_order = patch.sortOrder;
    const { data, error } = await supabase
      .from("presentation_templates")
      .update(row)
      .eq("id", id)
      .select("*")
      .single();
    if (error) throw error;
    return mapPresentationTemplate(data);
  },
  async remove(id) {
    const supabase = await db();
    const { error } = await supabase.from("presentation_templates").delete().eq("id", id);
    if (error) throw error;
  },
};

export const supabaseRepositories: Repositories = {
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
