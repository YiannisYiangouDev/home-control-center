"use server";

import { auth } from "@/lib/auth";
import { createNextcloudClient } from "@/services/nextcloud/client";

export async function getNextcloudServerInfo() {
  const session = await auth();
  if (!session) {
    throw new Error("Unauthorized");
  }

  const client = createNextcloudClient();
  if (!client) {
    return null;
  }

  return await client.getServerInfo();
}
