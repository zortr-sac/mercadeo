/**
 * Dominio de HGW — tipos de entidades y enumeraciones.
 * Fuente de verdad de tipos para toda la app. Alineado con el esquema Supabase (fase 2).
 */
import type { Role } from "@/lib/constants";

/* ============================ Usuarios ============================ */

export interface Profile {
  id: string;
  fullName: string;
  email: string;
  avatarUrl: string | null;
  phone: string | null;
  country: string | null;
  role: Role;
  /** Patrocinador (estructura MLN, self-ref). Null para la raíz. */
  sponsorId: string | null;
  /** Rango/insignia (placeholder para gamificación v2). */
  rank: string | null;
  isActive: boolean;
  joinedAt: string; // ISO
}

/* ============================ Feed ============================ */

export const POST_TYPES = {
  ANNOUNCEMENT: "announcement",
  MOTIVATION: "motivation",
  EVENT: "event",
  RECOGNITION: "recognition",
} as const;

export type PostType = (typeof POST_TYPES)[keyof typeof POST_TYPES];

export const POST_TYPE_LABELS: Record<PostType, string> = {
  announcement: "Anuncio oficial",
  motivation: "Motivación",
  event: "Evento",
  recognition: "Reconocimiento",
};

export interface Post {
  id: string;
  type: PostType;
  title: string;
  body: string;
  authorId: string;
  coverUrl: string | null;
  /** Fijado en la parte superior del feed. */
  pinned: boolean;
  /** Fecha/hora del evento (solo type === "event"). ISO. */
  eventDate: string | null;
  /** Ubicación o enlace del evento. */
  eventLocation: string | null;
  reactions: number;
  createdAt: string; // ISO
}

/* ============================ Academia ============================ */

export const COURSE_LEVELS = {
  BEGINNER: "beginner",
  INTERMEDIATE: "intermediate",
  ADVANCED: "advanced",
} as const;

export type CourseLevel = (typeof COURSE_LEVELS)[keyof typeof COURSE_LEVELS];

export const COURSE_LEVEL_LABELS: Record<CourseLevel, string> = {
  beginner: "Principiante",
  intermediate: "Intermedio",
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
  article: "Artículo",
  pdf: "PDF",
  quiz: "Evaluación",
};

export interface Course {
  id: string;
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
  /** URL de video (embed) cuando contentType === "video". */
  videoUrl: string | null;
  /** Contenido en markdown para artículos. */
  content: string | null;
  /** URL del recurso PDF. */
  resourceUrl: string | null;
  durationMinutes: number;
  sortOrder: number;
}

/** Curso enriquecido con sus módulos y lecciones (para vistas de detalle). */
export interface CourseWithContent extends Course {
  modules: (CourseModule & { lessons: Lesson[] })[];
  lessonCount: number;
}

export interface LessonProgress {
  lessonId: string;
  completed: boolean;
  completedAt: string | null;
}

/* ============================ Duplicación ============================ */

export const PLAYBOOK_TYPES = {
  BUSINESS: "business",
  PRODUCT: "product",
} as const;

export type PlaybookType = (typeof PLAYBOOK_TYPES)[keyof typeof PLAYBOOK_TYPES];

export const PLAYBOOK_TYPE_LABELS: Record<PlaybookType, string> = {
  business: "Presentación de negocio",
  product: "Presentación de producto",
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
  slug: string;
  title: string;
  type: PlaybookType;
  description: string;
  /** Nombre de ícono lucide-react. */
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
} as const;

export type ScriptCategory =
  (typeof SCRIPT_CATEGORIES)[keyof typeof SCRIPT_CATEGORIES];

export const SCRIPT_CATEGORY_LABELS: Record<ScriptCategory, string> = {
  prospecting: "Prospección",
  invitation: "Invitación",
  presentation: "Presentación",
  closing: "Cierre",
  objection: "Manejo de objeciones",
  followup: "Seguimiento",
};

export interface Script {
  id: string;
  title: string;
  category: ScriptCategory;
  /** Situación de uso. */
  scenario: string;
  /** Cuerpo del guion (markdown, con marcadores tipo [nombre]). */
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
  title: string;
  type: ResourceType;
  description: string;
  url: string;
  category: string;
  sizeLabel: string | null;
}

/* ============================ Prospectos (CRM) ============================ */

export const PROSPECT_STAGES = {
  NEW: "new",
  CONTACTED: "contacted",
  PRESENTED: "presented",
  FOLLOWUP: "followup",
  CLOSED: "closed",
  LOST: "lost",
} as const;

export type ProspectStage =
  (typeof PROSPECT_STAGES)[keyof typeof PROSPECT_STAGES];

export const PROSPECT_STAGE_LABELS: Record<ProspectStage, string> = {
  new: "Nuevo",
  contacted: "Contactado",
  presented: "Presentado",
  followup: "Seguimiento",
  closed: "Cerrado",
  lost: "Perdido",
};

/** Orden de las columnas del kanban. */
export const PROSPECT_STAGE_ORDER: ProspectStage[] = [
  "new",
  "contacted",
  "presented",
  "followup",
  "closed",
  "lost",
];

export const PROSPECT_INTERESTS = {
  BUSINESS: "business",
  PRODUCT: "product",
  BOTH: "both",
} as const;

export type ProspectInterest =
  (typeof PROSPECT_INTERESTS)[keyof typeof PROSPECT_INTERESTS];

export const PROSPECT_INTEREST_LABELS: Record<ProspectInterest, string> = {
  business: "Negocio",
  product: "Producto",
  both: "Ambos",
};

export interface Prospect {
  id: string;
  ownerId: string;
  name: string;
  phone: string | null;
  email: string | null;
  stage: ProspectStage;
  interest: ProspectInterest;
  notes: string;
  /** Próxima acción de seguimiento (ISO) o null. */
  nextActionAt: string | null;
  createdAt: string; // ISO
}
