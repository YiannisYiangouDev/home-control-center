"use client";

import { motion } from "framer-motion";
import {
  HardDrive,
  CheckCircle2,
  AlertTriangle,
  Thermometer,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { StorageBar } from "@/components/dashboard/storage-bar";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

const mockDisks = [
  { name: "Parity 1", device: "sda", size: 8, used: 8, temp: 35, status: "OK", smart: "PASSED", type: "parity" },
  { name: "Disk 1", device: "sdb", size: 8, used: 6.2, temp: 33, status: "OK", smart: "PASSED", type: "data" },
  { name: "Disk 2", device: "sdc", size: 8, used: 5.8, temp: 34, status: "OK", smart: "PASSED", type: "data" },
  { name: "Disk 3", device: "sdd", size: 8, used: 7.1, temp: 36, status: "OK", smart: "PASSED", type: "data" },
  { name: "Disk 4", device: "sde", size: 8, used: 7.8, temp: 38, status: "WARNING", smart: "WARNING", type: "data" },
  { name: "Cache", device: "nvme0", size: 0.5, used: 0.18, temp: 42, status: "OK", smart: "PASSED", type: "cache" },
];

export default function StoragePage() {
  const totalSize = mockDisks.filter(d => d.type === "data").reduce((a, d) => a + d.size, 0);
  const totalUsed = mockDisks.filter(d => d.type === "data").reduce((a, d) => a + d.used, 0);

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6 page-container">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Storage</h1>
        <p className="text-sm text-text-muted mt-1">Disk health, SMART data, and array status</p>
      </div>

      {/* Summary */}
      <motion.div variants={item} className="glass-card-static p-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-xs text-text-muted">Array Status</p>
            <p className="text-lg font-bold text-success-400 mt-1">Started</p>
          </div>
          <div>
            <p className="text-xs text-text-muted">Total Capacity</p>
            <p className="text-lg font-bold metric-value text-text-primary mt-1">{totalSize} TB</p>
          </div>
          <div>
            <p className="text-xs text-text-muted">Used</p>
            <p className="text-lg font-bold metric-value text-text-primary mt-1">{totalUsed.toFixed(1)} TB</p>
          </div>
          <div>
            <p className="text-xs text-text-muted">Free</p>
            <p className="text-lg font-bold metric-value text-success-400 mt-1">{(totalSize - totalUsed).toFixed(1)} TB</p>
          </div>
        </div>
      </motion.div>

      {/* Disk Table */}
      <motion.div variants={item} className="glass-card-static overflow-hidden">
        <div className="px-5 py-4 border-b border-border-subtle">
          <h3 className="text-sm font-medium text-text-secondary flex items-center gap-2">
            <HardDrive className="w-4 h-4" /> Disk Health
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-subtle">
                <th className="text-left px-5 py-3 text-xs font-medium text-text-muted">Disk</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-text-muted">Device</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-text-muted">Size</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-text-muted">Usage</th>
                <th className="text-center px-5 py-3 text-xs font-medium text-text-muted">Temp</th>
                <th className="text-center px-5 py-3 text-xs font-medium text-text-muted">Status</th>
                <th className="text-center px-5 py-3 text-xs font-medium text-text-muted">SMART</th>
              </tr>
            </thead>
            <tbody>
              {mockDisks.map((disk) => (
                <tr key={disk.name} className="border-b border-border-subtle/50 hover:bg-bg-surface/30 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <HardDrive className={cn("w-4 h-4", disk.type === "parity" ? "text-purple-400" : disk.type === "cache" ? "text-success-400" : "text-primary-400")} />
                      <span className="font-medium text-text-primary">{disk.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-text-muted metric-value">{disk.device}</td>
                  <td className="px-5 py-3 text-text-secondary metric-value">{disk.size >= 1 ? `${disk.size} TB` : `${disk.size * 1000} GB`}</td>
                  <td className="px-5 py-3 w-40">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-bg-elevated rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${(disk.used / disk.size) * 100}%`,
                            background: (disk.used / disk.size) > 0.9 ? "#f87171" : "#00b4d8",
                          }}
                        />
                      </div>
                      <span className="text-xs text-text-muted metric-value">{((disk.used / disk.size) * 100).toFixed(0)}%</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-center">
                    <span className={cn("metric-value", disk.temp > 40 ? "text-warning-400" : "text-text-secondary")}>
                      {disk.temp}°C
                    </span>
                  </td>
                  <td className="px-5 py-3 text-center">
                    <span className={cn(
                      "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
                      disk.status === "OK" ? "bg-success-400/10 text-success-400" : "bg-warning-400/10 text-warning-400"
                    )}>
                      {disk.status === "OK" ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                      {disk.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-center">
                    <span className={cn(
                      "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
                      disk.smart === "PASSED" ? "bg-success-400/10 text-success-400" : "bg-warning-400/10 text-warning-400"
                    )}>
                      {disk.smart}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}
