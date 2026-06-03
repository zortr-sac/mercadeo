"use client";

import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Download,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Markdown } from "@/lib/markdown";
import {
  type CourseWithContent,
  type Lesson,
} from "@/data/types";
import { ROUTES } from "@/lib/constants";
import { useProgressStore } from "@/store/progress-store";
import { cn } from "@/lib/utils";
import { isFileVideoUrl } from "@/lib/media";
import { logLessonCompletedAction } from "@/features/constancia/actions";

/** Vista de una lección: contenido + marcar completada + navegación. */
export function LessonView({
  course,
  lesson,
}: {
  course: CourseWithContent;
  lesson: Lesson;
}) {
  const isCompleted = useProgressStore((s) => Boolean(s.completed[lesson.id]));
  const toggle = useProgressStore((s) => s.toggle);

  // Secuencia plana de lecciones para anterior/siguiente.
  const sequence = useMemo(
    () => course.modules.flatMap((m) => m.lessons),
    [course],
  );
  const idx = sequence.findIndex((l) => l.id === lesson.id);
  const prev = idx > 0 ? sequence[idx - 1] : null;
  const next = idx < sequence.length - 1 ? sequence[idx + 1] : null;
  const lessonHref = (slug: string) =>
    `${ROUTES.academia}/${course.slug}/${slug}`;

  return (
    <div className="space-y-6">
      <Link
        href={`${ROUTES.academia}/${course.slug}`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        {course.title}
      </Link>

      <h1 className="font-display text-2xl font-bold">{lesson.title}</h1>

      {lesson.contentType === "video" && lesson.videoUrl && (
        <div className="aspect-video overflow-hidden rounded-[var(--radius-lg)] border border-border bg-black">
          {isFileVideoUrl(lesson.videoUrl) ? (
            <video
              src={lesson.videoUrl}
              title={lesson.title}
              className="size-full"
              controls
              preload="metadata"
              playsInline
            />
          ) : (
            <iframe
              src={lesson.videoUrl}
              title={lesson.title}
              className="size-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          )}
        </div>
      )}

      {lesson.contentType === "article" && lesson.content && (
        <article className="rounded-[var(--radius-lg)] border border-border bg-card p-5">
          <Markdown content={lesson.content} />
        </article>
      )}

      {lesson.contentType === "pdf" && (
        <a
          href={lesson.resourceUrl ?? "#"}
          className="flex items-center gap-3 rounded-[var(--radius-lg)] border border-border bg-card p-4 transition-colors hover:bg-muted"
        >
          <FileText className="size-8 text-brand-600" />
          <div className="flex-1">
            <p className="text-sm font-medium">Material en PDF</p>
            <p className="text-xs text-muted-foreground">
              Toca para abrir o descargar
            </p>
          </div>
          <Download className="size-5 text-muted-foreground" />
        </a>
      )}

      <Button
        onClick={() => {
          const wasCompleted = isCompleted;
          toggle(lesson.id);
          if (!wasCompleted) void logLessonCompletedAction();
        }}
        variant={isCompleted ? "secondary" : "default"}
        className="w-full"
      >
        <CheckCircle2
          className={cn("size-4", isCompleted && "text-green-600")}
        />
        {isCompleted ? "Completada" : "Marcar como completada"}
      </Button>

      <div className="flex items-center justify-between gap-3 border-t border-border pt-4">
        {prev ? (
          <Link href={lessonHref(prev.slug)} className="flex-1">
            <Button variant="outline" className="w-full justify-start">
              <ArrowLeft className="size-4" />
              <span className="truncate">Anterior</span>
            </Button>
          </Link>
        ) : (
          <div className="flex-1" />
        )}
        {next ? (
          <Link href={lessonHref(next.slug)} className="flex-1">
            <Button className="w-full justify-end">
              <span className="truncate">Siguiente</span>
              <ArrowRight className="size-4" />
            </Button>
          </Link>
        ) : (
          <div className="flex-1" />
        )}
      </div>
    </div>
  );
}
