import type { MetadataRoute } from "next";
import { APP_NAME, APP_DESCRIPTION, THEME_COLORS } from "@/lib/constants";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: APP_NAME,
    short_name: "HCC",
    description: APP_DESCRIPTION,
    start_url: "/dashboard",
    display: "standalone",
    background_color: THEME_COLORS.background,
    theme_color: THEME_COLORS.primary,
    orientation: "portrait-primary",
    categories: ["utilities", "productivity"],
    prefer_related_applications: false,
    icons: [
      {
        src: "/icons/icon-192.svg",
        sizes: "192x192",
        type: "image/svg+xml",
      },
    ],
    shortcuts: [
      {
        name: "Dashboard",
        url: "/dashboard",
        icons: [{ src: "/icons/shortcut-dashboard.png", sizes: "96x96" }],
      },
      {
        name: "Services",
        url: "/services",
        icons: [{ src: "/icons/shortcut-services.png", sizes: "96x96" }],
      },
      {
        name: "Alerts",
        url: "/alerts",
        icons: [{ src: "/icons/shortcut-alerts.png", sizes: "96x96" }],
      },
    ],
  };
}
