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

export interface ExtractedCustomerDetails {
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
}

function parseCustomerRecord(c: any): ExtractedCustomerDetails {
  const billing = c.billing || {};
  const shipping = c.shipping || {};

  const firstName =
    c.first_name || billing.first_name || shipping.first_name || "";
  const lastName =
    c.last_name || billing.last_name || shipping.last_name || "";
  const email = c.email || billing.email || "";
  const phone = billing.phone || c.phone || "";
  const company = billing.company || shipping.company || "";
  const address1 =
    billing.address_1 || shipping.address_1 || "";
  const address2 =
    billing.address_2 || shipping.address_2 || "";
  const city = billing.city || shipping.city || "";
  const state = billing.state || shipping.state || "";
  const postcode = billing.postcode || shipping.postcode || "";
  const country = billing.country || shipping.country || "India";

  return {
    firstName,
    lastName,
    fullName: `${firstName} ${lastName}`.trim() || c.username || "",
    email,
    phone,
    company,
    address1,
    address2,
    city,
    state,
    postcode,
    country,
  };
}

function parseOrderRecord(order: any): ExtractedCustomerDetails {
  const billing = order.billing || {};
  const shipping = order.shipping || {};

  const firstName =
    billing.first_name || shipping.first_name || "";
  const lastName =
    billing.last_name || shipping.last_name || "";
  const email = billing.email || "";
  const phone = billing.phone || "";
  const company = billing.company || shipping.company || "";
  const address1 =
    shipping.address_1 || billing.address_1 || "";
  const address2 =
    shipping.address_2 || billing.address_2 || "";
  const city = shipping.city || billing.city || "";
  const state = shipping.state || billing.state || "";
  const postcode = shipping.postcode || billing.postcode || "";
  const country = shipping.country || billing.country || "India";

  return {
    firstName,
    lastName,
    fullName: `${firstName} ${lastName}`.trim() || "",
    email,
    phone,
    company,
    address1,
    address2,
    city,
    state,
    postcode,
    country,
  };
}

/**
 * GET /api/customer/lookup - Fetch customer details from database/WooCommerce for pre-filling forms
 * Supports:
 * 1. Logged in customer session: GET /api/customer/lookup
 * 2. Search query by phone/email/name: GET /api/customer/lookup?query=9876543210
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query")?.trim() || "";

    const credentials = getWooCredentials();
    const session = await getAuthenticatedCustomerSession();

    // 1. If user is logged in and no query or query matches their session: fetch their full customer record
    if (session && session.customerId && (!query || query.toLowerCase() === session.email.toLowerCase())) {
      if (credentials) {
        const res = await fetch(
          `${credentials.baseUrl}/wp-json/wc/v3/customers/${session.customerId}`,
          {
            headers: { Authorization: credentials.authHeader },
            cache: "no-store",
          }
        );

        if (res.ok) {
          const customerData = await res.json();
          const parsed = parseCustomerRecord(customerData);
          return NextResponse.json({
            success: true,
            source: "session_profile",
            customer: parsed,
          });
        }
      }

      // Fallback from session payload
      return NextResponse.json({
        success: true,
        source: "session_fallback",
        customer: {
          firstName: session.firstName || "",
          lastName: session.lastName || "",
          fullName: `${session.firstName || ""} ${session.lastName || ""}`.trim(),
          email: session.email,
          phone: "",
          company: "",
          address1: "",
          address2: "",
          city: "",
          state: "",
          postcode: "",
          country: "India",
        },
      });
    }

    // 2. Query lookup by Email or Mobile or Name in Admin WooCommerce Database
    if (query && credentials) {
      const cleanPhone = query.replace(/\D/g, "");

      // A. Try email lookup in WooCommerce Customers
      if (query.includes("@")) {
        const custRes = await fetch(
          `${credentials.baseUrl}/wp-json/wc/v3/customers?email=${encodeURIComponent(query)}`,
          {
            headers: { Authorization: credentials.authHeader },
            cache: "no-store",
          }
        );

        if (custRes.ok) {
          const customers = await custRes.json();
          if (Array.isArray(customers) && customers.length > 0) {
            const parsed = parseCustomerRecord(customers[0]);
            return NextResponse.json({
              success: true,
              source: "customer_email_match",
              customer: parsed,
            });
          }
        }
      }

      // B. Try search query in WooCommerce Customers
      const searchRes = await fetch(
        `${credentials.baseUrl}/wp-json/wc/v3/customers?search=${encodeURIComponent(query)}`,
        {
          headers: { Authorization: credentials.authHeader },
          cache: "no-store",
        }
      );

      if (searchRes.ok) {
        const matches = await searchRes.json();
        if (Array.isArray(matches) && matches.length > 0) {
          const parsed = parseCustomerRecord(matches[0]);
          return NextResponse.json({
            success: true,
            source: "customer_search_match",
            customer: parsed,
          });
        }
      }

      // C. Try searching in WooCommerce Orders (to find previous address / phone from past orders)
      const orderSearchRes = await fetch(
        `${credentials.baseUrl}/wp-json/wc/v3/orders?search=${encodeURIComponent(cleanPhone || query)}&per_page=1`,
        {
          headers: { Authorization: credentials.authHeader },
          cache: "no-store",
        }
      );

      if (orderSearchRes.ok) {
        const orders = await orderSearchRes.json();
        if (Array.isArray(orders) && orders.length > 0) {
          const parsed = parseOrderRecord(orders[0]);
          return NextResponse.json({
            success: true,
            source: "order_history_match",
            customer: parsed,
          });
        }
      }
    }

    return NextResponse.json(
      {
        success: false,
        message: "No customer details found for this input. Please fill in the details manually.",
      },
      { status: 404 }
    );
  } catch (error: any) {
    console.error("[API /api/customer/lookup GET Error]:", error);
    return NextResponse.json(
      { success: false, message: "An error occurred while looking up customer details." },
      { status: 500 }
    );
  }
}
