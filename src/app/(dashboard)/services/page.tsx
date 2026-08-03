import { Suspense } from "react";
import { getServices, getServicesHistory } from "@/actions/services";
import { ServicesClient } from "@/components/dashboard/ServicesClient";
import type { Service } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function ServicesPage() {
  let services: (Service & { serverName?: string | null })[] = [];
  let history: Record<string, { time: string; ms: number }[]> = {};
  
  try {
    services = await getServices();
    history = await getServicesHistory(24).catch(() => ({}));
  } catch {
    // DB may be empty or unavailable; render empty state
  }

  return (
    <Suspense fallback={<ServicesSkeleton />}>
      <ServicesClient services={services} history={history} />
    </Suspense>
  );
}

function ServicesSkeleton() {
  return (
    <div className="space-y-6 page-container animate-pulse">
      <div className="h-8 w-48 bg-bg-elevated rounded" />
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={`skel-${i}`} className="glass-card p-4 h-32" />
        ))}
      </div>
    </div>
  );
}
