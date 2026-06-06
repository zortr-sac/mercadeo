// NetScale icon set — ported 1:1 from prototipo/icons.jsx.
// Bold, friendly line glyphs (24×24, sw 2). Always paired with a text label.
import type { CSSProperties, ReactNode } from "react";

const NS_ICONS: Record<string, ReactNode> = {
  // ── navigation
  home: <><path d="M3 11.5 12 4l9 7.5" /><path d="M5.5 10v9.5h13V10" /><path d="M9.5 19.5v-5h5v5" /></>,
  cap: <><path d="M12 4 2.5 9 12 14l9.5-5L12 4Z" /><path d="M6.5 11v4.2c0 1.4 2.5 2.8 5.5 2.8s5.5-1.4 5.5-2.8V11" /><path d="M21.5 9v5" /></>,
  sparkles: <><path d="M12 3.5 13.6 9 19 10.6 13.6 12.2 12 17.6 10.4 12.2 5 10.6 10.4 9 12 3.5Z" /><path d="M18.5 4v3M20 5.5h-3M5.5 16v2.6M6.8 17.3H4.2" /></>,
  chat: <><path d="M4 5.5h16v10.5H9l-4 3.2V16H4V5.5Z" /><path d="M8.5 10.7h7M8.5 13.4h4.5" /></>,
  user: <><circle cx="12" cy="8" r="3.6" /><path d="M5 19.5c.6-3.4 3.4-5.4 7-5.4s6.4 2 7 5.4" /></>,

  // ── academy / progress
  bulb: <><path d="M9 16.5a6 6 0 1 1 6 0c-.5.4-.8 1-.8 1.7v.3H9.8v-.3c0-.7-.3-1.3-.8-1.7Z" /><path d="M9.8 20.5h4.4M10.4 22h3.2" /></>,
  book: <><path d="M5 4.5h9a2.5 2.5 0 0 1 2.5 2.5v12.5H7.5A2.5 2.5 0 0 1 5 17V4.5Z" /><path d="M16.5 19.5H7.5a2.5 2.5 0 0 0-2.5 2.5" /><path d="M8.5 8.5h5M8.5 11.5h4" /></>,
  coins: <><ellipse cx="9" cy="7" rx="5" ry="2.6" /><path d="M4 7v4c0 1.4 2.2 2.6 5 2.6s5-1.2 5-2.6V7" /><path d="M10 13.8c.7 1.1 2.6 1.9 4.9 1.9 2.8 0 5-1.2 5-2.6V8" /><path d="M14 9.6c1.9-.2 4-1 4.9-1.9" /></>,
  bag: <><path d="M6 8.5h12l-1 11H7l-1-11Z" /><path d="M9 8.5V7a3 3 0 0 1 6 0v1.5" /></>,
  camera: <><path d="M4 8.5h3.5L9 6.5h6L16.5 8.5H20v11H4v-11Z" /><circle cx="12" cy="13.5" r="3.3" /></>,
  trophy: <><path d="M7 4.5h10v4a5 5 0 0 1-10 0v-4Z" /><path d="M7 6H4.5v1.5A3 3 0 0 0 7 10.5M17 6h2.5v1.5A3 3 0 0 1 17 10.5" /><path d="M12 13.5v3M8.5 20h7M9.5 20l.5-3.5h4l.5 3.5" /></>,
  flame: <><path d="M12 3.5c2.5 3 4.5 5 4.5 8.5a4.5 4.5 0 1 1-9 0c0-1.5.6-2.6 1.5-3.5.3 1.2 1 1.8 1.7 2 0-2.4.6-4.6 1.3-7Z" /></>,
  star: <><path d="M12 3.8 14.3 9l5.7.5-4.3 3.8 1.3 5.6L12 16l-5 2.9 1.3-5.6L4 9.5 9.7 9 12 3.8Z" /></>,

  // ── compensation plan
  handshake: <><path d="M3.5 9.5 7 7l3.5 1.5 3-1.5L20.5 9.5" /><path d="M7 7v6.5M17 7v6.5" /><path d="m10.5 12 2 2 1.5-1.5 2.5 2.5M12.5 14l-1.5 1.5" /></>,
  trending: <><path d="M4 16.5 9.5 11l3 3 5.5-5.5" /><path d="M14.5 8.5H19v4.5" /></>,
  users: <><circle cx="9" cy="9" r="3" /><path d="M3.5 19c.5-3 2.7-4.8 5.5-4.8s5 1.8 5.5 4.8" /><path d="M15.5 6.4A3 3 0 0 1 18 12M17 14.4c2 .6 3.3 2.2 3.6 4.6" /></>,
  crown: <><path d="M4 8.5 7 13l5-7 5 7 3-4.5-1.2 10H5.2L4 8.5Z" /><path d="M5.5 19.5h13" /></>,

  // ── create
  slides: <><rect x="4" y="5" width="16" height="11" rx="2" /><path d="M9 20h6M12 16v4" /><path d="M8 9.5h8M8 12h5" /></>,
  megaphone: <><path d="M4 10.5 16 6v10l-12-4.5V10.5Z" /><path d="M4 10.5H3v3h1M7 12.2V16a2 2 0 0 0 4 0v-2.2M16 8.5a3 3 0 0 1 0 6" /></>,
  image: <><rect x="4" y="5" width="16" height="14" rx="2.2" /><circle cx="9" cy="10" r="1.6" /><path d="m5 17 4.5-4 3 2.5L16 12l3 3" /></>,

  // ── sell
  wave: <><path d="M8 12V7.5a1.3 1.3 0 0 1 2.6 0V12m0-1V6.3a1.3 1.3 0 0 1 2.6 0V12m0-.7V7.3a1.3 1.3 0 0 1 2.6 0v6.2a5.3 5.3 0 0 1-5.3 5.3c-2 0-3.2-.8-4.3-2.3L4 13.3a1.4 1.4 0 0 1 2.3-1.6L8 13.7" /></>,
  clock: <><circle cx="12" cy="12" r="8" /><path d="M12 7.5V12l3 2" /></>,
  question: <><circle cx="12" cy="12" r="8.2" /><path d="M9.6 9.5a2.4 2.4 0 1 1 3.4 2.2c-.7.4-1 .8-1 1.6v.4" /><circle cx="12" cy="16.4" r=".4" fill="currentColor" stroke="none" /><path d="M12 16.4v0" /></>,
  gift: <><rect x="4.5" y="9.5" width="15" height="3.5" rx="1" /><path d="M6 13v7h12v-7M12 9.5V20" /><path d="M12 9.5C12 7 10.5 6 9 6a1.8 1.8 0 0 0 0 3.5h3Zm0 0C12 7 13.5 6 15 6a1.8 1.8 0 0 1 0 3.5h-3Z" /></>,
  shield: <><path d="M12 3.5 19 6v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-2.5Z" /><path d="m8.8 11.8 2.2 2.2 4-4.2" /></>,
  send: <><path d="M20 4 4 11l6 2.4M20 4l-3 15-7-5.6M20 4 10 13.4" /></>,
  copy: <><rect x="8" y="8" width="11" height="11" rx="2.2" /><path d="M5 15.5V6a2 2 0 0 1 2-2h8.5" /></>,

  // ── profile / settings
  bell: <><path d="M6.5 16.5V11a5.5 5.5 0 0 1 11 0v5.5l1.5 2H5l1.5-2Z" /><path d="M9.8 18.8a2.4 2.4 0 0 0 4.4 0" /></>,
  gear: <><circle cx="12" cy="12" r="3" /><path d="M12 3.5v2.5M12 18v2.5M5.5 5.5l1.8 1.8M16.7 16.7l1.8 1.8M3.5 12H6M18 12h2.5M5.5 18.5l1.8-1.8M16.7 7.3l1.8-1.8" /></>,
  help: <><circle cx="12" cy="12" r="8.2" /><path d="M9.7 9.6a2.3 2.3 0 1 1 3.2 2.1c-.7.4-.9.8-.9 1.5v.3" /><circle cx="12" cy="16.3" r=".5" fill="currentColor" stroke="none" /></>,
  logout: <><path d="M14 7.5V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-1.5" /><path d="M10 12h10m0 0-3-3m3 3-3 3" /></>,
  headphones: <><path d="M5 13v-1a7 7 0 0 1 14 0v1" /><rect x="3.5" y="13" width="3.5" height="6" rx="1.4" /><rect x="17" y="13" width="3.5" height="6" rx="1.4" /></>,

  // ── controls
  play: <><path d="M8 5.5 18.5 12 8 18.5v-13Z" fill="currentColor" stroke="none" /></>,
  playLine: <><circle cx="12" cy="12" r="8.5" /><path d="M10 8.5 16 12l-6 3.5v-7Z" fill="currentColor" stroke="none" /></>,
  pause: <><rect x="7" y="5.5" width="3.5" height="13" rx="1.2" fill="currentColor" stroke="none" /><rect x="13.5" y="5.5" width="3.5" height="13" rx="1.2" fill="currentColor" stroke="none" /></>,
  back15: <><path d="M11 5.5A6.5 6.5 0 1 0 17.5 12" /><path d="M11 2.5 8 5.5l3 3" /></>,
  fwd15: <><path d="M13 5.5A6.5 6.5 0 1 1 6.5 12" /><path d="M13 2.5l3 3-3 3" /></>,
  check: <><path d="m5 12.5 4.5 4.5L19 7" /></>,
  checkCircle: <><circle cx="12" cy="12" r="8.5" /><path d="m8 12.3 2.6 2.6 5.4-5.6" /></>,
  lock: <><rect x="5.5" y="10.5" width="13" height="9" rx="2.2" /><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" /><circle cx="12" cy="15" r="1.1" fill="currentColor" stroke="none" /></>,
  plus: <><path d="M12 5.5v13M5.5 12h13" /></>,
  refresh: <><path d="M19 12a7 7 0 1 1-2-4.9" /><path d="M19.5 4v3.8h-3.8" /></>,
  download: <><path d="M12 4v11m0 0-4-4m4 4 4-4" /><path d="M5 18.5h14" /></>,
  share: <><circle cx="6.5" cy="12" r="2.4" /><circle cx="17" cy="6.5" r="2.4" /><circle cx="17" cy="17.5" r="2.4" /><path d="m8.7 10.9 6.1-3.2M8.7 13.1l6.1 3.2" /></>,
  eye: <><path d="M2.5 12S6 6 12 6s9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" /><circle cx="12" cy="12" r="2.8" /></>,
  eyeOff: <><path d="M4 4l16 16" /><path d="M9.5 9.6A2.8 2.8 0 0 0 12 14.8M7 7.3C4.4 8.8 2.5 12 2.5 12s3.5 6 9.5 6c1.6 0 3-.4 4.3-1M11 6.1A8.7 8.7 0 0 1 12 6c6 0 9.5 6 9.5 6a18 18 0 0 1-2.4 3" /></>,
  chevR: <><path d="m9 5.5 6.5 6.5L9 18.5" /></>,
  chevL: <><path d="m15 5.5-6.5 6.5L15 18.5" /></>,
  arrowL: <><path d="M19 12H5m0 0 6-6m-6 6 6 6" /></>,
  upload: <><path d="M12 16V5m0 0-4 4m4-4 4 4" /><path d="M5 16v3a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-3" /></>,
  heart: <><path d="M12 19.5C7 16.5 4 13.5 4 9.8A3.8 3.8 0 0 1 12 7a3.8 3.8 0 0 1 8 2.8c0 3.7-3 6.7-8 9.7Z" /></>,
};

