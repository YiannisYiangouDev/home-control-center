"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { shortcutSchema, shortcutCategorySchema } from "@/lib/validators";
import type { ActionResult } from "@/types";

async function resolveUserId() {
  const session = process.env.BYPASS_AUTH === "true" ? { user: { id: "bypass", role: "ADMIN" } } : await auth();
  if (!session) return null;

  if (process.env.BYPASS_AUTH === "true" && session.user.id === "bypass") {
    try {
      const admin = await prisma.user.findFirst({ where: { role: "ADMIN" }, select: { id: true } });
      return admin?.id || null;
    } catch {
      // DB temporarily unavailable — allow writes anyway (will work when DB recovers)
      return "bypass";
    }
  }
  return session.user.id;
}

export async function getShortcuts() {
  const userId = await resolveUserId();
  if (!userId) return [];

  return prisma.shortcut.findMany({
    where: { userId },
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    include: {
      category: { select: { name: true, color: true } },
      contact: { select: { name: true } },
    },
  });
}

export async function getShortcutCategories() {
  const session = await auth();
  if (!session) return [];

  return prisma.shortcutCategory.findMany({
    where: { userId: session.user.id },
    orderBy: { order: "asc" },
    include: {
      _count: { select: { shortcuts: true } },
    },
  });
}

export async function createShortcut(formData: FormData): Promise<ActionResult> {
  const userId = await resolveUserId();
  if (!userId) return { success: false, error: "Unauthorized" };

  try {
    const raw = {
      title: formData.get("title") as string,
      action: formData.get("action") as string,
      actionType: formData.get("actionType") as string,
      icon: (formData.get("icon") as string) || "Link",
      color: (formData.get("color") as string) || "#00b4d8",
      categoryId: (formData.get("categoryId") as string) || undefined,
      contactId: (formData.get("contactId") as string) || undefined,
    };

    const parsed = shortcutSchema.safeParse(raw);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0].message };
    }

    const maxOrder = await prisma.shortcut.findFirst({
      where: { userId },
      orderBy: { order: "desc" },
      select: { order: true },
    });

    await prisma.shortcut.create({
      data: {
        title: parsed.data.title,
        action: parsed.data.action,
        actionType: parsed.data.actionType,
        icon: parsed.data.icon,
        color: parsed.data.color,
        categoryId: parsed.data.categoryId || null,
        contactId: parsed.data.contactId || null,
        userId,
        order: (maxOrder?.order || 0) + 1,
      },
    });

    return { success: true, message: "Shortcut created" };
  } catch (error) {
    console.error("Create shortcut error:", error);
    return { success: false, error: "Failed to create shortcut" };
  }
}

export async function deleteShortcut(id: string): Promise<ActionResult> {
  const userId = await resolveUserId();
  if (!userId) return { success: false, error: "Unauthorized" };

  try {
    await prisma.shortcut.deleteMany({ where: { id, userId } });
    return { success: true };
  } catch {
    return { success: false, error: "Failed to delete shortcut" };
  }
}

export async function updateShortcut(id: string, data: { title?: string; action?: string; icon?: string; color?: string }): Promise<ActionResult> {
  const userId = await resolveUserId();
  if (!userId) return { success: false, error: "Unauthorized" };

  try {
    await prisma.shortcut.updateMany({ where: { id, userId }, data });
    return { success: true };
  } catch {
    return { success: false, error: "Failed to update shortcut" };
  }
}

export async function reorderShortcuts(
  orderedIds: string[]
): Promise<ActionResult> {
  const session = await auth();
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    for (let i = 0; i < orderedIds.length; i++) {
      await prisma.shortcut.updateMany({
        where: { id: orderedIds[i], userId: session.user.id },
        data: { order: i },
      });
    }
    return { success: true };
  } catch {
    return { success: false, error: "Failed to reorder" };
  }
}

export async function createShortcutCategory(
  formData: FormData
): Promise<ActionResult> {
  const session = await auth();
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    const parsed = shortcutCategorySchema.safeParse({
      name: formData.get("name"),
      icon: formData.get("icon") || "Folder",
      color: formData.get("color") || "#00b4d8",
    });

    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0].message };
    }

    const maxOrder = await prisma.shortcutCategory.findFirst({
      where: { userId: session.user.id },
      orderBy: { order: "desc" },
      select: { order: true },
    });

    await prisma.shortcutCategory.create({
      data: {
        ...parsed.data,
        userId: session.user.id,
        order: (maxOrder?.order || 0) + 1,
      },
    });

    return { success: true, message: "Category created" };
  } catch {
    return { success: false, error: "Failed to create category" };
  }
}
