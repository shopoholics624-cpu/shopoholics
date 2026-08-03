"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DemoLink as Link } from "@/components/demo/demo-link";
import { ArrowRight, Sparkles, Cpu, Shield, Zap, Palette, Feather, Eye } from "lucide-react";

export function HeroShowcase() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 1,
      tagline: "Built to Perform, Made to Move.",
      subtitle: "An award-winning global flagship, exclusively launched by Shop-O-Holics.",
      productTitle: "Apex Smartphone Pro Titanium",
      price: "$1,299",
      pills: [
        { icon: Palette, text: "4+ Finishes" },
        { icon: Feather, text: "Lightweight & Slim" },
        { icon: Eye, text: "Dynamic Viewing Modes" },
      ],
      image: "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?q=80&w=1200&auto=format&fit=crop",
      ctaText: "Shop Now",
      ctaHref: "/products/flagship-smartphone-pro",
      badge: "Crimson Flagship 2026",
    },
    {
      id: 2,
      tagline: "Power Unbound. Pure Performance.",
      subtitle: "16-core neural compute, liquid vapor cooling, and 240Hz dynamic OLED display.",
      productTitle: "HyperBook Ultra 16",
      price: "$2,499",
      pills: [
        { icon: Cpu, text: "M4 Max Processor" },
        { icon: Shield, text: "Vapor Chamber Liquid" },
        { icon: Zap, text: "240Hz OLED Screen" },
      ],
      image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?q=80&w=1200&auto=format&fit=crop",
      ctaText: "Explore Specs",
      ctaHref: "/shop?category=laptops",
      badge: "Pro Compute Edition",
    },
    {
      id: 3,
      tagline: "Immersive Sound. Lossless Audio.",
      subtitle: "Cinema-grade studio acoustics with active noise cancellation and 40hr endurance.",
      productTitle: "AeroBuds Studio Max",
      price: "$549",
      pills: [
        { icon: Sparkles, text: "Spatial Dolby Atmos" },
        { icon: Zap, text: "40Hr Battery Endurance" },
        { icon: Shield, text: "Lossless Wireless" },
      ],
      image: "https://images.unsplash.com/photo-1545454675-3531b543be5d?q=80&w=1200&auto=format&fit=crop",
      ctaText: "Listen Now",
      ctaHref: "/shop?category=audio",
      badge: "Studio Acoustics",
    },
  ];

  // Auto-play slideshow every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  const slide = slides[currentSlide];

  return (
    <section className="relative overflow-hidden bg-white">
      {/* Top Animated Announcement Ticker Bar */}
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

      {/* Main Hero Banner Slider Container */}
      <div className="relative py-6 sm:py-8 lg:py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center min-h-[320px] sm:min-h-[360px]"
          >
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-3 sm:space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ffe9e6] border border-[#e3beb8] text-[#8b0000] text-[10px] sm:text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-[#e51c10]" />
                {slide.badge}
              </div>

              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-[#261816] tracking-tight leading-[1.15]">
                {slide.tagline}
              </h1>

              <p className="text-xs sm:text-base text-[#5a403c] max-w-xl font-normal leading-relaxed">
                {slide.subtitle}
              </p>

              {/* Feature Pills Row */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {slide.pills.map((pill, idx) => {
                  const Icon = pill.icon;
                  return (
                    <div
                      key={idx}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#e3beb8]/60 shadow-sm text-[11px] sm:text-xs font-semibold text-[#261816]"
                    >
                      <Icon className="w-3.5 h-3.5 text-[#8b0000]" />
                      <span>{pill.text}</span>
                    </div>
                  );
                })}
              </div>

              {/* Primary Orange/Crimson Pill CTA */}
              <div className="pt-2 flex items-center gap-3">
                <Link
                  href={slide.ctaHref}
                  className="min-h-[44px] px-6 py-2.5 sm:px-8 sm:py-3 rounded-full bg-[#8b0000] hover:bg-[#bc0000] text-white font-bold text-xs sm:text-sm transition-all shadow-md hover:shadow-lg hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                >
                  <span>{slide.ctaText}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Right Hero Product Image Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-sm lg:max-w-none">
                {/* Outer Subtle Glow */}
                <div className="absolute -inset-3 bg-gradient-to-r from-[#8b0000] to-[#e51c10] rounded-2xl opacity-15 blur-xl animate-pulse" />

                <div className="relative rounded-2xl p-2.5 bg-white border border-[#e3beb8] shadow-xl overflow-hidden">
                  {/* eslint-disable-next-img-element */}
                  <img
                    src={slide.image}
                    alt={slide.productTitle}
                    className="w-full h-[240px] sm:h-[300px] object-cover rounded-xl"
                    loading="eager"
                  />

                  {/* Floating Specs Pill overlay */}
                  <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 right-3 sm:right-4 p-3 rounded-xl glass-card border border-white/80 shadow-md flex items-center justify-between text-[#261816]">
                    <div>
                      <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#8b0000] block">
                        {slide.productTitle}
                      </span>
                      <span className="text-[10px] sm:text-xs text-[#5a403c] font-medium">In Stock & Ready to Ship</span>
                    </div>
                    <span className="font-extrabold text-sm sm:text-base text-[#8b0000]">{slide.price}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Custom Pagination Indicators */}
        <div className="absolute bottom-2 right-4 sm:bottom-4 sm:right-8 flex items-center gap-1.5 z-20">
          {slides.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => setCurrentSlide(idx)}
              className={`transition-all duration-300 ${
                currentSlide === idx
                  ? "w-6 h-2 bg-[#8b0000] rounded-full shadow-sm"
                  : "w-2 h-2 bg-[#e3beb8]/80 hover:bg-[#8b0000]/60 rounded-full"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
