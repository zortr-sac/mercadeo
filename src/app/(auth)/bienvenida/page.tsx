"use client";
// Pantalla 1 — Bienvenida (welcome). Ported 1:1 from prototipo/screens-entry.jsx.
import { useRouter } from "next/navigation";
import { NodesMark, Btn, STATUS_PAD } from "@/components/netscale/ui";
import { ROUTES } from "@/lib/constants";

export default function BienvenidaPage() {
  const router = useRouter();
  const goLogin = () => router.push(ROUTES.login);
  return (
    <div
      className="ns-scroll"
      style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        padding: "0 24px 32px", textAlign: "center",
      }}
    >
      <div style={{ height: STATUS_PAD + 24 }} />
      <NodesMark size={56} />
      <h1 style={{ fontSize: 38, marginTop: 12, color: "var(--blue-dark)", letterSpacing: "-.03em" }}>
        NetScale
      </h1>
      <p style={{ fontSize: 20, color: "var(--text-2)", marginTop: 8 }}>Tu negocio, paso a paso.</p>

      <div style={{ flex: 1, minHeight: 16 }} />

      {/* warm illustration: older adult smiling at a phone */}
      <div style={{
        width: 248, height: 248, borderRadius: 32, position: "relative", overflow: "hidden",
        background: "linear-gradient(150deg, #E2ECFF 0%, #FFE9D6 100%)",
        display: "grid", placeItems: "center", boxShadow: "var(--shadow-card)",
      }}>
        <div style={{
          position: "absolute", inset: 0, opacity: 0.55,
          background: "radial-gradient(circle at 32% 28%, rgba(255,255,255,.7), transparent 50%)",
        }} />
        <svg width="160" height="170" viewBox="0 0 160 170" fill="none" style={{ position: "relative" }}>
          <circle cx="80" cy="50" r="30" fill="#FBBF77" />
          <path d="M62 44c0-9 8-15 18-15s18 6 18 15" stroke="#B9842F" strokeWidth="4" strokeLinecap="round" fill="none" />
          <circle cx="71" cy="50" r="3" fill="#5b4327" /><circle cx="89" cy="50" r="3" fill="#5b4327" />
          <path d="M72 60c4 4 12 4 16 0" stroke="#B9842F" strokeWidth="3.5" strokeLinecap="round" fill="none" />
          <path d="M40 168c0-26 18-44 40-44s40 18 40 44" fill="#1D4ED8" />
          <rect x="96" y="96" width="34" height="54" rx="8" transform="rotate(16 96 96)" fill="#0F172A" />
          <rect x="100" y="101" width="26" height="44" rx="4" transform="rotate(16 96 96)" fill="#EA580C" opacity=".9" />
        </svg>
      </div>

      <div style={{ flex: 1, minHeight: 24 }} />

      <Btn size="xl" iconRight="chevR" onClick={goLogin}>Entrar</Btn>
      <button className="ns-press" onClick={goLogin} style={{
        marginTop: 18, color: "var(--blue)", fontSize: 18, fontWeight: 600, padding: 10,
      }}>¿Necesitas ayuda?</button>
    </div>
  );
}
