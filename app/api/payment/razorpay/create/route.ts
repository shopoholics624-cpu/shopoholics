import { NextRequest, NextResponse } from "next/server";
import { getRazorpayConfig, createRazorpayOrder } from "@/lib/razorpay";

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
 * POST /api/payment/razorpay/create - Create a Razorpay Payment Order server-side
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { wooOrderId } = body;

    if (!wooOrderId) {
      return NextResponse.json(
        { success: false, message: "WooCommerce Order ID is required." },
        { status: 400 }
      );
    }

    const config = getRazorpayConfig();

    if (!config.isConfigured) {
      return NextResponse.json(
        {
          success: false,
          mode: "development",
          message:
            "Razorpay API credentials are not yet configured on the server. Please use Development Test Mode or configure RAZORPAY_KEY_ID & RAZORPAY_KEY_SECRET.",
        },
        { status: 400 }
      );
    }

    const wooCredentials = getWooCommerceCredentials();
    let orderTotal = 0;
    let orderStatus = "pending";

    if (wooCredentials && !String(wooOrderId).startsWith("wc_ord_")) {
      const cleanId = String(wooOrderId).replace(/\D/g, "");
      const res = await fetch(`${wooCredentials.baseUrl}/wp-json/wc/v3/orders/${cleanId}`, {
        headers: { Authorization: wooCredentials.authHeader },
        cache: "no-store",
      });

      if (!res.ok) {
        return NextResponse.json(
          { success: false, message: "Specified WooCommerce order could not be found." },
          { status: 404 }
        );
      }

      const wooOrder = await res.json();
      orderTotal = parseFloat(wooOrder.total || "0");
      orderStatus = wooOrder.status || "pending";

      if (orderStatus === "processing" || orderStatus === "completed") {
        return NextResponse.json(
          { success: false, message: "This WooCommerce order has already been paid and processed." },
          { status: 400 }
        );
      }
    } else {
      orderTotal = 149900; // fallback mock total
    }

    const razorpayOrder = await createRazorpayOrder({
      amountInRupees: orderTotal,
      currency: "INR",
      receiptId: `rcpt_${wooOrderId}`,
      notes: {
        woo_order_id: String(wooOrderId),
      },
    });

    return NextResponse.json({
      success: true,
      mode: "razorpay",
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: config.keyId,
      wooOrderId,
    });
  } catch (error: any) {
    console.error("[API /api/payment/razorpay/create POST Error]:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to create Razorpay payment order." },
      { status: 500 }
    );
  }
}
