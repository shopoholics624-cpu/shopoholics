"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion } from "framer-motion";
import { DemoLink as Link } from "@/components/demo/demo-link";
import {
  ArrowRight,
  Cpu,
  ShieldCheck,
  Zap,
  Smartphone,
  Laptop,
  Camera,
  Tv,
  Home,
  ShoppingBag,
} from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function HorizontalShowcase() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;

    if (!section || !track) return;

    // Calculate total horizontal scroll distance for desktop
    const getScrollAmount = () => track.scrollWidth - window.innerWidth;

    const ctx = gsap.context(() => {
      // Pin section & translate horizontal track smoothly with scroll on desktop
      gsap.to(track, {
        x: () => -getScrollAmount(),
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => `+=${getScrollAmount()}`,
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });
    }, section);

    return () => ctx.revert();
  }, []);

  const panels = [
    {
      id: 1,
      badge: "Mobile Architecture",
      badgeIcon: Smartphone,
      headline: "Precision Optics. Titanium Finish.",
      subtitle: "Grade 5 titanium frame, 3nm neural engine, and liquid 120Hz OLED.",
      image: "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?q=80&w=1200&auto=format&fit=crop",
      ctaText: "Explore Smartphones",
      ctaHref: "/shop",
      specs: [
        { label: "Neural Engine", val: "3nm Architecture", icon: Cpu },
        { label: "Camera Optics", val: "200MP Quad Sensor", icon: Camera },
        { label: "Protection", val: "Titanium Grade 5", icon: ShieldCheck },
      ],
    },
    {
      id: 2,
      badge: "Gaming & Compute",
      badgeIcon: Laptop,
      headline: "Power Meets Unrivaled Speed.",
      subtitle: "16-core M4 Max processing, liquid cooling, and 240Hz dynamic refresh rates.",
      image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?q=80&w=1200&auto=format&fit=crop",
      ctaText: "Explore Compute",
      ctaHref: "/shop",
      specs: [
        { label: "Processor", val: "16-Core M4 Max", icon: Cpu },
        { label: "Display", val: "240Hz OLED Dynamic", icon: Zap },
        { label: "Thermal", val: "Vapor Chamber Liquid", icon: ShieldCheck },
      ],
    },
    {
      id: 3,
      badge: "Optics & Creation",
      badgeIcon: Camera,
      headline: "Capture Every Frame in 8K RAW.",
      subtitle: "Medium format optics, carbon fiber drone frame, and 8K 120fps recording.",
      image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1200&auto=format&fit=crop",
      ctaText: "Explore Creators Gear",
      ctaHref: "/shop",
      specs: [
        { label: "Sensor", val: "100MP Medium Format", icon: Camera },
        { label: "Recording", val: "8K 120fps Cinema RAW", icon: Zap },
        { label: "Build", val: "Carbon Fiber Optics", icon: ShieldCheck },
      ],
    },
    {
      id: 4,
      badge: "Cinema & Acoustics",
      badgeIcon: Tv,
      headline: "Immersive Studio Audio Acoustics.",
      subtitle: "Spatial Dolby Atmos 7.1.4, 8K MicroLED contrast, and wireless audio.",
      image: "https://images.unsplash.com/photo-1545454675-3531b543be5d?q=80&w=1200&auto=format&fit=crop",
      ctaText: "Explore Studio Audio",
      ctaHref: "/shop",
      specs: [
        { label: "Acoustics", val: "Dolby Atmos 7.1.4", icon: Zap },
        { label: "Display Tech", val: "8K MicroLED Screen", icon: Tv },
        { label: "Audio", val: "Lossless Ultra Wireless", icon: Zap },
      ],
    },
    {
      id: 5,
      badge: "Smart Ecosystem",
      badgeIcon: Home,
      headline: "Connected Automation Ecosystem.",
      subtitle: "Thread & Matter native protocol, encrypted biometric access, and AI sensors.",
      image: "https://images.unsplash.com/photo-1558002038-1055907df827?q=80&w=1200&auto=format&fit=crop",
      ctaText: "Explore Smart Home",
      ctaHref: "/shop",
      specs: [
        { label: "Protocol", val: "Thread & Matter Native", icon: Home },
        { label: "Security", val: "256-Bit Encrypted Link", icon: ShieldCheck },
        { label: "Control", val: "AI Biometric Sensor", icon: Cpu },
      ],
    },
    {
      id: 6,
      badge: "Crimson Luxe Experience",
      badgeIcon: ShoppingBag,
      headline: "Ready To Elevate Your Setup?",
      subtitle: "Handcrafted Scandinavian luxury electronics with complimentary 2-year warranty.",
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1200&auto=format&fit=crop",
      ctaText: "Explore Full Collection",
      ctaHref: "/shop",
      secondaryCtaText: "Compare",
      secondaryCtaHref: "/compare",
      specs: [
        { label: "Warranty", val: "2-Year Hardware Coverage", icon: ShieldCheck },
        { label: "Delivery", val: "Free Express Courier", icon: Zap },
        { label: "Guarantee", val: "30-Day Unboxing Return", icon: ShieldCheck },
      ],
    },
  ];

  const featuredSmartphone = panels[0];
  const gridCategories = panels.slice(1);

  return (
    <section className="relative bg-[#fff8f6] text-[#261816] overflow-hidden">
      {/* Background Subtle Gradient Glow Spheres */}
      <div className="absolute top-0 right-1/3 w-[600px] h-[600px] bg-[#8b0000]/4 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 w-[500px] h-[500px] bg-[#e51c10]/4 rounded-full blur-3xl pointer-events-none" />

      {/* DESKTOP EXCLUSIVE PINNED HORIZONTAL TRACK (hidden lg:block) */}
      <div ref={sectionRef} className="hidden lg:block relative w-full h-screen">
        <div
          ref={trackRef}
          className="flex items-center h-screen px-12 gap-16 w-max sticky top-0"
        >
          {panels.map((panel) => {
            const BadgeIcon = panel.badgeIcon;
            return (
              <div
                key={panel.id}
                className="w-[85vw] max-w-[1100px] h-[80vh] flex flex-col justify-between p-8 xl:p-12 relative shrink-0"
              >
                {/* Panel Top Badge & Index Indicator */}
                <div className="flex items-center justify-between z-10 pb-4 border-b border-[#e3beb8]/40">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#ffe9e6] border border-[#e3beb8] text-[#8b0000] text-xs font-bold uppercase tracking-wider">
                    <BadgeIcon className="w-4 h-4 text-[#e51c10]" />
                    {panel.badge}
                  </div>
                  <span className="text-xs font-bold text-[#8e706b] font-mono tracking-widest">
                    0{panel.id} — 06
                  </span>
                </div>

                {/* Main Panel Content Grid */}
                <div className="grid grid-cols-12 gap-12 items-center my-auto z-10">
                  {/* Left Storytelling Text Column */}
                  <div className="col-span-6 space-y-6">
                    <h2 className="text-3xl xl:text-5xl font-extrabold text-[#261816] leading-[1.1] tracking-tight">
                      {panel.headline}
                    </h2>
                    <p className="text-base text-[#5a403c] leading-relaxed font-normal">
                      {panel.subtitle}
                    </p>

                    {/* Specification Badges */}
                    <div className="space-y-3 pt-2">
                      {panel.specs.map((spec, idx) => {
                        const Icon = spec.icon;
                        return (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-3.5 rounded-2xl bg-white/80 border border-[#e3beb8]/50 shadow-sm"
                          >
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-xl bg-[#ffe9e6] text-[#8b0000]">
                                <Icon className="w-4 h-4" />
                              </div>
                              <span className="text-xs font-semibold text-[#5a403c]">
                                {spec.label}
                              </span>
                            </div>
                            <span className="text-xs font-bold text-[#261816]">
                              {spec.val}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Action CTAs */}
                    <div className="flex items-center gap-4 pt-4">
                      <Link
                        href={panel.ctaHref}
                        className="min-h-[48px] px-8 py-3.5 rounded-xl bg-[#8b0000] hover:bg-[#bc0000] text-white font-bold text-sm transition-all shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 flex items-center justify-center gap-3"
                      >
                        <span>{panel.ctaText}</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>

                      {panel.secondaryCtaText && (
                        <Link
                          href={panel.secondaryCtaHref || "/compare"}
                          className="min-h-[48px] px-8 py-3.5 rounded-xl bg-white hover:bg-[#fff0ee] text-[#8b0000] border-2 border-[#8b0000] font-bold text-sm transition-all shadow-sm flex items-center justify-center"
                        >
                          {panel.secondaryCtaText}
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* Right Floating Product Image Column */}
                  <div className="col-span-6 relative">
                    <div className="relative mx-auto max-w-md xl:max-w-none">
                      {/* Ambient Halo Glow */}
                      <div className="absolute -inset-4 bg-gradient-to-r from-[#8b0000] to-[#e51c10] rounded-3xl opacity-15 blur-2xl animate-pulse" />

                      <div className="relative rounded-3xl p-3 bg-white border border-[#e3beb8] shadow-2xl overflow-hidden">
                        {/* eslint-disable-next-img-element */}
                        <img
                          src={panel.image}
                          alt={panel.headline}
                          className="w-full h-[380px] xl:h-[440px] object-cover rounded-2xl"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Panel Sub-Footer */}
                <div className="flex items-center justify-between text-xs text-[#8e706b] z-10 pt-4 border-t border-[#e3beb8]/40">
                  <span>Shop-O-Holics Core Design System</span>
                  <span>Precision Hardware Architecture</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MOBILE & TABLET ADAPTIVE ASYMMETRIC VERTICAL APP GRID (lg:hidden) */}
      <div className="lg:hidden max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Section Header */}
        <div className="space-y-2 border-b border-[#e3beb8]/40 pb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ffe9e6] border border-[#e3beb8] text-[#8b0000] text-[11px] font-bold uppercase tracking-wider">
            Hardware Ecosystem
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#261816] tracking-tight">
            Explore Hardware Categories
          </h2>
          <p className="text-xs sm:text-sm text-[#5a403c]">
            Handcrafted Scandinavian luxury technology built for performance and durability.
          </p>
        </div>

        {/* 2-by-2 Mobile Grid Layout */}
        <div className="grid grid-cols-2 gap-3 sm:gap-6">
          {/* Featured Full-Width Hero Card (Smartphones) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="col-span-2 bg-white rounded-3xl p-5 sm:p-6 border border-[#e3beb8]/60 shadow-lux space-y-4 sm:space-y-5 flex flex-col sm:flex-row items-center gap-4 sm:gap-6 relative overflow-hidden active:scale-[0.98] transition-transform"
          >
            {/* Ambient Accent Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#8b0000]/5 rounded-full blur-2xl pointer-events-none" />

            <div className="w-full sm:w-1/2 space-y-3 sm:space-y-4 z-10">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#ffe9e6] text-[#8b0000] text-[9px] sm:text-[10px] font-bold uppercase tracking-wider">
                <Smartphone className="w-3 h-3 text-[#e51c10]" />
                Featured Category
              </div>

              <h3 className="text-lg sm:text-2xl font-extrabold text-[#261816]">
                {featuredSmartphone.headline}
              </h3>
              <p className="text-xs text-[#5a403c] leading-relaxed">
                {featuredSmartphone.subtitle}
              </p>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {featuredSmartphone.specs.map((spec, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-lg bg-[#fff8f6] border border-[#e3beb8]/40 text-[10px] font-semibold text-[#8b0000]"
                  >
                    {spec.val}
                  </span>
                ))}
              </div>

              <div className="pt-2">
                <Link
                  href={featuredSmartphone.ctaHref}
                  className="min-h-[44px] sm:min-h-[48px] px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl bg-[#8b0000] hover:bg-[#bc0000] text-white font-bold text-xs inline-flex items-center justify-center gap-2 shadow-md transition-colors w-full sm:w-auto"
                >
                  <span>{featuredSmartphone.ctaText}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="w-full sm:w-1/2 relative z-10">
              {/* eslint-disable-next-img-element */}
              <img
                src={featuredSmartphone.image}
                alt={featuredSmartphone.headline}
                className="w-full h-44 sm:h-64 object-cover rounded-2xl border border-[#e3beb8]/60 shadow-md"
              />
            </div>
          </motion.div>

          {/* 2-by-2 Mobile Grid Cards for Remaining Categories */}
          {gridCategories.map((item, idx) => {
            const Icon = item.badgeIcon;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.08 * idx }}
                className="bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 border border-[#e3beb8]/60 shadow-lux space-y-3 sm:space-y-4 flex flex-col justify-between active:scale-[0.98] transition-transform group hover:border-[#8b0000]/40"
              >
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#ffe9e6] text-[#8b0000] text-[9px] font-bold uppercase tracking-wider truncate max-w-[110px]">
                      <Icon className="w-3 h-3 text-[#e51c10] shrink-0" />
                      <span className="truncate">{item.badge}</span>
                    </div>
                    <span className="text-[10px] sm:text-xs font-mono font-bold text-[#8e706b]">
                      0{item.id}
                    </span>
                  </div>

                  {/* eslint-disable-next-img-element */}
                  <img
                    src={item.image}
                    alt={item.headline}
                    className="w-full h-28 sm:h-44 object-cover rounded-xl sm:rounded-2xl border border-[#e3beb8]/40 shadow-sm group-hover:scale-[1.02] transition-transform duration-300"
                  />

                  <div className="space-y-1">
                    <h3 className="text-xs sm:text-base font-bold text-[#261816] group-hover:text-[#8b0000] transition-colors leading-snug line-clamp-1">
                      {item.headline}
                    </h3>
                    <p className="text-[10px] sm:text-xs text-[#5a403c] line-clamp-1 sm:line-clamp-2 leading-relaxed hidden sm:block">
                      {item.subtitle}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#ffe9e6]">
                  <Link
                    href={item.ctaHref}
                    className="w-full min-h-[36px] sm:min-h-[48px] px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-[#fff8f6] hover:bg-[#ffe9e6] text-[#8b0000] border border-[#e3beb8] font-bold text-[11px] sm:text-xs flex items-center justify-between transition-colors"
                  >
                    <span className="truncate">{item.ctaText}</span>
                    <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#8b0000] shrink-0 ml-1" />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
