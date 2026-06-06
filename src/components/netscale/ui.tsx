"use client";
// NetScale shared component kit — ported 1:1 from prototipo/ui.jsx.
// Big targets, text+icon pairing, calm warm styling. 60+ accessibility baked in.
import { useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Icon, type IconName } from "./icons";

export const STATUS_PAD = 58; // clears the status bar / notch safe area

/* ── Tone map ──────────────────────────────────────────────────────── */
export type Tone = "blue" | "orange" | "green" | "gray";
export const TONE: Record<Tone, { bg: string; fg: string }> = {
  blue: { bg: "var(--blue-soft)", fg: "var(--blue)" },
  orange: { bg: "var(--orange-soft)", fg: "var(--orange)" },
  green: { bg: "var(--green-soft)", fg: "var(--green)" },
  gray: { bg: "var(--locked-soft)", fg: "var(--locked)" },
};

/* ── Brand logo: "NetScale" + ascending connected nodes ───────────── */
export function NodesMark({ size = 26, color = "var(--blue)" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size * 0.78} viewBox="0 0 30 24" fill="none" aria-hidden="true">
      <path d="M5 18 L13 12 L21 7" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="5" cy="18" r="3.2" fill={color} />
      <circle cx="13" cy="12" r="3.2" fill={color} />
      <circle cx="21.5" cy="7" r="3.6" fill={color} />
    </svg>
  );
}

export function Logo({ size = 22, mark = true }: { size?: number; mark?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      {mark && <NodesMark size={size + 6} />}
      <span style={{
        fontFamily: "var(--font-head)", fontWeight: 600, fontSize: size,
        color: "var(--blue-dark)", letterSpacing: "-.02em",
      }}>NetScale</span>
    </div>
  );
}

/* ── Top bars ─────────────────────────────────────────────────────── */
export function TopBarMain({ avatar, onAvatar, title }: { avatar?: string; onAvatar?: () => void; title?: string }) {
  return (
    <header style={{
      padding: `${STATUS_PAD}px 20px 12px`,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      background: "var(--bg)", flexShrink: 0,
    }}>
      {title ? <h2 style={{ fontSize: 22 }}>{title}</h2> : <Logo size={20} />}
      {avatar && (
        <button className="ns-press" onClick={onAvatar} aria-label="Perfil" style={{
          width: 46, height: 46, borderRadius: 999, border: "2px solid var(--surface)",
          background: "linear-gradient(135deg, var(--blue), var(--blue-dark))",
          color: "#fff", fontFamily: "var(--font-head)", fontWeight: 600, fontSize: 18,
          boxShadow: "var(--shadow-card)", display: "grid", placeItems: "center",
        }}>{avatar}</button>
      )}
    </header>
  );
}

export function TopBarSub({ title, onBack }: { title?: string; onBack?: () => void }) {
  return (
    <header style={{
      padding: `${STATUS_PAD}px 14px 12px`,
      display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center",
      background: "var(--bg)", flexShrink: 0,
    }}>
      <button className="ns-press" onClick={onBack} style={{
        justifySelf: "start", display: "flex", alignItems: "center", gap: 4,
        padding: "8px 12px 8px 6px", borderRadius: 12, color: "var(--blue)",
        fontWeight: 600, fontSize: 18, minHeight: 48,
      }}>
        <Icon name="arrowL" size={26} color="var(--blue)" strokeWidth={2.4} />
        Volver
      </button>
      <h2 style={{ fontSize: 20, whiteSpace: "nowrap" }}>{title}</h2>
      <span />
    </header>
  );
}

