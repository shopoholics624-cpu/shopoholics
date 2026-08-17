"use client";

import { useState, useEffect } from "react";
import { DemoLink as Link } from "@/components/demo/demo-link";
import { Flame, ShieldCheck, Zap, RefreshCw, CreditCard, Gift, ArrowRight, Tag } from "lucide-react";
import { HomepageOffer } from "@/types/homepage";
import { DEFAULT_OFFERS } from "@/constants/homepage";

function getOfferIcon(badge: string, index: number) {
  const b = (badge || "").toLowerCase();
  if (b.includes("limited") || b.includes("hot") || b.includes("fire")) return Flame;
  if (b.includes("bank") || b.includes("card")) return CreditCard;
  if (b.includes("welcome") || b.includes("gift") || b.includes("new")) return Gift;
  if (b.includes("emi") || b.includes("fast") || b.includes("easy")) return Zap;
  const icons = [Flame, CreditCard, Gift, Zap, Tag, ShieldCheck];
  return icons[index % icons.length];
}

export function PromoDealsShowcase() {
  const [offers, setOffers] = useState<HomepageOffer[]>(DEFAULT_OFFERS);

  useEffect(() => {
    let isMounted = true;
    async function fetchOffers() {
      try {
        const res = await fetch(`/api/homepage/offers?_t=${Date.now()}`, {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
          },
        });
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.success && Array.isArray(data.offers)) {
            setOffers(data.offers);
          }
        }
      } catch (err) {
        console.warn("[PromoDealsShowcase] Offers fetch fallback active:", err);
      }
    }
    fetchOffers();
    return () => {
      isMounted = false;
    };
  }, []);

  if (!offers || offers.length === 0) return null;

  return (
    <section className="py-4 sm:py-6 lg:py-8 bg-white">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Section Header */}
        <div className="flex items-center justify-between pb-2">
          <div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#261816] tracking-tight">
              Promotional Offers & Bank Deals
            </h2>
          </div>
        </div>

        {/* Promo Grid (2x2 on Mobile Responsive) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
          {offers.map((deal, idx) => {
            const Icon = getOfferIcon(deal.badge, idx);
            return (
              <div
                key={deal.id}
                className="group relative z-0 hover:z-20 rounded-2xl p-3 sm:p-5 bg-[#F1F0EC] hover:bg-[#E6E5DF] border border-[#D4D3CD] shadow-sm hover:shadow-xl hover:border-[#4A4944] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-full space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-1">
                    <span className="px-2 py-0.5 bg-white text-[#1C1C1A] text-[8px] sm:text-[9px] font-bold uppercase tracking-wider rounded-full shadow-sm border border-[#D4D3CD] flex items-center gap-1">
                      <Icon className="w-3 h-3 text-[#8b0000]" /> {deal.badge || "Special Offer"}
                    </span>
                    {deal.code && (
                      <span className="text-[9px] sm:text-[10px] font-mono font-bold text-white bg-[#1C1C1A] px-1.5 py-0.5 rounded border border-[#1C1C1A] shadow-xs">
                        {deal.code}
                      </span>
                    )}
                  </div>

                  <h3 className="text-xs sm:text-base font-extrabold text-[#1C1C1A] group-hover:text-[#8b0000] transition-colors tracking-tight line-clamp-1">
                    {deal.title}
                  </h3>

                  <p className="text-[10px] sm:text-xs text-[#5A5954] leading-snug line-clamp-2">
                    {deal.tagline}
                  </p>
                </div>

                <Link
                  href={deal.ctaHref || "/shop"}
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
