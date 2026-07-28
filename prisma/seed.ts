import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Check if admin already exists
  const existingAdmin = await prisma.user.findFirst({
    where: { role: "ADMIN" },
  });

  if (existingAdmin) {
    console.log("✅ Admin user already exists, skipping seed.");
    return;
  }

  // Create admin user
  const adminEmail = process.env.ADMIN_EMAIL || "admin@homeserver.local";
  const adminPassword = process.env.ADMIN_PASSWORD || "Admin123!";
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  const admin = await prisma.user.create({
    data: {
      email: adminEmail,
      name: "Admin",
      passwordHash,
      role: "ADMIN",
    },
  });

  console.log(`👤 Admin user created: ${adminEmail}`);

  // Create default shortcut categories
  const categories = [
    { name: "Family", icon: "Heart", color: "#f472b6" },
    { name: "Work", icon: "Briefcase", color: "#60a5fa" },
    { name: "Emergency", icon: "AlertTriangle", color: "#f87171" },
    { name: "Services", icon: "Globe", color: "#34d399" },
  ];

  for (let i = 0; i < categories.length; i++) {
    await prisma.shortcutCategory.create({
      data: {
        ...categories[i],
        order: i,
        userId: admin.id,
      },
    });
  }

  console.log("📁 Default shortcut categories created");

  // Create default settings
  const defaultSettings = [
    { key: "polling_interval", value: "60" },
    { key: "daily_report_enabled", value: "false" },
    { key: "weekly_report_enabled", value: "false" },
    { key: "alert_emails_enabled", value: "true" },
    { key: "theme", value: "dark" },
  ];

  for (const setting of defaultSettings) {
    await prisma.setting.create({
      data: {
        key: setting.key,
        value: setting.value,
        userId: admin.id,
      },
    });
  }

  console.log("⚙️  Default settings created");
  console.log("✅ Seed completed!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
