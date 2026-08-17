import { NextRequest, NextResponse } from "next/server";
import { getHomepageConfig, saveHomepageConfig } from "@/lib/homepage-store";
import { HomepageConfig } from "@/types/homepage";
import { getAuthenticatedAdminSession } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const adminSession = await getAuthenticatedAdminSession();
    if (!adminSession) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Administrator privileges required." },
        { status: 403 }
      );
    }

    const config = await getHomepageConfig();
    return NextResponse.json(
      {
        success: true,
        config,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  } catch (err: any) {
    console.error("[API Admin Homepage GET] Error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch homepage configuration" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const adminSession = await getAuthenticatedAdminSession();
    if (!adminSession) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Administrator privileges required." },
        { status: 403 }
      );
    }

    const body = await req.json();
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, error: "Invalid payload" },
        { status: 400 }
      );
    }

    const updatedConfig = await saveHomepageConfig(body as Partial<HomepageConfig>);

    return NextResponse.json(
      {
        success: true,
        message: "Homepage settings successfully saved to database.",
        config: updatedConfig,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (err: any) {
    console.error("[API Admin Homepage POST] Error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to save homepage configuration" },
      { status: 500 }
    );
  }
}
