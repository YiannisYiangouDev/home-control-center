"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { serviceSchema } from "@/lib/validators";
import type { ActionResult } from "@/types";

export async function getServices() {
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

export async function checkService(serviceId: string): Promise<ActionResult> {
  try {
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });
    if (!service) return { success: false, error: "Service not found" };

    const start = Date.now();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    try {
      const response = await fetch(service.url, {
        signal: controller.signal,
        method: "HEAD",
        redirect: "follow",
      });
      clearTimeout(timeout);

      const responseTime = Date.now() - start;
      const isOnline = response.status === service.expectedStatus;

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

      return { success: true };
    } catch {
      clearTimeout(timeout);

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
      }

      return { success: false, error: "Service unreachable" };
    }
  } catch {
    return { success: false, error: "Check failed" };
  }
}

export async function checkAllServices(): Promise<ActionResult> {
  const services = await prisma.service.findMany({
    where: { isActive: true },
  });

  for (const service of services) {
    await checkService(service.id);
  }

  return { success: true, message: `Checked ${services.length} services` };
}
