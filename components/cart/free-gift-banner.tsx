"use client";

import { motion } from "framer-motion";
import { Gift, CheckCircle2 } from "lucide-react";

export function FreeGiftBanner({ giftCount = 1 }: { giftCount?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl p-4 bg-gradient-to-r from-[#8b0000] via-[#bc0000] to-[#e51c10] text-white shadow-md border border-white/20 mb-6"
    >
      <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/10 rounded-full blur-xl animate-pulse" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/30">
            <Gift className="w-5 h-5 text-white animate-bounce" />
          </div>

          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-200 uppercase tracking-wider">
              <CheckCircle2 className="w-3.5 h-3.5" /> Promotion Unlocked
            </div>
            <h3 className="text-sm sm:text-base font-extrabold tracking-tight">
              🎁 Congratulations! You&apos;ve unlocked {giftCount} FREE Gift{giftCount > 1 ? "s" : ""} with your purchase.
            </h3>
          </div>
        </div>

        <div className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-xs font-bold text-white shrink-0 self-start sm:self-auto">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
          <span>Auto Included • $0.00</span>
        </div>
      </div>
    </motion.div>
  );
}
