"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  Plus,
  Globe,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Zap,
  RefreshCw,
  Search,
  MoreVertical,
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

const mockServices = [
  { id: "1", name: "Nextcloud", type: "WEB", url: "https://cloud.local", status: "ONLINE", responseTime: 142, lastChecked: "2m ago", icon: "☁️", color: "#0082c9" },
  { id: "2", name: "Plex", type: "WEB", url: "https://plex.local:32400", status: "ONLINE", responseTime: 89, lastChecked: "1m ago", icon: "🎬", color: "#e5a00d" },
  { id: "3", name: "Jellyfin", type: "WEB", url: "https://jellyfin.local:8096", status: "ONLINE", responseTime: 156, lastChecked: "2m ago", icon: "📺", color: "#00a4dc" },
  { id: "4", name: "Home Assistant", type: "WEB", url: "https://ha.local:8123", status: "ONLINE", responseTime: 203, lastChecked: "1m ago", icon: "🏠", color: "#03a9f4" },
  { id: "5", name: "Vaultwarden", type: "WEB", url: "https://vault.local", status: "ONLINE", responseTime: 45, lastChecked: "3m ago", icon: "🔐", color: "#175ddc" },
  { id: "6", name: "Pi-hole", type: "WEB", url: "http://pihole.local/admin", status: "ONLINE", responseTime: 32, lastChecked: "1m ago", icon: "🛡️", color: "#96060c" },
  { id: "7", name: "Sonarr", type: "WEB", url: "https://sonarr.local:8989", status: "OFFLINE", responseTime: 0, lastChecked: "5m ago", icon: "📡", color: "#35c5f4" },
  { id: "8", name: "Radarr", type: "WEB", url: "https://radarr.local:7878", status: "OFFLINE", responseTime: 0, lastChecked: "5m ago", icon: "🎥", color: "#ffc230" },
  { id: "9", name: "Personal Website", type: "WEB", url: "https://mysite.com", status: "ONLINE", responseTime: 312, lastChecked: "2m ago", icon: "🌐", color: "#8b5cf6" },
  { id: "10", name: "API Backend", type: "API", url: "https://api.mysite.com/health", status: "DEGRADED", responseTime: 1250, lastChecked: "1m ago", icon: "⚡", color: "#f59e0b" },
];

const statusConfig = {
  ONLINE: { icon: CheckCircle2, color: "text-success-400", bg: "bg-success-400/10", border: "border-success-400/20", label: "Online" },
  OFFLINE: { icon: XCircle, color: "text-danger-400", bg: "bg-danger-400/10", border: "border-danger-400/20", label: "Offline" },
  DEGRADED: { icon: AlertTriangle, color: "text-warning-400", bg: "bg-warning-400/10", border: "border-warning-400/20", label: "Degraded" },
  UNKNOWN: { icon: Activity, color: "text-text-muted", bg: "bg-bg-overlay", border: "border-border-default", label: "Unknown" },
};

export default function ServicesPage() {
  const [search, setSearch] = useState("");
  const online = mockServices.filter((s) => s.status === "ONLINE").length;
  const offline = mockServices.filter((s) => s.status === "OFFLINE").length;

  const filtered = mockServices.filter(
    (s) => !search || s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6 page-container">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Services</h1>
          <p className="text-sm text-text-muted mt-1">
            <span className="text-success-400">{online} online</span> · <span className="text-danger-400">{offline} offline</span> · {mockServices.length} total
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search services..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-lg bg-bg-surface border border-border-default text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500/50 w-52"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-primary-600 to-primary-500 text-white text-sm font-medium shadow-lg shadow-primary-500/20 hover:from-primary-500 hover:to-primary-400 transition-all">
            <Plus className="w-4 h-4" /> Add Service
          </button>
        </div>
      </div>

      {/* Service Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((service) => {
          const config = statusConfig[service.status as keyof typeof statusConfig] || statusConfig.UNKNOWN;
          const StatusIcon = config.icon;

          return (
            <motion.div key={service.id} variants={item} className="glass-card p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                    style={{ backgroundColor: `${service.color}15` }}
                  >
                    {service.icon}
                  </div>
                  <div>
                    <p className="font-medium text-text-primary text-sm">{service.name}</p>
                    <p className="text-[10px] text-text-muted truncate max-w-[180px]">{service.url}</p>
                  </div>
                </div>
                <button className="p-1 rounded text-text-muted hover:text-text-secondary">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center justify-between py-3 border-t border-border-subtle">
                <div className="flex items-center gap-2">
                  <StatusIcon className={cn("w-4 h-4", config.color)} />
                  <span className={cn("text-xs font-medium", config.color)}>{config.label}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-text-muted">
                  {service.responseTime > 0 && (
                    <span className="flex items-center gap-1 metric-value">
                      <Zap className="w-3 h-3" />
                      {service.responseTime}ms
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {service.lastChecked}
                  </span>
                </div>
              </div>

              {/* Response time bar */}
              {service.status === "ONLINE" && (
                <div className="mt-2">
                  <div className="h-1 bg-bg-elevated rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${Math.min((service.responseTime / 500) * 100, 100)}%`,
                        background: service.responseTime > 500 ? "#f59e0b" : service.responseTime > 1000 ? "#f87171" : "#34d399",
                      }}
                    />
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
