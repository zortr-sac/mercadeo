import type { Role } from "@/lib/constants";

/* ============================ Multiempresa ============================ */

export type BusinessStatus = "draft" | "active" | "suspended";

export interface Business {
  id: string;
  slug: string;
  name: string;
  legalName: string | null;
  logoUrl: string | null;
  primaryColor: string;
  accentColor: string;
  customDomain: string | null;
  registrationPath: string;
  subscriptionPricePen: number;
  status: BusinessStatus;
  adminEmail: string;
  memberCount: number;
  contentCount: number;
  createdAt: string;
}

export type BusinessContentType = "course" | "video" | "pdf" | "image" | "link";

export const BUSINESS_CONTENT_TYPE_LABELS: Record<BusinessContentType, string> = {
  course: "Curso",
  video: "Video",
  pdf: "PDF",
  image: "Imagen",
  link: "Enlace",
};

export interface BusinessContent {
  id: string;
  businessId: string;
  title: string;
  description: string;
  type: BusinessContentType;
  url: string;
  category: string;
  isPublished: boolean;
  createdAt: string;
}

/* ============================ Usuarios ============================ */

export interface Profile {
  id: string;
  businessId: string | null;
  fullName: string;
  email: string;
  avatarUrl: string | null;
  phone: string | null;
  country: string | null;
  role: Role;
  sponsorId: string | null;
  rank: string | null;
  isActive: boolean;
  joinedAt: string;
  /** Vencimiento de la suscripción mensual del cliente. null = sin suscripción (líderes/admin). */
  subscriptionExpiresAt: string | null;
  /** Última vez que se envió el push de recordatorio de vencimiento (anti-reenvío). */
  subscriptionReminderSentAt?: string | null;
}

/* ============================ Suscripciones ============================ */

/** Estado derivado de la suscripción (calculado desde subscriptionExpiresAt; no se almacena). */
export type SubscriptionState = "active" | "expiring_soon" | "expired" | "none";

export interface SubscriptionPayment {
  id: string;
  memberId: string;
  businessId: string | null;
  amountPen: number;
  paidAt: string;
  periodEnd: string;
  recordedBy: string | null;
  note: string | null;
  createdAt: string;
}

/* ============================ Academia ============================ */

export const COURSE_LEVELS = {
  BEGINNER: "beginner",
  INTERMEDIATE: "intermediate",
  ADVANCED: "advanced",
} as const;

export type CourseLevel = (typeof COURSE_LEVELS)[keyof typeof COURSE_LEVELS];

export const COURSE_LEVEL_LABELS: Record<CourseLevel, string> = {
  beginner: "Inicio",
  intermediate: "Práctica",
  advanced: "Avanzado",
};

export const LESSON_TYPES = {
  VIDEO: "video",
  ARTICLE: "article",
  PDF: "pdf",
  QUIZ: "quiz",
} as const;

export type LessonType = (typeof LESSON_TYPES)[keyof typeof LESSON_TYPES];

export const LESSON_TYPE_LABELS: Record<LessonType, string> = {
  video: "Video",
  article: "Texto",
  pdf: "PDF",
  quiz: "Evaluación",
};

export interface Course {
  id: string;
  businessId: string | null;
  slug: string;
  title: string;
  description: string;
  coverUrl: string | null;
  level: CourseLevel;
  category: string;
  estimatedMinutes: number;
  isPublished: boolean;
  sortOrder: number;
}

export interface CourseModule {
  id: string;
  courseId: string;
  title: string;
  sortOrder: number;
}

export interface Lesson {
  id: string;
  moduleId: string;
  courseId: string;
  slug: string;
  title: string;
  contentType: LessonType;
  videoUrl: string | null;
  content: string | null;
  resourceUrl: string | null;
  durationMinutes: number;
  sortOrder: number;
}

export interface CourseWithContent extends Course {
  modules: (CourseModule & { lessons: Lesson[] })[];
  lessonCount: number;
}

export interface LessonProgress {
  lessonId: string;
  completed: boolean;
  completedAt: string | null;
}

/* ============================ Sistema comercial ============================ */

export const PLAYBOOK_TYPES = {
  BUSINESS: "business",
  PRODUCT: "product",
} as const;

export type PlaybookType = (typeof PLAYBOOK_TYPES)[keyof typeof PLAYBOOK_TYPES];

