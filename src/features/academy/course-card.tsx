import { BookOpen, Clock } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  COURSE_LEVEL_LABELS,
  type Course,
} from "@/data/types";
import { ROUTES } from "@/lib/constants";
import { minutesLabel } from "@/lib/format";
import { LEVEL_BADGE } from "./level-meta";

/** Tarjeta de curso para el catálogo. */
export function CourseCard({ course }: { course: Course }) {
  return (
    <Link
      href={`${ROUTES.academia}/${course.slug}`}
      className="group block focus-visible:outline-none"
    >
      <Card className="h-full overflow-hidden transition-all group-hover:-translate-y-0.5 group-hover:shadow-md group-focus-visible:ring-2 group-focus-visible:ring-ring">
        <div className="flex h-28 items-center justify-center gradient-brand">
          <BookOpen className="size-10 text-white/90" />
        </div>
        <div className="space-y-2 p-4">
          <div className="flex items-center justify-between gap-2">
            <Badge variant={LEVEL_BADGE[course.level]}>
              {COURSE_LEVEL_LABELS[course.level]}
            </Badge>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="size-3.5" />
              {minutesLabel(course.estimatedMinutes)}
            </span>
          </div>
          <h3 className="font-display text-base font-semibold leading-snug">
            {course.title}
          </h3>
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {course.description}
          </p>
        </div>
      </Card>
    </Link>
  );
}
