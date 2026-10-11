"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Server, Cpu, MemoryStick, HardDrive, Container,
  AlertTriangle, Thermometer, ArrowUpRight, ArrowDownRight, Wifi, Activity,
  CloudSun, Wind, Pencil, Check, X, ArrowUp, ArrowDown, EyeOff, Eye,
} from "lucide-react";
import { StatusCard } from "@/components/dashboard/status-card";
import { AlertFeed } from "@/components/dashboard/alert-feed";
import { QuickShortcuts } from "@/components/dashboard/quick-shortcuts";
import { SmartHomeCard } from "@/components/dashboard/SmartHomeCard";
import { cn } from "@/lib/utils";
import type { Service } from "@prisma/client";
import type { WeatherData } from "@/actions/weather";
import { WIDGETS, resolveLayout, type WidgetId } from "@/components/dashboard/widgets/registry";
import { saveLayout } from "@/actions/layout";

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
const WEATHER_EMOJI: Record<number, string> = {
  0: "☀️", 1: "🌤️", 2: "⛅", 3: "☁️", 45: "🌫️", 48: "🌫️",
  51: "🌦️", 53: "🌦️", 55: "🌧️", 61: "🌧️", 63: "🌧️", 65: "🌧️",
  71: "🌨️", 73: "🌨️", 75: "❄️", 80: "🌦️", 81: "🌧️", 82: "⛈️",
  95: "⛈️", 96: "⛈️", 99: "⛈️",
};

interface DashboardClientProps {
  services: readonly (Service & { serverName?: string | null })[];
  alerts: readonly any[];
  shortcuts: readonly any[];
  haClimate: readonly any[];
  systemInfo: any;
  arrayStatus: any;
  layout: { order: WidgetId[]; hidden: Set<WidgetId> };
  savedLayout: { order?: string[]; hidden?: string[] } | null;
  weather: WeatherData | null;
  containers: readonly any[];
  nextcloud: any | null;
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

export function DashboardClient({
  services, alerts, shortcuts, haClimate, systemInfo, arrayStatus, layout, savedLayout, weather, containers, nextcloud,
}: DashboardClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);
  const [order, setOrder] = useState<WidgetId[]>(layout.order);
  const [hidden, setHidden] = useState<Set<WidgetId>>(new Set(layout.hidden));

  const online = services.filter((s) => s.status === "ONLINE").length;
  const offline = services.filter((s) => s.status === "OFFLINE").length;

  const storage = useMemo(() => computeStorage(arrayStatus, systemInfo), [arrayStatus, systemInfo]);
  const memory = useMemo(() => computeMemory(systemInfo), [systemInfo]);
  const cpu = useMemo(() => computeCpu(systemInfo), [systemInfo]);
  const network = useMemo(() => computeNetwork(systemInfo), [systemInfo]);
  const diskTemps = useMemo(
    () => (arrayStatus?.disks || []).map((d: any) => Number(d.temp || 0)).filter((t: number) => t > 0),
    [arrayStatus]
  );
  const maxTemp = diskTemps.length > 0 ? Math.max(...diskTemps) : 0;
  const hasUnraid = !!(arrayStatus || systemInfo?.info);

  const startEdit = () => { setOrder(layout.order); setHidden(new Set(layout.hidden)); setEditing(true); };
  const cancelEdit = () => { setOrder(layout.order); setHidden(new Set(layout.hidden)); setEditing(false); };
  const resetEdit = () => { setOrder(WIDGETS_DEFAULT_ORDER()); setHidden(new Set()); };

  const save = () => {
    const payload = { order: [...order], hidden: [...hidden] };
    startTransition(async () => {
      const res = await saveLayout(payload);
      if (res.success) { setEditing(false); router.refresh(); }
    });
  };

  const move = (arr: WidgetId[], from: number, to: number) => {
    const next = [...arr];
    const [x] = next.splice(from, 1);
    next.splice(to, 0, x);
    return next;
  };

  // ----- render helpers -----------------------------------------------------

