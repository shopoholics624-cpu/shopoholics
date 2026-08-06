"use client";

import { DemoLink as Link } from "@/components/demo/demo-link";
import { ArrowUpRight, Award } from "lucide-react";

export function BrandsShowcase() {
  const brands = [
    { name: "Apple", tagline: "iPhone, Mac & Watch", href: "/shop?brand=Apple", logo: "🍎" },
    { name: "Samsung", tagline: "Galaxy & QLED TVs", href: "/shop?brand=Samsung", logo: "🌌" },
    { name: "Sony", tagline: "PlayStation & Alpha Optics", href: "/shop?brand=Sony", logo: "🎮" },
    { name: "ASUS", tagline: "ROG Gaming & ZenBooks", href: "/shop?brand=ASUS", logo: "⚡" },
    { name: "Canon", tagline: "EOS Cinema Optics", href: "/shop?brand=Canon", logo: "📸" },
    { name: "Dell", tagline: "XPS & Alienware Rigs", href: "/shop?brand=Dell", logo: "💻" },
    { name: "Logitech", tagline: "MX Master & G PRO", href: "/shop?brand=Logitech", logo: "🖱️" },
    { name: "Razer", tagline: "Chroma RGB & Blade", href: "/shop?brand=Razer", logo: "🐍" },
    { name: "DJI", tagline: "Mavic Drones & Osmo", href: "/shop?brand=DJI", logo: "🚁" },
    { name: "JBL", tagline: "Authentics & Soundbars", href: "/shop?brand=JBL", logo: "🔊" },
    { name: "Marshall", tagline: "Stanmore Acoustics", href: "/shop?brand=Marshall", logo: "🎸" },
    { name: "GoPro", tagline: "HERO Action Cameras", href: "/shop?brand=GoPro", logo: "📹" },
  ];

  return (
    <section className="py-8 sm:py-10 bg-white border-b border-[#e3beb8]/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-[#e3beb8]/40 pb-4">
          <div>
            <span className="inline-flex items-center gap-1.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#8b0000] mb-0.5">
              <Award className="w-3.5 h-3.5" /> Authorized Brand Partners
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#261816] tracking-tight">
              Shop By Brand
            </h2>
            <p className="text-xs text-[#5a403c] mt-0.5">
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
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {brands.map((b) => (
            <Link
              key={b.name}
              href={b.href}
              className="group bg-[#F1F0EC] hover:bg-[#E6E5DF] rounded-2xl p-3.5 border border-[#D4D3CD] shadow-sm hover:shadow-xl hover:border-[#4A4944] hover:-translate-y-1 transition-all duration-300 flex flex-col items-center justify-center text-center space-y-1"
            >
              <span className="text-2xl group-hover:scale-110 transition-transform duration-300">
                {b.logo}
              </span>
              <h3 className="font-extrabold text-xs text-[#1C1C1A] group-hover:text-[#8b0000] transition-colors">
                {b.name}
              </h3>
              <p className="text-[10px] text-[#5A5954] line-clamp-1 font-medium">
                {b.tagline}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
