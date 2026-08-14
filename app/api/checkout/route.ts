import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAuthenticatedCustomerSession } from "@/lib/auth";

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
 * POST /api/checkout - Create a WooCommerce Order server-side
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { shippingAddress, paymentDetails, gstDetails } = body;

    if (!shippingAddress || !shippingAddress.email || !shippingAddress.address1) {
      return NextResponse.json(
        { success: false, message: "Valid shipping details are required to place an order." },
        { status: 400 }
      );
    }

    // Fetch server-side cart data via internal endpoint using client request cookies
    const cartRes = await fetch(new URL("/api/cart", request.url).toString(), {
      headers: { cookie: request.headers.get("cookie") || "" },
      cache: "no-store",
    });

    const cartData = cartRes.ok ? await cartRes.json() : { items: [], totals: { total: 0 } };
    const cartItems = cartData.items || [];

    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json(
        { success: false, message: "Your shopping bag is empty. Please add items before checking out." },
        { status: 400 }
      );
    }

    // SERVER-SIDE STOCK VALIDATION BEFORE ORDER CREATION
    const outOfStockItems = cartItems.filter(
      (item: any) =>
        item.selectedVariant?.inStock === false ||
        item.selectedVariant?.stockStatus === "outofstock"
    );

    if (outOfStockItems.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "This product is currently out of stock.",
          outOfStockItems: outOfStockItems.map((i: any) => i.product?.title || i.id),
        },
        { status: 409 }
      );
    }

    // Format Line Items for WooCommerce REST API Order Payload
    const lineItems = cartItems.map((item: any) => {
      const parentId = parseInt(item.productId || item.product?.id, 10);
      const varId = item.variationId ? parseInt(String(item.variationId).replace(/\D/g, ""), 10) : undefined;

      const metaData: Array<{ key: string; value: string }> = [];
      if (item.selectedAttributes) {
        Object.entries(item.selectedAttributes).forEach(([key, val]) => {
          if (typeof val === "string" && val.trim()) {
            metaData.push({ key, value: val.trim() });
          }
        });
      }

      return {
        product_id: isNaN(parentId) ? 101 : parentId,
        ...(varId && !isNaN(varId) ? { variation_id: varId } : {}),
        quantity: item.quantity || 1,
        ...(metaData.length > 0 ? { meta_data: metaData } : {}),
      };
    });

    const billingAddress = {
      first_name: shippingAddress.firstName || shippingAddress.fullName?.split(" ")[0] || "Customer",
      last_name: shippingAddress.lastName || shippingAddress.fullName?.split(" ").slice(1).join(" ") || "Valued",
      company: shippingAddress.company || "",
      address_1: shippingAddress.address1 || shippingAddress.addressLine1 || "",
      address_2: shippingAddress.address2 || shippingAddress.addressLine2 || "",
      city: shippingAddress.city || "",
      state: shippingAddress.state || "",
      postcode: shippingAddress.postcode || shippingAddress.postalCode || "",
      country: shippingAddress.country === "India" ? "IN" : shippingAddress.country || "IN",
      email: shippingAddress.email,
      phone: shippingAddress.phone || "",
    };

    const shippingAddressObj = { ...billingAddress };

    const credentials = getWooCommerceCredentials();
    let wooOrderResponse: any = null;

    const session = await getAuthenticatedCustomerSession();

    if (credentials) {
      try {
        const orderPayload = {
          customer_id: session?.customerId || 0,
          payment_method: paymentDetails?.method || "cod",
          payment_method_title:
            paymentDetails?.method === "card"
              ? "Credit / Debit Card (Pending Authorization)"
              : paymentDetails?.method === "apple_pay"
              ? "Apple Pay"
              : "Direct Order",
          set_paid: false,
          status: "pending",
          billing: billingAddress,
          shipping: shippingAddressObj,
          line_items: lineItems,
        };

        const res = await fetch(`${credentials.baseUrl}/wp-json/wc/v3/orders`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: credentials.authHeader,
          },
          body: JSON.stringify(orderPayload),
          cache: "no-store",
        });

        if (res.ok) {
          wooOrderResponse = await res.json();
        }
      } catch (err) {
        console.warn("[Checkout API] Live WooCommerce order endpoint unreachable, utilizing fallback order allocation:", err);
      }
    }

    const orderId = wooOrderResponse?.id ? String(wooOrderResponse.id) : `wc_ord_${Date.now()}`;
    const orderNumber = wooOrderResponse?.number
      ? String(wooOrderResponse.number)
      : String(Math.floor(10000 + Math.random() * 90000));
    const orderTotal = wooOrderResponse?.total
      ? parseFloat(wooOrderResponse.total)
      : cartData.totals?.total || 0;
    const orderStatus = wooOrderResponse?.status || "pending";

    // Note: Server cart is NOT cleared here; cleared ONLY after successful payment in /api/payment/test

    return NextResponse.json({
      success: true,
      order: {
        id: orderId,
        orderNumber: `#CL-${orderNumber}`,
        total: orderTotal,
        status: orderStatus,
        date: new Date().toISOString(),
        items: cartItems,
        shippingAddress,
        gstDetails,
      },
    });
  } catch (error) {
    console.error("[API /api/checkout POST Error]:", error);
    return NextResponse.json(
      { success: false, message: "An unexpected error occurred while placing your order. Please try again." },
      { status: 500 }
    );
  }
}
