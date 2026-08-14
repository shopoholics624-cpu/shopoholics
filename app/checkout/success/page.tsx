"use client";

import { useEffect, useRef, useState } from "react";
import confetti from "canvas-confetti";
import Link from "next/link";
import { CheckCircle2, ShieldCheck, Truck, ArrowRight, Receipt, Download, ShoppingBag } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { formatPrice } from "@/lib/utils";

interface OrderReference {
  id: string;
  orderNumber: string;
  total: number;
  status: string;
  date: string;
  items: any[];
  shippingAddress: any;
  gstDetails?: any;
}

export default function OrderSuccessPage() {
  const { clearCart } = useCart();
  const clearedRef = useRef(false);
  const [order, setOrder] = useState<OrderReference | null>(null);

  useEffect(() => {
    if (!clearedRef.current) {
      clearedRef.current = true;
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#8b0000", "#e51c10", "#ff907f", "#ffffff"],
      });

      try {
        const savedOrder = localStorage.getItem("shopoholics_last_order");
        if (savedOrder) {
          setOrder(JSON.parse(savedOrder));
        }
      } catch {
        // fallback
      }

      clearCart();
    }
  }, [clearCart]);

  const displayOrderNumber = order?.orderNumber || "#CL-94820";
  const displayTotal = order?.total ? formatPrice(order.total) : "₹1,49,900";
  const displayStatus = order?.status === "pending" ? "Pending Authorization" : order?.status || "Processing";
  const gst = order?.gstDetails;

  return (
    <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[#e3beb8]/60 shadow-lux text-center space-y-6">
      <Link href="/" className="inline-block">
        {/* eslint-disable-next-img-element */}
        <img
          src="/images/logo-cropped.png"
          alt="Shop-O-Holics - Spend Less, Save More... Shop Smart!!!"
          className="h-8 sm:h-10 max-w-[180px] sm:max-w-[220px] w-auto object-contain mx-auto mb-2"
        />
      </Link>

      <div className="w-20 h-20 rounded-full bg-[#ffe9e6] text-[#8b0000] flex items-center justify-center mx-auto shadow-md">
        <CheckCircle2 className="w-10 h-10 text-[#8b0000]" />
      </div>

      <div className="space-y-2 max-w-lg mx-auto">
        <h1 className="text-3xl font-extrabold text-[#261816]">
          Payment Successful!
        </h1>
        <p className="text-xs sm:text-sm text-[#5a403c] leading-relaxed">
          Your payment has been authorized. WooCommerce order <span className="font-mono font-bold text-[#8b0000]">{displayOrderNumber}</span> is now <strong className="capitalize text-emerald-700">{displayStatus}</strong>. Total Paid: <strong className="text-[#8b0000]">{displayTotal}</strong>.
        </p>
      </div>

      {/* Purchased Line Items Summary */}
      {order?.items && order.items.length > 0 && (
        <div className="max-w-md mx-auto bg-[#fff8f6] rounded-2xl p-4 border border-[#e3beb8]/60 text-left space-y-2">
          <div className="flex items-center justify-between pb-2 border-b border-[#ffe9e6]">
            <span className="text-xs font-bold text-[#8b0000] uppercase tracking-wider flex items-center gap-1.5">
              <ShoppingBag className="w-4 h-4" /> Allocated Order Items ({order.items.length})
            </span>
          </div>

          <div className="space-y-2">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs text-[#261816] font-semibold">
                <div className="truncate max-w-[240px]">
                  <span>{item.product?.title || item.name}</span>
                  <span className="text-[10px] text-[#5a403c] block font-normal">
                    Qty: {item.quantity} × {formatPrice(item.selectedVariant?.price || item.product?.price || 0)}
                  </span>
                </div>
                <span className="font-extrabold text-[#8b0000]">
                  {formatPrice((item.selectedVariant?.price || item.product?.price || 0) * (item.quantity || 1))}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto pt-2 text-left">
        <div className="p-4 rounded-2xl bg-white border border-[#e3beb8]/60 shadow-sm space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-[#8b0000]">
            <Truck className="w-4 h-4" /> Express Shipping
          </div>
          <p className="text-xs text-[#5a403c]">Insured Courier Allocated</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#e3beb8]/60 shadow-sm space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-[#8b0000]">
            <ShieldCheck className="w-4 h-4" /> Hardware Protection
          </div>
          <p className="text-xs text-[#5a403c]">2-Year Warranty Active</p>
        </div>
      </div>

      {/* GST Tax Credit Invoice Details Card */}
      {gst?.isGstRequired && (
        <div className="max-w-md mx-auto p-4 rounded-2xl bg-[#fff8f6] border border-[#e3beb8]/60 text-left space-y-2">
          <div className="flex items-center justify-between pb-2 border-b border-[#ffe9e6]">
            <span className="text-xs font-bold text-[#8b0000] uppercase tracking-wider flex items-center gap-1.5">
              <Receipt className="w-4 h-4" /> GST Tax Credit Invoice Generated
            </span>
            <span className="px-2 py-0.5 rounded bg-[#ffe9e6] text-[#8b0000] text-[9px] font-mono font-bold">
              TAX INVOICE #{displayOrderNumber.replace("#", "")}
            </span>
          </div>
          <div className="text-xs space-y-1 text-[#5a403c]">
            <div>GSTIN: <span className="font-mono font-bold text-[#261816]">{gst.gstin || "27AAAAA0000A1Z5"}</span></div>
            <div>Billed To: <span className="font-bold text-[#261816]">{gst.businessName || "Crimson Luxe Pvt Ltd"}</span></div>
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
