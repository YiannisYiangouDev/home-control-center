"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { ActionResult } from "@/types";

export async function getAlerts(status?: string) {
  const where = status ? { status: status as "ACTIVE" | "ACKNOWLEDGED" | "RESOLVED" } : {};

  return prisma.alert.findMany({
    where,
    orderBy: [{ severity: "asc" }, { createdAt: "desc" }],
    take: 100,
    include: {
      server: { select: { name: true } },
      service: { select: { name: true } },
    },
  });
}

export async function acknowledgeAlert(alertId: string): Promise<ActionResult> {
  const session = await auth();
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    await prisma.alert.update({
      where: { id: alertId },
      data: {
        status: "ACKNOWLEDGED",
        acknowledgedAt: new Date(),
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "ACKNOWLEDGE_ALERT",
        resource: "alert",
        details: `Acknowledged alert: ${alertId}`,
      },
    });

    return { success: true };
  } catch {
    return { success: false, error: "Failed to acknowledge alert" };
  }
}

export async function resolveAlert(alertId: string): Promise<ActionResult> {
  const session = await auth();
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    await prisma.alert.update({
      where: { id: alertId },
      data: {
        status: "RESOLVED",
        resolvedAt: new Date(),
      },
    });

    return { success: true };
  } catch {
    return { success: false, error: "Failed to resolve alert" };
  }
}

export async function resolveAllAlerts(): Promise<ActionResult> {
  const session = await auth();
  if (!session || (session.user as { role: string }).role !== "ADMIN") {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await prisma.alert.updateMany({
      where: { status: "ACTIVE" },
      data: {
        status: "RESOLVED",
        resolvedAt: new Date(),
      },
    });

    return { success: true, message: "All alerts resolved" };
  } catch {
    return { success: false, error: "Failed to resolve alerts" };
  }
}
