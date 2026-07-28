"use client";

import { motion } from "framer-motion";
import {
  Settings,
  Server,
  Mail,
  Shield,
  Bell,
  Palette,
  Database,
  Key,
  Globe,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

const settingsSections = [
  {
    title: "Connections",
    items: [
      { title: "Servers", description: "Manage Unraid, Nextcloud, and other server connections", href: "/settings/servers", icon: Server, color: "#00b4d8" },
      { title: "Services", description: "Configure monitored services and health checks", href: "/services", icon: Globe, color: "#34d399" },
    ],
  },
  {
    title: "Notifications",
    items: [
      { title: "Email (Resend)", description: "Configure email alerts and report schedules", href: "/settings/email", icon: Mail, color: "#f59e0b" },
      { title: "Alert Rules", description: "Set thresholds and notification preferences", href: "/alerts", icon: Bell, color: "#f87171" },
    ],
  },
  {
    title: "Security",
    items: [
      { title: "Authentication", description: "User accounts, sessions, and login settings", href: "/settings/security", icon: Shield, color: "#8b5cf6" },
      { title: "API Keys", description: "Manage encrypted credentials and API access", href: "/settings/security", icon: Key, color: "#60a5fa" },
    ],
  },
  {
    title: "System",
    items: [
      { title: "Database", description: "View database status and run maintenance", href: "/settings", icon: Database, color: "#ec4899" },
      { title: "Appearance", description: "Theme, layout, and display preferences", href: "/settings", icon: Palette, color: "#a78bfa" },
    ],
  },
];

export default function SettingsPage() {
  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8 page-container max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Settings</h1>
        <p className="text-sm text-text-muted mt-1">Configure your Home Control Center</p>
      </div>

      {settingsSections.map((section) => (
        <motion.div key={section.title} variants={item}>
          <h2 className="text-sm font-medium text-text-muted uppercase tracking-wider mb-3">
            {section.title}
          </h2>
          <div className="space-y-2">
            {section.items.map((settingItem) => {
              const Icon = settingItem.icon;
              return (
                <Link
                  key={settingItem.title}
                  href={settingItem.href}
                  className="glass-card flex items-center gap-4 p-4 group"
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${settingItem.color}15`, color: settingItem.color }}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary">{settingItem.title}</p>
                    <p className="text-xs text-text-muted">{settingItem.description}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-text-muted group-hover:text-text-secondary transition-colors" />
                </Link>
              );
            })}
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
