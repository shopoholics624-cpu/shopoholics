"use client";

import { use, useState } from "react";
import { PRODUCTS } from "@/constants/products";
import { useCart } from "@/hooks/use-cart";
import { useCompare } from "@/hooks/use-compare";
import { useDemo } from "@/hooks/use-demo";
import { formatPrice } from "@/lib/utils";
import { RatingStars } from "@/components/common/rating-stars";
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
} from "lucide-react";

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = use(params);
  const { slug } = resolvedParams;

  const product =
    PRODUCTS.find((p) => p.slug === slug) || PRODUCTS[0];

  const { addToCart } = useCart();
  const { addToCompare, isInCompare, removeFromCompare } = useCompare();
  const { isDemoMode, handleDemoAction } = useDemo();

  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<"specs" | "features" | "warranty">("specs");
  const [added, setAdded] = useState(false);

  const activeVariant = product.variants[selectedVariantIndex] || product.variants[0];
  const inCompare = isInCompare(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    if (isDemoMode) {
      handleDemoAction(e);
      return;
    }
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

  return (
    <div className="py-8 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs text-[#5a403c]">
          <Link href="/shop" className="hover:text-[#8b0000] flex items-center gap-1 font-semibold">
            <ArrowLeft className="w-3.5 h-3.5" /> Catalog
          </Link>
          <ChevronRight className="w-3 h-3 text-[#8e706b]" />
          <Link href={`/categories/${product.category}`} className="hover:text-[#8b0000] capitalize">
            {product.category}
          </Link>
          <ChevronRight className="w-3 h-3 text-[#8e706b]" />
          <span className="font-bold text-[#8b0000] truncate max-w-[200px]">
            {product.title}
          </span>
        </div>

        {/* Main Product Hero Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Media Gallery Column */}
          <div className="lg:col-span-7 space-y-4">
            <div className="relative rounded-3xl bg-white p-4 border border-[#e3beb8]/60 shadow-lux overflow-hidden">
              {/* Main Image */}
              {/* eslint-disable-next-img-element */}
              <img
                src={product.images[selectedImageIndex] || product.featuredImage}
                alt={product.title}
                className="w-full h-[450px] sm:h-[540px] object-cover rounded-2xl transition-all duration-300"
              />

              {product.badge && (
                <span className="absolute top-8 left-8 px-4 py-1.5 bg-[#8b0000] text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-lg flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#e51c10]" /> {product.badge}
                </span>
              )}
            </div>

            {/* Thumbnail Row */}
            <div className="flex gap-4 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all shrink-0 ${
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

          {/* Right Product Buying Controls */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-8 border border-[#e3beb8]/60 shadow-lux space-y-6">
            <div>
              <span className="text-xs font-semibold text-[#8b0000] uppercase tracking-wider">
                {product.categoryLabel}
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#261816] mt-1">
                {product.title}
              </h1>
              <p className="text-xs text-[#5a403c] mt-2 leading-relaxed">
                {product.tagline}
              </p>
              <div className="mt-3">
                <RatingStars rating={product.rating} reviewCount={product.reviewCount} size={16} />
              </div>
            </div>

            {/* Price Row */}
            <div className="py-4 border-y border-[#ffe9e6] flex items-baseline justify-between">
              <div>
                <span className="text-xs font-bold text-[#8e706b] block">Total Price</span>
                <div className="flex items-baseline gap-3 mt-0.5">
                  <span className="text-3xl font-extrabold text-[#8b0000]">
                    {formatPrice(activeVariant.price)}
                  </span>
                  {activeVariant.originalPrice && (
                    <span className="text-base text-[#8e706b] line-through font-medium">
                      {formatPrice(activeVariant.originalPrice)}
                    </span>
                  )}
                </div>
              </div>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold">
                In Stock & Ready to Ship
              </span>
            </div>

            {/* Color & Variant Swatches */}
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-[#8e706b] block">
                Select Finish & Edition
              </label>
              <div className="space-y-2">
                {product.variants.map((variant, idx) => (
                  <button
                    key={variant.id}
                    onClick={() => setSelectedVariantIndex(idx)}
                    className={`w-full flex items-center justify-between p-3.5 rounded-2xl border-2 transition-all ${
                      selectedVariantIndex === idx
                        ? "border-[#8b0000] bg-[#ffe9e6]/40 shadow-sm"
                        : "border-[#e3beb8]/50 hover:border-[#8b0000]/40 bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="w-5 h-5 rounded-full border border-black/20 shadow-sm"
                        style={{ backgroundColor: variant.colorHex }}
                      />
                      <span className="text-xs font-bold text-[#261816]">
                        {variant.name}
                      </span>
                    </div>
                    <span className="text-xs font-extrabold text-[#8b0000]">
                      {formatPrice(variant.price)}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              <button
                onClick={handleAddToCart}
                className={`w-full py-4 rounded-xl font-bold text-base transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3 ${
                  added
                    ? "bg-emerald-700 text-white"
                    : "bg-[#8b0000] hover:bg-[#bc0000] text-white"
                }`}
              >
                {added ? (
                  <>
                    <Check className="w-5 h-5" /> Added to Shopping Bag!
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-5 h-5" /> Add to Bag ({formatPrice(activeVariant.price)})
                  </>
                )}
              </button>

              <button
                onClick={handleToggleCompare}
                className={`w-full py-3.5 rounded-xl font-bold text-xs transition-all border-2 flex items-center justify-center gap-2 ${
                  inCompare
                    ? "bg-[#8b0000] text-white border-[#8b0000]"
                    : "border-[#8b0000] text-[#8b0000] hover:bg-[#fff0ee]"
                }`}
              >
                <ArrowLeftRight className="w-4 h-4" />
                {inCompare ? "Remove from Compare Matrix" : "Add to Compare Matrix"}
              </button>
            </div>

            {/* Value Highlights */}
            <div className="space-y-2 pt-4 border-t border-[#ffe9e6] text-xs text-[#5a403c]">
              <div className="flex items-center gap-2.5">
                <Truck className="w-4 h-4 text-[#8b0000]" />
                <span>Free Insured Express Courier Delivery</span>
              </div>
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-[#8b0000]" />
                <span>2-Year Crimson Luxe Official Hardware Protection</span>
              </div>
              <div className="flex items-center gap-2.5">
                <RotateCcw className="w-4 h-4 text-[#8b0000]" />
                <span>30-Day Hassle-Free Unboxing Guarantee</span>
              </div>
            </div>
          </div>
        </div>

        {/* GSAP Scroll Trigger Interactive Section */}
        <InteractiveCanvas />

        {/* Product Technical Specifications Tabs */}
        <div className="bg-white rounded-3xl p-8 border border-[#e3beb8]/60 shadow-lux space-y-6">
          <div className="flex border-b border-[#ffe9e6] gap-8">
            <button
              onClick={() => setActiveTab("specs")}
              className={`pb-4 text-sm font-bold transition-colors relative ${
                activeTab === "specs"
                  ? "text-[#8b0000]"
                  : "text-[#5a403c] hover:text-[#8b0000]"
              }`}
            >
              Technical Specifications
              {activeTab === "specs" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#8b0000] rounded-full" />
              )}
            </button>

            <button
              onClick={() => setActiveTab("features")}
              className={`pb-4 text-sm font-bold transition-colors relative ${
                activeTab === "features"
                  ? "text-[#8b0000]"
                  : "text-[#5a403c] hover:text-[#8b0000]"
              }`}
            >
              Key Features
              {activeTab === "features" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#8b0000] rounded-full" />
              )}
            </button>
          </div>

          {activeTab === "specs" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {product.specs.map((spec, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-4 rounded-2xl bg-[#fff8f6] border border-[#e3beb8]/40"
                >
                  <span className="text-xs font-semibold text-[#8e706b]">
                    {spec.name}
                  </span>
                  <span className="text-xs font-bold text-[#261816]">
                    {spec.value}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <ul className="space-y-3">
              {product.features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm text-[#261816]">
                  <Check className="w-5 h-5 text-[#8b0000] shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
