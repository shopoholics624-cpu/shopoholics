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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAuthenticatedCustomerSession();
    if (!session || !session.customerId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized customer session." },
        { status: 401 }
      );
    }

    const resolvedParams = await params;
    const orderId = resolvedParams.id;
    if (!orderId) {
      return NextResponse.json(
        { success: false, message: "Order ID is required." },
        { status: 400 }
      );
    }

    const credentials = getWooCredentials();
    if (!credentials) {
      return NextResponse.json(
        { success: false, message: "WooCommerce credentials not configured." },
        { status: 500 }
      );
    }

    // Fetch order from WooCommerce REST API
    const res = await fetch(`${credentials.baseUrl}/wp-json/wc/v3/orders/${orderId}`, {
      headers: { Authorization: credentials.authHeader },
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json(
        { success: false, message: "Order not found." },
        { status: 404 }
      );
    }

    const order = await res.json();

    // STRICT ORDER OWNERSHIP SECURITY CHECK
    // The authenticated customer ID MUST match the order's customer_id!
    if (Number(order.customer_id) !== Number(session.customerId)) {
      console.warn(
        `[Order Security Violation]: Customer #${session.customerId} attempted to access Order #${order.id} owned by Customer #${order.customer_id}`
      );
      return NextResponse.json(
        { success: false, message: "Forbidden: You do not have permission to view this order." },
        { status: 403 }
      );
    }

    // Format full order payload
    const formattedOrder = {
      id: String(order.id),
      number: order.number || String(order.id),
      status: order.status,
      currency: order.currency || "INR",
      dateCreated: order.date_created,
      dateModified: order.date_modified,
      discountTotal: parseFloat(order.discount_total || "0"),
      shippingTotal: parseFloat(order.shipping_total || "0"),
      totalTax: parseFloat(order.total_tax || "0"),
      subtotal: parseFloat(order.total || "0") - parseFloat(order.shipping_total || "0") - parseFloat(order.total_tax || "0"),
      total: parseFloat(order.total || "0"),
      paymentMethod: order.payment_method,
      paymentMethodTitle: order.payment_method_title,
      transactionId: order.transaction_id || "",
      billing: order.billing || {},
      shipping: order.shipping || {},
      lineItems: Array.isArray(order.line_items)
        ? order.line_items.map((item: any) => ({
            id: item.id,
            name: item.name,
            productId: item.product_id,
            variationId: item.variation_id,
            quantity: item.quantity,
            price: parseFloat(item.price || "0"),
            subtotal: parseFloat(item.subtotal || "0"),
            total: parseFloat(item.total || "0"),
            sku: item.sku || "",
            metaData: item.meta_data || [],
            image: item.image?.src || "",
          }))
        : [],
    };

    return NextResponse.json({
      success: true,
      order: formattedOrder,
    });
  } catch (error) {
    console.error("[Account Order Detail API Error]:", error);
    return NextResponse.json(
      { success: false, message: "An error occurred while retrieving order details." },
      { status: 500 }
    );
  }
}
