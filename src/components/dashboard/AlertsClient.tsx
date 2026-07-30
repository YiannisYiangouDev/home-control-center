"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Bell, AlertCircle, AlertTriangle, Info, CheckCircle2, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { acknowledgeAlert } from "@/actions/alerts";

interface AlertItem {
  id: string;
  severity: "CRITICAL" | "WARNING" | "INFO";
  title: string;
  message: string;
  status: "ACTIVE" | "ACKNOWLEDGED" | "RESOLVED";
  createdAt: string;
  server?: { name?: string } | null;
  service?: { name?: string } | null;
}

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

function formatTime(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

interface AlertsClientProps {
  alerts: readonly AlertItem[];
}

export function AlertsClient({ alerts }: AlertsClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [filter, setFilter] = useState<"ALL" | "ACTIVE" | "ACKNOWLEDGED" | "RESOLVED">("ALL");

  const filtered = filter === "ALL" ? alerts : alerts.filter((a) => a.status === filter);
  const activeCount = alerts.filter((a) => a.status === "ACTIVE").length;

  const handleAcknowledge = (id: string) => {
    startTransition(async () => {
      await acknowledgeAlert(id);
      router.refresh();
    });
  };

  if (alerts.length === 0) {
    return (
      <div className="space-y-6 page-container">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Alerts</h1>
          <p className="text-sm text-text-muted mt-1">No alerts</p>
        </div>
        <div className="glass-card p-12 text-center">
          <Bell className="w-12 h-12 text-text-muted mx-auto mb-4" />
          <p className="text-text-secondary">All clear — no active alerts</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 page-container">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Alerts</h1>
          <p className="text-sm text-text-muted mt-1">
            <span className="text-danger-400">{activeCount} active</span> · {alerts.length} total
          </p>
        </div>
      </div>

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

      <div className="space-y-3">
        {filtered.map((alert) => {
          const sev = severityConfig[alert.severity] || severityConfig.INFO;
          const stat = statusConfig[alert.status] || statusConfig.ACTIVE;
          const SevIcon = sev.icon;
          const source = alert.service?.name || alert.server?.name || "System";

          return (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
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
                      <p className="text-xs text-text-muted mt-0.5">{source} · {formatTime(alert.createdAt)}</p>
                    </div>
                    <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-medium shrink-0", stat.bg, stat.color)}>
                      {stat.label}
                    </span>
                  </div>
                  {alert.message && (
                    <p className="text-sm text-text-secondary mt-2 leading-relaxed">{alert.message}</p>
                  )}

                  {alert.status === "ACTIVE" && (
                    <div className="flex items-center gap-2 mt-3">
                      <button
                        disabled={isPending}
                        onClick={() => handleAcknowledge(alert.id)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-warning-400/10 text-warning-400 border border-warning-400/20 text-xs hover:bg-warning-400/20 transition-all"
                      >
                        <Check className="w-3 h-3" /> Acknowledge
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
