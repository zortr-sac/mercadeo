// Genera los iconos PNG de la PWA a partir de los SVG fuente.
import sharp from "sharp";
import { readFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const out = resolve(here, "..", "public", "icons");
mkdirSync(out, { recursive: true });

const base = readFileSync(resolve(here, "icon.svg"));
const maskable = readFileSync(resolve(here, "icon-maskable.svg"));

const targets = [
  { src: base, size: 192, name: "icon-192.png" },
  { src: base, size: 512, name: "icon-512.png" },
  { src: base, size: 180, name: "apple-touch-icon.png" },
  { src: maskable, size: 512, name: "icon-maskable-512.png" },
];

for (const t of targets) {
  await sharp(t.src)
    .resize(t.size, t.size)
    .png()
    .toFile(resolve(out, t.name));
  console.log("generado", t.name);
}
