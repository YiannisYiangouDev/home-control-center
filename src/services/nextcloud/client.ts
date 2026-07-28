export class NextcloudClient {
  private baseUrl: string;
  private username: string;
  private password: string;

  constructor(url: string, username: string, password: string) {
    this.baseUrl = url.replace(/\/$/, "");
    this.username = username;
    this.password = password;
  }

  private get authHeader(): string {
    return "Basic " + Buffer.from(`${this.username}:${this.password}`).toString("base64");
  }

  private async ocsRequest(endpoint: string) {
    const url = `${this.baseUrl}/ocs/v2.php/${endpoint}?format=json`;

    const response = await fetch(url, {
      headers: {
        Authorization: this.authHeader,
        "OCS-APIRequest": "true",
        Accept: "application/json",
      },
      next: { revalidate: 300 }, // Cache for 5 minutes
    });

    if (!response.ok) {
      throw new Error(`Nextcloud API error: ${response.status}`);
    }

    const data = await response.json();
    return data?.ocs?.data;
  }

  async getServerInfo() {
    try {
      const data = await this.ocsRequest("apps/serverinfo/api/v1/info");

      return {
        status: "online" as const,
        version: data?.nextcloud?.system?.version || "Unknown",
        health: true,
        database: {
          type: data?.server?.database?.type || "Unknown",
          version: data?.server?.database?.version || "Unknown",
          size: data?.server?.database?.size || 0,
        },
        storage: {
          total: data?.nextcloud?.system?.freespace
            ? data.nextcloud.system.freespace + (data.nextcloud.storage?.num_storages_local || 0)
            : 0,
          used: data?.nextcloud?.storage?.num_storages_local || 0,
          free: data?.nextcloud?.system?.freespace || 0,
          numFiles: data?.nextcloud?.storage?.num_files || 0,
        },
        cron: {
          lastRun: data?.nextcloud?.system?.last_cron || "",
          status: this.getCronStatus(data?.nextcloud?.system?.last_cron),
        },
        activeUsers: {
          last5min: data?.activeUsers?.last5minutes || 0,
          lastHour: data?.activeUsers?.last1hour || 0,
          lastDay: data?.activeUsers?.last24hours || 0,
        },
        apps: {
          installed: data?.nextcloud?.system?.apps?.num_installed || 0,
          updatesAvailable: data?.nextcloud?.system?.apps?.num_updates_available || 0,
        },
        phpVersion: data?.server?.php?.version || "Unknown",
        webServer: data?.server?.webserver || "Unknown",
      };
    } catch (error) {
      console.error("Nextcloud fetch error:", error);
      return {
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
    }
  }

  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/status.php`, {
        headers: { Accept: "application/json" },
      });
      const data = await response.json();
      return data?.installed === true && data?.maintenance === false;
    } catch {
      return false;
    }
  }

  private getCronStatus(lastRun?: string): "ok" | "warning" | "error" {
    if (!lastRun) return "error";
    const lastRunDate = new Date(lastRun);
    const minutesSinceRun = (Date.now() - lastRunDate.getTime()) / 60000;
    if (minutesSinceRun < 15) return "ok";
    if (minutesSinceRun < 60) return "warning";
    return "error";
  }
}

export function createNextcloudClient(): NextcloudClient | null {
  const url = process.env.NEXTCLOUD_URL;
  const username = process.env.NEXTCLOUD_USERNAME;
  const password = process.env.NEXTCLOUD_APP_PASSWORD;

  if (!url || !username || !password) return null;

  return new NextcloudClient(url, username, password);
}
