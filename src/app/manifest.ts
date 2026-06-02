import type { MetadataRoute } from "next";
import { APP } from "@/lib/constants";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${APP.fullName} - Academia, CRM y copiloto IA`,
    short_name: APP.shortName,
    description: APP.description,
    id: "/",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f6f8f7",
    theme_color: APP.themeColor,
    lang: "es",
    dir: "ltr",
    categories: ["business", "education", "productivity"],
    shortcuts: [
      {
        name: "Nuevo mensaje",
        short_name: "Mensaje",
        url: "/mensajes",
        icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }],
      },
      {
        name: "Prospectos",
        short_name: "CRM",
        url: "/duplicacion/prospectos",
        icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }],
      },
    ],
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