/* ── Buttons ──────────────────────────────────────────────────────── */
type BtnVariant = "primary" | "success" | "outline" | "soft" | "danger" | "ghost";
type BtnSize = "xl" | "lg" | "md" | "sm";
export function Btn({
  children, onClick, variant = "primary", size = "lg", icon, iconRight, full = true, style, type,
}: {
  children: ReactNode; onClick?: () => void; variant?: BtnVariant; size?: BtnSize;
  icon?: IconName; iconRight?: IconName; full?: boolean; style?: CSSProperties; type?: "button" | "submit";
}) {
  const H = { xl: 64, lg: 60, md: 56, sm: 48 }[size];
  const FS = size === "sm" ? 17 : size === "md" ? 18 : 20;
  const V: Record<BtnVariant, CSSProperties> = {
    primary: { background: "var(--blue)", color: "#fff", border: "none", boxShadow: "0 4px 12px rgba(29,78,216,.28)" },
    success: { background: "var(--green)", color: "#fff", border: "none", boxShadow: "0 4px 12px rgba(22,163,74,.26)" },
    outline: { background: "var(--surface)", color: "var(--blue)", border: "2px solid var(--blue)", boxShadow: "none" },
    soft: { background: "var(--blue-soft)", color: "var(--blue-dark)", border: "none", boxShadow: "none" },
    danger: { background: "var(--surface)", color: "#DC2626", border: "1.5px solid #FCA5A5", boxShadow: "none" },
    ghost: { background: "transparent", color: "var(--blue)", border: "none", boxShadow: "none" },
  };
  const v = V[variant];
  return (
    <button type={type ?? "button"} className="ns-press" onClick={onClick} style={{
      width: full ? "100%" : undefined, height: H, borderRadius: "var(--r-btn)",
      display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 10,
      fontFamily: "var(--font-body)", fontWeight: 600, fontSize: FS,
      ...v, ...style,
    }}>
      {icon && <Icon name={icon} size={FS + 4} color={v.color as string} strokeWidth={2.2} />}
      {children}
      {iconRight && <Icon name={iconRight} size={FS + 4} color={v.color as string} strokeWidth={2.2} />}
    </button>
  );
}

/* ── Surfaces ─────────────────────────────────────────────────────── */
export function Card({
  children, onClick, style, pad = 16, dim = false, accent,
}: {
  children: ReactNode; onClick?: () => void; style?: CSSProperties; pad?: number; dim?: boolean; accent?: string;
}) {
  return (
    <div className={onClick ? "ns-press" : undefined} onClick={onClick} style={{
      background: "var(--surface)", border: "1px solid var(--border)",
      borderRadius: "var(--r-card)", boxShadow: "var(--shadow-card)",
      padding: pad, opacity: dim ? 0.72 : 1,
      borderLeft: accent ? `5px solid ${accent}` : undefined,
      cursor: onClick ? "pointer" : undefined, ...style,
    }}>{children}</div>
  );
}

export function IconCircle({
  icon, tone = "blue", size = 56, iconSize,
}: { icon: IconName; tone?: Tone; size?: number; iconSize?: number }) {
  const t = TONE[tone] || TONE.blue;
  return (
    <div style={{
      width: size, height: size, borderRadius: 999, flexShrink: 0,
      background: t.bg, display: "grid", placeItems: "center",
    }}>
      <Icon name={icon} size={iconSize || Math.round(size * 0.5)} color={t.fg} strokeWidth={2.1} />
    </div>
  );
}

export function ProgressBar({
  value = 0, total = 1, color = "var(--blue)", height = 10,
}: { value?: number; total?: number; color?: string; height?: number }) {
  const pct = Math.max(0, Math.min(100, (value / total) * 100));
  return (
    <div style={{ background: "var(--border)", borderRadius: 999, height, overflow: "hidden" }}>
      <div style={{
        width: pct + "%", height: "100%", background: color, borderRadius: 999,
        transformOrigin: "left", animation: "ns-bar-grow .6s ease both",
      }} />
    </div>
  );
}

export function Chip({ children, tone = "blue", icon }: { children: ReactNode; tone?: Tone; icon?: IconName }) {
  const t = TONE[tone] || TONE.blue;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      background: t.bg, color: t.fg, fontWeight: 600, fontSize: 15,
      padding: "5px 12px", borderRadius: 999, lineHeight: 1,
    }}>
      {icon && <Icon name={icon} size={15} color={t.fg} strokeWidth={2.4} />}
      {children}
    </span>
  );
}

