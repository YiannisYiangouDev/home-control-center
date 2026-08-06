"use client";

import { motion } from "framer-motion";
import {
  Server,
  Cpu,
  MemoryStick,
  Thermometer,
  HardDrive,
  Wifi,
  Clock,
  Fan,
  AlertCircle,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { StatusCard } from "@/components/dashboard/status-card";
import { CpuGauge } from "@/components/dashboard/cpu-gauge";
import { StorageBar } from "@/components/dashboard/storage-bar";
import { cn } from "@/lib/utils";

const item = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

interface UnraidOverviewClientProps {
  systemInfo: any | null;
  arrayStatus: any | null;
  history?: any[];
}

export function UnraidOverviewClient({ systemInfo, arrayStatus, history = [] }: UnraidOverviewClientProps) {
  // Convert uptime ISO timestamp or seconds to Xd Xh format
  const formatUptime = (uptime?: string | number) => {
    if (!uptime) return "Unknown";
    let seconds: number;
    if (typeof uptime === "string") {
      // ISO timestamp = boot time; calculate elapsed
      const boot = new Date(uptime).getTime();
      if (isNaN(boot)) return "Unknown";
      seconds = Math.floor((Date.now() - boot) / 1000);
    } else {
      seconds = uptime;
    }
    if (seconds < 0) return "Unknown";
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    return `${d}d ${h}h`;
  };

  // Extract disks and array info
  const disks = arrayStatus?.disks || [];
  const dataDisks = disks.filter((d: any) => d.type === "DATA" || d.type === "data");
  
  // Calculate capacity in TB (sizes from API are in KB)
  const totalKB = dataDisks.reduce((acc: number, d: any) => acc + Number(d.size || 0), 0);
  const usedKB = dataDisks.reduce((acc: number, d: any) => acc + Number(d.fsUsed || 0), 0);
  const freeKB = dataDisks.reduce((acc: number, d: any) => acc + Number(d.fsFree || 0), 0);
  
  const totalTB = totalKB / (1024 * 1024 * 1024);
  const usedTB = usedKB / (1024 * 1024 * 1024);
  const freeTB = freeKB / (1024 * 1024 * 1024);
  
  const storageUsagePercent = totalTB > 0 ? Math.round((usedTB / totalTB) * 100) : 0;

  // Max disk temperature
  const diskTemps = disks.map((d: any) => Number(d.temp || 0)).filter((t: number) => t > 0);
  const maxDiskTemp = diskTemps.length > 0 ? Math.max(...diskTemps) : 0;

  // Normalize data structure (works with both old {info.cpu} and new {cpu} formats)
  const info = systemInfo?.info || systemInfo || {};
  
  // CPU details
  const cpuBrand = info?.cpu?.brand || "Unknown CPU";
  const cpuCores = info?.cpu?.cores || "Unknown";
  const hostname = info?.os?.hostname || "Unraid Server";
  const uptimeString = formatUptime(info?.os?.uptime);
  
  // Live metrics from the new split query
  const metrics = systemInfo?.metrics;
  const cpuPct = metrics?.cpu?.percentTotal;
  const memInfo = metrics?.memory;
  const memUsagePercent = memInfo ? Math.round(memInfo.percentTotal) : 0;
  const memUsedGB = memInfo ? ((Number(memInfo.total) - Number(memInfo.available || memInfo.free)) / (1024 * 1024 * 1024)) : 0;
  const memTotalGB = memInfo ? (Number(memInfo.total) / (1024 * 1024 * 1024)).toFixed(0) : null;
  const formattedHistory = history.map((h: any) => ({
    ...h,
    time: new Date(h.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  }));

  return (
    <div className="space-y-6">
      {/* Alert if system info is missing */}
      {!systemInfo && (
        <motion.div
          variants={item}
          className="flex items-start gap-3 p-4 rounded-xl bg-warning-400/10 border border-warning-400/20 text-warning-400 text-sm"
        >
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">System metrics restricted</p>
            <p className="text-xs text-warning-400/80 mt-1">
              The Unraid API key does not have the required scope. Enable INFO scope in Settings → Management Access → API Keys on your Unraid server.
            </p>
          </div>
        </motion.div>
      )}

      {/* Gauges Row */}
      <motion.div variants={item} className="glass-card-static p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-items-center">
          <CpuGauge
            value={cpuPct != null ? Math.round(cpuPct) : 0}
            label={cpuPct != null ? "CPU" : "CPU (no live data)"}
            color={cpuPct != null ? "#00b4d8" : "#9ca3af"}
          />
          <div className="flex flex-col items-center">
            <CpuGauge
              value={memUsagePercent}
              label="RAM"
              color={memUsagePercent > 0 ? "#00b4d8" : "#9ca3af"}
            />
            {memTotalGB && (
              <span className="text-[10px] text-text-muted mt-1 font-medium">
                {memUsedGB.toFixed(1)} / {memTotalGB} GB
              </span>
            )}
          </div>
          <CpuGauge value={storageUsagePercent} label="Storage Used" color="#f59e0b" />
          <CpuGauge value={maxDiskTemp} size={120} label="Max Disk Temp" color="#f87171" maxValue={80} unit="°C" />
        </div>
      </motion.div>

      {/* System Info Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div variants={item}>
          <StatusCard
            title="Uptime"
            value={uptimeString}
            icon={<Clock className="w-5 h-5" />}
            status={systemInfo ? "online" : "unknown"}
            subtitle="Since system start"
            accentColor="primary"
          />
        </motion.div>
        <motion.div variants={item}>
          <StatusCard
            title="Max Disk Temp"
            value={maxDiskTemp > 0 ? `${maxDiskTemp}°C` : "N/A"}
            icon={<Thermometer className="w-5 h-5" />}
            status={maxDiskTemp > 0 ? "online" : "unknown"}
            subtitle="SMART drive temp"
            accentColor="primary"
            isMetric
          />
        </motion.div>
        <motion.div variants={item}>
          <StatusCard
            title="Array Disks"
            value={`${disks.length} Drives`}
            icon={<HardDrive className="w-5 h-5" />}
            status={arrayStatus?.state === "STARTED" ? "online" : "offline"}
            subtitle={`State: ${arrayStatus?.state || "Unknown"}`}
            accentColor="primary"
          />
        </motion.div>
        <motion.div variants={item}>
          <StatusCard
            title="System Hostname"
            value={hostname}
            icon={<Server className="w-5 h-5" />}
            status={systemInfo ? "online" : "unknown"}
            subtitle={`${cpuCores} cores configured`}
            accentColor="primary"
          />
        </motion.div>
      </div>

      {/* CPU / Hardware details */}
      {systemInfo && (
        <motion.div variants={item} className="glass-card-static p-5">
          <div className="flex items-center gap-3 mb-4">
            <Cpu className="w-5 h-5 text-text-muted" />
            <h3 className="text-sm font-medium text-text-secondary">Processor & Platform</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex justify-between py-2 border-b border-border-subtle/50">
              <span className="text-text-muted">CPU Model</span>
              <span className="font-medium text-text-primary">{cpuBrand}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border-subtle/50">
              <span className="text-text-muted">Logical Cores</span>
              <span className="font-medium text-text-primary">{cpuCores} Cores</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border-subtle/50">
              <span className="text-text-muted">OS Platform</span>
              <span className="font-medium text-text-primary capitalize">{systemInfo?.os?.platform || "unraid"}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border-subtle/50">
              <span className="text-text-muted">Manufacturer</span>
              <span className="font-medium text-text-primary">{info?.cpu?.manufacturer || "Generic"}</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Storage Overview */}
      <motion.div variants={item}>
        <div className="glass-card-static p-5">
          <div className="flex items-center gap-2 mb-5">
            <HardDrive className="w-4 h-4 text-text-muted" />
            <h3 className="text-sm font-medium text-text-secondary">Disk Array Capacity</h3>
            <span
              className={cn(
                "ml-auto px-2 py-0.5 rounded-full text-[10px] font-medium border",
                arrayStatus?.state === "STARTED"
                  ? "bg-success-400/10 text-success-400 border-success-400/20"
                  : "bg-danger-400/10 text-danger-400 border-danger-400/20"
              )}
            >
              {arrayStatus?.state || "UNKNOWN"}
            </span>
          </div>
          {dataDisks.length > 0 ? (
            <div className="space-y-4">
              <div className="flex justify-between text-xs text-text-muted border-b border-border-subtle/50 pb-2">
                <span>Array space usage</span>
                <span className="metric-value font-medium text-text-secondary">
                  {usedTB.toFixed(2)} TB / {totalTB.toFixed(2)} TB ({storageUsagePercent}%)
                </span>
              </div>
              {disks.map((disk: any) => {
                const diskSizeTB = Number(disk.size || 0) / (1024 * 1024 * 1024);
                const diskUsedTB = Number(disk.fsUsed || 0) / (1024 * 1024 * 1024);
                
                // Color based on role
                const color = disk.type === "PARITY" || disk.type === "parity"
                  ? "#8b5cf6" 
                  : disk.type === "CACHE" || disk.type === "cache"
                  ? "#34d399" 
                  : "#00b4d8";

                return (
                  <StorageBar
                    key={disk.name}
                    label={`${disk.name} (${disk.device})`}
                    used={disk.type === "PARITY" || disk.type === "parity" ? diskSizeTB : diskUsedTB}
                    total={diskSizeTB}
                    unit="TB"
                    color={color}
                  />
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-text-muted text-center py-4">No disks returned by the array status query.</p>
          )}
        </div>
      </motion.div>

      {/* Historical Resource Charts */}
      {history && history.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* CPU / RAM History Chart */}
          <motion.div variants={item} className="glass-card-static p-5">
            <div className="flex items-center gap-3 mb-4">
              <Cpu className="w-5 h-5 text-text-muted" />
              <h3 className="text-sm font-medium text-text-secondary">System Load History (24h)</h3>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={formattedHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00b4d8" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#00b4d8" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorRam" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                  <XAxis dataKey="time" stroke="#9ca3af" fontSize={10} tickLine={false} />
                  <YAxis stroke="#9ca3af" fontSize={10} domain={[0, 100]} unit="%" tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: "8px" }}
                    labelStyle={{ color: "#9ca3af", fontSize: "12px" }}
                    itemStyle={{ fontSize: "12px" }}
                  />
                  <Area type="monotone" dataKey="cpu" name="CPU" stroke="#00b4d8" strokeWidth={2} fillOpacity={1} fill="url(#colorCpu)" />
                  <Area type="monotone" dataKey="ram" name="RAM" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorRam)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Disk Temperature History Chart */}
          <motion.div variants={item} className="glass-card-static p-5">
            <div className="flex items-center gap-3 mb-4">
              <Thermometer className="w-5 h-5 text-text-muted" />
              <h3 className="text-sm font-medium text-text-secondary">Max Disk Temperature (24h)</h3>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={formattedHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f87171" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#f87171" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                  <XAxis dataKey="time" stroke="#9ca3af" fontSize={10} tickLine={false} />
                  <YAxis stroke="#9ca3af" fontSize={10} domain={[20, 60]} unit="°C" tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: "8px" }}
                    labelStyle={{ color: "#9ca3af", fontSize: "12px" }}
                    itemStyle={{ fontSize: "12px" }}
                  />
                  <Area type="monotone" dataKey="temperature" name="Temp" stroke="#f87171" strokeWidth={2} fillOpacity={1} fill="url(#colorTemp)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
