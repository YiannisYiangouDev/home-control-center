"use server";

import { auth } from "@/lib/auth";
import { createUnraidClient } from "@/services/unraid/client";
import type { ActionResult } from "@/types";

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
