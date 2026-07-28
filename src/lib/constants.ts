export const APP_NAME = "Home Control Center";
export const APP_DESCRIPTION = "Self-hosted personal command center for server monitoring and management";
export const APP_VERSION = "1.0.0";

export const THEME_COLORS = {
  primary: "#00b4d8",
  success: "#34d399",
  warning: "#f59e0b",
  danger: "#f87171",
  background: "#0a0f1a",
} as const;

export const NAV_ITEMS = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: "LayoutDashboard",
  },
  {
    title: "Unraid",
    href: "/unraid",
    icon: "Server",
    children: [
      { title: "Overview", href: "/unraid" },
      { title: "Storage", href: "/unraid/storage" },
      { title: "Docker", href: "/unraid/docker" },
    ],
  },
  {
    title: "Nextcloud",
    href: "/nextcloud",
    icon: "Cloud",
  },
  {
    title: "Services",
    href: "/services",
    icon: "Activity",
  },
  {
    title: "Shortcuts",
    href: "/shortcuts",
    icon: "Zap",
  },
  {
    title: "Alerts",
    href: "/alerts",
    icon: "Bell",
  },
  {
    title: "Settings",
    href: "/settings",
    icon: "Settings",
    children: [
      { title: "General", href: "/settings" },
      { title: "Servers", href: "/settings/servers" },
      { title: "Email", href: "/settings/email" },
      { title: "Security", href: "/settings/security" },
    ],
  },
] as const;

export const MOBILE_NAV_ITEMS = [
  { title: "Home", href: "/dashboard", icon: "LayoutDashboard" },
  { title: "Services", href: "/services", icon: "Activity" },
  { title: "Shortcuts", href: "/shortcuts", icon: "Zap" },
  { title: "Alerts", href: "/alerts", icon: "Bell" },
  { title: "Settings", href: "/settings", icon: "Settings" },
] as const;

export const DEFAULT_SHORTCUT_CATEGORIES = [
  { name: "Family", icon: "Heart", color: "#f472b6" },
  { name: "Work", icon: "Briefcase", color: "#60a5fa" },
  { name: "Emergency", icon: "AlertTriangle", color: "#f87171" },
  { name: "Services", icon: "Globe", color: "#34d399" },
] as const;

export const POLLING_INTERVALS = {
  dashboard: 30 * 1000, // 30 seconds
  metrics: 60 * 1000, // 1 minute
  services: 5 * 60 * 1000, // 5 minutes
  alerts: 15 * 1000, // 15 seconds
} as const;

export const METRIC_RETENTION_DAYS = 30;
export const MAX_LOGIN_ATTEMPTS = 5;
export const LOCKOUT_DURATION_MINUTES = 15;
export const MAX_EMAIL_RETRY_ATTEMPTS = 3;
