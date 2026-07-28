"use client";

import { motion } from "framer-motion";
import {
  Phone,
  MessageSquare,
  Globe,
  Mail,
  Shield,
  Zap,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickShortcutItem {
  id: string;
  title: string;
  icon: string;
  color: string;
  action: string;
}

// Mock data
const mockShortcuts: QuickShortcutItem[] = [
  { id: "1", title: "Call Dad", icon: "Phone", color: "#34d399", action: "tel:+1234567890" },
  { id: "2", title: "WhatsApp Mom", icon: "MessageSquare", color: "#22c55e", action: "https://wa.me/1234567890" },
  { id: "3", title: "Nextcloud", icon: "Globe", color: "#00b4d8", action: "https://cloud.local" },
  { id: "4", title: "Plex", icon: "Globe", color: "#e5a00d", action: "https://plex.local" },
  { id: "5", title: "Vaultwarden", icon: "Shield", color: "#60a5fa", action: "https://vault.local" },
  { id: "6", title: "Home Assistant", icon: "Zap", color: "#f472b6", action: "https://ha.local" },
];

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Phone,
  MessageSquare,
  Globe,
  Mail,
  Shield,
  Zap,
};

export function QuickShortcuts() {
  return (
    <div className="glass-card-static p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-text-muted" />
          <h3 className="text-sm font-medium text-text-secondary">
            Quick Shortcuts
          </h3>
        </div>
        <a
          href="/shortcuts"
          className="text-xs text-primary-400 hover:text-primary-300 transition-colors"
        >
          View all
        </a>
      </div>

      <div className="grid grid-cols-3 gap-2 flex-1">
        {mockShortcuts.map((shortcut, index) => {
          const Icon = iconMap[shortcut.icon] || Globe;

          return (
            <motion.a
              key={shortcut.id}
              href={shortcut.action}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-bg-elevated/50 border border-border-subtle hover:border-border-default transition-all group cursor-pointer"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-all group-hover:scale-110"
                style={{
                  backgroundColor: `${shortcut.color}15`,
                  color: shortcut.color,
                }}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-medium text-text-secondary text-center truncate w-full">
                {shortcut.title}
              </span>
            </motion.a>
          );
        })}
      </div>
    </div>
  );
}
