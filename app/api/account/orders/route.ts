import { NextResponse } from "next/server";
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

export async function GET() {
  try {
    const session = await getAuthenticatedCustomerSession();
    if (!session || !session.customerId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized customer session." },
        { status: 401 }
      );
    }

    const credentials = getWooCredentials();
    if (!credentials) {
      return NextResponse.json(
        { success: true, orders: [] },
        { status: 200 }
      );
    }

    // CRITICAL SECURITY: Request orders from WooCommerce belonging ONLY to authenticated customerId
    const res = await fetch(
      `${credentials.baseUrl}/wp-json/wc/v3/orders?customer=${session.customerId}&per_page=50`,
      {
        headers: { Authorization: credentials.authHeader },
        cache: "no-store",
      }
    );

    if (!res.ok) {
      return NextResponse.json(
        { success: false, message: "Failed to fetch customer orders from WooCommerce." },
        { status: res.status }
      );
    }

    const orders = await res.json();
    if (!Array.isArray(orders)) {
      return NextResponse.json({ success: true, orders: [] });
    }

    // Format orders for frontend consumption
    const formattedOrders = orders.map((o: any) => ({
      id: String(o.id),
      number: o.number || String(o.id),
      status: o.status || "pending",
      dateCreated: o.date_created || new Date().toISOString(),
      total: parseFloat(o.total || "0"),
      currency: o.currency || "INR",
      paymentMethodTitle: o.payment_method_title || "Online Payment",
      itemCount: Array.isArray(o.line_items)
        ? o.line_items.reduce((acc: number, item: any) => acc + (item.quantity || 1), 0)
        : 0,
      lineItems: Array.isArray(o.line_items)
        ? o.line_items.map((item: any) => ({
            id: item.id,
            name: item.name,
            productId: item.product_id,
            variationId: item.variation_id,
            quantity: item.quantity,
            subtotal: parseFloat(item.subtotal || "0"),
            total: parseFloat(item.total || "0"),
            image: item.image?.src || item.product_data?.images?.[0]?.src || "",
          }))
        : [],
    }));

    return NextResponse.json({
      success: true,
      orders: formattedOrders,
    });
  } catch (error) {
    console.error("[Account Orders API Error]:", error);
    return NextResponse.json(
      { success: false, message: "An error occurred while retrieving order history." },
      { status: 500 }
    );
  }
}
