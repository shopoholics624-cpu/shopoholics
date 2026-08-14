import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME, encryptSessionPayload } from "@/lib/auth";
import { mergeGuestCartIntoCustomerCart } from "@/lib/cart-store";
import { mergeGuestWishlistIntoCustomer } from "@/lib/wishlist-store";

function getWordPressBaseUrl() {
  const url = process.env.WOOCOMMERCE_URL || process.env.NEXT_PUBLIC_WOOCOMMERCE_STORE_URL || "https://shopoholics.in";
  return url.replace(/\/+$/, "");
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, rememberMe } = body;

    // Input Validation
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Invalid email address or password." },
        { status: 400 }
      );
    }

    const baseUrl = getWordPressBaseUrl();
    const cleanEmail = email.trim().toLowerCase();

    // STRICT CUSTOM AUTHENTICATION: Call WordPress Code Snippets Endpoint EXCLUSIVELY
    const authEndpointUrl = `${baseUrl}/wp-json/shopoholics/v1/login`;
    let wpRes: Response;
    
    try {
      wpRes = await fetch(authEndpointUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail, password }),
        cache: "no-store",
      });
    } catch (netErr) {
      console.error("[Login API Network Error]:", netErr);
      return NextResponse.json(
        { success: false, message: "Unable to connect to the account service. Please try again." },
        { status: 503 }
      );
    }

    // Handle Rate Limiting (HTTP 429)
    if (wpRes.status === 429) {
      return NextResponse.json(
        { success: false, message: "Too many login attempts. Please try again later." },
        { status: 429 }
      );
    }

    // Handle Invalid Credentials (HTTP 401) or 404 (Endpoint not installed on WP)
    if (!wpRes.ok) {
      if (wpRes.status === 404) {
        return NextResponse.json(
          {
            success: false,
            message: "Unable to connect to the account service. Please try again.",
          },
          { status: 503 }
        );
      }
      return NextResponse.json(
        { success: false, message: "Invalid email address or password." },
        { status: 401 }
      );
    }

    const authData = await wpRes.json();

    if (!authData || !authData.success || !authData.customer_id) {
      return NextResponse.json(
        { success: false, message: "Invalid email address or password." },
        { status: 401 }
      );
    }

    // Authenticated Customer Identity from WordPress
    const customerId = Number(authData.customer_id);
    const customerEmail = authData.email || cleanEmail;
    const firstName = authData.first_name || "Valued";
    const lastName = authData.last_name || "Customer";

    const displayName = authData.display_name || `${firstName} ${lastName}`.trim() || firstName;

    // Create Secure HTTP-Only Cookie Session
    const sessionToken = encryptSessionPayload({
      customerId,
      email: customerEmail,
      firstName,
      lastName,
      displayName,
      createdAt: Date.now(),
      rememberMe: Boolean(rememberMe),
    });

    const maxAge = rememberMe ? 30 * 24 * 60 * 60 : 7 * 24 * 60 * 60; // 30 days vs 7 days

    const cookieStore = await cookies();
    cookieStore.set(AUTH_COOKIE_NAME, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge,
      path: "/",
    });

    // Merge Guest Cart into Persistent Customer Cart File Store
    try {
      const guestSessionId = cookieStore.get("shopoholics_cart_session")?.value;
      const guestCartKey = guestSessionId ? `guest_${guestSessionId}` : "";
      const customerCartKey = `cust_${customerId}`;

      if (guestCartKey) {
        await mergeGuestCartIntoCustomerCart(guestCartKey, customerCartKey);
      }
    } catch (mergeErr) {
      console.warn("[Login Merge Cart Exception]:", mergeErr);
    }

    // Merge Guest Wishlist into Persistent Customer Wishlist File Store
    try {
      const guestWishlistSessionId = cookieStore.get("shopoholics_wishlist_session")?.value;
      const guestWishlistKey = guestWishlistSessionId ? `guest_${guestWishlistSessionId}` : "";
      const customerWishlistKey = `cust_${customerId}`;

      if (guestWishlistKey) {
        await mergeGuestWishlistIntoCustomer(guestWishlistKey, customerWishlistKey);
      }
    } catch (mergeWishlistErr) {
      console.warn("[Login Merge Wishlist Exception]:", mergeWishlistErr);
    }

    return NextResponse.json({
      success: true,
      message: "Customer authenticated successfully.",
      customer: {
        id: customerId,
        email: customerEmail,
        firstName,
        lastName,
        displayName: authData.display_name || `${firstName} ${lastName}`.trim(),
      },
    });
  } catch (error) {
    console.error("[Login API Error]:", error);
    return NextResponse.json(
      { success: false, message: "Unable to connect to the account service. Please try again." },
      { status: 500 }
    );
  }
}
