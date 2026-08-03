"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createUnraidClient } from "@/services/unraid/client";
import type { ActionResult } from "@/types";

export async function logUnraidMetrics() {
  const client = createUnraidClient();
  if (!client) return;

  try {
    // 1. Ensure Unraid server entry exists in the DB
    await prisma.server.upsert({
      where: { id: "unraid" },
      update: { address: process.env.UNRAID_URL || "" },
      create: {
        id: "unraid",
        name: "Unraid Tower",
        type: "UNRAID",
        address: process.env.UNRAID_URL || "",
      },
    });

    // 2. Query current metrics from the client
    const metricsData = await getUnraidSystemMetrics();
    const arrayData = await getUnraidArrayStatus();

    if (!metricsData) return;

    const cpuPct = metricsData.metrics?.cpu?.percentTotal;
    const memUsagePercent = metricsData.metrics?.memory ? Math.round(metricsData.metrics.memory.percentTotal) : undefined;

    // Storage capacity calculation
    const disks = arrayData?.disks || [];
    const dataDisks = disks.filter((d: any) => d.type === "DATA" || d.type === "data");
    const totalKB = dataDisks.reduce((acc: number, d: any) => acc + Number(d.size || 0), 0);
    const usedKB = dataDisks.reduce((acc: number, d: any) => acc + Number(d.fsUsed || 0), 0);
    const storageUsagePercent = totalKB > 0 ? (usedKB / totalKB) * 100 : undefined;

    // Maximum SMART drive temperature
    const diskTemps = disks.map((d: any) => Number(d.temp || 0)).filter((t: number) => t > 0);
    const maxDiskTemp = diskTemps.length > 0 ? Math.max(...diskTemps) : undefined;

    // Save metric to database
    await prisma.metric.create({
      data: {
        serverId: "unraid",
        cpu: cpuPct != null ? Number(cpuPct) : undefined,
        ram: memUsagePercent != null ? Number(memUsagePercent) : undefined,
        storage: storageUsagePercent != null ? Number(storageUsagePercent) : undefined,
        temperature: maxDiskTemp != null ? Number(maxDiskTemp) : undefined,
        timestamp: new Date(),
      },
    });
  } catch (error) {
    console.error("Failed to log Unraid metrics:", error);
  }
}

export async function getUnraidHistoryMetrics(hours = 24) {
  const session = process.env.BYPASS_AUTH === "true" ? { user: { role: "ADMIN" } } : await auth();
  if (!session) {
    throw new Error("Unauthorized");
  }

  const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
  const metrics = await prisma.metric.findMany({
    where: {
      serverId: "unraid",
      timestamp: { gte: cutoff },
    },
    orderBy: { timestamp: "asc" },
  });

  return metrics.map((m) => ({
    timestamp: m.timestamp.toISOString(),
    cpu: m.cpu,
    ram: m.ram,
    storage: m.storage,
    temperature: m.temperature,
  }));
}


export async function getUnraidDockerContainers() {
  const session = process.env.BYPASS_AUTH === "true" ? { user: { role: "ADMIN" } } : await auth();
  if (!session) {
    throw new Error("Unauthorized");
  }

  const client = createUnraidClient();
  if (!client) {
    return [];
  }

  const response = await client.getDockerContainers();
  if (!response || !response.docker || !response.docker.containers) {
    return [];
  }

  return response.docker.containers;
}

export async function getUnraidArrayStatus() {
  const session = process.env.BYPASS_AUTH === "true" ? { user: { role: "ADMIN" } } : await auth();
  if (!session) {
    throw new Error("Unauthorized");
  }

  const client = createUnraidClient();
  if (!client) {
    return null;
  }

  const response = await client.getArrayStatus();
  if (!response || !response.array) {
    return null;
  }

  return response.array;
}

export async function getUnraidSystemMetrics() {
  const session = process.env.BYPASS_AUTH === "true" ? { user: { role: "ADMIN" } } : await auth();
  if (!session) {
    throw new Error("Unauthorized");
  }

  const client = createUnraidClient();
  if (!client) {
    return null;
  }

  const response = await client.getSystemMetrics();
  if (!response || !response.info) {
    return null;
  }

  // Also try to fetch live metrics (CPU%/memory) — may fail if API key lacks INFO scope
  try {
    const live = await client.getLiveMetrics();
    if (live) {
      return { ...response, metrics: live.metrics };
    }
  } catch { /* live metrics unavailable */ }

  return response;
}

export async function executeContainerAction(
  containerId: string,
  action: "start" | "stop" | "restart"
): Promise<ActionResult> {
  const session = await auth();
  if (!session || (session.user as { role: string }).role !== "ADMIN") {
    return { success: false, error: "Unauthorized" };
  }

  const client = createUnraidClient();
  if (!client) {
    return { success: false, error: "Unraid client not configured" };
  }

  try {
    const response = await client.containerAction(containerId, action);
    if (response && response.dockerContainerAction && response.dockerContainerAction.success) {
      return {
        success: true,
        message: response.dockerContainerAction.message || `Container ${action} completed successfully`,
      };
    }
    return { success: false, error: `Failed to ${action} container` };
  } catch (error: any) {
    return { success: false, error: error.message || `Error during container ${action}` };
  }
}
