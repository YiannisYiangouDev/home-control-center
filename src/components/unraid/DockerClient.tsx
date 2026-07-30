"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Container as ContainerIcon,
  Play,
  Square,
  RotateCcw,
  Search,
  HardDrive,
  Network,
  Clock,
  Hash,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { executeContainerAction } from "@/actions/unraid";

const item = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

const statusConfig = {
  running: { color: "text-success-400", bg: "bg-success-400/10", border: "border-success-400/20", dot: "status-dot-online" },
  stopped: { color: "text-danger-400", bg: "bg-danger-400/10", border: "border-danger-400/20", dot: "status-dot-offline" },
  exited: { color: "text-danger-400", bg: "bg-danger-400/10", border: "border-danger-400/20", dot: "status-dot-offline" },
  paused: { color: "text-warning-400", bg: "bg-warning-400/10", border: "border-warning-400/20", dot: "status-dot-warning" },
  restarting: { color: "text-warning-400", bg: "bg-warning-400/10", border: "border-warning-400/20", dot: "status-dot-warning" },
};

interface ContainerPort {
  ip?: string;
  privatePort: number;
  publicPort: number;
  type: string;
}

interface DockerContainer {
  id: string;
  names: string[];
  image: string;
  state: string;
  status: string;
  ports: ContainerPort[];
  mounts: any;
}

interface DockerClientProps {
  containers: DockerContainer[];
}

