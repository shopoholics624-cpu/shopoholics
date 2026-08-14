"use client";

import { use, useState, useEffect } from "react";
import { PRODUCTS } from "@/constants/products";
import { Product } from "@/types/product";
import { ProductCard } from "@/components/common/product-card";
import Link from "next/link";
import { Smartphone, ArrowLeft, Shield, Loader2 } from "lucide-react";

export default function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const resolvedParams = use(params);
  const categoryKey = resolvedParams.category;

  const fallbackCategoryProducts = PRODUCTS.filter(
    (p) => p.category.toLowerCase() === categoryKey.toLowerCase()
  );

  const [categoryProducts, setCategoryProducts] = useState<Product[]>(fallbackCategoryProducts);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function fetchCategoryProducts() {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/products?category=${encodeURIComponent(categoryKey)}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.success && Array.isArray(data.products)) {
            setCategoryProducts(data.products);
            setIsLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn("[CategoryPage] WooCommerce fetch fallback active:", err);
      }

      if (isMounted) {
        setCategoryProducts([]);
        setIsLoading(false);
      }
    }

    fetchCategoryProducts();
    return () => {
      isMounted = false;
    };
  }, [categoryKey]);

  const categoryTitle =
    categoryKey.charAt(0).toUpperCase() + categoryKey.slice(1);

  return (
    <div className="py-10 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Breadcrumb Back */}
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 text-xs font-bold text-[#8b0000] hover:underline"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Full Catalog
        </Link>

        {/* Category Hero */}
        <div className="bg-gradient-to-r from-[#610000] to-[#8b0000] text-white p-8 sm:p-12 rounded-3xl shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl">
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              {categoryTitle} Flagships
            </h1>
            <p className="text-sm text-[#e3beb8] leading-relaxed">
              Explore our titanium-crafted lineup of {categoryTitle.toLowerCase()}. Engineered for extreme battery longevity, thermal dissipation, and pro performance.
            </p>
          </div>

          <div className="w-24 h-24 rounded-3xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white shrink-0 border border-white/20">
            <Smartphone className="w-12 h-12" />
          </div>
        </div>

        {/* Products Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-[#261816]">
              Available Devices ({categoryProducts.length})
            </h2>
            <div className="flex items-center gap-2 text-xs font-medium text-[#5a403c]">
              <Shield className="w-4 h-4 text-[#8b0000]" /> 2-Year VIP Warranty Standard
            </div>
          </div>

          {isLoading ? (
            <div className="py-16 flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-8 h-8 text-[#8b0000] animate-spin" />
              <p className="text-xs text-[#5a403c] font-medium">Fetching category devices...</p>
            </div>
          ) : categoryProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {categoryProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center border border-[#e3beb8]">
              <p className="text-sm text-[#5a403c]">
                No devices found in category &quot;{categoryTitle}&quot;.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
