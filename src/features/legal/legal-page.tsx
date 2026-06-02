import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { APP } from "@/lib/constants";

export interface LegalSection {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
}

/** Página legal de pantalla completa, pública y legible (apta para 50+). */
export function LegalPage({
  title,
  updated,
  intro,
  sections,
}: {
  title: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
}) {
  return (
    <main className="min-h-dvh bg-background">
      <div className="mx-auto max-w-3xl px-5 py-10">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-base text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-5" />
          Volver
        </Link>

        <div className="mt-6">
          <div className="flex size-12 items-center justify-center rounded-[var(--radius-md)] bg-primary font-display text-lg font-bold text-primary-foreground">
            NX
          </div>
          <h1 className="mt-4 font-display text-3xl font-bold tracking-tight">{title}</h1>
          <p className="mt-2 text-muted-foreground">
            {APP.fullName} · Actualizado: {updated}
          </p>
        </div>

        <div className="mt-6 flex items-start gap-3 rounded-[var(--radius-lg)] border border-gold-200 bg-gold-50 p-4 text-gold-900">
          <ShieldCheck className="mt-0.5 size-5 shrink-0" />
          <p className="leading-relaxed">
            Documento informativo en versión preliminar. Será revisado por un abogado antes de
            su versión definitiva. Si tienes dudas, escríbenos.
          </p>
        </div>

        <p className="mt-6 text-lg leading-relaxed">{intro}</p>

        <div className="mt-8 space-y-8">
          {sections.map((section) => (
            <section key={section.heading}>
              <h2 className="font-display text-xl font-semibold">{section.heading}</h2>
              {section.paragraphs?.map((paragraph) => (
                <p key={paragraph} className="mt-2 leading-relaxed text-muted-foreground">
                  {paragraph}
                </p>
              ))}
              {section.bullets && (
                <ul className="mt-3 list-disc space-y-2 pl-6 leading-relaxed text-muted-foreground">
                  {section.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap gap-4 border-t border-border pt-6 text-base">
          <Link href="/terminos" className="text-brand-700 hover:underline">
            Términos y Condiciones
          </Link>
          <Link href="/privacidad" className="text-brand-700 hover:underline">
            Política de Privacidad
          </Link>
        </div>
      </div>
    </main>
  );
}