export function DockerClient({ containers }: DockerClientProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "running" | "stopped">("all");
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleAction = async (containerId: string, action: "start" | "stop" | "restart") => {
    if (actioningId) return; // Prevent concurrent actions
    setActioningId(`${containerId}:${action}`);
    
    startTransition(async () => {
      try {
        const res = await executeContainerAction(containerId, action);
        if (res.success) {
          router.refresh();
        } else {
          alert(res.error || `Failed to ${action} container.`);
        }
      } catch (err: any) {
        alert(err.message || "An unexpected error occurred.");
      } finally {
        setActioningId(null);
      }
    });
  };

  const processedContainers = containers.map((c) => {
    const rawName = c.names[0] || "Unnamed";
    const name = rawName.startsWith("/") ? rawName.slice(1) : rawName;
    const stateLower = c.state.toLowerCase();
    const runStatus = stateLower === "running" ? "running" : "stopped";
    // Extract short Docker ID (the part after the colon in the composite ID)
    const shortId = c.id.includes(":") ? c.id.split(":")[1].slice(0, 12) : c.id.slice(0, 12);
    // Extract IP from networkSettings
    let ip = "";
    const nets = (c as any).networkSettings?.Networks;
    if (nets) {
      for (const netName of Object.keys(nets)) {
        const net = nets[netName];
        if (net?.IPAddress && net.IPAddress.length > 0) {
          ip = net.IPAddress;
          break;
        }
      }
    }

    return {
      ...c,
      name,
      stateLower,
      runStatus,
      shortId,
      ip,
    };
  });

  const filtered = processedContainers.filter((c) => {
    if (filter === "running" && c.runStatus !== "running") return false;
    if (filter === "stopped" && c.runStatus !== "stopped") return false;
    if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const runningCount = processedContainers.filter((c) => c.runStatus === "running").length;
  const stoppedCount = processedContainers.filter((c) => c.runStatus !== "running").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Docker Containers</h1>
          <p className="text-sm text-text-muted mt-1">
            <span className="text-success-400">{runningCount} running</span> ·{" "}
            <span className="text-danger-400">{stoppedCount} stopped</span>
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
                  "px-3 py-2 text-xs font-medium capitalize transition-all cursor-pointer",
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
          const config = statusConfig[container.stateLower as keyof typeof statusConfig] || statusConfig.stopped;
          const isCurrentAction = actioningId?.split(":")[0] === container.id;
          const currentActionType = isCurrentAction ? actioningId?.split(":")[1] : null;

          return (
            <motion.div key={container.id} variants={item} className="glass-card p-4 flex flex-col justify-between min-h-[190px]">
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <ContainerIcon className={cn("w-5 h-5", config.color)} />
                    <div>
                      <p className="font-medium text-text-primary text-sm">{container.name}</p>
                      <p className="text-[10px] text-text-muted truncate max-w-[180px]">{container.image}</p>
                    </div>
                  </div>
                  <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-medium border capitalize", config.bg, config.border, config.color)}>
                    {container.stateLower}
                  </span>
                </div>

                {/* Sub-details (Ports, Mounts, ID, Status) */}
                <div className="space-y-1.5 py-3 border-t border-border-subtle text-xs text-text-secondary">
                  {container.ports && container.ports.length > 0 ? (
                    <div className="flex items-center gap-2">
                      <Network className="w-3.5 h-3.5 text-text-muted shrink-0" />
                      <span className="truncate">
                        {container.ports.map((p) => `${p.publicPort}:${p.privatePort}/${p.type}`).join(", ")}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-text-muted">
                      <Network className="w-3.5 h-3.5 shrink-0" />
                      <span>No port mappings</span>
                    </div>
                  )}

                  {container.mounts && Array.isArray(container.mounts) && container.mounts.length > 0 ? (
                    <div className="flex items-center gap-2">
                      <HardDrive className="w-3.5 h-3.5 text-text-muted shrink-0" />
                      <span>{container.mounts.length} volume mounts</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-text-muted">
                      <HardDrive className="w-3.5 h-3.5 shrink-0" />
                      <span>No volume mounts</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <Hash className="w-3.5 h-3.5 text-text-muted shrink-0" />
                    <span className="text-text-muted font-mono text-[10px]">{container.shortId}</span>
                  </div>

                  {container.ip && (
                    <div className="flex items-center gap-2">
                      <Network className="w-3.5 h-3.5 text-text-muted shrink-0" />
                      <span className="text-text-muted font-mono text-[10px]">{container.ip}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-text-muted shrink-0" />
                    <span className="text-text-muted truncate">{container.status || "Unknown"}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border-subtle/50">
                {container.runStatus === "running" ? (
                  <>
                    <button
                      disabled={!!actioningId}
                      onClick={() => handleAction(container.id, "stop")}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-md text-xs font-medium border transition-all cursor-pointer",
                        currentActionType === "stop"
                          ? "bg-danger-400/20 text-danger-400 border-danger-400/30 animate-pulse"
                          : "bg-danger-400/10 text-danger-400 border-danger-400/20 hover:bg-danger-400/20"
                      )}
                    >
                      <Square className="w-3 h-3" /> {currentActionType === "stop" ? "Stopping..." : "Stop"}
                    </button>
                    <button
                      disabled={!!actioningId}
                      onClick={() => handleAction(container.id, "restart")}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-md text-xs font-medium border transition-all cursor-pointer",
                        currentActionType === "restart"
                          ? "bg-warning-400/20 text-warning-400 border-warning-400/30 animate-pulse"
                          : "bg-warning-400/10 text-warning-400 border-warning-400/20 hover:bg-warning-400/20"
                      )}
                    >
                      <RotateCcw className="w-3 h-3" /> {currentActionType === "restart" ? "Restarting..." : "Restart"}
                    </button>
                  </>
                ) : (
                  <button
                    disabled={!!actioningId}
                    onClick={() => handleAction(container.id, "start")}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-md text-xs font-medium border transition-all cursor-pointer",
                      currentActionType === "start"
                        ? "bg-success-400/20 text-success-400 border-success-400/30 animate-pulse"
                        : "bg-success-400/10 text-success-400 border-success-400/20 hover:bg-success-400/20"
                    )}
                  >
                    <Play className="w-3 h-3" /> {currentActionType === "start" ? "Starting..." : "Start"}
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
