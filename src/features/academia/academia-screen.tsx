"use client";
// Pantalla 4 — Academia: lista de cursos del negocio. Cada tarjeta abre el curso
// y sus lecciones. Lo que el admin crea es exactamente lo que el miembro ve.
import { useRouter } from "next/navigation";
import { TopBarMain, Card, IconCircle, ProgressBar } from "@/components/netscale/ui";
import type { Tone } from "@/components/netscale/ui";
import { Icon, type IconName } from "@/components/netscale/icons";
import { ROUTES } from "@/lib/constants";

export interface CourseItem {
  slug: string;
  title: string;
  icon: IconName;
  tone: Tone;
  progress: { completed: number; total: number };
}

export function AcademiaScreen({ courses }: { courses: CourseItem[] }) {
  const router = useRouter();
  return (
    <>
      <TopBarMain title="Academia" />
      <div className="ns-scroll ns-pad" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <p style={{ fontSize: 18, color: "var(--text-2)", marginTop: -4 }}>Aprende paso a paso, a tu ritmo.</p>
        {courses.length === 0 ? (
          <Card pad={20} style={{ textAlign: "center" }}>
            <h3 style={{ fontSize: 18 }}>Aún no hay cursos</h3>
            <p style={{ fontSize: 16, color: "var(--text-2)", marginTop: 6 }}>
              Muy pronto tu equipo subirá el contenido de formación.
            </p>
          </Card>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {courses.map((c) => (
              <Card key={c.slug} onClick={() => router.push(`${ROUTES.academia}/${c.slug}`)} pad={16}
                style={{ display: "flex", alignItems: "center", gap: 14, minHeight: 96 }}>
                <IconCircle icon={c.icon} tone={c.tone} size={56} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ fontSize: 18, lineHeight: 1.25 }}>{c.title}</h3>
                  {c.progress.total > 0 ? (
                    <div style={{ marginTop: 10 }}>
                      <ProgressBar value={c.progress.completed} total={c.progress.total} height={8} />
                      <span style={{ fontSize: 15, color: "var(--text-2)", marginTop: 6, display: "block" }}>
                        {c.progress.completed} de {c.progress.total} videos
                      </span>
                    </div>
                  ) : (
                    <span style={{ fontSize: 15, color: "var(--text-2)", marginTop: 6, display: "block" }}>
                      Próximamente
                    </span>
                  )}
                </div>
                <Icon name="chevR" size={26} color="var(--blue)" strokeWidth={2.4} />
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
