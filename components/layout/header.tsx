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
  Heart,
  Menu,
  X,
  ShieldCheck,
  ChevronDown,
  ChevronRight,
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
import { useAuth } from "@/hooks/use-auth";
import { useWishlist } from "@/hooks/use-wishlist";
import { SearchModal } from "@/components/common/search-modal";
import { Product } from "@/types/product";
import { formatPrice } from "@/lib/utils";

interface WooCategoryItem {
  id: number;
  name: string;
  slug: string;
  parent: number;
  count: number;
  description?: string;
  image?: { src: string };
}

function decodeHtmlEntities(text: string): string {
  if (!text) return "";
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, " ");
}

function getCategoryIcon(nameOrSlug: string) {
  const s = nameOrSlug.toLowerCase();
  if (s.includes("phone") || s.includes("smart")) return Smartphone;
  if (s.includes("laptop") || s.includes("computer")) return Laptop;
  if (s.includes("headphone") || s.includes("audio") || s.includes("earphone")) return Headphones;
  if (s.includes("tablet")) return Monitor;
  if (s.includes("watch") || s.includes("wearable")) return Watch;
  if (s.includes("game") || s.includes("console")) return Gamepad2;
  if (s.includes("app") || s.includes("software")) return Laptop;
  if (s.includes("accessory") || s.includes("power")) return Zap;
  return Layers;
}

