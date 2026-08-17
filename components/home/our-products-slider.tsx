"use client";

import { useState, useEffect, useRef } from "react";
import { DemoLink as Link } from "@/components/demo/demo-link";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { DEFAULT_CARDS } from "@/constants/homepage";
import { HomepageCard } from "@/types/homepage";

interface WooCategoryItem {
  id: number;
  name: string;
  slug: string;
  count: number;
  parent: number;
}

function resolveCategoryProductCount(
  ctaHref: string | undefined,
  cardTitle: string,
  categories: WooCategoryItem[]
): number | null {
  if (!categories || categories.length === 0) return null;

  // 1. Extract slug from ctaHref (e.g. /shop?category=smartphones, /categories/smartphones)
  let targetSlug = "";
  if (ctaHref) {
    try {
      const url = new URL(ctaHref, "http://localhost");
      targetSlug = url.searchParams.get("category") || "";
      if (!targetSlug && ctaHref.startsWith("/categories/")) {
        targetSlug = ctaHref.replace("/categories/", "").split("?")[0];
      }
    } catch {
      const match = ctaHref.match(/category=([^&]+)/);
      if (match) targetSlug = match[1];
    }
  }

  const computeTotalCount = (cat: WooCategoryItem): number => {
    let total = cat.count || 0;
    const children = categories.filter((c) => c.parent === cat.id);
    for (const child of children) {
      total += child.count || 0;
    }
    return total;
  };

  // 2. Direct / Normalized slug matching
  if (targetSlug) {
    const slugLower = targetSlug.toLowerCase().trim();
    const cleanSlug = slugLower.replace(/[^a-z0-9]/g, "");

    const matched = categories.find((c) => c.slug.toLowerCase() === slugLower);
    if (matched) return computeTotalCount(matched);

    const fuzzy = categories.find(
      (c) =>
        c.slug.toLowerCase().replace(/[^a-z0-9]/g, "") === cleanSlug ||
        c.slug.toLowerCase().replace(/[^a-z0-9]/g, "").includes(cleanSlug) ||
        cleanSlug.includes(c.slug.toLowerCase().replace(/[^a-z0-9]/g, ""))
    );
    if (fuzzy) return computeTotalCount(fuzzy);

    // Audio special match
    if (slugLower.includes("audio") || slugLower.includes("sound") || slugLower.includes("headphone")) {
      const audioCat = categories.find(
        (c) =>
          c.slug.includes("headphone") ||
          c.slug.includes("earphone") ||
          c.slug.includes("speaker") ||
          c.slug.includes("sound")
      );
      if (audioCat) return computeTotalCount(audioCat);
    }
  }

  // 3. Title-based matching fallback
  const titleLower = cardTitle.toLowerCase();
  const matchedByTitle = categories.find((c) => {
    const nameLower = c.name.toLowerCase();
    return (
      titleLower.includes(nameLower) ||
      nameLower.includes(titleLower) ||
      (titleLower.includes("phone") && nameLower.includes("phone")) ||
      (titleLower.includes("laptop") && nameLower.includes("laptop")) ||
      (titleLower.includes("audio") && (nameLower.includes("headphone") || nameLower.includes("speaker") || nameLower.includes("sound"))) ||
      (titleLower.includes("watch") && nameLower.includes("watch")) ||
      (titleLower.includes("charger") && (nameLower.includes("charger") || nameLower.includes("powerbank"))) ||
      (titleLower.includes("power") && (nameLower.includes("charger") || nameLower.includes("powerbank"))) ||
      (titleLower.includes("optic") && (nameLower.includes("camera") || nameLower.includes("optic"))) ||
      (titleLower.includes("home") && (nameLower.includes("home") || nameLower.includes("theatre")))
    );
  });

  if (matchedByTitle) return computeTotalCount(matchedByTitle);

  return 0;
}

