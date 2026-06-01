import type { MetadataRoute } from "next";
import { APP } from "@/lib/constants";

/** Manifest PWA dinámico. Hace la app instalable (A2HS). */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${APP.fullName} — Formación y Duplicación`,
    short_name: APP.shortName,
    description: APP.description,
    id: "/",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0b1120",
    theme_color: APP.themeColor,
    lang: "es",
    dir: "ltr",
    categories: ["business", "education", "productivity"],
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
