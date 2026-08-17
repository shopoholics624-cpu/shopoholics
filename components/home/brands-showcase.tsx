"use client";

import { useState, useEffect } from "react";
import { DemoLink as Link } from "@/components/demo/demo-link";
import { ArrowUpRight } from "lucide-react";
import { WooBrand } from "@/types/woocommerce";

const BRAND_LOCAL_LOGOS: Record<string, string> = {
  apple: "https://cdn.simpleicons.org/apple/000000",
  adobe: "/images/brands/adobe.png",
  motorola: "/images/brands/motorola.png",
  neopack: "/images/brands/neopack.png",
  phonokart: "/images/brands/phonokart.png",
  canon: "/images/brands/canon.png",
  samsung: "/images/brands/samsung.png",
  qubo: "/images/brands/qubo.png",
  urbn: "/images/brands/urbn.png",
  tally: "/images/brands/tally.png",
  "tally-solutions": "/images/brands/tally.png",
  "tally solutions": "/images/brands/tally.png",
  gopro: "/images/brands/gopro.png",
  marshall: "/images/brands/marshall.png",
};

const FEATURED_BRANDS_FALLBACK = [
  {
    name: "Apple",
    tagline: "MacBook, iPhone & Studio Audio",
    href: "/shop?brand=apple",
    logo: "https://cdn.simpleicons.org/apple/000000",
  },
  {
    name: "Samsung",
    tagline: "Galaxy Flagships & Neo QLED",
    href: "/shop?brand=samsung",
    logo: "/images/brands/samsung.png",
  },
  {
    name: "GoPro",
    tagline: "Action Cameras & Adventure Optics",
    href: "/shop?brand=gopro",
    logo: "/images/brands/gopro.png",
  },
  {
    name: "Marshall",
    tagline: "Iconic Amplifiers & Studio Speakers",
    href: "/shop?brand=marshall",
    logo: "/images/brands/marshall.png",
  },
  {
    name: "Qubo",
    tagline: "Smart Security & IoT Solutions",
    href: "/shop?brand=qubo",
    logo: "/images/brands/qubo.png",
  },
  {
    name: "URBN",
    tagline: "Ultra-Fast Power Banks & Chargers",
    href: "/shop?brand=urbn",
    logo: "/images/brands/urbn.png",
  },
  {
    name: "Motorola",
    tagline: "Razr & Edge Ultra Flagships",
    href: "/shop?brand=motorola",
    logo: "/images/brands/motorola.png",
  },
  {
    name: "Neopack",
    tagline: "Laptop Sleeves, Bags & Gear",
    href: "/shop?brand=neopack",
    logo: "/images/brands/neopack.png",
  },
  {
    name: "Phonokart",
    tagline: "Premium Mobile Accessories",
    href: "/shop?brand=phonokart",
    logo: "/images/brands/phonokart.png",
  },
  {
    name: "Canon",
    tagline: "EOS Mirrorless & Optics",
    href: "/shop?brand=canon",
    logo: "/images/brands/canon.png",
  },
  {
    name: "Tally",
    tagline: "Business Accounting & Enterprise ERP",
    href: "/shop?brand=tally-solutions",
    logo: "/images/brands/tally.png",
  },
  {
    name: "Adobe",
    tagline: "Creative Cloud Solutions",
    href: "/shop?brand=adobe",
    logo: "/images/brands/adobe.png",
  },
];

export function BrandsShowcase() {
  const [brands, setBrands] = useState<{ name: string; tagline: string; href: string; logo: string }[]>(
    FEATURED_BRANDS_FALLBACK
  );

  useEffect(() => {
    let isMounted = true;
    async function fetchBrands() {
      try {
        const res = await fetch("/api/brands");
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.success && Array.isArray(data.brands) && data.brands.length > 0) {
            const mapped: { name: string; tagline: string; href: string; logo: string }[] = data.brands.map(
              (b: WooBrand) => {
                const slugKey = b.slug.toLowerCase();
                const localLogo = BRAND_LOCAL_LOGOS[slugKey];
                const displayName = b.slug.toLowerCase().includes("tally") ? "Tally" : b.name;
                return {
                  name: displayName,
                  tagline: b.description ? b.description.slice(0, 40) : "Official Manufacturer Hardware",
                  href: `/shop?brand=${encodeURIComponent(b.slug)}`,
                  logo: localLogo || b.image?.src || `https://cdn.simpleicons.org/${b.slug}/000000`,
                };
              }
            );

            // Ensure our uploaded featured brands are always present
            const existingNames = new Set(mapped.map((m) => m.name.toLowerCase()));
            FEATURED_BRANDS_FALLBACK.forEach((fb) => {
              if (!existingNames.has(fb.name.toLowerCase())) {
                mapped.push(fb);
              }
            });

            setBrands(mapped);
            return;
          }
        }
      } catch (err) {
        console.warn("[BrandsShowcase] WooCommerce fetch fallback active:", err);
      }
    }

    fetchBrands();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="py-4 sm:py-6 lg:py-8 bg-white">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-2">
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
              <div className="w-full h-14 flex items-center justify-center mb-2 px-2">
                {/* eslint-disable-next-img-element */}
                <img
                  src={b.logo}
                  alt={`${b.name} official logo`}
                  className="h-8 sm:h-9 max-w-[88%] object-contain group-hover:scale-110 transition-transform duration-300"
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
