"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { DemoLink as Link } from "@/components/demo/demo-link";
import { ArrowRight } from "lucide-react";

export function OurProductsSlider() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isInteracting, setIsInteracting] = useState(false);

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

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    const maxScroll = scrollWidth - clientWidth;
    const progress = maxScroll > 0 ? (scrollLeft / maxScroll) * 100 : 0;
    setScrollProgress(Math.min(100, Math.max(0, progress)));
  }, []);

  // Ensure slider starts at left position 0 on mount
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = 0;
    }
    handleScroll();
  }, [handleScroll]);

  // Fluid smooth auto-scrolling that respects touch & mouse interactions
  useEffect(() => {
    if (isInteracting) return;

    let animationFrameId: number;
    let lastTime = performance.now();

    const animateScroll = (time: number) => {
      const delta = time - lastTime;
      if (delta > 30) {
        lastTime = time;
        if (scrollRef.current) {
          const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
          const maxScroll = scrollWidth - clientWidth;

          if (scrollLeft >= maxScroll - 2) {
            // Stop auto-scroll when reaching the end of the track
            return;
          } else {
            scrollRef.current.scrollLeft += 1;
          }
          handleScroll();
        }
      }
      animationFrameId = requestAnimationFrame(animateScroll);
    };

    animationFrameId = requestAnimationFrame(animateScroll);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isInteracting, handleScroll]);

  return (
    <section className="py-4 sm:py-6 lg:py-8 bg-white border-b border-[#e3beb8]/30">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-[#e3beb8]/40 pb-5">
          <div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#261816] tracking-tight">
              Our Products
            </h2>
            <p className="text-sm sm:text-base text-[#5a403c] mt-1.5 font-medium">
              Explore our handcrafted luxury hardware categories and precision engineering.
            </p>
          </div>
        </div>

        {/* Horizontal Touch Momentum Scroll Track with Border Feathering */}
        <div className="relative group/track">
          {/* Left Border Feathering Fade */}
          <div className="absolute left-0 top-0 bottom-4 w-8 sm:w-16 bg-gradient-to-r from-white via-white/80 to-transparent z-10 pointer-events-none" />

          {/* Right Border Feathering Fade */}
          <div className="absolute right-0 top-0 bottom-4 w-8 sm:w-16 bg-gradient-to-l from-white via-white/80 to-transparent z-10 pointer-events-none" />

          <div
            ref={scrollRef}
            onScroll={handleScroll}
            onMouseEnter={() => setIsInteracting(true)}
            onMouseLeave={() => setIsInteracting(false)}
            onTouchStart={() => setIsInteracting(true)}
            onTouchEnd={() => setIsInteracting(false)}
            onTouchCancel={() => setIsInteracting(false)}
            className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 pt-2 no-scrollbar touch-pan-x overscroll-x-contain"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              WebkitOverflowScrolling: "touch",
              maskImage: "linear-gradient(to right, transparent, black 3%, black 97%, transparent)",
              WebkitMaskImage: "linear-gradient(to right, transparent, black 3%, black 97%, transparent)",
            }}
          >
          {productCategories.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="w-[180px] sm:w-[230px] shrink-0 group relative z-0 hover:z-20 bg-[#F1F0EC] hover:bg-[#E6E5DF] rounded-2xl p-3 border border-[#D4D3CD] shadow-sm hover:shadow-xl hover:border-[#4A4944] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
            >
              <div className="relative w-full h-32 sm:h-40 bg-white rounded-xl p-2 border border-[#D4D3CD]/60 overflow-hidden flex items-center justify-center">
                <span className="absolute top-2 left-2 px-2 py-0.5 bg-white text-[#1C1C1A] text-[8px] sm:text-[9px] font-bold uppercase tracking-wider rounded-full shadow-sm border border-[#D4D3CD] z-10">
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
                <h3 className="font-extrabold text-xs sm:text-sm text-[#1C1C1A] group-hover:text-[#8b0000] transition-colors line-clamp-1">
                  {item.title}
                </h3>
                <p className="text-[10px] sm:text-[11px] text-[#5A5954] font-medium line-clamp-1">
                  {item.subtitle}
                </p>
              </div>

              <div className="pt-2 border-t border-[#D4D3CD]/50 flex items-center justify-center">
                <span className="text-[10px] sm:text-[11px] font-bold text-[#8b0000] group-hover:underline inline-flex items-center gap-1">
                  Shop Now <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>
            </Link>
          ))}
        </div>
        </div>

        {/* Progress Indicator */}
        <div className="w-full bg-[#D4D3CD]/50 h-1.5 rounded-full overflow-hidden max-w-xs mx-auto">
          <div
            className="h-full bg-[#3D3C38] rounded-full transition-all duration-150 shadow-sm"
            style={{ width: `${Math.max(15, scrollProgress)}%` }}
          />
        </div>
      </div>
    </section>
  );
}
