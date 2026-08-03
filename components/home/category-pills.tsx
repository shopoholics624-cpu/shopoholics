"use client";

import { useRef, useState } from "react";
import { DemoLink as Link } from "@/components/demo/demo-link";
import { Smartphone, Laptop, Headphones, Watch, Layers, ShieldCheck, Zap, ChevronLeft, ChevronRight } from "lucide-react";

export function CategoryPills() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  const categories = [
    {
      id: "smartphones",
      name: "Smartphones",
      count: "12 Flagship Models",
      image: "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?q=80&w=800&auto=format&fit=crop",
      href: "/shop?category=smartphones",
    },
    {
      id: "laptops",
      name: "Laptops & Compute",
      count: "8 Pro Models",
      image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?q=80&w=800&auto=format&fit=crop",
      href: "/shop?category=laptops",
    },
    {
      id: "audio",
      name: "Studio Audio",
      count: "15 Acoustic Systems",
      image: "https://images.unsplash.com/photo-1545454675-3531b543be5d?q=80&w=800&auto=format&fit=crop",
      href: "/shop?category=audio",
    },
    {
      id: "wearables",
      name: "Watch Bands & GPS",
      count: "6 Titanium Models",
      image: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?q=80&w=800&auto=format&fit=crop",
      href: "/shop?category=wearables",
    },
    {
      id: "optics",
      name: "Optics & Cameras",
      count: "10 Medium Format",
      image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=800&auto=format&fit=crop",
      href: "/shop?category=optics",
    },
    {
      id: "smarthome",
      name: "Smart Home & IoT",
      count: "14 Encrypted Devices",
      image: "https://images.unsplash.com/photo-1558002038-1055907df827?q=80&w=800&auto=format&fit=crop",
      href: "/shop?category=smarthome",
    },
    {
      id: "accessories",
      name: "Desk Mats & Chargers",
      count: "20+ Tech Accessories",
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop",
      href: "/shop",
    },
  ];

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    const progress = (scrollLeft / (scrollWidth - clientWidth)) * 100;
    setScrollProgress(Math.min(100, Math.max(0, progress)));
  };

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = 320;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  return (
    <section className="py-12 bg-[#fff8f6] border-b border-[#e3beb8]/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#8b0000] block mb-1">
              Curated Collections
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#261816] tracking-tight">
              Our Products
            </h2>
            <p className="text-xs sm:text-sm text-[#5a403c] mt-1">
              Discover titanium smartphones, studio acoustic monitors, and smart ecosystem devices.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => scroll("left")}
              className="p-2.5 rounded-xl bg-white border border-[#e3beb8]/60 text-[#261816] hover:bg-[#ffe9e6] hover:text-[#8b0000] transition-colors shadow-sm min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scroll("right")}
              className="p-2.5 rounded-xl bg-[#8b0000] text-white hover:bg-[#bc0000] transition-colors shadow-md min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Coveritup Style Category Horizontal Scroll Slider */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex gap-5 overflow-x-auto pb-4 pt-2 scroll-smooth no-scrollbar"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={cat.href}
              className="w-[240px] sm:w-[280px] shrink-0 group relative h-[320px] rounded-3xl overflow-hidden border border-[#e3beb8]/60 shadow-lux hover:shadow-2xl transition-all duration-300 flex flex-col justify-end p-6 bg-white"
            >
              {/* Image Background */}
              {/* eslint-disable-next-img-element */}
              <img
                src={cat.image}
                alt={cat.name}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />

              {/* Gradient Vignette Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

              {/* Card Content Overlay */}
              <div className="relative z-10 space-y-1 text-white">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#ff907f] block">
                  {cat.count}
                </span>
                <h3 className="text-xl font-bold text-white group-hover:text-[#ff907f] transition-colors">
                  {cat.name}
                </h3>
              </div>
            </Link>
          ))}
        </div>

        {/* Coveritup Scroll Indicator Line */}
        <div className="w-full bg-[#ffe9e6] h-1.5 rounded-full overflow-hidden max-w-xs mx-auto">
          <div
            className="h-full bg-[#8b0000] rounded-full transition-all duration-150"
            style={{ width: `${Math.max(15, scrollProgress)}%` }}
          />
        </div>
      </div>
    </section>
  );
}
