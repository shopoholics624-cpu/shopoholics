"use client";

import { useCart } from "@/hooks/use-cart";
import { useDemo } from "@/hooks/use-demo";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/utils";
import { CreditCard, Lock, ArrowRight } from "lucide-react";
import { useState } from "react";

export default function PaymentPage() {
  const router = useRouter();
  const { paymentDetails, setPaymentDetails, total } = useCart();
  const { isDemoMode, handleDemoAction } = useDemo();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isDemoMode) {
      handleDemoAction(e);
      return;
    }
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      router.push("/checkout/success");
    }, 1500);
  };

  return (
    <div className="bg-white rounded-3xl p-8 border border-[#e3beb8]/60 shadow-lux space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-[#ffe9e6]">
        <div>
          <h2 className="text-xl font-extrabold text-[#261816]">256-Bit Encrypted Payment</h2>
          <p className="text-xs text-[#5a403c]">Select your preferred luxury payment method.</p>
        </div>
        <Lock className="w-6 h-6 text-[#8b0000]" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Payment Method Tabs */}
        <div className="grid grid-cols-3 gap-3">
          {(["card", "apple_pay", "crypto"] as const).map((method) => (
            <button
              key={method}
              type="button"
              onClick={(e) => {
                if (isDemoMode) {
                  handleDemoAction(e);
                  return;
                }
                setPaymentDetails({ ...paymentDetails, method });
              }}
              className={`p-3.5 rounded-2xl border-2 text-xs font-bold transition-all flex flex-col items-center gap-1.5 ${
                paymentDetails.method === method
                  ? "border-[#8b0000] bg-[#ffe9e6]/40 text-[#8b0000]"
                  : "border-[#e3beb8]/50 text-[#5a403c] hover:border-[#8b0000]/40"
              }`}
            >
              <CreditCard className="w-5 h-5" />
              <span className="capitalize">{method.replace("_", " ")}</span>
            </button>
          ))}
        </div>

        {/* Card Input fields */}
        <div className="space-y-4 pt-2">
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#5a403c] uppercase">Cardholder Name</label>
            <input
              type="text"
              required
              value={paymentDetails.cardName}
              onChange={(e) => setPaymentDetails({ ...paymentDetails, cardName: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-white text-xs font-semibold border border-[#e3beb8] focus:outline-none focus:border-[#8b0000]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[#5a403c] uppercase">Card Number</label>
            <input
              type="text"
              required
              value={paymentDetails.cardNumber}
              onChange={(e) => setPaymentDetails({ ...paymentDetails, cardNumber: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-white text-xs font-semibold border border-[#e3beb8] focus:outline-none focus:border-[#8b0000]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#5a403c] uppercase">Expiry Date</label>
              <input
                type="text"
                placeholder="MM/YY"
                required
                value={paymentDetails.cardExpiry}
                onChange={(e) => setPaymentDetails({ ...paymentDetails, cardExpiry: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-white text-xs font-semibold border border-[#e3beb8] focus:outline-none focus:border-[#8b0000]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#5a403c] uppercase">CVC Code</label>
              <input
                type="text"
                maxLength={4}
                required
                value={paymentDetails.cardCvc}
                onChange={(e) => setPaymentDetails({ ...paymentDetails, cardCvc: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-white text-xs font-semibold border border-[#e3beb8] focus:outline-none focus:border-[#8b0000]"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 flex items-center justify-between border-t border-[#ffe9e6]">
          <div>
            <span className="text-xs text-[#5a403c] font-medium block">Total Charged:</span>
            <span className="text-xl font-extrabold text-[#8b0000]">{formatPrice(total)}</span>
          </div>

          <button
            type="submit"
            disabled={isProcessing}
            className="px-8 py-3.5 bg-[#8b0000] text-white font-bold text-xs rounded-xl shadow-lg hover:bg-[#bc0000] transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <span>{isProcessing ? "Authorizing Payment..." : "Complete Purchase"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
