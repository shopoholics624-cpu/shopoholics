"use client";

import { DemoLink as Link } from "@/components/demo/demo-link";
import { Flame, ShieldCheck, Zap, RefreshCw, CreditCard, Gift, ArrowRight } from "lucide-react";

export function PromoDealsShowcase() {
  const deals = [
    {
      id: "deal-1",
      title: "Festival Hardware Gala",
      tagline: "Flat 15% Off Flagship Smartphones & Laptops",
      code: "FESTIVE15",
      badge: "Limited Offer",
      icon: Flame,
      bgClass: "bg-[#ffe9e6] border-[#e3beb8]",
      textClass: "text-[#8b0000]",
      ctaHref: "/shop?isDeal=true",
    },
    {
      id: "deal-2",
      title: "10% Instant Bank Cashback",
      tagline: "Applicable on All Major Credit & Debit Cards",
      code: "BANK10",
      badge: "Bank Special",
      icon: CreditCard,
      bgClass: "bg-[#fff0ee] border-[#e3beb8]",
      textClass: "text-[#261816]",
      ctaHref: "/shop",
    },
    {
      id: "deal-3",
      title: "Trade-In Exchange Bonus",
      tagline: "Get Up to $300 Valuation for Old Devices",
      code: "EXCHANGEPRO",
      badge: "Best Valuation",
      icon: RefreshCw,
      bgClass: "bg-[#fff8f6] border-[#e3beb8]",
      textClass: "text-[#261816]",
      ctaHref: "/shop",
    },
    {
      id: "deal-4",
      title: "No-Cost 24-Month EMI",
      tagline: "0% Interest & 0 Down Payment Options",
      code: "ZEROEMI",
      badge: "Easy Ownership",
      icon: Zap,
      bgClass: "bg-[#ffe9e6] border-[#e3beb8]",
      textClass: "text-[#8b0000]",
      ctaHref: "/shop",
    },
  ];

  return (
    <section className="py-6 sm:py-10 bg-white border-b border-[#e3beb8]/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
        {/* Section Header */}
        <div className="flex items-center justify-between border-b border-[#e3beb8]/40 pb-3">
          <div>
            <span className="inline-flex items-center gap-1.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#8b0000] mb-0.5">
              <Gift className="w-3.5 h-3.5 text-[#e51c10]" /> Instant Savings & Special Perks
            </span>
            <h2 className="text-xl sm:text-3xl font-extrabold text-[#261816] tracking-tight">
              Promotional Offers & Bank Deals
            </h2>
          </div>
        </div>

        {/* Promo Grid (2x2 on Mobile Responsive) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
          {deals.map((deal) => {
            const Icon = deal.icon;
            return (
              <div
                key={deal.id}
                className="group rounded-2xl p-3 sm:p-5 bg-[#F1F0EC] hover:bg-[#E6E5DF] border border-[#D4D3CD] shadow-sm hover:shadow-xl hover:border-[#4A4944] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-full space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-1">
                    <span className="px-2 py-0.5 bg-white text-[#1C1C1A] text-[8px] sm:text-[9px] font-bold uppercase tracking-wider rounded-full shadow-sm border border-[#D4D3CD] flex items-center gap-1">
                      <Icon className="w-3 h-3 text-[#8b0000]" /> {deal.badge}
                    </span>
                    <span className="text-[9px] sm:text-[10px] font-mono font-bold text-white bg-[#1C1C1A] px-1.5 py-0.5 rounded border border-[#1C1C1A] shadow-xs">
                      {deal.code}
                    </span>
                  </div>

                  <h3 className="text-xs sm:text-base font-extrabold text-[#1C1C1A] group-hover:text-[#8b0000] transition-colors tracking-tight line-clamp-1">
                    {deal.title}
                  </h3>

                  <p className="text-[10px] sm:text-xs text-[#5A5954] leading-snug line-clamp-2">
                    {deal.tagline}
                  </p>
                </div>

                <Link
                  href={deal.ctaHref}
                  className="w-full py-2 sm:py-2.5 rounded-xl bg-[#8b0000] hover:bg-[#bc0000] text-white font-bold text-[10px] sm:text-xs shadow-md flex items-center justify-center gap-1 transition-colors min-h-[32px] sm:min-h-[38px] mt-auto"
                >
                  <span>Claim Offer</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
