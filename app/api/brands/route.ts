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
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
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
