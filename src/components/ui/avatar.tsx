import { cn } from "@/lib/utils";

/** Genera iniciales a partir de un nombre completo. */
function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

/** Color de fondo estable derivado del nombre. */
const PALETTE = [
  "bg-brand-600",
  "bg-gold-600",
  "bg-emerald-600",
  "bg-violet-600",
  "bg-rose-600",
  "bg-cyan-600",
];
function colorFor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + (hash << 5) - hash;
  return PALETTE[Math.abs(hash) % PALETTE.length];
}

const SIZES = {
  sm: "size-8 text-xs",
  md: "size-10 text-sm",
  lg: "size-14 text-lg",
} as const;

export function Avatar({
  name,
  src,
  size = "md",
  className,
}: {
  name: string;
  src?: string | null;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full font-semibold text-white",
        SIZES[size],
        !src && colorFor(name),
        className,
      )}
      aria-hidden
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={name} className="size-full object-cover" />
      ) : (
        initials(name)
      )}
    </span>
  );
}
