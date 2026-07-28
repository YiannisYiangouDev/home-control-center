"use client";

import { motion } from "framer-motion";
import { Server, Plus, Trash2, RefreshCw, CheckCircle2, XCircle, TestTube } from "lucide-react";
import { cn } from "@/lib/utils";

const item = { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } };

const mockServers = [
  { id: "1", name: "Unraid Tower", type: "UNRAID", address: "https://unraid.local", isActive: true, lastChecked: "2m ago" },
  { id: "2", name: "Nextcloud", type: "NEXTCLOUD", address: "https://cloud.local", isActive: true, lastChecked: "5m ago" },
];

const typeColors = { UNRAID: "#f59e0b", NEXTCLOUD: "#0082c9", GENERIC: "#8b5cf6" };

export default function ServersSettingsPage() {
  return (
    <motion.div initial="hidden" animate="visible" variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06 } } }} className="space-y-6 page-container max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Servers</h1>
          <p className="text-sm text-text-muted mt-1">Manage server connections</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-primary-600 to-primary-500 text-white text-sm font-medium shadow-lg shadow-primary-500/20">
          <Plus className="w-4 h-4" /> Add Server
        </button>
      </div>

      <div className="space-y-3">
        {mockServers.map((server) => (
          <motion.div key={server.id} variants={item} className="glass-card p-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${typeColors[server.type as keyof typeof typeColors]}15`, color: typeColors[server.type as keyof typeof typeColors] }}>
                <Server className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-text-primary text-sm">{server.name}</p>
                  <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-bg-overlay text-text-muted">{server.type}</span>
                </div>
                <p className="text-xs text-text-muted mt-0.5">{server.address}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-text-muted">Checked {server.lastChecked}</span>
                <button className="p-2 rounded-lg hover:bg-bg-surface text-text-muted hover:text-primary-400 transition-all" title="Test connection">
                  <TestTube className="w-4 h-4" />
                </button>
                <button className="p-2 rounded-lg hover:bg-bg-surface text-text-muted hover:text-danger-400 transition-all" title="Delete">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
