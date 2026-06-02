import type {
  ActivityEvent,
  ActivityKind,
  ActivityStats,
  Business,
  BusinessContent,
  BusinessContentType,
  Course,
  CourseLevel,
  CourseWithContent,
  Learning,
  Lesson,
  MessageTemplate,
  Playbook,
  PlaybookType,
  Post,
  PostType,
  Profile,
  Prospect,
  ProspectInteraction,
  ProspectInterest,
  ProspectStage,
  InteractionRole,
  Resource,
  Script,
  ScriptCategory,
} from "./types";

export interface NewPostInput {
  businessId?: string | null;
  type: PostType;
  title: string;
  body: string;
  authorId: string;
  eventDate?: string | null;
  eventLocation?: string | null;
  pinned?: boolean;
}

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
  listContent(businessId: string): Promise<BusinessContent[]>;
  create(input: NewBusinessInput): Promise<Business>;
  updateDomain(id: string, hostname: string | null): Promise<void>;
  createContent(input: NewBusinessContentInput): Promise<BusinessContent>;
}

export interface UserRepository {
  getById(id: string): Promise<Profile | null>;
  list(filter?: { businessId?: string | null }): Promise<Profile[]>;
  getTeam(leaderId: string): Promise<Profile[]>;
}

export interface FeedRepository {
  list(filter?: { type?: PostType; businessId?: string | null }): Promise<Post[]>;
  getById(id: string): Promise<Post | null>;
  create(input: NewPostInput): Promise<Post>;
  toggleReaction(id: string, delta: 1 | -1): Promise<number>;
}

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
}

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
  }): Promise<MessageTemplate[]>;
  listResources(filter?: {
    category?: string;
    businessId?: string | null;
  }): Promise<Resource[]>;
  listResourceCategories(): Promise<string[]>;
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

export interface Repositories {
  businesses: BusinessRepository;
  users: UserRepository;
  feed: FeedRepository;
  academy: AcademyRepository;
  duplication: DuplicationRepository;
  prospects: ProspectRepository;
  interactions: InteractionRepository;
  learnings: LearningRepository;
  activity: ActivityRepository;
}
