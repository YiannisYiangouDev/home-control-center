"use client";

import { motion } from "framer-motion";
import { HardDrive, CheckCircle2, AlertTriangle, Thermometer } from "lucide-react";
import { cn } from "@/lib/utils";

const item = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

interface ArrayDisk {
  name: string;
  device: string;
  size: number; // in KB
  fsUsed?: number; // in KB
  fsFree?: number; // in KB
  temp: number; // in °C
  status: string;
  type: string;
}

interface StorageClientProps {
  arrayStatus: {
    state: string;
    disks: ArrayDisk[];
  } | null;
}

export function StorageClient({ arrayStatus }: StorageClientProps) {
  const disks = arrayStatus?.disks || [];
  const dataDisks = disks.filter((d) => d.type === "DATA" || d.type === "data");

  // Sum calculations for data disks (sizes are in KB)
  const totalKB = dataDisks.reduce((acc, d) => acc + Number(d.size || 0), 0);
  const usedKB = dataDisks.reduce((acc, d) => acc + Number(d.fsUsed || 0), 0);
  const freeKB = dataDisks.reduce((acc, d) => acc + Number(d.fsFree || 0), 0);

  const totalTB = totalKB / (1024 * 1024 * 1024);
  const usedTB = usedKB / (1024 * 1024 * 1024);
  const freeTB = freeKB / (1024 * 1024 * 1024);

  return (
    <div className="space-y-6">
      {/* Summary */}
      <motion.div variants={item} className="glass-card-static p-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-xs text-text-muted">Array State</p>
            <p
              className={cn(
                "text-lg font-bold mt-1 uppercase",
                arrayStatus?.state === "STARTED" ? "text-success-400" : "text-danger-400"
              )}
            >
              {arrayStatus?.state || "UNKNOWN"}
            </p>
          </div>
          <div>
            <p className="text-xs text-text-muted">Total Capacity</p>
            <p className="text-lg font-bold metric-value text-text-primary mt-1">
              {totalTB.toFixed(2)} TB
            </p>
          </div>
          <div>
            <p className="text-xs text-text-muted">Used</p>
            <p className="text-lg font-bold metric-value text-text-primary mt-1">
              {usedTB.toFixed(2)} TB
            </p>
          </div>
          <div>
            <p className="text-xs text-text-muted">Free</p>
            <p className="text-lg font-bold metric-value text-success-400 mt-1">
              {freeTB.toFixed(2)} TB
            </p>
          </div>
        </div>
      </motion.div>

      {/* Disk Table */}
      <motion.div variants={item} className="glass-card-static overflow-hidden">
        <div className="px-5 py-4 border-b border-border-subtle">
          <h3 className="text-sm font-medium text-text-secondary flex items-center gap-2">
            <HardDrive className="w-4 h-4" /> Disk Health & Status
          </h3>
        </div>
        <div className="overflow-x-auto">
          {disks.length > 0 ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-subtle">
                  <th className="text-left px-5 py-3 text-xs font-medium text-text-muted">Disk</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-text-muted">Device</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-text-muted">Size</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-text-muted">Usage</th>
                  <th className="text-center px-5 py-3 text-xs font-medium text-text-muted">Temp</th>
                  <th className="text-center px-5 py-3 text-xs font-medium text-text-muted">Status</th>
                </tr>
              </thead>
              <tbody>
                {disks.map((disk) => {
                  const isParity = disk.type === "PARITY" || disk.type === "parity";
                  const isCache = disk.type === "CACHE" || disk.type === "cache";
                  
                  const diskSizeTB = Number(disk.size || 0) / (1024 * 1024 * 1024);
                  const diskUsedKB = Number(disk.fsUsed || 0);
                  const diskUsedPercent = !isParity && disk.size > 0 ? Math.round((diskUsedKB / disk.size) * 100) : 0;

                  return (
                    <tr
                      key={disk.name}
                      className="border-b border-border-subtle/50 hover:bg-bg-surface/30 transition-colors"
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <HardDrive
                            className={cn(
                              "w-4 h-4",
                              isParity ? "text-purple-400" : isCache ? "text-success-400" : "text-primary-400"
                            )}
                          />
                          <span className="font-medium text-text-primary capitalize">{disk.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-text-muted metric-value">/dev/{disk.device}</td>
                      <td className="px-5 py-3 text-text-secondary metric-value">
                        {diskSizeTB.toFixed(2)} TB
                      </td>
                      <td className="px-5 py-3 w-40">
                        {isParity ? (
                          <span className="text-xs text-text-muted">N/A (Parity)</span>
                        ) : (
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-bg-elevated rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${diskUsedPercent}%`,
                                  background: diskUsedPercent > 90 ? "#f87171" : "#00b4d8",
                                }}
                              />
                            </div>
                            <span className="text-xs text-text-muted metric-value">{diskUsedPercent}%</span>
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-3 text-center">
                        <span
                          className={cn(
                            "metric-value flex items-center justify-center gap-1",
                            disk.temp > 45 ? "text-warning-400" : "text-text-secondary"
                          )}
                        >
                          <Thermometer className="w-3.5 h-3.5 opacity-60" />
                          {disk.temp > 0 ? `${disk.temp}°C` : "N/A"}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-center">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border",
                            disk.status === "DISK_OK"
                              ? "bg-success-400/10 text-success-400 border-success-400/20"
                              : "bg-warning-400/10 text-warning-400 border-warning-400/20"
                          )}
                        >
                          {disk.status === "DISK_OK" ? (
                            <CheckCircle2 className="w-3 h-3" />
                          ) : (
                            <AlertTriangle className="w-3 h-3" />
                          )}
                          {disk.status === "DISK_OK" ? "OK" : disk.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <p className="text-sm text-text-muted text-center py-6">No storage disks found.</p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
