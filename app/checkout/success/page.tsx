"use client";

import { useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import Link from "next/link";
import { CheckCircle2, ShieldCheck, Truck, ArrowRight, Receipt, Download } from "lucide-react";
import { useCart } from "@/hooks/use-cart";

export default function OrderSuccessPage() {
  const { clearCart, gstDetails } = useCart();
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
        <h1 className="text-3xl font-extrabold text-[#261816]">
          Order Confirmed & Allocated
        </h1>
        <p className="text-xs sm:text-sm text-[#5a403c] leading-relaxed">
          Order reference <span className="font-mono font-bold text-[#8b0000]">#CL-94820-2026</span> has been dispatched to our cleanroom fulfillment center.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto pt-2 text-left">
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

      {/* GST Tax Credit Invoice Details Card */}
      {gstDetails.isGstRequired && (
        <div className="max-w-md mx-auto p-4 rounded-2xl bg-[#fff8f6] border border-[#e3beb8]/60 text-left space-y-2">
          <div className="flex items-center justify-between pb-2 border-b border-[#ffe9e6]">
            <span className="text-xs font-bold text-[#8b0000] uppercase tracking-wider flex items-center gap-1.5">
              <Receipt className="w-4 h-4" /> GST Tax Credit Invoice Generated
            </span>
            <span className="px-2 py-0.5 rounded bg-[#ffe9e6] text-[#8b0000] text-[9px] font-mono font-bold">
              TAX INVOICE #GST-88492
            </span>
          </div>
          <div className="text-xs space-y-1 text-[#5a403c]">
            <div>GSTIN: <span className="font-mono font-bold text-[#261816]">{gstDetails.gstin || "27AAAAA0000A1Z5"}</span></div>
            <div>Billed To: <span className="font-bold text-[#261816]">{gstDetails.businessName || "Crimson Luxe Pvt Ltd"}</span></div>
            <div>Tax Structure: <span className="font-semibold text-[#8b0000]">18% GST (CGST 9% + SGST 9%) - ITC Claimable</span></div>
          </div>
          <button
            onClick={() => alert("Downloading Official GST Tax Invoice (PDF)...")}
            className="w-full mt-2 py-2 rounded-xl bg-white border border-[#e3beb8] text-[#8b0000] font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-[#ffe9e6] transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> Download Tax Invoice (PDF)
          </button>
        </div>
      )}

      <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
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
