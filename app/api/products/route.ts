export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextRequest, NextResponse } from "next/server";
import { getWooProducts, getWooProductBySlug, getWooProductById } from "@/lib/woocommerce";
import { WooProductQueryParams } from "@/types/woocommerce";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Sanitize and validate query parameters
    const slugParam = searchParams.get("slug")?.trim();
    const idParam = searchParams.get("id")?.trim();

    // Direct single product lookup by slug or ID
    if (slugParam) {
      const wooProduct = await getWooProductBySlug(slugParam);
      if (wooProduct) {
        return NextResponse.json(
          {
            success: true,
            product: wooProduct,
            products: [wooProduct],
            total: 1,
            totalPages: 1,
            isConfigured: true,
          },
          {
            headers: {
              "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
            },
          }
        );
      }
    }

    if (idParam) {
      const wooProduct = await getWooProductById(idParam);
      if (wooProduct) {
        return NextResponse.json(
          {
            success: true,
            product: wooProduct,
            products: [wooProduct],
            total: 1,
            totalPages: 1,
            isConfigured: true,
          },
          {
            headers: {
              "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
            },
          }
        );
      }
    }

    const pageParam = parseInt(searchParams.get("page") || "1", 10);
    const perPageParam = parseInt(searchParams.get("per_page") || "100", 10);
    const search = searchParams.get("search")?.trim() || undefined;
    const category = searchParams.get("category")?.trim() || undefined;
    const brand = searchParams.get("brand")?.trim() || undefined;
    const orderbyRaw = searchParams.get("orderby")?.trim() || undefined;
    const orderRaw = searchParams.get("order")?.trim()?.toLowerCase() || undefined;

    const page = isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;
    const per_page = isNaN(perPageParam) || perPageParam < 1 || perPageParam > 100 ? 100 : perPageParam;

    const validOrderby = ["date", "id", "include", "title", "slug", "price", "popularity", "rating"];
    const orderby = orderbyRaw && validOrderby.includes(orderbyRaw)
      ? (orderbyRaw as WooProductQueryParams["orderby"])
      : undefined;

    const order = orderRaw === "asc" || orderRaw === "desc" ? orderRaw : undefined;

    const queryParams: WooProductQueryParams = {
      page,
      per_page,
      search,
      category,
      brand,
      orderby,
      order,
    };

    const result = await getWooProducts(queryParams);

    if (result.isMockData) {
      return NextResponse.json(
        {
          success: false,
          message: "WooCommerce API is not configured or server credentials are invalid. Please set WOOCOMMERCE_URL, WOOCOMMERCE_CONSUMER_KEY, and WOOCOMMERCE_CONSUMER_SECRET in .env.local.",
          products: [],
          total: 0,
          totalPages: 0,
          isConfigured: false,
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        products: result.products,
        total: result.total,
        totalPages: result.totalPages,
        page,
        per_page,
        isConfigured: true,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
        },
      }
    );
  } catch (error) {
    console.error("[API /api/products] Internal Error:", error instanceof Error ? error.message : error);

    return NextResponse.json(
      {
        success: false,
        message: "An internal server error occurred while retrieving products.",
        products: [],
        total: 0,
        totalPages: 0,
      },
      { status: 500 }
    );
  }
}
