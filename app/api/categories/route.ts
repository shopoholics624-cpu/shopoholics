import { NextRequest, NextResponse } from "next/server";
import { getWooCategories, getWooVisibleCategories } from "@/lib/woocommerce";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeEmpty = searchParams.get("include_empty") === "true";

    const categories = includeEmpty
      ? await getWooCategories()
      : await getWooVisibleCategories();

    return NextResponse.json(
      {
        success: true,
        categories,
        total: categories.length,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
        },
      }
    );
  } catch (error) {
    console.error("[API /api/categories] Internal Error:", error instanceof Error ? error.message : error);

    return NextResponse.json(
      {
        success: false,
        message: "An error occurred while fetching WooCommerce categories.",
        categories: [],
        total: 0,
      },
      { status: 500 }
    );
  }
}
