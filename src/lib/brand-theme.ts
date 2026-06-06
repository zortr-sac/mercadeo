/**
 * Tema de marca por negocio. A partir de UN color primario calcula los shades y
 * los devuelve como variables CSS para inyectar en el `.ns-app`. La app del
 * cliente es UNICOLOR: todo (azul/naranja/verde) sigue a este color (los tokens
 * `--orange*`/`--green*` son alias de la familia `--blue*` en netscale.css).
 *
 * Los shades se calculan en hex CONCRETO (no `color-mix`) para que funcionen en
 * WebViews/navegadores viejos de equipos de adultos mayores.
 */

export const DEFAULT_BRAND = "#1D4ED8";

/** Paleta curada: colores medios‑oscuros, legibles y con buen contraste sobre blanco. */
export const BUSINESS_PALETTE: { name: string; value: string }[] = [
  { name: "Azul", value: "#1D4ED8" },
  { name: "Índigo", value: "#4338CA" },
  { name: "Violeta", value: "#7C3AED" },
  { name: "Morado", value: "#9333EA" },
  { name: "Rosa", value: "#DB2777" },
  { name: "Rojo", value: "#DC2626" },
  { name: "Terracota", value: "#EA580C" },
  { name: "Ámbar", value: "#B45309" },
  { name: "Verde", value: "#16A34A" },
  { name: "Esmeralda", value: "#059669" },
  { name: "Teal", value: "#0D9488" },
  { name: "Cielo", value: "#0284C7" },
  { name: "Pizarra", value: "#475569" },
];

const HEX_RE = /^#([0-9a-fA-F]{6})$/;

export function isValidHex(hex: string | null | undefined): boolean {
  return typeof hex === "string" && HEX_RE.test(hex.startsWith("#") ? hex : `#${hex}`);
}

type Rgb = [number, number, number];

function hexToRgb(hex: string): Rgb {
  const h = hex.replace("#", "");
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

function rgbToHex(r: number, g: number, b: number): string {
  const c = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0");
  return `#${c(r)}${c(g)}${c(b)}`;
}

/** Mezcla `rgb` hacia `target` (blanco/negro) en proporción t (0..1). */
function mix([r, g, b]: Rgb, [tr, tg, tb]: Rgb, t: number): string {
  return rgbToHex(r + (tr - r) * t, g + (tg - g) * t, b + (tb - b) * t);
}

const WHITE: Rgb = [255, 255, 255];
const BLACK: Rgb = [0, 0, 0];

/**
 * Variables CSS para que toda la app adopte `primaryHex`. Devuelve la familia
 * `--blue*` (que `--orange*`/`--green*` siguen vía alias). Si el hex es inválido,
 * cae al azul NetScale.
 */
export function brandThemeVars(primaryHex: string | null | undefined): Record<string, string> {
  const norm = primaryHex && primaryHex.startsWith("#") ? primaryHex : `#${primaryHex ?? ""}`;
  const base = isValidHex(norm) ? norm : DEFAULT_BRAND;
  const rgb = hexToRgb(base);
  return {
    "--blue": base,
    "--blue-dark": mix(rgb, BLACK, 0.18),
    "--blue-tint": mix(rgb, WHITE, 0.8),
    "--blue-soft": mix(rgb, WHITE, 0.92),
  };
}
