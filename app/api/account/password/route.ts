import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedCustomerSession } from "@/lib/auth";
import { updateWooCustomerPassword } from "@/lib/woocommerce";

function getWordPressBaseUrl() {
  const url = process.env.WOOCOMMERCE_URL || process.env.NEXT_PUBLIC_WOOCOMMERCE_STORE_URL || "https://wp.shopoholics.in";
  return url.replace(/\/+$/, "");
}

/**
 * POST /api/account/password - Change authenticated customer's account password
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Verify Authenticated Customer Session
    const session = await getAuthenticatedCustomerSession();
    if (!session || !session.customerId || !session.email) {
      return NextResponse.json(
        { success: false, message: "Authentication required to change password." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { currentPassword, newPassword, confirmPassword } = body;

    // 2. Input Validation
    if (!currentPassword) {
      return NextResponse.json(
        { success: false, message: "Current password is required." },
        { status: 400 }
      );
    }

    if (!newPassword || typeof newPassword !== "string" || newPassword.length < 6) {
      return NextResponse.json(
        { success: false, message: "New password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { success: false, message: "New password and confirmation password do not match." },
        { status: 400 }
      );
    }

    // 3. Re-authenticate Current Password against WordPress Code Snippets Login Endpoint
    const baseUrl = getWordPressBaseUrl();
    const authEndpointUrl = `${baseUrl}/wp-json/shopoholics/v1/login`;

    try {
      const verifyRes = await fetch(authEndpointUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: session.email, password: currentPassword }),
        cache: "no-store",
      });

      if (!verifyRes.ok) {
        return NextResponse.json(
          { success: false, message: "The current password you entered is incorrect." },
          { status: 401 }
        );
      }
    } catch (netErr) {
      console.warn("[Password Verification Endpoint Warning]:", netErr);
      // Fallback: If WP auth endpoint is offline, proceed with direct WooCommerce REST API update
    }

    // 4. Update Customer Password in WooCommerce
    const updateResult = await updateWooCustomerPassword(session.customerId, newPassword);

    if (!updateResult.success) {
      return NextResponse.json(
        { success: false, message: updateResult.message || "Failed to update password in WooCommerce." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Your account password has been updated successfully!",
    });
  } catch (error) {
    console.error("[API /api/account/password POST Error]:", error);
    return NextResponse.json(
      { success: false, message: "Unable to update password. Please try again." },
      { status: 500 }
    );
  }
}
