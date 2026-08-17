export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextRequest, NextResponse } from "next/server";
import { getWooProductVariations } from "@/lib/woocommerce";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const productId = resolvedParams.id;

    if (!productId) {
      return NextResponse.json({ success: false, message: "Missing product ID" }, { status: 400 });
    }

    const variations = await getWooProductVariations(productId);

    return NextResponse.json(
      {
        success: true,
        variations,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
        },
      }
    );
  } catch (error) {
    console.error("[API Variations] Internal Error:", error instanceof Error ? error.message : error);
    return NextResponse.json(
      {
        success: false,
        message: "An internal server error occurred while retrieving product variations.",
        variations: [],
      },
      { status: 500 }
    );
  }
}