  const renderStatusCards = () => (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatusCard title="Server" value={hasUnraid ? "Online" : "N/A"} icon={<Server className="w-5 h-5" />} status={hasUnraid ? "online" : "unknown"} subtitle={hasUnraid ? `Uptime: ${formatUptime(osInfo()?.uptime)}` : "No Unraid configured"} accentColor="primary" />
        <StatusCard title="CPU" value={cpu ? `${cpu.total}%` : "N/A"} icon={<Cpu className="w-5 h-5" />} status={cpu ? (cpu.total > 80 ? "warning" : "online") : "unknown"} subtitle={cpuBrand() ? `${cpuBrand()} · ${infoThreads()}T @ ${cpuSpeed() || "?"}GHz` : "No data"} accentColor={cpu && cpu.total > 80 ? "warning" : "primary"} isMetric />
        <StatusCard title="RAM" value={memory ? `${memory.pct}%` : "N/A"} icon={<MemoryStick className="w-5 h-5" />} status={memory ? (memory.pct > 85 ? "warning" : "online") : "unknown"} subtitle={memory ? `${memory.usedGB.toFixed(1)} / ${memory.totalGB.toFixed(1)} GB` : "No live data"} accentColor={memory && memory.pct > 85 ? "warning" : "primary"} isMetric />
        <StatusCard title="Storage" value={storage.pct > 0 ? `${storage.pct}%` : "N/A"} icon={<HardDrive className="w-5 h-5" />} status={storage.pct > 80 ? "warning" : storage.pct > 0 ? "online" : "unknown"} subtitle={storage.pct > 0 ? `${storage.usedTB.toFixed(1)} / ${storage.totalTB.toFixed(1)} TB` : "No data"} accentColor={storage.pct > 80 ? "warning" : "primary"} isMetric />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatusCard title="Docker" value={systemInfo ? "Connected" : "N/A"} icon={<Container className="w-5 h-5" />} status={systemInfo ? "online" : "unknown"} subtitle={systemInfo ? `${infoThreads() || "?"} cores` : "No data"} accentColor="success" />
        <StatusCard title="Alerts" value={String(alerts.length)} icon={<AlertTriangle className="w-5 h-5" />} status={alerts.some((a: any) => a.severity === "CRITICAL") ? "warning" : "online"} subtitle={alerts.length === 0 ? "None" : `${alerts.filter((a: any) => a.severity === "CRITICAL").length} critical`} accentColor={alerts.some((a: any) => a.severity === "CRITICAL") ? "danger" : "primary"} />
        <StatusCard title="Temp" value={maxTemp > 0 ? `${maxTemp}°C` : "N/A"} icon={<Thermometer className="w-5 h-5" />} status={maxTemp > 60 ? "warning" : maxTemp > 0 ? "online" : "unknown"} subtitle="Max disk" accentColor={maxTemp > 60 ? "danger" : "primary"} isMetric />
        <StatusCard title="Services" value={services.length > 0 ? `${online}/${services.length}` : "0"} icon={<Activity className="w-5 h-5" />} status={offline > 0 ? "warning" : online > 0 ? "online" : "unknown"} subtitle={services.length > 0 ? `${offline} offline` : "None configured"} accentColor="primary" />
      </div>
    </>
  );

  const renderServices = () => (
    <div className="glass-card-static p-5">
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
    </div>
  );

  const renderClimate = () => (haClimate && haClimate.length > 0 ? <SmartHomeCard climate={haClimate} /> : null);

