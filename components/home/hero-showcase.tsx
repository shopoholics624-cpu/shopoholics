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
      <div className="bg-gradient-to-r from-[#610000] via-[#8b0000] to-[#e51c10] text-white py-2.5 px-4 text-xs font-bold uppercase tracking-wider overflow-hidden shadow-sm">
        <div className="flex items-center justify-around whitespace-nowrap animate-marquee">
          <span className="flex items-center gap-2">
            🔥 Exclusive Launch Offer: Buy Any Flagship Device, Get 50% Off Accessories
          </span>
          <span className="mx-6 text-white/50">•</span>
          <span className="flex items-center gap-2">
            ⚡ Free Insured Express Courier Shipping Worldwide
          </span>
          <span className="mx-6 text-white/50">•</span>
          <span className="flex items-center gap-2">
            🛡️ Complimentary 2-Year Official Hardware Protection
          </span>
        </div>
      </div>

      {/* Main Hero Banner Slider Container */}
      <div className="relative py-8 sm:py-14 lg:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center min-h-[460px]"
          >
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#ffe9e6] border border-[#e3beb8] text-[#8b0000] text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-[#e51c10]" />
                {slide.badge}
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-[#261816] tracking-tight leading-[1.1]">
                {slide.tagline}
              </h1>

              <p className="text-base sm:text-lg text-[#5a403c] max-w-2xl font-normal leading-relaxed">
                {slide.subtitle}
              </p>

              {/* Feature Pills Row */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                {slide.pills.map((pill, idx) => {
                  const Icon = pill.icon;
                  return (
                    <div
                      key={idx}
                      className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-[#e3beb8]/60 shadow-sm text-xs font-semibold text-[#261816]"
                    >
                      <Icon className="w-4 h-4 text-[#8b0000]" />
                      <span>{pill.text}</span>
                    </div>
                  );
                })}
              </div>

              {/* Primary Orange/Crimson Pill CTA */}
              <div className="pt-4 flex items-center gap-4">
                <Link
                  href={slide.ctaHref}
                  className="min-h-[52px] px-10 py-4 rounded-full bg-gradient-to-r from-[#e51c10] via-[#bc0000] to-[#8b0000] hover:from-[#8b0000] hover:to-[#e51c10] text-white font-bold text-base transition-all shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 flex items-center justify-center gap-3"
                >
                  <span>{slide.ctaText}</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>

            {/* Right Hero Product Image Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Outer Subtle Glow */}
                <div className="absolute -inset-4 bg-gradient-to-r from-[#8b0000] to-[#e51c10] rounded-3xl opacity-15 blur-2xl animate-pulse" />

                <div className="relative rounded-3xl p-3 bg-white border border-[#e3beb8] shadow-2xl overflow-hidden">
                  {/* eslint-disable-next-img-element */}
                  <img
                    src={slide.image}
                    alt={slide.productTitle}
                    className="w-full h-[360px] sm:h-[440px] object-cover rounded-2xl"
                    loading="eager"
                  />

                  {/* Floating Specs Pill overlay */}
                  <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 right-4 sm:right-6 p-4 rounded-2xl glass-card border border-white/80 shadow-lg flex items-center justify-between text-[#261816]">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-[#8b0000] block">
                        {slide.productTitle}
                      </span>
                      <span className="text-xs text-[#5a403c] font-medium">In Stock & Ready to Ship</span>
                    </div>
                    <span className="font-extrabold text-lg text-[#8b0000]">{slide.price}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Custom Pagination Indicators */}
        <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-8 flex items-center gap-2 z-20">
          {slides.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => setCurrentSlide(idx)}
              className={`transition-all duration-300 ${
                currentSlide === idx
                  ? "w-8 h-2.5 bg-[#8b0000] rounded-full shadow-md"
                  : "w-2.5 h-2.5 bg-[#e3beb8]/80 hover:bg-[#8b0000]/60 rounded-full"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
