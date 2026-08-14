import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME, encryptSessionPayload } from "@/lib/auth";

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, password, confirmPassword, phone } = body;

    // Input Validation
    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { success: false, message: "First Name, Last Name, Email, and Password are required." },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { success: false, message: "Password and Confirm Password do not match." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    const credentials = getWooCredentials();
    if (!credentials) {
      return NextResponse.json(
        { success: false, message: "WooCommerce API credentials are not configured server-side." },
        { status: 500 }
      );
    }

    // 1. Check if customer already exists in WooCommerce by email
    const checkRes = await fetch(
      `${credentials.baseUrl}/wp-json/wc/v3/customers?email=${encodeURIComponent(email.trim().toLowerCase())}`,
      {
        headers: { Authorization: credentials.authHeader },
        cache: "no-store",
      }
    );

    if (checkRes.ok) {
      const existing = await checkRes.json();
      if (Array.isArray(existing) && existing.length > 0) {
        return NextResponse.json(
          { success: false, message: "An account with this email address already exists. Please log in." },
          { status: 400 }
        );
      }
    }

    // 2. Create Customer in WooCommerce REST API
    const customerPayload = {
      email: email.trim().toLowerCase(),
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      username: email.trim().toLowerCase(),
      password: password,
      billing: {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone || "",
      },
      shipping: {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
      },
    };

    const createRes = await fetch(`${credentials.baseUrl}/wp-json/wc/v3/customers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: credentials.authHeader,
      },
      body: JSON.stringify(customerPayload),
      cache: "no-store",
    });

    const wooCustomer = await createRes.json();

    if (!createRes.ok) {
      const errMsg = wooCustomer.message || "Failed to create WooCommerce customer account.";
      return NextResponse.json({ success: false, message: errMsg }, { status: createRes.status });
    }

    // 3. Create HTTP-Only Cookie Session
    const sessionToken = encryptSessionPayload({
      customerId: wooCustomer.id,
      email: wooCustomer.email,
      firstName: wooCustomer.first_name || firstName,
      lastName: wooCustomer.last_name || lastName,
      createdAt: Date.now(),
    });

    const cookieStore = await cookies();
    cookieStore.set(AUTH_COOKIE_NAME, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
    });

    return NextResponse.json(
      {
        success: true,
        message: "Customer account registered successfully.",
        customer: {
          id: wooCustomer.id,
          email: wooCustomer.email,
          firstName: wooCustomer.first_name,
          lastName: wooCustomer.last_name,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[Register API Error]:", error);
    return NextResponse.json(
      { success: false, message: "An unexpected error occurred during customer registration." },
      { status: 500 }
    );
  }
}
