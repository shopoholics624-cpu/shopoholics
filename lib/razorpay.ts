import crypto from "crypto";

/**
 * Server-side helper to read Razorpay credentials safely.
 */
export function getRazorpayConfig() {
  const keyId = process.env.RAZORPAY_KEY_ID || "";
  const keySecret = process.env.RAZORPAY_KEY_SECRET || "";
  const provider = (process.env.PAYMENT_PROVIDER || "development").toLowerCase();

  const isConfigured = Boolean(
    keyId &&
    keySecret &&
    !keyId.includes("dummy") &&
    !keySecret.includes("dummy") &&
    keyId.startsWith("rzp_")
  );

  return {
    keyId,
    keySecret,
    provider: isConfigured && provider === "razorpay" ? "razorpay" : "development",
    isConfigured,
  };
}

/**
 * Create Razorpay Order via REST API server-side
 */
export async function createRazorpayOrder({
  amountInRupees,
  currency = "INR",
  receiptId,
  notes = {},
}: {
  amountInRupees: number;
  currency?: string;
  receiptId: string;
  notes?: Record<string, string>;
}) {
  const { keyId, keySecret, isConfigured } = getRazorpayConfig();

  if (!isConfigured) {
    throw new Error("Razorpay credentials are not configured on the server.");
  }

  // Convert Rupees (INR) to smallest currency unit (Paise: 1 INR = 100 Paise)
  const amountInPaise = Math.round(amountInRupees * 100);

  const authHeader = `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`;

  const response = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: authHeader,
    },
    body: JSON.stringify({
      amount: amountInPaise,
      currency: currency.toUpperCase(),
      receipt: receiptId.slice(0, 40),
      notes,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error("[Razorpay API Order Creation Error]:", errorData);
    throw new Error(errorData?.error?.description || "Failed to create Razorpay payment order.");
  }

  const razorpayOrder = await response.json();
  return {
    id: razorpayOrder.id as string,
    amount: razorpayOrder.amount as number,
    currency: razorpayOrder.currency as string,
    receipt: razorpayOrder.receipt as string,
    status: razorpayOrder.status as string,
  };
}

/**
 * Perform HMAC SHA256 signature verification for Razorpay payment callbacks.
 * Formula: HMAC_SHA256(razorpay_order_id + "|" + razorpay_payment_id, secret) == razorpay_signature
 */
export function verifyRazorpaySignature({
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature,
}: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}): boolean {
  const { keySecret, isConfigured } = getRazorpayConfig();

  if (!isConfigured || !keySecret) {
    console.error("[Razorpay Signature Verification] Cannot verify: Key secret missing.");
    return false;
  }

  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    return false;
  }

  try {
    const payload = `${razorpayOrderId}|${razorpayPaymentId}`;
    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(payload)
      .digest("hex");

    const expectedBuffer = Buffer.from(expectedSignature, "utf-8");
    const receivedBuffer = Buffer.from(razorpaySignature, "utf-8");

    if (expectedBuffer.length !== receivedBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
  } catch (error) {
    console.error("[Razorpay Signature Verification Error]:", error);
    return false;
  }
}
