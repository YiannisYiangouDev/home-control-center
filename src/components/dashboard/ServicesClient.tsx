"use client";

import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import {
  Plus, Search, MoreVertical, CheckCircle2, XCircle,
  AlertTriangle, Activity, Clock, Zap, X, Loader2,
  ChevronDown, ChevronUp,
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
import { cn } from "@/lib/utils";
import { createService, pollAllServices } from "@/actions/services";
import { RefreshButton } from "@/components/dashboard/RefreshButton";
import type { Service } from "@prisma/client";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

const statusConfig = {
  ONLINE: { icon: CheckCircle2, color: "text-success-400", bg: "bg-success-400/10", border: "border-success-400/20", label: "Online" },
  OFFLINE: { icon: XCircle, color: "text-danger-400", bg: "bg-danger-400/10", border: "border-danger-400/20", label: "Offline" },
  DEGRADED: { icon: AlertTriangle, color: "text-warning-400", bg: "bg-warning-400/10", border: "border-warning-400/20", label: "Degraded" },
  UNKNOWN: { icon: Activity, color: "text-text-muted", bg: "bg-bg-overlay", border: "border-border-default", label: "Unknown" },
};

const serviceIcons: Record<string, string> = {
  Nextcloud: "☁️", Plex: "🎬", Jellyfin: "📺", "Home Assistant": "🏠",
  Vaultwarden: "🔐", "Pi-hole": "🛡️", Sonarr: "📡", Radarr: "🎥",
};

const serviceColors: Record<string, string> = {
  Nextcloud: "#0082c9", Plex: "#e5a00d", Jellyfin: "#00a4dc",
  "Home Assistant": "#03a9f4", Vaultwarden: "#175ddc", "Pi-hole": "#96060c",
  Sonarr: "#35c5f4", Radarr: "#ffc230",
};

function AddServiceModal({ show, onClose }: { show: boolean; onClose: () => void }) {
  const [adding, setAdding] = useState(false);
  const [formError, setFormError] = useState("");

  if (!show) return null;

  const handleAdd = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAdding(true);
    setFormError("");
    const fd = new FormData(e.currentTarget);
    const result = await createService(fd);
    if (result.success) {
      onClose();
      window.location.reload();
    } else {
      setFormError(result.error || "Failed to add service");
    }
    setAdding(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="glass-card p-6 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-text-primary">Add Service</h2>
          <button onClick={onClose} className="p-1 rounded text-text-muted hover:text-text-secondary">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleAdd} className="space-y-4">
          {formError && <div className="text-sm text-danger-400 bg-danger-400/10 p-2 rounded">{formError}</div>}
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Name</label>
            <input name="name" required className="w-full px-3 py-2 rounded-lg bg-bg-elevated border border-border-default text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500/50" placeholder="Nextcloud, Plex, etc." />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">URL</label>
            <input name="url" type="url" required className="w-full px-3 py-2 rounded-lg bg-bg-elevated border border-border-default text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500/50" placeholder="https://service.local" />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Type</label>
            <select name="type" defaultValue="WEB" className="w-full px-3 py-2 rounded-lg bg-bg-elevated border border-border-default text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500/50">
              <option value="WEB">Web</option>
              <option value="API">API</option>
              <option value="DOCKER">Docker</option>
              <option value="DATABASE">Database</option>
              <option value="CUSTOM">Custom</option>
            </select>
          </div>
          <button type="submit" disabled={adding} className="w-full py-2 rounded-lg bg-gradient-to-r from-primary-600 to-primary-500 text-white text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2">
            {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            {adding ? "Adding..." : "Add Service"}
          </button>
        </form>
      </div>
    </div>
  );
}

interface ServicesClientProps {
  services: readonly (Service & { serverName?: string | null })[];
  history?: Record<string, { time: string; ms: number }[]>;
}

export function ServicesClient({ services, history = {} }: ServicesClientProps) {
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const online = services.filter((s) => s.status === "ONLINE").length;
  const offline = services.filter((s) => s.status === "OFFLINE").length;

  const filtered = services.filter(
    (s) => !search || s.name.toLowerCase().includes(search.toLowerCase())
  );

  const getIcon = (name: string) => serviceIcons[name] || "🔧";
  const getColor = (name: string) => serviceColors[name] || "#6b7280";
  const getBarColor = (ms: number) => {
    if (ms > 1000) return "#f87171";
    if (ms > 500) return "#f59e0b";
    return "#34d399";
  };

  const formatLastChecked = (lastCheckedAt: Date | null) => {
    if (!lastCheckedAt) return "Never";
    const mins = Math.floor((Date.now() - new Date(lastCheckedAt).getTime()) / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  if (services.length === 0) {
    return (
      <>
        <div className="space-y-6 page-container">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Services</h1>
            <p className="text-sm text-text-muted mt-1">No services configured yet</p>
          </div>
          <div className="glass-card p-12 text-center">
            <Activity className="w-12 h-12 text-text-muted mx-auto mb-4" />
            <p className="text-text-secondary mb-2">Add your first service</p>
            <p className="text-sm text-text-muted mb-4">Monitor websites, APIs, and Docker containers</p>
            <button onClick={() => setShowAdd(true)} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-primary-600 to-primary-500 text-white text-sm font-medium">
              <Plus className="w-4 h-4" /> Add Service
            </button>
          </div>
        </div>
        <AddServiceModal show={showAdd} onClose={() => setShowAdd(false)} />
      </>
    );
  }

  return (
    <>
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6 page-container">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Services</h1>
            <p className="text-sm text-text-muted mt-1">
              <span className="text-success-400">{online} online</span> · <span className="text-danger-400">{offline} offline</span> · {services.length} total
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input type="text" placeholder="Search services..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 pr-4 py-2 rounded-lg bg-bg-surface border border-border-default text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500/50 w-52" />
            </div>
            <RefreshButton onRefresh={pollAllServices} className="py-2" />
            <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-primary-600 to-primary-500 text-white text-sm font-medium shadow-lg shadow-primary-500/20 hover:from-primary-500 hover:to-primary-400 transition-all">
              <Plus className="w-4 h-4" /> Add Service
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((service) => {
            const config = statusConfig[service.status as keyof typeof statusConfig] || statusConfig.UNKNOWN;
            const StatusIcon = config.icon;
            const icon = getIcon(service.name);
            const color = getColor(service.name);
            const isExpanded = !!expandedCards[service.id];
            const serviceHistory = history[service.id] || [];

            // Format timestamp strings to HH:MM format for tooltips and X-Axis
            const formattedServiceHistory = serviceHistory.map((h) => ({
              ...h,
              formattedTime: new Date(h.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            }));

            return (
              <motion.div key={service.id} variants={item} className="glass-card p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style={{ backgroundColor: `${color}15` }}>
                      {icon}
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
                    {service.responseTime != null && service.responseTime > 0 && (
                      <span className="flex items-center gap-1 metric-value"><Zap className="w-3 h-3" />{service.responseTime}ms</span>
                    )}
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatLastChecked(service.lastCheckedAt)}</span>
                  </div>
                </div>

                {service.status === "ONLINE" && service.responseTime != null && (
                  <div className="mt-2 flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="h-1 bg-bg-elevated rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${Math.min((service.responseTime / 500) * 100, 100)}%`, background: getBarColor(service.responseTime) }} />
                      </div>
                    </div>
                    {serviceHistory.length > 0 && (
                      <button
                        onClick={() => toggleExpand(service.id)}
                        className="p-1 rounded bg-bg-elevated border border-border-default hover:bg-bg-surface text-text-muted hover:text-text-secondary transition-all shrink-0"
                        title={isExpanded ? "Hide response history" : "Show response history"}
                      >
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                    )}
                  </div>
                )}

                {/* If offline/degraded but has history, show the toggle button separately */}
                {service.status !== "ONLINE" && serviceHistory.length > 0 && (
                  <div className="mt-2 flex justify-end">
                    <button
                      onClick={() => toggleExpand(service.id)}
                      className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-bg-elevated border border-border-default hover:bg-bg-surface text-text-muted hover:text-text-secondary transition-all"
                    >
                      {isExpanded ? "Hide History" : "Show History"}
                      {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                  </div>
                )}

                {/* Expandable Chart Details */}
                {isExpanded && serviceHistory.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-4 pt-3 border-t border-border-subtle"
                  >
                    <p className="text-[10px] font-medium text-text-muted mb-2">Response Time (24h)</p>
                    <div className="h-24 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={formattedServiceHistory} margin={{ top: 5, right: 5, left: -30, bottom: 0 }}>
                          <defs>
                            <linearGradient id={`colorMs-${service.id}`} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#00b4d8" stopOpacity={0.2}/>
                              <stop offset="95%" stopColor="#00b4d8" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                          <XAxis dataKey="formattedTime" stroke="#9ca3af" fontSize={8} tickLine={false} />
                          <YAxis stroke="#9ca3af" fontSize={8} tickLine={false} />
                          <Tooltip
                            contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: "6px", padding: "4px 8px" }}
                            labelStyle={{ color: "#9ca3af", fontSize: "10px" }}
                            itemStyle={{ fontSize: "10px", padding: 0 }}
                          />
                          <Area type="monotone" dataKey="ms" name="Ping" stroke="#00b4d8" strokeWidth={1.5} fillOpacity={1} fill={`url(#colorMs-${service.id})`} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      </motion.div>
      <AddServiceModal show={showAdd} onClose={() => setShowAdd(false)} />
    </>
  );
}
