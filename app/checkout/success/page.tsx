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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto pt-4 text-left">
        <div className="p-4 rounded-2xl bg-white border border-[#e3beb8]/60 shadow-sm space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-[#8b0000]">
            <Truck className="w-4 h-4" /> Express Shipping
          </div>
          <p className="text-xs text-[#5a403c]">Insured Delivery by August 3, 2026</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#e3beb8]/60 shadow-sm space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-[#8b0000]">
            <ShieldCheck className="w-4 h-4" /> Hardware Protection
          </div>
          <p className="text-xs text-[#5a403c]">2-Year Official Protection Activated</p>
        </div>
      </div>

      <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link
          href="/account/orders"
          className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#8b0000] hover:bg-[#bc0000] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-colors min-h-[44px]"
        >
          <span>View Order Status</span>
          <ArrowRight className="w-4 h-4" />
        </Link>

        <Link
          href="/shop"
          className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white text-[#8b0000] border-2 border-[#8b0000] font-bold text-xs hover:bg-[#fff0ee] transition-colors min-h-[44px]"
        >
          Return to Showroom
        </Link>
      </div>
    </div>
  );
}
