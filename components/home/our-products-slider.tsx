"use client";

import { useRef, useState } from "react";
import { DemoLink as Link } from "@/components/demo/demo-link";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";

export function OurProductsSlider() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  const productCategories = [
    {
      id: "cat-1",
      title: "Titanium Smartphones",
      subtitle: "Apex Flagship Series",
      image: "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?q=80&w=800&auto=format&fit=crop",
      href: "/shop?category=smartphones",
      badge: "12 Models",
    },
    {
      id: "cat-2",
      title: "HyperBook Laptops",
      subtitle: "M4 Max Compute",
      image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?q=80&w=800&auto=format&fit=crop",
      href: "/shop?category=laptops",
      badge: "8 Models",
    },
    {
      id: "cat-3",
      title: "Studio Acoustics",
      subtitle: "AeroBuds & Spatial Audio",
      image: "https://images.unsplash.com/photo-1545454675-3531b543be5d?q=80&w=800&auto=format&fit=crop",
      href: "/shop?category=audio",
      badge: "15 Models",
    },
    {
      id: "cat-4",
      title: "Chronos Watch Bands",
      subtitle: "Grade 5 Titanium Straps",
      image: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?q=80&w=800&auto=format&fit=crop",
      href: "/shop?category=wearables",
      badge: "6 Models",
    },
    {
      id: "cat-5",
      title: "Medium Format Optics",
      subtitle: "8K Cinema Cameras",
      image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=800&auto=format&fit=crop",
      href: "/shop?category=optics",
      badge: "10 Models",
    },
    {
      id: "cat-6",
      title: "Smart Home Automation",
      subtitle: "Thread & Matter IoT",
      image: "https://images.unsplash.com/photo-1558002038-1055907df827?q=80&w=800&auto=format&fit=crop",
      href: "/shop?category=smarthome",
      badge: "14 Models",
    },
    {
      id: "cat-7",
      title: "Tactile Chargers & Mats",
      subtitle: "Wireless Power Dock",
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop",
      href: "/shop",
      badge: "20+ Accessories",
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
    const amount = 260;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  return (
    <section className="py-8 sm:py-10 bg-white border-b border-[#e3beb8]/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
        {/* Header & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8b0000] block mb-0.5">
              Shop-O-Holics Collection
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#261816] tracking-tight">
              Our Products
            </h2>
            <p className="text-xs text-[#5a403c] mt-0.5">
              Explore our handcrafted luxury hardware categories and precision engineering.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => scroll("left")}
              className="p-2 rounded-lg bg-[#fff8f6] border border-[#e3beb8]/60 text-[#261816] hover:bg-[#ffe9e6] hover:text-[#8b0000] transition-colors shadow-sm min-h-[38px] min-w-[38px] flex items-center justify-center"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll("right")}
              className="p-2 rounded-lg bg-[#8b0000] text-white hover:bg-[#bc0000] transition-colors shadow-md min-h-[38px] min-w-[38px] flex items-center justify-center"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Horizontal Scroll Track */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex gap-4 overflow-x-auto pb-3 pt-1 scroll-smooth no-scrollbar"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {productCategories.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="w-[200px] sm:w-[230px] shrink-0 group bg-[#fff8f6] rounded-2xl p-3 border border-[#e3beb8]/60 shadow-sm hover:shadow-lg hover:border-[#8b0000]/50 transition-all duration-300 flex flex-col justify-between"
            >
              <div className="relative w-full h-36 sm:h-40 bg-white rounded-xl p-2 border border-[#e3beb8]/30 overflow-hidden flex items-center justify-center">
                <span className="absolute top-2 left-2 px-2 py-0.5 bg-[#fff8f6] text-[#8b0000] text-[9px] font-bold uppercase tracking-wider rounded-full shadow-sm border border-[#e3beb8]/40 z-10">
                  {item.badge}
                </span>

                {/* eslint-disable-next-img-element */}
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              <div className="mt-3 mb-1 text-center space-y-0.5">
                <h3 className="font-extrabold text-xs sm:text-sm text-[#261816] group-hover:text-[#8b0000] transition-colors line-clamp-1">
                  {item.title}
                </h3>
                <p className="text-[11px] text-[#8e706b] font-medium">
                  {item.subtitle}
                </p>
              </div>

              <div className="pt-2 border-t border-[#ffe9e6] flex items-center justify-center">
                <span className="text-[11px] font-bold text-[#8b0000] group-hover:underline inline-flex items-center gap-1">
                  Shop Now <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* Progress Indicator */}
        <div className="w-full bg-[#ffe9e6] h-1 rounded-full overflow-hidden max-w-xs mx-auto">
          <div
            className="h-full bg-[#8b0000] rounded-full transition-all duration-150"
            style={{ width: `${Math.max(15, scrollProgress)}%` }}
          />
        </div>
      </div>
    </section>
  );
}
