"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DemoLink as Link } from "@/components/demo/demo-link";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function HeroShowcase() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?q=80&w=2000&auto=format&fit=crop",
      alt: "Apex Smartphone Pro Titanium",
      ctaHref: "/products/flagship-smartphone-pro",
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?q=80&w=2000&auto=format&fit=crop",
      alt: "HyperBook Ultra 16 M4 Compute",
      ctaHref: "/shop?category=laptops",
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1545454675-3531b543be5d?q=80&w=2000&auto=format&fit=crop",
      alt: "AeroBuds Studio Max Acoustics",
      ctaHref: "/shop?category=audio",
    },
  ];

  // Auto-play slideshow every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const slide = slides[currentSlide];

  return (
    <section className="relative overflow-hidden bg-white w-full">
      {/* Top Animated Marquee Bar */}
      <div className="bg-gradient-to-r from-[#610000] via-[#8b0000] to-[#e51c10] text-white py-2 px-3 text-[11px] sm:text-xs font-bold uppercase tracking-wider overflow-hidden shadow-sm">
        <div className="flex items-center justify-around whitespace-nowrap animate-marquee">
          <span className="flex items-center gap-1.5">
            🔥 Exclusive Launch Offer: Buy Any Flagship Device, Get 50% Off Accessories
          </span>
          <span className="mx-4 text-white/50">•</span>
          <span className="flex items-center gap-1.5">
            ⚡ Free Insured Express Courier Shipping Worldwide
          </span>
          <span className="mx-4 text-white/50">•</span>
          <span className="flex items-center gap-1.5">
            🛡️ Complimentary 2-Year Official Hardware Protection
          </span>
        </div>
      </div>

      {/* Full Screen Edge-to-Edge Hero Banner Carousel (No Borders) */}
      <div className="relative w-full h-[55vh] sm:h-[70vh] md:h-[80vh] lg:h-[85vh] overflow-hidden bg-black group">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0, scale: 1.03 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="w-full h-full"
          >
            <Link href={slide.ctaHref} className="block w-full h-full cursor-pointer relative">
              {/* eslint-disable-next-img-element */}
              <img
                src={slide.image}
                alt={slide.alt}
                className="w-full h-full object-cover object-center transition-transform duration-1000 group-hover:scale-105"
                loading="eager"
              />
            </Link>
          </motion.div>
        </AnimatePresence>

        {/* Left Glassmorphism Slider Button */}
        <button
          onClick={prevSlide}
          className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-white/25 hover:bg-[#8b0000] border border-white/40 text-white shadow-2xl backdrop-blur-md flex items-center justify-center transition-all hover:scale-110 active:scale-95 z-30"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-6 h-6 sm:w-7 sm:h-7" />
        </button>

        {/* Right Glassmorphism Slider Button */}
        <button
          onClick={nextSlide}
          className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-white/25 hover:bg-[#8b0000] border border-white/40 text-white shadow-2xl backdrop-blur-md flex items-center justify-center transition-all hover:scale-110 active:scale-95 z-30"
          aria-label="Next slide"
        >
          <ChevronRight className="w-6 h-6 sm:w-7 sm:h-7" />
        </button>

        {/* Bottom Glassmorphism Pagination Dots */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2.5 z-30 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 shadow-2xl">
          {slides.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => setCurrentSlide(idx)}
              className={`transition-all duration-300 ${
                currentSlide === idx
                  ? "w-7 h-2.5 bg-[#8b0000] rounded-full shadow-md"
                  : "w-2.5 h-2.5 bg-white/60 hover:bg-white rounded-full"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
