"use client";

import { useState, useEffect } from "react";
import { DemoLink as Link } from "@/components/demo/demo-link";
import { ArrowUpRight } from "lucide-react";
import { WooBrand } from "@/types/woocommerce";

export function BrandsShowcase() {
  const [brands, setBrands] = useState<{ name: string; tagline: string; href: string; logo?: string }[]>([]);

  useEffect(() => {
    let isMounted = true;
    async function fetchBrands() {
      try {
        const res = await fetch("/api/brands");
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.success && Array.isArray(data.brands) && data.brands.length > 0) {
            const mapped = data.brands.map((b: WooBrand) => ({
              name: b.name,
              tagline: b.description ? b.description.slice(0, 40) : "Official Manufacturer Hardware",
              href: `/shop?brand=${encodeURIComponent(b.slug)}`,
              logo: b.image?.src || `https://cdn.simpleicons.org/${b.slug}/000000`,
            }));
            setBrands(mapped);
            return;
          }
        }
      } catch (err) {
        console.warn("[BrandsShowcase] WooCommerce fetch fallback:", err);
      }
    }

    fetchBrands();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="py-4 sm:py-6 lg:py-8 bg-white border-b border-[#e3beb8]/30">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-[#e3beb8]/40 pb-5">
          <div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#261816] tracking-tight">
              Shop By Brand
            </h2>
            <p className="text-sm sm:text-base text-[#5a403c] mt-1.5 font-medium">
              Explore 100% genuine products directly backed by official manufacturer warranties.
            </p>
          </div>

          <Link
            href="/shop"
            className="inline-flex items-center gap-1 text-xs font-bold text-[#8b0000] hover:underline min-h-[40px]"
          >
            <span>View All 30+ Brands</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Brand Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {brands.map((b) => (
            <Link
              key={b.name}
              href={b.href}
              className="group relative z-0 hover:z-20 bg-[#F8F8F6] hover:bg-white rounded-2xl p-4 border border-[#E5E4DF] shadow-sm hover:shadow-xl hover:border-[#8b0000]/40 hover:-translate-y-1 transition-all duration-300 flex flex-col items-center justify-center text-center"
            >
              <div className="w-full h-10 flex items-center justify-center mb-2">
                <img
                  src={b.logo}
                  alt={`${b.name} official logo`}
                  className="max-h-7 max-w-[85%] object-contain group-hover:scale-110 transition-transform duration-300"
                  loading="lazy"
                />
              </div>

              <h3 className="font-extrabold text-xs text-[#1C1C1A] group-hover:text-[#8b0000] transition-colors">
                {b.name}
              </h3>
              <p className="text-[10px] text-[#5A5954] line-clamp-1 font-medium mt-0.5">
                {b.tagline}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
