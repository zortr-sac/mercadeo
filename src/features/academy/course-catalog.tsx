"use client";

import { useMemo, useState } from "react";
import { GraduationCap } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Segmented } from "@/components/ui/segmented";
import {
  COURSE_LEVEL_LABELS,
  type Course,
  type CourseLevel,
} from "@/data/types";
import { CourseCard } from "./course-card";

type Filter = "all" | CourseLevel;

/** Catálogo de cursos con filtro por nivel. */
export function CourseCatalog({ courses }: { courses: Course[] }) {
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = useMemo(
    () =>
      filter === "all" ? courses : courses.filter((c) => c.level === filter),
    [courses, filter],
  );

  const options = [
    { value: "all" as Filter, label: "Todos" },
    { value: "beginner" as Filter, label: COURSE_LEVEL_LABELS.beginner },
    { value: "intermediate" as Filter, label: COURSE_LEVEL_LABELS.intermediate },
    { value: "advanced" as Filter, label: COURSE_LEVEL_LABELS.advanced },
  ];

  return (
    <div className="space-y-5">
      <Segmented options={options} value={filter} onChange={setFilter} />
      {filtered.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title="Sin cursos"
          description="Pronto habrá cursos de este nivel."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
}
