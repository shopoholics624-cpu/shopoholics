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

    if (isDemoMode) {
      handleDemoAction(e);
      return;
    }

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
      whileHover={{ y: -8, scale: 1.015 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="group relative bg-white rounded-3xl p-5 border border-[#e3beb8]/60 shadow-lux hover:shadow-2xl hover:border-[#8b0000]/40 flex flex-col justify-between overflow-hidden"
    >
      {/* Top Badge & Action Icons */}
      <div>
        <div className="flex items-center justify-between z-10 relative mb-3">
          {product.badge ? (
            <span className="px-3 py-1 bg-[#ffe9e6] text-[#8b0000] text-[11px] font-bold tracking-wider uppercase rounded-full flex items-center gap-1 border border-[#e3beb8]">
              <Sparkles className="w-3 h-3 text-[#e51c10]" /> {product.badge}
            </span>
          ) : (
            <span className="text-[11px] font-semibold text-[#8e706b] uppercase tracking-wider">
              {product.categoryLabel}
            </span>
          )}

          <button
            onClick={handleToggleCompare}
            title={inCompare ? "Remove from Compare" : "Compare Device"}
            className={`p-2 rounded-full transition-all ${
              inCompare
                ? "bg-[#8b0000] text-white"
                : "bg-[#fff8f6] text-[#5a403c] hover:bg-[#ffe9e6] hover:text-[#8b0000]"
            }`}
          >
            <ArrowLeftRight className="w-4 h-4" />
          </button>
        </div>

        {/* Product Image Link */}
        <Link href={`/products/${product.slug}`} className="block my-2 overflow-hidden rounded-2xl bg-[#fff8f6]">
          {/* eslint-disable-next-img-element */}
          <img
            src={product.featuredImage}
            alt={product.title}
            className="w-full h-56 object-cover object-center group-hover:scale-105 transition-transform duration-500 rounded-2xl"
          />
        </Link>

        {/* Title & Specs summary */}
        <div className="mt-4 space-y-1.5">
          <RatingStars rating={product.rating} reviewCount={product.reviewCount} />
          <Link href={`/products/${product.slug}`}>
            <h3 className="font-bold text-lg text-[#261816] group-hover:text-[#8b0000] transition-colors leading-tight line-clamp-1">
              {product.title}
            </h3>
          </Link>
          <p className="text-xs text-[#5a403c] line-clamp-2 leading-relaxed">
            {product.tagline}
          </p>
        </div>
      </div>

      {/* Pricing & Add to Cart Footer */}
      <div className="mt-6 pt-4 border-t border-[#ffe9e6] flex items-center justify-between">
        <div className="flex flex-col">
          <div className="flex items-baseline gap-2">
            <span className="font-bold text-xl text-[#8b0000]">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-xs text-[#8e706b] line-through font-medium">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>
          <span className="text-[10px] text-[#5a403c] font-medium">Free express courier</span>
        </div>

        <button
          onClick={handleAddToCart}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs transition-all shadow-md active:scale-95 ${
            added
              ? "bg-emerald-700 text-white"
              : "bg-[#8b0000] hover:bg-[#bc0000] text-white"
          }`}
        >
          {added ? (
            <>
              <Check className="w-4 h-4" /> Added
            </>
          ) : (
            <>
              <ShoppingBag className="w-4 h-4" /> Add
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
}
