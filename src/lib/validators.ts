import { z } from "zod";

// ---- Auth ----

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128)
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// ---- Server ----

export const serverSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  type: z.enum(["UNRAID", "NEXTCLOUD", "GENERIC"]),
  address: z.string().url("Must be a valid URL"),
  credentials: z
    .object({
      apiKey: z.string().optional(),
      username: z.string().optional(),
      password: z.string().optional(),
    })
    .optional(),
});

// ---- Service ----

export const serviceSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  type: z.enum(["DOCKER", "WEB", "API", "DATABASE", "CUSTOM"]),
  url: z.string().url("Must be a valid URL"),
  icon: z.string().optional(),
  color: z.string().optional(),
  checkInterval: z.number().min(10).max(3600).default(60),
  expectedStatus: z.number().min(100).max(599).default(200),
  serverId: z.string().optional(),
});

// ---- Contact ----

export const contactSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  whatsapp: z.string().optional(),
  telegram: z.string().optional(),
  category: z.string().default("General"),
});

// ---- Shortcut ----

export const shortcutSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  action: z.string().min(1, "Action is required"),
  actionType: z.enum([
    "PHONE_CALL",
    "SMS",
    "WHATSAPP",
    "TELEGRAM",
    "EMAIL",
    "URL",
    "CUSTOM",
  ]),
  icon: z.string().default("Link"),
  color: z.string().default("#00b4d8"),
  categoryId: z.string().optional(),
  contactId: z.string().optional(),
});

export const shortcutCategorySchema = z.object({
  name: z.string().min(1, "Name is required").max(50),
  icon: z.string().default("Folder"),
  color: z.string().default("#00b4d8"),
});

// ---- Settings ----

export const emailSettingsSchema = z.object({
  resendApiKey: z.string().optional(),
  emailFrom: z.string().email().optional().or(z.literal("")),
  dailyReport: z.boolean().default(false),
  weeklyReport: z.boolean().default(false),
  alertEmails: z.boolean().default(true),
  reportRecipient: z.string().email().optional().or(z.literal("")),
});

// ---- Inferred types ----

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ServerInput = z.infer<typeof serverSchema>;
export type ServiceInput = z.infer<typeof serviceSchema>;
export type ContactInput = z.infer<typeof contactSchema>;
export type ShortcutInput = z.infer<typeof shortcutSchema>;
export type ShortcutCategoryInput = z.infer<typeof shortcutCategorySchema>;
export type EmailSettingsInput = z.infer<typeof emailSettingsSchema>;
