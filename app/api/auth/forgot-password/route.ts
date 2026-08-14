import { NextRequest, NextResponse } from "next/server";

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
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email address is required." },
        { status: 400 }
      );
    }

    const credentials = getWooCredentials();
    if (credentials) {
      // Trigger WordPress native password reset via wp-login.php?action=lostpassword
      const params = new URLSearchParams();
      params.append("user_login", email.trim().toLowerCase());
      params.append("wp-submit", "Get New Password");

      await fetch(`${credentials.baseUrl}/wp-login.php?action=lostpassword`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params.toString(),
        cache: "no-store",
      });
    }

    // Always return clean confirmation to avoid email enumeration security leaks
    return NextResponse.json({
      success: true,
      message: "If an account exists for this email, password reset instructions have been sent.",
    });
  } catch (error) {
    console.error("[Forgot Password API Error]:", error);
    return NextResponse.json(
      { success: false, message: "An error occurred while processing password reset request." },
      { status: 500 }
    );
  }
}
