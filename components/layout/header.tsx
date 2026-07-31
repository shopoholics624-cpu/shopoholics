"use client";

import { useState, useEffect } from "react";
import { DemoLink as Link } from "@/components/demo/demo-link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ShoppingBag, ArrowLeftRight, User, Menu, X, ShieldCheck, ChevronRight, Sparkles } from "lucide-react";
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

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const navLinks = [
    { name: "Showroom", href: "/" },
    { name: "Shop All", href: "/shop" },
    { name: "Smartphones", href: "/categories/smartphones" },
    { name: "Compare", href: "/compare" },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled
            ? "glass-header shadow-lux py-3"
            : "bg-[#fff8f6]/92 backdrop-blur-md py-4 border-b border-[#e3beb8]/30"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group focus:outline-none">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#8b0000] to-[#e51c10] flex items-center justify-center text-white font-bold text-lg shadow-md group-hover:scale-105 transition-transform">
              S
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-xl tracking-tight text-[#261816] group-hover:text-[#8b0000] transition-colors">
                Shop-O-Holics
              </span>
              <span className="text-[10px] font-medium tracking-widest uppercase text-[#8b0000]">
                Crimson Luxe
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8" aria-label="Main Navigation">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium transition-colors relative py-1 hover:text-[#8b0000] ${
                    isActive
                      ? "text-[#8b0000] font-semibold"
                      : "text-[#5a403c]"
                  }`}
                >
                  {link.name}
                  {isActive && (
                    <motion.span
                      layoutId="header-nav-underline"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#8b0000] rounded-full"
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-1.5 sm:gap-4">
            {/* Search Trigger */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2.5 min-w-[44px] min-h-[44px] text-[#5a403c] hover:text-[#8b0000] hover:bg-[#ffe9e6] rounded-full transition-colors relative flex items-center justify-center"
              aria-label="Open search modal"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Compare Badge Link */}
            <Link
              href="/compare"
              className="p-2.5 min-w-[44px] min-h-[44px] text-[#5a403c] hover:text-[#8b0000] hover:bg-[#ffe9e6] rounded-full transition-colors relative hidden sm:flex items-center justify-center"
              title="Compare Devices"
            >
              <ArrowLeftRight className="w-5 h-5" />
              {compareList.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#8b0000] text-white text-[10px] font-bold flex items-center justify-center shadow-sm">
                  {compareList.length}
                </span>
              )}
            </Link>

            {/* User Account */}
            <Link
              href="/account/orders"
              className="p-2.5 min-w-[44px] min-h-[44px] text-[#5a403c] hover:text-[#8b0000] hover:bg-[#ffe9e6] rounded-full transition-colors hidden sm:flex items-center justify-center"
              title="My Account & Orders"
            >
              <User className="w-5 h-5" />
            </Link>

            {/* Shopping Bag Button */}
            <Link
              href="/cart"
              className="flex items-center gap-2 min-h-[44px] px-4 py-2 rounded-xl bg-[#8b0000] hover:bg-[#bc0000] text-white font-medium text-sm transition-all shadow-md active:scale-95"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">Bag</span>
              {itemCount > 0 && (
                <span className="px-1.5 py-0.2 bg-white text-[#8b0000] rounded-full text-xs font-bold shadow-sm">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* Mobile Animated Hamburger Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2.5 min-w-[44px] min-h-[44px] text-[#261816] hover:text-[#8b0000] md:hidden rounded-xl bg-[#ffe9e6]/50 flex items-center justify-center transition-colors"
              aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Premium Animated Full-Screen Glassmorphism Mobile Menu Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex justify-end">
            {/* Backdrop Blur Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />

            {/* Slide-In Glass Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-xs h-full glass-drawer p-6 text-white flex flex-col justify-between z-10 overflow-y-auto"
            >
              {/* Top Drawer Brand & Floating Close Button */}
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-white/15">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#8b0000] to-[#e51c10] flex items-center justify-center font-bold text-white text-base shadow-sm">
                      S
                    </div>
                    <span className="font-bold text-lg tracking-tight text-white">
                      Shop-O-Holics
                    </span>
                  </div>

                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2.5 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                    aria-label="Close menu"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Animated Mobile Nav Item List */}
                <nav className="space-y-2">
                  {navLinks.map((link, idx) => (
                    <motion.div
                      key={link.href}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 * idx, duration: 0.25 }}
                    >
                      <Link
                        href={link.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center justify-between min-h-[48px] px-4 py-3 rounded-2xl text-base font-semibold transition-all ${
                          pathname === link.href
                            ? "bg-[#8b0000] text-white shadow-md"
                            : "text-[#e3beb8] hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        <span>{link.name}</span>
                        <ChevronRight className="w-4 h-4 opacity-60" />
                      </Link>
                    </motion.div>
                  ))}

                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.25, duration: 0.25 }}
                  >
                    <Link
                      href="/account/orders"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center justify-between min-h-[48px] px-4 py-3 rounded-2xl text-base font-semibold transition-all ${
                        pathname === "/account/orders"
                          ? "bg-[#8b0000] text-white shadow-md"
                          : "text-[#e3beb8] hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <User className="w-5 h-5 text-[#ff907f]" />
                        <span>My Account & Orders</span>
                      </div>
                      <ChevronRight className="w-4 h-4 opacity-60" />
                    </Link>
                  </motion.div>
                </nav>
              </div>

              {/* Bottom Drawer Callout */}
              <div className="pt-6 border-t border-white/15 space-y-3">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#8b0000]/60 border border-[#ff907f]/30 text-white text-xs font-semibold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-[#ff907f]" />
                  Crimson Luxe Edition
                </div>
                <div className="flex items-center gap-2 text-xs text-[#e3beb8]">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Complimentary 2-Year VIP Warranty</span>
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
