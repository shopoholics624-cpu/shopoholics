import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getWooProductById } from "@/lib/woocommerce";
import { getAuthenticatedCustomerSession } from "@/lib/auth";
import {
  readWishlistFromFile,
  writeWishlistToFile,
  deleteWishlistFile,
} from "@/lib/wishlist-store";
import { Product } from "@/types/product";

const WISHLIST_SESSION_COOKIE_NAME = "shopoholics_wishlist_session";

interface ResolvedWishlistContext {
  wishlistKey: string;
  customerId: number | null;
  guestSessionId: string;
  isNewGuestSession: boolean;
}

/**
 * Resolves the authenticated customer wishlist key or guest session wishlist key.
 * 
 * Authenticated Customer (e.g. Customer ID #3):
 * - Wishlist Key: "cust_3"
 * - Stored in Firestore doc: "wishlists/cust_3"
 * 
 * Guest Customer:
 * - Session ID: "wishlist_sess_..."
 * - Wishlist Key: "guest_wishlist_sess_..."
 * - Stored in Firestore doc: "wishlists/guest_wishlist_sess_..."
 */
async function resolveWishlistContext(): Promise<ResolvedWishlistContext> {
  const cookieStore = await cookies();
  const customerSession = await getAuthenticatedCustomerSession();

  if (customerSession && customerSession.customerId) {
    const custId = customerSession.customerId;
    return {
      wishlistKey: `cust_${custId}`,
      customerId: custId,
      guestSessionId: "",
      isNewGuestSession: false,
    };
  }

  // Guest Wishlist Session
  const existingGuestSession = cookieStore.get(WISHLIST_SESSION_COOKIE_NAME)?.value;
  let guestSessionId = existingGuestSession || "";
  let isNewGuestSession = false;

  if (!guestSessionId) {
    guestSessionId = `wishlist_sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    isNewGuestSession = true;
  }

  return {
    wishlistKey: `guest_${guestSessionId}`,
    customerId: null,
    guestSessionId,
    isNewGuestSession,
  };
}

/**
 * Fetches current authoritative WooCommerce product objects for a list of product IDs.
 * Out-of-stock products remain in the wishlist with inStock: false.
 * Deleted products in WooCommerce are automatically excluded.
 */
async function fetchAuthoritativeWishlistProducts(
  ids: string[]
): Promise<{ products: Product[]; validIds: string[] }> {
  const uniqueIds = Array.from(new Set(ids.map((id) => String(id)).filter(Boolean)));
  if (uniqueIds.length === 0) return { products: [], validIds: [] };

  const results = await Promise.all(
    uniqueIds.map(async (id) => {
      try {
        const prod = await getWooProductById(id);
        return prod;
      } catch {
        return null;
      }
    })
  );

  const validProducts = results.filter((p): p is Product => p !== null);
  const validIds = validProducts.map((p) => String(p.id));

  return { products: validProducts, validIds };
}

/**
 * GET /api/wishlist - Fetch customer-specific persistent wishlist items and authoritative WooCommerce products
 */
export async function GET() {
  try {
    const context = await resolveWishlistContext();
    const cookieStore = await cookies();

    // Read persistent product IDs directly from disk for the resolved context
    const storedIds = await readWishlistFromFile(context.wishlistKey);
    const { products, validIds } = await fetchAuthoritativeWishlistProducts(storedIds);

    // If any product was deleted from WooCommerce, sync valid IDs back to disk file
    if (validIds.length !== storedIds.length) {
      await writeWishlistToFile(context.wishlistKey, validIds);
    }

    const response = NextResponse.json({
      success: true,
      wishlistKey: context.wishlistKey,
      customerId: context.customerId,
      wishlistIds: validIds,
      items: products,
    });

    if (context.isNewGuestSession && context.guestSessionId) {
      cookieStore.set(WISHLIST_SESSION_COOKIE_NAME, context.guestSessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });
    }

    return response;
  } catch (error) {
    console.error("[API /api/wishlist GET Error]:", error);
    return NextResponse.json(
      { success: false, message: "Unable to load wishlist. Please try again.", wishlistIds: [], items: [] },
      { status: 500 }
    );
  }
}

/**
 * POST /api/wishlist - Add, remove, toggle, clear or merge wishlist items for the authenticated customer
 */
export async function POST(request: NextRequest) {
  try {
    const context = await resolveWishlistContext();
    const body = await request.json();
    const { action = "toggle", productId, guestIds } = body;

    if (!context.customerId && action !== "merge") {
      return NextResponse.json(
        { success: false, requireAuth: true, message: "Authentication required to modify your wishlist." },
        { status: 401 }
      );
    }

    let currentIds = await readWishlistFromFile(context.wishlistKey);

    if (action === "merge" && Array.isArray(guestIds)) {
      const merged = Array.from(new Set([...currentIds, ...guestIds.map((id) => String(id))]));
      currentIds = merged;
    } else if (productId) {
      const pId = String(productId);
      if (action === "add") {
        if (!currentIds.includes(pId)) currentIds.push(pId);
      } else if (action === "remove") {
        currentIds = currentIds.filter((id) => id !== pId);
      } else if (action === "toggle") {
        if (currentIds.includes(pId)) {
          currentIds = currentIds.filter((id) => id !== pId);
        } else {
          currentIds.push(pId);
        }
      }
    } else if (action === "clear") {
      currentIds = [];
    }

    await writeWishlistToFile(context.wishlistKey, currentIds);
    const { products, validIds } = await fetchAuthoritativeWishlistProducts(currentIds);

    if (validIds.length !== currentIds.length) {
      await writeWishlistToFile(context.wishlistKey, validIds);
    }

    return NextResponse.json({
      success: true,
      wishlistKey: context.wishlistKey,
      customerId: context.customerId,
      wishlistIds: validIds,
      items: products,
    });
  } catch (error) {
    console.error("[API /api/wishlist POST Error]:", error);
    return NextResponse.json(
      { success: false, message: "Unable to update wishlist. Please try again." },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/wishlist - Clear customer wishlist
 */
export async function DELETE() {
  try {
    const context = await resolveWishlistContext();
    await deleteWishlistFile(context.wishlistKey);

    return NextResponse.json({
      success: true,
      wishlistKey: context.wishlistKey,
      customerId: context.customerId,
      wishlistIds: [],
      items: [],
    });
  } catch (error) {
    console.error("[API /api/wishlist DELETE Error]:", error);
    return NextResponse.json(
      { success: false, message: "Unable to clear wishlist." },
      { status: 500 }
    );
  }
}
