"use client";

import { motion } from "framer-motion";
import { DemoLink as Link } from "@/components/demo/demo-link";
import { ArrowRight, Sparkles, Cpu, Shield, Zap } from "lucide-react";

export function HeroShowcase() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#fff8f6] via-[#ffe9e6]/50 to-[#fff8f6] py-12 lg:py-20 border-b border-[#e3beb8]/30">
      {/* Background Subtle Gradient Spheres */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-[#8b0000]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-[#e51c10]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Text Column */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            className="lg:col-span-7 space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#ffe9e6] border border-[#e3beb8] text-[#8b0000] text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-[#e51c10]" />
              Crimson Luxe flagship series 2026
            </div>

            <h1 className="text-4xl sm:text-6xl xl:text-7xl font-extrabold text-[#261816] tracking-tight leading-[1.08]">
              Precision Hardware. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#610000] via-[#8b0000] to-[#e51c10]">
                Uncompromising Luxury.
              </span>
            </h1>

            <p className="text-base sm:text-xl text-[#5a403c] max-w-2xl font-normal leading-relaxed">
              Experience the pinnacle of electronic craftsmanship. Grade 5 titanium enclosures, 3nm neural processing, and liquid OLED displays engineered for the elite.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href="/products/flagship-smartphone-pro"
                className="px-8 py-4 rounded-xl bg-[#8b0000] hover:bg-[#bc0000] text-white font-bold text-base transition-all shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 flex items-center gap-3"
              >
                <span>Explore Apex Pro</span>
                <ArrowRight className="w-5 h-5" />
              </Link>

              <Link
                href="/compare"
                className="px-8 py-4 rounded-xl bg-white hover:bg-[#fff0ee] text-[#8b0000] border-2 border-[#8b0000] font-bold text-base transition-all shadow-sm hover:shadow-md"
              >
                Compare Hardware
              </Link>
            </div>

            {/* Micro Feature Badges */}
            <div className="grid grid-cols-3 gap-4 pt-8 border-t border-[#e3beb8]/40 text-xs">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#ffe9e6] text-[#8b0000]">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-[#261816] block">Titanium Grade 5</span>
                  <span className="text-[#5a403c]">Ultra-light frame</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#ffe9e6] text-[#8b0000]">
                  <Cpu className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-[#261816] block">3nm Neural Engine</span>
                  <span className="text-[#5a403c]">60fps Ray Tracing</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#ffe9e6] text-[#8b0000]">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-[#261816] block">80W Fast Charge</span>
                  <span className="text-[#5a403c]">50% in 12 mins</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Product Render Image Column */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-5 relative"
          >
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Outer Glow Halo */}
              <div className="absolute -inset-4 bg-gradient-to-r from-[#8b0000] to-[#e51c10] rounded-3xl opacity-20 blur-2xl animate-pulse" />
              
              <div className="relative rounded-3xl p-3 bg-white border border-[#e3beb8] shadow-2xl overflow-hidden">
                {/* eslint-disable-next-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?q=80&w=1200&auto=format&fit=crop"
                  alt="Apex Smartphone Pro Titanium Showcase"
                  className="w-full h-[460px] object-cover rounded-2xl"
                />

                {/* Floating Specs Pill overlay */}
                <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl glass-card border border-white/80 shadow-lg flex items-center justify-between text-[#261816]">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#8b0000] block">
                      Apex Pro Titanium
                    </span>
                    <span className="text-sm font-semibold">200MP Quad Optics • 120Hz OLED</span>
                  </div>
                  <span className="font-extrabold text-lg text-[#8b0000]">$1,299</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
