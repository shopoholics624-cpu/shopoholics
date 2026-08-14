import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyRazorpaySignature } from "@/lib/razorpay";

const CART_COOKIE_NAME = "shopoholics_cart_session";

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
 * POST /api/payment/razorpay/verify - Verify Razorpay payment signature server-side
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { wooOrderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = body;

    if (!wooOrderId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return NextResponse.json(
        { success: false, message: "Missing required Razorpay verification payload parameters." },
        { status: 400 }
      );
    }

    // 1. HMAC SHA256 Signature Verification
    const isSignatureValid = verifyRazorpaySignature({
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    });

    if (!isSignatureValid) {
      return NextResponse.json(
        {
          success: false,
          message: "Security Alert: Razorpay payment signature verification failed. Order status has not been altered.",
        },
        { status: 400 }
      );
    }

    const wooCredentials = getWooCommerceCredentials();
    let updatedWooStatus = "processing";

    if (wooCredentials && !String(wooOrderId).startsWith("wc_ord_")) {
      const cleanId = String(wooOrderId).replace(/\D/g, "");
      if (cleanId) {
        // 2. Fetch WooCommerce order to verify it hasn't already been processed
        const getRes = await fetch(`${wooCredentials.baseUrl}/wp-json/wc/v3/orders/${cleanId}`, {
          headers: { Authorization: wooCredentials.authHeader },
          cache: "no-store",
        });

        if (getRes.ok) {
          const wooOrder = await getRes.json();
          if (wooOrder.status === "processing" || wooOrder.status === "completed") {
            return NextResponse.json({
              success: true,
              wooOrderId,
              status: wooOrder.status,
              message: "Order already verified and marked as paid in WooCommerce.",
            });
          }
        }

        // 3. Update WooCommerce Order Status to Processing & Set Paid
        const updateRes = await fetch(`${wooCredentials.baseUrl}/wp-json/wc/v3/orders/${cleanId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: wooCredentials.authHeader,
          },
          body: JSON.stringify({
            status: "processing",
            set_paid: true,
            transaction_id: razorpayPaymentId,
          }),
          cache: "no-store",
        });

        if (updateRes.ok) {
          const updatedOrder = await updateRes.json();
          updatedWooStatus = updatedOrder.status || "processing";
        }

        // 4. Append Order Note in WooCommerce
        await fetch(`${wooCredentials.baseUrl}/wp-json/wc/v3/orders/${cleanId}/notes`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: wooCredentials.authHeader,
          },
          body: JSON.stringify({
            note: `Razorpay Payment Verified: Payment ID ${razorpayPaymentId}, Razorpay Order ID ${razorpayOrderId}`,
            customer_note: false,
          }),
          cache: "no-store",
        });
      }
    }

    // 5. Clear server-side cart session ONLY after signature verification succeeds
    try {
      await fetch(new URL("/api/cart?clear=true", request.url).toString(), {
        method: "DELETE",
        headers: { cookie: request.headers.get("cookie") || "" },
      });
    } catch (err) {
      console.warn("[Razorpay Verify API] Non-blocking cart clear warning:", err);
    }

    return NextResponse.json({
      success: true,
      wooOrderId,
      razorpayPaymentId,
      status: updatedWooStatus,
      message: "Razorpay payment verified and WooCommerce order updated to processing.",
    });
  } catch (error: any) {
    console.error("[API /api/payment/razorpay/verify POST Error]:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "An unexpected error occurred during Razorpay signature verification." },
      { status: 500 }
    );
  }
}
