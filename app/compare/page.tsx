"use client";

import { useCompare } from "@/hooks/use-compare";
import { useCart } from "@/hooks/use-cart";
import { useDemo } from "@/hooks/use-demo";
import { PRODUCTS } from "@/constants/products";
import { formatPrice } from "@/lib/utils";
import { RatingStars } from "@/components/common/rating-stars";
import { DemoLink as Link } from "@/components/demo/demo-link";
import {
  ArrowLeftRight,
  X,
  Plus,
  ShoppingBag,
  Check,
  Sparkles,
  ArrowLeft,
} from "lucide-react";
import { useState } from "react";

export default function ComparePage() {
  const { compareList, removeFromCompare, addToCompare, clearCompare } = useCompare();
  const { addToCart } = useCart();
  const { isDemoMode, handleDemoAction } = useDemo();
  const [addingId, setAddingId] = useState<string | null>(null);

  const handleAddToCart = (product: (typeof PRODUCTS)[0]) => {
    if (isDemoMode) {
      handleDemoAction();
      return;
    }
    addToCart(product, product.variants[0]);
    setAddingId(product.id);
    setTimeout(() => setAddingId(null), 1800);
  };

  return (
    <div className="py-8 sm:py-12 bg-[#fff8f6] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        {/* Breadcrumb & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 text-xs font-bold text-[#8b0000] hover:underline"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Catalog
            </Link>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-[#261816] flex items-center gap-2.5 tracking-tight">
              <ArrowLeftRight className="w-7 h-7 sm:w-8 sm:h-8 text-[#8b0000] shrink-0" /> Hardware Comparison Matrix
            </h1>
            <p className="text-xs sm:text-sm text-[#5a403c]">
              Side-by-side technical specification analysis for high-end decision making.
            </p>
          </div>

          {compareList.length > 0 && (
            <button
              onClick={clearCompare}
              className="px-4 py-2.5 bg-[#ffe9e6] text-[#8b0000] rounded-xl text-xs font-bold hover:bg-[#8b0000] hover:text-white transition-colors self-start sm:self-auto min-h-[44px]"
            >
              Clear Comparison Slots
            </button>
          )}
        </div>

        {/* Comparison Table Grid */}
        {compareList.length > 0 ? (
          <div className="bg-white rounded-3xl p-4 sm:p-6 border border-[#e3beb8]/60 shadow-lux overflow-x-auto">
            <div className="min-w-[650px] space-y-8">
              {/* Product Headers Row */}
              <div className="grid grid-cols-5 gap-6 border-b border-[#ffe9e6] pb-6">
                <div className="col-span-1 flex flex-col justify-end">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#8e706b]">
                    Comparing ({compareList.length}/4 Devices)
                  </span>
                </div>

                {compareList.map((product) => (
                  <div key={product.id} className="col-span-1 relative space-y-3 group">
                    <button
                      onClick={() => removeFromCompare(product.id)}
                      className="absolute -top-2 -right-2 p-1.5 bg-[#ffe9e6] text-[#8b0000] hover:bg-[#8b0000] hover:text-white rounded-full transition-colors z-10"
                      title="Remove"
                    >
                      <X className="w-4 h-4" />
                    </button>

                    {/* eslint-disable-next-img-element */}
                    <img
                      src={product.featuredImage}
                      alt={product.title}
                      className="w-full h-36 sm:h-40 object-cover rounded-2xl border border-[#e3beb8]/50"
                    />

                    <div>
                      <RatingStars rating={product.rating} size={12} />
                      <h3 className="font-bold text-sm text-[#261816] line-clamp-1 mt-1">
                        {product.title}
                      </h3>
                      <span className="text-base font-extrabold text-[#8b0000] block mt-0.5">
                        {formatPrice(product.price)}
                      </span>
                    </div>

                    <button
                      onClick={() => handleAddToCart(product)}
                      className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm min-h-[44px] ${
                        addingId === product.id
                          ? "bg-emerald-700 text-white"
                          : "bg-[#8b0000] hover:bg-[#bc0000] text-white"
                      }`}
                    >
                      {addingId === product.id ? "Added!" : "Add to Bag"}
                    </button>
                  </div>
                ))}

                {/* Add Slot Button if less than 4 */}
                {compareList.length < 4 && (
                  <button
                    onClick={(e) => isDemoMode && handleDemoAction(e)}
                    className="col-span-1 border-2 border-dashed border-[#e3beb8] rounded-2xl flex flex-col items-center justify-center p-6 text-center text-[#8e706b] hover:border-[#8b0000] transition-colors min-h-[140px]"
                  >
                    <Plus className="w-8 h-8 text-[#8b0000] mb-2" />
                    <span className="text-xs font-semibold text-[#261816]">Add Device</span>
                  </button>
                )}
              </div>

              {/* Spec Rows */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#8b0000] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#e51c10]" /> Display & Display Refresh Rate
                </h4>

                <div className="grid grid-cols-5 gap-6 text-xs py-3 border-b border-[#ffe9e6]">
                  <span className="font-semibold text-[#5a403c]">Display Tech</span>
                  {compareList.map((p) => (
                    <span key={p.id} className="font-bold text-[#261816]">
                      {p.specs.find((s) => s.name.includes("Display"))?.value || "Pro OLED Dynamic"}
                    </span>
                  ))}
                </div>

                <h4 className="text-xs font-bold uppercase tracking-wider text-[#8b0000] flex items-center gap-1.5 pt-2">
                  <Sparkles className="w-3.5 h-3.5 text-[#e51c10]" /> Processor & Compute Architecture
                </h4>

                <div className="grid grid-cols-5 gap-6 text-xs py-3 border-b border-[#ffe9e6]">
                  <span className="font-semibold text-[#5a403c]">Processor Chip</span>
                  {compareList.map((p) => (
                    <span key={p.id} className="font-bold text-[#261816]">
                      {p.specs.find((s) => s.name.includes("Processor"))?.value || "Neural Bionic Pro"}
                    </span>
                  ))}
                </div>

                <h4 className="text-xs font-bold uppercase tracking-wider text-[#8b0000] flex items-center gap-1.5 pt-2">
                  <Sparkles className="w-3.5 h-3.5 text-[#e51c10]" /> Enclosure Materials & Battery Endurance
                </h4>

                <div className="grid grid-cols-5 gap-6 text-xs py-3">
                  <span className="font-semibold text-[#5a403c]">Battery & Weight</span>
                  {compareList.map((p) => (
                    <span key={p.id} className="font-bold text-[#261816]">
                      {p.specs.find((s) => s.name.includes("Battery"))?.value || "Grade 5 Titanium Armor"}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-12 text-center border border-[#e3beb8] shadow-lux space-y-4">
            <ArrowLeftRight className="w-12 h-12 text-[#8b0000] mx-auto opacity-40" />
            <h3 className="text-2xl font-bold text-[#261816]">Comparison Matrix Empty</h3>
            <p className="text-sm text-[#5a403c] max-w-md mx-auto">
              Select devices from our catalog to perform side-by-side specs analysis.
            </p>
            <Link
              href="/shop"
              className="inline-block px-6 py-3.5 bg-[#8b0000] text-white font-bold text-xs rounded-xl hover:bg-[#bc0000] transition-colors min-h-[44px]"
            >
              Browse Catalog & Add Devices
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
