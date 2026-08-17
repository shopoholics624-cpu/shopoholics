"use client";

import { useState, useEffect } from "react";
import { DemoLink as Link } from "@/components/demo/demo-link";
import { useDemo } from "@/hooks/use-demo";
import { useWishlist } from "@/hooks/use-wishlist";
import { Heart, ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import { PRODUCTS } from "@/constants/products";
import { DEFAULT_CARDS } from "@/constants/homepage";
import { HomepageCard } from "@/types/homepage";
import { formatPrice } from "@/lib/utils";

export function BentoShowcase() {
  const { handleDemoAction } = useDemo();
  const { wishlistProducts, wishlistCount, isInWishlist, toggleWishlist } = useWishlist();
  const [wishlistIndex, setWishlistIndex] = useState(0);
  const [products, setProducts] = useState<any[]>([]);
  const [bentoCards, setBentoCards] = useState<HomepageCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadBentoData() {
      try {
        const [cardsRes, prodRes] = await Promise.all([
          fetch(`/api/homepage/cards?_t=${Date.now()}`, {
            cache: "no-store",
            headers: {
              "Cache-Control": "no-cache, no-store, must-revalidate",
              Pragma: "no-cache",
            },
          }),
          fetch("/api/products?per_page=100", {
            cache: "no-store",
          }),
        ]);

        if (cardsRes.ok) {
          const data = await cardsRes.json();
          if (isMounted && data.success && Array.isArray(data.cards)) {
            const bCards = data.cards.filter((c: HomepageCard) => c.section === "bento");
            setBentoCards(bCards);
          }
        }

        if (prodRes.ok) {
          const pData = await prodRes.json();
          if (isMounted && pData.success && Array.isArray(pData.products)) {
            setProducts(pData.products);
          }
        }
      } catch (err) {
        console.warn("[BentoShowcase] Data fetch error:", err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadBentoData();

    return () => {
      isMounted = false;
    };
  }, []);

  const activeBentoCards = bentoCards;
  const card1 = activeBentoCards.find((c) => c.id === "card-bento-1");
  const card2 = activeBentoCards.find((c) => c.id === "card-bento-2");
  const card3 = activeBentoCards.find((c) => c.id === "card-bento-3");
  const cardPicks = activeBentoCards.find((c) => c.id === "card-bento-picks" || c.slotName === "Our Picks");
  const cardBestSeller = activeBentoCards.find((c) => c.id === "card-bento-bestseller" || c.slotName === "Best Seller");
  const card4 = activeBentoCards.find((c) => c.id === "card-bento-4");

  // Resolve live WooCommerce products only after loaded (no hardcoded fallback flash)
  const ourPicksProduct =
    cardPicks?.productSlug && products.length > 0
      ? products.find((p) => p.slug === cardPicks.productSlug || p.id === cardPicks.productId)
      : null;

  const bestSellerProduct =
    cardBestSeller?.productSlug && products.length > 0
      ? products.find((p) => p.slug === cardBestSeller.productSlug || p.id === cardBestSeller.productId)
      : null;

  // Derive display items for the Wishlist card
  const activeWishlistItems =
    wishlistProducts && wishlistProducts.length > 0
      ? wishlistProducts.map((p) => ({
          title: p.title,
          image: p.featuredImage || p.images?.[0] || "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?q=80&w=600&auto=format&fit=crop",
          slug: p.slug,
        }))
      : [];

  const handleNextWishlist = () => {
    if (activeWishlistItems.length === 0) return;
    setWishlistIndex((prev) => (prev + 1) % activeWishlistItems.length);
  };

  const handlePrevWishlist = () => {
    if (activeWishlistItems.length === 0) return;
    setWishlistIndex((prev) => (prev - 1 + activeWishlistItems.length) % activeWishlistItems.length);
  };

  // Get 2 items for the 2-column grid starting from wishlistIndex
  const visibleWishlistItems =
    activeWishlistItems.length <= 2
      ? activeWishlistItems
      : [
          activeWishlistItems[wishlistIndex % activeWishlistItems.length],
          activeWishlistItems[(wishlistIndex + 1) % activeWishlistItems.length],
        ];

  if (isLoading) {
    return (
      <section className="py-4 sm:py-6 lg:py-8 bg-white">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-2">
            <div className="space-y-2">
              <div className="h-8 sm:h-10 w-64 sm:w-80 bg-gray-200/80 rounded-xl animate-pulse" />
              <div className="h-4 w-72 sm:w-96 bg-gray-200/60 rounded-lg animate-pulse" />
            </div>
            <div className="h-4 w-36 bg-gray-200/60 rounded animate-pulse" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
            {/* Left Column Skeleton */}
            <div className="lg:col-span-6 space-y-4 flex flex-col justify-between">
              <div className="rounded-2xl sm:rounded-3xl p-6 bg-[#F1F0EC] border border-[#D4D3CD] min-h-[150px] sm:min-h-[180px] animate-pulse flex items-center justify-between">
                <div className="space-y-3 max-w-[60%]">
                  <div className="h-6 w-36 bg-gray-300 rounded" />
                  <div className="h-3 w-48 bg-gray-200 rounded" />
                  <div className="h-8 w-28 bg-gray-300 rounded-full" />
                </div>
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl sm:rounded-2xl bg-gray-200" />
              </div>

              <div className="rounded-2xl sm:rounded-3xl p-6 bg-[#F1F0EC] border border-[#D4D3CD] min-h-[140px] sm:min-h-[160px] animate-pulse flex items-center justify-between">
                <div className="space-y-2 max-w-[60%]">
                  <div className="h-5 w-32 bg-gray-300 rounded" />
                  <div className="h-3 w-40 bg-gray-200 rounded" />
                </div>
                <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-xl sm:rounded-2xl bg-gray-200" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-2xl sm:rounded-3xl p-4 bg-[#F1F0EC] border border-[#D4D3CD] min-h-[190px] animate-pulse flex flex-col justify-between">
                  <div className="w-full h-28 sm:h-36 bg-gray-200 rounded-xl" />
                  <div className="h-8 w-full bg-gray-300 rounded-xl mt-2" />
                </div>
                <div className="rounded-2xl sm:rounded-3xl p-4 bg-[#F1F0EC] border border-[#D4D3CD] min-h-[190px] animate-pulse flex flex-col justify-between">
                  <div className="h-4 w-20 bg-gray-300 rounded" />
                  <div className="w-full h-20 bg-gray-200 rounded-xl my-2" />
                  <div className="h-8 w-full bg-gray-300 rounded-lg" />
                </div>
              </div>
            </div>

            {/* Right Column Skeleton */}
            <div className="lg:col-span-6 space-y-4 flex flex-col justify-between">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-[#F1F0EC] rounded-2xl sm:rounded-3xl p-4 border border-[#D4D3CD] min-h-[260px] sm:min-h-[300px] animate-pulse flex flex-col justify-between">
                  <div className="flex justify-between mb-2">
                    <div className="w-6 h-3 bg-gray-300 rounded" />
                    <div className="w-6 h-6 bg-gray-200 rounded-full" />
                  </div>
                  <div className="w-full h-28 sm:h-36 bg-gray-200 rounded-xl" />
                  <div className="flex justify-between items-end pt-2 border-t border-[#D4D3CD]/60">
                    <div className="space-y-1.5">
                      <div className="h-2.5 w-12 bg-gray-300 rounded" />
                      <div className="h-3.5 w-24 bg-gray-300 rounded" />
                    </div>
                    <div className="h-6 w-16 bg-gray-300 rounded-full" />
                  </div>
                </div>

                <div className="bg-[#F1F0EC] rounded-2xl sm:rounded-3xl p-4 border border-[#D4D3CD] min-h-[260px] sm:min-h-[300px] animate-pulse flex flex-col justify-between">
                  <div className="flex justify-between mb-2">
                    <div className="w-6 h-3 bg-gray-300 rounded" />
                    <div className="w-6 h-6 bg-gray-200 rounded-full" />
                  </div>
                  <div className="w-full h-28 sm:h-36 bg-gray-200 rounded-xl" />
                  <div className="flex justify-between items-end pt-2 border-t border-[#D4D3CD]/60">
                    <div className="space-y-1.5">
                      <div className="h-2.5 w-12 bg-gray-300 rounded" />
                      <div className="h-3.5 w-24 bg-gray-300 rounded" />
                    </div>
                    <div className="h-6 w-16 bg-gray-300 rounded-full" />
                  </div>
                </div>
              </div>

              <div className="rounded-2xl sm:rounded-3xl p-6 bg-[#F1F0EC] border border-[#D4D3CD] min-h-[140px] sm:min-h-[160px] animate-pulse flex items-center justify-between">
                <div className="space-y-2 max-w-[60%]">
                  <div className="h-6 w-36 bg-gray-300 rounded" />
                  <div className="h-3 w-44 bg-gray-200 rounded" />
                </div>
                <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-xl sm:rounded-2xl bg-gray-200" />
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-4 sm:py-6 lg:py-8 bg-white">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-2">
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
            {card1 && card1.isEnabled === true && (
              <div className="relative z-0 hover:z-20 rounded-2xl sm:rounded-3xl p-4 sm:p-6 bg-[#F1F0EC] hover:bg-[#E6E5DF] border border-[#D4D3CD] hover:border-[#4A4944] hover:-translate-y-1 transition-all duration-300 overflow-hidden flex items-center justify-between min-h-[150px] sm:min-h-[180px] shadow-sm group">
                <div className="relative z-10 max-w-[60%] sm:max-w-xs space-y-2">
                  <h3 className="text-lg sm:text-2xl font-extrabold text-[#8b0000] tracking-tight leading-tight">
                    {card1.title}
                  </h3>
                  {card1.subtitle && (
                    <p className="text-[11px] text-[#5A5954] font-semibold">
                      {card1.subtitle}
                    </p>
                  )}
                  <Link
                    href={card1.ctaHref || "/shop?category=audio"}
                    className="inline-block px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full bg-[#8b0000] hover:bg-[#bc0000] text-white font-bold text-xs shadow-md transition-all border border-white/60 min-h-[36px]"
                  >
                    {card1.ctaText || "Get Discount"}
                  </Link>
                </div>

                <div className="relative z-10 w-24 h-24 sm:w-32 sm:h-32 aspect-square rounded-xl sm:rounded-2xl overflow-hidden border-2 border-white shadow-md group-hover:scale-105 transition-transform duration-500 shrink-0">
                  {/* eslint-disable-next-img-element */}
                  <img
                    src={card1.image}
                    alt={card1.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}

            {/* Card 2: Middle Special Banner */}
            {card2 && card2.isEnabled === true && (
              <div className="relative z-0 hover:z-20 rounded-2xl sm:rounded-3xl p-4 sm:p-6 bg-[#F1F0EC] hover:bg-[#E6E5DF] border border-[#D4D3CD] hover:border-[#4A4944] hover:-translate-y-1 transition-all duration-300 overflow-hidden flex items-center justify-between min-h-[140px] sm:min-h-[160px] shadow-sm group">
                <div className="space-y-0.5 relative z-10 max-w-[60%] sm:max-w-xs">
                  <h3 className="text-lg sm:text-2xl font-extrabold text-[#1C1C1A] tracking-tight">
                    {card2.title}
                  </h3>
                  {card2.subtitle && (
                    <p className="text-[11px] text-[#5A5954] font-semibold">
                      {card2.subtitle}
                    </p>
                  )}
                </div>

                <Link
                  href={card2.ctaHref || "/products/flagship-smartphone-pro"}
                  className="absolute top-4 left-4 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white text-[#1C1C1A] flex items-center justify-center shadow-md group-hover:bg-[#8b0000] group-hover:text-white transition-colors z-20"
                  aria-label="Explore Product"
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>

                <div className="relative z-10 w-20 h-20 sm:w-28 sm:h-28 aspect-square rounded-xl sm:rounded-2xl overflow-hidden border-2 border-white shadow-md group-hover:scale-105 transition-transform duration-500 shrink-0">
                  {/* eslint-disable-next-img-element */}
                  <img
                    src={card2.image}
                    alt={card2.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}

            {/* Bottom Row Grid inside Left Column */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Card 3: Bottom-Left Card */}
              {card3 && card3.isEnabled === true && (
                <div className="relative z-0 hover:z-20 rounded-2xl sm:rounded-3xl p-4 bg-[#F1F0EC] hover:bg-[#E6E5DF] border border-[#D4D3CD] hover:border-[#4A4944] hover:-translate-y-1 transition-all duration-300 shadow-sm overflow-hidden min-h-[190px] flex flex-col justify-between group">
                  <Link
                    href={card3.ctaHref || "/shop"}
                    className="absolute top-3 right-3 p-1.5 rounded-full bg-white hover:bg-[#F1F0EC] text-[#1C1C1A] shadow-sm z-10 transition-colors"
                    aria-label="View Product"
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>

                  {/* eslint-disable-next-img-element */}
                  <img
                    src={card3.image}
                    alt={card3.title}
                    className="w-full h-28 sm:h-36 object-cover rounded-xl group-hover:scale-105 transition-transform duration-500"
                  />

                  <Link
                    href={card3.ctaHref || "/shop"}
                    className="w-full py-2 rounded-xl bg-white text-[#8b0000] font-bold text-xs text-center border border-[#D4D3CD] shadow-sm hover:bg-[#8b0000] hover:text-white transition-colors min-h-[36px] flex items-center justify-center mt-2"
                  >
                    {card3.ctaText || "Avail Offers"}
                  </Link>
                </div>
              )}

              {/* Card: Bottom-Center Wishlist Mini Carousel */}
              <div className="rounded-2xl sm:rounded-3xl p-4 bg-[#F1F0EC] border border-[#D4D3CD] shadow-sm flex flex-col justify-between min-h-[190px]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5 text-[#8b0000] fill-[#8b0000]" />
                    <span className="font-extrabold text-xs text-[#1C1C1A]">
                      Wishlist
                    </span>
                    {wishlistCount > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full bg-[#8b0000] text-white text-[9px] font-black">
                        {wishlistCount}
                      </span>
                    )}
                  </div>
                  {wishlistCount > 2 && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={handlePrevWishlist}
                        className="p-1 rounded-full hover:bg-white text-[#1C1C1A] transition-colors cursor-pointer"
                        aria-label="Previous wishlist item"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={handleNextWishlist}
                        className="p-1 rounded-full hover:bg-white text-[#1C1C1A] transition-colors cursor-pointer"
                        aria-label="Next wishlist item"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {wishlistCount === 0 ? (
                  <div className="my-2 py-4 flex flex-col items-center justify-center text-center space-y-1">
                    <p className="text-xs font-bold text-[#5A5954]">Your wishlist is empty</p>
                    <p className="text-[10px] text-[#71706b]">Explore and add products you love</p>
                  </div>
                ) : wishlistCount === 1 ? (
                  <div className="my-2 flex items-center justify-center">
                    <Link
                      href={`/products/${wishlistProducts[0].slug}`}
                      className="rounded-lg overflow-hidden bg-white p-1 border border-[#D4D3CD]/60 shadow-xs hover:border-[#8b0000] transition-all group/item w-full max-w-[140px] block"
                      title={wishlistProducts[0].title}
                    >
                      {/* eslint-disable-next-img-element */}
                      <img
                        src={wishlistProducts[0].featuredImage || wishlistProducts[0].images?.[0] || "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?q=80&w=600&auto=format&fit=crop"}
                        alt={wishlistProducts[0].title}
                        className="w-full h-14 sm:h-16 object-cover rounded-md group-hover/item:scale-105 transition-transform"
                      />
                      <span className="text-[10px] font-bold text-[#1C1C1A] line-clamp-1 mt-1 px-0.5 block text-center">
                        {wishlistProducts[0].title}
                      </span>
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2 my-2">
                    {visibleWishlistItems.map((item, idx) => (
                      <Link
                        key={idx}
                        href={`/products/${item.slug}`}
                        className="rounded-lg overflow-hidden bg-white p-1 border border-[#D4D3CD]/60 shadow-xs hover:border-[#8b0000] transition-all group/item block"
                        title={item.title}
                      >
                        {/* eslint-disable-next-img-element */}
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-14 sm:h-16 object-cover rounded-md group-hover/item:scale-105 transition-transform"
                        />
                        <span className="text-[10px] font-bold text-[#1C1C1A] line-clamp-1 mt-1 px-0.5 block">
                          {item.title}
                        </span>
                      </Link>
                    ))}
                  </div>
                )}

                <Link
                  href={wishlistCount === 0 ? "/shop" : "/wishlist"}
                  className="w-full py-2 rounded-lg bg-white text-[#1C1C1A] font-bold text-xs text-center border border-[#D4D3CD] shadow-sm hover:bg-[#8b0000] hover:text-white transition-colors min-h-[36px] flex items-center justify-center cursor-pointer"
                >
                  {wishlistCount === 0 ? "Start Shopping" : `View Wishlist (${wishlistCount})`}
                </Link>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="lg:col-span-6 space-y-4 flex flex-col justify-between">
            {/* Top 2 Vertical Product Cards Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Product Card 1: Our Picks */}
              {isLoading ? (
                <div className="bg-[#F1F0EC] rounded-2xl sm:rounded-3xl p-4 border border-[#D4D3CD] shadow-sm flex flex-col justify-between min-h-[260px] sm:min-h-[300px] animate-pulse">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full bg-gray-300" />
                        <div className="w-3 h-3 rounded-full bg-gray-200" />
                      </div>
                      <div className="w-6 h-6 rounded-full bg-gray-200" />
                    </div>
                    <div className="w-full h-28 sm:h-36 bg-gray-200/80 rounded-xl" />
                  </div>
                  <div className="mt-3 flex items-end justify-between pt-2 border-t border-[#D4D3CD]/60">
                    <div className="space-y-1.5">
                      <div className="w-14 h-2.5 bg-gray-300 rounded" />
                      <div className="w-28 h-3.5 bg-gray-300 rounded" />
                    </div>
                    <div className="w-16 h-6 bg-gray-300 rounded-full" />
                  </div>
                </div>
              ) : cardPicks && cardPicks.isEnabled !== false && ourPicksProduct ? (
                <div className="bg-[#F1F0EC] hover:bg-[#E6E5DF] rounded-2xl sm:rounded-3xl p-4 border border-[#D4D3CD] shadow-sm hover:shadow-xl hover:border-[#4A4944] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden min-h-[260px] sm:min-h-[300px] relative group">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1">
                        <span className="w-3 h-3 rounded-full bg-[#8b0000] border border-black/20" />
                        <span className="w-3 h-3 rounded-full bg-[#D4D3CD] border border-black/20" />
                      </div>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (ourPicksProduct) {
                            toggleWishlist(ourPicksProduct);
                          }
                        }}
                        className="p-1 rounded-full bg-white text-[#5A5954] hover:text-[#8b0000] transition-colors cursor-pointer"
                        aria-label="Wishlist"
                      >
                        <Heart
                          className={`w-3.5 h-3.5 ${
                            ourPicksProduct && isInWishlist(ourPicksProduct.id)
                              ? "text-[#8b0000] fill-[#8b0000]"
                              : ""
                          }`}
                        />
                      </button>
                    </div>

                    <Link href={`/products/${ourPicksProduct.slug}`}>
                      {/* eslint-disable-next-img-element */}
                      <img
                        src={ourPicksProduct.featuredImage || ourPicksProduct.images?.[0] || ourPicksProduct.image}
                        alt={ourPicksProduct.title || ourPicksProduct.name}
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
                        {ourPicksProduct.title || ourPicksProduct.name}
                      </h4>
                    </div>

                    <Link
                      href={`/products/${ourPicksProduct.slug}`}
                      className="px-3 py-1 rounded-full bg-[#8b0000] hover:bg-[#bc0000] text-white font-bold text-xs shadow-sm transition-colors shrink-0"
                    >
                      {formatPrice(ourPicksProduct.price)}
                    </Link>
                  </div>
                </div>
              ) : null}

              {/* Product Card 2: Best Seller */}
              {isLoading ? (
                <div className="bg-[#F1F0EC] rounded-2xl sm:rounded-3xl p-4 border border-[#D4D3CD] shadow-sm flex flex-col justify-between min-h-[260px] sm:min-h-[300px] animate-pulse">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full bg-gray-300" />
                        <div className="w-3 h-3 rounded-full bg-gray-200" />
                      </div>
                      <div className="w-6 h-6 rounded-full bg-gray-200" />
                    </div>
                    <div className="w-full h-28 sm:h-36 bg-gray-200/80 rounded-xl" />
                  </div>
                  <div className="mt-3 flex items-end justify-between pt-2 border-t border-[#D4D3CD]/60">
                    <div className="space-y-1.5">
                      <div className="w-14 h-2.5 bg-gray-300 rounded" />
                      <div className="w-28 h-3.5 bg-gray-300 rounded" />
                    </div>
                    <div className="w-16 h-6 bg-gray-300 rounded-full" />
                  </div>
                </div>
              ) : cardBestSeller && cardBestSeller.isEnabled === true && bestSellerProduct ? (
                <div className="bg-[#F1F0EC] hover:bg-[#E6E5DF] rounded-2xl sm:rounded-3xl p-4 border border-[#D4D3CD] shadow-sm hover:shadow-xl hover:border-[#4A4944] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden min-h-[260px] sm:min-h-[300px] relative group">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1">
                        <span className="w-3 h-3 rounded-full bg-[#1C1C1A] border border-black/20" />
                        <span className="w-3 h-3 rounded-full bg-[#5A5954] border border-black/20" />
                      </div>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (bestSellerProduct) {
                            toggleWishlist(bestSellerProduct);
                          }
                        }}
                        className="p-1 rounded-full bg-white text-[#5A5954] hover:text-[#8b0000] transition-colors cursor-pointer"
                        aria-label="Wishlist"
                      >
                        <Heart
                          className={`w-3.5 h-3.5 ${
                            bestSellerProduct && isInWishlist(bestSellerProduct.id)
                              ? "text-[#8b0000] fill-[#8b0000]"
                              : ""
                          }`}
                        />
                      </button>
                    </div>

                    <Link href={`/products/${bestSellerProduct.slug}`}>
                      {/* eslint-disable-next-img-element */}
                      <img
                        src={bestSellerProduct.featuredImage || bestSellerProduct.images?.[0] || bestSellerProduct.image}
                        alt={bestSellerProduct.title || bestSellerProduct.name}
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
                        {bestSellerProduct.title || bestSellerProduct.name}
                      </h4>
                    </div>

                    <Link
                      href={`/products/${bestSellerProduct.slug}`}
                      className="px-3 py-1 rounded-full bg-[#8b0000] hover:bg-[#bc0000] text-white font-bold text-xs shadow-sm transition-colors shrink-0"
                    >
                      {formatPrice(bestSellerProduct.price)}
                    </Link>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Card 4: Bottom Wide Banner Card */}
            {card4 && card4.isEnabled === true && (
              <div className="relative rounded-2xl sm:rounded-3xl p-4 sm:p-6 bg-[#F1F0EC] hover:bg-[#E6E5DF] border border-[#D4D3CD] hover:border-[#4A4944] hover:-translate-y-1 transition-all duration-300 overflow-hidden flex items-center justify-between min-h-[140px] sm:min-h-[160px] shadow-sm group">
                <div className="space-y-0.5 relative z-10 max-w-[60%] sm:max-w-xs">
                  <h3 className="text-lg sm:text-2xl font-extrabold text-[#1C1C1A] tracking-tight">
                    {card4.title}
                  </h3>
                  {card4.subtitle && (
                    <p className="text-[11px] text-[#5A5954] font-semibold">
                      {card4.subtitle}
                    </p>
                  )}
                </div>

                <Link
                  href={card4.ctaHref || "/shop?category=optics"}
                  className="absolute top-4 left-4 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white text-[#1C1C1A] flex items-center justify-center shadow-md group-hover:bg-[#8b0000] group-hover:text-white transition-colors z-20"
                  aria-label="Explore Optics"
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>

                <div className="relative z-10 w-20 h-20 sm:w-28 sm:h-28 aspect-square rounded-xl sm:rounded-2xl overflow-hidden border-2 border-white shadow-md group-hover:scale-105 transition-transform duration-500 shrink-0">
                  {/* eslint-disable-next-img-element */}
                  <img
                    src={card4.image}
                    alt={card4.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
