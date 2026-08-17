import { NextResponse } from "next/server";
import { getHomepageConfig } from "@/lib/homepage-store";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export async function GET() {
  try {
    const config = await getHomepageConfig();
    const activeOffers = (config.offers || [])
      .filter((o) => o.isEnabled !== false)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    return NextResponse.json(
      {
        success: true,
        offers: activeOffers,
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
    console.error("[API Homepage Offers GET] Error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch offers" },
      { status: 500 }
    );
  }
}