  const renderCharts = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
    </div>
  );

  const renderStorage = () => (
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
  );

  const renderAlerts = () => (
    alerts.length > 0 ? <AlertFeed alerts={alerts} /> : (
      <div className="glass-card-static p-5 h-full flex flex-col">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-4 h-4 text-text-muted" />
          <h3 className="text-sm font-medium text-text-secondary">Recent Alerts</h3>
        </div>
        <div className="flex-1 flex items-center justify-center text-sm text-text-muted">No active alerts</div>
      </div>
    )
  );

  const renderShortcuts = () => <QuickShortcuts shortcuts={shortcuts} />;

  const renderNetwork = () => (
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
  );

  const renderWeather = () => (
    weather ? (
      <div className="glass-card-static p-5 h-full">
        <div className="flex items-center gap-2 mb-4">
          <CloudSun className="w-4 h-4 text-text-muted" />
          <h3 className="text-sm font-medium text-text-secondary">Weather</h3>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-4xl">{WEATHER_EMOJI[weather.code] ?? "🌡️"}</span>
          <div>
            <div className="text-3xl font-bold text-text-primary">{weather.temp.toFixed(0)}°C</div>
            <div className="flex items-center gap-1 text-xs text-text-muted"><Wind className="w-3 h-3" /> {weather.windSpeed.toFixed(0)} km/h</div>
          </div>
        </div>
      </div>
    ) : null
  );

  const renderContainers = () => {
    if (!containers || containers.length === 0) {
      return (
        <div className="glass-card-static p-5 h-full">
          <div className="flex items-center gap-2 mb-4">
            <Container className="w-4 h-4 text-text-muted" />
            <h3 className="text-sm font-medium text-text-secondary">Containers</h3>
          </div>
          <p className="text-sm text-text-muted">No container data — connect Unraid in Settings.</p>
        </div>
      );
    }
    const running = containers.filter((c: any) => c.state === "running").length;
    const containerName = (c: any) => (Array.isArray(c.names) && c.names[0] ? c.names[0].replace(/^\//, "") : c.id?.slice(0, 12) || "?");
    return (
      <div className="glass-card-static p-5 h-full">
        <div className="flex items-center gap-2 mb-4">
          <Container className="w-4 h-4 text-text-muted" />
          <h3 className="text-sm font-medium text-text-secondary">Containers</h3>
        </div>
        <div className="space-y-3">
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-text-primary">{running}</span>
            <span className="text-sm text-text-muted mb-0.5">/ {containers.length} running</span>
          </div>
          <div className="space-y-1.5">
            {containers.slice(0, 8).map((c: any) => (
              <div key={c.id} className="flex items-center gap-2 text-sm">
                <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", c.state === "running" ? "bg-success-400" : "bg-danger-400")} />
                <span className="truncate text-text-primary">{containerName(c)}</span>
              </div>
            ))}
            {containers.length > 8 && (
              <p className="text-xs text-text-muted">+{containers.length - 8} more</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderNextcloud = () => {
    const st = nextcloud?.storage;
    if (!st || !st.total) {
      return (
        <div className="glass-card-static p-5 h-full">
          <div className="flex items-center gap-2 mb-4">
            <HardDrive className="w-4 h-4 text-text-muted" />
            <h3 className="text-sm font-medium text-text-secondary">Nextcloud quota</h3>
          </div>
          <p className="text-sm text-text-muted">Nextcloud not connected.</p>
        </div>
      );
    }
    const usedGB = st.used / 1e9;
    const totalGB = st.total / 1e9;
    const freeGB = st.free / 1e9;
    const pct = totalGB > 0 ? Math.round((usedGB / totalGB) * 100) : 0;
    return (
      <div className="glass-card-static p-5 h-full">
        <div className="flex items-center gap-2 mb-4">
          <HardDrive className="w-4 h-4 text-text-muted" />
          <h3 className="text-sm font-medium text-text-secondary">Nextcloud quota</h3>
        </div>
        <div className="space-y-3">
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-text-primary">{pct}%</span>
            <span className="text-sm text-text-muted mb-0.5">used</span>
          </div>
          <div className="h-2 bg-bg-elevated rounded-full overflow-hidden">
            <div className="h-full rounded-full bg-[#00b4d8] transition-all" style={{ width: `${pct}%` }} />
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div><span className="text-text-muted block">Used</span><span className="text-text-primary font-medium">{usedGB.toFixed(1)} GB</span></div>
            <div><span className="text-text-muted block">Free</span><span className="text-text-primary font-medium">{freeGB.toFixed(1)} GB</span></div>
            <div><span className="text-text-muted block">Files</span><span className="text-text-primary font-medium">{st.numFiles?.toLocaleString?.() ?? st.numFiles ?? "?"}</span></div>
          </div>
        </div>
      </div>
    );
  };

  const renderWidget = (id: WidgetId) => {
    switch (id) {
      case "status": return renderStatusCards();
      case "services": return renderServices();
      case "climate": return renderClimate();
      case "charts": return renderCharts();
      case "storage": return renderStorage();
      case "alerts": return renderAlerts();
      case "shortcuts": return renderShortcuts();
      case "network": return renderNetwork();
      case "weather": return renderWeather();
      case "containers": return renderContainers();
      case "nextcloud": return renderNextcloud();
      default: return null;
    }
  };

  // ----- helpers (kept local so render fns can call them) -------------------

  function osInfo() { return systemInfo?.info?.os || null; }
  function cpuBrand() { return systemInfo?.info?.cpu?.brand || null; }
  function cpuSpeed() { return systemInfo?.info?.cpu?.speed || null; }
  function infoThreads() { return systemInfo?.info?.cpu?.threads || systemInfo?.info?.cpu?.cores; }

  function WIDGETS_DEFAULT_ORDER(): WidgetId[] { return Object.keys(WIDGETS) as WidgetId[]; }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      {editing && (
        <div className="glass-card-static p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2"><Pencil className="w-4 h-4" /> Edit layout — drag-free (▲▼ reorder, ◉ hide)</h3>
            <div className="flex items-center gap-2">
              <button onClick={resetEdit} className="px-3 py-1.5 text-xs rounded-lg bg-bg-elevated border border-border-subtle text-text-muted hover:text-text-primary">Reset</button>
              <button onClick={cancelEdit} className="px-3 py-1.5 text-xs rounded-lg bg-bg-elevated border border-border-subtle text-text-muted hover:text-text-primary flex items-center gap-1"><X className="w-3 h-3" /> Cancel</button>
              <button onClick={save} disabled={isPending} className="px-3 py-1.5 text-xs rounded-lg bg-primary-500 text-white font-medium flex items-center gap-1">
                <Check className="w-3 h-3" /> {isPending ? "Saving…" : "Save"}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {order.map((id, i) => (
              <div key={id} className="flex items-center gap-2 p-2 rounded-lg bg-bg-elevated border border-border-subtle">
                <span className="text-sm font-medium text-text-primary flex-1">{WIDGETS[id]?.title ?? id}</span>
                <button onClick={() => i > 0 && setOrder(move(order, i, i - 1))} className="p-1 rounded hover:bg-bg-muted text-text-muted"><ArrowUp className="w-4 h-4" /></button>
                <button onClick={() => i < order.length - 1 && setOrder(move(order, i, i + 1))} className="p-1 rounded hover:bg-bg-muted text-text-muted"><ArrowDown className="w-4 h-4" /></button>
                <button onClick={() => { setHidden(new Set(hidden).add(id)); setOrder(order.filter((w) => w !== id)); }} className="p-1 rounded hover:bg-bg-muted text-text-muted"><EyeOff className="w-4 h-4" /></button>
              </div>
            ))}
          </div>

          {hidden.size > 0 && (
            <div className="flex flex-wrap gap-2 pt-1 border-t border-border-subtle">
              <span className="text-xs text-text-muted self-center">Hidden:</span>
              {[...hidden].map((id) => (
                <button key={id} onClick={() => { setHidden(new Set([...hidden].filter((h) => h !== id))); setOrder([...order, id]); }} className="px-2 py-1 text-xs rounded-lg bg-bg-elevated border border-border-subtle text-text-muted flex items-center gap-1 hover:text-text-primary">
                  <Eye className="w-3 h-3" /> {WIDGETS[id]?.title ?? id}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {!editing && (
        <div className="flex justify-end">
          <button onClick={startEdit} className="px-3 py-1.5 text-xs rounded-lg bg-bg-elevated border border-border-subtle text-text-muted hover:text-text-primary flex items-center gap-1">
            <Pencil className="w-3 h-3" /> Edit layout
          </button>
        </div>
      )}

      {order.filter((id) => !hidden.has(id)).map((id) => (
        <motion.div key={id} variants={itemVariants}>{renderWidget(id)}</motion.div>
      ))}
    </motion.div>
  );
}

function computeStorage(arrayStatus: any, systemInfo: any) {
  const capKB = systemInfo?.array?.capacity?.kilobytes;
  if (capKB) {
    const totalTB = Number(capKB.total) / (1024 * 1024 * 1024);
    const usedTB = Number(capKB.used) / (1024 * 1024 * 1024);
    const freeTB = Number(capKB.free) / (1024 * 1024 * 1024);
    const pct = totalTB > 0 ? Math.round((usedTB / totalTB) * 100) : 0;
    return { totalTB, usedTB, freeTB, pct };
  }
  const disks = arrayStatus?.disks || [];
  const dataDisks = disks.filter((d: any) => d.type === "DATA" || d.type === "data");
  const totalKB = dataDisks.reduce((acc: number, d: any) => acc + Number(d.size || 0), 0);
  const usedKB = dataDisks.reduce((acc: number, d: any) => acc + Number(d.fsUsed || 0), 0);
  const freeKB = dataDisks.reduce((acc: number, d: any) => acc + Number(d.fsFree || 0), 0);
  return {
    totalTB: totalKB / (1024 * 1024 * 1024),
    usedTB: usedKB / (1024 * 1024 * 1024),
    freeTB: freeKB / (1024 * 1024 * 1024),
    pct: totalKB > 0 ? Math.round((usedKB / totalKB) * 100) : 0,
  };
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
    const usedGB = (Number(mem.total) - Number(mem.available || mem.free)) / (1024 * 1024 * 1024);
    const pct = typeof mem.percentTotal === "number" ? Math.round(mem.percentTotal) : (totalGB > 0 ? Math.round((usedGB / totalGB) * 100) : 0);
    return { totalGB, freeGB, usedGB, pct };
  }
  return null;
}

function computeNetwork(systemInfo: any) {
  const interfaces = systemInfo?.metrics?.network;
  if (!interfaces || !Array.isArray(interfaces)) return null;
  let totalRx = 0, totalTx = 0;
  for (const iface of interfaces) {
    if (iface.name === "lo") continue;
    totalRx += Number(iface.rxSec || 0);
    totalTx += Number(iface.txSec || 0);
  }
  const rxMB = totalRx / (1024 * 1024);
  const txMB = totalTx / (1024 * 1024);
  return { rxMB, txMB, rxRaw: totalRx, txRaw: totalTx };
}