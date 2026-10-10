"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import type { ActionResult } from "@/types";

const layoutSchema = z.object({
  order: z.array(z.string()).max(64),
  hidden: z.array(z.string()).max(64),
});

export type DashboardLayout = z.infer<typeof layoutSchema>;

export async function getLayout(): Promise<DashboardLayout | null> {
  const session = await auth();
  if (!session?.user?.id) return null;

  const row = await prisma.setting.findFirst({
    where: { key: "dashboard_layout", userId: session.user.id },
  });
  if (!row) return null;

  try {
    return layoutSchema.parse(JSON.parse(row.value));
  } catch {
    return null;
  }
}

export async function saveLayout(input: unknown): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };
  if ((session.user as { role?: string }).role !== "ADMIN") {
    return { success: false, error: "Forbidden" };
  }

  const parsed = layoutSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Invalid layout" };

  await prisma.setting.upsert({
    where: { key_userId: { key: "dashboard_layout", userId: session.user.id } },
    create: {
      key: "dashboard_layout",
      value: JSON.stringify(parsed.data),
      userId: session.user.id,
    },
    update: { value: JSON.stringify(parsed.data) },
  });

  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: "UPDATE_LAYOUT",
      resource: "dashboard_layout",
      details: JSON.stringify(parsed.data).slice(0, 1000),
    },
  });

  return { success: true, message: "Layout saved" };
}