export function OurProductsSlider() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const prevBtnRef = useRef<HTMLButtonElement>(null);
  const nextBtnRef = useRef<HTMLButtonElement>(null);

  const [cards, setCards] = useState<HomepageCard[]>([]);
  const [wooCategories, setWooCategories] = useState<WooCategoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadSliderData() {
      try {
        const [cardsRes, catRes] = await Promise.all([
          fetch(`/api/homepage/cards?_t=${Date.now()}`, {
            cache: "no-store",
            headers: {
              "Cache-Control": "no-cache, no-store, must-revalidate",
              Pragma: "no-cache",
            },
          }),
          fetch("/api/categories?include_empty=true", {
            cache: "no-store",
          }),
        ]);

        if (cardsRes.ok) {
          const data = await cardsRes.json();
          if (isMounted && data.success && Array.isArray(data.cards)) {
            const activeCategoryCards = data.cards.filter(
              (c: HomepageCard) => c.section === "category_slider" && c.isEnabled === true
            );
            setCards(activeCategoryCards);
          }
        }

        if (catRes.ok) {
          const cData = await catRes.json();
          if (isMounted && cData.success && Array.isArray(cData.categories)) {
            setWooCategories(cData.categories);
          }
        }
      } catch (err) {
        console.warn("[OurProductsSlider] Data fetch fallback active:", err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadSliderData();
    return () => {
      isMounted = false;
    };
  }, []);

  const getDynamicBadge = (c: HomepageCard): string => {
    if (!wooCategories || wooCategories.length === 0) {
      return c.badge || "";
    }

    const count = resolveCategoryProductCount(c.ctaHref, c.title, wooCategories);
    if (count !== null) {
      return `${count} ${count === 1 ? "Model" : "Models"}`;
    }

    return c.badge || "";
  };

  // Filter cards: only cards that are enabled AND have available WooCommerce products (> 0)
  const displayableCards = cards.filter((c) => {
    if (c.isEnabled === false) return false;
    if (wooCategories.length > 0) {
      const count = resolveCategoryProductCount(c.ctaHref, c.title, wooCategories);
      if (count === 0) return false;
    }
    return true;
  });

  const productCategories = displayableCards.map((c) => ({
    id: c.id,
    title: c.title,
    subtitle: c.subtitle || "",
    image: c.image,
    href: c.ctaHref || (c.categorySlug ? `/shop?category=${c.categorySlug}` : "/shop"),
    badge: getDynamicBadge(c),
  }));

  const totalItems = productCategories.length;

  // Continuous position refs (zero React re-render overhead during continuous animation)
  const currentPosRef = useRef(0);
  const targetPosRef = useRef(0);
  const isDraggingRef = useRef(false);
  const isHoveredRef = useRef(false);
  const startXRef = useRef(0);
  const startPosRef = useRef(0);
  const lastXRef = useRef(0);
  const lastTimeRef = useRef(0);
  const velocityRef = useRef(0);
  const wheelTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const autoplayTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Animation frame loop for continuous stacked 2.5D coverflow
  useEffect(() => {
    let animationFrameId: number;

    const renderLoop = () => {
      // Smooth interpolation toward targetPos
      const delta = targetPosRef.current - currentPosRef.current;
      currentPosRef.current += delta * 0.12;

      const isMobile = typeof window !== "undefined" && window.innerWidth < 640;
      const isTablet = typeof window !== "undefined" && window.innerWidth < 1024;
      const centerStep = isMobile ? 180 : isTablet ? 280 : 360;
      const stackStep = isMobile ? 110 : isTablet ? 160 : 210;

      // Update each card directly in DOM
      for (let i = 0; i < totalItems; i++) {
        const el = cardRefs.current[i];
        if (!el) continue;

        // Direct linear distance from current center position
        const diff = i - currentPosRef.current;
        const absDiff = Math.abs(diff);
        const sign = Math.sign(diff);

        // Continuous stacked X offset
        let x = 0;
        if (absDiff > 0) {
          if (absDiff <= 1) {
            x = sign * centerStep * absDiff;
          } else {
            x = sign * (centerStep + (absDiff - 1) * stackStep);
          }
        }

        // Continuous scale across wide spread
        const scale = Math.max(0.60, 1.0 - absDiff * 0.12);
        const zIndex = Math.round(50 - absDiff * 10);

        // Depth-of-field blur on back cards, crisp on center card (0px)
        const blurPx = absDiff < 0.15 ? 0 : Math.min(absDiff * 1.8, 5.0);

        if (absDiff > 3.8) {
          el.style.visibility = "hidden";
          el.style.opacity = "0";
          el.style.pointerEvents = "none";
        } else {
          el.style.visibility = "visible";
          el.style.opacity = "1";
          el.style.zIndex = `${zIndex}`;
          el.style.transform = `translate3d(${x}px, 0, 0) scale(${scale})`;
          el.style.filter = blurPx > 0.05 ? `blur(${blurPx.toFixed(2)}px)` : "none";
          el.style.pointerEvents = "auto";
        }

        // Active center card styling accent
        const cardInner = el.querySelector(".carousel-card-inner") as HTMLElement | null;
        if (cardInner) {
          if (absDiff < 0.35) {
            cardInner.classList.add("ring-1", "ring-black/10", "shadow-2xl", "border-[#3D3C38]");
            cardInner.classList.remove("border-[#D4D3CD]/80", "shadow-lg");
          } else {
            cardInner.classList.remove("ring-1", "ring-black/10", "shadow-2xl", "border-[#3D3C38]");
            cardInner.classList.add("border-[#D4D3CD]/80", "shadow-lg");
          }
        }
      }

      // Update button opacity / disabled state based on bounds
      if (prevBtnRef.current) {
        if (currentPosRef.current <= 0.1) {
          prevBtnRef.current.style.opacity = "0.35";
          prevBtnRef.current.style.pointerEvents = "none";
        } else {
          prevBtnRef.current.style.opacity = "1";
          prevBtnRef.current.style.pointerEvents = "auto";
        }
      }

      if (nextBtnRef.current) {
        if (currentPosRef.current >= totalItems - 1.1) {
          nextBtnRef.current.style.opacity = "0.35";
          nextBtnRef.current.style.pointerEvents = "none";
        } else {
          nextBtnRef.current.style.opacity = "1";
          nextBtnRef.current.style.pointerEvents = "auto";
        }
      }

      animationFrameId = requestAnimationFrame(renderLoop);
    };

    animationFrameId = requestAnimationFrame(renderLoop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [totalItems]);

  // Autoplay handler with smooth settling (stops or reverses at bounds)
  useEffect(() => {
    autoplayTimerRef.current = setInterval(() => {
      if (!isHoveredRef.current && !isDraggingRef.current) {
        if (targetPosRef.current >= totalItems - 1) {
          targetPosRef.current = 0;
        } else {
          targetPosRef.current = Math.min(totalItems - 1, Math.round(targetPosRef.current) + 1);
        }
      }
    }, 4800);

    return () => {
      if (autoplayTimerRef.current) clearInterval(autoplayTimerRef.current);
    };
  }, [totalItems]);

  // Pointer drag & touch swipe handlers with elastic boundary clamping
  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    startXRef.current = e.clientX;
    lastXRef.current = e.clientX;
    lastTimeRef.current = performance.now();
    startPosRef.current = targetPosRef.current;
    velocityRef.current = 0;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const now = performance.now();
    const dt = Math.max(1, now - lastTimeRef.current);
    const dx = e.clientX - lastXRef.current;

    velocityRef.current = dx / dt; // px per ms
    lastXRef.current = e.clientX;
    lastTimeRef.current = now;

    const totalDeltaX = e.clientX - startXRef.current;
    const isMobile = typeof window !== "undefined" && window.innerWidth < 640;
    const dragSensitivity = isMobile ? 180 : 250;

    const proposed = startPosRef.current - totalDeltaX / dragSensitivity;
    targetPosRef.current = Math.max(-0.35, Math.min(totalItems - 0.65, proposed));
  };

  const handlePointerUp = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;

    // Apply natural momentum and clamp strictly to [0, totalItems - 1]
    const inertiaCards = -velocityRef.current * 0.35;
    const estimatedTarget = targetPosRef.current + inertiaCards;

    targetPosRef.current = Math.max(0, Math.min(totalItems - 1, Math.round(estimatedTarget)));
  };

  // Trackpad horizontal scroll handler
  const handleWheel = (e: React.WheelEvent) => {
    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : (e.shiftKey ? e.deltaY : 0);
    if (Math.abs(delta) > 1.5) {
      const proposed = targetPosRef.current + delta * 0.003;
      targetPosRef.current = Math.max(0, Math.min(totalItems - 1, proposed));

      if (wheelTimeoutRef.current) clearTimeout(wheelTimeoutRef.current);
      wheelTimeoutRef.current = setTimeout(() => {
        targetPosRef.current = Math.max(0, Math.min(totalItems - 1, Math.round(targetPosRef.current)));
      }, 180);
    }
  };

  // Prev / Next button navigation
  const prevSlide = () => {
    targetPosRef.current = Math.max(0, Math.round(targetPosRef.current) - 1);
  };

  const nextSlide = () => {
    targetPosRef.current = Math.min(totalItems - 1, Math.round(targetPosRef.current) + 1);
  };

  if (isLoading) {
    return (
      <section className="py-6 sm:py-10 lg:py-14 bg-white overflow-hidden select-none">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
          <div className="space-y-2">
            <div className="h-9 sm:h-12 w-48 sm:w-64 bg-gray-200/80 rounded-xl animate-pulse" />
            <div className="h-4 w-72 sm:w-96 bg-gray-200/60 rounded-lg animate-pulse" />
          </div>

          <div className="relative w-full h-[450px] sm:h-[510px] lg:h-[550px] flex items-center justify-center">
            <div className="flex items-center justify-center gap-4 sm:gap-6 overflow-hidden max-w-[1380px] w-full px-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`w-[260px] sm:w-[310px] lg:w-[350px] h-[390px] sm:h-[460px] lg:h-[490px] bg-white rounded-3xl p-4 border border-[#D4D3CD]/80 shadow-lg flex flex-col justify-between animate-pulse ${
                    i === 2 ? "scale-100 z-10 opacity-100" : "scale-90 opacity-60 hidden sm:flex"
                  }`}
                >
                  <div className="space-y-2 text-center pt-2">
                    <div className="h-4 w-28 bg-gray-200 rounded mx-auto" />
                    <div className="h-3 w-20 bg-gray-200 rounded mx-auto" />
                  </div>
                  <div className="flex-1 bg-[#f4f2ee] rounded-2xl my-3" />
                  <div className="h-9 w-32 bg-gray-200 rounded-full mx-auto" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (totalItems === 0) return null;

  return (
    <section className="py-6 sm:py-10 lg:py-14 bg-white overflow-hidden select-none">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-2">
          <div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#261816] tracking-tight">
              Our Products
            </h2>
            <p className="text-sm sm:text-base text-[#5a403c] mt-1.5 font-medium">
              Explore our handcrafted luxury hardware categories and precision engineering.
            </p>
          </div>
        </div>

        {/* Immersive Stacked Depth Carousel Stage */}
        <div
          ref={containerRef}
          onMouseEnter={() => {
            isHoveredRef.current = true;
          }}
          onMouseLeave={() => {
            isHoveredRef.current = false;
            if (isDraggingRef.current) handlePointerUp();
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onWheel={handleWheel}
          className="relative w-full h-[450px] sm:h-[510px] lg:h-[550px] flex items-center justify-center cursor-grab active:cursor-grabbing touch-pan-y"
        >
          {/* Previous Arrow Button */}
          <button
            ref={prevBtnRef}
            onClick={(e) => {
              e.stopPropagation();
              prevSlide();
            }}
            aria-label="Previous Product Category"
            className="absolute left-2 sm:left-6 lg:left-8 z-50 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/90 hover:bg-white text-[#261816] shadow-xl border border-[#D4D3CD]/80 flex items-center justify-center backdrop-blur-md transition-all hover:scale-110 active:scale-95 cursor-pointer"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Next Arrow Button */}
          <button
            ref={nextBtnRef}
            onClick={(e) => {
              e.stopPropagation();
              nextSlide();
            }}
            aria-label="Next Product Category"
            className="absolute right-2 sm:right-6 lg:right-8 z-50 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/90 hover:bg-white text-[#261816] shadow-xl border border-[#D4D3CD]/80 flex items-center justify-center backdrop-blur-md transition-all hover:scale-110 active:scale-95 cursor-pointer"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Render 3D Stack of Cards */}
          <div className="relative w-full max-w-[1380px] h-full flex items-center justify-center perspective-[1200px] pointer-events-none">
            {productCategories.map((item, index) => (
              <div
                key={item.id}
                ref={(el) => {
                  cardRefs.current[index] = el;
                }}
                onClick={(e) => {
                  const diff = index - currentPosRef.current;
                  if (Math.abs(diff) >= 0.4 && Math.abs(diff) <= 3.2) {
                    e.preventDefault();
                    e.stopPropagation();
                    targetPosRef.current = Math.max(0, Math.min(totalItems - 1, index));
                  }
                }}
                className="absolute w-[260px] sm:w-[310px] lg:w-[350px] h-[390px] sm:h-[460px] lg:h-[490px] will-change-transform"
              >
                <div className="carousel-card-inner w-full h-full bg-white rounded-3xl p-3.5 sm:p-4 border border-[#D4D3CD]/80 shadow-lg transition-shadow duration-300 flex flex-col justify-between overflow-hidden">
                  {/* Header Title & Badge */}
                  <div className="text-center pt-1 pb-2">
                    <h3 className="font-black text-xs sm:text-sm uppercase tracking-wider text-[#1C1C1A] line-clamp-1">
                      {item.title}
                    </h3>
                    <p className="text-[10px] sm:text-[11px] text-[#8e706b] font-medium mt-0.5 line-clamp-1">
                      {item.subtitle} • {item.badge}
                    </p>
                  </div>

                  {/* Image Area */}
                  <div className="relative w-full flex-1 bg-[#f4f2ee] rounded-2xl overflow-hidden my-1">
                    {/* eslint-disable-next-img-element */}
                    <img
                      src={item.image}
                      alt={item.title}
                      draggable={false}
                      className="w-full h-full object-cover rounded-2xl select-none pointer-events-none"
                    />
                  </div>

                  {/* Bottom Action Pill */}
                  <div className="pt-3 pb-1 flex items-center justify-center">
                    <Link
                      href={item.href}
                      onClick={(e) => {
                        const diff = index - currentPosRef.current;
                        if (Math.abs(diff) >= 0.4) {
                          e.preventDefault();
                          targetPosRef.current = Math.max(0, Math.min(totalItems - 1, index));
                        }
                      }}
                      className="px-6 py-2 sm:py-2.5 rounded-full font-extrabold text-xs tracking-wider uppercase transition-all flex items-center gap-1.5 shadow-md bg-[#1C1C1A] text-white hover:bg-[#8b0000] hover:scale-105 active:scale-95 cursor-pointer"
                    >
                      Shop Now <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
