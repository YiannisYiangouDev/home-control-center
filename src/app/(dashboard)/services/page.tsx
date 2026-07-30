import { Suspense } from "react";
import { getServices } from "@/actions/services";
import { ServicesClient } from "@/components/dashboard/ServicesClient";
import type { Service } from "@prisma/client";

// Revalidate every 60 seconds to keep service status fresh
export const revalidate = 60;

export default async function ServicesPage() {
  let services: (Service & { serverName?: string | null })[] = [];
  try {
    services = await getServices();
  } catch {
    // DB may be empty or unavailable; render empty state
  }

  return (
    <Suspense fallback={<ServicesSkeleton />}>
      <ServicesClient services={services} />
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
