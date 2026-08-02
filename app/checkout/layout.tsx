"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Check, ShieldCheck } from "lucide-react";

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const steps = [
    { id: 1, name: "Shipping Address", href: "/checkout/shipping" },
    { id: 2, name: "Secure Payment", href: "/checkout/payment" },
    { id: 3, name: "Confirmation", href: "/checkout/success" },
  ];

  const currentStepIndex = steps.findIndex((s) => pathname.includes(s.href));

  return (
    <div className="py-8 bg-white min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Stepper Progress Indicator */}
        <div className="bg-white rounded-3xl p-6 border border-[#e3beb8]/60 shadow-lux">
          <div className="flex items-center justify-between relative">
            {steps.map((step, idx) => {
              const isCompleted = currentStepIndex > idx;
              const isCurrent = currentStepIndex === idx;

              return (
                <div key={step.id} className="flex items-center gap-3 relative z-10">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                      isCompleted
                        ? "bg-emerald-600 text-white"
                        : isCurrent
                        ? "bg-[#8b0000] text-white ring-4 ring-[#ffe9e6]"
                        : "bg-[#fff8f6] text-[#8e706b] border border-[#e3beb8]"
                    }`}
                  >
                    {isCompleted ? <Check className="w-4 h-4" /> : step.id}
                  </div>
                  <span
                    className={`text-xs font-bold hidden sm:inline ${
                      isCurrent ? "text-[#8b0000]" : "text-[#5a403c]"
                    }`}
                  >
                    {step.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Form Container */}
        {children}
      </div>
    </div>
  );
}
