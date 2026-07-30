"use client";

import { motion } from "framer-motion";
import {
  Server, Cpu, MemoryStick, HardDrive, Container,
  AlertTriangle, Thermometer, ArrowUpRight, ArrowDownRight, Wifi, Activity, Clock,
} from "lucide-react";
import { StatusCard } from "@/components/dashboard/status-card";
import { AlertFeed } from "@/components/dashboard/alert-feed";
import { QuickShortcuts } from "@/components/dashboard/quick-shortcuts";
import { SmartHomeCard } from "@/components/dashboard/SmartHomeCard";
import { cn } from "@/lib/utils";
import type { Service } from "@prisma/client";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

const serviceIcons: Record<string, string> = {
  Nextcloud: "☁️", Plex: "🎬", Jellyfin: "📺", "Home Assistant": "🏠",
  Vaultwarden: "🔐", "Pi-hole": "🛡️", Sonarr: "📡", Radarr: "🎥",
};

const statusColors: Record<string, string> = {
  ONLINE: "bg-success-400", OFFLINE: "bg-danger-400",
  DEGRADED: "bg-warning-400", UNKNOWN: "bg-text-muted",
};

interface DashboardClientProps {
  services: readonly (Service & { serverName?: string | null })[];
  alerts: readonly any[];
  shortcuts: readonly any[];
  haClimate: readonly any[];
  systemInfo: any;
  arrayStatus: any;
}

function formatUptime(uptime?: string) {
  if (!uptime) return "N/A";
  const boot = new Date(uptime).getTime();
  if (isNaN(boot)) return "N/A";
  const seconds = Math.floor((Date.now() - boot) / 1000);
  if (seconds < 0) return "N/A";
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  return `${d}d ${h}h`;
}

function computeStorage(arrayStatus: any, systemInfo: any) {
  // Prefer array.capacity (new API key) — values are in KB
  const capKB = systemInfo?.array?.capacity?.kilobytes;
  if (capKB) {
    const totalTB = Number(capKB.total) / (1024 * 1024 * 1024);
    const usedTB = Number(capKB.used) / (1024 * 1024 * 1024);
    const freeTB = Number(capKB.free) / (1024 * 1024 * 1024);
    const pct = totalTB > 0 ? Math.round((usedTB / totalTB) * 100) : 0;
    return { totalTB, usedTB, freeTB, pct };
  }
  // Fallback: individual disks from arrayStatus
  const disks = arrayStatus?.disks || [];
  const dataDisks = disks.filter((d: any) => d.type === "DATA" || d.type === "data");
  const totalKB = dataDisks.reduce((acc: number, d: any) => acc + Number(d.size || 0), 0);
  const usedKB = dataDisks.reduce((acc: number, d: any) => acc + Number(d.fsUsed || 0), 0);
  const freeKB = dataDisks.reduce((acc: number, d: any) => acc + Number(d.fsFree || 0), 0);
  const totalTB = totalKB / (1024 * 1024 * 1024);
  const usedTB = usedKB / (1024 * 1024 * 1024);
  const freeTB = freeKB / (1024 * 1024 * 1024);
  const pct = totalTB > 0 ? Math.round((usedTB / totalTB) * 100) : 0;
  return { totalTB, usedTB, freeTB, pct };
}

function computeCpu(systemInfo: any) {
  const cpu = systemInfo?.metrics?.cpu;
  if (cpu && typeof cpu.percentTotal === "number") {
    const cpus = cpu.cpus || [];
    const cores = cpus.map((c: any) => c.percentTotal).filter((v: any) => typeof v === "number");
    return { total: Math.round(cpu.percentTotal), cores };
  }
  return null;
}

function computeMemory(systemInfo: any) {
  const mem = systemInfo?.metrics?.memory;
  if (mem) {
    const totalGB = Number(mem.total) / (1024 * 1024 * 1024);
    const freeGB = Number(mem.free) / (1024 * 1024 * 1024);
    const usedGB = Number(mem.used) / (1024 * 1024 * 1024);
    const pct = typeof mem.percentTotal === "number" ? Math.round(mem.percentTotal) : (totalGB > 0 ? Math.round((usedGB / totalGB) * 100) : 0);
    const swapTotal = Number(mem.swapTotal || 0) / (1024 * 1024 * 1024);
    const swapFree = Number(mem.swapFree || 0) / (1024 * 1024 * 1024);
    return { totalGB, freeGB, usedGB, pct, swapTotal, swapFree };
  }
  return null;
}

