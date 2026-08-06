import { getUnraidSystemMetrics, getUnraidArrayStatus, getUnraidHistoryMetrics } from "@/actions/unraid";
import { UnraidOverviewClient } from "@/components/unraid/UnraidOverviewClient";
import { RefreshButton } from "@/components/dashboard/RefreshButton";

export const dynamic = "force-dynamic";
export const revalidate = 10;

export default async function UnraidPage() {
  const systemInfo = await getUnraidSystemMetrics().catch(() => null);
  const arrayStatus = await getUnraidArrayStatus().catch(() => null);
  const history = await getUnraidHistoryMetrics(24).catch(() => []);

  return (
    <div className="space-y-6 page-container">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Unraid Server</h1>
          <p className="text-sm text-text-muted mt-1">System overview and monitoring</p>
        </div>
        <div className="flex items-center gap-3">
          <RefreshButton />
          <div className="flex items-center gap-2 text-xs">
            <span
              className={`status-dot ${
                arrayStatus ? "status-dot-online" : "status-dot-offline"
              }`}
            />
            <span className={arrayStatus ? "text-success-400" : "text-danger-400"}>
              {arrayStatus ? "Connected" : "Disconnected"}
            </span>
          </div>
        </div>
      </div>

      <UnraidOverviewClient systemInfo={systemInfo} arrayStatus={arrayStatus} history={history} />
    </div>
  );
}
