"use client";

import { motion } from "framer-motion";
import { Product } from "@/types/product";
import { ProductCard } from "./product-card";

interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
  skeletonCount?: number;
  emptyState?: React.ReactNode;
}

export function ProductGrid({
  products,
  isLoading = false,
  skeletonCount = 8,
  emptyState,
}: ProductGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <div
            key={`product-skeleton-${i}`}
            className="bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-4 border border-[#e5e4de] shadow-2xs animate-pulse flex flex-col justify-between space-y-3"
          >
            <div className="space-y-3">
              {/* Image Shimmer */}
              <div className="aspect-square sm:aspect-4/3 bg-[#f5f4f0] rounded-xl sm:rounded-2xl w-full" />

              {/* Meta & Title */}
              <div className="space-y-2 pt-1">
                <div className="h-3 w-16 bg-[#ebeae5] rounded-full" />
                <div className="h-4 w-5/6 bg-[#ebeae5] rounded" />
                <div className="h-3 w-2/5 bg-[#f0efe9] rounded" />
              </div>
            </div>

            {/* Price & Action Shimmer */}
            <div className="pt-3 border-t border-[#f1f0eb] space-y-2.5">
              <div className="h-5 w-24 bg-[#ebeae5] rounded" />
              <div className="h-9 w-full bg-[#f0efe9] rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!products || products.length === 0) {
    if (emptyState) return <>{emptyState}</>;
    return null;
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.08,
          },
        },
      }}
      className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6"
    >
      {products.map((product) => (
        <motion.div
          key={product.id}
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
          }}
        >
          <ProductCard product={product} />
        </motion.div>
      ))}
    </motion.div>
  );
}
