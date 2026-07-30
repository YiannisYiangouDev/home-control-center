"use client";

import { motion } from "framer-motion";
import { Thermometer, Droplets, Fan } from "lucide-react";
import { cn } from "@/lib/utils";

interface HAClimateEntity {
  entity_id: string;
  state: string;
  attributes: {
    friendly_name?: string;
    current_temperature?: number;
    temperature?: number;
    hvac_action?: string;
    humidity?: number;
  };
}

const item = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

const hvacColors: Record<string, string> = {
  cooling: "#00b4d8",
  heating: "#f59e0b",
  idle: "#6b7280",
  off: "#374151",
  dry: "#8b5cf6",
  fan_only: "#34d399",
  auto: "#60a5fa",
};

export function SmartHomeCard({ climate }: { climate?: readonly HAClimateEntity[] }) {
  if (!climate || climate.length === 0) return null;

  return (
    <motion.div variants={item} className="glass-card-static p-5">
      <div className="flex items-center gap-2 mb-4">
        <Fan className="w-4 h-4 text-text-muted" />
        <h3 className="text-sm font-medium text-text-secondary">Smart Home</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {climate.map((entity) => {
          const name = entity.attributes.friendly_name || entity.entity_id.split(".")[1];
          const temp = entity.attributes.current_temperature;
          const target = entity.attributes.temperature;
          const action = entity.attributes.hvac_action || entity.state;
          const color = hvacColors[action] || "#6b7280";

          return (
            <div key={entity.entity_id} className="flex items-center gap-3 p-3 rounded-lg bg-bg-elevated border border-border-subtle">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}15`, color }}>
                {action === "cooling" ? <Thermometer className="w-5 h-5" /> : <Fan className="w-5 h-5" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-text-primary truncate">{name}</p>
                <div className="flex items-center gap-3 mt-0.5">
                  {temp != null && <span className="text-sm font-mono font-bold text-text-primary">{temp}°</span>}
                  {target != null && <span className="text-[10px] text-text-muted">→ {target}°</span>}
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ backgroundColor: `${color}20`, color }}>
                    {action}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
