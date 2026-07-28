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
  RefreshCw,
  Server,
} from "lucide-react";
import { StatusCard } from "@/components/dashboard/status-card";
import { CpuGauge } from "@/components/dashboard/cpu-gauge";
import { StorageBar } from "@/components/dashboard/storage-bar";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

export default function NextcloudPage() {
  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6 page-container">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Nextcloud</h1>
          <p className="text-sm text-text-muted mt-1">Cloud storage and collaboration platform</p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="status-dot status-dot-online" />
          <span className="text-success-400">Online · v29.0.1</span>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div variants={item}>
          <StatusCard title="Server" value="Healthy" icon={<Server className="w-5 h-5" />} status="online" subtitle="All checks passed" accentColor="success" />
        </motion.div>
        <motion.div variants={item}>
          <StatusCard title="Storage" value="68%" icon={<HardDrive className="w-5 h-5" />} status="online" subtitle="340 / 500 GB" accentColor="primary" isMetric />
        </motion.div>
        <motion.div variants={item}>
          <StatusCard title="Files" value="48,291" icon={<FileText className="w-5 h-5" />} status="online" subtitle="Total files" accentColor="primary" isMetric />
        </motion.div>
        <motion.div variants={item}>
          <StatusCard title="Active Users" value="3" icon={<Users className="w-5 h-5" />} status="online" subtitle="Last 24h" accentColor="primary" isMetric />
        </motion.div>
      </div>

      {/* Storage + System Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div variants={item} className="glass-card-static p-5">
          <div className="flex items-center gap-2 mb-4">
            <HardDrive className="w-4 h-4 text-text-muted" />
            <h3 className="text-sm font-medium text-text-secondary">Storage Usage</h3>
          </div>
          <div className="flex items-center justify-center mb-6">
            <CpuGauge value={68} size={140} label="Total Storage" color="#00b4d8" />
          </div>
          <div className="space-y-3">
            <StorageBar label="Documents" used={120} total={500} unit="GB" color="#60a5fa" />
            <StorageBar label="Photos" used={95} total={500} unit="GB" color="#f472b6" />
            <StorageBar label="Videos" used={80} total={500} unit="GB" color="#a78bfa" />
            <StorageBar label="Other" used={45} total={500} unit="GB" color="#34d399" />
          </div>
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
                { label: "Version", value: "29.0.1", status: "ok" },
                { label: "PHP", value: "8.3.6", status: "ok" },
                { label: "Database", value: "MariaDB 11.3", status: "ok" },
                { label: "Web Server", value: "nginx 1.25", status: "ok" },
                { label: "Cron", value: "Last run: 5 min ago", status: "ok" },
                { label: "Apps", value: "24 installed, 2 updates", status: "warning" },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between py-1.5 border-b border-border-subtle/50 last:border-0">
                  <span className="text-text-muted">{row.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-text-primary">{row.value}</span>
                    {row.status === "ok" ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-success-400" />
                    ) : (
                      <AlertTriangle className="w-3.5 h-3.5 text-warning-400" />
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
                <p className="text-2xl font-bold metric-value text-primary-400">2</p>
                <p className="text-[10px] text-text-muted mt-1">Last 5 min</p>
              </div>
              <div>
                <p className="text-2xl font-bold metric-value text-text-primary">3</p>
                <p className="text-[10px] text-text-muted mt-1">Last hour</p>
              </div>
              <div>
                <p className="text-2xl font-bold metric-value text-text-secondary">5</p>
                <p className="text-[10px] text-text-muted mt-1">Last 24h</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
