"use client";

import { useMemo } from "react";
import {
  AlertTriangle,
  AlertCircle,
  Info,
  Bell,
} from "lucide-react";
import { cn } from "@/lib/utils";

const severityConfig = {
  CRITICAL: {
    icon: AlertCircle,
    bg: "bg-danger-400/10",
    border: "border-danger-400/20",
    text: "text-danger-400",
    dot: "bg-danger-400",
  },
  WARNING: {
    icon: AlertTriangle,
    bg: "bg-warning-400/10",
    border: "border-warning-400/20",
    text: "text-warning-400",
    dot: "bg-warning-400",
  },
  INFO: {
    icon: Info,
    bg: "bg-primary-400/10",
    border: "border-primary-400/20",
    text: "text-primary-400",
    dot: "bg-primary-400",
  },
};

interface AlertFeedProps {
  alerts?: readonly any[];
}

function formatTime(dateStr: string | Date | undefined) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function AlertFeed({ alerts = [] }: AlertFeedProps) {
  const displayAlerts = useMemo(() => {
    if (alerts.length > 0) {
      return alerts.map((a) => ({
        id: a.id,
        severity: a.severity || "INFO",
        title: a.title || a.message?.slice(0, 60) || "Alert",
        message: a.message || "",
        time: a.time || formatTime(a.createdAt),
      }));
    }
    // Empty state — no alerts
    return [];
  }, [alerts]);

  return (
    <div className="glass-card-static p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-text-muted" />
          <h3 className="text-sm font-medium text-text-secondary">Recent Alerts</h3>
        </div>
        <span className="text-xs text-text-muted">
          {displayAlerts.length} {displayAlerts.length === 1 ? "alert" : "alerts"}
        </span>
      </div>

      {displayAlerts.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-sm text-text-muted">
          No active alerts
        </div>
      ) : (
        <div className="flex-1 space-y-2 overflow-y-auto max-h-64">
          {displayAlerts.map((alert) => {
            const config = severityConfig[alert.severity as keyof typeof severityConfig] || severityConfig.INFO;
            const Icon = config.icon;

            return (
              <div
                key={alert.id}
                className={cn(
                  "flex items-start gap-3 p-3 rounded-lg border transition-all hover:bg-bg-surface/50 cursor-pointer",
                  config.bg,
                  config.border
                )}
              >
                <Icon className={cn("w-4 h-4 mt-0.5 shrink-0", config.text)} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">{alert.title}</p>
                  {alert.message && <p className="text-xs text-text-muted truncate">{alert.message}</p>}
                </div>
                <span className="text-[10px] text-text-muted shrink-0">{alert.time}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
