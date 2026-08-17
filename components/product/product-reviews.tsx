"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Star, CheckCircle, MessageSquare, Loader2, AlertCircle, Edit3, Send } from "lucide-react";
import { RatingStars } from "@/components/common/rating-stars";
import { WooReview, formatReviewerName } from "@/lib/woocommerce";

interface ProductReviewsProps {
  productId: string | number;
  rating?: number;
  reviewCount?: number;
  onReviewsUpdated?: (data: { rating: number; reviewCount: number }) => void;
}

function stripHtml(html: string): string {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, "").trim();
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

export function ProductReviews({
  productId,
  rating = 0,
  reviewCount = 0,
  onReviewsUpdated,
}: ProductReviewsProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [reviews, setReviews] = useState<WooReview[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<{ displayName?: string; email?: string } | null>(null);

  // Review Submission State
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [userRating, setUserRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [userComment, setUserComment] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitSuccessMsg, setSubmitSuccessMsg] = useState<string | null>(null);
  const [submitErrorMsg, setSubmitErrorMsg] = useState<string | null>(null);

  const cleanId = String(productId || "").replace(/\D/g, "");

  // Stabilize onReviewsUpdated callback in a ref to prevent infinite fetch loops
  const onReviewsUpdatedRef = useRef(onReviewsUpdated);
  useEffect(() => {
    onReviewsUpdatedRef.current = onReviewsUpdated;
  }, [onReviewsUpdated]);

  // 1. Check user auth status ONCE on component mount
  useEffect(() => {
    let isMounted = true;
    async function checkAuth() {
      try {
        const authRes = await fetch("/api/auth/me");
        if (authRes.ok) {
          const authData = await authRes.json();
          if (isMounted && authData.success && authData.customer) {
            setIsAuthenticated(true);
            setCurrentUser(authData.customer);
          }
        }
      } catch {
        // Guest user
      }
    }
    checkAuth();
    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Fetch public reviews from WooCommerce ONLY when cleanId changes
  useEffect(() => {
    if (!cleanId) {
      setLoading(false);
      return;
    }

    let isMounted = true;
    async function fetchReviews() {
      setLoading(true);
      try {
        const res = await fetch(`/api/products/${cleanId}/reviews`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.success && Array.isArray(data.reviews)) {
            setReviews(data.reviews);
            const count = data.reviews.length;
            const avg =
              count > 0
                ? data.reviews.reduce((acc: number, r: WooReview) => acc + (typeof r.rating === "number" ? r.rating : 5), 0) / count
                : 0;
            onReviewsUpdatedRef.current?.({ rating: avg, reviewCount: count });
          }
        }
      } catch (err) {
        console.warn("[ProductReviews] Failed to load reviews:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchReviews();
    return () => {
      isMounted = false;
    };
  }, [cleanId]);

  const handleOpenFormClick = () => {
    if (!isAuthenticated) {
      const redirectUrl = `/login?redirect=${encodeURIComponent(pathname || "/")}`;
      router.push(redirectUrl);
      return;
    }
    setIsFormOpen((prev) => !prev);
    setSubmitSuccessMsg(null);
    setSubmitErrorMsg(null);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      const redirectUrl = `/login?redirect=${encodeURIComponent(pathname || "/")}`;
      router.push(redirectUrl);
      return;
    }

    if (!userComment.trim()) {
      setSubmitErrorMsg("Please enter your review text before submitting.");
      return;
    }

    setIsSubmitting(true);
    setSubmitSuccessMsg(null);
    setSubmitErrorMsg(null);

    try {
      const cleanId = String(productId).replace(/\D/g, "");
      const res = await fetch(`/api/products/${cleanId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating: userRating,
          review: userComment.trim(),
        }),
      });

      const data = await res.json();

      if (res.status === 401 || data.requireAuth) {
        const redirectUrl = `/login?redirect=${encodeURIComponent(pathname || "/")}`;
        router.push(redirectUrl);
        return;
      }

      if (!res.ok || !data.success) {
        setSubmitErrorMsg(data.message || "Failed to submit review. Please try again.");
      } else {
        setSubmitSuccessMsg(data.message || "Your review has been submitted successfully.");
        setUserComment("");
        setIsFormOpen(false);

        // Refresh reviews from WooCommerce
        try {
          const freshRes = await fetch(`/api/products/${cleanId}/reviews`);
          if (freshRes.ok) {
            const freshData = await freshRes.json();
            if (freshData.success && Array.isArray(freshData.reviews)) {
              setReviews(freshData.reviews);
              const count = freshData.reviews.length;
              const avg =
                count > 0
                  ? freshData.reviews.reduce((acc: number, r: WooReview) => acc + (typeof r.rating === "number" ? r.rating : 5), 0) / count
                  : 0;
              onReviewsUpdated?.({ rating: avg, reviewCount: count });
            }
          }
        } catch {
          // Keep current list if fresh fetch fails
        }
      }
    } catch (err) {
      setSubmitErrorMsg("An unexpected network error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalReviews = reviews.length;
  const calculatedAverage =
    totalReviews > 0
      ? reviews.reduce((sum, r) => sum + (typeof r.rating === "number" ? r.rating : 5), 0) / totalReviews
      : 0;

  const displayRating = totalReviews > 0 ? calculatedAverage : (rating && rating > 0 ? rating : 0);

  return (
    <section className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-[#e3beb8]/60 shadow-lux space-y-6">
      {/* Header Row */}
      <div className="border-b border-[#e3beb8]/40 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl sm:text-2xl font-black text-[#261816] tracking-tight flex items-center gap-2.5">
            <MessageSquare className="w-6 h-6 text-[#8b0000]" /> Customer Reviews & Ratings
          </h3>
          <p className="text-xs text-[#5a403c] mt-0.5">
            Verified customer ratings and verified purchase evaluations
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Overall Rating Pill */}
          <div className="flex items-center gap-2.5 bg-[#fff8f6] px-3.5 py-2 rounded-2xl border border-[#e3beb8]/50">
            <span className="text-lg font-black text-[#8b0000]">{displayRating.toFixed(1)}</span>
            <div>
              <RatingStars rating={displayRating} reviewCount={totalReviews} size={12} />
              <span className="text-[9px] text-[#8e706b] font-medium block">
                {totalReviews} {totalReviews === 1 ? "review" : "reviews"}
              </span>
            </div>
          </div>

          {/* Write a Review Button */}
          <button
            onClick={handleOpenFormClick}
            className="px-4 py-2 rounded-xl bg-[#8b0000] hover:bg-[#bc0000] text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all"
          >
            <Edit3 className="w-3.5 h-3.5" /> Write a Review
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {submitSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{submitSuccessMsg}</span>
        </div>
      )}

      {/* Error Notification Banner */}
      {submitErrorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{submitErrorMsg}</span>
        </div>
      )}

      {/* Review Submission Form Drawer */}
      {isFormOpen && (
        <form
          onSubmit={handleSubmitReview}
          className="p-5 sm:p-6 rounded-2xl bg-[#fff8f6] border border-[#e3beb8]/60 space-y-4 animate-in fade-in duration-200"
        >
          <div className="flex items-center justify-between border-b border-[#e3beb8]/40 pb-3">
            <h4 className="text-sm font-extrabold text-[#261816] flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-[#8b0000]" /> Submit Your Verified Review
            </h4>
            {currentUser && (
              <span className="text-[11px] font-semibold text-[#8e706b]">
                Reviewing as <strong className="text-[#261816]">{currentUser.displayName || currentUser.email}</strong>
              </span>
            )}
          </div>

          {/* Star Rating Picker */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#5a403c] block">Your Rating:</label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => {
                const isFilled = star <= (hoverRating || userRating);
                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setUserRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 text-amber-400 hover:scale-110 transition-transform cursor-pointer"
                    aria-label={`Rate ${star} stars out of 5`}
                  >
                    <Star className={`w-6 h-6 ${isFilled ? "fill-amber-400 text-amber-400" : "text-gray-300"}`} />
                  </button>
                );
              })}
              <span className="text-xs font-bold text-[#8b0000] ml-2">{userRating} / 5 Stars</span>
            </div>
          </div>

          {/* Review Comment Textarea */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#5a403c] block">Your Review:</label>
            <textarea
              rows={4}
              value={userComment}
              onChange={(e) => setUserComment(e.target.value)}
              placeholder="Share your experience with this flagship device (performance, build quality, features)..."
              required
              className="w-full p-3 rounded-xl border border-[#e3beb8]/60 bg-white text-xs text-[#261816] placeholder:text-gray-400 focus:outline-none focus:border-[#8b0000] focus:ring-1 focus:ring-[#8b0000] transition-all"
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[#5a403c] hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-[#8b0000] hover:bg-[#bc0000] text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Submitting...
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" /> Submit Review
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Review List or Loading / Empty States */}
      {loading ? (
        <div className="py-12 text-center text-[#8e706b] space-y-2">
          <Loader2 className="w-6 h-6 animate-spin text-[#8b0000] mx-auto" />
          <p className="text-xs font-semibold">Loading verified reviews...</p>
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-10 bg-[#fff8f6] rounded-2xl border border-[#e3beb8]/40 space-y-2">
          <Star className="w-8 h-8 text-[#e3beb8] mx-auto" />
          <h4 className="font-bold text-sm text-[#261816]">No reviews yet.</h4>
          <p className="text-xs text-[#5a403c]">Be the first to review this product after your purchase!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((rev) => {
            const cleanText = stripHtml(rev.review);
            const dateStr = formatDate(rev.date_created);
            const displayName = formatReviewerName(rev.reviewer);

            return (
              <div
                key={rev.id}
                className="p-4 sm:p-5 rounded-2xl bg-[#fff8f6] border border-[#e3beb8]/40 space-y-2.5 transition-all hover:border-[#8b0000]/40"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#8b0000] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                      {displayName ? displayName.charAt(0).toUpperCase() : "V"}
                    </div>
                    <div>
                      <span className="font-bold text-xs sm:text-sm text-[#261816] block leading-snug">
                        {displayName}
                      </span>
                      {rev.verified && (
                        <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-700 uppercase tracking-wider">
                          <CheckCircle className="w-3 h-3 text-emerald-600" /> Verified Buyer
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <RatingStars rating={rev.rating} size={11} />
                    {dateStr && <span className="text-[10px] text-[#8e706b] block pt-0.5">{dateStr}</span>}
                  </div>
                </div>

                {cleanText && (
                  <p className="text-xs sm:text-sm text-[#5a403c] leading-relaxed pt-1">{cleanText}</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
