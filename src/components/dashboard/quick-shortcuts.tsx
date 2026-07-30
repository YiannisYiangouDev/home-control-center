"use client";

import { motion } from "framer-motion";
import { Phone, MessageSquare, Globe, Mail, Shield, Zap } from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Phone, MessageSquare, Globe, Mail, Shield, Zap,
};

const seedShortcuts = [
  { id: "nc", title: "Call Mum", icon: "Phone", color: "#f472b6", action: "tel:+" },
  { id: "unraid", title: "Call Dad", icon: "Phone", color: "#34d399", action: "tel:+" },
  { id: "ig", title: "SMS ss", icon: "MessageSquare", color: "#34d399", action: "sms:+35799823800&body=good morninggg" },
  { id: "insta", title: "Insta", icon: "MessageSquare", color: "#E4405F", action: "https://www.instagram.com/direct/inbox/" },
  { id: "wg", title: "WG", icon: "Shield", color: "#8b5cf6", action: "http://192.168.0.200:8900/Settings/VPNManager" },
  { id: "vw", title: "Vault", icon: "Shield", color: "#175ddc", action: "https://vault.local" },
  { id: "ac", title: "❄️ AC", icon: "Zap", color: "#00b4d8", action: "http://192.168.0.200:8888" },
  { id: "nc2", title: "Nextcloud", icon: "Globe", color: "#00b4d8", action: "https://arxeia.yiangouweb.com" },
  { id: "ur", title: "Unraid", icon: "Zap", color: "#f59e0b", action: "http://192.168.0.200:8900" },
];

interface QuickShortcutsProps {
  shortcuts?: readonly any[];
}

export function QuickShortcuts({ shortcuts = [] }: QuickShortcutsProps) {
  const items = shortcuts.length > 0
    ? shortcuts.map((s: any) => ({
        id: s.id,
        title: s.title,
        icon: s.icon || "Globe",
        color: s.color || "#00b4d8",
        action: s.action,
      }))
    : seedShortcuts;

  return (
    <div className="glass-card-static p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-text-muted" />
          <h3 className="text-sm font-medium text-text-secondary">Quick Shortcuts</h3>
        </div>
        <a href="/shortcuts" className="text-xs text-primary-400 hover:text-primary-300 transition-colors">View all</a>
      </div>

      <div className="grid grid-cols-3 gap-2 flex-1">
        {items.map((shortcut, index) => {
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
                style={{ backgroundColor: `${shortcut.color}15`, color: shortcut.color }}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-medium text-text-secondary text-center truncate w-full">{shortcut.title}</span>
            </motion.a>
          );
        })}
      </div>
    </div>
  );
}
