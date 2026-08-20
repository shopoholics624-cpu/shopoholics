"use client";

import { useState, useEffect } from "react";
import { HeroShowcase } from "@/components/home/hero-showcase";
import { OurProductsSlider } from "@/components/home/our-products-slider";
import { BrandsShowcase } from "@/components/home/brands-showcase";
import { BentoShowcase } from "@/components/home/bento-showcase";
import { PromoDealsShowcase } from "@/components/home/promo-deals-showcase";
import { ProductGrid } from "@/components/common/product-grid";
import { Product } from "@/types/product";
import { DemoLink as Link } from "@/components/demo/demo-link";
import { ArrowRight, ShoppingBag, AlertCircle } from "lucide-react";

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchHomeProducts() {
      try {
        setIsLoading(true);
        setFetchError(null);
        const res = await fetch("/api/products?per_page=12");
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            if (data.success && Array.isArray(data.products) && data.products.length > 0) {
              setProducts(data.products);
            } else {
              setProducts([]);
            }
          }
        } else {
          if (isMounted) {
            setFetchError("Unable to load flagship products at this moment.");
          }
        }
      } catch (err) {
        console.warn("[HomePage] WooCommerce fetch error:", err);
        if (isMounted) {
          setFetchError("Unable to connect to product catalog.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }
    fetchHomeProducts();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="space-y-0 pb-8 bg-white">
      {/* 1. Hero Section */}
      <HeroShowcase />

      {/* 2. Our Products */}
      <OurProductsSlider />

      {/* 3. Shop By Brand */}
      <BrandsShowcase />

      {/* 4. Best Sellers & Trending Deals */}
      <BentoShowcase />

      {/* 5. Promotional Offers & Bank Deals */}
      <PromoDealsShowcase />

      {/* 6. Flagship Devices & Audio */}
      <section className="py-4 sm:py-6 lg:py-8 bg-white">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-2">
            <div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#1C1C1A] tracking-tight">
                Flagship Devices & Audio
              </h2>
              <p className="text-sm sm:text-base text-[#5A5954] mt-1.5 font-medium">
                Every device features grade 5 titanium construction and custom acoustic engineering.
              </p>
            </div>

            <Link
              href="/shop"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#8b0000] hover:text-[#bc0000] transition-colors min-h-[40px] flex items-center"
            >
              <span>Explore All Products</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Product Grid / Loading Skeleton / Empty & Error State */}
          {fetchError && !isLoading && products.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 sm:p-14 text-center border border-[#e3beb8]/60 shadow-sm space-y-4 max-w-md mx-auto">
              <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center mx-auto text-rose-600">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-extrabold text-base text-[#261816]">Unable to Load Products</h3>
                <p className="text-xs text-[#5a403c]">{fetchError}</p>
              </div>
              <Link
                href="/shop"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#8b0000] hover:bg-[#bc0000] text-white text-xs font-bold transition-all shadow-sm"
              >
                <span>Explore Shop</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <ProductGrid
              products={products}
              isLoading={isLoading}
              skeletonCount={8}
              emptyState={
                <div className="bg-white rounded-3xl p-10 sm:p-14 text-center border border-[#e3beb8]/60 shadow-sm space-y-4 max-w-md mx-auto">
                  <div className="w-12 h-12 rounded-full bg-[#ffe9e6] flex items-center justify-center mx-auto text-[#8b0000]">
                    <ShoppingBag className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-extrabold text-base text-[#261816]">No Products Available</h3>
                    <p className="text-xs text-[#5a403c]">
                      Please check back soon or browse our full store.
                    </p>
                  </div>
                  <Link
                    href="/shop"
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#8b0000] hover:bg-[#bc0000] text-white text-xs font-bold transition-all shadow-sm"
                  >
                    <span>Browse All Products</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              }
            />
          )}
        </div>
      </section>
    </div>
  );
}
