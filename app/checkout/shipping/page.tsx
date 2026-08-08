"use client";

import { useCart } from "@/hooks/use-cart";
import { useDemo } from "@/hooks/use-demo";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/utils";
import { Truck, ArrowRight, Receipt, Building2 } from "lucide-react";

export default function ShippingPage() {
  const router = useRouter();
  const { shippingAddress, setShippingAddress, gstDetails, setGstDetails, total } = useCart();
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
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e3beb8]/60 shadow-lux space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-[#ffe9e6]">
        <div>
          <h2 className="text-xl font-extrabold text-[#261816]">Shipping & Delivery Details</h2>
          <p className="text-xs text-[#5a403c]">Enter your destination address for insured express courier delivery.</p>
        </div>
        <Truck className="w-6 h-6 text-[#8b0000]" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#5a403c] uppercase">Full Name</label>
            <input
              type="text"
              required
              value={shippingAddress.fullName}
              onChange={(e) => setShippingAddress({ ...shippingAddress, fullName: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-white text-xs font-semibold border border-[#e3beb8] focus:outline-none focus:border-[#8b0000]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[#5a403c] uppercase">Corporate Email</label>
            <input
              type="email"
              required
              value={shippingAddress.email}
              onChange={(e) => setShippingAddress({ ...shippingAddress, email: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-white text-xs font-semibold border border-[#e3beb8] focus:outline-none focus:border-[#8b0000]"
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
            className="w-full px-4 py-2.5 rounded-xl bg-white text-xs font-semibold border border-[#e3beb8] focus:outline-none focus:border-[#8b0000]"
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
              className="w-full px-4 py-2.5 rounded-xl bg-white text-xs font-semibold border border-[#e3beb8] focus:outline-none focus:border-[#8b0000]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[#5a403c] uppercase">Postal Code</label>
            <input
              type="text"
              required
              value={shippingAddress.postalCode}
              onChange={(e) => setShippingAddress({ ...shippingAddress, postalCode: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-white text-xs font-semibold border border-[#e3beb8] focus:outline-none focus:border-[#8b0000]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[#5a403c] uppercase">Country</label>
            <input
              type="text"
              required
              value={shippingAddress.country}
              onChange={(e) => setShippingAddress({ ...shippingAddress, country: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-white text-xs font-semibold border border-[#e3beb8] focus:outline-none focus:border-[#8b0000]"
            />
          </div>
        </div>

        {/* GST Invoice for Business Purchases Section */}
        <div className="pt-4 border-t border-[#ffe9e6] space-y-3">
          <div className="flex items-center justify-between p-4 rounded-2xl bg-[#fff8f6] border border-[#e3beb8]/60">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#ffe9e6] text-[#8b0000] flex items-center justify-center shrink-0">
                <Receipt className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs sm:text-sm font-bold text-[#261816] block">
                  GST Invoice for Business Purchase
                </span>
                <span className="text-[11px] text-[#5a403c] font-medium block">
                  Claim Input Tax Credit (ITC) with official tax invoice
                </span>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={gstDetails.isGstRequired}
                onChange={(e) => setGstDetails({ ...gstDetails, isGstRequired: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#8b0000]"></div>
            </label>
          </div>

          {/* Slide-down GST Form */}
          {gstDetails.isGstRequired && (
            <div className="p-4 rounded-2xl bg-white border border-[#e3beb8] shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#ffe9e6]">
                <span className="text-xs font-extrabold text-[#8b0000] uppercase tracking-wider flex items-center gap-1.5">
                  <Building2 className="w-4 h-4" /> Registered Entity Tax Details
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setGstDetails({
                      ...gstDetails,
                      isGstRequired: true,
                      gstin: "27AAAAA0000A1Z5",
                      businessName: "Crimson Luxe Enterprises Pvt Ltd",
                    })
                  }
                  className="text-[10px] font-bold text-[#8b0000] hover:underline bg-[#ffe9e6] px-2.5 py-1 rounded-full"
                >
                  Auto-fill Sample GSTIN
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#5a403c] uppercase">
                    GSTIN Number (15 Digits)
                  </label>
                  <input
                    type="text"
                    required={gstDetails.isGstRequired}
                    maxLength={15}
                    placeholder="e.g. 27AAAAA0000A1Z5"
                    value={gstDetails.gstin}
                    onChange={(e) =>
                      setGstDetails({ ...gstDetails, gstin: e.target.value.toUpperCase() })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white text-xs font-mono font-bold uppercase border border-[#e3beb8] focus:outline-none focus:border-[#8b0000]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#5a403c] uppercase">
                    Registered Company / Entity Name
                  </label>
                  <input
                    type="text"
                    required={gstDetails.isGstRequired}
                    placeholder="e.g. Crimson Luxe Pvt Ltd"
                    value={gstDetails.businessName}
                    onChange={(e) => setGstDetails({ ...gstDetails, businessName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white text-xs font-semibold border border-[#e3beb8] focus:outline-none focus:border-[#8b0000]"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="pt-4 flex items-center justify-between border-t border-[#ffe9e6]">
          <div>
            <span className="text-xs text-[#5a403c] font-medium block">Order Total:</span>
            <span className="text-xl font-extrabold text-[#8b0000]">{formatPrice(total)}</span>
          </div>

          <button
            type="submit"
            className="px-8 py-3.5 bg-[#8b0000] text-white font-bold text-xs rounded-xl shadow-lg hover:bg-[#bc0000] transition-colors flex items-center gap-2"
          >
            <span>Proceed to Payment</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
