"use client";

import { use, useState, useEffect } from "react";
import { PRODUCTS } from "@/constants/products";
import { useCart } from "@/hooks/use-cart";
import { useCompare } from "@/hooks/use-compare";
import { useDemo } from "@/hooks/use-demo";
import { formatPrice } from "@/lib/utils";
import { RatingStars } from "@/components/common/rating-stars";
import { FreeGiftBundleCard } from "@/components/product/free-gift-bundle-card";
import { InteractiveCanvas } from "@/components/product-detail/interactive-canvas";
import { DemoLink as Link } from "@/components/demo/demo-link";
import {
  ShoppingBag,
  ArrowLeftRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  Check,
  Sparkles,
  ArrowLeft,
  ChevronRight,
  ChevronLeft,
  X,
  ZoomIn,
} from "lucide-react";

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = use(params);
  const rawSlug = resolvedParams?.slug || "";
  const targetSlug = decodeURIComponent(rawSlug || "").toLowerCase();

  const product =
    PRODUCTS.find(
      (p) =>
        p.slug.toLowerCase() === targetSlug ||
        p.id.toLowerCase() === targetSlug
    ) || PRODUCTS[0];

  const { addToCart } = useCart();
  const { addToCompare, isInCompare, removeFromCompare } = useCompare();
  const { isDemoMode, handleDemoAction } = useDemo();

  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<"specs" | "features" | "warranty">("specs");
  const [added, setAdded] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const activeVariant = product.variants[selectedVariantIndex] || product.variants[0];
  const inCompare = isInCompare(product.id);

  // Auto-scroll product gallery images every 3.5 seconds if modal is closed
  useEffect(() => {
    if (isLightboxOpen || !product.images || product.images.length <= 1) return;
    const interval = setInterval(() => {
      setSelectedImageIndex((prev) => (prev + 1) % product.images.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [product.images, isLightboxOpen]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isLightboxOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isLightboxOpen]);

  const handleAddToCart = (e: React.MouseEvent) => {
    addToCart(product, activeVariant);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleToggleCompare = (e: React.MouseEvent) => {
    if (isDemoMode) {
      handleDemoAction(e);
      return;
    }
    if (inCompare) {
      removeFromCompare(product.id);
    } else {
      addToCompare(product);
    }
  };

  const handlePrevImage = () => {
    setSelectedImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
  };

  const handleNextImage = () => {
    setSelectedImageIndex((prev) => (prev + 1) % product.images.length);
  };

  return (
    <div className="py-6 sm:py-8 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-1.5 text-[11px] text-[#5a403c]">
          <Link href="/shop" className="hover:text-[#8b0000] flex items-center gap-1 font-semibold">
            <ArrowLeft className="w-3 h-3" /> Catalog
          </Link>
          <ChevronRight className="w-2.5 h-2.5 text-[#8e706b]" />
          <Link href={`/shop?category=${product.category}`} className="hover:text-[#8b0000] capitalize">
            {product.category}
          </Link>
          <ChevronRight className="w-2.5 h-2.5 text-[#8e706b]" />
          <span className="font-bold text-[#8b0000] truncate max-w-[180px]">
            {product.title}
          </span>
        </div>

        {/* Main Product Hero Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start">
          {/* Left Media Gallery Column (Thumbnails UNDER Main Image) */}
          <div className="lg:col-span-7 flex flex-col space-y-3">
            {/* Main Image Container */}
            <div
              onClick={() => setIsLightboxOpen(true)}
              className="relative rounded-2xl sm:rounded-3xl bg-white p-2.5 sm:p-3 border border-[#e3beb8]/60 shadow-lux overflow-hidden w-full cursor-zoom-in group"
            >
              {/* Main Image */}
              {/* eslint-disable-next-img-element */}
              <img
                src={product.images[selectedImageIndex] || product.featuredImage}
                alt={product.title}
                className="w-full h-[260px] sm:h-[340px] lg:h-[380px] object-cover rounded-xl sm:rounded-2xl transition-transform duration-500 group-hover:scale-105"
              />

              {product.badge && (
                <span className="absolute top-4 left-4 px-3 py-0.5 bg-[#8b0000] text-white text-[10px] sm:text-xs font-bold uppercase tracking-wider rounded-full shadow-md flex items-center gap-1 z-10">
                  <Sparkles className="w-3 h-3 text-[#e51c10]" /> {product.badge}
                </span>
              )}

              {/* Click to Zoom Overlay Badge */}
              <span className="absolute bottom-4 right-4 p-2 bg-black/60 backdrop-blur-md text-white rounded-full shadow-md opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all flex items-center gap-1 text-[10px] sm:text-xs font-medium z-10">
                <ZoomIn className="w-3.5 h-3.5" />
              </span>
            </div>

            {/* Extra Images Thumbnail Track (UNDER Main Image) */}
            <div className="flex gap-2.5 sm:gap-3 overflow-x-auto pb-1 scroll-smooth no-scrollbar">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                    selectedImageIndex === idx
                      ? "border-[#8b0000] shadow-md scale-105"
                      : "border-[#e3beb8]/60 opacity-70 hover:opacity-100"
                  }`}
                >
                  {/* eslint-disable-next-img-element */}
                  <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Right Product Buying Controls (Compact & Refined) */}
          <div className="lg:col-span-5 bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-[#e3beb8]/60 shadow-lux space-y-4">
            {/* Seamless Product Title & Price Header Block */}
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold text-[#8b0000] uppercase tracking-wider">
                  {product.categoryLabel}
                </span>
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200/60 rounded-full text-[9px] font-bold uppercase tracking-wider">
                  In Stock
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                <h1 className="text-base sm:text-lg font-bold text-[#261816] tracking-tight leading-snug">
                  {product.title}
                </h1>
                <div className="flex items-baseline gap-1.5 shrink-0">
                  <span className="text-xl sm:text-2xl font-black text-[#8b0000]">
                    {formatPrice(activeVariant.price)}
                  </span>
                  {activeVariant.originalPrice && (
                    <span className="text-[11px] sm:text-xs text-[#8e706b] line-through font-medium">
                      {formatPrice(activeVariant.originalPrice)}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-0.5">
                <RatingStars rating={product.rating} reviewCount={product.reviewCount} size={12} />
                <span className="text-[10px] text-[#8e706b]">| ID: {product.id}</span>
              </div>

              {/* Dynamic Compact Free Gift Bundle Card */}
              {product.freeGiftBundle && (
                <div className="pt-1.5">
                  <FreeGiftBundleCard bundle={product.freeGiftBundle} />
                </div>
              )}
            </div>

            {/* Horizontal Scroll Track for Product Variants Across All Screen Sizes */}
            <div className="space-y-1.5">
              <label className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#8e706b] block">
                Select Finish & Edition
              </label>

              <div
                className="flex gap-2 overflow-x-auto pb-1.5 no-scrollbar touch-pan-x overscroll-x-contain"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none", WebkitOverflowScrolling: "touch" }}
              >
                {product.variants.map((variant, idx) => (
                  <button
                    key={variant.id}
                    onClick={() => setSelectedVariantIndex(idx)}
                    className={`shrink-0 min-w-[115px] sm:min-w-[130px] flex items-center justify-between p-2 rounded-xl border transition-all ${
                      selectedVariantIndex === idx
                        ? "border-[#8b0000] bg-[#ffe9e6]/40 shadow-xs"
                        : "border-[#e3beb8]/50 hover:border-[#8b0000]/40 bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span
                        className="w-3 h-3 rounded-full border border-black/20 shadow-xs shrink-0"
                        style={{ backgroundColor: variant.colorHex }}
                      />
                      <span className="text-[10px] sm:text-[11px] font-bold text-[#261816] truncate max-w-[65px] sm:max-w-[80px]">
                        {variant.name}
                      </span>
                    </div>
                    <span className="text-[10px] sm:text-[11px] font-extrabold text-[#8b0000] ml-1 shrink-0">
                      {formatPrice(variant.price)}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Compact Action Buttons */}
            <div className="space-y-2 pt-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  onClick={handleAddToCart}
                  className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 transition-all duration-300 min-h-[42px] ${
                    added
                      ? "bg-emerald-700 text-white"
                      : "bg-[#8b0000] hover:bg-[#bc0000] text-white"
                  }`}
                >
                  {added ? (
                    <>
                      <Check className="w-3.5 h-3.5" /> Added to Bag
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-3.5 h-3.5" /> Add to Cart
                    </>
                  )}
                </button>

                <Link
                  href="/checkout/shipping"
                  onClick={handleAddToCart}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#261816] hover:bg-[#3d2c2a] text-white font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 transition-all min-h-[42px]"
                >
                  Buy Now
                </Link>
              </div>

              <button
                onClick={handleToggleCompare}
                className={`w-full py-2 px-3 rounded-xl border text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all min-h-[36px] ${
                  inCompare
                    ? "bg-[#8b0000] text-white border-[#8b0000]"
                    : "border-[#e3beb8] text-[#5a403c] hover:border-[#8b0000] hover:text-[#8b0000]"
                }`}
              >
                <ArrowLeftRight className="w-3 h-3" />
                {inCompare ? "Remove from Comparison" : "Add to Hardware Comparison"}
              </button>
            </div>

            {/* Value Highlights */}
            <div className="grid grid-cols-3 gap-1.5 pt-3 border-t border-[#e3beb8]/40 text-center">
              <div className="p-1 space-y-0.5">
                <ShieldCheck className="w-4 h-4 text-[#8b0000] mx-auto" />
                <span className="text-[9px] font-bold text-[#261816] block">2-Yr Warranty</span>
              </div>
              <div className="p-1 space-y-0.5 border-x border-[#e3beb8]/40">
                <Truck className="w-4 h-4 text-[#8b0000] mx-auto" />
                <span className="text-[9px] font-bold text-[#261816] block">Express Courier</span>
              </div>
              <div className="p-1 space-y-0.5">
                <RotateCcw className="w-4 h-4 text-[#8b0000] mx-auto" />
                <span className="text-[9px] font-bold text-[#261816] block">30-Day Return</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabbed Specifications & Features Showcase */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-[#e3beb8]/60 shadow-lux space-y-6">
          <div className="flex border-b border-[#e3beb8]/40 gap-6">
            <button
              onClick={() => setActiveTab("specs")}
              className={`pb-2.5 text-xs sm:text-sm font-bold tracking-tight transition-all border-b-2 ${
                activeTab === "specs"
                  ? "border-[#8b0000] text-[#8b0000]"
                  : "border-transparent text-[#8e706b] hover:text-[#261816]"
              }`}
            >
              Technical Specifications
            </button>
            <button
              onClick={() => setActiveTab("features")}
              className={`pb-2.5 text-xs sm:text-sm font-bold tracking-tight transition-all border-b-2 ${
                activeTab === "features"
                  ? "border-[#8b0000] text-[#8b0000]"
                  : "border-transparent text-[#8e706b] hover:text-[#261816]"
              }`}
            >
              Engineering Features
            </button>
            <button
              onClick={() => setActiveTab("warranty")}
              className={`pb-2.5 text-xs sm:text-sm font-bold tracking-tight transition-all border-b-2 ${
                activeTab === "warranty"
                  ? "border-[#8b0000] text-[#8b0000]"
                  : "border-transparent text-[#8e706b] hover:text-[#261816]"
              }`}
            >
              Warranty & Service
            </button>
          </div>

          {activeTab === "specs" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {product.specs.map((spec, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-[#fff8f6] border border-[#e3beb8]/40 space-y-0.5">
                  <span className="text-[9px] font-bold text-[#8e706b] uppercase tracking-wider block">
                    {spec.name}
                  </span>
                  <span className="text-xs font-bold text-[#261816] block">
                    {spec.value}
                  </span>
                </div>
              ))}
            </div>
          )}

          {activeTab === "features" && (
            <div className="space-y-3">
              <p className="text-xs text-[#5a403c] leading-relaxed">
                {product.description}
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                <li className="flex items-center gap-2 text-xs font-semibold text-[#261816]">
                  <Check className="w-3.5 h-3.5 text-[#8b0000]" /> Precision Grade 5 Titanium Chassis
                </li>
                <li className="flex items-center gap-2 text-xs font-semibold text-[#261816]">
                  <Check className="w-3.5 h-3.5 text-[#8b0000]" /> Custom High-Excursion Acoustic Drivers
                </li>
                <li className="flex items-center gap-2 text-xs font-semibold text-[#261816]">
                  <Check className="w-3.5 h-3.5 text-[#8b0000]" /> Neural Engine Hardware Acceleration
                </li>
                <li className="flex items-center gap-2 text-xs font-semibold text-[#261816]">
                  <Check className="w-3.5 h-3.5 text-[#8b0000]" /> Insured Global Express Shipping Included
                </li>
              </ul>
            </div>
          )}

          {activeTab === "warranty" && (
            <div className="space-y-2 text-xs text-[#5a403c] leading-relaxed">
              <p className="font-semibold text-[#261816]">
                Every Shop-O-Holics flagship hardware unit includes 24 months of worldwide concierge warranty coverage.
              </p>
              <p>
                In the event of accidental damage or technical defects, our hardware replacement program guarantees express courier dispatch of a replacement unit within 24 hours.
              </p>
            </div>
          )}
        </div>

        {/* 3D Interactive Canvas Preview Section */}
        <InteractiveCanvas />
      </div>

      {/* Lightbox High-Resolution Image Preview Modal */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-lg flex flex-col items-center justify-between p-4 sm:p-6 animate-in fade-in duration-200">
          {/* Top Bar */}
          <div className="w-full max-w-6xl flex items-center justify-between text-white z-10 pt-2">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm sm:text-base tracking-tight">{product.title}</span>
              <span className="text-xs text-white/60">
                ({selectedImageIndex + 1} / {product.images.length})
              </span>
            </div>
            <button
              onClick={() => setIsLightboxOpen(false)}
              className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              aria-label="Close Lightbox"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Main Large Image & Cycle Arrows */}
          <div className="relative max-w-5xl w-full flex-1 flex items-center justify-center my-4">
            <button
              onClick={handlePrevImage}
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/25 text-white transition-all z-20 cursor-pointer shadow-lg backdrop-blur-md"
              aria-label="Previous Image"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* eslint-disable-next-img-element */}
            <img
              src={product.images[selectedImageIndex] || product.featuredImage}
              alt={`${product.title} expanded view`}
              className="max-h-[70vh] max-w-full object-contain rounded-2xl shadow-2xl transition-all duration-300"
            />

            <button
              onClick={handleNextImage}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/25 text-white transition-all z-20 cursor-pointer shadow-lg backdrop-blur-md"
              aria-label="Next Image"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Bottom Thumbnail Strip inside Lightbox Modal */}
          <div className="w-full max-w-xl flex gap-3 overflow-x-auto justify-center pb-2 no-scrollbar z-10">
            {product.images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImageIndex(idx)}
                className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                  selectedImageIndex === idx
                    ? "border-white scale-110 shadow-lg"
                    : "border-white/30 opacity-60 hover:opacity-100"
                }`}
              >
                {/* eslint-disable-next-img-element */}
                <img src={img} alt={`Modal thumbnail ${idx}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
