"use client";

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import {
  COURSE_LEVEL_LABELS,
  type Course,
  type CourseLevel,
} from "@/data/types";
import {
  createCourseAction,
  removeCourseAction,
  updateCourseAction,
} from "./academy-actions";

/** Modal para crear o editar un curso del negocio. */
export function CourseForm({
  businessId,
  course,
  onClose,
}: {
  businessId: string;
  course?: Course;
  onClose: () => void;
}) {
  const router = useRouter();
  const isEdit = Boolean(course);
  const [pending, startTransition] = useTransition();

  const [title, setTitle] = useState(course?.title ?? "");
  const [description, setDescription] = useState(course?.description ?? "");
  const [level, setLevel] = useState<CourseLevel>(course?.level ?? "beginner");
  const [estimatedMinutes, setEstimatedMinutes] = useState(
    String(course?.estimatedMinutes ?? 30),
  );
  const [isPublished, setIsPublished] = useState(course?.isPublished ?? false);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (title.trim().length < 3) {
      toast.error("Escribe un título para el curso.");
      return;
    }
    const input = {
      title: title.trim(),
      description: description.trim(),
      level,
      // La Academia ya no se agrupa por bloques: el curso es la unidad.
      category: course?.category ?? "general",
      estimatedMinutes: Math.max(0, Number(estimatedMinutes) || 0),
      isPublished,
    };
    startTransition(async () => {
      try {
        if (isEdit && course) {
          await updateCourseAction(businessId, course.id, input);
          toast.success("Curso actualizado.");
        } else {
          await createCourseAction(businessId, input);
          toast.success("Curso creado.");
        }
        onClose();
        router.refresh();
      } catch {
        toast.error("No se pudo guardar el curso.");
      }
    });
  }

  function handleDelete() {
    if (!course) return;
    if (
      !window.confirm(
        `¿Eliminar el curso "${course.title}"? Se borrarán también sus lecciones. Esta acción no se puede deshacer.`,
      )
    ) {
      return;
    }
    startTransition(async () => {
      try {
        await removeCourseAction(businessId, course.id);
        toast.success("Curso eliminado.");
        onClose();
        router.refresh();
      } catch {
        toast.error("No se pudo eliminar el curso.");
      }
    });
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={isEdit ? "Editar curso" : "Nuevo curso"}
      description="Define el título, el nivel y la duración estimada."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Título del curso" htmlFor="c-title">
          <Input
            id="c-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Ej. Primeros pasos con el producto"
            required
          />
        </Field>
        <Field label="Descripción" htmlFor="c-desc">
          <Textarea
            id="c-desc"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={3}
            placeholder="¿Qué aprenderá la persona en este curso?"
          />
        </Field>
        <Field label="Nivel" htmlFor="c-level">
          <Select
            id="c-level"
            value={level}
            onChange={(event) => setLevel(event.target.value as CourseLevel)}
          >
            {Object.entries(COURSE_LEVEL_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </Field>
        <Field
          label="Duración estimada (minutos)"
          htmlFor="c-minutes"
          hint="Tiempo aproximado para completar el curso."
        >
          <Input
            id="c-minutes"
            type="number"
            min={0}
            inputMode="numeric"
            value={estimatedMinutes}
            onChange={(event) => setEstimatedMinutes(event.target.value)}
          />
        </Field>
        <label className="flex cursor-pointer items-center gap-3 rounded-[var(--radius-md)] border border-border p-4">
          <input
            type="checkbox"
            checked={isPublished}
            onChange={(event) => setIsPublished(event.target.checked)}
            className="size-5 accent-brand-600"
          />
          <span className="text-base">
            Publicado{" "}
            <span className="text-muted-foreground">
              (visible para los clientes del negocio)
            </span>
          </span>
        </label>

        <div className="flex items-center justify-between gap-2 pt-2">
          {isEdit ? (
            <Button
              type="button"
              variant="ghost"
              onClick={handleDelete}
              disabled={pending}
              className="text-destructive"
            >
              <Trash2 className="size-5" aria-hidden />
              Eliminar
            </Button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={pending}
            >
              Cancelar
            </Button>
            <Button type="submit" loading={pending}>
              {isEdit ? "Guardar" : "Crear curso"}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
