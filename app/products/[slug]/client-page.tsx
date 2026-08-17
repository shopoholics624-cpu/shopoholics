"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Product } from "@/types/product";
import { useCart } from "@/hooks/use-cart";
import { useCompare } from "@/hooks/use-compare";
import { useWishlist } from "@/hooks/use-wishlist";
import { useDemo } from "@/hooks/use-demo";
import { formatPrice } from "@/lib/utils";
import { normalizeAttributeName } from "@/lib/woocommerce";
import { isColourAttribute } from "@/lib/attribute-utils";
import { RatingStars } from "@/components/common/rating-stars";
import { FreeGiftBundleCard } from "@/components/product/free-gift-bundle-card";
import { ProductInformation } from "@/components/product-info/product-information";
import { ProductReviews } from "@/components/product/product-reviews";
import { RecommendedProducts } from "@/components/product/recommended-products";
import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { DemoLink as Link } from "@/components/demo/demo-link";
import {
  ShoppingBag,
  ArrowLeftRight,
  Check,
  ArrowLeft,
  ChevronRight,
  ChevronLeft,
  ZoomIn,
  Heart,
  Plus,
  Minus,
  X,
} from "lucide-react";

interface ProductDetailClientProps {
  initialProduct: Product | null;
  slug: string;
}

function getColorHex(colorName: string): string {
  const name = colorName.toLowerCase();
  if (name.includes("black") || name.includes("dark") || name.includes("midnight") || name.includes("space gray") || name.includes("space black")) return "#1A1A1A";
  if (name.includes("silver") || name.includes("starlight") || name.includes("white")) return "#F3F4F6";
  if (name.includes("titanium") || name.includes("gray") || name.includes("grey") || name.includes("slate")) return "#6B7280";
  if (name.includes("crimson") || name.includes("red") || name.includes("burgundy")) return "#8B0000";
  if (name.includes("gold") || name.includes("amber")) return "#D4AF37";
  if (name.includes("blue") || name.includes("navy") || name.includes("pacific") || name.includes("sierra")) return "#1E3A8A";
  if (name.includes("green") || name.includes("alpine") || name.includes("emerald")) return "#065F46";
  if (name.includes("orange") || name.includes("coral")) return "#EA580C";
  if (name.includes("purple") || name.includes("violet") || name.includes("lavender")) return "#581C87";
  return "#8B0000";
}

