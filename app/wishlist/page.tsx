"use client";

import { useWishlist } from "@/hooks/use-wishlist";
import { useCart } from "@/hooks/use-cart";
import { formatPrice } from "@/lib/utils";
import { DemoLink as Link } from "@/components/demo/demo-link";
import { RatingStars } from "@/components/common/rating-stars";
import {
  Heart,
  ShoppingBag,
  Trash2,
  ArrowLeft,
  ArrowRight,
  Loader2,
  AlertCircle,
  Eye,
} from "lucide-react";
import { useState } from "react";
import { Product } from "@/types/product";

export default function WishlistPage() {
  const { wishlistProducts, wishlistCount, removeFromWishlist, isLoading } = useWishlist();
  const { addToCartAsync } = useCart();
  const [addingId, setAddingId] = useState<string | null>(null);
  const [errorId, setErrorId] = useState<string | null>(null);

  const handleAddToCart = async (product: Product) => {
    if (addingId) return;
    setAddingId(product.id);
    setErrorId(null);

    try {
      const isVariable = product.type === "variable" || (product.variants && product.variants.length > 1);
      const res = await addToCartAsync(
        product,
        isVariable ? undefined : product.variants?.[0],
        1,
        undefined,
        true
      );

      if (res && !res.success) {
        setErrorId(product.id);
        setTimeout(() => setErrorId(null), 3500);
      }
    } catch {
      setErrorId(product.id);
      setTimeout(() => setErrorId(null), 3500);
    } finally {
      setAddingId(null);
    }
  };

  return (
    <div className="py-8 sm:py-12 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#ffe9e6]">
          <div>
            <Link
              href="/shop"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#8b0000] hover:underline mb-1"
            >
              <ArrowLeft className="w-4 h-4" /> Continue Shopping
            </Link>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#261816] flex items-center gap-2">
              <Heart className="w-7 h-7 text-[#8b0000] fill-[#8b0000]" />
              <span>My Wishlist ({wishlistCount} {wishlistCount === 1 ? "Item" : "Items"})</span>
            </h1>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="py-20 text-center space-y-3">
            <Loader2 className="w-8 h-8 text-[#8b0000] animate-spin mx-auto" />
            <p className="text-xs font-bold text-[#5a403c]">Loading your saved wishlist items...</p>
          </div>
        ) : wishlistProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlistProducts.map((product) => {
              const isAnyVariantInStock =
                product.variants && product.variants.length > 0
                  ? product.variants.some((v) => v.inStock && v.stockStatus !== "outofstock")
                  : true;

              const isAdding = addingId === product.id;
              const hasError = errorId === product.id;

              return (
                <div
                  key={product.id}
                  className="bg-white rounded-3xl p-5 border border-[#e3beb8]/60 shadow-lux hover:shadow-2xl transition-all duration-300 flex flex-col justify-between group"
                >
                  <div>
                    {/* Image & Remove Action */}
                    <div className="relative mb-3 rounded-2xl overflow-hidden bg-white p-2 border border-[#e3beb8]/30">
                      {/* eslint-disable-next-img-element */}
                      <img
                        src={product.featuredImage}
                        alt={product.title}
                        className="w-full h-44 object-cover object-center group-hover:scale-105 transition-transform duration-500 rounded-xl"
                      />

                      <button
                        onClick={() => removeFromWishlist(product.id)}
                        className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-md rounded-full text-[#8e706b] hover:text-red-600 hover:bg-red-50 transition-all shadow-md"
                        title="Remove from Wishlist"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <span
                        className={`absolute bottom-3 left-3 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider ${
                          isAnyVariantInStock
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                            : "bg-amber-100 text-amber-900 border border-amber-200"
                        }`}
                      >
                        {isAnyVariantInStock ? "In Stock" : "Out of Stock"}
                      </span>
                    </div>

                    {/* Details */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-[#8b0000] uppercase tracking-wider block">
                        {product.brand} • {product.categoryLabel}
                      </span>
                      <RatingStars rating={product.rating} reviewCount={product.reviewCount} size={10} />
                      <Link href={`/products/${product.slug}`}>
                        <h3 className="font-bold text-base text-[#261816] group-hover:text-[#8b0000] transition-colors line-clamp-1">
                          {product.title}
                        </h3>
                      </Link>
                    </div>
                  </div>

                  {/* Pricing & Footer Actions */}
                  <div className="mt-4 pt-3 border-t border-[#ffe9e6] space-y-3">
                    <div className="flex items-baseline justify-between">
                      <span className="font-extrabold text-lg text-[#8b0000]">
                        {formatPrice(product.price)}
                      </span>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <span className="text-xs text-[#8e706b] line-through font-medium">
                          {formatPrice(product.originalPrice)}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Link
                        href={`/products/${product.slug}`}
                        className="py-2.5 px-3 rounded-xl border border-[#e3beb8] text-[#5a403c] font-bold text-xs hover:border-[#8b0000] hover:text-[#8b0000] flex items-center justify-center gap-1 transition-all"
                      >
                        <Eye className="w-3.5 h-3.5" /> View
                      </Link>

                      {isAnyVariantInStock ? (
                        <button
                          onClick={() => handleAddToCart(product)}
                          disabled={isAdding}
                          className={`py-2.5 px-3 rounded-xl font-bold text-xs transition-all shadow-sm flex items-center justify-center gap-1.5 ${
                            hasError
                              ? "bg-amber-700 text-white"
                              : "bg-[#8b0000] hover:bg-[#bc0000] text-white"
                          }`}
                        >
                          {isAdding ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : hasError ? (
                            <AlertCircle className="w-3.5 h-3.5" />
                          ) : (
                            <>
                              <ShoppingBag className="w-3.5 h-3.5" /> Add
                            </>
                          )}
                        </button>
                      ) : (
                        <button
                          disabled
                          className="py-2.5 px-3 rounded-xl font-extrabold text-[10px] bg-[#e3beb8]/60 text-[#8e706b] border border-[#e3beb8] cursor-not-allowed uppercase tracking-wider flex items-center justify-center"
                        >
                          Out of Stock
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-12 border border-[#e3beb8]/60 shadow-lux text-center space-y-4 max-w-lg mx-auto">
            <div className="w-16 h-16 bg-[#ffe9e6] rounded-full flex items-center justify-center mx-auto text-[#8b0000]">
              <Heart className="w-8 h-8 fill-[#8b0000]" />
            </div>
            <h2 className="text-xl font-extrabold text-[#261816]">Your Wishlist is Empty</h2>
            <p className="text-xs text-[#5a403c]">
              Explore our luxury tech collection and click the heart icon on any device to save it to your wishlist.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#8b0000] text-white font-bold text-xs hover:bg-[#bc0000] transition-all shadow-md"
            >
              Start Shopping <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
