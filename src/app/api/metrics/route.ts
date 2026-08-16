import { prisma } from "@/lib/prisma";
import { checkRateLimit, RATE_LIMITS, getRateLimitHeaders, getClientIp } from "@/lib/rate-limit";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const ip = getClientIp(request.headers);

  // 1. Rate Limiting Check
  const limit = checkRateLimit(`api:metrics:${ip}`, RATE_LIMITS.api);
  const rateLimitHeaders = getRateLimitHeaders(limit);
  if (!limit.success) {
    return new Response("Too many requests", {
      status: 429,
      headers: {
        "Content-Type": "text/plain",
        ...rateLimitHeaders,
      },
    });
  }

  // 2. Validate Authorization Header (harden to always require expected secret in production)
  const authHeader = request.headers.get("authorization");
  const expectedSecret = process.env.WORKER_API_SECRET;
  const isDev = process.env.BYPASS_AUTH === "true";

  if (!isDev) {
    if (!expectedSecret || authHeader !== `Bearer ${expectedSecret}`) {
      return new Response("Unauthorized", {
        status: 401,
        headers: {
          "Content-Type": "text/plain",
          ...rateLimitHeaders,
        },
      });
    }
  }

  const services = await prisma.service.findMany({
    include: {
      server: { select: { name: true } },
    },
  });
  
  const servers = await prisma.server.findMany();

  // Fetch the latest system metrics record for each server
  const latestServerMetrics = await Promise.all(
    servers.map(async (server) => {
      const metric = await prisma.metric.findFirst({
        where: { serverId: server.id },
        orderBy: { timestamp: "desc" },
      });
      return { server, metric };
    })
  );

  let output = "";

  // 1. Service Statuses (1 = ONLINE, 0 = OFFLINE/UNKNOWN/DEGRADED)
  output += "# HELP hcc_service_status Status of monitored service (1 = ONLINE, 0 = OFFLINE/DEGRADED)\n";
  output += "# TYPE hcc_service_status gauge\n";
  for (const s of services) {
    const val = s.status === "ONLINE" ? 1 : 0;
    const parentServer = s.server?.name || "none";
    output += `hcc_service_status{id="${s.id}",name="${s.name}",url="${s.url}",server="${parentServer}"} ${val}\n`;
  }

  // 2. Service Response Times (latency)
  output += "\n# HELP hcc_service_response_time_ms Current response latency of service in milliseconds\n";
  output += "# TYPE hcc_service_response_time_ms gauge\n";
  for (const s of services) {
    if (s.responseTime !== null) {
      output += `hcc_service_response_time_ms{id="${s.id}",name="${s.name}"} ${s.responseTime}\n`;
    }
  }

  // 3. Server Statuses
  output += "\n# HELP hcc_server_status Status of monitored host servers (1 = ONLINE, 0 = OFFLINE)\n";
  output += "# TYPE hcc_server_status gauge\n";
  for (const s of servers) {
    const val = s.isActive && s.lastCheckedAt ? 1 : 0; // Check server active state
    output += `hcc_server_status{id="${s.id}",name="${s.name}",type="${s.type}",address="${s.address}"} ${val}\n`;
  }

  // 4. Server Resource Usage (CPU, RAM, Storage, Temp)
  output += "\n# HELP hcc_server_cpu_percent Last checked CPU utilization percentage\n";
  output += "# TYPE hcc_server_cpu_percent gauge\n";
  output += "# HELP hcc_server_ram_percent Last checked RAM utilization percentage\n";
  output += "# TYPE hcc_server_ram_percent gauge\n";
  output += "# HELP hcc_server_storage_percent Last checked disk storage utilization percentage\n";
  output += "# TYPE hcc_server_storage_percent gauge\n";
  output += "# HELP hcc_server_max_disk_temp_celsius Last checked maximum SMART disk temperature in Celsius\n";
  output += "# TYPE hcc_server_max_disk_temp_celsius gauge\n";

  for (const item of latestServerMetrics) {
    if (item.metric) {
      const name = item.server.name;
      const id = item.server.id;
      if (item.metric.cpu !== null) {
        output += `hcc_server_cpu_percent{id="${id}",server="${name}"} ${item.metric.cpu}\n`;
      }
      if (item.metric.ram !== null) {
        output += `hcc_server_ram_percent{id="${id}",server="${name}"} ${item.metric.ram}\n`;
      }
      if (item.metric.storage !== null) {
        output += `hcc_server_storage_percent{id="${id}",server="${name}"} ${item.metric.storage}\n`;
      }
      if (item.metric.temperature !== null) {
        output += `hcc_server_max_disk_temp_celsius{id="${id}",server="${name}"} ${item.metric.temperature}\n`;
      }
    }
  }

  return new Response(output, {
    headers: {
      "Content-Type": "text/plain; version=0.0.4; charset=utf-8",
    },
  });
}
