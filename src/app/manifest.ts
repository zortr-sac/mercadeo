import type { MetadataRoute } from "next";
import { APP } from "@/lib/constants";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${APP.fullName} - Tu negocio, paso a paso`,
    short_name: APP.shortName,
    description: APP.description,
    id: "/",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#F8FAFC",
    theme_color: APP.themeColor,
    lang: "es",
    dir: "ltr",
    categories: ["business", "education", "productivity"],
    shortcuts: [
      {
        name: "Vender",
        short_name: "Vender",
        url: "/vender",
        icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }],
      },
      {
        name: "Presentar",
        short_name: "Presentar",
        url: "/presentar",
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
