"use client";

import { motion } from "framer-motion";
import { Gift, Sparkles, CheckCircle2, Clock, ShieldCheck } from "lucide-react";
import { FreeGiftBundle } from "@/types/product";
import { formatPrice } from "@/lib/utils";

interface FreeGiftBundleCardProps {
  bundle: FreeGiftBundle;
}

export function FreeGiftBundleCard({ bundle }: FreeGiftBundleCardProps) {
  if (!bundle || !bundle.enabled) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden rounded-2xl sm:rounded-3xl p-4 sm:p-5 bg-gradient-to-br from-[#ffe9e6]/90 via-white to-[#fff0ee]/90 border border-[#e3beb8] shadow-lg hover:shadow-xl transition-all duration-300 group"
    >
      {/* Background Soft Glow Effect */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#8b0000]/10 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-700" />

      {/* Top Banner Tag */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 z-10 relative">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#8b0000] text-white text-[10px] sm:text-xs font-bold uppercase tracking-wider shadow-sm">
          <Gift className="w-3.5 h-3.5 animate-bounce" />
          <span>{bundle.headline || "Free Bundle Included"}</span>
        </div>

        {bundle.promoEndDate && (
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/80 border border-[#e3beb8] text-[10px] font-semibold text-[#8b0000]">
            <Clock className="w-3 h-3 text-[#e51c10]" />
            <span>Offer Ends: {bundle.promoEndDate}</span>
          </div>
        )}
      </div>

      {/* Card Content Row */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-4 items-center z-10 relative">
        {/* Free Gift Image */}
        <div className="sm:col-span-4 relative">
          <div className="w-full h-28 sm:h-32 rounded-xl bg-white p-2 border border-[#e3beb8]/40 shadow-sm overflow-hidden flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
            {/* eslint-disable-next-img-element */}
            <img
              src={bundle.giftImage}
              alt={bundle.giftTitle}
              className="w-full h-full object-cover rounded-lg"
            />
            <span className="absolute top-2 right-2 px-2 py-0.5 bg-[#8b0000] text-white font-extrabold text-[9px] uppercase tracking-wider rounded-full shadow-md">
              FREE
            </span>
          </div>
        </div>

        {/* Free Gift Details */}
        <div className="sm:col-span-8 space-y-1.5">
          <div className="flex items-center gap-1.5 text-[#8b0000]">
            <Sparkles className="w-3.5 h-3.5 text-[#e51c10]" />
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">
              {bundle.badgeText || "🎁 COMPLIMENTARY GIFT"}
            </span>
          </div>

          <h4 className="text-sm sm:text-base font-extrabold text-[#261816] leading-tight">
            {bundle.giftTitle}
          </h4>

          <p className="text-xs text-[#5a403c] leading-relaxed line-clamp-2">
            {bundle.giftDescription}
          </p>

          {/* Pricing Row */}
          <div className="pt-1 flex items-center gap-2">
            <span className="text-xs sm:text-sm text-[#8e706b] line-through font-medium">
              {formatPrice(bundle.giftOriginalPrice)}
            </span>
            <span className="px-2.5 py-0.5 rounded-md bg-emerald-600 text-white font-extrabold text-xs sm:text-sm tracking-wide shadow-sm">
              ₹0.00 FREE
            </span>
            <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-0.5">
              <CheckCircle2 className="w-3 h-3" /> Auto-Added on Cart
            </span>
          </div>
        </div>
      </div>

      {/* Footer Assurance Banner */}
      <div className="mt-3 pt-2.5 border-t border-[#e3beb8]/50 flex items-center justify-between text-[10px] sm:text-xs text-[#5a403c] font-medium z-10 relative">
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-[#8b0000]" /> Includes Official Hardware Warranty
        </span>
        <span className="text-[#8b0000] font-bold">100% Free • No Extra Charge</span>
      </div>
    </motion.div>
  );
}
