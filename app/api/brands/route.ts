export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextRequest, NextResponse } from "next/server";
import { getWooBrands } from "@/lib/woocommerce";

export async function GET(request: NextRequest) {
  try {
    const brands = await getWooBrands();

    return NextResponse.json(
      {
        success: true,
        brands,
        total: brands.length,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
        },
      }
    );
  } catch (error) {
    console.error("[API /api/brands] Internal Error:", error instanceof Error ? error.message : error);

    return NextResponse.json(
      {
        success: false,
        message: "An error occurred while fetching WooCommerce brands.",
        brands: [],
        total: 0,
      },
      { status: 500 }
    );
  }
}