export function SectionLabel({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return <h3 style={{ fontSize: 20, fontWeight: 600, margin: "0 0 2px", ...style }}>{children}</h3>;
}

/* ── Image placeholders (elegant, brand-toned) ────────────────────── */
export type PhTheme = "warm" | "people" | "green" | "slide" | "cover";
const PH_THEME: Record<PhTheme, [string, string, string]> = {
  warm: ["#FDE7D3", "#FBCBA0", "var(--orange)"],
  people: ["#DCE7FF", "#BFD2FF", "var(--blue)"],
  green: ["#D6F0DF", "#AEE0C0", "var(--green)"],
  slide: ["#E9EFFB", "#D4E1F7", "var(--blue-dark)"],
  cover: ["#EBE3FB", "#D9CCF4", "#7C3AED"],
};
export function ImagePlaceholder({
  theme = "people", icon = "image", label, aspect, height, radius = 16, style,
}: {
  theme?: PhTheme; icon?: IconName; label?: string;
  aspect?: string | number; height?: number; radius?: number; style?: CSSProperties;
}) {
  const [a, b, fg] = PH_THEME[theme] || PH_THEME.people;
  return (
    <div style={{
      position: "relative", width: "100%",
      aspectRatio: aspect, height,
      borderRadius: radius, overflow: "hidden",
      background: `linear-gradient(135deg, ${a}, ${b})`,
      display: "grid", placeItems: "center", ...style,
    }}>
      <div style={{
        position: "absolute", inset: 0, opacity: 0.5,
        backgroundImage: "radial-gradient(circle at 30% 30%, rgba(255,255,255,.6), transparent 45%)",
      }} />
      <div style={{ position: "relative", textAlign: "center", color: fg }}>
        <Icon name={icon} size={40} color={fg} strokeWidth={1.8} />
        {label && <div style={{ fontSize: 13, fontWeight: 600, marginTop: 6, opacity: 0.85 }}>{label}</div>}
      </div>
    </div>
  );
}

/* ── Toast (large confirmation) ───────────────────────────────────── */
export function useToast(ms = 1900): [string | null, (m: string) => void] {
  const [msg, setMsg] = useState<string | null>(null);
  const ref = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flash = (m: string) => {
    setMsg(m);
    if (ref.current) clearTimeout(ref.current);
    ref.current = setTimeout(() => setMsg(null), ms);
  };
  return [msg, flash];
}
export function Toast({
  show, icon = "check", children, tone = "green",
}: { show?: boolean; icon?: IconName; children: ReactNode; tone?: Tone }) {
  if (!show) return null;
  const t = TONE[tone] || TONE.green;
  return (
    <div style={{
      position: "absolute", left: "50%", bottom: "calc(var(--nav-h) + 16px)", zIndex: 80,
      transform: "translateX(-50%)", animation: "ns-toast-in .3s ease both",
      display: "flex", alignItems: "center", gap: 10, maxWidth: "88%",
      background: "var(--text)", color: "#fff", padding: "14px 20px",
      borderRadius: 16, boxShadow: "var(--shadow-pop)", fontSize: 17, fontWeight: 600,
    }}>
      <span style={{ width: 28, height: 28, borderRadius: 999, background: t.fg, display: "grid", placeItems: "center", flexShrink: 0 }}>
        <Icon name={icon} size={18} color="#fff" strokeWidth={3} />
      </span>
      {children}
    </div>
  );
}

/* ── Bottom sheet ─────────────────────────────────────────────────── */
export function Sheet({
  open, onClose, title, children,
}: { open?: boolean; onClose?: () => void; title?: string; children: ReactNode }) {
  if (!open) return null;
  return (
    <div onClick={onClose} style={{
      position: "absolute", inset: 0, zIndex: 90, display: "flex", flexDirection: "column",
      justifyContent: "flex-end", background: "rgba(15,23,42,.4)", animation: "ns-fade-in .2s ease both",
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: "var(--surface)", borderRadius: "24px 24px 0 0", padding: "12px 20px 28px",
        animation: "ns-sheet-up .28s cubic-bezier(.2,.8,.2,1) both", boxShadow: "var(--shadow-pop)",
      }}>
        <div style={{ width: 44, height: 5, borderRadius: 999, background: "var(--border-strong)", margin: "4px auto 14px" }} />
        {title && <h3 style={{ fontSize: 21, marginBottom: 14 }}>{title}</h3>}
        {children}
      </div>
    </div>
  );
}

/* ── Form fields ──────────────────────────────────────────────────── */
export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label style={{ display: "block" }}>
      <span style={{ display: "block", fontSize: 18, fontWeight: 600, marginBottom: 8 }}>{label}</span>
      {children}
      {hint && <span style={{ display: "block", fontSize: 15, color: "var(--text-2)", marginTop: 6 }}>{hint}</span>}
    </label>
  );
}
const inputStyle: CSSProperties = {
  width: "100%", minHeight: 60, padding: "0 16px", fontSize: 18,
  border: "1.5px solid var(--border-strong)", borderRadius: "var(--r-btn)",
  background: "var(--surface)", color: "var(--text)", outline: "none",
};
export function TextInput({
  value, onChange, placeholder, type = "text", right,
}: {
  value?: string; onChange?: (v: string) => void; placeholder?: string;
  type?: string; right?: ReactNode;
}) {
  return (
    <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
      <input type={type} value={value} onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder} style={{ ...inputStyle, paddingRight: right ? 96 : 16 }} />
      {right && <div style={{ position: "absolute", right: 8 }}>{right}</div>}
    </div>
  );
}
export function TextArea({
  value, onChange, placeholder, minHeight = 96,
}: { value?: string; onChange?: (v: string) => void; placeholder?: string; minHeight?: number }) {
  return (
    <textarea value={value} onChange={(e) => onChange?.(e.target.value)} placeholder={placeholder}
      style={{ ...inputStyle, minHeight, padding: 16, lineHeight: 1.5, resize: "none" }} />
  );
}

