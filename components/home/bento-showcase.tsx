"use client";

import { useState, useEffect } from "react";
import { DemoLink as Link } from "@/components/demo/demo-link";
import { useDemo } from "@/hooks/use-demo";
import { Heart, ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import { PRODUCTS } from "@/constants/products";
import { formatPrice } from "@/lib/utils";

export function BentoShowcase() {
  const { handleDemoAction } = useDemo();
  const [favoriteIndex, setFavoriteIndex] = useState(0);
  const [products, setProducts] = useState(PRODUCTS);

  useEffect(() => {
    let isMounted = true;
    async function fetchBentoProducts() {
      try {
        const res = await fetch("/api/products?per_page=12");
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.success && Array.isArray(data.products) && data.products.length >= 2) {
            setProducts(data.products);
          }
        }
      } catch (err) {
        console.warn("[BentoShowcase] WooCommerce fetch fallback:", err);
      }
    }
    fetchBentoProducts();
    return () => {
      isMounted = false;
    };
  }, []);

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
    <section className="py-4 sm:py-6 lg:py-8 bg-white">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-[#D4D3CD]/60 pb-5">
          <div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#1C1C1A] tracking-tight">
              Best Sellers & Trending Deals
            </h2>
            <p className="text-sm sm:text-base text-[#5A5954] mt-1.5 font-medium">
              Handpicked flagship devices, studio acoustics, and limited weekend offers.
            </p>
          </div>

          <Link
            href="/shop"
            className="inline-flex items-center gap-1 text-xs font-bold text-[#8b0000] hover:underline min-h-[40px]"
          >
            <span>Explore All Collections</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Master Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
          {/* LEFT COLUMN */}
          <div className="lg:col-span-6 space-y-4 flex flex-col justify-between">
            {/* Card 1: Top Promo Banner */}
            <div className="relative z-0 hover:z-20 rounded-2xl sm:rounded-3xl p-4 sm:p-6 bg-[#F1F0EC] hover:bg-[#E6E5DF] border border-[#D4D3CD] hover:border-[#4A4944] hover:-translate-y-1 transition-all duration-300 overflow-hidden flex items-center justify-between min-h-[150px] sm:min-h-[180px] shadow-sm group">
              <div className="relative z-10 max-w-[60%] sm:max-w-xs space-y-2">
                <h3 className="text-lg sm:text-2xl font-extrabold text-[#8b0000] tracking-tight leading-tight">
                  GET UP TO 50% OFF
                </h3>
                <Link
                  href="/shop?category=audio"
                  className="inline-block px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full bg-[#8b0000] hover:bg-[#bc0000] text-white font-bold text-xs shadow-md transition-all border border-white/60 min-h-[36px]"
                >
                  Get Discount
                </Link>
              </div>

              <div className="relative z-10 w-24 h-24 sm:w-32 sm:h-32 aspect-square rounded-xl sm:rounded-2xl overflow-hidden border-2 border-white shadow-md group-hover:scale-105 transition-transform duration-500 shrink-0">
                {/* eslint-disable-next-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1545454675-3531b543be5d?q=80&w=800&auto=format&fit=crop"
                  alt="50% Off Audio Promo"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Card 2: Middle Special Banner */}
            <div className="relative z-0 hover:z-20 rounded-2xl sm:rounded-3xl p-4 sm:p-6 bg-[#F1F0EC] hover:bg-[#E6E5DF] border border-[#D4D3CD] hover:border-[#4A4944] hover:-translate-y-1 transition-all duration-300 overflow-hidden flex items-center justify-between min-h-[140px] sm:min-h-[160px] shadow-sm group">
              <div className="space-y-0.5 relative z-10 max-w-[60%] sm:max-w-xs">
                <h3 className="text-lg sm:text-2xl font-extrabold text-[#1C1C1A] tracking-tight">
                  Weekend Special
                </h3>
                <p className="text-[11px] text-[#5A5954] font-semibold">
                  Keep it sleek with Titanium Pro
                </p>
              </div>

              <Link
                href="/products/flagship-smartphone-pro"
                className="absolute top-4 left-4 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white text-[#1C1C1A] flex items-center justify-center shadow-md group-hover:bg-[#8b0000] group-hover:text-white transition-colors z-20"
                aria-label="View Weekend Special"
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>

              <div className="relative z-10 w-20 h-20 sm:w-28 sm:h-28 aspect-square rounded-xl sm:rounded-2xl overflow-hidden border-2 border-white shadow-md group-hover:scale-105 transition-transform duration-500 shrink-0">
                {/* eslint-disable-next-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?q=80&w=800&auto=format&fit=crop"
                  alt="Weekend Special Phone"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Bottom Row Grid inside Left Column */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Card 5: Bottom-Left Card */}
              <div className="relative z-0 hover:z-20 rounded-2xl sm:rounded-3xl p-4 bg-[#F1F0EC] hover:bg-[#E6E5DF] border border-[#D4D3CD] hover:border-[#4A4944] hover:-translate-y-1 transition-all duration-300 shadow-sm overflow-hidden min-h-[190px] flex flex-col justify-between group">
                <button
                  onClick={handleDemoAction}
                  className="absolute top-3 right-3 p-1.5 rounded-full bg-white hover:bg-[#F1F0EC] text-[#1C1C1A] shadow-sm z-10 transition-colors"
                  aria-label="Add to wishlist"
                >
                  <Heart className="w-3.5 h-3.5" />
                </button>

                {/* eslint-disable-next-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?q=80&w=600&auto=format&fit=crop"
                  alt="AeroBuds Studio"
                  className="w-full h-28 sm:h-36 object-cover rounded-xl group-hover:scale-105 transition-transform duration-500"
                />

                <Link
                  href="/shop"
                  className="w-full py-2 rounded-xl bg-white text-[#8b0000] font-bold text-xs text-center border border-[#D4D3CD] shadow-sm hover:bg-[#8b0000] hover:text-white transition-colors min-h-[36px] flex items-center justify-center mt-2"
                >
                  Avail Offers
                </Link>
              </div>

              {/* Card 6: Bottom-Center Favorites Mini Carousel */}
              <div className="rounded-2xl sm:rounded-3xl p-4 bg-[#F1F0EC] border border-[#D4D3CD] shadow-sm flex flex-col justify-between min-h-[190px]">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs text-[#1C1C1A]">
                    Favourites
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={handlePrevFav}
                      className="p-1 rounded-full hover:bg-white text-[#1C1C1A] transition-colors"
                      aria-label="Previous favourite"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={handleNextFav}
                      className="p-1 rounded-full hover:bg-white text-[#1C1C1A] transition-colors"
                      aria-label="Next favourite"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 my-2">
                  {favoriteItems.slice(0, 2).map((item, idx) => (
                    <div key={idx} className="rounded-lg overflow-hidden bg-white p-1 border border-[#D4D3CD]/60 shadow-sm">
                      {/* eslint-disable-next-img-element */}
                      <img src={item.image} alt={item.title} className="w-full h-14 sm:h-16 object-cover rounded-md" />
                    </div>
                  ))}
                </div>

                <Link
                  href="/shop"
                  className="w-full py-2 rounded-lg bg-white text-[#1C1C1A] font-bold text-xs text-center border border-[#D4D3CD] shadow-sm hover:bg-[#8b0000] hover:text-white transition-colors min-h-[36px] flex items-center justify-center"
                >
                  See All
                </Link>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="lg:col-span-6 space-y-4 flex flex-col justify-between">
            {/* Top 2 Vertical Product Cards Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Card 3: Top Product Card 1 */}
              <div className="bg-[#F1F0EC] hover:bg-[#E6E5DF] rounded-2xl sm:rounded-3xl p-4 border border-[#D4D3CD] shadow-sm hover:shadow-xl hover:border-[#4A4944] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden min-h-[260px] sm:min-h-[300px] relative group">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1">
                      <span className="w-3 h-3 rounded-full bg-[#8b0000] border border-black/20" />
                      <span className="w-3 h-3 rounded-full bg-[#D4D3CD] border border-black/20" />
                    </div>
                    <button
                      onClick={handleDemoAction}
                      className="p-1 rounded-full bg-white text-[#5A5954] hover:text-[#8b0000] transition-colors"
                      aria-label="Wishlist"
                    >
                      <Heart className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <Link href={`/products/${products[0]?.slug || PRODUCTS[0].slug}`}>
                    {/* eslint-disable-next-img-element */}
                    <img
                      src={products[0]?.featuredImage || PRODUCTS[0].featuredImage}
                      alt={products[0]?.title || PRODUCTS[0].title}
                      className="w-full h-28 sm:h-36 object-cover rounded-xl group-hover:scale-105 transition-transform duration-500"
                    />
                  </Link>
                </div>

                <div className="mt-3 flex items-end justify-between pt-2 border-t border-[#D4D3CD]/60">
                  <div>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-[#5A5954] block">
                      Our Picks
                    </span>
                    <h4 className="font-extrabold text-xs text-[#1C1C1A] line-clamp-1 mt-0.5">
                      {products[0]?.title || PRODUCTS[0].title}
                    </h4>
                  </div>

                  <Link
                    href={`/products/${products[0]?.slug || PRODUCTS[0].slug}`}
                    className="px-3 py-1 rounded-full bg-[#8b0000] hover:bg-[#bc0000] text-white font-bold text-xs shadow-sm transition-colors shrink-0"
                  >
                    {formatPrice(products[0]?.price || PRODUCTS[0].price)}
                  </Link>
                </div>
              </div>

              {/* Card 4: Top Product Card 2 */}
              <div className="bg-[#F1F0EC] hover:bg-[#E6E5DF] rounded-2xl sm:rounded-3xl p-4 border border-[#D4D3CD] shadow-sm hover:shadow-xl hover:border-[#4A4944] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden min-h-[260px] sm:min-h-[300px] relative group">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1">
                      <span className="w-3 h-3 rounded-full bg-[#1C1C1A] border border-black/20" />
                      <span className="w-3 h-3 rounded-full bg-[#5A5954] border border-black/20" />
                    </div>
                    <button
                      onClick={handleDemoAction}
                      className="p-1 rounded-full bg-white text-[#5A5954] hover:text-[#8b0000] transition-colors"
                      aria-label="Wishlist"
                    >
                      <Heart className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <Link href={`/products/${products[1]?.slug || PRODUCTS[1].slug}`}>
                    {/* eslint-disable-next-img-element */}
                    <img
                      src={products[1]?.featuredImage || PRODUCTS[1].featuredImage}
                      alt={products[1]?.title || PRODUCTS[1].title}
                      className="w-full h-28 sm:h-36 object-cover rounded-xl group-hover:scale-105 transition-transform duration-500"
                    />
                  </Link>
                </div>

                <div className="mt-3 flex items-end justify-between pt-2 border-t border-[#D4D3CD]/60">
                  <div>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-[#5A5954] block">
                      Best Seller
                    </span>
                    <h4 className="font-extrabold text-xs text-[#1C1C1A] line-clamp-1 mt-0.5">
                      {products[1]?.title || PRODUCTS[1].title}
                    </h4>
                  </div>

                  <Link
                    href={`/products/${products[1]?.slug || PRODUCTS[1].slug}`}
                    className="px-3 py-1 rounded-full bg-[#8b0000] hover:bg-[#bc0000] text-white font-bold text-xs shadow-sm transition-colors shrink-0"
                  >
                    {formatPrice(products[1]?.price || PRODUCTS[1].price)}
                  </Link>
                </div>
              </div>
            </div>

            {/* Card 7: Bottom Wide Banner Card */}
            <div className="relative rounded-2xl sm:rounded-3xl p-4 sm:p-6 bg-[#F1F0EC] hover:bg-[#E6E5DF] border border-[#D4D3CD] hover:border-[#4A4944] hover:-translate-y-1 transition-all duration-300 overflow-hidden flex items-center justify-between min-h-[140px] sm:min-h-[160px] shadow-sm group">
              <div className="space-y-0.5 relative z-10 max-w-[60%] sm:max-w-xs">
                <h3 className="text-lg sm:text-2xl font-extrabold text-[#1C1C1A] tracking-tight">
                  Bring Bold Innovation
                </h3>
                <p className="text-[11px] text-[#5A5954] font-semibold">
                  3nm Neural Engine & Studio Optics
                </p>
              </div>

              <Link
                href="/shop?category=optics"
                className="absolute top-4 left-4 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white text-[#1C1C1A] flex items-center justify-center shadow-md group-hover:bg-[#8b0000] group-hover:text-white transition-colors z-20"
                aria-label="Explore Optics"
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>

              <div className="relative z-10 w-20 h-20 sm:w-28 sm:h-28 aspect-square rounded-xl sm:rounded-2xl overflow-hidden border-2 border-white shadow-md group-hover:scale-105 transition-transform duration-500 shrink-0">
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
