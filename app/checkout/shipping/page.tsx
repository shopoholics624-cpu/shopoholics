"use client";

import { useCart } from "@/hooks/use-cart";
import { useDemo } from "@/hooks/use-demo";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/utils";
import { Truck, ArrowRight, ShieldCheck } from "lucide-react";

export default function ShippingPage() {
  const router = useRouter();
  const { shippingAddress, setShippingAddress, total } = useCart();
  const { isDemoMode, handleDemoAction } = useDemo();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isDemoMode) {
      handleDemoAction(e);
      return;
    }
    router.push("/checkout/payment");
  };

  return (
    <div className="bg-white rounded-3xl p-8 border border-[#e3beb8]/60 shadow-lux space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-[#ffe9e6]">
        <div>
          <h2 className="text-xl font-extrabold text-[#261816]">Shipping & Delivery Details</h2>
          <p className="text-xs text-[#5a403c]">Enter your destination address for insured express courier delivery.</p>
        </div>
        <Truck className="w-6 h-6 text-[#8b0000]" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#5a403c] uppercase">Full Name</label>
            <input
              type="text"
              required
              value={shippingAddress.fullName}
              onChange={(e) => setShippingAddress({ ...shippingAddress, fullName: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-[#fff8f6] text-xs font-semibold border border-[#e3beb8] focus:outline-none focus:border-[#8b0000]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[#5a403c] uppercase">Corporate Email</label>
            <input
              type="email"
              required
              value={shippingAddress.email}
              onChange={(e) => setShippingAddress({ ...shippingAddress, email: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-[#fff8f6] text-xs font-semibold border border-[#e3beb8] focus:outline-none focus:border-[#8b0000]"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-[#5a403c] uppercase">Street Address</label>
          <input
            type="text"
            required
            value={shippingAddress.addressLine1}
            onChange={(e) => setShippingAddress({ ...shippingAddress, addressLine1: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl bg-[#fff8f6] text-xs font-semibold border border-[#e3beb8] focus:outline-none focus:border-[#8b0000]"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#5a403c] uppercase">City</label>
            <input
              type="text"
              required
              value={shippingAddress.city}
              onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-[#fff8f6] text-xs font-semibold border border-[#e3beb8] focus:outline-none focus:border-[#8b0000]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[#5a403c] uppercase">State / Province</label>
            <input
              type="text"
              required
              value={shippingAddress.state}
              onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-[#fff8f6] text-xs font-semibold border border-[#e3beb8] focus:outline-none focus:border-[#8b0000]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[#5a403c] uppercase">Postal Code</label>
            <input
              type="text"
              required
              value={shippingAddress.postalCode}
              onChange={(e) => setShippingAddress({ ...shippingAddress, postalCode: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-[#fff8f6] text-xs font-semibold border border-[#e3beb8] focus:outline-none focus:border-[#8b0000]"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-[#ffe9e6] flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-[#5a403c] block">Total Amount</span>
            <span className="text-xl font-extrabold text-[#8b0000]">{formatPrice(total)}</span>
          </div>

          <button
            type="submit"
            className="px-8 py-3.5 bg-[#8b0000] text-white rounded-xl font-bold text-xs hover:bg-[#bc0000] transition-all flex items-center gap-2"
          >
            <span>Continue to Payment</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
