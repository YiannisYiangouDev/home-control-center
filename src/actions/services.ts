"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { safeFetch } from "@/lib/safe-fetch";
import { serviceSchema } from "@/lib/validators";
import { sendAlertNotification } from "@/lib/notifications";
import type { ActionResult } from "@/types";

export async function getServices() {
  const session = await auth();
  if (!session) return [];

  const services = await prisma.service.findMany({
    orderBy: [{ status: "asc" }, { name: "asc" }],
    include: {
      server: { select: { name: true } },
    },
  });

  return services.map((s) => ({
    ...s,
    serverName: s.server?.name || null,
  }));
}

export async function createService(formData: FormData): Promise<ActionResult> {
  const session = process.env.BYPASS_AUTH === "true" ? { user: { role: "ADMIN" } } : await auth();
  if (!session || (session.user as { role: string }).role !== "ADMIN") {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const raw = {
      name: formData.get("name") as string,
      type: formData.get("type") as string,
      url: formData.get("url") as string,
      icon: (formData.get("icon") as string) || undefined,
      color: (formData.get("color") as string) || undefined,
      checkInterval: parseInt(formData.get("checkInterval") as string) || 60,
      expectedStatus: parseInt(formData.get("expectedStatus") as string) || 200,
      serverId: (formData.get("serverId") as string) || undefined,
    };

    const parsed = serviceSchema.safeParse(raw);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0].message };
    }

    await prisma.service.create({
      data: {
        name: parsed.data.name,
        type: parsed.data.type,
        url: parsed.data.url,
        icon: parsed.data.icon || null,
        color: parsed.data.color || null,
        checkInterval: parsed.data.checkInterval,
        expectedStatus: parsed.data.expectedStatus,
        serverId: parsed.data.serverId || null,
      },
    });

    return { success: true, message: "Service created successfully" };
  } catch (error) {
    console.error("Create service error:", error);
    return { success: false, error: "Failed to create service" };
  }
}

export async function deleteService(serviceId: string): Promise<ActionResult> {
  const session = await auth();
  if (!session || (session.user as { role: string }).role !== "ADMIN") {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await prisma.service.delete({ where: { id: serviceId } });
    return { success: true };
  } catch {
    return { success: false, error: "Failed to delete service" };
  }
}

