import { getNextcloudServerInfo } from "@/actions/nextcloud";
import { NextcloudDashboardClient } from "@/components/nextcloud/NextcloudDashboardClient";

export const dynamic = "force-dynamic";

const fallbackInfo = {
  status: "offline" as const,
  version: "Unknown",
  health: false,
  database: { type: "Unknown", version: "Unknown", size: 0 },
  storage: { total: 0, used: 0, free: 0, numFiles: 0 },
  cron: { lastRun: "", status: "error" as const },
  activeUsers: { last5min: 0, lastHour: 0, lastDay: 0 },
  apps: { installed: 0, updatesAvailable: 0 },
  phpVersion: "Unknown",
  webServer: "Unknown",
};

export default async function NextcloudPage() {
  const rawInfo = await getNextcloudServerInfo().catch(() => null);
  const serverInfo = rawInfo || fallbackInfo;

  const isOnline = serverInfo.status === "online";

  return (
    <div className="space-y-6 page-container">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Nextcloud</h1>
          <p className="text-sm text-text-muted mt-1">Cloud storage and collaboration platform</p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span
            className={`status-dot ${isOnline ? "status-dot-online" : "status-dot-offline"}`}
          />
          <span className={isOnline ? "text-success-400" : "text-danger-400"}>
            {isOnline ? `Online · v${serverInfo.version}` : "Connection Failed"}
          </span>
        </div>
      </div>

      <NextcloudDashboardClient serverInfo={serverInfo} />
    </div>
  );
}
