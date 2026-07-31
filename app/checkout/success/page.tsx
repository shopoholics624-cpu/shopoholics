"use client";

import { useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import Link from "next/link";
import { CheckCircle2, ShieldCheck, Truck, ArrowRight, Sparkles } from "lucide-react";
import { useCart } from "@/hooks/use-cart";

export default function OrderSuccessPage() {
  const { clearCart } = useCart();
  const clearedRef = useRef(false);

  useEffect(() => {
    if (!clearedRef.current) {
      clearedRef.current = true;
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#8b0000", "#e51c10", "#ff907f", "#ffffff"],
      });
      clearCart();
    }
  }, [clearCart]);

  return (
    <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[#e3beb8]/60 shadow-lux text-center space-y-6">
      <div className="w-20 h-20 rounded-full bg-[#ffe9e6] text-[#8b0000] flex items-center justify-center mx-auto shadow-md">
        <CheckCircle2 className="w-10 h-10 text-[#8b0000]" />
      </div>

      <div className="space-y-2 max-w-lg mx-auto">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ffe9e6] text-[#8b0000] text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-[#e51c10]" /> Order Verified & Registered
        </span>
        <h1 className="text-3xl font-extrabold text-[#261816]">
          Order Confirmed & Allocated
        </h1>
        <p className="text-xs sm:text-sm text-[#5a403c] leading-relaxed">
          Order reference <span className="font-mono font-bold text-[#8b0000]">#CL-94820-2026</span> has been dispatched to our cleanroom fulfillment center.
        </p>
      </div>

      {/* Delivery Timeline Card */}
      <div className="bg-[#fff8f6] rounded-2xl p-6 border border-[#e3beb8]/40 text-left max-w-md mx-auto space-y-4 text-xs">
        <div className="flex items-center justify-between font-bold text-[#261816] pb-[#ffe9e6] border-b border-[#ffe9e6]">
          <span className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-[#8b0000]" /> Insured Courier Express
          </span>
          <span className="text-[#8b0000]">Delivering Aug 3, 2026</span>
        </div>

        <div className="space-y-2 text-[#5a403c]">
          <div className="flex justify-between">
            <span>Tracking Number</span>
            <span className="font-mono font-bold text-[#261816]">TRK-8849-CLX</span>
          </div>
          <div className="flex justify-between">
            <span>Concierge Support</span>
            <span className="font-bold text-emerald-700">Activated (24/7)</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
        <Link
          href="/account/orders"
          className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#8b0000] hover:bg-[#bc0000] text-white font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2 min-h-[44px]"
        >
          <span>Track Order Status</span>
          <ArrowRight className="w-4 h-4" />
        </Link>

        <Link
          href="/shop"
          className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#fff8f6] hover:bg-[#ffe9e6] text-[#8b0000] border border-[#e3beb8] font-bold text-xs transition-colors min-h-[44px] flex items-center justify-center"
        >
          Return to Showroom
        </Link>
      </div>
    </div>
  );
}
