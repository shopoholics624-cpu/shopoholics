"use client";

import { useState, useEffect } from "react";
import { Sparkles } from "lucide-react";
import { Product } from "@/types/product";
import { ProductCard } from "@/components/common/product-card";

interface RecommendedProductsProps {
  currentProduct: Product;
}

export function RecommendedProducts({ currentProduct }: RecommendedProductsProps) {
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchRecommendations() {
      if (!currentProduct) {
        setLoading(false);
        return;
      }

      const catParam =
        currentProduct.primaryCategory?.slug ||
        currentProduct.categorySlugs?.[0] ||
        currentProduct.category ||
        "";

      try {
        const res = await fetch(
          `/api/products/recommendations?productId=${encodeURIComponent(
            currentProduct.id
          )}&category=${encodeURIComponent(catParam)}`
        );

        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.success && Array.isArray(data.products)) {
            // Guarantee current product is excluded
            const cleanRecs = data.products.filter(
              (p: Product) =>
                String(p.id) !== String(currentProduct.id) &&
                p.slug.toLowerCase() !== currentProduct.slug.toLowerCase()
            );
            setRecommendations(cleanRecs);
          }
        }
      } catch (err) {
        console.warn("[RecommendedProducts] Failed to load recommendations:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchRecommendations();
    return () => {
      isMounted = false;
    };
  }, [currentProduct?.id]);

  if (loading) {
    return null;
  }

  if (!recommendations || recommendations.length === 0) {
    return null;
  }

  return (
    <section className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-[#e3beb8]/60 shadow-lux space-y-6">
      <div className="border-b border-[#e3beb8]/40 pb-4">
        <h3 className="text-xl sm:text-2xl font-black text-[#261816] tracking-tight flex items-center gap-2.5">
          <Sparkles className="w-6 h-6 text-[#8b0000]" /> Recommended For You
        </h3>
        <p className="text-xs text-[#5a403c] mt-0.5">
          Handpicked flagship hardware from the same collection
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {recommendations.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
