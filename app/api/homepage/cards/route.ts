import { NextResponse } from "next/server";
import { getHomepageConfig } from "@/lib/homepage-store";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export async function GET() {
  try {
    const config = await getHomepageConfig();
    const cards = (config.cards || []).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    return NextResponse.json(
      {
        success: true,
        cards,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0",
          Pragma: "no-cache",
          Expires: "0",
          "Surrogate-Control": "no-store",
        },
      }
    );
  } catch (err: any) {
    console.error("[API Homepage Cards GET] Error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch homepage cards" },
      { status: 500 }
    );
  }
}
