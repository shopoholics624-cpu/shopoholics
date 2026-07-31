"use client";

import { DemoLink as Link } from "@/components/demo/demo-link";
import { Crown, ArrowRight, ShieldCheck, Star } from "lucide-react";

export function EliteBanner() {
  return (
    <section className="py-16 bg-[#fff8f6]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-gradient-to-r from-[#3d2c2a] via-[#610000] to-[#3d2c2a] p-8 sm:p-12 text-white shadow-2xl overflow-hidden border border-[#8e706b]/40">
          {/* Subtle Ambient Decorative Ring */}
          <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full border-8 border-white/10 pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md text-[#ff907f] text-xs font-semibold tracking-wider uppercase border border-white/20">
                <Crown className="w-4 h-4 text-amber-400" />
                Shop-O-Holics Elite Circle
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Privileged Access to Custom Finishes & Next-Gen Prototypes
              </h2>

              <p className="text-sm sm:text-base text-[#e3beb8] max-w-2xl leading-relaxed">
                Join our exclusive membership tier to receive priority allocation on limited titanium releases, 24/7 concierge technical assistance, and lifetime battery health guarantee.
              </p>

              <div className="flex flex-wrap items-center gap-6 pt-2 text-xs text-[#e3beb8]">
                <div className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span>4.9/5 Rating from 2,000+ VIPs</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Concierge Hardware Exchange</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 flex justify-start lg:justify-end">
              <Link
                href="/account/orders"
                className="px-8 py-4 rounded-xl bg-white hover:bg-[#fff8f6] text-[#610000] font-bold text-base transition-all shadow-xl hover:scale-105 active:scale-95 flex items-center gap-3"
              >
                <span>Unlock VIP Benefits</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
