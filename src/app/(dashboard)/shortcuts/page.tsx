"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Zap,
  Plus,
  Phone,
  MessageSquare,
  Mail,
  Globe,
  Shield,
  Heart,
  Briefcase,
  AlertTriangle,
  GripVertical,
  Pencil,
  Trash2,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.04 } },
};

const item = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 },
};

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Phone, MessageSquare, Mail, Globe, Shield, Heart, Briefcase, AlertTriangle, Zap, ExternalLink,
};

const categories = [
  { id: "family", name: "Family", icon: "Heart", color: "#f472b6" },
  { id: "work", name: "Work", icon: "Briefcase", color: "#60a5fa" },
  { id: "emergency", name: "Emergency", icon: "AlertTriangle", color: "#f87171" },
  { id: "services", name: "Services", icon: "Globe", color: "#34d399" },
];

const mockShortcuts = [
  { id: "1", title: "Call Dad", action: "tel:+1234567890", actionType: "PHONE_CALL", icon: "Phone", color: "#34d399", category: "family" },
  { id: "2", title: "WhatsApp Mom", action: "https://wa.me/1234567890", actionType: "WHATSAPP", icon: "MessageSquare", color: "#22c55e", category: "family" },
  { id: "3", title: "Text John", action: "sms:+1234567890", actionType: "SMS", icon: "MessageSquare", color: "#60a5fa", category: "family" },
  { id: "4", title: "Email Boss", action: "mailto:boss@company.com", actionType: "EMAIL", icon: "Mail", color: "#f59e0b", category: "work" },
  { id: "5", title: "Slack", action: "https://slack.com", actionType: "URL", icon: "Globe", color: "#4A154B", category: "work" },
  { id: "6", title: "Emergency SOS", action: "tel:112", actionType: "PHONE_CALL", icon: "AlertTriangle", color: "#f87171", category: "emergency" },
  { id: "7", title: "Nextcloud", action: "https://cloud.local", actionType: "URL", icon: "Globe", color: "#0082c9", category: "services" },
  { id: "8", title: "Plex", action: "https://plex.local:32400", actionType: "URL", icon: "Globe", color: "#e5a00d", category: "services" },
  { id: "9", title: "Home Assistant", action: "https://ha.local:8123", actionType: "URL", icon: "Zap", color: "#03a9f4", category: "services" },
  { id: "10", title: "Vaultwarden", action: "https://vault.local", actionType: "URL", icon: "Shield", color: "#175ddc", category: "services" },
  { id: "11", title: "Telegram Family", action: "https://t.me/familygroup", actionType: "TELEGRAM", icon: "MessageSquare", color: "#229ED9", category: "family" },
  { id: "12", title: "Grafana", action: "https://grafana.local:3000", actionType: "URL", icon: "Globe", color: "#F46800", category: "services" },
];

export default function ShortcutsPage() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filtered = activeCategory
    ? mockShortcuts.filter((s) => s.category === activeCategory)
    : mockShortcuts;

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6 page-container">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Shortcuts</h1>
          <p className="text-sm text-text-muted mt-1">Quick actions and deep links</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-primary-600 to-primary-500 text-white text-sm font-medium shadow-lg shadow-primary-500/20 hover:from-primary-500 hover:to-primary-400 transition-all">
          <Plus className="w-4 h-4" /> Add Shortcut
        </button>
      </div>

      {/* Category Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveCategory(null)}
          className={cn(
            "px-4 py-2 rounded-lg text-xs font-medium transition-all shrink-0 border",
            !activeCategory
              ? "bg-primary-500/10 text-primary-400 border-primary-500/20"
              : "bg-bg-surface text-text-muted border-border-default hover:text-text-secondary"
          )}
        >
          All
        </button>
        {categories.map((cat) => {
          const Icon = iconMap[cat.icon] || Globe;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id === activeCategory ? null : cat.id)}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-all shrink-0 border",
                activeCategory === cat.id
                  ? "bg-primary-500/10 text-primary-400 border-primary-500/20"
                  : "bg-bg-surface text-text-muted border-border-default hover:text-text-secondary"
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              {cat.name}
            </button>
          );
        })}
      </div>

      {/* Shortcut Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-3">
        {filtered.map((shortcut) => {
          const Icon = iconMap[shortcut.icon] || Globe;

          return (
            <motion.a
              key={shortcut.id}
              href={shortcut.action}
              target={shortcut.actionType === "URL" ? "_blank" : undefined}
              rel="noopener noreferrer"
              variants={item}
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.96 }}
              className="glass-card p-4 flex flex-col items-center gap-3 cursor-pointer group relative"
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110 group-hover:shadow-lg"
                style={{
                  backgroundColor: `${shortcut.color}15`,
                  color: shortcut.color,
                  boxShadow: `0 0 0 0 ${shortcut.color}00`,
                }}
              >
                <Icon className="w-6 h-6" />
              </div>
              <span className="text-xs font-medium text-text-secondary text-center leading-tight">
                {shortcut.title}
              </span>

              {/* Hover actions */}
              <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-0.5">
                <button
                  onClick={(e) => { e.preventDefault(); }}
                  className="p-1 rounded bg-bg-elevated/80 text-text-muted hover:text-text-primary"
                >
                  <Pencil className="w-3 h-3" />
                </button>
              </div>
            </motion.a>
          );
        })}
      </div>
    </motion.div>
  );
}
