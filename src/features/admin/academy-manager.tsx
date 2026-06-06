"use client";

import Link from "next/link";
import { BookOpen, Clock, Pencil, Plus, Settings2 } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { COURSE_LEVEL_LABELS, type Course } from "@/data/types";
import { academyBasePath } from "@/lib/constants";
import { minutesLabel } from "@/lib/format";
import { LEVEL_BADGE } from "@/features/academy/level-meta";
import { ManagerCard, ManagerHeader, ManagerRow } from "./admin-ui";
import { CourseForm } from "./course-form";

/** Gestión de los cursos de un negocio: crear, editar y administrar sus lecciones. */
export function AcademyManager({
  businessId,
  courses,
}: {
  businessId: string;
  courses: Course[];
}) {
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Course | null>(null);

  return (
    <div className="space-y-6">
      <ManagerCard>
        <ManagerHeader
          icon={BookOpen}
          title="Cursos de este negocio"
          description="Crea cursos y sube sus lecciones en video."
          action={
            <Button onClick={() => setCreating(true)}>
              <Plus className="size-5" aria-hidden />
              Nuevo curso
            </Button>
          }
        />

        {courses.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="Sin cursos todavía"
            description="Crea el primer curso de este negocio para que sus miembros aprendan."
            action={
              <Button onClick={() => setCreating(true)}>
                <Plus className="size-5" aria-hidden />
                Crear curso
              </Button>
            }
          />
        ) : (
          <div className="space-y-3">
            {courses.map((course) => (
              <ManagerRow key={course.id}>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-display text-lg font-semibold leading-tight">
                      {course.title}
                    </h3>
                    <Badge variant={LEVEL_BADGE[course.level]}>
                      {COURSE_LEVEL_LABELS[course.level]}
                    </Badge>
                    <Badge variant={course.isPublished ? "success" : "muted"}>
                      {course.isPublished ? "Publicado" : "Borrador"}
                    </Badge>
                  </div>
                  <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="size-3.5" aria-hidden />
                      {minutesLabel(course.estimatedMinutes)}
                    </span>
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Link href={`${academyBasePath(businessId)}/${course.id}`}>
                    <Button variant="secondary" size="sm">
                      <Settings2 className="size-4" aria-hidden />
                      Lecciones
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditing(course)}
                    aria-label={`Editar ${course.title}`}
                  >
                    <Pencil className="size-4" aria-hidden />
                    Editar
                  </Button>
                </div>
              </ManagerRow>
            ))}
          </div>
        )}
      </ManagerCard>

      {creating && (
        <CourseForm businessId={businessId} onClose={() => setCreating(false)} />
      )}
      {editing && (
        <CourseForm
          businessId={businessId}
          course={editing}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}
