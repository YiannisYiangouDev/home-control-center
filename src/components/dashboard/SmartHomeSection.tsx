import { Suspense } from "react";
import { getHAClimate } from "@/actions/homeassistant";
import { SmartHomeCard } from "@/components/dashboard/SmartHomeCard";

export async function SmartHomeSection() {
  let climate: any[] = [];
  try { climate = await getHAClimate(); } catch { /* HA not configured */ }
  if (climate.length === 0) return null;

  return (
    <Suspense fallback={<div className="glass-card-static p-5 animate-pulse h-32" />}>
      <SmartHomeCard climate={climate} />
    </Suspense>
  );
}
