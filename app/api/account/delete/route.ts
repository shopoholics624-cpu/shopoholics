import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME, getAuthenticatedCustomerSession } from "@/lib/auth";
import { getWooCustomerById, deleteWooCustomer } from "@/lib/woocommerce";
import { deleteCartFile } from "@/lib/cart-store";

// Simple in-memory rate limiting map for deletion requests (max 3 deletion attempts per IP per 15 mins)
const deleteRateLimitMap = new Map<string, { count: number; expiresAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = deleteRateLimitMap.get(ip);
  if (!record) return false;
  if (now > record.expiresAt) {
    deleteRateLimitMap.delete(ip);
    return false;
  }
  return record.count >= 3;
}

function recordAttempt(ip: string) {
  const now = Date.now();
  const record = deleteRateLimitMap.get(ip);
  if (!record || now > record.expiresAt) {
    deleteRateLimitMap.set(ip, { count: 1, expiresAt: now + 15 * 60 * 1000 });
  } else {
    record.count += 1;
  }
}

/**
 * POST /api/account/delete - Permanently delete customer account and associated personal data
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Rate Limiting Check
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "0.0.0.0";
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { success: false, message: "Too many account deletion attempts. Please try again later." },
        { status: 429 }
      );
    }
    recordAttempt(ip);

    // 2. Verify Authenticated Customer Session
    const session = await getAuthenticatedCustomerSession();
    if (!session || !session.customerId) {
      return NextResponse.json(
        { success: false, message: "Authentication required to perform account deletion." },
        { status: 401 }
      );
    }

    // STRICT CUSTOMER IDENTITY SAFETY: Use session.customerId exclusively.
    // NEVER accept or trust customerId from request body or URL parameters.
    const authenticatedCustomerId = Number(session.customerId);

    // 3. Verify Customer Existence & Role in WooCommerce
    const wooCustomer = await getWooCustomerById(authenticatedCustomerId);
    if (!wooCustomer) {
      // If customer is already gone from WooCommerce, perform clean up & logout
      const cookieStore = await cookies();
      cookieStore.set(AUTH_COOKIE_NAME, "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 0,
        path: "/",
      });

      await deleteCartFile(`cust_${authenticatedCustomerId}`);

      return NextResponse.json({
        success: true,
        message: "Your customer account session has been cleared.",
      });
    }

    // 4. Role Protection: Do NOT delete privileged WordPress accounts (admin, editor, shop_manager, etc.)
    const userRole = (wooCustomer.role || "").toLowerCase();
    const privilegedRoles = ["administrator", "editor", "author", "shop_manager", "contributor"];
    if (privilegedRoles.includes(userRole)) {
      return NextResponse.json(
        {
          success: false,
          message: "Privileged administrator/manager accounts cannot be deleted via customer self-service.",
        },
        { status: 403 }
      );
    }

    // 5. Delete WooCommerce Customer Record via WooCommerce REST API
    const deletionResult = await deleteWooCustomer(authenticatedCustomerId);
    if (!deletionResult.success) {
      console.error(
        `[Account Delete Error]: Failed to delete WooCommerce customer #${authenticatedCustomerId}:`,
        deletionResult.message
      );
      return NextResponse.json(
        {
          success: false,
          message: "We couldn't complete the account deletion. Please try again.",
        },
        { status: 500 }
      );
    }

    // 6. Delete Persistent Customer Cart File from Disk
    await deleteCartFile(`cust_${authenticatedCustomerId}`);

    // 7. Invalidate Authentication Session Cookies
    const cookieStore = await cookies();
    cookieStore.set(AUTH_COOKIE_NAME, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
      path: "/",
    });

    cookieStore.set(`shopoholics_cart_cust_${authenticatedCustomerId}`, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
      path: "/",
    });

    return NextResponse.json({
      success: true,
      message: "Your account and personal profile data have been permanently deleted.",
    });
  } catch (error) {
    console.error("[Account Delete Exception]:", error);
    return NextResponse.json(
      { success: false, message: "We couldn't complete the account deletion. Please try again." },
      { status: 500 }
    );
  }
}