export const PLAYBOOK_TYPE_LABELS: Record<PlaybookType, string> = {
  business: "Presentación del servicio",
  product: "Presentación del producto",
};

export interface PlaybookStep {
  id: string;
  sortOrder: number;
  title: string;
  description: string;
  tips: string[];
  durationMinutes: number | null;
}

export interface Playbook {
  id: string;
  businessId: string | null;
  slug: string;
  title: string;
  type: PlaybookType;
  description: string;
  icon: string;
  steps: PlaybookStep[];
}

export const SCRIPT_CATEGORIES = {
  PROSPECTING: "prospecting",
  INVITATION: "invitation",
  PRESENTATION: "presentation",
  CLOSING: "closing",
  OBJECTION: "objection",
  FOLLOWUP: "followup",
  REACTIVATION: "reactivation",
} as const;

export type ScriptCategory =
  (typeof SCRIPT_CATEGORIES)[keyof typeof SCRIPT_CATEGORIES];

export const SCRIPT_CATEGORY_LABELS: Record<ScriptCategory, string> = {
  prospecting: "Primer contacto",
  invitation: "Invitación",
  presentation: "Presentación",
  closing: "Cierre",
  objection: "Objeción",
  followup: "Seguimiento",
  reactivation: "Reactivación",
};

export interface Script {
  id: string;
  businessId: string | null;
  title: string;
  category: ScriptCategory;
  scenario: string;
  content: string;
  tags: string[];
}

export const RESOURCE_TYPES = {
  PDF: "pdf",
  VIDEO: "video",
  IMAGE: "image",
  SLIDES: "slides",
  LINK: "link",
} as const;

export type ResourceType = (typeof RESOURCE_TYPES)[keyof typeof RESOURCE_TYPES];

export const RESOURCE_TYPE_LABELS: Record<ResourceType, string> = {
  pdf: "PDF",
  video: "Video",
  image: "Imagen",
  slides: "Presentación",
  link: "Enlace",
};

export interface Resource {
  id: string;
  businessId: string | null;
  title: string;
  type: ResourceType;
  description: string;
  url: string;
  category: string;
  sizeLabel: string | null;
}

/* ============================ Audiolibros ============================ */

export interface Audiobook {
  id: string;
  businessId: string | null;
  slug: string;
  title: string;
  author: string;
  description: string;
  coverUrl: string | null;
  audioUrl: string | null;
  audioPath: string | null;
  category: string;
  durationSeconds: number;
  isPublished: boolean;
  sortOrder: number;
  createdAt: string;
}

/* ===================== Plantillas de presentación ===================== */

/** Imagen de una diapositiva, para visualizar la presentación dentro de la app. */
export interface PresentationSlide {
  url: string;
  path: string;
}

export interface PresentationTemplate {
  id: string;
  businessId: string | null;
  slug: string;
  title: string;
  description: string;
  coverUrl: string | null;
  fileUrl: string | null;
  filePath: string | null;
  fileName: string | null;
  fileBytes: number;
  /** Imágenes de cada diapositiva, en orden (para el visor). */
  slides: PresentationSlide[];
  isPublished: boolean;
  sortOrder: number;
  createdAt: string;
}

/* ===================== Anuncios de producto ===================== */

/** Anuncio que el admin sube: imagen + texto + categoría. El cliente copia/descarga/comparte. */
export interface AdTemplate {
  id: string;
  businessId: string | null;
  title: string;
  bodyText: string;
  imageUrl: string | null;
  imagePath: string | null;
  category: string;
  isPublished: boolean;
  sortOrder: number;
  createdAt: string;
}

/* ===================== Reacciones (corazón) ===================== */

/** Tipo de contenido sobre el que un usuario puede reaccionar. */
export type ContentReactionType = "ad" | "presentation" | "audiobook" | "course";

/* ============================ Prospectos (CRM simple) ============================ */

export const PROSPECT_STAGES = {
  NEW: "new",
  CONTACTED: "contacted",
  PRESENTED: "presented",
  FOLLOWUP: "followup",
  CUSTOMER: "customer",
  LOST: "lost",
} as const;

export type ProspectStage =
  (typeof PROSPECT_STAGES)[keyof typeof PROSPECT_STAGES];

