"use server";

import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { totp, generateTotpSecret, generateTotpUri } from "@/lib/totp";
import type { ActionResult } from "@/types";

export async function changePassword(
  currentPassword: string,
  newPassword: string
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  if (newPassword.length < 8) {
    return { success: false, error: "Password must be at least 8 characters" };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });
  if (!user) return { success: false, error: "User not found" };

  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) {
    return { success: false, error: "Current password is incorrect" };
  }

  const newHash = await bcrypt.hash(newPassword, 12);

  // Bump tokenVersion: invalidates all previously issued JWTs (session revocation).
  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash: newHash,
      tokenVersion: { increment: 1 },
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: "PASSWORD_CHANGE",
      resource: "auth",
      details: "Password changed; all other sessions revoked",
    },
  });

  return { success: true, message: "Password updated. Other sessions were signed out." };
}

export async function setupTotp(): Promise<
  ActionResult & { secret?: string; uri?: string }
> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });
  if (!user || user.role !== "ADMIN") {
    return { success: false, error: "2FA is available for ADMIN accounts only" };
  }

  const secret = generateTotpSecret();
  const uri = generateTotpUri(user.email, secret);

  // Store the new secret immediately so verification in the next step
  // happens against the same secret.
  await prisma.user.update({
    where: { id: user.id },
    data: { totpSecret: secret },
  });

  return { success: true, message: "Scan the QR code with your authenticator app.", secret, uri };
}

export async function verifyTotpSetup(code: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });
  if (!user?.totpSecret) {
    return { success: false, error: "No pending 2FA setup" };
  }

  if (!totp.check(code, user.totpSecret)) {
    return { success: false, error: "Invalid code. Try again." };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { tokenVersion: { increment: 1 } }, // revoke sessions issued before 2FA was confirmed
  });

  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: "ENABLE_2FA",
      resource: "auth",
      details: "TOTP 2FA enabled",
    },
  });

  return { success: true, message: "2FA enabled. You will be asked for a code at login." };
}

export async function disableTotp(code: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });
  if (!user?.totpSecret) {
    return { success: false, error: "2FA is not enabled" };
  }

  if (!totp.check(code, user.totpSecret)) {
    return { success: false, error: "Invalid 2FA code" };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      totpSecret: null,
      tokenVersion: { increment: 1 },
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: "DISABLE_2FA",
      resource: "auth",
      details: "TOTP 2FA disabled",
    },
  });

  return { success: true, message: "2FA disabled." };
}