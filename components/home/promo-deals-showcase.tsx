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
      tagline: "Get Up to $300 Trade-in Value for Old Devices",
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
    <section className="py-8 sm:py-10 bg-white border-b border-[#e3beb8]/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Section Header */}
        <div className="flex items-center justify-between border-b border-[#e3beb8]/40 pb-4">
          <div>
            <span className="inline-flex items-center gap-1.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#8b0000] mb-0.5">
              <Gift className="w-3.5 h-3.5" /> Instant Savings & Special Perks
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#261816] tracking-tight">
              Promotional Offers & Bank Deals
            </h2>
          </div>
        </div>

        {/* Promo Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {deals.map((deal) => {
            const Icon = deal.icon;
            return (
              <div
                key={deal.id}
                className={`rounded-2xl p-5 border shadow-sm flex flex-col justify-between space-y-4 ${deal.bgClass}`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 bg-white text-[#8b0000] text-[9px] font-bold uppercase tracking-wider rounded-full shadow-sm border border-[#e3beb8] flex items-center gap-1">
                      <Icon className="w-3 h-3" /> {deal.badge}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-[#8b0000] bg-white/80 px-2 py-0.5 rounded border border-[#e3beb8]">
                      {deal.code}
                    </span>
                  </div>

                  <h3 className={`text-base font-extrabold tracking-tight ${deal.textClass}`}>
                    {deal.title}
                  </h3>

                  <p className="text-xs text-[#5a403c] leading-relaxed">
                    {deal.tagline}
                  </p>
                </div>

                <Link
                  href={deal.ctaHref}
                  className="w-full py-2.5 rounded-xl bg-[#8b0000] hover:bg-[#bc0000] text-white font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 transition-colors min-h-[38px]"
                >
                  <span>Claim Offer</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