export default function ProductDetailClient({
  initialProduct,
  slug,
}: ProductDetailClientProps) {
  const [product, setProduct] = useState<Product | null>(initialProduct);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [added, setAdded] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState<number>(1);

  // Dynamic unified rating & review count for the current product
  const [reviewSummary, setReviewSummary] = useState<{ rating: number; reviewCount: number }>({
    rating: initialProduct?.rating || 0,
    reviewCount: initialProduct?.reviewCount || 0,
  });

  const handleReviewsUpdated = useCallback(({ rating, reviewCount }: { rating: number; reviewCount: number }) => {
    setReviewSummary((prev) => {
      if (prev.rating === rating && prev.reviewCount === reviewCount) {
        return prev;
      }
      return { rating, reviewCount };
    });
  }, []);

  const { addToCart, addToCartAsync } = useCart();
  const { addToCompare, isInCompare, removeFromCompare } = useCompare();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { isDemoMode, handleDemoAction } = useDemo();

  const inWishlist = product ? isInWishlist(product.id) : false;

  // Fetch updated WooCommerce product client-side matching exact slug (only if initialProduct missing)
  useEffect(() => {
    if (initialProduct) return;
    let isMounted = true;
    async function fetchFreshWooProduct() {
      try {
        const res = await fetch(`/api/products?slug=${encodeURIComponent(slug)}`, {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
          },
        });
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.success) {
            if (data.product) {
              setProduct(data.product);
            } else if (Array.isArray(data.products) && data.products.length > 0) {
              const matched = data.products.find(
                (p: Product) =>
                  p.slug.toLowerCase() === slug.toLowerCase() ||
                  p.id.toString() === slug
              );
              if (matched) setProduct(matched);
            }
          }
        }
      } catch (err) {
        console.warn("[ProductDetailClient] WooCommerce client sync fallback:", err);
      }
    }
    fetchFreshWooProduct();
    return () => {
      isMounted = false;
    };
  }, [slug]);

  // Initial attribute selections setup from first in-stock variant
  useEffect(() => {
    if (product?.variants && product.variants.length > 0) {
      const initialVariant = product.variants.find((v) => v.inStock) || product.variants[0];
      if (initialVariant?.attributes) {
        setSelectedAttributes(initialVariant.attributes);
      }
    }
  }, [product?.variants]);

  // Attribute groups dynamically detected from WooCommerce
  const attributeGroups = useMemo(() => {
    if (!product) return [];
    if (product.attributeGroups && product.attributeGroups.length > 0) {
      return product.attributeGroups;
    }
    if (product.variants && product.variants.length > 0) {
      const groupMap: Record<string, Set<string>> = {};
      product.variants.forEach((v) => {
        if (v.attributes) {
          Object.entries(v.attributes).forEach(([attrName, optionVal]) => {
            if (optionVal) {
              if (!groupMap[attrName]) groupMap[attrName] = new Set();
              groupMap[attrName].add(optionVal);
            }
          });
        }
      });
      return Object.entries(groupMap).map(([name, set]) => ({
        name,
        options: Array.from(set),
      }));
    }
    return [];
  }, [product]);

  // Match selected attributes to active variant
  const activeVariant = useMemo(() => {
    if (!product) {
      return {
        id: "default",
        name: "Standard Edition",
        colorName: "Standard",
        colorHex: "#8B0000",
        price: 0,
        image: "",
        inStock: false,
      };
    }
    if (!product.variants || product.variants.length === 0) {
      return {
        id: `default-${product.id}`,
        name: "Standard Edition",
        colorName: "Standard",
        colorHex: "#8B0000",
        price: product.price,
        originalPrice: product.originalPrice,
        image: product.featuredImage,
        inStock: true,
      };
    }

    if (Object.keys(selectedAttributes).length > 0) {
      const exactMatch = product.variants.find((v) => {
        if (!v.attributes) return false;
        return Object.entries(selectedAttributes).every(([attrKey, selectedVal]) => {
          const vVal = v.attributes?.[attrKey] || v.attributes?.[attrKey.toLowerCase()];
          return !vVal || vVal.toLowerCase() === selectedVal.toLowerCase();
        });
      });
      if (exactMatch) return exactMatch;
    }

    return product.variants[selectedVariantIndex] || product.variants[0];
  }, [product, selectedAttributes, selectedVariantIndex]);

  const inCompare = product ? isInCompare(product.id) : false;

  // Auto-scroll gallery images every 4 seconds
  useEffect(() => {
    if (!product || isLightboxOpen || !product.images || product.images.length <= 1) return;
    const interval = setInterval(() => {
      setSelectedImageIndex((prev) => (prev + 1) % (product.images?.length || 1));
    }, 4000);
    return () => clearInterval(interval);
  }, [product?.images, isLightboxOpen]);

  // Lock body scroll during lightbox modal
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

  const handleAddToCart = async () => {
    if (!product) return;
    const res = await addToCartAsync(product, activeVariant, quantity, selectedAttributes, false);
    if (res.success) {
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    }
  };

  const handleToggleCompare = (e: React.MouseEvent) => {
    if (isDemoMode) {
      handleDemoAction(e);
      return;
    }
    if (!product) return;
    if (inCompare) {
      removeFromCompare(product.id);
    } else {
      addToCompare(product);
    }
  };

  const handlePrevImage = () => {
    if (!product || !product.images || product.images.length === 0) return;
    setSelectedImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
  };

  const handleNextImage = () => {
    if (!product || !product.images || product.images.length === 0) return;
    setSelectedImageIndex((prev) => (prev + 1) % product.images.length);
  };

  const handleAttributeSelect = (groupName: string, optionValue: string) => {
    if (!product || !product.variants || product.variants.length === 0) return;

    const normGroup = normalizeAttributeName(groupName);
    const isColourSelect = isColourAttribute(groupName);

    const nextAttrs: Record<string, string> = {
      ...selectedAttributes,
      [groupName]: optionValue,
      [groupName.toLowerCase()]: optionValue,
      [normGroup]: optionValue,
    };

    const matchingIdx = product.variants.findIndex((v) => {
      if (!v.inStock || v.stockStatus === "outofstock") return false;
      if (!v.attributes) return true;

      const vVal =
        Object.entries(v.attributes).find(([k]) => {
          const cleanK = normalizeAttributeName(k);
          return cleanK.toLowerCase() === normGroup.toLowerCase() || (isColourSelect && isColourAttribute(k));
        })?.[1] || (isColourSelect ? v.colorName : undefined);

      if (vVal && vVal.toLowerCase() !== "standard" && vVal.toLowerCase() !== optionValue.toLowerCase()) {
        return false;
      }

      if (!isColourSelect) {
        const selectedColourVal = Object.entries(selectedAttributes).find(([k]) => isColourAttribute(k))?.[1];
        if (selectedColourVal) {
          const vColourVal = Object.entries(v.attributes).find(([k]) => isColourAttribute(k))?.[1] || v.colorName;
          if (vColourVal && vColourVal.toLowerCase() !== "standard" && vColourVal.toLowerCase() !== selectedColourVal.toLowerCase()) {
            return false;
          }
        }
      }

      return true;
    });

    if (matchingIdx !== -1) {
      const bestVariant = product.variants[matchingIdx];
      if (bestVariant.attributes) {
        Object.entries(bestVariant.attributes).forEach(([k, val]) => {
          nextAttrs[k] = val;
          nextAttrs[k.toLowerCase()] = val;
          nextAttrs[normalizeAttributeName(k)] = val;
        });
      }
      setSelectedVariantIndex(matchingIdx);
    }

    setSelectedAttributes(nextAttrs);
  };

  // Helper to check if an attribute option is available in stock in WooCommerce
  const isOptionAvailable = (groupName: string, optionValue: string) => {
    if (!product || !product.variants || product.variants.length === 0) return true;

    const normGroup = normalizeAttributeName(groupName);
    const isColour = isColourAttribute(groupName);

    return product.variants.some((v) => {
      if (!v.inStock || v.stockStatus === "outofstock") return false;
      if (!v.attributes) return true;

      const vOption =
        Object.entries(v.attributes).find(([k]) => {
          const cleanK = normalizeAttributeName(k);
          return cleanK.toLowerCase() === normGroup.toLowerCase() || (isColour && isColourAttribute(k));
        })?.[1] || (isColour ? v.colorName : undefined);

      if (vOption && vOption.toLowerCase() !== "standard" && vOption.toLowerCase() !== optionValue.toLowerCase()) {
        return false;
      }

      if (!isColour) {
        const selectedColourVal = Object.entries(selectedAttributes).find(([k]) => isColourAttribute(k))?.[1];
        if (selectedColourVal) {
          const vColourVal = Object.entries(v.attributes).find(([k]) => isColourAttribute(k))?.[1] || v.colorName;
          if (vColourVal && vColourVal.toLowerCase() !== "standard" && vColourVal.toLowerCase() !== selectedColourVal.toLowerCase()) {
            return false;
          }
        }
      }

      return true;
    });
  };

  if (!product) {
    return (
      <div className="py-20 bg-white min-h-screen flex items-center justify-center">
        <div className="bg-white rounded-3xl p-12 text-center border border-[#e3beb8] max-w-md mx-auto space-y-4 shadow-lux">
          <h2 className="text-xl font-extrabold text-[#261816]">Product Not Found</h2>
          <p className="text-xs text-[#5a403c]">
            The requested product &quot;{slug}&quot; could not be found in our store catalog.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#8b0000] text-white font-bold text-xs hover:bg-[#bc0000] transition-colors shadow-md"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Catalog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-4 sm:pt-6 pb-6 sm:pb-8 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        {/* Breadcrumb Navigation */}
        <Breadcrumbs
          items={[
            { label: "Shop", href: "/shop" },
            {
              label: product.primaryCategory?.name || product.categoryLabel || "Hardware",
              href: `/shop?category=${encodeURIComponent(
                product.primaryCategory?.slug || product.categorySlugs?.[0] || product.category
              )}`,
            },
            { label: product.title },
          ]}
        />

        {/* Main Product Hero Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start">
          {/* Left Media Gallery Column */}
          <div className="lg:col-span-7 flex flex-col space-y-3">
            {/* Main Image Container */}
            <div
              onClick={() => setIsLightboxOpen(true)}
              className="relative rounded-2xl sm:rounded-3xl bg-[#fff8f6] p-4 sm:p-6 border border-[#e3beb8]/60 shadow-lux overflow-hidden w-full h-[280px] sm:h-[360px] lg:h-[420px] flex items-center justify-center cursor-zoom-in group"
            >
              {/* eslint-disable-next-img-element */}
              <img
                src={product.images[selectedImageIndex] || activeVariant.image || product.featuredImage}
                alt={product.title}
                className="max-h-full max-w-full object-contain rounded-xl sm:rounded-2xl transition-all duration-300 group-hover:scale-105"
              />

              {product.badge && (
                <span className="absolute top-4 left-4 px-3 py-0.5 bg-[#8b0000] text-white text-[10px] sm:text-xs font-bold uppercase tracking-wider rounded-full shadow-md flex items-center gap-1 z-10">
                  {product.badge}
                </span>
              )}

              <span className="absolute bottom-4 right-4 p-2 bg-black/60 backdrop-blur-md text-white rounded-full shadow-md flex items-center gap-1 text-[10px] sm:text-xs font-medium z-10">
                <ZoomIn className="w-3.5 h-3.5" />
              </span>
            </div>

            {/* Thumbnail Track */}
            <div className="flex gap-2.5 sm:gap-3 overflow-x-auto pb-1 scroll-smooth no-scrollbar">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden border-2 shrink-0 bg-[#fff8f6] p-1 flex items-center justify-center ${
                    selectedImageIndex === idx
                      ? "border-[#8b0000]"
                      : "border-[#e3beb8]/60 opacity-80"
                  }`}
                >
                  {/* eslint-disable-next-img-element */}
                  <img src={img} alt={`Thumbnail ${idx}`} className="max-h-full max-w-full object-contain rounded-lg" />
                </button>
              ))}
            </div>
          </div>

          {/* Right Buying Controls */}
          <div className="lg:col-span-5 bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-[#e3beb8]/60 shadow-lux space-y-4">
            {/* Header Block */}
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold text-[#8b0000] uppercase tracking-wider">
                  {product.brand && product.brand.toLowerCase() !== product.categoryLabel.toLowerCase()
                    ? `${product.brand} • ${product.categoryLabel}`
                    : product.categoryLabel}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
                    activeVariant.inStock
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-rose-50 text-rose-700 border-rose-200"
                  }`}
                >
                  {activeVariant.stockStatus === "onbackorder"
                    ? "On Backorder"
                    : activeVariant.inStock
                    ? "In Stock"
                    : "Out of Stock"}
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
                <RatingStars rating={reviewSummary.rating} reviewCount={reviewSummary.reviewCount} size={12} />
                <span className="text-[10px] text-[#8e706b]">| SKU: {activeVariant.sku || activeVariant.id}</span>
              </div>
            </div>

            {/* Dynamic Multi-Attribute WooCommerce Variation Selectors */}
            {attributeGroups.length > 0 ? (
              <div className="space-y-4 pt-1 border-t border-[#e3beb8]/40">
                {attributeGroups.map((group) => {
                  const isColorGroup =
                    group.name.toLowerCase().includes("color") ||
                    group.name.toLowerCase().includes("finish") ||
                    group.name.toLowerCase().includes("shade");
                  const activeVal =
                    selectedAttributes[group.name] ||
                    selectedAttributes[group.name.toLowerCase()] ||
                    group.options[0];

                  return (
                    <div key={group.name} className="space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-bold tracking-wider uppercase text-[#8e706b]">
                        <span>Select {group.name}</span>
                        <span className="text-[#8b0000] font-extrabold">{activeVal}</span>
                      </div>

                      {isColorGroup ? (
                        /* Circular Color Swatch Selector */
                        <div className="flex flex-wrap gap-2.5 items-center">
                          {group.options.map((opt) => {
                            const isSelected = activeVal.toLowerCase() === opt.toLowerCase();
                            const isAvailable = isOptionAvailable(group.name, opt);
                            const hexColor = getColorHex(opt);

                            return (
                              <button
                                key={opt}
                                onClick={() => handleAttributeSelect(group.name, opt)}
                                aria-label={`Select ${group.name} ${opt}`}
                                title={`${opt} (${isAvailable ? "In Stock" : "Unavailable"})`}
                                className={`group relative p-1 rounded-full flex items-center justify-center transition-all ${
                                  isSelected
                                    ? "ring-2 ring-offset-2 ring-[#8b0000] scale-110"
                                    : isAvailable
                                    ? "hover:scale-105 opacity-85 hover:opacity-100"
                                    : "opacity-40 cursor-not-allowed"
                                }`}
                              >
                                <span
                                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-black/20 shadow-sm block relative overflow-hidden"
                                  style={{ backgroundColor: hexColor }}
                                >
                                  {!isAvailable && (
                                    <span className="absolute inset-0 flex items-center justify-center text-rose-500 font-bold text-xs">
                                      /
                                    </span>
                                  )}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        /* Pill Button Selector for Storage / Size / RAM / Capacity */
                        <div className="flex flex-wrap gap-2">
                          {group.options.map((opt) => {
                            const isSelected = activeVal.toLowerCase() === opt.toLowerCase();
                            const isAvailable = isOptionAvailable(group.name, opt);

                            return (
                              <button
                                key={opt}
                                onClick={() => handleAttributeSelect(group.name, opt)}
                                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs ${
                                  isSelected
                                    ? "bg-[#ffe9e6]/50 border-2 border-[#8b0000] text-[#8b0000] shadow-sm"
                                    : isAvailable
                                    ? "bg-white border border-[#e3beb8]/60 text-[#261816] hover:border-[#8b0000]/50 hover:bg-[#fff5f3]"
                                    : "bg-gray-50 border border-dashed border-gray-300 text-gray-400 opacity-60 cursor-not-allowed"
                                }`}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}

                {!activeVariant.inStock && (
                  <p className="text-[10px] font-semibold text-rose-600 pt-1">
                    ⚠️ Selected combination is unavailable.
                  </p>
                )}
              </div>
            ) : product.variants && product.variants.length > 0 ? (
              /* Single Track Legacy Fallback */
              <div className="space-y-1.5 pt-1 border-t border-[#e3beb8]/40">
                <label className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#8e706b] block">
                  Select Finish & Edition ({product.variants.length} Options)
                </label>

                <div className="flex gap-2 overflow-x-auto pb-1.5 no-scrollbar touch-pan-x">
                  {product.variants.map((variant, idx) => {
                    const isSelected = selectedVariantIndex === idx;
                    const isAvailable = variant.inStock;

                    return (
                      <button
                        key={variant.id}
                        onClick={() => setSelectedVariantIndex(idx)}
                        className={`shrink-0 min-w-[115px] sm:min-w-[130px] flex items-center justify-between p-2 rounded-xl border transition-all ${
                          isSelected
                            ? "border-[#8b0000] bg-[#ffe9e6]/40 shadow-xs"
                            : isAvailable
                            ? "border-[#e3beb8]/50 hover:border-[#8b0000]/40 bg-white"
                            : "border-gray-200 bg-gray-50 opacity-60"
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
                    );
                  })}
                </div>
              </div>
            ) : null}

            {/* Action Buttons */}
            {(() => {
              const isVariantInStock = Boolean(
                activeVariant && activeVariant.inStock && activeVariant.stockStatus !== "outofstock"
              );

              return (
                <div className="space-y-3 pt-1">
                  {isVariantInStock && (
                    <div className="flex items-center justify-between p-2.5 rounded-xl border border-[#e3beb8]/60 bg-[#fff8f6]">
                      <span className="text-xs font-extrabold text-[#261816]">Quantity:</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                          disabled={quantity <= 1}
                          className="w-7 h-7 rounded-lg border border-[#e3beb8] bg-white flex items-center justify-center text-[#5a403c] hover:text-[#8b0000] disabled:opacity-40 disabled:cursor-not-allowed font-bold transition-all"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-8 text-center text-xs font-extrabold text-[#261816]">{quantity}</span>
                        <button
                          onClick={() => setQuantity((prev) => prev + 1)}
                          className="w-7 h-7 rounded-lg border border-[#e3beb8] bg-white flex items-center justify-center text-[#5a403c] hover:text-[#8b0000] font-bold transition-all"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}

                  {isVariantInStock ? (
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
                  ) : (
                    <div className="w-full">
                      <button
                        disabled
                        className="w-full py-2.5 px-4 rounded-xl font-extrabold text-xs bg-[#e3beb8]/60 text-[#8e706b] border border-[#e3beb8] cursor-not-allowed shadow-none min-h-[42px] flex items-center justify-center uppercase tracking-wider"
                      >
                        Out of Stock
                      </button>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => toggleWishlist(product)}
                      className={`w-full py-2 px-3 rounded-xl border text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all min-h-[36px] ${
                        inWishlist
                          ? "bg-[#ffe9e6] text-[#8b0000] border-[#8b0000]"
                          : "border-[#e3beb8] text-[#5a403c] hover:border-[#8b0000] hover:text-[#8b0000]"
                      }`}
                    >
                      <Heart className={`w-3 h-3 ${inWishlist ? "fill-[#8b0000] text-[#8b0000]" : ""}`} />
                      {inWishlist ? "Saved to Wishlist" : "Add to Wishlist"}
                    </button>

                    <button
                      onClick={handleToggleCompare}
                      className={`w-full py-2 px-3 rounded-xl border text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all min-h-[36px] ${
                        inCompare
                          ? "bg-[#8b0000] text-white border-[#8b0000]"
                          : "border-[#e3beb8] text-[#5a403c] hover:border-[#8b0000] hover:text-[#8b0000]"
                      }`}
                    >
                      <ArrowLeftRight className="w-3 h-3" />
                      {inCompare ? "Remove Compare" : "Add to Compare"}
                    </button>
                  </div>
                </div>
              );
            })()}

            {/* Free Gift Bundle Card */}
            {product.freeGiftBundle && (
              <div className="pt-2 border-t border-[#e3beb8]/40">
                <FreeGiftBundleCard bundle={product.freeGiftBundle} />
              </div>
            )}
          </div>
        </div>

        {/* Standardized Specification & Info Tables */}
        <ProductInformation product={product} />

        {/* WooCommerce Verified Product Reviews */}
        <ProductReviews
          productId={product.id}
          rating={reviewSummary.rating}
          reviewCount={reviewSummary.reviewCount}
          onReviewsUpdated={handleReviewsUpdated}
        />

        {/* Recommended Products in Same Category */}
        <RecommendedProducts currentProduct={product} />
      </div>

      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-lg flex flex-col items-center justify-between p-4 sm:p-6 animate-in fade-in duration-200">
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
