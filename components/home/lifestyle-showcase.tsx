"use client";

import { DemoLink as Link } from "@/components/demo/demo-link";
import { ArrowUpRight, Gamepad2, Video, Camera, Headphones, Briefcase, GraduationCap, Home, Plane } from "lucide-react";

export function LifestyleShowcase() {
  const lifestyles = [
    {
      id: "life-gaming",
      title: "Gaming Setup",
      tagline: "240Hz OLEDs, RTX 4090 Rigs, & Tactical Gear",
      badge: "High FPS Ecosystem",
      icon: Gamepad2,
      count: "18 Products",
      href: "/shop?lifestyle=gaming",
      image: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?q=80&w=800&auto=format&fit=crop",
    },
    {
      id: "life-creator",
      title: "Creator Studio",
      tagline: "8K Cinema Cameras, Studio Acoustics, & M4 Compute",
      badge: "Production Studio",
      icon: Video,
      count: "24 Products",
      href: "/shop?lifestyle=creator",
      image: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=800&auto=format&fit=crop",
    },
    {
      id: "life-photo",
      title: "Photography Essentials",
      tagline: "Medium Format Sensors, Prime Lenses, & 8K Drones",
      badge: "Optical Excellence",
      icon: Camera,
      count: "15 Products",
      href: "/shop?lifestyle=photography",
      image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=800&auto=format&fit=crop",
    },
    {
      id: "life-music",
      title: "Music & Audiophile",
      tagline: "Lossless ANC Headphones, Spatial Atmos, & Soundbars",
      badge: "Studio Master Audio",
      icon: Headphones,
      count: "20 Products",
      href: "/shop?lifestyle=music",
      image: "https://images.unsplash.com/photo-1545454675-3531b543be5d?q=80&w=800&auto=format&fit=crop",
    },
    {
      id: "life-work",
      title: "Work From Home",
      tagline: "Ergonomic Monitors, Wireless Docks, & Silent Keyboards",
      badge: "Peak Productivity",
      icon: Briefcase,
      count: "30 Products",
      href: "/shop?lifestyle=work",
      image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=800&auto=format&fit=crop",
    },
    {
      id: "life-student",
      title: "Student Essentials",
      tagline: "Ultra-Light Laptops, Noise-Cancelling Buds, & Power Banks",
      badge: "Campus Ready",
      icon: GraduationCap,
      count: "22 Products",
      href: "/shop?lifestyle=student",
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800&auto=format&fit=crop",
    },
    {
      id: "life-smarthome",
      title: "Smart Home & Security",
      tagline: "Thread & Matter Hubs, Smart Locks, & CCTV Systems",
      badge: "Connected Living",
      icon: Home,
      count: "16 Products",
      href: "/shop?lifestyle=smarthome",
      image: "https://images.unsplash.com/photo-1558002038-1055907df827?q=80&w=800&auto=format&fit=crop",
    },
    {
      id: "life-travel",
      title: "Travel Tech",
      tagline: "Compact Power Docks, GPS Smartwatches, & ANC Gear",
      badge: "On-The-Go",
      icon: Plane,
      count: "14 Products",
      href: "/shop?lifestyle=travel",
      image: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?q=80&w=800&auto=format&fit=crop",
    },
  ];

  return (
    <section className="py-8 sm:py-12 bg-white border-b border-[#e3beb8]/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-[#e3beb8]/40 pb-4">
          <div>
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#8b0000] block mb-0.5">
              Targeted Hardware Suites
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#261816] tracking-tight">
              Shop By Lifestyle
            </h2>
            <p className="text-xs text-[#5a403c] mt-0.5">
              Explore curated ecosystems tailored for gaming, creation, music, photography, and work.
            </p>
          </div>

          <Link
            href="/shop"
            className="inline-flex items-center gap-1 text-xs font-bold text-[#8b0000] hover:underline min-h-[40px]"
          >
            <span>Explore All Lifestyles</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {lifestyles.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.id}
                href={item.href}
                className="group relative rounded-2xl sm:rounded-3xl overflow-hidden bg-[#fff8f6] border border-[#e3beb8]/60 shadow-sm hover:shadow-xl hover:border-[#8b0000]/40 transition-all duration-300 flex flex-col justify-between h-[230px] sm:h-[260px] p-4"
              >
                {/* Background Cover Image with Hover Zoom */}
                <div className="absolute inset-0 z-0">
                  {/* eslint-disable-next-img-element */}
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 brightness-95 group-hover:brightness-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
                </div>

                {/* Top Badge Overlay */}
                <div className="relative z-10 flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-[#8b0000] text-[9px] font-bold uppercase tracking-wider shadow-sm flex items-center gap-1 border border-white/60">
                    <Icon className="w-3 h-3 text-[#8b0000]" /> {item.badge}
                  </span>
                  <span className="text-[10px] text-white/80 font-semibold bg-black/40 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/20">
                    {item.count}
                  </span>
                </div>

                {/* Bottom Title & CTA */}
                <div className="relative z-10 space-y-1 text-white">
                  <h3 className="text-base sm:text-lg font-extrabold tracking-tight group-hover:text-[#ff907f] transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-[11px] text-white/80 line-clamp-1 leading-snug">
                    {item.tagline}
                  </p>
                  <div className="pt-2 flex items-center gap-1 text-[11px] font-bold text-white group-hover:underline">
                    <span>Explore Suite</span>
                    <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
