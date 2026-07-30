"use client";

import { motion } from "framer-motion";
import {
  Cloud,
  HardDrive,
  Users,
  FileText,
  Database,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Server,
  AlertCircle,
} from "lucide-react";
import { StatusCard } from "@/components/dashboard/status-card";
import { CpuGauge } from "@/components/dashboard/cpu-gauge";
import { StorageBar } from "@/components/dashboard/storage-bar";
import { cn } from "@/lib/utils";

const item = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

interface NextcloudServerInfo {
  status: "online" | "offline";
  version: string;
  health: boolean;
  database: {
    type: string;
    version: string;
    size: number;
  };
  storage: {
    total: number;
    used: number;
    free: number;
    numFiles: number;
  };
  cron: {
    lastRun: string;
    status: "ok" | "warning" | "error";
  };
  activeUsers: {
    last5min: number;
    lastHour: number;
    lastDay: number;
  };
  apps: {
    installed: number;
    updatesAvailable: number;
  };
  phpVersion: string;
  webServer: string;
}

interface NextcloudDashboardClientProps {
  serverInfo: NextcloudServerInfo;
}

export function NextcloudDashboardClient({ serverInfo }: NextcloudDashboardClientProps) {
  const isOnline = serverInfo.status === "online";

  // Format bytes to human readable format (GB / TB)
  const formatBytes = (bytes: number) => {
    if (bytes <= 0) return "0 GB";
    const gb = bytes / (1024 * 1024 * 1024);
    if (gb >= 1000) {
      return `${(gb / 1024).toFixed(1)} TB`;
    }
    return `${gb.toFixed(0)} GB`;
  };

  const freeSpaceFormatted = formatBytes(serverInfo.storage.free);

  // Format cron last run
  const formatCronTime = (lastRun: string) => {
    if (!lastRun) return "Never";
    try {
      const date = new Date(lastRun);
      const diffMin = Math.round((Date.now() - date.getTime()) / 60000);
      if (diffMin < 1) return "Just now";
      if (diffMin < 60) return `${diffMin} min ago`;
      const diffHours = Math.round(diffMin / 60);
      if (diffHours < 24) return `${diffHours} hours ago`;
      return date.toLocaleDateString();
    } catch {
      return lastRun;
    }
  };

  return (
    <div className="space-y-6">
      {/* Alert if credentials fail or server is offline */}
      {!isOnline && (
        <motion.div
          variants={item}
          className="flex items-start gap-3 p-4 rounded-xl bg-danger-400/10 border border-danger-400/20 text-danger-400 text-sm"
        >
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Nextcloud Connection Failed</p>
            <p className="text-xs text-danger-400/80 mt-1">
              Could not authenticate or establish a connection with Nextcloud. Please verify that the `NEXTCLOUD_URL`, `NEXTCLOUD_USERNAME`, and `NEXTCLOUD_APP_PASSWORD` values in your `.env` file are correct, and that your server is online.
            </p>
          </div>
        </motion.div>
      )}

      {/* Status Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div variants={item}>
          <StatusCard
            title="Server"
            value={isOnline ? "Healthy" : "Offline"}
            icon={<Server className="w-5 h-5" />}
            status={isOnline ? "online" : "offline"}
            subtitle={isOnline ? "All checks passed" : "Unreachable"}
            accentColor={isOnline ? "success" : "danger"}
          />
        </motion.div>
        <motion.div variants={item}>
          <StatusCard
            title="Free Storage"
            value={isOnline ? freeSpaceFormatted : "N/A"}
            icon={<HardDrive className="w-5 h-5" />}
            status={isOnline ? "online" : "offline"}
            subtitle="Available freespace"
            accentColor="primary"
            isMetric
          />
        </motion.div>
        <motion.div variants={item}>
          <StatusCard
            title="Total Files"
            value={isOnline ? serverInfo.storage.numFiles.toLocaleString() : "N/A"}
            icon={<FileText className="w-5 h-5" />}
            status={isOnline ? "online" : "offline"}
            subtitle="In user folders"
            accentColor="primary"
            isMetric
          />
        </motion.div>
        <motion.div variants={item}>
          <StatusCard
            title="Active Users"
            value={isOnline ? String(serverInfo.activeUsers.lastDay) : "N/A"}
            icon={<Users className="w-5 h-5" />}
            status={isOnline ? "online" : "offline"}
            subtitle="Last 24 hours"
            accentColor="primary"
            isMetric
          />
        </motion.div>
      </div>

      {/* Storage + System Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Storage card */}
        <motion.div variants={item} className="glass-card-static p-5">
          <div className="flex items-center gap-2 mb-4">
            <HardDrive className="w-4 h-4 text-text-muted" />
            <h3 className="text-sm font-medium text-text-secondary">Storage Capacity</h3>
          </div>
          <div className="flex flex-col items-center justify-center py-6">
            <CpuGauge
              value={isOnline ? 100 : 0}
              size={140}
              label="Freespace Available"
              color={isOnline ? "#00b4d8" : "#9ca3af"}
              unit=""
            />
            <p className="text-xs text-text-muted mt-3 text-center">
              {isOnline ? `Available: ${freeSpaceFormatted}` : "No storage details available"}
            </p>
          </div>
          {isOnline && (
            <div className="space-y-3 mt-4 pt-4 border-t border-border-subtle">
              <StorageBar
                label="Free Capacity"
                used={serverInfo.storage.free / (1024 * 1024 * 1024)}
                total={serverInfo.storage.free / (1024 * 1024 * 1024)}
                unit="GB"
                color="#00b4d8"
              />
            </div>
          )}
        </motion.div>

        <motion.div variants={item} className="space-y-4">
          {/* System Info */}
          <div className="glass-card-static p-5">
            <div className="flex items-center gap-2 mb-4">
              <Database className="w-4 h-4 text-text-muted" />
              <h3 className="text-sm font-medium text-text-secondary">System Information</h3>
            </div>
            <div className="space-y-3 text-sm">
              {[
                { label: "Version", value: serverInfo.version, status: isOnline ? "ok" : "error" },
                { label: "PHP Version", value: serverInfo.phpVersion, status: isOnline ? "ok" : "error" },
                {
                  label: "Database Type",
                  value: serverInfo.database.type,
                  status: isOnline ? "ok" : "error",
                },
                { label: "Web Server", value: serverInfo.webServer, status: isOnline ? "ok" : "error" },
                {
                  label: "Cron Job Status",
                  value: isOnline ? formatCronTime(serverInfo.cron.lastRun) : "Unknown",
                  status: isOnline ? serverInfo.cron.status : "error",
                },
                {
                  label: "Installed Apps",
                  value: isOnline
                    ? `${serverInfo.apps.installed} installed, ${serverInfo.apps.updatesAvailable} updates`
                    : "Unknown",
                  status: isOnline && serverInfo.apps.updatesAvailable === 0 ? "ok" : "warning",
                },
              ].map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between py-1.5 border-b border-border-subtle/50 last:border-0"
                >
                  <span className="text-text-muted">{row.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-text-primary">{row.value}</span>
                    {row.status === "ok" ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-success-400" />
                    ) : row.status === "warning" ? (
                      <AlertTriangle className="w-3.5 h-3.5 text-warning-400" />
                    ) : (
                      <AlertTriangle className="w-3.5 h-3.5 text-danger-400" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Users */}
          <div className="glass-card-static p-5">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-4 h-4 text-text-muted" />
              <h3 className="text-sm font-medium text-text-secondary">Active Users</h3>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold metric-value text-primary-400">
                  {isOnline ? serverInfo.activeUsers.last5min : "N/A"}
                </p>
                <p className="text-[10px] text-text-muted mt-1">Last 5 min</p>
              </div>
              <div>
                <p className="text-2xl font-bold metric-value text-text-primary">
                  {isOnline ? serverInfo.activeUsers.lastHour : "N/A"}
                </p>
                <p className="text-[10px] text-text-muted mt-1">Last hour</p>
              </div>
              <div>
                <p className="text-2xl font-bold metric-value text-text-secondary">
                  {isOnline ? serverInfo.activeUsers.lastDay : "N/A"}
                </p>
                <p className="text-[10px] text-text-muted mt-1">Last 24h</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
