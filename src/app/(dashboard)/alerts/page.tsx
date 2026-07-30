import { Suspense } from "react";
import { getAlerts } from "@/actions/alerts";
import { AlertsClient } from "../../../components/dashboard/AlertsClient";

export const revalidate = 30;

export default async function AlertsPage() {
  let alerts: any[] = [];
  try { alerts = await getAlerts(); } catch { /* empty */ }

  return (
    <Suspense fallback={<div className="animate-pulse h-96" />}>
      <AlertsClient alerts={alerts} />
    </Suspense>
  );
}
