import type { Metadata } from "next";
import { getRepositories } from "@/data";
import type { CourseWithContent } from "@/data/types";
import { requireSession } from "@/lib/session";
import { getEffectiveBusiness } from "@/lib/active-business";
import { AcademiaScreen, type CourseItem } from "@/features/academia/academia-screen";
import type { Tone } from "@/components/netscale/ui";

export const metadata: Metadata = { title: "Academia" };

// Alterna el color de las tarjetas para que la lista no se vea monótona.
const TONES: Tone[] = ["orange", "blue"];

export default async function AcademiaPage() {
  const user = await requireSession();
  const { businessId } = await getEffectiveBusiness(user);
  const repos = getRepositories();
  const courses = await repos.academy.listCourses({ businessId });
  const completed = new Set(await repos.academy.getCompletedLessonIds(user.id));
  const contents = (
    await Promise.all(courses.map((c) => repos.academy.getCourseBySlug(c.slug)))
  ).filter((c): c is CourseWithContent => c !== null);

  const items: CourseItem[] = contents.map((c, i) => {
    const lessons = c.modules.flatMap((m) => m.lessons);
    return {
      slug: c.slug,
      title: c.title,
      icon: "book",
      tone: TONES[i % TONES.length],
      progress: {
        completed: lessons.filter((l) => completed.has(l.id)).length,
        total: lessons.length,
      },
    };
  });

  return <AcademiaScreen courses={items} />;
}
