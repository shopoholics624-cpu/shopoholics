import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAuthenticatedCustomerSession } from "@/lib/auth";
import { readRecentSearches, addRecentSearch, clearRecentSearches, removeRecentSearch } from "@/lib/searches-store";
import { getWooProducts, getWooCategories } from "@/lib/woocommerce";

const SEARCH_SESSION_COOKIE = "shopoholics_search_session";

async function resolveSearchKey(): Promise<{ key: string; isNewGuest: boolean; guestSessionId: string }> {
  const cookieStore = await cookies();
  const customerSession = await getAuthenticatedCustomerSession();

  if (customerSession && customerSession.customerId) {
    return {
      key: `cust_${customerSession.customerId}`,
      isNewGuest: false,
      guestSessionId: "",
    };
  }

  const existingGuest = cookieStore.get(SEARCH_SESSION_COOKIE)?.value;
  let guestSessionId = existingGuest || "";
  let isNewGuest = false;

  if (!guestSessionId) {
    guestSessionId = `search_sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    isNewGuest = true;
  }

  return {
    key: `guest_${guestSessionId}`,
    isNewGuest,
    guestSessionId,
  };
}

/**
 * Generates dynamic trending keywords from live catalog categories, brands and top products.
 */
async function getDynamicTrendingKeywords(): Promise<string[]> {
  try {
    const [products, categories] = await Promise.all([
      getWooProducts({ per_page: 20 }),
      getWooCategories(),
    ]);

    const candidates = new Set<string>();

    // 1. Add categories with available products
    if (Array.isArray(categories)) {
      categories
        .filter((c) => (c.count || 0) > 0 && c.name && c.name.toLowerCase() !== "uncategorized")
        .slice(0, 4)
        .forEach((c) => candidates.add(c.name.trim()));
    }

    // 2. Add prominent product titles and brands
    if (Array.isArray(products)) {
      products.slice(0, 8).forEach((p) => {
        if (p.brand && p.brand.trim()) {
          candidates.add(p.brand.trim());
        }
        if (p.title && p.title.trim().length <= 30) {
          candidates.add(p.title.trim());
        }
      });
    }

    const list = Array.from(candidates).filter((t) => t.length > 2 && t.length < 35);
    return list.slice(0, 8);
  } catch (err) {
    console.warn("[SearchesAPI] Trending keywords fallback error:", err);
    return [];
  }
}

/**
 * GET /api/account/searches
 * Returns recent searches for the customer/guest and live trending catalog keywords.
 */
export async function GET() {
  try {
    const { key, isNewGuest, guestSessionId } = await resolveSearchKey();
    const [searches, trending] = await Promise.all([
      readRecentSearches(key),
      getDynamicTrendingKeywords(),
    ]);

    const response = NextResponse.json({
      success: true,
      searches,
      trending,
    });

    if (isNewGuest && guestSessionId) {
      response.cookies.set(SEARCH_SESSION_COOKIE, guestSessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: "/",
      });
    }

    return response;
  } catch (err: any) {
    console.error("[SearchesAPI/GET] Error:", err.message);
    return NextResponse.json({ success: false, searches: [], trending: [] }, { status: 500 });
  }
}

/**
 * POST /api/account/searches
 * Saves a new search term for the customer/guest into Firestore.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const term = typeof body.term === "string" ? body.term : "";
    if (!term.trim()) {
      return NextResponse.json({ success: false, message: "Search term is required" }, { status: 400 });
    }

    const { key, isNewGuest, guestSessionId } = await resolveSearchKey();
    const searches = await addRecentSearch(key, term);

    const response = NextResponse.json({
      success: true,
      searches,
    });

    if (isNewGuest && guestSessionId) {
      response.cookies.set(SEARCH_SESSION_COOKIE, guestSessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30,
        path: "/",
      });
    }

    return response;
  } catch (err: any) {
    console.error("[SearchesAPI/POST] Error:", err.message);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

/**
 * DELETE /api/account/searches
 * Clears all recent searches or deletes a specific term if ?term=... is provided.
 */
export async function DELETE(req: NextRequest) {
  try {
    const { key } = await resolveSearchKey();
    const { searchParams } = new URL(req.url);
    const term = searchParams.get("term")?.trim();

    if (term) {
      const updated = await removeRecentSearch(key, term);
      return NextResponse.json({ success: true, searches: updated });
    }

    await clearRecentSearches(key);
    return NextResponse.json({ success: true, searches: [] });
  } catch (err: any) {
    console.error("[SearchesAPI/DELETE] Error:", err.message);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
