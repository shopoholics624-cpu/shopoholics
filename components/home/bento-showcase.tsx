"use client";

import { useState } from "react";
import { DemoLink as Link } from "@/components/demo/demo-link";
import { useDemo } from "@/hooks/use-demo";
import { Heart, ArrowUpRight, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { PRODUCTS } from "@/constants/products";
import { formatPrice } from "@/lib/utils";

export function BentoShowcase() {
  const { handleDemoAction } = useDemo();
  const [favoriteIndex, setFavoriteIndex] = useState(0);

  const favoriteItems = [
    {
      title: "Chronos Watch",
      image: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?q=80&w=600&auto=format&fit=crop",
    },
    {
      title: "AeroBuds Max",
      image: "https://images.unsplash.com/photo-1545454675-3531b543be5d?q=80&w=600&auto=format&fit=crop",
    },
    {
      title: "Tactile Pad",
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600&auto=format&fit=crop",
    },
  ];

  const handleNextFav = () => {
    setFavoriteIndex((prev) => (prev + 1) % favoriteItems.length);
  };

  const handlePrevFav = () => {
    setFavoriteIndex((prev) => (prev - 1 + favoriteItems.length) % favoriteItems.length);
  };

  return (
    <section className="py-8 sm:py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4 border-b border-[#e3beb8]/40 pb-4 sm:pb-6">
          <div>
            <span className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-bold text-[#8b0000] uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5 text-[#e51c10]" /> Curated Spotlight Collections
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#261816] tracking-tight">
              Best Sellers & Trending Deals
            </h2>
            <p className="text-xs sm:text-sm text-[#5a403c] mt-1">
              Handpicked flagship devices, studio acoustics, and limited weekend offers.
            </p>
          </div>

          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#8b0000] hover:underline min-h-[44px]"
          >
            <span>Explore All Collections</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Master Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-stretch">
          {/* LEFT COLUMN */}
          <div className="lg:col-span-6 space-y-4 sm:space-y-6 flex flex-col justify-between">
            {/* Card 1: Top Wide Mint Green Promo Banner (Discount Card with Square Image) */}
            <div className="relative rounded-3xl sm:rounded-[32px] p-5 sm:p-8 bg-gradient-to-r from-[#d1f5e8] via-[#e2f9f0] to-[#c5f0e1] border border-[#a3e8d2]/60 overflow-hidden flex items-center justify-between min-h-[180px] sm:min-h-[220px] shadow-sm group">
              <div className="relative z-10 max-w-[55%] sm:max-w-xs space-y-2 sm:space-y-3">
                <h3 className="text-xl sm:text-3xl font-extrabold text-[#113a2e] tracking-tight leading-tight">
                  GET UP TO 50% OFF
                </h3>
                <Link
                  href="/shop?category=audio"
                  className="inline-block px-4 py-2 sm:px-5 sm:py-2.5 rounded-full bg-white/90 hover:bg-white backdrop-blur-md text-[#113a2e] font-bold text-xs shadow-md transition-all border border-white/60 min-h-[36px] sm:min-h-[44px]"
                >
                  Get Discount
                </Link>
              </div>

              {/* Square Image Format Container */}
              <div className="relative z-10 w-28 h-28 sm:w-40 sm:h-40 aspect-square rounded-2xl overflow-hidden border-2 border-white/80 shadow-md group-hover:scale-105 transition-transform duration-500 shrink-0">
                {/* eslint-disable-next-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1545454675-3531b543be5d?q=80&w=800&auto=format&fit=crop"
                  alt="50% Off Audio Promo"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Card 2: Middle Gold Banner (Weekend Card with Square Image) */}
            <div className="relative rounded-3xl sm:rounded-[32px] p-5 sm:p-8 bg-[#fef2c5] border border-[#fae298]/80 overflow-hidden flex items-center justify-between min-h-[160px] sm:min-h-[200px] shadow-sm group">
              <div className="space-y-1 relative z-10 max-w-[55%] sm:max-w-xs">
                <h3 className="text-xl sm:text-3xl font-extrabold text-[#3a2e11] tracking-tight">
                  Weekend Special
                </h3>
                <p className="text-[11px] sm:text-xs text-[#6e5922] font-semibold">
                  Keep it sleek with Titanium Pro
                </p>
              </div>

              <Link
                href="/products/flagship-smartphone-pro"
                className="absolute top-4 sm:top-6 left-4 sm:left-6 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white text-[#261816] flex items-center justify-center shadow-md group-hover:bg-[#8b0000] group-hover:text-white transition-colors z-20"
                aria-label="View Weekend Special"
              >
                <ArrowUpRight className="w-4 h-4" />
              </Link>

              {/* Square Image Format Container */}
              <div className="relative z-10 w-24 h-24 sm:w-36 sm:h-36 aspect-square rounded-2xl overflow-hidden border-2 border-white/80 shadow-md group-hover:scale-105 transition-transform duration-500 shrink-0">
                {/* eslint-disable-next-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?q=80&w=800&auto=format&fit=crop"
                  alt="Weekend Special Phone"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Bottom Row Grid inside Left Column */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {/* Card 5: Bottom-Left Card */}
              <div className="relative rounded-3xl sm:rounded-[32px] p-4 sm:p-5 bg-[#fff8f6] border border-[#e3beb8]/60 shadow-lux overflow-hidden min-h-[220px] sm:min-h-[240px] flex flex-col justify-between group">
                <button
                  onClick={handleDemoAction}
                  className="absolute top-3 sm:top-4 right-3 sm:right-4 p-2 rounded-full bg-white/80 hover:bg-white text-[#261816] shadow-sm z-10 transition-colors"
                  aria-label="Add to wishlist"
                >
                  <Heart className="w-4 h-4" />
                </button>

                {/* eslint-disable-next-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?q=80&w=600&auto=format&fit=crop"
                  alt="AeroBuds Studio"
                  className="w-full h-36 sm:h-44 object-cover rounded-2xl group-hover:scale-105 transition-transform duration-500"
                />

                <Link
                  href="/shop"
                  className="w-full py-2.5 sm:py-3 rounded-2xl bg-white/90 backdrop-blur-md text-[#8b0000] font-bold text-xs text-center border border-[#e3beb8]/60 shadow-md hover:bg-[#8b0000] hover:text-white transition-colors min-h-[40px] flex items-center justify-center mt-2"
                >
                  Avail Offers
                </Link>
              </div>

              {/* Card 6: Bottom-Center Favorites Mini Carousel */}
              <div className="rounded-3xl sm:rounded-[32px] p-4 sm:p-5 bg-[#fff0ee] border border-[#e3beb8]/60 shadow-lux flex flex-col justify-between min-h-[220px] sm:min-h-[240px]">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs sm:text-sm text-[#261816]">
                    Favourites
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={handlePrevFav}
                      className="p-1 rounded-full hover:bg-white text-[#261816] transition-colors"
                      aria-label="Previous favourite"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleNextFav}
                      className="p-1 rounded-full hover:bg-white text-[#261816] transition-colors"
                      aria-label="Next favourite"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 my-2">
                  {favoriteItems.slice(0, 2).map((item, idx) => (
                    <div key={idx} className="rounded-xl overflow-hidden bg-white p-1 border border-[#e3beb8]/40 shadow-sm">
                      {/* eslint-disable-next-img-element */}
                      <img src={item.image} alt={item.title} className="w-full h-16 sm:h-20 object-cover rounded-lg" />
                    </div>
                  ))}
                </div>

                <Link
                  href="/shop"
                  className="w-full py-2.5 rounded-xl bg-white text-[#261816] font-bold text-xs text-center border border-[#e3beb8] shadow-sm hover:bg-[#8b0000] hover:text-white transition-colors min-h-[40px] flex items-center justify-center"
                >
                  See All
                </Link>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="lg:col-span-6 space-y-4 sm:space-y-6 flex flex-col justify-between">
            {/* Top 2 Vertical Product Cards Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {/* Card 3: Top Product Card 1 */}
              <div className="bg-[#fff8f6] rounded-3xl sm:rounded-[32px] p-4 sm:p-5 border border-[#e3beb8]/60 shadow-lux flex flex-col justify-between overflow-hidden min-h-[320px] sm:min-h-[360px] relative group">
                <div>
                  <div className="flex items-center justify-between mb-2 sm:mb-3">
                    <div className="flex items-center gap-1.5">
                      <span className="w-3.5 h-3.5 rounded-full bg-[#8b0000] border border-black/20" />
                      <span className="w-3.5 h-3.5 rounded-full bg-[#e3beb8] border border-black/20" />
                    </div>
                    <button
                      onClick={handleDemoAction}
                      className="p-1.5 rounded-full bg-white hover:bg-[#ffe9e6] text-[#5a403c] transition-colors"
                      aria-label="Wishlist"
                    >
                      <Heart className="w-4 h-4" />
                    </button>
                  </div>

                  <Link href={`/products/${PRODUCTS[0].slug}`}>
                    {/* eslint-disable-next-img-element */}
                    <img
                      src={PRODUCTS[0].featuredImage}
                      alt={PRODUCTS[0].title}
                      className="w-full h-36 sm:h-44 object-cover rounded-2xl group-hover:scale-105 transition-transform duration-500"
                    />
                  </Link>
                </div>

                <div className="mt-3 sm:mt-4 flex items-end justify-between pt-3 border-t border-[#ffe9e6]">
                  <div>
                    <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-[#8e706b] block">
                      Our Picks
                    </span>
                    <h4 className="font-extrabold text-xs sm:text-sm text-[#261816] line-clamp-1 mt-0.5">
                      {PRODUCTS[0].title}
                    </h4>
                  </div>

                  <Link
                    href={`/products/${PRODUCTS[0].slug}`}
                    className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full bg-[#0055ff] hover:bg-[#0040cc] text-white font-bold text-xs shadow-md transition-colors shrink-0"
                  >
                    {formatPrice(PRODUCTS[0].price)}
                  </Link>
                </div>
              </div>

              {/* Card 4: Top Product Card 2 */}
              <div className="bg-[#fff8f6] rounded-3xl sm:rounded-[32px] p-4 sm:p-5 border border-[#e3beb8]/60 shadow-lux flex flex-col justify-between overflow-hidden min-h-[320px] sm:min-h-[360px] relative group">
                <div>
                  <div className="flex items-center justify-between mb-2 sm:mb-3">
                    <div className="flex items-center gap-1.5">
                      <span className="w-3.5 h-3.5 rounded-full bg-[#261816] border border-black/20" />
                      <span className="w-3.5 h-3.5 rounded-full bg-[#8e706b] border border-black/20" />
                    </div>
                    <button
                      onClick={handleDemoAction}
                      className="p-1.5 rounded-full bg-white hover:bg-[#ffe9e6] text-[#5a403c] transition-colors"
                      aria-label="Wishlist"
                    >
                      <Heart className="w-4 h-4" />
                    </button>
                  </div>

                  <Link href={`/products/${PRODUCTS[1].slug}`}>
                    {/* eslint-disable-next-img-element */}
                    <img
                      src={PRODUCTS[1].featuredImage}
                      alt={PRODUCTS[1].title}
                      className="w-full h-36 sm:h-44 object-cover rounded-2xl group-hover:scale-105 transition-transform duration-500"
                    />
                  </Link>
                </div>

                <div className="mt-3 sm:mt-4 flex items-end justify-between pt-3 border-t border-[#ffe9e6]">
                  <div>
                    <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-[#8e706b] block">
                      Best Seller
                    </span>
                    <h4 className="font-extrabold text-xs sm:text-sm text-[#261816] line-clamp-1 mt-0.5">
                      {PRODUCTS[1].title}
                    </h4>
                  </div>

                  <Link
                    href={`/products/${PRODUCTS[1].slug}`}
                    className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full bg-[#0055ff] hover:bg-[#0040cc] text-white font-bold text-xs shadow-md transition-colors shrink-0"
                  >
                    {formatPrice(PRODUCTS[1].price)}
                  </Link>
                </div>
              </div>
            </div>

            {/* Card 7: Bottom Wide Banner Card (Bring Bold Innovation with Square Image) */}
            <div className="relative rounded-3xl sm:rounded-[32px] p-5 sm:p-8 bg-[#f4f7f6] border border-[#d8e2df]/80 overflow-hidden flex items-center justify-between min-h-[160px] sm:min-h-[190px] shadow-sm group">
              <div className="space-y-1 relative z-10 max-w-[55%] sm:max-w-xs">
                <h3 className="text-xl sm:text-3xl font-extrabold text-[#1a2d27] tracking-tight">
                  Bring Bold Innovation
                </h3>
                <p className="text-[11px] sm:text-xs text-[#4b635c] font-semibold">
                  3nm Neural Engine & Studio Optics
                </p>
              </div>

              <Link
                href="/shop?category=optics"
                className="absolute top-4 sm:top-6 left-4 sm:left-6 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white text-[#261816] flex items-center justify-center shadow-md group-hover:bg-[#8b0000] group-hover:text-white transition-colors z-20"
                aria-label="Explore Optics"
              >
                <ArrowUpRight className="w-4 h-4" />
              </Link>

              {/* Square Image Format Container */}
              <div className="relative z-10 w-24 h-24 sm:w-36 sm:h-36 aspect-square rounded-2xl overflow-hidden border-2 border-white/80 shadow-md group-hover:scale-105 transition-transform duration-500 shrink-0">
                {/* eslint-disable-next-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=800&auto=format&fit=crop"
                  alt="Bold Innovation Optics"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
