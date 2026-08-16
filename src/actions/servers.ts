"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { serverSchema } from "@/lib/validators";
import { encryptCredentials, decryptCredentials } from "@/lib/crypto";
import { safeFetch } from "@/lib/safe-fetch";
import type { ActionResult } from "@/types";

export async function getServers() {
  const session = await auth();
  if (!session) return [];

  const servers = await prisma.server.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { services: true, alerts: { where: { status: "ACTIVE" } } },
      },
    },
  });

  return servers.map((s) => ({
    ...s,
    encryptedCredentials: undefined,
    serviceCount: s._count.services,
    activeAlerts: s._count.alerts,
  }));
}

export async function createServer(formData: FormData): Promise<ActionResult> {
  const session = await auth();
  if (!session || (session.user as { role: string }).role !== "ADMIN") {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const raw = {
      name: formData.get("name") as string,
      type: formData.get("type") as string,
      address: formData.get("address") as string,
      credentials: {
        apiKey: (formData.get("apiKey") as string) || undefined,
        username: (formData.get("username") as string) || undefined,
        password: (formData.get("password") as string) || undefined,
      },
    };

    const parsed = serverSchema.safeParse(raw);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0].message };
    }

    const { name, type, address, credentials } = parsed.data;

    let encryptedCredentials: string | undefined;
    if (credentials && Object.values(credentials).some(Boolean)) {
      const cleanCreds: Record<string, string> = {};
      for (const [k, v] of Object.entries(credentials)) {
        if (v) cleanCreds[k] = v;
      }
      encryptedCredentials = encryptCredentials(cleanCreds);
    }

    await prisma.server.create({
      data: {
        name,
        type: type as "UNRAID" | "NEXTCLOUD" | "GENERIC",
        address,
        encryptedCredentials,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "CREATE_SERVER",
        resource: "server",
        details: `Created server: ${name}`,
      },
    });

    return { success: true, message: "Server created successfully" };
  } catch (error) {
    console.error("Create server error:", error);
    return { success: false, error: "Failed to create server" };
  }
}

export async function deleteServer(serverId: string): Promise<ActionResult> {
  const session = await auth();
  if (!session || (session.user as { role: string }).role !== "ADMIN") {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await prisma.server.delete({ where: { id: serverId } });

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "DELETE_SERVER",
        resource: "server",
        details: `Deleted server: ${serverId}`,
      },
    });

    return { success: true };
  } catch {
    return { success: false, error: "Failed to delete server" };
  }
}

export async function testServerConnection(
  serverId: string
): Promise<ActionResult> {
  const session = await auth();
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    const server = await prisma.server.findUnique({
      where: { id: serverId },
    });
    if (!server) return { success: false, error: "Server not found" };

    // Try to fetch the server
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const response = await safeFetch(server.address, {
      signal: controller.signal,
      method: "HEAD",
    });
    clearTimeout(timeout);

    if (response.ok) {
      await prisma.server.update({
        where: { id: serverId },
        data: { lastCheckedAt: new Date() },
      });
      return { success: true, message: "Connection successful" };
    }

    return { success: false, error: `Server returned ${response.status}` };
  } catch {
    return { success: false, error: "Connection failed" };
  }
}