export type IconName = keyof typeof NS_ICONS | "whatsapp" | "instagram" | "tiktok";

type BrandName = "whatsapp" | "instagram" | "tiktok";

/** Brand glyphs (filled, use their own brand colors). */
export function BrandGlyph({ name, size = 26 }: { name: BrandName; size?: number }) {
  if (name === "whatsapp")
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="#fff"><path d="M12 2a10 10 0 0 0-8.6 15l-1.3 4.7 4.8-1.3A10 10 0 1 0 12 2Zm5.3 14c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .1-1.7-.1-.4-.1-.9-.3-1.6-.6-2.8-1.2-4.6-4-4.7-4.2-.2-.2-1.2-1.6-1.2-3s.7-2.1 1-2.4c.2-.3.5-.4.7-.4h.5c.2 0 .4 0 .6.5l.8 1.9c.1.2.1.4 0 .5l-.4.6c-.2.2-.3.4-.2.6.2.4.8 1.3 1.6 2 .9.8 1.7 1.1 2 1.2.2.1.4.1.6-.1l.7-.8c.2-.2.3-.2.6-.1l1.8.9c.3.1.4.2.5.3.1.2.1.7-.1 1.3Z" /></svg>
    );
  if (name === "instagram")
    return (
      <svg width={size} height={size} viewBox="0 0 24 24"><defs><linearGradient id="ns-ig" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stopColor="#FEDA75" /><stop offset=".4" stopColor="#FA7E1E" /><stop offset=".7" stopColor="#D62976" /><stop offset="1" stopColor="#962FBF" /></linearGradient></defs><rect x="2.5" y="2.5" width="19" height="19" rx="5.5" fill="url(#ns-ig)" /><circle cx="12" cy="12" r="4.3" fill="none" stroke="#fff" strokeWidth="1.8" /><circle cx="17.2" cy="6.8" r="1.2" fill="#fff" /></svg>
    );
  if (name === "tiktok")
    return (
      <svg width={size} height={size} viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" fill="#000" /><path d="M16.5 6.5c.5 1 1.4 1.7 2.5 1.9v2.1c-1 0-2-.3-2.8-.9v4.3a3.9 3.9 0 1 1-3.9-3.9c.2 0 .4 0 .6.1v2.2a1.8 1.8 0 1 0 1.3 1.7V6.5h2.3Z" fill="#fff" /></svg>
    );
  return null;
}

export function Icon({
  name,
  size = 24,
  color = "currentColor",
  strokeWidth = 2,
  style,
  className,
}: {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
  style?: CSSProperties;
  className?: string;
}) {
  if (name === "whatsapp" || name === "instagram" || name === "tiktok")
    return <BrandGlyph name={name} size={size} />;
  const body = NS_ICONS[name];
  if (!body) return null;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
      className={className}
      aria-hidden="true"
    >
      {body}
    </svg>
  );
}
