import type {
  ActivityEvent,
  ActivityKind,
  ActivityStats,
  Audiobook,
  Business,
  BusinessContent,
  BusinessContentType,
  Course,
  CourseLevel,
  CourseModule,
  CourseWithContent,
  Learning,
  Lesson,
  LessonType,
  MessageTemplate,
  MessageTone,
  Playbook,
  PlaybookType,
  Profile,
  Prospect,
  ProspectInteraction,
  ProspectInterest,
  ProspectStage,
  InteractionRole,
  Resource,
  Script,
  ScriptCategory,
  SubscriptionPayment,
} from "./types";
import type { Role } from "@/lib/constants";

export interface NewBusinessInput {
  name: string;
  adminEmail: string;
  primaryColor: string;
  accentColor: string;
  customDomain: string | null;
}

export interface NewBusinessContentInput {
  businessId: string;
  title: string;
  description: string;
  type: BusinessContentType;
  url: string;
  category: string;
  isPublished: boolean;
}

export interface BusinessRepository {
  list(): Promise<Business[]>;
  getBySlug(slug: string): Promise<Business | null>;
  getById(id: string): Promise<Business | null>;
  listContent(businessId: string): Promise<BusinessContent[]>;
  create(input: NewBusinessInput): Promise<Business>;
  updateDomain(id: string, hostname: string | null): Promise<void>;
  /** Actualiza el color de marca (unicolor). */
  updateBranding(id: string, primaryColor: string, accentColor: string): Promise<void>;
  createContent(input: NewBusinessContentInput): Promise<BusinessContent>;
}

export interface UserRepository {
  getById(id: string): Promise<Profile | null>;
  list(filter?: { businessId?: string | null }): Promise<Profile[]>;
  getTeam(leaderId: string): Promise<Profile[]>;
  findByEmail(email: string): Promise<Profile | null>;
  /** Asigna negocio y rol a un usuario (gestión de líderes por el admin). */
  assign(userId: string, businessId: string | null, role: Role): Promise<Profile>;
}

export interface NewCourseInput {
  businessId: string | null;
  title: string;
  description: string;
  level: CourseLevel;
  category: string;
  estimatedMinutes: number;
  isPublished: boolean;
  sortOrder?: number;
}
export type CoursePatch = Partial<Omit<NewCourseInput, "businessId">>;

export interface NewLessonInput {
  courseId: string;
  moduleId: string;
  title: string;
  contentType: LessonType;
  videoUrl?: string | null;
  content?: string | null;
  resourceUrl?: string | null;
  durationMinutes?: number;
  sortOrder?: number;
}
export type LessonPatch = Partial<Omit<NewLessonInput, "courseId" | "moduleId">>;

export interface AcademyRepository {
  listCourses(filter?: {
    level?: CourseLevel;
    businessId?: string | null;
  }): Promise<Course[]>;
  getCourseBySlug(slug: string): Promise<CourseWithContent | null>;
  getLesson(
    courseSlug: string,
    lessonSlug: string,
  ): Promise<{ course: CourseWithContent; lesson: Lesson } | null>;
  // --- Progress (Supabase lesson_progress) ---
  getCompletedLessonIds(userId: string): Promise<string[]>;
  markLessonComplete(userId: string, lessonId: string): Promise<void>;
  // --- Admin ---
  listCoursesAdmin(businessId: string): Promise<Course[]>;
  getCourseById(id: string): Promise<CourseWithContent | null>;
  createCourse(input: NewCourseInput): Promise<Course>;
  updateCourse(id: string, patch: CoursePatch): Promise<Course>;
  removeCourse(id: string): Promise<void>;
  /** Crea (o reutiliza) un módulo en un curso y devuelve su id. */
  ensureModule(courseId: string, title: string): Promise<CourseModule>;
  createLesson(input: NewLessonInput): Promise<Lesson>;
  updateLesson(id: string, patch: LessonPatch): Promise<Lesson>;
  removeLesson(id: string): Promise<void>;
}

export interface NewMessageTemplateInput {
  businessId: string | null;
  title: string;
  category: ScriptCategory;
  situation: string;
  baseText: string;
  defaultTone: MessageTone;
  complianceHint: string;
  systemPrompt: string;
}
export type MessageTemplatePatch = Partial<Omit<NewMessageTemplateInput, "businessId">>;

export interface DuplicationRepository {
  listPlaybooks(filter?: {
    type?: PlaybookType;
    businessId?: string | null;
  }): Promise<Playbook[]>;
  getPlaybookBySlug(slug: string): Promise<Playbook | null>;
  listScripts(filter?: {
    category?: ScriptCategory;
    businessId?: string | null;
  }): Promise<Script[]>;
  listMessageTemplates(filter?: {
    category?: ScriptCategory;
    businessId?: string | null;
  }): Promise<MessageTemplate[]>;
  createMessageTemplate(input: NewMessageTemplateInput): Promise<MessageTemplate>;
  updateMessageTemplate(
    id: string,
    patch: MessageTemplatePatch,
  ): Promise<MessageTemplate>;
  removeMessageTemplate(id: string): Promise<void>;
  listResources(filter?: {
    category?: string;
    businessId?: string | null;
  }): Promise<Resource[]>;
  listResourceCategories(): Promise<string[]>;
}

