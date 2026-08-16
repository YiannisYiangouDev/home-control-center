import { NextResponse } from "next/server";
import { checkAllServices } from "@/actions/services";
import { logUnraidMetrics } from "@/actions/unraid";
import { checkRateLimit, RATE_LIMITS, getRateLimitHeaders, getClientIp } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const ip = getClientIp(request.headers);

  // 1. Rate Limiting Check
  const limit = checkRateLimit(`api:cron:${ip}`, RATE_LIMITS.api);
  const rateLimitHeaders = getRateLimitHeaders(limit);
  if (!limit.success) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: rateLimitHeaders }
    );
  }

  // 2. Authentication Check
  const authHeader = request.headers.get("authorization");
  const expectedSecret = process.env.WORKER_API_SECRET;
  const isDev = process.env.BYPASS_AUTH === "true";

  if (!isDev) {
    if (!expectedSecret || authHeader !== `Bearer ${expectedSecret}`) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401, headers: rateLimitHeaders }
      );
    }
  }

  try {
    const result = await checkAllServices();
    // Fire and forget logging Unraid server metrics historically
    logUnraidMetrics().catch((e) => console.error("Poll Unraid metrics logger error:", e));
    return NextResponse.json(result);
  } catch (error) {
    console.error("Poll services error:", error);
    return NextResponse.json(
      { success: false, error: "Polling failed" },
      { status: 500 }
    );
  }
}
