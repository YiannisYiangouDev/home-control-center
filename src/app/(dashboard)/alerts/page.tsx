"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Bell,
  AlertCircle,
  AlertTriangle,
  Info,
  CheckCircle2,
  Filter,
  Check,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.04 } },
};

const item = {
  hidden: { opacity: 0, x: -12 },
  visible: { opacity: 1, x: 0 },
};

const mockAlerts = [
  { id: "1", severity: "CRITICAL", title: "Disk 4 SMART Warning", message: "Reallocated sector count increasing on /dev/sde. Current value: 24. Consider replacing this disk.", status: "ACTIVE", time: "12 minutes ago", source: "Unraid" },
  { id: "2", severity: "WARNING", title: "Storage Array at 85%", message: "Array storage is at 85% capacity. Consider expanding or cleaning up unused files.", status: "ACTIVE", time: "1 hour ago", source: "Unraid" },
  { id: "3", severity: "CRITICAL", title: "Sonarr Container Stopped", message: "Docker container 'sonarr' has stopped unexpectedly. Last running: 2h ago.", status: "ACTIVE", time: "2 hours ago", source: "Docker" },
  { id: "4", severity: "INFO", title: "Nextcloud Updated", message: "Nextcloud has been updated to version 29.0.1. All health checks passed.", status: "RESOLVED", time: "3 hours ago", source: "Nextcloud" },
  { id: "5", severity: "WARNING", title: "Jellyfin High CPU Usage", message: "Jellyfin container CPU usage exceeded 80% threshold for more than 10 minutes.", status: "ACKNOWLEDGED", time: "5 hours ago", source: "Docker" },
  { id: "6", severity: "WARNING", title: "Radarr Container Stopped", message: "Docker container 'radarr' has stopped. Manual restart may be required.", status: "ACTIVE", time: "5 hours ago", source: "Docker" },
  { id: "7", severity: "INFO", title: "Daily Backup Completed", message: "Scheduled backup completed successfully. 48.2 GB backed up in 23 minutes.", status: "RESOLVED", time: "8 hours ago", source: "System" },
  { id: "8", severity: "INFO", title: "SSL Certificate Renewed", message: "Let's Encrypt certificate for cloud.local renewed. Valid until Oct 24, 2026.", status: "RESOLVED", time: "1 day ago", source: "System" },
];

const severityConfig = {
  CRITICAL: { icon: AlertCircle, color: "text-danger-400", bg: "bg-danger-400/10", border: "border-danger-400/20" },
  WARNING: { icon: AlertTriangle, color: "text-warning-400", bg: "bg-warning-400/10", border: "border-warning-400/20" },
  INFO: { icon: Info, color: "text-primary-400", bg: "bg-primary-400/10", border: "border-primary-400/20" },
};

const statusConfig = {
  ACTIVE: { label: "Active", color: "text-danger-400", bg: "bg-danger-400/10" },
  ACKNOWLEDGED: { label: "Acknowledged", color: "text-warning-400", bg: "bg-warning-400/10" },
  RESOLVED: { label: "Resolved", color: "text-success-400", bg: "bg-success-400/10" },
};

export default function AlertsPage() {
  const [filter, setFilter] = useState<"ALL" | "ACTIVE" | "ACKNOWLEDGED" | "RESOLVED">("ALL");

  const filtered = filter === "ALL" ? mockAlerts : mockAlerts.filter((a) => a.status === filter);
  const activeCount = mockAlerts.filter((a) => a.status === "ACTIVE").length;

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6 page-container">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Alerts</h1>
          <p className="text-sm text-text-muted mt-1">
            <span className="text-danger-400">{activeCount} active</span> · {mockAlerts.length} total
          </p>
        </div>
        {activeCount > 0 && (
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-success-400/10 text-success-400 border border-success-400/20 text-sm font-medium hover:bg-success-400/20 transition-all">
            <CheckCircle2 className="w-4 h-4" /> Resolve All
          </button>
        )}
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2">
        {(["ALL", "ACTIVE", "ACKNOWLEDGED", "RESOLVED"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium transition-all border",
              filter === f
                ? "bg-primary-500/10 text-primary-400 border-primary-500/20"
                : "bg-bg-surface text-text-muted border-border-default hover:text-text-secondary"
            )}
          >
            {f === "ALL" ? "All" : f.charAt(0) + f.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Alert List */}
      <div className="space-y-3">
        {filtered.map((alert) => {
          const sev = severityConfig[alert.severity as keyof typeof severityConfig];
          const stat = statusConfig[alert.status as keyof typeof statusConfig];
          const SevIcon = sev.icon;

          return (
            <motion.div
              key={alert.id}
              variants={item}
              className={cn("glass-card p-4 border-l-2", sev.border)}
            >
              <div className="flex items-start gap-3">
                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5", sev.bg)}>
                  <SevIcon className={cn("w-4 h-4", sev.color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-text-primary text-sm">{alert.title}</p>
                      <p className="text-xs text-text-muted mt-0.5">{alert.source} · {alert.time}</p>
                    </div>
                    <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-medium shrink-0", stat.bg, stat.color)}>
                      {stat.label}
                    </span>
                  </div>
                  <p className="text-sm text-text-secondary mt-2 leading-relaxed">{alert.message}</p>

                  {alert.status === "ACTIVE" && (
                    <div className="flex items-center gap-2 mt-3">
                      <button className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-warning-400/10 text-warning-400 border border-warning-400/20 text-xs hover:bg-warning-400/20 transition-all">
                        <Check className="w-3 h-3" /> Acknowledge
                      </button>
                      <button className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-success-400/10 text-success-400 border border-success-400/20 text-xs hover:bg-success-400/20 transition-all">
                        <CheckCircle2 className="w-3 h-3" /> Resolve
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
