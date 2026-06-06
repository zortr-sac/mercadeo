import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { APP } from "@/lib/constants";

export interface LegalSection {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
}

/** Marca NetScale (nodos ascendentes), inline para render en servidor. */
function NetScaleMark() {
  return (
    <span
      style={{
        width: 46,
        height: 46,
        borderRadius: 13,
        background: "var(--blue-soft)",
        display: "grid",
        placeItems: "center",
        flexShrink: 0,
      }}
    >
      <svg width={28} height={22} viewBox="0 0 30 24" fill="none" aria-hidden="true">
        <path d="M5 18 L13 12 L21 7" stroke="var(--blue)" strokeWidth="2.4" strokeLinecap="round" />
        <circle cx="5" cy="18" r="3.2" fill="var(--blue)" />
        <circle cx="13" cy="12" r="3.2" fill="var(--blue)" />
        <circle cx="21.5" cy="7" r="3.6" fill="var(--blue)" />
      </svg>
    </span>
  );
}

/** Página legal pública y legible (apta para 50+), con identidad NetScale. */
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
    <main style={{ minHeight: "100dvh", background: "var(--bg)", fontFamily: "var(--font-body)", color: "var(--text)" }}>
      <div style={{ maxWidth: 780, margin: "0 auto", padding: "clamp(20px, 4vw, 40px) 16px 64px" }}>
        <Link
          href="/login"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            color: "var(--text-2)",
            fontSize: 16,
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          <ArrowLeft size={20} /> Volver
        </Link>

        <article
          style={{
            marginTop: 16,
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--r-card)",
            boxShadow: "var(--shadow-card)",
            padding: "clamp(22px, 4vw, 40px)",
          }}
        >
          <header style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <NetScaleMark />
            <div>
              <div
                style={{
                  fontFamily: "var(--font-head)",
                  fontWeight: 600,
                  fontSize: 19,
                  color: "var(--blue-dark)",
                  letterSpacing: "-.02em",
                  lineHeight: 1.1,
                }}
              >
                {APP.fullName}
              </div>
              <div style={{ fontSize: 14, color: "var(--text-2)" }}>Actualizado: {updated}</div>
            </div>
          </header>

          <h1
            style={{
              fontFamily: "var(--font-head)",
              fontWeight: 700,
              fontSize: "clamp(26px, 5vw, 34px)",
              letterSpacing: "-.02em",
              lineHeight: 1.15,
              marginTop: 20,
            }}
          >
            {title}
          </h1>

          <div
            style={{
              marginTop: 18,
              display: "flex",
              gap: 10,
              alignItems: "flex-start",
              background: "var(--orange-soft)",
              borderRadius: 14,
              padding: "14px 16px",
            }}
          >
            <ShieldCheck size={22} style={{ color: "var(--orange)", flexShrink: 0, marginTop: 1 }} />
            <p style={{ color: "var(--text-2)", fontSize: 15, lineHeight: 1.55 }}>
              Documento informativo en versión preliminar. Será revisado por un abogado antes de su
              versión definitiva. Si tienes dudas, escríbenos.
            </p>
          </div>

          <p style={{ marginTop: 22, fontSize: 18, lineHeight: 1.6 }}>{intro}</p>

          <div style={{ marginTop: 26, display: "flex", flexDirection: "column", gap: 24 }}>
            {sections.map((section) => (
              <section key={section.heading}>
                <h2
                  style={{
                    fontFamily: "var(--font-head)",
                    fontWeight: 600,
                    fontSize: 20,
                    letterSpacing: "-.01em",
                    color: "var(--text)",
                  }}
                >
                  {section.heading}
                </h2>
                {section.paragraphs?.map((paragraph) => (
                  <p key={paragraph} style={{ marginTop: 8, color: "var(--text-2)", fontSize: 17, lineHeight: 1.6 }}>
                    {paragraph}
                  </p>
                ))}
                {section.bullets && (
                  <ul style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 9, padding: 0, listStyle: "none" }}>
                    {section.bullets.map((bullet) => (
                      <li
                        key={bullet}
                        style={{ display: "flex", gap: 10, alignItems: "flex-start", color: "var(--text-2)", fontSize: 17, lineHeight: 1.55 }}
                      >
                        <span style={{ width: 7, height: 7, borderRadius: 999, background: "var(--blue)", marginTop: 8, flexShrink: 0 }} />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>

          <div
            style={{
              marginTop: 34,
              paddingTop: 22,
              borderTop: "1px solid var(--border)",
              display: "flex",
              flexWrap: "wrap",
              gap: 18,
            }}
          >
            <Link href="/terminos" style={{ color: "var(--blue)", fontWeight: 600, fontSize: 16, textDecoration: "none" }}>
              Términos y Condiciones
            </Link>
            <Link href="/privacidad" style={{ color: "var(--blue)", fontWeight: 600, fontSize: 16, textDecoration: "none" }}>
              Política de Privacidad
            </Link>
          </div>
        </article>
      </div>
    </main>
  );
}
