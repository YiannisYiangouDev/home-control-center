import { Suspense } from "react";
import { getServices } from "@/actions/services";
import { getAlerts } from "@/actions/alerts";
import { getShortcuts } from "@/actions/shortcuts";
import { getHAClimate } from "@/actions/homeassistant";
import { getUnraidSystemMetrics, getUnraidArrayStatus } from "@/actions/unraid";
import { DashboardClient } from "@/components/dashboard/DashboardClient";
import type { Service } from "@prisma/client";

export const revalidate = 10;

export default async function DashboardPage() {
  let services: (Service & { serverName?: string | null })[] = [];
  let alerts: any[] = [];
  let shortcuts: any[] = [];
  let haClimate: any[] = [];
  let systemInfo: any = null;
  let arrayStatus: any = null;

  try { services = await getServices(); } catch { /* empty */ }
  try { alerts = await getAlerts("ACTIVE"); } catch { /* empty */ }
  try { shortcuts = await getShortcuts(); } catch { /* empty */ }
  try { haClimate = await getHAClimate(); } catch (e) { console.error("HA climate fetch error:", e); }
  try { systemInfo = await getUnraidSystemMetrics(); } catch { /* empty */ }
  try { arrayStatus = await getUnraidArrayStatus(); } catch { /* empty */ }

  return (
    <Suspense fallback={<div className="h-screen animate-pulse" />}>
      <DashboardClient
        services={services}
        alerts={alerts}
        shortcuts={shortcuts}
        haClimate={haClimate}
        systemInfo={systemInfo}
        arrayStatus={arrayStatus}
      />
    </Suspense>
  );
}