export async function checkService(
  serviceId: string,
  opts?: { internal?: boolean }
): Promise<ActionResult> {
  if (!opts?.internal) {
    const session = await auth();
    if (!session || (session.user as { role: string }).role !== "ADMIN") {
      return { success: false, error: "Unauthorized" };
    }
  }

  try {
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });
    if (!service) return { success: false, error: "Service not found" };

    const start = Date.now();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    try {
      const response = await safeFetch(service.url, {
        signal: controller.signal,
        method: "HEAD",
      });
      clearTimeout(timeout);

      const responseTime = Date.now() - start;
      const isOnline = response.status === service.expectedStatus;

      // Detect transition from OFFLINE/DEGRADED to ONLINE (Recovery)
      const wasOffline = service.status === "OFFLINE" || service.status === "DEGRADED";
      const isTransitionToOnline = wasOffline && isOnline;

      await prisma.service.update({
        where: { id: serviceId },
        data: {
          status: isOnline ? "ONLINE" : "DEGRADED",
          responseTime,
          lastCheckedAt: new Date(),
          lastOnlineAt: isOnline ? new Date() : undefined,
        },
      });

      // Record metric
      await prisma.metric.create({
        data: {
          serviceId,
          responseTime,
          timestamp: new Date(),
        },
      });

      if (isTransitionToOnline) {
        // Resolve any active alerts for this service
        await prisma.alert.updateMany({
          where: { serviceId, status: "ACTIVE" },
          data: {
            status: "RESOLVED",
            resolvedAt: new Date(),
          },
        });

        // Trigger webhook alert
        sendAlertNotification(
          `${service.name} is back online`,
          `Service ${service.name} (${service.url}) recovered successfully and is responding with status ${response.status}.`,
          true
        ).catch((e) => console.error("Webhook recovery notification error:", e));
      }

      // High latency alert checks (> 2500ms)
      const isHighLatency = isOnline && responseTime > 2500;
      const latencyAlertTitle = `High latency on ${service.name}`;

      if (isHighLatency) {
        const recentAlert = await prisma.alert.findFirst({
          where: {
            serviceId,
            title: latencyAlertTitle,
            status: "ACTIVE",
          },
        });

        if (!recentAlert) {
          await prisma.alert.create({
            data: {
              serviceId,
              severity: "WARNING",
              title: latencyAlertTitle,
              message: `Service ${service.name} response time is very high: ${responseTime}ms (threshold: 2500ms)`,
            },
          });

          sendAlertNotification(
            "Service High Latency Warning",
            `Service ${service.name} (${service.url}) is responding slowly: ${responseTime}ms.`,
            false
          ).catch((e) => console.error("Webhook latency alert error:", e));
        }
      } else {
        const activeLatencyAlert = await prisma.alert.findFirst({
          where: {
            serviceId,
            title: latencyAlertTitle,
            status: "ACTIVE",
          },
        });

        if (activeLatencyAlert) {
          await prisma.alert.update({
            where: { id: activeLatencyAlert.id },
            data: { status: "RESOLVED", resolvedAt: new Date() },
          });

          sendAlertNotification(
            "Service Latency Recovered",
            `Service ${service.name} (${service.url}) response time returned to normal: ${responseTime}ms.`,
            true
          ).catch((e) => console.error("Webhook latency recovery error:", e));
        }
      }

      return { success: true };
    } catch {
      clearTimeout(timeout);

      // Detect transition from ONLINE/DEGRADED to OFFLINE
      const wasOnline = service.status === "ONLINE" || service.status === "DEGRADED";

      await prisma.service.update({
        where: { id: serviceId },
        data: {
          status: "OFFLINE",
          lastCheckedAt: new Date(),
        },
      });

      // Create alert if service just went offline
      const recentAlert = await prisma.alert.findFirst({
        where: {
          serviceId,
          status: "ACTIVE",
          createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) },
        },
      });

      if (!recentAlert) {
        await prisma.alert.create({
          data: {
            serviceId,
            severity: "CRITICAL",
            title: `${service.name} is offline`,
            message: `Service ${service.name} (${service.url}) is not responding`,
          },
        });

        if (wasOnline) {
          // Trigger webhook alert
          sendAlertNotification(
            `${service.name} is offline`,
            `Service ${service.name} (${service.url}) is not responding.`,
            false
          ).catch((e) => console.error("Webhook offline notification error:", e));
        }
      }

      // Auto-resolve any high latency alerts when service goes offline
      await prisma.alert.updateMany({
        where: {
          serviceId,
          title: `High latency on ${service.name}`,
          status: "ACTIVE",
        },
        data: {
          status: "RESOLVED",
          resolvedAt: new Date(),
        },
      });

      return { success: false, error: "Service unreachable" };
    }
  } catch {
    return { success: false, error: "Check failed" };
  }
}

export async function checkAllServices(): Promise<ActionResult> {
  // Reachable only via the bearer-secret-protected cron route
  // (WORKER_API_SECRET validated in the route handler) or an ADMIN session.
  const services = await prisma.service.findMany({
    where: { isActive: true },
  });

  for (const service of services) {
    await checkService(service.id, { internal: true });
  }

  return { success: true, message: `Checked ${services.length} services` };
}

export async function getServicesHistory(hours = 24) {
  const session = process.env.BYPASS_AUTH === "true" ? { user: { role: "ADMIN" } } : await auth();
  if (!session) {
    throw new Error("Unauthorized");
  }

  const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
  const metrics = await prisma.metric.findMany({
    where: {
      serviceId: { not: null },
      timestamp: { gte: cutoff },
    },
    orderBy: { timestamp: "asc" },
    select: {
      serviceId: true,
      responseTime: true,
      timestamp: true,
    },
  });

  // Group metrics by serviceId
  const history: Record<string, { time: string; ms: number }[]> = {};
  for (const m of metrics) {
    if (!m.serviceId) continue;
    if (!history[m.serviceId]) history[m.serviceId] = [];
    history[m.serviceId].push({
      time: m.timestamp.toISOString(),
      ms: m.responseTime || 0,
    });
  }

  return history;
}

export async function pollAllServices(): Promise<ActionResult> {
  const session = process.env.BYPASS_AUTH === "true" ? { user: { role: "ADMIN" } } : await auth();
  if (!session) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const services = await prisma.service.findMany({
      where: { isActive: true },
    });
    
    // Perform active pings in parallel for rapid UI update
    await Promise.all(services.map((s) => checkService(s.id)));
    return { success: true, message: `Polled ${services.length} services` };
  } catch (error) {
    console.error("Failed to poll services on-demand:", error);
    return { success: false, error: "Polling failed" };
  }
}
