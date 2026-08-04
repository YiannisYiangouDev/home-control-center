"use server";

import { prisma } from "@/lib/prisma";
import { signIn as nextAuthSignIn, signOut as nextAuthSignOut } from "@/lib/auth";
import { headers } from "next/headers";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import type { ActionResult } from "@/types";

export async function register(_formData: FormData): Promise<ActionResult> {
  // Registration is disabled — admin account already exists
  return { success: false, error: "Registration is currently disabled. Contact your administrator." };
}

// Keep the old code as dead code below in case re-enabled
/* DISABLED:
export async function ___register_old(formData: FormData): Promise<ActionResult> {
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
*/

export async function login(formData: FormData): Promise<ActionResult> {
  const reqHeaders = await headers();
  const ip = reqHeaders.get("x-forwarded-for")?.split(",")[0].trim() || "127.0.0.1";

  // Check Rate Limiting
  const limit = checkRateLimit(`auth:${ip}`, RATE_LIMITS.auth);
  if (!limit.success) {
    return {
      success: false,
      error: `Too many login attempts. Please try again in ${limit.retryAfter} seconds.`,
    };
  }

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
