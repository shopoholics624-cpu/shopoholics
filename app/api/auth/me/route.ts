import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedCustomerSession } from "@/lib/auth";

function getWooCredentials() {
  const url = process.env.WOOCOMMERCE_URL;
  const key = process.env.WOOCOMMERCE_CONSUMER_KEY;
  const secret = process.env.WOOCOMMERCE_CONSUMER_SECRET;

  if (!url || !key || !secret) return null;
  return {
    baseUrl: url.replace(/\/+$/, ""),
    authHeader: `Basic ${Buffer.from(`${key}:${secret}`).toString("base64")}`,
  };
}

/**
 * GET /api/auth/me - Fast identity endpoint using server-side decrypted HttpOnly cookie session.
 * Does NOT call WooCommerce on every page load unless ?full=true is explicitly specified.
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getAuthenticatedCustomerSession();

    if (!session || !session.customerId) {
      return NextResponse.json(
        { success: true, authenticated: false, customer: null },
        { status: 200 }
      );
    }

    const { searchParams } = new URL(request.url);
    const full = searchParams.get("full") === "true";

    // Fast Identity Response from Decrypted Session Token (<1ms)
    if (!full) {
      return NextResponse.json({
        success: true,
        authenticated: true,
        customer: {
          id: session.customerId,
          email: session.email,
          firstName: session.firstName || "Customer",
          lastName: session.lastName || "",
          displayName: session.displayName || `${session.firstName || ""} ${session.lastName || ""}`.trim() || session.firstName || "Customer",
        },
      });
    }

    // Optional Full Profile Fetch from WooCommerce for Account Details Page (?full=true)
    const credentials = getWooCredentials();
    if (!credentials) {
      return NextResponse.json({
        success: true,
        authenticated: true,
        customer: {
          id: session.customerId,
          email: session.email,
          firstName: session.firstName,
          lastName: session.lastName,
          displayName: session.displayName || session.firstName,
        },
      });
    }

    const res = await fetch(
      `${credentials.baseUrl}/wp-json/wc/v3/customers/${session.customerId}`,
      {
        headers: { Authorization: credentials.authHeader },
        cache: "no-store",
      }
    );

    if (!res.ok) {
      return NextResponse.json({
        success: true,
        authenticated: true,
        customer: {
          id: session.customerId,
          email: session.email,
          firstName: session.firstName,
          lastName: session.lastName,
          displayName: session.displayName || session.firstName,
        },
      });
    }

    const customer = await res.json();
    return NextResponse.json({
      success: true,
      authenticated: true,
      customer: {
        id: customer.id,
        email: customer.email,
        firstName: customer.first_name || session.firstName,
        lastName: customer.last_name || session.lastName,
        displayName: `${customer.first_name || ""} ${customer.last_name || ""}`.trim() || customer.username,
        phone: customer.billing?.phone || "",
        billing: customer.billing || {},
        shipping: customer.shipping || {},
        avatarUrl: customer.avatar_url || "",
      },
    });
  } catch (error) {
    console.error("[Me API Error]:", error);
    return NextResponse.json(
      { success: false, authenticated: false, customer: null },
      { status: 500 }
    );
  }
}
