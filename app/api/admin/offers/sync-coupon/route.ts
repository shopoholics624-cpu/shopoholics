import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedAdminSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

function getWooCommerceCredentials() {
  const url = process.env.WOOCOMMERCE_URL;
  const key = process.env.WOOCOMMERCE_CONSUMER_KEY;
  const secret = process.env.WOOCOMMERCE_CONSUMER_SECRET;

  if (!url || !key || !secret) {
    return null;
  }

  return {
    baseUrl: url.replace(/\/+$/, ""),
    authHeader: `Basic ${Buffer.from(`${key}:${secret}`).toString("base64")}`,
  };
}

export async function POST(req: NextRequest) {
  try {
    const adminSession = await getAuthenticatedAdminSession();
    if (!adminSession) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Administrator privileges required." },
        { status: 403 }
      );
    }
    const creds = getWooCommerceCredentials();
    if (!creds) {
      return NextResponse.json(
        { success: false, error: "WooCommerce credentials not configured" },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { code, discountType, amount, description, expiryDate, applyTo, targetCategoryId, targetProductIds } = body;

    if (!code || typeof code !== "string") {
      return NextResponse.json(
        { success: false, error: "Coupon code is required" },
        { status: 400 }
      );
    }

    const cleanCode = code.trim().toUpperCase();
    const cleanAmount = String(amount || "0");
    const wooDiscountType = discountType === "percent" ? "percent" : "fixed_cart";

    // 1. Search if coupon already exists in WooCommerce
    const searchRes = await fetch(
      `${creds.baseUrl}/wp-json/wc/v3/coupons?code=${encodeURIComponent(cleanCode)}`,
      {
        headers: { Authorization: creds.authHeader },
        cache: "no-store",
      }
    );

    let existingCoupon: any = null;
    if (searchRes.ok) {
      const list = await searchRes.json();
      if (Array.isArray(list) && list.length > 0) {
        existingCoupon = list[0];
      }
    }

    const payload: any = {
      code: cleanCode,
      discount_type: wooDiscountType,
      amount: cleanAmount,
      description: description || "Promotional Homepage Offer Coupon",
      individual_use: false,
    };

    if (applyTo === "category" && targetCategoryId) {
      payload.product_categories = [Number(targetCategoryId)];
    } else if (applyTo === "products" && Array.isArray(targetProductIds) && targetProductIds.length > 0) {
      payload.product_ids = targetProductIds.map((id) => Number(id));
    } else {
      payload.product_categories = [];
      payload.product_ids = [];
    }

    if (expiryDate) {
      payload.date_expires = expiryDate;
    }

    let resultCoupon: any = null;
    if (existingCoupon?.id) {
      // Update existing coupon in WooCommerce
      const updateRes = await fetch(
        `${creds.baseUrl}/wp-json/wc/v3/coupons/${existingCoupon.id}`,
        {
          method: "PUT",
          headers: {
            Authorization: creds.authHeader,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );
      if (updateRes.ok) {
        resultCoupon = await updateRes.json();
      } else {
        const errText = await updateRes.text();
        throw new Error(`WooCommerce coupon update failed: ${errText}`);
      }
    } else {
      // Create new coupon in WooCommerce
      const createRes = await fetch(`${creds.baseUrl}/wp-json/wc/v3/coupons`, {
        method: "POST",
        headers: {
          Authorization: creds.authHeader,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      if (createRes.ok) {
        resultCoupon = await createRes.json();
      } else {
        const errText = await createRes.text();
        throw new Error(`WooCommerce coupon creation failed: ${errText}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Coupon ${cleanCode} successfully synchronized with WooCommerce.`,
      coupon: resultCoupon,
    });
  } catch (err: any) {
    console.error("[API Admin Offers Sync-Coupon] Error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to sync coupon with WooCommerce" },
      { status: 500 }
    );
  }
}
