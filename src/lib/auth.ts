import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validators";
import { MAX_LOGIN_ATTEMPTS, LOCKOUT_DURATION_MINUTES } from "@/lib/constants";
import { authConfig } from "./auth.config";
import { headers } from "next/headers";
import { checkRateLimit, RATE_LIMITS, getClientIp } from "@/lib/rate-limit";
import { validateSecrets, assertNoBypassAuth } from "./env-validate";

validateSecrets();
assertNoBypassAuth();

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const ip = getClientIp(await headers());
        const limit = checkRateLimit(`auth:${ip}`, RATE_LIMITS.auth);
        if (!limit.success) {
          throw new Error("Too many login attempts. Please try again later.");
        }

        const { email, password } = parsed.data;

        const user = await prisma.user.findUnique({
          where: { email: email.toLowerCase() },
        });

        if (!user) return null;

        // IP-layer throttle: gate BEFORE bcrypt so a throttled source
        // cannot keep hammering (or lock the account out repeatedly).
        const ipLimit = checkRateLimit(`fail:${ip}`, {
          maxRequests: 10,
          windowSeconds: 300,
        });
        if (!ipLimit.success) {
          throw new Error("Too many login attempts. Please try again later.");
        }

        // Check if account is locked
        if (user.lockedUntil && user.lockedUntil > new Date()) {
          throw new Error("Account is temporarily locked. Please try again later.");
        }

        const isValidPassword = await bcrypt.compare(password, user.passwordHash);

        if (!isValidPassword) {
          // Increment failed attempts
          const newAttempts = user.failedAttempts + 1;
          const updateData: Record<string, unknown> = {
            failedAttempts: newAttempts,
          };

          if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
            updateData.lockedUntil = new Date(
              Date.now() + LOCKOUT_DURATION_MINUTES * 60 * 1000
            );
          }

          await prisma.user.update({
            where: { id: user.id },
            data: updateData,
          });

          return null;
        }

        // Reset failed attempts on successful login
        await prisma.user.update({
          where: { id: user.id },
          data: {
            failedAttempts: 0,
            lockedUntil: null,
            lastLoginAt: new Date(),
          },
        });

        // Audit log
        await prisma.auditLog.create({
          data: {
            userId: user.id,
            action: "LOGIN",
            resource: "auth",
            details: "Successful login",
          },
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
});
