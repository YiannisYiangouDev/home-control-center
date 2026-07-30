import { NextResponse } from "next/server";
import { checkAllServices } from "@/actions/services";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  // Verify worker secret (skip in dev with BYPASS_AUTH)
  const authHeader = request.headers.get("authorization");
  const expectedSecret = process.env.WORKER_API_SECRET;
  const isDev = process.env.BYPASS_AUTH === "true";

  if (expectedSecret && !isDev && authHeader !== `Bearer ${expectedSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await checkAllServices();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Poll services error:", error);
    return NextResponse.json(
      { success: false, error: "Polling failed" },
      { status: 500 }
    );
  }
}
