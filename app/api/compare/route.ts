import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getWooProductById } from "@/lib/woocommerce";
import { getAuthenticatedCustomerSession } from "@/lib/auth";
import {
  readCompareFromFile,
  writeCompareToFile,
  deleteCompareFile,
} from "@/lib/compare-store";
import { Product } from "@/types/product";

const COMPARE_SESSION_COOKIE_NAME = "shopoholics_compare_session";

interface ResolvedCompareContext {
  compareKey: string;
  customerId: number | null;
  guestSessionId: string;
  isNewGuestSession: boolean;
}

/**
 * Resolves the authenticated customer compare key or guest session compare key.
 * 
 * Logged-in Customer (e.g. Customer ID #3):
 * - Compare Key: "cust_3"
 * - Stored in Firestore doc: "compares/cust_3"
 * 
 * Guest User:
 * - Session ID: "compare_sess_..."
 * - Compare Key: "guest_compare_sess_..."
 * - Stored in Firestore doc: "compares/guest_compare_sess_..."
 */
async function resolveCompareContext(): Promise<ResolvedCompareContext> {
  const cookieStore = await cookies();
  const customerSession = await getAuthenticatedCustomerSession();

  if (customerSession && customerSession.customerId) {
    const custId = customerSession.customerId;
    return {
      compareKey: `cust_${custId}`,
      customerId: custId,
      guestSessionId: "",
      isNewGuestSession: false,
    };
  }

  // Guest Compare Session
  const existingGuestSession = cookieStore.get(COMPARE_SESSION_COOKIE_NAME)?.value;
  let guestSessionId = existingGuestSession || "";
  let isNewGuestSession = false;

  if (!guestSessionId) {
    guestSessionId = `compare_sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    isNewGuestSession = true;
  }

  return {
    compareKey: `guest_${guestSessionId}`,
    customerId: null,
    guestSessionId,
    isNewGuestSession,
  };
}

/**
 * Fetches current WooCommerce product objects for a list of compare product IDs.
 * Deleted products in WooCommerce are automatically excluded.
 */
async function fetchAuthoritativeCompareProducts(
  ids: string[]
): Promise<{ products: Product[]; validIds: string[] }> {
  const uniqueIds = Array.from(new Set(ids.map((id) => String(id)).filter(Boolean))).slice(0, 4);
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
 * GET /api/compare - Fetch customer-specific persistent compare items from Firestore & WooCommerce
 */
export async function GET() {
  try {
    const context = await resolveCompareContext();
    const cookieStore = await cookies();

    const storedIds = await readCompareFromFile(context.compareKey);
    const { products, validIds } = await fetchAuthoritativeCompareProducts(storedIds);

    if (validIds.length !== storedIds.length) {
      await writeCompareToFile(context.compareKey, validIds);
    }

    const response = NextResponse.json({
      success: true,
      compareKey: context.compareKey,
      customerId: context.customerId,
      compareIds: validIds,
      items: products,
    });

    if (context.isNewGuestSession && context.guestSessionId) {
      cookieStore.set(COMPARE_SESSION_COOKIE_NAME, context.guestSessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });
    }

    return response;
  } catch (error) {
    console.error("[API /api/compare GET Error]:", error);
    return NextResponse.json(
      { success: false, message: "Unable to load compare list. Please try again.", compareIds: [], items: [] },
      { status: 500 }
    );
  }
}

/**
 * POST /api/compare - Add, remove, toggle, clear or merge compare items in Firestore
 */
export async function POST(request: NextRequest) {
  try {
    const context = await resolveCompareContext();
    const body = await request.json();
    const { action = "toggle", productId, guestIds } = body;

    let currentIds = await readCompareFromFile(context.compareKey);
    let limitReached = false;

    if (action === "merge" && Array.isArray(guestIds)) {
      const merged = Array.from(new Set([...currentIds, ...guestIds.map((id) => String(id))]));
      if (merged.length > 4) {
        limitReached = true;
      }
      currentIds = merged.slice(0, 4);
    } else if (productId) {
      const pId = String(productId).trim();
      if (action === "add") {
        if (!currentIds.includes(pId)) {
          if (currentIds.length >= 4) {
            limitReached = true;
          } else {
            currentIds.push(pId);
          }
        }
      } else if (action === "remove") {
        currentIds = currentIds.filter((id) => id !== pId);
      } else if (action === "toggle") {
        if (currentIds.includes(pId)) {
          currentIds = currentIds.filter((id) => id !== pId);
        } else {
          if (currentIds.length >= 4) {
            limitReached = true;
          } else {
            currentIds.push(pId);
          }
        }
      }
    } else if (action === "clear") {
      currentIds = [];
    }

    await writeCompareToFile(context.compareKey, currentIds);
    const { products, validIds } = await fetchAuthoritativeCompareProducts(currentIds);

    if (validIds.length !== currentIds.length) {
      await writeCompareToFile(context.compareKey, validIds);
    }

    return NextResponse.json({
      success: true,
      compareKey: context.compareKey,
      customerId: context.customerId,
      compareIds: validIds,
      items: products,
      limitReached,
    });
  } catch (error) {
    console.error("[API /api/compare POST Error]:", error);
    return NextResponse.json(
      { success: false, message: "Unable to update compare list. Please try again." },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/compare - Clear compare list for resolved context
 */
export async function DELETE() {
  try {
    const context = await resolveCompareContext();
    await deleteCompareFile(context.compareKey);

    return NextResponse.json({
      success: true,
      compareKey: context.compareKey,
      customerId: context.customerId,
      compareIds: [],
      items: [],
    });
  } catch (error) {
    console.error("[API /api/compare DELETE Error]:", error);
    return NextResponse.json(
      { success: false, message: "Unable to clear compare list." },
      { status: 500 }
    );
  }
}
