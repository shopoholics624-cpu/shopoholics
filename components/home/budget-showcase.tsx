"use client";

import { DemoLink as Link } from "@/components/demo/demo-link";
import { ArrowUpRight, DollarSign, Sparkles, Tag, Percent } from "lucide-react";

export function BudgetShowcase() {
  const budgetTiers = [
    {
      id: "b-1",
      title: "Under $300",
      subtitle: "Audio, Hubs & Accessories",
      count: "12 Items",
      href: "/shop?maxPrice=300",
      badge: "Value Entry",
      icon: Tag,
    },
    {
      id: "b-2",
      title: "$300 – $600",
      subtitle: "ANC Buds, Smartwatches & Hubs",
      count: "18 Items",
      href: "/shop?minPrice=300&maxPrice=600",
      badge: "Popular Tier",
      icon: Percent,
    },
    {
      id: "b-3",
      title: "$600 – $1,200",
      subtitle: "Flagship Phones & 4K Monitors",
      count: "25 Items",
      href: "/shop?minPrice=600&maxPrice=1200",
      badge: "Pro Tech",
      icon: Sparkles,
    },
    {
      id: "b-4",
      title: "$1,200 – $2,500",
      subtitle: "Ultra Laptops & 8K Cinema",
      count: "15 Items",
      href: "/shop?minPrice=1200&maxPrice=2500",
      badge: "Performance Tier",
      icon: DollarSign,
    },
    {
      id: "b-5",
      title: "Above $2,500",
      subtitle: "4090 Rigs & Medium Format",
      count: "10 Items",
      href: "/shop?minPrice=2500",
      badge: "Luxury Edition",
      icon: Sparkles,
    },
    {
      id: "b-6",
      title: "Student Specials",
      subtitle: "Extra 10% Off Hardware",
      count: "Education Pass",
      href: "/shop?lifestyle=student",
      badge: "Verified Discount",
      icon: Tag,
    },
  ];

  return (
    <section className="py-10 sm:py-16 lg:py-20 bg-white border-b border-[#e3beb8]/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-[#e3beb8]/40 pb-5">
          <div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#261816] tracking-tight">
              Shop By Budget
            </h2>
            <p className="text-sm sm:text-base text-[#5a403c] mt-1.5 font-medium">
              Target exact price points from entry essentials to flagship luxury edition hardware.
            </p>
          </div>

          <Link
            href="/shop"
            className="inline-flex items-center gap-1 text-xs font-bold text-[#8b0000] hover:underline min-h-[40px]"
          >
            <span>Explore All Price Ranges</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Budget Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {budgetTiers.map((tier) => {
            const Icon = tier.icon;
            return (
              <Link
                key={tier.id}
                href={tier.href}
                className="group relative z-0 hover:z-20 bg-[#fff8f6] rounded-2xl p-4 border border-[#e3beb8]/60 shadow-sm hover:shadow-md hover:border-[#8b0000]/50 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-[150px]"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="px-2 py-0.5 bg-[#ffe9e6] text-[#8b0000] text-[9px] font-bold uppercase tracking-wider rounded-full border border-[#e3beb8]/50 flex items-center gap-1">
                      <Icon className="w-2.5 h-2.5" /> {tier.badge}
                    </span>
                  </div>
                  <h3 className="font-extrabold text-sm sm:text-base text-[#261816] group-hover:text-[#8b0000] transition-colors mt-2">
                    {tier.title}
                  </h3>
                  <p className="text-[10px] text-[#8e706b] font-medium leading-snug line-clamp-1 mt-0.5">
                    {tier.subtitle}
                  </p>
                </div>

                <div className="pt-2 border-t border-[#ffe9e6] flex items-center justify-between text-[11px] font-bold text-[#8b0000]">
                  <span>{tier.count}</span>
                  <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