export function Header() {
  const pathname = usePathname();
  const { itemCount } = useCart();
  const { compareList } = useCompare();
  const { wishlistCount } = useWishlist();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [activeMegaCategory, setActiveMegaCategory] = useState<string>("");
  const [expandedMobileCategory, setExpandedMobileCategory] = useState<string | null>(null);

  // Dynamic WooCommerce Categories state
  const [wooCategories, setWooCategories] = useState<WooCategoryItem[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

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

  // Fetch live WooCommerce categories dynamically
  useEffect(() => {
    let isMounted = true;
    async function fetchDynamicCategories() {
      try {
        const res = await fetch("/api/categories");
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.success && Array.isArray(data.categories)) {
            setWooCategories(data.categories);
            if (data.categories.length > 0) {
              const root = data.categories.find((c: WooCategoryItem) => c.parent === 0) || data.categories[0];
              setActiveMegaCategory(String(root.id));
            }
          }
        }
      } catch (err) {
        console.warn("[Header] Dynamic WooCommerce category fetch error:", err);
      } finally {
        if (isMounted) setIsLoadingCategories(false);
      }
    }
    fetchDynamicCategories();
    return () => {
      isMounted = false;
    };
  }, []);

  // Build dynamic parent-child category tree
  const rootCategories = wooCategories.filter((c) => c.parent === 0);
  const displayRoots = rootCategories.length > 0 ? rootCategories : wooCategories;

  const categoryTree = displayRoots.map((root) => {
    const children = wooCategories.filter((c) => c.parent === root.id);
    return {
      id: String(root.id),
      name: decodeHtmlEntities(root.name),
      slug: root.slug,
      href: `/shop?category=${encodeURIComponent(root.slug)}`,
      count: root.count,
      icon: getCategoryIcon(root.name),
      subcategories: children.map((child) => ({
        id: String(child.id),
        name: decodeHtmlEntities(child.name),
        slug: child.slug,
        href: `/shop?category=${encodeURIComponent(child.slug)}`,
        count: child.count,
      })),
    };
  });

  const currentActiveCategoryObj =
    categoryTree.find((c) => c.id === activeMegaCategory) || categoryTree[0] || {
      id: "all",
      name: "All Categories",
      slug: "all",
      href: "/shop",
      count: 0,
      icon: Layers,
      subcategories: [],
    };

  // Dynamic WooCommerce Products preview per category slug
  const [previewProductsMap, setPreviewProductsMap] = useState<Record<string, Product[]>>({});
  const [isLoadingPreview, setIsLoadingPreview] = useState<boolean>(false);
  const [previewError, setPreviewError] = useState<boolean>(false);

  // Authenticated Customer Session State from Central Auth Provider
  const { customer: customerSession, logout: authLogout } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleHeaderLogout = async () => {
    setIsUserMenuOpen(false);
    await authLogout();
  };

  useEffect(() => {
    if (!isMegaMenuOpen || !currentActiveCategoryObj || !currentActiveCategoryObj.slug) return;
    const slug = currentActiveCategoryObj.slug;

    // Use cached preview products if available
    if (previewProductsMap[slug]) {
      setIsLoadingPreview(false);
      setPreviewError(false);
      return;
    }

    let isMounted = true;
    async function fetchPreviewProducts() {
      setIsLoadingPreview(true);
      setPreviewError(false);
      try {
        const res = await fetch(`/api/products?category=${encodeURIComponent(slug)}&per_page=3`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.success && Array.isArray(data.products)) {
            setPreviewProductsMap((prev) => ({
              ...prev,
              [slug]: data.products,
            }));
          } else if (isMounted) {
            setPreviewError(true);
          }
        } else if (isMounted) {
          setPreviewError(true);
        }
      } catch (err) {
        console.warn("[Header] Category product preview fetch error:", err);
        if (isMounted) setPreviewError(true);
      } finally {
        if (isMounted) setIsLoadingPreview(false);
      }
    }

    fetchPreviewProducts();
    return () => {
      isMounted = false;
    };
  }, [activeMegaCategory, isMegaMenuOpen, currentActiveCategoryObj]);

  const activePreviewProducts = currentActiveCategoryObj.slug
    ? previewProductsMap[currentActiveCategoryObj.slug] || []
    : [];

  return (
    <>
      {/* Top Rolling Marquee Strip (Fixed at the Very Top of Website) */}
      <div className="fixed top-0 left-0 right-0 z-50 h-[28px] sm:h-[30px] bg-[#800000] text-white overflow-hidden border-b border-white/10 shadow-sm select-none flex items-center">
        <div className="flex animate-marquee-smooth items-center text-[10px] sm:text-[11px] font-extrabold tracking-wider uppercase text-white">
          {/* First Set */}
          <span className="px-8 shrink-0">EXCLUSIVE LAUNCH OFFER: BUY ANY FLAGSHIP DEVICE, GET 50% OFF ACCESSORIES</span>
          <span className="px-8 shrink-0">FREE JBL FLIP 6 SPEAKER BUNDLE WITH APEX SMARTPHONE PRO</span>
          <span className="px-8 shrink-0">INSURED EXPRESS COURIER SHIPPING ON ORDERS OVER $99</span>
          <span className="px-8 shrink-0">COMPLIMENTARY 2-YEAR CONCIERGE WARRANTY ON ALL PRODUCTS</span>
          <span className="px-8 shrink-0">0% INTEREST EMI PLANS AVAILABLE ON ALL LAPTOPS & PHONES</span>

          {/* Duplicated Second Set for 100% Seamless Infinite Loop */}
          <span className="px-8 shrink-0">EXCLUSIVE LAUNCH OFFER: BUY ANY FLAGSHIP DEVICE, GET 50% OFF ACCESSORIES</span>
          <span className="px-8 shrink-0">FREE JBL FLIP 6 SPEAKER BUNDLE WITH APEX SMARTPHONE PRO</span>
          <span className="px-8 shrink-0">INSURED EXPRESS COURIER SHIPPING ON ORDERS OVER $99</span>
          <span className="px-8 shrink-0">COMPLIMENTARY 2-YEAR CONCIERGE WARRANTY ON ALL PRODUCTS</span>
          <span className="px-8 shrink-0">0% INTEREST EMI PLANS AVAILABLE ON ALL LAPTOPS & PHONES</span>
        </div>
      </div>

      {/* Main Transparent Header Navbar floating over Hero Section */}
      <header
        className={`fixed top-[28px] sm:top-[30px] left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled
            ? "bg-white/90 backdrop-blur-lg shadow-xl py-1.5 border-b border-[#e3beb8]/30"
            : "bg-transparent py-2.5"
        }`}
      >
        {/* Main Header Nav Bar Container */}
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-1">
          <div className="flex items-center justify-between gap-4">
            {/* Left Logo Anchor */}
            <Link href="/" className="flex items-center group focus:outline-none shrink-0 py-1">
              {/* eslint-disable-next-img-element */}
              <img
                src="/images/logo-cropped.png"
                alt="Shop-O-Holics - Spend Less, Save More... Shop Smart!!!"
                className="h-7 sm:h-9 md:h-10 max-w-[150px] sm:max-w-[210px] md:max-w-[240px] w-auto object-contain transition-transform group-hover:scale-105"
              />
            </Link>

            {/* Centered Desktop Floating Navigation Pill Bar */}
            <div className="hidden lg:flex items-center justify-center">
              <nav className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-[#e3beb8]/60 shadow-md hover:shadow-lg transition-all duration-300">
                {/* Home */}
                <Link
                  href="/"
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-200 ${
                    pathname === "/"
                      ? "bg-[#8b0000] text-white shadow-sm"
                      : "text-[#261816] hover:text-[#8b0000] hover:bg-[#ffe9e6]/70"
                  }`}
                >
                  Home
                </Link>

                {/* Shop */}
                <Link
                  href="/shop"
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-200 ${
                    pathname === "/shop"
                      ? "bg-[#8b0000] text-white shadow-sm"
                      : "text-[#261816] hover:text-[#8b0000] hover:bg-[#ffe9e6]/70"
                  }`}
                >
                  Shop
                </Link>

                {/* Category (Hardware Mega Menu Trigger) */}
                <div
                  className="relative flex items-center cursor-pointer h-full"
                  onMouseEnter={() => setIsMegaMenuOpen(true)}
                  onMouseLeave={() => setIsMegaMenuOpen(false)}
                >
                  <Link
                    href="/shop"
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-200 flex items-center gap-1 ${
                      isMegaMenuOpen
                        ? "bg-[#8b0000] text-white shadow-sm"
                        : "text-[#261816] hover:text-[#8b0000] hover:bg-[#ffe9e6]/70"
                    }`}
                  >
                    <span>Category</span>
                    <ChevronDown className={`w-3 h-3 transition-transform ${isMegaMenuOpen ? "rotate-180 text-white" : ""}`} />
                  </Link>

                  {/* MEGA DROPDOWN PANEL CONTAINING ALL 12 MAIN HARDWARE CATEGORIES & SUBCATEGORIES */}
                  <AnimatePresence>
                    {isMegaMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.98 }}
                        transition={{ duration: 0.18, ease: "easeOut" }}
                        className="absolute left-1/2 -translate-x-1/2 top-full pt-4 z-50 w-[780px]"
                      >
                        <div className="bg-white rounded-3xl p-5 border border-[#e3beb8] shadow-2xl grid grid-cols-12 gap-5 text-left font-sans">
                          {/* LEFT COLUMN: Dynamic WooCommerce Categories List */}
                          <div className="col-span-6 space-y-2 border-r border-[#ffe9e6] pr-4 max-h-[380px] overflow-y-auto no-scrollbar">
                            <div className="px-2 pb-2 border-b border-[#ffe9e6] text-[10px] font-extrabold text-[#8b0000] uppercase tracking-wider">
                              <span>{categoryTree.length} Storefront Categories</span>
                            </div>

                            <div className="space-y-1">
                              {isLoadingCategories ? (
                                <div className="p-4 text-xs font-semibold text-[#5a403c] text-center animate-pulse">
                                  Loading categories...
                                </div>
                              ) : categoryTree.length === 0 ? (
                                <div className="p-4 text-xs font-semibold text-[#5a403c] text-center">
                                  No categories available
                                </div>
                              ) : (
                                categoryTree.map((cat) => {
                                  const Icon = cat.icon;
                                  const isSelected = activeMegaCategory === cat.id;

                                  return (
                                    <Link
                                      key={cat.id}
                                      href={cat.href}
                                      onMouseEnter={() => setActiveMegaCategory(cat.id)}
                                      onClick={() => setIsMegaMenuOpen(false)}
                                      className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-bold text-left transition-all ${
                                        isSelected
                                          ? "bg-[#8b0000] text-white shadow-sm"
                                          : "text-[#261816] hover:bg-[#ffe9e6]"
                                      }`}
                                    >
                                      <div className="flex items-center gap-2.5">
                                        <Icon className="w-4 h-4 shrink-0" />
                                        <span>{cat.name}</span>
                                      </div>
                                      <div className="flex items-center gap-1.5">
                                        {cat.count > 0 && (
                                          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${isSelected ? "bg-white/20 text-white" : "bg-[#ffe9e6] text-[#8b0000]"}`}>
                                            {cat.count}
                                          </span>
                                        )}
                                        <ChevronRight className={`w-3.5 h-3.5 ${isSelected ? "text-white" : "text-[#8e706b]"}`} />
                                      </div>
                                    </Link>
                                  );
                                })
                              )}
                            </div>
                          </div>

                          {/* RIGHT COLUMN: Active Category Product Previews */}
                          <div className="col-span-6 space-y-3 pl-2 flex flex-col justify-between">
                            <div>
                              <div className="pb-2 border-b border-[#ffe9e6]">
                                <div>
                                  <h4 className="font-extrabold text-sm text-[#261816]">
                                    {currentActiveCategoryObj.name}
                                  </h4>
                                  <p className="text-[11px] text-[#5a403c] font-medium mt-0.5">
                                    {currentActiveCategoryObj.count > 0
                                      ? `${currentActiveCategoryObj.count} Available ${currentActiveCategoryObj.count === 1 ? "Product" : "Products"}`
                                      : "Browse Category"}
                                  </p>
                                </div>
                              </div>

                              {/* Category Product Preview List */}
                              <div className="space-y-2 pt-3 max-h-[250px] overflow-y-auto no-scrollbar">
                                {isLoadingPreview ? (
                                  <div className="space-y-2">
                                    {[1, 2].map((i) => (
                                      <div key={i} className="h-14 rounded-xl bg-[#fff5f3] border border-[#e3beb8]/40 animate-pulse p-2 flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-[#ffe9e6]" />
                                        <div className="flex-1 space-y-1.5">
                                          <div className="h-3 w-3/4 bg-[#ffe9e6] rounded" />
                                          <div className="h-2.5 w-1/3 bg-[#ffe9e6] rounded" />
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : previewError ? (
                                  <div className="p-3 bg-[#fff5f3] rounded-xl border border-[#e3beb8]/40 text-center space-y-1">
                                    <p className="text-xs font-bold text-[#261816]">Products temporarily unavailable</p>
                                    <Link
                                      href={currentActiveCategoryObj.href}
                                      onClick={() => setIsMegaMenuOpen(false)}
                                      className="inline-flex items-center gap-1 text-xs font-extrabold text-[#8b0000] hover:underline"
                                    >
                                      <span>Browse Category</span>
                                      <ChevronRight className="w-3.5 h-3.5" />
                                    </Link>
                                  </div>
                                ) : activePreviewProducts.length > 0 ? (
                                  activePreviewProducts.slice(0, 3).map((product) => {
                                    const imageSrc =
                                      product.featuredImage ||
                                      (Array.isArray(product.images) && product.images.length > 0
                                        ? typeof product.images[0] === "string"
                                          ? product.images[0]
                                          : (product.images[0] as any)?.src
                                        : "") ||
                                      "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?q=80&w=300&auto=format&fit=crop";

                                    const productName = (product as any).name || product.title || "";
                                    const regularPrice = product.originalPrice || (product as any).regular_price;

                                    return (
                                      <Link
                                        key={product.id}
                                        href={`/products/${product.slug}`}
                                        onClick={() => setIsMegaMenuOpen(false)}
                                        className="flex items-center gap-3 p-2 rounded-xl bg-[#fff5f3]/70 hover:bg-[#ffe9e6] border border-[#e3beb8]/40 hover:border-[#8b0000]/30 transition-all group/item shadow-sm"
                                      >
                                        <div className="w-11 h-11 shrink-0 rounded-lg bg-white border border-[#D4D3CD]/60 overflow-hidden flex items-center justify-center p-1 relative">
                                          {/* eslint-disable-next-img-element */}
                                          <img
                                            src={imageSrc}
                                            alt={productName}
                                            className="w-full h-full object-contain group-hover/item:scale-105 transition-transform"
                                          />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                          <h5 className="font-extrabold text-xs text-[#261816] group-hover/item:text-[#8b0000] transition-colors truncate">
                                            {decodeHtmlEntities(productName)}
                                          </h5>
                                          <div className="flex items-center gap-2 mt-0.5">
                                            <span className="font-extrabold text-xs text-[#8b0000]">
                                              {formatPrice(product.price)}
                                            </span>
                                            {regularPrice && Number(regularPrice) > Number(product.price) && (
                                              <span className="text-[10px] text-[#8e706b] line-through">
                                                {formatPrice(Number(regularPrice))}
                                              </span>
                                            )}
                                          </div>
                                        </div>

                                        <span className="text-[10px] font-bold text-[#8b0000] shrink-0 flex items-center gap-0.5 group-hover/item:translate-x-0.5 transition-transform">
                                          View <ChevronRight className="w-3 h-3" />
                                        </span>
                                      </Link>
                                    );
                                  })
                                ) : (
                                  <div className="p-3 bg-[#fff5f3] rounded-xl border border-[#e3beb8]/40 text-center space-y-1">
                                    <p className="text-xs font-bold text-[#261816]">No products currently available</p>
                                    <Link
                                      href={currentActiveCategoryObj.href}
                                      onClick={() => setIsMegaMenuOpen(false)}
                                      className="inline-flex items-center gap-1 text-xs font-extrabold text-[#8b0000] hover:underline"
                                    >
                                      <span>Browse Category</span>
                                      <ChevronRight className="w-3.5 h-3.5" />
                                    </Link>
                                  </div>
                                )}
                              </div>
                            </div>

                            <Link
                              href={currentActiveCategoryObj.href}
                              onClick={() => setIsMegaMenuOpen(false)}
                              className="w-full py-2.5 rounded-xl bg-[#8b0000] hover:bg-[#bc0000] text-white font-bold text-xs text-center shadow-sm flex items-center justify-center gap-1.5 transition-colors mt-3"
                            >
                              <span>Browse All {currentActiveCategoryObj.name} Products</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Compare */}
                <Link
                  href="/compare"
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-200 ${
                    pathname === "/compare"
                      ? "bg-[#8b0000] text-white shadow-sm"
                      : "text-[#261816] hover:text-[#8b0000] hover:bg-[#ffe9e6]/70"
                  }`}
                >
                  Compare
                </Link>
              </nav>
            </div>

            {/* Right Action Pill Group */}
            <div className="flex items-center gap-2 sm:gap-2.5">
              {/* Search Circular Button */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white border border-[#e3beb8]/60 shadow-sm hover:shadow-md text-[#261816] hover:text-[#8b0000] hover:bg-[#ffe9e6]/60 transition-all flex items-center justify-center"
                aria-label="Open search modal"
              >
                <Search className="w-4 h-4" />
              </button>

              {/* Wishlist Circular Button */}
              <Link
                href="/wishlist"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white border border-[#e3beb8]/60 shadow-sm hover:shadow-md flex items-center justify-center text-[#261816] hover:text-[#8b0000] hover:bg-[#ffe9e6]/60 transition-all relative"
                title="Wishlist"
              >
                <Heart className={`w-4 h-4 ${wishlistCount > 0 ? "text-[#8b0000] fill-[#8b0000]" : ""}`} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#8b0000] text-white text-[9px] font-extrabold flex items-center justify-center shadow-sm border border-white">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Compare Circular Button */}
              <Link
                href="/compare"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white border border-[#e3beb8]/60 shadow-sm hover:shadow-md hidden sm:flex items-center justify-center text-[#261816] hover:text-[#8b0000] hover:bg-[#ffe9e6]/60 transition-all relative"
                title="Compare Devices"
              >
                <ArrowLeftRight className="w-4 h-4" />
                {compareList.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#8b0000] text-white text-[9px] font-extrabold flex items-center justify-center shadow-sm border border-white">
                    {compareList.length}
                  </span>
                )}
              </Link>

              {/* User Account Circular Button with Auth Awareness */}
              <div className="relative hidden sm:block">
                {customerSession ? (
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="h-9 sm:h-10 px-3.5 rounded-full bg-[#ffe9e6] border border-[#e3beb8] shadow-sm hover:shadow-md flex items-center gap-2 text-[#8b0000] transition-all font-bold text-xs cursor-pointer"
                    title={`Logged in as ${customerSession.firstName}`}
                  >
                    <User className="w-4 h-4 text-[#8b0000]" />
                    <span>{customerSession.firstName}</span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isUserMenuOpen ? "rotate-180" : ""}`} />
                  </button>
                ) : (
                  <Link
                    href="/login"
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white border border-[#e3beb8]/60 shadow-sm hover:shadow-md flex items-center justify-center text-[#261816] hover:text-[#8b0000] hover:bg-[#ffe9e6]/60 transition-all"
                    title="Sign In to Account"
                  >
                    <User className="w-4 h-4" />
                  </Link>
                )}

                {/* Authenticated Customer Dropdown */}
                <AnimatePresence>
                  {isUserMenuOpen && customerSession && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-56 bg-white rounded-2xl p-2 shadow-xl border border-[#e3beb8] z-50 text-left"
                    >
                      <div className="p-3 border-b border-[#ffe9e6] space-y-0.5">
                        <p className="text-[10px] font-extrabold text-[#8b0000] uppercase tracking-wider">
                          Signed in as
                        </p>
                        <p className="text-xs font-extrabold text-[#261816] truncate">
                          {customerSession.firstName}
                        </p>
                        <p className="text-[10px] text-[#8e706b] truncate">{customerSession.email}</p>
                      </div>

                      <div className="py-1 space-y-0.5 text-xs font-bold">
                        <Link
                          href="/account"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#261816] hover:bg-[#ffe9e6] hover:text-[#8b0000] transition-colors"
                        >
                          <User className="w-4 h-4" />
                          <span>Dashboard</span>
                        </Link>

                        <Link
                          href="/account/orders"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#261816] hover:bg-[#ffe9e6] hover:text-[#8b0000] transition-colors"
                        >
                          <ShoppingBag className="w-4 h-4" />
                          <span>Order History</span>
                        </Link>

                        <Link
                          href="/account/addresses"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#261816] hover:bg-[#ffe9e6] hover:text-[#8b0000] transition-colors"
                        >
                          <ShieldCheck className="w-4 h-4" />
                          <span>Saved Addresses</span>
                        </Link>

                        <button
                          onClick={handleHeaderLogout}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-red-600 hover:bg-red-50 transition-colors text-left font-bold cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Shopping Bag Circular Button */}
              <Link
                href="/cart"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white border border-[#e3beb8]/60 shadow-sm hover:shadow-md flex items-center justify-center text-[#261816] hover:text-[#8b0000] hover:bg-[#ffe9e6]/60 transition-all relative shrink-0"
                title="Shopping Bag"
              >
                <ShoppingBag className="w-4 h-4" />
                {itemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#8b0000] text-white text-[9px] font-extrabold flex items-center justify-center shadow-sm border border-white">
                    {itemCount}
                  </span>
                )}
              </Link>

              {/* Mobile Hamburger Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white border border-[#e3beb8]/60 shadow-sm text-[#261816] hover:text-[#8b0000] lg:hidden flex items-center justify-center transition-colors"
                aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
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
                    <div className="w-7 h-7 rounded-lg bg-white text-[#8b0000] border border-[#e3beb8]/60 flex items-center justify-center font-bold text-sm shadow-sm">
                      S
                    </div>
                    <span className="font-extrabold text-base text-[#261816]">
                      Shop-O-Holics
                    </span>
                  </div>

                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-1 text-[#5a403c] hover:text-[#8b0000] transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Mobile Direct Nav Links */}
                <div className="flex items-center gap-4 text-xs font-extrabold text-[#261816]">
                  <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
                    Home
                  </Link>
                  <Link href="/shop" onClick={() => setIsMobileMenuOpen(false)}>
                    Shop
                  </Link>
                  <Link href="/compare" onClick={() => setIsMobileMenuOpen(false)}>
                    Compare
                  </Link>
                </div>

                {/* Mobile Accordion Categories */}
                <div className="space-y-2 pt-2 border-t border-[#ffe9e6]">
                  <div className="text-xs font-black uppercase text-[#8b0000] tracking-wider pb-1">
                    <span>{categoryTree.length} Categories</span>
                  </div>

                  <div className="space-y-1">
                    {categoryTree.map((cat) => {
                      const Icon = cat.icon;
                      const hasChildren = cat.subcategories.length > 0;
                      const isExpanded = expandedMobileCategory === cat.id;

                      if (!hasChildren) {
                        return (
                          <Link
                            key={cat.id}
                            href={cat.href}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="w-full flex items-center justify-between p-3 rounded-xl border border-[#ffe9e6] text-xs font-bold text-[#261816] bg-[#fff5f3] hover:bg-[#ffe9e6] transition-colors"
                          >
                            <div className="flex items-center gap-2.5">
                              <Icon className="w-4 h-4 text-[#8b0000]" />
                              <span>{cat.name}</span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-[#8e706b]" />
                          </Link>
                        );
                      }

                      return (
                        <div key={cat.id} className="rounded-xl border border-[#ffe9e6] overflow-hidden">
                          <button
                            onClick={() => setExpandedMobileCategory(isExpanded ? null : cat.id)}
                            className="w-full flex items-center justify-between p-3 text-xs font-bold text-[#261816] bg-[#fff5f3] hover:bg-[#ffe9e6] transition-colors text-left"
                          >
                            <div className="flex items-center gap-2.5">
                              <Icon className="w-4 h-4 text-[#8b0000]" />
                              <span>{cat.name}</span>
                            </div>
                            <ChevronDown className={`w-4 h-4 text-[#8e706b] transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                          </button>

                          {isExpanded && (
                            <div className="p-3 bg-white space-y-2 border-t border-[#ffe9e6]">
                              <div className="space-y-1">
                                {cat.subcategories.map((sub) => (
                                  <Link
                                    key={sub.id}
                                    href={sub.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="flex items-center justify-between p-2 text-xs text-[#261816] hover:text-[#8b0000] font-bold transition-colors rounded-lg hover:bg-[#ffe9e6]/50"
                                  >
                                    <span>• {sub.name}</span>
                                    {sub.count > 0 && (
                                      <span className="text-[9px] px-1.5 py-0.2 bg-[#ffe9e6] text-[#8b0000] font-extrabold rounded-full">
                                        {sub.count}
                                      </span>
                                    )}
                                  </Link>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Mobile Drawer Footer */}
              <div className="pt-4 border-t border-[#ffe9e6] space-y-3">
                <Link
                  href="/shop"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full py-3 bg-[#8b0000] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm"
                >
                  <span>Explore Full Catalog</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Global Interactive Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Responsive Structural Header Layout Spacer for Non-Homepage Routes */}
      {pathname !== "/" && (
        <div
          aria-hidden="true"
          className="h-[88px] sm:h-[96px] lg:h-[104px] w-full shrink-0 pointer-events-none select-none"
        />
      )}
    </>
  );
}
