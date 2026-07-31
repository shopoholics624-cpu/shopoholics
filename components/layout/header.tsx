"use client";

import { useState, useEffect } from "react";
import { DemoLink as Link } from "@/components/demo/demo-link";
import { usePathname } from "next/navigation";
import { Search, ShoppingBag, ArrowLeftRight, User, Menu, X, ShieldCheck } from "lucide-react";
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
            : "bg-[#fff8f6]/90 backdrop-blur-md py-4 border-b border-[#e3beb8]/30"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
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
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium transition-colors relative py-1 ${
                    isActive
                      ? "text-[#8b0000] font-semibold"
                      : "text-[#5a403c] hover:text-[#8b0000]"
                  }`}
                >
                  {link.name}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#8b0000] rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Search Trigger */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2.5 text-[#5a403c] hover:text-[#8b0000] hover:bg-[#ffe9e6] rounded-full transition-colors relative"
              aria-label="Open search modal"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Compare Badge Link */}
            <Link
              href="/compare"
              className="p-2.5 text-[#5a403c] hover:text-[#8b0000] hover:bg-[#ffe9e6] rounded-full transition-colors relative hidden sm:flex"
              title="Compare Devices"
            >
              <ArrowLeftRight className="w-5 h-5" />
              {compareList.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#8b0000] text-white text-[10px] font-bold flex items-center justify-center">
                  {compareList.length}
                </span>
              )}
            </Link>

            {/* User Account */}
            <Link
              href="/account/orders"
              className="p-2.5 text-[#5a403c] hover:text-[#8b0000] hover:bg-[#ffe9e6] rounded-full transition-colors hidden sm:flex"
              title="My Account & Orders"
            >
              <User className="w-5 h-5" />
            </Link>

            {/* Shopping Bag Button */}
            <Link
              href="/cart"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#8b0000] hover:bg-[#bc0000] text-white font-medium text-sm transition-all shadow-md active:scale-95"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">Bag</span>
              {itemCount > 0 && (
                <span className="px-1.5 py-0.2 bg-white text-[#8b0000] rounded-full text-xs font-bold">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-[#5a403c] hover:text-[#8b0000] md:hidden rounded-lg"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-xl border-b border-[#e3beb8] px-6 py-6 space-y-4 shadow-xl">
            <div className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-base font-semibold text-[#261816] hover:text-[#8b0000] py-2 border-b border-[#ffe9e6]"
                >
                  {link.name}
                </Link>
              ))}
              <Link
                href="/account/orders"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2 text-base font-semibold text-[#261816] hover:text-[#8b0000] py-2 border-b border-[#ffe9e6]"
              >
                <User className="w-5 h-5 text-[#8b0000]" /> My Orders & Live Tracking
              </Link>
              <div className="flex items-center gap-2 text-xs text-[#5a403c] pt-2">
                <ShieldCheck className="w-4 h-4 text-[#e51c10]" /> Authentic Hardware Warranty Included
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
