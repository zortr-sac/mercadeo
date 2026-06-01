"use client";

import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  Clock,
  PlayCircle,
} from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  COURSE_LEVEL_LABELS,
  LESSON_TYPE_LABELS,
  type CourseWithContent,
} from "@/data/types";
import { ROUTES } from "@/lib/constants";
import { minutesLabel } from "@/lib/format";
import { useProgressStore } from "@/store/progress-store";
import { cn } from "@/lib/utils";
import { LEVEL_BADGE } from "./level-meta";

/** Detalle de curso: módulos, lecciones y progreso. */
export function CourseDetail({ course }: { course: CourseWithContent }) {
  const completed = useProgressStore((s) => s.completed);

  const lessonIds = useMemo(
    () => course.modules.flatMap((m) => m.lessons.map((l) => l.id)),
    [course],
  );
  const done = lessonIds.filter((id) => completed[id]).length;
  const pct = lessonIds.length ? Math.round((done / lessonIds.length) * 100) : 0;

  return (
    <div className="space-y-6">
      <Link
        href={ROUTES.academia}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Volver a Academia
      </Link>

      <div className="overflow-hidden rounded-[var(--radius-lg)] gradient-brand p-6 text-white">
        <div className="flex items-center gap-2">
          <Badge variant={LEVEL_BADGE[course.level]}>
            {COURSE_LEVEL_LABELS[course.level]}
          </Badge>
          <span className="flex items-center gap-1 text-sm text-white/80">
            <Clock className="size-4" />
            {minutesLabel(course.estimatedMinutes)}
          </span>
        </div>
        <h1 className="mt-3 font-display text-2xl font-bold">{course.title}</h1>
        <p className="mt-1.5 max-w-prose text-white/85">{course.description}</p>
      </div>

      <div className="rounded-[var(--radius-lg)] border border-border bg-card p-4">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium">Tu progreso</span>
          <span className="text-muted-foreground">
            {done} de {lessonIds.length} lecciones
          </span>
        </div>
        <Progress value={pct} />
      </div>

      <div className="space-y-5">
        {course.modules.map((mod, mIdx) => (
          <div key={mod.id}>
            <h2 className="mb-2 flex items-center gap-2 font-display text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              <span className="flex size-6 items-center justify-center rounded-full bg-muted text-xs">
                {mIdx + 1}
              </span>
              {mod.title}
            </h2>
            <div className="overflow-hidden rounded-[var(--radius-lg)] border border-border">
              {mod.lessons.map((lesson) => {
                const isDone = Boolean(completed[lesson.id]);
                return (
                  <Link
                    key={lesson.id}
                    href={`${ROUTES.academia}/${course.slug}/${lesson.slug}`}
                    className="flex items-center gap-3 border-b border-border bg-card px-4 py-3 transition-colors last:border-0 hover:bg-muted"
                  >
                    {isDone ? (
                      <CheckCircle2 className="size-5 shrink-0 text-green-600" />
                    ) : (
                      <Circle className="size-5 shrink-0 text-muted-foreground" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p
                        className={cn(
                          "truncate text-sm font-medium",
                          isDone && "text-muted-foreground",
                        )}
                      >
                        {lesson.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {LESSON_TYPE_LABELS[lesson.contentType]} ·{" "}
                        {minutesLabel(lesson.durationMinutes)}
                      </p>
                    </div>
                    <PlayCircle className="size-5 shrink-0 text-brand-500" />
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
