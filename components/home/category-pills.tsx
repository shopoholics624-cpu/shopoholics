"use client";

import { DemoLink as Link } from "@/components/demo/demo-link";
import { Smartphone, Laptop, Headphones, Watch, Layers, ArrowUpRight } from "lucide-react";

export function CategoryPills() {
  const categories = [
    { name: "Smartphones", count: "12 Models", icon: Smartphone, href: "/categories/smartphones", color: "from-red-500/10 to-red-600/10" },
    { name: "Laptops", count: "8 Models", icon: Laptop, href: "/shop?category=laptops", color: "from-amber-500/10 to-red-500/10" },
    { name: "Audio Max", count: "15 Models", icon: Headphones, href: "/shop?category=audio", color: "from-rose-500/10 to-red-500/10" },
    { name: "Wearables", count: "6 Models", icon: Watch, href: "/shop?category=wearables", color: "from-red-500/10 to-orange-500/10" },
    { name: "Full Catalog", count: "40+ Devices", icon: Layers, href: "/shop", color: "from-slate-500/10 to-red-500/10" },
  ];

  return (
    <section className="py-12 bg-[#fff8f6]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#261816]">
              Explore Hardware Ecosystems
            </h2>
            <p className="text-sm text-[#5a403c] mt-1">
              Select a flagship category to discover high-fidelity devices.
            </p>
          </div>
          <Link
            href="/shop"
            className="hidden sm:flex items-center gap-1 text-sm font-bold text-[#8b0000] hover:underline"
          >
            View All Hardware <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.name}
                href={cat.href}
                className="group p-5 rounded-2xl bg-white border border-[#e3beb8]/60 shadow-lux hover:border-[#8b0000] hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div className="w-12 h-12 rounded-xl bg-[#ffe9e6] text-[#8b0000] flex items-center justify-center group-hover:scale-110 group-hover:bg-[#8b0000] group-hover:text-white transition-all">
                  <Icon className="w-6 h-6" />
                </div>

                <div className="mt-6">
                  <span className="text-xs font-semibold text-[#8e706b] block">
                    {cat.count}
                  </span>
                  <h3 className="font-bold text-base text-[#261816] group-hover:text-[#8b0000] transition-colors mt-0.5 flex items-center justify-between">
                    <span>{cat.name}</span>
                    <ArrowUpRight className="w-4 h-4 text-[#8e706b] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </h3>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
