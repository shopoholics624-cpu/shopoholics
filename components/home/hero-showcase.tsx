"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DemoLink as Link } from "@/components/demo/demo-link";
import { HeroSlide } from "@/types/homepage";
import { DEFAULT_HERO_SLIDES } from "@/constants/homepage";

function getSlideHref(slide: HeroSlide): string | null {
  if (slide.redirectType === "none") return null;
  if (slide.redirectType === "product") return `/products/${slide.redirectValue || ""}`;
  if (slide.redirectType === "category") return `/shop?category=${slide.redirectValue || ""}`;
  if (slide.redirectType === "shop") return "/shop";
  if (slide.redirectType === "custom") return slide.redirectValue || "/shop";
  return "/shop";
}

export function HeroShowcase() {
  const [slides, setSlides] = useState<HeroSlide[]>(DEFAULT_HERO_SLIDES);
  const [currentSlide, setCurrentSlide] = useState(0);
  const touchStartXRef = useRef(0);
  const touchEndXRef = useRef(0);

  // Fetch dynamic hero slides from API (always fresh on every page load / refresh)
  useEffect(() => {
    let isMounted = true;
    async function fetchHeroSlides() {
      try {
        const res = await fetch(`/api/homepage/hero?_t=${Date.now()}`, {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
          },
        });
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.success && Array.isArray(data.slides) && data.slides.length > 0) {
            setSlides(data.slides);
          }
        }
      } catch (err) {
        console.warn("[HeroShowcase] API fetch fallback active:", err);
      }
    }
    fetchHeroSlides();
    return () => {
      isMounted = false;
    };
  }, []);

  const nextSlide = useCallback(() => {
    if (slides.length <= 1) return;
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    if (slides.length <= 1) return;
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  // Auto-play slideshow every 7 seconds
  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(() => {
      nextSlide();
    }, 7000);
    return () => clearInterval(interval);
  }, [nextSlide, slides.length]);

  // Mobile Touch Swipe Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndXRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartXRef.current || !touchEndXRef.current) return;
    const distance = touchStartXRef.current - touchEndXRef.current;
    const minSwipeDistance = 40;

    if (distance > minSwipeDistance) {
      nextSlide();
    } else if (distance < -minSwipeDistance) {
      prevSlide();
    }

    touchStartXRef.current = 0;
    touchEndXRef.current = 0;
  };

  const validIndex = currentSlide >= slides.length ? 0 : currentSlide;
  const slide = slides[validIndex] || slides[0] || DEFAULT_HERO_SLIDES[0];
  const slideHref = getSlideHref(slide);
  const hasMobileImage = Boolean(slide.mobileImage && slide.mobileImage.trim() !== "");

  return (
    <section
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className={`relative w-full ${
        hasMobileImage ? "aspect-[9/16] lg:aspect-[16/9]" : "aspect-[16/9]"
      } overflow-hidden bg-[#f4f4f4] select-none group transition-all duration-300`}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={`hero-slide-${slide.id}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="w-full h-full relative"
        >
          {slideHref ? (
            <Link
              href={slideHref}
              className="block w-full h-full cursor-pointer relative"
            >
              {/* Desktop / Laptop View: Screens >= 1024px (1920x1080 / 16:9 - 100% full image, no cropping) */}
              <div className="hidden lg:block w-full h-full relative">
                {/* eslint-disable-next-img-element */}
                <img
                  src={slide.desktopImage}
                  alt={slide.alt || slide.title}
                  className="w-full h-full object-contain object-center block"
                  loading="eager"
                />
              </div>

              {/* Tablet / Mobile View: Screens < 1024px (1080x1920 / 9:16 - 100% full image, no cropping) */}
              <div className="block lg:hidden w-full h-full relative">
                {/* eslint-disable-next-img-element */}
                <img
                  src={hasMobileImage ? slide.mobileImage!.trim() : slide.desktopImage}
                  alt={slide.alt || slide.title}
                  className="w-full h-full object-contain object-center block"
                  loading="eager"
                />
              </div>
            </Link>
          ) : (
            <div className="w-full h-full relative cursor-default">
              {/* Desktop / Laptop View: Screens >= 1024px (1920x1080 / 16:9 - 100% full image, no cropping) */}
              <div className="hidden lg:block w-full h-full relative">
                {/* eslint-disable-next-img-element */}
                <img
                  src={slide.desktopImage}
                  alt={slide.alt || slide.title}
                  className="w-full h-full object-contain object-center block"
                  loading="eager"
                />
              </div>

              {/* Tablet / Mobile View: Screens < 1024px (1080x1920 / 9:16 - 100% full image, no cropping) */}
              <div className="block lg:hidden w-full h-full relative">
                {/* eslint-disable-next-img-element */}
                <img
                  src={hasMobileImage ? slide.mobileImage!.trim() : slide.desktopImage}
                  alt={slide.alt || slide.title}
                  className="w-full h-full object-contain object-center block"
                  loading="eager"
                />
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Pagination Indicator Dots (Ultra-Transparent Glassmorphism) */}
      {slides.length > 1 && (
        <div className="absolute bottom-2.5 sm:bottom-5 lg:bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1.5 sm:gap-2.5 z-30 bg-white/15 hover:bg-white/25 backdrop-blur-sm px-2.5 sm:px-4 py-1 sm:py-2 rounded-full border border-white/25 shadow-sm transition-all">
          {slides.map((s, idx) => (
            <button
              key={s.id}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentSlide(idx);
              }}
              className={`transition-all duration-300 cursor-pointer ${
                validIndex === idx
                  ? "w-4 sm:w-7 h-1.5 sm:h-2.5 bg-[#8b0000] rounded-full shadow-md"
                  : "w-1.5 sm:w-2.5 h-1.5 sm:h-2.5 bg-black/20 hover:bg-black/45 rounded-full"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