export const PROSPECT_STAGE_LABELS: Record<ProspectStage, string> = {
  new: "Prospecto",
  contacted: "Contactado",
  presented: "Vio información",
  followup: "Seguimiento",
  customer: "Cliente",
  lost: "No por ahora",
};

export const PROSPECT_STAGE_ORDER: ProspectStage[] = [
  "new",
  "contacted",
  "presented",
  "followup",
  "customer",
  "lost",
];

export const PROSPECT_INTERESTS = {
  PRODUCT: "product",
  BUSINESS: "business",
  BOTH: "both",
} as const;

export type ProspectInterest =
  (typeof PROSPECT_INTERESTS)[keyof typeof PROSPECT_INTERESTS];

export const PROSPECT_INTEREST_LABELS: Record<ProspectInterest, string> = {
  product: "Producto",
  business: "Negocio",
  both: "Ambos",
};

export interface Prospect {
  id: string;
  ownerId: string;
  businessId: string | null;
  name: string;
  phone: string | null;
  email: string | null;
  stage: ProspectStage;
  interest: ProspectInterest;
  notes: string;
  nextActionAt: string | null;
  createdAt: string;
  /** Ficha sintetizada que la IA mantiene sobre el cliente (memoria). */
  aiProfile?: string | null;
}

/* ============================ Memoria de conversación ============================ */

/**
 * Quién originó la entrada del timeline:
 * - prospect: lo que dijo el cliente (texto o lectura de una captura).
 * - seller: lo que envió el vendedor.
 * - ai: una nota generada por IA.
 * - note: una nota manual del vendedor.
 */
export type InteractionRole = "prospect" | "seller" | "ai" | "note";

export const INTERACTION_ROLE_LABELS: Record<InteractionRole, string> = {
  prospect: "Cliente",
  seller: "Tú",
  ai: "IA",
  note: "Nota",
};

export interface ProspectInteraction {
  id: string;
  prospectId: string;
  ownerId: string;
  businessId: string | null;
  role: InteractionRole;
  content: string;
  source: string; // manual | screenshot | ai
  complianceStatus: string | null;
  createdAt: string;
}

/* ============================ Constancia y gamificación ============================ */

export interface Learning {
  id: string;
  userId: string;
  businessId: string | null;
  situation: string;
  reframe: string | null;
  createdAt: string;
}

/** Acciones que se premian. Se premia ACTIVIDAD, nunca resultados económicos. */
export type ActivityKind =
  | "lesson_completed"
  | "prospect_added"
  | "conversation_used"
  | "message_generated"
  | "learning_logged";

export const ACTIVITY_KIND_LABELS: Record<ActivityKind, string> = {
  lesson_completed: "Lección completada",
  prospect_added: "Prospecto agregado",
  conversation_used: "Conversación atendida",
  message_generated: "Mensaje preparado",
  learning_logged: "Aprendizaje registrado",
};

/** Puntos por actividad (solo esfuerzo/constancia, no dinero). */
export const ACTIVITY_POINTS: Record<ActivityKind, number> = {
  lesson_completed: 10,
  prospect_added: 5,
  conversation_used: 5,
  message_generated: 3,
  learning_logged: 8,
};

export interface ActivityEvent {
  id: string;
  userId: string;
  businessId: string | null;
  kind: ActivityKind;
  points: number;
  createdAt: string;
}

export interface ActivityStats {
  totalPoints: number;
  totalEvents: number;
  weekCount: number;
  streakDays: number;
  byKind: Record<ActivityKind, number>;
}

/* ============================ IA y cumplimiento ============================ */

export type MessageTone = "calm" | "warm" | "direct" | "reactivation";

export interface MessageTemplate {
  id: string;
  businessId: string | null;
  title: string;
  category: ScriptCategory;
  situation: string;
  baseText: string;
  defaultTone: MessageTone;
  complianceHint: string;
  /** Instrucciones del admin para la IA: cómo debe responder este mensaje. */
  systemPrompt: string;
}

export interface ComplianceIssue {
  code:
    | "income_promise"
    | "recruiting_commission"
    | "health_claim"
    | "pressure";
  label: string;
  severity: "review" | "block";
}

export interface ComplianceResult {
  status: "safe" | "needs_review" | "blocked";
  issues: ComplianceIssue[];
  suggestedText: string | null;
}
