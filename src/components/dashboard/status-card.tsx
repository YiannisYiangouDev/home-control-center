"use client";

import { cn } from "@/lib/utils";

interface StatusCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  status: "online" | "offline" | "warning" | "unknown";
  subtitle?: string;
  accentColor?: "primary" | "success" | "warning" | "danger";
  isMetric?: boolean;
}

const accentStyles = {
  primary: "border-primary-500/20 shadow-glow-primary",
  success: "border-success-400/20 glow-success",
  warning: "border-warning-400/20",
  danger: "border-danger-400/20 glow-danger",
};

const statusColors = {
  online: "status-dot-online",
  offline: "status-dot-offline",
  warning: "status-dot-warning",
  unknown: "",
};

const iconBgColors = {
  primary: "bg-primary-500/10 text-primary-400",
  success: "bg-success-400/10 text-success-400",
  warning: "bg-warning-400/10 text-warning-400",
  danger: "bg-danger-400/10 text-danger-400",
};

export function StatusCard({
  title,
  value,
  icon,
  status,
  subtitle,
  accentColor = "primary",
  isMetric,
}: StatusCardProps) {
  return (
    <div
      className={cn(
        "glass-card p-4 relative overflow-hidden group",
        accentStyles[accentColor]
      )}
    >
      {/* Background glow on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent to-transparent group-hover:from-primary-500/5 group-hover:to-transparent transition-all duration-500 pointer-events-none" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <div
            className={cn(
              "w-9 h-9 rounded-lg flex items-center justify-center",
              iconBgColors[accentColor]
            )}
          >
            {icon}
          </div>
          <span className={cn("status-dot", statusColors[status])} />
        </div>

        <div className="space-y-1">
          <p className="text-xs font-medium text-text-muted uppercase tracking-wider">
            {title}
          </p>
          <p
            className={cn(
              "text-xl font-bold text-text-primary",
              isMetric && "metric-value"
            )}
          >
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-text-muted">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
}
