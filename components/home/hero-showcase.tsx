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
      image: "/images/hero-banner-1.jpg",
      alt: "Upgrade Your World With Smart Technology",
      ctaHref: "/shop",
    },
    {
      id: 2,
      image: "/images/hero-banner-2.jpg",
      alt: "Next Level Performance - Experience Power, Speed, and Innovation",
      ctaHref: "/shop?category=smartphones",
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
      {/* Full Screen Edge-to-Edge Hero Banner Carousel (No Borders) */}
      <div className="relative w-full h-[65vh] sm:h-[78vh] md:h-[86vh] lg:h-[92vh] overflow-hidden bg-black group">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="w-full h-full relative flex items-center justify-center bg-[#0d0d0d]"
          >
            <Link href={slide.ctaHref} className="block w-full h-full cursor-pointer relative flex items-center justify-center">
              {/* eslint-disable-next-img-element */}
              <img
                src={slide.image}
                alt={slide.alt}
                className="w-full h-full object-contain sm:object-cover object-center"
                loading="eager"
              />
              {/* Subtle Overlay Gradient for Optimal Header & Navigation Contrast */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/40 pointer-events-none" />
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
