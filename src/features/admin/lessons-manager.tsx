"use client";

import Link from "next/link";
import {
  ArrowLeft,
  FileText,
  ListVideo,
  Pencil,
  PlayCircle,
  Plus,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import {
  COURSE_LEVEL_LABELS,
  LESSON_TYPE_LABELS,
  type CourseWithContent,
  type Lesson,
  type LessonType,
} from "@/data/types";
import { adminBusinessPath } from "@/lib/constants";
import { minutesLabel } from "@/lib/format";
import { LEVEL_BADGE } from "@/features/academy/level-meta";
import { ManagerCard, ManagerHeader } from "./admin-ui";
import { LessonForm } from "./lesson-form";

const TYPE_ICON: Record<LessonType, typeof PlayCircle> = {
  video: PlayCircle,
  article: FileText,
  pdf: FileText,
  quiz: FileText,
};

/** Gestión de las lecciones de un curso (crear / editar / eliminar). */
export function LessonsManager({
  businessId,
  course,
}: {
  businessId: string;
  course: CourseWithContent;
}) {
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Lesson | null>(null);

  const lessons = course.modules.flatMap((m) => m.lessons);

  return (
    <ManagerCard>
      <Link
        href={adminBusinessPath(businessId, "academia")}
        className="inline-flex items-center gap-1.5 text-base font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Volver a Academia
      </Link>

      <ManagerHeader
        icon={ListVideo}
        title={course.title}
        description="Agrega lecciones en video, texto o PDF. El orden de la lista es el orden del curso."
        action={
          <Button onClick={() => setCreating(true)}>
            <Plus className="size-5" aria-hidden />
            Nueva lección
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={LEVEL_BADGE[course.level]}>
          {COURSE_LEVEL_LABELS[course.level]}
        </Badge>
        <Badge variant={course.isPublished ? "success" : "muted"}>
          {course.isPublished ? "Publicado" : "Borrador"}
        </Badge>
        <span className="text-base text-muted-foreground">
          {lessons.length} lección(es)
        </span>
      </div>

      {lessons.length === 0 ? (
        <EmptyState
          icon={ListVideo}
          title="Este curso no tiene lecciones"
          description="Agrega la primera lección para que el curso esté completo."
          action={
            <Button onClick={() => setCreating(true)}>
              <Plus className="size-5" aria-hidden />
              Agregar lección
            </Button>
          }
        />
      ) : (
        <ol className="overflow-hidden rounded-[var(--radius-md)] border border-border">
          {lessons.map((lesson, index) => {
            const Icon = TYPE_ICON[lesson.contentType];
            return (
              <li
                key={lesson.id}
                className="flex items-center gap-3 border-b border-border bg-background px-4 py-3 last:border-0"
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold text-muted-foreground">
                  {index + 1}
                </span>
                <Icon
                  className="size-5 shrink-0 text-brand-600"
                  aria-hidden
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-base font-medium">
                    {lesson.title}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {LESSON_TYPE_LABELS[lesson.contentType]}
                    {lesson.durationMinutes
                      ? ` · ${minutesLabel(lesson.durationMinutes)}`
                      : ""}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditing(lesson)}
                  aria-label={`Editar ${lesson.title}`}
                >
                  <Pencil className="size-4" aria-hidden />
                  Editar
                </Button>
              </li>
            );
          })}
        </ol>
      )}

      {creating && (
        <LessonForm
          businessId={businessId}
          courseId={course.id}
          onClose={() => setCreating(false)}
        />
      )}
      {editing && (
        <LessonForm
          businessId={businessId}
          courseId={course.id}
          lesson={editing}
          onClose={() => setEditing(null)}
        />
      )}
    </ManagerCard>
  );
}
