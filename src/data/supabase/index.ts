import "server-only";
import { createClient } from "@/lib/supabase/server";
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
  ActivityStats,
  Business,
  BusinessContent,
  Course,
  CourseWithContent,
  Learning,
  Lesson,
  MessageTemplate,
  Playbook,
  Post,
  Profile,
  Prospect,
  ProspectInteraction,
  Resource,
  Script,
} from "../types";
import { ACTIVITY_POINTS } from "../types";

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
  };
}

function mapPost(row: any): Post {
  return {
    id: row.id,
    businessId: row.business_id ?? null,
    type: row.type,
    title: row.title,
    body: row.body,
    authorId: row.author_id,
    coverUrl: row.cover_url ?? null,
    pinned: row.pinned,
    eventDate: row.event_date ?? null,
    eventLocation: row.event_location ?? null,
    reactions: row.reactions,
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
    title: row.title,
    category: row.category,
    situation: row.situation,
    baseText: row.base_text,
    defaultTone: row.default_tone,
    complianceHint: row.compliance_hint,
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
};

const feed: FeedRepository = {
  async list(filter) {
    const supabase = await db();
    let query = supabase.from("posts").select("*");
    if (filter?.type) query = query.eq("type", filter.type);
    if (filter && "businessId" in filter) query = scopeBusiness(query, filter.businessId);
    const { data, error } = await query
      .order("pinned", { ascending: false })
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(mapPost);
  },
  async getById(id) {
    const supabase = await db();
    const { data } = await supabase.from("posts").select("*").eq("id", id).maybeSingle();
    return data ? mapPost(data) : null;
  },
  async create(input: NewPostInput) {
    const supabase = await db();
    const { data, error } = await supabase
      .from("posts")
      .insert({
        business_id: input.businessId ?? null,
        type: input.type,
        title: input.title,
        body: input.body,
        author_id: input.authorId,
        pinned: input.pinned ?? false,
        event_date: input.eventDate ?? null,
        event_location: input.eventLocation ?? null,
      })
      .select("*")
      .single();
    if (error) throw error;
    return mapPost(data);
  },
  async toggleReaction(id, delta) {
    const supabase = await db();
    const { data, error } = await supabase.rpc("increment_post_reaction", {
      p_post_id: id,
      p_delta: delta,
    });
    if (error) throw error;
    return Number(data ?? 0);
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
    const { data, error } = await query.order("created_at", { ascending: true });
    if (error) throw error;
    return (data ?? []).map(mapTemplate);
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
      post_created: 0,
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

export const supabaseRepositories: Repositories = {
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
