"use client";

import { motion } from "framer-motion";
import { DemoLink as Link } from "@/components/demo/demo-link";
import { ShoppingBag, ArrowLeftRight, Check, Sparkles } from "lucide-react";
import { Product } from "@/types/product";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/hooks/use-cart";
import { useCompare } from "@/hooks/use-compare";
import { useDemo } from "@/hooks/use-demo";
import { RatingStars } from "./rating-stars";
import { useState } from "react";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { addToCompare, isInCompare, removeFromCompare } = useCompare();
  const { isDemoMode, handleDemoAction } = useDemo();
  const [added, setAdded] = useState(false);

  const inCompare = isInCompare(product.id);
  const defaultVariant = product.variants[0];

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    addToCart(product, defaultVariant);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
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

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      className="group relative bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-4 border border-[#e3beb8]/60 shadow-sm hover:shadow-lg hover:border-[#8b0000]/40 flex flex-col justify-between overflow-hidden h-full"
    >
      {/* Top Badge & Action Icons */}
      <div>
        <div className="flex items-center justify-between z-10 relative mb-1.5 sm:mb-2">
          {product.badge ? (
            <span className="px-2 py-0.5 sm:px-2.5 sm:py-0.5 bg-[#ffe9e6] text-[#8b0000] text-[9px] sm:text-[10px] font-bold tracking-wider uppercase rounded-full flex items-center gap-1 border border-[#e3beb8]">
              <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#e51c10]" /> {product.badge}
            </span>
          ) : (
            <span className="text-[9px] sm:text-[10px] font-semibold text-[#8e706b] uppercase tracking-wider truncate max-w-[90px]">
              {product.categoryLabel}
            </span>
          )}

          <button
            onClick={handleToggleCompare}
            title={inCompare ? "Remove from Compare" : "Compare Device"}
            className={`p-1.5 rounded-full transition-all ${
              inCompare
                ? "bg-[#8b0000] text-white"
                : "bg-white text-[#5a403c] hover:bg-[#ffe9e6] hover:text-[#8b0000]"
            }`}
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
          </button>
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
          <RatingStars rating={product.rating} reviewCount={product.reviewCount} size={10} />
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
            {product.originalPrice && (
              <span className="text-[9px] sm:text-[10px] text-[#8e706b] line-through font-medium hidden sm:inline">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>
          <span className="text-[9px] text-[#5a403c] font-medium hidden sm:block">Free delivery</span>
        </div>

        <button
          onClick={handleAddToCart}
          className={`w-full sm:w-auto flex items-center justify-center gap-1 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl font-semibold text-xs transition-all shadow-sm active:scale-95 min-h-[34px] sm:min-h-[38px] ${
            added
              ? "bg-emerald-700 text-white"
              : "bg-[#8b0000] hover:bg-[#bc0000] text-white"
          }`}
        >
          {added ? (
            <>
              <Check className="w-3.5 h-3.5" /> <span className="text-[10px] sm:text-xs">Added</span>
            </>
          ) : (
            <>
              <ShoppingBag className="w-3.5 h-3.5" /> <span className="text-[10px] sm:text-xs">Add</span>
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
}
