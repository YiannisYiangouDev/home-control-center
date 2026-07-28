"use client";

import { motion, Variants } from "framer-motion";
import {
  Server,
  Cpu,
  MemoryStick,
  HardDrive,
  Container,
  Cloud,
  AlertTriangle,
  Zap,
  Activity,
  Thermometer,
  ArrowUpRight,
  ArrowDownRight,
  Wifi,
} from "lucide-react";
import { StatusCard } from "@/components/dashboard/status-card";
import { CpuGauge } from "@/components/dashboard/cpu-gauge";
import { MetricChart } from "@/components/dashboard/metric-chart";
import { AlertFeed } from "@/components/dashboard/alert-feed";
import { QuickShortcuts } from "@/components/dashboard/quick-shortcuts";
import { StorageBar } from "@/components/dashboard/storage-bar";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

// Mock data for initial UI
const mockCpuHistory = Array.from({ length: 24 }, (_, i) => ({
  timestamp: new Date(Date.now() - (23 - i) * 3600000).toISOString(),
  value: 20 + Math.random() * 40 + (i > 18 ? 15 : 0),
}));

const mockRamHistory = Array.from({ length: 24 }, (_, i) => ({
  timestamp: new Date(Date.now() - (23 - i) * 3600000).toISOString(),
  value: 45 + Math.random() * 20,
}));

const mockNetworkHistory = Array.from({ length: 24 }, (_, i) => ({
  timestamp: new Date(Date.now() - (23 - i) * 3600000).toISOString(),
  inbound: Math.random() * 100,
  outbound: Math.random() * 50,
}));

export default function DashboardPage() {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* ============ Status Cards Row ============ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div variants={itemVariants}>
          <StatusCard
            title="Server"
            value="Online"
            icon={<Server className="w-5 h-5" />}
            status="online"
            subtitle="Uptime: 47d 12h"
            accentColor="primary"
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatusCard
            title="CPU"
            value="34%"
            icon={<Cpu className="w-5 h-5" />}
            status="online"
            subtitle="AMD Ryzen 7"
            accentColor="primary"
            isMetric
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatusCard
            title="RAM"
            value="62%"
            icon={<MemoryStick className="w-5 h-5" />}
            status="online"
            subtitle="20.1 / 32 GB"
            accentColor="primary"
            isMetric
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatusCard
            title="Storage"
            value="71%"
            icon={<HardDrive className="w-5 h-5" />}
            status="warning"
            subtitle="28.4 / 40 TB"
            accentColor="warning"
            isMetric
          />
        </motion.div>
      </div>

      {/* ============ Secondary Status Row ============ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div variants={itemVariants}>
          <StatusCard
            title="Docker"
            value="12 Running"
            icon={<Container className="w-5 h-5" />}
            status="online"
            subtitle="2 stopped"
            accentColor="success"
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatusCard
            title="Nextcloud"
            value="Online"
            icon={<Cloud className="w-5 h-5" />}
            status="online"
            subtitle="v29.0.1"
            accentColor="primary"
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatusCard
            title="Active Alerts"
            value="3"
            icon={<AlertTriangle className="w-5 h-5" />}
            status="warning"
            subtitle="1 critical"
            accentColor="danger"
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatusCard
            title="Temperature"
            value="52°C"
            icon={<Thermometer className="w-5 h-5" />}
            status="online"
            subtitle="CPU Package"
            accentColor="primary"
            isMetric
          />
        </motion.div>
      </div>

      {/* ============ Charts Row ============ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div variants={itemVariants}>
          <MetricChart
            title="CPU Usage"
            icon={<Cpu className="w-4 h-4" />}
            data={mockCpuHistory}
            dataKey="value"
            color="#00b4d8"
            unit="%"
            maxValue={100}
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <MetricChart
            title="RAM Usage"
            icon={<MemoryStick className="w-4 h-4" />}
            data={mockRamHistory}
            dataKey="value"
            color="#34d399"
            unit="%"
            maxValue={100}
          />
        </motion.div>
      </div>

      {/* ============ Bottom Row ============ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Storage Overview */}
        <motion.div variants={itemVariants}>
          <div className="glass-card-static p-5 h-full">
            <div className="flex items-center gap-2 mb-4">
              <HardDrive className="w-4 h-4 text-text-muted" />
              <h3 className="text-sm font-medium text-text-secondary">
                Storage Overview
              </h3>
            </div>
            <div className="space-y-4">
              <StorageBar
                label="Array"
                used={28.4}
                total={40}
                unit="TB"
                color="#00b4d8"
              />
              <StorageBar
                label="Cache"
                used={180}
                total={500}
                unit="GB"
                color="#34d399"
              />
              <StorageBar
                label="Boot"
                used={12}
                total={32}
                unit="GB"
                color="#f59e0b"
              />
            </div>
          </div>
        </motion.div>

        {/* Alert Feed */}
        <motion.div variants={itemVariants}>
          <AlertFeed />
        </motion.div>

        {/* Quick Shortcuts */}
        <motion.div variants={itemVariants}>
          <QuickShortcuts />
        </motion.div>
      </div>

      {/* ============ Network Traffic ============ */}
      <motion.div variants={itemVariants}>
        <div className="glass-card-static p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Wifi className="w-4 h-4 text-text-muted" />
              <h3 className="text-sm font-medium text-text-secondary">
                Network Traffic
              </h3>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1 text-primary-400">
                <ArrowDownRight className="w-3 h-3" /> In
              </span>
              <span className="flex items-center gap-1 text-success-400">
                <ArrowUpRight className="w-3 h-3" /> Out
              </span>
            </div>
          </div>
          <div className="h-48">
            <MetricChart
              title=""
              data={mockNetworkHistory}
              dataKey="inbound"
              secondaryDataKey="outbound"
              color="#00b4d8"
              secondaryColor="#34d399"
              unit=" MB/s"
              compact
            />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