function computeNetwork(systemInfo: any) {
  const interfaces = systemInfo?.metrics?.network;
  if (!interfaces || !Array.isArray(interfaces)) return null;
  // Sum all non-loopback interfaces
  let totalRx = 0, totalTx = 0;
  for (const iface of interfaces) {
    if (iface.name === "lo") continue;
    totalRx += Number(iface.rxSec || 0);
    totalTx += Number(iface.txSec || 0);
  }
  // Convert to MB/s
  const rxMB = totalRx / (1024 * 1024);
  const txMB = totalTx / (1024 * 1024);
  return { rxMB, txMB, rxRaw: totalRx, txRaw: totalTx };
}

export function DashboardClient({ services, alerts, shortcuts, haClimate, systemInfo, arrayStatus }: DashboardClientProps) {
  const online = services.filter((s) => s.status === "ONLINE").length;
  const offline = services.filter((s) => s.status === "OFFLINE").length;

  const storage = computeStorage(arrayStatus, systemInfo);
  const memory = computeMemory(systemInfo);
  const cpu = computeCpu(systemInfo);
  const network = computeNetwork(systemInfo);
  const diskTemps = (arrayStatus?.disks || []).map((d: any) => Number(d.temp || 0)).filter((t: number) => t > 0);
  const maxTemp = diskTemps.length > 0 ? Math.max(...diskTemps) : 0;
  const cpuBrand = systemInfo?.info?.cpu?.brand || null;
  const cpuCores = systemInfo?.info?.cpu?.cores;
  const cpuThreads = systemInfo?.info?.cpu?.threads;
  const cpuSpeed = systemInfo?.info?.cpu?.speed;
  const osInfo = systemInfo?.info?.os;
  const hostname = osInfo?.hostname || "Unraid";
  const uptime = formatUptime(osInfo?.uptime);
  const hasUnraid = !!(arrayStatus || systemInfo?.info);

  const getServicesStatus = () => {
    if (offline > 0) return "warning" as const;
    if (online > 0) return "online" as const;
    return "unknown" as const;
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      {/* Status Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div variants={itemVariants}>
          <StatusCard title="Server" value={hasUnraid ? "Online" : "N/A"} icon={<Server className="w-5 h-5" />} status={hasUnraid ? "online" : "unknown"} subtitle={hasUnraid ? `Uptime: ${uptime}` : "No Unraid configured"} accentColor="primary" />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatusCard title="CPU" value={cpu ? `${cpu.total}%` : "N/A"} icon={<Cpu className="w-5 h-5" />} status={cpu ? (cpu.total > 80 ? "warning" : "online") : "unknown"} subtitle={cpuBrand ? `${cpuBrand} · ${cpuThreads || cpuCores || "?"}T @ ${cpuSpeed || "?"}GHz` : "No data"} accentColor={cpu && cpu.total > 80 ? "warning" : "primary"} isMetric />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatusCard title="RAM" value={memory ? `${memory.pct}%` : "N/A"} icon={<MemoryStick className="w-5 h-5" />} status={memory ? (memory.pct > 85 ? "warning" : "online") : "unknown"} subtitle={memory ? `${memory.usedGB.toFixed(1)} / ${memory.totalGB.toFixed(1)} GB` : "No live data"} accentColor={memory && memory.pct > 85 ? "warning" : "primary"} isMetric />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatusCard title="Storage" value={storage.pct > 0 ? `${storage.pct}%` : "N/A"} icon={<HardDrive className="w-5 h-5" />} status={storage.pct > 80 ? "warning" : storage.pct > 0 ? "online" : "unknown"} subtitle={storage.pct > 0 ? `${storage.usedTB.toFixed(1)} / ${storage.totalTB.toFixed(1)} TB` : "No data"} accentColor={storage.pct > 80 ? "warning" : "primary"} isMetric />
        </motion.div>
      </div>

      {/* Secondary Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div variants={itemVariants}>
          <StatusCard title="Docker" value={systemInfo ? "Connected" : "N/A"} icon={<Container className="w-5 h-5" />} status={systemInfo ? "online" : "unknown"} subtitle={systemInfo ? `${cpuCores || "?"} cores` : "No data"} accentColor="success" />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatusCard title="Alerts" value={String(alerts.length)} icon={<AlertTriangle className="w-5 h-5" />} status={alerts.some((a: any) => a.severity === "CRITICAL") ? "warning" : alerts.length > 0 ? "online" : "online"} subtitle={alerts.length === 0 ? "None" : `${alerts.filter((a: any) => a.severity === "CRITICAL").length} critical`} accentColor={alerts.some((a: any) => a.severity === "CRITICAL") ? "danger" : "primary"} />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatusCard title="Temp" value={maxTemp > 0 ? `${maxTemp}°C` : "N/A"} icon={<Thermometer className="w-5 h-5" />} status={maxTemp > 60 ? "warning" : maxTemp > 0 ? "online" : "unknown"} subtitle="Max disk" accentColor={maxTemp > 60 ? "danger" : "primary"} isMetric />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatusCard title="Services" value={services.length > 0 ? `${online}/${services.length}` : "0"} icon={<Activity className="w-5 h-5" />} status={getServicesStatus()} subtitle={services.length > 0 ? `${offline} offline` : "None configured"} accentColor="primary" />
        </motion.div>
      </div>

      {/* Services Grid */}
      {services.length > 0 && (
        <motion.div variants={itemVariants} className="glass-card-static p-5">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-4 h-4 text-text-muted" />
            <h3 className="text-sm font-medium text-text-secondary">Services</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
            {services.slice(0, 6).map((svc) => (
              <div key={svc.id} className="flex items-center gap-2 p-3 rounded-lg bg-bg-elevated border border-border-subtle">
                <span className="text-lg">{serviceIcons[svc.name] || "🔧"}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-text-primary truncate">{svc.name}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className={cn("w-1.5 h-1.5 rounded-full", statusColors[svc.status] || "bg-text-muted")} />
                    <span className="text-[10px] text-text-muted">{svc.status}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {haClimate && haClimate.length > 0 && (
        <motion.div variants={itemVariants}>
          <SmartHomeCard climate={haClimate} />
        </motion.div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div variants={itemVariants}>
          <div className="glass-card-static p-5 h-full">
            <div className="flex items-center gap-2 mb-4">
              <Cpu className="w-4 h-4 text-text-muted" />
              <h3 className="text-sm font-medium text-text-secondary">CPU Usage</h3>
            </div>
            {cpu ? (
              <div className="space-y-3">
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-bold text-text-primary">{cpu.total}%</span>
                  <span className="text-sm text-text-muted mb-0.5">{cpu.cores.length} cores</span>
                </div>
                <div className="h-3 bg-bg-elevated rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-[#00b4d8] transition-all" style={{ width: `${cpu.total}%` }} />
                </div>
                {cpu.cores.length > 0 && (
                  <div className="flex gap-1 items-end" style={{ height: 48 }}>
                    {cpu.cores.map((load: number, i: number) => (
                      <div key={i} className="flex-1 bg-[#00b4d8]/30 rounded-t relative" style={{ height: `${Math.max(load, 2)}%` }}>
                        <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[9px] text-text-muted">C{i}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-text-muted text-center py-8">{hasUnraid ? "CPU metrics not available" : "Connect an Unraid server to view metrics"}</p>
            )}
          </div>
        </motion.div>
        <motion.div variants={itemVariants}>
          <div className="glass-card-static p-5 h-full">
            <div className="flex items-center gap-2 mb-4">
              <MemoryStick className="w-4 h-4 text-text-muted" />
              <h3 className="text-sm font-medium text-text-secondary">RAM Usage</h3>
            </div>
            {memory ? (
              <div className="space-y-3">
                <div className="flex justify-between text-3xl font-bold text-text-primary">
                  <span>{memory.pct}%</span>
                  <span className="text-sm font-normal text-text-muted self-end">used</span>
                </div>
                <div className="h-3 bg-bg-elevated rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-[#34d399] transition-all" style={{ width: `${memory.pct}%` }} />
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div><span className="text-text-muted block">Total</span><span className="text-text-primary font-medium">{memory.totalGB.toFixed(1)} GB</span></div>
                  <div><span className="text-text-muted block">Used</span><span className="text-text-primary font-medium">{memory.usedGB.toFixed(1)} GB</span></div>
                  <div><span className="text-text-muted block">Free</span><span className="text-text-primary font-medium">{memory.freeGB.toFixed(1)} GB</span></div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-text-muted text-center py-8">Unraid GraphQL does not expose live RAM utilization</p>
            )}
          </div>
        </motion.div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div variants={itemVariants}>
          <div className="glass-card-static p-5 h-full">
            <div className="flex items-center gap-2 mb-4">
              <HardDrive className="w-4 h-4 text-text-muted" />
              <h3 className="text-sm font-medium text-text-secondary">Storage Overview</h3>
            </div>
            {storage.pct > 0 ? (
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs text-text-muted mb-1"><span>Array</span><span>{storage.usedTB.toFixed(1)} / {storage.totalTB.toFixed(1)} TB</span></div>
                  <div className="h-2 bg-bg-elevated rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-[#00b4d8] transition-all" style={{ width: `${storage.pct}%` }} />
                  </div>
                  <div className="flex justify-between text-[10px] text-text-muted mt-0.5"><span>{storage.pct}% used</span><span>{storage.freeTB ? storage.freeTB.toFixed(1) : (storage.totalTB - storage.usedTB).toFixed(1)} TB free</span></div>
                </div>
                {(arrayStatus?.disks || []).filter((d: any) => d.type === "DATA" || d.type === "data").map((disk: any) => {
                  const dTotal = Number(disk.size || 0) / (1024 * 1024 * 1024);
                  const dUsed = Number(disk.fsUsed || 0) / (1024 * 1024 * 1024);
                  const dPct = dTotal > 0 ? Math.round((dUsed / dTotal) * 100) : 0;
                  return (
                    <div key={disk.name}>
                      <div className="flex justify-between text-xs text-text-muted mb-1"><span>{disk.name} ({disk.device})</span><span>{dUsed.toFixed(1)} / {dTotal.toFixed(1)} TB</span></div>
                      <div className="h-1.5 bg-bg-elevated rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-[#34d399] transition-all" style={{ width: `${dPct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-text-muted text-center py-8">Connect an Unraid server in Settings</p>
            )}
          </div>
        </motion.div>
        <motion.div variants={itemVariants}>
          {alerts.length > 0 ? (
            <AlertFeed alerts={alerts} />
          ) : (
            <div className="glass-card-static p-5 h-full flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-4 h-4 text-text-muted" />
                <h3 className="text-sm font-medium text-text-secondary">Recent Alerts</h3>
              </div>
              <div className="flex-1 flex items-center justify-center text-sm text-text-muted">No active alerts</div>
            </div>
          )}
        </motion.div>
        <motion.div variants={itemVariants}>
          <QuickShortcuts shortcuts={shortcuts} />
        </motion.div>
      </div>

      {/* Network */}
      <motion.div variants={itemVariants}>
        <div className="glass-card-static p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Wifi className="w-4 h-4 text-text-muted" />
              <h3 className="text-sm font-medium text-text-secondary">Network Traffic</h3>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1 text-primary-400"><ArrowDownRight className="w-3 h-3" /> In</span>
              <span className="flex items-center gap-1 text-success-400"><ArrowUpRight className="w-3 h-3" /> Out</span>
            </div>
          </div>
          {network ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-bg-elevated">
                  <div className="flex items-center gap-2 mb-1">
                    <ArrowDownRight className="w-4 h-4 text-primary-400" />
                    <span className="text-xs text-text-muted">Download</span>
                  </div>
                  <span className="text-xl font-bold text-text-primary">
                    {network.rxMB < 1 ? `${(network.rxRaw / 1024).toFixed(1)} KB/s` : `${network.rxMB.toFixed(1)} MB/s`}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-bg-elevated">
                  <div className="flex items-center gap-2 mb-1">
                    <ArrowUpRight className="w-4 h-4 text-success-400" />
                    <span className="text-xs text-text-muted">Upload</span>
                  </div>
                  <span className="text-xl font-bold text-text-primary">
                    {network.txMB < 1 ? `${(network.txRaw / 1024).toFixed(1)} KB/s` : `${network.txMB.toFixed(1)} MB/s`}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-xs text-text-muted">
                <span>Total RX: {network.rxRaw < 1024 ? `${network.rxRaw.toFixed(0)} B/s` : `${(network.rxRaw / 1024).toFixed(0)} KB/s`}</span>
                <span>Total TX: {network.txRaw < 1024 ? `${network.txRaw.toFixed(0)} B/s` : `${(network.txRaw / 1024).toFixed(0)} KB/s`}</span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-text-muted text-center py-8">Connect an Unraid server to view network traffic</p>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