export interface NewAudiobookInput {
  businessId: string | null;
  title: string;
  author: string;
  description: string;
  category: string;
  coverUrl?: string | null;
  audioUrl?: string | null;
  audioPath?: string | null;
  durationSeconds?: number;
  isPublished?: boolean;
  sortOrder?: number;
}
export type AudiobookPatch = Partial<Omit<NewAudiobookInput, "businessId">>;

export interface AudiobookRepository {
  list(filter?: { businessId?: string | null }): Promise<Audiobook[]>;
  listAdmin(businessId: string): Promise<Audiobook[]>;
  getBySlug(slug: string): Promise<Audiobook | null>;
  create(input: NewAudiobookInput): Promise<Audiobook>;
  update(id: string, patch: AudiobookPatch): Promise<Audiobook>;
  remove(id: string): Promise<void>;
}

export interface NewProspectInput {
  ownerId: string;
  businessId: string | null;
  name: string;
  phone: string | null;
  email: string | null;
  stage: ProspectStage;
  interest: ProspectInterest;
  notes: string;
  nextActionAt: string | null;
}

export type ProspectPatch = Partial<Omit<NewProspectInput, "ownerId">>;

export interface ProspectRepository {
  listByOwner(ownerId: string): Promise<Prospect[]>;
  getById(id: string): Promise<Prospect | null>;
  create(input: NewProspectInput): Promise<Prospect>;
  update(id: string, patch: ProspectPatch): Promise<Prospect>;
  setAiProfile(id: string, aiProfile: string): Promise<void>;
  remove(id: string): Promise<void>;
}

export interface NewInteractionInput {
  prospectId: string;
  ownerId: string;
  businessId: string | null;
  role: InteractionRole;
  content: string;
  source?: string;
  complianceStatus?: string | null;
}

export interface InteractionRepository {
  listByProspect(prospectId: string): Promise<ProspectInteraction[]>;
  create(input: NewInteractionInput): Promise<ProspectInteraction>;
  remove(id: string): Promise<void>;
}

export interface NewLearningInput {
  userId: string;
  businessId: string | null;
  situation: string;
  reframe: string | null;
}

export interface LearningRepository {
  listByUser(userId: string): Promise<Learning[]>;
  create(input: NewLearningInput): Promise<Learning>;
}

export interface NewActivityInput {
  userId: string;
  businessId: string | null;
  kind: ActivityKind;
}

export interface ActivityRepository {
  log(input: NewActivityInput): Promise<void>;
  listRecent(userId: string, limit?: number): Promise<ActivityEvent[]>;
  getStats(userId: string): Promise<ActivityStats>;
}

export interface AiUsageRow {
  userId: string;
  endpoint: string;
  costPen: number;
  createdAt: string;
}

export interface AiLimitOverrideInput {
  businessId: string;
  userId: string;
  monthKey: string;
  limitPen: number;
  updatedBy: string;
}

export interface UsageRepository {
  /** Filas de consumo de IA de un negocio desde una fecha (para agregar métricas). */
  listForWindow(businessId: string, sinceISO: string): Promise<AiUsageRow[]>;
  /** Overrides de límite del mes: userId → límite en soles. */
  overridesForMonth(businessId: string, monthKey: string): Promise<Record<string, number>>;
  /** Fija/actualiza el límite mensual de un usuario. */
  setLimitOverride(input: AiLimitOverrideInput): Promise<void>;
}

export interface RecordPaymentInput {
  memberId: string;
  businessId: string | null;
  amountPen: number;
  /** Nuevo vencimiento ya calculado (ver computeRenewedExpiry). ISO string. */
  periodEnd: string;
  recordedBy: string;
  note?: string | null;
}

export interface BusinessExpirySummary {
  expired: number;
  expiringSoon: number;
  active: number;
  total: number;
}

export interface SubscriptionRepository {
  /** Registra un pago: extiende el vencimiento del cliente y guarda el historial. */
  recordPayment(input: RecordPaymentInput): Promise<Profile>;
  /** Resumen de vencimientos por negocio (para los indicadores del dashboard). */
  getExpirySummaryByBusiness(): Promise<Record<string, BusinessExpirySummary>>;
  /** Historial de pagos de un cliente (más reciente primero). */
  listPayments(memberId: string): Promise<SubscriptionPayment[]>;
}

export interface Repositories {
  businesses: BusinessRepository;
  users: UserRepository;
  academy: AcademyRepository;
  duplication: DuplicationRepository;
  audiobooks: AudiobookRepository;
  prospects: ProspectRepository;
  interactions: InteractionRepository;
  learnings: LearningRepository;
  activity: ActivityRepository;
  usage: UsageRepository;
  subscriptions: SubscriptionRepository;
}
