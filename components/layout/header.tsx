"use client";

import { useState, useEffect } from "react";
import { DemoLink as Link } from "@/components/demo/demo-link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ShoppingBag,
  ArrowLeftRight,
  User,
  Menu,
  X,
  ShieldCheck,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Smartphone,
  Laptop,
  Monitor,
  Headphones,
  Watch,
  Gamepad2,
  Camera,
  Home,
  HardDrive,
  Zap,
  Plane,
  Layers,
} from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useCompare } from "@/hooks/use-compare";
import { SearchModal } from "@/components/common/search-modal";

export function Header() {
  const pathname = usePathname();
  const { itemCount } = useCart();
  const { compareList } = useCompare();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [activeMegaCategory, setActiveMegaCategory] = useState<string>("smartphones");
  const [expandedMobileCategory, setExpandedMobileCategory] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsMegaMenuOpen(false);
  }, [pathname]);

  // 12 Main Hardware Categories with Subcategories
  const hardwareCategories = [
    {
      id: "smartphones",
      name: "Smartphones",
      icon: Smartphone,
      href: "/shop?category=smartphones",
      tagline: "Titanium Pro & Flagship 5G Devices",
      subcategories: [
        { name: "Flagship 5G Phones", href: "/shop?category=smartphones" },
        { name: "Titanium Pro Series", href: "/shop?category=smartphones" },
        { name: "Foldable & Flip Phones", href: "/shop?category=smartphones" },
        { name: "Gaming Smartphones", href: "/shop?category=smartphones" },
        { name: "Budget Smart Devices", href: "/shop?category=smartphones" },
      ],
    },
    {
      id: "laptops",
      name: "Laptops & Notebooks",
      icon: Laptop,
      href: "/shop?category=laptops",
      tagline: "M4 Compute & Ultrabooks",
      subcategories: [
        { name: "HyperBook M4 Compute", href: "/shop?category=laptops" },
        { name: "Ultrabooks & Slim", href: "/shop?category=laptops" },
        { name: "ROG Gaming Laptops", href: "/shop?category=laptops" },
        { name: "Creator Studio Laptops", href: "/shop?category=laptops" },
        { name: "Student Workbooks", href: "/shop?category=laptops" },
      ],
    },
    {
      id: "desktops",
      name: "Desktop PCs & Rigs",
      icon: Monitor,
      href: "/shop?category=desktops",
      tagline: "RTX 4090 Workstations & All-in-Ones",
      subcategories: [
        { name: "RTX 4090 Workstations", href: "/shop?category=desktops" },
        { name: "Liquid Cooled Rigs", href: "/shop?category=desktops" },
        { name: "All-in-One Studio PCs", href: "/shop?category=desktops" },
        { name: "Mini Desktop Hubs", href: "/shop?category=desktops" },
      ],
    },
    {
      id: "audio",
      name: "Studio Audio",
      icon: Headphones,
      href: "/shop?category=audio",
      tagline: "Spatial Dolby Atmos & ANC Headphones",
      subcategories: [
        { name: "AeroBuds ANC Headphones", href: "/shop?category=audio" },
        { name: "Spatial Dolby Earbuds", href: "/shop?category=audio" },
        { name: "Cinema Soundbars", href: "/shop?category=audio" },
        { name: "Wireless Bluetooth Speakers", href: "/shop?category=audio" },
      ],
    },
    {
      id: "wearables",
      name: "Smart Watches",
      icon: Watch,
      href: "/shop?category=wearables",
      tagline: "Titanium Ultra & Fitness Bands",
      subcategories: [
        { name: "Chronos Titanium Ultra", href: "/shop?category=wearables" },
        { name: "Sapphire Fitness Bands", href: "/shop?category=wearables" },
        { name: "Heart Rate & ECG Sensors", href: "/shop?category=wearables" },
        { name: "Titanium & Leather Straps", href: "/shop?category=wearables" },
      ],
    },
    {
      id: "gaming",
      name: "Gaming Consoles",
      icon: Gamepad2,
      href: "/shop?category=gaming",
      tagline: "Next-Gen Consoles & Mechanical RGB",
      subcategories: [
        { name: "Next-Gen Consoles", href: "/shop?category=gaming" },
        { name: "Wireless Controllers", href: "/shop?category=gaming" },
        { name: "Mechanical RGB Keyboards", href: "/shop?category=gaming" },
        { name: "Tactile Gaming Mice", href: "/shop?category=gaming" },
      ],
    },
    {
      id: "cameras",
      name: "Cameras & Optics",
      icon: Camera,
      href: "/shop?category=cameras",
      tagline: "8K Cinema Bodies & Prime Lenses",
      subcategories: [
        { name: "Lumix 8K Cinema Bodies", href: "/shop?category=cameras" },
        { name: "Mirrorless Full-Frame", href: "/shop?category=cameras" },
        { name: "Prime & Zoom Lenses", href: "/shop?category=cameras" },
        { name: "Tripods & Stabilizers", href: "/shop?category=cameras" },
      ],
    },
    {
      id: "drones",
      name: "Drones & Action Cams",
      icon: Plane,
      href: "/shop?category=cameras",
      tagline: "8K Aerial Drones & FPV Goggles",
      subcategories: [
        { name: "8K Cinema Aerial Drones", href: "/shop?category=cameras" },
        { name: "FPV Racing Goggles", href: "/shop?category=cameras" },
        { name: "Rugged Action Cameras", href: "/shop?category=cameras" },
      ],
    },
    {
      id: "smarthome",
      name: "Smart Home",
      icon: Home,
      href: "/shop?category=smarthome",
      tagline: "Thread & Matter Hubs & Security",
      subcategories: [
        { name: "Thread & Matter Hubs", href: "/shop?category=smarthome" },
        { name: "Encrypted Smart Locks", href: "/shop?category=smarthome" },
        { name: "4K CCTV Security Cameras", href: "/shop?category=smarthome" },
        { name: "Smart Ambient Lighting", href: "/shop?category=smarthome" },
      ],
    },
    {
      id: "monitors",
      name: "Monitors & Displays",
      icon: Monitor,
      href: "/shop?category=monitors",
      tagline: "32\" 4K QD-OLED 240Hz Screens",
      subcategories: [
        { name: "32\" 4K QD-OLED Displays", href: "/shop?category=monitors" },
        { name: "240Hz Esports Monitors", href: "/shop?category=monitors" },
        { name: "Curved Ultrawide Screens", href: "/shop?category=monitors" },
        { name: "Portable USB-C Monitors", href: "/shop?category=monitors" },
      ],
    },
    {
      id: "storage",
      name: "Storage & SSDs",
      icon: HardDrive,
      href: "/shop?category=storage",
      tagline: "PCIe Gen5 NVMe SSDs & Drives",
      subcategories: [
        { name: "PCIe Gen5 NVMe SSDs", href: "/shop?category=storage" },
        { name: "Rugged External Drives", href: "/shop?category=storage" },
        { name: "High Speed SDXC Cards", href: "/shop?category=storage" },
      ],
    },
    {
      id: "accessories",
      name: "Power & Accessories",
      icon: Zap,
      href: "/shop?category=accessories",
      tagline: "Mag-Safe Docks & GaN Chargers",
      subcategories: [
        { name: "Mag-Safe Power Docks", href: "/shop?category=accessories" },
        { name: "GaN Fast Chargers", href: "/shop?category=accessories" },
        { name: "Braided Thunderbolt Cables", href: "/shop?category=accessories" },
        { name: "Tactile Desk Mats & Sleeves", href: "/shop?category=accessories" },
      ],
    },
  ];

  const currentActiveCategoryObj = hardwareCategories.find((c) => c.id === activeMegaCategory) || hardwareCategories[0];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled
            ? "glass-header shadow-lux pt-2.5 pb-0"
            : "bg-white/95 backdrop-blur-md pt-3.5 pb-0 border-b border-[#e3beb8]/30"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main Top Header Bar */}
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group focus:outline-none shrink-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#8b0000] flex items-center justify-center text-white font-bold text-base shadow-sm group-hover:scale-105 transition-transform">
                S
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-[#261816] group-hover:text-[#8b0000] transition-colors leading-tight">
                  Shop-O-Holics
                </span>
                <span className="text-[9px] font-bold tracking-widest uppercase text-[#8b0000]">
                  Crimson Luxe
                </span>
              </div>
            </Link>

            {/* Desktop Direct Nav Links with Perfectly Aligned Typography */}
            <div className="hidden lg:flex items-center gap-6 relative">
              <Link href="/" className="text-xs font-bold text-[#261816] hover:text-[#8b0000] transition-colors">
                Discover
              </Link>

              <Link href="/shop" className="text-xs font-bold text-[#261816] hover:text-[#8b0000] transition-colors">
                Shop
              </Link>

              {/* AUTOMATIC HOVER CATEGORIES TEXT LINK WITH PERFECT FLEX ALIGNMENT */}
              <div
                className="relative flex items-center cursor-pointer h-full"
                onMouseEnter={() => setIsMegaMenuOpen(true)}
                onMouseLeave={() => setIsMegaMenuOpen(false)}
              >
                <Link
                  href="/shop"
                  className="text-xs font-bold text-[#261816] hover:text-[#8b0000] transition-colors"
                >
                  Explore
                </Link>

                {/* MEGA DROPDOWN PANEL CONTAINING ALL 12 MAIN HARDWARE CATEGORIES & SUBCATEGORIES */}
                <AnimatePresence>
                  {isMegaMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.98 }}
                      transition={{ duration: 0.18, ease: "easeOut" }}
                      className="absolute left-1/2 -translate-x-1/2 top-full pt-4 z-50 w-[780px]"
                    >
                      <div className="bg-white rounded-3xl p-5 border border-[#e3beb8] shadow-2xl grid grid-cols-12 gap-5 text-left font-sans">
                        {/* LEFT COLUMN: 12 Main Hardware Categories List */}
                        <div className="col-span-6 space-y-2 border-r border-[#ffe9e6] pr-4 max-h-[380px] overflow-y-auto no-scrollbar">
                          <div className="px-2 pb-2 border-b border-[#ffe9e6] flex items-center justify-between text-[10px] font-extrabold text-[#8b0000] uppercase tracking-wider">
                            <span>12 Hardware Categories</span>
                            <Sparkles className="w-3 h-3 text-[#e51c10]" />
                          </div>

                          <div className="space-y-1">
                            {hardwareCategories.map((cat) => {
                              const Icon = cat.icon;
                              const isSelected = activeMegaCategory === cat.id;

                              return (
                                <button
                                  key={cat.id}
                                  onMouseEnter={() => setActiveMegaCategory(cat.id)}
                                  className={`w-full flex items-center justify-between p-2 rounded-xl text-xs font-bold text-left transition-all ${
                                    isSelected
                                      ? "bg-[#8b0000] text-white shadow-sm"
                                      : "text-[#261816] hover:bg-[#fff0ee] hover:text-[#8b0000]"
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    <Icon className="w-4 h-4 shrink-0" />
                                    <span>{cat.name}</span>
                                  </div>
                                  <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* RIGHT COLUMN: Active Category Subcategories */}
                        <div className="col-span-6 space-y-3 flex flex-col justify-between p-2">
                          <div className="space-y-3">
                            <div className="pb-2 border-b border-[#ffe9e6]">
                              <span className="text-[10px] font-extrabold text-[#8b0000] uppercase tracking-wider block">
                                {currentActiveCategoryObj.name} Subcategories
                              </span>
                              <p className="text-xs font-semibold text-[#5a403c] mt-0.5">
                                {currentActiveCategoryObj.tagline}
                              </p>
                            </div>

                            <div className="space-y-1.5">
                              {currentActiveCategoryObj.subcategories.map((sub, idx) => (
                                <Link
                                  key={idx}
                                  href={sub.href}
                                  onClick={() => setIsMegaMenuOpen(false)}
                                  className="flex items-center justify-between p-2 rounded-xl text-xs font-semibold text-[#261816] hover:bg-[#ffe9e6] hover:text-[#8b0000] transition-colors border border-transparent hover:border-[#e3beb8]/60"
                                >
                                  <span>{sub.name}</span>
                                  <ChevronRight className="w-3.5 h-3.5 text-[#8b0000]" />
                                </Link>
                              ))}
                            </div>
                          </div>

                          <Link
                            href={currentActiveCategoryObj.href}
                            onClick={() => setIsMegaMenuOpen(false)}
                            className="w-full py-2.5 rounded-xl bg-[#8b0000] hover:bg-[#bc0000] text-white font-bold text-xs text-center shadow-sm flex items-center justify-center gap-1.5 transition-colors mt-4"
                          >
                            <span>Explore Full {currentActiveCategoryObj.name} Section</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Link href="/compare" className="text-xs font-bold text-[#261816] hover:text-[#8b0000] transition-colors">
                Compare
              </Link>
            </div>

            {/* Right Action Controls */}
            <div className="flex items-center gap-1.5 sm:gap-3">
              {/* Search Trigger */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-2 min-w-[38px] min-h-[38px] text-[#5a403c] hover:text-[#8b0000] hover:bg-[#ffe9e6] rounded-full transition-colors relative flex items-center justify-center"
                aria-label="Open search modal"
              >
                <Search className="w-4 h-4" />
              </button>

              {/* Compare Badge Link */}
              <Link
                href="/compare"
                className="p-2 min-w-[38px] min-h-[38px] text-[#5a403c] hover:text-[#8b0000] hover:bg-[#ffe9e6] rounded-full transition-colors relative hidden sm:flex items-center justify-center"
                title="Compare Devices"
              >
                <ArrowLeftRight className="w-4 h-4" />
                {compareList.length > 0 && (
                  <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-[#8b0000] text-white text-[9px] font-bold flex items-center justify-center shadow-sm">
                    {compareList.length}
                  </span>
                )}
              </Link>

              {/* User Account */}
              <Link
                href="/account/orders"
                className="p-2 min-w-[38px] min-h-[38px] text-[#5a403c] hover:text-[#8b0000] hover:bg-[#ffe9e6] rounded-full transition-colors hidden sm:flex items-center justify-center"
                title="My Account & Orders"
              >
                <User className="w-4 h-4" />
              </Link>

              {/* Shopping Bag Button */}
              <Link
                href="/cart"
                className="flex items-center gap-1.5 min-h-[38px] px-3.5 py-1.5 rounded-xl bg-[#8b0000] hover:bg-[#bc0000] text-white font-bold text-xs transition-all shadow-sm active:scale-95"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Bag</span>
                {itemCount > 0 && (
                  <span className="px-1.5 py-0.2 bg-white text-[#8b0000] rounded-full text-[10px] font-bold shadow-sm">
                    {itemCount}
                  </span>
                )}
              </Link>

              {/* Mobile Animated Hamburger Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 min-w-[38px] min-h-[38px] text-[#261816] hover:text-[#8b0000] lg:hidden rounded-xl bg-[#ffe9e6]/50 flex items-center justify-center transition-colors"
                aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Sticky Launch Offer Strip (Solid high-visibility crimson, static on desktop, slow scrolling ONLY on mobile/tablet) */}
        <div className="w-full bg-[#800000] text-white py-2 overflow-hidden border-t border-white/20 shadow-sm cursor-pointer select-none mt-1">
          {/* DESKTOP STABLE BAR: Non-scrolling, tightly spaced static offer items */}
          <div className="hidden lg:flex items-center justify-center gap-4 px-4 text-[11px] sm:text-xs font-extrabold tracking-normal uppercase text-white">
            <span className="flex items-center gap-1.5 shrink-0">
              🔥 EXCLUSIVE LAUNCH OFFER: BUY ANY FLAGSHIP DEVICE, GET 50% OFF ACCESSORIES
            </span>
            <span className="text-[#ffb4a8] font-black">•</span>
            <span className="flex items-center gap-1.5 shrink-0">
              ⚡ INSURED EXPRESS COURIER SHIPPING ON ORDERS OVER $99
            </span>
            <span className="text-[#ffb4a8] font-black">•</span>
            <span className="flex items-center gap-1.5 shrink-0">
              🛡️ COMPLIMENTARY 2-YEAR CONCIERGE HARDWARE WARRANTY
            </span>
          </div>

          {/* MOBILE & TABLET SCROLLING TICKER (STRICTLY HIDDEN ON DESKTOP) */}
          <div className="block lg:hidden overflow-hidden">
            <div className="flex animate-infinite-scroll-slow items-center gap-5 text-[10px] sm:text-[11px] font-extrabold tracking-normal uppercase text-white">
              <span className="flex items-center gap-1.5 shrink-0">
                🔥 EXCLUSIVE LAUNCH OFFER: BUY ANY FLAGSHIP DEVICE, GET 50% OFF ACCESSORIES
              </span>
              <span className="text-[#ffb4a8] font-black">•</span>
              <span className="flex items-center gap-1.5 shrink-0">
                🎁 FREE JBL FLIP 6 SPEAKER BUNDLE WITH APEX SMARTPHONE PRO
              </span>
              <span className="text-[#ffb4a8] font-black">•</span>
              <span className="flex items-center gap-1.5 shrink-0">
                ⚡ INSURED EXPRESS COURIER SHIPPING ON ORDERS OVER $99
              </span>
              <span className="text-[#ffb4a8] font-black">•</span>
              <span className="flex items-center gap-1.5 shrink-0">
                🛡️ COMPLIMENTARY 2-YEAR CONCIERGE HARDWARE WARRANTY
              </span>
              <span className="text-[#ffb4a8] font-black">•</span>
              <span className="flex items-center gap-1.5 shrink-0">
                💳 0% INTEREST EMI PLANS AVAILABLE ON ALL LAPTOPS & PHONES
              </span>
              <span className="text-[#ffb4a8] font-black">•</span>

              {/* Duplicated Second Set for Seamless Infinite Loop */}
              <span className="flex items-center gap-1.5 shrink-0">
                🔥 EXCLUSIVE LAUNCH OFFER: BUY ANY FLAGSHIP DEVICE, GET 50% OFF ACCESSORIES
              </span>
              <span className="text-[#ffb4a8] font-black">•</span>
              <span className="flex items-center gap-1.5 shrink-0">
                🎁 FREE JBL FLIP 6 SPEAKER BUNDLE WITH APEX SMARTPHONE PRO
              </span>
              <span className="text-[#ffb4a8] font-black">•</span>
              <span className="flex items-center gap-1.5 shrink-0">
                ⚡ INSURED EXPRESS COURIER SHIPPING ON ORDERS OVER $99
              </span>
              <span className="text-[#ffb4a8] font-black">•</span>
              <span className="flex items-center gap-1.5 shrink-0">
                🛡️ COMPLIMENTARY 2-YEAR CONCIERGE HARDWARE WARRANTY
              </span>
              <span className="text-[#ffb4a8] font-black">•</span>
              <span className="flex items-center gap-1.5 shrink-0">
                💳 0% INTEREST EMI PLANS AVAILABLE ON ALL LAPTOPS & PHONES
              </span>
              <span className="text-[#ffb4a8] font-black">•</span>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer with Accordion Subcategories */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-xs h-full bg-white p-5 text-[#261816] flex flex-col justify-between z-10 overflow-y-auto shadow-2xl"
            >
              <div className="space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-[#ffe9e6]">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[#8b0000] flex items-center justify-center font-bold text-white text-sm shadow-sm">
                      S
                    </div>
                    <span className="font-extrabold text-base text-[#261816]">
                      Shop-O-Holics
                    </span>
                  </div>

                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-1.5 rounded-full bg-[#ffe9e6] text-[#8b0000] hover:bg-[#8b0000] hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Mobile Direct Nav Links & Categories Accordion */}
                <div className="space-y-3">
                  <div className="space-y-1">
                    <Link
                      href="/"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        pathname === "/"
                          ? "bg-[#8b0000] text-white shadow-sm"
                          : "text-[#261816] hover:bg-[#fff0ee] hover:text-[#8b0000]"
                      }`}
                    >
                      <span>Discover</span>
                      <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                    </Link>

                    <Link
                      href="/shop"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        pathname === "/shop"
                          ? "bg-[#8b0000] text-white shadow-sm"
                          : "text-[#261816] hover:bg-[#fff0ee] hover:text-[#8b0000]"
                      }`}
                    >
                      <span>Shop</span>
                      <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                    </Link>

                    {/* Expandable Categories Accordion */}
                    <div className="rounded-xl border border-[#e3beb8]/60 overflow-hidden bg-[#fff8f6]">
                      <button
                        onClick={() => setExpandedMobileCategory(expandedMobileCategory === "all-cats" ? null : "all-cats")}
                        className="w-full flex items-center justify-between px-3 py-2.5 text-xs font-bold text-[#261816]"
                      >
                        <div className="flex items-center gap-2">
                          <Layers className="w-4 h-4 text-[#8b0000]" />
                          <span>Explore (12 Hardware Groups)</span>
                        </div>
                        <ChevronDown className={`w-3.5 h-3.5 text-[#8e706b] transition-transform ${expandedMobileCategory === "all-cats" ? "rotate-180" : ""}`} />
                      </button>

                      {expandedMobileCategory === "all-cats" && (
                        <div className="p-2 border-t border-[#ffe9e6] bg-white space-y-1.5 max-h-[300px] overflow-y-auto no-scrollbar">
                          {hardwareCategories.map((cat) => {
                            const Icon = cat.icon;
                            return (
                              <div key={cat.id} className="rounded-lg border border-[#e3beb8]/40 p-2 bg-[#fff8f6] space-y-1">
                                <Link
                                  href={cat.href}
                                  onClick={() => setIsMobileMenuOpen(false)}
                                  className="flex items-center justify-between text-xs font-bold text-[#8b0000]"
                                >
                                  <div className="flex items-center gap-1.5">
                                    <Icon className="w-3.5 h-3.5" />
                                    <span>{cat.name}</span>
                                  </div>
                                  <ChevronRight className="w-3 h-3 text-[#8b0000]" />
                                </Link>

                                <div className="pl-5 space-y-1 pt-1 border-t border-[#ffe9e6]">
                                  {cat.subcategories.map((sub, idx) => (
                                    <Link
                                      key={idx}
                                      href={sub.href}
                                      onClick={() => setIsMobileMenuOpen(false)}
                                      className="block text-[11px] font-semibold text-[#5a403c] hover:text-[#8b0000]"
                                    >
                                      {sub.name}
                                    </Link>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    <Link
                      href="/compare"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        pathname === "/compare"
                          ? "bg-[#8b0000] text-white shadow-sm"
                          : "text-[#261816] hover:bg-[#fff0ee] hover:text-[#8b0000]"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <ArrowLeftRight className="w-3.5 h-3.5 text-[#8b0000]" />
                        <span>Compare</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                    </Link>

                    <Link
                      href="/account/orders"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        pathname.startsWith("/account")
                          ? "bg-[#8b0000] text-white shadow-sm"
                          : "text-[#261816] hover:bg-[#fff0ee] hover:text-[#8b0000]"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-[#8b0000]" />
                        <span>My Account & Orders</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                    </Link>
                  </div>
                </div>
              </div>

              {/* Bottom Callout */}
              <div className="pt-4 border-t border-[#ffe9e6] space-y-2">
                <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#ffe9e6] text-[#8b0000] text-[10px] font-bold uppercase tracking-wider">
                  <Sparkles className="w-3 h-3 text-[#e51c10]" /> Crimson Luxe Edition
                </div>
                <div className="flex items-center gap-2 text-xs text-[#5a403c]">
                  <ShieldCheck className="w-4 h-4 text-[#8b0000] shrink-0" />
                  <span>Complimentary 2-Year Protection</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
