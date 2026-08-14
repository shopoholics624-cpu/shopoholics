import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME, getAuthenticatedCustomerSession, encryptSessionPayload } from "@/lib/auth";

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

export async function PUT(request: NextRequest) {
  try {
    // 1. Validate Authenticated Customer Session
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
        { success: false, message: "WooCommerce API credentials are not configured server-side." },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { firstName, lastName, email, phone, billing, shipping } = body;

    // 2. Fetch Existing Customer Record from WooCommerce to Merge Safely
    const currentCustRes = await fetch(
      `${credentials.baseUrl}/wp-json/wc/v3/customers/${session.customerId}`,
      {
        headers: { Authorization: credentials.authHeader },
        cache: "no-store",
      }
    );

    if (!currentCustRes.ok) {
      return NextResponse.json(
        { success: false, message: "Unable to load customer record from WooCommerce." },
        { status: currentCustRes.status }
      );
    }

    const currentCustomer = await currentCustRes.json();
    const currentBilling = currentCustomer.billing || {};
    const currentShipping = currentCustomer.shipping || {};

    // 3. Email Uniqueness Validation
    let cleanEmail = session.email;
    if (email && email.trim().toLowerCase() !== session.email.toLowerCase()) {
      cleanEmail = email.trim().toLowerCase();

      // Check if another customer is already using this email in WooCommerce
      const checkRes = await fetch(
        `${credentials.baseUrl}/wp-json/wc/v3/customers?email=${encodeURIComponent(cleanEmail)}`,
        {
          headers: { Authorization: credentials.authHeader },
          cache: "no-store",
        }
      );

      if (checkRes.ok) {
        const existingCustomers = await checkRes.json();
        if (
          Array.isArray(existingCustomers) &&
          existingCustomers.some((c: any) => Number(c.id) !== Number(session.customerId))
        ) {
          return NextResponse.json(
            { success: false, message: "That email address is already in use." },
            { status: 409 }
          );
        }
      }
    }

    // 4. Construct Precise WooCommerce Customer Update Payload
    const newFirstName = firstName !== undefined ? firstName.trim() : (currentCustomer.first_name || session.firstName);
    const newLastName = lastName !== undefined ? lastName.trim() : (currentCustomer.last_name || session.lastName);
    const newPhone = phone !== undefined ? phone.trim() : (currentBilling.phone || "");

    const updatePayload: any = {
      first_name: newFirstName,
      last_name: newLastName,
      email: cleanEmail,
      billing: {
        first_name: billing?.firstName ? billing.firstName.trim() : (newFirstName || currentBilling.first_name || ""),
        last_name: billing?.lastName ? billing.lastName.trim() : (newLastName || currentBilling.last_name || ""),
        company: billing?.company !== undefined ? billing.company.trim() : (currentBilling.company || ""),
        address_1: billing?.address1 !== undefined ? billing.address1.trim() : (currentBilling.address_1 || ""),
        address_2: billing?.address2 !== undefined ? billing.address2.trim() : (currentBilling.address_2 || ""),
        city: billing?.city !== undefined ? billing.city.trim() : (currentBilling.city || ""),
        state: billing?.state !== undefined ? billing.state.trim() : (currentBilling.state || ""),
        postcode: billing?.postcode !== undefined ? billing.postcode.trim() : (currentBilling.postcode || ""),
        country: billing?.country ? (billing.country === "India" ? "IN" : billing.country.trim()) : (currentBilling.country || "IN"),
        email: cleanEmail,
        phone: billing?.phone ? billing.phone.trim() : newPhone,
      },
      shipping: {
        first_name: shipping?.firstName ? shipping.firstName.trim() : (newFirstName || currentShipping.first_name || ""),
        last_name: shipping?.lastName ? shipping.lastName.trim() : (newLastName || currentShipping.last_name || ""),
        company: shipping?.company !== undefined ? shipping.company.trim() : (currentShipping.company || ""),
        address_1: shipping?.address1 !== undefined ? shipping.address1.trim() : (currentShipping.address_1 || ""),
        address_2: shipping?.address2 !== undefined ? shipping.address2.trim() : (currentShipping.address_2 || ""),
        city: shipping?.city !== undefined ? shipping.city.trim() : (currentShipping.city || ""),
        state: shipping?.state !== undefined ? shipping.state.trim() : (currentShipping.state || ""),
        postcode: shipping?.postcode !== undefined ? shipping.postcode.trim() : (currentShipping.postcode || ""),
        country: shipping?.country ? (shipping.country === "India" ? "IN" : shipping.country.trim()) : (currentShipping.country || "IN"),
        phone: shipping?.phone ? shipping.phone.trim() : newPhone,
      },
    };

    // 5. Send PUT Request Server-Side to WooCommerce
    const updateRes = await fetch(
      `${credentials.baseUrl}/wp-json/wc/v3/customers/${session.customerId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: credentials.authHeader,
        },
        body: JSON.stringify(updatePayload),
        cache: "no-store",
      }
    );

    if (!updateRes.ok) {
      const errData = await updateRes.json().catch(() => ({}));
      console.error("[WooCommerce Customer PUT Error]:", errData);
      return NextResponse.json(
        { success: false, message: "Unable to save your changes. Please try again." },
        { status: updateRes.status }
      );
    }

    // 6. Fetch Fresh Customer Record from WooCommerce
    const freshRes = await fetch(
      `${credentials.baseUrl}/wp-json/wc/v3/customers/${session.customerId}`,
      {
        headers: { Authorization: credentials.authHeader },
        cache: "no-store",
      }
    );

    const freshCustomer = freshRes.ok ? await freshRes.json() : await updateRes.json();

    // 7. Update Encrypted Session Cookie with Fresh Identity Data
    const updatedSessionToken = encryptSessionPayload({
      customerId: session.customerId,
      email: freshCustomer.email,
      firstName: freshCustomer.first_name || newFirstName,
      lastName: freshCustomer.last_name || newLastName,
      createdAt: session.createdAt || Date.now(),
      rememberMe: Boolean(session.rememberMe),
    });

    const cookieStore = await cookies();
    cookieStore.set(AUTH_COOKIE_NAME, updatedSessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: session.rememberMe ? 30 * 24 * 60 * 60 : 7 * 24 * 60 * 60,
      path: "/",
    });

    return NextResponse.json({
      success: true,
      message: "Customer account details saved successfully.",
      customer: {
        id: freshCustomer.id,
        email: freshCustomer.email,
        firstName: freshCustomer.first_name,
        lastName: freshCustomer.last_name,
        displayName: `${freshCustomer.first_name || ""} ${freshCustomer.last_name || ""}`.trim() || freshCustomer.username,
        phone: freshCustomer.billing?.phone || "",
        billing: freshCustomer.billing || {},
        shipping: freshCustomer.shipping || {},
      },
    });
  } catch (error) {
    console.error("[Update Profile API Exception]:", error);
    return NextResponse.json(
      { success: false, message: "Unable to save your changes. Please try again." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return PUT(request);
}
