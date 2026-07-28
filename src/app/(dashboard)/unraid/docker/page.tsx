"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Container,
  Play,
  Square,
  RotateCcw,
  FileText,
  Cpu,
  MemoryStick,
  Clock,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

const mockContainers = [
  { id: "1", name: "nextcloud", image: "nextcloud:29", status: "running", cpu: 2.3, memory: 512, memoryLimit: 2048, uptime: "47d", ports: ["443:443"] },
  { id: "2", name: "plex", image: "linuxserver/plex:latest", status: "running", cpu: 15.2, memory: 1024, memoryLimit: 4096, uptime: "47d", ports: ["32400:32400"] },
  { id: "3", name: "jellyfin", image: "jellyfin/jellyfin:latest", status: "running", cpu: 5.1, memory: 768, memoryLimit: 2048, uptime: "12d", ports: ["8096:8096"] },
  { id: "4", name: "vaultwarden", image: "vaultwarden/server:latest", status: "running", cpu: 0.1, memory: 64, memoryLimit: 512, uptime: "47d", ports: ["8080:80"] },
  { id: "5", name: "homeassistant", image: "ghcr.io/home-assistant/home-assistant:stable", status: "running", cpu: 3.7, memory: 384, memoryLimit: 2048, uptime: "30d", ports: ["8123:8123"] },
  { id: "6", name: "pihole", image: "pihole/pihole:latest", status: "running", cpu: 0.5, memory: 128, memoryLimit: 512, uptime: "47d", ports: ["53:53", "80:80"] },
  { id: "7", name: "wireguard", image: "linuxserver/wireguard:latest", status: "running", cpu: 0.2, memory: 32, memoryLimit: 256, uptime: "47d", ports: ["51820:51820"] },
  { id: "8", name: "sonarr", image: "linuxserver/sonarr:latest", status: "stopped", cpu: 0, memory: 0, memoryLimit: 1024, uptime: "-", ports: ["8989:8989"] },
  { id: "9", name: "radarr", image: "linuxserver/radarr:latest", status: "stopped", cpu: 0, memory: 0, memoryLimit: 1024, uptime: "-", ports: ["7878:7878"] },
  { id: "10", name: "nginx-proxy", image: "nginx:alpine", status: "running", cpu: 0.3, memory: 48, memoryLimit: 256, uptime: "47d", ports: ["80:80", "443:443"] },
  { id: "11", name: "mariadb", image: "mariadb:11", status: "running", cpu: 1.2, memory: 512, memoryLimit: 2048, uptime: "47d", ports: ["3306:3306"] },
  { id: "12", name: "redis", image: "redis:7-alpine", status: "running", cpu: 0.4, memory: 64, memoryLimit: 256, uptime: "47d", ports: ["6379:6379"] },
];

const statusConfig = {
  running: { color: "text-success-400", bg: "bg-success-400/10", border: "border-success-400/20", dot: "status-dot-online" },
  stopped: { color: "text-danger-400", bg: "bg-danger-400/10", border: "border-danger-400/20", dot: "status-dot-offline" },
  paused: { color: "text-warning-400", bg: "bg-warning-400/10", border: "border-warning-400/20", dot: "status-dot-warning" },
  restarting: { color: "text-warning-400", bg: "bg-warning-400/10", border: "border-warning-400/20", dot: "status-dot-warning" },
};

export default function DockerPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "running" | "stopped">("all");

  const filtered = mockContainers.filter((c) => {
    if (filter === "running" && c.status !== "running") return false;
    if (filter === "stopped" && c.status !== "stopped") return false;
    if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const running = mockContainers.filter((c) => c.status === "running").length;
  const stopped = mockContainers.filter((c) => c.status !== "running").length;

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6 page-container">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Docker Containers</h1>
          <p className="text-sm text-text-muted mt-1">
            <span className="text-success-400">{running} running</span> · <span className="text-danger-400">{stopped} stopped</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search containers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-lg bg-bg-surface border border-border-default text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500/50 w-52"
            />
          </div>

          {/* Filter */}
          <div className="flex bg-bg-surface border border-border-default rounded-lg overflow-hidden">
            {(["all", "running", "stopped"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-3 py-2 text-xs font-medium capitalize transition-all",
                  filter === f ? "bg-primary-500/10 text-primary-400" : "text-text-muted hover:text-text-secondary"
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Container Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((container) => {
          const config = statusConfig[container.status as keyof typeof statusConfig] || statusConfig.stopped;
          const memPercent = container.memoryLimit > 0 ? (container.memory / container.memoryLimit) * 100 : 0;

          return (
            <motion.div key={container.id} variants={item} className="glass-card p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Container className={cn("w-5 h-5", config.color)} />
                  <div>
                    <p className="font-medium text-text-primary text-sm">{container.name}</p>
                    <p className="text-[10px] text-text-muted truncate max-w-[180px]">{container.image}</p>
                  </div>
                </div>
                <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-medium border", config.bg, config.border, config.color)}>
                  {container.status}
                </span>
              </div>

              {/* Metrics */}
              {container.status === "running" && (
                <div className="grid grid-cols-3 gap-3 mb-3 py-3 border-t border-b border-border-subtle">
                  <div className="text-center">
                    <Cpu className="w-3 h-3 text-text-muted mx-auto mb-1" />
                    <p className="text-xs metric-value text-text-primary">{container.cpu}%</p>
                    <p className="text-[10px] text-text-muted">CPU</p>
                  </div>
                  <div className="text-center">
                    <MemoryStick className="w-3 h-3 text-text-muted mx-auto mb-1" />
                    <p className="text-xs metric-value text-text-primary">{container.memory} MB</p>
                    <p className="text-[10px] text-text-muted">RAM</p>
                  </div>
                  <div className="text-center">
                    <Clock className="w-3 h-3 text-text-muted mx-auto mb-1" />
                    <p className="text-xs text-text-primary">{container.uptime}</p>
                    <p className="text-[10px] text-text-muted">Uptime</p>
                  </div>
                </div>
              )}

              {/* Memory bar */}
              {container.status === "running" && (
                <div className="mb-3">
                  <div className="flex justify-between text-[10px] text-text-muted mb-1">
                    <span>Memory</span>
                    <span className="metric-value">{container.memory} / {container.memoryLimit} MB</span>
                  </div>
                  <div className="h-1 bg-bg-elevated rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${memPercent}%`,
                        background: memPercent > 80 ? "#f87171" : "#00b4d8",
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2">
                {container.status === "running" ? (
                  <>
                    <button className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-md bg-danger-400/10 text-danger-400 border border-danger-400/20 text-xs hover:bg-danger-400/20 transition-all">
                      <Square className="w-3 h-3" /> Stop
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-md bg-warning-400/10 text-warning-400 border border-warning-400/20 text-xs hover:bg-warning-400/20 transition-all">
                      <RotateCcw className="w-3 h-3" /> Restart
                    </button>
                  </>
                ) : (
                  <button className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-md bg-success-400/10 text-success-400 border border-success-400/20 text-xs hover:bg-success-400/20 transition-all">
                    <Play className="w-3 h-3" /> Start
                  </button>
                )}
                <button className="flex items-center justify-center px-2 py-1.5 rounded-md bg-bg-elevated border border-border-default text-text-muted text-xs hover:text-text-secondary hover:bg-bg-overlay transition-all">
                  <FileText className="w-3 h-3" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
