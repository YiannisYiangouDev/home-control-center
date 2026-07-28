"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signIn as nextAuthSignIn, signOut as nextAuthSignOut } from "@/lib/auth";
import { registerSchema } from "@/lib/validators";
import type { ActionResult } from "@/types";
import { DEFAULT_SHORTCUT_CATEGORIES } from "@/lib/constants";

export async function register(formData: FormData): Promise<ActionResult> {
  try {
    const raw = {
      email: formData.get("email") as string,
      name: formData.get("name") as string,
      password: formData.get("password") as string,
      confirmPassword: formData.get("confirmPassword") as string,
    };

    const parsed = registerSchema.safeParse(raw);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0].message };
    }

    const { email, name, password } = parsed.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return { success: false, error: "An account with this email already exists" };
    }

    // Check if this is the first user (make them admin)
    const userCount = await prisma.user.count();
    const role = userCount === 0 ? "ADMIN" : "VIEWER";

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        name,
        passwordHash,
        role,
      },
    });

    // Create default shortcut categories for the user
    for (let i = 0; i < DEFAULT_SHORTCUT_CATEGORIES.length; i++) {
      const cat = DEFAULT_SHORTCUT_CATEGORIES[i];
      await prisma.shortcutCategory.create({
        data: {
          name: cat.name,
          icon: cat.icon,
          color: cat.color,
          order: i,
          userId: user.id,
        },
      });
    }

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "REGISTER",
        resource: "auth",
        details: `User registered as ${role}`,
      },
    });

    return { success: true, message: "Account created successfully" };
  } catch (error) {
    console.error("Registration error:", error);
    return { success: false, error: "Failed to create account" };
  }
}

export async function login(formData: FormData): Promise<ActionResult> {
  try {
    await nextAuthSignIn("credentials", {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      redirect: false,
    });
    return { success: true };
  } catch {
    return { success: false, error: "Invalid email or password" };
  }
}

export async function logout(): Promise<void> {
  await nextAuthSignOut({ redirect: true, redirectTo: "/login" });
}

export async function checkFirstRun(): Promise<boolean> {
  const userCount = await prisma.user.count();
  return userCount === 0;
}
