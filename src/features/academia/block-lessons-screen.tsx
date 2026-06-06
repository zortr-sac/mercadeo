"use client";
// Pantalla 5 — Lecciones de un curso (lista + progreso). Con botón para descargar
// el curso (videos subidos) y verlo sin internet.
import { useRouter } from "next/navigation";
import { TopBarSub, Card, ProgressBar } from "@/components/netscale/ui";
import { Icon } from "@/components/netscale/icons";
import { ROUTES } from "@/lib/constants";
import type { CourseWithContent } from "@/data/types";
import { useOfflineStore } from "@/store/offline-store";
import { downloadCourse, isDownloadableMediaUrl, removeCourse } from "@/lib/offline/download";
import { DownloadButton } from "@/features/offline/download-button";
import type { LessonItem } from "./build-lessons";

export function BlockLessonsScreen({
  title,
  summary,
  items,
  course,
}: {
  title: string;
  summary: { completed: number; total: number };
  items: LessonItem[];
  course?: CourseWithContent;
}) {
  const router = useRouter();
  const downloadedCourses = useOfflineStore((s) => s.downloadedCourses);
  const markCourse = useOfflineStore((s) => s.markCourse);
  const downloadable =
    !!course &&
    course.modules.flatMap((m) => m.lessons).some((l) => isDownloadableMediaUrl(l.videoUrl));

  return (
    <>
      <TopBarSub title={title} onBack={() => router.back()} />
      <div className="ns-scroll ns-pad" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Card pad={16}>
          <span style={{ fontSize: 18, fontWeight: 600 }}>Has visto {summary.completed} de {summary.total} videos</span>
          <div style={{ marginTop: 12 }}><ProgressBar value={summary.completed} total={summary.total || 1} /></div>
        </Card>

        {course && downloadable && (
          <DownloadButton
            itemKey={`course:${course.slug}`}
            downloaded={downloadedCourses.has(course.slug)}
            download={(onP) => downloadCourse(course, onP)}
            remove={() => removeCourse(course.slug)}
            onChange={(d) => markCourse(course.slug, d)}
          />
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {items.map((l) => {
            const isNext = l.state === "next", isDone = l.state === "done", isLock = l.state === "lock";
            return (
              <Card key={`${l.courseSlug}-${l.slug}`}
                onClick={isLock ? undefined : () => router.push(`${ROUTES.academia}/${l.courseSlug}/${l.slug}`)}
                dim={isLock} pad={14}
                style={{
                  display: "flex", alignItems: "center", gap: 14, minHeight: 80,
                  background: isNext ? "var(--blue-soft)" : "var(--surface)",
                  border: isNext ? "1.5px solid var(--blue-tint)" : "1px solid var(--border)",
                }}>
                <span style={{
                  width: 44, height: 44, borderRadius: 999, flexShrink: 0, display: "grid", placeItems: "center",
                  background: isDone ? "var(--green)" : isNext ? "var(--blue)" : "var(--locked-soft)",
                }}>
                  {isDone && <Icon name="check" size={24} color="#fff" strokeWidth={3} />}
                  {isNext && <Icon name="play" size={18} color="#fff" />}
                  {isLock && <Icon name="lock" size={22} color="var(--locked)" />}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{
                    fontSize: 18, lineHeight: 1.25, fontWeight: 600,
                    color: isNext ? "var(--blue-dark)" : isLock ? "var(--locked)" : "var(--text)",
                  }}>{l.title}</h3>
                  {isNext && <span style={{ fontSize: 14, fontWeight: 600, color: "var(--blue)" }}>Continuar aquí</span>}
                </div>
                <span style={{ fontSize: 16, color: isLock ? "var(--locked)" : "var(--text-2)", fontWeight: 600, flexShrink: 0 }}>
                  {isLock ? "Bloqueado" : `${l.dur} min`}
                </span>
              </Card>
            );
          })}
        </div>
      </div>
    </>
  );
}
