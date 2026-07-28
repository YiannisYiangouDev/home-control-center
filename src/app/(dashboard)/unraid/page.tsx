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
} from "lucide-react";
import { StatusCard } from "@/components/dashboard/status-card";
import { CpuGauge } from "@/components/dashboard/cpu-gauge";
import { MetricChart } from "@/components/dashboard/metric-chart";
import { StorageBar } from "@/components/dashboard/storage-bar";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

// Mock data for demo
const mockCpuHistory = Array.from({ length: 48 }, (_, i) => ({
  timestamp: new Date(Date.now() - (47 - i) * 1800000).toISOString(),
  value: 15 + Math.random() * 45 + Math.sin(i / 8) * 15,
}));

export default function UnraidPage() {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 page-container"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Unraid Server</h1>
          <p className="text-sm text-text-muted mt-1">System overview and monitoring</p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="status-dot status-dot-online" />
          <span className="text-success-400">Connected</span>
        </div>
      </div>

      {/* Gauges Row */}
      <motion.div variants={item} className="glass-card-static p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-items-center">
          <CpuGauge value={34} label="CPU Usage" color="#00b4d8" />
          <CpuGauge value={62} label="RAM Usage" color="#34d399" />
          <CpuGauge value={71} label="Storage" color="#f59e0b" />
          <CpuGauge value={52} size={120} label="Temperature" color="#f87171" />
        </div>
      </motion.div>

      {/* System Info Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div variants={item}>
          <StatusCard title="Uptime" value="47d 12h" icon={<Clock className="w-5 h-5" />} status="online" subtitle="Since Jun 9" accentColor="primary" />
        </motion.div>
        <motion.div variants={item}>
          <StatusCard title="CPU Temp" value="52°C" icon={<Thermometer className="w-5 h-5" />} status="online" subtitle="Max: 58°C" accentColor="primary" isMetric />
        </motion.div>
        <motion.div variants={item}>
          <StatusCard title="Fan Speed" value="1,240 RPM" icon={<Fan className="w-5 h-5" />} status="online" subtitle="CPU Fan" accentColor="primary" isMetric />
        </motion.div>
        <motion.div variants={item}>
          <StatusCard title="Network" value="45 MB/s" icon={<Wifi className="w-5 h-5" />} status="online" subtitle="↓32 ↑13 MB/s" accentColor="primary" isMetric />
        </motion.div>
      </div>

      {/* CPU History Chart */}
      <motion.div variants={item}>
        <MetricChart
          title="CPU Load (24h)"
          icon={<Cpu className="w-4 h-4" />}
          data={mockCpuHistory}
          dataKey="value"
          color="#00b4d8"
          unit="%"
          maxValue={100}
        />
      </motion.div>

      {/* Storage Overview */}
      <motion.div variants={item}>
        <div className="glass-card-static p-5">
          <div className="flex items-center gap-2 mb-5">
            <HardDrive className="w-4 h-4 text-text-muted" />
            <h3 className="text-sm font-medium text-text-secondary">Disk Array</h3>
            <span className="ml-auto px-2 py-0.5 rounded-full text-[10px] font-medium bg-success-400/10 text-success-400 border border-success-400/20">
              STARTED
            </span>
          </div>
          <div className="space-y-4">
            <StorageBar label="Parity 1" used={8} total={8} unit="TB" color="#8b5cf6" />
            <StorageBar label="Disk 1" used={6.2} total={8} unit="TB" color="#00b4d8" />
            <StorageBar label="Disk 2" used={5.8} total={8} unit="TB" color="#00b4d8" />
            <StorageBar label="Disk 3" used={7.1} total={8} unit="TB" color="#00b4d8" />
            <StorageBar label="Disk 4" used={7.8} total={8} unit="TB" color="#f87171" />
            <StorageBar label="Cache (NVMe)" used={180} total={500} unit="GB" color="#34d399" />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