/* ── Info note (soft tinted box) ──────────────────────────────────── */
export function Note({ children, tone = "blue", icon = "shield" }: { children: ReactNode; tone?: Tone; icon?: IconName }) {
  const t = TONE[tone] || TONE.blue;
  return (
    <div style={{
      display: "flex", gap: 10, alignItems: "flex-start",
      background: t.bg, borderRadius: 14, padding: "14px 16px", color: "var(--text-2)", fontSize: 16,
    }}>
      <Icon name={icon} size={22} color={t.fg} strokeWidth={2.1} style={{ flexShrink: 0, marginTop: 1 }} />
      <span>{children}</span>
    </div>
  );
}

/* ── Big stacked choice card (used by Crear & Vender hubs) ─────────── */
export function BigChoice({
  icon, tone, title, desc, onClick, cta = "Empezar",
}: { icon: IconName; tone: Tone; title: string; desc: string; onClick?: () => void; cta?: string }) {
  return (
    <Card onClick={onClick} pad={18} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <IconCircle icon={icon} tone={tone} size={64} />
      <div>
        <h3 style={{ fontSize: 22 }}>{title}</h3>
        <p style={{ fontSize: 17, color: "var(--text-2)", marginTop: 4 }}>{desc}</p>
      </div>
      <span style={{
        alignSelf: "flex-start", display: "inline-flex", alignItems: "center", gap: 6,
        background: "var(--blue)", color: "#fff", fontWeight: 600, fontSize: 17,
        padding: "11px 20px", borderRadius: 999,
      }}>{cta}<Icon name="chevR" size={18} color="#fff" strokeWidth={2.6} /></span>
    </Card>
  );
}

/* ── "AI is working" spinner ───────────────────────────────────────── */
export function AIWorking({ label = "La IA está trabajando…" }: { label?: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, padding: "24px 0" }}>
      <div style={{ position: "relative", width: 72, height: 72 }}>
        <div style={{ position: "absolute", inset: 0, borderRadius: 999, border: "5px solid var(--blue-soft)", borderTopColor: "var(--blue)", animation: "ns-spin 1s linear infinite" }} />
        <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
          <Icon name="sparkles" size={30} color="var(--orange)" />
        </div>
      </div>
      <span style={{ fontSize: 18, fontWeight: 600, color: "var(--text-2)" }}>{label}</span>
    </div>
  );
}
