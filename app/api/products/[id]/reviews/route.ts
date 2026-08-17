export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextRequest, NextResponse } from "next/server";
import { getWooProductReviews, createWooProductReview } from "@/lib/woocommerce";
import { getAuthenticatedCustomerSession } from "@/lib/auth";

/**
 * GET /api/products/[id]/reviews - Fetch public approved reviews from WooCommerce
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cleanId = String(id || "").replace(/\D/g, "");

    if (!cleanId) {
      return NextResponse.json({ success: true, reviews: [] });
    }

    const reviews = await getWooProductReviews(cleanId);
    return NextResponse.json({ success: true, reviews });
  } catch (err) {
    console.error("[API /api/products/[id]/reviews GET Error]:", err);
    return NextResponse.json({ success: true, reviews: [] });
  }
}

/**
 * POST /api/products/[id]/reviews - Post a new product review to WooCommerce (Authenticated Customers Only)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAuthenticatedCustomerSession();

    if (!session || !session.customerId || !session.email) {
      return NextResponse.json(
        { success: false, requireAuth: true, message: "Authentication required to submit a product review." },
        { status: 401 }
      );
    }

    const { id } = await params;
    const cleanProductId = parseInt(String(id || "").replace(/\D/g, ""), 10);

    if (isNaN(cleanProductId) || cleanProductId <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid WooCommerce Product ID." },
        { status: 400 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const rating = parseInt(String(body.rating || ""), 10);
    const reviewText = String(body.review || "").trim();

    if (isNaN(rating) || rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, message: "Rating must be a number between 1 and 5 stars." },
        { status: 400 }
      );
    }

    if (!reviewText) {
      return NextResponse.json(
        { success: false, message: "Review text cannot be empty." },
        { status: 400 }
      );
    }

    const reviewerName =
      (session.firstName && session.firstName.trim())
        ? session.firstName.trim()
        : session.displayName
        ? session.displayName.split(" ")[0].trim()
        : "Valued Customer";
    const reviewerEmail = session.email;

    const result = await createWooProductReview({
      productId: cleanProductId,
      rating,
      review: reviewText,
      reviewer: reviewerName,
      reviewerEmail,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      status: result.status,
      review: result.review,
    });
  } catch (error: any) {
    console.error("[API /api/products/[id]/reviews POST Error]:", error);
    return NextResponse.json(
      { success: false, message: "An unexpected error occurred while submitting your review. Please try again." },
      { status: 500 }
    );
  }
}
