"use server";

import { auth } from "@/lib/auth";
import { createHAClient } from "@/services/homeassistant/client";

export async function getHAStates() {
  const session = process.env.BYPASS_AUTH === "true" ? { user: { role: "ADMIN" } } : await auth();
  if (!session) throw new Error("Unauthorized");

  const client = createHAClient();
  if (!client) return [];

  try {
    return await client.getStates();
  } catch (error) {
    console.error("HA fetch error:", error);
    return [];
  }
}

export async function getHAClimate() {
  const session = process.env.BYPASS_AUTH === "true" ? { user: { role: "ADMIN" } } : await auth();
  if (!session) throw new Error("Unauthorized");

  const client = createHAClient();
  if (!client) return [];

  try {
    return await client.getClimateEntities();
  } catch (error) {
    console.error("HA climate fetch error:", error);
    return [];
  }
}
