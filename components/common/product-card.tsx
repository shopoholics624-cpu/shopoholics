"use client";

import { motion } from "framer-motion";
import { DemoLink as Link } from "@/components/demo/demo-link";
import { ShoppingBag, ArrowLeftRight, Check, Gift, Loader2, AlertCircle, Heart } from "lucide-react";
import { Product } from "@/types/product";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/hooks/use-cart";
import { useCompare } from "@/hooks/use-compare";
import { useWishlist } from "@/hooks/use-wishlist";
import { useDemo } from "@/hooks/use-demo";
import { RatingStars } from "./rating-stars";
import { useState } from "react";

interface ProductCardProps {
  product: Product;
  variant?: "standard" | "shop";
}

export function ProductCard({ product, variant = "standard" }: ProductCardProps) {
  const { addToCartAsync } = useCart();
  const { addToCompare, isInCompare, removeFromCompare } = useCompare();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { isDemoMode, handleDemoAction } = useDemo();
  const [added, setAdded] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [cardError, setCardError] = useState<string | null>(null);

  const inCompare = isInCompare(product.id);
  const inWishlist = isInWishlist(product.id);

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isDemoMode) {
      handleDemoAction(e);
      return;
    }

    toggleWishlist(product);
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isAdding) return;
    setIsAdding(true);
    setCardError(null);

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
        setCardError(res.message || "This product is currently unavailable.");
        setTimeout(() => setCardError(null), 3500);
      } else {
        setAdded(true);
        setTimeout(() => setAdded(false), 1800);
      }
    } catch (err) {
      setCardError("This product is currently unavailable.");
      setTimeout(() => setCardError(null), 3500);
    } finally {
      setIsAdding(false);
    }
  };

  const handleToggleCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isDemoMode) {
      handleDemoAction(e);
      return;
    }

    if (inCompare) {
      removeFromCompare(product.id);
    } else {
      addToCompare(product);
    }
  };

  const isAnyVariantInStock =
    product.variants && product.variants.length > 0
      ? product.variants.some((v) => v.inStock && v.stockStatus !== "outofstock")
      : product.inStock !== false;

  const originalPriceNum = product.originalPrice || 0;
  const currentPriceNum = product.price || 0;

  const discountPercent =
    originalPriceNum > currentPriceNum
      ? Math.round(((originalPriceNum - currentPriceNum) / originalPriceNum) * 100)
      : null;

  const savingsAmount =
    originalPriceNum > currentPriceNum ? originalPriceNum - currentPriceNum : null;

  // Render Standard Vertical Card (Always used for Homepage Flagship section and standard grids)
  const renderStandardCard = (hiddenOnMobile = false) => (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      className={`${
        hiddenOnMobile ? "hidden sm:flex" : "flex"
      } group relative z-0 hover:z-20 bg-white hover:bg-[#F1F0EC] rounded-2xl sm:rounded-3xl p-3 sm:p-4 border border-[#D4D3CD] shadow-sm hover:shadow-xl hover:border-[#4A4944] flex-col justify-between overflow-hidden h-full transition-all duration-300`}
    >
      {/* Top Badge & Action Icons */}
      <div>
        <div className="flex items-center justify-between z-10 relative mb-1.5 sm:mb-2">
          {product.freeGiftBundle ? (
            <span className="px-2 py-0.5 sm:px-2.5 sm:py-0.5 bg-gradient-to-r from-[#8b0000] to-[#bc0000] text-white text-[9px] sm:text-[10px] font-bold tracking-wider uppercase rounded-full flex items-center gap-1 shadow-sm border border-white/40">
              <Gift className="w-2.5 h-2.5 sm:w-3 sm:h-3 animate-pulse" /> FREE GIFT
            </span>
          ) : product.badge && product.badge !== "LIMITED" ? (
            <span className="px-2 py-0.5 sm:px-2.5 sm:py-0.5 bg-[#ffe9e6] text-[#8b0000] text-[9px] sm:text-[10px] font-bold tracking-wider uppercase rounded-full flex items-center gap-1 border border-[#e3beb8]">
              {product.badge}
            </span>
          ) : (
            <span className="text-[9px] sm:text-[10px] font-semibold text-[#8e706b] uppercase tracking-wider">
              {product.categoryLabel}
            </span>
          )}

          <div className="flex items-center gap-1">
            <button
              onClick={handleToggleWishlist}
              title={inWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
              className={`p-1.5 rounded-full transition-all cursor-pointer ${
                inWishlist
                  ? "bg-[#ffe9e6] text-[#8b0000]"
                  : "bg-white text-[#5a403c] hover:bg-[#ffe9e6] hover:text-[#8b0000]"
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${inWishlist ? "fill-[#8b0000] text-[#8b0000]" : ""}`} />
            </button>

            <button
              onClick={handleToggleCompare}
              title={inCompare ? "Remove from Compare" : "Compare Device"}
              className={`p-1.5 rounded-full transition-all cursor-pointer ${
                inCompare
                  ? "bg-[#8b0000] text-white"
                  : "bg-white text-[#5a403c] hover:bg-[#ffe9e6] hover:text-[#8b0000]"
              }`}
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Product Image Link */}
        <Link href={`/products/${product.slug}`} className="block my-1 overflow-hidden rounded-xl bg-white p-1 sm:p-0">
          {/* eslint-disable-next-img-element */}
          <img
            src={product.featuredImage}
            alt={product.title}
            className="w-full h-28 sm:h-44 object-cover object-center group-hover:scale-105 transition-transform duration-500 rounded-lg sm:rounded-xl"
          />
        </Link>

        {/* Title & Specs summary */}
        <div className="mt-2 space-y-0.5">
          <RatingStars rating={product.rating || 0} reviewCount={product.reviewCount || 0} size={10} />
          <Link href={`/products/${product.slug}`}>
            <h3 className="font-bold text-xs sm:text-base text-[#261816] group-hover:text-[#8b0000] transition-colors leading-snug line-clamp-1">
              {product.title}
            </h3>
          </Link>
          <p className="text-[10px] sm:text-xs text-[#5a403c] line-clamp-1 leading-relaxed hidden sm:block">
            {product.tagline}
          </p>
        </div>
      </div>

      {/* Pricing & Add to Cart Footer */}
      <div className="mt-3 pt-2 sm:pt-3 border-t border-[#ffe9e6] flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
        <div className="flex flex-col">
          <div className="flex items-baseline gap-1">
            <span className="font-extrabold text-xs sm:text-base text-[#8b0000]">
              {formatPrice(product.price)}
            </span>
            {originalPriceNum > currentPriceNum && (
              <span className="text-[9px] sm:text-[10px] text-[#8e706b] line-through font-medium hidden sm:inline">
                {formatPrice(originalPriceNum)}
              </span>
            )}
          </div>
          <span className="text-[9px] text-[#5a403c] font-medium hidden sm:block">Free delivery</span>
        </div>

        {isAnyVariantInStock ? (
          <button
            onClick={handleAddToCart}
            disabled={isAdding}
            className={`w-full sm:w-auto flex items-center justify-center gap-1 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl font-semibold text-xs transition-all shadow-sm active:scale-95 min-h-[34px] sm:min-h-[38px] disabled:opacity-75 cursor-pointer ${
              cardError
                ? "bg-amber-700 text-white"
                : added
                ? "bg-emerald-700 text-white"
                : "bg-[#8b0000] hover:bg-[#bc0000] text-white"
            }`}
          >
            {isAdding ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> <span className="text-[10px] sm:text-xs">Adding...</span>
              </>
            ) : cardError ? (
              <>
                <AlertCircle className="w-3.5 h-3.5" /> <span className="text-[10px] sm:text-xs">Unavailable</span>
              </>
            ) : added ? (
              <>
                <Check className="w-3.5 h-3.5" /> <span className="text-[10px] sm:text-xs">Added</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" /> <span className="text-[10px] sm:text-xs">Add</span>
              </>
            )}
          </button>
        ) : (
          <button
            disabled
            className="w-full sm:w-auto flex items-center justify-center px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl font-extrabold text-[10px] sm:text-xs bg-[#e3beb8]/60 text-[#8e706b] border border-[#e3beb8] cursor-not-allowed shadow-none min-h-[34px] sm:min-h-[38px] uppercase tracking-wider"
          >
            Out of Stock
          </button>
        )}
      </div>
    </motion.div>
  );

  // If standard variant (homepage flagship, product grids), return standard card
  if (variant !== "shop") {
    return renderStandardCard(false);
  }

  // If shop variant, render mobile 2-column card on <sm: and standard card on sm:+
  return (
    <>
      {/* Mobile Responsive 2-Column Card for Shop Section */}
      <div className="block sm:hidden w-full bg-white text-[#261816] rounded-2xl p-3 border border-[#D4D3CD] shadow-sm relative overflow-hidden transition-all active:scale-[0.99]">
        <div className="flex items-stretch gap-3">
          {/* Left Column: Image Box + Heart + Compare Pill */}
          <div className="w-[125px] shrink-0 bg-[#F1F0EC] rounded-xl p-2 flex flex-col justify-between items-center relative border border-[#E5E4DE]">
            {/* Top-Right Heart Wishlist Button */}
            <button
              onClick={handleToggleWishlist}
              title={inWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
              className="absolute top-1.5 right-1.5 p-1.5 rounded-full bg-white/90 text-[#5a403c] hover:text-[#8b0000] hover:bg-[#ffe9e6] shadow-xs transition-colors z-10 cursor-pointer"
              aria-label="Wishlist"
            >
              <Heart className={`w-3.5 h-3.5 ${inWishlist ? "fill-[#8b0000] text-[#8b0000]" : "text-[#5a403c]"}`} />
            </button>

            {/* Product Image Link */}
            <Link
              href={`/products/${product.slug}`}
              className="w-full flex-1 flex items-center justify-center my-1"
            >
              {/* eslint-disable-next-img-element */}
              <img
                src={product.featuredImage}
                alt={product.title}
                className="max-h-[105px] w-auto max-w-full object-contain rounded-lg mix-blend-multiply"
              />
            </Link>

            {/* Bottom Compare Pill */}
            <button
              type="button"
              onClick={handleToggleCompare}
              className={`w-full py-1 px-1.5 rounded-full border text-[10px] font-bold flex items-center justify-center gap-1.5 transition-all shadow-2xs cursor-pointer ${
                inCompare
                  ? "bg-[#8b0000] border-[#8b0000] text-white"
                  : "bg-white border-[#D4D3CD] text-[#261816] hover:bg-[#ffe9e6] hover:text-[#8b0000]"
              }`}
            >
              <span
                className={`w-2.5 h-2.5 rounded-full border flex items-center justify-center ${
                  inCompare ? "border-white bg-white" : "border-[#71706b]"
                }`}
              >
                {inCompare && <span className="w-1.5 h-1.5 rounded-full bg-[#8b0000]" />}
              </span>
              <span>Compare</span>
            </button>
          </div>

          {/* Right Column: Title, Prices, Savings, Status & Actions */}
          <div className="flex-1 flex flex-col justify-between py-0.5 space-y-1.5">
            <div>
              {/* Brand & Category Label */}
              <div className="flex items-center gap-1.5 text-[9px] font-extrabold uppercase tracking-wider text-[#8e706b]">
                <span>{product.brand}</span>
                {product.categoryLabel && <span>• {product.categoryLabel}</span>}
              </div>

              {/* Product Title */}
              <Link href={`/products/${product.slug}`} className="block mt-0.5">
                <h3 className="font-extrabold text-xs leading-snug text-[#261816] line-clamp-2 hover:text-[#8b0000] transition-colors">
                  {product.title}
                </h3>
              </Link>
            </div>

            {/* Price & Discount Section */}
            <div>
              <div className="text-lg font-black text-[#8b0000] tracking-tight leading-none">
                {formatPrice(product.price)}
              </div>

              <div className="flex items-center flex-wrap gap-1 mt-1">
                {originalPriceNum > currentPriceNum && (
                  <span className="text-[10px] text-[#8e706b] line-through font-medium">
                    {formatPrice(originalPriceNum)}
                  </span>
                )}
                {savingsAmount && (
                  <span className="text-[10px] text-[#5a403c] font-medium">
                    (Save {formatPrice(savingsAmount)})
                  </span>
                )}
                {discountPercent && (
                  <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-[#ffe9e6] text-[#8b0000] border border-[#e3beb8]">
                    {discountPercent}% Off
                  </span>
                )}
              </div>

              {/* Availability Line */}
              <div className="mt-1.5 flex items-center gap-1 text-[10px] font-semibold">
                {isAnyVariantInStock ? (
                  <span className="text-emerald-700 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Available for Delivery
                  </span>
                ) : (
                  <span className="text-rose-700 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                    Out of Stock
                  </span>
                )}
              </div>
            </div>

            {/* Quick Add To Cart / View Button on Mobile */}
            <div className="pt-1 flex items-center gap-2">
              {isAnyVariantInStock ? (
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={isAdding}
                  className={`w-full py-1.5 px-3 rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-1 shadow-sm active:scale-95 cursor-pointer ${
                    cardError
                      ? "bg-amber-700 text-white"
                      : added
                      ? "bg-emerald-700 text-white"
                      : "bg-[#8b0000] hover:bg-[#bc0000] text-white"
                  }`}
                >
                  {isAdding ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>Adding...</span>
                    </>
                  ) : added ? (
                    <>
                      <Check className="w-3 h-3" />
                      <span>Added to Cart</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-3 h-3" />
                      <span>Add to Cart</span>
                    </>
                  )}
                </button>
              ) : (
                <Link
                  href={`/products/${product.slug}`}
                  className="w-full py-1.5 px-3 rounded-lg font-bold text-xs bg-[#F1F0EC] text-[#8e706b] text-center border border-[#D4D3CD] block"
                >
                  View Details
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Card for Shop Section */}
      {renderStandardCard(true)}
    </>
  );
}
