/**
 * Contratos de la capa de datos (patrón Repository).
 * La UI consume SOLO estas interfaces vía `getRepositories()` (ver ./index.ts).
 * Cambiar de mock a Supabase = cambiar la implementación, sin tocar la UI.
 */
import type {
  Course,
  CourseLevel,
  CourseWithContent,
  Lesson,
  Playbook,
  PlaybookType,
  Post,
  PostType,
  Profile,
  Resource,
  Script,
  ScriptCategory,
} from "./types";

export interface NewPostInput {
  type: PostType;
  title: string;
  body: string;
  authorId: string;
  eventDate?: string | null;
  eventLocation?: string | null;
  pinned?: boolean;
}

export interface UserRepository {
  /** Usuarios disponibles para el login demo (mock). */
  listDemoUsers(): Promise<Profile[]>;
  getById(id: string): Promise<Profile | null>;
  list(): Promise<Profile[]>;
  /** Equipo (downline directo) de un líder. */
  getTeam(leaderId: string): Promise<Profile[]>;
}

export interface FeedRepository {
  list(filter?: { type?: PostType }): Promise<Post[]>;
  getById(id: string): Promise<Post | null>;
  create(input: NewPostInput): Promise<Post>;
  /** Suma o resta una reacción y devuelve el total actualizado. */
  toggleReaction(id: string, delta: 1 | -1): Promise<number>;
}

export interface AcademyRepository {
  listCourses(filter?: { level?: CourseLevel }): Promise<Course[]>;
  getCourseBySlug(slug: string): Promise<CourseWithContent | null>;
  getLesson(
    courseSlug: string,
    lessonSlug: string,
  ): Promise<{ course: CourseWithContent; lesson: Lesson } | null>;
}

export interface DuplicationRepository {
  listPlaybooks(filter?: { type?: PlaybookType }): Promise<Playbook[]>;
  getPlaybookBySlug(slug: string): Promise<Playbook | null>;
  listScripts(filter?: { category?: ScriptCategory }): Promise<Script[]>;
  listResources(filter?: { category?: string }): Promise<Resource[]>;
  listResourceCategories(): Promise<string[]>;
}

export interface Repositories {
  users: UserRepository;
  feed: FeedRepository;
  academy: AcademyRepository;
  duplication: DuplicationRepository;
}
