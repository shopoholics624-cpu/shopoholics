"use client";

import { motion } from "framer-motion";
import { Gift, CheckCircle2, Clock, ShieldCheck } from "lucide-react";
import { FreeGiftBundle } from "@/types/product";
import { formatPrice } from "@/lib/utils";

interface FreeGiftBundleCardProps {
  bundle: FreeGiftBundle;
}

export function FreeGiftBundleCard({ bundle }: FreeGiftBundleCardProps) {
  if (!bundle || !bundle.enabled) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden rounded-xl sm:rounded-2xl p-3 sm:p-3.5 bg-gradient-to-br from-[#ffe9e6]/90 via-white to-[#fff0ee]/90 border border-[#e3beb8] shadow-sm hover:shadow-md transition-all duration-300 group"
    >
      {/* Background Soft Glow Effect */}
      <div className="absolute -top-12 -right-12 w-28 h-28 bg-[#8b0000]/10 rounded-full blur-xl group-hover:scale-125 transition-transform duration-700" />

      {/* Top Banner Tag */}
      <div className="flex flex-wrap items-center justify-between gap-1.5 mb-2 z-10 relative">
        <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#8b0000] text-white text-[9px] sm:text-[10px] font-bold uppercase tracking-wider shadow-xs">
          <Gift className="w-3 h-3 animate-bounce" />
          <span>{bundle.headline || "Free Bundle Included"}</span>
        </div>

        {bundle.promoEndDate && (
          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/80 border border-[#e3beb8] text-[9px] font-semibold text-[#8b0000]">
            <Clock className="w-2.5 h-2.5 text-[#e51c10]" />
            <span>Ends: {bundle.promoEndDate}</span>
          </div>
        )}
      </div>

      {/* Card Content Row */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 sm:gap-3 items-center z-10 relative">
        {/* Free Gift Image */}
        <div className="sm:col-span-4 relative">
          <div className="w-full h-20 sm:h-24 rounded-lg bg-white p-1.5 border border-[#e3beb8]/40 shadow-xs overflow-hidden flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
            {/* eslint-disable-next-img-element */}
            <img
              src={bundle.giftImage}
              alt={bundle.giftTitle}
              className="w-full h-full object-cover rounded-md"
            />
            <span className="absolute top-1 right-1 px-1.5 py-0.5 bg-[#8b0000] text-white font-extrabold text-[8px] uppercase tracking-wider rounded shadow-xs">
              FREE
            </span>
          </div>
        </div>

        {/* Free Gift Details */}
        <div className="sm:col-span-8 space-y-1">
          <div className="flex items-center gap-1 text-[#8b0000]">
            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider">
              {bundle.badgeText || "🎁 COMPLIMENTARY GIFT"}
            </span>
          </div>

          <h4 className="text-xs sm:text-sm font-extrabold text-[#261816] leading-tight">
            {bundle.giftTitle}
          </h4>

          <p className="text-[10px] text-[#5a403c] leading-snug line-clamp-2">
            {bundle.giftDescription}
          </p>

          {/* Pricing Row */}
          <div className="pt-0.5 flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-[#8e706b] line-through font-medium">
              {formatPrice(bundle.giftOriginalPrice)}
            </span>
            <span className="px-2 py-0.5 rounded bg-emerald-600 text-white font-extrabold text-[10px] sm:text-xs tracking-wide shadow-xs">
              ₹0.00 FREE
            </span>
            <span className="text-[9px] text-emerald-700 font-bold flex items-center gap-0.5">
              <CheckCircle2 className="w-2.5 h-2.5" /> Auto-Added
            </span>
          </div>
        </div>
      </div>

      {/* Footer Assurance Banner */}
      <div className="mt-2 pt-2 border-t border-[#e3beb8]/50 flex items-center justify-between text-[9px] sm:text-[10px] text-[#5a403c] font-medium z-10 relative">
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-3 h-3 text-[#8b0000]" /> Hardware Warranty Included
        </span>
        <span className="text-[#8b0000] font-bold">100% Free Gift</span>
      </div>
    </motion.div>
  );
}
