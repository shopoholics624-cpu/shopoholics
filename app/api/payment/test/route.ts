import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const CART_COOKIE_NAME = "shopoholics_cart_session";

/**
 * Server-side helper to get WooCommerce Environment Variables safely.
 */
function getWooCommerceCredentials() {
  const url = process.env.WOOCOMMERCE_URL;
  const key = process.env.WOOCOMMERCE_CONSUMER_KEY;
  const secret = process.env.WOOCOMMERCE_CONSUMER_SECRET;

  if (
    !url ||
    !key ||
    !secret ||
    url === "https://example.com" ||
    key.includes("dummy") ||
    secret.includes("dummy")
  ) {
    return null;
  }

  return {
    baseUrl: url.replace(/\/+$/, ""),
    authHeader: `Basic ${Buffer.from(`${key}:${secret}`).toString("base64")}`,
  };
}

/**
 * POST /api/payment/test - Development Test Payment Handler
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, result } = body;

    if (!orderId) {
      return NextResponse.json(
        { success: false, message: "WooCommerce Order ID is required." },
        { status: 400 }
      );
    }

    if (!["success", "failed", "cancelled"].includes(result)) {
      return NextResponse.json(
        { success: false, message: "Invalid payment simulation result value." },
        { status: 400 }
      );
    }

    const credentials = getWooCommerceCredentials();
    let updatedWooStatus = result === "success" ? "processing" : result === "failed" ? "failed" : "cancelled";
    let apiSuccess = false;

    if (credentials && !orderId.startsWith("wc_ord_")) {
      try {
        const cleanId = String(orderId).replace(/\D/g, "");
        if (cleanId) {
          // 1. Update Order Status in WooCommerce
          const statusPayload = {
            status: updatedWooStatus,
            ...(result === "success" ? { set_paid: true } : {}),
          };

          const updateRes = await fetch(`${credentials.baseUrl}/wp-json/wc/v3/orders/${cleanId}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: credentials.authHeader,
            },
            body: JSON.stringify(statusPayload),
            cache: "no-store",
          });

          if (updateRes.ok) {
            const updatedOrder = await updateRes.json();
            updatedWooStatus = updatedOrder.status || updatedWooStatus;
            apiSuccess = true;
          }

          // 2. Append Development Order Note in WooCommerce
          const noteText =
            result === "success"
              ? "Development Test Payment Successful"
              : result === "failed"
              ? "Development Test Payment Failed"
              : "Development Test Payment Cancelled";

          await fetch(`${credentials.baseUrl}/wp-json/wc/v3/orders/${cleanId}/notes`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: credentials.authHeader,
            },
            body: JSON.stringify({
              note: noteText,
              customer_note: false,
            }),
            cache: "no-store",
          });
        }
      } catch (err) {
        console.warn("[Payment API /api/payment/test] WooCommerce API error, using fallback test order handler:", err);
      }
    }

    // On Successful Payment: Clear server cart session
    if (result === "success") {
      try {
        const cookieStore = await cookies();
        const sessionId = cookieStore.get(CART_COOKIE_NAME)?.value;
        await fetch(new URL("/api/cart?clear=true", request.url).toString(), {
          method: "DELETE",
          headers: { cookie: `${CART_COOKIE_NAME}=${sessionId || ""}` },
        });
      } catch (err) {
        console.warn("[Payment API] Non-blocking server cart clear warning:", err);
      }

      return NextResponse.json({
        success: true,
        orderId,
        status: updatedWooStatus,
        message: "Development Test Payment Successful. Order marked as processing.",
      });
    }

    // On Failed or Cancelled Payment: Keep cart intact
    return NextResponse.json({
      success: false,
      orderId,
      status: updatedWooStatus,
      message:
        result === "failed"
          ? "Development Test Payment Failed. Order marked as failed in WooCommerce. You can retry payment."
          : "Development Test Payment Cancelled. Order marked as cancelled in WooCommerce. You can retry payment.",
    });
  } catch (error) {
    console.error("[API /api/payment/test POST Error]:", error);
    return NextResponse.json(
      { success: false, message: "An unexpected error occurred during test payment processing." },
      { status: 500 }
    );
  }
}
