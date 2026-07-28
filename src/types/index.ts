// ============================================
// Home Control Center — Shared Types
// ============================================

export interface DashboardMetrics {
  cpu: number;
  ram: number;
  ramTotal: number;
  ramUsed: number;
  storage: number;
  storageTotal: number;
  storageUsed: number;
  temperature: number;
  networkIn: number;
  networkOut: number;
  uptime: number;
  serverStatus: "online" | "offline" | "unknown";
  dockerStatus: "healthy" | "degraded" | "offline" | "unknown";
  nextcloudStatus: "online" | "offline" | "unknown";
  activeAlerts: number;
}

export interface MetricDataPoint {
  timestamp: string;
  cpu?: number;
  ram?: number;
  storage?: number;
  temperature?: number;
  networkIn?: number;
  networkOut?: number;
}

export interface ServiceInfo {
  id: string;
  name: string;
  type: string;
  url: string;
  icon?: string;
  color?: string;
  status: "ONLINE" | "OFFLINE" | "DEGRADED" | "UNKNOWN";
  responseTime?: number;
  lastCheckedAt?: string;
  lastOnlineAt?: string;
}

export interface AlertInfo {
  id: string;
  severity: "CRITICAL" | "WARNING" | "INFO";
  title: string;
  message: string;
  status: "ACTIVE" | "ACKNOWLEDGED" | "RESOLVED";
  createdAt: string;
  serverName?: string;
  serviceName?: string;
}

export interface ShortcutInfo {
  id: string;
  title: string;
  action: string;
  actionType: string;
  icon: string;
  color: string;
  order: number;
  categoryId?: string;
  categoryName?: string;
  contactName?: string;
}

export interface ContactInfo {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  whatsapp?: string;
  telegram?: string;
  category: string;
  avatar?: string;
  isFavorite: boolean;
}

export interface UnraidSystemInfo {
  cpu: {
    usage: number;
    cores: number;
    model: string;
  };
  memory: {
    total: number;
    used: number;
    free: number;
    percentage: number;
  };
  temperature: {
    cpu: number;
    motherboard?: number;
  };
  fans: {
    name: string;
    rpm: number;
  }[];
  network: {
    inbound: number;
    outbound: number;
  };
  uptime: number;
}

export interface UnraidDisk {
  name: string;
  device: string;
  size: number;
  used: number;
  free: number;
  temperature: number;
  status: "OK" | "WARNING" | "ERROR";
  smartStatus: "PASSED" | "FAILED" | "UNKNOWN";
  type: "data" | "parity" | "cache";
}

export interface DockerContainer {
  id: string;
  name: string;
  image: string;
  status: "running" | "stopped" | "paused" | "restarting";
  cpu: number;
  memory: number;
  memoryLimit: number;
  uptime?: string;
  ports: string[];
}

export interface NextcloudInfo {
  status: "online" | "offline";
  version: string;
  health: boolean;
  database: {
    type: string;
    version: string;
    size: number;
  };
  storage: {
    total: number;
    used: number;
    free: number;
    numFiles: number;
  };
  cron: {
    lastRun: string;
    status: "ok" | "warning" | "error";
  };
  activeUsers: {
    last5min: number;
    lastHour: number;
    lastDay: number;
  };
}

export type ActionResult<T = void> = {
  success: true;
  data?: T;
  message?: string;
} | {
  success: false;
  error: string;
};
