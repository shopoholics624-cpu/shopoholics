export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextRequest, NextResponse } from "next/server";
import { getWooProducts } from "@/lib/woocommerce";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const currentId = searchParams.get("productId") || "";
    const category = searchParams.get("category") || "";

    if (!category && !currentId) {
      return NextResponse.json({ success: true, products: [] });
    }

    const { products } = await getWooProducts({
      category: category || undefined,
      per_page: 20,
    });

    // Exclude current product and filter in-stock items
    const filtered = (products || []).filter(
      (p) =>
        String(p.id) !== String(currentId) &&
        p.slug.toLowerCase() !== String(currentId).toLowerCase() &&
        p.inStock !== false &&
        p.stockStatus !== "outofstock"
    );

    // Deduplicate by ID
    const uniqueMap = new Map<string, typeof products[0]>();
    filtered.forEach((p) => {
      if (!uniqueMap.has(String(p.id))) {
        uniqueMap.set(String(p.id), p);
      }
    });

    const uniqueProducts = Array.from(uniqueMap.values());

    // Randomize / shuffle selection up to 4 products
    const shuffled = [...uniqueProducts].sort(() => 0.5 - Math.random()).slice(0, 4);

    return NextResponse.json({ success: true, products: shuffled });
  } catch (err) {
    console.error("[API /api/products/recommendations GET Error]:", err);
    return NextResponse.json({ success: true, products: [] });
  }
}
