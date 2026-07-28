"use client";

import {
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle2,
  Bell,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AlertItem {
  id: string;
  severity: "CRITICAL" | "WARNING" | "INFO";
  title: string;
  message: string;
  time: string;
}

// Mock data
const mockAlerts: AlertItem[] = [
  {
    id: "1",
    severity: "CRITICAL",
    title: "Disk 4 SMART Warning",
    message: "Reallocated sector count increasing",
    time: "12m ago",
  },
  {
    id: "2",
    severity: "WARNING",
    title: "Storage Array 85%",
    message: "Consider expanding storage soon",
    time: "1h ago",
  },
  {
    id: "3",
    severity: "INFO",
    title: "Nextcloud Updated",
    message: "Successfully updated to v29.0.1",
    time: "3h ago",
  },
  {
    id: "4",
    severity: "WARNING",
    title: "Jellyfin High CPU",
    message: "CPU usage above 80% for 10 minutes",
    time: "5h ago",
  },
];

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

export function AlertFeed() {
  return (
    <div className="glass-card-static p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-text-muted" />
          <h3 className="text-sm font-medium text-text-secondary">
            Recent Alerts
          </h3>
        </div>
        <span className="text-xs text-text-muted">
          {mockAlerts.length} active
        </span>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto max-h-64">
        {mockAlerts.map((alert) => {
          const config = severityConfig[alert.severity];
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
                <p className="text-sm font-medium text-text-primary truncate">
                  {alert.title}
                </p>
                <p className="text-xs text-text-muted truncate">
                  {alert.message}
                </p>
              </div>
              <span className="text-[10px] text-text-muted shrink-0">
                {alert.time}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
