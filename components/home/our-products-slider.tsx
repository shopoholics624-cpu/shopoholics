"use client";

import { useRef, useState, useEffect } from "react";
import { DemoLink as Link } from "@/components/demo/demo-link";
import { ArrowRight, Sparkles } from "lucide-react";

export function OurProductsSlider() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

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
    const maxScroll = scrollWidth - clientWidth;
    const progress = maxScroll > 0 ? (scrollLeft / maxScroll) * 100 : 0;
    setScrollProgress(Math.min(100, Math.max(0, progress)));
  };

  // Continuous auto smooth scrolling interval
  useEffect(() => {
    if (isHovered) return;

    const interval = setInterval(() => {
      if (!scrollRef.current) return;
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      const maxScroll = scrollWidth - clientWidth;

      if (scrollLeft >= maxScroll - 5) {
        // Loop smoothly back to start
        scrollRef.current.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        scrollRef.current.scrollBy({ left: 1.5, behavior: "auto" });
      }
      handleScroll();
    }, 30);

    return () => clearInterval(interval);
  }, [isHovered]);

  return (
    <section className="py-6 sm:py-10 bg-white border-b border-[#e3beb8]/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
        {/* Header (No Side Buttons) */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-[#e3beb8]/40 pb-3">
          <div>
            <span className="inline-flex items-center gap-1.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#8b0000] mb-0.5">
              <Sparkles className="w-3.5 h-3.5 text-[#e51c10]" /> Shop-O-Holics Collection
            </span>
            <h2 className="text-xl sm:text-3xl font-extrabold text-[#261816] tracking-tight">
              Our Products
            </h2>
            <p className="text-xs text-[#5a403c] mt-0.5">
              Explore our handcrafted luxury hardware categories and precision engineering.
            </p>
          </div>
        </div>

        {/* Horizontal Scroll Track with Auto Scroll & Hover Pause */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="flex gap-3 sm:gap-4 overflow-x-auto pb-3 pt-1 scroll-smooth no-scrollbar"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {productCategories.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="w-[180px] sm:w-[230px] shrink-0 group bg-[#fff8f6] rounded-2xl p-3 border border-[#e3beb8]/60 shadow-sm hover:shadow-lg hover:border-[#8b0000]/50 transition-all duration-300 flex flex-col justify-between"
            >
              <div className="relative w-full h-32 sm:h-40 bg-white rounded-xl p-2 border border-[#e3beb8]/30 overflow-hidden flex items-center justify-center">
                <span className="absolute top-2 left-2 px-2 py-0.5 bg-[#fff8f6] text-[#8b0000] text-[8px] sm:text-[9px] font-bold uppercase tracking-wider rounded-full shadow-sm border border-[#e3beb8]/40 z-10">
                  {item.badge}
                </span>

                {/* eslint-disable-next-img-element */}
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              <div className="mt-2.5 mb-1 text-center space-y-0.5">
                <h3 className="font-extrabold text-xs sm:text-sm text-[#261816] group-hover:text-[#8b0000] transition-colors line-clamp-1">
                  {item.title}
                </h3>
                <p className="text-[10px] sm:text-[11px] text-[#8e706b] font-medium line-clamp-1">
                  {item.subtitle}
                </p>
              </div>

              <div className="pt-2 border-t border-[#ffe9e6] flex items-center justify-center">
                <span className="text-[10px] sm:text-[11px] font-bold text-[#8b0000] group-hover:underline inline-flex items-center gap-1">
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
